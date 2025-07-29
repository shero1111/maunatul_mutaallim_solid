import { JSX } from 'solid-js';

// Regular expressions for phone numbers and URLs
const PHONE_REGEX = /(\+?[0-9]{1,4}[-\s]?)?(\(?[0-9]{1,4}\)?[-\s]?)?[0-9]{1,4}[-\s]?[0-9]{1,4}[-\s]?[0-9]{1,9}/g;
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

export function makeTextClickable(text: string, language: 'ar' | 'en' = 'ar'): JSX.Element {
  if (!text) return <span>{text}</span>;
  
  // Split text by URLs and phone numbers
  const parts: JSX.Element[] = [];
  let lastIndex = 0;
  
  // Find all matches (URLs and phone numbers)
  const urlMatches = Array.from(text.matchAll(URL_REGEX));
  const phoneMatches = Array.from(text.matchAll(PHONE_REGEX));
  
  // Combine and sort all matches by position
  const allMatches = [
    ...urlMatches.map(match => ({ 
      type: 'url' as const, 
      match, 
      start: match.index!, 
      end: match.index! + match[0].length 
    })),
    ...phoneMatches.map(match => ({ 
      type: 'phone' as const, 
      match, 
      start: match.index!, 
      end: match.index! + match[0].length 
    }))
  ].sort((a, b) => a.start - b.start);
  
  // Remove overlapping matches (prefer URLs over phone numbers)
  const filteredMatches = [];
  for (const match of allMatches) {
    const hasOverlap = filteredMatches.some(existing => 
      (match.start >= existing.start && match.start < existing.end) ||
      (match.end > existing.start && match.end <= existing.end)
    );
    if (!hasOverlap) {
      filteredMatches.push(match);
    }
  }
  
  // Build the JSX elements
  for (const { type, match, start, end } of filteredMatches) {
    // Add text before the match
    if (start > lastIndex) {
      parts.push(<span>{text.slice(lastIndex, start)}</span>);
    }
    
    const matchText = match[0];
    
    if (type === 'url') {
      const url = matchText.startsWith('http') ? matchText : `https://${matchText}`;
      parts.push(
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--color-primary)',
            'text-decoration': 'underline',
            cursor: 'pointer'
          }}
          title={language === 'ar' ? 'فتح الرابط' : 'Open Link'}
        >
          {matchText}
        </a>
      );
    } else if (type === 'phone') {
      parts.push(
        <span
          style={{
            color: 'var(--color-primary)',
            'text-decoration': 'underline',
            cursor: 'pointer',
            'font-weight': '500'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            showPhoneActions(matchText, language);
          }}
          title={language === 'ar' ? 'انقر للاتصال' : 'Click to call'}
        >
          {matchText}
        </span>
      );
    }
    
    lastIndex = end;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span>{text.slice(lastIndex)}</span>);
  }
  
  return <>{parts}</>;
}

function showPhoneActions(phoneNumber: string, language: 'ar' | 'en') {
  const cleanNumber = phoneNumber.replace(/[-\s\(\)]/g, '');
  
  const actions = [
    {
      text: language === 'ar' ? 'اتصال مباشر' : 'Direct Call',
      action: () => window.open(`tel:${cleanNumber}`)
    },
    {
      text: language === 'ar' ? 'محادثة واتساب' : 'WhatsApp Chat',
      action: () => window.open(`https://wa.me/${cleanNumber}`)
    }
  ];
  
  // Create a simple action menu
  const actionMenu = document.createElement('div');
  actionMenu.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-background);
    border: 2px solid var(--color-border);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    z-index: 10000;
    min-width: 200px;
  `;
  
  const title = document.createElement('div');
  title.textContent = phoneNumber;
  title.style.cssText = `
    font-weight: bold;
    margin-bottom: 12px;
    text-align: center;
    color: var(--color-text);
  `;
  actionMenu.appendChild(title);
  
  actions.forEach((action, index) => {
    const button = document.createElement('button');
    button.textContent = action.text;
    button.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      margin: 4px 0;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      background: var(--color-surface);
      color: var(--color-text);
      cursor: pointer;
      transition: background-color 0.2s;
    `;
    button.onmouseover = () => button.style.backgroundColor = 'var(--color-primary-light)';
    button.onmouseout = () => button.style.backgroundColor = 'var(--color-surface)';
    button.onclick = () => {
      action.action();
      document.body.removeChild(actionMenu);
    };
    actionMenu.appendChild(button);
  });
  
  // Add cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = language === 'ar' ? 'إلغاء' : 'Cancel';
  cancelButton.style.cssText = `
    width: 100%;
    padding: 8px 12px;
    margin-top: 8px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-error);
    color: white;
    cursor: pointer;
  `;
  cancelButton.onclick = () => document.body.removeChild(actionMenu);
  actionMenu.appendChild(cancelButton);
  
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    z-index: 9999;
  `;
  backdrop.onclick = () => document.body.removeChild(actionMenu);
  
  actionMenu.appendChild(backdrop);
  document.body.appendChild(actionMenu);
}