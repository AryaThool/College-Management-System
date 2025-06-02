import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, Award, ClipboardList, ArrowRight, Clock } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 animate-gradient-xy"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="relative z-10 text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-24 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-extrabold">
                <span className="block text-gray-900">Transform Your</span>
                <span className="block gradient-text mt-2">Academic Journey</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl lg:max-w-xl">
                Experience education management reimagined with our comprehensive platform 
                designed for modern learning environments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="btn-primary">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/login" className="btn-secondary">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-2xl opacity-20"></div>
                <img 
                  src="https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg"
                  alt="Students learning"
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Features That Empower</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              Our platform combines powerful tools with an intuitive interface to enhance 
              the educational experience for both students and teachers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card rounded-xl p-6 card-hover-effect">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Transform Your Educational Experience?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            Join thousands of students and educators who are already benefiting from our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary bg-white text-indigo-600 hover:bg-gray-50">
              Get Started Now
            </Link>
            <Link to="/login" className="btn-secondary bg-transparent text-white border-white/20 hover:bg-white/10">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: <GraduationCap className="h-6 w-6 text-white" />,
    title: "Smart Learning",
    description: "Personalized learning paths and progress tracking to help students achieve their academic goals."
  },
  {
    icon: <Users className="h-6 w-6 text-white" />,
    title: "Collaborative Environment",
    description: "Foster interaction between students and teachers with real-time communication tools."
  },
  {
    icon: <BookOpen className="h-6 w-6 text-white" />,
    title: "Resource Management",
    description: "Centralized access to course materials, assignments, and educational resources."
  },
  {
    icon: <ClipboardList className="h-6 w-6 text-white" />,
    title: "Progress Tracking",
    description: "Comprehensive analytics and reporting to monitor academic performance."
  },
  {
    icon: <Award className="h-6 w-6 text-white" />,
    title: "Achievement System",
    description: "Recognize and reward student accomplishments with digital badges and certificates."
  },
  {
    icon: <Clock className="h-6 w-6 text-white" />,
    title: "Schedule Management",
    description: "Efficient timetable organization and calendar integration for better time management."
  }
];

export default Home;