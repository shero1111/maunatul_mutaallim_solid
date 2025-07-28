import { createSignal, Show, onMount, onCleanup } from 'solid-js';
import { useApp } from '../store/AppStore';

// Media Control Icons - Standard SVG Icons for Timer Buttons
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg>
);

export function TimerModal() {
  const app = useApp();
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<'timer' | 'stopwatch'>('timer');
  const [stopwatchTime, setStopwatchTime] = createSignal(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = createSignal(false);
  const [customMinutes, setCustomMinutes] = createSignal(10);
  const [customSeconds, setCustomSeconds] = createSignal(0);

  // Show timer FAB only on specific pages and when audio player is not visible
  const shouldShowTimer = () => {
    const currentPage = app.currentPage();
    const isOnCorrectPage = currentPage === 'home' || currentPage === 'mutuun';
    
    // Hide timer if audio player is visible (has title or matnId)
    const audioPlayerVisible = !!(app.audioPlayer().title || app.audioPlayer().matnId);
    
    const shouldShow = isOnCorrectPage && !audioPlayerVisible;
    
    // Debug logging
    console.log('🎛️ Timer FAB visibility check:', {
      currentPage,
      isOnCorrectPage,
      audioPlayerTitle: app.audioPlayer().title,
      audioPlayerMatnId: app.audioPlayer().matnId,
      audioPlayerVisible,
      shouldShow
    });
    
    return shouldShow;
  };

  // Update custom values when timer is stopped/paused
  const updateCustomTimeFromTimer = () => {
    const totalSeconds = app.timer().time;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setCustomMinutes(minutes);
    setCustomSeconds(seconds);
  };
  
  let stopwatchInterval: ReturnType<typeof setInterval> | null = null;

  // Stopwatch functions
  const startStopwatch = () => {
    setIsStopwatchRunning(true);
    stopwatchInterval = setInterval(() => {
      setStopwatchTime(prev => prev + 1);
    }, 1000);
  };

  const stopStopwatch = () => {
    setIsStopwatchRunning(false);
    if (stopwatchInterval) {
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
    }
  };

  const resetStopwatch = () => {
    stopStopwatch();
    setStopwatchTime(0);
  };

  // Format time display
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Cleanup on component unmount
  onCleanup(() => {
    if (stopwatchInterval) {
      clearInterval(stopwatchInterval);
    }
  });

  // Close modal when clicking outside
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      {/* Floating Action Button - only on home and mutuun pages */}
      <Show when={shouldShowTimer()}>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            position: 'fixed',
            bottom: '90px', // Above bottom navigation
            left: '20px',
            width: '56px',
            height: '56px',
            'border-radius': '50%',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            'box-shadow': '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-size': '1.5rem',
            'z-index': 1000,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ⏱️
        </button>
      </Show>

      {/* Modal */}
      <Show when={isModalOpen()}>
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'z-index': 1001,
            padding: '20px',
            'box-sizing': 'border-box'
          }}
          onClick={handleBackdropClick}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              'border-radius': '16px',
              padding: '24px',
              'box-shadow': '0 8px 32px rgba(0,0,0,0.3)',
              border: '1px solid var(--color-border)',
              'max-width': '400px',
              width: '100%',
              'max-height': '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div style={{
              display: 'flex',
              'justify-content': 'flex-end',
              'margin-bottom': '16px'
            }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  cursor: 'pointer',
                  'font-size': '1.2rem',
                  color: 'var(--color-text-secondary)',
                  padding: '8px',
                  'border-radius': '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-background)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              'margin-bottom': '20px',
              background: 'var(--color-background)',
              'border-radius': '8px',
              padding: '4px'
            }}>
              <button
                onClick={() => setActiveTab('timer')}
                style={{
                  flex: '1',
                  padding: '8px 16px',
                  'border-radius': '6px',
                  border: 'none',
                  outline: 'none',
                  background: activeTab() === 'timer' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab() === 'timer' ? 'white' : 'var(--color-text)',
                  cursor: 'pointer',
                  'font-weight': '500',
                  transition: 'all 0.2s ease'
                }}
              >
                {app.language() === 'ar' ? 'مؤقت' : 'Timer'}
              </button>
              <button
                onClick={() => setActiveTab('stopwatch')}
                style={{
                  flex: '1',
                  padding: '8px 16px',
                  'border-radius': '6px',
                  border: 'none',
                  outline: 'none',
                  background: activeTab() === 'stopwatch' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab() === 'stopwatch' ? 'white' : 'var(--color-text)',
                  cursor: 'pointer',
                  'font-weight': '500',
                  transition: 'all 0.2s ease'
                }}
              >
                {app.language() === 'ar' ? 'ساعة إيقاف' : 'Stopwatch'}
              </button>
            </div>

            {/* Timer Tab */}
            <Show when={activeTab() === 'timer'}>
              <div style={{ 'text-align': 'center' }}>
                                 {/* Unified time display with integrated picker */}
                 <div style={{ 'margin-bottom': '20px' }}>

                   
                   <div style={{ 
                     display: 'flex', 
                     'align-items': 'center', 
                     'justify-content': 'center', 
                     gap: '10px',
                     direction: 'ltr'
                   }}>
                     {/* Minutes section */}
                     <div style={{ 'text-align': 'center' }}>
                       <Show when={app.timer().time === 0 || !app.timer().isRunning}>
                         <button
                           onClick={() => setCustomMinutes(Math.min(120, customMinutes() + 1))}
                           style={{
                             background: 'none',
                             border: 'none',
                             outline: 'none',
                             cursor: 'pointer',
                             'font-size': '1.2rem',
                             color: 'var(--color-primary)',
                             padding: '4px 8px',
                             margin: '0 auto 4px auto',
                             display: 'block'
                           }}
                         >
                           ▲
                         </button>
                       </Show>
                       
                       <div style={{
                         'font-size': '3rem',
                         'font-weight': 'bold',
                         color: 'var(--color-primary)',
                         'font-family': 'monospace',
                         'text-align': 'center',
                         'line-height': '1'
                       }}>
                         {app.timer().isRunning ? 
                           Math.floor(app.timer().time / 60).toString().padStart(2, '0') : 
                           customMinutes().toString().padStart(2, '0')
                         }
                       </div>
                       
                       <Show when={app.timer().time === 0 || !app.timer().isRunning}>
                         <button
                           onClick={() => setCustomMinutes(Math.max(0, customMinutes() - 1))}
                           style={{
                             background: 'none',
                             border: 'none',
                             outline: 'none',
                             cursor: 'pointer',
                             'font-size': '1.2rem',
                             color: 'var(--color-primary)',
                             padding: '4px 8px',
                             margin: '4px auto 0 auto',
                             display: 'block'
                           }}
                         >
                           ▼
                         </button>
                       </Show>
                     </div>

                     {/* Separator */}
                     <div style={{
                       'font-size': '3rem',
                       'font-weight': 'bold',
                       color: 'var(--color-primary)',
                       'font-family': 'monospace',
                       'line-height': '1'
                     }}>
                       :
                     </div>

                     {/* Seconds section */}
                     <div style={{ 'text-align': 'center' }}>
                       <Show when={app.timer().time === 0 || !app.timer().isRunning}>
                         <button
                           onClick={() => setCustomSeconds(Math.min(59, customSeconds() + 1))}
                           style={{
                             background: 'none',
                             border: 'none',
                             outline: 'none',
                             cursor: 'pointer',
                             'font-size': '1.2rem',
                             color: 'var(--color-primary)',
                             padding: '4px 8px',
                             margin: '0 auto 4px auto',
                             display: 'block'
                           }}
                         >
                           ▲
                         </button>
                       </Show>
                       
                       <div style={{
                         'font-size': '3rem',
                         'font-weight': 'bold',
                         color: 'var(--color-primary)',
                         'font-family': 'monospace',
                         'text-align': 'center',
                         'line-height': '1'
                       }}>
                         {app.timer().isRunning ? 
                           (app.timer().time % 60).toString().padStart(2, '0') : 
                           customSeconds().toString().padStart(2, '0')
                         }
                       </div>
                       
                       <Show when={app.timer().time === 0 || !app.timer().isRunning}>
                         <button
                           onClick={() => setCustomSeconds(Math.max(0, customSeconds() - 1))}
                           style={{
                             background: 'none',
                             border: 'none',
                             outline: 'none',
                             cursor: 'pointer',
                             'font-size': '1.2rem',
                             color: 'var(--color-primary)',
                             padding: '4px 8px',
                             margin: '4px auto 0 auto',
                             display: 'block'
                           }}
                         >
                           ▼
                         </button>
                       </Show>
                     </div>
                   </div>
                 </div>

                                 <div style={{ display: 'flex', gap: '10px', 'justify-content': 'center', 'flex-wrap': 'wrap' }}>
                   <Show when={!app.timer().isRunning}>
                     <button
                       onClick={() => app.startTimerWithSeconds(customMinutes(), customSeconds())}
                       style={{
                         background: '#22c55e',
                         color: 'white',
                         border: 'none',
                         outline: 'none',
                         padding: '10px 20px',
                         'border-radius': '8px',
                         cursor: 'pointer',
                         'font-weight': '500',
                         display: 'flex',
                         'align-items': 'center',
                         gap: '8px'
                       }}
                     >
                       <PlayIcon />
                       {app.language() === 'ar' ? 'ابدأ' : 'Start'}
                     </button>
                   </Show>

                   <Show when={app.timer().isRunning}>
                     <button
                       onClick={() => {
                         updateCustomTimeFromTimer();
                         app.stopTimer();
                       }}
                       style={{
                         background: '#f59e0b',
                         color: 'white',
                         border: 'none',
                         outline: 'none',
                         padding: '10px 20px',
                         'border-radius': '8px',
                         cursor: 'pointer',
                         'font-weight': '500',
                         display: 'flex',
                         'align-items': 'center',
                         gap: '8px'
                       }}
                                            >
                         <PauseIcon />
                         {app.language() === 'ar' ? 'توقف' : 'Pause'}
                       </button>
                     
                                            <button
                         onClick={() => app.resetTimer()}
                         style={{
                           background: '#dc2626',
                           color: 'white',
                           border: 'none',
                           outline: 'none',
                           padding: '10px 20px',
                           'border-radius': '8px',
                           cursor: 'pointer',
                           'font-weight': '500',
                           display: 'flex',
                           'align-items': 'center',
                           gap: '8px'
                         }}
                       >
                         <StopIcon />
                         {app.language() === 'ar' ? 'إيقاف' : 'Stop'}
                       </button>
                   </Show>
                 </div>

                                 {/* Quick timer presets - only when timer is stopped */}
                 <Show when={!app.timer().isRunning}>
                   <div style={{ 'margin-top': '20px' }}>
                     <div style={{ display: 'flex', gap: '4px', 'justify-content': 'center', 'flex-wrap': 'nowrap', 'overflow-x': 'auto' }}>
                       {[5, 10, 15, 20, 30].map(minutes => (
                       <button
                         onClick={() => {
                           // Stop timer if running and set new time
                           if (app.timer().isRunning) {
                             app.resetTimer();
                           }
                           setCustomMinutes(minutes);
                           setCustomSeconds(0);
                         }}
                        style={{
                          background: 'var(--color-background)',
                          color: 'var(--color-text)',
                          border: '1px solid var(--color-border)',
                          outline: 'none',
                          padding: '4px 8px',
                          'border-radius': '4px',
                          cursor: 'pointer',
                          'font-size': '0.75rem',
                          'white-space': 'nowrap',
                          'flex-shrink': 0,
                          'min-width': '32px'
                        }}
                      >
                        {minutes}m
                      </button>
                        ))}
                      </div>
                    </div>
                  </Show>
              </div>
            </Show>

            {/* Stopwatch Tab */}
            <Show when={activeTab() === 'stopwatch'}>
              <div style={{ 'text-align': 'center' }}>
                <div style={{
                  'font-size': '3rem',
                  'font-weight': 'bold',
                  color: 'var(--color-primary)',
                  'margin-bottom': '30px',
                  'font-family': 'monospace'
                }}>
                  {formatTime(stopwatchTime())}
                </div>

                <div style={{ display: 'flex', gap: '10px', 'justify-content': 'center' }}>
                  <Show when={!isStopwatchRunning()}>
                    <button
                      onClick={startStopwatch}
                      style={{
                        background: '#22c55e',
                        color: 'white',
                        border: 'none',
                        outline: 'none',
                        padding: '12px 24px',
                        'border-radius': '8px',
                        cursor: 'pointer',
                        'font-weight': '500',
                        'font-size': '1rem',
                        display: 'flex',
                        'align-items': 'center',
                        gap: '8px'
                      }}
                    >
                      <PlayIcon />
                      {app.language() === 'ar' ? 'ابدأ' : 'Start'}
                    </button>
                  </Show>
                  
                  <Show when={isStopwatchRunning()}>
                    <button
                      onClick={stopStopwatch}
                      style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        outline: 'none',
                        padding: '12px 24px',
                        'border-radius': '8px',
                        cursor: 'pointer',
                        'font-weight': '500',
                        'font-size': '1rem',
                        display: 'flex',
                        'align-items': 'center',
                        gap: '8px'
                      }}
                    >
                      <StopIcon />
                      {app.language() === 'ar' ? 'إيقاف' : 'Stop'}
                    </button>
                  </Show>
                  
                  <button
                    onClick={resetStopwatch}
                    style={{
                      background: 'var(--color-text-secondary)',
                      color: 'white',
                      border: 'none',
                      outline: 'none',
                      padding: '12px 24px',
                      'border-radius': '8px',
                      cursor: 'pointer',
                      'font-weight': '500',
                      'font-size': '1rem',
                      display: 'flex',
                      'align-items': 'center',
                      gap: '8px'
                    }}
                  >
                    <ResetIcon />
                    {app.language() === 'ar' ? 'إعادة تعيين' : 'Reset'}
                  </button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </>
  );
}