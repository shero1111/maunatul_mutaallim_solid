import { For } from 'solid-js';
import { useApp } from '../store/AppStore';

export function MorePage() {
  const app = useApp();
  
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

  const toggleOptionStyle = (isActive: boolean) => ({
    padding: '6px 12px',
    'border-radius': '16px',
    'font-size': '12px',
    'font-weight': '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: isActive ? 'var(--color-primary)' : 'transparent',
    color: isActive ? 'white' : 'var(--color-text-secondary)',
    'min-width': '50px',
    'text-align': 'center' as const,
    'white-space': 'nowrap' as const
  });
  
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
  
  const settingsItems = [
    {
      icon: '🌙',
      text: app.translate('theme'),
      type: 'toggle' as const,
      value: app.theme() === 'dark',
      action: () => app.setTheme(app.theme() === 'light' ? 'dark' : 'light'),
      leftLabel: 'فاتح',
      rightLabel: 'داكن'
    },
    {
      icon: '🌐',
      text: app.translate('language'),
      type: 'toggle' as const,
      value: app.language() === 'en',
      action: () => app.setLanguage(app.language() === 'ar' ? 'en' : 'ar'),
      leftLabel: 'عربي',
      rightLabel: 'English'
    }
  ];
  
  const generalItems = [
    {
      icon: 'ℹ️',
      text: app.translate('aboutUs'),
      type: 'action' as const,
      action: () => alert('Maunatul Mutaallim v2.0 - Built with SolidJS')
    },
    {
      icon: '📖',
      text: app.translate('guide'),
      type: 'action' as const,
      action: () => alert('User guide coming soon!')
    },
    {
      icon: '🏷️',
      text: app.translate('version'),
      type: 'info' as const,
      value: '2.0.0'
    }
  ];
  
  const accountItems = [
    {
      icon: '🚪',
      text: app.translate('logout'),
      type: 'action' as const,
      action: () => {
        if (confirm('Are you sure you want to logout?')) {
          app.logout();
        }
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
        <For each={settingsItems}>
          {(item, index) => (
            <div
              style={{
                ...menuItemStyle,
                'border-bottom': index() === settingsItems.length - 1 ? 'none' : '1px solid var(--color-border)'
              }}
              data-action={item.text}
              onClick={() => handleMenuItemClick(item)}
            >
              <div style={menuItemContentStyle}>
                <div style={menuItemIconStyle}>{item.icon}</div>
                <div style={menuItemTextStyle}>{item.text}</div>
              </div>
              <div style={toggleContainerStyle}>
                <div style={toggleWrapperStyle}>
                  <div 
                    style={toggleOptionStyle(!item.value)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.value) item.action();
                    }}
                  >
                    {item.leftLabel}
                  </div>
                  <div 
                    style={toggleOptionStyle(item.value)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!item.value) item.action();
                    }}
                  >
                    {item.rightLabel}
                  </div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
      
      {/* General */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          General
        </div>
        <For each={generalItems}>
          {(item, index) => (
            <div
              style={{
                ...menuItemStyle,
                'border-bottom': index() === generalItems.length - 1 ? 'none' : '1px solid var(--color-border)'
              }}
              data-action={item.text}
              onClick={() => handleMenuItemClick(item)}
            >
              <div style={menuItemContentStyle}>
                <div style={menuItemIconStyle}>{item.icon}</div>
                <div style={menuItemTextStyle}>{item.text}</div>
              </div>
              {item.type === 'info' ? (
                <div style={{
                  'font-size': '14px',
                  color: 'var(--color-text-secondary)'
                }}>
                  {item.value}
                </div>
              ) : (
                <div style={menuItemArrowStyle}>›</div>
              )}
            </div>
          )}
        </For>
      </div>
      
      {/* Account */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          Account
        </div>
        <For each={accountItems}>
          {(item, index) => (
            <div
              style={{
                ...menuItemStyle,
                'border-bottom': index() === accountItems.length - 1 ? 'none' : '1px solid var(--color-border)'
              }}
              data-action={item.text}
              onClick={() => handleMenuItemClick(item)}
            >
              <div style={menuItemContentStyle}>
                <div style={menuItemIconStyle}>{item.icon}</div>
                <div style={{
                  ...menuItemTextStyle,
                  color: item.danger ? 'var(--color-error)' : 'var(--color-text)'
                }}>
                  {item.text}
                </div>
              </div>
              <div style={menuItemArrowStyle}>›</div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}