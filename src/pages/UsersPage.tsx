import { createSignal, createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';
import { User, Student } from '../types';
import { getStatusColor } from '../styles/themes';
import { UserModal } from '../components/UserModal';

export function UsersPage() {
  const app = useApp();
  const [searchTerm, setSearchTerm] = createSignal('');
  const [selectedRole, setSelectedRole] = createSignal('all');
  const [selectedUser, setSelectedUser] = createSignal<User | null>(null);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  
  // Filtered users with role-based access control
  const filteredUsers = createMemo(() => {
    let users = app.users();
    const currentUser = app.currentUser();
    
    // Hide admins from leaders (only admins can see other admins)
    if (currentUser?.role === 'leitung') {
      users = users.filter(u => u.role !== 'superuser');
    }
    
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
  
  // Role options depend on current user's role
  const roles = createMemo(() => {
    const currentUser = app.currentUser();
    if (currentUser?.role === 'leitung') {
      // Leaders don't see admin option
      return ['all', 'student', 'lehrer', 'leitung'];
    }
    return ['all', 'student', 'lehrer', 'leitung', 'superuser'];
  });
  
  // Function to get search results text
  const getSearchResultsText = () => {
    const count = filteredUsers().length;
    if (count === 0) {
      return app.translate('noUsersFound');
    } else if (count === 1) {
      return app.language() === 'ar' ? app.translate('userFound') : app.translate('userFound');
    } else {
      return app.language() === 'ar' 
        ? `${app.translate('foundUsers')} ${count} ${app.translate('usersFound').split(' ')[2]}` // "وُجد X مستخدمين"
        : `Found ${count} users`;
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  
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
          <For each={roles()}>
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
          'margin-bottom': '12px',
          'font-weight': '500'
        }}>
          {getSearchResultsText()}
        </div>
      </div>
      
      <For each={filteredUsers()}>
        {(user) => (
          <div 
            style={{
              background: 'var(--color-background)',
              'border-radius': '12px',
              padding: '16px',
              'margin-bottom': '12px',
              'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid var(--color-border)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => handleUserClick(user)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              display: 'flex',
              'align-items': 'center',
              gap: '12px'
            }}>
              {/* Role Tag on the left */}
              <span style={{
                ...roleTagStyle(user.role),
                'font-size': '11px',
                padding: '4px 10px',
                'min-width': 'fit-content',
                'flex-shrink': '0'
              }}>
                {app.translate(user.role)}
              </span>
              
              {/* User Name */}
              <div style={{ flex: '1', 'min-width': '0' }}>
                <div style={{
                  'font-size': '16px',
                  'font-weight': '600',
                  color: 'var(--color-text)',
                  'white-space': 'nowrap',
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis'
                }}>
                  {user.name}
                </div>
              </div>
              
              {/* Activity Indicator on the right */}
              <Show when={user.isActive !== undefined}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  'border-radius': '50%',
                  'background-color': user.isActive ? 'var(--color-success)' : 'var(--color-border)',
                  'flex-shrink': '0',
                  border: user.isActive ? 'none' : '2px solid var(--color-border)',
                  'box-shadow': user.isActive ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none'
                }} />
              </Show>
            </div>
          </div>
        )}
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

      <UserModal
        user={selectedUser()}
        isOpen={isModalOpen()}
        onClose={handleModalClose}
        isViewMode={true}
      />
    </div>
  );
}