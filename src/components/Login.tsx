import { createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function Login() {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const app = useApp();

  // ULTRA DIRECT LOGIN
  const performLogin = () => {
    console.log('🚀 ULTRA DIRECT LOGIN:', username(), password());
    
    if (!username() || !password()) {
      setError('Bitte Username und Password eingeben');
      return;
    }
    
    setError('');
    
    // DIRECT LOGIN - NO TRY-CATCH COMPLICATIONS
    const loginSuccess = app.login(username(), password());
    console.log('🚀 LOGIN SUCCESS:', loginSuccess);
    
    if (loginSuccess) {
      console.log('🚀 RELOADING NOW...');
      window.location.href = window.location.href; // Force reload
    } else {
      setError('Login fehlgeschlagen');
    }
  };

  // INSTANT LOGIN BUTTONS - NO SETTIMEOUT
  const instantLogin = (user: string, pass: string) => {
    console.log('🚀 INSTANT LOGIN DIRECT:', user);
    
    // SET AND LOGIN IMMEDIATELY
    setUsername(user);
    setPassword(pass);
    
    // FORCE DIRECT LOGIN
    const loginSuccess = app.login(user, pass);
    console.log('🚀 INSTANT LOGIN SUCCESS:', loginSuccess);
    
    if (loginSuccess) {
      console.log('🚀 INSTANT RELOADING...');
      window.location.href = window.location.href; // Force reload
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #2563eb, #1e40af)',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      padding: '20px'
    }}>
      
      {/* LOGIN CARD */}
      <div style={{
        background: 'white',
        padding: '40px',
        'border-radius': '16px',
        width: '100%',
        'max-width': '400px',
        'box-shadow': '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        
        {/* TITLE */}
        <h1 style={{
          'text-align': 'center',
          'margin-bottom': '30px',
          color: '#1f2937',
          'font-size': '24px'
        }}>
          معونة المتعلم
        </h1>
        
        {/* USERNAME INPUT */}
        <input
          type="text"
          placeholder="Username"
          value={username()}
          onInput={(e) => setUsername(e.currentTarget.value)}
          style={{
            width: '100%',
            padding: '15px',
            border: '2px solid #e5e7eb',
            'border-radius': '8px',
            'font-size': '16px',
            'margin-bottom': '15px',
            'box-sizing': 'border-box',
            outline: 'none'
          }}
        />
        
        {/* PASSWORD INPUT */}
        <input
          type="password"
          placeholder="Password"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              performLogin();
            }
          }}
          style={{
            width: '100%',
            padding: '15px',
            border: '2px solid #e5e7eb',
            'border-radius': '8px',
            'font-size': '16px',
            'margin-bottom': '20px',
            'box-sizing': 'border-box',
            outline: 'none'
          }}
        />
        
        {/* ERROR MESSAGE */}
        {error() && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            'border-radius': '8px',
            'margin-bottom': '20px',
            'text-align': 'center',
            border: '1px solid #fecaca'
          }}>
            {error()}
          </div>
        )}
        
        {/* LOGIN BUTTON */}
        <button
          onClick={performLogin}
          style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
            color: 'white',
            border: 'none',
            'border-radius': '8px',
            'font-size': '16px',
            'font-weight': 'bold',
            cursor: 'pointer',
            'margin-bottom': '30px'
          }}
        >
          Login
        </button>
        
        {/* QUICK LOGIN SECTION */}
        <div style={{
          'border-top': '1px solid #e5e7eb',
          'padding-top': '20px'
        }}>
          <p style={{
            'text-align': 'center',
            'margin-bottom': '15px',
            color: '#6b7280',
            'font-size': '14px'
          }}>
            Quick Login:
          </p>
          
          <div style={{
            display: 'grid',
            'grid-template-columns': '1fr 1fr',
            gap: '10px'
          }}>
            <button
              onClick={() => instantLogin('admin', 'test')}
              style={{
                padding: '10px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                'border-radius': '6px',
                'font-size': '12px',
                cursor: 'pointer'
              }}
            >
              👑 Admin
            </button>
            
            <button
              onClick={() => instantLogin('leiter', 'test')}
              style={{
                padding: '10px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                'border-radius': '6px',
                'font-size': '12px',
                cursor: 'pointer'
              }}
            >
              🏛️ Leiter
            </button>
            
            <button
              onClick={() => instantLogin('lehrer', 'test')}
              style={{
                padding: '10px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                'border-radius': '6px',
                'font-size': '12px',
                cursor: 'pointer'
              }}
            >
              👨‍🏫 Lehrer
            </button>
            
            <button
              onClick={() => instantLogin('student1', 'test')}
              style={{
                padding: '10px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                'border-radius': '6px',
                'font-size': '12px',
                cursor: 'pointer'
              }}
            >
              👨‍🎓 Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}