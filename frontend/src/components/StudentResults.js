import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import {
  Award,
  TrendingUp,
  BookOpen,
  GraduationCap,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  BarChart3,
  Target
} from 'lucide-react';

const StudentResults = () => {
  const { user } = useAuth();
  const [examTerms, setExamTerms] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamTerm, setSelectedExamTerm] = useState('');

  const fetchExamTerms = useCallback(async () => {
    try {
      const response = await axios.get('/api/exam-terms');
      setExamTerms(response.data);
    } catch (error) {
      console.error('Error fetching exam terms:', error);
    }
  }, []);

  const fetchMyResults = useCallback(async () => {
    try {
      let url = '/api/student-results/my-results';
      if (selectedExamTerm) {
        url += `?exam_term_id=${selectedExamTerm}`;
      }
      const response = await axios.get(url);
      // Safety filter: only show published results (backend already enforces this)
      const publishedResults = response.data.filter(r => r.status === 'published');
      setResults(publishedResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  }, [selectedExamTerm]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchExamTerms();
      await fetchMyResults();
      setLoading(false);
    };
    loadData();
  }, [fetchExamTerms, fetchMyResults]);

  useEffect(() => {
    fetchMyResults();
  }, [selectedExamTerm, fetchMyResults]);

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-green-500',
      'A': 'bg-green-400',
      'B+': 'bg-blue-500',
      'B': 'bg-blue-400',
      'C+': 'bg-yellow-500',
      'C': 'bg-yellow-400',
      'D': 'bg-orange-500',
      'F': 'bg-red-500'
    };
    return colors[grade] || 'bg-gray-500';
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return { text: 'Outstanding Performance!', color: 'text-green-600', icon: Award };
    if (percentage >= 75) return { text: 'Excellent Work!', color: 'text-blue-600', icon: TrendingUp };
    if (percentage >= 60) return { text: 'Good Performance', color: 'text-indigo-600', icon: CheckCircle };
    if (percentage >= 40) return { text: 'Keep Improving', color: 'text-yellow-600', icon: Target };
    return { text: 'Needs Improvement', color: 'text-red-600', icon: XCircle };
  };

  const handlePrint = (result) => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const latestResult = results[0];
  const totalExams = results.length;
  const avgPercentage = results.length > 0 
    ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Results</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View your examination results and performance</p>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Exams</p>
                <p className="text-3xl font-bold mt-1">{totalExams}</p>
              </div>
              <BookOpen className="h-10 w-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Average Score</p>
                <p className="text-3xl font-bold mt-1">{avgPercentage}%</p>
              </div>
              <BarChart3 className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Latest Grade</p>
                <p className="text-3xl font-bold mt-1">{latestResult?.grade || '-'}</p>
              </div>
              <Award className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Filter by Exam:</Label>
            <Select value={selectedExamTerm} onValueChange={setSelectedExamTerm}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Exams</SelectItem>
                {examTerms.map(term => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name} ({term.academic_year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map(result => {
            const examTerm = examTerms.find(t => t.id === result.exam_term_id);
            const performance = getPerformanceMessage(result.percentage);
            const PerformanceIcon = performance.icon;

            return (
              <Card key={result.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{examTerm?.name || 'Exam'}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{examTerm?.academic_year}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 ${performance.color}`}>
                        <PerformanceIcon className="h-5 w-5" />
                        <span className="font-medium">{performance.text}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handlePrint(result)}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                    {/* Score Summary */}
                    <div className="p-6 text-center bg-white dark:bg-gray-800">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Total Score</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {result.total_marks} / {result.total_max_marks}
                      </p>
                    </div>
                    <div className="p-6 text-center bg-white dark:bg-gray-800">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Percentage</p>
                      <p className="text-3xl font-bold text-emerald-600 mt-1">
                        {result.percentage}%
                      </p>
                    </div>
                    <div className="p-6 text-center bg-white dark:bg-gray-800">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Grade</p>
                      <div className="mt-2">
                        <Badge className={`${getGradeColor(result.grade)} text-white text-lg px-4 py-1`}>
                          {result.grade}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 text-center bg-white dark:bg-gray-800">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Rank</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">
                        #{result.rank || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Subject-wise Marks */}
                  <div className="border-t p-6">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Subject-wise Performance</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <th className="text-left py-2 px-3">Subject</th>
                            <th className="text-center py-2 px-3">Marks Obtained</th>
                            <th className="text-center py-2 px-3">Max Marks</th>
                            <th className="text-center py-2 px-3">Percentage</th>
                            <th className="text-center py-2 px-3">Grade</th>
                            <th className="text-center py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.subjects?.map((subject, idx) => {
                            const subjectPct = subject.max_marks > 0 
                              ? ((subject.obtained_marks / subject.max_marks) * 100).toFixed(1) 
                              : 0;
                            const isPassing = subject.obtained_marks >= subject.passing_marks;
                            
                            return (
                              <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-3 font-medium">{subject.subject_name}</td>
                                <td className="py-3 px-3 text-center font-medium">
                                  {subject.obtained_marks}
                                </td>
                                <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">
                                  {subject.max_marks}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className={subjectPct >= 60 ? 'text-green-600' : subjectPct >= 33 ? 'text-yellow-600' : 'text-red-600'}>
                                    {subjectPct}%
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <Badge className={`${getGradeColor(subject.grade)} text-white`}>
                                    {subject.grade}
                                  </Badge>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {isPassing ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Overall Status */}
                  <div className={`p-4 ${result.is_pass ? 'bg-green-50 border-t border-green-200' : 'bg-red-50 border-t border-red-200'}`}>
                    <div className="flex items-center justify-center gap-2">
                      {result.is_pass ? (
                        <>
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <span className="font-bold text-green-700 text-lg">PASSED</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-6 w-6 text-red-600" />
                          <span className="font-bold text-red-700 text-lg">FAILED</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Results Published Yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Your examination results will appear here once they are published</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentResults;
