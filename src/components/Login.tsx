import { createSignal, Show } from 'solid-js';
import { useApp } from '../store/AppStore';

export function Login() {
  const app = useApp();
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  
  const handleLogin = (e: Event) => {
    e.preventDefault();
    
    const success = app.login(username(), password());
    if (success) {
      setError('');
    } else {
      setError(app.translate('invalidCredentials'));
    }
  };
  
  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid var(--color-border)',
    'border-radius': '8px',
    'font-size': '16px', // Critical for iOS - prevents zoom
    'background-color': 'var(--color-background)',
    color: 'var(--color-text)',
    outline: 'none',
    'box-sizing': 'border-box' as const,
    transition: 'border-color 0.2s',
    '-webkit-appearance': 'none',
    '-webkit-tap-highlight-color': 'transparent'
  };
  
  const containerStyle = {
    'min-height': '100vh',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    padding: '20px',
    'background-color': 'var(--color-surface)'
  };
  
  const cardStyle = {
    'background-color': 'var(--color-background)',
    padding: '32px',
    'border-radius': '16px',
    'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.1)',
    width: '100%',
    'max-width': '400px',
    border: '1px solid var(--color-border)'
  };
  
  const titleStyle = {
    'font-size': '28px',
    'font-weight': 'bold',
    'text-align': 'center' as const,
    'margin-bottom': '32px',
    color: 'var(--color-text)',
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const buttonStyle = {
    width: '100%',
    padding: '12px',
    'background-color': 'var(--color-primary)',
    color: 'white',
    border: 'none',
    'border-radius': '8px',
    'font-size': '16px',
    'font-weight': 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    'margin-top': '16px'
  };
  
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          {app.translate('appName')}
        </h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ 'margin-bottom': '16px' }}>
            <input
              type="text"
              placeholder={app.translate('username')}
              value={username()}
              onInput={(e) => setUsername(e.currentTarget.value)}
              style={inputStyle}
              autocomplete="username"
              autocorrect="off"
              autocapitalize="off"
              spellcheck={false}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            />
          </div>
          
          <div style={{ 'margin-bottom': '16px' }}>
            <input
              type="password"
              placeholder={app.translate('password')}
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              style={inputStyle}
              autocomplete="current-password"
              autocorrect="off"
              autocapitalize="off"
              spellcheck={false}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            />
          </div>
          
          <Show when={error()}>
            <div style={{
              color: 'var(--color-error)',
              'text-align': 'center',
              'margin-bottom': '16px',
              'font-size': '14px'
            }}>
              {error()}
            </div>
          </Show>
          
          <button 
            type="submit" 
            style={buttonStyle}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
          >
            {app.translate('login')}
          </button>
        </form>
        
        {/* Demo credentials info */}
        <div style={{
          'margin-top': '24px',
          padding: '16px',
          'background-color': 'var(--color-surface)',
          'border-radius': '8px',
          'font-size': '12px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ 'font-weight': 'bold', 'margin-bottom': '8px' }}>
            Demo Credentials:
          </div>
          <div>Admin: admin / test</div>
          <div>Lehrer: lehrer / test</div>
          <div>Leiter: leiter / test</div>
          <div>Student: student1 / test</div>
        </div>
      </div>
    </div>
  );
}