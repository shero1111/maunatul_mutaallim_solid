import { createMemo, For, Show, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';
import { NewsModal } from '../components/NewsModal';
import { NewsItem } from '../types';

export function NewsPage() {
  const app = useApp();
  const [selectedNews, setSelectedNews] = createSignal<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [isEdit, setIsEdit] = createSignal(false);
  const [showContextMenu, setShowContextMenu] = createSignal(false);
  const [contextMenuNews, setContextMenuNews] = createSignal<NewsItem | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = createSignal({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = createSignal<number | null>(null);
  
  // Filter and sort news based on user role and publish date
  const filteredNews = createMemo(() => {
    const currentUser = app.currentUser();
    const now = new Date();
    
    let newsItems = [...app.news()];
    
    // Filter based on publish date and user role
    if (currentUser?.role === 'student' || currentUser?.role === 'lehrer') {
      // Students and teachers only see news with publish_date <= now
      newsItems = newsItems.filter(item => {
        const publishDate = new Date(item.publish_date || item.created_at);
        return publishDate <= now;
      });
    }
    // Admins and leaders see all news regardless of publish date
    
    // Sort by publish_date (newest first)
    return newsItems.sort((a, b) => {
      const dateA = new Date(a.publish_date || a.created_at);
      const dateB = new Date(b.publish_date || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  });
  
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
  
  const newsCardStyle = {
    'background-color': 'var(--color-background)',
    'border-radius': '12px',
    padding: '16px',
    'margin-bottom': '16px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--color-border)'
  };
  
  const newsTitleStyle = {
    'font-size': '18px',
    'font-weight': 'bold',
    color: 'var(--color-text)',
    'margin-bottom': '8px',
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const newsDescriptionStyle = {
    'font-size': '14px',
    color: 'var(--color-text)',
    'line-height': '1.5',
    'margin-bottom': '12px',
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const newsMetaStyle = {
    display: 'flex',
    'justify-content': 'flex-end',
    'align-items': 'center',
    'font-size': '12px',
    color: 'var(--color-text-secondary)'
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(app.language() === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) + ' ' + date.toLocaleTimeString(app.language() === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const canEditNews = () => {
    const currentUser = app.currentUser();
    return currentUser?.role === 'superuser' || currentUser?.role === 'leitung';
  };

  const handleAddNews = () => {
    setSelectedNews(null);
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const handleEditNews = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
    setIsEdit(false);
  };

  const isFutureNews = (newsItem: NewsItem) => {
    const publishDate = new Date(newsItem.publish_date || newsItem.created_at);
    return publishDate > new Date();
  };

  // Long-press handlers for context menu
  const handleLongPressStart = (e: MouseEvent | TouchEvent, newsItem: NewsItem) => {
    e.preventDefault();
    
    // Clear any existing timer
    const currentTimer = longPressTimer();
    if (currentTimer) {
      clearTimeout(currentTimer);
    }
    
    // Set position for context menu
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setContextMenuPosition({ x: clientX, y: clientY });
    
    // Start long press timer (500ms)
    const timer = setTimeout(() => {
      setContextMenuNews(newsItem);
      setShowContextMenu(true);
    }, 500);
    
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    const currentTimer = longPressTimer();
    if (currentTimer) {
      clearTimeout(currentTimer);
      setLongPressTimer(null);
    }
  };

  const handleContextMenuAction = (action: 'share' | 'copy' | 'delete') => {
    const newsItem = contextMenuNews();
    if (!newsItem) return;

    switch (action) {
      case 'share':
        handleShareNews(newsItem);
        break;
      case 'copy':
        handleCopyNews(newsItem);
        break;
      case 'delete':
        handleDeleteNews(newsItem);
        break;
    }
    
    setShowContextMenu(false);
    setContextMenuNews(null);
  };

  const handleShareNews = (newsItem: NewsItem) => {
    const shareText = `${newsItem.title || ''}\n\n${newsItem.description || ''}\n\n${formatDate(newsItem.publish_date || newsItem.created_at)}`;
    
    if (navigator.share) {
      navigator.share({
        title: newsItem.title || '',
        text: shareText,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert(app.language() === 'ar' ? 'تم نسخ النص للحافظة' : 'Text copied to clipboard');
      }).catch(console.error);
    }
  };

  const handleCopyNews = (newsItem: NewsItem) => {
    const copyText = `${newsItem.title || ''}\n\n${newsItem.description || ''}\n\n${formatDate(newsItem.publish_date || newsItem.created_at)}`;
    
    navigator.clipboard.writeText(copyText).then(() => {
      alert(app.language() === 'ar' ? 'تم نسخ النص للحافظة' : 'Text copied to clipboard');
    }).catch(console.error);
  };

  const handleDeleteNews = (newsItem: NewsItem) => {
    const confirmMessage = app.language() === 'ar' 
      ? 'هل أنت متأكد من حذف هذا الخبر؟'
      : 'Are you sure you want to delete this news?';
    
    if (confirm(confirmMessage)) {
      app.deleteNews(newsItem.id);
    }
  };

  // Close context menu when clicking outside
  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
    setContextMenuNews(null);
  };
  

  
  return (
    <>
      <style>
        {`
          article:hover .edit-icon {
            opacity: 1 !important;
          }
          .edit-icon {
            opacity: 0;
          }
        `}
      </style>
      <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center',
          'margin-bottom': '16px'
        }}>
          <h1 style={titleStyle}>
            {app.translate('news')}
          </h1>
          
          <Show when={canEditNews()}>
            <button
              onClick={handleAddNews}
              style={{
                'background-color': 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                'border-radius': '8px',
                'font-size': '14px',
                'font-weight': '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                'align-items': 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ 'font-size': '16px' }}>+</span>
              {app.translate('addNews')}
            </button>
          </Show>
        </div>
      </div>
      
      <For each={filteredNews()}>
        {(newsItem) => (
          <article style={{
            ...newsCardStyle,
            position: 'relative' as const,
            cursor: 'default',
            ...(isFutureNews(newsItem) && canEditNews() ? {
              border: '2px solid var(--color-warning)',
              'background-color': 'rgba(245, 158, 11, 0.05)'
            } : {})
          }}
          onMouseDown={(e) => handleLongPressStart(e, newsItem)}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={(e) => handleLongPressStart(e, newsItem)}
          onTouchEnd={handleLongPressEnd}
          onTouchCancel={handleLongPressEnd}
          >
            {/* Future News Indicator */}
            <Show when={isFutureNews(newsItem) && canEditNews()}>
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                'background-color': 'var(--color-warning)',
                color: 'white',
                padding: '4px 8px',
                'border-radius': '12px',
                'font-size': '10px',
                'font-weight': '600'
              }}>
                {app.language() === 'ar' ? 'مجدول' : 'SCHEDULED'}
              </div>
            </Show>

            {/* Edit Icon */}
            <Show when={canEditNews()}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditNews(newsItem);
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  'background-color': 'rgba(0,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  width: '20px',
                  height: '20px',
                  'border-radius': '4px',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  'font-size': '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  'z-index': '2'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.9)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title={app.translate('editNews')}
              >
                ⚙️
              </button>
            </Show>

            <Show when={newsItem.title?.trim()}>
              <h2 style={newsTitleStyle}>
                {newsItem.title}
              </h2>
            </Show>
            
            <Show when={newsItem.description?.trim()}>
              <p style={newsDescriptionStyle}>
                {newsItem.description}
              </p>
            </Show>
            
            {/* Fallback when only one field is present */}
            <Show when={!newsItem.title?.trim() && newsItem.description?.trim()}>
              <h2 style={{
                ...newsTitleStyle,
                'font-size': '1.1rem',
                'line-height': '1.4'
              }}>
                {newsItem.description}
              </h2>
            </Show>
            
            <div style={newsMetaStyle}>
              <div style={{
                display: 'flex',
                'align-items': 'center',
                gap: '8px'
              }}>
                <span>{formatDate(newsItem.publish_date || newsItem.created_at)}</span>
                <Show when={isFutureNews(newsItem) && canEditNews()}>
                  <span style={{
                    'font-size': '10px',
                    color: 'var(--color-warning)',
                    'font-weight': '600'
                  }}>
                    • {app.language() === 'ar' ? 'سينشر في' : 'Will publish on'} {new Date(newsItem.publish_date).toLocaleDateString()}
                  </span>
                </Show>
              </div>
            </div>
          </article>
        )}
      </For>
      
      <Show when={filteredNews().length === 0}>
        <div style={{
          'text-align': 'center',
          padding: '40px 20px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>📰</div>
          <div>{app.translate('noNews')}</div>
        </div>
      </Show>

      <NewsModal
        newsItem={selectedNews()}
        isOpen={isModalOpen()}
        onClose={handleModalClose}
        isEdit={isEdit()}
      />

      {/* Context Menu */}
      <Show when={showContextMenu()}>
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            'z-index': '1000',
            'background-color': 'rgba(0, 0, 0, 0.3)'
          }}
          onClick={handleCloseContextMenu}
        >
          <div 
            style={{
              position: 'absolute',
              left: `${Math.min(contextMenuPosition().x, window.innerWidth - 200)}px`,
              top: `${Math.min(contextMenuPosition().y, window.innerHeight - 200)}px`,
              'background-color': 'var(--color-surface)',
              'border-radius': '12px',
              'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              'min-width': '180px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Show when={canEditNews()}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  'background-color': 'transparent',
                  color: 'var(--color-text)',
                  'text-align': 'left',
                  cursor: 'pointer',
                  'font-size': '14px',
                  display: 'flex',
                  'align-items': 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => handleContextMenuAction('share')}
              >
                <span>📤</span>
                {app.language() === 'ar' ? 'مشاركة' : 'Share'}
              </button>
            </Show>
            
            <button
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                'background-color': 'transparent',
                color: 'var(--color-text)',
                'text-align': 'left',
                cursor: 'pointer',
                'font-size': '14px',
                display: 'flex',
                'align-items': 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => handleContextMenuAction('copy')}
            >
              <span>📋</span>
              {app.language() === 'ar' ? 'نسخ' : 'Copy'}
            </button>
            
            <Show when={canEditNews()}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  'background-color': 'transparent',
                  color: 'var(--color-error)',
                  'text-align': 'left',
                  cursor: 'pointer',
                  'font-size': '14px',
                  display: 'flex',
                  'align-items': 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease',
                  'border-top': '1px solid var(--color-border)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => handleContextMenuAction('delete')}
              >
                <span>🗑️</span>
                {app.language() === 'ar' ? 'حذف' : 'Delete'}
              </button>
            </Show>
          </div>
        </div>
      </Show>
      </div>
    </>
  );
}