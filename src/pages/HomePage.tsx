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
        <div style={{ 
          display: 'flex', 
          'align-items': 'center', 
          'justify-content': 'center', 
          gap: '16px',
          'margin-bottom': '8px',
          'flex-wrap': 'nowrap'
        }}>
          <img 
            src="https://archive.org/download/logo-allemni/Logo_allemni.jpg" 
            alt="Logo" 
            style={{ 
              width: '48px', 
              height: '48px', 
              'border-radius': '8px',
              'object-fit': 'contain',
              'flex-shrink': '0'
            }} 
          />
          <h1 style={{ 
            color: 'var(--color-primary)', 
            'font-size': 'clamp(1.5rem, 4vw, 2rem)', 
            margin: '0', 
            'font-weight': '700',
            'white-space': 'nowrap',
            'text-overflow': 'ellipsis',
            overflow: 'hidden',
            'min-width': '0'
          }}>
            {app.translate('appTitle')}
          </h1>
        </div>
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          'font-size': '0.85rem', 
          margin: '0',
          'white-space': 'nowrap',
          overflow: 'hidden',
          'text-overflow': 'ellipsis'
        }}>
          {app.translate('appSubtitle')}
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
    console.log('🔍 getFilteredStudents called with:', students.length, 'students');
    console.log('🔍 Current statusFilter:', statusFilter());
    console.log('🔍 Current searchTerm:', searchTerm());
    
    let filtered = students;
    console.log('🔍 Students before filtering:', filtered.map(s => ({ name: s.name, status: s.status })));
    
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
      console.log('🎯 Applying status filter:', statusFilter());
      const beforeFilter = filtered.length;
      filtered = filtered.filter(s => {
        const matches = s.status === statusFilter();
        console.log(`🎯 Student ${s.name}: status="${s.status}", filter="${statusFilter()}", matches=${matches}`);
        return matches;
      });
      console.log('🎯 Status filtered students:', filtered.length, 'from', beforeFilter, 'with status:', statusFilter());
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
    console.log('📋 Final students:', filtered.map(s => ({ name: s.name, status: s.status })));
    return filtered;
  };
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_available':
        return { color: '#ef4444', icon: '🔴', text: app.translate('not_available') };
      case 'revising':
        return { color: '#f59e0b', icon: '🟡', text: app.translate('revising') };
      case 'khatamat':
        return { color: '#10b981', icon: '🟢', text: app.translate('khatamat') };
      default:
        return { color: 'var(--color-text-secondary)', icon: '⚪', text: app.translate('status') };
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
        background: 'var(--color-surface)', 
        'border-radius': '12px', 
        padding: '20px', 
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)',
        border: '2px solid var(--color-primary)'
      }}>
        <div style={{ 'text-align': 'center', 'margin-bottom': '15px' }}>
          <h3 style={{ 
            color: 'var(--color-text)', 
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
          background: 'var(--color-border)', 
          margin: '20px 0 15px 0' 
        }} />
        
        {/* Change Status Text */}
        <p style={{ 
          'text-align': 'center', 
          color: 'var(--color-text)', 
          'font-weight': '600',
          'margin-bottom': '15px'
        }}>
                      {app.translate('changeStatus')}
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
              background: user().status === "not_available" ? "#fef2f2" : "var(--color-surface)",
              color: user().status === "not_available" ? "#dc2626" : "var(--color-text-secondary)",
              border: user().status === "not_available" ? "1px solid #fecaca" : "1px solid var(--color-border)",
              padding: "8px 12px",
              "border-radius": "8px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              flex: "1"
            }}
          >
            🔴 {app.translate('not_available')}
          </button>
          
          <button
            onClick={() => changeStatus("revising")}
            style={{
              background: user().status === "revising" ? "#fffbeb" : "var(--color-surface)",
              color: user().status === "revising" ? "#d97706" : "var(--color-text-secondary)",
              border: user().status === "revising" ? "1px solid #fed7aa" : "1px solid var(--color-border)",
              padding: "8px 12px",
              "border-radius": "8px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              flex: "1"
            }}
          >
            🟡 {app.translate('revising')}
          </button>
          
          <button
            onClick={() => changeStatus("khatamat")}
            style={{
              background: user().status === "khatamat" ? "#f0fdf4" : "var(--color-surface)",
              color: user().status === "khatamat" ? "#059669" : "var(--color-text-secondary)",
              border: user().status === "khatamat" ? "1px solid #bbf7d0" : "1px solid var(--color-border)",
              padding: "8px 12px",
              "border-radius": "8px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              flex: "1"
            }}
          >
            🟢 {app.translate('khatamat')}
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div style={{
        background: 'var(--color-surface)',
        'border-radius': '12px',
        padding: '15px',
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)',
        border: '1px solid var(--color-border)'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', 'margin-bottom': '15px' }}>
          <input
            type="text"
            placeholder={`🔍 ${app.translate('searchStudent')}`}
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              'border-radius': '8px',
              border: '2px solid var(--color-border)',
              'background-color': 'var(--color-background)',
              color: 'var(--color-text)',
              'font-size': '16px',
              'box-sizing': 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
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
                color: 'var(--color-text-secondary)'
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
              border: statusFilter() === 'all' ? '1px solid #dbeafe' : '1px solid var(--color-border)',
              background: statusFilter() === 'all' ? '#eff6ff' : 'var(--color-surface)',
              color: statusFilter() === 'all' ? '#1d4ed8' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            {app.translate('allStudents')}
          </button>
          <button
            onClick={() => {
              console.log('🔴 Setting status filter to not_available');
              setStatusFilter('not_available');
              console.log('🔴 Status filter is now:', statusFilter());
            }}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'not_available' ? '1px solid #fecaca' : '1px solid var(--color-border)',
              background: statusFilter() === 'not_available' ? '#fef2f2' : 'var(--color-surface)',
              color: statusFilter() === 'not_available' ? '#dc2626' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🔴 {app.translate('not_available')}
          </button>
          <button
            onClick={() => setStatusFilter('revising')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'revising' ? '1px solid #fed7aa' : '1px solid var(--color-border)',
              background: statusFilter() === 'revising' ? '#fffbeb' : 'var(--color-surface)',
              color: statusFilter() === 'revising' ? '#d97706' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🟡 {app.translate('revising')}
          </button>
          <button
            onClick={() => setStatusFilter('khatamat')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'khatamat' ? '1px solid #bbf7d0' : '1px solid var(--color-border)',
              background: statusFilter() === 'khatamat' ? '#f0fdf4' : 'var(--color-surface)',
              color: statusFilter() === 'khatamat' ? '#059669' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🟢 {app.translate('khatamat')}
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
          background: 'var(--color-surface)',
          'border-radius': '12px',
          padding: '40px 20px',
          'text-align': 'center',
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)'
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
      background: 'var(--color-surface)',
      'border-radius': '12px',
      'margin-bottom': '20px',
      'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)',
      overflow: 'hidden'
    }}>
      {/* Halaqa Header */}
      <div 
        style={{
          background: '#f8fafc',
          padding: '15px 20px',
          'border-bottom': '1px solid var(--color-border)',
          cursor: 'pointer',
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center'
        }}
        onClick={() => setIsExpanded(!isExpanded())}
      >
        <div>
          <h4 style={{
            color: 'var(--color-text)',
            margin: '0 0 5px 0',
            'font-size': '1.1rem',
            'font-weight': '600'
          }}>
            {getHalaqaTypeText(halaqa.type)}
          </h4>
          <p style={{
            color: 'var(--color-text-secondary)',
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
              color: 'var(--color-text-secondary)'
            }}>
              <p>لا يوجد طلاب في هذه الحلقة</p>
            </div>
          </Show>
          
          <For each={students}>
            {(student) => (
              <div style={{
                border: '1px solid var(--color-border)',
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
                      color: 'var(--color-text)',
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
                      color: 'var(--color-text-secondary)', 
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
        return { color: '#ef4444', icon: '🔴', text: app.translate('not_available') };
      case 'revising':
        return { color: '#f59e0b', icon: '🟡', text: app.translate('revising') };
      case 'khatamat':
        return { color: '#10b981', icon: '🟢', text: app.translate('khatamat') };
      default:
        return { color: 'var(--color-text-secondary)', icon: '⚪', text: app.translate('status') };
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
        background: 'var(--color-surface)',
        'border-radius': '12px',
        padding: '20px',
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)',
        'text-align': 'center'
      }}>
        <h3 style={{
          color: 'var(--color-text)',
          margin: '0 0 10px 0',
          'font-size': '1.3rem',
          'font-weight': '600'
        }}>
          👨‍🏫 مرحباً {user.name}
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', margin: '0' }}>
          {teacherHalaqat().length} حلقة مخصصة لك
        </p>
      </div>

      {/* Search and Filter Section (same as student) */}
      <div style={{
        background: 'var(--color-surface)',
        'border-radius': '12px',
        padding: '15px',
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)'
      }}>
        <input
          type="text"
          placeholder="{app.translate('searchStudent')}..."
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
              border: statusFilter() === 'all' ? '1px solid #dbeafe' : '1px solid var(--color-border)',
              background: statusFilter() === 'all' ? '#eff6ff' : 'var(--color-surface)',
              color: statusFilter() === 'all' ? '#1d4ed8' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            {app.translate('allStudents')}
          </button>
          <button
            onClick={() => setStatusFilter('not_available')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'not_available' ? '1px solid #fecaca' : '1px solid var(--color-border)',
              background: statusFilter() === 'not_available' ? '#fef2f2' : 'var(--color-surface)',
              color: statusFilter() === 'not_available' ? '#dc2626' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🔴 {app.translate('not_available')}
          </button>
          <button
            onClick={() => setStatusFilter('revising')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'revising' ? '1px solid #fed7aa' : '1px solid var(--color-border)',
              background: statusFilter() === 'revising' ? '#fffbeb' : 'var(--color-surface)',
              color: statusFilter() === 'revising' ? '#d97706' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🟡 {app.translate('revising')}
          </button>
          <button
            onClick={() => setStatusFilter('khatamat')}
            style={{
              padding: '6px 12px',
              'border-radius': '6px',
              border: statusFilter() === 'khatamat' ? '1px solid #bbf7d0' : '1px solid var(--color-border)',
              background: statusFilter() === 'khatamat' ? '#f0fdf4' : 'var(--color-surface)',
              color: statusFilter() === 'khatamat' ? '#059669' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.8rem',
              'font-weight': '500',
              transition: 'all 0.2s ease'
            }}
          >
            🟢 {app.translate('khatamat')}
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
          background: 'var(--color-surface)',
          'border-radius': '12px',
          padding: '40px 20px',
          'text-align': 'center',
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)'
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
        background: 'var(--color-surface)',
        'border-radius': '12px',
        padding: '20px',
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)',
        'text-align': 'center'
      }}>
        <h3 style={{
          color: 'var(--color-text)',
          margin: '0 0 10px 0',
          'font-size': '1.3rem',
          'font-weight': '600'
        }}>
          {props.user.role === 'superuser' ? '👑' : '👥'} مرحباً {props.user.name}
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', margin: '0' }}>
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
          background: 'var(--color-surface)', 
          padding: '20px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)' 
        }}>
          <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>👥</div>
          <div style={{ 
            'font-size': '1.8rem', 
            'font-weight': 'bold', 
            color: 'var(--color-primary)',
            'margin-bottom': '5px'
          }}>
            {users.length}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.85rem' }}>
            إجمالي المستخدمين
          </div>
        </div>

        <Show when={props.user.role === 'superuser'}>
          <div style={{ 
            background: 'var(--color-surface)', 
            padding: '20px', 
            'border-radius': '12px', 
            'text-align': 'center', 
            'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)' 
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
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.85rem' }}>
              متصل الآن
            </div>
          </div>
        </Show>

        <div style={{ 
          background: 'var(--color-surface)', 
          padding: '20px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)' 
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
          <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.85rem' }}>
            المعلمين
          </div>
        </div>

        <div style={{ 
          background: 'var(--color-surface)', 
          padding: '20px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)' 
        }}>
          <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>🔵</div>
          <div style={{ 
            'font-size': '1.8rem', 
            'font-weight': 'bold', 
            color: 'var(--color-primary)',
            'margin-bottom': '5px'
          }}>
            {halaqat.length}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.85rem' }}>
            الحلقات
          </div>
        </div>
      </div>

      {/* Student Status Statistics */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '12px', 
        padding: '20px', 
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)' 
      }}>
        <h3 style={{ 
          color: 'var(--color-text)', 
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
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.85rem' }}>
              {app.translate('not_available')}
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
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.85rem' }}>
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
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.85rem' }}>
              {app.translate('khatamat')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}