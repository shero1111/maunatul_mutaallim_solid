import { createSignal, createMemo, For, Show } from 'solid-js';
import { useApp } from '../store/AppStore';

interface UserDetailPageProps {
  userId: string;
  onBack: () => void;
}

export function UserDetailPage(props: UserDetailPageProps) {
  const app = useApp();
  
  // State for editing user data
  const [editingData, setEditingData] = createSignal<any>(null);
  const [isEditing, setIsEditing] = createSignal(false);
  
  // Get user data
  const user = createMemo(() => {
    return app.users().find(u => u.id === props.userId);
  });
  
  // Get assigned halaqat
  const assignedHalaqat = createMemo(() => {
    return app.halaqat().filter(h => h.student_ids.includes(props.userId));
  });
  
  // Get available halaqat (not assigned to this user)
  const availableHalaqat = createMemo(() => {
    return app.halaqat().filter(h => !h.student_ids.includes(props.userId));
  });
  
  // Initialize editing data when user data is available
  const initializeEditing = () => {
    const userData = user();
    if (userData) {
      setEditingData({ ...userData });
      setIsEditing(true);
    }
  };
  
  // Save user data
  const saveUserData = () => {
    const data = editingData();
    if (data) {
      app.updateUser(data);
      setIsEditing(false);
      setEditingData(null);
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingData(null);
  };
  
  // Assign halaqa to user
  const assignHalaqa = (halaqaId: string) => {
    app.addStudentToHalaqa(halaqaId, props.userId);
  };
  
  // Remove halaqa from user
  const unassignHalaqa = (halaqaId: string) => {
    app.removeStudentFromHalaqa(halaqaId, props.userId);
  };
  
  const containerStyle = {
    padding: '24px 20px 80px 20px',
    background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%)',
    'min-height': '100vh',
    position: 'relative' as const
  };
  
  const headerStyle = {
    display: 'flex',
    'align-items': 'center',
    'margin-bottom': '24px',
    gap: '12px'
  };
  
  const backButtonStyle = {
    'background-color': 'transparent',
    border: '1px solid var(--color-border)',
    'border-radius': '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    color: 'var(--color-text)',
    display: 'flex',
    'align-items': 'center',
    gap: '8px',
    'user-select': 'none',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none'
  };
  
  const cardStyle = {
    'background-color': 'var(--color-surface)',
    'border-radius': '12px',
    padding: '20px',
    'margin-bottom': '20px',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid var(--color-border)'
  };
  
  return (
    <div style={containerStyle}>
      {/* Header with Back Button */}
      <div style={headerStyle}>
        <button 
          style={backButtonStyle}
          onClick={props.onBack}
        >
          {app.language() === 'ar' ? '→' : '←'}
          {app.translate('backToHalaqat')}
        </button>
      </div>
      
      <Show when={user()} fallback={<div>User not found</div>}>
        {(userData) => (
          <>
            {/* User Profile Card */}
            <div style={cardStyle}>
              <div style={{
                display: 'flex',
                'justify-content': 'space-between',
                'align-items': 'center',
                'margin-bottom': '20px'
              }}>
                <h2 style={{
                  margin: '0',
                  color: 'var(--color-text)',
                  'font-size': '20px'
                }}>
                  {app.translate('userProfile')}
                </h2>
                <Show when={app.currentUser()?.role === 'admin' || app.currentUser()?.role === 'lehrer'}>
                  <Show 
                    when={!isEditing()}
                    fallback={
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={cancelEditing}
                          style={{
                            padding: '8px 16px',
                            'background-color': 'var(--color-text-secondary)',
                            color: 'white',
                            border: 'none',
                            'border-radius': '6px',
                            cursor: 'pointer',
                            'font-size': '14px'
                          }}
                        >
                          {app.translate('cancel')}
                        </button>
                        <button
                          onClick={saveUserData}
                          style={{
                            padding: '8px 16px',
                            'background-color': 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            'border-radius': '6px',
                            cursor: 'pointer',
                            'font-size': '14px'
                          }}
                        >
                          {app.translate('saveChanges')}
                        </button>
                      </div>
                    }
                  >
                    <button
                      onClick={initializeEditing}
                      style={{
                        padding: '8px 16px',
                        'background-color': 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        'border-radius': '6px',
                        cursor: 'pointer',
                        'font-size': '14px'
                      }}
                    >
                      {app.translate('editStudent')}
                    </button>
                  </Show>
                </Show>
              </div>
              
              <Show 
                when={isEditing() && editingData()}
                fallback={
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
                    <div>
                      <strong>{app.translate('fullName')}:</strong> {userData().full_name}
                    </div>
                    <div>
                      <strong>{app.translate('userName')}:</strong> {userData().username}
                    </div>
                    <div>
                      <strong>{app.translate('role')}:</strong> {
                        userData().role === 'student' ? app.translate('student') :
                        userData().role === 'lehrer' ? app.translate('teacher') :
                        app.translate('admin')
                      }
                    </div>
                    <div>
                      <strong>{app.translate('isActive')}:</strong> {
                        userData().isActive ? app.translate('active') : app.translate('inactive')
                      }
                    </div>
                  </div>
                }
              >
                {(data) => (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        'margin-bottom': '8px',
                        'font-weight': 'bold',
                        color: 'var(--color-text)'
                      }}>
                        {app.translate('fullName')}
                      </label>
                      <input
                        type="text"
                        value={data().full_name}
                        onInput={(e) => setEditingData(prev => ({
                          ...prev,
                          full_name: e.currentTarget.value
                        }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid var(--color-border)',
                          'border-radius': '8px',
                          'font-size': '14px',
                          'background-color': 'var(--color-background)',
                          color: 'var(--color-text)',
                          'box-sizing': 'border-box'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        'margin-bottom': '8px',
                        'font-weight': 'bold',
                        color: 'var(--color-text)'
                      }}>
                        {app.translate('userName')}
                      </label>
                      <input
                        type="text"
                        value={data().username}
                        onInput={(e) => setEditingData(prev => ({
                          ...prev,
                          username: e.currentTarget.value
                        }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid var(--color-border)',
                          'border-radius': '8px',
                          'font-size': '14px',
                          'background-color': 'var(--color-background)',
                          color: 'var(--color-text)',
                          'box-sizing': 'border-box'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        'margin-bottom': '8px',
                        'font-weight': 'bold',
                        color: 'var(--color-text)'
                      }}>
                        {app.translate('role')}
                      </label>
                      <select
                        value={data().role}
                        onChange={(e) => setEditingData(prev => ({
                          ...prev,
                          role: e.currentTarget.value as 'student' | 'lehrer' | 'admin'
                        }))}
                        disabled={app.currentUser()?.role !== 'admin'}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid var(--color-border)',
                          'border-radius': '8px',
                          'font-size': '14px',
                          'background-color': 'var(--color-background)',
                          color: 'var(--color-text)',
                          'box-sizing': 'border-box',
                          cursor: app.currentUser()?.role === 'admin' ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <option value="student">{app.translate('student')}</option>
                        <option value="lehrer">{app.translate('teacher')}</option>
                        <option value="admin">{app.translate('admin')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        'margin-bottom': '8px',
                        'font-weight': 'bold',
                        color: 'var(--color-text)'
                      }}>
                        {app.translate('isActive')}
                      </label>
                      <select
                        value={data().isActive ? 'true' : 'false'}
                        onChange={(e) => setEditingData(prev => ({
                          ...prev,
                          isActive: e.currentTarget.value === 'true'
                        }))}
                        disabled={app.currentUser()?.role !== 'admin'}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid var(--color-border)',
                          'border-radius': '8px',
                          'font-size': '14px',
                          'background-color': 'var(--color-background)',
                          color: 'var(--color-text)',
                          'box-sizing': 'border-box',
                          cursor: app.currentUser()?.role === 'admin' ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <option value="true">{app.translate('active')}</option>
                        <option value="false">{app.translate('inactive')}</option>
                      </select>
                    </div>
                  </div>
                )}
              </Show>
            </div>
            
            {/* Assigned Halaqat */}
            <div style={cardStyle}>
              <h3 style={{
                margin: '0 0 16px 0',
                color: 'var(--color-text)',
                'font-size': '18px'
              }}>
                {app.translate('assignedHalaqat')} ({assignedHalaqat().length})
              </h3>
              
              <Show when={assignedHalaqat().length > 0} fallback={
                <div style={{
                  padding: '20px',
                  'text-align': 'center',
                  color: 'var(--color-text-secondary)'
                }}>
                  {app.translate('noHalaqatAssigned')}
                </div>
              }>
                <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
                  <For each={assignedHalaqat()}>
                    {(halaqa) => (
                      <div style={{
                        display: 'flex',
                        'justify-content': 'space-between',
                        'align-items': 'center',
                        padding: '12px',
                        'background-color': 'var(--color-background)',
                        'border-radius': '8px',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div>
                          <div style={{ 'font-weight': 'bold', 'margin-bottom': '4px' }}>
                            #{halaqa.internal_number} {halaqa.name}
                          </div>
                          <div style={{
                            'font-size': '0.85rem',
                            color: 'var(--color-text-secondary)'
                          }}>
                            {halaqa.type === 'memorizing' && (app.language() === 'ar' ? 'تحفيظ' : 'Memorizing')}
                            {halaqa.type === 'explanation' && (app.language() === 'ar' ? 'شرح' : 'Explanation')}
                            {halaqa.type === 'memorizing_intensive' && (app.language() === 'ar' ? 'تحفيظ مكثف' : 'Intensive Memorizing')}
                            {halaqa.type === 'explanation_intensive' && (app.language() === 'ar' ? 'شرح مكثف' : 'Intensive Explanation')}
                          </div>
                        </div>
                        <Show when={app.currentUser()?.role === 'admin'}>
                          <button
                            onClick={() => unassignHalaqa(halaqa.id)}
                            style={{
                              padding: '6px 12px',
                              'background-color': '#ff4444',
                              color: 'white',
                              border: 'none',
                              'border-radius': '6px',
                              cursor: 'pointer',
                              'font-size': '12px'
                            }}
                          >
                            {app.translate('unassignHalaqa')}
                          </button>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
            
            {/* Available Halaqat */}
            <Show when={app.currentUser()?.role === 'admin' && availableHalaqat().length > 0}>
              <div style={cardStyle}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  color: 'var(--color-text)',
                  'font-size': '18px'
                }}>
                  {app.translate('availableHalaqat')} ({availableHalaqat().length})
                </h3>
                
                <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
                  <For each={availableHalaqat()}>
                    {(halaqa) => (
                      <div style={{
                        display: 'flex',
                        'justify-content': 'space-between',
                        'align-items': 'center',
                        padding: '12px',
                        'background-color': 'var(--color-background)',
                        'border-radius': '8px',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div>
                          <div style={{ 'font-weight': 'bold', 'margin-bottom': '4px' }}>
                            #{halaqa.internal_number} {halaqa.name}
                          </div>
                          <div style={{
                            'font-size': '0.85rem',
                            color: 'var(--color-text-secondary)'
                          }}>
                            {halaqa.type === 'memorizing' && (app.language() === 'ar' ? 'تحفيظ' : 'Memorizing')}
                            {halaqa.type === 'explanation' && (app.language() === 'ar' ? 'شرح' : 'Explanation')}
                            {halaqa.type === 'memorizing_intensive' && (app.language() === 'ar' ? 'تحفيظ مكثف' : 'Intensive Memorizing')}
                            {halaqa.type === 'explanation_intensive' && (app.language() === 'ar' ? 'شرح مكثف' : 'Intensive Explanation')}
                          </div>
                        </div>
                        <button
                          onClick={() => assignHalaqa(halaqa.id)}
                          style={{
                            padding: '6px 12px',
                            'background-color': 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            'border-radius': '6px',
                            cursor: 'pointer',
                            'font-size': '12px'
                          }}
                        >
                          {app.translate('assignHalaqa')}
                        </button>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}