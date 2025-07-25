import { createMemo, For, Show, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Student, User } from '../types';
import { getStatusColor } from '../styles/themes';

export function HomePage() {
  const app = useApp();
  const currentUser = app.currentUser();
  
  if (!currentUser) {
    return <div>Loading...</div>;
  }
  
  return <HomePageContent user={currentUser} />;
}

function HomePageContent(props: { user: User }) {
  const app = useApp();
  const { user } = props;
  
  // Student-specific signals
  const [searchTerm, setSearchTerm] = createSignal('');
  const [statusFilter, setStatusFilter] = createSignal<string>('all');
  
  // Get favorites
  const favorites = createMemo(() => user?.favorites || []);
  
  const setFavorites = (newFavorites: string[] | ((prev: string[]) => string[])) => {
    if (!user) return;
    
    const finalFavorites = typeof newFavorites === 'function' 
      ? newFavorites(favorites()) 
      : newFavorites;
    
    const updatedUser = { ...user, favorites: finalFavorites };
    app.updateUser(updatedUser);
  };

  return (
    <div style={{ 
      padding: '20px 16px 80px 16px', 
      'background-color': 'var(--color-background)',
      'min-height': '100vh'
    }}>
      {/* Header */}
      <div style={{ 'text-align': 'center', 'margin-bottom': '24px' }}>
        <h1 style={{ 
          color: 'var(--color-primary)', 
          'font-size': '2rem', 
          margin: '0 0 8px 0', 
          'font-weight': '700' 
        }}>
          معونة المتعلم
        </h1>
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          'font-size': '0.9rem', 
          margin: '0' 
        }}>
          نظام إدارة حلقات عَلٌمْنِي
        </p>
      </div>

      {/* Role-based Content */}
      <Show when={user.role === 'student'}>
        <StudentDashboard 
          user={user as Student}
          app={app}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          favorites={favorites}
          setFavorites={setFavorites}
        />
      </Show>

      <Show when={user.role === 'lehrer'}>
        <TeacherDashboard 
          user={user}
          app={app}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          favorites={favorites}
          setFavorites={setFavorites}
        />
      </Show>

      <Show when={user.role === 'leitung' || user.role === 'superuser'}>
        <LeadershipDashboard 
          app={app} 
          role={user.role}
        />
      </Show>
    </div>
  );
}

