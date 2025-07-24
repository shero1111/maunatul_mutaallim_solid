import { createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Student } from '../types';
import { getStatusColor } from '../styles/themes';

export function HomePage() {
  const app = useApp();
  
  // Computed statistics
  const stats = createMemo(() => {
    const users = app.users();
    const halaqat = app.halaqat();
    const students = users.filter(u => u.role === 'student') as Student[];
    const teachers = users.filter(u => u.role === 'lehrer');
    
    const statusCounts = {
      not_available: students.filter(s => s.status === 'not_available').length,
      revising: students.filter(s => s.status === 'revising').length,
      khatamat: students.filter(s => s.status === 'khatamat').length
    };
    
    return {
      totalUsers: users.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalHalaqat: halaqat.length,
      statusCounts
    };
  });

  return (
    <div style={{ padding: '20px' }}>
      {/* App Header with Logo - EXACT COPY FROM REACT */}
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
            لوحة التحكم الرئيسية
          </p>
        </div>
      </div>

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
            {stats().totalUsers}
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
            {stats().totalTeachers}
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
            {stats().totalHalaqat}
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
              {stats().statusCounts.not_available}
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
              {stats().statusCounts.revising}
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
              {stats().statusCounts.khatamat}
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
    </div>
  );
}