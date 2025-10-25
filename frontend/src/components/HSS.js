import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { 
  Award,
  UserPlus,
  FileText,
  Users,
  Download,
  Upload,
  BookOpen,
  GraduationCap,
  CheckCircle,
  X,
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  Tag,
  Pencil,
  Trash2,
  ArrowLeft
} from 'lucide-react';

// HSS Main Dashboard Component  
const HSSMainView = () => {
  const navigate = useNavigate();
  const [activeStudents, setActiveStudents] = useState(0);
  const [certificates, setCertificates] = useState(0);

  // Conduct Certificate States
  const [conductView, setConductView] = useState('list'); // 'list' or 'form'
  const [conductRecords, setConductRecords] = useState([]);
  const [conductSearchTerm, setConductSearchTerm] = useState('');
  const [conductStatusFilter, setConductStatusFilter] = useState('all');
  const [selectedConductStudent, setSelectedConductStudent] = useState(null);
  const [showConductStudentModal, setShowConductStudentModal] = useState(false);
  const [conductLoading, setConductLoading] = useState(false);
  const [showConductViewModal, setShowConductViewModal] = useState(false);
  const [selectedConductCertificate, setSelectedConductCertificate] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  
  // Tags Management States
  const [tags, setTags] = useState([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [tagCategoryFilter, setTagCategoryFilter] = useState('');
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedStudentForTag, setSelectedStudentForTag] = useState('');
  const [selectedTagForStudent, setSelectedTagForStudent] = useState('');
  const [selectedStaffForTag, setSelectedStaffForTag] = useState('');
  const [selectedTagForStaff, setSelectedTagForStaff] = useState('');
  
  const [conductFormData, setConductFormData] = useState({
    student_id: '',
    student_name: '',
    admission_no: '',
    date_of_admission: '',
    current_class: '',
    current_section: '',
    conduct_rating: 'Excellent',
    character_remarks: '',
    behavior_notes: '',
    academic_performance: '',
    extracurricular_activities: '',
    attendance_percentage: '',
    status: 'draft'
  });

  useEffect(() => {
    // Fetch HSS module data
    fetchHSSData();
    fetchConductCertificates();
    fetchStudents();
    fetchTags();
    fetchStaff();
  }, []);

  const fetchHSSData = async () => {
    // This will be connected to actual API calls
    setActiveStudents(156);
    setCertificates(45);
  };

  // Conduct Certificate Functions
  const fetchConductCertificates = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/conduct-certificates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConductRecords(data.conduct_certificates || []);
      } else {
        console.error('Failed to fetch conduct certificates');
        setConductRecords([]);
      }
    } catch (error) {
      console.error('Failed to fetch conduct certificates:', error);
      setConductRecords([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(Array.isArray(data) ? data : []);
        setStudents(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch students');
        setAvailableStudents([]);
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setAvailableStudents([]);
      setStudents([]);
    }
  };

  // Tags Management Functions
  const fetchTags = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/tags`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTags(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch tags');
        setTags([]);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setTags([]);
    }
  };

  const fetchStaff = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/staff`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch staff');
        setStaff([]);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      setStaff([]);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Are you sure you want to delete this tag? It will be removed from all students and staff.')) {
      return;
    }

    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Tag deleted successfully');
        fetchTags(); // Refresh tags list
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to delete tag');
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('Failed to delete tag');
    }
  };

  const handleAssignTagToStudent = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/students/${selectedStudentForTag}/tags/${selectedTagForStudent}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Tag assigned to student successfully');
        setSelectedStudentForTag('');
        setSelectedTagForStudent('');
        fetchStudents(); // Refresh to show updated tags
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to assign tag');
      }
    } catch (error) {
      console.error('Failed to assign tag to student:', error);
      alert('Failed to assign tag to student');
    }
  };

  const handleAssignTagToStaff = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/staff/${selectedStaffForTag}/tags/${selectedTagForStaff}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Tag assigned to staff successfully');
        setSelectedStaffForTag('');
        setSelectedTagForStaff('');
        fetchStaff(); // Refresh to show updated tags
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to assign tag');
      }
    } catch (error) {
      console.error('Failed to assign tag to staff:', error);
      alert('Failed to assign tag to staff');
    }
  };

  const getTagUsageCount = (tagId, entityType) => {
    if (entityType === 'student') {
      return students.filter(student => student.tags && student.tags.includes(tagId)).length;
    } else if (entityType === 'staff') {
      return staff.filter(member => member.tags && member.tags.includes(tagId)).length;
    }
    return 0;
  };

  const handleConductSubmit = async (status = 'issued') => {
    try {
      setConductLoading(true);
      
      // Validate required fields
      if (!conductFormData.student_name || !conductFormData.admission_no || 
          !conductFormData.current_class || !conductFormData.current_section || 
          !conductFormData.character_remarks) {
        toast.error('Please fill in all required fields');
        return;
      }

      const submitData = {
        ...conductFormData,
        status,
        attendance_percentage: parseFloat(conductFormData.attendance_percentage) || null
      };

      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/conduct-certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Conduct Certificate ${status === 'draft' ? 'saved as draft' : 'issued'} successfully!`);
        setConductView('list');
        resetConductForm();
        fetchConductCertificates();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create conduct certificate');
      }
    } catch (error) {
      console.error('Failed to create conduct certificate:', error);
      toast.error('Failed to create conduct certificate');
    } finally {
      setConductLoading(false);
    }
  };

  const resetConductForm = () => {
    setConductFormData({
      student_id: '',
      student_name: '',
      admission_no: '',
      date_of_admission: '',
      current_class: '',
      current_section: '',
      conduct_rating: 'Excellent',
      character_remarks: '',
      behavior_notes: '',
      academic_performance: '',
      extracurricular_activities: '',
      attendance_percentage: '',
      status: 'draft'
    });
    setSelectedConductStudent(null);
  };

  const selectConductStudent = (student) => {
    setConductFormData({
      ...conductFormData,
      student_id: student.id,
      student_name: student.name,
      admission_no: student.admission_no,
      date_of_admission: student.created_at ? new Date(student.created_at).toISOString().split('T')[0] : '',
      current_class: student.class_id || '',
      current_section: student.section_id || ''
    });
    setSelectedConductStudent(student);
    setShowConductStudentModal(false);
    toast.success(`Student ${student.name} selected successfully!`);
  };

  const handleViewConductCertificate = async (ccId) => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/conduct-certificates/${ccId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const ccData = await response.json();
        setSelectedConductCertificate(ccData);
        setShowConductViewModal(true);
      } else {
        toast.error('Failed to load Conduct Certificate details');
      }
    } catch (error) {
      console.error('Failed to fetch conduct certificate details:', error);
      toast.error('Failed to load Conduct Certificate details');
    }
  };

  const handlePDFConductCertificate = (cc) => {
    try {
      const printContent = generateConductCertificateContent(cc);
      
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Conduct Certificate - ${cc.admission_no}</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .certificate { max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #333; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .school-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .school-address { font-size: 14px; color: #666; }
              .title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; }
              .content { margin: 20px 0; }
              .field { margin: 10px 0; }
              .label { font-weight: bold; display: inline-block; min-width: 200px; }
              .footer { margin-top: 40px; display: flex; justify-content: space-between; }
              .signature { text-align: center; border-top: 1px solid #333; width: 200px; padding-top: 5px; }
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Certificate</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      toast.success('PDF view opened in new tab');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handlePrintConductCertificate = (cc) => {
    try {
      const printContent = generateConductCertificateContent(cc);
      
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Conduct Certificate - ${cc.admission_no}</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .certificate { max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #333; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .school-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .school-address { font-size: 14px; color: #666; }
              .title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; }
              .content { margin: 20px 0; }
              .field { margin: 10px 0; }
              .label { font-weight: bold; display: inline-block; min-width: 200px; }
              .footer { margin-top: 40px; display: flex; justify-content: space-between; }
              .signature { text-align: center; border-top: 1px solid #333; width: 200px; padding-top: 5px; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.print();
      };
      
      toast.success('Print dialog opened');
    } catch (error) {
      console.error('Failed to print conduct certificate:', error);
      toast.error('Failed to print Conduct Certificate');
    }
  };

  const generateConductCertificateContent = (cc) => {
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <div class="certificate">
        <div class="header">
          <div class="school-name">DEMO SCHOOL</div>
          <div class="school-address">123 Education Street, Learning City</div>
          <div class="school-address">Phone: (555) 123-4567 | Email: info@demoschool.edu</div>
        </div>
        
        <div class="title">CHARACTER & CONDUCT CERTIFICATE</div>
        
        <div class="content">
          <div class="field">
            <span class="label">Student Name:</span> ${cc.student_name || 'N/A'}
          </div>
          <div class="field">
            <span class="label">Admission Number:</span> ${cc.admission_no || 'N/A'}
          </div>
          <div class="field">
            <span class="label">Date of Admission:</span> ${cc.date_of_admission ? new Date(cc.date_of_admission).toLocaleDateString() : 'N/A'}
          </div>
          <div class="field">
            <span class="label">Current Class:</span> ${cc.current_class || 'N/A'}
          </div>
          <div class="field">
            <span class="label">Current Section:</span> ${cc.current_section || 'N/A'}
          </div>
          <div class="field">
            <span class="label">Conduct Rating:</span> ${cc.conduct_rating || 'N/A'}
          </div>
          <div class="field">
            <span class="label">Character Remarks:</span> ${cc.character_remarks || 'N/A'}
          </div>
          ${cc.behavior_notes ? `<div class="field"><span class="label">Behavior Notes:</span> ${cc.behavior_notes}</div>` : ''}
          ${cc.academic_performance ? `<div class="field"><span class="label">Academic Performance:</span> ${cc.academic_performance}</div>` : ''}
          ${cc.extracurricular_activities ? `<div class="field"><span class="label">Extracurricular Activities:</span> ${cc.extracurricular_activities}</div>` : ''}
          ${cc.attendance_percentage ? `<div class="field"><span class="label">Attendance:</span> ${cc.attendance_percentage}%</div>` : ''}
          <div class="field">
            <span class="label">Certificate Status:</span> ${cc.status === 'issued' ? 'ISSUED' : cc.status.toUpperCase()}
          </div>
          ${cc.issue_date ? `<div class="field"><span class="label">Issue Date:</span> ${new Date(cc.issue_date).toLocaleDateString()}</div>` : ''}
          ${cc.valid_until ? `<div class="field"><span class="label">Valid Until:</span> ${new Date(cc.valid_until).toLocaleDateString()}</div>` : ''}
        </div>
        
        <div class="footer">
          <div class="signature">
            <div>Class Teacher</div>
          </div>
          <div class="signature">
            <div>Principal</div>
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          Generated on: ${currentDate} | Certificate ID: ${cc.id}
        </div>
      </div>
    `;
  };

  // Filter conduct records based on search and status
  const filteredConductRecords = conductRecords.filter(cc => {
    const matchesSearch = conductSearchTerm === '' || 
      cc.student_name?.toLowerCase().includes(conductSearchTerm.toLowerCase()) ||
      cc.admission_no?.toLowerCase().includes(conductSearchTerm.toLowerCase());
    
    const matchesStatus = conductStatusFilter === 'all' || cc.status === conductStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HSS Module</h1>
          <p className="text-gray-600 mt-1">Higher Secondary School management and certification</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button 
            className="bg-emerald-500 hover:bg-emerald-600"
            onClick={() => navigate('/hss/enroll/new')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            New Enrollment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-3xl font-bold text-gray-900">{activeStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificates Issued</p>
                <p className="text-3xl font-bold text-gray-900">{certificates}</p>
              </div>
              <Award className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Transfers</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Graduations</p>
                <p className="text-3xl font-bold text-gray-900">23</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HSS Module Tabs */}
      <Tabs defaultValue="enrollment" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="enrollment">Enroll Student</TabsTrigger>
          <TabsTrigger value="register">Admission Register</TabsTrigger>
          <TabsTrigger value="transfer">Transfer Certificate</TabsTrigger>
          <TabsTrigger value="conduct">Conduct Certificate</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidated Report</TabsTrigger>
          <TabsTrigger value="tags">Set Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <UserPlus className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Enroll New Student</h3>
                <p className="text-gray-600 mb-4">Add students to Higher Secondary School programs</p>
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Start Enrollment Process
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admission Register</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Admission Register</h3>
                <p className="text-gray-600 mb-4">View and manage admission records</p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline">View Register</Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">Add Entry</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Transfer Certificate</h3>
                <p className="text-gray-600 mb-4">Generate and manage transfer certificates</p>
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Generate TC
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conduct" className="space-y-4">
          {conductView === 'list' ? (
            // Conduct Certificate List View
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Conduct Certificates</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Manage character and conduct certificates</p>
                    </div>
                    <Button 
                      onClick={() => setConductView('form')}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Certificate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter Controls */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by student name or admission number..."
                        value={conductSearchTerm}
                        onChange={(e) => setConductSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <select
                        value={conductStatusFilter}
                        onChange={(e) => setConductStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="issued">Issued</option>
                      </select>
                    </div>
                  </div>

                  {/* Certificates List */}
                  {conductRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Conduct Certificates</h3>
                      <p className="text-gray-600 mb-4">Start by creating your first conduct certificate</p>
                      <Button 
                        onClick={() => setConductView('form')}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Certificate
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Section</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conduct Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredConductRecords.map((cc) => (
                            <tr key={cc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{cc.student_name}</div>
                                  <div className="text-sm text-gray-500">Adm: {cc.admission_no}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{cc.current_class} - {cc.current_section}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={
                                  cc.conduct_rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                                  cc.conduct_rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                                  cc.conduct_rating === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {cc.conduct_rating}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={
                                  cc.status === 'issued' ? 'bg-green-100 text-green-800' :
                                  cc.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {cc.status === 'pending_approval' ? 'Pending Approval' : 
                                   cc.status.charAt(0).toUpperCase() + cc.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewConductCertificate(cc.id)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handlePDFConductCertificate(cc)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  PDF
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handlePrintConductCertificate(cc)}
                                >
                                  <Printer className="h-4 w-4 mr-1" />
                                  Print
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            // Conduct Certificate Form View
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Issue Conduct Certificate</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Fill in the details to issue a character and conduct certificate</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setConductView('list');
                        resetConductForm();
                        toast.info('Returned to Conduct Certificate list.');
                      }}
                    >
                      Back to List
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleConductSubmit} className="space-y-6">
                    {/* Student Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Student Selection</h3>
                      <div className="flex items-center space-x-4">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setShowConductStudentModal(true)}
                          className="flex-shrink-0"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Select Student
                        </Button>
                        {selectedConductStudent && (
                          <div className="bg-white p-3 rounded-lg border flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{selectedConductStudent.name}</p>
                                <p className="text-sm text-gray-500">Admission: {selectedConductStudent.admission_no}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedConductStudent(null);
                                  resetConductForm();
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student Name *
                        </label>
                        <input
                          type="text"
                          value={conductFormData.student_name}
                          onChange={(e) => setConductFormData({...conductFormData, student_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Student's full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admission Number *
                        </label>
                        <input
                          type="text"
                          value={conductFormData.admission_no}
                          onChange={(e) => setConductFormData({...conductFormData, admission_no: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., ADM001"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Admission
                        </label>
                        <input
                          type="date"
                          value={conductFormData.date_of_admission}
                          onChange={(e) => setConductFormData({...conductFormData, date_of_admission: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Class *
                        </label>
                        <input
                          type="text"
                          value={conductFormData.current_class}
                          onChange={(e) => setConductFormData({...conductFormData, current_class: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., 10, 11, 12"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Section *
                        </label>
                        <input
                          type="text"
                          value={conductFormData.current_section}
                          onChange={(e) => setConductFormData({...conductFormData, current_section: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., A, B, Science"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conduct Rating *
                        </label>
                        <select
                          value={conductFormData.conduct_rating}
                          onChange={(e) => setConductFormData({...conductFormData, conduct_rating: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        >
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Needs Improvement">Needs Improvement</option>
                        </select>
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Character Remarks *
                        </label>
                        <textarea
                          value={conductFormData.character_remarks}
                          onChange={(e) => setConductFormData({...conductFormData, character_remarks: e.target.value})}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter character and conduct remarks..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Behavior Notes
                        </label>
                        <textarea
                          value={conductFormData.behavior_notes}
                          onChange={(e) => setConductFormData({...conductFormData, behavior_notes: e.target.value})}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Additional behavior observations..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Academic Performance
                          </label>
                          <textarea
                            value={conductFormData.academic_performance}
                            onChange={(e) => setConductFormData({...conductFormData, academic_performance: e.target.value})}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Academic achievements and performance..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Extracurricular Activities
                          </label>
                          <textarea
                            value={conductFormData.extracurricular_activities}
                            onChange={(e) => setConductFormData({...conductFormData, extracurricular_activities: e.target.value})}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Sports, clubs, competitions participated..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attendance Percentage
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={conductFormData.attendance_percentage}
                          onChange={(e) => setConductFormData({...conductFormData, attendance_percentage: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., 95.5"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-6">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setConductView('list');
                          resetConductForm();
                        }}
                      >
                        Cancel
                      </Button>
                      
                      <div className="flex space-x-3">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => handleConductSubmit('draft')}
                          disabled={conductLoading}
                        >
                          {conductLoading ? 'Saving...' : 'Save Draft'}
                        </Button>
                        
                        <Button 
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-600"
                          disabled={conductLoading}
                        >
                          {conductLoading ? 'Issuing...' : 'Issue Certificate'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="consolidated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consolidated Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Consolidated Report</h3>
                <p className="text-gray-600 mb-4">Generate comprehensive HSS reports</p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline">Preview Report</Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">Generate Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Set Tags</CardTitle>
              <Button 
                onClick={() => setShowCreateTagModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </CardHeader>
            <CardContent>
              {/* Tags Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={tagSearchTerm}
                      onChange={(e) => setTagSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select 
                  value={tagCategoryFilter}
                  onChange={(e) => setTagCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="achievement">Achievement</option>
                  <option value="special">Special Needs</option>
                </select>
              </div>

              {/* Tags List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tags
                  .filter(tag => 
                    (!tagSearchTerm || tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())) &&
                    (!tagCategoryFilter || tag.category === tagCategoryFilter)
                  )
                  .map((tag) => (
                    <Card key={tag.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{backgroundColor: tag.color}}
                            ></div>
                            <h3 className="font-medium text-gray-900">{tag.name}</h3>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingTag(tag);
                                setShowCreateTagModal(true);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTag(tag.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs mb-2">
                          {tag.category}
                        </Badge>
                        {tag.description && (
                          <p className="text-sm text-gray-600 mb-3">{tag.description}</p>
                        )}
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Students: {getTagUsageCount(tag.id, 'student')}</span>
                          <span>Staff: {getTagUsageCount(tag.id, 'staff')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Empty State */}
              {tags.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Tags Found</h3>
                  <p className="text-gray-600 mb-4">Create your first tag to categorize students and staff</p>
                  <Button 
                    onClick={() => setShowCreateTagModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tag
                  </Button>
                </div>
              )}

              {/* Tag Assignment Section */}
              {tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Tag Assignment</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Student Assignment */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Assign Tags to Students</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <select 
                            value={selectedStudentForTag}
                            onChange={(e) => setSelectedStudentForTag(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            <option value="">Select Student</option>
                            {students.map((student) => (
                              <option key={student.id} value={student.id}>
                                {student.name} ({student.admission_no})
                              </option>
                            ))}
                          </select>
                          <select 
                            value={selectedTagForStudent}
                            onChange={(e) => setSelectedTagForStudent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            <option value="">Select Tag</option>
                            {tags.map((tag) => (
                              <option key={tag.id} value={tag.id}>
                                {tag.name}
                              </option>
                            ))}
                          </select>
                          <Button 
                            onClick={handleAssignTagToStudent}
                            disabled={!selectedStudentForTag || !selectedTagForStudent}
                            className="w-full bg-emerald-500 hover:bg-emerald-600"
                          >
                            Assign Tag to Student
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Staff Assignment */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Assign Tags to Staff</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <select 
                            value={selectedStaffForTag}
                            onChange={(e) => setSelectedStaffForTag(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            <option value="">Select Staff</option>
                            {staff.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name} ({member.employee_id})
                              </option>
                            ))}
                          </select>
                          <select 
                            value={selectedTagForStaff}
                            onChange={(e) => setSelectedTagForStaff(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            <option value="">Select Tag</option>
                            {tags.map((tag) => (
                              <option key={tag.id} value={tag.id}>
                                {tag.name}
                              </option>
                            ))}
                          </select>
                          <Button 
                            onClick={handleAssignTagToStaff}
                            disabled={!selectedStaffForTag || !selectedTagForStaff}
                            className="w-full bg-emerald-500 hover:bg-emerald-600"
                          >
                            Assign Tag to Staff
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Selection Modal for Conduct Certificate */}
      {showConductStudentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowConductStudentModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Select Student for Conduct Certificate
                    </h3>
                    
                    {/* Search Input */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search students..."
                          value={conductSearchTerm}
                          onChange={(e) => setConductSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Students List */}
                    <div className="max-h-60 overflow-y-auto">
                      {availableStudents.filter(student => 
                        student.name?.toLowerCase().includes(conductSearchTerm.toLowerCase()) ||
                        student.admission_no?.toLowerCase().includes(conductSearchTerm.toLowerCase())
                      ).map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b"
                          onClick={() => selectConductStudent(student)}
                        >
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">Admission: {student.admission_no}</p>
                            <p className="text-xs text-gray-400">Class: {student.class_id || 'N/A'}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Select
                          </Button>
                        </div>
                      ))}
                      
                      {availableStudents.filter(student => 
                        student.name?.toLowerCase().includes(conductSearchTerm.toLowerCase()) ||
                        student.admission_no?.toLowerCase().includes(conductSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No students found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="outline"
                  onClick={() => setShowConductStudentModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conduct Certificate View Modal */}
      {showConductViewModal && selectedConductCertificate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowConductViewModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Conduct Certificate Details</h3>
                    <p className="text-gray-600 mt-1">Character and Conduct Certificate</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConductViewModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedConductCertificate.student_name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admission Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedConductCertificate.admission_no}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Class & Section</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedConductCertificate.current_class} - {selectedConductCertificate.current_section}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Conduct Rating</label>
                      <Badge className={
                        selectedConductCertificate.conduct_rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                        selectedConductCertificate.conduct_rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                        selectedConductCertificate.conduct_rating === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {selectedConductCertificate.conduct_rating}
                      </Badge>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <Badge className={
                        selectedConductCertificate.status === 'issued' ? 'bg-green-100 text-green-800' :
                        selectedConductCertificate.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {selectedConductCertificate.status === 'pending_approval' ? 'Pending Approval' : 
                         selectedConductCertificate.status.charAt(0).toUpperCase() + selectedConductCertificate.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedConductCertificate.date_of_admission && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Admission</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedConductCertificate.date_of_admission).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {selectedConductCertificate.attendance_percentage && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Attendance</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedConductCertificate.attendance_percentage}%</p>
                      </div>
                    )}
                    
                    {selectedConductCertificate.issue_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedConductCertificate.issue_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {selectedConductCertificate.valid_until && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedConductCertificate.valid_until).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Character Remarks</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedConductCertificate.character_remarks || 'No remarks provided'}
                    </p>
                  </div>
                  
                  {selectedConductCertificate.behavior_notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Behavior Notes</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedConductCertificate.behavior_notes}
                      </p>
                    </div>
                  )}
                  
                  {selectedConductCertificate.academic_performance && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Academic Performance</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedConductCertificate.academic_performance}
                      </p>
                    </div>
                  )}
                  
                  {selectedConductCertificate.extracurricular_activities && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Extracurricular Activities</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedConductCertificate.extracurricular_activities}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse space-x-reverse space-x-3">
                <Button
                  onClick={() => handlePrintConductCertificate(selectedConductCertificate)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePDFConductCertificate(selectedConductCertificate)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConductViewModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Tag Modal */}
      {showCreateTagModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowCreateTagModal(false);
              setEditingTag(null);
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {editingTag ? 'Edit Tag' : 'Create New Tag'}
                    </h3>
                    
                    <CreateTagForm 
                      editingTag={editingTag} 
                      onSuccess={() => {
                        setShowCreateTagModal(false);
                        setEditingTag(null);
                        fetchTags();
                      }}
                      onCancel={() => {
                        setShowCreateTagModal(false);
                        setEditingTag(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Tag Form Component
const CreateTagForm = ({ editingTag, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: editingTag?.name || '',
    description: editingTag?.description || '',
    color: editingTag?.color || '#3B82F6',
    category: editingTag?.category || 'general'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API = process.env.REACT_APP_API_URL;
      const url = editingTag ? `${API}/tags/${editingTag.id}` : `${API}/tags`;
      const method = editingTag ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Tag ${editingTag ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || `Failed to ${editingTag ? 'update' : 'create'} tag`);
      }
    } catch (error) {
      console.error(`Failed to ${editingTag ? 'update' : 'create'} tag:`, error);
      alert(`Failed to ${editingTag ? 'update' : 'create'} tag`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tag Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Enter tag name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Enter tag description (optional)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="general">General</option>
            <option value="academic">Academic</option>
            <option value="behavioral">Behavioral</option>
            <option value="achievement">Achievement</option>
            <option value="special">Special Needs</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="#3B82F6"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600"
          disabled={loading}
        >
          {loading ? 'Saving...' : (editingTag ? 'Update Tag' : 'Create Tag')}
        </Button>
      </div>
    </form>
  );
};

// New Enrollment Wizard Component
const NewEnrollmentWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    academic_year: new Date().getFullYear().toString(),
    class: '',
    section: '',
    stream: '',
    subjects: [],
    documents: []
  });

  // Modal states
  const [showSelectStudentModal, setShowSelectStudentModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  
  // Student data
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Class and Section data
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [allSections, setAllSections] = useState([]);
  
  // New student form
  const [newStudentData, setNewStudentData] = useState({
    admission_no: '',
    roll_no: '',
    name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    gender: '',
    class_id: '',
    section_id: '',
    phone: '',
    email: '',
    address: '',
    guardian_name: '',
    guardian_phone: ''
  });

  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  
  // File input refs
  const academicRecordsRef = useRef(null);
  const birthCertificateRef = useRef(null);
  const transferCertificateRef = useRef(null);
  const medicalCertificateRef = useRef(null);

  const steps = [
    { id: 1, title: 'Student Selection', description: 'Select or add student' },
    { id: 2, title: 'Academic Details', description: 'Class, section, stream' },
    { id: 3, title: 'Subject Selection', description: 'Choose subjects' },
    { id: 4, title: 'Documents', description: 'Upload required documents' },
    { id: 5, title: 'Review & Submit', description: 'Review and confirm enrollment' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Student selection functions
  const fetchStudents = async (query = '') => {
    setIsLoading(true);
    try {
      const params = query ? `?search=${encodeURIComponent(query)}` : '';
      const response = await fetch(`${process.env.REACT_APP_API_URL}/students${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📚 HSS Enrollment - Fetched students:', data?.length, 'students');
      setStudents(data);
    } catch (error) {
      console.error('❌ Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch classes and sections
  const fetchClasses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/classes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 HSS Enrollment - Fetched classes:', data?.length, 'classes');
        setClasses(data);
      } else {
        console.error('Failed to fetch classes');
        setClasses([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch classes:', error);
      setClasses([]);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 HSS Enrollment - Fetched sections:', data?.length, 'sections');
        setAllSections(data);
      } else {
        console.error('Failed to fetch sections');
        setAllSections([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch sections:', error);
      setAllSections([]);
    }
  };

  // useEffect to fetch classes and sections on component mount
  useEffect(() => {
    fetchClasses();
    fetchSections();
  }, []);

  // Filter sections based on selected class
  useEffect(() => {
    if (formData.class) {
      const filteredSections = allSections.filter(section => section.class_id === formData.class);
      setSections(filteredSections);
    } else {
      setSections([]);
    }
  }, [formData.class, allSections]);

  const selectStudent = (student) => {
    setFormData({
      ...formData,
      student_id: student.id,
      student_name: student.name
    });
    setShowSelectStudentModal(false);
  };

  const createNewStudent = async () => {
    setIsLoading(true);
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newStudentData)
      });
      
      if (response.ok) {
        const newStudent = await response.json();
        setFormData({
          ...formData,
          student_id: newStudent.id,
          student_name: newStudent.name
        });
        setShowAddStudentModal(false);
        setNewStudentData({
          admission_no: '',
          roll_no: '',
          name: '',
          father_name: '',
          mother_name: '',
          date_of_birth: '',
          gender: '',
          class_id: '',
          section_id: '',
          phone: '',
          email: '',
          address: '',
          guardian_name: '',
          guardian_phone: ''
        });
        toast.success('Student created & selected successfully!');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.detail || 'Failed to create student';
        console.error('Failed to create student:', errorData);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to create student:', error);
      toast.error('Failed to create student. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Document upload functions
  const documentTypes = [
    { key: 'academic_records', name: 'Previous Academic Records', ref: academicRecordsRef, required: true },
    { key: 'birth_certificate', name: 'Birth Certificate', ref: birthCertificateRef, required: true },
    { key: 'transfer_certificate', name: 'Transfer Certificate', ref: transferCertificateRef, required: false },
    { key: 'medical_certificate', name: 'Medical Certificate', ref: medicalCertificateRef, required: false }
  ];

  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file, documentType) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedDocuments(prev => ({
          ...prev,
          [documentType]: {
            name: file.name,
            size: file.size,
            url: result.url,
            type: file.type
          }
        }));
        setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
        toast.success(`${documentTypes.find(d => d.key === documentType)?.name} uploaded successfully`);
      } else {
        const errorData = await response.json();
        toast.error(errorData?.detail || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      }, 2000);
    }
  };

  const triggerFileUpload = (documentType) => {
    const docConfig = documentTypes.find(d => d.key === documentType);
    if (docConfig && docConfig.ref.current) {
      docConfig.ref.current.click();
    }
  };

  const removeDocument = (documentType) => {
    setUploadedDocuments(prev => {
      const updated = { ...prev };
      delete updated[documentType];
      return updated;
    });
    toast.success('Document removed');
  };

  const areRequiredDocumentsUploaded = () => {
    const requiredDocs = documentTypes.filter(d => d.required);
    return requiredDocs.every(doc => uploadedDocuments[doc.key]);
  };

  const handleSubmit = async () => {
    try {
      // Ensure all required fields are strings and properly formatted
      const enrollmentData = {
        student_id: String(formData.student_id || ''),
        academic_year: String(formData.academic_year || ''),
        class_name: String(formData.class || ''),
        section: String(formData.section || ''),
        stream: String(formData.stream || ''),
        subjects: Array.isArray(formData.subjects) ? formData.subjects.map(s => String(s)) : [],
        documents: Object.values(uploadedDocuments).map(doc => String(doc.url || ''))
      };

      // Validate required fields
      const missingFields = [];
      if (!enrollmentData.student_id) missingFields.push('Student');
      if (!enrollmentData.academic_year) missingFields.push('Academic Year');
      if (!enrollmentData.class_name) missingFields.push('Class');
      if (!enrollmentData.section) missingFields.push('Section');
      if (!enrollmentData.stream) missingFields.push('Stream');
      if (enrollmentData.subjects.length === 0) missingFields.push('Subjects');

      if (missingFields.length > 0) {
        toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      console.log('Submitting enrollment:', enrollmentData);
      
      // API call to create enrollment
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/hss/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(enrollmentData)
      });

      if (response.ok) {
        // Navigate back to admission register with success notification
        localStorage.setItem('hss_enrollment_success', 'true');
        navigate('/hss/register');
      } else {
        const errorData = await response.json();
        console.error('Enrollment submission error:', errorData);
        
        // Handle different error response formats
        let errorMessage = 'Failed to submit enrollment';
        
        if (typeof errorData?.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData?.detail)) {
          // Handle validation errors array
          errorMessage = errorData.detail
            .map(err => typeof err === 'string' ? err : err.msg || err.message || 'Validation error')
            .join(', ');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to create enrollment:', error);
      toast.error('Failed to submit enrollment. Please try again.');
    }
  };

  const handleCancel = () => {
    // Check if we came from admission register
    const fromRegister = localStorage.getItem('hss_from_register');
    if (fromRegister) {
      localStorage.removeItem('hss_from_register');
      navigate('/hss/register');
    } else {
      navigate('/hss');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New HSS Enrollment</h1>
          <p className="text-muted-foreground">Enroll students in Higher Secondary School programs</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/hss')}>
          Cancel
        </Button>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Student Selection</h3>
              <p className="text-muted-foreground">Select an existing student or add a new one</p>
              
              {formData.student_id ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-emerald-900">Selected Student</p>
                      <p className="text-emerald-700">{formData.student_name}</p>
                      <p className="text-sm text-emerald-600">ID: {formData.student_id}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData({...formData, student_id: '', student_name: ''})}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20"
                    onClick={() => {
                      setShowSelectStudentModal(true);
                      fetchStudents();
                    }}
                  >
                    <Users className="h-6 w-6 mr-2" />
                    Select Existing Student
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20"
                    onClick={() => setShowAddStudentModal(true)}
                  >
                    <UserPlus className="h-6 w-6 mr-2" />
                    Add New Student
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Academic Year</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                  >
                    <option value="2025">2025-2026</option>
                    <option value="2024">2024-2025</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Class</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value, section: ''})}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name || `Class ${cls.standard}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Section</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    disabled={!formData.class}
                  >
                    <option value="">Select Section</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stream</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.stream}
                    onChange={(e) => setFormData({...formData, stream: e.target.value})}
                  >
                    <option value="">Select Stream</option>
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Subject Selection</h3>
              <p className="text-muted-foreground">Choose subjects for the enrollment</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'].map((subject) => (
                  <label key={subject} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={formData.subjects.includes(subject)}
                      onChange={(e) => {
                        const newSubjects = [...formData.subjects];
                        if (e.target.checked) {
                          newSubjects.push(subject);
                        } else {
                          const index = newSubjects.indexOf(subject);
                          if (index > -1) {
                            newSubjects.splice(index, 1);
                          }
                        }
                        setFormData({...formData, subjects: newSubjects});
                      }}
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Required Documents</h3>
              <div className="space-y-3">
                {documentTypes.map((doc) => (
                  <div key={doc.key} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{doc.name}</span>
                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                        {uploadedDocuments[doc.key] && (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                        )}
                      </div>
                      {!uploadedDocuments[doc.key] ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => triggerFileUpload(doc.key)}
                          disabled={isUploading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => triggerFileUpload(doc.key)}
                          >
                            Replace
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeDocument(doc.key)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* File input (hidden) */}
                    <input
                      ref={doc.ref}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, doc.key);
                        }
                        e.target.value = ''; // Reset input
                      }}
                    />
                    
                    {/* Upload progress */}
                    {uploadProgress[doc.key] > 0 && uploadProgress[doc.key] < 100 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-600 mb-1">Uploading...</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[doc.key]}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Uploaded file info */}
                    {uploadedDocuments[doc.key] && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              {uploadedDocuments[doc.key].name}
                            </p>
                            <p className="text-xs text-green-600">
                              {(uploadedDocuments[doc.key].size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-gray-600 mt-4">
                <p>* Required documents must be uploaded to proceed</p>
                <p>Accepted formats: PDF, JPG, PNG (max 10MB each)</p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Review Enrollment</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">Student Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">Student ID:</span> {formData.student_id || 'Not selected'}</p>
                    <p className="text-sm"><span className="font-medium">Student Name:</span> {formData.student_name || 'Not selected'}</p>
                    <p className="text-sm"><span className="font-medium">Academic Year:</span> {formData.academic_year || 'Not selected'}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">Academic Details</h4>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">Class:</span> {formData.class ? `Class ${formData.class}` : 'Not selected'}</p>
                    <p className="text-sm"><span className="font-medium">Section:</span> {formData.section || 'Not selected'}</p>
                    <p className="text-sm"><span className="font-medium">Stream:</span> {formData.stream ? formData.stream.charAt(0).toUpperCase() + formData.stream.slice(1) : 'Not selected'}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">Subjects</h4>
                  {formData.subjects && formData.subjects.length > 0 ? (
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {formData.subjects.map((subject, index) => (
                        <li key={index}>{subject}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No subjects selected</p>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">Documents</h4>
                  {Object.keys(uploadedDocuments).length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {Object.entries(uploadedDocuments).map(([key, doc]) => (
                        <li key={key} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {documentTypes.find(d => d.key === key)?.name || key}: {doc.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="text-gray-600"
              >
                Cancel
              </Button>
            </div>
            
            {currentStep < steps.length ? (
              <Button 
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !formData.student_id) ||
                  (currentStep === 2 && (!formData.class || !formData.section || !formData.stream)) ||
                  (currentStep === 3 && formData.subjects.length === 0) ||
                  (currentStep === 4 && !areRequiredDocumentsUploaded())
                }
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="bg-emerald-500 hover:bg-emerald-600"
                disabled={!areRequiredDocumentsUploaded()}
              >
                Submit Enrollment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Select Existing Student Modal */}
      {showSelectStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Select Existing Student</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSelectStudentModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search students by name, ID, or phone..."
                className="w-full p-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchStudents(e.target.value);
                }}
              />
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.length > 0 ? (
                  students.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => selectStudent(student)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">ID: {student.admission_number || student.id}</p>
                          <p className="text-sm text-gray-600">Phone: {student.phone || 'N/A'}</p>
                        </div>
                        <Button variant="outline" size="sm">Select</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No students found' : 'No students available'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add New Student</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddStudentModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Admission Number *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.admission_no}
                    onChange={(e) => setNewStudentData({...newStudentData, admission_no: e.target.value})}
                    placeholder="e.g., ADM2025001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Roll Number *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.roll_no}
                    onChange={(e) => setNewStudentData({...newStudentData, roll_no: e.target.value})}
                    placeholder="e.g., 001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Student Name *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.name}
                    onChange={(e) => setNewStudentData({...newStudentData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.date_of_birth}
                    onChange={(e) => setNewStudentData({...newStudentData, date_of_birth: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gender *</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.gender}
                    onChange={(e) => setNewStudentData({...newStudentData, gender: e.target.value})}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.phone}
                    onChange={(e) => setNewStudentData({...newStudentData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Father's Name *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.father_name}
                    onChange={(e) => setNewStudentData({...newStudentData, father_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mother's Name *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.mother_name}
                    onChange={(e) => setNewStudentData({...newStudentData, mother_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Class *</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.class_id}
                    onChange={(e) => setNewStudentData({...newStudentData, class_id: e.target.value, section_id: ''})}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name || `Class ${cls.standard}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Section *</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.section_id}
                    onChange={(e) => setNewStudentData({...newStudentData, section_id: e.target.value})}
                    required
                    disabled={!newStudentData.class_id}
                  >
                    <option value="">Select Section</option>
                    {(newStudentData.class_id 
                      ? allSections.filter(section => section.class_id === newStudentData.class_id)
                      : []
                    ).map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.email}
                    onChange={(e) => setNewStudentData({...newStudentData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Guardian Name *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.guardian_name}
                    onChange={(e) => setNewStudentData({...newStudentData, guardian_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Guardian Phone *</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded-md"
                    value={newStudentData.guardian_phone}
                    onChange={(e) => setNewStudentData({...newStudentData, guardian_phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Address *</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows="2"
                  value={newStudentData.address}
                  onChange={(e) => setNewStudentData({...newStudentData, address: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddStudentModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={createNewStudent}
                  disabled={!newStudentData.name || !newStudentData.admission_no || !newStudentData.roll_no || !newStudentData.father_name || !newStudentData.mother_name || !newStudentData.date_of_birth || !newStudentData.gender || !newStudentData.class_id || !newStudentData.section_id || !newStudentData.phone || !newStudentData.address || !newStudentData.guardian_name || !newStudentData.guardian_phone || isLoading}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {isLoading ? 'Creating...' : 'Create Student'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// HSS Admission Register Component
const HSSAdmissionRegister = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    academicYear: '',
    class: '',
    status: '',
    stream: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/hss/admissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdmissions(data.admissions || []);
        setError(null);
        
        // Check for success notification from enrollment
        const enrollmentSuccess = localStorage.getItem('hss_enrollment_success');
        if (enrollmentSuccess) {
          localStorage.removeItem('hss_enrollment_success');
          toast.success('HSS enrollment created successfully!');
        }
      } else {
        const errorData = await response.json();
        setError(errorData?.detail || 'Failed to load admission records');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Failed to fetch admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
    
    // Restore filter state from localStorage
    const savedFilters = localStorage.getItem('hss_register_filters');
    const savedSearch = localStorage.getItem('hss_register_search');
    
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        // Ignore invalid JSON
      }
    }
    
    if (savedSearch) {
      setSearchTerm(savedSearch);
    }
  }, []);

  // Save filter state when it changes
  useEffect(() => {
    localStorage.setItem('hss_register_filters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('hss_register_search', searchTerm);
  }, [searchTerm]);

  const filteredAdmissions = admissions.filter(admission => {
    const matchesSearch = 
      admission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.admission_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.father_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (!filters.academicYear || admission.academic_year === filters.academicYear) &&
      (!filters.class || admission.class_name === filters.class) &&
      (!filters.status || admission.status === filters.status) &&
      (!filters.stream || admission.stream === filters.stream);
    
    return matchesSearch && matchesFilters;
  });

  const exportToCSV = () => {
    const csvData = filteredAdmissions.map(admission => ({
      'Student Name': admission.student_name,
      'Admission No': admission.admission_no,
      'Father Name': admission.father_name,
      'Class': admission.class_name,
      'Section': admission.section,
      'Stream': admission.stream,
      'Academic Year': admission.academic_year,
      'Status': admission.status,
      'Subjects': admission.subjects.join(', '),
      'Documents': admission.documents_count,
      'Phone': admission.phone,
      'Address': admission.address,
      'Admission Date': new Date(admission.admission_date).toLocaleDateString()
    }));
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hss-admissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Admission records exported to CSV');
  };

  const clearFilters = () => {
    setFilters({
      academicYear: '',
      class: '',
      status: '',
      stream: ''
    });
    setSearchTerm('');
  };

  const uniqueValues = (key) => [...new Set(admissions.map(a => a[key]).filter(Boolean))];

  const viewAdmissionDetails = (admission) => {
    setSelectedAdmission(admission);
    setShowDetailsModal(true);
  };

  const updateAdmissionStatus = async (admissionId, newStatus) => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/hss/admissions/${admissionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchAdmissions();
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">HSS Admission Register</h2>
          <p className="text-gray-600 mt-1">View and manage HSS admission records</p>
        </div>
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600"
          onClick={() => {
            localStorage.setItem('hss_from_register', 'true');
            window.location.href = '/hss/enroll/new';
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          New Enrollment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Admission Records</CardTitle>
            <div className="flex items-center space-x-2 flex-wrap">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or admission no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
                />
                <Users className="h-4 w-4 text-gray-400 absolute left-2.5 top-3" />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                disabled={filteredAdmissions.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={fetchAdmissions}>
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <select
                    value={filters.academicYear}
                    onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {uniqueValues('academic_year').map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={filters.class}
                    onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">All Classes</option>
                    {uniqueValues('class_name').map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
                  <select
                    value={filters.stream}
                    onChange={(e) => setFilters(prev => ({ ...prev, stream: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">All Streams</option>
                    {uniqueValues('stream').map(stream => (
                      <option key={stream} value={stream}>{stream}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="transferred">Transferred</option>
                    <option value="graduated">Graduated</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                  Hide Filters
                </Button>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading admission records...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Error Loading Records</h3>
                <p className="text-sm">{error}</p>
              </div>
              <Button variant="outline" onClick={fetchAdmissions}>
                Try Again
              </Button>
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Admission Records Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No records match your search criteria.' : 'No HSS admission records have been created yet.'}
              </p>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => {
                  localStorage.setItem('hss_from_register', 'true');
                  window.location.href = '/hss/enroll/new';
                }}
              >
                Create First Enrollment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subjects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmissions.map((admission) => (
                    <tr key={admission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {admission.student_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Admission No: {admission.admission_no}
                          </div>
                          <div className="text-sm text-gray-500">
                            Father: {admission.father_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Class: {admission.class_name}</div>
                          <div>Section: {admission.section}</div>
                          <div>Stream: {admission.stream}</div>
                          <div className="text-gray-500">Year: {admission.academic_year}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {admission.subjects.slice(0, 3).map((subject, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                          {admission.subjects.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{admission.subjects.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {admission.documents_count} files
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={admission.status === 'active' ? 'default' : 'secondary'}
                          className={admission.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {admission.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(admission.admission_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewAdmissionDetails(admission)}
                          >
                            View
                          </Button>
                          <select
                            value={admission.status}
                            onChange={(e) => updateAdmissionStatus(admission.id, e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="active">Active</option>
                            <option value="transferred">Transferred</option>
                            <option value="graduated">Graduated</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="bg-gray-50 px-6 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{filteredAdmissions.length}</span> of{' '}
                    <span className="font-medium">{admissions.length}</span> admission records
                  </p>
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admission Details Modal */}
      {showDetailsModal && selectedAdmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Admission Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedAdmission.student_name}</p>
                      <p><span className="font-medium">Admission No:</span> {selectedAdmission.admission_no}</p>
                      <p><span className="font-medium">Father's Name:</span> {selectedAdmission.father_name}</p>
                      <p><span className="font-medium">Phone:</span> {selectedAdmission.phone}</p>
                      <p><span className="font-medium">Address:</span> {selectedAdmission.address}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Academic Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Class:</span> {selectedAdmission.class_name}</p>
                      <p><span className="font-medium">Section:</span> {selectedAdmission.section}</p>
                      <p><span className="font-medium">Stream:</span> {selectedAdmission.stream}</p>
                      <p><span className="font-medium">Academic Year:</span> {selectedAdmission.academic_year}</p>
                      <p><span className="font-medium">Status:</span> 
                        <Badge className="ml-2" variant={selectedAdmission.status === 'active' ? 'default' : 'secondary'}>
                          {selectedAdmission.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Subject Selection</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAdmission.subjects.map((subject, idx) => (
                        <Badge key={idx} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{selectedAdmission.documents_count} documents uploaded</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Admission Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Admission Date:</span> {new Date(selectedAdmission.admission_date).toLocaleDateString()}</p>
                      <p><span className="font-medium">Student ID:</span> {selectedAdmission.student_id}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Transfer Certificate Component for HSS Module
const HSSTransferCertificate = () => {
  const navigate = useNavigate();
  
  const [tcView, setTcView] = useState('list');
  const [tcRecords, setTcRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const [hssStudents, setHssStudents] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [showTcViewModal, setShowTcViewModal] = useState(false);
  const [selectedTc, setSelectedTc] = useState(null);
  
  const [tcFormData, setTcFormData] = useState({
    student_id: '',
    student_name: '',
    admission_no: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    date_of_admission: '',
    class_from: '',
    class_to: '',
    date_of_leaving: '',
    reason_for_leaving: '',
    conduct: 'Good',
    character: 'Good',
    remarks: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchTcRecords();
  }, []);

  const fetchTcRecords = async () => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_URL}/hss/transfer-certificates`;
      console.log('🔍 HSS TC - Fetching from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('📡 HSS TC - Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📄 HSS TC - Raw data received:', data);
        console.log('📊 HSS TC - Data type:', Array.isArray(data) ? 'Array' : typeof data);
        
        // Handle different backend response structures
        let records = [];
        if (Array.isArray(data)) {
          records = data;
        } else if (data && data.transfer_certificates) {
          records = data.transfer_certificates;
        } else if (data && data.data) {
          records = data.data;
        }
        
        console.log('✅ HSS TC - Fetched records:', records.length, 'certificates');
        setTcRecords(records);
      } else {
        const errorText = await response.text();
        console.error('❌ HSS TC - Server error:', response.status, errorText);
        toast.error(`Failed to load Transfer Certificates: ${response.status} ${response.statusText}`);
        setTcRecords([]);
      }
    } catch (error) {
      console.error('❌ HSS TC - Fetch error:', error);
      toast.error('Failed to load Transfer Certificates');
      setTcRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHssStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/hss/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch HSS students: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🎓 HSS TC - Fetched HSS students:', data?.length, 'students');
      setHssStudents(data);
      setShowStudentModal(true);
    } catch (error) {
      console.error('❌ Failed to fetch HSS students:', error);
      toast.error('Failed to load HSS students');
      setHssStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (student) => {
    setTcFormData({
      ...tcFormData,
      student_id: student.id,
      student_name: student.name,
      admission_no: student.admission_no || '',
      father_name: student.father_name || '',
      mother_name: student.mother_name || '',
      date_of_birth: student.date_of_birth || '',
      date_of_admission: student.admission_date || ''
    });
    setSelectedStudent(student);
    setShowStudentModal(false);
    toast.success(`Selected: ${student.name}`);
  };

  const handleGenerateTC = async () => {
    if (!tcFormData.student_id) {
      toast.error('Please select a student first');
      return;
    }

    if (!tcFormData.date_of_leaving || !tcFormData.reason_for_leaving) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/hss/transfer-certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(tcFormData)
      });

      if (response.ok) {
        const newTc = await response.json();
        setTcRecords([newTc, ...tcRecords]);
        toast.success('Transfer Certificate created successfully');
        
        setTcFormData({
          student_id: '',
          student_name: '',
          admission_no: '',
          father_name: '',
          mother_name: '',
          date_of_birth: '',
          date_of_admission: '',
          class_from: '',
          class_to: '',
          date_of_leaving: '',
          reason_for_leaving: '',
          conduct: 'Good',
          character: 'Good',
          remarks: '',
          status: 'draft'
        });
        setSelectedStudent(null);
        setTcView('list');
        fetchTcRecords();
      } else {
        throw new Error('Failed to create TC');
      }
    } catch (error) {
      console.error('❌ Failed to create TC:', error);
      toast.error('Failed to create Transfer Certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTC = (tc) => {
    setSelectedTc(tc);
    setShowTcViewModal(true);
  };

  const handleDownloadTC = async (tc) => {
    toast.info('Downloading Transfer Certificate...');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/hss/transfer-certificates/${tc.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HSS_TC_${tc.admission_no}_${tc.student_name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Download started');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handlePrintTC = async (tc) => {
    toast.info('Preparing to print...');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/hss/transfer-certificates/${tc.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Open PDF in new window and trigger print
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        // Clean up after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        throw new Error('Print failed');
      }
    } catch (error) {
      console.error('❌ Print failed:', error);
      toast.error('Failed to print PDF');
    }
  };

  const filteredTcRecords = tcRecords.filter(tc => {
    const matchesSearch = searchTerm === '' || 
      tc.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.admission_no?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HSS Transfer Certificate</h1>
          <p className="text-gray-600 mt-1">Generate and manage transfer certificates for HSS students</p>
        </div>
        <div className="flex gap-3">
          {tcView === 'list' ? (
            <Button
              onClick={() => setTcView('form')}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate TC
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setTcView('list');
                setTcFormData({
                  student_id: '',
                  student_name: '',
                  admission_no: '',
                  father_name: '',
                  mother_name: '',
                  date_of_birth: '',
                  date_of_admission: '',
                  class_from: '',
                  class_to: '',
                  date_of_leaving: '',
                  reason_for_leaving: '',
                  conduct: 'Good',
                  character: 'Good',
                  remarks: '',
                  status: 'draft'
                });
                setSelectedStudent(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          )}
        </div>
      </div>

      {tcView === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>Transfer Certificate Records</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name or admission number..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading records...</p>
              </div>
            ) : filteredTcRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No Transfer Certificates found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Student Name</th>
                      <th className="text-left py-3 px-4">Admission No</th>
                      <th className="text-left py-3 px-4">Date of Leaving</th>
                      <th className="text-left py-3 px-4">Reason</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTcRecords.map((tc) => (
                      <tr key={tc.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{tc.student_name}</td>
                        <td className="py-3 px-4">{tc.admission_no}</td>
                        <td className="py-3 px-4">{tc.date_of_leaving ? new Date(tc.date_of_leaving).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-3 px-4">{tc.reason_for_leaving}</td>
                        <td className="py-3 px-4">
                          <Badge className={
                            tc.status === 'issued' ? 'bg-green-100 text-green-800' :
                            tc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {tc.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewTC(tc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadTC(tc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintTC(tc)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Generate Transfer Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select HSS Student <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={fetchHssStudents}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {selectedStudent ? selectedStudent.name : 'Select Student'}
                  </Button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admission No</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                    value={tcFormData.admission_no}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={tcFormData.father_name}
                    onChange={(e) => setTcFormData({...tcFormData, father_name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={tcFormData.mother_name}
                    onChange={(e) => setTcFormData({...tcFormData, mother_name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={tcFormData.date_of_birth}
                    onChange={(e) => setTcFormData({...tcFormData, date_of_birth: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Admission</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={tcFormData.date_of_admission}
                    onChange={(e) => setTcFormData({...tcFormData, date_of_admission: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class From</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={tcFormData.class_from}
                    onChange={(e) => setTcFormData({...tcFormData, class_from: e.target.value})}
                    placeholder="e.g., 11th Grade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class To</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={tcFormData.class_to}
                    onChange={(e) => setTcFormData({...tcFormData, class_to: e.target.value})}
                    placeholder="e.g., 12th Grade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Leaving <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={tcFormData.date_of_leaving}
                    onChange={(e) => setTcFormData({...tcFormData, date_of_leaving: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Leaving <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={tcFormData.reason_for_leaving}
                    onChange={(e) => setTcFormData({...tcFormData, reason_for_leaving: e.target.value})}
                    placeholder="e.g., Relocation, Higher Studies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conduct</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={tcFormData.conduct}
                    onChange={(e) => setTcFormData({...tcFormData, conduct: e.target.value})}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Satisfactory">Satisfactory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Character</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={tcFormData.character}
                    onChange={(e) => setTcFormData({...tcFormData, character: e.target.value})}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Satisfactory">Satisfactory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                  value={tcFormData.remarks}
                  onChange={(e) => setTcFormData({...tcFormData, remarks: e.target.value})}
                  placeholder="Additional remarks or notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTcView('list');
                    setTcFormData({
                      student_id: '',
                      student_name: '',
                      admission_no: '',
                      father_name: '',
                      mother_name: '',
                      date_of_birth: '',
                      date_of_admission: '',
                      class_from: '',
                      class_to: '',
                      date_of_leaving: '',
                      reason_for_leaving: '',
                      conduct: 'Good',
                      character: 'Good',
                      remarks: '',
                      status: 'draft'
                    });
                    setSelectedStudent(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateTC}
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate TC'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select HSS Student</h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading HSS students...</p>
                </div>
              ) : hssStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No HSS students found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {hssStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => selectStudent(student)}
                      className="p-4 border rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">
                            {student.admission_no ? `Admission No: ${student.admission_no}` : 'No admission number'}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {student.class_name && <p>Class: {student.class_name}</p>}
                          {student.phone && <p>{student.phone}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTcViewModal && selectedTc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Transfer Certificate Details</h3>
              <button
                onClick={() => setShowTcViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Student Name</p>
                  <p className="text-gray-900">{selectedTc.student_name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Admission No</p>
                  <p className="text-gray-900">{selectedTc.admission_no}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Father's Name</p>
                  <p className="text-gray-900">{selectedTc.father_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Mother's Name</p>
                  <p className="text-gray-900">{selectedTc.mother_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Date of Birth</p>
                  <p className="text-gray-900">{selectedTc.date_of_birth ? new Date(selectedTc.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Date of Admission</p>
                  <p className="text-gray-900">{selectedTc.date_of_admission ? new Date(selectedTc.date_of_admission).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Class From - To</p>
                  <p className="text-gray-900">{selectedTc.class_from} to {selectedTc.class_to}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Date of Leaving</p>
                  <p className="text-gray-900">{selectedTc.date_of_leaving ? new Date(selectedTc.date_of_leaving).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Reason for Leaving</p>
                  <p className="text-gray-900">{selectedTc.reason_for_leaving}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Conduct</p>
                  <p className="text-gray-900">{selectedTc.conduct}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Character</p>
                  <p className="text-gray-900">{selectedTc.character}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Status</p>
                  <Badge className={
                    selectedTc.status === 'issued' ? 'bg-green-100 text-green-800' :
                    selectedTc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedTc.status}
                  </Badge>
                </div>
                {selectedTc.remarks && (
                  <div className="col-span-2">
                    <p className="font-medium text-gray-700">Remarks</p>
                    <p className="text-gray-900">{selectedTc.remarks}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowTcViewModal(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDownloadTC(selectedTc)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Consolidated Report Component
const HSSConsolidatedReport = () => {
  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    academicYear: new Date().getFullYear().toString(),
    class: '',
    section: '',
    stream: '',
    dateRange: {
      startDate: '',
      endDate: ''
    }
  });
  const [showFilters, setShowFilters] = useState(false);
  const [classes, setClasses] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchConsolidatedData();
    fetchClasses();
    fetchSections();
  }, []);

  useEffect(() => {
    if (filters.class) {
      const filteredSections = allSections.filter(section => section.class_id === filters.class);
      setSections(filteredSections);
    } else {
      setSections([]);
    }
  }, [filters.class, allSections]);

  const fetchConsolidatedData = async () => {
    setLoading(true);
    console.log('🔄 Fetching consolidated HSS report data...');
    console.log('🔗 API URL:', `${API}/hss/consolidated`);
    
    try {
      const response = await fetch(`${API}/hss/consolidated`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('📊 Response Status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Consolidated data received:', result);
        console.log('📈 Total records:', result.data?.length || 0);
        
        // Transform backend data to match frontend format
        const transformedData = (result.data || []).map(record => ({
          id: record.id,
          studentName: record.student_name,
          admissionNo: record.admission_no,
          class: record.class,
          section: record.section,
          stream: record.section, // Using section as stream
          enrollmentDate: record.date_of_admission,
          transferCertificate: record.transfer_certificate.exists 
            ? record.transfer_certificate.status 
            : 'Not Required',
          conductCertificate: record.conduct_certificate.exists 
            ? record.conduct_certificate.status 
            : 'Not Required',
          academicYear: record.transfer_certificate.academic_year || new Date().getFullYear().toString(),
          totalMarks: 'N/A',
          percentage: record.conduct_certificate.attendance_percentage || 'N/A',
          status: record.enrollment_status,
          // Additional data for reference
          fatherName: record.father_name,
          motherName: record.mother_name,
          tcDetails: record.transfer_certificate,
          ccDetails: record.conduct_certificate
        }));
        
        console.log('✨ Transformed data:', transformedData);
        setReportData(transformedData);
        
        if (transformedData.length === 0) {
          toast.info('No HSS students found. Please enroll students first.');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch consolidated data');
      }
    } catch (error) {
      console.error('❌ Failed to fetch consolidated data:', error);
      toast.error('Failed to fetch consolidated report data');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API}/classes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 Consolidated Report - Fetched classes:', data?.length, 'classes');
        setClasses(data);
      } else {
        console.error('Failed to fetch classes');
        setClasses([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch classes:', error);
      setClasses([]);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch(`${API}/sections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 Consolidated Report - Fetched sections:', data?.length, 'sections');
        setAllSections(data);
      } else {
        console.error('Failed to fetch sections');
        setAllSections([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch sections:', error);
      setAllSections([]);
    }
  };

  const handleGenerateReport = () => {
    toast.info('Generating consolidated report with current filters...');
    fetchConsolidatedData();
  };

  const handleExportCSV = () => {
    const csvContent = convertToCSV(filteredData);
    downloadCSV(csvContent, `HSS-Consolidated-Report-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('CSV export initiated');
  };

  const handleExportPDF = () => {
    generatePDFReport(filteredData);
    toast.success('PDF export initiated');
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = ['Student Name', 'Admission No', 'Class', 'Section', 'Stream', 'Enrollment Date', 'TC Status', 'CC Status', 'Academic Year', 'Total Marks', 'Percentage', 'Status'];
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = [
        row.studentName,
        row.admissionNo,
        row.class,
        row.section,
        row.stream,
        row.enrollmentDate,
        row.transferCertificate,
        row.conductCertificate,
        row.academicYear,
        row.totalMarks,
        row.percentage,
        row.status
      ];
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generatePDFReport = (data) => {
    try {
      const printContent = generatePDFContent(data);
      
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>HSS Consolidated Report</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .school-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .report-title { font-size: 18px; font-weight: bold; margin: 10px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .filters { background-color: #f8f9fa; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Report</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  const generatePDFContent = (data) => {
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <div class="header">
        <div class="school-name">DEMO SCHOOL</div>
        <div class="report-title">HSS Consolidated Report</div>
        <div style="font-size: 14px; color: #666;">Generated on: ${currentDate}</div>
      </div>
      
      <div class="filters">
        <strong>Applied Filters:</strong>
        Academic Year: ${filters.academicYear}, 
        Class: ${filters.class || 'All'}, 
        Section: ${filters.section || 'All'}, 
        Stream: ${filters.stream || 'All'}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Admission No</th>
            <th>Class</th>
            <th>Section</th>
            <th>Stream</th>
            <th>Enrollment Date</th>
            <th>TC Status</th>
            <th>CC Status</th>
            <th>Total Marks</th>
            <th>Percentage</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td>${row.studentName}</td>
              <td>${row.admissionNo}</td>
              <td>${row.class}</td>
              <td>${row.section}</td>
              <td>${row.stream}</td>
              <td>${new Date(row.enrollmentDate).toLocaleDateString()}</td>
              <td>${row.transferCertificate}</td>
              <td>${row.conductCertificate}</td>
              <td>${row.totalMarks}</td>
              <td>${row.percentage}%</td>
              <td>${row.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
        Total Records: ${data.length} | Report ID: HSS-${Date.now()}
      </div>
    `;
  };

  // Filter data based on current filters
  const filteredData = reportData.filter(item => {
    // If no class filter selected, or if item's class name matches the selected class name
    const matchesClass = !filters.class || (() => {
      const selectedClass = classes.find(c => c.id === filters.class);
      const classToMatch = selectedClass ? (selectedClass.name || `Class ${selectedClass.standard}`) : '';
      return item.class === classToMatch || item.class.includes(classToMatch);
    })();
    
    // If no section filter selected, or if item's section name matches the selected section name
    const matchesSection = !filters.section || (() => {
      const selectedSection = allSections.find(s => s.id === filters.section);
      const sectionToMatch = selectedSection ? selectedSection.name : '';
      return item.section === sectionToMatch || item.section.includes(sectionToMatch);
    })();
    
    const matchesStream = !filters.stream || item.stream === filters.stream || item.stream.includes(filters.stream);
    const matchesAcademicYear = !filters.academicYear || item.academicYear === filters.academicYear || item.academicYear.includes(filters.academicYear);
    
    return matchesClass && matchesSection && matchesStream && matchesAcademicYear;
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/hss')}
            >
              ← Back to HSS
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Consolidated Report</h1>
          </div>
          <p className="text-gray-600 mt-1">Comprehensive HSS student report with all modules data</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || filteredData.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportPDF}
            disabled={loading || filteredData.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <select
                  value={filters.academicYear}
                  onChange={(e) => setFilters({...filters, academicYear: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  value={filters.class}
                  onChange={(e) => setFilters({...filters, class: e.target.value, section: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name || `Class ${cls.standard}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream
                </label>
                <select
                  value={filters.stream}
                  onChange={(e) => setFilters({...filters, stream: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">All Streams</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commerce">Commerce</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <select
                  value={filters.section}
                  onChange={(e) => setFilters({...filters, section: e.target.value})}
                  disabled={!filters.class}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Sections</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>HSS Consolidated Data</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Showing {filteredData.length} of {reportData.length} records
              </p>
            </div>
            {filteredData.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Total Students: {filteredData.length}</span>
                <span>•</span>
                <span>Average: {(filteredData.reduce((sum, item) => sum + item.percentage, 0) / filteredData.length).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Loading consolidated report...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
              <p className="text-gray-600 mb-4">
                {reportData.length === 0 
                  ? 'No consolidated data available. Please check if students are enrolled and have module data.'
                  : 'No records match the current filter criteria. Try adjusting your filters.'}
              </p>
              <div className="flex justify-center space-x-3">
                {showFilters && (
                  <Button 
                    variant="outline"
                    onClick={() => setFilters({
                      academicYear: new Date().getFullYear().toString(),
                      class: '', section: '', stream: '', dateRange: { startDate: '', endDate: '' }
                    })}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button onClick={handleGenerateReport} className="bg-emerald-500 hover:bg-emerald-600">
                  Refresh Data
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.studentName}</div>
                          <div className="text-sm text-gray-500">Adm: {item.admissionNo}</div>
                          <div className="text-xs text-gray-400">
                            Enrolled: {new Date(item.enrollmentDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Class {item.class}</div>
                        <div className="text-sm text-gray-500">{item.section}</div>
                        <div className="text-xs text-gray-400">{item.stream} Stream</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <Badge className={
                            item.transferCertificate === 'Issued' ? 'bg-green-100 text-green-800' :
                            item.transferCertificate === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            TC: {item.transferCertificate}
                          </Badge>
                          <Badge className={
                            item.conductCertificate === 'Issued' ? 'bg-green-100 text-green-800' :
                            item.conductCertificate === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            CC: {item.conductCertificate}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.totalMarks} marks</div>
                        <div className="text-sm text-gray-500">{item.percentage}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={
                          item.status === 'Active' ? 'bg-green-100 text-green-800' :
                          item.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Dedicated Conduct Certificate Component
const HSSConductCertificate = () => {
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  // State management
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [students, setStudents] = useState([]);
  
  // Class and Section data
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [allSections, setAllSections] = useState([]);

  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    admission_no: '',
    current_class: '',
    current_section: '',
    father_name: '',
    mother_name: '',
    date_of_admission: '',
    conduct_rating: 'Excellent',
    character_remarks: '',
    behavior_notes: '',
    academic_performance: '',
    extracurricular_activities: '',
    attendance_percentage: ''
  });

  useEffect(() => {
    fetchConductCertificates();
    fetchStudents();
    fetchClasses();
    fetchSections();
  }, []);

  // Filter sections based on selected class
  useEffect(() => {
    if (formData.current_class) {
      const filteredSections = allSections.filter(section => section.class_id === formData.current_class);
      setSections(filteredSections);
    } else {
      setSections([]);
    }
  }, [formData.current_class, allSections]);

  const fetchConductCertificates = async () => {
    try {
      const response = await fetch(`${API}/conduct-certificates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecords(data.conduct_certificates || []);
      } else {
        console.error('Failed to fetch conduct certificates');
        setRecords([]);
      }
    } catch (error) {
      console.error('Failed to fetch conduct certificates:', error);
      setRecords([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API}/hss/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched HSS students for conduct certificate:', data);
        setStudents(data || []);
      } else {
        console.error('❌ Failed to fetch HSS students');
        setStudents([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch HSS students:', error);
      setStudents([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API}/classes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 Conduct Certificate - Fetched classes:', data?.length, 'classes');
        setClasses(data);
      } else {
        console.error('Failed to fetch classes');
        setClasses([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch classes:', error);
      setClasses([]);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch(`${API}/sections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 Conduct Certificate - Fetched sections:', data?.length, 'sections');
        setAllSections(data);
      } else {
        console.error('Failed to fetch sections');
        setAllSections([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch sections:', error);
      setAllSections([]);
    }
  };

  const handleSubmit = async (status = 'issued') => {
    try {
      setLoading(true);

      // Basic validation
      if (!formData.student_id || !formData.student_name || !formData.admission_no || 
          !formData.current_class || !formData.current_section || 
          !formData.character_remarks) {
        toast.error('Please fill in all required fields');
        return;
      }

      const payload = {
        ...formData,
        status: status,
        attendance_percentage: parseFloat(formData.attendance_percentage) || null
      };

      const response = await fetch(`${API}/conduct-certificates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(`Conduct Certificate ${status === 'draft' ? 'saved as draft' : 'issued'} successfully!`);
        setView('list');
        resetForm();
        fetchConductCertificates();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create conduct certificate');
      }
    } catch (error) {
      console.error('Failed to create conduct certificate:', error);
      toast.error('Failed to create conduct certificate');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      student_name: '',
      admission_no: '',
      current_class: '',
      current_section: '',
      father_name: '',
      mother_name: '',
      date_of_admission: '',
      conduct_rating: 'Excellent',
      character_remarks: '',
      behavior_notes: '',
      academic_performance: '',
      extracurricular_activities: '',
      attendance_percentage: ''
    });
    setSelectedStudent(null);
  };

  const selectStudent = (student) => {
    setFormData({
      ...formData,
      student_id: student.id || student._id,
      student_name: student.name,
      admission_no: student.admission_no,
      current_class: student.class_id || '',
      current_section: student.section_id || '',
      father_name: student.father_name || '',
      mother_name: student.mother_name || '',
      date_of_admission: student.date_of_admission || student.enrollment_date || ''
    });
    setSelectedStudent(student);
    setShowStudentModal(false);
    toast.success(`Selected student: ${student.name}`);
  };

  const handleViewCertificate = async (ccId) => {
    try {
      const response = await fetch(`${API}/conduct-certificates/${ccId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const ccData = await response.json();
        setSelectedCertificate(ccData);
        setShowViewModal(true);
      } else {
        toast.error('Failed to load Conduct Certificate details');
      }
    } catch (error) {
      console.error('Failed to fetch conduct certificate details:', error);
      toast.error('Failed to load Conduct Certificate details');
    }
  };

  const handleDownloadCertificate = async (cc) => {
    toast.info('Downloading Conduct Certificate...');
    try {
      const response = await fetch(`${API}/conduct-certificates/${cc.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Conduct_Certificate_${cc.admission_no}_${cc.student_name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Download started');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handlePrintCertificate = async (cc) => {
    toast.info('Preparing to print...');
    try {
      const response = await fetch(`${API}/conduct-certificates/${cc.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Open PDF in new window and trigger print
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        // Clean up after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        throw new Error('Print failed');
      }
    } catch (error) {
      console.error('❌ Print failed:', error);
      toast.error('Failed to print PDF');
    }
  };

  const generateCertificateContent = (cc) => {
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <div class="certificate">
        <div class="header">
          <div class="school-name">DEMO SCHOOL</div>
          <div>Higher Secondary School</div>
          <div class="title">CHARACTER & CONDUCT CERTIFICATE</div>
        </div>
        
        <div class="content">
          <p>This is to certify that <strong>${cc.student_name}</strong>, 
          son/daughter of <strong>${cc.father_name || 'N/A'}</strong> and <strong>${cc.mother_name || 'N/A'}</strong>, 
          bearing Admission No. <strong>${cc.admission_no}</strong>, was a bonafide student of this institution.</p>
          
          <div class="student-info">
            <p><strong>Class:</strong> ${cc.current_class} - ${cc.current_section}</p>
            <p><strong>Date of Admission:</strong> ${cc.date_of_admission ? new Date(cc.date_of_admission).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Conduct Rating:</strong> ${cc.conduct_rating || 'N/A'}</p>
            ${cc.attendance_percentage ? `<p><strong>Attendance:</strong> ${cc.attendance_percentage}%</p>` : ''}
          </div>
          
          <p><strong>Character & Conduct:</strong></p>
          <p style="margin-left: 20px;">${cc.character_remarks || 'No remarks provided'}</p>
          
          ${cc.behavior_notes ? `
            <p><strong>Behavior Notes:</strong></p>
            <p style="margin-left: 20px;">${cc.behavior_notes}</p>
          ` : ''}
          
          ${cc.academic_performance ? `
            <p><strong>Academic Performance:</strong></p>
            <p style="margin-left: 20px;">${cc.academic_performance}</p>
          ` : ''}
          
          ${cc.extracurricular_activities ? `
            <p><strong>Extracurricular Activities:</strong></p>
            <p style="margin-left: 20px;">${cc.extracurricular_activities}</p>
          ` : ''}
          
          <p>This certificate is issued on <strong>${currentDate}</strong> upon request.</p>
        </div>
        
        <div class="signature-section">
          <div class="signature">
            <div class="signature-line"></div>
            <div>Class Teacher</div>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div>Principal</div>
          </div>
        </div>
      </div>
    `;
  };

  // Filter records based on search and status
  const filteredRecords = records.filter(cc => {
    const matchesSearch = !searchTerm || 
      cc.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cc.admission_no?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/hss')}
            >
              ← Back to HSS
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Conduct Certificate</h1>
          </div>
          <p className="text-gray-600 mt-1">Manage character and conduct certificates</p>
        </div>
        
        {view === 'list' && (
          <Button 
            onClick={() => setView('form')}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Certificate
          </Button>
        )}
        
        {view === 'form' && (
          <Button 
            variant="outline"
            onClick={() => {
              setView('list');
              resetForm();
            }}
          >
            ← Back to List
          </Button>
        )}
      </div>

      {view === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>Conduct Certificates</CardTitle>
            <p className="text-sm text-gray-600">Manage character and conduct certificates</p>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Controls */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name or admission number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="issued">Issued</option>
                </select>
              </div>
            </div>

            {/* Certificates List */}
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Conduct Certificates Found</h3>
                <p className="text-gray-600 mb-4">
                  {records.length === 0 
                    ? 'No conduct certificates have been created yet.'
                    : 'No certificates match your search criteria.'}
                </p>
                <Button 
                  onClick={() => setView('form')}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Create First Certificate
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conduct</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.student_name}</div>
                            <div className="text-sm text-gray-500">Adm: {record.admission_no}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.current_class}</div>
                          <div className="text-sm text-gray-500">{record.current_section}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={
                            record.conduct_rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                            record.conduct_rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                            record.conduct_rating === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {record.conduct_rating}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={
                            record.status === 'issued' ? 'bg-green-100 text-green-800' :
                            record.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {record.status === 'pending_approval' ? 'Pending Approval' : 
                             record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.issue_date ? new Date(record.issue_date).toLocaleDateString() : 'Not issued'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCertificate(record.id)}
                              title="View Certificate"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadCertificate(record)}
                              title="Download PDF"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintCertificate(record)}
                              title="Print Certificate"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Form View
        <Card>
          <CardHeader>
            <CardTitle>Create Conduct Certificate</CardTitle>
            <p className="text-sm text-gray-600">Fill in the details for the conduct certificate</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student *
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={selectedStudent ? `${formData.student_name} (${formData.admission_no})` : ''}
                    placeholder="Click to select student"
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
                    onClick={() => setShowStudentModal(true)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStudentModal(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Student
                  </Button>
                </div>
              </div>

              {selectedStudent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
                    <input
                      type="text"
                      value={formData.student_name}
                      onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admission Number *</label>
                    <input
                      type="text"
                      value={formData.admission_no}
                      onChange={(e) => setFormData({...formData, admission_no: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                    <select
                      value={formData.current_class}
                      onChange={(e) => setFormData({...formData, current_class: e.target.value, current_section: ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name || `Class ${cls.standard}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                    <select
                      value={formData.current_section}
                      onChange={(e) => setFormData({...formData, current_section: e.target.value})}
                      disabled={!formData.current_class}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Section</option>
                      {sections.map(section => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                    <input
                      type="text"
                      value={formData.father_name}
                      onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                    <input
                      type="text"
                      value={formData.mother_name}
                      onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Admission</label>
                    <input
                      type="date"
                      value={formData.date_of_admission}
                      onChange={(e) => setFormData({...formData, date_of_admission: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conduct Rating *</label>
                    <select
                      value={formData.conduct_rating}
                      onChange={(e) => setFormData({...formData, conduct_rating: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Improvement">Needs Improvement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.attendance_percentage}
                      onChange={(e) => setFormData({...formData, attendance_percentage: e.target.value})}
                      placeholder="e.g., 95.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {selectedStudent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Character Remarks *</label>
                    <textarea
                      value={formData.character_remarks}
                      onChange={(e) => setFormData({...formData, character_remarks: e.target.value})}
                      rows={3}
                      placeholder="Describe the student's character and conduct..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Behavior Notes</label>
                    <textarea
                      value={formData.behavior_notes}
                      onChange={(e) => setFormData({...formData, behavior_notes: e.target.value})}
                      rows={3}
                      placeholder="Additional behavioral observations..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Performance</label>
                    <textarea
                      value={formData.academic_performance}
                      onChange={(e) => setFormData({...formData, academic_performance: e.target.value})}
                      rows={3}
                      placeholder="Academic performance notes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Extracurricular Activities</label>
                    <textarea
                      value={formData.extracurricular_activities}
                      onChange={(e) => setFormData({...formData, extracurricular_activities: e.target.value})}
                      rows={3}
                      placeholder="Sports, cultural activities, achievements..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSubmit('draft')}
                      disabled={loading}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleSubmit('issued')}
                      disabled={loading}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {loading ? 'Processing...' : 'Issue Certificate'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Student Selection Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Select Student</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowStudentModal(false)}
              >
                ×
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or admission number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Students List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students
                .filter(student => 
                  !searchTerm || 
                  student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.admission_no?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((student) => (
                  <div
                    key={student.id || student._id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => selectStudent(student)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">
                          {student.admission_no ? `Admission No: ${student.admission_no}` : 'No admission number'} | Class: {student.class_name || student.class || 'N/A'} - {student.section || 'N/A'}
                        </p>
                        {student.father_name && (
                          <p className="text-xs text-gray-500">
                            Father: {student.father_name} {student.mother_name && `| Mother: ${student.mother_name}`}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
              
              {/* No students found */}
              {students.length === 0 && !searchTerm && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No HSS students enrolled yet</p>
                </div>
              )}
              
              {searchTerm && students
                .filter(student => 
                  student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.admission_no?.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No students found matching "{searchTerm}"</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowStudentModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate View Modal */}
      {showViewModal && selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowViewModal(false)}></div>
          <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Conduct Certificate Details</h3>
                <p className="text-gray-600 mt-1">Character and Conduct Certificate</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCertificate.student_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admission Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCertificate.admission_no}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Class & Section</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedCertificate.current_class} - {selectedCertificate.current_section}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Conduct Rating</label>
                  <Badge className={
                    selectedCertificate.conduct_rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                    selectedCertificate.conduct_rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                    selectedCertificate.conduct_rating === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {selectedCertificate.conduct_rating}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <Badge className={
                    selectedCertificate.status === 'issued' ? 'bg-green-100 text-green-800' :
                    selectedCertificate.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedCertificate.status === 'pending_approval' ? 'Pending Approval' : 
                     selectedCertificate.status.charAt(0).toUpperCase() + selectedCertificate.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Character Remarks</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedCertificate.character_remarks || 'No remarks provided'}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadCertificate(selectedCertificate)} className="bg-emerald-500 hover:bg-emerald-600">
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tags Management Component
const TagsManagement = () => {
  const navigate = useNavigate();
  
  // Tags Management States
  const [tags, setTags] = useState([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [tagCategoryFilter, setTagCategoryFilter] = useState('');
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedStudentForTag, setSelectedStudentForTag] = useState('');
  const [selectedTagForStudent, setSelectedTagForStudent] = useState('');
  const [selectedStaffForTag, setSelectedStaffForTag] = useState('');
  const [selectedTagForStaff, setSelectedTagForStaff] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
    fetchStudents();
    fetchStaff();
  }, []);

  // Tags Management Functions
  const fetchTags = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/tags`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTags(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch tags');
        setTags([]);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch students');
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    }
  };

  const fetchStaff = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/staff`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch staff');
        setStaff([]);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      setStaff([]);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Are you sure you want to delete this tag? It will be removed from all students and staff.')) {
      return;
    }

    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Tag deleted successfully');
        fetchTags(); // Refresh tags list
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to delete tag');
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
      toast.error('Failed to delete tag');
    }
  };

  const handleAssignTagToStudent = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/students/${selectedStudentForTag}/tags/${selectedTagForStudent}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Tag assigned to student successfully');
        setSelectedStudentForTag('');
        setSelectedTagForStudent('');
        fetchStudents(); // Refresh to show updated tags
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to assign tag');
      }
    } catch (error) {
      console.error('Failed to assign tag to student:', error);
      toast.error('Failed to assign tag to student');
    }
  };

  const handleAssignTagToStaff = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/staff/${selectedStaffForTag}/tags/${selectedTagForStaff}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Tag assigned to staff successfully');
        setSelectedStaffForTag('');
        setSelectedTagForStaff('');
        fetchStaff(); // Refresh to show updated tags
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to assign tag');
      }
    } catch (error) {
      console.error('Failed to assign tag to staff:', error);
      toast.error('Failed to assign tag to staff');
    }
  };

  const getTagUsageCount = (tagId, entityType) => {
    if (entityType === 'student') {
      return students.filter(student => student.tags && student.tags.includes(tagId)).length;
    } else if (entityType === 'staff') {
      return staff.filter(member => member.tags && member.tags.includes(tagId)).length;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/hss')}
            className="mb-4"
          >
            ← Back to HSS Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Set Tags</h1>
          <p className="text-gray-600">Manage student and staff categorization tags</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tags...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/hss')}
          className="mb-4"
        >
          ← Back to HSS Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Set Tags</h1>
            <p className="text-gray-600">Manage student and staff categorization tags</p>
          </div>
          <Button 
            onClick={() => setShowCreateTagModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Tag
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Tags Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearchTerm}
                  onChange={(e) => setTagSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <select 
              value={tagCategoryFilter}
              onChange={(e) => setTagCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="behavioral">Behavioral</option>
              <option value="achievement">Achievement</option>
              <option value="special">Special Needs</option>
            </select>
          </div>

          {/* Tags List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags
              .filter(tag => 
                (!tagSearchTerm || tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())) &&
                (!tagCategoryFilter || tag.category === tagCategoryFilter)
              )
              .map((tag) => (
                <Card key={tag.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{backgroundColor: tag.color}}
                        ></div>
                        <h3 className="font-medium text-gray-900">{tag.name}</h3>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTag(tag);
                            setShowCreateTagModal(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTag(tag.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs mb-2">
                      {tag.category}
                    </Badge>
                    {tag.description && (
                      <p className="text-sm text-gray-600 mb-3">{tag.description}</p>
                    )}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Students: {getTagUsageCount(tag.id, 'student')}</span>
                      <span>Staff: {getTagUsageCount(tag.id, 'staff')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Empty State */}
          {tags.length === 0 && (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tags Found</h3>
              <p className="text-gray-600 mb-4">Create your first tag to categorize students and staff</p>
              <Button 
                onClick={() => setShowCreateTagModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </div>
          )}

          {/* Tag Assignment Section */}
          {tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Tag Assignment</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assign Tags to Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <select 
                        value={selectedStudentForTag}
                        onChange={(e) => setSelectedStudentForTag(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select Student</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name} ({student.admission_no})
                          </option>
                        ))}
                      </select>
                      <select 
                        value={selectedTagForStudent}
                        onChange={(e) => setSelectedTagForStudent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select Tag</option>
                        {tags.map((tag) => (
                          <option key={tag.id} value={tag.id}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
                      <Button 
                        onClick={handleAssignTagToStudent}
                        disabled={!selectedStudentForTag || !selectedTagForStudent}
                        className="w-full bg-emerald-500 hover:bg-emerald-600"
                      >
                        Assign Tag to Student
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Staff Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assign Tags to Staff</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <select 
                        value={selectedStaffForTag}
                        onChange={(e) => setSelectedStaffForTag(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select Staff</option>
                        {staff.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} ({member.employee_id})
                          </option>
                        ))}
                      </select>
                      <select 
                        value={selectedTagForStaff}
                        onChange={(e) => setSelectedTagForStaff(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select Tag</option>
                        {tags.map((tag) => (
                          <option key={tag.id} value={tag.id}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
                      <Button 
                        onClick={handleAssignTagToStaff}
                        disabled={!selectedStaffForTag || !selectedTagForStaff}
                        className="w-full bg-emerald-500 hover:bg-emerald-600"
                      >
                        Assign Tag to Staff
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Tag Modal */}
      {showCreateTagModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowCreateTagModal(false);
              setEditingTag(null);
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {editingTag ? 'Edit Tag' : 'Create New Tag'}
                    </h3>
                    
                    <CreateTagForm 
                      editingTag={editingTag} 
                      onSuccess={() => {
                        setShowCreateTagModal(false);
                        setEditingTag(null);
                        fetchTags();
                      }}
                      onCancel={() => {
                        setShowCreateTagModal(false);
                        setEditingTag(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main HSS Component with Routing
const HSS = () => {
  return (
    <Routes>
      <Route index element={<HSSMainView />} />
      <Route path="enroll" element={<NewEnrollmentWizard />} />
      <Route path="enroll/new" element={<NewEnrollmentWizard />} />
      <Route path="register" element={<HSSAdmissionRegister />} />
      <Route path="transfer" element={<HSSTransferCertificate />} />
      <Route path="consolidated" element={<HSSConsolidatedReport />} />
      <Route path="conduct" element={<HSSConductCertificate />} />
      <Route path="tags" element={<TagsManagement />} />
    </Routes>
  );
};

export default HSS;