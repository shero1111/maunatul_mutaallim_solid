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
export type Page = 'home' | 'mutuun' | 'halaqat' | 'users' | 'news' | 'more';