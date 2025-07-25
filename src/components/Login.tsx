import { createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function Login() {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const app = useApp();

  // FRESH LOGIN FUNCTION
  const performLogin = () => {
    console.log('🆕 FRESH LOGIN ATTEMPT:', username(), password());
    
    if (!username() || !password()) {
      setError('Bitte Username und Password eingeben');
      return;
    }
    
    setError('');
    
    try {
      console.log('🆕 Calling app.login...');
      const loginSuccess = app.login(username(), password());
      console.log('🆕 FRESH LOGIN RESULT:', loginSuccess);
      
      if (loginSuccess) {
        console.log('🆕 SUCCESS! Current user:', app.currentUser()?.name);
        console.log('🆕 Starting reload process...');
        
        // IMMEDIATE RELOAD - NO WAITING
        window.location.reload();
        
      } else {
        setError('Login fehlgeschlagen - Username oder Password falsch');
      }
    } catch (err) {
      console.error('🆕 LOGIN ERROR:', err);
      console.log('🆕 ERROR occurred, but forcing reload anyway...');
      
      // EVEN IF ERROR - TRY TO RELOAD
      try {
        window.location.reload();
      } catch (reloadErr) {
        console.error('🆕 RELOAD ERROR:', reloadErr);
        setError('Fehler beim Login - versuche es nochmal');
      }
    }
  };

  // INSTANT LOGIN BUTTONS
  const instantLogin = (user: string, pass: string) => {
    try {
      console.log('🆕 INSTANT LOGIN:', user);
      setUsername(user);
      setPassword(pass);
      
      // Wait a bit for state to update then login
      setTimeout(() => {
        performLogin();
      }, 100);
    } catch (err) {
      console.error('🆕 INSTANT LOGIN ERROR:', err);
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