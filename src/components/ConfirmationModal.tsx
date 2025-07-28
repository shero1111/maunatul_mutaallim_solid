import { Show } from 'solid-js';
import { useApp } from '../store/AppStore';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export function ConfirmationModal(props: ConfirmationModalProps) {
  const app = useApp();
  
  const getIconAndColor = () => {
    switch (props.type) {
      case 'danger':
        return { icon: '⚠️', color: 'var(--color-error)' };
      case 'warning':
        return { icon: '⚠️', color: '#f59e0b' };
      default:
        return { icon: '❓', color: 'var(--color-primary)' };
    }
  };

  const iconAndColor = getIconAndColor();

  const overlayStyle = {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    'background-color': 'rgba(0, 0, 0, 0.5)',
    'z-index': '2000',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    padding: '20px',
    'backdrop-filter': 'blur(4px)'
  };

  const modalStyle = {
    'background-color': 'var(--color-background)',
    'border-radius': '16px',
    'box-shadow': '0 20px 60px rgba(0, 0, 0, 0.3)',
    'max-width': '400px',
    width: '100%',
    padding: '0',
    overflow: 'hidden',
    transform: 'scale(1)',
    transition: 'all 0.3s ease',
    animation: 'modalSlideIn 0.3s ease-out'
  };

  const headerStyle = {
    padding: '24px 24px 16px 24px',
    'text-align': 'center' as const,
    'border-bottom': '1px solid var(--color-border)'
  };

  const bodyStyle = {
    padding: '20px 24px 24px 24px',
    'text-align': 'center' as const
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px',
    'justify-content': 'center',
    padding: '0 24px 24px 24px'
  };

  const buttonBaseStyle = {
    padding: '12px 24px',
    'border-radius': '8px',
    border: 'none',
    'font-size': '14px',
    'font-weight': '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    'min-width': '100px'
  };

  const confirmButtonStyle = {
    ...buttonBaseStyle,
    'background-color': iconAndColor.color,
    color: 'white'
  };

  const cancelButtonStyle = {
    ...buttonBaseStyle,
    'background-color': 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)'
  };

  return (
    <>
      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
      
      <Show when={props.isOpen}>
        <div style={overlayStyle} onClick={props.onCancel}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={headerStyle}>
              <div style={{
                'font-size': '48px',
                'margin-bottom': '12px'
              }}>
                {iconAndColor.icon}
              </div>
              <h3 style={{
                margin: '0',
                'font-size': '18px',
                'font-weight': 'bold',
                color: 'var(--color-text)'
              }}>
                {props.title}
              </h3>
            </div>

            {/* Body */}
            <div style={bodyStyle}>
              <p style={{
                margin: '0',
                'font-size': '14px',
                color: 'var(--color-text)',
                'line-height': '1.5'
              }}>
                {props.message}
              </p>
            </div>

            {/* Buttons */}
            <div style={buttonContainerStyle}>
              <button
                style={cancelButtonStyle}
                onClick={props.onCancel}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                }}
              >
                {props.cancelText || app.translate('cancel')}
              </button>
              
              <button
                style={confirmButtonStyle}
                onClick={props.onConfirm}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {props.confirmText || app.translate('confirm')}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}