import { Show } from 'solid-js';
import { useApp } from '../store/AppStore';

interface SimpleConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'delete' | 'warning' | 'info';
}

export function SimpleConfirmDialog(props: SimpleConfirmDialogProps) {
  const app = useApp();
  
  const getButtonColor = () => {
    switch (props.type) {
      case 'delete':
        return '#ef4444'; // Red for delete
      case 'warning':
        return '#f59e0b'; // Orange for warning
      default:
        return 'var(--color-primary)'; // Primary color
    }
  };

  const overlayStyle = {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    'background-color': 'rgba(0, 0, 0, 0.4)',
    'z-index': '2000',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    padding: '20px'
  };

  const dialogStyle = {
    'background-color': 'var(--color-background)',
    'border-radius': '12px',
    'box-shadow': '0 8px 24px rgba(0, 0, 0, 0.15)',
    'max-width': '320px',
    width: '100%',
    padding: '20px'
  };

  const messageStyle = {
    'font-size': '16px',
    color: 'var(--color-text)',
    'margin-bottom': '20px',
    'line-height': '1.4',
    'text-align': 'center' as const
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px',
    'justify-content': 'center'
  };

  const buttonStyle = {
    padding: '10px 20px',
    'border-radius': '8px',
    border: 'none',
    'font-size': '14px',
    'font-weight': '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    'min-width': '80px'
  };

  const confirmButtonStyle = {
    ...buttonStyle,
    'background-color': getButtonColor(),
    color: 'white'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    'background-color': 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)'
  };

  return (
    <Show when={props.isOpen}>
      <div style={overlayStyle} onClick={props.onCancel}>
        <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
          <div style={messageStyle}>
            {props.message}
          </div>
          
          <div style={buttonContainerStyle}>
            <button
              style={cancelButtonStyle}
              onClick={props.onCancel}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-border)';
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
                const currentColor = getButtonColor();
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {props.confirmText || (props.type === 'delete' ? app.translate('delete') : app.translate('confirm'))}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}