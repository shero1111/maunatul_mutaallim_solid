import { For, createMemo, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function MorePage() {
  const app = useApp();
  
  // State for logout modal
  const [showLogoutModal, setShowLogoutModal] = createSignal(false);
  
  const containerStyle = {
    padding: '20px 16px 80px 16px',
    'background-color': 'var(--color-surface)',
    'min-height': '100vh'
  };
  
  const headerStyle = {
    'margin-bottom': '20px'
  };
  
  const titleStyle = {
    'font-size': '24px',
    'font-weight': 'bold',
    color: 'var(--color-text)',
    'margin-bottom': '16px',
    'text-align': 'center' as const,
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const sectionStyle = {
    'background-color': 'var(--color-background)',
    'border-radius': '12px',
    'margin-bottom': '16px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden'
  };
  
  const sectionTitleStyle = {
    padding: '16px',
    'font-size': '16px',
    'font-weight': 'bold',
    color: 'var(--color-text)',
    'border-bottom': '1px solid var(--color-border)',
    'background-color': 'var(--color-surface)'
  };
  
  const menuItemStyle = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-between',
    padding: '16px',
    cursor: 'pointer',
    'border-bottom': '1px solid var(--color-border)',
    transition: 'background-color 0.2s',
    '-webkit-tap-highlight-color': 'transparent'
  };
  
  const menuItemContentStyle = {
    display: 'flex',
    'align-items': 'center',
    gap: '12px'
  };
  
  const menuItemIconStyle = {
    'font-size': '20px',
    width: '24px',
    'text-align': 'center' as const
  };
  
  const menuItemTextStyle = {
    'font-size': '16px',
    color: 'var(--color-text)'
  };
  
  const menuItemArrowStyle = {
    'font-size': '16px',
    color: 'var(--color-text-secondary)'
  };
  
  const toggleContainerStyle = {
    display: 'flex',
    'align-items': 'center',
    gap: '8px'
  };

  const toggleWrapperStyle = {
    display: 'flex',
    'align-items': 'center',
    background: 'var(--color-surface)',
    'border-radius': '20px',
    padding: '4px',
    border: '1px solid var(--color-border)',
    position: 'relative' as const
  };

  const toggleOptionStyle = {
    padding: '6px 12px',
    'border-radius': '16px',
    'font-size': '12px',
    'font-weight': '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    'min-width': '50px',
    'text-align': 'center' as const,
    'white-space': 'nowrap' as const
  };

  // New styles for the updated layout
  const itemsContainerStyle = {
    'background-color': 'var(--color-background)',
    'border-radius': '12px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden' as const
  };

  const itemStyle = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-between',
    padding: '16px',
    cursor: 'pointer',
    'border-bottom': '1px solid var(--color-border)',
    transition: 'background-color 0.2s',
    '-webkit-tap-highlight-color': 'transparent'
  };

  const itemContentStyle = {
    display: 'flex',
    'align-items': 'center',
    gap: '12px'
  };

  const itemIconStyle = {
    'font-size': '20px',
    width: '24px',
    'text-align': 'center' as const
  };

  const itemTextStyle = {
    'font-size': '16px',
    color: 'var(--color-text)'
  };

  const itemValueStyle = {
    'font-size': '14px',
    color: 'var(--color-text-secondary)'
  };

  const dangerItemStyle = {
    color: 'var(--color-error)'
  };
  
  const userInfoStyle = {
    'text-align': 'center' as const,
    padding: '24px 16px',
    'background-color': 'var(--color-background)',
    'border-radius': '12px',
    'margin-bottom': '16px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--color-border)'
  };
  
  const userNameStyle = {
    'font-size': '20px',
    'font-weight': 'bold',
    color: 'var(--color-text)',
    'margin-bottom': '4px'
  };
  
  const userRoleStyle = {
    'font-size': '14px',
    color: 'var(--color-text-secondary)',
    'margin-bottom': '16px'
  };
  
  const currentUser = app.currentUser();
  
  const getSettingsItems = () => [
    {
      icon: '🎨',
      text: app.translate('theme'),
      type: 'toggle' as const,
      value: app.theme(),
      leftLabel: 'Light',
      rightLabel: 'Dark',
      action: () => {
        const newTheme = app.theme() === 'light' ? 'dark' : 'light';
        app.setTheme(newTheme);
      }
    },
    {
      icon: '🌐',
      text: app.translate('language'),
      type: 'toggle' as const,
      value: app.language(),
      leftLabel: 'English',
      rightLabel: 'العربية',
      action: () => {
        const newLang = app.language() === 'en' ? 'ar' : 'en';
        app.setLanguage(newLang);
      }
    }
  ];

  const generalItems = [
    {
      icon: '📚',
      text: app.translate('userGuide'),
      type: 'action' as const,
      action: () => {
        alert('User Guide coming soon!');
      }
    },
    {
      icon: 'ℹ️',
      text: app.translate('aboutUs'),
      type: 'action' as const,
      action: () => {
        app.setCurrentPage('about-us');
      }
    },
    {
      icon: '📱',
      text: `${app.translate('appVersion')} 2.0.0`,
      type: 'info' as const,
      action: undefined
    }
  ];

  const accountItems = [
    {
      icon: '🔑',
      text: app.translate('changePassword'),
      type: 'action' as const,
      action: () => {
        alert('Change Password coming soon!');
      }
    },
    {
      icon: '🚪',
      text: app.translate('logout'),
      type: 'action' as const,
      action: () => {
        setShowLogoutModal(true);
      },
      danger: true
    }
  ];
  
  const handleMenuItemClick = (item: any) => {
    const menuItem = document.querySelector(`[data-action="${item.text}"]`) as HTMLElement;
    if (menuItem) {
      menuItem.style.backgroundColor = 'var(--color-surface)';
      setTimeout(() => {
        menuItem.style.backgroundColor = 'transparent';
      }, 150);
    }
    
    if (item.action) {
      item.action();
    }
  };

  // Logout Modal Component
  const LogoutModal = () => (
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.5)',
        'backdrop-filter': 'blur(8px)',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'z-index': '1000',
        padding: '20px'
      }}
      onClick={() => setShowLogoutModal(false)}
    >
      <div 
        style={{
          background: 'var(--color-background)',
          'border-radius': '20px',
          padding: '32px',
          'max-width': '400px',
          width: '100%',
          'box-shadow': '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--color-border)',
          'text-align': 'center',
          transform: 'scale(0.95)',
          transition: 'transform 0.2s ease',
          animation: 'modalFadeIn 0.3s ease forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          'font-size': '3rem',
          'margin-bottom': '16px',
          opacity: '0.8'
        }}>
          🚪
        </div>
        
        {/* Title */}
        <h2 style={{
          color: 'var(--color-text)',
          'font-size': '1.5rem',
          'font-weight': '600',
          margin: '0 0 12px 0'
        }}>
          {app.language() === 'ar' ? 'تسجيل الخروج' : 'Logout'}
        </h2>
        
        {/* Message */}
        <p style={{
          color: 'var(--color-text-secondary)',
          'font-size': '1rem',
          margin: '0 0 32px 0',
          'line-height': '1.5'
        }}>
          {app.language() === 'ar' 
            ? 'هل أنت متأكد من أنك تريد تسجيل الخروج؟'
            : 'Are you sure you want to logout?'
          }
        </p>
        
        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          'justify-content': 'center'
        }}>
          {/* Cancel Button */}
          <button
            onClick={() => setShowLogoutModal(false)}
            style={{
              padding: '12px 24px',
              'border-radius': '12px',
              border: `2px solid var(--color-border)`,
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              'font-size': '1rem',
              'font-weight': '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              'min-width': '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {app.language() === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          
          {/* Logout Button */}
          <button
            onClick={() => {
              app.logout();
              setShowLogoutModal(false);
            }}
            style={{
              padding: '12px 24px',
              'border-radius': '12px',
              border: '2px solid #ef4444',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              'font-size': '1rem',
              'font-weight': '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              'min-width': '120px',
              'box-shadow': '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}
          >
            {app.language() === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {app.translate('more')}
        </h1>
      </div>
      
      {/* User Info */}
      <div style={userInfoStyle}>
        <div style={userNameStyle}>{currentUser?.name}</div>
        <div style={userRoleStyle}>{app.translate(currentUser?.role || 'student')}</div>
      </div>
      
      {/* Settings */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          {app.translate('settings')}
        </div>
        <div style={itemsContainerStyle}>
          <For each={getSettingsItems()}>
            {(item) => (
              <div 
                style={itemStyle}
                data-action={item.text}
                onClick={() => handleMenuItemClick(item)}
              >
                <div style={itemContentStyle}>
                  <span style={itemIconStyle}>{item.icon}</span>
                  <span style={itemTextStyle}>{item.text}</span>
                </div>
                {item.type === 'toggle' && (
                  <div style={toggleContainerStyle}>
                    <div style={toggleWrapperStyle}>
                      <div 
                        style={{
                          ...toggleOptionStyle,
                          background: item.value === 'light' || item.value === 'en' ? 'var(--color-primary)' : 'transparent',
                          color: item.value === 'light' || item.value === 'en' ? 'white' : 'var(--color-text-secondary)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.value !== 'light' && item.value !== 'en') {
                            item.action();
                          }
                        }}
                      >
                        {item.leftLabel}
                      </div>
                      <div 
                        style={{
                          ...toggleOptionStyle,
                          background: item.value === 'dark' || item.value === 'ar' ? 'var(--color-primary)' : 'transparent',
                          color: item.value === 'dark' || item.value === 'ar' ? 'white' : 'var(--color-text-secondary)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.value !== 'dark' && item.value !== 'ar') {
                            item.action();
                          }
                        }}
                      >
                        {item.rightLabel}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </For>
        </div>
      </div>
      
      {/* General */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          {app.translate('general')}
        </div>
        <div style={itemsContainerStyle}>
          <For each={generalItems}>
            {(item) => (
              <div 
                style={itemStyle}
                data-action={item.text}
                onClick={() => handleMenuItemClick(item)}
              >
                <div style={itemContentStyle}>
                  <span style={itemIconStyle}>{item.icon}</span>
                  <span style={itemTextStyle}>{item.text}</span>
                </div>
                {item.type === 'info' && (
                  <span style={itemValueStyle}>
                    {/* No clickable value for info items */}
                  </span>
                )}
              </div>
            )}
          </For>
        </div>
      </div>
      
      {/* Account */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          {app.translate('account')}
        </div>
        <div style={itemsContainerStyle}>
          <For each={accountItems}>
            {(item) => (
              <div 
                style={{
                  ...itemStyle,
                  ...(item.danger ? dangerItemStyle : {})
                }}
                data-action={item.text}
                onClick={() => handleMenuItemClick(item)}
              >
                <div style={itemContentStyle}>
                  <span style={itemIconStyle}>{item.icon}</span>
                  <span style={itemTextStyle}>{item.text}</span>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal() && <LogoutModal />}

      {/* CSS Animation */}
      <style>
        {`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}