import { For } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Page } from '../types';

export function BottomNavigation() {
  const app = useApp();
  
  const navigationItems: { page: Page; icon: string; label: string }[] = [
    { page: 'home', icon: '🏠', label: app.translate('home') },
    { page: 'mutuun', icon: '📚', label: app.translate('mutuun') },
    { page: 'halaqat', icon: '👥', label: app.translate('halaqat') },
    { page: 'users', icon: '👤', label: app.translate('users') },
    { page: 'news', icon: '📰', label: app.translate('news') },
    { page: 'more', icon: '⚙️', label: app.translate('more') }
  ];
  
  const containerStyle = (itemCount: number) => ({
    position: 'fixed' as const,
    bottom: '0',
    left: '0',
    right: '0',
    'background-color': 'var(--color-background)',
    'border-top': '1px solid var(--color-border)',
    display: 'grid',
    'grid-template-columns': `repeat(${itemCount}, 1fr)`,
    'z-index': '1000',
    'box-shadow': '0 -2px 10px rgba(0, 0, 0, 0.1)'
  });
  
  const itemStyle = (isActive: boolean) => ({
    display: 'flex',
    'flex-direction': 'column' as const,
    'align-items': 'center',
    'justify-content': 'center',
    padding: '8px 4px',
    'min-height': '60px',
    cursor: 'pointer',
    'background-color': 'transparent',
    color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
    transition: 'all 0.2s ease',
    'text-decoration': 'none',
    border: 'none',
    '-webkit-tap-highlight-color': 'transparent',
    position: 'relative' as const
  });
  
  const iconStyle = (isActive: boolean) => ({
    'font-size': isActive ? '22px' : '20px',
    'margin-bottom': '4px',
    transition: 'all 0.2s ease',
    transform: isActive ? 'scale(1.05)' : 'scale(1)'
  });
  
  const labelStyle = (isActive: boolean) => ({
    'font-size': '11px',
    'font-weight': isActive ? '600' : '500',
    'text-align': 'center' as const,
    'line-height': '1.2',
    transition: 'all 0.2s ease'
  });
  
  // Filter navigation based on user role
  const getVisibleItems = () => {
    const user = app.currentUser();
    if (!user) return [];
    
    switch (user.role) {
      case 'student':
        return navigationItems.filter(item => 
          ['home', 'mutuun', 'halaqat', 'news', 'more'].includes(item.page)
        );
      case 'lehrer':
        return navigationItems.filter(item => 
          ['home', 'mutuun', 'halaqat', 'users', 'news', 'more'].includes(item.page)
        );
      case 'leitung':
      case 'superuser':
        return navigationItems;
      default:
        return navigationItems;
    }
  };
  
  const handleNavigation = (page: Page) => {
    console.log('🧭 Navigation clicked:', page, 'current:', app.currentPage());
    app.setCurrentPage(page);
    console.log('🧭 After setCurrentPage:', app.currentPage());
  };
  
  const visibleItems = getVisibleItems();
  
  return (
    <nav style={containerStyle(visibleItems.length)}>
      <For each={visibleItems}>
        {(item) => {
          const isActive = () => app.currentPage() === item.page;
          
          return (
            <button
              style={itemStyle(isActive())}
              onClick={() => handleNavigation(item.page)}
              type="button"
            >
              {/* Top Indicator Bar - Nur bei aktiv */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '25%',
                right: '25%',
                height: '3px',
                'background': isActive() 
                  ? 'var(--color-primary)' 
                  : 'transparent',
                'border-radius': '0 0 2px 2px',
                transition: 'all 0.2s ease'
              }} />
              
              <div style={iconStyle(isActive())}>{item.icon}</div>
              <div style={labelStyle(isActive())}>{item.label}</div>
            </button>
          );
        }}
      </For>
    </nav>
  );
}