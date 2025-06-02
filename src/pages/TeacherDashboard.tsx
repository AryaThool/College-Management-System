import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, BookOpen, Users, Calendar, ClipboardList, FileText, Clock, ChevronRight, Plus, Check, X, Clock3, Search, Filter, Trash2 } from 'lucide-react';
import { createClass, getTeacherClasses, getClassStudents, markAttendance, deleteClass } from '../lib/supabase';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showAddClass, setShowAddClass] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [semester, setSemester] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState<'present' | 'absent' | 'late' | null>(null);

  const upcomingSchedule = [
    { id: 1, type: 'Class', course: 'CS101', time: 'Today, 10:00 AM - 11:30 AM', location: 'Room 302' },
    { id: 2, type: 'Office Hours', course: '', time: 'Today, 2:00 PM - 4:00 PM', location: 'Office 215' },
    { id: 3, type: 'Class', course: 'CS250', time: 'Tomorrow, 1:00 PM - 2:30 PM', location: 'Room 405' },
    { id: 4, type: 'Department Meeting', course: '', time: 'Apr 10, 3:00 PM - 4:30 PM', location: 'Conference Room B' },
  ];

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (bulkAction) {
      setStudents(students.map(student => ({
        ...student,
        attendance: bulkAction
      })));
      setBulkAction(null);
    }
  }, [bulkAction]);

  const loadClasses = async () => {
    try {
      const classesData = await getTeacherClasses(user!.id);
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async () => {
    if (!selectedClass) return;
    try {
      const studentsData = await getClassStudents(selectedClass);
      setStudents(studentsData.map((s: any) => ({
        ...s,
        attendance: null
      })));
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClass({
        class_name: className,
        semester: parseInt(semester),
        teacher_id: user!.id
      });
      setShowAddClass(false);
      setClassName('');
      setSemester('');
      loadClasses();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStudents(students.map(student => 
      student.student_id === studentId 
        ? { ...student, attendance: status }
        : student
    ));
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      await deleteClass(classId);
      setShowDeleteConfirm(null);
      if (selectedClass === classId) {
        setSelectedClass(null);
        setStudents([]);
      }
      loadClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Error deleting class');
    }
  };

  const submitAttendance = async () => {
    try {
      const promises = students
        .filter(student => student.attendance)
        .map(student => 
          markAttendance({
            class_id: selectedClass!,
            student_id: student.student_id,
            date,
            status: student.attendance,
            marked_by: user!.id
          })
        );
      
      await Promise.all(promises);
      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance');
    }
  };

  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-3">
              <User className="h-10 w-10 text-blue-800" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-2 flex items-center">
                <BookOpen className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Department: {user?.department}</span>
              </div>
              <div className="mt-2 flex items-center">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Designation: {user?.designation}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Classes & Attendance</h2>
              <button
                onClick={() => setShowAddClass(true)}
                className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Class
              </button>
            </div>

            {showAddClass && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <form onSubmit={handleAddClass} className="space-y-4">
                  <div>
                    <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                      Class Name
                    </label>
                    <input
                      id="className"
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="Enter class name"
                    />
                  </div>
                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      id="semester"
                      type="number"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="1"
                      max="8"
                      placeholder="Enter semester number"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddClass(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Class
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {classes.map((cls) => (
                <div
                  key={cls.class_id}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    selectedClass === cls.class_id
                      ? 'border-blue-800 bg-blue-50 ring-2 ring-blue-800 ring-opacity-50'
                      : 'border-gray-200 hover:border-blue-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setSelectedClass(cls.class_id)}
                      className="flex-1 text-left"
                    >
                      <h3 className="font-medium text-gray-900">{cls.class_name}</h3>
                      <p className="text-sm text-gray-500">Semester {cls.semester}</p>
                    </button>
                    <div className="flex items-center gap-2">
                      <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${
                        selectedClass === cls.class_id ? 'transform rotate-90' : ''
                      }`} />
                      {showDeleteConfirm === cls.class_id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteClass(cls.class_id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Confirm delete"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Cancel delete"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(cls.class_id);
                          }}
                          className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete class"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedClass && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-medium text-gray-900">Mark Attendance</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative">
                        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search students..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setBulkAction('present')}
                      className="px-4 py-2 rounded-md bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => setBulkAction('absent')}
                      className="px-4 py-2 rounded-md bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Mark All Absent
                    </button>
                    <button
                      onClick={() => setBulkAction('late')}
                      className="px-4 py-2 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      Mark All Late
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student.student_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                            <div className="text-sm text-gray-500">{student.student_email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.student_department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleAttendanceChange(student.student_id, 'present')}
                                className={`flex items-center px-3 py-2 rounded-md border transition-colors ${
                                  student.attendance === 'present'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'hover:bg-green-50 hover:text-green-800 hover:border-green-200'
                                }`}
                                aria-label="Mark as present"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Present
                              </button>
                              <button
                                onClick={() => handleAttendanceChange(student.student_id, 'absent')}
                                className={`flex items-center px-3 py-2 rounded-md border transition-colors ${
                                  student.attendance === 'absent'
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'hover:bg-red-50 hover:text-red-800 hover:border-red-200'
                                }`}
                                aria-label="Mark as absent"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Absent
                              </button>
                              <button
                                onClick={() => handleAttendanceChange(student.student_id, 'late')}
                                className={`flex items-center px-3 py-2 rounded-md border transition-colors ${
                                  student.attendance === 'late'
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                    : 'hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-200'
                                }`}
                                aria-label="Mark as late"
                              >
                                <Clock3 className="h-4 w-4 mr-1" />
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      {filteredStudents.length} students found
                    </p>
                    <button
                      onClick={submitAttendance}
                      className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Submit Attendance
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h2>
              <a href="#" className="text-sm text-blue-800 hover:text-blue-700">Full Calendar</a>
            </div>
            <div className="space-y-4">
              {upcomingSchedule.map((item) => (
                <div key={item.id} className="border-l-4 border-blue-800 pl-3 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.type} {item.course && `- ${item.course}`}
                      </h3>
                      <p className="text-xs text-gray-500">{item.time}</p>
                      <p className="text-xs text-gray-500">{item.location}</p>
                    </div>
                    {item.type === 'Class' && (
                      <button className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-md hover:bg-blue-200">
                        Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

export default TeacherDashboard