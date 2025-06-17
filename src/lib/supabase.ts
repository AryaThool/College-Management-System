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

// Subject related functions
export const createSubject = async (subjectData: {
  subject_name: string;
  subject_code: string;
  department: string;
  semester: number;
  credits: number;
}) => {
  const { data, error } = await supabase
    .from('subjects')
    .insert([subjectData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSubjects = async (department?: string, semester?: number) => {
  let query = supabase.from('subjects').select('*');
  
  if (department) {
    query = query.eq('department', department);
  }
  
  if (semester) {
    query = query.eq('semester', semester);
  }

  const { data, error } = await query.order('subject_name');

  if (error) throw error;
  return data;
};

export const updateSubject = async (subjectId: string, updates: any) => {
  const { data, error } = await supabase
    .from('subjects')
    .update(updates)
    .eq('subject_id', subjectId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSubject = async (subjectId: string) => {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('subject_id', subjectId);

  if (error) throw error;
};

// Lab related functions
export const createLab = async (labData: {
  lab_name: string;
  lab_code: string;
  subject_id: string;
  department: string;
  semester: number;
  credits: number;
}) => {
  const { data, error } = await supabase
    .from('labs')
    .insert([labData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getLabs = async (department?: string, semester?: number, subjectId?: string) => {
  let query = supabase
    .from('labs')
    .select(`
      *,
      subjects (
        subject_name,
        subject_code
      )
    `);
  
  if (department) {
    query = query.eq('department', department);
  }
  
  if (semester) {
    query = query.eq('semester', semester);
  }

  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }

  const { data, error } = await query.order('lab_name');

  if (error) throw error;
  return data;
};

export const updateLab = async (labId: string, updates: any) => {
  const { data, error } = await supabase
    .from('labs')
    .update(updates)
    .eq('lab_id', labId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteLab = async (labId: string) => {
  const { error } = await supabase
    .from('labs')
    .delete()
    .eq('lab_id', labId);

  if (error) throw error;
};

// Student marks related functions
export const addStudentMark = async (markData: {
  student_id: string;
  subject_id: string;
  teacher_id: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  semester: number;
  exam_type: string;
}) => {
  const { data, error } = await supabase
    .from('student_marks')
    .insert([markData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateStudentMark = async (markId: string, updates: any) => {
  const { data, error } = await supabase
    .from('student_marks')
    .update(updates)
    .eq('mark_id', markId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getStudentMarks = async (studentId: string, semester?: number) => {
  let query = supabase
    .from('student_marks')
    .select(`
      *,
      subjects (
        subject_name,
        subject_code,
        credits
      )
    `)
    .eq('student_id', studentId);

  if (semester) {
    query = query.eq('semester', semester);
  }

  const { data, error } = await query.order('marked_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getSubjectMarks = async (subjectId: string, semester: number) => {
  const { data, error } = await supabase
    .from('student_marks')
    .select(`
      *,
      "Student Table" (
        student_name,
        student_email,
        student_department
      )
    `)
    .eq('subject_id', subjectId)
    .eq('semester', semester)
    .order('marked_date', { ascending: false });

  if (error) throw error;
  return data;
};

// Lab marks related functions
export const addLabMark = async (markData: {
  student_id: string;
  lab_id: string;
  teacher_id: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  semester: number;
}) => {
  const { data, error } = await supabase
    .from('lab_marks')
    .insert([markData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateLabMark = async (labMarkId: string, updates: any) => {
  const { data, error } = await supabase
    .from('lab_marks')
    .update(updates)
    .eq('lab_mark_id', labMarkId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getStudentLabMarks = async (studentId: string, semester?: number) => {
  let query = supabase
    .from('lab_marks')
    .select(`
      *,
      labs (
        lab_name,
        lab_code,
        credits,
        subjects (
          subject_name,
          subject_code
        )
      )
    `)
    .eq('student_id', studentId);

  if (semester) {
    query = query.eq('semester', semester);
  }

  const { data, error } = await query.order('marked_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getLabMarks = async (labId: string, semester: number) => {
  const { data, error } = await supabase
    .from('lab_marks')
    .select(`
      *,
      "Student Table" (
        student_name,
        student_email,
        student_department
      )
    `)
    .eq('lab_id', labId)
    .eq('semester', semester)
    .order('marked_date', { ascending: false });

  if (error) throw error;
  return data;
};

// Student results related functions
export const generateStudentResult = async (resultData: {
  student_id: string;
  semester: number;
  total_subjects: number;
  total_labs: number;
  subjects_passed: number;
  labs_passed: number;
  overall_percentage: number;
  cgpa: number;
  final_result: string;
  generated_by: string;
}) => {
  const { data, error } = await supabase
    .from('student_results')
    .insert([resultData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getStudentResults = async (studentId: string, semester?: number) => {
  let query = supabase
    .from('student_results')
    .select('*')
    .eq('student_id', studentId);

  if (semester) {
    query = query.eq('semester', semester);
  }

  const { data, error } = await query.order('generated_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateStudentResult = async (resultId: string, updates: any) => {
  const { data, error } = await supabase
    .from('student_results')
    .update(updates)
    .eq('result_id', resultId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Utility functions
export const calculateGrade = (marks: number): string => {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B+';
  if (marks >= 60) return 'B';
  if (marks >= 50) return 'C+';
  if (marks >= 40) return 'C';
  if (marks >= 35) return 'D';
  return 'F';
};

export const calculateCGPA = (marks: any[]): number => {
  if (!marks.length) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  marks.forEach(mark => {
    const gradePoints = getGradePoints(mark.grade);
    const credits = mark.subjects?.credits || mark.labs?.credits || 1;
    totalPoints += gradePoints * credits;
    totalCredits += credits;
  });
  
  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
};

export const getGradePoints = (grade: string): number => {
  const gradeMap: { [key: string]: number } = {
    'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0
  };
  return gradeMap[grade] || 0;
};

export const getAllStudents = async (department?: string) => {
  let query = supabase
    .from('Student Table')
    .select('student_id, student_name, student_email, student_department');

  if (department) {
    query = query.eq('student_department', department);
  }

  const { data, error } = await query.order('student_name');

  if (error) throw error;
  return data;
};