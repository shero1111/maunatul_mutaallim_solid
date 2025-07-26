import { createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function Login() {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [loginError, setLoginError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const app = useApp();

  const handleLogin = async () => {
    const user = username().trim();
    const pass = password().trim();
    
    // Clear previous errors
    setLoginError('');
    
    if (!user || !pass) {
      setLoginError(app.translate('usernamePasswordRequired'));
      return;
    }
    
    setIsLoading(true);
    
    // Add small delay for better UX
    setTimeout(() => {
      const success = app.login(user, pass);
      
      if (!success) {
        setLoginError(app.translate('loginFailed'));
      }
      
      setIsLoading(false);
    }, 500);
  };

  const quickLogin = async (user: string, pass: string, roleName: string) => {
    setUsername(user);
    setPassword(pass);
    setLoginError('');
    setIsLoading(true);
    
    // Add small delay for better UX
    setTimeout(() => {
      const success = app.login(user, pass);
      
      if (!success) {
        setLoginError(app.translate('loginFailed'));
      }
      
      setIsLoading(false);
    }, 300);
  };

  // Quick login buttons for different roles
  const roleButtons = [
    { 
      role: 'superuser', 
      username: 'admin', 
      password: 'test', 
      name: app.translate('administrator'),
      icon: '👑',
      color: '#7c3aed'
    },
    { 
      role: 'leitung', 
      username: 'leiter', 
      password: 'test', 
      name: app.translate('leadership'),
      icon: '🎯',
      color: '#059669'
    },
    { 
      role: 'lehrer', 
      username: 'lehrer', 
      password: 'test', 
      name: app.translate('teacher'),
      icon: '📚',
      color: '#dc2626'
    },
    { 
      role: 'student', 
      username: 'student1', 
      password: 'test', 
      name: app.translate('student'),
      icon: '🎓',
      color: '#2563eb'
    }
  ];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'font-family': 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      'box-sizing': 'border-box'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        'backdrop-filter': 'blur(10px)',
        padding: '40px',
        'border-radius': '24px',
        width: '100%',
        'max-width': '420px',
        'box-shadow': '0 20px 60px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          'text-align': 'center',
          'margin-bottom': '32px'
        }}>
          <div style={{
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            gap: '12px',
            'margin-bottom': '8px'
          }}>
            <img
              src="https://archive.org/download/logo-allemni/Logo_allemni.jpg"
              alt="Logo"
              style={{
                width: '40px',
                height: '40px',
                'border-radius': '8px',
                'object-fit': 'contain'
              }}
            />
            <h1 style={{
              margin: '0',
              'font-size': '28px',
              'font-weight': '700',
              color: '#1f2937',
              'letter-spacing': '-0.5px'
            }}>
              {app.translate('appTitle')}
            </h1>
          </div>
          <p style={{
            margin: '0',
            color: '#6b7280',
            'font-size': '14px'
          }}>
            {app.translate('loginWelcome')}
          </p>
        </div>

        {/* Error Message */}
        {loginError() && (
          <div style={{
            'background-color': '#fef2f2',
            color: '#dc2626',
            padding: '12px 16px',
            'border-radius': '12px',
            'margin-bottom': '20px',
            'font-size': '14px',
            border: '1px solid #fecaca',
            display: 'flex',
            'align-items': 'center',
            gap: '8px'
          }}>
            <span>❌</span>
            <span style={{ flex: '1' }}>{loginError()}</span>
            <button
              onClick={() => setLoginError('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                'font-size': '16px',
                padding: '0',
                'line-height': '1'
              }}
              title={app.translate('close')}
            >
              ✕
            </button>
          </div>
        )}

        {/* Login Form */}
        <div style={{ 'margin-bottom': '24px' }}>
          <div style={{ 'margin-bottom': '16px' }}>
            <label style={{
              display: 'block',
              'margin-bottom': '6px',
              'font-weight': '500',
              color: '#374151',
              'font-size': '14px'
            }}>
              {app.translate('username')}
            </label>
            <input
              type="text"
              placeholder={app.translate('enterUsername')}
              value={username()}
              onInput={(e) => setUsername(e.currentTarget.value)}
              disabled={isLoading()}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                'border-radius': '12px',
                'font-size': '16px',
                'background-color': isLoading() ? '#f9fafb' : 'white',
                color: '#1f2937',
                'box-sizing': 'border-box',
                transition: 'all 0.2s ease',
                outline: 'none',
                opacity: isLoading() ? '0.6' : '1'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ 'margin-bottom': '24px' }}>
            <label style={{
              display: 'block',
              'margin-bottom': '6px',
              'font-weight': '500',
              color: '#374151',
              'font-size': '14px'
            }}>
              {app.translate('password')}
            </label>
            <input
              type="password"
              placeholder={app.translate('enterPassword')}
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading() && handleLogin()}
              disabled={isLoading()}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                'border-radius': '12px',
                'font-size': '16px',
                'background-color': isLoading() ? '#f9fafb' : 'white',
                color: '#1f2937',
                'box-sizing': 'border-box',
                transition: 'all 0.2s ease',
                outline: 'none',
                opacity: isLoading() ? '0.6' : '1'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading()}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading() ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              'border-radius': '12px',
              cursor: isLoading() ? 'not-allowed' : 'pointer',
              'font-size': '16px',
              'font-weight': '600',
              'letter-spacing': '0.5px',
              transition: 'all 0.2s ease',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              gap: '8px',
              'box-shadow': isLoading() ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isLoading() && (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid transparent',
                'border-top': '2px solid white',
                'border-radius': '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {isLoading() ? app.translate('loggingIn') : app.translate('login')}
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          'align-items': 'center',
          'margin-bottom': '24px'
        }}>
          <div style={{
            flex: '1',
            height: '1px',
            background: '#e5e7eb'
          }} />
          <span style={{
            padding: '0 16px',
            'font-size': '14px',
            color: '#6b7280',
            'font-weight': '500'
          }}>
            {app.translate('quickLogin')}
          </span>
          <div style={{
            flex: '1',
            height: '1px',
            background: '#e5e7eb'
          }} />
        </div>

        {/* Quick Login Buttons */}
        <div style={{
          display: 'grid',
          'grid-template-columns': '1fr 1fr',
          gap: '12px'
        }}>
          {roleButtons.map((role) => (
            <button
              onClick={() => quickLogin(role.username, role.password, role.name)}
              disabled={isLoading()}
              style={{
                padding: '12px 8px',
                background: 'white',
                border: `2px solid ${role.color}`,
                'border-radius': '12px',
                cursor: isLoading() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                'flex-direction': 'column',
                'align-items': 'center',
                gap: '4px',
                'text-align': 'center',
                opacity: isLoading() ? '0.6' : '1',
                'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading()) {
                  e.currentTarget.style.background = role.color;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${role.color}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading()) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = role.color;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              <span style={{
                'font-size': '20px',
                'line-height': '1'
              }}>
                {role.icon}
              </span>
              <span style={{
                'font-size': '12px',
                'font-weight': '600',
                color: 'inherit'
              }}>
                {role.name}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          'text-align': 'center',
          'margin-top': '24px',
          'font-size': '12px',
          color: '#9ca3af'
        }}>
          {app.translate('appSubtitle')}
        </div>
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}