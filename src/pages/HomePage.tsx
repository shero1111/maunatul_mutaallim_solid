import { createMemo, For, Show, createSignal, onMount, onCleanup } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Student, User } from '../types';
import { getStatusColor } from '../styles/themes';

export function HomePage() {
  const app = useApp();
  
  // Make currentUser reactive and safe
  const currentUser = createMemo(() => {
    try {
      const user = app.currentUser();
      console.log('🏠 HomePage currentUser:', user?.name || 'null');
      return user;
    } catch (error) {
      console.error('💥 Error getting currentUser:', error);
      return null;
    }
  });
  
  // Add mount/unmount logging
  onMount(() => {
    console.log('🏠 HomePage mounted');
  });
  
  onCleanup(() => {
    console.log('🏠 HomePage cleanup');
  });
  
  return (
    <Show 
      when={currentUser()} 
      fallback={
        <div style={{
          padding: '20px',
          'text-align': 'center',
          color: 'var(--color-text)'
        }}>
          Loading user data...
        </div>
      }
    >
      <HomePageContent user={currentUser()!} />
    </Show>
  );
}

function HomePageContent(props: { user: User }) {
  const app = useApp();
  const { user } = props;
  
  // Add safety check
  if (!user) {
    console.warn('⚠️ HomePageContent: No user provided');
    return <div>No user data available</div>;
  }
  
  console.log('🏠 HomePageContent rendering for user:', user.name, 'role:', user.role);
  
  // Student-specific signals for search and filter
  const [searchTerm, setSearchTerm] = createSignal('');
  const [statusFilter, setStatusFilter] = createSignal<string>('all');
  
  // Get favorites from current user data - make it reactive
  const favorites = createMemo(() => {
    try {
      return user?.favorites || [];
    } catch (error) {
      console.error('💥 Error getting favorites:', error);
      return [];
    }
  });
  
  const setFavorites = (newFavorites: string[] | ((prev: string[]) => string[])) => {
    try {
      if (!user) return;
      
      const finalFavorites = typeof newFavorites === 'function' 
        ? newFavorites(favorites()) 
        : newFavorites;
      
      const updatedUser = {
        ...user,
        favorites: finalFavorites
      };
      
      console.log('⭐ Updating user favorites:', finalFavorites);
      app.updateUser(updatedUser);
    } catch (error) {
      console.error('💥 Error setting favorites:', error);
    }
  };
  
  // Role-based dashboard data - make it safer
  const dashboardData = createMemo(() => {
    try {
      const users = app.users() || [];
      const halaqat = app.halaqat() || [];
      
      console.log('📊 Computing dashboard data for role:', user.role);
      
      switch (user.role) {
        case 'student':
          const studentData = user as Student;
          const userHalaqat = halaqat.filter(h => h.student_ids?.includes(user.id));
          return {
            type: 'student',
            data: { student: studentData, halaqat: userHalaqat, allUsers: users }
          };
          
        case 'lehrer':
          const teacherHalaqat = halaqat.filter(h => h.teacher_id === user.id);
          return {
            type: 'teacher',
            data: { teacher: user, halaqat: teacherHalaqat, allUsers: users }
          };
          
        case 'leitung':
        case 'superuser':
          const totalUsers = users.length;
          const totalTeachers = users.filter(u => u.role === 'lehrer').length;
          const totalHalaqat = halaqat.length;
          const studentsWithStatus = users.filter(u => u.role === 'student') as Student[];
          
          const statusCounts = {
            not_available: studentsWithStatus.filter(s => s.status === 'not_available').length,
            revising: studentsWithStatus.filter(s => s.status === 'revising').length,
            khatamat: studentsWithStatus.filter(s => s.status === 'khatamat').length
          };
          
          return {
            type: 'leadership',
            data: { totalUsers, totalTeachers, totalHalaqat, statusCounts }
          };
          
        default:
          console.warn('⚠️ Unknown user role:', user.role);
          return {
            type: 'student',
            data: { student: user, halaqat: [], allUsers: users }
          };
      }
    } catch (error) {
      console.error('💥 Error computing dashboard data:', error);
      return {
        type: 'error',
        data: { error: 'Failed to load dashboard data' }
      };
    }
  });

  const renderContent = () => {
    try {
      const data = dashboardData();
      
      if (data.type === 'error') {
        return (
          <div style={{
            padding: '20px',
            'text-align': 'center',
            color: 'var(--color-error)'
          }}>
            Error loading dashboard. Please refresh the page.
          </div>
        );
      }
      
      switch (data.type) {
        case 'student':
          return <StudentDashboard data={data.data} />;
        case 'teacher':
          return <TeacherDashboard data={data.data} />;
        case 'leadership':
          return <LeadershipDashboard data={data.data} />;
        default:
          return <div>Unknown dashboard type</div>;
      }
    } catch (error) {
      console.error('💥 Error rendering content:', error);
      return (
        <div style={{
          padding: '20px',
          'text-align': 'center',
          color: 'var(--color-error)'
        }}>
          Error rendering dashboard. Please refresh the page.
        </div>
      );
    }
  };

  return (
    <div style={{ 
      padding: '20px 16px 80px 16px', 
      'background-color': 'var(--color-background)',
      'min-height': '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        'text-align': 'center', 
        'margin-bottom': '24px' 
      }}>
        <div style={{ 
          'margin-bottom': '16px' 
        }}>
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
      </div>

      {/* Role-based Dashboard Content */}
      {renderContent()}
    </div>
  );
}

