import { ColumnDef } from '@tanstack/react-table';

// Common interfaces used across features

// ===== TABLE COMPONENTS =====
export interface AdminTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
}

export interface ProductTableParams<TData, TValue> {
  searchParams: {
    page?: string;
    per_page?: string;
    sort?: string;
    filters?: string;
  };
}

// ===== CELL ACTION COMPONENTS =====
export interface CellActionProps<T = any> {
  data: T;
  showStatisticsAction?: boolean;
}

// ===== USER FEATURES =====
export interface UserInfo {
  id: string;
  ic_number: string;
  email: string | null;
  name: string;
  avatar_url: string | null;
  school_id: string;
  school_name: string;
  registration_status: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  file_key: string;
  url: string;
  thumb_url: string;
  thumbnail: string;
  assistant_id: string;
  file_id: string;
  vector_store_id: string;
  language: string;
  genres: string[];
  author: string | null;
  pages: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingStatistics {
  total_read_books_count: number;
  malay_read_books_count: number;
  english_read_books_count: number;
  mandarin_read_books_count: number;
  total_reading_duration: number;
  read_books_list: Book[];
  last_book_read_timestamp: string | null;
  language_breakdown: {
    [key: string]: number;
  };
}

export interface UserStatisticsData {
  user_info: UserInfo;
  reading_statistics: ReadingStatistics;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

export interface UserListingPageProps {
  showRegisteredOnly?: boolean;
}

// ===== AUTH FEATURES =====
export interface FormState {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// ===== PROFILE FEATURES =====
export interface ProfileFormType {
  name: string;
  email: string;
  role: string;
  school_id: string;
}

// ===== KANBAN FEATURES =====
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export interface TaskDragData {
  type: 'task';
  task: Task;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface ColumnDragData {
  type: 'column';
  column: Column;
}

export interface BoardColumnProps {
  column: Column;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (columnId: string) => void;
}

// ===== LEADERBOARD FEATURES =====
export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
  avatar?: string;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  perPage: number;
}

export interface School {
  id: string;
  name: string;
  state: string;
  city: string;
  totalScore: number;
  studentCount: number;
}

// ===== DASHBOARD STATISTICS =====
export interface DashboardStats {
  totalSchools: number;
  totalBooks: number;
  totalAdmins: number;
  totalStudents: number;
}

export interface SchoolsResponse {
  success: boolean;
  data: {
    schools: Array<{
      id: string;
      name: string;
      state: string;
      city: string;
      status: string;
      students_count: number;
      created_at: string;
      updated_at: string;
    }>;
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
  message: string;
  error: string | null;
}

export interface BooksResponse {
  success: boolean;
  data: {
    books: Book[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
  message: string;
  error: string | null;
}

export interface AdminsResponse {
  success: boolean;
  data: {
    admins: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      school_id: string;
      status: string;
      created_at: string;
      updated_at: string;
    }>;
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
  message: string;
  error: string | null;
}

export interface StudentsResponse {
  success: boolean;
  data: {
    users: UserInfo[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
  message: string;
  error: string | null;
}
