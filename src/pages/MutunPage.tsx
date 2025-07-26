import { createSignal, createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Matn } from '../types';
import { getStatusColor } from '../styles/themes';

export function MutunPage() {
  const app = useApp();
  const [levelFilter, setLevelFilter] = createSignal<string>('all');
  
  // State für collapsed sections - alle Sektionen sind initial aufgeklappt
  const [collapsedSections, setCollapsedSections] = createSignal<Record<string, boolean>>({});

  // Filter user's mutun
  const userMutun = createMemo(() => 
    app.mutun().filter(m => m.user_id === app.currentUser()?.id)
  );

  const filteredMutun = createMemo(() => 
    userMutun().filter(m => 
      levelFilter() === 'all' || m.section === levelFilter()
    )
  );

  const groupedMutun = createMemo(() => {
    const grouped: Record<string, Matn[]> = {};
    filteredMutun().forEach(matn => {
      if (!grouped[matn.section]) grouped[matn.section] = [];
      grouped[matn.section].push(matn);
    });
    return grouped;
  });

  const allLevels = [
    app.translate('level1'), 
    app.translate('level2'), 
    app.translate('level3'), 
    app.translate('level4')
  ];

  // Toggle-Funktion für Sektionen
  const toggleSection = (section: string) => {
    console.log('🔄 Toggling section:', section);
    setCollapsedSections(prev => {
      const currentState = prev[section] || false;
      const newState = {
        ...prev,
        [section]: !currentState
      };
      console.log('📂 Previous state for', section, ':', currentState);
      console.log('📂 New state for', section, ':', newState[section]);
      console.log('📂 Full new state:', newState);
      return newState;
    });
  };

  // Level Filter Handler
  const handleLevelFilterChange = (newFilter: string) => {
    setLevelFilter(newFilter);
    // Bei Filter-Change alle Sections aufklappen
    setCollapsedSections({});
  };

  // Status Change
  const changeMatnStatus = (matnId: string) => {
    const matn = app.mutun().find(m => m.id === matnId);
    if (!matn) return;

    const statusCycle = ['red', 'orange', 'green'] as const;
    const currentIndex = statusCycle.indexOf(matn.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    console.log('🔄 Changing matn status from', matn.status, 'to', nextStatus);

    const updatedMatn = {
      ...matn,
      status: nextStatus,
      lastChange_date: new Date().toISOString(),
      // Reset days_since_last_revision when status becomes green (completed)
      days_since_last_revision: nextStatus === 'green' ? 0 : matn.days_since_last_revision
    };

    console.log('✅ Updated matn:', updatedMatn);
    app.updateMatn(updatedMatn);
  };

  const getMatnColor = (status: string) => {
    switch (status) {
      case 'red': return '#ef4444';
      case 'orange': return '#f97316';
      case 'green': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getMatnStatusText = (status: string) => {
    switch (status) {
      case 'red': return app.translate('needsRevision');
      case 'orange': return app.translate('nearCompletion');
      case 'green': return app.translate('completed');
      default: return app.translate('status');
    }
  };

  // Calculate days since last change and handle threshold logic
  const calculateDaysSinceLastChange = (matn: Matn) => {
    if (!matn.lastChange_date) {
      console.log('❌ No lastChange_date for', matn.name, '- returning 0');
      return 0;
    }
    
    const now = new Date();
    // Handle both full ISO strings and date-only strings
    let lastChangeDate: Date;
    if (matn.lastChange_date.includes('T')) {
      // Full ISO string (e.g., "2024-01-26T14:30:00.000Z")
      lastChangeDate = new Date(matn.lastChange_date);
    } else {
      // Date-only string (e.g., "2024-01-26") - treat as start of day
      lastChangeDate = new Date(matn.lastChange_date + 'T00:00:00.000Z');
    }
    
    const diffTime = now.getTime() - lastChangeDate.getTime();
    const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('📅 Days calculation for', matn.name, ':', {
      lastChange: matn.lastChange_date,
      lastChangeParsed: lastChangeDate.toISOString(),
      now: now.toISOString(),
      diffTime: diffTime,
      diffHours: diffTime / (1000 * 60 * 60),
      daysSince: daysSince,
      status: matn.status
    });
    
    // Special case: If status is green and it was just changed today (same day)
    if (matn.status === 'green' && daysSince === 0) {
      console.log('✅ Status is green and same day - returning 0 days');
      return 0;
    }
    
    // For all other cases, calculate normally
    const finalDays = Math.max(0, daysSince);
    console.log('📊 Final days for', matn.name, ':', finalDays, 'Status:', matn.status);
    
    // Auto-change from green to red if threshold exceeded (only for green status)
    if (matn.status === 'green' && finalDays >= (matn.threshold || 7)) {
      console.log('⏰ Auto-changing matn', matn.name, 'from green to red (threshold exceeded)');
      const updatedMatn = {
        ...matn,
        status: 'red' as const,
        lastChange_date: new Date().toISOString(),
        days_since_last_revision: finalDays
      };
      // Delayed update to avoid infinite loops
      setTimeout(() => app.updateMatn(updatedMatn), 100);
    }
    
    return finalDays;
  };

  // Note State
  const [noteTexts, setNoteTexts] = createSignal<Record<string, string>>({});
  const [focusedNoteId, setFocusedNoteId] = createSignal<string | null>(null);

  // Initialize note text
  const initializeNoteText = (matn: Matn) => {
    if (!noteTexts()[matn.id]) {
      setNoteTexts(prev => ({
        ...prev,
        [matn.id]: matn.description || ''
      }));
    }
  };

  // Save note
  const saveNote = (matn: Matn, value: string) => {
    const updatedMatn = {
      ...matn,
      description: value
    };
    app.updateMatn(updatedMatn);
    setNoteTexts(prev => ({
      ...prev,
      [matn.id]: value
    }));
  };

  // Threshold Modal State
  const [thresholdModalMatn, setThresholdModalMatn] = createSignal<Matn | null>(null);
  const [tempThreshold, setTempThreshold] = createSignal<number>(7);

  // PDF/Audio Modal State
  const [pdfModalMatn, setPdfModalMatn] = createSignal<Matn | null>(null);
  const [audioModalMatn, setAudioModalMatn] = createSignal<Matn | null>(null);

  const openThresholdModal = (matn: Matn) => {
    setThresholdModalMatn(matn);
    setTempThreshold(matn.threshold);
  };

  const closeThresholdModal = () => {
    setThresholdModalMatn(null);
    setTempThreshold(7);
  };

  const saveThreshold = () => {
    const matn = thresholdModalMatn();
    if (matn) {
      const updatedMatn = {
        ...matn,
        threshold: tempThreshold()
      };
      app.updateMatn(updatedMatn);
      closeThresholdModal();
    }
  };

  // PDF/Audio Modal Functions
  const openPdfModal = (matn: Matn) => {
    setPdfModalMatn(matn);
  };

  const closePdfModal = () => {
    setPdfModalMatn(null);
  };

  const openAudioModal = (matn: Matn) => {
    setAudioModalMatn(matn);
  };

  const closeAudioModal = () => {
    setAudioModalMatn(null);
  };

  return (
    <div style={{ 
      padding: '20px', 
      'padding-bottom': '100px',
      'max-width': '800px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ 'margin-bottom': '30px' }}>
        <h1 style={{ 
          color: 'var(--color-primary)', 
          'font-size': '1.8rem', 
          'margin-bottom': '15px',
          display: 'flex',
          'align-items': 'center',
          gap: '10px'
        }}>
          <span>📚</span>
          {app.translate('mutunPageTitle')}
        </h1>

        {/* Level Filter Buttons */}
        <div style={{ 
          display: 'flex', 
          'align-items': 'center',
          gap: '12px', 
          'flex-wrap': 'wrap',
          'margin-bottom': '20px'
        }}>
          {/* Label */}
          <span style={{
            color: 'var(--color-text)',
            'font-size': '16px',
            'font-weight': '600',
            'white-space': 'nowrap'
          }}>
            المستويات:
          </span>

          {/* الجميع Button */}
          <button 
            onClick={() => handleLevelFilterChange('all')} 
            style={{ 
              padding: '8px 16px', 
              background: levelFilter() === 'all' 
                ? 'var(--color-primary)' 
                : 'var(--color-surface)', 
              color: levelFilter() === 'all' ? 'white' : 'var(--color-text)', 
              border: '1px solid var(--color-border)', 
              'border-radius': '6px', 
              cursor: 'pointer', 
              'font-size': '14px',
              'font-weight': '500'
            }}
          >
            الجميع
          </button>

          {/* Individual Level Buttons */}
          <For each={['الأول', 'الثاني', 'الثالث', 'الرابع']}>
            {(levelShort, index) => {
              const fullLevel = allLevels[index()];
              return (
                <button 
                  onClick={() => handleLevelFilterChange(fullLevel)} 
                  style={{ 
                    padding: '8px 16px', 
                    background: levelFilter() === fullLevel 
                      ? 'var(--color-primary)' 
                      : 'var(--color-surface)', 
                    color: levelFilter() === fullLevel ? 'white' : 'var(--color-text)', 
                    border: '1px solid var(--color-border)', 
                    'border-radius': '6px', 
                    cursor: 'pointer', 
                    'font-size': '14px',
                    'font-weight': '500'
                  }}
                >
                  {levelShort}
                </button>
              );
            }}
          </For>
        </div>
      </div>

      {/* Sections */}
      <For each={Object.entries(groupedMutun())}>
        {([section, mutun]) => {
          const isCollapsed = () => collapsedSections()[section] || false;
          
          return (
            <div style={{ 'margin-bottom': '25px' }}>
              {/* Section Header - CLICKABLE */}
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSection(section);
                }} 
                                  style={{ 
                    background: 'var(--color-surface)', 
                    'border-radius': '12px', 
                    padding: '6px 10px', 
                    border: '2px solid var(--color-primary)', 
                    cursor: 'pointer',
                    'margin-bottom': isCollapsed() ? '0' : '15px',
                    transition: 'all 0.3s ease',
                    'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
                    'user-select': 'none',
                    '-webkit-user-select': 'none'
                  }}
                                                   onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
              >
                <div style={{ 
                  display: 'flex', 
                  'justify-content': 'space-between', 
                  'align-items': 'center' 
                }}>
                                      <h2 style={{ 
                      color: 'var(--color-primary)', 
                      'font-size': '1.1rem', 
                      margin: '0', 
                      display: 'flex', 
                      'align-items': 'center', 
                      gap: '8px',
                      transition: 'color 0.3s ease',
                      'font-weight': '500'
                    }}>
                      <span style={{ 
                        'font-size': '1.2rem',
                        transition: 'transform 0.3s ease'
                      }}>
                        {isCollapsed() ? '📁' : '📂'}
                      </span>
                      {section}
                    </h2>
                    <span style={{ 
                      color: 'var(--color-primary)', 
                      'font-size': '1.8rem', 
                      transition: 'transform 0.3s ease', 
                      transform: isCollapsed() ? 'rotate(-90deg)' : 'rotate(0deg)'
                    }}>
                      ▼
                    </span>
                </div>
              </div>
              
              {/* Section Content with Animation */}
              <Show when={!isCollapsed()}>
                <div style={{ 
                  display: 'grid', 
                  gap: '15px',
                  opacity: isCollapsed() ? '0' : '1',
                  'max-height': isCollapsed() ? '0' : 'none',
                  overflow: isCollapsed() ? 'hidden' : 'visible',
                  transition: 'opacity 0.3s ease, max-height 0.3s ease'
                }}>
                  <For each={mutun}>
                    {(matn) => {
                      initializeNoteText(matn);
                      
                      return (
                        <div 
                          style={{ 
                            background: 'var(--color-surface)', 
                            'border-radius': '16px', 
                            padding: '20px', 
                            border: 'none',
                            'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.3s ease',
                            position: 'relative' as const,
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0px)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)';
                          }}
                        >
                          {/* Subtle Status Indicator */}
                          <div style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            width: '4px',
                            height: '100%',
                            background: getMatnColor(matn.status),
                            'border-radius': '0 16px 16px 0',
                            opacity: '0.6'
                          }} />
                          
                          {/* Title - Centered at Top */}
                          <h3 style={{ 
                            color: 'var(--color-text)', 
                            'font-size': '1.3rem', 
                            margin: '0 0 16px 0',
                            'text-align': 'center',
                            'font-weight': '700',
                            'line-height': '1.4'
                          }}>
                            {matn.name}
                          </h3>

                          {/* Status Button and Settings - Below Title */}
                          <div style={{ 
                            display: 'flex', 
                            'align-items': 'center', 
                            gap: '10px',
                            'margin-bottom': '15px' 
                          }}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                changeMatnStatus(matn.id);
                              }} 
                              style={{ 
                                background: getMatnColor(matn.status), 
                                color: 'white', 
                                padding: '8px 12px', 
                                'border-radius': '8px', 
                                'font-size': '12px', 
                                'font-weight': '600',
                                border: 'none',
                                cursor: 'pointer',
                                flex: '1'
                              }}
                            >
                              {getMatnStatusText(matn.status)}
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openThresholdModal(matn);
                              }} 
                              style={{ 
                                background: 'var(--color-surface)', 
                                border: '2px solid var(--color-border)', 
                                'border-radius': '8px', 
                                padding: '8px', 
                                cursor: 'pointer', 
                                'font-size': '16px',
                                'min-width': '36px',
                                'min-height': '36px',
                                display: 'flex',
                                'align-items': 'center',
                                'justify-content': 'center'
                              }}
                              title="إعداد عتبة الإعادة"
                            >
                              ⚙️
                            </button>
                          </div>

                          {/* Note Field - direkt unter Titel */}
                          <div style={{ 'margin-bottom': '15px' }}>
                            <div style={{ 
                              display: 'flex', 
                              gap: '10px', 
                              'align-items': 'stretch',
                              width: '100%'
                            }}>
                              <input
                                type="text"
                                value={noteTexts()[matn.id] || ''}
                                onInput={(e) => {
                                  const value = e.currentTarget.value;
                                  setNoteTexts(prev => ({
                                    ...prev,
                                    [matn.id]: value
                                  }));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => {
                                  e.stopPropagation();
                                  setFocusedNoteId(matn.id);
                                }}
                                onBlur={(e) => {
                                  e.stopPropagation();
                                  setFocusedNoteId(null);
                                  saveNote(matn, e.currentTarget.value);
                                }}
                                onKeyPress={(e) => {
                                  e.stopPropagation();
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    saveNote(matn, e.currentTarget.value);
                                    e.currentTarget.blur();
                                  }
                                }}
                                placeholder={app.translate('writeNote')}
                                style={{
                                  flex: '1',
                                  'min-width': '0',
                                  padding: '12px',
                                  'font-size': '14px',
                                  border: '1px solid var(--color-border)',
                                  'border-radius': '8px',
                                  'background': 'var(--color-background)',
                                  color: 'var(--color-text)',
                                  outline: 'none',
                                  'box-sizing': 'border-box',
                                  'font-family': 'inherit'
                                }}
                              />
                              <Show when={focusedNoteId() === matn.id}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    saveNote(matn, noteTexts()[matn.id] || '');
                                    setFocusedNoteId(null);
                                  }}
                                  style={{
                                    padding: '12px 16px',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    'border-radius': '8px',
                                    cursor: 'pointer',
                                    'font-size': '13px',
                                    'font-weight': '600',
                                    'flex-shrink': '0',
                                    'min-width': 'auto'
                                  }}
                                >
                                  💾 {app.translate('save')}
                                </button>
                              </Show>
                            </div>
                            <Show when={focusedNoteId() === matn.id}>
                              <div style={{
                                'margin-top': '5px',
                                'font-size': '11px',
                                color: 'var(--color-text-secondary)',
                                'text-align': 'center'
                              }}>
                                💡 {app.language() === 'ar' ? 'اضغط Enter للحفظ أو انقر على الزر' : 'Press Enter to save or click button'}
                              </div>
                            </Show>
                          </div>

                          {/* PDF und Audio Buttons - über der Tage Info */}
                          <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            'flex-wrap': 'wrap',
                            'margin-bottom': '15px'
                          }}>
                            <Show when={matn.memorization_pdf_link || matn.explanation_pdf_link}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPdfModal(matn);
                                }} 
                                style={{ 
                                  padding: '10px 16px', 
                                  background: 'var(--color-primary)', 
                                  color: 'white', 
                                  border: 'none', 
                                  'border-radius': '8px', 
                                  cursor: 'pointer', 
                                  'font-size': '13px',
                                  'font-weight': '600'
                                }}
                              >
                                📄 مقرر PDF
                              </button>
                            </Show>
                            
                            <Show when={matn.memorization_audio_link || matn.explanation_audio_link}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAudioModal(matn);
                                }} 
                                style={{ 
                                  padding: '10px 16px', 
                                  background: 'var(--color-success)', 
                                  color: 'white', 
                                  border: 'none', 
                                  'border-radius': '8px', 
                                  cursor: 'pointer', 
                                  'font-size': '13px',
                                  'font-weight': '600'
                                }}
                              >
                                🎧 الصوتيات
                              </button>
                            </Show>
                          </div>

                          {/* Days Counter - am Ende als normaler Text */}
                          <div style={{
                            'text-align': app.language() === 'ar' ? 'right' : 'left',
                            color: 'var(--color-text-secondary)',
                            'font-size': '12px',
                            direction: app.language() === 'ar' ? 'rtl' : 'ltr'
                          }}>
                            {(() => {
                              // Get the most current matn data from store
                              const currentMatn = app.mutun().find(m => m.id === matn.id) || matn;
                              const days = calculateDaysSinceLastChange(currentMatn);
                              
                              console.log('🔍 Displaying days for', currentMatn.name, ':', {
                                days,
                                status: currentMatn.status,
                                lastChange: currentMatn.lastChange_date
                              });
                              
                                              return `${app.translate('lastChangeBefore')}: ${days} ${app.translate('daysAgo')}`;
                            })()}
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </div>
          );
        }}
      </For>

      {/* Empty State */}
      <Show when={filteredMutun().length === 0}>
        <div style={{
          'text-align': 'center',
          padding: '40px 20px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ 'font-size': '3rem', 'margin-bottom': '15px' }}>📚</div>
                          <h3 style={{ 'margin-bottom': '10px' }}>{app.translate('noMutunFound')}</h3>
                <p>{app.translate('noMutunFoundDesc')}</p>
        </div>
      </Show>

      {/* PDF Modal */}
      <Show when={pdfModalMatn()}>
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'z-index': '9999'
          }}
          onClick={closePdfModal}
        >
          <div 
            style={{
              background: 'var(--color-background)',
              'border-radius': '12px',
              padding: '20px',
              'max-width': '400px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              'justify-content': 'space-between',
              'align-items': 'center',
              'margin-bottom': '20px'
            }}>
              <h3 style={{ margin: '0', color: 'var(--color-text)' }}>
                📄 مقرر PDF
              </h3>
              <button 
                onClick={closePdfModal}
                style={{
                  background: 'none',
                  border: 'none',
                  'font-size': '20px',
                  cursor: 'pointer',
                  color: 'var(--color-text)'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
              <Show when={pdfModalMatn()?.memorization_pdf_link}>
                <button 
                  onClick={() => {
                    window.open(pdfModalMatn()?.memorization_pdf_link, '_blank');
                    closePdfModal();
                  }}
                  style={{
                    padding: '12px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '8px',
                    cursor: 'pointer',
                    'font-weight': '600'
                  }}
                >
                  📄 نص التحفيظ
                </button>
              </Show>
              
              <Show when={pdfModalMatn()?.explanation_pdf_link}>
                <button 
                  onClick={() => {
                    window.open(pdfModalMatn()?.explanation_pdf_link, '_blank');
                    closePdfModal();
                  }}
                  style={{
                    padding: '12px',
                    background: 'var(--color-secondary)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '8px',
                    cursor: 'pointer',
                    'font-weight': '600'
                  }}
                >
                  📖 نص الشرح
                </button>
              </Show>
            </div>
          </div>
        </div>
      </Show>

      {/* Audio Modal */}
      <Show when={audioModalMatn()}>
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'z-index': '9999'
          }}
          onClick={closeAudioModal}
        >
          <div 
            style={{
              background: 'var(--color-background)',
              'border-radius': '12px',
              padding: '20px',
              'max-width': '400px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              'justify-content': 'space-between',
              'align-items': 'center',
              'margin-bottom': '20px'
            }}>
              <h3 style={{ margin: '0', color: 'var(--color-text)' }}>
                🎧 الصوتيات
              </h3>
              <button 
                onClick={closeAudioModal}
                style={{
                  background: 'none',
                  border: 'none',
                  'font-size': '20px',
                  cursor: 'pointer',
                  color: 'var(--color-text)'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
              <Show when={audioModalMatn()?.memorization_audio_link}>
                <button 
                  onClick={() => {
                    const matn = audioModalMatn()!;
                    app.playAudio(matn.id, matn.name + ' - التحفيظ', matn.memorization_audio_link!, 'memorization');
                    closeAudioModal();
                  }}
                  style={{
                    padding: '12px',
                    background: 'var(--color-success)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '8px',
                    cursor: 'pointer',
                    'font-weight': '600'
                  }}
                >
                  🎧 صوت التحفيظ
                </button>
              </Show>
              
              <Show when={audioModalMatn()?.explanation_audio_link}>
                <button 
                  onClick={() => {
                    const matn = audioModalMatn()!;
                    app.playAudio(matn.id, matn.name + ' - الشرح', matn.explanation_audio_link!, 'explanation');
                    closeAudioModal();
                  }}
                  style={{
                    padding: '12px',
                    background: 'var(--color-warning)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '8px',
                    cursor: 'pointer',
                    'font-weight': '600'
                  }}
                >
                  🎧 صوت الشرح
                </button>
              </Show>
            </div>
          </div>
        </div>
      </Show>

      {/* Threshold Modal */}
      <Show when={thresholdModalMatn()}>
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'z-index': '9999'
        }}>
          <div style={{
            background: 'var(--color-background)',
            'border-radius': '12px',
            padding: '20px',
            'max-width': '400px',
            width: '90%',
            'max-height': '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              'justify-content': 'space-between',
              'align-items': 'center',
              'margin-bottom': '20px'
            }}>
              <h3 style={{ margin: '0', color: 'var(--color-text)' }}>
                ⚙️ إعداد عتبة الإعادة
              </h3>
              <button 
                onClick={closeThresholdModal}
                style={{
                  background: 'none',
                  border: 'none',
                  'font-size': '20px',
                  cursor: 'pointer',
                  color: 'var(--color-text)'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ 'margin-bottom': '20px' }}>
              <p style={{ color: 'var(--color-text)', 'margin-bottom': '10px' }}>
                {thresholdModalMatn()?.name}
              </p>
              <p style={{ color: 'var(--color-text-secondary)', 'font-size': '14px' }}>
                عدد الأيام قبل إعادة تعيين اللون إلى الأحمر
              </p>
              
              <div style={{
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                gap: '15px',
                'margin': '20px 0'
              }}>
                <button 
                  onClick={() => setTempThreshold(Math.max(1, tempThreshold() - 1))}
                  style={{
                    background: 'var(--color-border)',
                    border: 'none',
                    'border-radius': '50%',
                    width: '40px',
                    height: '40px',
                    'font-size': '20px',
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <div style={{ 'text-align': 'center' }}>
                  <div style={{ 
                    'font-size': '24px', 
                    'font-weight': 'bold',
                    color: 'var(--color-primary)'
                  }}>
                    {tempThreshold()}
                  </div>
                  <div style={{ 'font-size': '12px', color: 'var(--color-text-secondary)' }}>
                    أيام
                  </div>
                </div>
                <button 
                  onClick={() => setTempThreshold(Math.min(365, tempThreshold() + 1))}
                  style={{
                    background: 'var(--color-border)',
                    border: 'none',
                    'border-radius': '50%',
                    width: '40px',
                    height: '40px',
                    'font-size': '20px',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '8px',
                'justify-content': 'center',
                'flex-wrap': 'wrap'
              }}>
                <For each={[3, 7, 14, 30]}>
                  {(days) => (
                    <button 
                      onClick={() => setTempThreshold(days)}
                      style={{
                        padding: '6px 12px',
                        background: tempThreshold() === days ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: tempThreshold() === days ? 'white' : 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        'border-radius': '6px',
                        cursor: 'pointer',
                        'font-size': '12px'
                      }}
                    >
                      {days}د
                    </button>
                  )}
                </For>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={saveThreshold}
                style={{
                  flex: '1',
                  padding: '12px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  'border-radius': '8px',
                  cursor: 'pointer',
                  'font-weight': '600'
                }}
              >
                {app.translate('saveNote')}
              </button>
              <button 
                onClick={closeThresholdModal}
                style={{
                  flex: '1',
                  padding: '12px',
                  background: 'var(--color-border)',
                  color: 'var(--color-text)',
                  border: 'none',
                  'border-radius': '8px',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}