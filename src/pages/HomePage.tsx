import { createMemo, For, Show, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Student, User } from '../types';
import { getStatusColor } from '../styles/themes';

export function HomePage() {
  const app = useApp();
  
  const currentUser = app.currentUser();
  if (!currentUser) return <div>Not logged in</div>;
  
  // Student-specific signals for search and filter
  const [searchTerm, setSearchTerm] = createSignal('');
  const [statusFilter, setStatusFilter] = createSignal<string>('all');
  const [favorites, setFavorites] = createSignal<string[]>([]);
  
  // Role-based dashboard data
  const dashboardData = createMemo(() => {
    const users = app.users();
    const halaqat = app.halaqat();
    
    switch (currentUser.role) {
      case 'student':
        const studentData = currentUser as Student;
        const userHalaqat = halaqat.filter(h => h.student_ids?.includes(currentUser.id));
        return {
          type: 'student',
          data: { student: studentData, halaqat: userHalaqat, allUsers: users }
        };
        
      case 'lehrer':
        const teacherHalaqat = halaqat.filter(h => h.teacher_id === currentUser.id);
        return {
          type: 'teacher',
          data: { halaqat: teacherHalaqat, allUsers: users }
        };
        
      case 'leitung':
      case 'superuser':
        const students = users.filter(u => u.role === 'student') as Student[];
        const teachers = users.filter(u => u.role === 'lehrer');
        const onlineUsers = users.filter(u => u.isOnline || false); // TODO: implement online status
        
        const statusCounts = {
          not_available: students.filter(s => s.status === 'not_available').length,
          revising: students.filter(s => s.status === 'revising').length,
          khatamat: students.filter(s => s.status === 'khatamat').length
        };
        
        return {
          type: currentUser.role,
          data: {
            totalUsers: users.length,
            totalStudents: students.length,
            totalTeachers: teachers.length,
            totalHalaqat: halaqat.length,
            onlineUsers: onlineUsers.length,
            statusCounts
          }
        };
        
      default:
        return { type: 'unknown', data: {} };
    }
  });

  const data = dashboardData();
  
  return (
    <div style={{ 
      padding: '20px 20px 100px 20px' // Extra 100px bottom padding für BottomBar
    }}>
      {/* App Header with Logo */}
      <div style={{ 'text-align': 'center', 'margin-bottom': '20px' }}>
        <div style={{ 
          display: 'flex', 
          'align-items': 'center', 
          'justify-content': 'center', 
          gap: '15px', 
          'margin-bottom': '20px' 
        }}>
          <img 
            src="/logo.jpg" 
            alt="معونة المتعلم"
            style={{ 
              width: '60px', 
              height: '60px', 
              'border-radius': '16px',
              'object-fit': 'cover',
              'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
              border: '2px solid var(--color-primary)20'
            }} 
          />
          <div>
            <h1 style={{ 
              color: 'var(--color-primary)', 
              'font-size': '1.8rem', 
              margin: '0 0 4px 0', 
              'font-weight': '700' 
            }}>
              معونة المتعلم
            </h1>
            <p style={{ 
              color: 'var(--color-text-secondary)', 
              'font-size': '0.9rem', 
              margin: '0' 
            }}>
              نظام إدارة التعلم الإسلامي
            </p>
          </div>
        </div>
        <div>
          <h2 style={{ 
            color: 'var(--color-text)', 
            'font-size': '1.4rem', 
            'margin-bottom': '8px' 
          }}>
            {app.translate('welcome')}, {currentUser.name}
          </h2>
        </div>
      </div>

      {/* Role-based Dashboard Content */}
      <Show when={data.type === 'student'}>
        <StudentDashboard 
          data={data.data} 
          app={app}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          favorites={favorites}
          setFavorites={setFavorites}
        />
      </Show>

      <Show when={data.type === 'lehrer'}>
        <TeacherDashboard 
          data={data.data} 
          app={app}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          favorites={favorites}
          setFavorites={setFavorites}
        />
      </Show>

      <Show when={data.type === 'leitung' || data.type === 'superuser'}>
        <LeadershipDashboard data={data.data} app={app} role={data.type} />
      </Show>
    </div>
  );
}

