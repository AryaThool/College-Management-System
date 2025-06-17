import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, BookOpen, Calendar, ClipboardList, FileText, Clock, ChevronRight, Award } from 'lucide-react';
import { getStudentClasses, getStudentAttendance } from '../lib/supabase';
import StudentResults from '../components/StudentResults';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'results'>('overview');
  const [classes, setClasses] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // Mock data for the dashboard
  const currentCourses = [
    { id: 1, code: 'CS101', name: 'Introduction to Programming', instructor: 'Dr. Jane Smith', time: 'Mon/Wed 10:00 AM - 11:30 AM' },
    { id: 2, code: 'MATH201', name: 'Calculus II', instructor: 'Prof. Robert Johnson', time: 'Tue/Thu 1:00 PM - 2:30 PM' },
    { id: 3, code: 'PHYS105', name: 'Physics for Engineers', instructor: 'Dr. Michael Chen', time: 'Wed/Fri 9:00 AM - 10:30 AM' },
  ];

  const upcomingAssignments = [
    { id: 1, title: 'Programming Assignment 3', course: 'CS101', dueDate: '2025-04-15', status: 'pending' },
    { id: 2, title: 'Calculus Problem Set 5', course: 'MATH201', dueDate: '2025-04-10', status: 'pending' },
    { id: 3, title: 'Lab Report: Forces and Motion', course: 'PHYS105', dueDate: '2025-04-08', status: 'pending' },
  ];

  const announcements = [
    { id: 1, title: 'Campus Closed for Spring Break', date: '2025-04-01', content: 'The campus will be closed from April 12-20 for Spring Break.' },
    { id: 2, title: 'Registration for Fall Semester Opens', date: '2025-03-28', content: 'Registration for the Fall semester will open on April 15. Please consult with your advisor before registering.' },
    { id: 3, title: 'Library Extended Hours for Finals', date: '2025-03-25', content: 'The library will have extended hours from April 25-May 5 for final exams preparation.' },
  ];

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Student Profile Card */}
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
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Student ID: {user?.id.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Calendar },
              { id: 'attendance', label: 'Attendance', icon: ClipboardList },
              { id: 'results', label: 'Academic Results', icon: Award }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Courses */}
            <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Current Courses</h2>
                <a href="#" className="text-sm text-blue-800 hover:text-blue-700">View All</a>
              </div>
              <div className="divide-y divide-gray-200">
                {currentCourses.map((course) => (
                  <div key={course.id} className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{course.code}: {course.name}</h3>
                        <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600">{course.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
                <a href="#" className="text-sm text-blue-800 hover:text-blue-700">All Announcements</a>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-blue-800 pl-3 py-2">
                    <h3 className="text-sm font-medium text-gray-900">{announcement.title}</h3>
                    <p className="text-xs text-gray-500">{announcement.date}</p>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">{announcement.content}</p>
                    <a href="#" className="text-xs text-blue-800 hover:text-blue-700 mt-1 inline-flex items-center">
                      Read more
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Assignments */}
            <div className="bg-white shadow rounded-lg p-6 lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
                <a href="#" className="text-sm text-blue-800 hover:text-blue-700">View All Assignments</a>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingAssignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {assignment.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Due soon
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a href="#" className="text-blue-800 hover:text-blue-700 mr-3">View</a>
                          <a href="#" className="text-blue-800 hover:text-blue-700">Submit</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Attendance Record</h2>
              <select
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(e.target.value || null)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-blue-800 sm:text-sm"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marked By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record: any) => (
                    <tr key={record.attend_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.classes?.class_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.classes?.['Teacher Table']?.teacher_name || 'N/A'}
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