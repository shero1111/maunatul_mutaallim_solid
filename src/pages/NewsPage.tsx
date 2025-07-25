import { createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';

export function NewsPage() {
  const app = useApp();
  
  // Sort news by date (newest first)
  const sortedNews = createMemo(() => {
    return [...app.news()].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
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
  

  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {app.translate('news')}
        </h1>
      </div>
      
      <For each={sortedNews()}>
        {(newsItem) => (
          <article style={newsCardStyle}>
            <h2 style={newsTitleStyle}>
              {newsItem.title}
            </h2>
            
            <p style={newsDescriptionStyle}>
              {newsItem.description}
            </p>
            
            <div style={newsMetaStyle}>
              <span>{formatDate(newsItem.created_at)}</span>
            </div>
          </article>
        )}
      </For>
      
      <Show when={sortedNews().length === 0}>
        <div style={{
          'text-align': 'center',
          padding: '40px 20px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>📰</div>
          <div>{app.translate('noNews')}</div>
        </div>
      </Show>
    </div>
  );
}