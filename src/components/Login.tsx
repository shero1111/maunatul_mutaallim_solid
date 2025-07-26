import { createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function Login() {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const app = useApp();

  const handleLogin = () => {
    const user = username().trim();
    const pass = password().trim();
    
    if (!user || !pass) return;
    
    app.login(user, pass);
  };

  const quickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    app.login(user, pass);
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
      </div>
    </div>
  );
}