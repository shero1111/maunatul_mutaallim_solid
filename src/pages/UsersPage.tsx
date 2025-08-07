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
  
  // Add User modal state
  const [showAddUserModal, setShowAddUserModal] = createSignal(false);
  const [newUserFullName, setNewUserFullName] = createSignal('');
  const [newUserUsername, setNewUserUsername] = createSignal('');
  const [newUserPassword, setNewUserPassword] = createSignal('');
  const [newUserConfirmPassword, setNewUserConfirmPassword] = createSignal('');
  const [newUserRole, setNewUserRole] = createSignal('student');
  const [newUserActive, setNewUserActive] = createSignal(true);
  
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
        u.full_name.toLowerCase().includes(term) ||
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

  // Add User helper functions
  const openAddUserModal = () => {
    setNewUserFullName('');
    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserConfirmPassword('');
    setNewUserRole('student');
    setNewUserActive(true);
    setShowAddUserModal(true);
  };

  const closeAddUserModal = () => {
    setShowAddUserModal(false);
    setNewUserFullName('');
    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserConfirmPassword('');
    setNewUserRole('student');
    setNewUserActive(true);
  };

  const validateNewUser = (): string | null => {
    if (!newUserFullName().trim()) {
      return app.translate('fullNameRequired');
    }
    if (!newUserUsername().trim()) {
      return app.translate('userNameRequired');
    }
    if (!newUserPassword().trim()) {
      return app.translate('passwordRequired');
    }
    if (newUserPassword().length < 4) {
      return app.translate('passwordTooShort');
    }
    if (newUserPassword() !== newUserConfirmPassword()) {
      return app.translate('passwordsDoNotMatch');
    }
    return null;
  };

  const saveNewUser = async () => {
    const validationError = validateNewUser();
    if (validationError) {
      alert(validationError);
      return;
    }

    const userData = {
      full_name: newUserFullName().trim(),
      username: newUserUsername().trim(),
      password: newUserPassword(),
      role: newUserRole() as 'student' | 'lehrer' | 'admin',
      isActive: newUserActive()
    };

    const success = await app.createUser(userData);
    
    if (success) {
      closeAddUserModal();
      // Optional: Show success message
      console.log('✅ User created successfully');
    } else {
      alert(app.translate('usernameExists'));
    }
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

      {/* Floating Add User Button */}
      <Show when={app.currentUser()?.role === 'admin'}>
        <button
          onClick={openAddUserModal}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '60px',
            height: '60px',
            'border-radius': '50%',
            'background-color': 'var(--color-primary)',
            color: 'white',
            border: 'none',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            'font-size': '24px',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            transition: 'all 0.3s ease',
            'z-index': '100',
            'user-select': 'none',
            '-webkit-user-select': 'none',
            '-moz-user-select': 'none',
            '-ms-user-select': 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          title={app.translate('addUser')}
        >
          ➕
        </button>
      </Show>

      {/* Add User Modal */}
      <Show when={showAddUserModal()}>
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          'background-color': 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          'justify-content': 'center',
          'align-items': 'center',
          'z-index': '1000'
        }}>
          <div style={{
            'background-color': 'var(--color-surface)',
            'border-radius': '12px',
            padding: '24px',
            'max-width': '500px',
            width: '90%',
            'max-height': '80vh',
            'overflow-y': 'auto',
            'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              'justify-content': 'space-between',
              'align-items': 'center',
              'margin-bottom': '20px'
            }}>
              <h3 style={{
                margin: '0',
                color: 'var(--color-text)',
                'font-size': '18px'
              }}>
                {app.translate('createNewUser')}
              </h3>
              <button
                onClick={closeAddUserModal}
                style={{
                  'background-color': 'transparent',
                  border: 'none',
                  'font-size': '20px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
              {/* Full Name */}
              <div>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': 'bold',
                  color: 'var(--color-text)'
                }}>
                  {app.translate('fullName')} *
                </label>
                <input
                  type="text"
                  value={newUserFullName()}
                  onInput={(e) => setNewUserFullName(e.currentTarget.value)}
                  placeholder={app.language() === 'ar' ? 'أدخل الاسم الكامل' : 'Enter full name'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-background)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box'
                  }}
                />
              </div>

              {/* Username */}
              <div>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': 'bold',
                  color: 'var(--color-text)'
                }}>
                  {app.translate('userName')} *
                </label>
                <input
                  type="text"
                  value={newUserUsername()}
                  onInput={(e) => setNewUserUsername(e.currentTarget.value)}
                  placeholder={app.language() === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-background)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box'
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': 'bold',
                  color: 'var(--color-text)'
                }}>
                  {app.translate('password')} *
                </label>
                <input
                  type="password"
                  value={newUserPassword()}
                  onInput={(e) => setNewUserPassword(e.currentTarget.value)}
                  placeholder={app.language() === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-background)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box'
                  }}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': 'bold',
                  color: 'var(--color-text)'
                }}>
                  {app.translate('confirmPassword')} *
                </label>
                <input
                  type="password"
                  value={newUserConfirmPassword()}
                  onInput={(e) => setNewUserConfirmPassword(e.currentTarget.value)}
                  placeholder={app.language() === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-background)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box'
                  }}
                />
              </div>

              {/* Role */}
              <div>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': 'bold',
                  color: 'var(--color-text)'
                }}>
                  {app.translate('role')}
                </label>
                <select
                  value={newUserRole()}
                  onChange={(e) => setNewUserRole(e.currentTarget.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-background)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="student">{app.translate('student')}</option>
                  <option value="lehrer">{app.translate('teacher')}</option>
                  <option value="admin">{app.translate('admin')}</option>
                </select>
              </div>

              {/* Active Status */}
              <div>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': 'bold',
                  color: 'var(--color-text)'
                }}>
                  {app.translate('isActive')}
                </label>
                <select
                  value={newUserActive() ? 'true' : 'false'}
                  onChange={(e) => setNewUserActive(e.currentTarget.value === 'true')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-background)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="true">{app.translate('active')}</option>
                  <option value="false">{app.translate('inactive')}</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                'justify-content': 'space-between',
                'margin-top': '20px',
                gap: '12px'
              }}>
                <button
                  onClick={closeAddUserModal}
                  style={{
                    padding: '12px 20px',
                    'background-color': 'var(--color-text-secondary)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '8px',
                    cursor: 'pointer',
                    flex: '1'
                  }}
                >
                  {app.translate('cancel')}
                </button>
                <button
                  onClick={saveNewUser}
                  disabled={!newUserFullName().trim() || !newUserUsername().trim() || !newUserPassword().trim()}
                  style={{
                    padding: '12px 20px',
                    'background-color': (!newUserFullName().trim() || !newUserUsername().trim() || !newUserPassword().trim())
                      ? 'var(--color-text-secondary)' 
                      : 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '8px',
                    cursor: (!newUserFullName().trim() || !newUserUsername().trim() || !newUserPassword().trim()) 
                      ? 'not-allowed' : 'pointer',
                    opacity: (!newUserFullName().trim() || !newUserUsername().trim() || !newUserPassword().trim()) 
                      ? '0.5' : '1',
                    flex: '1'
                  }}
                >
                  ➕ {app.translate('addUser')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>

      <UserModal
        user={selectedUser()}
        isOpen={isModalOpen()}
        onClose={handleModalClose}
      />
    </div>
  );
}