import { createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';
import { demoUsers } from '../data/demo-data';

export function Login() {
  const [username, setUsername] = createSignal('student1');
  const [password, setPassword] = createSignal('test');
  const [error, setError] = createSignal('');
  const app = useApp();

  const directLogin = (testUser: string, testPass: string) => {
    console.log('🎯 DIRECT LOGIN TEST');
    console.log('Available demo users:', demoUsers.map(u => `${u.username}/${u.password}`));
    
    // Find user directly in demo data
    const foundUser = demoUsers.find(u => u.username === testUser && u.password === testPass);
    console.log('Found user:', foundUser);
    
    if (foundUser) {
      console.log('✅ User found, setting in app...');
      // Try to set user directly
      app.setCurrentUser?.(foundUser);
      
      // Also try the login method
      const loginResult = app.login(testUser, testPass);
      console.log('Login method result:', loginResult);
      
      return true;
    } else {
      console.log('❌ User not found');
      return false;
    }
  };

  const handleLogin = () => {
    console.log('🔄 SIMPLE LOGIN ATTEMPT');
    console.log('Username:', username());
    console.log('Password:', password());
    
    setError('');
    
    // First try direct approach
    const directResult = directLogin(username(), password());
    
    if (!directResult) {
      // Try normal app login
      console.log('📞 Calling app.login...');
      const result = app.login(username(), password());
      console.log('App login result:', result);
      
      if (!result) {
        setError('Login fehlgeschlagen - bitte überprüfe deine Daten');
      }
    }
  };

  return (
    <div style={{
      'min-height': '100vh',
      background: `linear-gradient(135deg, #2563eb, #1d4ed8)`,
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
            نظام إدارة حلقات عَلٌمْنِي
          </p>
        </div>

        <div style={{ 'margin-bottom': '20px' }}>
          <label style={{
            display: 'block',
            'margin-bottom': '8px',
            'font-weight': 'bold',
            color: '#1f2937'
          }}>
            اسم المستخدم
          </label>
          <input
            type="text"
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
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

        <div style={{ 'margin-bottom': '20px' }}>
          <label style={{
            display: 'block',
            'margin-bottom': '8px',
            'font-weight': 'bold',
            color: '#1f2937'
          }}>
            كلمة المرور
          </label>
          <input
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
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
            'border-radius': '8px',
            border: '1px solid #fecaca'
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
          دخول
        </button>

        {/* Quick Test Buttons */}
        <div style={{
          'text-align': 'center',
          'border-top': '1px solid #e5e7eb',
          'padding-top': '20px'
        }}>
          <div style={{ 'margin-bottom': '10px', 'font-size': '12px', color: '#6b7280' }}>
            🧪 Test Accounts:
          </div>
          <div style={{
            display: 'grid',
            'grid-template-columns': '1fr 1fr',
            gap: '8px'
          }}>
            <button
              onClick={() => {
                setUsername('admin');
                setPassword('test');
                setTimeout(() => handleLogin(), 100);
              }}
              style={{
                padding: '8px',
                'font-size': '11px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                'border-radius': '6px',
                cursor: 'pointer'
              }}
            >
              👑 Admin
            </button>
            <button
              onClick={() => {
                setUsername('student1');
                setPassword('test');
                setTimeout(() => handleLogin(), 100);
              }}
              style={{
                padding: '8px',
                'font-size': '11px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                'border-radius': '6px',
                cursor: 'pointer'
              }}
            >
              👨‍🎓 Student
            </button>
          </div>
          
          {/* Debug Button */}
          <button
            onClick={() => {
              console.log('🔍 DEBUG INFO:');
              console.log('App object:', app);
              console.log('App login function:', typeof app.login);
              console.log('Demo users:', demoUsers);
              console.log('App users:', app.users?.());
              console.log('Current user:', app.currentUser?.());
              console.log('Is authenticated:', app.isAuthenticated?.());
            }}
            style={{
              width: '100%',
              padding: '8px',
              'font-size': '10px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              'border-radius': '6px',
              cursor: 'pointer',
              'margin-top': '10px'
            }}
          >
            🔍 Debug Info
          </button>
        </div>
      </div>
    </div>
  );
}