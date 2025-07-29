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
      action: () => {
        window.location.href = `tel:${cleanNumber}`;
      }
    },
    {
      text: language === 'ar' ? 'محادثة واتساب' : 'WhatsApp Chat',
      action: () => {
        window.open(`https://wa.me/${cleanNumber}`, '_blank');
      }
    }
  ];
  
  // Create backdrop first
  const backdrop = document.createElement('div');
  backdrop.style.position = 'fixed';
  backdrop.style.top = '0';
  backdrop.style.left = '0';
  backdrop.style.width = '100%';
  backdrop.style.height = '100%';
  backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  backdrop.style.zIndex = '9999';
  backdrop.style.display = 'flex';
  backdrop.style.alignItems = 'center';
  backdrop.style.justifyContent = 'center';
  
  // Create action menu
  const actionMenu = document.createElement('div');
  actionMenu.style.backgroundColor = '#ffffff';
  actionMenu.style.borderRadius = '12px';
  actionMenu.style.padding = '20px';
  actionMenu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
  actionMenu.style.minWidth = '250px';
  actionMenu.style.maxWidth = '90vw';
  
  // Title
  const title = document.createElement('div');
  title.textContent = phoneNumber;
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '16px';
  title.style.textAlign = 'center';
  title.style.color = '#1f2937';
  title.style.fontSize = '16px';
  actionMenu.appendChild(title);
  
  // Action buttons
  actions.forEach((action) => {
    const button = document.createElement('button');
    button.textContent = action.text;
    button.style.width = '100%';
    button.style.padding = '12px 16px';
    button.style.margin = '6px 0';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.backgroundColor = '#3b82f6';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    button.style.fontWeight = '500';
    button.style.transition = 'background-color 0.2s';
    
    button.onmouseover = () => {
      button.style.backgroundColor = '#2563eb';
    };
    button.onmouseout = () => {
      button.style.backgroundColor = '#3b82f6';
    };
    
    button.onclick = (e) => {
      e.stopPropagation();
      action.action();
      document.body.removeChild(backdrop);
    };
    
    actionMenu.appendChild(button);
  });
  
  // Cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = language === 'ar' ? 'إلغاء' : 'Cancel';
  cancelButton.style.width = '100%';
  cancelButton.style.padding = '12px 16px';
  cancelButton.style.marginTop = '8px';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '8px';
  cancelButton.style.backgroundColor = '#ef4444';
  cancelButton.style.color = 'white';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.fontSize = '14px';
  cancelButton.style.fontWeight = '500';
  
  cancelButton.onmouseover = () => {
    cancelButton.style.backgroundColor = '#dc2626';
  };
  cancelButton.onmouseout = () => {
    cancelButton.style.backgroundColor = '#ef4444';
  };
  
  cancelButton.onclick = (e) => {
    e.stopPropagation();
    document.body.removeChild(backdrop);
  };
  
  actionMenu.appendChild(cancelButton);
  
  // Close on backdrop click
  backdrop.onclick = (e) => {
    if (e.target === backdrop) {
      document.body.removeChild(backdrop);
    }
  };
  
  // Prevent menu clicks from closing
  actionMenu.onclick = (e) => {
    e.stopPropagation();
  };
  
  backdrop.appendChild(actionMenu);
  document.body.appendChild(backdrop);
}