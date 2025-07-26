import { createMemo, For, Show, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Student, User, Teacher, Halaqa } from '../types';

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
        <StudentDashboard user={user as Student} />
      </Show>

      <Show when={user.role === 'lehrer'}>
        <TeacherDashboard user={user as Teacher} />
      </Show>

      <Show when={user.role === 'leitung' || user.role === 'superuser'}>
        <LeadershipDashboard user={user} />
      </Show>
    </div>
  );
}

// Student Dashboard according to requirements
function StudentDashboard(props: { user: Student }) {
  const app = useApp();
  
  // Use reactive current user instead of props to ensure UI updates
  const currentUser = createMemo(() => app.currentUser() as Student);
  const user = currentUser;
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = createSignal('');
  const [statusFilter, setStatusFilter] = createSignal<string>('all');
  
  // Get user's halaqat
  const userHalaqat = createMemo(() => 
    app.halaqat().filter(halaqa => user().halaqat_ids.includes(halaqa.id))
  );
  
  // Get all students
  const allStudents = createMemo(() => 
    app.users().filter(u => u.role === 'student' && u.isActive && u.id !== user().id) as Student[]
  );
  
  // Get students in same halaqat
  const getStudentsInHalaqa = (halaqaId: string) => {
    const halaqa = app.halaqat().find(h => h.id === halaqaId);
    if (!halaqa) return [];
    
    return allStudents().filter(student => 
      halaqa.student_ids.includes(student.id)
    );
  };
  
  // Filter and search students
  const getFilteredStudents = (students: Student[]) => {
    let filtered = students;
    
    // Apply search filter first
    if (searchTerm().trim()) {
      const term = searchTerm().toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(term)
      );
      console.log('🔍 Search filtered students:', filtered.length, 'results for:', term);
    }
    
    // Apply status filter
    if (statusFilter() !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter());
      console.log('🎯 Status filtered students:', filtered.length, 'with status:', statusFilter());
    }
    
    // Sort: Favorites first (within filtered results), then by name
    filtered.sort((a, b) => {
      const aIsFavorite = user().favorites.includes(a.id);
      const bIsFavorite = user().favorites.includes(b.id);
      
      // Favorites come first
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // Within same favorite status, sort by name
      return a.name.localeCompare(b.name, 'ar');
    });
    
    console.log('📋 Final filtered and sorted students:', filtered.length);
    return filtered;
  };
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_available':
        return { color: '#ef4444', icon: '🔴', text: 'غير متاح' };
      case 'revising':
        return { color: '#f59e0b', icon: '🟡', text: 'مراجعة' };
      case 'khatamat':
        return { color: '#10b981', icon: '🟢', text: 'ختمات' };
      default:
        return { color: '#6b7280', icon: '⚪', text: 'غير محدد' };
    }
  };
  
  const statusInfo = createMemo(() => getStatusInfo(user().status));
  
  const changeStatus = (newStatus: string) => {
    console.log('🔄 Changing status from', user().status, 'to', newStatus);
    const updatedUser = {
      ...user(),
      status: newStatus as 'not_available' | 'revising' | 'khatamat',
      status_changed_at: new Date().toISOString()
    };
    app.updateUser(updatedUser);
    console.log('✅ Status change initiated');
    
    // Force a small delay to ensure the update propagates
    setTimeout(() => {
      const currentUserAfterUpdate = app.currentUser();
      console.log('🔍 User after update:', currentUserAfterUpdate?.name, 'Status:', (currentUserAfterUpdate as Student)?.status);
    }, 100);
  };
  
  const toggleFavorite = (studentId: string) => {
    console.log('⭐ Toggling favorite for student:', studentId);
    const newFavorites = user().favorites.includes(studentId)
      ? user().favorites.filter(id => id !== studentId)
      : [...user().favorites, studentId];
    
    const updatedUser = { ...user(), favorites: newFavorites };
    app.updateUser(updatedUser);
    console.log('✅ Favorites updated:', newFavorites);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'منذ دقائق';
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  };

  return (
    <div>
      {/* Student's Own Info Card */}
      <div style={{ 
        background: 'white', 
        'border-radius': '12px', 
        padding: '20px', 
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #2563eb'
      }}>
        <div style={{ 'text-align': 'center', 'margin-bottom': '15px' }}>
          <h3 style={{ 
            color: '#1f2937', 
            'margin-bottom': '10px',
            'font-size': '1.3rem',
            'font-weight': '600'
          }}>
            {user().name}
          </h3>
          
          <div style={{
            display: 'inline-flex',
            'align-items': 'center',
            background: statusInfo().color,
            color: 'white',
            padding: '8px 20px',
            'border-radius': '25px',
            'font-size': '1rem',
            'font-weight': '600'
          }}>
            {statusInfo().icon} {statusInfo().text}
          </div>
        </div>
        
        {/* Separator */}
        <hr style={{ 
          border: 'none', 
          height: '1px', 
          background: '#e5e7eb', 
          margin: '20px 0 15px 0' 
        }} />
        
        {/* Change Status Text */}
        <p style={{ 
          'text-align': 'center', 
          color: '#374151', 
          'font-weight': '600',
          'margin-bottom': '15px'
        }}>
          تغيير الحالة
        </p>
        
        {/* Status Change Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          'justify-content': 'center'
        }}>
          <button
            onClick={() => changeStatus("not_available")}
            style={{
              background: user().status === "not_available" ? "#fef2f2" : "#f9fafb",
              color: user().status === "not_available" ? "#dc2626" : "#6b7280",
              border: user().status === "not_available" ? "1px solid #fecaca" : "1px solid #e5e7eb",
              padding: "8px 12px",
              "border-radius": "8px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              flex: "1"
            }}
          >
            🔴 غير متاح
          </button>
          
          <button
            onClick={() => changeStatus("revising")}
            style={{
              background: user().status === "revising" ? "#fffbeb" : "#f9fafb",
              color: user().status === "revising" ? "#d97706" : "#6b7280",
              border: user().status === "revising" ? "1px solid #fed7aa" : "1px solid #e5e7eb",
              padding: "8px 12px",
              "border-radius": "8px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              flex: "1"
            }}
          >
            🟡 مراجعة
          </button>
          
          <button
            onClick={() => changeStatus("khatamat")}
            style={{
              background: user().status === "khatamat" ? "#f0fdf4" : "#f9fafb",
              color: user().status === "khatamat" ? "#059669" : "#6b7280",
              border: user().status === "khatamat" ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
              padding: "8px 12px",
              "border-radius": "8px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              flex: "1"
            }}
          >
            🟢 ختمات
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div style={{
        background: 'white',
        'border-radius': '12px',
        padding: '15px',
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', 'margin-bottom': '15px' }}>
          <input
            type="text"
            placeholder="🔍 البحث عن طالب بالاسم..."
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              'border-radius': '8px',
              border: '2px solid #e5e7eb',
              'font-size': '16px',
              'box-sizing': 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
          {searchTerm() && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                'font-size': '18px',
                color: '#6b7280'
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', 'flex-wrap': 'wrap' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'all' ? '1px solid #dbeafe' : '1px solid #e5e7eb',
              background: statusFilter() === 'all' ? '#eff6ff' : '#f9fafb',
              color: statusFilter() === 'all' ? '#1d4ed8' : '#6b7280',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            الجميع
          </button>
          <button
            onClick={() => setStatusFilter('not_available')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'not_available' ? '1px solid #fecaca' : '1px solid #e5e7eb',
              background: statusFilter() === 'not_available' ? '#fef2f2' : '#f9fafb',
              color: statusFilter() === 'not_available' ? '#dc2626' : '#6b7280',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🔴 غير متاح
          </button>
          <button
            onClick={() => setStatusFilter('revising')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'revising' ? '1px solid #fed7aa' : '1px solid #e5e7eb',
              background: statusFilter() === 'revising' ? '#fffbeb' : '#f9fafb',
              color: statusFilter() === 'revising' ? '#d97706' : '#6b7280',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🟡 مراجعة
          </button>
          <button
            onClick={() => setStatusFilter('khatamat')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'khatamat' ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
              background: statusFilter() === 'khatamat' ? '#f0fdf4' : '#f9fafb',
              color: statusFilter() === 'khatamat' ? '#059669' : '#6b7280',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🟢 ختمات
          </button>
        </div>
      </div>

      {/* Halaqat Sections */}
      <For each={userHalaqat()}>
        {(halaqa) => (
          <HalaqaSection 
            halaqa={halaqa}
            students={getFilteredStudents(getStudentsInHalaqa(halaqa.id))}
            userFavorites={user().favorites}
            onToggleFavorite={toggleFavorite}
            formatDate={formatDate}
            getStatusInfo={getStatusInfo}
          />
        )}
      </For>
      
      <Show when={userHalaqat().length === 0}>
        <div style={{
          background: 'white',
          'border-radius': '12px',
          padding: '40px 20px',
          'text-align': 'center',
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
          color: '#6b7280'
        }}>
          <div style={{ 'font-size': '3rem', 'margin-bottom': '15px' }}>📚</div>
          <p>لم يتم تخصيص أي حلقة لك بعد</p>
        </div>
      </Show>
    </div>
  );
}

