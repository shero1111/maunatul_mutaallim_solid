import { createMemo, For, Show, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Student, User, Matn } from '../types';

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
        <TeacherDashboard user={user} />
      </Show>

      <Show when={user.role === 'leitung' || user.role === 'superuser'}>
        <LeadershipDashboard />
      </Show>
    </div>
  );
}

// Simple Student Dashboard Component
function StudentDashboard(props: { user: Student }) {
  const app = useApp();
  const { user } = props;
  
  // Get user's personal mutun
  const userMutun = createMemo(() => 
    app.mutun().filter(matn => matn.user_id === user.id)
  );
  
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
  
  const statusInfo = createMemo(() => getStatusInfo(user?.status || 'not_available'));
  
  const changeStatus = (newStatus: string) => {
    const updatedUser = {
      ...user,
      status: newStatus,
      status_changed_at: new Date().toISOString()
    };
    app.updateUser(updatedUser);
  };
  
  const updateMatnProgress = (matn: Matn, field: string, value: number) => {
    const updatedMatn = { ...matn, [field]: value };
    app.updateMatn(updatedMatn);
  };

  return (
    <div>
      {/* Student Info Card */}
      <div style={{ 
        background: 'white', 
        'border-radius': '12px', 
        padding: '20px', 
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        gap: '20px'
      }}>
        <div style={{ flex: '1' }}>
          <h3 style={{ 
            color: '#1f2937', 
            'margin-bottom': '10px',
            'font-size': '1.3rem',
            'font-weight': '600'
          }}>
            مرحباً {user?.name}
          </h3>
          
          <div style={{
            display: 'inline-flex',
            'align-items': 'center',
            background: statusInfo().color,
            color: 'white',
            padding: '6px 16px',
            'border-radius': '20px',
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
              background: user?.status === "not_available" ? "#ef4444" : "#f3f4f6",
              color: user?.status === "not_available" ? "white" : "#6b7280",
              border: "none",
              padding: "8px 16px",
              "border-radius": "20px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease"
            }}
          >
            غير متاح
          </button>
          
          <button
            onClick={() => changeStatus("revising")}
            style={{
              background: user?.status === "revising" ? "#f59e0b" : "#f3f4f6",
              color: user?.status === "revising" ? "white" : "#6b7280",
              border: "none",
              padding: "8px 16px",
              "border-radius": "20px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease"
            }}
          >
            مراجعة
          </button>
          
          <button
            onClick={() => changeStatus("khatamat")}
            style={{
              background: user?.status === "khatamat" ? "#10b981" : "#f3f4f6",
              color: user?.status === "khatamat" ? "white" : "#6b7280",
              border: "none",
              padding: "8px 16px",
              "border-radius": "20px",
              cursor: "pointer",
              "font-size": "0.85rem",
              "font-weight": "500",
              transition: "all 0.2s ease"
            }}
          >
            ختمات
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div style={{
        background: 'white',
        'border-radius': '12px',
        padding: '20px',
        'margin-bottom': '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          color: '#1f2937',
          'margin-bottom': '15px',
          'font-size': '1.1rem',
          'font-weight': '600'
        }}>
          📊 نظرة عامة على التقدم
        </h3>
        
        <div style={{
          display: 'grid',
          'grid-template-columns': 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          <div style={{
            'text-align': 'center',
            padding: '15px',
            background: '#f8fafc',
            'border-radius': '8px',
            border: '2px solid #e2e8f0'
          }}>
            <div style={{ 'font-size': '2rem', 'margin-bottom': '5px' }}>📚</div>
            <div style={{
              'font-size': '1.5rem',
              'font-weight': 'bold',
              color: '#2563eb',
              'margin-bottom': '5px'
            }}>
              {userMutun().length}
            </div>
            <div style={{ color: '#64748b', 'font-size': '0.85rem' }}>
              إجمالي المتون
            </div>
          </div>
          
          <div style={{
            'text-align': 'center',
            padding: '15px',
            background: '#f0fdf4',
            'border-radius': '8px',
            border: '2px solid #22c55e'
          }}>
            <div style={{ 'font-size': '2rem', 'margin-bottom': '5px' }}>✅</div>
            <div style={{
              'font-size': '1.5rem',
              'font-weight': 'bold',
              color: '#16a34a',
              'margin-bottom': '5px'
            }}>
              {userMutun().filter(m => m.memorization_progress === 100).length}
            </div>
            <div style={{ color: '#64748b', 'font-size': '0.85rem' }}>
              مكتملة الحفظ
            </div>
          </div>
        </div>
      </div>

      {/* Mutun List */}
      <div style={{
        background: 'white',
        'border-radius': '12px',
        padding: '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          color: '#1f2937',
          'margin-bottom': '20px',
          'font-size': '1.1rem',
          'font-weight': '600'
        }}>
          📖 متونك الشخصية
        </h3>
        
        <Show when={userMutun().length === 0}>
          <div style={{
            'text-align': 'center',
            padding: '40px 20px',
            color: '#64748b'
          }}>
            <div style={{ 'font-size': '3rem', 'margin-bottom': '10px' }}>📚</div>
            <p>لا توجد متون مخصصة لك بعد</p>
          </div>
        </Show>
        
        <For each={userMutun()}>
          {(matn) => (
            <div style={{
              border: '1px solid #e5e7eb',
              'border-radius': '8px',
              padding: '15px',
              'margin-bottom': '15px',
              background: '#fafafa'
            }}>
              <h4 style={{
                color: '#1f2937',
                'margin-bottom': '10px',
                'font-size': '1rem',
                'font-weight': '600'
              }}>
                {matn.title}
              </h4>
              
              {/* Progress Bars */}
              <div style={{ 'margin-bottom': '10px' }}>
                <div style={{
                  display: 'flex',
                  'justify-content': 'space-between',
                  'align-items': 'center',
                  'margin-bottom': '5px'
                }}>
                  <span style={{ 'font-size': '0.85rem', color: '#64748b' }}>
                    الحفظ
                  </span>
                  <span style={{ 'font-size': '0.85rem', color: '#1f2937', 'font-weight': '600' }}>
                    {matn.memorization_progress || 0}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  'border-radius': '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${matn.memorization_progress || 0}%`,
                    height: '100%',
                    background: '#10b981',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
              
              <div style={{ 'margin-bottom': '15px' }}>
                <div style={{
                  display: 'flex',
                  'justify-content': 'space-between',
                  'align-items': 'center',
                  'margin-bottom': '5px'
                }}>
                  <span style={{ 'font-size': '0.85rem', color: '#64748b' }}>
                    المراجعة
                  </span>
                  <span style={{ 'font-size': '0.85rem', color: '#1f2937', 'font-weight': '600' }}>
                    {matn.review_progress || 0}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  'border-radius': '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${matn.review_progress || 0}%`,
                    height: '100%',
                    background: '#f59e0b',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
              
              {/* Progress Update Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px',
                'flex-wrap': 'wrap'
              }}>
                <button
                  onClick={() => updateMatnProgress(matn, 'memorization_progress', Math.min(100, (matn.memorization_progress || 0) + 10))}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    'border-radius': '6px',
                    cursor: 'pointer',
                    'font-size': '0.8rem'
                  }}
                >
                  +10% حفظ
                </button>
                <button
                  onClick={() => updateMatnProgress(matn, 'review_progress', Math.min(100, (matn.review_progress || 0) + 10))}
                  style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    'border-radius': '6px',
                    cursor: 'pointer',
                    'font-size': '0.8rem'
                  }}
                >
                  +10% مراجعة
                </button>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

// Simple Teacher Dashboard Component
function TeacherDashboard(props: { user: User }) {
  const app = useApp();
  
  return (
    <div style={{
      background: 'white',
      'border-radius': '12px',
      padding: '20px',
      'box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#1f2937', 'margin-bottom': '10px' }}>
        👨‍🏫 لوحة تحكم المعلم
      </h2>
      <p style={{ color: '#64748b' }}>
        مرحباً {props.user.name}، ستتوفر وظائف المعلم قريباً...
      </p>
    </div>
  );
}

// Simple Leadership Dashboard Component
function LeadershipDashboard() {
  const app = useApp();
  
  const users = app.users();
  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'lehrer');
  
  return (
    <div>
      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        'grid-template-columns': 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        'margin-bottom': '20px' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ 'font-size': '2.5rem', 'margin-bottom': '10px' }}>👥</div>
          <div style={{ 
            'font-size': '2rem', 
            'font-weight': 'bold', 
            color: '#2563eb',
            'margin-bottom': '5px'
          }}>
            {users.length}
          </div>
          <div style={{ color: '#64748b', 'font-size': '0.9rem' }}>
            إجمالي المستخدمين
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '25px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ 'font-size': '2.5rem', 'margin-bottom': '10px' }}>👨‍🎓</div>
          <div style={{ 
            'font-size': '2rem', 
            'font-weight': 'bold', 
            color: '#10b981',
            'margin-bottom': '5px'
          }}>
            {students.length}
          </div>
          <div style={{ color: '#64748b', 'font-size': '0.9rem' }}>
            الطلاب
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '25px', 
          'border-radius': '12px', 
          'text-align': 'center', 
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ 'font-size': '2.5rem', 'margin-bottom': '10px' }}>👨‍🏫</div>
          <div style={{ 
            'font-size': '2rem', 
            'font-weight': 'bold', 
            color: '#f59e0b',
            'margin-bottom': '5px'
          }}>
            {teachers.length}
          </div>
          <div style={{ color: '#64748b', 'font-size': '0.9rem' }}>
            المعلمين
          </div>
        </div>
      </div>

      <div style={{
        background: 'white',
        'border-radius': '12px',
        padding: '20px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#1f2937', 'margin-bottom': '10px' }}>
          📊 لوحة تحكم الإدارة
        </h3>
        <p style={{ color: '#64748b' }}>
          ستتوفر تقارير مفصلة وإحصائيات شاملة قريباً...
        </p>
      </div>
    </div>
  );
}