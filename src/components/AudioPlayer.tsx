import { Show } from 'solid-js';
import { useApp } from '../store/AppStore';

export function AudioPlayer() {
  const app = useApp();
  const player = app.audioPlayer;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const playerStyle = () => ({
    position: 'fixed' as const,
    bottom: '60px',
    left: '0',
    right: '0',
    'background-color': 'var(--color-background)',
    'border-top': '1px solid var(--color-border)',
    padding: '12px 16px',
    'z-index': '999',
    'box-shadow': '0 -2px 10px rgba(0, 0, 0, 0.1)',
    transform: player().title ? 'translateY(0)' : 'translateY(100%)',
    transition: 'transform 0.3s ease-in-out'
  });
  
  const contentStyle = {
    display: 'flex',
    'align-items': 'center',
    gap: '12px'
  };
  
  const titleStyle = {
    flex: '1',
    'font-size': '14px',
    'font-weight': '500',
    color: 'var(--color-text)',
    'white-space': 'nowrap' as const,
    overflow: 'hidden',
    'text-overflow': 'ellipsis'
  };
  
  const controlsStyle = {
    display: 'flex',
    'align-items': 'center',
    gap: '8px'
  };
  
  const buttonStyle = {
    width: '40px',
    height: '40px',
    'border-radius': '50%',
    border: 'none',
    'background-color': 'var(--color-primary)',
    color: 'white',
    'font-size': '18px',
    cursor: 'pointer',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    transition: 'background-color 0.2s',
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
    transition: 'background-color 0.2s',
    '-webkit-tap-highlight-color': 'transparent'
  };
  
  const progressContainerStyle = {
    width: '100%',
    'margin-top': '8px'
  };
  
  const progressBarStyle = {
    width: '100%',
    height: '4px',
    'background-color': 'var(--color-border)',
    'border-radius': '2px',
    overflow: 'hidden',
    cursor: 'pointer'
  };
  
  const progressFillStyle = () => ({
    height: '100%',
    'background-color': 'var(--color-primary)',
    width: `${player().duration > 0 ? (player().currentTime / player().duration) * 100 : 0}%`,
    transition: 'width 0.1s linear'
  });
  
  const timeStyle = {
    display: 'flex',
    'justify-content': 'space-between',
    'font-size': '12px',
    color: 'var(--color-text-secondary)',
    'margin-top': '4px'
  };
  
  return (
    <Show when={player().title}>
      <div style={playerStyle()}>
        <div style={contentStyle}>
          <div style={titleStyle}>
            {player().title}
          </div>
          
          <div style={controlsStyle}>
            <Show when={player().isLoading}>
              <div style={{
                width: '40px',
                height: '40px',
                'border-radius': '50%',
                border: '3px solid var(--color-border)',
                'border-top': '3px solid var(--color-primary)',
                animation: 'spin 1s linear infinite'
              }} />
            </Show>
            
            <Show when={!player().isLoading}>
              <button
                style={buttonStyle}
                onClick={app.pauseAudio}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
              >
                {player().isPlaying ? '⏸️' : '▶️'}
              </button>
            </Show>
            
            <button
              style={closeButtonStyle}
              onClick={app.stopAudio}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)'}
            >
              ✕
            </button>
          </div>
        </div>
        
        <div style={progressContainerStyle}>
          <div style={progressBarStyle}>
            <div style={progressFillStyle()} />
          </div>
          
          <div style={timeStyle}>
            <span>{formatTime(player().currentTime)}</span>
            <span>{formatTime(player().duration)}</span>
          </div>
        </div>
      </div>
    </Show>
  );
}