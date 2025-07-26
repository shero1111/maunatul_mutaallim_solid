import { For, createMemo, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function MorePage() {
  const app = useApp();
  
  // State for logout modal
  const [showLogoutModal, setShowLogoutModal] = createSignal(false);
  
  // State for password change modal
  const [showPasswordModal, setShowPasswordModal] = createSignal(false);
  const [currentPassword, setCurrentPassword] = createSignal('');
  const [newPassword, setNewPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [passwordError, setPasswordError] = createSignal('');
  const [passwordSuccess, setPasswordSuccess] = createSignal('');
  const [fieldErrors, setFieldErrors] = createSignal<{[key: string]: boolean}>({});
  const [isChangingPassword, setIsChangingPassword] = createSignal(false);
  
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

  const toggleOptionStyle = {
    padding: '6px 12px',
    'border-radius': '16px',
    'font-size': '12px',
    'font-weight': '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    'min-width': '50px',
    'text-align': 'center' as const,
    'white-space': 'nowrap' as const
  };

  // New styles for the updated layout
  const itemsContainerStyle = {
    'background-color': 'var(--color-background)',
    'border-radius': '12px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden' as const
  };

  const itemStyle = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-between',
    padding: '16px',
    cursor: 'pointer',
    'border-bottom': '1px solid var(--color-border)',
    transition: 'background-color 0.2s',
    '-webkit-tap-highlight-color': 'transparent'
  };

  const itemContentStyle = {
    display: 'flex',
    'align-items': 'center',
    gap: '12px'
  };

  const itemIconStyle = {
    'font-size': '20px',
    width: '24px',
    'text-align': 'center' as const
  };

  const itemTextStyle = {
    'font-size': '16px',
    color: 'var(--color-text)'
  };

  const itemValueStyle = {
    'font-size': '14px',
    color: 'var(--color-text-secondary)'
  };

  const dangerItemStyle = {
    color: 'var(--color-error)'
  };
  
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
  
  const getSettingsItems = () => [
    {
      icon: '🎨',
      text: app.translate('theme'),
      type: 'toggle' as const,
      value: app.theme(),
      leftLabel: 'Light',
      rightLabel: 'Dark',
      action: () => {
        const newTheme = app.theme() === 'light' ? 'dark' : 'light';
        app.setTheme(newTheme);
      }
    },
    {
      icon: '🌐',
      text: app.translate('language'),
      type: 'toggle' as const,
      value: app.language(),
      leftLabel: 'English',
      rightLabel: 'العربية',
      action: () => {
        const newLang = app.language() === 'en' ? 'ar' : 'en';
        app.setLanguage(newLang);
      }
    }
  ];

  const generalItems = [
    {
      icon: '📚',
      text: app.translate('userGuide'),
      type: 'action' as const,
      action: () => {
        alert('User Guide coming soon!');
      }
    },
    {
      icon: 'ℹ️',
      text: app.translate('aboutUs'),
      type: 'action' as const,
      action: () => {
        app.setCurrentPage('about-us');
      }
    },
    {
      icon: '📱',
      text: `${app.translate('appVersion')} 2.0.0`,
      type: 'info' as const,
      action: undefined
    }
  ];

  // Password change functions
  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setFieldErrors({});
    setIsChangingPassword(false);
  };

  const handlePasswordChange = async () => {
    const current = currentPassword().trim();
    const newPass = newPassword().trim();
    const confirm = confirmPassword().trim();

    // Clear previous messages and field errors
    setPasswordError('');
    setPasswordSuccess('');
    setFieldErrors({});

    let errors: {[key: string]: boolean} = {};
    let errorMessage = '';

    // Validation with field-specific errors
    if (!current) {
      errors.currentPassword = true;
      errorMessage = app.translate('currentPasswordRequired');
    } else if (!newPass) {
      errors.newPassword = true;
      errorMessage = app.translate('newPasswordRequired');
    } else if (!confirm) {
      errors.confirmPassword = true;
      errorMessage = app.translate('confirmPasswordRequired');
    } else if (newPass.length < 4) {
      errors.newPassword = true;
      errorMessage = app.translate('passwordTooShort');
    } else if (newPass !== confirm) {
      errors.newPassword = true;
      errors.confirmPassword = true;
      errorMessage = app.translate('passwordsDoNotMatch');
    } else if (current === newPass) {
      errors.newPassword = true;
      errorMessage = app.translate('newPasswordSameAsCurrent');
    }

    // If there are validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setPasswordError(errorMessage);
      return;
    }

    setIsChangingPassword(true);

    try {
      // Verify current password
      const user = app.currentUser();
      if (!user || user.password !== current) {
        setFieldErrors({ currentPassword: true });
        setPasswordError(app.translate('currentPasswordIncorrect'));
        setIsChangingPassword(false);
        return;
      }

      // Update password in app store
      const success = app.changePassword(current, newPass);
      
      if (success) {
        setPasswordSuccess(app.translate('passwordChangedSuccessfully'));
        setTimeout(() => {
          setShowPasswordModal(false);
          resetPasswordForm();
        }, 2000);
      } else {
        setPasswordError(app.translate('passwordChangeError'));
      }
    } catch (error) {
      setPasswordError(app.translate('passwordChangeError'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const accountItems = [
    {
      icon: '🔑',
      text: app.translate('changePassword'),
      type: 'action' as const,
      action: () => {
        resetPasswordForm();
        setShowPasswordModal(true);
      }
    },
    {
      icon: '🚪',
      text: app.translate('logout'),
      type: 'action' as const,
      action: () => {
        setShowLogoutModal(true);
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

  // Logout Modal Component
  const LogoutModal = () => (
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.5)',
        'backdrop-filter': 'blur(8px)',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'z-index': '1000',
        padding: '20px'
      }}
      onClick={() => setShowLogoutModal(false)}
    >
      <div 
        style={{
          background: 'var(--color-background)',
          'border-radius': '20px',
          padding: '32px',
          'max-width': '400px',
          width: '100%',
          'box-shadow': '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--color-border)',
          'text-align': 'center',
          transform: 'scale(0.95)',
          transition: 'transform 0.2s ease',
          animation: 'modalFadeIn 0.3s ease forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          'font-size': '3rem',
          'margin-bottom': '16px',
          opacity: '0.8'
        }}>
          🚪
        </div>
        
        {/* Title */}
        <h2 style={{
          color: 'var(--color-text)',
          'font-size': '1.5rem',
          'font-weight': '600',
          margin: '0 0 12px 0'
        }}>
          {app.language() === 'ar' ? 'تسجيل الخروج' : 'Logout'}
        </h2>
        
        {/* Message */}
        <p style={{
          color: 'var(--color-text-secondary)',
          'font-size': '1rem',
          margin: '0 0 32px 0',
          'line-height': '1.5'
        }}>
          {app.language() === 'ar' 
            ? 'هل أنت متأكد من أنك تريد تسجيل الخروج؟'
            : 'Are you sure you want to logout?'
          }
        </p>
        
        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          'justify-content': 'center'
        }}>
          {/* Cancel Button */}
          <button
            onClick={() => setShowLogoutModal(false)}
            style={{
              padding: '8px 16px',
              'border-radius': '8px',
              border: `1px solid var(--color-border)`,
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              'font-size': '14px',
              'font-weight': '400',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              'min-width': '80px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-text-secondary)';
              e.currentTarget.style.color = 'var(--color-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            {app.language() === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          
          {/* Logout Button */}
          <button
            onClick={() => {
              app.logout();
              setShowLogoutModal(false);
            }}
            style={{
              padding: '8px 16px',
              'border-radius': '8px',
              border: '1px solid #dc2626',
              background: '#dc2626',
              color: 'white',
              'font-size': '14px',
              'font-weight': '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              'min-width': '80px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b91c1c';
              e.currentTarget.style.borderColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.borderColor = '#dc2626';
            }}
          >
            {app.language() === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );

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
        <div style={itemsContainerStyle}>
          <For each={getSettingsItems()}>
            {(item) => (
              <div 
                style={itemStyle}
                data-action={item.text}
                onClick={() => handleMenuItemClick(item)}
              >
                <div style={itemContentStyle}>
                  <span style={itemIconStyle}>{item.icon}</span>
                  <span style={itemTextStyle}>{item.text}</span>
                </div>
                {item.type === 'toggle' && (
                  <div style={toggleContainerStyle}>
                    <div style={toggleWrapperStyle}>
                      <div 
                        style={{
                          ...toggleOptionStyle,
                          background: item.value === 'light' || item.value === 'en' ? 'var(--color-primary)' : 'transparent',
                          color: item.value === 'light' || item.value === 'en' ? 'white' : 'var(--color-text-secondary)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.value !== 'light' && item.value !== 'en') {
                            item.action();
                          }
                        }}
                      >
                        {item.leftLabel}
                      </div>
                      <div 
                        style={{
                          ...toggleOptionStyle,
                          background: item.value === 'dark' || item.value === 'ar' ? 'var(--color-primary)' : 'transparent',
                          color: item.value === 'dark' || item.value === 'ar' ? 'white' : 'var(--color-text-secondary)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.value !== 'dark' && item.value !== 'ar') {
                            item.action();
                          }
                        }}
                      >
                        {item.rightLabel}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </For>
        </div>
      </div>
      
      {/* General */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          {app.translate('general')}
        </div>
        <div style={itemsContainerStyle}>
          <For each={generalItems}>
            {(item) => (
              <div 
                style={itemStyle}
                data-action={item.text}
                onClick={() => handleMenuItemClick(item)}
              >
                <div style={itemContentStyle}>
                  <span style={itemIconStyle}>{item.icon}</span>
                  <span style={itemTextStyle}>{item.text}</span>
                </div>
                {item.type === 'info' && (
                  <span style={itemValueStyle}>
                    {/* No clickable value for info items */}
                  </span>
                )}
              </div>
            )}
          </For>
        </div>
      </div>
      
      {/* Account */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          {app.translate('account')}
        </div>
        <div style={itemsContainerStyle}>
          <For each={accountItems}>
            {(item) => (
              <div 
                style={{
                  ...itemStyle,
                  ...(item.danger ? dangerItemStyle : {})
                }}
                data-action={item.text}
                onClick={() => handleMenuItemClick(item)}
              >
                <div style={itemContentStyle}>
                  <span style={itemIconStyle}>{item.icon}</span>
                  <span style={itemTextStyle}>{item.text}</span>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal() && (
        <div class="password-modal-container" style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          'background-color': 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'z-index': '1000',
          padding: '16px',
          'overflow-y': 'auto'
        }}>
          <div class="password-modal" style={{
            'background-color': 'var(--color-background)',
            'border-radius': '16px',
            padding: '20px',
            width: '100%',
            'max-width': '400px',
            'max-height': '90vh',
            'overflow-y': 'auto',
            'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.3)',
            animation: 'modalFadeIn 0.3s ease-out',
            direction: app.language() === 'ar' ? 'rtl' : 'ltr',
            margin: 'auto 0'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              'margin-bottom': '20px'
            }}>
              <h2 style={{
                'font-size': '20px',
                'font-weight': 'bold',
                color: 'var(--color-text)',
                margin: '0'
              }}>
                🔑 {app.translate('changePassword')}
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  'font-size': '24px',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  'border-radius': '8px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Error/Success Messages */}
            {passwordError() && (
              <div style={{
                'background-color': '#ffebee',
                color: '#c62828',
                padding: '12px',
                'border-radius': '8px',
                'margin-bottom': '16px',
                'font-size': '14px',
                border: '1px solid #ffcdd2',
                display: 'flex',
                'align-items': 'flex-start',
                'justify-content': 'space-between',
                gap: '8px'
              }}>
                <span style={{ flex: '1' }}>
                  ❌ {passwordError()}
                </span>
                <button
                  onClick={() => {
                    setPasswordError('');
                    setFieldErrors({});
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c62828',
                    cursor: 'pointer',
                    'font-size': '16px',
                    padding: '0',
                    'line-height': '1',
                    'flex-shrink': '0'
                  }}
                  title={app.translate('close')}
                >
                  ✕
                </button>
              </div>
            )}

            {passwordSuccess() && (
              <div style={{
                'background-color': '#e8f5e8',
                color: '#2e7d32',
                padding: '12px',
                'border-radius': '8px',
                'margin-bottom': '16px',
                'font-size': '14px',
                border: '1px solid #c8e6c9',
                display: 'flex',
                'align-items': 'flex-start',
                'justify-content': 'space-between',
                gap: '8px'
              }}>
                <span style={{ flex: '1' }}>
                  ✅ {passwordSuccess()}
                </span>
                <button
                  onClick={() => setPasswordSuccess('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2e7d32',
                    cursor: 'pointer',
                    'font-size': '16px',
                    padding: '0',
                    'line-height': '1',
                    'flex-shrink': '0'
                  }}
                  title={app.translate('close')}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Form Fields */}
            <div style={{ 'margin-bottom': '16px' }}>
              <label style={{
                display: 'block',
                'margin-bottom': '8px',
                'font-weight': '500',
                color: 'var(--color-text)',
                'font-size': '14px'
              }}>
                {app.translate('currentPassword')}
              </label>
              <input
                type="password"
                value={currentPassword()}
                onInput={(e) => setCurrentPassword(e.currentTarget.value)}
                placeholder={app.translate('enterCurrentPassword')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: fieldErrors().currentPassword 
                    ? '2px solid #e53e3e' 
                    : '1px solid var(--color-border)',
                  'border-radius': '8px',
                  'font-size': '16px',
                  'background-color': fieldErrors().currentPassword 
                    ? '#ffeaea' 
                    : 'var(--color-surface)',
                  color: 'var(--color-text)',
                  'box-sizing': 'border-box',
                  'box-shadow': fieldErrors().currentPassword 
                    ? '0 0 0 1px rgba(229, 62, 62, 0.3)' 
                    : 'none'
                }}
              />
            </div>

            <div style={{ 'margin-bottom': '16px' }}>
              <label style={{
                display: 'block',
                'margin-bottom': '8px',
                'font-weight': '500',
                color: 'var(--color-text)',
                'font-size': '14px'
              }}>
                {app.translate('newPassword')}
              </label>
              <input
                type="password"
                value={newPassword()}
                onInput={(e) => setNewPassword(e.currentTarget.value)}
                placeholder={app.translate('enterNewPassword')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: fieldErrors().newPassword 
                    ? '2px solid #e53e3e' 
                    : '1px solid var(--color-border)',
                  'border-radius': '8px',
                  'font-size': '16px',
                  'background-color': fieldErrors().newPassword 
                    ? '#ffeaea' 
                    : 'var(--color-surface)',
                  color: 'var(--color-text)',
                  'box-sizing': 'border-box',
                  'box-shadow': fieldErrors().newPassword 
                    ? '0 0 0 1px rgba(229, 62, 62, 0.3)' 
                    : 'none'
                }}
              />
            </div>

            <div style={{ 'margin-bottom': '20px' }}>
              <label style={{
                display: 'block',
                'margin-bottom': '8px',
                'font-weight': '500',
                color: 'var(--color-text)',
                'font-size': '14px'
              }}>
                {app.translate('confirmNewPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword()}
                onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                placeholder={app.translate('confirmNewPassword')}
                onKeyDown={(e) => e.key === 'Enter' && !isChangingPassword() && handlePasswordChange()}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: fieldErrors().confirmPassword 
                    ? '2px solid #e53e3e' 
                    : '1px solid var(--color-border)',
                  'border-radius': '8px',
                  'font-size': '16px',
                  'background-color': fieldErrors().confirmPassword 
                    ? '#ffeaea' 
                    : 'var(--color-surface)',
                  color: 'var(--color-text)',
                  'box-sizing': 'border-box',
                  'box-shadow': fieldErrors().confirmPassword 
                    ? '0 0 0 1px rgba(229, 62, 62, 0.3)' 
                    : 'none'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              'justify-content': 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                }}
                disabled={isChangingPassword()}
                style={{
                  padding: '12px 24px',
                  border: '1px solid var(--color-border)',
                  'border-radius': '8px',
                  'background-color': 'var(--color-surface)',
                  color: 'var(--color-text)',
                  cursor: isChangingPassword() ? 'not-allowed' : 'pointer',
                  'font-size': '14px',
                  'font-weight': '500',
                  opacity: isChangingPassword() ? '0.5' : '1'
                }}
              >
                {app.translate('cancel')}
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword()}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  'border-radius': '8px',
                  'background-color': 'var(--color-primary)',
                  color: 'white',
                  cursor: isChangingPassword() ? 'not-allowed' : 'pointer',
                  'font-size': '14px',
                  'font-weight': '500',
                  opacity: isChangingPassword() ? '0.7' : '1',
                  display: 'flex',
                  'align-items': 'center',
                  gap: '8px'
                }}
              >
                {isChangingPassword() && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    'border-top': '2px solid white',
                    'border-radius': '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {isChangingPassword() ? app.translate('changing') : app.translate('changePassword')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal() && <LogoutModal />}

      {/* CSS Animation */}
      <style>
        {`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          /* Responsive modal adjustments for small devices */
          @media (max-height: 600px) {
            .password-modal-container {
              align-items: flex-start !important;
              padding-top: 10px !important;
              padding-bottom: 10px !important;
            }
            .password-modal {
              margin: 0 !important;
              max-height: 95vh !important;
              padding: 16px !important;
            }
          }

          @media (max-height: 500px) {
            .password-modal {
              max-height: 98vh !important;
              padding: 12px !important;
            }
          }
        `}
      </style>
    </div>
  );
}