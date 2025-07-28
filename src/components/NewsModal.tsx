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
    if (!title().trim() || !description().trim()) return;
    
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
        console.log('Updating news:', updatedNews);
        app.updateNews(updatedNews);
      } else {
        // Create new news
        const newNewsData = {
          created_at: new Date().toISOString(),
          ...newsData
        };
        console.log('Creating news:', newNewsData);
        app.createNews(newNewsData);
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
      console.log('Deleting news:', props.newsItem.id);
      app.deleteNews(props.newsItem.id);
      
      setShowDeleteConfirm(false);
      props.onClose();
    } catch (error) {
      console.error('Error deleting news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canEdit = () => {
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
    'max-width': '600px',
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

  if (!canEdit()) {
    return null;
  }

  return (
    <Show when={props.isOpen}>
      <div style={modalOverlayStyle} onClick={props.onClose}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <h2 style={{
            'font-size': '20px',
            'font-weight': '600',
            color: 'var(--color-text)',
            'margin-bottom': '20px',
            'text-align': 'center'
          }}>
            {props.isEdit ? app.translate('editNews') : app.translate('addNews')}
          </h2>

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

          <div style={{ 'margin-bottom': '24px' }}>
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

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            'justify-content': props.isEdit ? 'space-between' : 'flex-end'
          }}>
            <Show when={props.isEdit}>
              <button
                style={dangerButtonStyle}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading()}
              >
                {app.translate('deleteNews')}
              </button>
            </Show>
            
            <div style={{ display: 'flex', gap: '12px' }}>
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
                disabled={isLoading() || !title().trim() || !description().trim()}
              >
                {isLoading() ? '...' : app.translate('save')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Show when={showDeleteConfirm()}>
        <div style={modalOverlayStyle} onClick={() => setShowDeleteConfirm(false)}>
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
              {app.translate('confirmDelete')}
            </h3>
            <p style={{
              'font-size': '14px',
              color: 'var(--color-text)',
              'margin-bottom': '20px',
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
    </Show>
  );
}