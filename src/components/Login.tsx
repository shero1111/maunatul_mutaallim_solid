import { createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function Login() {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [loginStatus, setLoginStatus] = createSignal('');
  const app = useApp();

  const handleLogin = () => {
    const user = username().trim();
    const pass = password().trim();
    
    console.log('🚀 Login attempt:', { user, pass });
    setLoginStatus(`Versuche Login für: ${user}`);
    
    if (!user || !pass) {
      setLoginStatus('Fehler: Username und Password erforderlich');
      return;
    }
    
    const success = app.login(user, pass);
    console.log('📊 Login result:', success);
    
    if (success) {
      setLoginStatus('✅ Login erfolgreich!');
    } else {
      setLoginStatus('❌ Login fehlgeschlagen!');
      // Extra debug for admin
      if (user === 'admin') {
        console.log('🔍 Admin login failed - checking users:', app.users().map(u => ({ username: u.username, password: u.password, role: u.role })));
      }
    }
  };

  const quickLogin = (user: string, pass: string) => {
    console.log('⚡ Quick login:', { user, pass });
    setUsername(user);
    setPassword(pass);
    setLoginStatus(`Schnell-Login für: ${user}`);
    
    const success = app.login(user, pass);
    console.log('📊 Quick login result:', success);
    
    if (success) {
      setLoginStatus('✅ Schnell-Login erfolgreich!');
    } else {
      setLoginStatus('❌ Schnell-Login fehlgeschlagen!');
      console.log('🔍 Available users:', app.users().map(u => ({ username: u.username, password: u.password, role: u.role })));
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#2563eb',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        'border-radius': '10px',
        width: '300px'
      }}>
        <h1 style={{ 'text-align': 'center', 'margin-bottom': '20px' }}>Login</h1>
        
        {/* Status Display */}
        {loginStatus() && (
          <div style={{
            padding: '10px',
            'margin-bottom': '15px',
            'background-color': loginStatus().includes('✅') ? '#dcfce7' : '#fef2f2',
            'border': loginStatus().includes('✅') ? '1px solid #22c55e' : '1px solid #ef4444',
            'border-radius': '5px',
            'font-size': '12px',
            'text-align': 'center'
          }}>
            {loginStatus()}
          </div>
        )}
        
        <input
          type="text"
          placeholder="Username"
          value={username()}
          onInput={(e) => setUsername(e.currentTarget.value)}
          style={{
            width: '100%',
            padding: '10px',
            'margin-bottom': '10px',
            border: '1px solid #ccc',
            'box-sizing': 'border-box'
          }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          style={{
            width: '100%',
            padding: '10px',
            'margin-bottom': '20px',
            border: '1px solid #ccc',
            'box-sizing': 'border-box'
          }}
        />
        
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '10px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            'border-radius': '5px',
            cursor: 'pointer',
            'margin-bottom': '20px'
          }}
        >
          Login
        </button>
        
        <div style={{ 'text-align': 'center' }}>
          <button 
            onClick={() => quickLogin('admin', 'test')}
            style={{ 
              margin: '5px', 
              padding: '5px 10px', 
              background: '#10b981', 
              color: 'white', 
              border: 'none', 
              'border-radius': '3px', 
              cursor: 'pointer' 
            }}
          >
            Admin
          </button>
          <button 
            onClick={() => quickLogin('student1', 'test')}
            style={{ 
              margin: '5px', 
              padding: '5px 10px', 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              'border-radius': '3px', 
              cursor: 'pointer' 
            }}
          >
            Student
          </button>
        </div>
        
        {/* Debug Info */}
        <div style={{
          'margin-top': '20px',
          'font-size': '10px',
          color: '#666',
          'text-align': 'center'
        }}>
          Users loaded: {app.users().length} | Auth: {app.isAuthenticated() ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
}