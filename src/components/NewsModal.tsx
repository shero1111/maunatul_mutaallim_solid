import { createSignal, Show, createEffect } from 'solid-js';
import { useApp } from '../store/AppStore';
import { NewsItem } from '../types';

interface NewsModalProps {
  newsItem: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
}

export function NewsModal(props: NewsModalProps) {
  const app = useApp();
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [publishDate, setPublishDate] = createSignal('');
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [showValidationSnackbar, setShowValidationSnackbar] = createSignal(false);

  // Initialize form when modal opens or newsItem changes
  createEffect(() => {
    if (props.isOpen) {
      if (props.newsItem && props.isEdit) {
        setTitle(props.newsItem.title);
        setDescription(props.newsItem.description);
        setPublishDate(props.newsItem.publish_date?.split('T')[0] || new Date().toISOString().split('T')[0]);
      } else {
        // New news - set defaults
        setTitle('');
        setDescription('');
        setPublishDate(new Date().toISOString().split('T')[0]);
      }
    }
  });

  const handleSave = async () => {
    // At least one field (title or description) must be filled
    if (!title().trim() && !description().trim()) {
      setShowValidationSnackbar(true);
      setTimeout(() => setShowValidationSnackbar(false), 3000);
      return;
    }
    
    setIsLoading(true);
    try {
      const newsData = {
        title: title().trim(),
        description: description().trim(),
        publish_date: new Date(publishDate()).toISOString(),
        author_id: app.currentUser()?.id || ''
      };

      if (props.isEdit && props.newsItem) {
        // Update existing news
        const updatedNews: NewsItem = {
          ...props.newsItem,
          ...newsData
        };
        console.log('📝 Updating news:', updatedNews);
        app.updateNews(updatedNews);
      } else {
        // Create new news
        console.log('📝 Creating new news:', newsData);
        app.createNews(newsData);
        
        // Debug: Check if news was added
        setTimeout(() => {
          console.log('📊 News count after creation:', app.news().length);
          alert(`News created! Total news: ${app.news().length}`);
        }, 100);
      }
      
      props.onClose();
    } catch (error) {
      console.error('Error saving news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!props.newsItem) return;
    
    setIsLoading(true);
    try {
      app.deleteNews(props.newsItem.id);
      setShowDeleteConfirm(false);
      props.onClose();
    } catch (error) {
      console.error('Error deleting news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    'background-color': 'rgba(0, 0, 0, 0.5)',
    'z-index': '1000'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--color-border)',
    'border-radius': '8px',
    'font-size': '16px',
    'background-color': 'var(--color-surface)',
    color: 'var(--color-text)',
    'margin-bottom': '16px',
    'font-family': 'inherit'
  };

  const textareaStyle = {
    ...inputStyle,
    'min-height': '120px',
    resize: 'vertical' as const,
    'line-height': '1.5'
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

  const canEdit = () => {
    const currentUser = app.currentUser();
    return currentUser?.role === 'superuser' || currentUser?.role === 'leitung';
  };

  if (!canEdit()) {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          
          .news-modal-content {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--color-background);
            border-radius: 20px 20px 0 0;
            height: 70vh;
            max-height: 70vh;
            min-height: 60vh;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease-out forwards;
          }
          
          .news-modal-content .scrollable-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            min-height: 0;
          }

          .modal-handle {
            width: 40px;
            height: 4px;
            background-color: var(--color-border);
            border-radius: 2px;
            margin: 12px auto 8px auto;
            opacity: 0.5;
          }

          .validation-snackbar {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--color-error);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            font-size: 14px;
            font-weight: 500;
            animation: slideUpSnackbar 0.3s ease-out;
          }

          @keyframes slideUpSnackbar {
            from {
              transform: translateX(-50%) translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <Show when={props.isOpen}>
        <div style={modalOverlayStyle} onClick={props.onClose}>
          <div 
            class="news-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Handle */}
            <div class="modal-handle"></div>
            
            {/* Modal Header */}
            <div style={{
              'flex-shrink': '0',
              padding: '8px 20px 16px 20px',
              'border-bottom': '1px solid var(--color-border)',
              position: 'relative'
            }}>
              {/* Save Button - Top Left */}
              <button
                onClick={handleSave}
                disabled={isLoading()}
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '16px',
                  'background-color': 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  'font-size': '12px',
                  'font-weight': '500',
                  cursor: isLoading() || (!title().trim() && !description().trim()) ? 'not-allowed' : 'pointer',
                  padding: '6px 12px',
                  'border-radius': '6px',
                  transition: 'all 0.2s ease',
                  'z-index': '10',
                  opacity: isLoading() || (!title().trim() && !description().trim()) ? '0.5' : '1'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading() && (title().trim() || description().trim())) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title={app.translate('save')}
              >
                {isLoading() ? '...' : app.translate('save')}
              </button>

              {/* Close X Button */}
              <button
                onClick={props.onClose}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  'font-size': '20px',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  'border-radius': '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  transition: 'all 0.2s ease',
                  'z-index': '10'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
                title="إغلاق"
              >
                ✕
              </button>

              <h2 style={{
                'font-size': '18px',
                'font-weight': '600',
                color: 'var(--color-text)',
                'margin': '0 50px 0 80px',
                'text-align': 'center'
              }}>
                {props.isEdit ? app.translate('editNews') : app.translate('addNews')}
              </h2>
            </div>

            {/* Modal Content - Scrollable */}
            <div 
              class="scrollable-content"
              style={{
                padding: '16px 20px'
              }}
            >
              <div style={{ 'margin-bottom': '16px' }}>
                <label style={{
                  display: 'block',
                  'font-size': '14px',
                  'font-weight': '500',
                  color: 'var(--color-text)',
                  'margin-bottom': '6px'
                }}>
                  {app.translate('newsTitle')}
                </label>
                <input
                  type="text"
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  style={inputStyle}
                  placeholder={app.translate('newsTitle')}
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
                  {app.translate('newsDescription')}
                </label>
                <textarea
                  value={description()}
                  onInput={(e) => setDescription(e.currentTarget.value)}
                  style={textareaStyle}
                  placeholder={app.translate('newsDescription')}
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
                  {app.translate('publishDate')}
                </label>
                <input
                  type="date"
                  value={publishDate()}
                  onInput={(e) => setPublishDate(e.currentTarget.value)}
                  style={inputStyle}
                />
                <div style={{
                  'font-size': '12px',
                  color: 'var(--color-text-secondary)',
                  'margin-top': '4px'
                }}>
                  {new Date(publishDate()) > new Date() ? 
                    app.language() === 'ar' ? 'سيتم نشر هذا الخبر في المستقبل' : 'This news will be published in the future' :
                    app.language() === 'ar' ? 'سيكون هذا الخبر مرئياً للجميع' : 'This news will be visible to everyone'
                  }
                </div>
              </div>


            </div>

            {/* Optional Delete Button Footer - Only for Edit Mode */}
            <Show when={props.isEdit}>
              <div style={{
                'flex-shrink': '0',
                padding: '12px 20px 16px 20px',
                'border-top': '1px solid var(--color-border)',
                'background-color': 'var(--color-background)',
                display: 'flex',
                'justify-content': 'center'
              }}>
                <button
                  style={dangerButtonStyle}
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading()}
                >
                  {app.translate('deleteNews')}
                </button>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Delete Confirmation Modal */}
      <Show when={showDeleteConfirm()}>
        <div style={modalOverlayStyle} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            position: 'fixed' as const,
            bottom: '0',
            left: '0',
            right: '0',
            background: 'var(--color-background)',
            'border-radius': '20px 20px 0 0',
            'max-height': '400px',
            'min-height': '300px',
            'box-shadow': '0 -10px 30px rgba(0,0,0,0.3)',
            padding: '20px',
            display: 'flex',
            'flex-direction': 'column',
            gap: '16px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              'font-size': '18px',
              'font-weight': '600',
              color: 'var(--color-text)',
              'margin': '0',
              'text-align': 'center'
            }}>
              {app.translate('confirmDelete')}
            </h3>
            <p style={{
              'font-size': '14px',
              color: 'var(--color-text)',
              'margin': '0',
              'text-align': 'center',
              'line-height': '1.5'
            }}>
              {app.translate('deleteNewsConfirm')}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              'justify-content': 'center'
            }}>
              <button
                style={secondaryButtonStyle}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading()}
              >
                {app.translate('cancel')}
              </button>
              <button
                style={dangerButtonStyle}
                onClick={handleDelete}
                disabled={isLoading()}
              >
                {isLoading() ? '...' : app.translate('confirm')}
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Validation Snackbar */}
      <Show when={showValidationSnackbar()}>
        <div class="validation-snackbar">
          {app.language() === 'ar' 
            ? 'يجب ملء العنوان أو الوصف على الأقل'
            : 'At least title or description must be filled'
          }
        </div>
      </Show>
    </>
  );
}