// Student Dashboard Component
function StudentDashboard(props: any) {
  const { data, app, searchTerm, setSearchTerm, statusFilter, setStatusFilter, favorites, setFavorites } = props;
  const { halaqat, allUsers } = data;
  
  // Make student reactive to current user changes
  const student = createMemo(() => {
    const currentUser = app.currentUser();
    console.log('🔄 Student memo updated:', currentUser);
    return currentUser;
  });
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_available':
        return { color: 'var(--color-error)', icon: '🔴', text: app.translate('not_available') };
      case 'revising':
        return { color: 'var(--color-warning)', icon: '🟡', text: app.translate('revising') };
      case 'khatamat':
        return { color: 'var(--color-success)', icon: '🟢', text: app.translate('khatamat') };
      default:
        return { color: 'var(--color-text)', icon: '⚪', text: 'غير محدد' };
    }
  };
  
  const statusInfo = createMemo(() => getStatusInfo(student()?.status || 'not_available'));
  const lastChanged = createMemo(() => 
    student()?.status_changed_at ? new Date(student().status_changed_at).toLocaleDateString('ar') : ''
  );
  
  const changeStatus = (newStatus: string) => {
    console.log('🎯 Status button clicked:', newStatus);
    console.log('👤 Current student:', student());
    
    const currentStudent = student();
    if (!currentStudent) return;
    
    const updatedStudent = {
      ...currentStudent,
      status: newStatus as any,
      status_changed_at: new Date().toISOString()
    };
    console.log('🔄 Updated student object:', updatedStudent);
    
    app.updateUser(updatedStudent);
    
    // Force a re-render by checking if the data actually changed
    setTimeout(() => {
      const currentUserData = app.currentUser();
      console.log('✅ Current user after update:', currentUserData);
    }, 100);
  };
  
  const toggleFavorite = (userId: string) => {
    console.log('⭐ Student: Toggle favorite clicked for:', userId);
    const current = favorites();
    console.log('⭐ Student: Current favorites:', current);
    console.log('⭐ Student: Current user:', student());
    
    if (current.includes(userId)) {
      console.log('⭐ Student: Removing from favorites');
      const newFavorites = current.filter(id => id !== userId);
      console.log('⭐ Student: New favorites after removal:', newFavorites);
      setFavorites(newFavorites);
    } else {
      console.log('⭐ Student: Adding to favorites');
      const newFavorites = [...current, userId];
      console.log('⭐ Student: New favorites after addition:', newFavorites);
      setFavorites(newFavorites);
    }
    
    // Force a small delay to check if it updated
    setTimeout(() => {
      console.log('⭐ Student: Favorites after timeout:', favorites());
    }, 100);
  };
  
  const getFilteredStudents = (halaqaId: string) => {
    const halaqa = halaqat.find(h => h.id === halaqaId);
    if (!halaqa) return [];
    
    let students = halaqa.student_ids
      .map(id => allUsers.find(u => u.id === id))
      .filter(u => u && u.id !== student()?.id && u.isActive !== false) as Student[];
    
    // Apply search filter
    if (searchTerm()) {
      students = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm().toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter() !== 'all') {
      students = students.filter(s => s.status === statusFilter());
    }
    
    // Sort by favorites first
    const favs = favorites();
    return students.sort((a, b) => {
      const aIsFav = favs.includes(a.id);
      const bIsFav = favs.includes(b.id);
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      return a.name.localeCompare(b.name);
    });
  };
  
  return (
    <>
            {/* Student Info Card - Compact Design */}
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
        {/* Student Info */}
        <div style={{ flex: '1' }}>
          <h3 style={{ 
            color: 'var(--color-text)', 
            'margin-bottom': '6px',
            'font-size': '1.2rem',
            'font-weight': '600'
          }}>
            {student()?.name}
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
              background: student()?.status === "not_available" ? "var(--color-error)" : "var(--color-background)",
              color: student()?.status === "not_available" ? "white" : "var(--color-text-secondary)",
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
              background: student()?.status === "revising" ? "var(--color-warning)" : "var(--color-background)",
              color: student()?.status === "revising" ? "white" : "var(--color-text-secondary)",
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
              background: student()?.status === "khatamat" ? "var(--color-success)" : "var(--color-background)",
              color: student()?.status === "khatamat" ? "white" : "var(--color-text-secondary)",
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
              'font-size': '14px',
              background: 'var(--color-background)',
              color: 'var(--color-text)',
              transition: 'all 0.2s ease',
              'outline': 'none'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          />
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-secondary)',
            'font-size': '16px',
            'pointer-events': 'none'
          }}>
            🔍
          </div>
        </div>
        
        {/* Status Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '6px',
          'flex-wrap': 'wrap'
        }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '6px 12px',
              'border-radius': '16px',
              border: statusFilter() === 'all' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: statusFilter() === 'all' ? 'var(--color-primary)08' : 'var(--color-background)',
              color: statusFilter() === 'all' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'all' ? '600' : '500',
              transition: 'all 0.2s ease'
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
              background: statusFilter() === 'not_available' ? 'var(--color-error)08' : 'var(--color-background)',
              color: statusFilter() === 'not_available' ? 'var(--color-error)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'not_available' ? '600' : '500',
              transition: 'all 0.2s ease'
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
              background: statusFilter() === 'revising' ? 'var(--color-warning)08' : 'var(--color-background)',
              color: statusFilter() === 'revising' ? 'var(--color-warning)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'revising' ? '600' : '500',
              transition: 'all 0.2s ease'
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
              background: statusFilter() === 'khatamat' ? 'var(--color-success)08' : 'var(--color-background)',
              color: statusFilter() === 'khatamat' ? 'var(--color-success)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'khatamat' ? '600' : '500',
              transition: 'all 0.2s ease'
            }}
          >
            ختمات
          </button>
        </div>
      </div>

      {/* Halaqat Lists */}
      <For each={halaqat}>
        {(halaqa) => {
          const students = getFilteredStudents(halaqa.id);
          return (
            <div style={{ 
              background: 'var(--color-surface)', 
              'border-radius': '15px', 
              padding: '20px', 
              'margin-bottom': '20px',
              border: '1px solid var(--color-border)' 
            }}>
              <h3 style={{ 
                color: 'var(--color-text)', 
                'margin-bottom': '15px',
                'font-size': '1.2rem'
              }}>
                {halaqa.name} ({halaqa.type})
              </h3>
              
              <Show when={students.length > 0} fallback={
                <p style={{ 
                  color: 'var(--color-text-secondary)', 
                  'text-align': 'center',
                  'font-style': 'italic'
                }}>
                  لا توجد طلاب متطابقون مع البحث
                </p>
              }>
                <For each={students}>
                  {(otherStudent) => {
                    const otherStatusInfo = getStatusInfo(otherStudent.status);
                    const otherLastChanged = otherStudent.status_changed_at ? 
                      new Date(otherStudent.status_changed_at).toLocaleDateString('ar') : '';
                    const isFavorite = createMemo(() => favorites().includes(otherStudent.id));
                    
                    return (
                      <div style={{ 
                        background: 'var(--color-background)', 
                        'border-radius': '10px', 
                        padding: '15px', 
                        'margin-bottom': '10px',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        'justify-content': 'space-between',
                        'align-items': 'center'
                      }}>
                        <div style={{ flex: '1' }}>
                          <div style={{ 
                            display: 'flex',
                            'align-items': 'center',
                            gap: '10px',
                            'margin-bottom': '5px'
                          }}>
                            <span style={{ 
                              'font-weight': 'bold', 
                              color: 'var(--color-text)'
                            }}>
                              {otherStudent.name}
                            </span>
                            <button
                              onClick={() => toggleFavorite(otherStudent.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                'font-size': '1.2rem'
                              }}
                            >
                              {isFavorite() ? '⭐' : '☆'}
                            </button>
                          </div>
                          {otherLastChanged && (
                            <div style={{ 
                              color: 'var(--color-text-secondary)', 
                              'font-size': '0.85rem' 
                            }}>
                              آخر تحديث: {otherLastChanged}
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          padding: '6px 12px', 
                          'border-radius': '20px',
                          background: otherStatusInfo.color,
                          color: 'white',
                          'font-size': '0.85rem',
                          'font-weight': 'bold',
                          display: 'flex',
                          'align-items': 'center',
                          gap: '5px'
                        }}>
                          {otherStatusInfo.icon} {otherStatusInfo.text}
                        </div>
                      </div>
                    );
                  }}
                </For>
              </Show>
            </div>
          );
        }}
      </For>
    </>
  );
}

