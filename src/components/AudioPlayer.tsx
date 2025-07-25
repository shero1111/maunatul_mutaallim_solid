import { Show, createSignal, onCleanup } from 'solid-js';
import { useApp } from '../store/AppStore';

export function AudioPlayer() {
  const app = useApp();
  const player = app.audioPlayer;
  
  // Drag state for progress bar
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragPosition, setDragPosition] = createSignal(0);
  
  // Hold-to-accelerate skip state
  const [isHoldingSkip, setIsHoldingSkip] = createSignal<'forward' | 'backward' | null>(null);
  const [skipSpeed, setSkipSpeed] = createSignal(1);
  
  let progressBarRef: HTMLDivElement | undefined;
  let skipIntervalRef: number | undefined;
  let accelerationTimeoutRef: number | undefined;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const calculatePosition = (clientX: number): number => {
    if (!progressBarRef) return 0;
    const rect = progressBarRef.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return position;
  };
  
  // Mouse events
  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const percentage = calculatePosition(e.clientX);
    setDragPosition(percentage);
    app.seekAudio(percentage);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;
    const percentage = calculatePosition(e.clientX);
    setDragPosition(percentage);
    app.seekAudio(percentage);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    removeGlobalListeners();
  };
  
  // Touch events for mobile
  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    const percentage = calculatePosition(touch.clientX);
    setDragPosition(percentage);
    app.seekAudio(percentage);
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging()) return;
    e.preventDefault();
    const touch = e.touches[0];
    const percentage = calculatePosition(touch.clientX);
    setDragPosition(percentage);
    app.seekAudio(percentage);
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    removeGlobalListeners();
  };
  
  // Global event listeners for drag
  const setupGlobalListeners = () => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  const removeGlobalListeners = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
  
  // Setup listeners when dragging starts
  const startDragging = () => {
    setupGlobalListeners();
  };
  
  // Accelerated skip functions
  const startAcceleratedSkip = (direction: 'forward' | 'backward') => {
    setIsHoldingSkip(direction);
    setSkipSpeed(1);
    
    // Initial skip
    if (direction === 'forward') {
      app.skipForward();
    } else {
      app.skipBackward();
    }
    
    // Start continuous skipping with acceleration
    let currentSpeed = 1;
    const baseInterval = 200; // Base interval in ms
    
    const skip = () => {
      if (direction === 'forward') {
        app.skipForward();
      } else {
        app.skipBackward();
      }
    };
    
    const scheduleNextSkip = () => {
      if (isHoldingSkip() === direction) {
        skipIntervalRef = setTimeout(() => {
          skip();
          scheduleNextSkip();
        }, Math.max(50, baseInterval / currentSpeed)); // Minimum 50ms interval
      }
    };
    
    // Start the skipping loop
    skipIntervalRef = setTimeout(() => {
      scheduleNextSkip();
    }, baseInterval);
    
    // Acceleration: increase speed every 500ms
    const accelerate = () => {
      if (isHoldingSkip() === direction && currentSpeed < 10) { // Max 10x speed
        currentSpeed += 0.5;
        setSkipSpeed(currentSpeed);
        accelerationTimeoutRef = setTimeout(accelerate, 500);
      }
    };
    
    accelerationTimeoutRef = setTimeout(accelerate, 500);
  };
  
  const stopAcceleratedSkip = () => {
    setIsHoldingSkip(null);
    setSkipSpeed(1);
    
    if (skipIntervalRef) {
      clearTimeout(skipIntervalRef);
      skipIntervalRef = undefined;
    }
    
    if (accelerationTimeoutRef) {
      clearTimeout(accelerationTimeoutRef);
      accelerationTimeoutRef = undefined;
    }
  };

  // Clean up on component unmount
  onCleanup(() => {
    removeGlobalListeners();
    stopAcceleratedSkip();
  });
  
  // Simple click handler for non-drag clicks
  const handleProgressClick = (e: MouseEvent) => {
    if (!isDragging()) {
      const percentage = calculatePosition(e.clientX);
      app.seekAudio(percentage);
    }
  };
  
  const playerStyle = () => ({
    position: 'fixed' as const,
    bottom: '60px',
    left: '0',
    right: '0',
    'background': 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%)',
    'border-top': '1px solid var(--color-border)',
    padding: '16px 20px',
    'z-index': '999',
    'box-shadow': '0 -4px 20px rgba(0, 0, 0, 0.15)',
    transform: player().title ? 'translateY(0)' : 'translateY(100%)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    'backdrop-filter': 'blur(10px)',
    direction: 'ltr' as const
  });
  
  const contentStyle = {
    display: 'flex',
    'flex-direction': 'column' as const,
    gap: '12px'
  };
  
  const headerStyle = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-between'
  };
  
  const titleStyle = {
    'font-size': '15px',
    'font-weight': '600',
    color: 'var(--color-text)',
    'white-space': 'nowrap' as const,
    overflow: 'hidden',
    'text-overflow': 'ellipsis',
    flex: '1',
    'margin-right': '12px',
    'text-align': 'left' as const
  };
  
  const controlsStyle = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    gap: '12px',
    direction: 'ltr' as const
  };
  
  const buttonStyle = {
    width: '48px',
    height: '48px',
    'border-radius': '50%',
    border: 'none',
    'background': 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
    color: 'white',
    'font-size': '20px',
    cursor: 'pointer',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    transition: 'all 0.2s ease',
    'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
    '-webkit-tap-highlight-color': 'transparent',
    'user-select': 'none',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none'
  };

  const skipButtonStyle = {
    width: '36px',
    height: '36px',
    'border-radius': '50%',
    border: '2px solid var(--color-border)',
    'background-color': 'var(--color-surface)',
    color: 'var(--color-text)',
    'font-size': '14px',
    cursor: 'pointer',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    transition: 'all 0.2s ease',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    '-webkit-tap-highlight-color': 'transparent',
    'user-select': 'none',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none'
  };

  const holdSkipButtonStyle = {
    width: '40px',
    height: '40px',
    'border-radius': '50%',
    border: '2px solid var(--color-border)',
    'background-color': 'var(--color-surface)',
    color: 'var(--color-text)',
    'font-size': '16px',
    cursor: 'pointer',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    transition: 'all 0.2s ease',
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    '-webkit-tap-highlight-color': 'transparent',
    'user-select': 'none',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none'
  };
  
  const closeButtonStyle = {
    width: '32px',
    height: '32px',
    'border-radius': '50%',
    border: 'none',
    'background-color': 'var(--color-text-secondary)',
    color: 'white',
    'font-size': '14px',
    cursor: 'pointer',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    transition: 'all 0.2s ease',
    '-webkit-tap-highlight-color': 'transparent',
    'user-select': 'none',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none'
  };
  
  const progressContainerStyle = {
    width: '100%'
  };
  
  const timeStyle = {
    display: 'flex',
    'justify-content': 'space-between',
    'font-size': '12px',
    color: 'var(--color-text-secondary)',
    'margin-bottom': '8px',
    'font-weight': '500',
    direction: 'ltr' as const
  };
  
  const progressBarStyle = {
    width: '100%',
    height: '8px',
    'background-color': 'var(--color-border)',
    'border-radius': '4px',
    overflow: 'visible',
    cursor: 'pointer',
    position: 'relative' as const,
    'box-shadow': 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
    'touch-action': 'none',
    direction: 'ltr' as const
  };
  
  const progressFillStyle = () => {
    const currentProgress = isDragging() 
      ? dragPosition() * 100 
      : player().duration > 0 
        ? (player().currentTime / player().duration) * 100 
        : 0;
    
    return {
      height: '100%',
      'background': 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
      width: `${currentProgress}%`,
      transition: isDragging() ? 'none' : 'width 0.1s linear',
      'border-radius': '4px',
      'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.2)'
    };
  };
  
  const dragHandleStyle = () => {
    const currentProgress = isDragging() 
      ? dragPosition() * 100 
      : player().duration > 0 
        ? (player().currentTime / player().duration) * 100 
        : 0;
    
    return {
      position: 'absolute' as const,
      top: '50%',
      left: `${currentProgress}%`,
      transform: 'translate(-50%, -50%)',
      width: isDragging() ? '16px' : '12px',
      height: isDragging() ? '16px' : '12px',
      'background-color': 'white',
      'border-radius': '50%',
      'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.3)',
      transition: isDragging() ? 'none' : 'all 0.2s ease',
      cursor: 'grab',
      'z-index': '10'
    };
  };
  
  return (
    <Show when={player().title}>
      <div style={playerStyle()}>
        <div style={contentStyle}>
          {/* Header with Title and Close */}
          <div style={headerStyle}>
            <div style={titleStyle}>
              {player().title}
            </div>
            
            <button
              style={closeButtonStyle}
              onClick={app.stopAudio}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)'}
            >
              ✕
            </button>
          </div>
          
          {/* Enhanced Progress Bar with Drag & Drop */}
          <div style={progressContainerStyle}>
            {/* Time Display */}
            <div style={timeStyle}>
              <span>
                {isDragging() 
                  ? formatTime(dragPosition() * player().duration) 
                  : formatTime(player().currentTime)
                }
              </span>
              <span>{formatTime(player().duration)}</span>
            </div>
            
            {/* Draggable Progress Bar */}
            <div 
              ref={progressBarRef}
              style={progressBarStyle}
              onMouseDown={(e) => {
                handleMouseDown(e);
                startDragging();
              }}
              onTouchStart={(e) => {
                handleTouchStart(e);
                startDragging();
              }}
              onClick={handleProgressClick}
            >
              {/* Progress Fill */}
              <div style={progressFillStyle()} />
              
              {/* Drag Handle */}
              <div style={dragHandleStyle()} />
            </div>
          </div>
          
          {/* Speed Indicator */}
          <Show when={isHoldingSkip()}>
            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--color-primary)',
              fontWeight: '600',
              marginBottom: '8px',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'pulse 0.5s ease-in-out infinite alternate'
            }}>
              {skipSpeed().toFixed(1)}x {isHoldingSkip() === 'forward' ? 'Vorspulen' : 'Zurückspulen'}
            </div>
          </Show>

          {/* Controls */}
          <div style={controlsStyle}>
            <Show when={player().isLoading}>
              <div style={{
                width: '48px',
                height: '48px',
                'border-radius': '50%',
                border: '3px solid var(--color-border)',
                'border-top': '3px solid var(--color-primary)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }} />
            </Show>
            
            <Show when={!player().isLoading}>
              {/* Hold-to-Accelerate Skip Backward - LEFTMOST */}
              <button
                style={{
                  ...holdSkipButtonStyle,
                  transform: isHoldingSkip() === 'backward' ? 'scale(1.1)' : 'scale(1)',
                  backgroundColor: isHoldingSkip() === 'backward' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isHoldingSkip() === 'backward' ? 'white' : 'var(--color-text)',
                  boxShadow: isHoldingSkip() === 'backward' ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseDown={() => startAcceleratedSkip('backward')}
                onMouseUp={stopAcceleratedSkip}
                onMouseLeave={stopAcceleratedSkip}
                onTouchStart={() => startAcceleratedSkip('backward')}
                onTouchEnd={stopAcceleratedSkip}
                onMouseOver={(e) => {
                  if (!isHoldingSkip()) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isHoldingSkip()) {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    e.currentTarget.style.color = 'var(--color-text)';
                  }
                }}
                title={isHoldingSkip() === 'backward' ? `${skipSpeed().toFixed(1)}x Speed` : 'Halten für schnelleres Zurückspulen'}
              >
                ⏮
              </button>
              
              {/* 5s Skip Backward */}
              <button
                style={skipButtonStyle}
                onClick={app.skipBackward}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }}
                title="-5 Sekunden"
              >
                -5s
              </button>
              
              {/* Play/Pause - CENTER */}
              <button
                style={buttonStyle}
                onClick={app.pauseAudio}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
              >
                {player().isPlaying ? '⏸️' : '▶️'}
              </button>
              
              {/* 5s Skip Forward */}
              <button
                style={skipButtonStyle}
                onClick={app.skipForward}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }}
                title="+5 Sekunden"
              >
                +5s
              </button>
              
              {/* Hold-to-Accelerate Skip Forward - RIGHTMOST */}
              <button
                style={{
                  ...holdSkipButtonStyle,
                  transform: isHoldingSkip() === 'forward' ? 'scale(1.1)' : 'scale(1)',
                  backgroundColor: isHoldingSkip() === 'forward' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isHoldingSkip() === 'forward' ? 'white' : 'var(--color-text)',
                  boxShadow: isHoldingSkip() === 'forward' ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseDown={() => startAcceleratedSkip('forward')}
                onMouseUp={stopAcceleratedSkip}
                onMouseLeave={stopAcceleratedSkip}
                onTouchStart={() => startAcceleratedSkip('forward')}
                onTouchEnd={stopAcceleratedSkip}
                onMouseOver={(e) => {
                  if (!isHoldingSkip()) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isHoldingSkip()) {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    e.currentTarget.style.color = 'var(--color-text)';
                  }
                }}
                title={isHoldingSkip() === 'forward' ? `${skipSpeed().toFixed(1)}x Speed` : 'Halten für schnelleres Vorspulen'}
              >
                ⏭
              </button>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
}