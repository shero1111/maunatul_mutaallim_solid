import { createSignal, createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Matn } from '../types';
import { getMatnColor } from '../styles/themes';

// Perfect Mobile Input Component - löst alle Keyboard-Probleme
function MobileTextInput(props: {
  value: string;
  onInput: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  let inputRef: HTMLInputElement | HTMLTextAreaElement;
  
  const inputStyle = {
    width: '100%',
    padding: '8px',
    'font-size': '16px', // Critical for iOS - prevents zoom
    border: '1px solid var(--color-border)',
    'border-radius': '6px',
    'background-color': 'var(--color-background)',
    color: 'var(--color-text)',
    outline: 'none',
    'box-sizing': 'border-box' as const,
    resize: 'none' as const,
    '-webkit-appearance': 'none',
    '-webkit-tap-highlight-color': 'transparent',
    isolation: 'isolate',
    'z-index': '1'
  };
  
  const handleInput = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
    props.onInput(target.value);
  };
  
  const handleFocus = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
    target.style.borderColor = 'var(--color-primary)';
  };
  
  const handleBlur = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
    target.style.borderColor = 'var(--color-border)';
  };
  
  return (
    <Show 
      when={props.multiline}
      fallback={
        <input
          ref={inputRef!}
          type="text"
          value={props.value}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={props.placeholder}
          style={inputStyle}
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck={false}
        />
      }
    >
      <textarea
        ref={inputRef!}
        value={props.value}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={props.placeholder}
        style={{...inputStyle, height: '80px'}}
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck={false}
      />
    </Show>
  );
}