// Helper function for status text
function getStatusText(status: string): string {
  switch (status) {
    case 'not_available': return 'غير المتاحين';
    case 'revising': return 'المراجعين';
    case 'khatamat': return 'أصحاب الختمات';
    default: return 'جميع الحالات';
  }
}

// Teacher Dashboard Component  
function TeacherDashboard(props: any) {
  const { data, app, searchTerm, setSearchTerm, statusFilter, setStatusFilter, favorites, setFavorites } = props;
  const { halaqat, allUsers } = data;
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_available':
        return { color: 'var(--color-error)', icon: '🔴', text: app.translate('not_available') };
      case 'revising':
        return { color: 'var(--color-warning)', icon: '🟡', text: app.translate('revising') };
      case 'khatamat':
        return { color: 'var(--color-success)', icon: '🟢', text: app.translate('khatamat') };
      default:
        return { color: 'var(--color-text)', icon: '⚪', text: 'غير محدد' };
    }
  };
  
  const toggleFavorite = (userId: string) => {
    console.log('⭐ Teacher: Toggle favorite clicked for:', userId);
    const current = favorites();
    console.log('⭐ Teacher: Current favorites:', current);
    
    if (current.includes(userId)) {
      console.log('⭐ Teacher: Removing from favorites');
      const newFavorites = current.filter(id => id !== userId);
      console.log('⭐ Teacher: New favorites after removal:', newFavorites);
      setFavorites(newFavorites);
    } else {
      console.log('⭐ Teacher: Adding to favorites');
      const newFavorites = [...current, userId];
      console.log('⭐ Teacher: New favorites after addition:', newFavorites);
      setFavorites(newFavorites);
    }
    
    // Force a small delay to check if it updated
    setTimeout(() => {
      console.log('⭐ Teacher: Favorites after timeout:', favorites());
    }, 100);
  };
  
  const getFilteredStudents = (halaqaId: string) => {
    const halaqa = halaqat.find(h => h.id === halaqaId);
    if (!halaqa) return [];
    
    let students = halaqa.student_ids
      .map(id => allUsers.find(u => u.id === id))
      .filter(u => u && u.isActive !== false) as Student[];
    
    // Apply search filter
    if (searchTerm()) {
      students = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm().toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter() !== 'all') {
      students = students.filter(s => s.status === statusFilter());
    }
    
    // Sort by favorites first
    const favs = favorites();
    return students.sort((a, b) => {
      const aIsFav = favs.includes(a.id);
      const bIsFav = favs.includes(b.id);
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      return a.name.localeCompare(b.name);
    });
  };
  
  return (
    <>
      {/* Search and Filter */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '12px', 
        padding: '16px', 
        'margin-bottom': '20px',
        border: '1px solid var(--color-border)'
      }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          'margin-bottom': '12px'
        }}>
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
              transition: 'all 0.2s ease',
              'outline': 'none'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          />
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-secondary)',
            'font-size': '16px',
            'pointer-events': 'none'
          }}>
            🔍
          </div>
        </div>
        
        {/* Status Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '6px',
          'flex-wrap': 'wrap'
        }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '6px 12px',
              'border-radius': '16px',
              border: statusFilter() === 'all' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: statusFilter() === 'all' ? 'var(--color-primary)08' : 'var(--color-background)',
              color: statusFilter() === 'all' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'all' ? '600' : '500',
              transition: 'all 0.2s ease'
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
              background: statusFilter() === 'not_available' ? 'var(--color-error)08' : 'var(--color-background)',
              color: statusFilter() === 'not_available' ? 'var(--color-error)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'not_available' ? '600' : '500',
              transition: 'all 0.2s ease'
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
              background: statusFilter() === 'revising' ? 'var(--color-warning)08' : 'var(--color-background)',
              color: statusFilter() === 'revising' ? 'var(--color-warning)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'revising' ? '600' : '500',
              transition: 'all 0.2s ease'
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
              background: statusFilter() === 'khatamat' ? 'var(--color-success)08' : 'var(--color-background)',
              color: statusFilter() === 'khatamat' ? 'var(--color-success)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              'font-size': '12px',
              'font-weight': statusFilter() === 'khatamat' ? '600' : '500',
              transition: 'all 0.2s ease'
            }}
          >
            ختمات
          </button>
        </div>

      </div>

      {/* Halaqat Lists */}
      <For each={halaqat}>
        {(halaqa) => {
          const students = getFilteredStudents(halaqa.id);
          return (
            <div style={{ 
              background: 'var(--color-surface)', 
              'border-radius': '15px', 
              padding: '20px', 
              'margin-bottom': '20px',
              border: '1px solid var(--color-border)' 
            }}>
              <h3 style={{ 
                color: 'var(--color-text)', 
                'margin-bottom': '15px',
                'font-size': '1.2rem'
              }}>
                {halaqa.name} ({halaqa.type})
              </h3>
              
              <Show when={students.length > 0} fallback={
                <p style={{ 
                  color: 'var(--color-text-secondary)', 
                  'text-align': 'center',
                  'font-style': 'italic'
                }}>
                  لا توجد طلاب متطابقون مع البحث
                </p>
              }>
                <For each={students}>
                  {(student) => {
                    const statusInfo = getStatusInfo(student.status);
                    const lastChanged = student.status_changed_at ? 
                      new Date(student.status_changed_at).toLocaleDateString('ar') : '';
                    const isFavorite = createMemo(() => favorites().includes(student.id));
                    
                    return (
                      <div style={{ 
                        background: 'var(--color-background)', 
                        'border-radius': '10px', 
                        padding: '15px', 
                        'margin-bottom': '10px',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        'justify-content': 'space-between',
                        'align-items': 'center'
                      }}>
                        <div style={{ flex: '1' }}>
                          <div style={{ 
                            display: 'flex',
                            'align-items': 'center',
                            gap: '10px',
                            'margin-bottom': '5px'
                          }}>
                            <span style={{ 
                              'font-weight': 'bold', 
                              color: 'var(--color-text)'
                            }}>
                              {student.name}
                            </span>
                            <button
                              onClick={() => toggleFavorite(student.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                'font-size': '1.2rem'
                              }}
                            >
                              {isFavorite() ? '⭐' : '☆'}
                            </button>
                          </div>
                          {lastChanged && (
                            <div style={{ 
                              color: 'var(--color-text-secondary)', 
                              'font-size': '0.85rem' 
                            }}>
                              آخر تحديث: {lastChanged}
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          padding: '6px 12px', 
                          'border-radius': '20px',
                          background: statusInfo.color,
                          color: 'white',
                          'font-size': '0.85rem',
                          'font-weight': 'bold',
                          display: 'flex',
                          'align-items': 'center',
                          gap: '5px'
                        }}>
                          {statusInfo.icon} {statusInfo.text}
                        </div>
                      </div>
                    );
                  }}
                </For>
              </Show>
            </div>
          );
        }}
      </For>
    </>
  );
}