// Student Dashboard Component
function StudentDashboard(props: any) {
  const { user, app, searchTerm, setSearchTerm, statusFilter, setStatusFilter, favorites, setFavorites } = props;
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_available':
        return { color: 'var(--color-error)', icon: '🔴', text: 'غير متاح' };
      case 'revising':
        return { color: 'var(--color-warning)', icon: '🟡', text: 'مراجعة' };
      case 'khatamat':
        return { color: 'var(--color-success)', icon: '🟢', text: 'ختمات' };
      default:
        return { color: 'var(--color-text)', icon: '⚪', text: 'غير محدد' };
    }
  };
  
  const statusInfo = createMemo(() => getStatusInfo(user?.status || 'not_available'));
  
  const changeStatus = (newStatus: string) => {
    const updatedUser = {
      ...user,
      status: newStatus,
      status_changed_at: new Date().toISOString()
    };
    app.updateUser(updatedUser);
  };
  
  const toggleFavorite = (userId: string) => {
    const current = favorites();
    if (current.includes(userId)) {
      setFavorites(current.filter(id => id !== userId));
    } else {
      setFavorites([...current, userId]);
    }
  };

  return (
    <div>
      {/* Student Info Card */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '12px', 
        padding: '20px', 
        'margin-bottom': '20px',
        border: '1px solid var(--color-border)',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        gap: '20px'
      }}>
        <div style={{ flex: '1' }}>
          <h3 style={{ 
            color: 'var(--color-text)', 
            'margin-bottom': '6px',
            'font-size': '1.2rem',
            'font-weight': '600'
          }}>
            {user?.name}
          </h3>
          
          <div style={{
            display: 'inline-flex',
            'align-items': 'center',
            background: statusInfo().color,
            color: 'white',
            padding: '4px 12px',
            'border-radius': '16px',
            'font-size': '0.9rem',
            'font-weight': '600'
          }}>
            {statusInfo().icon} {statusInfo().text}
          </div>
        </div>
        
        {/* Status Change Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          'flex-wrap': 'wrap'
        }}>
          <button
            onClick={() => changeStatus("not_available")}
            style={{
              background: user?.status === "not_available" ? "var(--color-error)" : "var(--color-background)",
              color: user?.status === "not_available" ? "white" : "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              padding: "6px 12px",
              "border-radius": "16px",
              cursor: "pointer",
              "font-size": "0.8rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              outline: "none"
            }}
          >
            غير متاح
          </button>
          
          <button
            onClick={() => changeStatus("revising")}
            style={{
              background: user?.status === "revising" ? "var(--color-warning)" : "var(--color-background)",
              color: user?.status === "revising" ? "white" : "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              padding: "6px 12px",
              "border-radius": "16px",
              cursor: "pointer",
              "font-size": "0.8rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              outline: "none"
            }}
          >
            مراجعة
          </button>
          
          <button
            onClick={() => changeStatus("khatamat")}
            style={{
              background: user?.status === "khatamat" ? "var(--color-success)" : "var(--color-background)",
              color: user?.status === "khatamat" ? "white" : "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              padding: "6px 12px",
              "border-radius": "16px",
              cursor: "pointer",
              "font-size": "0.8rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              outline: "none"
            }}
          >
            ختمات
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '12px', 
        padding: '16px', 
        'margin-bottom': '20px',
        border: '1px solid var(--color-border)'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', 'margin-bottom': '12px' }}>
          <input
            type="text"
            placeholder="البحث عن طالب..."
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              'border-radius': '8px',
              border: '1px solid var(--color-border)',
              'font-size': '14px',
              background: 'var(--color-background)',
              color: 'var(--color-text)',
              'box-sizing': 'border-box'
            }}
          />
        </div>
        
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', 'flex-wrap': 'wrap' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '6px 12px',
              'border-radius': '16px',
              border: statusFilter() === 'all' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: statusFilter() === 'all' ? 'var(--color-primary)' : 'var(--color-background)',
              color: statusFilter() === 'all' ? 'white' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'all' ? '600' : '500'
            }}
          >
            الجميع
          </button>
          <button
            onClick={() => setStatusFilter('not_available')}
            style={{
              padding: '6px 12px',
              'border-radius': '16px',
              border: statusFilter() === 'not_available' ? '1px solid var(--color-error)' : '1px solid var(--color-border)',
              background: statusFilter() === 'not_available' ? 'var(--color-error)' : 'var(--color-background)',
              color: statusFilter() === 'not_available' ? 'white' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'not_available' ? '600' : '500'
            }}
          >
            غير متاح
          </button>
          <button
            onClick={() => setStatusFilter('revising')}
            style={{
              padding: '6px 12px',
              'border-radius': '16px',
              border: statusFilter() === 'revising' ? '1px solid var(--color-warning)' : '1px solid var(--color-border)',
              background: statusFilter() === 'revising' ? 'var(--color-warning)' : 'var(--color-background)',
              color: statusFilter() === 'revising' ? 'white' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'revising' ? '600' : '500'
            }}
          >
            مراجعة
          </button>
          <button
            onClick={() => setStatusFilter('khatamat')}
            style={{
              padding: '6px 12px',
              'border-radius': '16px',
              border: statusFilter() === 'khatamat' ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
              background: statusFilter() === 'khatamat' ? 'var(--color-success)' : 'var(--color-background)',
              color: statusFilter() === 'khatamat' ? 'white' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'khatamat' ? '600' : '500'
            }}
          >
            ختمات
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--color-surface)',
        'border-radius': '12px',
        padding: '20px',
        border: '1px solid var(--color-border)'
      }}>
        <p style={{ 'text-align': 'center', color: 'var(--color-text)' }}>
          Student Dashboard - Halaqa Lists wird geladen...
        </p>
      </div>
    </div>
  );
}

// Teacher Dashboard Component
function TeacherDashboard(props: any) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      'border-radius': '12px',
      padding: '20px',
      border: '1px solid var(--color-border)'
    }}>
      <h2>Teacher Dashboard</h2>
      <p>Teacher functionality coming soon...</p>
    </div>
  );
}

// Leadership Dashboard Component
function LeadershipDashboard(props: any) {
  const { app } = props;
  
  const users = app.users();
  const totalUsers = users.length;
  const totalTeachers = users.filter(u => u.role === 'lehrer').length;
  const totalHalaqat = app.halaqat().length;
  
  const students = users.filter(u => u.role === 'student') as Student[];
  const statusCounts = {
    not_available: students.filter(s => s.status === 'not_available').length,
    revising: students.filter(s => s.status === 'revising').length,
    khatamat: students.filter(s => s.status === 'khatamat').length
  };

  return (
    <div>
      {/* Statistics */}
      <div style={{ 
        display: 'grid', 
        'grid-template-columns': 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px', 
        'margin-bottom': '20px' 
      }}>
        <div style={{ 
          background: 'var(--color-surface)', 
          padding: '20px', 
          'border-radius': '15px', 
          'text-align': 'center', 
          border: '1px solid var(--color-border)' 
        }}>
          <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>👥</div>
          <div style={{ 
            'font-size': '1.8rem', 
            'font-weight': 'bold', 
            color: 'var(--color-primary)',
            'margin-bottom': '5px'
          }}>
            {totalUsers}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.9rem' }}>
            إجمالي المستخدمين
          </div>
        </div>

        <div style={{ 
          background: 'var(--color-surface)', 
          padding: '20px', 
          'border-radius': '15px', 
          'text-align': 'center', 
          border: '1px solid var(--color-border)' 
        }}>
          <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>👨‍🏫</div>
          <div style={{ 
            'font-size': '1.8rem', 
            'font-weight': 'bold', 
            color: 'var(--color-secondary)',
            'margin-bottom': '5px'
          }}>
            {totalTeachers}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.9rem' }}>
            إجمالي المعلمين
          </div>
        </div>

        <div style={{ 
          background: 'var(--color-surface)', 
          padding: '20px', 
          'border-radius': '15px', 
          'text-align': 'center', 
          border: '1px solid var(--color-border)' 
        }}>
          <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>🔵</div>
          <div style={{ 
            'font-size': '1.8rem', 
            'font-weight': 'bold', 
            color: 'var(--color-primary)',
            'margin-bottom': '5px'
          }}>
            {totalHalaqat}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.9rem' }}>
            إجمالي الحلقات
          </div>
        </div>
      </div>

      {/* Status Statistics */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '15px', 
        padding: '20px', 
        border: '1px solid var(--color-border)' 
      }}>
        <h3 style={{ 
          color: 'var(--color-text)', 
          'margin-bottom': '20px',
          'font-size': '1.3rem'
        }}>
          📊 إحصائيات حالات الطلاب
        </h3>
        <div style={{ 
          display: 'grid', 
          'grid-template-columns': 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '15px' 
        }}>
          <div style={{ 
            'text-align': 'center', 
            padding: '20px', 
            background: 'var(--color-background)', 
            'border-radius': '12px', 
            border: '3px solid var(--color-error)' 
          }}>
            <div style={{ 'font-size': '2.5rem', 'margin-bottom': '10px' }}>🔴</div>
            <div style={{ 
              'font-size': '1.8rem', 
              'font-weight': 'bold', 
              color: 'var(--color-error)',
              'margin-bottom': '5px'
            }}>
              {statusCounts.not_available}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.9rem' }}>
              غير متاح
            </div>
          </div>

          <div style={{ 
            'text-align': 'center', 
            padding: '20px', 
            background: 'var(--color-background)', 
            'border-radius': '12px', 
            border: '3px solid var(--color-warning)' 
          }}>
            <div style={{ 'font-size': '2.5rem', 'margin-bottom': '10px' }}>🟡</div>
            <div style={{ 
              'font-size': '1.8rem', 
              'font-weight': 'bold', 
              color: 'var(--color-warning)',
              'margin-bottom': '5px'
            }}>
              {statusCounts.revising}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.9rem' }}>
              يراجع
            </div>
          </div>

          <div style={{ 
            'text-align': 'center', 
            padding: '20px', 
            background: 'var(--color-background)', 
            'border-radius': '12px', 
            border: '3px solid var(--color-success)' 
          }}>
            <div style={{ 'font-size': '2.5rem', 'margin-bottom': '10px' }}>🟢</div>
            <div style={{ 
              'font-size': '1.8rem', 
              'font-weight': 'bold', 
              color: 'var(--color-success)',
              'margin-bottom': '5px'
            }}>
              {statusCounts.khatamat}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.9rem' }}>
              ختمات
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}