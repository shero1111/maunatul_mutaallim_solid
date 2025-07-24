import { createSignal, Show } from 'solid-js';
import { useApp } from '../store/AppStore';

export function Login() {
  const app = useApp();
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  
  const handleLogin = (e?: Event) => {
    if (e) e.preventDefault();
    
    const success = app.login(username(), password());
    if (success) {
      setError('');
    } else {
      setError(app.translate('invalidCredentials'));
    }
  };
  
  // EXACT STYLES FROM REACT VERSION
  const containerStyle = {
    'min-height': '100vh',
    background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    padding: '20px',
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const cardStyle = {
    background: 'var(--color-background)',
    'border-radius': '20px',
    padding: '40px',
    'max-width': '400px',
    width: '100%',
    'box-shadow': '0 20px 40px rgba(0,0,0,0.1)'
  };
  
  const titleContainerStyle = {
    'text-align': 'center' as const,
    'margin-bottom': '30px'
  };
  
  const titleStyle = {
    color: 'var(--color-text)',
    'font-size': '1.8rem',
    'margin-bottom': '10px'
  };
  
  const subtitleStyle = {
    color: 'var(--color-text-secondary)',
    'font-size': '14px'
  };
  
  const inputContainerStyle = {
    'margin-bottom': '20px'
  };
  
  const labelStyle = {
    display: 'block',
    'margin-bottom': '8px',
    'font-weight': 'bold',
    color: 'var(--color-text)'
  };
  
  const inputWrapperStyle = {
    position: 'relative' as const
  };
  
  const inputStyle = {
    width: '100%',
    padding: '12px 40px 12px 12px',
    border: '1px solid var(--color-border)',
    'border-radius': '8px',
    'font-size': '16px',
    'background-color': 'var(--color-surface)',
    color: 'var(--color-text)',
    direction: 'ltr' as const,
    outline: 'none',
    transition: 'border-color 0.2s',
    'box-sizing': 'border-box' as const
  };
  
  const clearButtonStyle = {
    position: 'absolute' as const,
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    'font-size': '18px',
    padding: '2px'
  };
  
  const errorStyle = {
    color: 'var(--color-error)',
    'margin-bottom': '20px',
    'text-align': 'center' as const,
    padding: '10px',
    'background-color': 'var(--color-surface)',
    'border-radius': '8px',
    border: '1px solid var(--color-error)'
  };
  
  const loginButtonStyle = {
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
  };
  
  const demoCredentialsStyle = {
    'text-align': 'center' as const,
    'font-size': '12px',
    color: 'var(--color-text-secondary)',
    padding: '15px',
    background: 'var(--color-surface)',
    'border-radius': '8px'
  };
  
  const demoGridStyle = {
    display: 'grid',
    gap: '5px',
    'font-size': '11px'
  };
  
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={titleContainerStyle}>
          <h1 style={titleStyle}>
            {app.translate('appName')}
          </h1>
          <p style={subtitleStyle}>
            نظام إدارة التعلم الإسلامي
          </p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={inputContainerStyle}>
            <label style={labelStyle}>
              {app.translate('username')}
            </label>
            <div style={inputWrapperStyle}>
              <input
                type="text"
                value={username()}
                onInput={(e) => setUsername(e.currentTarget.value)}
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              />
              <Show when={username()}>
                <button
                  type="button"
                  style={clearButtonStyle}
                  onClick={() => setUsername('')}
                >
                  ✕
                </button>
              </Show>
            </div>
          </div>
          
          <div style={inputContainerStyle}>
            <label style={labelStyle}>
              {app.translate('password')}
            </label>
            <div style={inputWrapperStyle}>
              <input
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Show when={password()}>
                <button
                  type="button"
                  style={clearButtonStyle}
                  onClick={() => setPassword('')}
                >
                  ✕
                </button>
              </Show>
            </div>
          </div>
          
          <Show when={error()}>
            <div style={errorStyle}>
              {error()}
            </div>
          </Show>
          
          <button 
            type="submit" 
            style={loginButtonStyle}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {app.translate('login')}
          </button>
        </form>
        
        <div style={demoCredentialsStyle}>
          <p style={{ margin: '0 0 10px' }}>
            حسابات التجربة:
          </p>
          <div style={demoGridStyle}>
            <span>👑 admin/test (مدير عام)</span>
            <span>🏛️ leiter/test (قائد)</span>
            <span>👨‍🏫 lehrer/test (معلم)</span>
            <span>👨‍🎓 student1/test (طالب)</span>
            <span>👨‍🎓 student2/test (طالب)</span>
          </div>
        </div>
      </div>
    </div>
  );
}