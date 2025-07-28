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
    
    // Sort by name only
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    
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
              outline: 'none', 
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
              background: user().status === "not_available" ? "var(--color-surface)" : "var(--color-surface)",
              color: user().status === "not_available" ? "#dc2626" : "var(--color-text-secondary)",
              border: user().status === "not_available" ? "1px solid var(--color-border)" : "1px solid var(--color-border)",
              padding: "8px 12px",
              "border-radius": "8px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              flex: "1",
              "white-space": "nowrap",
              "overflow": "hidden",
              "text-overflow": "ellipsis"
            }}
          >
            🔴 {app.translate('not_available')}
          </button>
          
          <button
            onClick={() => changeStatus("revising")}
            style={{
              background: user().status === "revising" ? "var(--color-surface)" : "var(--color-surface)",
              color: user().status === "revising" ? "#d97706" : "var(--color-text-secondary)",
              border: user().status === "revising" ? "1px solid var(--color-border)" : "1px solid var(--color-border)",
              padding: "8px 12px",
              "border-radius": "8px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              flex: "1",
              "white-space": "nowrap",
              "overflow": "hidden",
              "text-overflow": "ellipsis"
            }}
          >
            🟡 {app.translate('revising')}
          </button>
          
          <button
            onClick={() => changeStatus("khatamat")}
            style={{
              background: user().status === "khatamat" ? "var(--color-surface)" : "var(--color-surface)",
              color: user().status === "khatamat" ? "#059669" : "var(--color-text-secondary)",
              border: user().status === "khatamat" ? "1px solid var(--color-border)" : "1px solid var(--color-border)",
              padding: "8px 12px",
              "border-radius": "8px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease",
              flex: "1",
              "white-space": "nowrap",
              "overflow": "hidden",
              "text-overflow": "ellipsis"
            }}
          >
            🟢 {app.translate('khatamat')}
          </button>
        </div>
      </div>


      {/* Halaqat Section Title */}
      <div style={{
        'margin-bottom': '12px'
      }}>
        <h3 style={{
          color: 'var(--color-text)',
          margin: '0',
          'font-size': '1.2rem',
          'font-weight': '600'
        }}>
          حلقاتك
        </h3>
      </div>

      {/* Search and Filter Section */}
      <div style={{
        background: 'var(--color-surface)',
        'border-radius': '12px 12px 0 0',
        padding: '15px',
        'margin-bottom': '0',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid var(--color-border)',
        'border-bottom': 'none'
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
              padding: '12px 45px 12px 16px', // More right padding for X button
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
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
              outline: 'none',
                cursor: 'pointer',
                'font-size': '18px',
                color: 'var(--color-text-secondary)',
                'min-width': '24px',
                height: '24px',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center'
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px', 'flex-wrap': 'nowrap', 'overflow-x': 'auto', 'padding-bottom': '2px' }}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatusFilter('all')}
            style={{
              padding: '4px 8px',
              'border-radius': '4px',
              border: 'none',
              outline: 'none',
              background: statusFilter() === 'all' ? 'rgba(29, 78, 216, 0.1)' : 'transparent',
              color: statusFilter() === 'all' ? '#1d4ed8' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.7rem',
              'font-weight': '500',
              transition: 'all 0.2s ease',
              'white-space': 'nowrap',
              'flex-shrink': 0,
              'min-width': 'fit-content',
              'max-width': 'none',
              'overflow': 'visible'
            }}
          >
            {app.translate('allStudents')}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔴 Setting status filter to not_available');
              setStatusFilter('not_available');
            }}
            style={{
              padding: '4px 8px',
              'border-radius': '4px',
              border: 'none',
              outline: 'none',
              background: statusFilter() === 'not_available' ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
              color: statusFilter() === 'not_available' ? '#dc2626' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.7rem',
              'font-weight': '500',
              transition: 'all 0.2s ease',
              'white-space': 'nowrap',
              'flex-shrink': 0,
              'min-width': 'fit-content',
              'max-width': 'none',
              'overflow': 'visible'
            }}
          >
            🔴 {app.translate('not_available')}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatusFilter('revising')}
            style={{
              padding: '4px 8px',
              'border-radius': '4px',
              border: 'none',
              outline: 'none',
              background: statusFilter() === 'revising' ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
              color: statusFilter() === 'revising' ? '#d97706' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.7rem',
              'font-weight': '500',
              transition: 'all 0.2s ease',
              'white-space': 'nowrap',
              'flex-shrink': 0,
              'min-width': 'fit-content',
              'max-width': 'none',
              'overflow': 'visible'
            }}
          >
            🟡 {app.translate('revising')}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatusFilter('khatamat')}
            style={{
              padding: '4px 8px',
              'border-radius': '4px',
              border: 'none',
              outline: 'none',
              background: statusFilter() === 'khatamat' ? 'rgba(5, 150, 105, 0.1)' : 'transparent',
              color: statusFilter() === 'khatamat' ? '#059669' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.7rem',
              'font-weight': '500',
              transition: 'all 0.2s ease',
              'white-space': 'nowrap',
              'flex-shrink': 0,
              'min-width': 'fit-content',
              'max-width': 'none',
              'overflow': 'visible'
            }}
          >
            🟢 {app.translate('khatamat')}
          </button>
        </div>
      </div>

      {/* Halaqat Content Container */}
      <div style={{
        background: 'var(--color-surface)',
        'border-radius': '0 0 12px 12px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid var(--color-border)',
        'border-top': 'none',
        'margin-bottom': '20px',
        overflow: 'hidden'
      }}>
        {/* Show filtered students when search/filter is active AND has results */}
        <Show when={(searchTerm().trim() || statusFilter() !== 'all') && getFilteredStudents(allStudents()).length > 0}>
          <div style={{ padding: '0' }}>
            <HalaqaSection 
              halaqa={{
                id: 'student-search-results',
                name: 'نتائج البحث',
                type: 'search',
                teacher_id: '',
                student_ids: [],
                internal_number: 0,
                isActive: true
              }}
              students={getFilteredStudents(allStudents())}
              formatDate={formatDate}
              getStatusInfo={getStatusInfo}
              isSearchResults={true}
              isConnected={true}
            />
          </div>
        </Show>

        {/* Halaqat Sections - only show when no search/filter is active */}
        <Show when={!searchTerm().trim() && statusFilter() === 'all'}>
          <div style={{ padding: '0' }}>
            <For each={userHalaqat()}>
              {(halaqa, index) => (
                <HalaqaSection 
                  halaqa={halaqa}
                                     students={getStudentsInHalaqa(halaqa.id)}
                   formatDate={formatDate}
                   getStatusInfo={getStatusInfo}
                  isConnected={true}
                  isLast={index() === userHalaqat().length - 1}
                />
              )}
            </For>
          </div>
        </Show>
      </div>
      
      <Show when={userHalaqat().length === 0 && !searchTerm().trim() && statusFilter() === 'all'}>
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

      {/* Show "No Results" message when search/filter returns no results */}
      <Show when={(searchTerm().trim() || statusFilter() !== 'all') && getFilteredStudents(allStudents()).length === 0}>
        <div style={{
          background: 'var(--color-surface)',
          'border-radius': '0 0 12px 12px',
          padding: '15px 20px',
          'text-align': 'center',
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid var(--color-border)',
          'border-top': 'none',
          color: 'var(--color-text-secondary)',
          'margin-bottom': '20px'
        }}>
          <span style={{ 'font-size': '0.9rem' }}>{app.translate('noResultsFound')}</span>
        </div>
      </Show>
    </div>
  );
}

