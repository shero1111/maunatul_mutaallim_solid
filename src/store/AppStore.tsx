import { createContext, useContext, createSignal, createMemo, JSX, onMount, onCleanup } from 'solid-js';
import { User, Student, Teacher, Halaqa, Matn, NewsItem, Theme, Language, Page, AudioPlayerState, TimerState } from '../types';
import { demoUsers, demoHalaqat, demoMutun, demoNews, generatePersonalMutun } from '../data/demo-data';
import { themeColors, setCSSVariables } from '../styles/themes';
import { translations } from '../i18n/translations';

// Audio Progress Interface
interface AudioProgress {
  [key: string]: {
    memorization?: number;  // Progress in seconds for memorization audio
    explanation?: number;   // Progress in seconds for explanation audio
  };
}

export interface AppState {
  // Authentication
  currentUser: () => User | null;
  isAuthenticated: () => boolean;
  
  // UI State
  currentPage: () => Page;
  theme: () => Theme;
  language: () => Language;
  
  // Data
  users: () => User[];
  halaqat: () => Halaqa[];
  mutun: () => Matn[];
  news: () => NewsItem[];
  
  // Audio Player
  audioPlayer: () => AudioPlayerState;
  audioProgress: () => AudioProgress;
  
  // Timer
  timer: () => TimerState;
  
  // Search
  searchTerm: () => string;
  
  // Actions
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  setCurrentUser: (user: User | null) => void;
  setCurrentPage: (page: Page) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  updateMatn: (matn: Matn) => void;
  updateUser: (user: User) => void;
  playAudio: (matnId: string, title: string, audioUrl: string, audioType: 'memorization' | 'explanation') => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  skipBackward: () => void;
  skipForward: () => void;
  seekAudio: (percentage: number) => void;
  startTimer: (minutes: number) => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setSearchTerm: (term: string) => void;
  translate: (key: string) => string;
}

const AppContext = createContext<AppState>();

