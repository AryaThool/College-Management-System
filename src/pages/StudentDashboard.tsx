import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  FileText, 
  Clock, 
  ChevronRight, 
  Award,
  GraduationCap,
  TrendingUp,
  Bell,
  Star,
  CheckCircle,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { getStudentClasses, getStudentAttendance } from '../lib/supabase';
import StudentResults from '../components/StudentResults';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'results'>('overview');
  const [classes, setClasses] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data for the dashboard
  const currentCourses = [
    { id: 1, code: 'CS101', name: 'Introduction to Programming', instructor: 'Dr. Jane Smith', time: 'Mon/Wed 10:00 AM - 11:30 AM', progress: 75 },
    { id: 2, code: 'MATH201', name: 'Calculus II', instructor: 'Prof. Robert Johnson', time: 'Tue/Thu 1:00 PM - 2:30 PM', progress: 60 },
    { id: 3, code: 'PHYS105', name: 'Physics for Engineers', instructor: 'Dr. Michael Chen', time: 'Wed/Fri 9:00 AM - 10:30 AM', progress: 85 },
  ];

  const upcomingAssignments = [
    { id: 1, title: 'Programming Assignment 3', course: 'CS101', dueDate: '2025-04-15', status: 'pending', priority: 'high' },
    { id: 2, title: 'Calculus Problem Set 5', course: 'MATH201', dueDate: '2025-04-10', status: 'pending', priority: 'medium' },
    { id: 3, title: 'Lab Report: Forces and Motion', course: 'PHYS105', dueDate: '2025-04-08', status: 'pending', priority: 'high' },
  ];

  const announcements = [
    { id: 1, title: 'Campus Closed for Spring Break', date: '2025-04-01', content: 'The campus will be closed from April 12-20 for Spring Break.', type: 'info' },
    { id: 2, title: 'Registration for Fall Semester Opens', date: '2025-03-28', content: 'Registration for the Fall semester will open on April 15. Please consult with your advisor before registering.', type: 'important' },
    { id: 3, title: 'Library Extended Hours for Finals', date: '2025-03-25', content: 'The library will have extended hours from April 25-May 5 for final exams preparation.', type: 'info' },
  ];

  const stats = {
    totalCourses: 6,
    completedAssignments: 12,
    attendanceRate: 92,
    currentGPA: 3.7
  };

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAttendance();
    }
  }, [user, selectedClass]);

  const loadClasses = async () => {
    try {
      const classesData = await getStudentClasses(user!.id);
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadAttendance = async () => {
    try {
      const attendanceData = await getStudentAttendance(user!.id, selectedClass || undefined);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'important':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const TabNavigation = () => (
    <div className="border-b border-gray-200 mb-6 overflow-x-auto">
      <nav className="-mb-px flex space-x-4 md:space-x-8 min-w-max px-4 md:px-0">
        {[
          { id: 'overview', label: 'Overview', icon: Calendar },
          { id: 'attendance', label: 'Attendance', icon: ClipboardList },
          { id: 'results', label: 'Academic Results', icon: Award }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 shadow-lg">
                <User className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <div className="flex-1 sm:flex-none">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600 text-sm md:text-base">{user?.email}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700 text-sm">{user?.department}</span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700 text-sm">ID: {user?.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto sm:ml-auto">
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold text-blue-600">{stats.totalCourses}</div>
                <div className="text-xs text-gray-500">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold text-green-600">{stats.attendanceRate}%</div>
                <div className="text-xs text-gray-500">Attendance</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold text-purple-600">{stats.currentGPA}</div>
                <div className="text-xs text-gray-500">GPA</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold text-orange-600">{stats.completedAssignments}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        <TabNavigation />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8">
            {/* Current Courses */}
            <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-600" />
                  Current Courses
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {currentCourses.map((course) => (
                  <div key={course.id} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 md:p-5 border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">{course.code}</h3>
                        <p className="text-gray-700 text-xs md:text-sm font-medium mt-1">{course.name}</p>
                        <p className="text-gray-500 text-xs mt-1">{course.instructor}</p>
                      </div>
                      <div className="ml-2">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600 mb-3">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="truncate">{course.time}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Assignments and Announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Upcoming Assignments */}
              <div className="lg:col-span-2 bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 md:h-6 md:w-6 mr-2 text-orange-600" />
                    Upcoming Assignments
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {upcomingAssignments.map((assignment) => (
                    <div key={assignment.id} className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-200 hover:shadow-sm transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900 text-sm md:text-base">{assignment.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(assignment.priority)}`}>
                              {assignment.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs md:text-sm">{assignment.course}</p>
                          <p className="text-gray-500 text-xs">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            View
                          </button>
                          <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                    <Bell className="h-5 w-5 md:h-6 md:w-6 mr-2 text-purple-600" />
                    Announcements
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">All</button>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-3 md:pl-4 py-2 bg-blue-50 rounded-r-lg">
                      <div className="flex items-start space-x-2">
                        {getAnnouncementIcon(announcement.type)}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{announcement.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
                          <p className="text-xs md:text-sm text-gray-700 mt-1 line-clamp-2">{announcement.content}</p>
                          <button className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center">
                            Read more
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </button>
                        </div>
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
                <ClipboardList className="h-5 w-5 md:h-6 md:w-6 mr-2 text-green-600" />
                Attendance Record
              </h2>
              <select
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(e.target.value || null)}
                className="w-full sm:w-auto rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">All Classes</option>
                {classes.map((cls: any) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marked By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record: any) => (
                    <tr key={record.attend_id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="truncate max-w-32 md:max-w-none">
                          {record.classes?.class_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="truncate max-w-32 md:max-w-none">
                          {record.classes?.['Teacher Table']?.teacher_name || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <StudentResults />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;