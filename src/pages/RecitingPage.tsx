import { createSignal, createMemo, For, Show, onMount, onCleanup } from 'solid-js';
import { useApp } from '../store/AppStore';
import { AudioRecording, ExchangePost } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

export function RecitingPage() {
  const app = useApp();
  
  // State for active tab
  const [activeTab, setActiveTab] = createSignal<'recording' | 'exchange'>('recording');
  
  // Recording Center State
  const [isRecording, setIsRecording] = createSignal(false);
  const [isPaused, setIsPaused] = createSignal(false);
  const [recordingTime, setRecordingTime] = createSignal(0);
  const [mediaRecorder, setMediaRecorder] = createSignal<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = createSignal<Blob[]>([]);
  const [recordingTimer, setRecordingTimer] = createSignal<number | null>(null);
  const [playingRecording, setPlayingRecording] = createSignal<string | null>(null);
  const [editingRecordingId, setEditingRecordingId] = createSignal<string | null>(null);
  const [newRecordingName, setNewRecordingName] = createSignal('');
  const [audioElement, setAudioElement] = createSignal<HTMLAudioElement | null>(null);
  
  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = createSignal(false);
  const [confirmModalProps, setConfirmModalProps] = createSignal<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'danger' | 'info';
  }>({
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Snackbar for simple notifications
  const [showSnackbar, setShowSnackbar] = createSignal(false);
  const [snackbarMessage, setSnackbarMessage] = createSignal('');
  
  // Exchange Center State
  const [exchangeFilter, setExchangeFilter] = createSignal<'all' | 'offers' | 'requests' | 'my'>('all');
  const [showCreatePost, setShowCreatePost] = createSignal(false);
  const [editingPost, setEditingPost] = createSignal<ExchangePost | null>(null);
  const [postTitle, setPostTitle] = createSignal('');
  const [postDescription, setPostDescription] = createSignal('');
  const [postMatn, setPostMatn] = createSignal('');
  const [postLevel, setPostLevel] = createSignal('');
  const [postType, setPostType] = createSignal<'offer' | 'request'>('request');
  const [customMatn, setCustomMatn] = createSignal('');
  const [showCustomMatn, setShowCustomMatn] = createSignal(false);

  // Level options for exchange posts
  const levelOptions = [
    { value: '', label: app.language() === 'ar' ? 'اختر المستوى' : 'Select Level' },
    { value: 'all', label: app.language() === 'ar' ? 'الجميع' : 'All' },
    { value: 'level1', label: app.language() === 'ar' ? 'الأول' : 'First' },
    { value: 'level2', label: app.language() === 'ar' ? 'الثاني' : 'Second' },
    { value: 'level3', label: app.language() === 'ar' ? 'الثالث' : 'Third' },
    { value: 'level4', label: app.language() === 'ar' ? 'الرابع' : 'Fourth' }
  ];

  // Get Mutuun for selected level
  const getMatuunForLevel = createMemo(() => {
    if (!postLevel() || postLevel() === 'all') return [];
    
    const allMutun = app.mutun();
    const levelNumber = postLevel().replace('level', '');
    
    console.log('🔍 Debug Level Selection:');
    console.log('Selected Level:', postLevel());
    console.log('Level Number:', levelNumber);
    console.log('All Mutun:', allMutun);
    
    const filtered = allMutun
      .filter(matn => matn.level === parseInt(levelNumber))
      .map(matn => ({
        value: matn.id,
        label: matn.name
      }));
      
    console.log('Filtered Mutun for level', levelNumber, ':', filtered);
    return filtered;
  });

  // Matn options with empty option
  const matnOptions = createMemo(() => {
    const baseOptions = [
      { value: '', label: app.language() === 'ar' ? 'اختر المتن' : 'Select Matn' }
    ];
    return [...baseOptions, ...getMatuunForLevel()];
  });

  // Helper function for confirmations
  const showConfirmation = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'danger' | 'info' = 'warning') => {
    setConfirmModalProps({
      title,
      message,
      onConfirm,
      type
    });
    setShowConfirmModal(true);
  };

  const hideConfirmation = () => {
    setShowConfirmModal(false);
  };

  // Show snackbar for simple notifications
  const showErrorSnackbar = (message: string, duration: number = 3000) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
    setTimeout(() => {
      setShowSnackbar(false);
    }, duration);
  };
  
  // Allow all authenticated users to access this page
  const canAccess = createMemo(() => {
    const user = app.currentUser();
    return !!user; // Just check if user is logged in
  });
  
  // Filter exchange posts
  const filteredPosts = createMemo(() => {
    const posts = app.exchangePosts();
    const currentUser = app.currentUser();
    
    switch (exchangeFilter()) {
      case 'offers':
        return posts.filter(post => post.type === 'offer' && post.is_active);
      case 'requests':
        return posts.filter(post => post.type === 'request' && post.is_active);
      case 'my':
        return posts.filter(post => post.author_id === currentUser?.id);
      default:
        return posts.filter(post => post.is_active);
    }
  });
  
  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      // Try different MIME types based on browser support
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ''; // Let browser choose
      }
      
      console.log('🎙️ Using MIME type:', mimeType);
      
      const recorder = new MediaRecorder(stream, { 
        mimeType: mimeType || undefined
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('📊 Audio chunk received, size:', event.data.size);
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        console.log('🛑 Recording stopped, total chunks:', audioChunks().length);
        const audioBlob = new Blob(audioChunks(), { 
          type: mimeType || 'audio/webm' 
        });
        console.log('💾 Created audio blob, size:', audioBlob.size);
        saveRecording(audioBlob);
        setAudioChunks([]);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      showConfirmation(
        app.translate('microphoneAccess'),
        app.language() === 'ar'
          ? 'لا يمكن الوصول إلى الميكروفون. تأكد من السماح بالوصول للميكروفون في المتصفح.'
          : 'Cannot access microphone. Please allow microphone access in your browser.',
        () => {},
        'warning'
      );
    }
  };
  
  const pauseRecording = () => {
    const recorder = mediaRecorder();
    if (recorder && recorder.state === 'recording') {
      recorder.pause();
      setIsPaused(true);
      
      const timer = recordingTimer();
      if (timer) clearInterval(timer);
    }
  };
  
  const resumeRecording = () => {
    const recorder = mediaRecorder();
    if (recorder && recorder.state === 'paused') {
      recorder.resume();
      setIsPaused(false);
      
      // Resume timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    }
  };
  
  const stopRecording = () => {
    const recorder = mediaRecorder();
    if (recorder) {
      recorder.stop();
      recorder.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setIsPaused(false);
    
    const timer = recordingTimer();
    if (timer) {
      clearInterval(timer);
      setRecordingTimer(null);
    }
  };
  
  const saveRecording = (audioBlob: Blob) => {
    console.log('💾 Saving recording...');
    console.log('📊 Blob details:', {
      size: audioBlob.size,
      type: audioBlob.type
    });
    
    if (audioBlob.size === 0) {
      console.error('❌ Recording failed: Empty audio blob');
      showErrorSnackbar(
        app.language() === 'ar'
          ? 'فشل في التسجيل: لا توجد بيانات صوتية'
          : 'Recording failed: No audio data'
      );
      return;
    }
    
    // Create object URL for the blob
    const url = URL.createObjectURL(audioBlob);
    console.log('🔗 Created object URL:', url);
    
    // Test the URL immediately
    console.log('🧪 Testing blob URL...');
    const testAudio = new Audio();
    testAudio.src = url;
    testAudio.addEventListener('canplaythrough', () => {
      console.log('✅ Blob URL is valid and audio can play');
    });
    testAudio.addEventListener('error', (e) => {
      console.error('❌ Blob URL test failed:', e);
    });
    testAudio.load();
    
    const recording: AudioRecording = {
      id: Date.now().toString(),
      name: `${app.translate('newRecording')} ${new Date().toLocaleDateString()}`,
      url,
      duration: recordingTime(),
      created_at: new Date().toISOString(),
      user_id: app.currentUser()?.id || '',
      size: audioBlob.size
    };
    
    console.log('✅ Recording object created:', recording);
    app.addRecording(recording);
    setRecordingTime(0);
  };
  
  const deleteRecording = (id: string) => {
    const recording = app.recordings().find(r => r.id === id);
    showConfirmation(
      app.translate('deleteRecording'),
      app.language() === 'ar'
        ? `هل أنت متأكد من حذف التسجيل "${recording?.name}"؟`
        : `Are you sure you want to delete the recording "${recording?.name}"?`,
      () => {
        app.deleteRecording(id);
        hideConfirmation();
      },
      'danger'
    );
  };
  
  const renameRecording = (id: string, newName: string) => {
    app.updateRecording(id, { name: newName });
    setEditingRecordingId(null);
    setNewRecordingName('');
  };
  
    const playRecording = (id: string) => {
    const recording = app.recordings().find(r => r.id === id);
    if (!recording) {
      showErrorSnackbar(
        app.language() === 'ar' 
          ? 'التسجيل غير موجود' 
          : 'Recording not found'
      );
      return;
    }

    console.log('🎵 Play recording:', recording);
    console.log('🔗 Audio URL:', recording.url);

    // Stop any currently playing audio
    const currentAudio = audioElement();
    if (currentAudio) {
      console.log('⏹️ Stopping current audio');
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
    }

    if (playingRecording() === id) {
      // Stop playback
      console.log('⏸️ Stopping playback');
      setPlayingRecording(null);
      setAudioElement(null);
      return;
    }

    // Create new audio element
    console.log('🆕 Creating new audio element');
    const audio = new Audio();
    
    // Set up event handlers
    audio.addEventListener('loadstart', () => {
      console.log('📥 Audio loading started');
    });
    
    audio.addEventListener('canplaythrough', () => {
      console.log('✅ Audio can play through');
    });
    
    audio.addEventListener('play', () => {
      console.log('▶️ Audio started playing');
      setPlayingRecording(id);
    });
    
    audio.addEventListener('pause', () => {
      console.log('⏸️ Audio paused');
      setPlayingRecording(null);
    });
    
    audio.addEventListener('ended', () => {
      console.log('🏁 Audio ended');
      setPlayingRecording(null);
      setAudioElement(null);
    });
    
    audio.addEventListener('error', (e) => {
      console.error('❌ Audio error event:', e);
      console.error('❌ Audio error details:', {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src
      });
      showErrorSnackbar(
        app.language() === 'ar' 
          ? 'فشل تشغيل التسجيل' 
          : 'Failed to play recording'
      );
      setPlayingRecording(null);
      setAudioElement(null);
    });

    // Set the source
    audio.src = recording.url;
    audio.preload = 'auto';
    
    setAudioElement(audio);
    
    // Try to play immediately
    console.log('▶️ Attempting to play audio...');
    audio.play()
      .then(() => {
        console.log('✅ Audio playback started successfully');
      })
      .catch(error => {
        console.error('❌ Play promise rejected:', error);
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          code: error.code
        });
        
        // Try a different approach - user interaction required
        if (error.name === 'NotAllowedError') {
          showErrorSnackbar(
            app.language() === 'ar' 
              ? 'اضغط مرة أخرى لتشغيل الصوت' 
              : 'Click again to play audio'
          );
        } else {
          showErrorSnackbar(
            app.language() === 'ar' 
              ? 'فشل تشغيل الصوت' 
              : 'Audio playback failed'
          );
        }
        setPlayingRecording(null);
        setAudioElement(null);
      });
  };
  
  // Exchange post functions
  const createPost = () => {
    if (!postTitle().trim() || !postDescription().trim() || !postLevel()) return;
    
    // Get the actual matn name from the mutun data
    let finalMatnName: string | undefined = undefined;
    if (postMatn() && postLevel() !== 'all') {
      const selectedMatn = app.mutun().find(matn => matn.id === postMatn());
      finalMatnName = selectedMatn?.name;
    }
    
    const post: ExchangePost = {
      id: Date.now().toString(),
      type: postType(),
      title: postTitle().trim(),
      description: postDescription().trim(),
      matn_name: finalMatnName,
      level: levelOptions.find(opt => opt.value === postLevel())?.label,
      author_id: app.currentUser()?.id || '',
      author_name: app.currentUser()?.name || '',
      created_at: new Date().toISOString(),
      is_active: true
    };
    
    app.addExchangePost(post);
    resetPostForm();
  };
  
  const editPost = (post: ExchangePost) => {
    setEditingPost(post);
    setPostType(post.type);
    setPostTitle(post.title);
    setPostDescription(post.description);
    
    // Find matching level
    const levelOption = levelOptions.find(opt => opt.label === post.level);
    setPostLevel(levelOption?.value || '');
    
    // Find matching matn from actual mutun data
    if (post.matn_name) {
      const matchingMatn = app.mutun().find(matn => matn.name === post.matn_name);
      setPostMatn(matchingMatn?.id || '');
    } else {
      setPostMatn('');
    }
    
    setCustomMatn('');
    setShowCustomMatn(false);
    setShowCreatePost(true);
  };
  
  const updatePost = () => {
    const post = editingPost();
    if (!post || !postTitle().trim() || !postDescription().trim() || !postLevel()) return;
    
    // Get the actual matn name from the mutun data
    let finalMatnName: string | undefined = undefined;
    if (postMatn() && postLevel() !== 'all') {
      const selectedMatn = app.mutun().find(matn => matn.id === postMatn());
      finalMatnName = selectedMatn?.name;
    }
    
    const updatedPost: ExchangePost = {
      ...post,
      type: postType(),
      title: postTitle().trim(),
      description: postDescription().trim(),
      matn_name: finalMatnName,
      level: levelOptions.find(opt => opt.value === postLevel())?.label
    };
    
    app.updateExchangePost(updatedPost);
    resetPostForm();
  };
  
  const deletePost = (id: string) => {
    const post = app.exchangePosts().find(p => p.id === id);
    showConfirmation(
      app.translate('deletePost'),
      app.language() === 'ar'
        ? `هل أنت متأكد من حذف المنشور "${post?.title}"؟`
        : `Are you sure you want to delete the post "${post?.title}"?`,
      () => {
        app.deleteExchangePost(id);
        hideConfirmation();
      },
      'danger'
    );
  };
  
  const resetPostForm = () => {
    setShowCreatePost(false);
    setEditingPost(null);
    setPostTitle('');
    setPostDescription('');
    setPostMatn('');
    setPostLevel('');
    setPostType('request');
    setCustomMatn('');
    setShowCustomMatn(false);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };
  
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}${app.translate('timeAgo')}`;
    if (diffHours < 24) return `${diffHours}h ${app.translate('timeAgo')}`;
    return `${diffDays}d ${app.translate('timeAgo')}`;
  };
  
  // Cleanup on unmount
  onCleanup(() => {
    const timer = recordingTimer();
    if (timer) clearInterval(timer);
    
    const recorder = mediaRecorder();
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    
    // Stop any playing audio
    const audio = audioElement();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setAudioElement(null);
    setPlayingRecording(null);
  });
  
  if (!canAccess()) {
    return (
      <div style={{
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        height: '100vh',
        'background-color': 'var(--color-surface)',
        color: 'var(--color-text)'
      }}>
        <div style={{ 'text-align': 'center' }}>
          <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>🚫</div>
          <div>Please log in to access this page</div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      'background-color': 'var(--color-surface)',
      'min-height': '100vh',
      padding: '0 0 80px 0'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px',
        'background': 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
        color: 'white',
        'text-align': 'center'
      }}>
        <h1 style={{
          margin: '0 0 16px 0',
          'font-size': '24px',
          'font-weight': 'bold'
        }}>
          {app.translate('reciting')}
        </h1>
        
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          'background-color': 'rgba(255, 255, 255, 0.2)',
          'border-radius': '12px',
          padding: '4px',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveTab('recording')}
            style={{
              flex: '1',
              padding: '12px',
              border: 'none',
              'border-radius': '8px',
              'background-color': activeTab() === 'recording' ? 'white' : 'transparent',
              color: activeTab() === 'recording' ? 'var(--color-primary)' : 'white',
              'font-weight': '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🎙️ {app.translate('recordingCenter')}
          </button>
          <button
            onClick={() => setActiveTab('exchange')}
            style={{
              flex: '1',
              padding: '12px',
              border: 'none',
              'border-radius': '8px',
              'background-color': activeTab() === 'exchange' ? 'white' : 'transparent',
              color: activeTab() === 'exchange' ? 'var(--color-primary)' : 'white',
              'font-weight': '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 {app.translate('exchangeCenter')}
          </button>
        </div>
      </div>
      
      {/* Recording Center */}
      <Show when={activeTab() === 'recording'}>
        <div style={{ padding: '20px 16px' }}>
          {/* Recording Controls */}
          <div style={{
            'background-color': 'var(--color-background)',
            'border-radius': '16px',
            padding: '24px',
            'margin-bottom': '24px',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
            'text-align': 'center'
          }}>
            {/* Recording Status */}
            <div style={{
              'margin-bottom': '20px'
            }}>
              <div style={{
                'font-size': '48px',
                'margin-bottom': '8px',
                color: isRecording() ? (isPaused() ? '#f59e0b' : '#ef4444') : '#6b7280'
              }}>
                🎙️
              </div>
              <div style={{
                'font-size': '24px',
                'font-weight': 'bold',
                color: 'var(--color-text)',
                'margin-bottom': '8px'
              }}>
                {formatTime(recordingTime())}
              </div>
              <div style={{
                'font-size': '14px',
                color: 'var(--color-text-secondary)'
              }}>
                {isRecording() 
                  ? (isPaused() ? app.translate('pauseRecording') : app.translate('startRecording'))
                  : app.translate('newRecording')
                }
              </div>
            </div>
            
            {/* Control Buttons */}
            <div style={{
              display: 'flex',
              'justify-content': 'center',
              gap: '12px',
              'flex-wrap': 'wrap'
            }}>
              <Show when={!isRecording()}>
                <button
                  onClick={startRecording}
                  style={{
                    'background-color': '#ef4444',
                    color: 'white',
                    border: 'none',
                    'border-radius': '50%',
                    width: '64px',
                    height: '64px',
                    'font-size': '24px',
                    cursor: 'pointer',
                    'box-shadow': '0 4px 12px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ⏺️
                </button>
              </Show>
              
              <Show when={isRecording()}>
                <Show when={!isPaused()}>
                  <button
                    onClick={pauseRecording}
                    style={{
                      'background-color': '#f59e0b',
                      color: 'white',
                      border: 'none',
                      'border-radius': '50%',
                      width: '56px',
                      height: '56px',
                      'font-size': '20px',
                      cursor: 'pointer',
                      'box-shadow': '0 4px 12px rgba(245, 158, 11, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ⏸️
                  </button>
                </Show>
                
                <Show when={isPaused()}>
                  <button
                    onClick={resumeRecording}
                    style={{
                      'background-color': '#10b981',
                      color: 'white',
                      border: 'none',
                      'border-radius': '50%',
                      width: '56px',
                      height: '56px',
                      'font-size': '20px',
                      cursor: 'pointer',
                      'box-shadow': '0 4px 12px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ▶️
                  </button>
                </Show>
                
                <button
                  onClick={stopRecording}
                  style={{
                    'background-color': '#6b7280',
                    color: 'white',
                    border: 'none',
                    'border-radius': '50%',
                    width: '56px',
                    height: '56px',
                    'font-size': '20px',
                    cursor: 'pointer',
                    'box-shadow': '0 4px 12px rgba(107, 114, 128, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ⏹️
                </button>
              </Show>
            </div>
          </div>
          
          {/* Recordings List */}
          <div style={{
            'background-color': 'var(--color-background)',
            'border-radius': '16px',
            padding: '20px',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              'font-size': '18px',
              'font-weight': 'bold',
              color: 'var(--color-text)'
            }}>
              My Recordings
            </h3>
            
            <Show 
              when={app.recordings().length > 0}
              fallback={
                <div style={{
                  'text-align': 'center',
                  padding: '40px 20px',
                  color: 'var(--color-text-secondary)'
                }}>
                  <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>🎵</div>
                  <div>{app.translate('noRecordings')}</div>
                </div>
              }
            >
              <For each={app.recordings()}>
                {(recording) => (
                  <div style={{
                    display: 'flex',
                    'align-items': 'center',
                    gap: '12px',
                    padding: '12px',
                    'background-color': 'var(--color-surface)',
                    'border-radius': '12px',
                    'margin-bottom': '8px',
                    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}>
                    {/* Play Button */}
                    <button
                      onClick={() => playRecording(recording.id)}
                      style={{
                        'background-color': playingRecording() === recording.id ? '#ef4444' : '#10b981',
                        color: 'white',
                        border: 'none',
                        'border-radius': '50%',
                        width: '40px',
                        height: '40px',
                        'font-size': '16px',
                        cursor: 'pointer',
                        'flex-shrink': '0'
                      }}
                    >
                      {playingRecording() === recording.id ? '⏸️' : '▶️'}
                    </button>
                    
                    {/* Recording Info */}
                    <div style={{ flex: '1', 'min-width': '0' }}>
                      <Show 
                        when={editingRecordingId() === recording.id}
                        fallback={
                          <div style={{
                            'font-weight': '500',
                            color: 'var(--color-text)',
                            'font-size': '14px',
                            'margin-bottom': '4px',
                            'white-space': 'nowrap',
                            overflow: 'hidden',
                            'text-overflow': 'ellipsis'
                          }}>
                            {recording.name}
                          </div>
                        }
                      >
                        <input
                          type="text"
                          value={newRecordingName()}
                          onInput={(e) => setNewRecordingName(e.currentTarget.value)}
                          style={{
                            width: '100%',
                            padding: '4px 8px',
                            border: '1px solid var(--color-border)',
                            'border-radius': '4px',
                            'font-size': '14px',
                            'margin-bottom': '4px'
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              renameRecording(recording.id, newRecordingName());
                            } else if (e.key === 'Escape') {
                              setEditingRecordingId(null);
                              setNewRecordingName('');
                            }
                          }}
                        />
                      </Show>
                      
                      <div style={{
                        'font-size': '12px',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {formatTime(recording.duration)} • {formatFileSize(recording.size)}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      'flex-shrink': '0'
                    }}>
                      <Show 
                        when={editingRecordingId() === recording.id}
                        fallback={
                          <button
                            onClick={() => {
                              setEditingRecordingId(recording.id);
                              setNewRecordingName(recording.name);
                            }}
                            style={{
                              'background-color': 'transparent',
                              color: 'var(--color-text-secondary)',
                              border: 'none',
                              'font-size': '16px',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title={app.translate('renameRecording')}
                          >
                            ✏️
                          </button>
                        }
                      >
                        <button
                          onClick={() => renameRecording(recording.id, newRecordingName())}
                          style={{
                            'background-color': 'transparent',
                            color: '#10b981',
                            border: 'none',
                            'font-size': '16px',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          ✅
                        </button>
                      </Show>
                      
                      <button
                        onClick={() => deleteRecording(recording.id)}
                        style={{
                          'background-color': 'transparent',
                          color: '#ef4444',
                          border: 'none',
                          'font-size': '16px',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title={app.translate('deleteRecording')}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>
      </Show>
      
      {/* Exchange Center */}
      <Show when={activeTab() === 'exchange'}>
        <div style={{ padding: '20px 16px' }}>
          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            'background-color': 'var(--color-background)',
            'border-radius': '12px',
            padding: '4px',
            'margin-bottom': '16px',
            gap: '2px',
            overflow: 'auto'
          }}>
            {[
              { key: 'all', label: app.translate('allPosts'), icon: '📋' },
              { key: 'requests', label: app.translate('requests'), icon: '🙋' },
              { key: 'offers', label: app.translate('offers'), icon: '🤝' },
              { key: 'my', label: app.translate('myPosts'), icon: '👤' }
            ].map((tab) => (
              <button
                onClick={() => setExchangeFilter(tab.key as any)}
                style={{
                  flex: '1',
                  padding: '10px 8px',
                  border: 'none',
                  'border-radius': '8px',
                  'background-color': exchangeFilter() === tab.key ? 'var(--color-primary)' : 'transparent',
                  color: exchangeFilter() === tab.key ? 'white' : 'var(--color-text)',
                  'font-size': '12px',
                  'font-weight': '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  'white-space': 'nowrap',
                  'text-align': 'center'
                }}
              >
                <div>{tab.icon}</div>
                <div>{tab.label}</div>
              </button>
            ))}
          </div>
          
          {/* Create Post Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            'margin-bottom': '20px'
          }}>
            <button
              onClick={() => {
                setPostType('request');
                setShowCreatePost(true);
              }}
              style={{
                flex: '1',
                padding: '12px',
                'background-color': '#3b82f6',
                color: 'white',
                border: 'none',
                'border-radius': '12px',
                'font-weight': '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🙋 {app.translate('makeRequest')}
            </button>
            <button
              onClick={() => {
                setPostType('offer');
                setShowCreatePost(true);
              }}
              style={{
                flex: '1',
                padding: '12px',
                'background-color': '#10b981',
                color: 'white',
                border: 'none',
                'border-radius': '12px',
                'font-weight': '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🤝 {app.translate('makeOffer')}
            </button>
          </div>
          
          {/* Create/Edit Post Modal */}
          <Show when={showCreatePost()}>
            <div style={{
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              'background-color': 'rgba(0, 0, 0, 0.5)',
              'z-index': '1000',
              display: 'flex',
              'align-items': 'flex-end'
            }} onClick={resetPostForm}>
              <div style={{
                'background-color': 'var(--color-background)',
                'border-radius': '20px 20px 0 0',
                width: '100%',
                'max-height': '80vh',
                overflow: 'auto',
                padding: '20px'
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                  display: 'flex',
                  'justify-content': 'space-between',
                  'align-items': 'center',
                  'margin-bottom': '20px'
                }}>
                  <h3 style={{
                    margin: '0',
                    'font-size': '18px',
                    'font-weight': 'bold'
                  }}>
                    {editingPost() ? app.translate('editPost') : app.translate('createPost')}
                  </h3>
                  <button
                    onClick={resetPostForm}
                    style={{
                      'background-color': 'transparent',
                      border: 'none',
                      'font-size': '20px',
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Post Type Selector */}
                <div style={{
                  display: 'flex',
                  'background-color': 'var(--color-surface)',
                  'border-radius': '8px',
                  padding: '4px',
                  'margin-bottom': '16px'
                }}>
                  <button
                    onClick={() => setPostType('request')}
                    style={{
                      flex: '1',
                      padding: '8px',
                      border: 'none',
                      'border-radius': '4px',
                      'background-color': postType() === 'request' ? '#3b82f6' : 'transparent',
                      color: postType() === 'request' ? 'white' : 'var(--color-text)',
                      'font-weight': '500',
                      cursor: 'pointer'
                    }}
                  >
                    🙋 {app.translate('request')}
                  </button>
                  <button
                    onClick={() => setPostType('offer')}
                    style={{
                      flex: '1',
                      padding: '8px',
                      border: 'none',
                      'border-radius': '4px',
                      'background-color': postType() === 'offer' ? '#10b981' : 'transparent',
                      color: postType() === 'offer' ? 'white' : 'var(--color-text)',
                      'font-weight': '500',
                      cursor: 'pointer'
                    }}
                  >
                    🤝 {app.translate('offer')}
                  </button>
                </div>
                
                {/* Form Fields */}
                <div style={{ 'margin-bottom': '16px' }}>
                  <label style={{
                    display: 'block',
                    'margin-bottom': '6px',
                    'font-weight': '500',
                    color: 'var(--color-text)'
                  }}>
                    {app.translate('postTitle')}
                  </label>
                  <input
                    type="text"
                    value={postTitle()}
                    onInput={(e) => setPostTitle(e.currentTarget.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--color-border)',
                      'border-radius': '8px',
                      'font-size': '16px',
                      'box-sizing': 'border-box'
                    }}
                  />
                </div>
                
                <div style={{ 'margin-bottom': '16px' }}>
                  <label style={{
                    display: 'block',
                    'margin-bottom': '6px',
                    'font-weight': '500',
                    color: 'var(--color-text)'
                  }}>
                    {app.translate('postDescription')}
                  </label>
                  <textarea
                    value={postDescription()}
                    onInput={(e) => setPostDescription(e.currentTarget.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--color-border)',
                      'border-radius': '8px',
                      'font-size': '16px',
                      'box-sizing': 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                {/* Level Selection */}
                <div style={{ 'margin-bottom': '16px' }}>
                  <select
                    value={postLevel()}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setPostLevel(value);
                      // Reset matn when level changes
                      setPostMatn('');
                    }}
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
                    <For each={levelOptions}>
                      {(option) => (
                        <option value={option.value}>
                          {option.label}
                        </option>
                      )}
                    </For>
                  </select>
                </div>

                {/* Matn Selection - Only show if level is selected and not "الجميع" */}
                <Show when={postLevel() && postLevel() !== 'all'}>
                  <div style={{ 'margin-bottom': '16px' }}>
                    <select
                      value={postMatn()}
                      onChange={(e) => setPostMatn(e.currentTarget.value)}
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
                      <For each={matnOptions()}>
                        {(option) => (
                          <option value={option.value}>
                            {option.label}
                          </option>
                        )}
                      </For>
                    </select>
                  </div>
                </Show>
                
                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  'justify-content': 'space-between'
                }}>
                  {/* Cancel Button */}
                  <button
                    onClick={resetPostForm}
                    style={{
                      flex: '1',
                      padding: '12px',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      'border-radius': '8px',
                      'font-size': '14px',
                      'font-weight': '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    }}
                  >
                    ✕ {app.translate('cancel')}
                  </button>
                  
                  {/* Save Button */}
                  <button
                    onClick={editingPost() ? updatePost : createPost}
                    disabled={!postTitle().trim() || !postDescription().trim() || !postLevel()}
                    style={{
                      flex: '2',
                      padding: '12px',
                      'background-color': (!postTitle().trim() || !postDescription().trim() || !postLevel()) 
                        ? 'var(--color-text-secondary)' 
                        : (postType() === 'offer' ? '#10b981' : '#3b82f6'),
                      color: 'white',
                      border: 'none',
                      'border-radius': '8px',
                      'font-size': '14px',
                      'font-weight': '500',
                      cursor: (!postTitle().trim() || !postDescription().trim() || !postLevel()) ? 'not-allowed' : 'pointer',
                      opacity: (!postTitle().trim() || !postDescription().trim() || !postLevel()) ? '0.5' : '1',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    💾 {editingPost() ? app.translate('editPost') : app.translate('createPost')}
                  </button>
                </div>
              </div>
            </div>
          </Show>
          
          {/* Posts List */}
          <Show 
            when={filteredPosts().length > 0}
            fallback={
              <div style={{
                'text-align': 'center',
                padding: '40px 20px',
                color: 'var(--color-text-secondary)'
              }}>
                <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>📝</div>
                <div>{app.translate('noPosts')}</div>
              </div>
            }
          >
            <For each={filteredPosts()}>
              {(post) => (
                <div style={{
                  'background-color': 'var(--color-background)',
                  'border-radius': '12px',
                  padding: '16px',
                  'margin-bottom': '12px',
                  'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: `2px solid ${post.type === 'offer' ? '#10b981' : '#3b82f6'}20`
                }}>
                  <div style={{
                    display: 'flex',
                    'justify-content': 'space-between',
                    'align-items': 'flex-start',
                    'margin-bottom': '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      'align-items': 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        'background-color': post.type === 'offer' ? '#10b981' : '#3b82f6',
                        color: 'white',
                        padding: '4px 8px',
                        'border-radius': '6px',
                        'font-size': '12px',
                        'font-weight': '500'
                      }}>
                        {post.type === 'offer' ? '🤝' : '🙋'} {app.translate(post.type)}
                      </span>
                      
                      <Show when={post.matn_name}>
                        <span style={{
                          'background-color': 'var(--color-surface)',
                          color: 'var(--color-text-secondary)',
                          padding: '4px 8px',
                          'border-radius': '6px',
                          'font-size': '12px'
                        }}>
                          📖 {post.matn_name}
                        </span>
                      </Show>
                      
                      <Show when={post.level}>
                        <span style={{
                          'background-color': 'var(--color-surface)',
                          color: 'var(--color-text-secondary)',
                          padding: '4px 8px',
                          'border-radius': '6px',
                          'font-size': '12px'
                        }}>
                          📊 {post.level}
                        </span>
                      </Show>
                    </div>
                    
                    <Show when={post.author_id === app.currentUser()?.id}>
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <button
                          onClick={() => editPost(post)}
                          style={{
                            'background-color': 'transparent',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            'font-size': '16px',
                            padding: '4px'
                          }}
                          title={app.translate('editPost')}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          style={{
                            'background-color': 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            'font-size': '16px',
                            padding: '4px'
                          }}
                          title={app.translate('deletePost')}
                        >
                          🗑️
                        </button>
                      </div>
                    </Show>
                  </div>
                  
                  <h4 style={{
                    margin: '0 0 8px 0',
                    'font-size': '16px',
                    'font-weight': 'bold',
                    color: 'var(--color-text)'
                  }}>
                    {post.title}
                  </h4>
                  
                  <p style={{
                    margin: '0 0 12px 0',
                    'font-size': '14px',
                    color: 'var(--color-text)',
                    'line-height': '1.5'
                  }}>
                    {post.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    'justify-content': 'space-between',
                    'align-items': 'center',
                    'font-size': '12px',
                    color: 'var(--color-text-secondary)'
                  }}>
                    <span>
                      {app.translate('postedBy')} {post.author_name}
                    </span>
                    <span>
                      {formatTimeAgo(post.created_at)}
                    </span>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>
      </Show>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal()}
        title={confirmModalProps().title}
        message={confirmModalProps().message}
        onConfirm={() => {
          confirmModalProps().onConfirm();
          hideConfirmation();
        }}
        onCancel={hideConfirmation}
        type={confirmModalProps().type}
      />

      {/* Error Snackbar */}
      <Show when={showSnackbar()}>
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          'background-color': 'var(--color-error)',
          color: 'white',
          padding: '12px 24px',
          'border-radius': '8px',
          'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
          'z-index': '1001',
          'font-size': '14px',
          'font-weight': '500',
          animation: 'slideUpSnackbar 0.3s ease-out'
        }}>
          {snackbarMessage()}
        </div>
      </Show>

      <style>
        {`
          @keyframes slideUpSnackbar {
            from {
              transform: translateX(-50%) translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}