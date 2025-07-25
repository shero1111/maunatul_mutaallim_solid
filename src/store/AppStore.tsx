import { createContext, useContext, createSignal, createMemo, JSX, onMount, onCleanup } from 'solid-js';
import { User, Student, Teacher, Halaqa, Matn, NewsItem, Theme, Language, Page, AudioPlayerState, TimerState } from '../types';
import { demoUsers, demoHalaqat, demoMutun, demoNews, generatePersonalMutun } from '../data/demo-data';
import { themeColors, setCSSVariables } from '../styles/themes';
import { translations } from '../i18n/translations';

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
  
  // Timer
  timer: () => TimerState;
  
  // Search
  searchTerm: () => string;
  
  // Actions
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setCurrentPage: (page: Page) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  updateMatn: (matn: Matn) => void;
  updateUser: (user: User) => void;
  playAudio: (matnId: string, title: string, audioUrl: string) => void;
  pauseAudio: () => void;
  stopAudio: () => void;
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
  const [language, setLanguage] = createSignal<Language>('ar');
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
    
    if (savedTheme) {
      setTheme(savedTheme);
      setCSSVariables(savedTheme);
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    // AUTO LOGIN - User bleibt angemeldet
    if (savedCurrentUser) {
      try {
        const user = JSON.parse(savedCurrentUser);
        setCurrentUser(user);
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('currentUser');
      }
    }
    
    // Load saved data
    if (savedMutunData) {
      try {
        const mutunData = JSON.parse(savedMutunData);
        setMutun(mutunData);
      } catch (e) {
        console.error('Error parsing saved mutun:', e);
      }
    }
    
    if (savedUsersData) {
      try {
        const usersData = JSON.parse(savedUsersData);
        setUsers(usersData);
      } catch (e) {
        console.error('Error parsing saved users:', e);
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
    console.log('🔐 Login attempt:', { username, password });
    console.log('🧑‍💼 Available users:', users().map(u => ({ username: u.username, password: u.password, role: u.role })));
    
    const user = users().find(u => u.username === username && u.password === password);
    console.log('👤 Found user:', user);
    
    if (user) {
      setCurrentUser(user);
      
      // Generate personal mutun for all users (not just students)
      const personalMutun = generatePersonalMutun(user.id);
      const newMutunData = [...mutun().filter(m => m.user_id !== user.id), ...personalMutun];
      setMutun(newMutunData);
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('mutunData', JSON.stringify(newMutunData));
      localStorage.setItem('usersData', JSON.stringify(users()));
      localStorage.setItem('newsData', JSON.stringify(news()));
      
      console.log('✅ Login successful');
      return true;
    }
    console.log('❌ Login failed - user not found');
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
  
  const updateMatn = (updatedMatn: Matn) => {
    const newMutunData = mutun().map(m => m.id === updatedMatn.id ? updatedMatn : m);
    setMutun(newMutunData);
    
    // Save to localStorage
    localStorage.setItem('mutunData', JSON.stringify(newMutunData));
  };
  
  const updateUser = (updatedUser: User) => {
    const newUsersData = users().map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(newUsersData);
    if (currentUser()?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    // Save to localStorage  
    localStorage.setItem('usersData', JSON.stringify(newUsersData));
  };
  
  const playAudio = (matnId: string, title: string, audioUrl: string) => {
    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
    }
    
    audioElement = new Audio(audioUrl);
    
    setAudioPlayer({
      title,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: true,
      matnId
    });
    
    audioElement.addEventListener('loadedmetadata', () => {
      setAudioPlayer(prev => ({
        ...prev,
        duration: audioElement?.duration || 0,
        isLoading: false
      }));
    });
    
    audioElement.addEventListener('timeupdate', () => {
      setAudioPlayer(prev => ({
        ...prev,
        currentTime: audioElement?.currentTime || 0
      }));
    });
    
    audioElement.addEventListener('ended', () => {
      setAudioPlayer(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0
      }));
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
    setAudioPlayer({
      title: '',
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
      matnId: ''
    });
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
    timer,
    searchTerm,
    login,
    logout,
    setCurrentPage,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
      setCSSVariables(newTheme);
    },
    setLanguage,
    updateMatn,
    updateUser,
    playAudio,
    pauseAudio,
    stopAudio,
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