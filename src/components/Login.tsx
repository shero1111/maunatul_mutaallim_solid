import { createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';
import { demoUsers } from '../data/demo-data';

export function Login() {
  const [username, setUsername] = createSignal('student1');
  const [password, setPassword] = createSignal('test');
  const [error, setError] = createSignal('');
  const app = useApp();

  const superSimpleLogin = (user: string, pass: string) => {
    console.log('🚀 SUPER SIMPLE LOGIN');
    console.log('Trying:', user, '/', pass);
    
    // Force reset users if needed
    if (app.users().length === 0) {
      console.log('🔄 Initializing users...');
      // Access the setUsers directly if possible, otherwise force via login
    }
    
    // Find user in demo data
    const foundUser = demoUsers.find(u => u.username === user && u.password === pass);
    
    if (foundUser) {
      console.log('✅ Found user:', foundUser.name);
      
      // Force set current user directly
      if (app.setCurrentUser) {
        app.setCurrentUser(foundUser);
        console.log('✅ User set via setCurrentUser');
      }
      
      // Force save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      console.log('✅ User saved to localStorage');
      
      // Force page refresh to ensure login state
      window.location.reload();
      
      return true;
    } else {
      console.log('❌ User not found in demo data');
      console.log('Available users:', demoUsers.map(u => `${u.username}/${u.password}`));
      return false;
    }
  };

  const handleLogin = () => {
    console.log('🔥 EMERGENCY LOGIN');
    setError('');
    
    const result = superSimpleLogin(username(), password());
    
    if (!result) {
      setError('Login fehlgeschlagen');
    }
  };

  const instantLogin = (user: string, pass: string) => {
    console.log('⚡ INSTANT LOGIN:', user);
    setUsername(user);
    setPassword(pass);
    setTimeout(() => {
      superSimpleLogin(user, pass);
    }, 100);
  };

  return (
    <div style={{
      'min-height': '100vh',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
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
            color: '#1f2937',
            'font-size': '1.8rem',
            'margin-bottom': '10px'
          }}>
            معونة المتعلم
          </h1>
          <p style={{
            color: '#6b7280',
            'font-size': '14px'
          }}>
            LOGIN REPARATUR
          </p>
        </div>

        <div style={{ 'margin-bottom': '20px' }}>
          <input
            type="text"
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
            placeholder="Username"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              'border-radius': '8px',
              'font-size': '16px',
              'box-sizing': 'border-box',
              'margin-bottom': '10px'
            }}
          />
          <input
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            placeholder="Password"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              'border-radius': '8px',
              'font-size': '16px',
              'box-sizing': 'border-box'
            }}
          />
        </div>

        {error() && (
          <div style={{
            color: '#dc2626',
            'margin-bottom': '20px',
            'text-align': 'center',
            padding: '10px',
            'background-color': '#fef2f2',
            'border-radius': '8px'
          }}>
            {error()}
          </div>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: 'white',
            border: 'none',
            'border-radius': '8px',
            'font-size': '16px',
            'font-weight': 'bold',
            cursor: 'pointer',
            'margin-bottom': '20px'
          }}
        >
          LOGIN (FORCE)
        </button>

        {/* Emergency Buttons */}
        <div style={{
          'text-align': 'center',
          'border-top': '1px solid #e5e7eb',
          'padding-top': '20px'
        }}>
          <div style={{ 'margin-bottom': '10px', 'font-size': '12px', color: '#dc2626' }}>
            🚨 EMERGENCY LOGIN:
          </div>
          <div style={{
            display: 'grid',
            'grid-template-columns': '1fr 1fr',
            gap: '8px'
          }}>
            <button
              onClick={() => instantLogin('admin', 'test')}
              style={{
                padding: '8px',
                'font-size': '11px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                'border-radius': '6px',
                cursor: 'pointer'
              }}
            >
              🚨 ADMIN
            </button>
            <button
              onClick={() => instantLogin('student1', 'test')}
              style={{
                padding: '8px',
                'font-size': '11px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                'border-radius': '6px',
                cursor: 'pointer'
              }}
            >
              🚨 STUDENT
            </button>
          </div>
          
          {/* Nuclear Option */}
          <button
            onClick={() => {
              console.log('☢️ NUCLEAR LOGIN');
              const adminUser = demoUsers.find(u => u.username === 'admin');
              if (adminUser) {
                localStorage.setItem('currentUser', JSON.stringify(adminUser));
                window.location.reload();
              }
            }}
            style={{
              width: '100%',
              padding: '8px',
              'font-size': '10px',
              background: '#7c2d12',
              color: 'white',
              border: 'none',
              'border-radius': '6px',
              cursor: 'pointer',
              'margin-top': '10px'
            }}
          >
            ☢️ NUCLEAR LOGIN (Admin)
          </button>
        </div>
      </div>
    </div>
  );
}