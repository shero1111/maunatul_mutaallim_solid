import { createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function Login() {
  const [username, setUsername] = createSignal('student1');
  const [password, setPassword] = createSignal('test');
  const [error, setError] = createSignal('');
  const [isLogging, setIsLogging] = createSignal(false);
  const app = useApp();

  const handleLogin = async (e?: SubmitEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isLogging()) {
      console.log('⏳ Login already in progress...');
      return;
    }
    
    setIsLogging(true);
    setError('');
    
    console.log('🔄 LOGIN ATTEMPT:', { 
      username: username(), 
      password: password(),
      usersCount: app.users().length
    });
    
    try {
      // Force a small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const success = app.login(username(), password());
      console.log('📝 Login result:', success);
      
      if (success) {
        console.log('✅ Login successful - user logged in:', app.currentUser()?.name);
        
        // Force page to home after successful login
        app.setCurrentPage('home');
        
        // Force immediate re-render
        setTimeout(() => {
          console.log('🔄 Forcing app re-render...');
          // Force the entire app to re-evaluate
          window.location.hash = '#refresh';
          window.location.hash = '';
        }, 100);
        
      } else {
        const errorMsg = app.translate('invalidCredentials');
        setError(errorMsg);
        console.log('❌ Login failed - error set:', errorMsg);
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setIsLogging(false);
    }
  };

  const quickLogin = async (user: string, pass: string) => {
    console.log('🚀 Quick login attempt:', user);
    
    // SUPER ROBUST: Set values and wait longer
    setUsername(user);
    setPassword(pass);
    
    // Longer delay to ensure state is 100% updated
    await new Promise(resolve => setTimeout(resolve, 200));
    
    await handleLogin();
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
                disabled={isLogging()}
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
                  'box-sizing': 'border-box',
                  opacity: isLogging() ? '0.6' : '1'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              />
              {username() && !isLogging() && (
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
                disabled={isLogging()}
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
                  'box-sizing': 'border-box',
                  opacity: isLogging() ? '0.6' : '1'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLogging()) {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
              />
              {password() && !isLogging() && (
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
            disabled={isLogging()}
            style={{
              width: '100%',
              padding: '12px',
              background: isLogging() 
                ? 'var(--color-text-secondary)' 
                : `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
              color: 'white',
              border: 'none',
              'border-radius': '8px',
              'font-size': '16px',
              'font-weight': 'bold',
              cursor: isLogging() ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
              'margin-bottom': '20px',
              opacity: isLogging() ? '0.6' : '1'
            }}
            onMouseDown={(e) => !isLogging() && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => !isLogging() && (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => !isLogging() && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isLogging() ? '⏳ Logging in...' : app.translate('login')}
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
                disabled={isLogging()}
                onMouseDown={async (e) => {
                  if (isLogging()) return;
                  e.preventDefault();
                  e.stopPropagation();
                  await quickLogin('admin', 'test');
                }}
                style={{
                  padding: '8px',
                  'font-size': '10px',
                  background: isLogging() ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  'border-radius': '6px',
                  cursor: isLogging() ? 'not-allowed' : 'pointer',
                  opacity: isLogging() ? '0.6' : '1'
                }}
              >
                👑 Admin
              </button>
              <button
                type="button"
                disabled={isLogging()}
                onMouseDown={async (e) => {
                  if (isLogging()) return;
                  e.preventDefault();
                  e.stopPropagation();
                  await quickLogin('leiter', 'test');
                }}
                style={{
                  padding: '8px',
                  'font-size': '10px',
                  background: isLogging() ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  'border-radius': '6px',
                  cursor: isLogging() ? 'not-allowed' : 'pointer',
                  opacity: isLogging() ? '0.6' : '1'
                }}
              >
                🏛️ Leiter
              </button>
              <button
                type="button"
                disabled={isLogging()}
                onMouseDown={async (e) => {
                  if (isLogging()) return;
                  e.preventDefault();
                  e.stopPropagation();
                  await quickLogin('lehrer', 'test');
                }}
                style={{
                  padding: '8px',
                  'font-size': '10px',
                  background: isLogging() ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  'border-radius': '6px',
                  cursor: isLogging() ? 'not-allowed' : 'pointer',
                  opacity: isLogging() ? '0.6' : '1'
                }}
              >
                👨‍🏫 Lehrer
              </button>
              <button
                type="button"
                disabled={isLogging()}
                onMouseDown={async (e) => {
                  if (isLogging()) return;
                  e.preventDefault();
                  e.stopPropagation();
                  await quickLogin('student1', 'test');
                }}
                style={{
                  padding: '8px',
                  'font-size': '10px',
                  background: isLogging() ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  'border-radius': '6px',
                  cursor: isLogging() ? 'not-allowed' : 'pointer',
                  opacity: isLogging() ? '0.6' : '1'
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