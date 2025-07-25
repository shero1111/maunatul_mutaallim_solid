import { createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Student } from '../types';
import { getStatusColor } from '../styles/themes';

export function HomePage() {
  const app = useApp();
  
  // Debug: Log current page to check reactivity
  console.log('🏠 HomePage rendering, current page:', app.currentPage());
  
  // Role-based computed data
  const dashboardData = createMemo(() => {
    try {
      const currentUser = app.currentUser();
      if (!currentUser) return null;
      
      if (currentUser.role === 'student') {
        // Student Dashboard Data
        const studentData = currentUser as Student;
        const userHalaqat = app.halaqat()?.filter(h => h.student_ids?.includes(currentUser.id)) || [];
        const mutunData = app.mutun?.() || [];
        const recentNews = app.news()?.slice(0, 3) || []; // Last 3 news items
        
        return {
          type: 'student',
          personalStatus: studentData.status || 'not_available',
          halaqatCount: userHalaqat.length,
          activeHalaqat: userHalaqat.filter(h => h.status === 'active').length,
          totalMutun: mutunData.length,
          completedMutun: mutunData.filter(m => m.status === 'completed').length,
          inProgressMutun: mutunData.filter(m => m.status === 'in_progress').length,
          recentNews,
          userHalaqat
        };
      } else {
        // Admin/Teacher Dashboard Data
        const users = app.users() || [];
        const halaqat = app.halaqat() || [];
        const students = users.filter(u => u.role === 'student') as Student[];
        const teachers = users.filter(u => u.role === 'lehrer');
        
        const statusCounts = {
          not_available: students.filter(s => s.status === 'not_available').length,
          revising: students.filter(s => s.status === 'revising').length,
          khatamat: students.filter(s => s.status === 'khatamat').length
        };
        
        return {
          type: 'admin',
          totalUsers: users.length,
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalHalaqat: halaqat.length,
          statusCounts
        };
      }
    } catch (error) {
      console.error('Error in dashboardData:', error);
      return {
        type: 'error',
        message: 'Loading error'
      };
    }
  });

  const data = dashboardData();
  if (!data) return <div>Loading...</div>;
  if (data.type === 'error') return <div>Error loading dashboard. Please refresh.</div>;

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
            مرحباً، {app.currentUser()?.name}
          </h2>
          <p style={{ 
            color: 'var(--color-text-secondary)', 
            'font-size': '1rem' 
          }}>
            {data.type === 'student' ? 'لوحة الطالب' : 'لوحة التحكم الرئيسية'}
          </p>
        </div>
      </div>

      {/* Role-based Dashboard Content */}
      <Show when={data.type === 'student'}>
        {/* STUDENT DASHBOARD */}
        <StudentDashboard data={data} app={app} />
      </Show>

      <Show when={data.type === 'admin'}>
        {/* ADMIN/TEACHER DASHBOARD */}
        <AdminDashboard data={data} />
      </Show>
    </div>
  );
}

