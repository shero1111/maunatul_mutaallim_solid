import { useApp } from '../store/AppStore';

export function AboutUsPage() {
  const app = useApp();

  const containerStyle = {
    padding: '20px 16px 80px 16px',
    'background-color': 'var(--color-background)',
    'min-height': '100vh',
    direction: 'rtl' as const
  };

  const headerStyle = {
    'text-align': 'center' as const,
    'margin-bottom': '40px'
  };

  const logoContainerStyle = {
    'margin-bottom': '30px'
  };

  const logoTitleStyle = {
    color: 'var(--color-primary)',
    'font-size': '2.5rem',
    margin: '0 0 8px 0',
    'font-weight': '700',
    'letter-spacing': '1px'
  };

  const logoSubtitleStyle = {
    color: 'var(--color-text-secondary)',
    'font-size': '1rem',
    margin: '0 0 20px 0',
    'font-weight': '500'
  };

  const contentStyle = {
    background: 'var(--color-surface)',
    'border-radius': '16px',
    padding: '32px 24px',
    'margin-bottom': '20px',
    border: '1px solid var(--color-border)',
    'box-shadow': '0 4px 16px rgba(0, 0, 0, 0.08)'
  };

  const organizationTitleStyle = {
    color: 'var(--color-primary)',
    'font-size': '1.8rem',
    'font-weight': '700',
    'margin-bottom': '24px',
    'text-align': 'center' as const,
    'line-height': '1.4'
  };

  const descriptionStyle = {
    color: 'var(--color-text)',
    'font-size': '1.1rem',
    'line-height': '1.8',
    'text-align': 'center' as const,
    'max-width': '800px',
    margin: '0 auto'
  };

  const backButtonStyle = {
    position: 'fixed' as const,
    top: '20px',
    left: '20px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    'border-radius': '12px',
    padding: '12px',
    cursor: 'pointer',
    'font-size': '18px',
    color: 'var(--color-text)',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    'z-index': '1000',
    outline: 'none'
  };

  return (
    <div style={containerStyle}>
      {/* Back Button */}
      <button 
        style={backButtonStyle}
        onClick={() => app.setCurrentPage('more')}
      >
        {app.language() === 'ar' ? '→' : '←'}
      </button>

      {/* Header with Logo */}
      <div style={headerStyle}>
        <div style={logoContainerStyle}>
          <h1 style={logoTitleStyle}>
            معونة المتعلم
          </h1>
          <p style={logoSubtitleStyle}>
            نظام إدارة حلقات عَلٌمْنِي
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        <h2 style={organizationTitleStyle}>
          الوقف التعليمي وقف علِّمني
        </h2>
        
        <p style={descriptionStyle}>
          هو وقف خيري تعليمي يهدف إلى دعم البرامج العلمية النوعية لطلاب العلم النخبة، ويُعد من المشاريع الوقفية المباركة التي تعتني بإيصال العلم الشرعي النافع عبر برامج تربوية ومنهجية متميزة.
        </p>
      </div>
    </div>
  );
}