// Student Dashboard Component
function StudentDashboard(props: any) {
  const { data, app, searchTerm, setSearchTerm, statusFilter, setStatusFilter, favorites, setFavorites } = props;
  const { student, halaqat, allUsers } = data;
  
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
  
  const statusInfo = getStatusInfo(student.status);
  const lastChanged = student.lastStatusChange ? new Date(student.lastStatusChange).toLocaleDateString('ar') : '';
  
  const changeStatus = (newStatus: string) => {
    const updatedStudent = {
      ...student,
      status: newStatus,
      lastStatusChange: new Date().toISOString()
    };
    app.updateUser(updatedStudent);
  };
  
  const toggleFavorite = (userId: string) => {
    const current = favorites();
    if (current.includes(userId)) {
      setFavorites(current.filter(id => id !== userId));
    } else {
      setFavorites([...current, userId]);
    }
  };
  
  const getFilteredStudents = (halaqaId: string) => {
    const halaqa = halaqat.find(h => h.id === halaqaId);
    if (!halaqa) return [];
    
    let students = halaqa.student_ids
      .map(id => allUsers.find(u => u.id === id))
      .filter(u => u && u.id !== student.id && u.isActive !== false) as Student[];
    
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
      {/* Student Info Card */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '15px', 
        padding: '20px', 
        'margin-bottom': '20px',
        border: `2px solid ${statusInfo.color}`,
        'text-align': 'center'
      }}>
        <div style={{ 'font-size': '3rem', 'margin-bottom': '10px' }}>{statusInfo.icon}</div>
        <h3 style={{ 
          color: 'var(--color-text)', 
          'margin-bottom': '5px',
          'font-size': '1.3rem'
        }}>
          {student.name}
        </h3>
        <p style={{ 
          color: statusInfo.color, 
          'font-size': '1.1rem',
          'font-weight': '600',
          'margin-bottom': '5px'
        }}>
          {statusInfo.text}
        </p>
        {lastChanged && (
          <p style={{ 
            color: 'var(--color-text-secondary)', 
            'font-size': '0.9rem',
            'margin-bottom': '15px'
          }}>
            آخر تحديث: {lastChanged}
          </p>
        )}
        
        <hr style={{ 
          border: 'none', 
          height: '1px', 
          background: 'var(--color-border)', 
          margin: '15px 0' 
        }} />
        
        <p style={{ 
          color: 'var(--color-text)', 
          'margin-bottom': '10px',
          'font-weight': '600'
        }}>
          تغيير الحالة
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          'justify-content': 'center' 
        }}>
          <button
            onClick={() => changeStatus('not_available')}
            style={{
              background: student.status === 'not_available' ? 'var(--color-error)' : 'var(--color-surface)',
              color: student.status === 'not_available' ? 'white' : 'var(--color-error)',
              border: '2px solid var(--color-error)',
              padding: '8px 16px',
              'border-radius': '8px',
              cursor: 'pointer',
              'font-weight': '600',
              'font-size': '0.9rem'
            }}
          >
            🔴 غير متاح
          </button>
          <button
            onClick={() => changeStatus('revising')}
            style={{
              background: student.status === 'revising' ? 'var(--color-warning)' : 'var(--color-surface)',
              color: student.status === 'revising' ? 'white' : 'var(--color-warning)',
              border: '2px solid var(--color-warning)',
              padding: '8px 16px',
              'border-radius': '8px',
              cursor: 'pointer',
              'font-weight': '600',
              'font-size': '0.9rem'
            }}
          >
            🟡 مراجعة
          </button>
          <button
            onClick={() => changeStatus('khatamat')}
            style={{
              background: student.status === 'khatamat' ? 'var(--color-success)' : 'var(--color-surface)',
              color: student.status === 'khatamat' ? 'white' : 'var(--color-success)',
              border: '2px solid var(--color-success)',
              padding: '8px 16px',
              'border-radius': '8px',
              cursor: 'pointer',
              'font-weight': '600',
              'font-size': '0.9rem'
            }}
          >
            🟢 ختمات
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '12px', 
        padding: '15px', 
        'margin-bottom': '20px',
        border: '1px solid var(--color-border)'
      }}>
        <input
          type="text"
          placeholder="البحث عن طالب..."
          value={searchTerm()}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          style={{
            width: '100%',
            padding: '10px',
            'border-radius': '8px',
            border: '1px solid var(--color-border)',
            'margin-bottom': '10px',
            'font-size': '16px'
          }}
        />
        <select
          value={statusFilter()}
          onChange={(e) => setStatusFilter(e.currentTarget.value)}
          style={{
            width: '100%',
            padding: '10px',
            'border-radius': '8px',
            border: '1px solid var(--color-border)',
            'font-size': '16px'
          }}
        >
          <option value="all">جميع الحالات</option>
          <option value="not_available">غير متاح</option>
          <option value="revising">مراجعة</option>
          <option value="khatamat">ختمات</option>
        </select>
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
                    const otherLastChanged = otherStudent.lastStatusChange ? 
                      new Date(otherStudent.lastStatusChange).toLocaleDateString('ar') : '';
                    const isFavorite = favorites().includes(otherStudent.id);
                    
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
                              {isFavorite ? '⭐' : '☆'}
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
    const current = favorites();
    if (current.includes(userId)) {
      setFavorites(current.filter(id => id !== userId));
    } else {
      setFavorites([...current, userId]);
    }
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
        padding: '15px', 
        'margin-bottom': '20px',
        border: '1px solid var(--color-border)'
      }}>
        <input
          type="text"
          placeholder="البحث عن طالب..."
          value={searchTerm()}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          style={{
            width: '100%',
            padding: '10px',
            'border-radius': '8px',
            border: '1px solid var(--color-border)',
            'margin-bottom': '10px',
            'font-size': '16px'
          }}
        />
        <select
          value={statusFilter()}
          onChange={(e) => setStatusFilter(e.currentTarget.value)}
          style={{
            width: '100%',
            padding: '10px',
            'border-radius': '8px',
            border: '1px solid var(--color-border)',
            'font-size': '16px'
          }}
        >
          <option value="all">جميع الحالات</option>
          <option value="not_available">غير متاح</option>
          <option value="revising">مراجعة</option>
          <option value="khatamat">ختمات</option>
        </select>
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
                    const lastChanged = student.lastStatusChange ? 
                      new Date(student.lastStatusChange).toLocaleDateString('ar') : '';
                    const isFavorite = favorites().includes(student.id);
                    
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
                              {isFavorite ? '⭐' : '☆'}
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