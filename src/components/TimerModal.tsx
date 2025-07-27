import { createSignal, Show, onMount, onCleanup } from 'solid-js';
import { useApp } from '../store/AppStore';

export function TimerModal() {
  const app = useApp();
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<'timer' | 'stopwatch'>('timer');
  const [stopwatchTime, setStopwatchTime] = createSignal(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = createSignal(false);
  const [customMinutes, setCustomMinutes] = createSignal(25);
  const [customSeconds, setCustomSeconds] = createSignal(0);
  
  let stopwatchInterval: number | null = null;

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
      {/* Floating Action Button */}
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
            {/* Header */}
            <div style={{
              display: 'flex',
              'justify-content': 'space-between',
              'align-items': 'center',
              'margin-bottom': '20px'
            }}>
              <h3 style={{
                color: 'var(--color-text)',
                margin: '0',
                'font-size': '1.3rem',
                'font-weight': '600'
              }}>
                ⏱️ Timer & Stopwatch
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  'font-size': '1.5rem',
                  color: 'var(--color-text-secondary)',
                  padding: '4px'
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
                Timer
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
                Stopwatch
              </button>
            </div>

            {/* Timer Tab */}
            <Show when={activeTab() === 'timer'}>
              <div style={{ 'text-align': 'center' }}>
                                 <div style={{
                   'font-size': '3rem',
                   'font-weight': 'bold',
                   color: 'var(--color-primary)',
                   'margin-bottom': '20px',
                   'font-family': 'monospace'
                 }}>
                   {formatTime(app.timer().time)}
                 </div>

                 {/* Manual time picker - only when timer is stopped/reset */}
                 <Show when={app.timer().time === 0 || !app.timer().isRunning}>
                   <div style={{ 'margin-bottom': '20px' }}>
                     <p style={{
                       color: 'var(--color-text-secondary)',
                       'margin-bottom': '15px',
                       'font-size': '0.9rem'
                     }}>
                       Set time:
                     </p>
                     
                     <div style={{ 
                       display: 'flex', 
                       'align-items': 'center', 
                       'justify-content': 'center', 
                       gap: '20px',
                       'margin-bottom': '15px' 
                     }}>
                       {/* Minutes picker */}
                       <div style={{ 'text-align': 'center' }}>
                         <button
                           onClick={() => setCustomMinutes(Math.min(120, customMinutes() + 1))}
                           style={{
                             background: 'none',
                             border: 'none',
                             outline: 'none',
                             cursor: 'pointer',
                             'font-size': '1.2rem',
                             color: 'var(--color-primary)',
                             padding: '4px',
                             display: 'block',
                             margin: '0 auto'
                           }}
                         >
                           ▲
                         </button>
                         
                         <div style={{
                           'font-size': '1.5rem',
                           'font-weight': 'bold',
                           color: 'var(--color-text)',
                           'font-family': 'monospace',
                           'min-width': '60px',
                           'text-align': 'center',
                           padding: '8px'
                         }}>
                           {customMinutes().toString().padStart(2, '0')}
                         </div>
                         
                         <button
                           onClick={() => setCustomMinutes(Math.max(0, customMinutes() - 1))}
                           style={{
                             background: 'none',
                             border: 'none',
                             outline: 'none',
                             cursor: 'pointer',
                             'font-size': '1.2rem',
                             color: 'var(--color-primary)',
                             padding: '4px',
                             display: 'block',
                             margin: '0 auto'
                           }}
                         >
                           ▼
                         </button>
                         
                         <span style={{
                           'font-size': '0.8rem',
                           color: 'var(--color-text-secondary)',
                           'margin-top': '4px',
                           display: 'block'
                         }}>
                           min
                         </span>
                       </div>

                       {/* Separator */}
                       <div style={{
                         'font-size': '2rem',
                         'font-weight': 'bold',
                         color: 'var(--color-text-secondary)',
                         'font-family': 'monospace'
                       }}>
                         :
                       </div>

                       {/* Seconds picker */}
                       <div style={{ 'text-align': 'center' }}>
                         <button
                           onClick={() => setCustomSeconds(Math.min(59, customSeconds() + 1))}
                           style={{
                             background: 'none',
                             border: 'none',
                             outline: 'none',
                             cursor: 'pointer',
                             'font-size': '1.2rem',
                             color: 'var(--color-primary)',
                             padding: '4px',
                             display: 'block',
                             margin: '0 auto'
                           }}
                         >
                           ▲
                         </button>
                         
                         <div style={{
                           'font-size': '1.5rem',
                           'font-weight': 'bold',
                           color: 'var(--color-text)',
                           'font-family': 'monospace',
                           'min-width': '60px',
                           'text-align': 'center',
                           padding: '8px'
                         }}>
                           {customSeconds().toString().padStart(2, '0')}
                         </div>
                         
                         <button
                           onClick={() => setCustomSeconds(Math.max(0, customSeconds() - 1))}
                           style={{
                             background: 'none',
                             border: 'none',
                             outline: 'none',
                             cursor: 'pointer',
                             'font-size': '1.2rem',
                             color: 'var(--color-primary)',
                             padding: '4px',
                             display: 'block',
                             margin: '0 auto'
                           }}
                         >
                           ▼
                         </button>
                         
                         <span style={{
                           'font-size': '0.8rem',
                           color: 'var(--color-text-secondary)',
                           'margin-top': '4px',
                           display: 'block'
                         }}>
                           sec
                         </span>
                       </div>
                     </div>
                   </div>
                 </Show>

                <div style={{ display: 'flex', gap: '10px', 'justify-content': 'center', 'flex-wrap': 'wrap' }}>
                  <Show when={!app.timer().isRunning}>
                    <button
                      onClick={() => app.startTimerWithSeconds(customMinutes(), customSeconds())}
                      style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        outline: 'none',
                        padding: '10px 20px',
                        'border-radius': '8px',
                        cursor: 'pointer',
                        'font-weight': '500'
                      }}
                    >
                      Start
                    </button>
                  </Show>
                  
                  <Show when={app.timer().isRunning}>
                    <button
                      onClick={() => app.stopTimer()}
                      style={{
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        outline: 'none',
                        padding: '10px 20px',
                        'border-radius': '8px',
                        cursor: 'pointer',
                        'font-weight': '500'
                      }}
                    >
                      Pause
                    </button>
                  </Show>
                  
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
                      'font-weight': '500'
                    }}
                  >
                    Stop
                  </button>
                </div>

                {/* Quick timer presets */}
                <div style={{ 'margin-top': '20px' }}>
                  <p style={{
                    color: 'var(--color-text-secondary)',
                    'margin-bottom': '10px',
                    'font-size': '0.9rem'
                  }}>
                    Quick presets:
                  </p>
                  <div style={{ display: 'flex', gap: '4px', 'justify-content': 'center', 'flex-wrap': 'nowrap', 'overflow-x': 'auto' }}>
                                         {[1, 3, 5, 10, 15, 20, 30].map(minutes => (
                       <button
                         onClick={() => {
                           setCustomMinutes(minutes);
                           setCustomSeconds(0);
                           app.startTimer(minutes);
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
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        outline: 'none',
                        padding: '12px 24px',
                        'border-radius': '8px',
                        cursor: 'pointer',
                        'font-weight': '500',
                        'font-size': '1rem'
                      }}
                    >
                      Start
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
                        'font-size': '1rem'
                      }}
                    >
                      Stop
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
                      'font-size': '1rem'
                    }}
                  >
                    Reset
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