import { createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Student } from '../types';
import { getStatusColor } from '../styles/themes';

export function HomePage() {
  const app = useApp();
  
  // Debug: Log current page to check reactivity
  console.log('🏠 HomePage rendering, current page:', app.currentPage());
  
  // SIMPLIFIED DASHBOARD - Remove complex computations temporarily
  const currentUser = app.currentUser();
  if (!currentUser) return <div>Not logged in</div>;

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
            {currentUser.role === 'student' ? 'لوحة الطالب' : 'لوحة التحكم الرئيسية'}
          </p>
        </div>
      </div>

      {/* SIMPLIFIED DASHBOARD CONTENT */}
      <div style={{ 
        background: 'var(--color-surface)', 
        'border-radius': '15px', 
        padding: '20px', 
        'text-align': 'center',
        border: '1px solid var(--color-border)' 
      }}>
        <h3>مرحباً {currentUser.name}</h3>
        <p>الدور: {currentUser.role}</p>
        <p>هذه نسخة مبسطة لاختبار التنقل</p>
        <button 
          onClick={() => app.setCurrentPage('mutuun')}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            'border-radius': '8px',
            cursor: 'pointer',
            'margin-top': '10px'
          }}
        >
          انتقل إلى المتون
        </button>
      </div>
    </div>
  );
}