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
    'background-color': isActive ? 'var(--color-primary)' : 'transparent',
    color: isActive ? 'white' : 'var(--color-text)',
    transition: 'all 0.2s',
    'text-decoration': 'none',
    border: 'none',
    '-webkit-tap-highlight-color': 'transparent'
  });
  
  const iconStyle = {
    'font-size': '20px',
    'margin-bottom': '4px'
  };
  
  const labelStyle = {
    'font-size': '11px',
    'font-weight': '500',
    'text-align': 'center' as const,
    'line-height': '1.2'
  };
  
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
    app.setCurrentPage(page);
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
              <div style={iconStyle}>{item.icon}</div>
              <div style={labelStyle}>{item.label}</div>
            </button>
          );
        }}
      </For>
    </nav>
  );
}