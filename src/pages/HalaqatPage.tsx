import { createMemo, For, Show, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';

export function HalaqatPage() {
  const app = useApp();
  
  // Track which halaqat have expanded student lists
  const [expandedHalaqat, setExpandedHalaqat] = createSignal<Record<string, boolean>>({});
  
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
    background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%)',
    'border-radius': '16px',
    padding: '20px',
    'margin-bottom': '16px',
    'box-shadow': '0 4px 20px rgba(0, 0, 0, 0.08)',
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
                {/* Subtle card decoration */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle, var(--color-primary)08 0%, transparent 70%)`,
                  'pointer-events': 'none'
                }} />
                
                <div style={halaqaHeaderStyle}>
                  <div style={{ flex: '1' }}>
                    <h3 style={halaqaNameStyle}>
                      {getTypeIcon(halaqa.type)} {halaqa.name}
                    </h3>
                    <div style={halaqaTypeStyle}>
                      {getHalaqaTypeTranslation(halaqa.type)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                    {/* Edit Button - only for leaders and admins */}
                    <Show when={app.currentUser()?.role === 'leitung' || app.currentUser()?.role === 'superuser'}>
                      <button
                        style={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          'border-radius': '8px',
                          padding: '8px',
                          cursor: 'pointer',
                          'font-size': '16px',
                          color: 'var(--color-text-secondary)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-primary)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--color-surface)';
                          e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }}
                        title="تحرير الحلقة"
                      >
                        ✏️
                      </button>
                    </Show>
                    <div style={statusBadgeStyle(halaqa.isActive)}>
                      {halaqa.isActive ? app.translate('active') : app.translate('inactive')}
                    </div>
                  </div>
                </div>
                
                <div style={infoSectionStyle}>
                  <div style={infoRowStyle}>
                    <span style={labelStyle}>👨‍🏫 {app.translate('teacher')}</span>
                    <span style={valueStyle}>{getTeacherName(halaqa.teacher_id)}</span>
                  </div>
                  
                  <div style={infoRowStyle}>
                    <span style={labelStyle}>🔢 Internal Number</span>
                    <span style={valueStyle}>#{halaqa.internal_number}</span>
                  </div>
                  
                  {/* Students Section with Dropdown */}
                  <div style={infoRowStyle}>
                    <span style={labelStyle}>👥 {app.translate('students')}</span>
                    <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                      <span style={valueStyle}>
                        {halaqa.student_ids.length} {halaqa.student_ids.length === 1 ? 'طالب' : 'طلاب'}
                      </span>
                      <Show when={halaqa.student_ids.length > 0}>
                        <button
                          onClick={() => toggleStudentList(halaqa.id)}
                          style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            'border-radius': '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            'font-size': '12px',
                            'font-weight': '600',
                            transition: 'all 0.2s ease',
                            transform: expandedHalaqat()[halaqa.id] ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                          title={expandedHalaqat()[halaqa.id] ? 'إخفاء القائمة' : 'عرض القائمة'}
                        >
                          ▼
                        </button>
                      </Show>
                    </div>
                  </div>
                </div>
                
                {/* Expandable Student List */}
                <Show when={halaqa.student_ids.length > 0 && expandedHalaqat()[halaqa.id]}>
                  <div style={{
                    'margin-top': '16px',
                    padding: '16px',
                    background: 'var(--color-primary)05',
                    'border-radius': '12px',
                    border: '1px solid var(--color-primary)15',
                    'animation': 'slideDown 0.3s ease'
                  }}>
                    <div style={{
                      color: 'var(--color-text)',
                      'font-weight': '600',
                      'margin-bottom': '12px',
                      'font-size': '0.9rem',
                      'letter-spacing': '0.1px',
                      display: 'flex',
                      'align-items': 'center',
                      gap: '6px'
                    }}>
                      <span>👥</span>
                      <span>قائمة الطلاب</span>
                    </div>
                    <div style={{ display: 'flex', 'flex-wrap': 'wrap', gap: '8px' }}>
                      <For each={getStudentNames(halaqa.student_ids)}>
                        {(studentName) => (
                          <span style={{
                            display: 'inline-flex',
                            'align-items': 'center',
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            color: 'white',
                            'border-radius': '16px',
                            'font-size': '0.8rem',
                            'font-weight': '600',
                            'letter-spacing': '0.1px',
                            'box-shadow': '0 2px 8px var(--color-primary)25',
                            transition: 'all 0.2s ease'
                          }}>
                            {studentName}
                          </span>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
                
                <Show when={halaqa.student_ids.length === 0}>
                  <div style={{
                    'text-align': 'center',
                    padding: '24px',
                    color: 'var(--color-text-secondary)',
                    'font-style': 'italic',
                    background: 'var(--color-border)20',
                    'border-radius': '12px',
                    'font-size': '0.9rem'
                  }}>
                    🚫 {app.translate('noStudentsAssigned')}
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