export function MutunPage() {
  const app = useApp();
  const [searchTerm, setSearchTerm] = createSignal('');
  const [selectedSection, setSelectedSection] = createSignal('all');
  const [editingNote, setEditingNote] = createSignal<string | null>(null);
  const [noteTexts, setNoteTexts] = createSignal<Record<string, string>>({});
  
  // Get user's mutun
  const userMutun = createMemo(() => {
    const currentUser = app.currentUser();
    if (!currentUser) return [];
    
    return app.mutun().filter(m => m.user_id === currentUser.id);
  });
  
  // Filtered mutun based on search and section
  const filteredMutun = createMemo(() => {
    let mutun = userMutun();
    
    // Filter by section
    if (selectedSection() !== 'all') {
      mutun = mutun.filter(m => m.section === selectedSection());
    }
    
    // Filter by search term
    const term = searchTerm().toLowerCase().trim();
    if (term) {
      mutun = mutun.filter(m => 
        m.name.toLowerCase().includes(term) ||
        m.section.toLowerCase().includes(term) ||
        (m.description && m.description.toLowerCase().includes(term))
      );
    }
    
    return mutun;
  });
  
  // Get unique sections
  const sections = createMemo(() => {
    const sectionSet = new Set(userMutun().map(m => m.section));
    return ['all', ...Array.from(sectionSet)];
  });
  
  const containerStyle = {
    padding: '20px 16px 140px 16px', // Extra space for audio player
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
  
  const searchStyle = {
    width: '100%',
    padding: '8px',
    'font-size': '14px',
    border: '1px solid var(--color-border)',
    'border-radius': '6px',
    'background-color': 'var(--color-background)',
    color: 'var(--color-text)',
    'margin-bottom': '8px',
    outline: 'none',
    'box-sizing': 'border-box' as const,
    '-webkit-appearance': 'none',
    '-webkit-tap-highlight-color': 'transparent'
  };
  
  const sectionFilterStyle = {
    display: 'flex',
    gap: '8px',
    'margin-bottom': '16px',
    'overflow-x': 'auto',
    padding: '4px 0'
  };
  
  const sectionButtonStyle = (isActive: boolean) => ({
    padding: '6px 12px',
    'border-radius': '16px',
    border: '1px solid var(--color-border)',
    'background-color': isActive ? 'var(--color-primary)' : 'var(--color-background)',
    color: isActive ? 'white' : 'var(--color-text)',
    'font-size': '12px',
    cursor: 'pointer',
    'white-space': 'nowrap' as const,
    transition: 'all 0.2s',
    '-webkit-tap-highlight-color': 'transparent'
  });
  
  const cardStyle = {
    'background-color': 'var(--color-background)',
    'border-radius': '12px',
    padding: '16px',
    'margin-bottom': '12px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--color-border)'
  };
  
  const statusIndicatorStyle = (status: 'red' | 'orange' | 'green') => ({
    width: '12px',
    height: '12px',
    'border-radius': '50%',
    'background-color': getMatnColor(status),
    'margin-right': '8px',
    'flex-shrink': '0'
  });
  
  const matnHeaderStyle = {
    display: 'flex',
    'align-items': 'center',
    'margin-bottom': '8px'
  };
  
  const matnNameStyle = {
    'font-size': '16px',
    'font-weight': 'bold',
    color: 'var(--color-text)',
    flex: '1'
  };
  
  const sectionTagStyle = {
    'background-color': 'var(--color-primary)',
    color: 'white',
    padding: '2px 8px',
    'border-radius': '10px',
    'font-size': '10px',
    'font-weight': '500'
  };
  
  const actionsStyle = {
    display: 'flex',
    gap: '8px',
    'margin-top': '12px',
    'flex-wrap': 'wrap' as const
  };
  
  const actionButtonStyle = {
    padding: '6px 12px',
    'border-radius': '6px',
    border: '1px solid var(--color-border)',
    'background-color': 'var(--color-background)',
    color: 'var(--color-text)',
    'font-size': '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '-webkit-tap-highlight-color': 'transparent'
  };
  
  const primaryButtonStyle = {
    ...actionButtonStyle,
    'background-color': 'var(--color-primary)',
    color: 'white',
    'border-color': 'var(--color-primary)'
  };
  
  const noteContainerStyle = {
    'margin-top': '12px',
    padding: '12px',
    'background-color': 'var(--color-surface)',
    'border-radius': '8px'
  };
  
  // Actions
  const updateMatnStatus = (matn: Matn, newStatus: 'red' | 'orange' | 'green') => {
    const updatedMatn = {
      ...matn,
      status: newStatus,
      lastChange_date: new Date().toISOString()
    };
    app.updateMatn(updatedMatn);
  };
  
  const handlePlayAudio = (matn: Matn) => {
    if (matn.audio_link) {
      app.playAudio(matn.id, matn.name, matn.audio_link);
    }
  };
  
  const handleEditNote = (matnId: string, currentNote: string = '') => {
    setEditingNote(matnId);
    setNoteTexts(prev => ({ ...prev, [matnId]: currentNote }));
  };
  
  const handleSaveNote = (matn: Matn) => {
    const newNote = noteTexts()[matn.id] || '';
    const updatedMatn = {
      ...matn,
      description: newNote,
      lastChange_date: new Date().toISOString()
    };
    app.updateMatn(updatedMatn);
    setEditingNote(null);
  };
  
  const handleCancelNote = () => {
    setEditingNote(null);
  };
  
  const getDaysAgo = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return app.translate('today');
    if (diffDays === 1) return `1 ${app.translate('day')}`;
    return `${diffDays} ${app.translate('days')}`;
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {app.translate('mutuun')}
        </h1>
        
        <input
          type="text"
          placeholder={`${app.translate('search')}...`}
          value={searchTerm()}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          style={searchStyle}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
        />
        
        <div style={sectionFilterStyle}>
          <For each={sections()}>
            {(section) => (
              <button
                style={sectionButtonStyle(selectedSection() === section)}
                onClick={() => setSelectedSection(section)}
              >
                {section === 'all' ? app.translate('allStatuses') : section}
              </button>
            )}
          </For>
        </div>
      </div>
      
      <For each={filteredMutun()}>
        {(matn) => (
          <div style={cardStyle}>
            <div style={matnHeaderStyle}>
              <div style={statusIndicatorStyle(matn.status)} />
              <div style={matnNameStyle}>{matn.name}</div>
              <div style={sectionTagStyle}>{matn.section}</div>
            </div>
            
            <Show when={matn.lastChange_date}>
              <div style={{
                'font-size': '12px',
                color: 'var(--color-text-secondary)',
                'margin-bottom': '8px'
              }}>
                {app.translate('lastUpdate')}: {getDaysAgo(matn.lastChange_date)} {app.translate('lastFullRevising')}
              </div>
            </Show>
            
            <Show when={matn.description && editingNote() !== matn.id}>
              <div style={{
                'font-size': '14px',
                color: 'var(--color-text)',
                'margin-bottom': '8px',
                'background-color': 'var(--color-surface)',
                padding: '8px',
                'border-radius': '6px'
              }}>
                {matn.description}
              </div>
            </Show>
            
            <Show when={editingNote() === matn.id}>
              <div style={noteContainerStyle}>
                <MobileTextInput
                  value={noteTexts()[matn.id] || ''}
                  onInput={(value) => setNoteTexts(prev => ({ ...prev, [matn.id]: value }))}
                  placeholder={app.translate('writeNote')}
                  multiline={true}
                />
                <div style={{ display: 'flex', gap: '8px', 'margin-top': '8px' }}>
                  <button
                    style={primaryButtonStyle}
                    onClick={() => handleSaveNote(matn)}
                  >
                    {app.translate('save')}
                  </button>
                  <button
                    style={actionButtonStyle}
                    onClick={handleCancelNote}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Show>
            
            <div style={actionsStyle}>
              <button
                style={{
                  ...actionButtonStyle,
                  'background-color': getMatnColor('red'),
                  color: 'white',
                  'border-color': getMatnColor('red')
                }}
                onClick={() => updateMatnStatus(matn, 'red')}
              >
                🔴
              </button>
              
              <button
                style={{
                  ...actionButtonStyle,
                  'background-color': getMatnColor('orange'),
                  color: 'white',
                  'border-color': getMatnColor('orange')
                }}
                onClick={() => updateMatnStatus(matn, 'orange')}
              >
                🟡
              </button>
              
              <button
                style={{
                  ...actionButtonStyle,
                  'background-color': getMatnColor('green'),
                  color: 'white',
                  'border-color': getMatnColor('green')
                }}
                onClick={() => updateMatnStatus(matn, 'green')}
              >
                🟢
              </button>
              
              <Show when={matn.audio_link}>
                <button
                  style={primaryButtonStyle}
                  onClick={() => handlePlayAudio(matn)}
                >
                  🎵 {app.translate('audio')}
                </button>
              </Show>
              
              <Show when={matn.memorization_pdf_link}>
                <button
                  style={actionButtonStyle}
                  onClick={() => window.open(matn.memorization_pdf_link, '_blank')}
                >
                  📄 PDF
                </button>
              </Show>
              
              <button
                style={actionButtonStyle}
                onClick={() => handleEditNote(matn.id, matn.description)}
              >
                📝 {app.translate('edit')}
              </button>
            </div>
          </div>
        )}
      </For>
      
      <Show when={filteredMutun().length === 0}>
        <div style={{
          'text-align': 'center',
          padding: '40px 20px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>📚</div>
          <div>{app.translate('loading')}</div>
        </div>
      </Show>
    </div>
  );
}