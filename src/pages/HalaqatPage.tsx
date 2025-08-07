import { createMemo, For, Show, createSignal } from 'solid-js';
import { useApp } from '../store/AppStore';
import { UserDetailPage } from './UserDetailPage';

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
  
  // Student management modal state
  const [showAddStudentModal, setShowAddStudentModal] = createSignal(false);
  const [selectedHalaqaForStudent, setSelectedHalaqaForStudent] = createSignal<string | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = createSignal('');
  
  // Add Halaqa modal state
  const [showAddHalaqaModal, setShowAddHalaqaModal] = createSignal(false);
  const [newHalaqaName, setNewHalaqaName] = createSignal('');
  const [newHalaqaNumber, setNewHalaqaNumber] = createSignal('');
  const [newHalaqaType, setNewHalaqaType] = createSignal('memorizing');
  const [newHalaqaTeacher, setNewHalaqaTeacher] = createSignal('');
  const [newHalaqaActive, setNewHalaqaActive] = createSignal(true);
  
  // User detail page state
  const [showUserDetail, setShowUserDetail] = createSignal(false);
  const [selectedUserId, setSelectedUserId] = createSignal<string | null>(null);
  
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
    direction: app.language() === 'ar' ? 'rtl' as const : 'ltr' as const,
    'user-select': 'none',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none'
  };
  
  const subtitleStyle = {
    'font-size': '1rem',
    color: 'var(--color-text-secondary)',
    'font-weight': '500',
    'letter-spacing': '0.2px',
    'user-select': 'none',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none'
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
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    'user-select': 'none',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none'
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
    return teacher?.full_name || 'Unknown';
  };
  
  const getStudentNames = (studentIds: string[]): string[] => {
    const currentUser = app.currentUser();
    const isAdminOrLeader = currentUser && (currentUser.role === 'admin' || currentUser.role === 'lehrer');
    
    return studentIds.map(id => {
      const student = app.users().find(u => u.id === id);
      // Hide inactive students for non-admin/leader users
      if (!isAdminOrLeader && student && !student.isActive) {
        return null;
      }
      return student?.full_name || 'Unknown';
    }).filter(name => name !== null) as string[];
  };

  const getFilteredStudentNames = (studentIds: string[], halaqaId: string): string[] => {
    const searchTerm = searchTerms()[halaqaId]?.toLowerCase() || '';
    const students = getStudentNames(studentIds);
    
    if (!searchTerm) return students;
    
    return students.filter(name => 
      name.toLowerCase().includes(searchTerm)
    );
  };

  // Student management helper functions
  const openAddStudentModal = (halaqaId: string) => {
    setSelectedHalaqaForStudent(halaqaId);
    setStudentSearchTerm('');
    setShowAddStudentModal(true);
  };

  const closeAddStudentModal = () => {
    setShowAddStudentModal(false);
    setSelectedHalaqaForStudent(null);
    setStudentSearchTerm('');
  };

  const openStudentDetailModal = (studentId: string) => {
    setSelectedUserId(studentId);
    setShowUserDetail(true);
  };

  const closeStudentDetailModal = () => {
    setShowUserDetail(false);
    setSelectedUserId(null);
  };

  const getAvailableStudents = () => {
    const currentHalaqa = selectedHalaqaForStudent();
    if (!currentHalaqa) return [];
    
    const halaqa = app.halaqat().find(h => h.id === currentHalaqa);
    if (!halaqa) return [];
    
    return app.users().filter(user => 
      user.role === 'student' && 
      !halaqa.student_ids.includes(user.id)
    );
  };

  const getFilteredAvailableStudents = () => {
    const searchTerm = studentSearchTerm().toLowerCase();
    const availableStudents = getAvailableStudents();
    
    if (!searchTerm) return availableStudents;
    
    return availableStudents.filter(student =>
      student.full_name.toLowerCase().includes(searchTerm) ||
      student.username.toLowerCase().includes(searchTerm)
    );
  };

  const addStudentToHalaqa = (studentId: string) => {
    const halaqaId = selectedHalaqaForStudent();
    if (halaqaId) {
      app.addStudentToHalaqa(halaqaId, studentId);
      closeAddStudentModal();
    }
  };

  const removeStudentFromHalaqa = (halaqaId: string, studentId: string) => {
    app.removeStudentFromHalaqa(halaqaId, studentId);
  };



  // Add Halaqa helper functions
  const openAddHalaqaModal = () => {
    setNewHalaqaName('');
    setNewHalaqaNumber('');
    setNewHalaqaType('memorizing');
    setNewHalaqaTeacher('');
    setNewHalaqaActive(true);
    setShowAddHalaqaModal(true);
  };

  const closeAddHalaqaModal = () => {
    setShowAddHalaqaModal(false);
    setNewHalaqaName('');
    setNewHalaqaNumber('');
    setNewHalaqaType('memorizing');
    setNewHalaqaTeacher('');
    setNewHalaqaActive(true);
  };

  const getAvailableTeachers = () => {
    return app.users().filter(user => user.role === 'lehrer' && user.isActive);
  };

  const getNextHalaqaNumber = () => {
    const existingNumbers = app.halaqat().map(h => parseInt(h.internal_number) || 0);
    const maxNumber = Math.max(0, ...existingNumbers);
    return (maxNumber + 1).toString();
  };

  const saveNewHalaqa = () => {
    if (!newHalaqaName().trim()) {
      alert(app.translate('halaqaNameRequired'));
      return;
    }
    
    if (!newHalaqaTeacher()) {
      alert(app.translate('teacherRequired'));
      return;
    }

    const halaqaData = {
      name: newHalaqaName().trim(),
      internal_number: newHalaqaNumber() || getNextHalaqaNumber(),
      type: newHalaqaType() as 'memorizing' | 'explanation' | 'memorizing_intensive' | 'explanation_intensive',
      teacher_id: newHalaqaTeacher(),
      isActive: newHalaqaActive()
    };

    app.createHalaqa(halaqaData);
    closeAddHalaqaModal();
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
  
  // Show UserDetailPage if a user is selected
  if (showUserDetail() && selectedUserId()) {
    return (
      <UserDetailPage 
        userId={selectedUserId()!} 
        onBack={closeStudentDetailModal} 
      />
    );
  }

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
                      'line-height': '1.3',
                      'user-select': 'none',
                      '-webkit-user-select': 'none',
                      '-moz-user-select': 'none',
                      '-ms-user-select': 'none'
                    }}>
                      {getTypeIcon(halaqa.type)} #{halaqa.internal_number} {halaqa.name}
                    </h3>
                    {/* Teacher and Type in one line */}
                    <div style={{
                      'font-size': '0.85rem',
                      color: 'var(--color-text-secondary)',
                      'margin-bottom': '8px',
                      display: 'flex',
                      'align-items': 'center',
                      gap: '12px',
                      'flex-wrap': 'wrap',
                      'user-select': 'none',
                      '-webkit-user-select': 'none',
                      '-moz-user-select': 'none',
                      '-ms-user-select': 'none'
                    }}>
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '4px' }}>
                        <span>👨‍🏫</span>
                        <span>{getTeacherName(halaqa.teacher_id)}</span>
                      </div>
                      <span style={{ color: 'var(--color-border)' }}>•</span>
                      <span>{getHalaqaTypeTranslation(halaqa.type)}</span>
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
                      transition: 'all 0.2s ease',
                      'user-select': 'none',
                      '-webkit-user-select': 'none',
                      '-moz-user-select': 'none',
                      '-ms-user-select': 'none'
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
                      <span>{app.translate('showStudents')} ({halaqa.student_ids.length})</span>
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
                    {/* Search Header with Add Button */}
                    <div style={{
                      padding: '12px',
                      'border-bottom': '1px solid var(--color-border)',
                      display: 'flex',
                      gap: '8px',
                      'align-items': 'center'
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
                          flex: '1',
                          padding: '8px 12px',
                          border: '1px solid var(--color-border)',
                          'border-radius': '6px',
                          'font-size': '0.85rem',
                          'background-color': 'var(--color-surface)',
                          color: 'var(--color-text)',
                          'box-sizing': 'border-box'
                        }}
                      />
                      <Show when={app.currentUser()?.role === 'admin' || app.currentUser()?.role === 'lehrer'}>
                        <button
                          onClick={() => openAddStudentModal(halaqa.id)}
                          style={{
                            padding: '8px 12px',
                            'background-color': 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            'border-radius': '6px',
                            cursor: 'pointer',
                            'font-size': '0.85rem',
                            'font-weight': 'bold',
                            display: 'flex',
                            'align-items': 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                          }}
                          title={app.translate('addStudentToHalaqa')}
                        >
                          ➕ {app.translate('addStudent')}
                        </button>
                      </Show>
                    </div>
                    
                    {/* Student List - Row by Row */}
                    <div style={{
                      'max-height': '200px',
                      'overflow-y': 'auto',
                      padding: '8px 0'
                    }}>
                      <For each={halaqa.student_ids.filter(studentId => {
                        const student = app.users().find(u => u.id === studentId);
                        if (!student) return false;
                        const searchTerm = searchTerms()[halaqa.id]?.toLowerCase() || '';
                        if (!searchTerm) return true;
                        return student.full_name.toLowerCase().includes(searchTerm) ||
                               student.username.toLowerCase().includes(searchTerm);
                      })}>
                        {(studentId, index) => {
                          const student = app.users().find(u => u.id === studentId);
                          if (!student) return null;
                          
                          return (
                            <div style={{
                              display: 'flex',
                              'align-items': 'center',
                              'justify-content': 'space-between',
                              padding: '8px 12px',
                              'border-bottom': index() === halaqa.student_ids.filter(id => {
                                const s = app.users().find(u => u.id === id);
                                if (!s) return false;
                                const searchTerm = searchTerms()[halaqa.id]?.toLowerCase() || '';
                                if (!searchTerm) return true;
                                return s.full_name.toLowerCase().includes(searchTerm) ||
                                       s.username.toLowerCase().includes(searchTerm);
                              }).length - 1 
                                ? 'none' 
                                : '1px solid var(--color-border)',
                              'font-size': '0.85rem',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer'
                            }}
                            onClick={() => openStudentDetailModal(studentId)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}>
                              <div style={{ display: 'flex', 'align-items': 'center' }}>
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
                                  {student.full_name}
                                </span>
                              </div>
                              <Show when={app.currentUser()?.role === 'admin'}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeStudentFromHalaqa(halaqa.id, studentId);
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    'background-color': '#ff4444',
                                    color: 'white',
                                    border: 'none',
                                    'border-radius': '4px',
                                    cursor: 'pointer',
                                    'font-size': '0.75rem',
                                    transition: 'all 0.2s ease'
                                  }}
                                  title={app.translate('removeFromHalaqa')}
                                >
                                  ✕
                                </button>
                              </Show>
                            </div>
                          );
                        }}
                      </For>
                      
                      {/* No results message */}
                      <Show when={halaqa.student_ids.filter(studentId => {
                        const student = app.users().find(u => u.id === studentId);
                        if (!student) return false;
                        const searchTerm = searchTerms()[halaqa.id]?.toLowerCase() || '';
                        if (!searchTerm) return true;
                        return student.full_name.toLowerCase().includes(searchTerm) ||
                               student.username.toLowerCase().includes(searchTerm);
                      }).length === 0 && searchTerms()[halaqa.id]}>
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
                  👨‍🏫 {app.translate('lehrer')}
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
                    {app.translate('selectTeacher')}
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

      {/* Floating Add Halaqa Button */}
      <Show when={app.currentUser()?.role === 'admin'}>
        <button
          onClick={openAddHalaqaModal}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '60px',
            height: '60px',
            'border-radius': '50%',
            'background-color': 'var(--color-primary)',
            color: 'white',
            border: 'none',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            'font-size': '24px',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            transition: 'all 0.3s ease',
            'z-index': '100',
            'user-select': 'none',
            '-webkit-user-select': 'none',
            '-moz-user-select': 'none',
            '-ms-user-select': 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          title={app.translate('addHalaqa')}
        >
          ➕
        </button>
      </Show>

      {/* Add Student Modal */}
      <Show when={showAddStudentModal()}>
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          'background-color': 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          'justify-content': 'center',
          'align-items': 'center',
          'z-index': '1000'
        }}>
          <div style={{
            'background-color': 'var(--color-surface)',
            'border-radius': '12px',
            padding: '24px',
            'max-width': '500px',
            width: '90%',
            'max-height': '80vh',
            'overflow-y': 'auto',
            'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              'justify-content': 'space-between',
              'align-items': 'center',
              'margin-bottom': '20px'
            }}>
              <h3 style={{
                margin: '0',
                color: 'var(--color-text)',
                'font-size': '18px'
              }}>
                {app.translate('addStudentToHalaqa')}
              </h3>
              <button
                onClick={closeAddStudentModal}
                style={{
                  'background-color': 'transparent',
                  border: 'none',
                  'font-size': '20px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ 'margin-bottom': '16px' }}>
              <input
                type="text"
                placeholder={app.translate('searchStudents')}
                value={studentSearchTerm()}
                onInput={(e) => setStudentSearchTerm(e.currentTarget.value)}
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

            <div style={{
              'max-height': '300px',
              'overflow-y': 'auto',
              border: '1px solid var(--color-border)',
              'border-radius': '8px'
            }}>
              <For each={getFilteredAvailableStudents()}>
                {(student) => (
                  <div
                    onClick={() => addStudentToHalaqa(student.id)}
                    style={{
                      padding: '12px 16px',
                      'border-bottom': '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      'justify-content': 'space-between',
                      'align-items': 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div>
                      <div style={{
                        'font-weight': 'bold',
                        color: 'var(--color-text)',
                        'margin-bottom': '4px'
                      }}>
                        {student.full_name}
                      </div>
                      <div style={{
                        'font-size': '0.85rem',
                        color: 'var(--color-text-secondary)'
                      }}>
                        @{student.username}
                      </div>
                    </div>
                    <span style={{
                      color: 'var(--color-primary)',
                      'font-size': '18px'
                    }}>
                      ➕
                    </span>
                  </div>
                )}
              </For>
              
              <Show when={getFilteredAvailableStudents().length === 0}>
                <div style={{
                  padding: '20px',
                  'text-align': 'center',
                  color: 'var(--color-text-secondary)'
                }}>
                  {app.translate('noStudentsFound')}
                </div>
              </Show>
            </div>

            <div style={{
              display: 'flex',
              'justify-content': 'flex-end',
              'margin-top': '20px'
            }}>
              <button
                onClick={closeAddStudentModal}
                style={{
                  padding: '10px 20px',
                  'background-color': 'var(--color-text-secondary)',
                  color: 'white',
                  border: 'none',
                  'border-radius': '6px',
                  cursor: 'pointer'
                }}
              >
                {app.translate('cancel')}
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Add Halaqa Modal */}
      <Show when={showAddHalaqaModal()}>
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          'background-color': 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          'justify-content': 'center',
          'align-items': 'center',
          'z-index': '1000'
        }}>
          <div style={{
            'background-color': 'var(--color-surface)',
            'border-radius': '12px',
            padding: '24px',
            'max-width': '600px',
            width: '90%',
            'max-height': '80vh',
            'overflow-y': 'auto',
            'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              'justify-content': 'space-between',
              'align-items': 'center',
              'margin-bottom': '20px'
            }}>
              <h3 style={{
                margin: '0',
                color: 'var(--color-text)',
                'font-size': '18px'
              }}>
                {app.translate('createNewHalaqa')}
              </h3>
              <button
                onClick={closeAddHalaqaModal}
                style={{
                  'background-color': 'transparent',
                  border: 'none',
                  'font-size': '20px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
              {/* Halaqa Name */}
              <div>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': 'bold',
                  color: 'var(--color-text)'
                }}>
                  {app.translate('halaqaName')} *
                </label>
                <input
                  type="text"
                  value={newHalaqaName()}
                  onInput={(e) => setNewHalaqaName(e.currentTarget.value)}
                  placeholder={app.language() === 'ar' ? 'أدخل اسم الحلقة' : 'Enter halaqa name'}
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

              {/* Halaqa Number */}
              <div>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': 'bold',
                  color: 'var(--color-text)'
                }}>
                  {app.translate('halaqaNumber')} ({app.language() === 'ar' ? 'اختياري' : 'optional'})
                </label>
                <input
                  type="number"
                  value={newHalaqaNumber()}
                  onInput={(e) => setNewHalaqaNumber(e.currentTarget.value)}
                  placeholder={getNextHalaqaNumber()}
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

              {/* Teacher Selection */}
              <div>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': 'bold',
                  color: 'var(--color-text)'
                }}>
                  {app.translate('selectTeacher')} *
                </label>
                <select
                  value={newHalaqaTeacher()}
                  onChange={(e) => setNewHalaqaTeacher(e.currentTarget.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-background)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">{app.translate('selectTeacher')}</option>
                  <For each={getAvailableTeachers()}>
                    {(teacher) => (
                      <option value={teacher.id}>{teacher.full_name}</option>
                    )}
                  </For>
                </select>
              </div>

              {/* Halaqa Type */}
              <div>
                <label style={{
                  display: 'block',
                  'margin-bottom': '8px',
                  'font-weight': 'bold',
                  color: 'var(--color-text)'
                }}>
                  {app.translate('halaqaType')}
                </label>
                <select
                  value={newHalaqaType()}
                  onChange={(e) => setNewHalaqaType(e.currentTarget.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-background)',
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
                  value={newHalaqaActive() ? 'true' : 'false'}
                  onChange={(e) => setNewHalaqaActive(e.currentTarget.value === 'true')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    'border-radius': '8px',
                    'font-size': '14px',
                    'background-color': 'var(--color-background)',
                    color: 'var(--color-text)',
                    'box-sizing': 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="true">{app.translate('active')}</option>
                  <option value="false">{app.translate('inactive')}</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                'justify-content': 'space-between',
                'margin-top': '20px',
                gap: '12px'
              }}>
                <button
                  onClick={closeAddHalaqaModal}
                  style={{
                    padding: '12px 20px',
                    'background-color': 'var(--color-text-secondary)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '8px',
                    cursor: 'pointer',
                    flex: '1'
                  }}
                >
                  {app.translate('cancel')}
                </button>
                <button
                  onClick={saveNewHalaqa}
                  disabled={!newHalaqaName().trim() || !newHalaqaTeacher()}
                  style={{
                    padding: '12px 20px',
                    'background-color': (!newHalaqaName().trim() || !newHalaqaTeacher()) 
                      ? 'var(--color-text-secondary)' 
                      : 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    'border-radius': '8px',
                    cursor: (!newHalaqaName().trim() || !newHalaqaTeacher()) ? 'not-allowed' : 'pointer',
                    opacity: (!newHalaqaName().trim() || !newHalaqaTeacher()) ? '0.5' : '1',
                    flex: '1'
                  }}
                >
                  ➕ {app.translate('addHalaqa')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}