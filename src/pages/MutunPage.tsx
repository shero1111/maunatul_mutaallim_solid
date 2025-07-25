import { createSignal, createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';
import { Matn } from '../types';
import { getStatusColor } from '../styles/themes';

export function MutunPage() {
  const app = useApp();
  const [levelFilter, setLevelFilter] = createSignal<string>('all');
  
  // Initialisiere alle Sections als aufgeklappt (false = aufgeklappt)
  const [collapsedSections, setCollapsedSections] = createSignal<Record<string, boolean>>({
    'المستوى الأول': false,
    'المستوى الثاني': false,
    'المستوى الثالث': false,
    'المستوى الرابع': false
  });

  // Lokaler State für Notizen (für Live-Editing)
  const [noteTexts, setNoteTexts] = createSignal<Record<string, string>>({});

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

  // Initialize note texts from existing descriptions
  const initializeNoteText = (matn: Matn) => {
    if (!noteTexts()[matn.id]) {
      setNoteTexts(prev => ({
        ...prev,
        [matn.id]: matn.description || ''
      }));
    }
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const shouldExpandSection = (section: string) => {
    return !collapsedSections()[section]; // undefined oder false = aufgeklappt (true), true = zugeklappt (false)
  };

  const handleLevelFilterChange = (newFilter: string) => {
    setLevelFilter(newFilter);
    
    if (newFilter === 'all') {
      // Alle Sections aufklappen
      const newCollapsed: Record<string, boolean> = {};
      allLevels.forEach(level => {
        newCollapsed[level] = false; // false = aufgeklappt
      });
      setCollapsedSections(newCollapsed);
    } else {
      // Alle Sections zuklappen, außer dem ausgewählten Level
      const newCollapsed: Record<string, boolean> = {};
      allLevels.forEach(level => {
        newCollapsed[level] = level !== newFilter; // true = zugeklappt, false = aufgeklappt
      });
      setCollapsedSections(newCollapsed);
    }
  };

  const changeMatnStatus = (matnId: string) => {
    const matn = app.mutun().find(m => m.id === matnId);
    if (!matn) return;

    const statusCycle = ['red', 'orange', 'green'] as const;
    const currentIndex = statusCycle.indexOf(matn.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    const updatedMatn = {
      ...matn,
      status: nextStatus,
      lastChange_date: new Date().toISOString()
    };

    app.updateMatn(updatedMatn);
  };

  const calculateDaysSinceLastGreen = (lastChange: string) => {
    const now = new Date();
    const lastChangeDate = new Date(lastChange);
    const diffTime = Math.abs(now.getTime() - lastChangeDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getMatnStatusText = (status: string) => {
    switch (status) {
      case 'red': return 'يحتاج مراجعة';
      case 'orange': return 'قريب الانتهاء';
      case 'green': return 'تم الختمة';
      default: return 'غير محدد';
    }
  };

  const getMatnColor = (status: string) => {
    switch (status) {
      case 'red': return 'var(--color-error)';
      case 'orange': return 'var(--color-warning)';
      case 'green': return 'var(--color-success)';
      default: return 'var(--color-border)';
    }
  };

  // Mobile Text Input Component
  function MobileTextInput(props: {
    value: string;
    onInput: (value: string) => void;
    placeholder: string;
    matn: Matn;
  }) {
    const inputStyle = {
      width: '100%',
      padding: '12px 16px',
      'font-size': '16px',
      border: 'none',
      'border-radius': '12px',
      'background': 'linear-gradient(135deg, var(--color-background), var(--color-surface))',
      color: 'var(--color-text)',
      outline: 'none',
      'box-sizing': 'border-box' as const,
      resize: 'none' as const,
      'min-height': '48px',
      '-webkit-appearance': 'none',
      '-webkit-tap-highlight-color': 'transparent',
      'box-shadow': 'inset 0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease',
      'font-family': 'inherit'
    };

    const saveNote = (value: string) => {
      const updatedMatn = {
        ...props.matn,
        description: value
      };
      app.updateMatn(updatedMatn);
      setNoteTexts(prev => ({
        ...prev,
        [props.matn.id]: value
      }));
    };

    return (
      <div>
        <textarea
          value={props.value}
          onInput={(e) => {
            const value = e.currentTarget.value;
            props.onInput(value);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              saveNote(e.currentTarget.value);
            }
          }}
          placeholder={props.placeholder}
          style={inputStyle}
          rows={2}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.1), 0 0 0 3px var(--color-primary)20';
            e.currentTarget.style.background = 'var(--color-background)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.06)';
            e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-background), var(--color-surface))';
            
            // Auto-Save on blur
            saveNote(e.currentTarget.value);
          }}
        />
        <div style={{
          'margin-top': '8px',
          'text-align': 'right',
          'font-size': '12px',
          color: 'var(--color-text-secondary)'
        }}>
          💡 Enter zum Speichern • Auto-Save beim Verlassen
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px 20px 100px 20px',
      background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%)',
      'min-height': '100vh'
    }}>
      {/* Premium Header */}
      <div style={{ 'margin-bottom': '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          'border-radius': '24px',
          padding: '24px',
          'box-shadow': '0 8px 32px rgba(0,0,0,0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            'border-radius': '50%'
          }}></div>
          
          <h1 style={{ 
            color: 'white', 
            'font-size': '2rem', 
            'margin-bottom': '8px', 
            display: 'flex', 
            'align-items': 'center', 
            gap: '12px',
            'font-weight': '700',
            'text-shadow': '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <span style={{ 'font-size': '2.2rem' }}>📚</span>
            المتون
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            'font-size': '1.1rem',
            margin: '0',
            'font-weight': '500'
          }}>
            مجموعتك الشخصية من المتون والنصوص
          </p>
        </div>

        {/* Premium Level Filter */}
        <div style={{ 'margin-top': '24px' }}>
          <h3 style={{ 
            color: 'var(--color-text)', 
            'font-size': '1.1rem', 
            'margin-bottom': '16px',
            'font-weight': '600'
          }}>
            المستويات:
          </h3>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            'flex-wrap': 'wrap'
          }}>
            <button 
              onClick={() => handleLevelFilterChange('all')} 
              style={{ 
                padding: '12px 20px', 
                background: levelFilter() === 'all' 
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' 
                  : 'var(--color-surface)', 
                color: levelFilter() === 'all' ? 'white' : 'var(--color-text)', 
                border: levelFilter() === 'all' ? 'none' : '2px solid var(--color-border)', 
                'border-radius': '16px', 
                cursor: 'pointer', 
                'font-size': '14px',
                'font-weight': '600',
                'box-shadow': levelFilter() === 'all' 
                  ? '0 4px 16px rgba(0,0,0,0.15)' 
                  : '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                'min-width': '140px'
              }}
              onMouseOver={(e) => {
                if (levelFilter() !== 'all') {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (levelFilter() !== 'all') {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }
              }}
            >
              ✨ جميع المستويات
            </button>
            <For each={allLevels}>
              {(level) => (
                <button 
                  onClick={() => handleLevelFilterChange(level)} 
                  style={{ 
                    padding: '12px 20px', 
                    background: levelFilter() === level 
                      ? 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))' 
                      : 'var(--color-surface)', 
                    color: levelFilter() === level ? 'white' : 'var(--color-text)', 
                    border: levelFilter() === level ? 'none' : '2px solid var(--color-border)', 
                    'border-radius': '16px', 
                    cursor: 'pointer', 
                    'font-size': '14px',
                    'font-weight': '600',
                    'box-shadow': levelFilter() === level 
                      ? '0 4px 16px rgba(0,0,0,0.15)' 
                      : '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    if (levelFilter() !== level) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (levelFilter() !== level) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }
                  }}
                >
                  {level}
                </button>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Premium Collapsible Sections */}
      <For each={Object.entries(groupedMutun())}>
        {([section, mutun]) => {
          const isCollapsed = !shouldExpandSection(section);
          
          return (
            <div style={{ 'margin-bottom': '32px' }}>
              {/* Premium Section Header */}
              <div 
                onClick={() => toggleSection(section)} 
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-surface), var(--color-background))', 
                  'border-radius': '20px', 
                  padding: '20px 24px', 
                  border: '2px solid var(--color-border)', 
                  cursor: 'pointer',
                  'margin-bottom': isCollapsed ? '0' : '20px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  'box-shadow': '0 4px 20px rgba(0,0,0,0.08)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                }}
              >
                {/* Subtle gradient overlay */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  background: isCollapsed 
                    ? 'linear-gradient(45deg, transparent 0%, rgba(37, 99, 235, 0.03) 100%)'
                    : 'linear-gradient(45deg, transparent 0%, rgba(16, 185, 129, 0.03) 100%)',
                  'pointer-events': 'none'
                }}></div>
                
                <div style={{ 
                  display: 'flex', 
                  'justify-content': 'space-between', 
                  'align-items': 'center',
                  position: 'relative',
                  'z-index': '1'
                }}>
                  <h2 style={{ 
                    color: 'var(--color-primary)', 
                    'font-size': '1.4rem', 
                    margin: '0', 
                    display: 'flex', 
                    'align-items': 'center', 
                    gap: '12px',
                    'font-weight': '700'
                  }}>
                    <span style={{ 
                      'font-size': '1.8rem',
                      transition: 'transform 0.3s ease'
                    }}>
                      {isCollapsed ? '📁' : '📂'}
                    </span>
                    {section}
                    <span style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                      padding: '4px 12px',
                      'border-radius': '12px',
                      'font-size': '0.8rem',
                      'font-weight': '600'
                    }}>
                      {mutun.length}
                    </span>
                  </h2>
                  <span style={{ 
                    color: 'var(--color-primary)', 
                    'font-size': '1.5rem', 
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                    transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'
                  }}>
                    ▼
                  </span>
                </div>
              </div>
              
              {/* Premium Section Content */}
              <Show when={!isCollapsed}>
                <div style={{ 
                  display: 'grid', 
                  gap: '16px',
                  animation: 'fadeInUp 0.5s ease-out'
                }}>
                  <For each={mutun}>
                    {(matn) => {
                      // Initialize note text
                      initializeNoteText(matn);
                      
                      return (
                        <div style={{ 
                          background: 'linear-gradient(135deg, var(--color-surface), var(--color-background))', 
                          'border-radius': '20px', 
                          padding: '24px', 
                          border: `3px solid ${getMatnColor(matn.status)}20`, 
                          'box-shadow': '0 8px 32px rgba(0,0,0,0.08)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                        }}
                        >
                          {/* Status indicator stripe */}
                          <div style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '5px',
                            height: '100%',
                            background: `linear-gradient(180deg, ${getMatnColor(matn.status)}, ${getMatnColor(matn.status)}80)`
                          }}></div>

                          {/* Header with Premium Status Badge */}
                          <div style={{ 
                            display: 'flex', 
                            'justify-content': 'space-between', 
                            'align-items': 'center', 
                            'margin-bottom': '20px' 
                          }}>
                            <h3 style={{ 
                              color: 'var(--color-text)', 
                              'font-size': '1.2rem', 
                              margin: '0', 
                              flex: '1', 
                              'font-weight': '700'
                            }}>
                              {matn.name}
                            </h3>
                            <button 
                              onClick={() => changeMatnStatus(matn.id)} 
                              style={{ 
                                background: `linear-gradient(135deg, ${getMatnColor(matn.status)}, ${getMatnColor(matn.status)}CC)`, 
                                color: 'white', 
                                padding: '10px 16px', 
                                'border-radius': '16px', 
                                'font-size': '0.8rem', 
                                'font-weight': '700',
                                border: 'none',
                                cursor: 'pointer',
                                'min-width': '140px',
                                'text-align': 'center',
                                transition: 'all 0.3s ease',
                                'box-shadow': '0 4px 16px rgba(0,0,0,0.15)'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                              }}
                            >
                              {getMatnStatusText(matn.status)}
                            </button>
                          </div>
                          
                          {/* Premium Note Field */}
                          <div style={{ 'margin-bottom': '20px' }}>
                            <label style={{
                              display: 'block',
                              'margin-bottom': '8px',
                              'font-weight': '600',
                              color: 'var(--color-text)',
                              'font-size': '0.9rem'
                            }}>
                              📝 الملاحظات:
                            </label>
                            <MobileTextInput
                              value={noteTexts()[matn.id] || ''}
                              onInput={(value) => {
                                setNoteTexts(prev => ({
                                  ...prev,
                                  [matn.id]: value
                                }));
                              }}
                              placeholder="اكتب ملاحظاتك هنا..."
                              matn={matn}
                            />
                          </div>
                          
                          {/* Premium Action Buttons */}
                          <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            'flex-wrap': 'wrap',
                            'margin-bottom': '16px'
                          }}>
                            <Show when={matn.memorization_pdf_link}>
                              <button 
                                onClick={() => window.open(matn.memorization_pdf_link, '_blank')} 
                                style={{ 
                                  padding: '10px 16px', 
                                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', 
                                  color: 'white', 
                                  border: 'none', 
                                  'border-radius': '12px', 
                                  cursor: 'pointer', 
                                  'font-size': '13px',
                                  'font-weight': '600',
                                  'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                }}
                              >
                                📄 نص التحفيظ
                              </button>
                            </Show>
                            
                            <Show when={matn.explanation_pdf_link}>
                              <button 
                                onClick={() => window.open(matn.explanation_pdf_link, '_blank')} 
                                style={{ 
                                  padding: '10px 16px', 
                                  background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))', 
                                  color: 'white', 
                                  border: 'none', 
                                  'border-radius': '12px', 
                                  cursor: 'pointer', 
                                  'font-size': '13px',
                                  'font-weight': '600',
                                  'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                }}
                              >
                                📖 نص الشرح
                              </button>
                            </Show>
                            
                            <Show when={matn.memorization_audio_link}>
                              <button 
                                onClick={() => {
                                  app.playAudio(matn.id, matn.name, matn.memorization_audio_link);
                                }} 
                                style={{ 
                                  padding: '10px 16px', 
                                  background: 'linear-gradient(135deg, var(--color-success), #059669)', 
                                  color: 'white', 
                                  border: 'none', 
                                  'border-radius': '12px', 
                                  cursor: 'pointer', 
                                  'font-size': '13px',
                                  'font-weight': '600',
                                  'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                }}
                              >
                                🎧 الصوتيات
                              </button>
                            </Show>
                          </div>
                          
                          {/* Premium Days Counter */}
                          <div style={{ 
                            'text-align': 'center', 
                            padding: '12px',
                            background: 'linear-gradient(135deg, var(--color-background), var(--color-surface))',
                            'border-radius': '12px',
                            border: '1px solid var(--color-border)'
                          }}>
                            <span style={{ 
                              color: 'var(--color-text-secondary)', 
                              'font-size': '0.85rem',
                              'font-weight': '500'
                            }}>
                              ⏰ آخر ختمة قبل: {matn.lastChange_date ? calculateDaysSinceLastGreen(matn.lastChange_date) : 0} يوم
                            </span>
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

      {/* Premium Empty State */}
      <Show when={filteredMutun().length === 0}>
        <div style={{ 
          'text-align': 'center', 
          padding: '60px 20px', 
          color: 'var(--color-text-secondary)',
          background: 'linear-gradient(135deg, var(--color-surface), var(--color-background))',
          'border-radius': '24px',
          'box-shadow': '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            'font-size': '4rem', 
            'margin-bottom': '16px',
            opacity: '0.7'
          }}>📚</div>
          <h3 style={{
            'font-size': '1.3rem',
            'font-weight': '600',
            'margin-bottom': '8px',
            color: 'var(--color-text)'
          }}>
            لا توجد متون
          </h3>
          <p style={{
            'font-size': '1rem',
            opacity: '0.8'
          }}>
            لا توجد متون تطابق المرشح المحدد
          </p>
        </div>
      </Show>
    </div>
  );
}