// Student Dashboard Component
function StudentDashboard(props: { data: any; app: any }) {
  const { data, app } = props;
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_available':
        return { color: 'var(--color-error)', icon: '🔴', text: 'غير متاح' };
      case 'revising':
        return { color: 'var(--color-warning)', icon: '🟡', text: 'يراجع' };
      case 'khatamat':
        return { color: 'var(--color-success)', icon: '🟢', text: 'ختمات' };
      default:
        return { color: 'var(--color-text)', icon: '⚪', text: 'غير محدد' };
    }
  };
  
  const statusInfo = getStatusInfo(data.personalStatus);
  
  return (
    <>
      {/* Personal Status Card */}
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
          color: statusInfo.color, 
          'margin-bottom': '5px',
          'font-size': '1.5rem',
          'font-weight': 'bold'
        }}>
          حالتك الحالية
        </h3>
        <p style={{ 
          color: statusInfo.color, 
          'font-size': '1.2rem',
          'font-weight': '600'
        }}>
          {statusInfo.text}
        </p>
      </div>

      {/* Student Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        'grid-template-columns': 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '15px', 
        'margin-bottom': '20px' 
      }}>
        <div style={{ 
          background: 'var(--color-surface)', 
          padding: '15px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          border: '1px solid var(--color-border)' 
        }}>
          <div style={{ 'font-size': '1.8rem', 'margin-bottom': '5px' }}>🔵</div>
          <div style={{ 
            'font-size': '1.3rem', 
            'font-weight': 'bold', 
            color: 'var(--color-primary)' 
          }}>
            {data.halaqatCount}
          </div>
          <div style={{ 
            color: 'var(--color-text-secondary)', 
            'font-size': '0.85rem' 
          }}>
            حلقاتي
          </div>
        </div>

        <div style={{ 
          background: 'var(--color-surface)', 
          padding: '15px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          border: '1px solid var(--color-border)' 
        }}>
          <div style={{ 'font-size': '1.8rem', 'margin-bottom': '5px' }}>✅</div>
          <div style={{ 
            'font-size': '1.3rem', 
            'font-weight': 'bold', 
            color: 'var(--color-success)' 
          }}>
            {data.activeHalaqat}
          </div>
          <div style={{ 
            color: 'var(--color-text-secondary)', 
            'font-size': '0.85rem' 
          }}>
            نشطة
          </div>
        </div>

        <div style={{ 
          background: 'var(--color-surface)', 
          padding: '15px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          border: '1px solid var(--color-border)' 
        }}>
          <div style={{ 'font-size': '1.8rem', 'margin-bottom': '5px' }}>📚</div>
          <div style={{ 
            'font-size': '1.3rem', 
            'font-weight': 'bold', 
            color: 'var(--color-secondary)' 
          }}>
            {data.completedMutun}
          </div>
          <div style={{ 
            color: 'var(--color-text-secondary)', 
            'font-size': '0.85rem' 
          }}>
            مكتملة
          </div>
        </div>

        <div style={{ 
          background: 'var(--color-surface)', 
          padding: '15px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          border: '1px solid var(--color-border)' 
        }}>
          <div style={{ 'font-size': '1.8rem', 'margin-bottom': '5px' }}>📖</div>
          <div style={{ 
            'font-size': '1.3rem', 
            'font-weight': 'bold', 
            color: 'var(--color-warning)' 
          }}>
            {data.inProgressMutun}
          </div>
          <div style={{ 
            color: 'var(--color-text-secondary)', 
            'font-size': '0.85rem' 
          }}>
            قيد الدراسة
          </div>
        </div>
      </div>

      {/* My Halaqat */}
      <Show when={data.userHalaqat.length > 0}>
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
            display: 'flex', 
            'align-items': 'center', 
            gap: '10px' 
          }}>
            <span style={{ 'font-size': '1.5rem' }}>🔵</span>
            حلقاتي
          </h3>
          <For each={data.userHalaqat.slice(0, 3)}>
            {(halaqa) => (
              <div style={{ 
                background: 'var(--color-background)', 
                'border-radius': '10px', 
                padding: '12px', 
                'margin-bottom': '10px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                'justify-content': 'space-between',
                'align-items': 'center'
              }}>
                <div>
                  <div style={{ 
                    'font-weight': 'bold', 
                    color: 'var(--color-text)',
                    'margin-bottom': '4px'
                  }}>
                    {halaqa.name}
                  </div>
                  <div style={{ 
                    color: 'var(--color-text-secondary)', 
                    'font-size': '0.85rem' 
                  }}>
                    {halaqa.type} • {app.users().find(u => u.id === halaqa.teacher_id)?.name}
                  </div>
                </div>
                <div style={{ 
                  padding: '4px 8px', 
                  'border-radius': '6px',
                  background: halaqa.status === 'active' ? 'var(--color-success)' : 'var(--color-error)',
                  color: 'white',
                  'font-size': '0.75rem',
                  'font-weight': 'bold'
                }}>
                  {halaqa.status === 'active' ? 'نشط' : 'غير نشط'}
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Recent News */}
      <Show when={data.recentNews.length > 0}>
        <div style={{ 
          background: 'var(--color-surface)', 
          'border-radius': '15px', 
          padding: '20px', 
          border: '1px solid var(--color-border)' 
        }}>
          <h3 style={{ 
            color: 'var(--color-text)', 
            'margin-bottom': '15px', 
            display: 'flex', 
            'align-items': 'center', 
            gap: '10px' 
          }}>
            <span style={{ 'font-size': '1.5rem' }}>📰</span>
            آخر الأخبار
          </h3>
          <For each={data.recentNews}>
            {(news) => (
              <div style={{ 
                background: 'var(--color-background)', 
                'border-radius': '10px', 
                padding: '12px', 
                'margin-bottom': '10px',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ 
                  'font-weight': 'bold', 
                  color: 'var(--color-text)',
                  'margin-bottom': '5px'
                }}>
                  {news.title}
                </div>
                <div style={{ 
                  color: 'var(--color-text-secondary)', 
                  'font-size': '0.85rem',
                  'line-height': '1.4'
                }}>
                  {news.content.substring(0, 100)}...
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </>
  );
}

// Admin Dashboard Component
function AdminDashboard(props: { data: any }) {
  const { data } = props;
  
  return (
    <>
      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        'grid-template-columns': 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px', 
        'margin-bottom': '30px' 
      }}>
        <div style={{ 
          background: 'var(--color-surface)', 
          padding: '20px', 
          'border-radius': '15px', 
          'text-align': 'center', 
          border: '1px solid var(--color-border)' 
        }}>
          <div style={{ 'font-size': '2rem', 'margin-bottom': '5px' }}>👥</div>
          <div style={{ 
            'font-size': '1.5rem', 
            'font-weight': 'bold', 
            color: 'var(--color-primary)' 
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
          <div style={{ 'font-size': '2rem', 'margin-bottom': '5px' }}>👨‍🏫</div>
          <div style={{ 
            'font-size': '1.5rem', 
            'font-weight': 'bold', 
            color: 'var(--color-secondary)' 
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
          <div style={{ 'font-size': '2rem', 'margin-bottom': '5px' }}>🔵</div>
          <div style={{ 
            'font-size': '1.5rem', 
            'font-weight': 'bold', 
            color: 'var(--color-primary)' 
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
      </div>

      {/* Students Status Overview */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '15px', 
        padding: '20px', 
        border: '1px solid var(--color-border)' 
      }}>
        <h3 style={{ 
          color: 'var(--color-text)', 
          'margin-bottom': '15px', 
          display: 'flex', 
          'align-items': 'center', 
          gap: '10px' 
        }}>
          <span style={{ 'font-size': '1.5rem' }}>📈</span>
          حالات الطلاب
        </h3>
        <div style={{ 
          display: 'grid', 
          'grid-template-columns': 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '15px' 
        }}>
          <div style={{ 
            'text-align': 'center', 
            padding: '15px', 
            background: 'var(--color-background)', 
            'border-radius': '10px', 
            border: '2px solid var(--color-error)' 
          }}>
            <div style={{ 'font-size': '1.5rem', 'margin-bottom': '5px' }}>🔴</div>
            <div style={{ 
              'font-size': '1.2rem', 
              'font-weight': 'bold', 
              color: 'var(--color-error)' 
            }}>
              {data.statusCounts.not_available}
            </div>
            <div style={{ 
              color: 'var(--color-text-secondary)', 
              'font-size': '0.8rem' 
            }}>
              غير متاح
            </div>
          </div>

          <div style={{ 
            'text-align': 'center', 
            padding: '15px', 
            background: 'var(--color-background)', 
            'border-radius': '10px', 
            border: '2px solid var(--color-warning)' 
          }}>
            <div style={{ 'font-size': '1.5rem', 'margin-bottom': '5px' }}>🟡</div>
            <div style={{ 
              'font-size': '1.2rem', 
              'font-weight': 'bold', 
              color: 'var(--color-warning)' 
            }}>
              {data.statusCounts.revising}
            </div>
            <div style={{ 
              color: 'var(--color-text-secondary)', 
              'font-size': '0.8rem' 
            }}>
              يراجع
            </div>
          </div>

          <div style={{ 
            'text-align': 'center', 
            padding: '15px', 
            background: 'var(--color-background)', 
            'border-radius': '10px', 
            border: '2px solid var(--color-success)' 
          }}>
            <div style={{ 'font-size': '1.5rem', 'margin-bottom': '5px' }}>🟢</div>
            <div style={{ 
              'font-size': '1.2rem', 
              'font-weight': 'bold', 
              color: 'var(--color-success)' 
            }}>
              {data.statusCounts.khatamat}
            </div>
            <div style={{ 
              color: 'var(--color-text-secondary)', 
              'font-size': '0.8rem' 
            }}>
              ختمات
            </div>
          </div>
        </div>
      </div>
    </>
  );
}