// Halaqa Section Component
function HalaqaSection(props: any) {
  const { halaqa, students, formatDate, getStatusInfo, isConnected = false, isLast = false } = props;
  const [isExpanded, setIsExpanded] = createSignal(true);
  
  const getHalaqaTypeText = (type: string) => {
    switch (type) {
      case 'memorizing': return 'حفظ';
      case 'explanation': return 'شرح';
      case 'memorizing_intensive': return 'حفظ مكثف';
      case 'explanation_intensive': return 'شرح مكثف';
      case 'search': return halaqa.name; // For search results, use the custom name
      default: return type;
    }
  };
  
  return (
    <div style={{
      background: isConnected ? 'transparent' : 'var(--color-surface)',
      'border-radius': isConnected ? '0' : '12px',
      'margin-bottom': isConnected ? '0' : '20px',
      'box-shadow': isConnected ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
      border: isConnected ? 'none' : '1px solid var(--color-border)',
      'border-bottom': isConnected && !isLast ? '1px solid var(--color-border)' : 'none',
      overflow: 'hidden'
    }}>
      {/* Halaqa Header */}
      <div 
        style={{
          background: 'var(--color-surface)',
          padding: '12px 16px',
          'border-bottom': '1px solid var(--color-border)',
          cursor: 'pointer',
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center'
        }}
        onClick={() => setIsExpanded(!isExpanded())}
      >
        <div style={{
          display: 'flex',
          'align-items': 'center',
          gap: '8px'
        }}>
          <span style={{
            color: 'var(--color-text)',
            'font-size': '1rem',
            'font-weight': '600'
          }}>
            {getHalaqaTypeText(halaqa.type)}
          </span>
          <span style={{
            color: 'var(--color-text-secondary)',
            'font-size': '0.9rem',
            'font-weight': '400'
          }}>
            ({students.length} طالب)
          </span>
        </div>
        <div style={{
          transform: isExpanded() ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          'font-size': '1.1rem',
          color: 'var(--color-text-secondary)'
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
                background: 'var(--color-surface)',
                display: 'flex',
                'justify-content': 'space-between',
                'align-items': 'center'
              }}>
                <div style={{ flex: '1' }}>
                  <h5 style={{
                    color: 'var(--color-text)',
                    margin: '0',
                    'font-size': '1rem',
                    'font-weight': '600'
                  }}>
                    {student.name}
                  </h5>
                </div>
                
                <div style={{
                  display: 'inline-flex',
                  'align-items': 'center',
                  background: getStatusInfo(student.status).color,
                  color: 'white',
                  padding: '4px 10px',
                  'border-radius': '12px',
                  'font-size': '0.7rem',
                  'font-weight': '600'
                }}>
                  {getStatusInfo(student.status).icon} {getStatusInfo(student.status).text}
                </div>
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
    
    // Sort by name only
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    
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

      {/* Halaqat Section Title */}
      <div style={{
        'margin-bottom': '12px'
      }}>
        <h3 style={{
          color: 'var(--color-text)',
          margin: '0',
          'font-size': '1.2rem',
          'font-weight': '600'
        }}>
          حلقاتك
        </h3>
      </div>

      {/* Search and Filter Section */}
      <div style={{
        background: 'var(--color-surface)',
        'border-radius': '12px 12px 0 0',
        padding: '15px',
        'margin-bottom': '0',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid var(--color-border)',
        'border-bottom': 'none'
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
              padding: '12px 45px 12px 16px', // More right padding for X button
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
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
              outline: 'none',
                cursor: 'pointer',
                'font-size': '18px',
                color: 'var(--color-text-secondary)',
                'min-width': '24px',
                height: '24px',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center'
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px', 'flex-wrap': 'nowrap', 'overflow-x': 'auto', 'padding-bottom': '2px' }}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatusFilter('all')}
            style={{
              padding: '4px 8px',
              'border-radius': '4px',
              border: 'none',
              outline: 'none',
              background: statusFilter() === 'all' ? 'rgba(29, 78, 216, 0.1)' : 'transparent',
              color: statusFilter() === 'all' ? '#1d4ed8' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.7rem',
              'font-weight': '500',
              transition: 'all 0.2s ease',
              'white-space': 'nowrap',
              'flex-shrink': 0,
              'min-width': 'fit-content',
              'max-width': 'none',
              'overflow': 'visible'
            }}
          >
            {app.translate('allStudents')}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatusFilter('not_available')}
            style={{
              padding: '4px 8px',
              'border-radius': '4px',
              border: 'none',
              outline: 'none',
              background: statusFilter() === 'not_available' ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
              color: statusFilter() === 'not_available' ? '#dc2626' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.7rem',
              'font-weight': '500',
              transition: 'all 0.2s ease',
              'white-space': 'nowrap',
              'flex-shrink': 0,
              'min-width': 'fit-content',
              'max-width': 'none',
              'overflow': 'visible'
            }}
          >
            🔴 {app.translate('not_available')}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatusFilter('revising')}
            style={{
              padding: '4px 8px',
              'border-radius': '4px',
              border: 'none',
              outline: 'none',
              background: statusFilter() === 'revising' ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
              color: statusFilter() === 'revising' ? '#d97706' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.7rem',
              'font-weight': '500',
              transition: 'all 0.2s ease',
              'white-space': 'nowrap',
              'flex-shrink': 0,
              'min-width': 'fit-content',
              'max-width': 'none',
              'overflow': 'visible'
            }}
          >
            🟡 {app.translate('revising')}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatusFilter('khatamat')}
            style={{
              padding: '4px 8px',
              'border-radius': '4px',
              border: 'none',
              outline: 'none',
              background: statusFilter() === 'khatamat' ? 'rgba(5, 150, 105, 0.1)' : 'transparent',
              color: statusFilter() === 'khatamat' ? '#059669' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '0.7rem',
              'font-weight': '500',
              transition: 'all 0.2s ease',
              'white-space': 'nowrap',
              'flex-shrink': 0,
              'min-width': 'fit-content',
              'max-width': 'none',
              'overflow': 'visible'
            }}
          >
            🟢 {app.translate('khatamat')}
          </button>
        </div>
      </div>

                           {/* Show filtered students when search/filter is active AND has results */}
        <Show when={(searchTerm().trim() || statusFilter() !== 'all') && getFilteredStudents(allStudents()).length > 0}>
          <HalaqaSection 
                        halaqa={{
               id: 'teacher-search-results',
               name: 'نتائج البحث',
               type: 'search',
               teacher_id: '',
               student_ids: [],
               internal_number: 0,
               isActive: true
            }}
            students={getFilteredStudents(allStudents())}
            formatDate={formatDate}
            getStatusInfo={getStatusInfo}
            isSearchResults={true}
          />
        </Show>

      {/* Teacher's Halaqat - only show when no search/filter is active */}
      <Show when={!searchTerm().trim() && statusFilter() === 'all'}>
        <For each={teacherHalaqat()}>
          {(halaqa) => (
            <HalaqaSection 
              halaqa={halaqa}
              students={getStudentsInHalaqa(halaqa.id)}
              formatDate={formatDate}
              getStatusInfo={getStatusInfo}
            />
          )}
        </For>
      </Show>
      
      <Show when={teacherHalaqat().length === 0 && !searchTerm().trim() && statusFilter() === 'all'}>
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

      {/* Show "No Results" message when search/filter returns no results */}
      <Show when={(searchTerm().trim() || statusFilter() !== 'all') && getFilteredStudents(allStudents()).length === 0}>
        <div style={{
          background: 'var(--color-surface)',
          'border-radius': '0 0 12px 12px',
          padding: '15px 20px',
          'text-align': 'center',
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid var(--color-border)',
          'border-top': 'none',
          color: 'var(--color-text-secondary)',
          'margin-bottom': '20px'
        }}>
          <span style={{ 'font-size': '0.9rem' }}>{app.translate('noResultsFound')}</span>
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
  const teachers = users.filter(u => u.role === 'teacher');
  const halaqat = app.halaqat();
  
  // Student status statistics
  const statusCounts = {
    not_available: students.filter(s => s.status === 'not_available').length,
    revising: students.filter(s => s.status === 'revising').length,
    khatamat: students.filter(s => s.status === 'khatamat').length
  };
  
  // Online users (simplified - in real app would use presence)
  const onlineUsers = users.filter(u => u.isActive).length;

  // Common style for stat cards
  const statCardStyle = {
    background: 'var(--color-surface)', 
    padding: '12px', 
    'border-radius': '8px', 
    'text-align': 'center' as const, 
    'box-shadow': '0 2px 4px rgba(0,0,0,0.08)', 
    border: '1px solid var(--color-border)',
    transition: 'transform 0.2s ease',
    cursor: 'pointer'
  };

  const handleStatCardHover = (e: MouseEvent, isEnter: boolean) => {
    const target = e.currentTarget as HTMLElement;
    target.style.transform = isEnter ? 'translateY(-2px)' : 'translateY(0)';
    target.style.boxShadow = isEnter ? '0 4px 8px rgba(0,0,0,0.12)' : '0 2px 4px rgba(0,0,0,0.08)';
  };

  return (
    <div>
      {/* Compact Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary), #3b82f6)',
        'border-radius': '12px',
        padding: '16px 20px',
        'margin-bottom': '16px',
        'box-shadow': '0 4px 12px rgba(59, 130, 246, 0.3)',
        'text-align': 'center',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          gap: '12px',
          'margin-bottom': '4px'
        }}>
          <span style={{ 'font-size': '1.5rem' }}>
            {props.user.role === 'admin' ? '👑' : '👥'}
          </span>
          <h3 style={{
            margin: '0',
            'font-size': '1.1rem',
            'font-weight': '600'
          }}>
            مرحباً {props.user.name}
          </h3>
        </div>
        <p style={{ margin: '0', 'font-size': '0.8rem', opacity: '0.9' }}>
          {props.user.role === 'admin' ? 'مطور النظام' : 'قائد الحلقات'}
        </p>
      </div>

      {/* Compact Statistics Grid */}
      <div style={{ 
        display: 'grid', 
        'grid-template-columns': 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '10px', 
        'margin-bottom': '16px' 
      }}>
        <div 
          style={statCardStyle}
          onMouseEnter={(e) => handleStatCardHover(e, true)}
          onMouseLeave={(e) => handleStatCardHover(e, false)}
        >
          <div style={{ 'font-size': '1.2rem', 'margin-bottom': '4px' }}>👥</div>
          <div style={{ 
            'font-size': '1.3rem', 
            'font-weight': '700', 
            color: 'var(--color-primary)',
            'margin-bottom': '2px'
          }}>
            {users.length}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.7rem' }}>
            المستخدمين
          </div>
        </div>

        <div 
          style={statCardStyle}
          onMouseEnter={(e) => handleStatCardHover(e, true)}
          onMouseLeave={(e) => handleStatCardHover(e, false)}
        >
          <div style={{ 'font-size': '1.2rem', 'margin-bottom': '4px' }}>🎓</div>
          <div style={{ 
            'font-size': '1.3rem', 
            'font-weight': '700', 
            color: '#10b981',
            'margin-bottom': '2px'
          }}>
            {students.length}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.7rem' }}>
            الطلاب
          </div>
        </div>

        <div 
          style={statCardStyle}
          onMouseEnter={(e) => handleStatCardHover(e, true)}
          onMouseLeave={(e) => handleStatCardHover(e, false)}
        >
          <div style={{ 'font-size': '1.2rem', 'margin-bottom': '4px' }}>👨‍🏫</div>
          <div style={{ 
            'font-size': '1.3rem', 
            'font-weight': '700', 
            color: '#f59e0b',
            'margin-bottom': '2px'
          }}>
            {teachers.length}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.7rem' }}>
            المعلمين
          </div>
        </div>

        <div 
          style={statCardStyle}
          onMouseEnter={(e) => handleStatCardHover(e, true)}
          onMouseLeave={(e) => handleStatCardHover(e, false)}
        >
          <div style={{ 'font-size': '1.2rem', 'margin-bottom': '4px' }}>🔵</div>
          <div style={{ 
            'font-size': '1.3rem', 
            'font-weight': '700', 
            color: 'var(--color-primary)',
            'margin-bottom': '2px'
          }}>
            {halaqat.length}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.7rem' }}>
            الحلقات
          </div>
        </div>

        <Show when={props.user.role === 'admin'}>
          <div 
            style={statCardStyle}
            onMouseEnter={(e) => handleStatCardHover(e, true)}
            onMouseLeave={(e) => handleStatCardHover(e, false)}
          >
            <div style={{ 'font-size': '1.2rem', 'margin-bottom': '4px' }}>🟢</div>
            <div style={{ 
              'font-size': '1.3rem', 
              'font-weight': '700', 
              color: '#10b981',
              'margin-bottom': '2px'
            }}>
              {onlineUsers}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.7rem' }}>
              متصل الآن
            </div>
          </div>
        </Show>
      </div>

      {/* Compact Student Status Overview */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '10px', 
        padding: '16px', 
        'box-shadow': '0 2px 6px rgba(0,0,0,0.08)', 
        border: '1px solid var(--color-border)' 
      }}>
        <div style={{
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          'margin-bottom': '12px'
        }}>
          <h3 style={{ 
            color: 'var(--color-text)', 
            margin: '0',
            'font-size': '1rem',
            'font-weight': '600'
          }}>
            📊 حالات الطلاب
          </h3>
          <div style={{
            'font-size': '0.8rem',
            color: 'var(--color-text-secondary)'
          }}>
            المجموع: {students.length}
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', 
          'grid-template-columns': 'repeat(3, 1fr)', 
          gap: '8px' 
        }}>
          <div style={{ 
            'text-align': 'center', 
            padding: '10px 8px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            'border-radius': '8px', 
            border: '1px solid var(--color-error)',
            transition: 'transform 0.2s ease'
          }}>
            <div style={{ 'font-size': '1.1rem', 'margin-bottom': '2px' }}>🔴</div>
            <div style={{ 
              'font-size': '1.2rem', 
              'font-weight': '700', 
              color: 'var(--color-error)',
              'margin-bottom': '2px'
            }}>
              {statusCounts.not_available}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.7rem' }}>
              غير متوفر
            </div>
          </div>

          <div style={{ 
            'text-align': 'center', 
            padding: '10px 8px', 
            background: 'rgba(245, 158, 11, 0.1)', 
            'border-radius': '8px', 
            border: '1px solid var(--color-warning)',
            transition: 'transform 0.2s ease'
          }}>
            <div style={{ 'font-size': '1.1rem', 'margin-bottom': '2px' }}>🟡</div>
            <div style={{ 
              'font-size': '1.2rem', 
              'font-weight': '700', 
              color: 'var(--color-warning)',
              'margin-bottom': '2px'
            }}>
              {statusCounts.revising}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.7rem' }}>
              يراجع
            </div>
          </div>

          <div style={{ 
            'text-align': 'center', 
            padding: '10px 8px', 
            background: 'rgba(16, 185, 129, 0.1)', 
            'border-radius': '8px', 
            border: '1px solid var(--color-success)',
            transition: 'transform 0.2s ease'
          }}>
            <div style={{ 'font-size': '1.1rem', 'margin-bottom': '2px' }}>🟢</div>
            <div style={{ 
              'font-size': '1.2rem', 
              'font-weight': '700', 
              color: 'var(--color-success)',
              'margin-bottom': '2px'
            }}>
              {statusCounts.khatamat}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', 'font-size': '0.7rem' }}>
              ختمات
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          'margin-top': '12px',
          'border-radius': '4px',
          overflow: 'hidden',
          background: 'var(--color-border)',
          height: '6px'
        }}>
          <div style={{
            display: 'flex',
            height: '100%'
          }}>
            <div style={{
              'background-color': 'var(--color-error)',
              width: `${(statusCounts.not_available / students.length) * 100}%`
            }} />
            <div style={{
              'background-color': 'var(--color-warning)',
              width: `${(statusCounts.revising / students.length) * 100}%`
            }} />
            <div style={{
              'background-color': 'var(--color-success)',
              width: `${(statusCounts.khatamat / students.length) * 100}%`
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}