// Halaqa Section Component
function HalaqaSection(props: any) {
  const { halaqa, students, userFavorites, onToggleFavorite, formatDate, getStatusInfo } = props;
  const [isExpanded, setIsExpanded] = createSignal(true);
  
  const getHalaqaTypeText = (type: string) => {
    switch (type) {
      case 'memorizing': return 'حفظ';
      case 'explanation': return 'شرح';
      case 'memorizing_intensive': return 'حفظ مكثف';
      case 'explanation_intensive': return 'شرح مكثف';
      default: return type;
    }
  };
  
  return (
    <div style={{
      background: 'white',
      'border-radius': '12px',
      'margin-bottom': '20px',
      'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Halaqa Header */}
      <div 
        style={{
          background: '#f8fafc',
          padding: '15px 20px',
          'border-bottom': '1px solid #e5e7eb',
          cursor: 'pointer',
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center'
        }}
        onClick={() => setIsExpanded(!isExpanded())}
      >
        <div>
          <h4 style={{
            color: '#1f2937',
            margin: '0 0 5px 0',
            'font-size': '1.1rem',
            'font-weight': '600'
          }}>
            {getHalaqaTypeText(halaqa.type)}
          </h4>
          <p style={{
            color: '#6b7280',
            margin: '0',
            'font-size': '0.85rem'
          }}>
            {students.length} طالب
          </p>
        </div>
        <div style={{
          transform: isExpanded() ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          'font-size': '1.2rem'
        }}>
          ▼
        </div>
      </div>
      
      {/* Students List */}
      <Show when={isExpanded()}>
        <div style={{ padding: '15px' }}>
          <Show when={students.length === 0}>
            <div style={{
              'text-align': 'center',
              padding: '20px',
              color: '#6b7280'
            }}>
              <p>لا يوجد طلاب في هذه الحلقة</p>
            </div>
          </Show>
          
          <For each={students}>
            {(student) => (
              <div style={{
                border: '1px solid #e5e7eb',
                'border-radius': '8px',
                padding: '12px',
                'margin-bottom': '10px',
                background: '#fafafa',
                display: 'flex',
                'justify-content': 'space-between',
                'align-items': 'center'
              }}>
                <div style={{ flex: '1' }}>
                  <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
                    <h5 style={{
                      color: '#1f2937',
                      margin: '0',
                      'font-size': '1rem',
                      'font-weight': '600'
                    }}>
                      {student.name}
                      {userFavorites.includes(student.id) && (
                        <span style={{ color: '#f59e0b', 'margin-left': '5px' }}>⭐</span>
                      )}
                    </h5>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    'align-items': 'center', 
                    gap: '10px',
                    'margin-top': '5px'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      'align-items': 'center',
                      background: getStatusInfo(student.status).color,
                      color: 'white',
                      padding: '3px 8px',
                      'border-radius': '12px',
                      'font-size': '0.75rem',
                      'font-weight': '600'
                    }}>
                      {getStatusInfo(student.status).icon} {getStatusInfo(student.status).text}
                    </div>
                    
                    <span style={{ 
                      color: '#6b7280', 
                      'font-size': '0.75rem' 
                    }}>
                      {formatDate(student.status_changed_at)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => onToggleFavorite(student.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    'font-size': '1.2rem',
                    padding: '5px',
                    color: userFavorites.includes(student.id) ? '#f59e0b' : '#d1d5db'
                  }}
                >
                  ⭐
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

// Teacher Dashboard (same as student but without own info card)
function TeacherDashboard(props: { user: Teacher }) {
  const app = useApp();
  const { user } = props;
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = createSignal('');
  const [statusFilter, setStatusFilter] = createSignal<string>('all');
  
  // Get teacher's halaqat
  const teacherHalaqat = createMemo(() => 
    app.halaqat().filter(halaqa => user.halaqat_ids.includes(halaqa.id))
  );
  
  // Get all active students
  const allStudents = createMemo(() => 
    app.users().filter(u => u.role === 'student' && u.isActive) as Student[]
  );
  
  // Get students in halaqa
  const getStudentsInHalaqa = (halaqaId: string) => {
    const halaqa = app.halaqat().find(h => h.id === halaqaId);
    if (!halaqa) return [];
    
    return allStudents().filter(student => 
      halaqa.student_ids.includes(student.id)
    );
  };
  
  // Filter and search students (same logic as student dashboard)
  const getFilteredStudents = (students: Student[]) => {
    let filtered = students;
    
    // Apply search filter first
    if (searchTerm().trim()) {
      const term = searchTerm().toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter() !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter());
    }
    
    // Sort: Favorites first (within filtered results), then by name
    filtered.sort((a, b) => {
      const aIsFavorite = user.favorites.includes(a.id);
      const bIsFavorite = user.favorites.includes(b.id);
      
      // Favorites come first
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // Within same favorite status, sort by name
      return a.name.localeCompare(b.name, 'ar');
    });
    
    return filtered;
  };
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_available':
        return { color: '#ef4444', icon: '🔴', text: 'غير متاح' };
      case 'revising':
        return { color: '#f59e0b', icon: '🟡', text: 'مراجعة' };
      case 'khatamat':
        return { color: '#10b981', icon: '🟢', text: 'ختمات' };
      default:
        return { color: '#6b7280', icon: '⚪', text: 'غير محدد' };
    }
  };
  
  const toggleFavorite = (studentId: string) => {
    const newFavorites = user.favorites.includes(studentId)
      ? user.favorites.filter(id => id !== studentId)
      : [...user.favorites, studentId];
    
    const updatedUser = { ...user, favorites: newFavorites };
    app.updateUser(updatedUser);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'منذ دقائق';
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  };

  return (
    <div>
      {/* Teacher Info */}
      <div style={{
        background: 'white',
        'border-radius': '12px',
        padding: '20px',
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'text-align': 'center'
      }}>
        <h3 style={{
          color: '#1f2937',
          margin: '0 0 10px 0',
          'font-size': '1.3rem',
          'font-weight': '600'
        }}>
          👨‍🏫 مرحباً {user.name}
        </h3>
        <p style={{ color: '#6b7280', margin: '0' }}>
          {teacherHalaqat().length} حلقة مخصصة لك
        </p>
      </div>

      {/* Search and Filter Section (same as student) */}
      <div style={{
        background: 'white',
        'border-radius': '12px',
        padding: '15px',
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          placeholder="البحث عن طالب..."
          value={searchTerm()}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            'border-radius': '8px',
            border: '1px solid #d1d5db',
            'font-size': '16px',
            'margin-bottom': '15px',
            'box-sizing': 'border-box'
          }}
        />
        
        <div style={{ display: 'flex', gap: '6px', 'flex-wrap': 'wrap' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'all' ? '1px solid #dbeafe' : '1px solid #e5e7eb',
              background: statusFilter() === 'all' ? '#eff6ff' : '#f9fafb',
              color: statusFilter() === 'all' ? '#1d4ed8' : '#6b7280',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            الجميع
          </button>
          <button
            onClick={() => setStatusFilter('not_available')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'not_available' ? '1px solid #fecaca' : '1px solid #e5e7eb',
              background: statusFilter() === 'not_available' ? '#fef2f2' : '#f9fafb',
              color: statusFilter() === 'not_available' ? '#dc2626' : '#6b7280',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🔴 غير متاح
          </button>
          <button
            onClick={() => setStatusFilter('revising')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'revising' ? '1px solid #fed7aa' : '1px solid #e5e7eb',
              background: statusFilter() === 'revising' ? '#fffbeb' : '#f9fafb',
              color: statusFilter() === 'revising' ? '#d97706' : '#6b7280',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🟡 مراجعة
          </button>
          <button
            onClick={() => setStatusFilter('khatamat')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'khatamat' ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
              background: statusFilter() === 'khatamat' ? '#f0fdf4' : '#f9fafb',
              color: statusFilter() === 'khatamat' ? '#059669' : '#6b7280',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🟢 ختمات
          </button>
        </div>
      </div>

      {/* Teacher's Halaqat */}
      <For each={teacherHalaqat()}>
        {(halaqa) => (
          <HalaqaSection 
            halaqa={halaqa}
            students={getFilteredStudents(getStudentsInHalaqa(halaqa.id))}
            userFavorites={user.favorites}
            onToggleFavorite={toggleFavorite}
            formatDate={formatDate}
            getStatusInfo={getStatusInfo}
          />
        )}
      </For>
      
      <Show when={teacherHalaqat().length === 0}>
        <div style={{
          background: 'white',
          'border-radius': '12px',
          padding: '40px 20px',
          'text-align': 'center',
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
          color: '#6b7280'
        }}>
          <div style={{ 'font-size': '3rem', 'margin-bottom': '15px' }}>👨‍🏫</div>
          <p>لم يتم تخصيص أي حلقة لك بعد</p>
        </div>
      </Show>
    </div>
  );
}

// Leadership Dashboard with Statistics
function LeadershipDashboard(props: { user: User }) {
  const app = useApp();
  
  const users = app.users();
  const students = users.filter(u => u.role === 'student') as Student[];
  const teachers = users.filter(u => u.role === 'lehrer');
  const halaqat = app.halaqat();
  
  // Student status statistics
  const statusCounts = {
    not_available: students.filter(s => s.status === 'not_available').length,
    revising: students.filter(s => s.status === 'revising').length,
    khatamat: students.filter(s => s.status === 'khatamat').length
  };
  
  // Online users (simplified - in real app would use presence)
  const onlineUsers = users.filter(u => u.isActive).length;

  return (
    <div>
      {/* Welcome Card */}
      <div style={{
        background: 'white',
        'border-radius': '12px',
        padding: '20px',
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'text-align': 'center'
      }}>
        <h3 style={{
          color: '#1f2937',
          margin: '0 0 10px 0',
          'font-size': '1.3rem',
          'font-weight': '600'
        }}>
          {props.user.role === 'superuser' ? '👑' : '👥'} مرحباً {props.user.name}
        </h3>
        <p style={{ color: '#6b7280', margin: '0' }}>
          {props.user.role === 'superuser' ? 'مطور النظام' : 'قائد الحلقات'}
        </p>
      </div>

      {/* General Statistics */}
      <div style={{ 
        display: 'grid', 
        'grid-template-columns': 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px', 
        'margin-bottom': '20px' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>👥</div>
          <div style={{ 
            'font-size': '1.8rem', 
            'font-weight': 'bold', 
            color: '#2563eb',
            'margin-bottom': '5px'
          }}>
            {users.length}
          </div>
          <div style={{ color: '#6b7280', 'font-size': '0.85rem' }}>
            إجمالي المستخدمين
          </div>
        </div>

        <Show when={props.user.role === 'superuser'}>
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            'border-radius': '12px', 
            'text-align': 'center', 
            'box-shadow': '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>🟢</div>
            <div style={{ 
              'font-size': '1.8rem', 
              'font-weight': 'bold', 
              color: '#10b981',
              'margin-bottom': '5px'
            }}>
              {onlineUsers}
            </div>
            <div style={{ color: '#6b7280', 'font-size': '0.85rem' }}>
              متصل الآن
            </div>
          </div>
        </Show>

        <div style={{ 
          background: 'white', 
          padding: '20px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>👨‍🏫</div>
          <div style={{ 
            'font-size': '1.8rem', 
            'font-weight': 'bold', 
            color: '#f59e0b',
            'margin-bottom': '5px'
          }}>
            {teachers.length}
          </div>
          <div style={{ color: '#6b7280', 'font-size': '0.85rem' }}>
            المعلمين
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '20px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>🔵</div>
          <div style={{ 
            'font-size': '1.8rem', 
            'font-weight': 'bold', 
            color: '#2563eb',
            'margin-bottom': '5px'
          }}>
            {halaqat.length}
          </div>
          <div style={{ color: '#6b7280', 'font-size': '0.85rem' }}>
            الحلقات
          </div>
        </div>
      </div>

      {/* Student Status Statistics */}
      <div style={{ 
        background: 'white', 
        'border-radius': '12px', 
        padding: '20px', 
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)' 
      }}>
        <h3 style={{ 
          color: '#1f2937', 
          'margin-bottom': '20px',
          'font-size': '1.2rem'
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
            padding: '15px', 
            background: '#fef2f2', 
            'border-radius': '12px', 
            border: '2px solid #ef4444' 
          }}>
            <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>🔴</div>
            <div style={{ 
              'font-size': '1.5rem', 
              'font-weight': 'bold', 
              color: '#ef4444',
              'margin-bottom': '5px'
            }}>
              {statusCounts.not_available}
            </div>
            <div style={{ color: '#6b7280', 'font-size': '0.85rem' }}>
              غير متاح
            </div>
          </div>

          <div style={{ 
            'text-align': 'center', 
            padding: '15px', 
            background: '#fffbeb', 
            'border-radius': '12px', 
            border: '2px solid #f59e0b' 
          }}>
            <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>🟡</div>
            <div style={{ 
              'font-size': '1.5rem', 
              'font-weight': 'bold', 
              color: '#f59e0b',
              'margin-bottom': '5px'
            }}>
              {statusCounts.revising}
            </div>
            <div style={{ color: '#6b7280', 'font-size': '0.85rem' }}>
              يراجع
            </div>
          </div>

          <div style={{ 
            'text-align': 'center', 
            padding: '15px', 
            background: '#f0fdf4', 
            'border-radius': '12px', 
            border: '2px solid #10b981' 
          }}>
            <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>🟢</div>
            <div style={{ 
              'font-size': '1.5rem', 
              'font-weight': 'bold', 
              color: '#10b981',
              'margin-bottom': '5px'
            }}>
              {statusCounts.khatamat}
            </div>
            <div style={{ color: '#6b7280', 'font-size': '0.85rem' }}>
              ختمات
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}