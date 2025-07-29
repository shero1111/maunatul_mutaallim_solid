// Types and Interfaces for Maunatul Mutaallim Solid App

export interface User {
  id: string;
  username: string;
  name: string;
  password: string;
  role: 'superuser' | 'leitung' | 'lehrer' | 'student';
  isActive: boolean;
  created_at: string;
  lastPage?: string;
  lastNewsRead?: string; // Timestamp of last news read
}

export interface Student extends User {
  role: 'student';
  status: 'not_available' | 'revising' | 'khatamat';
  status_changed_at: string;
  halaqat_ids: string[];
  favorites: string[];
  attendance?: AttendanceRecord[];
}

export interface Teacher extends User {
  role: 'lehrer';
  halaqat_ids: string[];
  favorites: string[];
}

export interface AttendanceRecord {
  halaqaId: string;
  attended: boolean;
  date: string;
}

export interface Matn {
  id: string;
  name: string;
  section: string;
  status: 'red' | 'orange' | 'green';
  created_at?: string;
  lastChange_date?: string;
  user_id: string;
  threshold: number;
  description?: string;
  memorization_pdf_link?: string;
  memorization_audio_link?: string;
  explanation_pdf_link?: string;
  explanation_audio_link?: string;
  audio_link?: string;
  days_since_last_revision?: number;
}

export interface Halaqa {
  id: string;
  name: string;
  type: 'memorizing' | 'explanation' | 'memorizing_intensive' | 'explanation_intensive';
  teacher_id: string;
  student_ids: string[];
  internal_number: number;
  isActive: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  publish_date: string; // Date when news should be published
  author_id: string;
}

export interface AudioPlayerState {
  title: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  matnId: string;
}

export interface TimerState {
  time: number;
  isRunning: boolean;
  startTime?: number;
  targetTime: number;
}

export type Theme = 'light' | 'dark';
export type Language = 'ar' | 'en';
export type Page = 'home' | 'mutuun' | 'reciting' | 'halaqat' | 'users' | 'news' | 'more' | 'about-us';

// Audio Recording Interface
export interface AudioRecording {
  id: string;
  name: string;
  url: string;
  duration: number; // in seconds
  created_at: string;
  user_id: string;
  size: number; // in bytes
}

// Exchange Post Interface
export interface ExchangePost {
  id: string;
  type: 'offer' | 'request'; // Angebot oder Nachfrage
  title: string;
  description: string;
  matn_name?: string; // Optional specific Matn
  level?: string; // Optional specific level
  author_id: string;
  author_name: string;
  created_at: string;
  is_active: boolean;
}

// Chat System Interfaces
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface ChatConversation {
  id: string;
  participant1_id: string;
  participant1_name: string;
  participant2_id: string;
  participant2_name: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
}