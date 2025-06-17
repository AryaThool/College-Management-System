import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Award, TrendingUp, Calendar, BookOpen, FlaskConical } from 'lucide-react';
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
      case 'A+': case 'A': return 'bg-green-100 text-green-800';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-800';
      case 'C+': case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportResults = async () => {
    if (!resultRef.current) return;

    setLoading(true);
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      if (exportFormat === 'image') {
        // Download as image
        const link = document.createElement('a');
        link.download = `${user?.name}_Semester_${selectedSemester}_Results.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else {
        // Download as PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${user?.name}_Semester_${selectedSemester}_Results.pdf`);
      }
    } catch (error) {
      console.error('Error exporting results:', error);
      alert('Error exporting results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = calculateSemesterStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic Results</h1>
            <p className="text-gray-600">View and export your academic performance</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Semester:</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'image')}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
              </select>
              
              <button
                onClick={exportResults}
                disabled={loading || (subjectMarks.length === 0 && labMarks.length === 0)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={resultRef} className="bg-white">
        {/* Header for Export */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Academic Transcript</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Student Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
              </div>
              <div>
                <p><strong>Department:</strong> {user?.department}</p>
                <p><strong>Semester:</strong> {selectedSemester}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <Award className="h-8 w-8 mr-3" />
              <div>
                <p className="text-green-100">CGPA</p>
                <p className="text-2xl font-bold">{stats.cgpa.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 mr-3" />
              <div>
                <p className="text-blue-100">Percentage</p>
                <p className="text-2xl font-bold">{stats.overallPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 mr-3" />
              <div>
                <p className="text-purple-100">Subjects</p>
                <p className="text-2xl font-bold">{stats.subjectsPassed}/{stats.totalSubjects}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 text-white ${
            stats.finalResult === 'PASS' 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            <div className="flex items-center">
              <FileText className="h-8 w-8 mr-3" />
              <div>
                <p className={stats.finalResult === 'PASS' ? 'text-green-100' : 'text-red-100'}>Result</p>
                <p className="text-2xl font-bold">{stats.finalResult}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Marks */}
        {subjectMarks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Subject Marks</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjectMarks.map((mark) => (
                    <tr key={mark.mark_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {mark.subjects.subject_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mark.subjects.subject_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mark.subjects.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mark.marks_obtained}/{mark.total_marks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(mark.grade)}`}>
                          {mark.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {mark.exam_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(mark.marked_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lab Marks */}
        {labMarks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FlaskConical className="h-6 w-6 mr-2 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Lab Marks</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {labMarks.map((mark) => (
                    <tr key={mark.lab_mark_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {mark.labs.lab_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mark.labs.lab_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mark.labs.subjects.subject_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mark.labs.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mark.marks_obtained}/{mark.total_marks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(mark.grade)}`}>
                          {mark.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(mark.marked_date).toLocaleDateString()}
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
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
            <p className="text-gray-500">No marks have been recorded for Semester {selectedSemester} yet.</p>
          </div>
        )}

        {/* Footer for Export */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Generated on {new Date().toLocaleDateString()} | College Management System</p>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;