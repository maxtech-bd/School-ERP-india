import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Save,
  Send,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  GraduationCap,
  Printer,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const Results = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [examTerms, setExamTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urlParamsApplied, setUrlParamsApplied] = useState(false);
  const [schoolBranding, setSchoolBranding] = useState({
    name: 'School ERP System',
    address: '',
    contact: '',
    email: '',
    logo_url: ''
  });
  
  // Filters - initialize from URL params if present
  const [selectedExamTerm, setSelectedExamTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class_id') || '');
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section_id') || '');
  const incomingStudentId = searchParams.get('student_id');
  
  // Modals
  const [isExamTermDialogOpen, setIsExamTermDialogOpen] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewResultDialogOpen, setIsViewResultDialogOpen] = useState(false);
  const [viewingResult, setViewingResult] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  
  // Form states
  const [examTermForm, setExamTermForm] = useState({
    name: '',
    exam_type: 'unit_test',
    academic_year: '2024-2025',
    max_marks: 100,
    passing_percentage: 33,
    start_date: '',
    end_date: ''
  });
  
  const [marksEntry, setMarksEntry] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  
  const canEdit = ['super_admin', 'admin', 'principal', 'teacher'].includes(user?.role);
  const canPublish = ['super_admin', 'admin', 'principal'].includes(user?.role);

  const fetchSchoolBranding = useCallback(async () => {
    try {
      const response = await axios.get('/api/institution');
      if (response.data) {
        setSchoolBranding({
          name: response.data.name || 'School ERP System',
          address: response.data.address || '',
          contact: response.data.contact_phone || response.data.phone || '',
          email: response.data.contact_email || response.data.email || '',
          logo_url: response.data.logo_url || response.data.logo || ''
        });
      }
    } catch (error) {
      console.error('Error fetching school branding:', error);
    }
  }, []);

  const fetchExamTerms = useCallback(async () => {
    try {
      const response = await axios.get('/api/exam-terms');
      setExamTerms(response.data);
    } catch (error) {
      console.error('Error fetching exam terms:', error);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await axios.get('/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, []);

  const fetchSections = useCallback(async (classId) => {
    if (!classId) {
      setSections([]);
      return;
    }
    try {
      const response = await axios.get(`/api/sections?class_id=${classId}`);
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  }, []);

  const fetchSubjects = useCallback(async (classId) => {
    if (!classId) {
      setSubjects([]);
      return;
    }
    try {
      const response = await axios.get(`/api/subjects?class_id=${classId}`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, []);

  const fetchStudents = useCallback(async (classId, sectionId) => {
    if (!classId || !sectionId) {
      setStudents([]);
      return;
    }
    try {
      const response = await axios.get(`/api/students?class_id=${classId}&section_id=${sectionId}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      let url = '/api/student-results?';
      if (selectedExamTerm) url += `exam_term_id=${selectedExamTerm}&`;
      if (selectedClass) url += `class_id=${selectedClass}&`;
      if (selectedSection) url += `section_id=${selectedSection}&`;
      
      const response = await axios.get(url);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  }, [selectedExamTerm, selectedClass, selectedSection]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchExamTerms(), fetchClasses(), fetchSchoolBranding()]);
      setLoading(false);
    };
    loadData();
  }, [fetchExamTerms, fetchClasses, fetchSchoolBranding]);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
      fetchSubjects(selectedClass);
    }
  }, [selectedClass, fetchSections, fetchSubjects]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents(selectedClass, selectedSection);
    }
  }, [selectedClass, selectedSection, fetchStudents]);

  useEffect(() => {
    if (selectedExamTerm) {
      fetchResults();
    }
  }, [selectedExamTerm, selectedClass, selectedSection, fetchResults]);

  // Auto-select first exam term and show student result when coming from StudentList
  useEffect(() => {
    if (!urlParamsApplied && incomingStudentId && examTerms.length > 0 && results.length > 0) {
      setSelectedStudent(incomingStudentId);
      const studentResult = results.find(r => r.student_id === incomingStudentId);
      if (studentResult) {
        setViewingResult(studentResult);
        setIsViewResultDialogOpen(true);
        setUrlParamsApplied(true);
      }
    }
  }, [incomingStudentId, examTerms, results, urlParamsApplied]);

  // Auto-select first exam term when coming from StudentList
  useEffect(() => {
    if (incomingStudentId && examTerms.length > 0 && !selectedExamTerm) {
      setSelectedExamTerm(examTerms[0].id);
    }
  }, [incomingStudentId, examTerms, selectedExamTerm]);

  // Reset selected student when changing class/section
  useEffect(() => {
    if (!incomingStudentId) {
      setSelectedStudent('');
    }
  }, [selectedClass, selectedSection, incomingStudentId]);

  const handleCreateExamTerm = async () => {
    try {
      await axios.post('/api/exam-terms', examTermForm);
      toast.success('Exam term created successfully');
      setIsExamTermDialogOpen(false);
      setExamTermForm({
        name: '',
        exam_type: 'unit_test',
        academic_year: '2024-2025',
        max_marks: 100,
        passing_percentage: 33,
        start_date: '',
        end_date: ''
      });
      fetchExamTerms();
    } catch (error) {
      toast.error('Failed to create exam term');
    }
  };

  const handleDeleteExamTerm = async (termId) => {
    if (!window.confirm('Are you sure you want to delete this exam term?')) return;
    try {
      await axios.delete(`/api/exam-terms/${termId}`);
      toast.success('Exam term deleted successfully');
      fetchExamTerms();
    } catch (error) {
      toast.error('Failed to delete exam term');
    }
  };

  const handleTogglePublishExamTerm = async (term) => {
    const action = term.is_published ? 'unpublish' : 'publish';
    if (!window.confirm(`Are you sure you want to ${action} this exam term?`)) return;
    try {
      await axios.put(`/api/exam-terms/${term.id}`, {
        ...term,
        is_published: !term.is_published
      });
      toast.success(`Exam term ${action}ed successfully`);
      fetchExamTerms();
    } catch (error) {
      toast.error(`Failed to ${action} exam term`);
    }
  };

  const handleSaveMarks = async (studentId, studentName) => {
    if (!selectedExamTerm) {
      toast.error('Please select an exam term first');
      return;
    }
    
    const studentMarks = marksEntry[studentId] || {};
    const subjectsData = subjects.map(subj => ({
      subject_id: subj.id,
      subject_name: subj.name,
      obtained_marks: parseFloat(studentMarks[subj.id]) || 0,
      max_marks: 100,
      passing_marks: 33
    }));

    try {
      await axios.post('/api/student-results', {
        exam_term_id: selectedExamTerm,
        student_id: studentId,
        subjects: subjectsData
      });
      toast.success(`Marks saved for ${studentName}`);
      fetchResults();
    } catch (error) {
      toast.error('Failed to save marks');
    }
  };

  const handlePublishResult = async (resultId) => {
    try {
      await axios.put(`/api/student-results/${resultId}/publish`);
      toast.success('Result published successfully');
      fetchResults();
    } catch (error) {
      toast.error('Failed to publish result');
    }
  };

  const handlePublishAll = async () => {
    if (!selectedExamTerm) {
      toast.error('Please select an exam term');
      return;
    }
    try {
      let url = `/api/student-results/publish-bulk?exam_term_id=${selectedExamTerm}`;
      if (selectedClass) url += `&class_id=${selectedClass}`;
      if (selectedSection) url += `&section_id=${selectedSection}`;
      
      await axios.put(url);
      toast.success('All results published successfully');
      fetchResults();
    } catch (error) {
      toast.error('Failed to publish results');
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedClass || !selectedSection) {
      toast.error('Please select class and section first');
      return;
    }
    try {
      const response = await axios.get(
        `/api/student-results/download-template?class_id=${selectedClass}&section_id=${selectedSection}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'results_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleUploadResults = async () => {
    if (!uploadFile || !selectedExamTerm) {
      toast.error('Please select a file and exam term');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', uploadFile);
    
    try {
      const response = await axios.post(
        `/api/student-results/upload-excel?exam_term_id=${selectedExamTerm}&class_id=${selectedClass}&section_id=${selectedSection}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success(`Upload complete: ${response.data.success_count} successful, ${response.data.error_count} errors`);
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      fetchResults();
    } catch (error) {
      toast.error('Failed to upload results');
    }
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    try {
      await axios.delete(`/api/student-results/${resultId}`);
      toast.success('Result deleted successfully');
      fetchResults();
    } catch (error) {
      toast.error('Failed to delete result');
    }
  };

  const handleViewResult = (result) => {
    setViewingResult(result);
    setIsViewResultDialogOpen(true);
  };

  const handlePrintResult = (result) => {
    const examTerm = examTerms.find(t => t.id === result.exam_term_id);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Result Card - ${result.student_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #10b981; }
            .header-content { display: flex; align-items: center; justify-content: center; gap: 20px; }
            .school-logo { width: 80px; height: 80px; object-fit: contain; }
            .school-info { text-align: center; }
            .school-name { font-size: 28px; font-weight: bold; color: #1f2937; text-transform: uppercase; }
            .school-address { font-size: 14px; color: #6b7280; margin-top: 4px; }
            .school-contact { font-size: 12px; color: #6b7280; margin-top: 2px; }
            .result-title { font-size: 20px; font-weight: 600; color: #10b981; margin-top: 15px; text-transform: uppercase; letter-spacing: 2px; }
            .exam-info { font-size: 16px; color: #4b5563; margin-top: 8px; }
            .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px; }
            .info-item { }
            .info-label { font-size: 12px; color: #6b7280; }
            .info-value { font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; }
            td { padding: 12px; border: 1px solid #e5e7eb; }
            .text-center { text-align: center; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 8px; }
            .summary-item { text-align: center; }
            .summary-label { font-size: 12px; color: #6b7280; }
            .summary-value { font-size: 20px; font-weight: bold; color: #1f2937; }
            .pass { color: #10b981; }
            .fail { color: #ef4444; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
            .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 40px; }
            .signature-box { text-align: center; }
            .signature-line { border-top: 1px solid #374151; width: 150px; margin-bottom: 8px; }
            .signature-label { font-size: 12px; color: #6b7280; }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-content">
              ${schoolBranding.logo_url ? `<img src="${schoolBranding.logo_url}" alt="School Logo" class="school-logo" />` : ''}
              <div class="school-info">
                <div class="school-name">${schoolBranding.name}</div>
                ${schoolBranding.address ? `<div class="school-address">${schoolBranding.address}</div>` : ''}
                ${schoolBranding.contact || schoolBranding.email ? `<div class="school-contact">${[schoolBranding.contact, schoolBranding.email].filter(Boolean).join(' | ')}</div>` : ''}
              </div>
            </div>
            <div class="result-title">Student Result Card</div>
            <div class="exam-info">${examTerm?.name || 'Examination'} - ${examTerm?.academic_year || ''}</div>
          </div>
          
          <div class="student-info">
            <div class="info-item">
              <div class="info-label">Student Name</div>
              <div class="info-value">${result.student_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Admission No</div>
              <div class="info-value">${result.admission_no}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Class</div>
              <div class="info-value">${result.class_name} - ${result.section_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Rank</div>
              <div class="info-value">#${result.rank || 'N/A'}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th class="text-center">Marks Obtained</th>
                <th class="text-center">Max Marks</th>
                <th class="text-center">Percentage</th>
                <th class="text-center">Grade</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${result.subjects?.map(s => `
                <tr>
                  <td>${s.subject_name}</td>
                  <td class="text-center">${s.obtained_marks}</td>
                  <td class="text-center">${s.max_marks}</td>
                  <td class="text-center">${s.max_marks > 0 ? ((s.obtained_marks / s.max_marks) * 100).toFixed(1) : 0}%</td>
                  <td class="text-center">${s.grade || 'N/A'}</td>
                  <td class="text-center ${s.obtained_marks >= s.passing_marks ? 'pass' : 'fail'}">${s.obtained_marks >= s.passing_marks ? 'PASS' : 'FAIL'}</td>
                </tr>
              `).join('') || '<tr><td colspan="6" class="text-center">No subjects</td></tr>'}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Total Marks</div>
              <div class="summary-value">${result.total_marks} / ${result.total_max_marks}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Percentage</div>
              <div class="summary-value">${result.percentage}%</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Grade</div>
              <div class="summary-value">${result.grade}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Result</div>
              <div class="summary-value ${result.is_pass ? 'pass' : 'fail'}">${result.is_pass ? 'PASSED' : 'FAILED'}</div>
            </div>
          </div>
          
          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Class Teacher</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Principal</div>
            </div>
          </div>
          
          <div class="footer">
            ${schoolBranding.name} | Generated on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

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

  const getStatusBadge = (status) => {
    const styles = {
      'draft': 'bg-gray-100 text-gray-700',
      'submitted': 'bg-yellow-100 text-yellow-700',
      'published': 'bg-green-100 text-green-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    resultsEntered: results.length,
    published: results.filter(r => r.status === 'published').length,
    avgPercentage: results.length > 0 
      ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1) 
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Student Results</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track student examination results</p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <Dialog open={isExamTermDialogOpen} onOpenChange={setIsExamTermDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Exam Term</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Exam Name</Label>
                    <Input
                      value={examTermForm.name}
                      onChange={(e) => setExamTermForm({...examTermForm, name: e.target.value})}
                      placeholder="e.g., Mid-term Exam 2024"
                    />
                  </div>
                  <div>
                    <Label>Exam Type</Label>
                    <Select
                      value={examTermForm.exam_type}
                      onValueChange={(value) => setExamTermForm({...examTermForm, exam_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit_test">Unit Test</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="mid_term">Mid-term</SelectItem>
                        <SelectItem value="final">Final Exam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Academic Year</Label>
                    <Input
                      value={examTermForm.academic_year}
                      onChange={(e) => setExamTermForm({...examTermForm, academic_year: e.target.value})}
                      placeholder="2024-2025"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max Marks</Label>
                      <Input
                        type="number"
                        value={examTermForm.max_marks}
                        onChange={(e) => setExamTermForm({...examTermForm, max_marks: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Passing %</Label>
                      <Input
                        type="number"
                        value={examTermForm.passing_percentage}
                        onChange={(e) => setExamTermForm({...examTermForm, passing_percentage: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={examTermForm.start_date}
                        onChange={(e) => setExamTermForm({...examTermForm, start_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={examTermForm.end_date}
                        onChange={(e) => setExamTermForm({...examTermForm, end_date: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExamTermDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateExamTerm}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
            
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Results from Excel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-600">
                    Upload an Excel file with student results. Make sure to download the template first.
                  </p>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUploadResults}>Upload</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {canPublish && (
              <Button size="sm" onClick={handlePublishAll} className="bg-emerald-600 hover:bg-emerald-700">
                <Send className="h-4 w-4 mr-2" />
                Publish All
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Results Entered</p>
                <p className="text-xl font-bold">{stats.resultsEntered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-xl font-bold">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg %</p>
                <p className="text-xl font-bold">{stats.avgPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm">Exam Term</Label>
              <Select value={selectedExamTerm} onValueChange={setSelectedExamTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {examTerms.map(term => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name} ({term.academic_year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(sec => (
                    <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Student (Optional)</Label>
              <Select value={selectedStudent || 'all'} onValueChange={(val) => setSelectedStudent(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.admission_no})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exam Terms List */}
      {canEdit && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Exam Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Type</th>
                    <th className="text-left py-2 px-3 font-medium">Year</th>
                    <th className="text-left py-2 px-3 font-medium">Max Marks</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                    <th className="text-right py-2 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {examTerms.map(term => (
                    <tr key={term.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium">{term.name}</td>
                      <td className="py-2 px-3 capitalize">{term.exam_type?.replace('_', ' ')}</td>
                      <td className="py-2 px-3">{term.academic_year}</td>
                      <td className="py-2 px-3">{term.max_marks}</td>
                      <td className="py-2 px-3">
                        <Badge className={term.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {term.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublishExamTerm(term)}
                            className={term.is_published ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}
                            title={term.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {term.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExamTerm(term.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {examTerms.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No exam terms created yet. Click "New Exam" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mark Entry Table */}
      {canEdit && selectedExamTerm && selectedClass && selectedSection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Mark Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-3 font-medium sticky left-0 bg-gray-50">Student</th>
                    <th className="text-left py-3 px-3 font-medium">Adm No</th>
                    {subjects.map(subj => (
                      <th key={subj.id} className="text-center py-3 px-3 font-medium min-w-[80px]">
                        {subj.subject_name || subj.name}
                      </th>
                    ))}
                    <th className="text-center py-3 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => {
                    const existingResult = results.find(r => r.student_id === student.id);
                    return (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium sticky left-0 bg-white">
                          {student.name}
                        </td>
                        <td className="py-2 px-3 text-gray-600">{student.admission_no}</td>
                        {subjects.map(subj => {
                          const existingMark = existingResult?.subjects?.find(s => s.subject_id === subj.id || s.subject_name === subj.name);
                          return (
                            <td key={subj.id} className="py-2 px-3 text-center">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                className="w-16 text-center mx-auto"
                                defaultValue={existingMark?.obtained_marks || ''}
                                onChange={(e) => {
                                  setMarksEntry(prev => ({
                                    ...prev,
                                    [student.id]: {
                                      ...(prev[student.id] || {}),
                                      [subj.id]: e.target.value
                                    }
                                  }));
                                }}
                              />
                            </td>
                          );
                        })}
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveMarks(student.id, student.name)}
                              className="text-emerald-600"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            {existingResult && existingResult.status !== 'published' && canPublish && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePublishResult(existingResult.id)}
                                className="text-blue-600"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={subjects.length + 3} className="py-8 text-center text-gray-500">
                        No students found in this class/section
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary Table */}
      {selectedExamTerm && results.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Results Summary
              {selectedStudent && (
                <Badge variant="outline" className="ml-2">
                  Filtered by student
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-3 font-medium">Rank</th>
                    <th className="text-left py-3 px-3 font-medium">Student</th>
                    <th className="text-left py-3 px-3 font-medium">Class</th>
                    <th className="text-center py-3 px-3 font-medium">Total</th>
                    <th className="text-center py-3 px-3 font-medium">Percentage</th>
                    <th className="text-center py-3 px-3 font-medium">Grade</th>
                    <th className="text-center py-3 px-3 font-medium">Status</th>
                    <th className="text-right py-3 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results
                    .filter(r => !selectedStudent || r.student_id === selectedStudent)
                    .map((result, index) => (
                    <tr key={result.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <span className="font-bold text-gray-700">#{result.rank || index + 1}</span>
                      </td>
                      <td className="py-2 px-3">
                        <div>
                          <p className="font-medium">{result.student_name}</p>
                          <p className="text-xs text-gray-500">{result.admission_no}</p>
                        </div>
                      </td>
                      <td className="py-2 px-3">{result.class_name} - {result.section_name}</td>
                      <td className="py-2 px-3 text-center">
                        {result.total_marks} / {result.total_max_marks}
                      </td>
                      <td className="py-2 px-3 text-center font-medium">
                        {result.percentage}%
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge className={`${getGradeColor(result.grade)} text-white`}>
                          {result.grade}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge className={getStatusBadge(result.status)}>
                          {result.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewResult(result)}
                            className="text-blue-600"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePrintResult(result)}
                            className="text-emerald-600"
                            title="Print Result"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          {canEdit && result.status !== 'published' && canPublish && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePublishResult(result.id)}
                              className="text-purple-600"
                              title="Publish"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteResult(result.id)}
                              className="text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedExamTerm && (
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Select an Exam Term</h3>
            <p className="text-gray-500">Choose an exam term from the filters above to view or enter results</p>
          </CardContent>
        </Card>
      )}

      {/* View Result Modal */}
      <Dialog open={isViewResultDialogOpen} onOpenChange={setIsViewResultDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" />
              <span>Student Result Details</span>
            </DialogTitle>
          </DialogHeader>
          {viewingResult && (
            <div className="space-y-6">
              {/* Student Info Header */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Student Name</p>
                    <p className="font-semibold text-gray-900">{viewingResult.student_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Admission No</p>
                    <p className="font-semibold text-gray-900">{viewingResult.admission_no}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Class</p>
                    <p className="font-semibold text-gray-900">{viewingResult.class_name} - {viewingResult.section_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rank</p>
                    <p className="font-semibold text-gray-900">#{viewingResult.rank || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Subject-wise Results Table */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                  Subject-wise Performance
                </h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-3 px-4 font-medium">Subject</th>
                        <th className="text-center py-3 px-4 font-medium">Marks</th>
                        <th className="text-center py-3 px-4 font-medium">Max</th>
                        <th className="text-center py-3 px-4 font-medium">%</th>
                        <th className="text-center py-3 px-4 font-medium">Grade</th>
                        <th className="text-center py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingResult.subjects?.map((subject, idx) => {
                        const pct = subject.max_marks > 0 
                          ? ((subject.obtained_marks / subject.max_marks) * 100).toFixed(1) 
                          : 0;
                        const isPassing = subject.obtained_marks >= subject.passing_marks;
                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{subject.subject_name}</td>
                            <td className="py-3 px-4 text-center">{subject.obtained_marks}</td>
                            <td className="py-3 px-4 text-center text-gray-600">{subject.max_marks}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={pct >= 60 ? 'text-green-600' : pct >= 33 ? 'text-yellow-600' : 'text-red-600'}>
                                {pct}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={`${getGradeColor(subject.grade)} text-white`}>
                                {subject.grade || 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
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

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs text-blue-600 mb-1">Total Marks</p>
                  <p className="text-xl font-bold text-blue-700">
                    {viewingResult.total_marks} / {viewingResult.total_max_marks}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-xs text-purple-600 mb-1">Percentage</p>
                  <p className="text-xl font-bold text-purple-700">{viewingResult.percentage}%</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <p className="text-xs text-amber-600 mb-1">Grade</p>
                  <p className="text-xl font-bold text-amber-700">{viewingResult.grade}</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${viewingResult.is_pass ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-xs mb-1 ${viewingResult.is_pass ? 'text-green-600' : 'text-red-600'}`}>Result</p>
                  <p className={`text-xl font-bold ${viewingResult.is_pass ? 'text-green-700' : 'text-red-700'}`}>
                    {viewingResult.is_pass ? 'PASSED' : 'FAILED'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => viewingResult && handlePrintResult(viewingResult)}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => setIsViewResultDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Results;
