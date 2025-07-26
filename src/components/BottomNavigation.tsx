import { For, createMemo } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Page } from '../types';

export function BottomNavigation() {
  const app = useApp();
  
  // Make currentUser reactive and safe
  const currentUser = createMemo(() => app.currentUser());
  
  // Make navigation items reactive to language changes
  const navigationItems = createMemo(() => [
    { page: 'home' as Page, icon: '🏠', label: app.translate('home') },
    { page: 'mutuun' as Page, icon: '📚', label: app.translate('mutuun') },
    { page: 'halaqat' as Page, icon: '👥', label: app.translate('halaqat') },
    { page: 'users' as Page, icon: '👤', label: app.translate('users') },
    { page: 'news' as Page, icon: '📰', label: app.translate('news') },
    { page: 'more' as Page, icon: '⚙️', label: app.translate('more') }
  ]);
  
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
    outline: 'none',
    '-webkit-tap-highlight-color': 'transparent',
    position: 'relative' as const
  });
  
  const iconStyle = (isActive: boolean) => ({
    'font-size': isActive ? '22px' : '20px',
    'margin-bottom': '4px',
    transform: isActive ? 'scale(1.05)' : 'scale(1)',
    transition: 'all 0.2s ease'
  });
  
  const labelStyle = {
    'font-size': '10px',
    'font-weight': '500' as const
  };
  
  // Safely get visible items based on user role
  const getVisibleItems = createMemo(() => {
    const user = currentUser();
    if (!user) {
      console.warn('⚠️ No current user for navigation');
      return []; // Return empty array if no user
    }
    
    try {
      switch (user.role) {
        case 'superuser':
        case 'leitung':
          return navigationItems();
        case 'lehrer':
          return navigationItems().filter(item => 
            ['home', 'mutuun', 'news', 'more'].includes(item.page)
          );
        case 'student':
          return navigationItems().filter(item => 
            ['home', 'mutuun', 'news', 'more'].includes(item.page)
          );
        default:
          console.warn('⚠️ Unknown user role:', user.role);
          return navigationItems().filter(item => 
            ['home', 'mutuun', 'news', 'more'].includes(item.page)
          );
      }
    } catch (error) {
      console.error('💥 Error in getVisibleItems:', error);
      return []; // Safe fallback
    }
  });
  
  const handleNavigation = (page: Page) => {
    try {
      console.log('🔄 Navigation to:', page);
      
      // Mark news as read when navigating to news page
      if (page === 'news') {
        const user = currentUser();
        if (user) {
          const updatedUser = {
            ...user,
            lastNewsRead: new Date().toISOString()
          };
          app.updateUser(updatedUser);
        }
      }
      
      app.setCurrentPage(page);
      console.log('✅ Navigation successful to:', page);
    } catch (error) {
      console.error('💥 Navigation error:', error);
    }
  };
  
  // Calculate unread news count safely
  const getUnreadNewsCount = createMemo(() => {
    try {
      const user = currentUser();
      if (!user) return 0;
      
      const lastRead = user.lastNewsRead ? new Date(user.lastNewsRead) : new Date(0);
      const unreadNews = app.news().filter(news => new Date(news.created_at) > lastRead);
      return unreadNews.length;
    } catch (error) {
      console.error('💥 Error calculating unread news:', error);
      return 0;
    }
  });
  
  const visibleItems = getVisibleItems();
  
  // Don't render if no items or no user
  if (!visibleItems.length || !currentUser()) {
    console.warn('⚠️ BottomNavigation: No items or user, not rendering');
    return null;
  }
  
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
                'background-color': isActive() ? 'var(--color-primary)' : 'transparent',
                'border-radius': '0 0 2px 2px',
                transition: 'background-color 0.2s ease'
              }} />
              
              <div style={iconStyle(isActive())}>
                {item.icon}
                {/* News Badge */}
                {item.page === 'news' && getUnreadNewsCount() > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--color-error)',
                    color: 'white',
                    'border-radius': '50%',
                    'min-width': '16px',
                    height: '16px',
                    'font-size': '10px',
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'font-weight': 'bold'
                  }}>
                    {getUnreadNewsCount() > 9 ? '9+' : getUnreadNewsCount()}
                  </div>
                )}
              </div>
              <span style={labelStyle}>{item.label}</span>
            </button>
          );
        }}
      </For>
    </nav>
  );
}