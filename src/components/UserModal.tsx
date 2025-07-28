import { createSignal, Show, For } from 'solid-js';
import { useApp } from '../store/AppStore';
import { User } from '../types';

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  isViewMode?: boolean; // New prop to show view-only mode
}

export function UserModal(props: UserModalProps) {
  const app = useApp();
  const [name, setName] = createSignal('');
  const [username, setUsername] = createSignal('');
  const [role, setRole] = createSignal('');
  const [isActive, setIsActive] = createSignal(true);
  const [showPasswordConfirm, setShowPasswordConfirm] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);

  // Initialize form when user changes
  const initializeForm = () => {
    if (props.user) {
      setName(props.user.name);
      setUsername(props.user.username);
      setRole(props.user.role);
      setIsActive(props.user.isActive ?? true);
    }
  };

  // Call initializeForm when modal opens
  const handleModalOpen = () => {
    if (props.isOpen && props.user) {
      initializeForm();
    }
  };

  // Watch for modal opening
  handleModalOpen();

  const handleSave = async () => {
    if (!props.user) return;
    
    setIsLoading(true);
    try {
      const updatedUser: User = {
        ...props.user,
        name: name(),
        username: username(),
        role: role() as any,
        isActive: isActive()
      };
      
      // Here you would call app.updateUser(updatedUser) or similar
      console.log('Updating user:', updatedUser);
      
      props.onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!props.user) return;
    
    setIsLoading(true);
    try {
      // Here you would call app.resetUserPassword(props.user.id)
      console.log('Resetting password for user:', props.user.id);
      
      setShowPasswordConfirm(false);
      // Show success message or notification
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles = () => {
    const currentUser = app.currentUser();
    if (currentUser?.role === 'leitung') {
      return ['student', 'lehrer', 'leitung'];
    }
    return ['student', 'lehrer', 'leitung', 'superuser'];
  };

  const canEdit = () => {
    const currentUser = app.currentUser();
    return (currentUser?.role === 'superuser' || currentUser?.role === 'leitung') && !props.isViewMode;
  };

  const canView = () => {
    const currentUser = app.currentUser();
    return currentUser?.role === 'superuser' || currentUser?.role === 'leitung';
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    'background-color': 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'z-index': '1000',
    padding: '20px'
  };

  const modalContentStyle = {
    background: 'var(--color-background)',
    'border-radius': '16px',
    padding: '24px',
    width: '100%',
    'max-width': '500px',
    'max-height': '90vh',
    'overflow-y': 'auto' as const,
    'box-shadow': '0 10px 30px rgba(0,0,0,0.3)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--color-border)',
    'border-radius': '8px',
    'font-size': '16px',
    'background-color': 'var(--color-surface)',
    color: 'var(--color-text)',
    'margin-bottom': '16px'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  const buttonStyle = {
    padding: '12px 20px',
    'border-radius': '8px',
    border: 'none',
    'font-size': '14px',
    'font-weight': '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    'background-color': 'var(--color-primary)',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    'background-color': 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    'background-color': 'var(--color-error)',
    color: 'white'
  };

  if (!canView()) {
    return null;
  }

  return (
    <Show when={props.isOpen && props.user}>
      <div style={modalOverlayStyle} onClick={props.onClose}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <h2 style={{
            'font-size': '20px',
            'font-weight': '600',
            color: 'var(--color-text)',
            'margin-bottom': '20px',
            'text-align': 'center'
          }}>
            {props.isViewMode ? 'تفاصيل المستخدم' : app.translate('editUser')}
          </h2>

          {/* View Mode - Display user info */}
          <Show when={props.isViewMode}>
            <div style={{ 'margin-bottom': '24px' }}>
              {/* User Avatar/Icon */}
              <div style={{
                'text-align': 'center',
                'margin-bottom': '20px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  'border-radius': '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), #3b82f6)',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  margin: '0 auto',
                  'font-size': '2rem',
                  color: 'white',
                  'font-weight': '600'
                }}>
                  {props.user?.name?.charAt(0)?.toUpperCase() || '👤'}
                </div>
              </div>

              {/* User Details Grid */}
              <div style={{
                display: 'grid',
                gap: '16px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--color-surface)',
                  'border-radius': '8px',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{
                    'font-size': '12px',
                    color: 'var(--color-text-secondary)',
                    'margin-bottom': '4px',
                    'font-weight': '500'
                  }}>
                    {app.translate('fullName')}
                  </div>
                  <div style={{
                    'font-size': '16px',
                    color: 'var(--color-text)',
                    'font-weight': '600'
                  }}>
                    {props.user?.name}
                  </div>
                </div>

                <div style={{
                  padding: '12px 16px',
                  background: 'var(--color-surface)',
                  'border-radius': '8px',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{
                    'font-size': '12px',
                    color: 'var(--color-text-secondary)',
                    'margin-bottom': '4px',
                    'font-weight': '500'
                  }}>
                    {app.translate('userName')}
                  </div>
                  <div style={{
                    'font-size': '16px',
                    color: 'var(--color-text)',
                    'font-weight': '600'
                  }}>
                    @{props.user?.username}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  'grid-template-columns': '1fr 1fr',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--color-surface)',
                    'border-radius': '8px',
                    border: '1px solid var(--color-border)'
                  }}>
                    <div style={{
                      'font-size': '12px',
                      color: 'var(--color-text-secondary)',
                      'margin-bottom': '4px',
                      'font-weight': '500'
                    }}>
                      {app.translate('role')}
                    </div>
                    <span style={{
                      ...roleTagStyle(props.user?.role || ''),
                      'font-size': '12px',
                      padding: '4px 8px'
                    }}>
                      {app.translate(props.user?.role || '')}
                    </span>
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--color-surface)',
                    'border-radius': '8px',
                    border: '1px solid var(--color-border)'
                  }}>
                    <div style={{
                      'font-size': '12px',
                      color: 'var(--color-text-secondary)',
                      'margin-bottom': '4px',
                      'font-weight': '500'
                    }}>
                      الحالة
                    </div>
                    <div style={{
                      display: 'flex',
                      'align-items': 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        'border-radius': '50%',
                        'background-color': props.user?.isActive ? 'var(--color-success)' : 'var(--color-border)',
                        border: props.user?.isActive ? 'none' : '2px solid var(--color-border)'
                      }} />
                      <span style={{
                        'font-size': '14px',
                        color: 'var(--color-text)',
                        'font-weight': '500'
                      }}>
                        {props.user?.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '12px 16px',
                  background: 'var(--color-surface)',
                  'border-radius': '8px',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{
                    'font-size': '12px',
                    color: 'var(--color-text-secondary)',
                    'margin-bottom': '4px',
                    'font-weight': '500'
                  }}>
                    تاريخ الإنشاء
                  </div>
                  <div style={{
                    'font-size': '14px',
                    color: 'var(--color-text)'
                  }}>
                    {props.user?.created_at ? new Date(props.user.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </div>
                </div>
              </div>

              {/* Edit Button for admins/leaders */}
              <Show when={canEdit()}>
                <div style={{
                  'margin-top': '20px',
                  'text-align': 'center'
                }}>
                  <button
                    style={{
                      ...primaryButtonStyle,
                      width: '100%'
                    }}
                    onClick={() => {
                      // Switch to edit mode - this would need to be handled by parent component
                      props.onClose();
                    }}
                  >
                    ✏️ تحرير المستخدم
                  </button>
                </div>
              </Show>
            </div>
          </Show>

          {/* Edit Mode - Show form inputs */}
          <Show when={!props.isViewMode}>

          <div style={{ 'margin-bottom': '16px' }}>
            <label style={{
              display: 'block',
              'font-size': '14px',
              'font-weight': '500',
              color: 'var(--color-text)',
              'margin-bottom': '6px'
            }}>
              {app.translate('fullName')}
            </label>
            <input
              type="text"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              style={inputStyle}
              placeholder={app.translate('fullName')}
            />
          </div>

          <div style={{ 'margin-bottom': '16px' }}>
            <label style={{
              display: 'block',
              'font-size': '14px',
              'font-weight': '500',
              color: 'var(--color-text)',
              'margin-bottom': '6px'
            }}>
              {app.translate('userName')}
            </label>
            <input
              type="text"
              value={username()}
              onInput={(e) => setUsername(e.currentTarget.value)}
              style={inputStyle}
              placeholder={app.translate('userName')}
            />
          </div>

          <div style={{ 'margin-bottom': '16px' }}>
            <label style={{
              display: 'block',
              'font-size': '14px',
              'font-weight': '500',
              color: 'var(--color-text)',
              'margin-bottom': '6px'
            }}>
              {app.translate('role')}
            </label>
            <select
              value={role()}
              onChange={(e) => setRole(e.currentTarget.value)}
              style={selectStyle}
            >
              <For each={availableRoles()}>
                {(roleOption) => (
                  <option value={roleOption}>
                    {app.translate(roleOption)}
                  </option>
                )}
              </For>
            </select>
          </div>

          <div style={{ 'margin-bottom': '24px' }}>
            <label style={{
              display: 'flex',
              'align-items': 'center',
              'font-size': '14px',
              'font-weight': '500',
              color: 'var(--color-text)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={isActive()}
                onChange={(e) => setIsActive(e.currentTarget.checked)}
                style={{ 'margin-right': '8px' }}
              />
              {app.translate('isActive')}
            </label>
          </div>

          {/* Password Reset Section */}
          <div style={{
            padding: '16px',
            'background-color': 'var(--color-surface)',
            'border-radius': '8px',
            'margin-bottom': '24px',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{
              'font-size': '16px',
              'font-weight': '600',
              color: 'var(--color-text)',
              'margin-bottom': '8px'
            }}>
              {app.translate('resetPassword')}
            </h3>
            <p style={{
              'font-size': '14px',
              color: 'var(--color-text-secondary)',
              'margin-bottom': '12px',
              'line-height': '1.4'
            }}>
              {app.translate('resetPasswordInfo')}
            </p>
            <button
              style={dangerButtonStyle}
              onClick={() => setShowPasswordConfirm(true)}
              disabled={isLoading()}
            >
              {app.translate('resetPassword')}
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            'justify-content': 'flex-end'
          }}>
            <button
              style={secondaryButtonStyle}
              onClick={props.onClose}
              disabled={isLoading()}
            >
              {app.translate('cancel')}
            </button>
            <button
              style={primaryButtonStyle}
              onClick={handleSave}
              disabled={isLoading()}
            >
              {isLoading() ? '...' : app.translate('save')}
            </button>
          </div>
          </Show>

          {/* Close Button for View Mode */}
          <Show when={props.isViewMode}>
            <div style={{
              'text-align': 'center',
              'margin-top': '20px'
            }}>
              <button
                style={secondaryButtonStyle}
                onClick={props.onClose}
              >
                إغلاق
              </button>
            </div>
          </Show>
        </div>
      </div>

      {/* Password Reset Confirmation Modal */}
      <Show when={showPasswordConfirm()}>
        <div style={modalOverlayStyle} onClick={() => setShowPasswordConfirm(false)}>
          <div style={{
            ...modalContentStyle,
            'max-width': '400px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              'font-size': '18px',
              'font-weight': '600',
              color: 'var(--color-text)',
              'margin-bottom': '16px',
              'text-align': 'center'
            }}>
              {app.translate('confirm')}
            </h3>
            <p style={{
              'font-size': '14px',
              color: 'var(--color-text)',
              'margin-bottom': '20px',
              'text-align': 'center',
              'line-height': '1.5'
            }}>
              {app.translate('resetPasswordConfirm')}
            </p>
            <p style={{
              'font-size': '14px',
              color: 'var(--color-error)',
              'margin-bottom': '20px',
              'text-align': 'center',
              'font-weight': '500'
            }}>
              {app.translate('resetPasswordInfo')}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              'justify-content': 'center'
            }}>
              <button
                style={secondaryButtonStyle}
                onClick={() => setShowPasswordConfirm(false)}
                disabled={isLoading()}
              >
                {app.translate('cancel')}
              </button>
              <button
                style={dangerButtonStyle}
                onClick={handlePasswordReset}
                disabled={isLoading()}
              >
                {isLoading() ? '...' : app.translate('confirm')}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </Show>
  );
}