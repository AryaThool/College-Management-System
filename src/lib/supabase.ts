import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhpmwdisiwgojiuakuou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocG13ZGlzaXdnb2ppdWFrdW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NTI5NDcsImV4cCI6MjA2NDMyODk0N30.0L1HSCsXOpP55Q2jQ2GUw9k_deg1eKGDheHKZFW2kgY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Student related functions
export const registerStudent = async (student: {
  student_name: string;
  student_email: string;
  student_department: string;
  student_password: string;
}) => {
  const { data, error } = await supabase
    .from('Student Table')
    .insert([
      {
        student_name: student.student_name,
        student_email: student.student_email,
        student_department: student.student_department,
        student_password: student.student_password,
      },
    ]);

  if (error) throw error;
  return data;
};

export const loginStudent = async (email: string, password: string) => {
  const { data, error } = await supabase
    .from('Student Table')
    .select('*')
    .eq('student_email', email)
    .eq('student_password', password)
    .single();

  if (error) throw error;
  return data;
};

// Teacher related functions
export const registerTeacher = async (teacher: {
  teacher_name: string;
  teacher_email: string;
  teacher_department: string;
  teacher_designation: string;
  teacher_password: string;
}) => {
  const { data, error } = await supabase
    .from('Teacher Table')
    .insert([
      {
        teacher_name: teacher.teacher_name,
        teacher_email: teacher.teacher_email,
        teacher_department: teacher.teacher_department,
        teacher_designation: teacher.teacher_designation,
        teacher_password: teacher.teacher_password,
      },
    ]);

  if (error) throw error;
  return data;
};

export const loginTeacher = async (email: string, password: string) => {
  const { data, error } = await supabase
    .from('Teacher Table')
    .select('*')
    .eq('teacher_email', email)
    .eq('teacher_password', password)
    .single();

  if (error) throw error;
  return data;
};

// Class related functions
export const createClass = async (classData: {
  class_name: string;
  semester: number;
  teacher_id: string;
}) => {
  const { data, error } = await supabase
    .from('classes')
    .insert([classData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteClass = async (classId: string) => {
  // First delete all related records in other tables
  await Promise.all([
    // Delete attendance records
    supabase.from('attendance').delete().eq('class_id', classId),
    // Delete student-class relationships
    supabase.from('student_classes').delete().eq('class_id', classId),
  ]);

  // Then delete the class itself
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('class_id', classId);

  if (error) throw error;
};

export const getTeacherClasses = async (teacherId: string) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId);

  if (error) throw error;
  return data;
};

export const getStudentClasses = async (studentId: string) => {
  const { data, error } = await supabase
    .from('student_classes')
    .select(`
      class_id,
      classes (
        class_id,
        class_name,
        semester,
        teacher_id,
        "Teacher Table" (
          teacher_id,
          teacher_name
        )
      )
    `)
    .eq('student_id', studentId);

  if (error) throw error;
  return data?.map(item => item.classes) || [];
};

// Attendance related functions
export const markAttendance = async (attendanceData: {
  class_id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  marked_by: string;
}) => {
  const { data, error } = await supabase
    .from('attendance')
    .insert([attendanceData])
    .select();

  if (error) throw error;
  return data;
};

export const getStudentAttendance = async (studentId: string, classId?: string) => {
  let query = supabase
    .from('attendance')
    .select(`
      *,
      classes (
        class_name,
        "Teacher Table" (
          teacher_id,
          teacher_name
        )
      )
    `)
    .eq('student_id', studentId);

  if (classId) {
    query = query.eq('class_id', classId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getClassStudents = async (classId: string) => {
  const { data, error } = await supabase
    .from('student_classes')
    .select(`
      "Student Table" (
        student_id,
        student_name,
        student_email,
        student_department
      )
    `)
    .eq('class_id', classId);

  if (error) throw error;
  return data?.map(item => item['Student Table']) || [];
};