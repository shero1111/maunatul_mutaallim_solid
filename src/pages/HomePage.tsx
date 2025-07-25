import { useApp } from '../store/AppStore';

export function HomePage() {
  const app = useApp();
  const currentUser = app.currentUser();
  
  return (
    <div style={{
      padding: '20px',
      'min-height': '100vh',
      'background-color': 'var(--color-background)'
    }}>
      <h1 style={{
        'text-align': 'center',
        color: 'var(--color-primary)',
        'margin-bottom': '20px'
      }}>
        معونة المتعلم
      </h1>
      
      <div style={{
        'text-align': 'center',
        background: 'white',
        padding: '20px',
        'border-radius': '10px',
        'box-shadow': '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Welcome!</h2>
        <p>User: {currentUser?.name || 'Unknown'}</p>
        <p>Role: {currentUser?.role || 'Unknown'}</p>
        <p>Login successful!</p>
      </div>
    </div>
  );
}