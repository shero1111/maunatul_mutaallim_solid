import { Show } from 'solid-js';
import { useApp } from '../store/AppStore';

export function AudioPlayer() {
  const app = useApp();
  const player = app.audioPlayer;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleProgressClick = (e: MouseEvent) => {
    const progressBar = e.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    app.seekAudio(percentage);
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
    'backdrop-filter': 'blur(10px)'
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
    'margin-right': '12px'
  };
  
  const controlsStyle = {
    display: 'flex',
    'align-items': 'center',
    gap: '12px'
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
    '-webkit-tap-highlight-color': 'transparent'
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
    '-webkit-tap-highlight-color': 'transparent'
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
    '-webkit-tap-highlight-color': 'transparent'
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
    'font-weight': '500'
  };
  
  const progressBarStyle = {
    width: '100%',
    height: '6px',
    'background-color': 'var(--color-border)',
    'border-radius': '3px',
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative' as const,
    'box-shadow': 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  const progressFillStyle = () => ({
    height: '100%',
    'background': 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
    width: `${player().duration > 0 ? (player().currentTime / player().duration) * 100 : 0}%`,
    transition: 'width 0.1s linear',
    'border-radius': '3px',
    'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.2)'
  });
  
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
          
          {/* Progress Bar with Time */}
          <div style={progressContainerStyle}>
            {/* Time Display */}
            <div style={timeStyle}>
              <span>{formatTime(player().currentTime)}</span>
              <span>{formatTime(player().duration)}</span>
            </div>
            
            {/* Progress Bar */}
            <div 
              style={progressBarStyle}
              onClick={handleProgressClick}
            >
              <div style={progressFillStyle()} />
            </div>
          </div>
          
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
              {/* Skip Backward */}
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
                ⏪
              </button>
              
              {/* Play/Pause */}
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
              
              {/* Skip Forward */}
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
                ⏩
              </button>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
}