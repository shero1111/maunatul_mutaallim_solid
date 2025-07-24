import { createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Student } from '../types';
import { getStatusColor } from '../styles/themes';

export function HomePage() {
  const app = useApp();
  
  // Computed statistics
  const stats = createMemo(() => {
    const users = app.users();
    const halaqat = app.halaqat();
    const students = users.filter(u => u.role === 'student') as Student[];
    const teachers = users.filter(u => u.role === 'lehrer');
    
    const statusCounts = {
      not_available: students.filter(s => s.status === 'not_available').length,
      revising: students.filter(s => s.status === 'revising').length,
      khatamat: students.filter(s => s.status === 'khatamat').length
    };
    
    return {
      totalUsers: users.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalHalaqat: halaqat.length,
      statusCounts
    };
  });
  
  const containerStyle = {
    padding: '20px 16px 80px 16px',
    'background-color': 'var(--color-surface)',
    'min-height': '100vh'
  };
  
  const headerStyle = {
    'text-align': 'center' as const,
    'margin-bottom': '24px'
  };
  
  const titleStyle = {
    'font-size': '24px',
    'font-weight': 'bold',
    color: 'var(--color-text)',
    'margin-bottom': '8px',
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const welcomeStyle = {
    'font-size': '16px',
    color: 'var(--color-text-secondary)',
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const gridStyle = {
    display: 'grid',
    'grid-template-columns': 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    'margin-bottom': '24px'
  };
  
  const cardStyle = {
    'background-color': 'var(--color-background)',
    padding: '20px',
    'border-radius': '12px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--color-border)',
    'text-align': 'center' as const
  };
  
  const statNumberStyle = {
    'font-size': '32px',
    'font-weight': 'bold',
    color: 'var(--color-primary)',
    'margin-bottom': '8px'
  };
  
  const statLabelStyle = {
    'font-size': '14px',
    color: 'var(--color-text-secondary)',
    'font-weight': '500'
  };
  
  const statusCardStyle = (color: string) => ({
    ...cardStyle,
    'border-left': `4px solid ${color}`
  });
  
  const quickActionsStyle = {
    'margin-top': '24px'
  };
  
  const sectionTitleStyle = {
    'font-size': '18px',
    'font-weight': 'bold',
    color: 'var(--color-text)',
    'margin-bottom': '16px',
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const actionButtonStyle = {
    width: '100%',
    padding: '16px',
    'background-color': 'var(--color-primary)',
    color: 'white',
    border: 'none',
    'border-radius': '8px',
    'font-size': '16px',
    'font-weight': '500',
    cursor: 'pointer',
    'margin-bottom': '12px',
    transition: 'background-color 0.2s',
    '-webkit-tap-highlight-color': 'transparent'
  };
  
  const currentUser = app.currentUser();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return app.language() === 'ar' ? 'صباح الخير' : 'Good Morning';
    if (hour < 18) return app.language() === 'ar' ? 'مساء الخير' : 'Good Afternoon';
    return app.language() === 'ar' ? 'مساء الخير' : 'Good Evening';
  };
  
  const quickActions = () => {
    switch (currentUser?.role) {
      case 'student':
        return [
          { label: app.translate('mutuun'), action: () => app.setCurrentPage('mutuun') },
          { label: app.translate('halaqat'), action: () => app.setCurrentPage('halaqat') }
        ];
      case 'lehrer':
        return [
          { label: app.translate('halaqat'), action: () => app.setCurrentPage('halaqat') },
          { label: app.translate('users'), action: () => app.setCurrentPage('users') }
        ];
      default:
        return [
          { label: app.translate('users'), action: () => app.setCurrentPage('users') },
          { label: app.translate('halaqat'), action: () => app.setCurrentPage('halaqat') },
          { label: app.translate('news'), action: () => app.setCurrentPage('news') }
        ];
    }
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {app.translate('appName')}
        </h1>
        <p style={welcomeStyle}>
          {getGreeting()}, {currentUser?.name}
        </p>
      </div>
      
      <Show when={currentUser?.role !== 'student'}>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={statNumberStyle}>{stats().totalUsers}</div>
            <div style={statLabelStyle}>{app.translate('totalUsers')}</div>
          </div>
          
          <div style={cardStyle}>
            <div style={statNumberStyle}>{stats().totalTeachers}</div>
            <div style={statLabelStyle}>{app.translate('totalTeachers')}</div>
          </div>
          
          <div style={cardStyle}>
            <div style={statNumberStyle}>{stats().totalHalaqat}</div>
            <div style={statLabelStyle}>{app.translate('totalHalaqat')}</div>
          </div>
        </div>
        
        <div style={sectionTitleStyle}>
          {app.translate('studentsStatus')}
        </div>
        
        <div style={gridStyle}>
          <div style={statusCardStyle(getStatusColor('not_available'))}>
            <div style={statNumberStyle}>{stats().statusCounts.not_available}</div>
            <div style={statLabelStyle}>{app.translate('not_available')}</div>
          </div>
          
          <div style={statusCardStyle(getStatusColor('revising'))}>
            <div style={statNumberStyle}>{stats().statusCounts.revising}</div>
            <div style={statLabelStyle}>{app.translate('revising')}</div>
          </div>
          
          <div style={statusCardStyle(getStatusColor('khatamat'))}>
            <div style={statNumberStyle}>{stats().statusCounts.khatamat}</div>
            <div style={statLabelStyle}>{app.translate('khatamat')}</div>
          </div>
        </div>
      </Show>
      
      <div style={quickActionsStyle}>
        <div style={sectionTitleStyle}>
          Quick Actions
        </div>
        
        <For each={quickActions()}>
          {(action) => (
            <button
              style={actionButtonStyle}
              onClick={action.action}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            >
              {action.label}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}