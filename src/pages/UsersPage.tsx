import { createSignal, createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';
import { User, Student } from '../types';
import { getStatusColor } from '../styles/themes';

export function UsersPage() {
  const app = useApp();
  const [searchTerm, setSearchTerm] = createSignal('');
  const [selectedRole, setSelectedRole] = createSignal('all');
  
  // Filtered users - NO DEBOUNCING needed in SolidJS!
  const filteredUsers = createMemo(() => {
    let users = app.users();
    
    // Filter by role
    if (selectedRole() !== 'all') {
      users = users.filter(u => u.role === selectedRole());
    }
    
    // Filter by search term - INSTANT without keyboard issues
    const term = searchTerm().toLowerCase().trim();
    if (term) {
      users = users.filter(u => 
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
      );
    }
    
    return users;
  });
  
  const roles = ['all', 'student', 'lehrer', 'leitung', 'superuser'];
  
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
  
  // PERFECT SEARCH INPUT - löst alle Keyboard-Probleme
  const searchStyle = {
    width: '100%',
    padding: '8px',
    'font-size': '16px', // Critical for iOS - prevents zoom
    border: '1px solid var(--color-border)',
    'border-radius': '6px',
    'background-color': 'var(--color-background)',
    color: 'var(--color-text)',
    'margin-bottom': '8px',
    outline: 'none',
    'box-sizing': 'border-box' as const,
    '-webkit-appearance': 'none',
    '-webkit-tap-highlight-color': 'transparent'
  };
  
  const roleFilterStyle = {
    display: 'flex',
    gap: '8px',
    'margin-bottom': '16px',
    'overflow-x': 'auto',
    padding: '4px 0'
  };
  
  const roleButtonStyle = (isActive: boolean) => ({
    padding: '6px 12px',
    'border-radius': '16px',
    border: '1px solid var(--color-border)',
    'background-color': isActive ? 'var(--color-primary)' : 'var(--color-background)',
    color: isActive ? 'white' : 'var(--color-text)',
    'font-size': '12px',
    cursor: 'pointer',
    'white-space': 'nowrap' as const,
    transition: 'all 0.2s',
    '-webkit-tap-highlight-color': 'transparent'
  });
  
  const userCardStyle = {
    'background-color': 'var(--color-background)',
    'border-radius': '12px',
    padding: '16px',
    'margin-bottom': '12px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--color-border)'
  };
  
  const userHeaderStyle = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-between',
    'margin-bottom': '8px'
  };
  
  const userNameStyle = {
    'font-size': '16px',
    'font-weight': 'bold',
    color: 'var(--color-text)'
  };
  
  const userUsernameStyle = {
    'font-size': '14px',
    color: 'var(--color-text-secondary)',
    'margin-bottom': '4px'
  };
  
  const roleTagStyle = (role: string) => {
    const colors: Record<string, string> = {
      superuser: 'var(--color-error)',
      leitung: 'var(--color-warning)',
      lehrer: 'var(--color-primary)',
      student: 'var(--color-success)'
    };
    
    return {
      'background-color': colors[role] || 'var(--color-text-secondary)',
      color: 'white',
      padding: '2px 8px',
      'border-radius': '10px',
      'font-size': '10px',
      'font-weight': '500'
    };
  };
  
  const statusIndicatorStyle = (status: 'not_available' | 'revising' | 'khatamat') => ({
    width: '10px',
    height: '10px',
    'border-radius': '50%',
    'background-color': getStatusColor(status),
    'margin-right': '6px',
    'flex-shrink': '0'
  });
  
  const statusContainerStyle = {
    display: 'flex',
    'align-items': 'center',
    'margin-top': '8px'
  };
  
  const getUserDisplayInfo = (user: User) => {
    if (user.role === 'student') {
      const student = user as Student;
      return {
        status: student.status,
        statusText: app.translate(student.status),
        lastUpdate: student.status_changed_at
      };
    }
    return null;
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {app.translate('users')}
        </h1>
        
        {/* PERFECT SEARCH - NO KEYBOARD ISSUES */}
        <input
          type="text"
          placeholder={`${app.translate('searchUsers')}...`}
          value={searchTerm()}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          style={searchStyle}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
        />
        
        <div style={roleFilterStyle}>
          <For each={roles}>
            {(role) => (
              <button
                style={roleButtonStyle(selectedRole() === role)}
                onClick={() => setSelectedRole(role)}
              >
                {role === 'all' ? 'All' : app.translate(role)}
              </button>
            )}
          </For>
        </div>
        
        <div style={{
          'font-size': '14px',
          color: 'var(--color-text-secondary)',
          'text-align': 'center',
          'margin-bottom': '8px'
        }}>
          {filteredUsers().length} {app.translate('noUsersFound').split(' ')[0]} found
        </div>
      </div>
      
      <For each={filteredUsers()}>
        {(user) => {
          const displayInfo = getUserDisplayInfo(user);
          
          return (
            <div style={userCardStyle}>
              <div style={userHeaderStyle}>
                <div>
                  <div style={userNameStyle}>{user.name}</div>
                  <div style={userUsernameStyle}>@{user.username}</div>
                </div>
                <div style={roleTagStyle(user.role)}>
                  {app.translate(user.role)}
                </div>
              </div>
              
              <Show when={displayInfo}>
                {(info) => (
                  <div style={statusContainerStyle}>
                    <div style={statusIndicatorStyle(info().status)} />
                    <span style={{
                      'font-size': '12px',
                      color: 'var(--color-text-secondary)'
                    }}>
                      {info().statusText} • {formatDate(info().lastUpdate)}
                    </span>
                  </div>
                )}
              </Show>
              
              <div style={{
                'font-size': '12px',
                color: 'var(--color-text-secondary)',
                'margin-top': '8px'
              }}>
                {app.translate('createdAt')}: {formatDate(user.created_at)}
              </div>
              
              <Show when={user.isActive}>
                <div style={{
                  'margin-top': '8px',
                  padding: '4px 8px',
                  'background-color': 'var(--color-success)',
                  color: 'white',
                  'border-radius': '12px',
                  'font-size': '10px',
                  'font-weight': '500',
                  'display': 'inline-block'
                }}>
                  {app.translate('active')}
                </div>
              </Show>
            </div>
          );
        }}
      </For>
      
      <Show when={filteredUsers().length === 0}>
        <div style={{
          'text-align': 'center',
          padding: '40px 20px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>👥</div>
          <div>{app.translate('noUsersFound')}</div>
          <Show when={searchTerm()}>
            <div style={{ 'margin-top': '8px', 'font-size': '14px' }}>
              Try a different search term
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}