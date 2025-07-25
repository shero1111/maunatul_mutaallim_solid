import { createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function Login() {
  const [username, setUsername] = createSignal('student1');
  const [password, setPassword] = createSignal('test');
  const [error, setError] = createSignal('');
  const app = useApp();

  const handleLogin = (e?: SubmitEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔄 LOGIN ATTEMPT:', { 
      username: username(), 
      password: password(),
      usersCount: app.users().length
    });
    
    setError('');
    
    try {
      const success = app.login(username(), password());
      console.log('📝 Login result:', success);
      
      if (success) {
        console.log('✅ Login successful - user logged in:', app.currentUser()?.name);
      } else {
        const errorMsg = app.translate('invalidCredentials');
        setError(errorMsg);
        console.log('❌ Login failed - error set:', errorMsg);
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setError('Ein Fehler ist aufgetreten');
    }
  };

  const quickLogin = (user: string, pass: string) => {
    console.log('🚀 Quick login attempt:', user);
    setUsername(user);
    setPassword(pass);
    
    // Small delay to ensure state is updated, then login
    setTimeout(() => {
      handleLogin();
    }, 50);
  };

  return (
    <div style={{
      'min-height': '100vh',
      background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      padding: '20px',
      direction: app.language() === 'ar' ? 'rtl' : 'ltr'
    }}>
      <div style={{
        background: 'var(--color-background)',
        'border-radius': '20px',
        padding: '40px',
        'max-width': '400px',
        width: '100%',
        'box-shadow': '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          'text-align': 'center',
          'margin-bottom': '30px'
        }}>
          <h1 style={{
            color: 'var(--color-text)',
            'font-size': '1.8rem',
            'margin-bottom': '10px'
          }}>
            {app.translate('appName')}
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            'font-size': '14px'
          }}>
            نظام إدارة حلقات عَلٌمْنِي
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ 'margin-bottom': '20px' }}>
            <label style={{
              display: 'block',
              'margin-bottom': '8px',
              'font-weight': 'bold',
              color: 'var(--color-text)'
            }}>
              {app.translate('username')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username()}
                onInput={(e) => setUsername(e.currentTarget.value)}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  border: `1px solid var(--color-border)`,
                  'border-radius': '8px',
                  'font-size': '16px',
                  'background-color': 'var(--color-surface)',
                  color: 'var(--color-text)',
                  direction: 'ltr',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  'box-sizing': 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              />
              {username() && (
                <button
                  type="button"
                  onClick={() => setUsername('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    'font-size': '18px',
                    padding: '2px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div style={{ 'margin-bottom': '20px' }}>
            <label style={{
              display: 'block',
              'margin-bottom': '8px',
              'font-weight': 'bold',
              color: 'var(--color-text)'
            }}>
              {app.translate('password')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  border: `1px solid var(--color-border)`,
                  'border-radius': '8px',
                  'font-size': '16px',
                  'background-color': 'var(--color-surface)',
                  color: 'var(--color-text)',
                  direction: 'ltr',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  'box-sizing': 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
              />
              {password() && (
                <button
                  type="button"
                  onClick={() => setPassword('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    'font-size': '18px',
                    padding: '2px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {error() && (
            <div style={{
              color: 'var(--color-error)',
              'margin-bottom': '20px',
              'text-align': 'center',
              padding: '10px',
              'background-color': 'var(--color-surface)',
              'border-radius': '8px',
              border: `1px solid var(--color-error)`
            }}>
              {error()}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
              color: 'white',
              border: 'none',
              'border-radius': '8px',
              'font-size': '16px',
              'font-weight': 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              'margin-bottom': '20px'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {app.translate('login')}
          </button>
        </form>

        <div style={{
          'text-align': 'center',
          'font-size': '12px',
          color: 'var(--color-text-secondary)',
          padding: '15px',
          background: 'var(--color-surface)',
          'border-radius': '8px'
        }}>
          <p style={{ margin: '0 0 10px' }}>
            حسابات التجربة:
          </p>
          <div style={{
            display: 'grid',
            gap: '5px',
            'font-size': '11px'
          }}>
            <span>👑 admin/test (مدير عام)</span>
            <span>🏛️ leiter/test (قائد)</span>
            <span>👨‍🏫 lehrer/test (معلم)</span>
            <span>👨‍🎓 student1/test (طالب)</span>
            <span>👨‍🎓 student2/test (طالب)</span>
          </div>

          {/* QUICK LOGIN BUTTONS */}
          <div style={{
            'margin-top': '15px',
            'border-top': '1px solid var(--color-border)',
            'padding-top': '15px'
          }}>
            <div style={{
              'font-weight': 'bold',
              'margin-bottom': '10px',
              'font-size': '12px'
            }}>
              🚀 Quick Login:
            </div>
            <div style={{
              display: 'grid',
              'grid-template-columns': '1fr 1fr',
              gap: '8px'
            }}>
              <button
                type="button"
                onMouseDown={(e) => {
                  // Prevent double-click issue by handling on mousedown
                  e.preventDefault();
                  e.stopPropagation();
                  quickLogin('admin', 'test');
                }}
                style={{
                  padding: '8px',
                  'font-size': '10px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  'border-radius': '6px',
                  cursor: 'pointer'
                }}
              >
                👑 Admin
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  // Prevent double-click issue by handling on mousedown
                  e.preventDefault();
                  e.stopPropagation();
                  quickLogin('leiter', 'test');
                }}
                style={{
                  padding: '8px',
                  'font-size': '10px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  'border-radius': '6px',
                  cursor: 'pointer'
                }}
              >
                🏛️ Leiter
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  // Prevent double-click issue by handling on mousedown
                  e.preventDefault();
                  e.stopPropagation();
                  quickLogin('lehrer', 'test');
                }}
                style={{
                  padding: '8px',
                  'font-size': '10px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  'border-radius': '6px',
                  cursor: 'pointer'
                }}
              >
                👨‍🏫 Lehrer
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  // Prevent double-click issue by handling on mousedown
                  e.preventDefault();
                  e.stopPropagation();
                  quickLogin('student1', 'test');
                }}
                style={{
                  padding: '8px',
                  'font-size': '10px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  'border-radius': '6px',
                  cursor: 'pointer'
                }}
              >
                👨‍🎓 Student1
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}