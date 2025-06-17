import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  BookOpen, 
  Users, 
  Calendar, 
  ClipboardList, 
  FileText, 
  Clock, 
  ChevronRight, 
  Plus, 
  Check, 
  X, 
  Clock3, 
  Search, 
  Filter, 
  Trash2, 
  Calculator,
  GraduationCap,
  TrendingUp,
  Award,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { createClass, getTeacherClasses, getClassStudents, markAttendance, deleteClass } from '../lib/supabase';
import MarkingSystem from '../components/MarkingSystem';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'marking'>('overview');
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
    { id: 1, type: 'Class', course: 'CS101', time: 'Today, 10:00 AM - 11:30 AM', location: 'Room 302', status: 'upcoming' },
    { id: 2, type: 'Office Hours', course: '', time: 'Today, 2:00 PM - 4:00 PM', location: 'Office 215', status: 'available' },
    { id: 3, type: 'Class', course: 'CS250', time: 'Tomorrow, 1:00 PM - 2:30 PM', location: 'Room 405', status: 'scheduled' },
    { id: 4, type: 'Department Meeting', course: '', time: 'Apr 10, 3:00 PM - 4:30 PM', location: 'Conference Room B', status: 'meeting' },
  ];

  const teacherStats = {
    totalClasses: classes.length,
    totalStudents: 156,
    averageAttendance: 87,
    pendingGrades: 23
  };

  const recentActivities = [
    { id: 1, action: 'Marked attendance for CS101', time: '2 hours ago', type: 'attendance' },
    { id: 2, action: 'Graded assignments for MATH201', time: '4 hours ago', type: 'grading' },
    { id: 3, action: 'Created new class CS250', time: '1 day ago', type: 'class' },
    { id: 4, action: 'Updated course materials', time: '2 days ago', type: 'content' },
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

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'meeting':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <ClipboardList className="h-4 w-4 text-green-600" />;
      case 'grading':
        return <Award className="h-4 w-4 text-blue-600" />;
      case 'class':
        return <BookOpen className="h-4 w-4 text-purple-600" />;
      case 'content':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const TabNavigation = () => (
    <div className="border-b border-gray-200 mb-6 overflow-x-auto">
      <nav className="-mb-px flex space-x-4 md:space-x-8 min-w-max px-4 md:px-0">
        {[
          { id: 'overview', label: 'Overview', icon: Calendar },
          { id: 'attendance', label: 'Attendance', icon: ClipboardList },
          { id: 'marking', label: 'Student Marking', icon: Calculator }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
              <button className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Teacher Profile Card */}
        <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex items-center space-x-4 w-full lg:w-auto">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-3 shadow-lg">
                <User className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <div className="flex-1 lg:flex-none">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600 text-sm md:text-base">{user?.email}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700 text-sm">{user?.department}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700 text-sm">{user?.designation}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto lg:ml-auto">
              <div className="text-center bg-blue-50 rounded-xl p-3">
                <div className="text-lg md:text-xl font-bold text-blue-600">{teacherStats.totalClasses}</div>
                <div className="text-xs text-gray-600">Classes</div>
              </div>
              <div className="text-center bg-green-50 rounded-xl p-3">
                <div className="text-lg md:text-xl font-bold text-green-600">{teacherStats.totalStudents}</div>
                <div className="text-xs text-gray-600">Students</div>
              </div>
              <div className="text-center bg-purple-50 rounded-xl p-3">
                <div className="text-lg md:text-xl font-bold text-purple-600">{teacherStats.averageAttendance}%</div>
                <div className="text-xs text-gray-600">Attendance</div>
              </div>
              <div className="text-center bg-orange-50 rounded-xl p-3">
                <div className="text-lg md:text-xl font-bold text-orange-600">{teacherStats.pendingGrades}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        </div>

        <TabNavigation />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8">
            {/* My Classes */}
            <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 md:h-6 md:w-6 mr-2 text-indigo-600" />
                  My Classes
                </h2>
                <button
                  onClick={() => setShowAddClass(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Class
                </button>
              </div>

              {showAddClass && (
                <div className="mb-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border border-gray-200">
                  <form onSubmit={handleAddClass} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
                          Class Name
                        </label>
                        <input
                          id="className"
                          type="text"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          required
                          placeholder="Enter class name"
                        />
                      </div>
                      <div>
                        <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                          Semester
                        </label>
                        <input
                          id="semester"
                          type="number"
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          required
                          min="1"
                          max="8"
                          placeholder="Enter semester number"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddClass(false)}
                        className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                      >
                        Add Class
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {classes.map((cls) => (
                  <div
                    key={cls.class_id}
                    className="bg-gradient-to-br from-white to-gray-50 p-4 md:p-5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm md:text-base">{cls.class_name}</h3>
                            <p className="text-xs text-gray-500">Semester {cls.semester}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-600">Active</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {showDeleteConfirm === cls.class_id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteClass(cls.class_id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Confirm delete"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Cancel delete"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(cls.class_id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete class"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule and Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Upcoming Schedule */}
              <div className="lg:col-span-2 bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 md:h-6 md:w-6 mr-2 text-green-600" />
                    Upcoming Schedule
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Full Calendar</button>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {upcomingSchedule.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-200 hover:shadow-sm transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900 text-sm md:text-base">
                              {item.type} {item.course && `- ${item.course}`}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScheduleStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-600 space-y-1 sm:space-y-0">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.time}
                            </div>
                            <div className="flex items-center">
                              <span className="w-3 h-3 bg-gray-400 rounded-full mr-1"></span>
                              {item.location}
                            </div>
                          </div>
                        </div>
                        {item.type === 'Class' && (
                          <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 md:h-6 md:w-6 mr-2 text-purple-600" />
                    Recent Activities
                  </h2>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                <ClipboardList className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-600" />
                Mark Attendance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {classes.map((cls) => (
                <div
                  key={cls.class_id}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    selectedClass === cls.class_id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <button
                    onClick={() => setSelectedClass(cls.class_id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm md:text-base">{cls.class_name}</h3>
                          <p className="text-xs text-gray-500">Semester {cls.semester}</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${
                        selectedClass === cls.class_id ? 'transform rotate-90' : ''
                      }`} />
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {selectedClass && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h3 className="text-lg font-medium text-gray-900">Mark Attendance</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative">
                        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search students..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                        />
                      </div>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setBulkAction('present')}
                      className="px-4 py-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => setBulkAction('absent')}
                      className="px-4 py-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                      Mark All Absent
                    </button>
                    <button
                      onClick={() => setBulkAction('late')}
                      className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    >
                      Mark All Late
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th scope="col" className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th scope="col" className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student.student_id} className="hover:bg-gray-50">
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-48">{student.student_email}</div>
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="truncate max-w-32">{student.student_department}</div>
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                              <button
                                onClick={() => handleAttendanceChange(student.student_id, 'present')}
                                className={`flex items-center px-3 py-2 rounded-lg border transition-colors text-xs ${
                                  student.attendance === 'present'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'hover:bg-green-50 hover:text-green-800 hover:border-green-200'
                                }`}
                                aria-label="Mark as present"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Present
                              </button>
                              <button
                                onClick={() => handleAttendanceChange(student.student_id, 'absent')}
                                className={`flex items-center px-3 py-2 rounded-lg border transition-colors text-xs ${
                                  student.attendance === 'absent'
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'hover:bg-red-50 hover:text-red-800 hover:border-red-200'
                                }`}
                                aria-label="Mark as absent"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Absent
                              </button>
                              <button
                                onClick={() => handleAttendanceChange(student.student_id, 'late')}
                                className={`flex items-center px-3 py-2 rounded-lg border transition-colors text-xs ${
                                  student.attendance === 'late'
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                    : 'hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-200'
                                }`}
                                aria-label="Mark as late"
                              >
                                <Clock3 className="h-3 w-3 mr-1" />
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 md:p-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <p className="text-sm text-gray-500">
                      {filteredStudents.length} students found
                    </p>
                    <button
                      onClick={submitAttendance}
                      className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      Submit Attendance
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Marking Tab */}
        {activeTab === 'marking' && (
          <MarkingSystem />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;