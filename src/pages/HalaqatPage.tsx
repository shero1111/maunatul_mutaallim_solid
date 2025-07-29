import { createMemo, For, Show, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function HalaqatPage() {
  const app = useApp();
  
  // Track which halaqat have expanded student lists
  const [expandedHalaqat, setExpandedHalaqat] = createSignal<Record<string, boolean>>({});
  // Track search terms for each halaqa
  const [searchTerms, setSearchTerms] = createSignal<Record<string, string>>({});
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [editingHalaqa, setEditingHalaqa] = createSignal<any>(null);
  const [editName, setEditName] = createSignal('');
  const [editTeacher, setEditTeacher] = createSignal('');
  const [editType, setEditType] = createSignal('');
  const [editIsActive, setEditIsActive] = createSignal(true);
  
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
    const halaqa = userHalaqat().find(h => h.id === halaqaId);
    if (!halaqa) return;
    
    setEditingHalaqa(halaqa);
    setEditName(halaqa.name);
    setEditTeacher(halaqa.teacher_id);
    setEditType(halaqa.type);
    setEditIsActive(halaqa.isActive);
    setShowEditModal(true);
  };

  const handleSaveHalaqa = () => {
    const halaqa = editingHalaqa();
    if (!halaqa) return;
    
    // Update halaqa object
    const updatedHalaqa = {
      ...halaqa,
      name: editName().trim(),
      teacher_id: editTeacher(),
      type: editType(),
      isActive: editIsActive()
    };
    
    // Call app update function (placeholder for now)
    console.log('Updating halaqa:', updatedHalaqa);
    // app.updateHalaqa(updatedHalaqa);
    
    setShowEditModal(false);
    setEditingHalaqa(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingHalaqa(null);
    setEditName('');
    setEditTeacher('');
    setEditType('');
    setEditIsActive(true);
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
                      {getTypeIcon(halaqa.type)} #{halaqa.internal_number} {halaqa.name}
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
                
                {/* Teacher Info */}
                <div style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: '6px',
                  'font-size': '0.85rem',
                  'margin-bottom': '12px'
                }}>
                  <span>👨‍🏫</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {getTeacherName(halaqa.teacher_id)}
                  </span>
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

      {/* Edit Halaqa Modal */}
      <Show when={showEditModal()}>
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          'background-color': 'rgba(0, 0, 0, 0.5)',
          'z-index': '1000',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          padding: '20px'
        }} onClick={handleCancelEdit}>
          <div style={{
            'background-color': 'var(--color-background)',
            'border-radius': '16px',
            'max-width': '500px',
            width: '100%',
            padding: '0',
            'box-shadow': '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              'border-bottom': '1px solid var(--color-border)',
              display: 'flex',
              'justify-content': 'space-between',
              'align-items': 'center'
            }}>
              <h2 style={{
                margin: '0',
                'font-size': '1.2rem',
                'font-weight': 'bold',
                color: 'var(--color-text)'
              }}>
                ✏️ {app.language() === 'ar' ? 'تحرير الحلقة' : 'Edit Halaqa'}
              </h2>
              <button
                onClick={handleCancelEdit}
                style={{
                  background: 'transparent',
                  border: 'none',
                  'font-size': '20px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Halaqa Name */}
              <div style={{ 'margin-bottom': '20px' }}>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': '600',
                  color: 'var(--color-text)',
                  'font-size': '14px'
                }}>
                  📚 {app.language() === 'ar' ? 'اسم الحلقة' : 'Halaqa Name'}
                </label>
                <input
                  type="text"
                  value={editName()}
                  onInput={(e) => setEditName(e.currentTarget.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-surface)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box'
                  }}
                />
              </div>

              {/* Teacher Selection */}
              <div style={{ 'margin-bottom': '20px' }}>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': '600',
                  color: 'var(--color-text)',
                  'font-size': '14px'
                }}>
                  👨‍🏫 {app.language() === 'ar' ? 'المعلم' : 'Teacher'}
                </label>
                <select
                  value={editTeacher()}
                  onChange={(e) => setEditTeacher(e.currentTarget.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-surface)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">
                    {app.language() === 'ar' ? 'اختر المعلم' : 'Select Teacher'}
                  </option>
                  <For each={app.users().filter(u => u.role === 'lehrer')}>
                    {(teacher) => (
                      <option value={teacher.id}>
                        {teacher.name}
                      </option>
                    )}
                  </For>
                </select>
              </div>

              {/* Halaqa Type */}
              <div style={{ 'margin-bottom': '20px' }}>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': '600',
                  color: 'var(--color-text)',
                  'font-size': '14px'
                }}>
                  📖 {app.language() === 'ar' ? 'نوع الحلقة' : 'Halaqa Type'}
                </label>
                <select
                  value={editType()}
                  onChange={(e) => setEditType(e.currentTarget.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-surface)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="memorizing">{app.language() === 'ar' ? 'تحفيظ' : 'Memorizing'}</option>
                  <option value="explanation">{app.language() === 'ar' ? 'شرح' : 'Explanation'}</option>
                  <option value="memorizing_intensive">{app.language() === 'ar' ? 'تحفيظ مكثف' : 'Intensive Memorizing'}</option>
                  <option value="explanation_intensive">{app.language() === 'ar' ? 'شرح مكثف' : 'Intensive Explanation'}</option>
                </select>
              </div>

              {/* Active Status */}
              <div style={{ 'margin-bottom': '24px' }}>
                <label style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={editIsActive()}
                    onChange={(e) => setEditIsActive(e.currentTarget.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{
                    'font-weight': '600',
                    color: 'var(--color-text)',
                    'font-size': '14px'
                  }}>
                    {editIsActive() ? '🟢' : '🔴'} {app.language() === 'ar' ? 'حلقة نشطة' : 'Active Halaqa'}
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                'justify-content': 'flex-end'
              }}>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'font-weight': '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {app.language() === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveHalaqa}
                  disabled={!editName().trim() || !editTeacher()}
                  style={{
                    padding: '12px 24px',
                    'background-color': (!editName().trim() || !editTeacher()) 
                      ? 'var(--color-text-secondary)' 
                      : 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'font-weight': '500',
                    cursor: (!editName().trim() || !editTeacher()) ? 'not-allowed' : 'pointer',
                    opacity: (!editName().trim() || !editTeacher()) ? '0.5' : '1',
                    transition: 'all 0.2s ease'
                  }}
                >
                  💾 {app.language() === 'ar' ? 'حفظ' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}