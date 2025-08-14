import { createSignal, Show, onMount, createEffect } from 'solid-js';
import { useApp } from '../store/AppStore';
import { User } from '../types';
import { SimpleConfirmDialog } from './SimpleConfirmDialog';

interface UserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export function UserModal(props: UserModalProps) {
  const app = useApp();
  
  // Form state
  const [name, setName] = createSignal('');
  const [username, setUsername] = createSignal('');
  const [role, setRole] = createSignal<User['role']>('student');
  const [isActive, setIsActive] = createSignal(true);
  const [isLoading, setIsLoading] = createSignal(false);
  
  // Confirmation states
  const [showPasswordReset, setShowPasswordReset] = createSignal(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  
  // Initialize form when user changes
  onMount(() => {
    if (props.user) {
      setName(props.user.full_name);
      setUsername(props.user.username);
      setRole(props.user.role);
      setIsActive(props.user.isActive);
    }
  });
  
  // Update form when user prop changes
  const updateForm = () => {
    if (props.user) {
      setName(props.user.full_name);
      setUsername(props.user.username);
      setRole(props.user.role);
      setIsActive(props.user.isActive);
    }
  };
  
  // Watch for user changes with createEffect
  createEffect(() => {
    if (props.user && props.isOpen) {
      updateForm();
    }
  });
  
  const handleSave = () => {
    if (!props.user || !name().trim() || !username().trim()) return;
    
    setIsLoading(true);
    
    const updatedUser: User = {
      ...props.user,
      full_name: name().trim(),
      username: username().trim(),
      role: role(),
      isActive: isActive()
    };
    
    app.updateUser(updatedUser);
    setIsLoading(false);
    props.onClose();
  };
  
  const handlePasswordReset = () => {
    if (!props.user) return;
    
    const updatedUser: User = {
      ...props.user,
      password: '123456'
    };
    
    app.updateUser(updatedUser);
    setShowPasswordReset(false);
    
    // Show success message
    const message = app.language() === 'ar' 
      ? 'تم إعادة تعيين كلمة المرور إلى 123456'
      : 'Password reset to 123456';
    
    // Simple alert for now - could be improved with snackbar
    alert(message);
  };
  
  const handleDelete = () => {
    if (!props.user) return;
    
    app.deleteUser(props.user.id);
    setShowDeleteConfirm(false);
    props.onClose();
  };
  
  const canEdit = () => {
    const currentUser = app.currentUser();
    return currentUser && (currentUser.role === 'superuser' || currentUser.role === 'leitung');
  };
  
  const canDelete = () => {
    const currentUser = app.currentUser();
    return currentUser && currentUser.role === 'superuser' && props.user?.id !== currentUser.id;
  };
  
  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    'background-color': 'rgba(0, 0, 0, 0.5)',
    'z-index': '1000',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center'
  };
  
  const modalStyle = {
    'background-color': 'var(--color-background)',
    'border-radius': '16px',
    width: '90%',
    'max-width': '500px',
    'max-height': '80vh',
    'box-shadow': '0 10px 30px rgba(0,0,0,0.3)',
    display: 'flex',
    'flex-direction': 'column' as const,
    overflow: 'hidden'
  };
  
