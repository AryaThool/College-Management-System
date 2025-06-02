export interface Student {
  student_id: string;
  student_name: string;
  student_email: string;
  student_department: string;
  student_password?: string;
}

export interface Teacher {
  teacher_id: string;
  teacher_name: string;
  teacher_email: string;
  teacher_department: string;
  teacher_designation: string;
  teacher_password?: string;
}

export type UserRole = 'student' | 'teacher';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  designation?: string;
}