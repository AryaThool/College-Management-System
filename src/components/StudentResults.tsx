import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Award, TrendingUp, Calendar, BookOpen, FlaskConical, Filter, Search, Star, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getStudentMarks,
  getStudentLabMarks,
  getStudentResults,
  calculateCGPA
} from '../lib/supabase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StudentMark {
  mark_id: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  exam_type: string;
  marked_date: string;
  subjects: {
    subject_name: string;
    subject_code: string;
    credits: number;
  };
}

interface LabMark {
  lab_mark_id: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  marked_date: string;
  labs: {
    lab_name: string;
    lab_code: string;
    credits: number;
    subjects: {
      subject_name: string;
      subject_code: string;
    };
  };
}

interface StudentResult {
  result_id: string;
  semester: number;
  total_subjects: number;
  total_labs: number;
  subjects_passed: number;
  labs_passed: number;
  overall_percentage: number;
  cgpa: number;
  final_result: string;
  generated_date: string;
}

const StudentResults: React.FC = () => {
  const { user } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [subjectMarks, setSubjectMarks] = useState<StudentMark[]>([]);
  const [labMarks, setLabMarks] = useState<LabMark[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'image'>('pdf');
  const [filterGrade, setFilterGrade] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user, selectedSemester]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [subjectData, labData, resultData] = await Promise.all([
        getStudentMarks(user!.id, selectedSemester),
        getStudentLabMarks(user!.id, selectedSemester),
        getStudentResults(user!.id, selectedSemester)
      ]);

      setSubjectMarks(subjectData || []);
      setLabMarks(labData || []);
      setResults(resultData || []);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSemesterStats = () => {
    const allMarks = [...subjectMarks, ...labMarks];
    const totalSubjects = subjectMarks.length;
    const totalLabs = labMarks.length;
    const subjectsPassed = subjectMarks.filter(mark => mark.grade !== 'F').length;
    const labsPassed = labMarks.filter(mark => mark.grade !== 'F').length;
    
    const totalMarksObtained = allMarks.reduce((sum, mark) => sum + mark.marks_obtained, 0);
    const totalMaxMarks = allMarks.reduce((sum, mark) => sum + mark.total_marks, 0);
    const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    
    const cgpa = calculateCGPA(allMarks);
    const finalResult = (subjectsPassed === totalSubjects && labsPassed === totalLabs && totalSubjects > 0) ? 'PASS' : 'FAIL';

    return {
      totalSubjects,
      totalLabs,
      subjectsPassed,
      labsPassed,
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      cgpa,
      finalResult
    };
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C+': case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportResults = async () => {
    if (!resultRef.current) return;

    setLoading(true);
    try {
      // Hide the export controls during capture
      const exportControls = document.querySelectorAll('.export-controls');
      exportControls.forEach(control => {
        (control as HTMLElement).style.display = 'none';
      });

      const canvas = await html2canvas(resultRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: resultRef.current.scrollWidth,
        height: resultRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Show the export controls again
      exportControls.forEach(control => {
        (control as HTMLElement).style.display = '';
      });

      if (exportFormat === 'image') {
        const link = document.createElement('a');
        link.download = `${user?.name?.replace(/\s+/g, '_')}_Semester_${selectedSemester}_Academic_Results.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        // If content is too long, add additional pages
        if (imgHeight * ratio > pdfHeight) {
          let heightLeft = imgHeight * ratio - pdfHeight;
          let position = -pdfHeight;
          
          while (heightLeft > 0) {
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
            heightLeft -= pdfHeight;
            position -= pdfHeight;
          }
        }

        pdf.save(`${user?.name?.replace(/\s+/g, '_')}_Semester_${selectedSemester}_Academic_Results.pdf`);
      }
    } catch (error) {
      console.error('Error exporting results:', error);
      alert('Error exporting results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjectMarks = subjectMarks.filter(mark => {
    const matchesGrade = !filterGrade || mark.grade === filterGrade;
    const matchesSearch = !searchTerm || 
      mark.subjects.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.subjects.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const filteredLabMarks = labMarks.filter(mark => {
    const matchesGrade = !filterGrade || mark.grade === filterGrade;
    const matchesSearch = !searchTerm || 
      mark.labs.lab_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.labs.lab_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const stats = calculateSemesterStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <div className="mb-6 md:mb-8 export-controls">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Academic Results</h1>
            <p className="text-gray-600 mt-1">View and export your academic performance</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
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
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'image')}
                className="w-full sm:w-auto rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="pdf">PDF Document</option>
                <option value="image">High-Quality Image</option>
              </select>
              
              <button
                onClick={exportResults}
                disabled={loading || (subjectMarks.length === 0 && labMarks.length === 0)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 whitespace-nowrap shadow-lg hover:shadow-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200 export-controls">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subjects or labs..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Grades</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="F">F</option>
            </select>
          </div>
        </div>
      </div>

      <div ref={resultRef} className="bg-white">
        {/* Professional Header for Export */}
        <div className="mb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-20"></div>
              <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full opacity-15"></div>
              <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-white rounded-full opacity-10"></div>
              <div className="absolute bottom-20 right-10 w-28 h-28 bg-white rounded-full opacity-25"></div>
            </div>
          </div>
          
          <div className="relative z-10 p-8 md:p-12">
            {/* Institution Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mr-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">College Management System</h1>
                  <p className="text-blue-100 text-sm md:text-base">Academic Excellence • Innovation • Growth</p>
                </div>
              </div>
              
              <div className="w-24 h-1 bg-white mx-auto rounded-full opacity-60 mb-6"></div>
              
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Official Academic Transcript</h2>
              <p className="text-blue-100 text-sm md:text-base">Semester {selectedSemester} • Academic Year 2024-2025</p>
            </div>

            {/* Student Information Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">{user?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
                      <p className="text-gray-600 text-sm">Student</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-20">Email:</span>
                      <span className="text-gray-900">{user?.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-20">ID:</span>
                      <span className="text-gray-900 font-mono">{user?.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700">Department:</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 ml-7">{user?.department}</p>
                  
                  <div className="flex items-center mt-4">
                    <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium text-gray-700">Generated:</span>
                    <span className="text-gray-900 ml-2">{new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <Award className="h-8 w-8 text-green-100" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.cgpa.toFixed(2)}</div>
                <div className="text-green-100 text-sm font-medium">CGPA</div>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-200 mr-2" />
              <span className="text-green-100 text-xs">Cumulative Grade Point Average</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-blue-100" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.overallPercentage.toFixed(1)}%</div>
                <div className="text-blue-100 text-sm font-medium">Percentage</div>
              </div>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-blue-200 mr-2" />
              <span className="text-blue-100 text-xs">Overall Performance</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-purple-100" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.subjectsPassed}/{stats.totalSubjects}</div>
                <div className="text-purple-100 text-sm font-medium">Subjects</div>
              </div>
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-purple-200 mr-2" />
              <span className="text-purple-100 text-xs">Subjects Completed</span>
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 text-white shadow-xl border ${
            stats.finalResult === 'PASS' 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-200' 
              : 'bg-gradient-to-br from-red-500 to-rose-600 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-white/80" />
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.finalResult}</div>
                <div className="text-white/80 text-sm font-medium">Final Result</div>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-white/60 mr-2" />
              <span className="text-white/80 text-xs">Academic Status</span>
            </div>
          </div>
        </div>

        {/* Enhanced Subject Marks Table */}
        {filteredSubjectMarks.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Subject Performance</h3>
                  <p className="text-gray-600 text-sm">Detailed breakdown of subject-wise academic performance</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto bg-white rounded-b-2xl shadow-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subject Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Marks Obtained</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Assessment Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredSubjectMarks.map((mark, index) => (
                    <tr key={mark.mark_id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{mark.subjects.subject_name}</div>
                          <div className="text-sm text-gray-600 font-mono">{mark.subjects.subject_code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {mark.subjects.credits} Credits
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-lg font-bold text-gray-900">{mark.marks_obtained}</div>
                          <div className="text-gray-500 mx-1">/</div>
                          <div className="text-sm text-gray-600">{mark.total_marks}</div>
                          <div className="ml-2 text-xs text-gray-500">
                            ({((mark.marks_obtained / mark.total_marks) * 100).toFixed(1)}%)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border-2 ${getGradeColor(mark.grade)}`}>
                          {mark.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 capitalize font-medium">{mark.exam_type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(mark.marked_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Lab Marks Table */}
        {filteredLabMarks.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                  <FlaskConical className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Laboratory Performance</h3>
                  <p className="text-gray-600 text-sm">Practical and laboratory assessment results</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto bg-white rounded-b-2xl shadow-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Laboratory Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Related Subject</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Marks Obtained</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredLabMarks.map((mark, index) => (
                    <tr key={mark.lab_mark_id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{mark.labs.lab_name}</div>
                          <div className="text-sm text-gray-600 font-mono">{mark.labs.lab_code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">{mark.labs.subjects.subject_code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {mark.labs.credits} Credits
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-lg font-bold text-gray-900">{mark.marks_obtained}</div>
                          <div className="text-gray-500 mx-1">/</div>
                          <div className="text-sm text-gray-600">{mark.total_marks}</div>
                          <div className="ml-2 text-xs text-gray-500">
                            ({((mark.marks_obtained / mark.total_marks) * 100).toFixed(1)}%)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border-2 ${getGradeColor(mark.grade)}`}>
                          {mark.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(mark.marked_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {subjectMarks.length === 0 && labMarks.length === 0 && !loading && (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Academic Records Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No marks have been recorded for Semester {selectedSemester} yet. 
              Please check back later or contact your academic advisor.
            </p>
          </div>
        )}

        {/* Professional Footer */}
        <div className="mt-12 pt-8 border-t-2 border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Verified Document</h4>
                <p className="text-xs text-gray-600">This is an official academic transcript</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Authenticated</h4>
                <p className="text-xs text-gray-600">Generated from official records</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Date of Issue</h4>
                <p className="text-xs text-gray-600">{new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">College Management System</p>
              <p className="text-xs text-gray-500">
                This document is computer generated and does not require a signature. 
                For verification, please contact the academic office.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span>Document ID: {user?.id.substring(0, 8).toUpperCase()}-{selectedSemester}-{new Date().getFullYear()}</span>
                <span>•</span>
                <span>Generated: {new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;