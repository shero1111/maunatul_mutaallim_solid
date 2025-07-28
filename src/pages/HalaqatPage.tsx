import { createMemo, For, Show, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function HalaqatPage() {
  const app = useApp();
  
  // Track which halaqat have expanded student lists
  const [expandedHalaqat, setExpandedHalaqat] = createSignal<Record<string, boolean>>({});
  // Track search terms for each halaqa
  const [searchTerms, setSearchTerms] = createSignal<Record<string, string>>({});
  
  const toggleStudentList = (halaqaId: string) => {
    setExpandedHalaqat(prev => ({
      ...prev,
      [halaqaId]: !prev[halaqaId]
    }));
  };
  
  const userHalaqat = createMemo(() => {
    const currentUser = app.currentUser();
    const allHalaqat = app.halaqat();
    
    if (!currentUser) return [];
    
    switch (currentUser.role) {
      case 'student':
        // Students see halaqat they're enrolled in
        return allHalaqat.filter(h => h.student_ids.includes(currentUser.id));
      case 'lehrer':
        // Teachers see halaqat they teach
        return allHalaqat.filter(h => h.teacher_id === currentUser.id);
      default:
        // Admins see all halaqat
        return allHalaqat;
    }
  });
  
  const containerStyle = {
    padding: '24px 20px 80px 20px',
    background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%)',
    'min-height': '100vh',
    position: 'relative' as const
  };
  
  // Subtle background decoration
  const backgroundDecorationStyle = {
    position: 'absolute' as const,
    top: '0',
    right: '0',
    width: '100%',
    height: '300px',
    background: 'radial-gradient(ellipse at top right, var(--color-primary)08 0%, transparent 50%)',
    'pointer-events': 'none' as const,
    'z-index': '0'
  };
  
  const contentStyle = {
    position: 'relative' as const,
    'z-index': '1'
  };
  
  const headerStyle = {
    'margin-bottom': '32px',
    'text-align': 'center' as const
  };
  
  const titleStyle = {
    'font-size': '2rem',
    'font-weight': '700',
    color: 'var(--color-text)',
    'margin-bottom': '8px',
    'letter-spacing': '0.5px',
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const subtitleStyle = {
    'font-size': '1rem',
    color: 'var(--color-text-secondary)',
    'font-weight': '500',
    'letter-spacing': '0.2px'
  };
  
  const halaqaCardStyle = {
    background: 'var(--color-surface)',
    'border-radius': '12px',
    padding: '16px',
    'margin-bottom': '12px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid var(--color-border)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };
  
  const halaqaCardHoverStyle = `
    .halaqa-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border-color: var(--color-primary)40;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  
  const halaqaHeaderStyle = {
    display: 'flex',
    'justify-content': 'space-between',
    'align-items': 'flex-start',
    'margin-bottom': '16px'
  };
  
  const halaqaNameStyle = {
    'font-size': '1.4rem',
    'font-weight': '700',
    color: 'var(--color-text)',
    'margin-bottom': '6px',
    'letter-spacing': '0.3px',
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const halaqaTypeStyle = {
    'font-size': '0.9rem',
    color: 'var(--color-primary)',
    'font-weight': '600',
    'margin-bottom': '12px',
    'letter-spacing': '0.1px'
  };
  
  const statusBadgeStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    'border-radius': '20px',
    'font-size': '0.8rem',
    'font-weight': '600',
    'letter-spacing': '0.2px',
    background: isActive 
      ? 'linear-gradient(135deg, var(--color-success), #16a34a)' 
      : 'linear-gradient(135deg, var(--color-error), #dc2626)',
    color: 'white',
    'box-shadow': isActive 
      ? '0 4px 12px var(--color-success)30' 
      : '0 4px 12px var(--color-error)30',
    border: 'none'
  });
  
  const infoSectionStyle = {
    'margin-bottom': '20px'
  };
  
  const infoRowStyle = {
    display: 'flex',
    'justify-content': 'space-between',
    'align-items': 'center',
    'margin-bottom': '12px',
    padding: '12px 16px',
    background: 'var(--color-surface)50',
    'border-radius': '12px',
    border: '1px solid var(--color-border)50'
  };
  
  const labelStyle = {
    color: 'var(--color-text-secondary)',
    'font-weight': '600',
    'font-size': '0.9rem',
    'letter-spacing': '0.1px'
  };
  
  const valueStyle = {
    color: 'var(--color-text)',
    'font-weight': '600',
    'font-size': '0.95rem'
  };
  
  const studentSectionStyle = {
    'margin-top': '20px',
    padding: '20px',
    background: 'var(--color-primary)05',
    'border-radius': '16px',
    border: '1px solid var(--color-primary)15'
  };
  
  const studentSectionHeaderStyle = {
    color: 'var(--color-text)',
    'font-weight': '600',
    'margin-bottom': '16px',
    'font-size': '1rem',
    'letter-spacing': '0.2px',
    display: 'flex',
    'align-items': 'center',
    gap: '8px'
  };
  
  const studentChipStyle = {
    display: 'inline-flex',
    'align-items': 'center',
    padding: '8px 14px',
    'margin-right': '8px',
    'margin-bottom': '8px',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: 'white',
    'border-radius': '20px',
    'font-size': '0.85rem',
    'font-weight': '600',
    'letter-spacing': '0.1px',
    'box-shadow': '0 4px 12px var(--color-primary)25',
    transition: 'all 0.2s ease'
  };
  
  const emptyStateStyle = {
    'text-align': 'center' as const,
    padding: '60px 20px',
    color: 'var(--color-text-secondary)'
  };
  
  const emptyIconStyle = {
    'font-size': '4rem',
    'margin-bottom': '20px',
    opacity: '0.6'
  };
  
  const emptyTextStyle = {
    'font-size': '1.1rem',
    'font-weight': '500',
    'letter-spacing': '0.2px'
  };
  
  const getTeacherName = (teacherId: string): string => {
    const teacher = app.users().find(u => u.id === teacherId);
    return teacher?.name || 'Unknown';
  };
  
  const getStudentNames = (studentIds: string[]): string[] => {
    return studentIds.map(id => {
      const student = app.users().find(u => u.id === id);
      return student?.name || 'Unknown';
    });
  };

  const getFilteredStudentNames = (studentIds: string[], halaqaId: string): string[] => {
    const searchTerm = searchTerms()[halaqaId]?.toLowerCase() || '';
    const students = getStudentNames(studentIds);
    
    if (!searchTerm) return students;
    
    return students.filter(name => 
      name.toLowerCase().includes(searchTerm)
    );
  };

  const handleEditHalaqa = (halaqaId: string) => {
    // Placeholder for edit functionality
    alert(`Edit Halaqa ${halaqaId} - Functionality to be implemented`);
  };

  const canEditHalaqat = () => {
    const currentUser = app.currentUser();
    return currentUser?.role === 'superuser' || currentUser?.role === 'leitung';
  };
  
  const getHalaqaTypeTranslation = (type: string): string => {
    switch (type) {
      case 'memorizing': return app.translate('memorizing');
      case 'explanation': return app.translate('explanation');
      case 'memorizing_intensive': return app.translate('memorizingIntensive');
      case 'explanation_intensive': return app.translate('explanationIntensive');
      default: return type;
    }
  };
  
  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'memorizing': return '📚';
      case 'explanation': return '💡';
      case 'memorizing_intensive': return '🔥';
      case 'explanation_intensive': return '⚡';
      default: return '📖';
    }
  };
  
  return (
    <>
      <style>{halaqaCardHoverStyle}</style>
      <div style={containerStyle}>
        <div style={backgroundDecorationStyle} />
        
        <div style={contentStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>
              {app.translate('halaqat')}
            </h1>
            <p style={subtitleStyle}>
              {userHalaqat().length > 0 
                ? `${userHalaqat().length} ${userHalaqat().length === 1 ? 'حلقة' : 'حلقات'} متاحة`
                : 'استكشف الحلقات المتاحة'
              }
            </p>
          </div>
          
          <For each={userHalaqat()}>
            {(halaqa) => (
              <div class="halaqa-card" style={halaqaCardStyle}>                
                {/* Compact Header */}
                <div style={{
                  display: 'flex',
                  'justify-content': 'space-between',
                  'align-items': 'flex-start',
                  'margin-bottom': '12px'
                }}>
                  <div style={{ flex: '1' }}>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      'font-size': '1.1rem',
                      'font-weight': 'bold',
                      color: 'var(--color-text)',
                      'line-height': '1.3'
                    }}>
                      {getTypeIcon(halaqa.type)} {halaqa.name}
                    </h3>
                    <div style={{
                      'font-size': '0.85rem',
                      color: 'var(--color-text-secondary)',
                      'margin-bottom': '8px'
                    }}>
                      {getHalaqaTypeTranslation(halaqa.type)}
                    </div>
                  </div>
                  
                  {/* Top Right Controls */}
                  <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                    {/* Active Indicator */}
                    <div style={{
                      width: '8px',
                      height: '8px',
                      'border-radius': '50%',
                      'background-color': halaqa.isActive ? '#10b981' : '#6b7280',
                      'box-shadow': halaqa.isActive ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none',
                      transition: 'all 0.2s ease'
                    }} title={halaqa.isActive ? 'نشط' : 'غير نشط'} />
                    
                    {/* Edit Button */}
                    <Show when={canEditHalaqat()}>
                      <button
                        onClick={() => handleEditHalaqa(halaqa.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          'font-size': '14px',
                          color: 'var(--color-text-secondary)',
                          transition: 'all 0.2s ease',
                          'border-radius': '4px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-primary)10';
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }}
                        title="تحرير الحلقة"
                      >
                        ✏️
                      </button>
                    </Show>
                  </div>
                </div>
                
                {/* Compact Info Grid */}
                <div style={{
                  display: 'grid',
                  'grid-template-columns': '1fr 1fr',
                  gap: '8px',
                  'margin-bottom': '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    'align-items': 'center',
                    gap: '6px',
                    'font-size': '0.85rem'
                  }}>
                    <span>👨‍🏫</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {getTeacherName(halaqa.teacher_id)}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    'align-items': 'center',
                    gap: '6px',
                    'font-size': '0.85rem'
                  }}>
                    <span>🔢</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      #{halaqa.internal_number}
                    </span>
                  </div>
                </div>
                
                {/* Students Dropdown */}
                <div style={{
                  border: '1px solid var(--color-border)',
                  'border-radius': '8px',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => toggleStudentList(halaqa.id)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--color-surface)',
                      border: 'none',
                      display: 'flex',
                      'justify-content': 'space-between',
                      'align-items': 'center',
                      cursor: 'pointer',
                      'font-size': '0.9rem',
                      color: 'var(--color-text)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--color-surface)';
                    }}
                  >
                    <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                      <span>👥</span>
                      <span>Show Students ({halaqa.student_ids.length})</span>
                    </div>
                    <span style={{
                      transform: expandedHalaqat()[halaqa.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      ▼
                    </span>
                  </button>
                  </div>
                
                {/* Expandable Student List */}
                <Show when={halaqa.student_ids.length > 0 && expandedHalaqat()[halaqa.id]}>
                  <div style={{
                    'border-top': '1px solid var(--color-border)',
                    background: 'var(--color-background)',
                    'animation': 'slideDown 0.3s ease'
                  }}>
                    {/* Search Header */}
                    <div style={{
                      padding: '12px',
                      'border-bottom': '1px solid var(--color-border)'
                    }}>
                      <input
                        type="text"
                        placeholder={app.language() === 'ar' ? 'البحث في الطلاب...' : 'Search students...'}
                        value={searchTerms()[halaqa.id] || ''}
                        onInput={(e) => {
                          setSearchTerms(prev => ({
                            ...prev,
                            [halaqa.id]: e.currentTarget.value
                          }));
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid var(--color-border)',
                          'border-radius': '6px',
                          'font-size': '0.85rem',
                          'background-color': 'var(--color-surface)',
                          color: 'var(--color-text)',
                          'box-sizing': 'border-box'
                        }}
                      />
                    </div>
                    
                    {/* Student List - Row by Row */}
                    <div style={{
                      'max-height': '200px',
                      'overflow-y': 'auto',
                      padding: '8px 0'
                    }}>
                      <For each={getFilteredStudentNames(halaqa.student_ids, halaqa.id)}>
                        {(studentName, index) => (
                          <div style={{
                            display: 'flex',
                            'align-items': 'center',
                            padding: '8px 12px',
                            'border-bottom': index() === getFilteredStudentNames(halaqa.student_ids, halaqa.id).length - 1 
                              ? 'none' 
                              : '1px solid var(--color-border)',
                            'font-size': '0.85rem',
                            transition: 'all 0.2s ease',
                            cursor: 'default'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}>
                            <span style={{ 
                              'margin-right': '12px', 
                              color: 'var(--color-text-secondary)',
                              'font-weight': '500',
                              'min-width': '20px'
                            }}>
                              {index() + 1}.
                            </span>
                            <span style={{ 
                              color: 'var(--color-text)',
                              'font-weight': '500'
                            }}>
                              {studentName}
                            </span>
                          </div>
                        )}
                      </For>
                      
                      {/* No results message */}
                      <Show when={getFilteredStudentNames(halaqa.student_ids, halaqa.id).length === 0 && searchTerms()[halaqa.id]}>
                        <div style={{
                          padding: '16px 12px',
                          'text-align': 'center',
                          color: 'var(--color-text-secondary)',
                          'font-size': '0.85rem'
                        }}>
                          {app.language() === 'ar' 
                            ? `لا توجد نتائج للبحث "${searchTerms()[halaqa.id]}"`
                            : `No results for "${searchTerms()[halaqa.id]}"`
                          }
                        </div>
                      </Show>
                      
                      {/* Empty state when no students */}
                      <Show when={halaqa.student_ids.length === 0}>
                        <div style={{
                          padding: '16px 12px',
                          'text-align': 'center',
                          color: 'var(--color-text-secondary)',
                          'font-size': '0.85rem'
                        }}>
                          {app.translate('noStudentsAssigned')}
                        </div>
                      </Show>
                    </div>
                  </div>
                </Show>
              </div>
            )}
          </For>
          
          <Show when={userHalaqat().length === 0}>
            <div style={emptyStateStyle}>
              <div style={emptyIconStyle}>🎓</div>
              <div style={emptyTextStyle}>{app.translate('noHalaqatAvailable')}</div>
            </div>
          </Show>
        </div>
      </div>
    </>
  );
}