// Leadership Dashboard Component (Leitung & Superuser)
function LeadershipDashboard(props: any) {
  const { data, app, role } = props;
  
  return (
    <>
      {/* Statistics Overview */}
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
            {data.totalUsers}
          </div>
          <div style={{ 
            color: 'var(--color-text-secondary)', 
            'font-size': '0.9rem' 
          }}>
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
            {data.totalTeachers}
          </div>
          <div style={{ 
            color: 'var(--color-text-secondary)', 
            'font-size': '0.9rem' 
          }}>
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
            {data.totalHalaqat}
          </div>
          <div style={{ 
            color: 'var(--color-text-secondary)', 
            'font-size': '0.9rem' 
          }}>
            إجمالي الحلقات
          </div>
        </div>

        <Show when={role === 'superuser'}>
          <div style={{ 
            background: 'var(--color-surface)', 
            padding: '20px', 
            'border-radius': '15px', 
            'text-align': 'center', 
            border: '1px solid var(--color-border)' 
          }}>
            <div style={{ 'font-size': '2rem', 'margin-bottom': '8px' }}>🟢</div>
            <div style={{ 
              'font-size': '1.8rem', 
              'font-weight': 'bold', 
              color: 'var(--color-success)',
              'margin-bottom': '5px'
            }}>
              {data.onlineUsers}
            </div>
            <div style={{ 
              color: 'var(--color-text-secondary)', 
              'font-size': '0.9rem' 
            }}>
              متصل الآن
            </div>
          </div>
        </Show>
      </div>

      {/* Student Status Overview */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '15px', 
        padding: '20px', 
        border: '1px solid var(--color-border)' 
      }}>
        <h3 style={{ 
          color: 'var(--color-text)', 
          'margin-bottom': '20px', 
          display: 'flex', 
          'align-items': 'center', 
          gap: '10px',
          'font-size': '1.3rem'
        }}>
          <span style={{ 'font-size': '1.5rem' }}>📊</span>
          إحصائيات حالات الطلاب
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
              {data.statusCounts.not_available}
            </div>
            <div style={{ 
              color: 'var(--color-text-secondary)', 
              'font-size': '0.9rem',
              'font-weight': '600'
            }}>
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
              {data.statusCounts.revising}
            </div>
            <div style={{ 
              color: 'var(--color-text-secondary)', 
              'font-size': '0.9rem',
              'font-weight': '600'
            }}>
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
              {data.statusCounts.khatamat}
            </div>
            <div style={{ 
              color: 'var(--color-text-secondary)', 
              'font-size': '0.9rem',
              'font-weight': '600'
            }}>
              ختمات
            </div>
          </div>
        </div>
      </div>
    </>
  );
}