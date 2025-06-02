import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { loginStudent, loginTeacher } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'student') {
        const studentData = await loginStudent(email, password);
        if (studentData) {
          setUser({
            id: studentData.student_id,
            name: studentData.student_name,
            email: studentData.student_email,
            role: 'student',
            department: studentData.student_department
          });
          navigate('/student-dashboard');
        }
      } else {
        const teacherData = await loginTeacher(email, password);
        if (teacherData) {
          setUser({
            id: teacherData.teacher_id,
            name: teacherData.teacher_name,
            email: teacherData.teacher_email,
            role: 'teacher',
            department: teacherData.teacher_department,
            designation: teacherData.teacher_designation
          });
          navigate('/teacher-dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold gradient-text">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Create one now
            </Link>
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                role === 'student'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <User className="h-5 w-5 mr-2" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                role === 'teacher'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Teacher
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;