export function AppProvider(props: { children: JSX.Element }) {
  // Signals for reactive state
  const [currentUser, setCurrentUser] = createSignal<User | null>(null);
  const [currentPage, setCurrentPage] = createSignal<Page>('home');
  const [theme, setTheme] = createSignal<Theme>('light');
  const [language, setLanguageSignal] = createSignal<Language>('ar');
  const [isInitializing, setIsInitializing] = createSignal(true);
  const [users, setUsers] = createSignal<User[]>(demoUsers);
  const [halaqat, setHalaqat] = createSignal<Halaqa[]>(demoHalaqat);
  const [mutun, setMutun] = createSignal<Matn[]>(demoMutun);
  const [news, setNews] = createSignal<NewsItem[]>(demoNews);
  const [searchTerm, setSearchTerm] = createSignal('');
  
  // Audio Player State
  const [audioPlayer, setAudioPlayer] = createSignal<AudioPlayerState>({
    title: '',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    matnId: ''
  });
  
  // Current audio type tracking
  let currentAudioType: 'memorization' | 'explanation' | null = null;
  
  // Audio Progress State
  const [audioProgress, setAudioProgress] = createSignal<AudioProgress>({});
  
  // Timer State
  const [timer, setTimer] = createSignal<TimerState>({
    time: 0,
    isRunning: false,
    targetTime: 0
  });
  
  // Audio element reference
  let audioElement: HTMLAudioElement | null = null;
  let timerInterval: number | null = null;
  
  // Computed values
  const isAuthenticated = createMemo(() => currentUser() !== null);
  
  // Theme initialization
  onMount(() => {
    setCSSVariables(theme());
    
    // Load from localStorage if available
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLanguage = localStorage.getItem('language') as Language;
    const savedCurrentUser = localStorage.getItem('currentUser');
    const savedMutunData = localStorage.getItem('mutunData');
    const savedUsersData = localStorage.getItem('usersData');
    const savedNewsData = localStorage.getItem('newsData');
    const savedCurrentPage = localStorage.getItem('currentPage') as Page;
    const savedAudioProgress = localStorage.getItem('audioProgress');
    
    if (savedTheme) {
      setTheme(savedTheme);
      setCSSVariables(savedTheme);
    }
    if (savedLanguage) {
      // During initialization, set the language signal directly (not through store function)
      setLanguageSignal(savedLanguage);
      console.log('🌐 Language restored from localStorage:', savedLanguage);
    }
    if (savedCurrentPage) {
      setCurrentPage(savedCurrentPage);
      console.log('🔄 Restored last page:', savedCurrentPage);
    }
    
    // Load audio progress
    if (savedAudioProgress) {
      try {
        const progress = JSON.parse(savedAudioProgress);
        setAudioProgress(progress);
        console.log('🎵 Audio progress loaded:', Object.keys(progress).length, 'items');
      } catch (e) {
        console.error('Error parsing saved audio progress:', e);
      }
    }
    
    // Load saved data FIRST
    let loadedUsers = users();
    if (savedUsersData) {
      try {
        const usersData = JSON.parse(savedUsersData);
        setUsers(usersData);
        loadedUsers = usersData;
        console.log('📋 Users loaded from localStorage:', usersData.length, 'users');
      } catch (e) {
        console.error('Error parsing saved users:', e);
      }
    }
    
    if (savedMutunData) {
      try {
        const mutunData = JSON.parse(savedMutunData);
        setMutun(mutunData);
      } catch (e) {
        console.error('Error parsing saved mutun:', e);
      }
    }
    
    // AUTO LOGIN - User bleibt angemeldet (AFTER loading users data)
    if (savedCurrentUser) {
      try {
        const user = JSON.parse(savedCurrentUser);
        console.log('🔄 Auto-login attempt for user:', user.name, 'role:', user.role);
        
        // Verify user exists in either loaded users data OR demo data
        const userExistsInLoaded = loadedUsers.find(u => u.id === user.id && u.username === user.username);
        const userExistsInDemo = demoUsers.find(u => u.id === user.id && u.username === user.username);
        
        if (userExistsInLoaded || userExistsInDemo) {
          setCurrentUser(user);
          console.log('✅ Auto-login successful for:', user.name, 'role:', user.role);
        } else {
          console.warn('⚠️ Saved user no longer exists in loaded or demo data, clearing localStorage');
          console.log('📋 Available users:', loadedUsers.map(u => `${u.username} (${u.role})`));
          localStorage.removeItem('currentUser');
        }
      } catch (e) {
        console.error('💥 Error parsing saved user:', e);
        localStorage.removeItem('currentUser');
      }
    }
    
    if (savedNewsData) {
      try {
        const newsData = JSON.parse(savedNewsData);
        setNews(newsData);
      } catch (e) {
        console.error('Error parsing saved news:', e);
      }
    }
    
    // Initialization complete
    setIsInitializing(false);
    console.log('✅ App initialization complete');
  });
  
  // Theme watcher
  onMount(() => {
    const unsubscribe = createMemo(() => {
      setCSSVariables(theme());
      localStorage.setItem('theme', theme());
    });
    
    onCleanup(() => {
      if (typeof unsubscribe === 'function') unsubscribe();
    });
  });
  
  // Language watcher
  onMount(() => {
    const unsubscribe = createMemo(() => {
      localStorage.setItem('language', language());
    });
    
    onCleanup(() => {
      if (typeof unsubscribe === 'function') unsubscribe();
    });
  });
  
  // Timer cleanup
  onCleanup(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    if (audioElement) {
      audioElement.pause();
      audioElement = null;
    }
  });
  
  // Actions
  const login = (username: string, password: string): boolean => {
    console.log('🔑 AppStore.login called with:', { username, password });
    
    // HARDCODED ADMIN FALLBACK - GUARANTEED TO WORK
    if ((username === 'admin' || username.trim().toLowerCase() === 'admin') && 
        (password === 'test' || password.trim() === 'test')) {
      console.log('🚨 HARDCODED ADMIN LOGIN ACTIVATED');
      const adminUser = {
        id: 'admin',
        username: 'admin',
        password: 'test',
        role: 'superuser' as const,
        name: 'Administrator',
        isActive: true,
        created_at: '2024-01-01',
        lastPage: 'home' as const
      };
      
      setCurrentUser(adminUser);
      console.log('✅ HARDCODED ADMIN SET - current user:', currentUser()?.name || 'NULL');
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      console.log('💾 Hardcoded admin saved to localStorage');
      
      return true;
    }
    
    // FORCE INITIALIZE DEMO USERS - CRITICAL FIX
    console.log('💾 Current users in store:', users().length);
    const currentUsers = users().length > 0 ? users() : demoUsers;
    
    if (users().length === 0) {
      console.log('⚠️ No users loaded, forcing demo users...');
      setUsers(demoUsers);
      setHalaqat(demoHalaqat);
      setMutun(demoMutun);
      setNews(demoNews);
    }
    
    console.log('👥 Available users:', currentUsers.map(u => ({ username: u.username, role: u.role, password: u.password })));
    
    // SIMPLIFIED CREDENTIAL CHECK - NO CASE CONVERSION
    console.log('🔍 Looking for user with exact match:', { username, password });
    
    // DIRECT MATCH WITHOUT TRIMMING/LOWERCASING
    let foundUser = null;
    for (let i = 0; i < currentUsers.length; i++) {
      const u = currentUsers[i];
      console.log(`🎯 [${i}] Checking user: "${u.username}" vs "${username}" | "${u.password}" vs "${password}"`);
      
      // EXACT STRING MATCH
      if (u.username === username && u.password === password) {
        foundUser = u;
        console.log('✅ EXACT MATCH FOUND:', u.name, '(role:', u.role, ')');
        break;
      }
    }
    
    // FALLBACK: Try with trimmed values
    if (!foundUser) {
      console.log('❓ No exact match, trying trimmed values...');
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      
      for (let i = 0; i < currentUsers.length; i++) {
        const u = currentUsers[i];
        const userTrimmed = u.username.trim();
        const passTrimmed = u.password.trim();
        
        console.log(`🎯 [${i}] Trimmed check: "${userTrimmed}" vs "${trimmedUsername}" | "${passTrimmed}" vs "${trimmedPassword}"`);
        
        if (userTrimmed === trimmedUsername && passTrimmed === trimmedPassword) {
          foundUser = u;
          console.log('✅ TRIMMED MATCH FOUND:', u.name, '(role:', u.role, ')');
          break;
        }
      }
    }
    
    // FALLBACK 2: Try with lowercase
    if (!foundUser) {
      console.log('❓ No trimmed match, trying lowercase...');
      const lowerUsername = username.toLowerCase().trim();
      const lowerPassword = password.trim();
      
      for (let i = 0; i < currentUsers.length; i++) {
        const u = currentUsers[i];
        const userLower = u.username.toLowerCase().trim();
        const passLower = u.password.trim();
        
        console.log(`🎯 [${i}] Lowercase check: "${userLower}" vs "${lowerUsername}" | "${passLower}" vs "${lowerPassword}"`);
        
        if (userLower === lowerUsername && passLower === lowerPassword) {
          foundUser = u;
          console.log('✅ LOWERCASE MATCH FOUND:', u.name, '(role:', u.role, ')');
          break;
        }
      }
    }
    
    console.log('🎯 Final found user:', foundUser ? `${foundUser.name} (${foundUser.role})` : 'NONE');
    
    if (foundUser) {
      console.log('✅ BEFORE setCurrentUser - current user:', currentUser()?.name || 'NULL');
      
      // FORCE SET USER WITH VERIFICATION
      setCurrentUser(foundUser);
      
      // IMMEDIATE VERIFICATION
      const verifyUser = currentUser();
      console.log('✅ IMMEDIATE VERIFY - current user:', verifyUser?.name || 'NULL');
      console.log('✅ IMMEDIATE VERIFY - isAuthenticated:', verifyUser !== null);
      
      // Generate personal mutun for all users (not just students)
      const personalMutun = generatePersonalMutun(foundUser.id);
      const newMutunData = [...mutun().filter(m => m.user_id !== foundUser.id), ...personalMutun];
      setMutun(newMutunData);
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      localStorage.setItem('mutunData', JSON.stringify(newMutunData));
      localStorage.setItem('usersData', JSON.stringify(currentUsers));
      localStorage.setItem('newsData', JSON.stringify(news()));
      
      console.log('💾 User saved to localStorage');
      
      // FINAL VERIFICATION
      setTimeout(() => {
        const finalUser = currentUser();
        console.log('🔄 FINAL CHECK - currentUser:', finalUser?.name || 'NULL');
        console.log('🔄 FINAL CHECK - isAuthenticated:', finalUser !== null);
      }, 50);
      
      return true;
    }
    
    console.log('❌ Login failed - no matching user');
    console.log('📋 All users for comparison:');
    currentUsers.forEach((u, i) => {
      console.log(`  [${i}] "${u.username}" / "${u.password}" (${u.role})`);
    });
    return false;
  };
  
  const logout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
    if (audioElement) {
      audioElement.pause();
      audioElement = null;
    }
    setAudioPlayer({
      title: '',
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
      matnId: ''
    });
    
    // Remove from localStorage
    localStorage.removeItem('currentUser');
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    console.log('🔑 Password change attempt');
    
    const user = currentUser();
    if (!user) {
      console.error('❌ No user logged in');
      return false;
    }

    // Verify current password
    if (user.password !== currentPassword) {
      console.error('❌ Current password incorrect');
      return false;
    }

    try {
      // Update user's password
      const updatedUser = { ...user, password: newPassword };
      
      // Update in users array
      const updatedUsers = users().map(u => 
        u.id === user.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      
      // Update current user
      setCurrentUser(updatedUser);
      
      // Save to localStorage
      localStorage.setItem('usersData', JSON.stringify(updatedUsers));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      console.log('✅ Password changed successfully');
      return true;
    } catch (error) {
      console.error('💥 Error changing password:', error);
      return false;
    }
  };
  
  const updateMatn = (updatedMatn: Matn) => {
    const newMutunData = mutun().map(m => m.id === updatedMatn.id ? updatedMatn : m);
    setMutun(newMutunData);
    
    // Save to localStorage
    localStorage.setItem('mutunData', JSON.stringify(newMutunData));
  };
  
  const updateUser = (updatedUser: User) => {
    console.log('📝 AppStore.updateUser called with:', updatedUser);
    const currentUsers = users();
    console.log('📋 Current users before update:', currentUsers);
    
    const newUsersData = currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    console.log('🔄 New users data:', newUsersData);
    
    setUsers(newUsersData);
    
    if (currentUser()?.id === updatedUser.id) {
      console.log('👤 Updating current user as well');
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    // Save to localStorage  
    localStorage.setItem('usersData', JSON.stringify(newUsersData));
    console.log('💾 Saved to localStorage');
  };
  
  const playAudio = (matnId: string, title: string, audioUrl: string, audioType: 'memorization' | 'explanation') => {
    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
    }
    
    // Store current audio type
    currentAudioType = audioType;
    
    // Get saved progress for this audio
    const savedProgress = audioProgress()[matnId]?.[audioType] || 0;
    console.log(`🎵 Loading audio: ${title}, Progress: ${savedProgress}s`);
    
    audioElement = new Audio(audioUrl);
    
    setAudioPlayer({
      title,
      isPlaying: false,
      currentTime: savedProgress,
      duration: 0,
      isLoading: true,
      matnId
    });
    
    // Critical: Set progress AFTER canplay event to ensure audio is ready
    audioElement.addEventListener('canplay', () => {
      if (savedProgress > 0 && audioElement && audioElement.duration > savedProgress) {
        audioElement.currentTime = savedProgress;
        console.log(`⏭️ Resumed at: ${savedProgress}s`);
      }
    }, { once: true });
    
    audioElement.addEventListener('loadedmetadata', () => {
      setAudioPlayer(prev => ({
        ...prev,
        duration: audioElement?.duration || 0,
        currentTime: savedProgress,
        isLoading: false
      }));
    });
    
    audioElement.addEventListener('timeupdate', () => {
      const currentTime = audioElement?.currentTime || 0;
      
      setAudioPlayer(prev => ({
        ...prev,
        currentTime
      }));
      
      // Save progress every second (only if we have a valid audio type)
      if (currentAudioType && currentTime > 0) {
        setAudioProgress(prev => {
          const newProgress = {
            ...prev,
            [matnId]: {
              ...prev[matnId],
              [currentAudioType]: currentTime
            }
          };
          
          // Save to localStorage
          localStorage.setItem('audioProgress', JSON.stringify(newProgress));
          
          return newProgress;
        });
      }
    });
    
    audioElement.addEventListener('ended', () => {
      setAudioPlayer(prev => ({
        ...prev,
        isPlaying: false
      }));
      
      // Reset progress when audio ends (only if we have a valid audio type)
      if (currentAudioType) {
        setAudioProgress(prev => {
          const newProgress = {
            ...prev,
            [matnId]: {
              ...prev[matnId],
              [currentAudioType]: 0
            }
          };
          
          localStorage.setItem('audioProgress', JSON.stringify(newProgress));
          return newProgress;
        });
      }
    });
    
    audioElement.play().then(() => {
      setAudioPlayer(prev => ({
        ...prev,
        isPlaying: true
      }));
    });
  };
  
  const pauseAudio = () => {
    if (audioElement) {
      if (audioPlayer().isPlaying) {
        audioElement.pause();
        setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
      } else {
        audioElement.play();
        setAudioPlayer(prev => ({ ...prev, isPlaying: true }));
      }
    }
  };
  
  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    currentAudioType = null; // Reset current audio type
    setAudioPlayer({
      title: '',
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
      matnId: ''
    });
  };

  const skipBackward = () => {
    if (audioElement) {
      audioElement.currentTime = Math.max(0, audioElement.currentTime - 5);
    }
  };

  const skipForward = () => {
    if (audioElement) {
      audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + 5);
    }
  };

  const seekAudio = (percentage: number) => {
    if (audioElement) {
      audioElement.currentTime = audioElement.duration * percentage;
    }
  };
  
  const startTimer = (minutes: number) => {
    const targetTime = minutes * 60;
    setTimer({
      time: targetTime,
      isRunning: true,
      startTime: Date.now(),
      targetTime
    });
    
    timerInterval = setInterval(() => {
      setTimer(prev => {
        if (!prev.isRunning) return prev;
        
        const elapsed = Math.floor((Date.now() - (prev.startTime || 0)) / 1000);
        const remaining = Math.max(0, prev.targetTime - elapsed);
        
        if (remaining === 0) {
          clearInterval(timerInterval!);
          return { ...prev, time: 0, isRunning: false };
        }
        
        return { ...prev, time: remaining };
      });
    }, 1000);
  };
  
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    setTimer(prev => ({ ...prev, isRunning: false }));
  };
  
  const resetTimer = () => {
    stopTimer();
    setTimer({
      time: 0,
      isRunning: false,
      targetTime: 0
    });
  };
  
  const translate = (key: string): string => {
    return translations[language()][key as keyof typeof translations.ar] || key;
  };
  
  // Store value
  const store: AppState = {
    currentUser,
    isAuthenticated,
    currentPage,
    theme,
    language,
    users,
    halaqat,
    mutun,
    news,
    audioPlayer,
    audioProgress,
    timer,
    searchTerm,
    login,
    logout,
    changePassword,
    setCurrentUser,
    setCurrentPage: (page: Page) => {
      setCurrentPage(page);
      localStorage.setItem('currentPage', page);
      console.log('📍 Page saved to localStorage:', page);
    },
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
      setCSSVariables(newTheme);
      localStorage.setItem('theme', newTheme);
    },
    setLanguage: (newLanguage: Language) => {
      console.log('🌐 Language change from', language(), 'to', newLanguage);
      setLanguageSignal(newLanguage);
      
      // Save to localStorage
      localStorage.setItem('language', newLanguage);
      console.log('💾 Language saved to localStorage:', newLanguage);
      
      // Only reload if not during initialization
      if (!isInitializing()) {
        console.log('🔄 Refreshing page for complete language update...');
        window.location.reload();
      } else {
        console.log('🚫 Skipping reload during initialization');
      }
    },
    updateMatn,
    updateUser,
    playAudio,
    pauseAudio,
    stopAudio,
    skipBackward,
    skipForward,
    seekAudio,
    startTimer,
    stopTimer,
    resetTimer,
    setSearchTerm,
    translate
  };
  
  return (
    <AppContext.Provider value={store}>
      {props.children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}