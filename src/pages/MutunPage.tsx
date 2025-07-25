import { createSignal, createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Matn } from '../types';
import { getStatusColor } from '../styles/themes';

export function MutunPage() {
  const app = useApp();
  const [levelFilter, setLevelFilter] = createSignal<string>('all');
  
  // Einfaches State für collapsed sections
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

  const allLevels = ['المستوى الأول', 'المستوى الثاني', 'المستوى الثالث', 'المستوى الرابع'];

  // Einfache Toggle-Funktion
  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

    const updatedMatn = {
      ...matn,
      status: nextStatus,
      lastChange_date: new Date().toISOString().split('T')[0]
    };

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
      case 'red': return 'يحتاج مراجعة';
      case 'orange': return 'قريب الانتهاء';
      case 'green': return 'تم الختمة';
      default: return 'غير محدد';
    }
  };

  // Calculate days since last change
  const calculateDaysSinceLastChange = (lastChange: string) => {
    if (!lastChange) return 0;
    const now = new Date();
    const lastChangeDate = new Date(lastChange);
    const diffTime = Math.abs(now.getTime() - lastChangeDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
          المتون
        </h1>

        {/* Level Filter Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          'flex-wrap': 'wrap',
          'margin-bottom': '20px'
        }}>
          <button 
            onClick={() => handleLevelFilterChange('all')} 
            style={{ 
              padding: '12px 20px', 
              background: levelFilter() === 'all' 
                ? 'var(--color-primary)' 
                : 'var(--color-surface)', 
              color: levelFilter() === 'all' ? 'white' : 'var(--color-text)', 
              border: '1px solid var(--color-border)', 
              'border-radius': '8px', 
              cursor: 'pointer', 
              'font-size': '14px',
              'font-weight': '600'
            }}
          >
            جميع المستويات
          </button>
          <For each={allLevels}>
            {(level) => (
              <button 
                onClick={() => handleLevelFilterChange(level)} 
                style={{ 
                  padding: '12px 20px', 
                  background: levelFilter() === level 
                    ? 'var(--color-primary)' 
                    : 'var(--color-surface)', 
                  color: levelFilter() === level ? 'white' : 'var(--color-text)', 
                  border: '1px solid var(--color-border)', 
                  'border-radius': '8px', 
                  cursor: 'pointer', 
                  'font-size': '14px',
                  'font-weight': '600'
                }}
              >
                {level}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Sections */}
      <For each={Object.entries(groupedMutun())}>
        {([section, mutun]) => {
          const isCollapsed = collapsedSections()[section] || false;
          
          return (
            <div style={{ 'margin-bottom': '25px' }}>
              {/* Section Header */}
              <div 
                onClick={() => toggleSection(section)} 
                style={{ 
                  background: 'var(--color-surface)', 
                  'border-radius': '12px', 
                  padding: '15px 20px', 
                  border: '1px solid var(--color-border)', 
                  cursor: 'pointer',
                  'margin-bottom': isCollapsed ? '0' : '15px',
                  transition: 'all 0.3s ease',
                  'box-shadow': '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  'justify-content': 'space-between', 
                  'align-items': 'center' 
                }}>
                  <h2 style={{ 
                    color: 'var(--color-primary)', 
                    'font-size': '1.3rem', 
                    margin: '0', 
                    display: 'flex', 
                    'align-items': 'center', 
                    gap: '10px'
                  }}>
                    <span style={{ 'font-size': '1.5rem' }}>
                      {isCollapsed ? '📁' : '📂'}
                    </span>
                    {section}
                  </h2>
                  <span style={{ 
                    color: 'var(--color-primary)', 
                    'font-size': '1.5rem', 
                    transition: 'transform 0.3s ease', 
                    transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'
                  }}>
                    ▼
                  </span>
                </div>
              </div>
              
              {/* Section Content */}
              <Show when={!isCollapsed}>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <For each={mutun}>
                    {(matn) => {
                      initializeNoteText(matn);
                      
                      return (
                        <div style={{ 
                          background: 'var(--color-surface)', 
                          'border-radius': '12px', 
                          padding: '20px', 
                          border: `2px solid ${getMatnColor(matn.status)}`, 
                          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          {/* Header */}
                          <div style={{ 
                            display: 'flex', 
                            'justify-content': 'space-between', 
                            'align-items': 'center', 
                            'margin-bottom': '15px' 
                          }}>
                            <h3 style={{ 
                              color: 'var(--color-text)', 
                              'font-size': '1.1rem', 
                              margin: '0', 
                              flex: '1'
                            }}>
                              {matn.name}
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
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
                                  'min-width': '120px'
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
                          </div>

                          {/* Buttons */}
                          <div style={{ 
                            display: 'flex', 
                            gap: '10px', 
                            'flex-wrap': 'wrap',
                            'margin-bottom': '15px'
                          }}>
                            <Show when={matn.memorization_pdf_link}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(matn.memorization_pdf_link, '_blank');
                                }} 
                                style={{ 
                                  padding: '8px 12px', 
                                  background: 'var(--color-primary)', 
                                  color: 'white', 
                                  border: 'none', 
                                  'border-radius': '8px', 
                                  cursor: 'pointer', 
                                  'font-size': '12px'
                                }}
                              >
                                📄 نص التحفيظ
                              </button>
                            </Show>
                            
                            <Show when={matn.explanation_pdf_link}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(matn.explanation_pdf_link, '_blank');
                                }} 
                                style={{ 
                                  padding: '8px 12px', 
                                  background: 'var(--color-secondary)', 
                                  color: 'white', 
                                  border: 'none', 
                                  'border-radius': '8px', 
                                  cursor: 'pointer', 
                                  'font-size': '12px'
                                }}
                              >
                                📖 نص الشرح
                              </button>
                            </Show>
                            
                            <Show when={matn.memorization_audio_link}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  app.playAudio(matn.id, matn.name, matn.memorization_audio_link);
                                }} 
                                style={{ 
                                  padding: '8px 12px', 
                                  background: 'var(--color-success)', 
                                  color: 'white', 
                                  border: 'none', 
                                  'border-radius': '8px', 
                                  cursor: 'pointer', 
                                  'font-size': '12px'
                                }}
                              >
                                🎧 الصوتيات
                              </button>
                            </Show>
                          </div>
                          
                                                     {/* Days Counter */}
                           <div style={{ 
                             'text-align': 'center', 
                             padding: '8px',
                             background: 'var(--color-background)',
                             'border-radius': '8px',
                             border: '1px solid var(--color-border)',
                             'margin-bottom': '15px'
                           }}>
                             <span style={{ 
                               color: 'var(--color-text-secondary)', 
                               'font-size': '12px'
                             }}>
                               آخر تغيير قبل: {calculateDaysSinceLastChange(matn.lastChange_date || '')} يوم
                             </span>
                           </div>

                           {/* Note Field */}
                           <div>
                             <label style={{
                               display: 'block',
                               'margin-bottom': '5px',
                               'font-weight': '600',
                               color: 'var(--color-text)'
                             }}>
                               الملاحظات:
                             </label>
                             <div style={{ 
                               display: 'flex', 
                               gap: '8px', 
                               'align-items': 'center' 
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
                                 placeholder="أضف ملاحظاتك هنا..."
                                 style={{
                                   flex: '1',
                                   padding: '10px',
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
                                     padding: '10px 16px',
                                     background: 'var(--color-primary)',
                                     color: 'white',
                                     border: 'none',
                                     'border-radius': '8px',
                                     cursor: 'pointer',
                                     'font-size': '12px',
                                     'white-space': 'nowrap'
                                   }}
                                 >
                                   💾 حفظ
                                 </button>
                               </Show>
                             </div>
                             <Show when={focusedNoteId() === matn.id}>
                               <div style={{
                                 'margin-top': '5px',
                                 'font-size': '11px',
                                 color: 'var(--color-text-secondary)'
                               }}>
                                 💡 Enter zum Speichern oder Button klicken
                               </div>
                             </Show>
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
          <h3 style={{ 'margin-bottom': '10px' }}>لا توجد متون</h3>
          <p>لم يتم العثور على متون للمستوى المحدد</p>
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
                حفظ
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