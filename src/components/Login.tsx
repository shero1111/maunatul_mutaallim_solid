import { createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function Login() {
  const [username, setUsername] = createSignal('student1');
  const [password, setPassword] = createSignal('test');
  const [error, setError] = createSignal('');
  const app = useApp();

  const doLogin = () => {
    console.log('🔄 SIMPLE LOGIN START');
    setError('');
    
    try {
      const success = app.login(username(), password());
      console.log('📝 Login result:', success);
      
      if (!success) {
        setError('Login fehlgeschlagen');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setError('Fehler beim Login');
    }
  };

  const fastLogin = (user: string, pass: string) => {
    console.log('🚀 Fast login:', user);
    setUsername(user);
    setPassword(pass);
    setTimeout(doLogin, 50);
  };

  return (
    <div style={{
      'min-height': '100vh',
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
        {/* Header */}
        <div style={{ 'text-align': 'center', 'margin-bottom': '30px' }}>
          <h1 style={{ color: '#1f2937', 'font-size': '1.8rem', 'margin-bottom': '10px' }}>
            معونة المتعلم
          </h1>
          <p style={{ color: '#6b7280', 'font-size': '14px' }}>
            نظام إدارة حلقات عَلٌمْنِي
          </p>
        </div>

        {/* Form */}
        <div style={{ 'margin-bottom': '20px' }}>
          <input
            type="text"
            placeholder="Username"
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              'border-radius': '8px',
              'font-size': '16px',
              'margin-bottom': '15px',
              'box-sizing': 'border-box'
            }}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              'border-radius': '8px',
              'font-size': '16px',
              'margin-bottom': '15px',
              'box-sizing': 'border-box'
            }}
          />
          
          <button
            onClick={doLogin}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              'border-radius': '8px',
              'font-size': '16px',
              'font-weight': 'bold',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </div>

        {/* Error */}
        {error() && (
          <div style={{
            color: '#ef4444',
            'text-align': 'center',
            'margin-bottom': '20px',
            padding: '10px',
            background: '#fef2f2',
            'border-radius': '8px'
          }}>
            {error()}
          </div>
        )}

        {/* Quick Login */}
        <div style={{
          'text-align': 'center',
          'font-size': '12px',
          color: '#6b7280',
          padding: '15px',
          background: '#f9fafb',
          'border-radius': '8px'
        }}>
          <p style={{ margin: '0 0 10px' }}>Quick Login:</p>
          
          <div style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '8px' }}>
            <button onClick={() => fastLogin('admin', 'test')} style={{
              padding: '8px', 'font-size': '10px', background: '#3b82f6', color: 'white',
              border: 'none', 'border-radius': '6px', cursor: 'pointer'
            }}>
              👑 Admin
            </button>
            
            <button onClick={() => fastLogin('leiter', 'test')} style={{
              padding: '8px', 'font-size': '10px', background: '#3b82f6', color: 'white',
              border: 'none', 'border-radius': '6px', cursor: 'pointer'
            }}>
              🏛️ Leiter
            </button>
            
            <button onClick={() => fastLogin('lehrer', 'test')} style={{
              padding: '8px', 'font-size': '10px', background: '#3b82f6', color: 'white',
              border: 'none', 'border-radius': '6px', cursor: 'pointer'
            }}>
              👨‍🏫 Lehrer
            </button>
            
            <button onClick={() => fastLogin('student1', 'test')} style={{
              padding: '8px', 'font-size': '10px', background: '#3b82f6', color: 'white',
              border: 'none', 'border-radius': '6px', cursor: 'pointer'
            }}>
              👨‍🎓 Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}