  const headerStyle = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-between',
    padding: '20px',
    'border-bottom': '1px solid var(--color-border)',
    'flex-shrink': '0'
  };
  
  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid var(--color-border)',
    'border-radius': '8px',
    'background-color': 'var(--color-surface)',
    color: 'var(--color-text)',
    'font-size': '14px',
    'box-sizing': 'border-box' as const
  };
  
  const buttonStyle = {
    padding: '10px 16px',
    'border-radius': '8px',
    border: 'none',
    cursor: 'pointer' as const,
    'font-size': '14px',
    'font-weight': '500',
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
  
  return (
    <>
      <Show when={props.isOpen && props.user}>
        <div style={modalOverlayStyle} onClick={props.onClose}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={headerStyle}>
              <h2 style={{
                'font-size': '18px',
                'font-weight': '600',
                color: 'var(--color-text)',
                margin: '0'
              }}>
                {app.translate('userDetails')}
              </h2>
              <button
                onClick={props.onClose}
                style={{
                  'background-color': 'transparent',
                  border: 'none',
                  'font-size': '24px',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center'
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div style={{
              padding: '20px',
              'overflow-y': 'auto',
              'flex-grow': '1'
            }}>
              {/* Name Field */}
              <div style={{ 'margin-bottom': '16px' }}>
                <label style={{
                  display: 'block',
                  'font-size': '14px',
                  'font-weight': '500',
                  color: 'var(--color-text)',
                  'margin-bottom': '6px'
                }}>
                  {app.translate('name')}
                </label>
                <input
                  type="text"
                  value={name()}
                  onInput={(e) => setName(e.currentTarget.value)}
                  style={inputStyle}
                  disabled={!canEdit()}
                />
              </div>
              
              {/* Username Field */}
              <div style={{ 'margin-bottom': '16px' }}>
                <label style={{
                  display: 'block',
                  'font-size': '14px',
                  'font-weight': '500',
                  color: 'var(--color-text)',
                  'margin-bottom': '6px'
                }}>
                  {app.translate('username')}
                </label>
                <input
                  type="text"
                  value={username()}
                  onInput={(e) => setUsername(e.currentTarget.value)}
                  style={inputStyle}
                  disabled={!canEdit()}
                />
              </div>
              
              {/* Role Field */}
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
                  onChange={(e) => setRole(e.currentTarget.value as User['role'])}
                  style={inputStyle}
                  disabled={!canEdit()}
                >
                  <option value="student">{app.translate('student')}</option>
                  <option value="lehrer">{app.translate('teacher')}</option>
                  <option value="leitung">{app.translate('leitung')}</option>
                  <Show when={app.currentUser()?.role === 'superuser'}>
                    <option value="superuser">{app.translate('superuser')}</option>
                  </Show>
                </select>
              </div>
              
              {/* Active Status */}
              <div style={{ 'margin-bottom': '20px' }}>
                <label style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={isActive()}
                    onChange={(e) => setIsActive(e.currentTarget.checked)}
                    disabled={!canEdit()}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{
                    'font-size': '14px',
                    'font-weight': '500',
                    color: 'var(--color-text)'
                  }}>
                    {app.translate('activeUser')}
                  </span>
                </label>
              </div>
              
              {/* Password Reset Section */}
              <Show when={canEdit()}>
                <div style={{
                  'background-color': 'var(--color-surface)',
                  padding: '16px',
                  'border-radius': '8px',
                  'margin-bottom': '20px'
                }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    color: 'var(--color-text)',
                    'font-size': '14px'
                  }}>
                    {app.translate('passwordReset')}
                  </h4>
                  <p style={{
                    margin: '0 0 12px 0',
                    'font-size': '12px',
                    color: 'var(--color-text-secondary)',
                    'line-height': '1.4'
                  }}>
                    {app.language() === 'ar' 
                      ? 'سيتم إعادة تعيين كلمة المرور إلى "123456"'
                      : 'Password will be reset to "123456"'
                    }
                  </p>
                  <button
                    onClick={() => setShowPasswordReset(true)}
                    style={dangerButtonStyle}
                  >
                    {app.translate('resetPassword')}
                  </button>
                </div>
              </Show>
            </div>
            
            {/* Footer */}
            <div style={{
              padding: '16px 20px',
              'border-top': '1px solid var(--color-border)',
              display: 'flex',
              gap: '12px',
              'flex-shrink': '0'
            }}>
              <button
                onClick={props.onClose}
                style={secondaryButtonStyle}
              >
                {app.translate('cancel')}
              </button>
              
              <Show when={canEdit()}>
                <button
                  onClick={handleSave}
                  disabled={isLoading() || !name().trim() || !username().trim()}
                  style={{
                    ...primaryButtonStyle,
                    flex: '1',
                    opacity: isLoading() || !name().trim() || !username().trim() ? '0.5' : '1'
                  }}
                >
                  {isLoading() ? '...' : app.translate('save')}
                </button>
              </Show>
              
              <Show when={canDelete()}>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={dangerButtonStyle}
                >
                  {app.translate('delete')}
                </button>
              </Show>
            </div>
          </div>
        </div>
      </Show>
      
      {/* Password Reset Confirmation */}
      <SimpleConfirmDialog
        isOpen={showPasswordReset()}
        message={
          app.language() === 'ar'
            ? `هل تريد إعادة تعيين كلمة مرور "${props.user?.name}" إلى "123456"؟`
            : `Reset password for "${props.user?.name}" to "123456"?`
        }
        onConfirm={handlePasswordReset}
        onCancel={() => setShowPasswordReset(false)}
        type="warning"
      />
      
      {/* Delete User Confirmation */}
      <SimpleConfirmDialog
        isOpen={showDeleteConfirm()}
        message={
          app.language() === 'ar'
            ? `هل تريد حذف المستخدم "${props.user?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            : `Delete user "${props.user?.name}"? This action cannot be undone.`
        }
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        type="delete"
      />
    </>
  );
}