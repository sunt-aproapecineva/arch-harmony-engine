export type Tariff = 'student' | 'designer' | 'arhitect';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  tariff: Tariff;
  created_at: string;
  country?: string;
  city?: string;
  last_login?: string;
}

export interface MockUser extends User {
  password_hash: string;
}

export interface WhitelistEntry {
  email: string;
  tariff: Tariff;
}

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  order_index: number;
  etapa: string;
  saptamana: string;
  unlockDate?: string;
  lessons: Lesson[];
  exercises: Exercise[];
  deliverable: string;
}

export interface LessonDocument {
  title: string;
  description: string;
  url: string;
  docNumber: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string;
  pdf_url?: string;
  duration_min: number;
  order_index: number;
  is_published: boolean;
  type?: 'video' | 'exercise';
  exercise_id?: string;
  documents?: LessonDocument[];
}

export interface Exercise {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
}

export interface Progress {
  user_id: string;
  lesson_id: string;
  completed_at: string;
}
