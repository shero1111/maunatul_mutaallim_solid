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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
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
                  top: '12px',
                  left: '12px',
                  'background-color': 'rgba(0,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  'border-radius': '50%',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  'font-size': '14px',
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
                ✏️
              </button>
            </Show>

            <h2 style={newsTitleStyle}>
              {newsItem.title}
            </h2>
            
            <p style={newsDescriptionStyle}>
              {newsItem.description}
            </p>
            
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
      </div>
    </>
  );
}