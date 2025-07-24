import { createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';

export function HalaqatPage() {
  const app = useApp();
  
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
  
  const halaqaCardStyle = {
    'background-color': 'var(--color-background)',
    'border-radius': '12px',
    padding: '16px',
    'margin-bottom': '16px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--color-border)'
  };
  
  const halaqaHeaderStyle = {
    display: 'flex',
    'justify-content': 'space-between',
    'align-items': 'flex-start',
    'margin-bottom': '12px'
  };
  
  const halaqaNameStyle = {
    'font-size': '18px',
    'font-weight': 'bold',
    color: 'var(--color-text)',
    'margin-bottom': '4px',
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const
  };
  
  const halaqaTypeStyle = {
    'font-size': '12px',
    color: 'var(--color-text-secondary)',
    'margin-bottom': '8px'
  };
  
  const statusBadgeStyle = (isActive: boolean) => ({
    padding: '4px 8px',
    'border-radius': '12px',
    'font-size': '10px',
    'font-weight': '500',
    'background-color': isActive ? 'var(--color-success)' : 'var(--color-error)',
    color: 'white'
  });
  
  const infoRowStyle = {
    display: 'flex',
    'justify-content': 'space-between',
    'align-items': 'center',
    'margin-bottom': '8px',
    'font-size': '14px'
  };
  
  const labelStyle = {
    color: 'var(--color-text-secondary)',
    'font-weight': '500'
  };
  
  const valueStyle = {
    color: 'var(--color-text)'
  };
  
  const studentListStyle = {
    'margin-top': '12px'
  };
  
  const studentChipStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    'margin-right': '4px',
    'margin-bottom': '4px',
    'background-color': 'var(--color-primary)',
    color: 'white',
    'border-radius': '12px',
    'font-size': '12px'
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
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {app.translate('halaqat')}
        </h1>
      </div>
      
      <For each={userHalaqat()}>
        {(halaqa) => (
          <div style={halaqaCardStyle}>
            <div style={halaqaHeaderStyle}>
              <div>
                <h3 style={halaqaNameStyle}>
                  {halaqa.name}
                </h3>
                <div style={halaqaTypeStyle}>
                  {getHalaqaTypeTranslation(halaqa.type)}
                </div>
              </div>
              <div style={statusBadgeStyle(halaqa.isActive)}>
                {halaqa.isActive ? app.translate('active') : app.translate('inactive')}
              </div>
            </div>
            
            <div style={infoRowStyle}>
              <span style={labelStyle}>{app.translate('teacher')}:</span>
              <span style={valueStyle}>{getTeacherName(halaqa.teacher_id)}</span>
            </div>
            
            <div style={infoRowStyle}>
              <span style={labelStyle}>Internal Number:</span>
              <span style={valueStyle}>#{halaqa.internal_number}</span>
            </div>
            
            <div style={infoRowStyle}>
              <span style={labelStyle}>{app.translate('students')}:</span>
              <span style={valueStyle}>{halaqa.student_ids.length}</span>
            </div>
            
            <Show when={halaqa.student_ids.length > 0}>
              <div style={studentListStyle}>
                <div style={{...labelStyle, 'margin-bottom': '8px'}}>
                  {app.translate('students')}:
                </div>
                <For each={getStudentNames(halaqa.student_ids)}>
                  {(studentName) => (
                    <span style={studentChipStyle}>
                      {studentName}
                    </span>
                  )}
                </For>
              </div>
            </Show>
            
            <Show when={halaqa.student_ids.length === 0}>
              <div style={{
                'text-align': 'center',
                padding: '16px',
                color: 'var(--color-text-secondary)',
                'font-style': 'italic'
              }}>
                {app.translate('noStudentsAssigned')}
              </div>
            </Show>
          </div>
        )}
      </For>
      
      <Show when={userHalaqat().length === 0}>
        <div style={{
          'text-align': 'center',
          padding: '40px 20px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>👥</div>
          <div>{app.translate('noHalaqatAvailable')}</div>
        </div>
      </Show>
    </div>
  );
}