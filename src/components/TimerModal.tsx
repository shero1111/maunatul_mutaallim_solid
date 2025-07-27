import { createSignal, Show, onMount, onCleanup } from 'solid-js';
import { useApp } from '../store/AppStore';

export function TimerModal() {
  const app = useApp();
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<'timer' | 'stopwatch'>('timer');
  const [stopwatchTime, setStopwatchTime] = createSignal(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = createSignal(false);
  const [customMinutes, setCustomMinutes] = createSignal(25);
  
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
          right: '20px',
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

                {/* Custom time input */}
                <div style={{ 'margin-bottom': '20px' }}>
                  <label style={{
                    display: 'block',
                    'margin-bottom': '8px',
                    color: 'var(--color-text)',
                    'font-weight': '500'
                  }}>
                    Minutes:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={customMinutes()}
                    onInput={(e) => setCustomMinutes(parseInt(e.currentTarget.value) || 25)}
                    style={{
                      width: '80px',
                      padding: '8px',
                      'border-radius': '6px',
                      border: '1px solid var(--color-border)',
                      'text-align': 'center',
                      'font-size': '1rem',
                      background: 'var(--color-background)',
                      color: 'var(--color-text)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', 'justify-content': 'center', 'flex-wrap': 'wrap' }}>
                  <Show when={!app.timer().isRunning}>
                    <button
                      onClick={() => app.startTimer(customMinutes())}
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
                  </Show>
                  
                  <button
                    onClick={() => app.resetTimer()}
                    style={{
                      background: 'var(--color-text-secondary)',
                      color: 'white',
                      border: 'none',
                      outline: 'none',
                      padding: '10px 20px',
                      'border-radius': '8px',
                      cursor: 'pointer',
                      'font-weight': '500'
                    }}
                  >
                    Reset
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
                  <div style={{ display: 'flex', gap: '8px', 'justify-content': 'center', 'flex-wrap': 'wrap' }}>
                    {[5, 15, 25, 45].map(minutes => (
                      <button
                        onClick={() => {
                          setCustomMinutes(minutes);
                          app.startTimer(minutes);
                        }}
                        style={{
                          background: 'var(--color-background)',
                          color: 'var(--color-text)',
                          border: '1px solid var(--color-border)',
                          outline: 'none',
                          padding: '6px 12px',
                          'border-radius': '6px',
                          cursor: 'pointer',
                          'font-size': '0.85rem'
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