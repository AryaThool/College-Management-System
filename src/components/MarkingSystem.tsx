import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, BookOpen, FlaskConical, Users, Calculator, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  createLab,
  getLabs,
  updateLab,
  deleteLab,
  getAllStudents,
  addStudentMark,
  addLabMark,
  getSubjectMarks,
  getLabMarks,
  calculateGrade,
  updateStudentMark,
  updateLabMark
} from '../lib/supabase';

interface Subject {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  department: string;
  semester: number;
  credits: number;
}

interface Lab {
  lab_id: string;
  lab_name: string;
  lab_code: string;
  subject_id: string;
  department: string;
  semester: number;
  credits: number;
  subjects?: {
    subject_name: string;
    subject_code: string;
  };
}

interface Student {
  student_id: string;
  student_name: string;
  student_email: string;
  student_department: string;
}

interface StudentMark {
  mark_id?: string;
  student_id: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  exam_type?: string;
  'Student Table'?: {
    student_name: string;
    student_email: string;
    student_department: string;
  };
}

const MarkingSystem: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'subjects' | 'labs' | 'marking'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Subject form states
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    subject_name: '',
    subject_code: '',
    department: user?.department || '',
    semester: 1,
    credits: 3
  });

  // Lab form states
  const [showLabForm, setShowLabForm] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [labForm, setLabForm] = useState({
    lab_name: '',
    lab_code: '',
    subject_id: '',
    department: user?.department || '',
    semester: 1,
    credits: 1
  });

  // Marking states
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [markingType, setMarkingType] = useState<'subject' | 'lab'>('subject');
  const [studentMarks, setStudentMarks] = useState<{ [key: string]: StudentMark }>({});
  const [existingMarks, setExistingMarks] = useState<StudentMark[]>([]);

  useEffect(() => {
    loadSubjects();
    loadLabs();
    loadStudents();
  }, [selectedSemester, user]);

  useEffect(() => {
    if (selectedSubject && markingType === 'subject') {
      loadExistingSubjectMarks();
    } else if (selectedLab && markingType === 'lab') {
      loadExistingLabMarks();
    }
  }, [selectedSubject, selectedLab, markingType, selectedSemester]);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects(user?.department, selectedSemester);
      setSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadLabs = async () => {
    try {
      const data = await getLabs(user?.department, selectedSemester);
      setLabs(data || []);
    } catch (error) {
      console.error('Error loading labs:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await getAllStudents(user?.department);
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadExistingSubjectMarks = async () => {
    if (!selectedSubject) return;
    try {
      const data = await getSubjectMarks(selectedSubject, selectedSemester);
      setExistingMarks(data || []);
      
      // Initialize student marks with existing data
      const marksMap: { [key: string]: StudentMark } = {};
      data?.forEach((mark: any) => {
        marksMap[mark.student_id] = {
          mark_id: mark.mark_id,
          student_id: mark.student_id,
          marks_obtained: mark.marks_obtained,
          total_marks: mark.total_marks,
          grade: mark.grade,
          exam_type: mark.exam_type
        };
      });
      setStudentMarks(marksMap);
    } catch (error) {
      console.error('Error loading existing marks:', error);
    }
  };

  const loadExistingLabMarks = async () => {
    if (!selectedLab) return;
    try {
      const data = await getLabMarks(selectedLab, selectedSemester);
      setExistingMarks(data || []);
      
      // Initialize student marks with existing data
      const marksMap: { [key: string]: StudentMark } = {};
      data?.forEach((mark: any) => {
        marksMap[mark.student_id] = {
          mark_id: mark.lab_mark_id,
          student_id: mark.student_id,
          marks_obtained: mark.marks_obtained,
          total_marks: mark.total_marks,
          grade: mark.grade
        };
      });
      setStudentMarks(marksMap);
    } catch (error) {
      console.error('Error loading existing lab marks:', error);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.subject_id, subjectForm);
      } else {
        await createSubject(subjectForm);
      }
      setShowSubjectForm(false);
      setEditingSubject(null);
      resetSubjectForm();
      loadSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('Error saving subject');
    } finally {
      setLoading(false);
    }
  };

  const handleLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingLab) {
        await updateLab(editingLab.lab_id, labForm);
      } else {
        await createLab(labForm);
      }
      setShowLabForm(false);
      setEditingLab(null);
      resetLabForm();
      loadLabs();
    } catch (error) {
      console.error('Error saving lab:', error);
      alert('Error saving lab');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject? This will also delete all related marks.')) {
      try {
        await deleteSubject(subjectId);
        loadSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Error deleting subject');
      }
    }
  };

  const handleDeleteLab = async (labId: string) => {
    if (window.confirm('Are you sure you want to delete this lab? This will also delete all related marks.')) {
      try {
        await deleteLab(labId);
        loadLabs();
      } catch (error) {
        console.error('Error deleting lab:', error);
        alert('Error deleting lab');
      }
    }
  };

  const handleMarkChange = (studentId: string, field: string, value: any) => {
    setStudentMarks(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) {
        updated[studentId] = {
          student_id: studentId,
          marks_obtained: 0,
          total_marks: 100,
          grade: 'F'
        };
        
        // Only add exam_type for subject marks
        if (markingType === 'subject') {
          updated[studentId].exam_type = 'final';
        }
      }
      
      updated[studentId] = { ...updated[studentId], [field]: value };
      
      // Auto-calculate grade when marks change
      if (field === 'marks_obtained' || field === 'total_marks') {
        const percentage = (updated[studentId].marks_obtained / updated[studentId].total_marks) * 100;
        updated[studentId].grade = calculateGrade(percentage);
      }
      
      return updated;
    });
  };

  const handleSaveMarks = async () => {
    setLoading(true);
    try {
      const promises = Object.values(studentMarks).map(async (mark) => {
        if (mark.marks_obtained > 0) {
          const baseMarkData = {
            student_id: mark.student_id,
            teacher_id: user!.id,
            marks_obtained: mark.marks_obtained,
            total_marks: mark.total_marks,
            grade: mark.grade,
            semester: selectedSemester
          };

          if (markingType === 'subject') {
            const subjectMarkData = {
              ...baseMarkData,
              subject_id: selectedSubject,
              exam_type: mark.exam_type || 'final'
            };
            
            if (mark.mark_id) {
              return updateStudentMark(mark.mark_id, subjectMarkData);
            } else {
              return addStudentMark(subjectMarkData);
            }
          } else {
            const labMarkData = {
              ...baseMarkData,
              lab_id: selectedLab
            };
            
            if (mark.mark_id) {
              return updateLabMark(mark.mark_id, labMarkData);
            } else {
              return addLabMark(labMarkData);
            }
          }
        }
      });

      await Promise.all(promises);
      alert('Marks saved successfully!');
      
      // Reload existing marks
      if (markingType === 'subject') {
        loadExistingSubjectMarks();
      } else {
        loadExistingLabMarks();
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Error saving marks');
    } finally {
      setLoading(false);
    }
  };

  const resetSubjectForm = () => {
    setSubjectForm({
      subject_name: '',
      subject_code: '',
      department: user?.department || '',
      semester: selectedSemester,
      credits: 3
    });
  };

  const resetLabForm = () => {
    setLabForm({
      lab_name: '',
      lab_code: '',
      subject_id: '',
      department: user?.department || '',
      semester: selectedSemester,
      credits: 1
    });
  };

  const editSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectForm(subject);
    setShowSubjectForm(true);
  };

  const editLab = (lab: Lab) => {
    setEditingLab(lab);
    setLabForm({
      lab_name: lab.lab_name,
      lab_code: lab.lab_code,
      subject_id: lab.subject_id,
      department: lab.department,
      semester: lab.semester,
      credits: lab.credits
    });
    setShowLabForm(true);
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.student_id === studentId);
    return student ? student.student_name : 'Unknown Student';
  };

  const getStudentEmail = (studentId: string) => {
    const student = students.find(s => s.student_id === studentId);
    return student ? student.student_email : '';
  };

  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubjects = subjects.filter(subject =>
    subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLabs = labs.filter(lab =>
    lab.lab_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.lab_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TabNavigation = () => (
    <div className="border-b border-gray-200 mb-6 overflow-x-auto">
      <nav className="-mb-px flex space-x-4 md:space-x-8 min-w-max px-4 md:px-0">
        {[
          { id: 'subjects', label: 'Subjects', icon: BookOpen },
          { id: 'labs', label: 'Labs', icon: FlaskConical },
          { id: 'marking', label: 'Mark Students', icon: Calculator }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center py-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Student Marking System</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Semester:</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="w-full sm:w-auto rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
      </div>

      <TabNavigation />

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 space-y-4 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">Manage Subjects</h3>
            <button
              onClick={() => {
                resetSubjectForm();
                setShowSubjectForm(true);
              }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </button>
          </div>

          {showSubjectForm && (
            <div className="mb-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <form onSubmit={handleSubjectSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={subjectForm.subject_name}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, subject_name: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code</label>
                  <input
                    type="text"
                    value={subjectForm.subject_code}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, subject_code: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, credits: Number(e.target.value) }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingSubject ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubjectForm(false);
                      setEditingSubject(null);
                      resetSubjectForm();
                    }}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-xl border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.subject_id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="truncate max-w-32 md:max-w-none">{subject.subject_name}</div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.subject_code}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.credits}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => editSubject(subject)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.subject_id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Labs Tab */}
      {activeTab === 'labs' && (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 space-y-4 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">Manage Labs</h3>
            <button
              onClick={() => {
                resetLabForm();
                setShowLabForm(true);
              }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lab
            </button>
          </div>

          {showLabForm && (
            <div className="mb-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border border-gray-200">
              <form onSubmit={handleLabSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lab Name</label>
                  <input
                    type="text"
                    value={labForm.lab_name}
                    onChange={(e) => setLabForm(prev => ({ ...prev, lab_name: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lab Code</label>
                  <input
                    type="text"
                    value={labForm.lab_code}
                    onChange={(e) => setLabForm(prev => ({ ...prev, lab_code: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Related Subject</label>
                  <select
                    value={labForm.subject_id}
                    onChange={(e) => setLabForm(prev => ({ ...prev, subject_id: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_code} - {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={labForm.credits}
                    onChange={(e) => setLabForm(prev => ({ ...prev, credits: Number(e.target.value) }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingLab ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLabForm(false);
                      setEditingLab(null);
                      resetLabForm();
                    }}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-xl border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLabs.map((lab) => (
                  <tr key={lab.lab_id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="truncate max-w-32 md:max-w-none">{lab.lab_name}</div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lab.lab_code}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="truncate max-w-32 md:max-w-none">
                        {lab.subjects?.subject_code} - {lab.subjects?.subject_name}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lab.credits}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => editLab(lab)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLab(lab.lab_id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Marking Tab */}
      {activeTab === 'marking' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Students</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marking Type</label>
                <select
                  value={markingType}
                  onChange={(e) => {
                    setMarkingType(e.target.value as 'subject' | 'lab');
                    setSelectedSubject('');
                    setSelectedLab('');
                    setStudentMarks({});
                  }}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="subject">Subject Marks</option>
                  <option value="lab">Lab Marks</option>
                </select>
              </div>
              
              {markingType === 'subject' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Choose Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_code} - {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Lab</label>
                  <select
                    value={selectedLab}
                    onChange={(e) => setSelectedLab(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Choose Lab</option>
                    {labs.map((lab) => (
                      <option key={lab.lab_id} value={lab.lab_id}>
                        {lab.lab_code} - {lab.lab_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex items-end">
                <button
                  onClick={handleSaveMarks}
                  disabled={loading || (!selectedSubject && !selectedLab)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save All Marks
                </button>
              </div>
            </div>
          </div>

          {(selectedSubject || selectedLab) && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-xl border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    {markingType === 'subject' && (
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const mark = studentMarks[student.student_id] || {
                      student_id: student.student_id,
                      marks_obtained: 0,
                      total_marks: 100,
                      grade: 'F',
                      ...(markingType === 'subject' && { exam_type: 'final' })
                    };
                    
                    return (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-48">{student.student_email}</div>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max={mark.total_marks}
                            value={mark.marks_obtained}
                            onChange={(e) => handleMarkChange(student.student_id, 'marks_obtained', Number(e.target.value))}
                            className="w-20 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={mark.total_marks}
                            onChange={(e) => handleMarkChange(student.student_id, 'total_marks', Number(e.target.value))}
                            className="w-20 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            mark.grade === 'F' ? 'bg-red-100 text-red-800 border-red-200' :
                            ['D'].includes(mark.grade) ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            ['C', 'C+'].includes(mark.grade) ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-green-100 text-green-800 border-green-200'
                          }`}>
                            {mark.grade}
                          </span>
                        </td>
                        {markingType === 'subject' && (
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                            <select
                              value={mark.exam_type || 'final'}
                              onChange={(e) => handleMarkChange(student.student_id, 'exam_type', e.target.value)}
                              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                              <option value="midterm">Midterm</option>
                              <option value="final">Final</option>
                              <option value="assignment">Assignment</option>
                              <option value="quiz">Quiz</option>
                            </select>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarkingSystem;