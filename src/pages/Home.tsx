import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  ClipboardList, 
  ArrowRight, 
  Clock, 
  Star,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Heart
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ Students</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                  <span className="block text-gray-900">Transform Your</span>
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                    Learning Journey
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-600 max-w-2xl leading-relaxed">
                  Experience the future of education with our comprehensive platform designed for 
                  modern learning environments. Seamlessly connect students and educators.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/register" 
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
                >
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Expert Teachers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative lg:block">
              <div className="relative">
                {/* Main Image */}
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
                  <img 
                    src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg"
                    alt="Students collaborating"
                    className="w-full h-96 lg:h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl animate-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">98% Success</div>
                      <div className="text-sm text-gray-500">Completion Rate</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl animate-float animation-delay-2000">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">24/7 Support</div>
                      <div className="text-sm text-gray-500">Always Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Zap className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-600">POWERFUL FEATURES</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Excel in Education
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform provides all the tools and resources needed for 
              modern education management and student success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Loved by Students & Teachers
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands who have transformed their educational experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-100 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-blue-200 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-pulse animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full animate-pulse animation-delay-4000"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to Transform Your
            <span className="block">Educational Journey?</span>
          </h2>
          <p className="text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of students and educators who are already experiencing 
            the future of education management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              to="/register" 
              className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-blue-600 bg-white rounded-2xl shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              Start Your Journey
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              <span>Global Access</span>
            </div>
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: <GraduationCap className="h-8 w-8 text-white" />,
    title: "Smart Learning Paths",
    description: "AI-powered personalized learning experiences that adapt to each student's pace and learning style for optimal academic growth."
  },
  {
    icon: <Users className="h-8 w-8 text-white" />,
    title: "Collaborative Environment",
    description: "Foster meaningful connections between students and teachers with real-time communication tools and interactive learning spaces."
  },
  {
    icon: <BookOpen className="h-8 w-8 text-white" />,
    title: "Digital Resource Hub",
    description: "Centralized access to course materials, assignments, and educational resources with advanced search and organization features."
  },
  {
    icon: <ClipboardList className="h-8 w-8 text-white" />,
    title: "Advanced Analytics",
    description: "Comprehensive progress tracking and performance analytics to help students and teachers make data-driven decisions."
  },
  {
    icon: <Award className="h-8 w-8 text-white" />,
    title: "Achievement System",
    description: "Gamified learning experience with digital badges, certificates, and milestone recognition to motivate student success."
  },
  {
    icon: <Clock className="h-8 w-8 text-white" />,
    title: "Smart Scheduling",
    description: "Intelligent timetable management with calendar integration, automated reminders, and conflict resolution."
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Computer Science Student",
    content: "This platform has completely transformed how I manage my studies. The intuitive interface and powerful features make learning so much more engaging and organized."
  },
  {
    name: "Dr. Michael Chen",
    role: "Professor of Mathematics",
    content: "As an educator, I've never had such comprehensive tools at my disposal. The attendance tracking and student analytics have revolutionized my teaching approach."
  },
  {
    name: "Emily Rodriguez",
    role: "Engineering Student",
    content: "The collaborative features and resource management have made group projects seamless. I can't imagine going back to traditional learning methods."
  }
];

export default Home;