import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { 
  Award,
  FileText,
  Download,
  CreditCard,
  Users,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Mail,
  Plus,
  UserPlus,
  Calendar,
  School,
  MapPin,
  X,
  ArrowLeft
} from 'lucide-react';

const Certificates = () => {
  const [totalIssued, setTotalIssued] = useState(0);
  const [pending, setPending] = useState(0);

  // Certificate Generation Modal States
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertType, setSelectedCertType] = useState('');
  const [certificateStudents, setCertificateStudents] = useState([]);
  const [allCertificates, setAllCertificates] = useState([]);

  // Main Tab State
  const [activeTab, setActiveTab] = useState('course');
  
  // Course Certificate States
  const [ccView, setCcView] = useState('list'); // 'list' or 'form'
  const [ccRecords, setCcRecords] = useState([]);
  const [ccSearchTerm, setCcSearchTerm] = useState('');
  const [ccStatusFilter, setCcStatusFilter] = useState('all');
  const [selectedCourseStudent, setSelectedCourseStudent] = useState(null);
  const [showCourseStudentModal, setShowCourseStudentModal] = useState(false);
  const [ccLoading, setCcLoading] = useState(false);
  
  const [ccFormData, setCcFormData] = useState({
    student_id: '',
    student_name: '',
    admission_no: '',
    course_name: '',
    completion_date: '',
    grade_obtained: '',
    credits_earned: '',
    instructor_name: '',
    course_duration: '',
    status: 'draft'
  });

  // CC View/Print States
  const [showCcViewModal, setShowCcViewModal] = useState(false);
  const [selectedCc, setSelectedCc] = useState(null);

  // Transfer Certificate States
  const [tcView, setTcView] = useState('list'); // 'list' or 'form'
  const [tcRecords, setTcRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // TC View/Print States
  const [showTcViewModal, setShowTcViewModal] = useState(false);
  const [selectedTc, setSelectedTc] = useState(null);
  
  // Progress Report States
  const [prView, setPrView] = useState('list'); // 'list' or 'form'
  const [prRecords, setPrRecords] = useState([]);
  const [prSearchTerm, setPrSearchTerm] = useState('');
  const [prStatusFilter, setPrStatusFilter] = useState('all');
  const [selectedProgressStudent, setSelectedProgressStudent] = useState(null);
  const [showProgressStudentModal, setShowProgressStudentModal] = useState(false);
  const [prLoading, setPrLoading] = useState(false);
  const [showPrViewModal, setShowPrViewModal] = useState(false);
  const [selectedPr, setSelectedPr] = useState(null);
  
  const [prFormData, setPrFormData] = useState({
    student_id: '',
    student_name: '',
    admission_no: '',
    class_name: '',
    section: '',
    academic_year: '',
    term: '',
    overall_grade: '',
    attendance_percentage: '',
    subjects: [],
    teacher_remarks: '',
    principal_remarks: '',
    issue_date: '',
    status: 'draft'
  });
  
  // Bonafide Certificate States
  const [bfView, setBfView] = useState('list'); // 'list' or 'form'
  const [bfRecords, setBfRecords] = useState([]);
  const [bfSearchTerm, setBfSearchTerm] = useState('');
  const [bfStatusFilter, setBfStatusFilter] = useState('all');
  const [selectedBonafideStudent, setSelectedBonafideStudent] = useState(null);
  const [showBonafideStudentModal, setShowBonafideStudentModal] = useState(false);
  const [bfLoading, setBfLoading] = useState(false);
  
  const [bfFormData, setBfFormData] = useState({
    student_id: '',
    student_name: '',
    admission_no: '',
    father_name: '',
    mother_name: '',
    class_name: '',
    section: '',
    academic_year: '',
    purpose: '',
    status: 'draft'
  });
  
  // Adhar Extract States
  const [aeView, setAeView] = useState('list'); // 'list' or 'form'
  const [aeRecords, setAeRecords] = useState([]);
  const [aeSearchTerm, setAeSearchTerm] = useState('');
  const [aeStatusFilter, setAeStatusFilter] = useState('all');
  const [selectedAdharStudent, setSelectedAdharStudent] = useState(null);
  const [showAdharStudentModal, setShowAdharStudentModal] = useState(false);
  const [aeLoading, setAeLoading] = useState(false);
  
  const [aeFormData, setAeFormData] = useState({
    student_id: '',
    student_name: '',
    admission_no: '',
    class_name: '',
    section: '',
    adhar_number: '',
    purpose: '',
    academic_year: '',
    guardian_name: '',
    guardian_relationship: '',
    contact_number: '',
    address: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    verified_by: '',
    issue_date: '',
    status: 'draft'
  });
  
  const [tcFormData, setTcFormData] = useState({
    student_id: '',
    student_name: '',
    admission_no: '',
    date_of_admission: '',
    last_class: '',
    last_section: '',
    date_of_leaving: '',
    reason_for_transfer: '',
    conduct_remarks: '',
    issue_date: '',
    status: 'draft' // draft, pending_approval, issued
  });

  // ID Cards States
  const [showStudentIdModal, setShowStudentIdModal] = useState(false);
  const [showStaffIdModal, setShowStaffIdModal] = useState(false);
  const [showPrintCardsModal, setShowPrintCardsModal] = useState(false);
  const [idCardsLoading, setIdCardsLoading] = useState(false);
  const [selectedStudentsForId, setSelectedStudentsForId] = useState([]);
  const [selectedStaffForId, setSelectedStaffForId] = useState([]);
  const [generatedIdCards, setGeneratedIdCards] = useState([]);
  const [idCardsView, setIdCardsView] = useState('main'); // 'main' or 'generated'
  const [availableStaff, setAvailableStaff] = useState([]);
  const [showCardPreviewModal, setShowCardPreviewModal] = useState(false);
  const [selectedCardForPreview, setSelectedCardForPreview] = useState(null);

  // Load generated ID cards from localStorage on component mount
  useEffect(() => {
    const savedCards = localStorage.getItem('generatedIdCards');
    if (savedCards) {
      try {
        const parsedCards = JSON.parse(savedCards);
        setGeneratedIdCards(parsedCards);
        if (parsedCards.length > 0) {
          setIdCardsView('generated');
        }
      } catch (error) {
        console.error('Failed to load saved ID cards:', error);
      }
    }
  }, []);

  // Save generated ID cards to localStorage whenever they change
  useEffect(() => {
    if (generatedIdCards.length > 0) {
      localStorage.setItem('generatedIdCards', JSON.stringify(generatedIdCards));
    }
  }, [generatedIdCards]);

  useEffect(() => {
    fetchCertificatesData();
    fetchTCRecords();
    fetchCCRecords();
    fetchPRRecords();
    fetchBFRecords();
    fetchAERecords();
    fetchStudents();
    fetchStaff();
  }, []);

  const fetchCertificatesData = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      // Fetch real dashboard data
      const dashboardResponse = await fetch(`${API}/certificates/dashboard`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setTotalIssued(dashboardData.total_issued || 0);
        setPending(dashboardData.pending || 0);
      } else {
        // Fallback to 0 if API fails
        setTotalIssued(0);
        setPending(0);
      }
      
      // Fetch all certificate types
      const tcResponse = await fetch(`${API}/transfer-certificates`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (tcResponse.ok) {
        const tcData = await tcResponse.json();
        setAllCertificates(tcData.transfer_certificates || []);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      setTotalIssued(0);
      setPending(0);
    }
  };

  const handleGenerateCertificate = () => {
    setShowCertificateModal(true);
    setCertificateStudents(availableStudents);
  };

  const certificateTypes = [
    { id: 'course', name: 'Course Completion Certificate', icon: Award },
    { id: 'transfer', name: 'Transfer Certificate', icon: FileText },
    { id: 'progress', name: 'Progress Report', icon: FileText },
    { id: 'bonafide', name: 'Bonafide Certificate', icon: Award },
    { id: 'id_cards', name: 'ID Cards', icon: CreditCard }
  ];

  const handleCertificateTypeSelect = (type) => {
    setSelectedCertType(type);
    setShowCertificateModal(false);
    
    if (type === 'transfer') {
      // Switch to Transfer tab and open form
      setActiveTab('transfer');
      setTimeout(() => {
        setTcView('form');
        toast.success('Transfer Certificate form is ready! Select a student to begin.');
      }, 100);
    } else if (type === 'course') {
      // Switch to Course tab  
      setActiveTab('course');
      toast.success('Course Certificate generation is ready! Select students and generate certificates.');
    } else if (type === 'progress') {
      // Switch to Progress Report tab
      setActiveTab('progress');
      toast.success('Progress Report generation is ready! Select students and generate reports.');
    } else if (type === 'bonafide') {
      // Switch to Bonafide tab
      setActiveTab('bonafide');
      toast.success('Bonafide Certificate generation is ready! Select students and generate certificates.');
    } else if (type === 'id_cards') {
      // Switch to ID Cards tab
      setActiveTab('id_cards');
      toast.success('ID Card generation is ready! Select students/staff and generate cards.');
    } else {
      toast.info(`${certificateTypes.find(ct => ct.id === type)?.name} generation functionality coming soon!`);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // API returns students array directly, not wrapped in an object
        // Filter to ensure only valid student objects with required properties
        const validStudents = Array.isArray(data) ? data.filter(student => 
          student && 
          typeof student === 'object' &&
          typeof student.name === 'string' &&
          typeof student.admission_no === 'string' &&
          student.id
        ) : [];
        setAvailableStudents(validStudents);
      } else {
        console.error('Failed to fetch students');
        setAvailableStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTCRecords = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/transfer-certificates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTcRecords(data.transfer_certificates || []);
      } else {
        console.error('Failed to fetch transfer certificates');
        setTcRecords([]);
      }
    } catch (error) {
      console.error('Failed to fetch transfer certificates:', error);
      setTcRecords([]);
    }
  };
  
  const fetchCCRecords = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/course-certificates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCcRecords(data.course_certificates || []);
      } else {
        console.error('Failed to fetch course certificates');
        setCcRecords([]);
      }
    } catch (error) {
      console.error('Failed to fetch course certificates:', error);
      setCcRecords([]);
    }
  };

  // Course Certificate Helper Functions
  const handleCreateCourseCertificate = async () => {
    if (!ccFormData.student_id || !ccFormData.course_name || !ccFormData.completion_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCcLoading(true);
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/course-certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(ccFormData)
      });

      if (response.ok) {
        const newCertificate = await response.json();
        setCcRecords([newCertificate, ...ccRecords]);
        setCcView('list');
        setCcFormData({
          student_id: '',
          student_name: '',
          admission_no: '',
          course_name: '',
          completion_date: '',
          grade_obtained: '',
          credits_earned: '',
          instructor_name: '',
          course_duration: '',
          status: 'draft'
        });
        setSelectedCourseStudent(null);
        toast.success('Course certificate created successfully!');
        
        // Refresh dashboard data
        fetchCertificatesData();
      } else {
        const errorData = await response.json();
        
        let errorMessage = 'Failed to create course certificate';
        if (typeof errorData?.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData?.detail)) {
          errorMessage = errorData.detail
            .map(err => typeof err === 'string' ? err : err.msg || err.message || 'Validation error')
            .join(', ');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to create course certificate:', error);
      toast.error('Failed to create course certificate');
    } finally {
      setCcLoading(false);
    }
  };

  const selectCourseStudent = (student) => {
    setCcFormData({
      ...ccFormData,
      student_id: student.id,
      student_name: student.name,
      admission_no: student.admission_no
    });
    setSelectedCourseStudent(student);
    setShowCourseStudentModal(false);
    toast.success(`Student ${student.name} selected successfully!`);
  };

  const resetCourseForm = () => {
    setCcFormData({
      student_id: '',
      student_name: '',
      admission_no: '',
      course_name: '',
      completion_date: '',
      grade_obtained: '',
      credits_earned: '',
      instructor_name: '',
      course_duration: '',
      status: 'draft'
    });
    setSelectedCourseStudent(null);
  };

  // CC Action Handlers
  const handleViewCC = (ccId) => {
    const cc = ccRecords.find(c => c.id === ccId);
    if (cc) {
      setSelectedCc(cc);
      setShowCcViewModal(true);
    } else {
      toast.error('Course Certificate not found');
    }
  };

  const handleDownloadCC = async (cc) => {
    try {
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Course Completion Certificate - ${cc.admission_no}</title>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Georgia', serif; margin: 0; padding: 20px; background: #f5f5f5; }
              .certificate { max-width: 800px; margin: 0 auto; padding: 60px; background: white; border: 3px solid #2c5282; position: relative; }
              .header { text-align: center; margin-bottom: 40px; }
              .school-name { font-size: 32px; font-weight: bold; color: #2c5282; margin-bottom: 10px; }
              .cert-title { font-size: 28px; color: #2c5282; margin: 30px 0; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
              .content { text-align: center; font-size: 18px; line-height: 2; margin: 30px 0; }
              .student-name { font-size: 32px; font-weight: bold; color: #1a365d; margin: 20px 0; text-decoration: underline; }
              .course-name { font-size: 24px; color: #2c5282; font-weight: bold; margin: 20px 0; }
              .details { margin: 40px 0; text-align: center; }
              .detail-row { margin: 15px 0; font-size: 16px; }
              .footer { margin-top: 60px; display: flex; justify-content: space-between; padding: 0 40px; }
              .signature { text-align: center; border-top: 2px solid #333; width: 200px; padding-top: 10px; }
              .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; font-size: 100px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="certificate">
              <div class="watermark">CERTIFIED</div>
              <div class="header">
                <div class="school-name">School Name</div>
                <div style="font-size: 14px; color: #666;">School Address</div>
              </div>
              
              <div class="cert-title">Certificate of Course Completion</div>
              
              <div class="content">
                <div>This is to certify that</div>
                <div class="student-name">${cc.student_name}</div>
                <div>Admission No: ${cc.admission_no}</div>
                <div style="margin: 30px 0;">has successfully completed the course</div>
                <div class="course-name">${cc.course_name}</div>
              </div>
              
              <div class="details">
                <div class="detail-row"><strong>Duration:</strong> ${cc.course_duration || 'N/A'}</div>
                <div class="detail-row"><strong>Completion Date:</strong> ${new Date(cc.completion_date).toLocaleDateString()}</div>
                <div class="detail-row"><strong>Grade Obtained:</strong> ${cc.grade_obtained || 'N/A'}</div>
                <div class="detail-row"><strong>Credits Earned:</strong> ${cc.credits_earned || 'N/A'}</div>
                <div class="detail-row"><strong>Instructor:</strong> ${cc.instructor_name || 'N/A'}</div>
              </div>
              
              <div class="footer">
                <div class="signature">
                  <div>Instructor</div>
                </div>
                <div class="signature">
                  <div>Principal</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
      toast.success('Certificate opened for download/print');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handlePrintCC = (cc) => {
    handleDownloadCC(cc); // Reuse the same function for print
  };

  // Filter Course Certificates
  const filteredCCRecords = ccRecords.filter(cc => {
    const matchesSearch = cc.student_name?.toLowerCase().includes(ccSearchTerm.toLowerCase()) ||
                         cc.admission_no?.toLowerCase().includes(ccSearchTerm.toLowerCase()) ||
                         cc.course_name?.toLowerCase().includes(ccSearchTerm.toLowerCase());
    const matchesStatus = ccStatusFilter === 'all' || cc.status === ccStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Progress Report API Functions
  const fetchPRRecords = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/progress-reports`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrRecords(data.progress_reports || []);
      } else {
        console.error('Failed to fetch progress reports');
        setPrRecords([]);
      }
    } catch (error) {
      console.error('Failed to fetch progress reports:', error);
      setPrRecords([]);
    }
  };

  const handleCreateProgressReport = async () => {
    if (!prFormData.student_id || !prFormData.academic_year || !prFormData.term) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setPrLoading(true);
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/progress-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(prFormData)
      });

      if (response.ok) {
        const newReport = await response.json();
        setPrRecords([newReport, ...prRecords]);
        setPrView('list');
        setPrFormData({
          student_id: '',
          student_name: '',
          admission_no: '',
          class_name: '',
          section: '',
          academic_year: '',
          term: '',
          overall_grade: '',
          attendance_percentage: '',
          subjects: [],
          teacher_remarks: '',
          principal_remarks: '',
          issue_date: '',
          status: 'draft'
        });
        setSelectedProgressStudent(null);
        toast.success('Progress report created successfully!');
        
        // Refresh dashboard data
        fetchCertificatesData();
      } else {
        const errorData = await response.json();
        console.error('Progress Report creation failed - Full Response:', errorData);
        console.error('Progress Report data being sent:', prFormData);
        
        let errorMessage = 'Failed to create progress report';
        if (typeof errorData?.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData?.detail)) {
          errorMessage = errorData.detail
            .map(err => {
              if (typeof err === 'string') return err;
              const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown field';
              const msg = err.msg || err.message || 'Validation error';
              return `${field}: ${msg}`;
            })
            .join(', ');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to create progress report:', error);
      toast.error('Failed to create progress report');
    } finally {
      setPrLoading(false);
    }
  };

  const selectProgressStudent = (student) => {
    setPrFormData({
      ...prFormData,
      student_id: student.id,
      student_name: student.name,
      admission_no: student.admission_no,
      class_name: student.class_name || student.class_id || '',
      section: student.section_name || student.section || student.section_id || ''
    });
    setSelectedProgressStudent(student);
    setShowProgressStudentModal(false);
    toast.success(`Student ${student.name} selected successfully!`);
  };

  const resetProgressForm = () => {
    setPrFormData({
      student_id: '',
      student_name: '',
      admission_no: '',
      class_name: '',
      section: '',
      academic_year: '',
      term: '',
      overall_grade: '',
      attendance_percentage: '',
      subjects: [],
      teacher_remarks: '',
      principal_remarks: '',
      issue_date: '',
      status: 'draft'
    });
    setSelectedProgressStudent(null);
  };

  // PR Action Handlers
  const handleViewPR = (prId) => {
    const pr = prRecords.find(p => p.id === prId || p._id === prId);
    if (pr) {
      setSelectedPr(pr);
      setShowPrViewModal(true);
    } else {
      toast.error('Progress Report not found');
    }
  };

  const handlePDFPR = async (pr) => {
    try {
      const printContent = generatePRPrintContent(pr);
      
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Progress Report - ${pr.admission_no}</title>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
              
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              body { 
                font-family: 'Poppins', 'Roboto', sans-serif; 
                margin: 20px; 
                background: #f5f5f5;
                color: #111827;
              }
              
              .report { 
                max-width: 850px; 
                margin: 0 auto; 
                padding: 40px; 
                background: white;
                border: 3px solid #1E3A8A;
                position: relative;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              }
              
              .header {
                background: #1E3A8A;
                color: white;
                padding: 25px;
                border-radius: 8px 8px 0 0;
                margin: -40px -40px 30px -40px;
                text-align: center;
              }
              
              .school-name {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: 1px;
              }
              
              .report-title {
                font-size: 20px;
                margin-top: 10px;
                font-weight: 600;
              }
              
              .student-info {
                background: #F8FAFC;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
              }
              
              .info-item {
                display: flex;
                gap: 8px;
              }
              
              .info-label {
                font-weight: 600;
                color: #374151;
              }
              
              .info-value {
                color: #111827;
              }
              
              .subjects-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              
              .subjects-table th {
                background: #1E3A8A;
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: 600;
              }
              
              .subjects-table td {
                padding: 12px;
                border-bottom: 1px solid #E5E7EB;
              }
              
              .subjects-table tr:nth-child(even) {
                background: #F9FAFB;
              }
              
              .remarks-section {
                margin: 20px 0;
                padding: 15px;
                background: #FEF3C7;
                border-left: 4px solid #F59E0B;
                border-radius: 4px;
              }
              
              .remarks-label {
                font-weight: 600;
                color: #92400E;
                margin-bottom: 8px;
              }
              
              .remarks-text {
                color: #78350F;
                line-height: 1.6;
              }
              
              .signature-section {
                display: flex;
                justify-content: space-between;
                margin-top: 50px;
              }
              
              .signature-box {
                text-align: center;
                width: 200px;
              }
              
              .signature-line {
                height: 60px;
                border-bottom: 2px solid #111827;
                margin-bottom: 10px;
              }
              
              @media print {
                body { margin: 0; background: white; }
                .report { box-shadow: none; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #1E3A8A; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print Report</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6B7280; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
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

  const handlePrintPR = (pr) => {
    try {
      const printContent = generatePRPrintContent(pr);
      
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Progress Report - ${pr.admission_no}</title>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
              
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              body { 
                font-family: 'Poppins', 'Roboto', sans-serif; 
                margin: 20px; 
                background: #f5f5f5;
                color: #111827;
              }
              
              .report { 
                max-width: 850px; 
                margin: 0 auto; 
                padding: 40px; 
                background: white;
                border: 3px solid #1E3A8A;
                position: relative;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              }
              
              .header {
                background: #1E3A8A;
                color: white;
                padding: 25px;
                border-radius: 8px 8px 0 0;
                margin: -40px -40px 30px -40px;
                text-align: center;
              }
              
              .school-name {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: 1px;
              }
              
              .report-title {
                font-size: 20px;
                margin-top: 10px;
                font-weight: 600;
              }
              
              .student-info {
                background: #F8FAFC;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
              }
              
              .info-item {
                display: flex;
                gap: 8px;
              }
              
              .info-label {
                font-weight: 600;
                color: #374151;
              }
              
              .info-value {
                color: #111827;
              }
              
              .subjects-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              
              .subjects-table th {
                background: #1E3A8A;
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: 600;
              }
              
              .subjects-table td {
                padding: 12px;
                border-bottom: 1px solid #E5E7EB;
              }
              
              .subjects-table tr:nth-child(even) {
                background: #F9FAFB;
              }
              
              .remarks-section {
                margin: 20px 0;
                padding: 15px;
                background: #FEF3C7;
                border-left: 4px solid #F59E0B;
                border-radius: 4px;
              }
              
              .remarks-label {
                font-weight: 600;
                color: #92400E;
                margin-bottom: 8px;
              }
              
              .remarks-text {
                color: #78350F;
                line-height: 1.6;
              }
              
              .signature-section {
                display: flex;
                justify-content: space-between;
                margin-top: 50px;
              }
              
              .signature-box {
                text-align: center;
                width: 200px;
              }
              
              .signature-line {
                height: 60px;
                border-bottom: 2px solid #111827;
                margin-bottom: 10px;
              }
              
              @media print {
                body { margin: 0; background: white; }
                .report { box-shadow: none; }
                .no-print { display: none !important; }
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
      console.error('Failed to print PR:', error);
      toast.error('Failed to print Progress Report');
    }
  };

  const generatePRPrintContent = (pr) => {
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <div class="report">
        <div class="header">
          <div class="school-name">DEMO SCHOOL</div>
          <div class="report-title">📊 STUDENT PROGRESS REPORT 📊</div>
        </div>
        
        <div class="student-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Student Name:</span>
              <span class="info-value">${pr.student_name || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Admission No:</span>
              <span class="info-value">${pr.admission_no || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Class:</span>
              <span class="info-value">${pr.class_name || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Section:</span>
              <span class="info-value">${pr.section || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Academic Year:</span>
              <span class="info-value">${pr.academic_year || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Semester/Term:</span>
              <span class="info-value">${pr.semester || pr.term || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Overall Grade:</span>
              <span class="info-value"><strong>${pr.overall_grade || 'N/A'}</strong></span>
            </div>
            <div class="info-item">
              <span class="info-label">Attendance:</span>
              <span class="info-value">${pr.attendance_percentage || 'N/A'}%</span>
            </div>
          </div>
        </div>
        
        ${pr.subjects && pr.subjects.length > 0 ? `
        <h3 style="margin: 20px 0 10px 0; color: #1E3A8A;">Subject-wise Performance</h3>
        <table class="subjects-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks Obtained</th>
              <th>Total Marks</th>
              <th>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${pr.subjects.map(subject => `
              <tr>
                <td>${subject.subject_name || subject.name || 'N/A'}</td>
                <td>${subject.marks_obtained || 'N/A'}</td>
                <td>${subject.total_marks || 'N/A'}</td>
                <td><strong>${subject.grade || 'N/A'}</strong></td>
                <td>${subject.remarks || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<p style="text-align: center; color: #6B7280; margin: 20px 0;">No subject details available</p>'}
        
        ${pr.teacher_remarks ? `
        <div class="remarks-section">
          <div class="remarks-label">👨‍🏫 Class Teacher's Remarks:</div>
          <div class="remarks-text">${pr.teacher_remarks}</div>
        </div>
        ` : ''}
        
        ${pr.principal_remarks ? `
        <div class="remarks-section">
          <div class="remarks-label">👔 Principal's Remarks:</div>
          <div class="remarks-text">${pr.principal_remarks}</div>
        </div>
        ` : ''}
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>Class Teacher</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>Principal</div>
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #6B7280;">
          Generated on: ${currentDate} | Report ID: ${pr.id || pr._id || 'N/A'}
        </div>
      </div>
    `;
  };

  // Filter Progress Reports
  const filteredPRRecords = prRecords.filter(pr => {
    const matchesSearch = pr.student_name?.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
                         pr.admission_no?.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
                         pr.academic_year?.toLowerCase().includes(prSearchTerm.toLowerCase());
    const matchesStatus = prStatusFilter === 'all' || pr.status === prStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Bonafide Certificate API Functions
  const fetchBFRecords = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/bonafide-certificates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBfRecords(data.bonafide_certificates || []);
      } else {
        console.error('Failed to fetch bonafide certificates');
        setBfRecords([]);
      }
    } catch (error) {
      console.error('Failed to fetch bonafide certificates:', error);
      setBfRecords([]);
    }
  };

  const handleCreateBonafideCertificate = async () => {
    if (!bfFormData.student_id || !bfFormData.purpose || !bfFormData.academic_year) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setBfLoading(true);
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/bonafide-certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bfFormData)
      });

      if (response.ok) {
        const newCertificate = await response.json();
        setBfRecords([newCertificate, ...bfRecords]);
        setBfView('list');
        setBfFormData({
          student_id: '',
          student_name: '',
          admission_no: '',
          father_name: '',
          mother_name: '',
          class_name: '',
          section: '',
          academic_year: '',
          purpose: '',
          status: 'draft'
        });
        setSelectedBonafideStudent(null);
        toast.success('Bonafide certificate created successfully!');
        
        // Refresh dashboard data
        fetchCertificatesData();
      } else {
        const errorData = await response.json();
        
        let errorMessage = 'Failed to create bonafide certificate';
        if (typeof errorData?.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData?.detail)) {
          errorMessage = errorData.detail
            .map(err => typeof err === 'string' ? err : err.msg || err.message || 'Validation error')
            .join(', ');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to create bonafide certificate:', error);
      toast.error('Failed to create bonafide certificate');
    } finally {
      setBfLoading(false);
    }
  };

  const selectBonafideStudent = (student) => {
    setBfFormData({
      ...bfFormData,
      student_id: student.id,
      student_name: student.name,
      admission_no: student.admission_no,
      father_name: student.father_name || '',
      mother_name: student.mother_name || '',
      class_name: student.class_name || student.class_id || '',
      section: student.section_name || student.section || ''
    });
    setSelectedBonafideStudent(student);
    setShowBonafideStudentModal(false);
    toast.success(`Student ${student.name} selected successfully!`);
  };

  const resetBonafideForm = () => {
    setBfFormData({
      student_id: '',
      student_name: '',
      admission_no: '',
      father_name: '',
      mother_name: '',
      class_name: '',
      section: '',
      academic_year: '',
      purpose: '',
      status: 'draft'
    });
    setSelectedBonafideStudent(null);
  };

  // Filter Bonafide Certificates
  const filteredBFRecords = bfRecords.filter(bf => {
    const matchesSearch = bf.student_name?.toLowerCase().includes(bfSearchTerm.toLowerCase()) ||
                         bf.admission_no?.toLowerCase().includes(bfSearchTerm.toLowerCase()) ||
                         bf.purpose?.toLowerCase().includes(bfSearchTerm.toLowerCase());
    const matchesStatus = bfStatusFilter === 'all' || bf.status === bfStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Adhar Extract API Functions
  const fetchAERecords = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/adhar-extracts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAeRecords(data.adhar_extracts || []);
      } else {
        console.error('Failed to fetch adhar extracts');
        setAeRecords([]);
      }
    } catch (error) {
      console.error('Failed to fetch adhar extracts:', error);
      setAeRecords([]);
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
        // Filter to ensure only valid staff objects with required properties
        const validStaff = Array.isArray(data) ? data.filter(staff => 
          staff && 
          typeof staff === 'object' &&
          (staff.full_name || staff.name) &&
          staff.id
        ) : [];
        setAvailableStaff(validStaff);
      } else {
        console.error('Failed to fetch staff');
        setAvailableStaff([]);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      setAvailableStaff([]);
    }
  };

  const handleCreateAdharExtract = async () => {
    // Validate all required fields
    if (!aeFormData.student_id || !aeFormData.student_name || !aeFormData.admission_no || 
        !aeFormData.class_name || !aeFormData.section || !aeFormData.adhar_number || 
        !aeFormData.purpose || !aeFormData.academic_year || !aeFormData.guardian_name || 
        !aeFormData.guardian_relationship || !aeFormData.contact_number || 
        !aeFormData.address || !aeFormData.father_name || !aeFormData.mother_name || 
        !aeFormData.date_of_birth || !aeFormData.verified_by || !aeFormData.issue_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setAeLoading(true);
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/adhar-extracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(aeFormData)
      });

      if (response.ok) {
        const newExtract = await response.json();
        setAeRecords([newExtract, ...aeRecords]);
        setAeView('list');
        setAeFormData({
          student_id: '',
          student_name: '',
          admission_no: '',
          class_name: '',
          section: '',
          adhar_number: '',
          purpose: '',
          academic_year: '',
          guardian_name: '',
          guardian_relationship: '',
          contact_number: '',
          address: '',
          father_name: '',
          mother_name: '',
          date_of_birth: '',
          verified_by: '',
          issue_date: '',
          status: 'draft'
        });
        setSelectedAdharStudent(null);
        toast.success('Adhar extract created successfully!');
        
        // Refresh dashboard data
        fetchCertificatesData();
      } else {
        const errorData = await response.json();
        console.error('Adhar Extract creation failed - Full Response:', errorData);
        console.error('Form data being sent:', aeFormData);
        
        let errorMessage = 'Failed to create adhar extract';
        if (typeof errorData?.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData?.detail)) {
          errorMessage = errorData.detail
            .map(err => {
              if (typeof err === 'string') return err;
              const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown field';
              const msg = err.msg || err.message || 'Validation error';
              return `${field}: ${msg}`;
            })
            .join(', ');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to create adhar extract:', error);
      toast.error('Failed to create adhar extract');
    } finally {
      setAeLoading(false);
    }
  };

  const selectAdharStudent = (student) => {
    setAeFormData({
      ...aeFormData,
      student_id: student.id,
      student_name: student.name,
      admission_no: student.admission_no,
      class_name: student.class_name || student.class_id || '',
      section: student.section_name || student.section || student.section_id || '',
      guardian_name: student.guardian_name || '',
      contact_number: student.guardian_phone || student.phone || '',
      address: student.address || '',
      guardian_relationship: student.guardian_relationship || 'Parent',
      father_name: student.father_name || '',
      mother_name: student.mother_name || '',
      date_of_birth: student.date_of_birth || ''
    });
    setSelectedAdharStudent(student);
    setShowAdharStudentModal(false);
    toast.success(`Student ${student.name} selected successfully!`);
  };

  const resetAdharForm = () => {
    setAeFormData({
      student_id: '',
      student_name: '',
      admission_no: '',
      class_name: '',
      section: '',
      adhar_number: '',
      purpose: '',
      academic_year: '',
      guardian_name: '',
      guardian_relationship: '',
      contact_number: '',
      address: '',
      father_name: '',
      mother_name: '',
      date_of_birth: '',
      verified_by: '',
      issue_date: '',
      status: 'draft'
    });
    setSelectedAdharStudent(null);
  };

  // ID Card Generation Functions
  const generateStudentIdCards = async (studentIds) => {
    try {
      const selectedStudents = availableStudents.filter(student => studentIds.includes(student.id));
      
      const newCards = selectedStudents.map(student => ({
        id: `student-${student.id}-${Date.now()}`,
        type: 'student',
        studentData: {
          name: student.name,
          admission_no: student.admission_no,
          class_name: student.class_name || student.class_id || 'N/A',
          section: student.section || 'A',
          roll_number: student.roll_number || student.admission_no,
          photo: student.photo_url || student.photo || student.profile_picture || null,
          emergency_contact: student.emergency_contact || 'N/A',
          blood_group: student.blood_group || 'N/A',
          student_id: student.id
        },
        generatedDate: new Date().toISOString(),
        generatedBy: 'System Admin',
        status: 'generated',
        cardNumber: `STU${student.admission_no}${new Date().getFullYear()}`
      }));

      setGeneratedIdCards(prev => [...prev, ...newCards]);
      setIdCardsView('generated');
      return newCards;
    } catch (error) {
      console.error('Error generating student ID cards:', error);
      throw error;
    }
  };

  const generateStaffIdCards = async (staffIds) => {
    try {
      const selectedStaff = availableStaff.filter(staff => staffIds.includes(staff.id));
      
      const newCards = selectedStaff.map(staff => {
        const empId = staff.employee_id || staff.staff_id || staff.id;
        return {
          id: `staff-${staff.id}-${Date.now()}`,
          type: 'staff',
          staffData: {
            name: staff.full_name || staff.name,
            employee_id: empId,
            department: staff.department || 'General',
            designation: staff.designation || staff.role || 'Staff',
            phone: staff.phone || staff.contact || 'N/A',
            email: staff.email || 'N/A',
            photo: staff.photo || staff.profile_picture || null,
            join_date: staff.join_date || staff.joining_date || 'N/A',
            staff_id: staff.id
          },
          generatedDate: new Date().toISOString(),
          generatedBy: 'System Admin',
          status: 'generated',
          cardNumber: `STF${empId}${new Date().getFullYear()}`
        };
      });

      setGeneratedIdCards(prev => [...prev, ...newCards]);
      setIdCardsView('generated');
      return newCards;
    } catch (error) {
      console.error('Error generating staff ID cards:', error);
      throw error;
    }
  };

  // ID Card Preview and Print Functions
  const handleCardPreview = (card) => {
    setSelectedCardForPreview(card);
    setShowCardPreviewModal(true);
  };

  const handleCardPrint = (card) => {
    // Create print content for individual card
    const printContent = generateCardPrintContent([card]);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card - ${card.type === 'student' ? card.studentData?.name : card.staffData?.name}</title>
          <style>
            ${getCardPrintStyles()}
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('ID card sent to printer!');
  };

  const handlePrintAllCards = () => {
    if (generatedIdCards.length === 0) {
      toast.error('No ID cards to print');
      return;
    }
    
    const printContent = generateCardPrintContent(generatedIdCards);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>All ID Cards - ${generatedIdCards.length} cards</title>
          <style>
            ${getCardPrintStyles()}
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success(`${generatedIdCards.length} ID cards sent to printer!`);
  };

  const generateCardPrintContent = (cards) => {
    return cards.map(card => {
      const isStudent = card.type === 'student';
      const data = isStudent ? card.studentData : card.staffData;
      
      const photoHtml = data?.photo 
        ? `<img src="${data.photo}" alt="Photo" class="photo-img" />`
        : `<div class="photo-placeholder"><span>PHOTO</span></div>`;
      
      return `
        <div class="id-card">
          <div class="card-header">
            <h3>School ERP System</h3>
            <p>${isStudent ? 'Student ID Card' : 'Staff ID Card'}</p>
          </div>
          <div class="card-body">
            <div class="photo-section">
              ${photoHtml}
            </div>
            <div class="info-section">
              <h4>${data?.name}</h4>
              <div class="details">
                ${isStudent ? `
                  <p><strong>Admission No:</strong> ${data?.admission_no}</p>
                  <p><strong>Class:</strong> ${data?.class_name}</p>
                  <p><strong>Roll No:</strong> ${data?.roll_number}</p>
                  <p><strong>Blood Group:</strong> ${data?.blood_group}</p>
                ` : `
                  <p><strong>Employee ID:</strong> ${data?.employee_id}</p>
                  <p><strong>Department:</strong> ${data?.department}</p>
                  <p><strong>Designation:</strong> ${data?.designation}</p>
                  <p><strong>Phone:</strong> ${data?.phone}</p>
                `}
              </div>
              <div class="card-footer">
                <p class="card-number">${card.cardNumber}</p>
                <p class="issued-date">Issued: ${new Date(card.generatedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  const getCardPrintStyles = () => {
    return `
      @media print {
        body { margin: 0; font-family: Arial, sans-serif; }
        .id-card { 
          width: 85mm; height: 54mm; border: 2px solid #059669; 
          margin: 10mm; page-break-inside: avoid; display: flex; flex-direction: column;
          background: white; border-radius: 8px; overflow: hidden;
        }
        .card-header { 
          background: linear-gradient(135deg, #059669, #10b981); color: white; 
          padding: 8px; text-align: center; flex-shrink: 0;
        }
        .card-header h3 { margin: 0; font-size: 14px; font-weight: bold; }
        .card-header p { margin: 2px 0 0 0; font-size: 10px; }
        .card-body { 
          display: flex; padding: 8px; flex: 1; gap: 8px; 
        }
        .photo-section { flex-shrink: 0; }
        .photo-img {
          width: 40px; height: 50px; object-fit: cover;
          border: 1px solid #ccc; border-radius: 4px;
        }
        .photo-placeholder { 
          width: 40px; height: 50px; border: 1px solid #ccc; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 8px; color: #666; background: #f9f9f9;
        }
        .info-section { flex: 1; }
        .info-section h4 { margin: 0 0 8px 0; font-size: 12px; color: #059669; }
        .details p { margin: 2px 0; font-size: 9px; line-height: 1.2; }
        .card-footer { margin-top: auto; border-top: 1px solid #eee; padding-top: 4px; }
        .card-footer p { margin: 1px 0; font-size: 7px; color: #666; }
      }
      @media screen {
        .id-card { 
          width: 320px; height: 200px; border: 2px solid #059669; 
          margin: 20px; display: flex; flex-direction: column;
          background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .card-header { 
          background: linear-gradient(135deg, #059669, #10b981); color: white; 
          padding: 12px; text-align: center; flex-shrink: 0;
        }
        .card-header h3 { margin: 0; font-size: 16px; font-weight: bold; }
        .card-header p { margin: 4px 0 0 0; font-size: 12px; }
        .card-body { 
          display: flex; padding: 12px; flex: 1; gap: 12px; 
        }
        .photo-section { flex-shrink: 0; }
        .photo-img {
          width: 60px; height: 75px; object-fit: cover;
          border: 1px solid #ccc; border-radius: 4px;
        }
        .photo-placeholder { 
          width: 60px; height: 75px; border: 1px solid #ccc; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 10px; color: #666; background: #f9f9f9;
        }
        .info-section { flex: 1; }
        .info-section h4 { margin: 0 0 8px 0; font-size: 14px; color: #059669; }
        .details p { margin: 3px 0; font-size: 11px; line-height: 1.3; }
        .card-footer { margin-top: auto; border-top: 1px solid #eee; padding-top: 6px; }
        .card-footer p { margin: 2px 0; font-size: 9px; color: #666; }
      }
    `;
  };

  // ID Cards Click Handlers
  const handleStudentIDsClick = () => {
    setShowStudentIdModal(true);
    toast.success('Student ID generation modal opened!');
  };

  const handleStaffIDsClick = () => {
    setShowStaffIdModal(true);
    toast.success('Staff ID generation modal opened!');
  };

  const handlePrintCardsClick = () => {
    if (selectedStudentsForId.length === 0 && selectedStaffForId.length === 0) {
      toast.error('Please select students or staff members for ID cards first');
      return;
    }
    setShowPrintCardsModal(true);
    toast.success('Print cards modal opened!');
  };

  // Filter Adhar Extracts
  const filteredAERecords = aeRecords.filter(ae => {
    const matchesSearch = ae.student_name?.toLowerCase().includes(aeSearchTerm.toLowerCase()) ||
                         ae.admission_no?.toLowerCase().includes(aeSearchTerm.toLowerCase()) ||
                         ae.adhar_number?.toLowerCase().includes(aeSearchTerm.toLowerCase()) ||
                         ae.purpose?.toLowerCase().includes(aeSearchTerm.toLowerCase());
    const matchesStatus = aeStatusFilter === 'all' || ae.status === aeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectStudent = (student) => {
    setTcFormData({
      ...tcFormData,
      student_id: student.id,
      student_name: student.name,
      admission_no: student.admission_no,
      // Auto-populate additional fields if available
      date_of_admission: student.created_at ? new Date(student.created_at).toISOString().split('T')[0] : '',
      last_class: student.class_name || student.class_id || '',
      last_section: student.section_name || student.section || student.section_id || ''
    });
    setSelectedStudent(student);
    setShowStudentModal(false);
    setSearchTerm(''); // Clear search term
    toast.success(`Student ${student.name} selected successfully!`);
  };

  const resetTCForm = () => {
    setTcFormData({
      student_id: '',
      student_name: '',
      admission_no: '',
      date_of_admission: '',
      last_class: '',
      last_section: '',
      date_of_leaving: '',
      reason_for_transfer: '',
      conduct_remarks: '',
      status: 'draft'
    });
    setSelectedStudent(null);
  };

  // TC Action Handlers
  const handleViewTC = async (tcId) => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/transfer-certificates/${tcId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const tcData = await response.json();
        setSelectedTc(tcData);
        setShowTcViewModal(true);
      } else {
        toast.error('Failed to load Transfer Certificate details');
      }
    } catch (error) {
      console.error('Failed to fetch TC details:', error);
      toast.error('Failed to load Transfer Certificate details');
    }
  };

  const handlePDFTC = async (tc) => {
    try {
      // Create a formatted certificate content
      const printContent = generateTCPrintContent(tc);
      
      // Create a new window with the print content
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Transfer Certificate - ${tc.admission_no}</title>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
              
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              body { 
                font-family: 'Poppins', 'Roboto', sans-serif; 
                margin: 20px; 
                background: #f5f5f5;
                color: #111827;
              }
              
              .certificate { 
                max-width: 850px; 
                margin: 0 auto; 
                padding: 40px; 
                background: white;
                border: 3px solid #1E3A8A;
                position: relative;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              }
              
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 80px;
                font-weight: bold;
                color: rgba(30, 58, 138, 0.05);
                z-index: 0;
                pointer-events: none;
              }
              
              .header {
                background: #1E3A8A;
                color: white;
                padding: 25px;
                border-radius: 8px 8px 0 0;
                margin: -40px -40px 30px -40px;
                position: relative;
                z-index: 1;
              }
              
              .header-content {
                display: flex;
                align-items: center;
                gap: 20px;
              }
              
              .school-logo {
                font-size: 60px;
                line-height: 1;
              }
              
              .school-info {
                flex: 1;
                text-align: center;
              }
              
              .school-name {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: 1px;
              }
              
              .school-tagline {
                font-size: 14px;
                font-style: italic;
                opacity: 0.95;
                margin-bottom: 8px;
              }
              
              .school-contact {
                font-size: 12px;
                opacity: 0.9;
              }
              
              .cert-title {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin: 30px 0 15px 0;
                position: relative;
                z-index: 1;
              }
              
              .title-icon {
                font-size: 28px;
              }
              
              .title-text {
                font-size: 28px;
                font-weight: 700;
                color: #1E3A8A;
                letter-spacing: 2px;
              }
              
              .gold-divider {
                height: 3px;
                background: linear-gradient(to right, transparent, #D97706, transparent);
                margin: 0 auto 30px auto;
                width: 60%;
                position: relative;
                z-index: 1;
              }
              
              .info-table {
                background: #F8FAFC;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                position: relative;
                z-index: 1;
              }
              
              .info-row {
                display: flex;
                padding: 12px;
                border-bottom: 1px solid #E5E7EB;
              }
              
              .info-row:last-child {
                border-bottom: none;
              }
              
              .info-row:nth-child(even) {
                background: white;
              }
              
              .info-label {
                flex: 0 0 280px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              
              .info-label .icon {
                font-size: 18px;
              }
              
              .info-value {
                flex: 1;
                color: #111827;
                font-weight: 500;
              }
              
              .signature-section {
                display: flex;
                justify-content: space-between;
                margin: 50px 40px 30px 40px;
                position: relative;
                z-index: 1;
              }
              
              .signature-box {
                text-align: center;
                width: 200px;
              }
              
              .signature-line {
                height: 60px;
                border-bottom: 2px solid #111827;
                margin-bottom: 10px;
              }
              
              .signature-label {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
              }
              
              .footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #E5E7EB;
                position: relative;
                z-index: 1;
              }
              
              .footer-info {
                color: #6B7280;
                font-size: 12px;
                line-height: 1.6;
              }
              
              .qr-code {
                text-align: center;
              }
              
              .qr-label {
                font-size: 11px;
                color: #6B7280;
                margin-top: 5px;
              }
              
              @media print {
                body { margin: 0; background: white; }
                .certificate { box-shadow: none; }
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

  const handlePrintTC = (tc) => {
    try {
      const printContent = generateTCPrintContent(tc);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Transfer Certificate - ${tc.admission_no}</title>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
              
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              body { 
                font-family: 'Poppins', 'Roboto', sans-serif; 
                margin: 20px; 
                background: #f5f5f5;
                color: #111827;
              }
              
              .certificate { 
                max-width: 850px; 
                margin: 0 auto; 
                padding: 40px; 
                background: white;
                border: 3px solid #1E3A8A;
                position: relative;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              }
              
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 80px;
                font-weight: bold;
                color: rgba(30, 58, 138, 0.05);
                z-index: 0;
                pointer-events: none;
              }
              
              .header {
                background: #1E3A8A;
                color: white;
                padding: 25px;
                border-radius: 8px 8px 0 0;
                margin: -40px -40px 30px -40px;
                position: relative;
                z-index: 1;
              }
              
              .header-content {
                display: flex;
                align-items: center;
                gap: 20px;
              }
              
              .school-logo {
                font-size: 60px;
                line-height: 1;
              }
              
              .school-info {
                flex: 1;
                text-align: center;
              }
              
              .school-name {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: 1px;
              }
              
              .school-tagline {
                font-size: 14px;
                font-style: italic;
                opacity: 0.95;
                margin-bottom: 8px;
              }
              
              .school-contact {
                font-size: 12px;
                opacity: 0.9;
              }
              
              .cert-title {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin: 30px 0 15px 0;
                position: relative;
                z-index: 1;
              }
              
              .title-icon {
                font-size: 28px;
              }
              
              .title-text {
                font-size: 28px;
                font-weight: 700;
                color: #1E3A8A;
                letter-spacing: 2px;
              }
              
              .gold-divider {
                height: 3px;
                background: linear-gradient(to right, transparent, #D97706, transparent);
                margin: 0 auto 30px auto;
                width: 60%;
                position: relative;
                z-index: 1;
              }
              
              .info-table {
                background: #F8FAFC;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                position: relative;
                z-index: 1;
              }
              
              .info-row {
                display: flex;
                padding: 12px;
                border-bottom: 1px solid #E5E7EB;
              }
              
              .info-row:last-child {
                border-bottom: none;
              }
              
              .info-row:nth-child(even) {
                background: white;
              }
              
              .info-label {
                flex: 0 0 280px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              
              .info-label .icon {
                font-size: 18px;
              }
              
              .info-value {
                flex: 1;
                color: #111827;
                font-weight: 500;
              }
              
              .signature-section {
                display: flex;
                justify-content: space-between;
                margin: 50px 40px 30px 40px;
                position: relative;
                z-index: 1;
              }
              
              .signature-box {
                text-align: center;
                width: 200px;
              }
              
              .signature-line {
                height: 60px;
                border-bottom: 2px solid #111827;
                margin-bottom: 10px;
              }
              
              .signature-label {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
              }
              
              .footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #E5E7EB;
                position: relative;
                z-index: 1;
              }
              
              .footer-info {
                color: #6B7280;
                font-size: 12px;
                line-height: 1.6;
              }
              
              .qr-code {
                text-align: center;
              }
              
              .qr-label {
                font-size: 11px;
                color: #6B7280;
                margin-top: 5px;
              }
              
              @media print {
                body { margin: 0; background: white; }
                .certificate { box-shadow: none; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Auto-trigger print dialog
      printWindow.onload = () => {
        printWindow.print();
      };
      
      toast.success('Print dialog opened');
    } catch (error) {
      console.error('Failed to print TC:', error);
      toast.error('Failed to print Transfer Certificate');
    }
  };

  // TC Status Change Handlers
  const handleIssueTC = async (tcId) => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/transfer-certificates/${tcId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'issued' })
      });

      if (response.ok) {
        toast.success('Transfer Certificate issued successfully!');
        await fetchTCRecords();
        await fetchCertificatesData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to issue certificate');
      }
    } catch (error) {
      console.error('Failed to issue TC:', error);
      toast.error('Failed to issue certificate');
    }
  };

  const handleCancelTC = async (tcId) => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/transfer-certificates/${tcId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        toast.success('Transfer Certificate cancelled');
        await fetchTCRecords();
        await fetchCertificatesData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to cancel certificate');
      }
    } catch (error) {
      console.error('Failed to cancel TC:', error);
      toast.error('Failed to cancel certificate');
    }
  };

  const generateTCPrintContent = (tc) => {
    const currentDate = new Date().toLocaleDateString();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=TC-${tc.id}-VERIFIED`;
    
    return `
      <div class="certificate">
        <!-- Watermark -->
        <div class="watermark">DEMO SCHOOL</div>
        
        <!-- Professional Header Section -->
        <div class="header">
          <div class="header-content">
            <div class="school-logo">🏫</div>
            <div class="school-info">
              <div class="school-name">DEMO SCHOOL</div>
              <div class="school-tagline">"Excellence in Learning and Character"</div>
              <div class="school-contact">
                123 Learning City | info@demoschool.edu | (555) 123-4567
              </div>
            </div>
          </div>
        </div>
        
        <!-- Certificate Title with Decorative Elements -->
        <div class="cert-title">
          <div class="title-icon">🏆</div>
          <div class="title-text">TRANSFER CERTIFICATE</div>
          <div class="title-icon">🏆</div>
        </div>
        <div class="gold-divider"></div>
        
        <!-- Student Information Table -->
        <div class="info-table">
          <div class="info-row">
            <div class="info-label">
              <span class="icon">🧑‍🎓</span>
              <span>Student Name</span>
            </div>
            <div class="info-value">${tc.student_name || 'N/A'}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">
              <span class="icon">🏷️</span>
              <span>Admission Number</span>
            </div>
            <div class="info-value">${tc.admission_no || 'N/A'}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">
              <span class="icon">📅</span>
              <span>Date of Admission</span>
            </div>
            <div class="info-value">${tc.date_of_admission ? new Date(tc.date_of_admission).toLocaleDateString() : 'N/A'}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">
              <span class="icon">📚</span>
              <span>Last Class</span>
            </div>
            <div class="info-value">${tc.last_class || 'N/A'}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">
              <span class="icon">📖</span>
              <span>Last Section</span>
            </div>
            <div class="info-value">${tc.last_section || 'N/A'}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">
              <span class="icon">📅</span>
              <span>Date of Leaving</span>
            </div>
            <div class="info-value">${tc.date_of_leaving ? new Date(tc.date_of_leaving).toLocaleDateString() : 'N/A'}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">
              <span class="icon">📝</span>
              <span>Reason for Transfer</span>
            </div>
            <div class="info-value">${tc.reason_for_transfer || 'N/A'}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">
              <span class="icon">⭐</span>
              <span>Conduct & Behavior</span>
            </div>
            <div class="info-value">${tc.conduct_remarks || 'Satisfactory'}</div>
          </div>
          
          ${tc.issue_date ? `
          <div class="info-row">
            <div class="info-label">
              <span class="icon">📅</span>
              <span>Issue Date</span>
            </div>
            <div class="info-value">${new Date(tc.issue_date).toLocaleDateString()}</div>
          </div>
          ` : ''}
          
          <div class="info-row">
            <div class="info-label">
              <span class="icon">🎫</span>
              <span>Certificate ID</span>
            </div>
            <div class="info-value">${tc.id || 'N/A'}</div>
          </div>
        </div>
        
        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Class Teacher</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Principal</div>
          </div>
        </div>
        
        <!-- Footer Section with QR Code -->
        <div class="footer">
          <div class="footer-info">
            <div>Generated on: ${currentDate}</div>
            <div>Certificate ID: ${tc.id || 'N/A'}</div>
            <div>Verified by DEMO SCHOOL</div>
          </div>
          <div class="qr-code">
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 80px; height: 80px;" />
            <div class="qr-label">Scan to Verify</div>
          </div>
        </div>
      </div>
    `;
  };

  const handleTCSubmit = async (status = 'draft') => {
    try {
      // Validate required fields
      if (!tcFormData.student_id || !tcFormData.date_of_leaving || !tcFormData.reason_for_transfer) {
        toast.error('Please fill in all required fields');
        return;
      }

      const tcData = {
        ...tcFormData,
        status,
        issue_date: status === 'issued' ? new Date().toISOString().split('T')[0] : null
      };

      console.log('TC Data to submit:', tcData);
      
      const API = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API}/transfer-certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(tcData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Transfer Certificate ${status === 'issued' ? 'issued' : 'saved as draft'} successfully!`);
        
        // Refresh TC records
        await fetchTCRecords();
        resetTCForm();
        setTcView('list');
      } else {
        const errorData = await response.json();
        console.error('Transfer Certificate creation failed - Full Response:', errorData);
        console.error('TC Form data being sent:', tcData);
        
        let errorMessage = 'Failed to submit Transfer Certificate';
        if (typeof errorData?.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData?.detail)) {
          errorMessage = errorData.detail
            .map(err => {
              if (typeof err === 'string') return err;
              const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown field';
              const msg = err.msg || err.message || 'Validation error';
              return `${field}: ${msg}`;
            })
            .join(', ');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error('Failed to submit TC:', error);
      toast.error('Failed to submit Transfer Certificate. Please try again.');
    }
  };

  const filteredTCRecords = tcRecords.filter(tc => {
    const matchesSearch = 
      tc.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.admission_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });


  const filteredStudents = availableStudents.filter(student => {
    // Ensure student is a valid object with required properties
    if (!student || typeof student !== 'object' || !student.name || !student.admission_no) {
      return false;
    }
    
    const name = String(student.name).toLowerCase();
    const admissionNo = String(student.admission_no).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return name.includes(searchLower) || admissionNo.includes(searchLower);
  });

  return (
    <div className="space-y-4 sm:space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Certificates</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Generate and manage various academic certificates</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Templates
          </Button>
          <Button 
            onClick={handleGenerateCertificate}
            className="bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm h-8 sm:h-9"
          >
            <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Generate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="card-hover">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Issued</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{totalIssued}</p>
              </div>
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-orange-600">{pending}</p>
              </div>
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600">45</p>
              </div>
              <Award className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Templates</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-600">8</p>
              </div>
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Types Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full lg:grid lg:w-full lg:grid-cols-6 h-auto">
            <TabsTrigger value="course" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Course</TabsTrigger>
            <TabsTrigger value="transfer" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Transfer</TabsTrigger>
            <TabsTrigger value="progress" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Progress</TabsTrigger>
            <TabsTrigger value="adhar" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Adhar</TabsTrigger>
            <TabsTrigger value="bonafide" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Bonafide</TabsTrigger>
            <TabsTrigger value="id-cards" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">ID Cards</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="course" className="space-y-4">
          {ccView === 'list' ? (
            // Course Certificate Records List View
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Course Completion Certificates</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Manage and issue course completion certificates</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setCcView('form');
                        resetCourseForm();
                        toast.success('Course Certificate form is ready! Select a student to begin.');
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Course Certificate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search by student name, admission number, or course..."
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={ccSearchTerm}
                        onChange={(e) => setCcSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={ccStatusFilter}
                      onChange={(e) => setCcStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="issued">Issued</option>
                    </select>
                  </div>

                  {/* Course Certificate Records Table */}
                  {filteredCCRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Certificates Found</h3>
                      <p className="text-gray-600 mb-4">Start by creating your first course completion certificate</p>
                      <Button 
                        onClick={() => {
                          setCcView('form');
                          resetCourseForm();
                        }}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredCCRecords.map((cc) => (
                            <tr key={cc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{cc.student_name}</div>
                                  <div className="text-sm text-gray-500">Adm: {cc.admission_no}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{cc.course_name}</div>
                                <div className="text-sm text-gray-500">{cc.course_duration || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(cc.completion_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={
                                  cc.grade_obtained === 'A+' || cc.grade_obtained === 'A' ? 'bg-green-100 text-green-800' :
                                  cc.grade_obtained === 'B+' || cc.grade_obtained === 'B' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {cc.grade_obtained || 'N/A'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={
                                  cc.status === 'issued' ? 'bg-green-100 text-green-800' :
                                  cc.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {cc.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleViewCC(cc.id)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDownloadCC(cc)}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePrintCC(cc)}>
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
            </>
          ) : (
            // Course Certificate Form View
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Generate Course Completion Certificate</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Fill in the details to generate a course completion certificate</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setCcView('list')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Student Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Selection *
                    </label>
                    {selectedCourseStudent ? (
                      <div className="flex items-center justify-between p-4 border rounded-md bg-emerald-50">
                        <div>
                          <p className="font-medium text-emerald-900">{selectedCourseStudent.name}</p>
                          <p className="text-sm text-emerald-700">Admission No: {selectedCourseStudent.admission_no}</p>
                          <p className="text-sm text-emerald-700">Class: {selectedCourseStudent.class_id || 'N/A'} - {selectedCourseStudent.section_id || 'N/A'}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowCourseStudentModal(true)}
                          type="button"
                        >
                          Change Student
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCourseStudentModal(true)}
                        className="w-full p-8 border-dashed"
                        type="button"
                      >
                        <UserPlus className="h-6 w-6 mr-2" />
                        Select Student
                      </Button>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter course name"
                        value={ccFormData.course_name}
                        onChange={(e) => setCcFormData({...ccFormData, course_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Completion Date *
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        value={ccFormData.completion_date}
                        onChange={(e) => setCcFormData({...ccFormData, completion_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade Obtained
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        value={ccFormData.grade_obtained}
                        onChange={(e) => setCcFormData({...ccFormData, grade_obtained: e.target.value})}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="Pass">Pass</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credits Earned
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter credits"
                        value={ccFormData.credits_earned}
                        onChange={(e) => setCcFormData({...ccFormData, credits_earned: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructor Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter instructor name"
                        value={ccFormData.instructor_name}
                        onChange={(e) => setCcFormData({...ccFormData, instructor_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Duration
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., 6 months, 1 year"
                        value={ccFormData.course_duration}
                        onChange={(e) => setCcFormData({...ccFormData, course_duration: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button 
                      variant="outline"
                      onClick={() => setCcView('list')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateCourseCertificate}
                      disabled={ccLoading}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {ccLoading ? 'Creating...' : 'Generate Certificate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          {tcView === 'list' ? (
            // TC Records List View
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Transfer Certificates</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Manage and issue transfer certificates</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setTcView('form');
                        toast.success('Transfer Certificate form is ready! Select a student to begin.');
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Generate TC
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search by student name or admission number..."
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="issued">Issued</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* TC Records Table */}
                  {filteredTCRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Transfer Certificates Found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm ? 'No records match your search criteria.' : 'No transfer certificates have been generated yet.'}
                      </p>
                      <Button 
                        onClick={() => setTcView('form')}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        Generate First TC
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Section</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Leaving</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredTCRecords.map((tc) => (
                            <tr key={tc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{tc.student_name}</div>
                                  <div className="text-sm text-gray-500">Adm: {tc.admission_no}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{tc.last_class} - {tc.last_section}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{tc.date_of_leaving}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={
                                  tc.status === 'issued' ? 'bg-green-100 text-green-800' :
                                  tc.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                  tc.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {tc.status === 'pending_approval' ? 'Pending Approval' : 
                                   tc.status.charAt(0).toUpperCase() + tc.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-wrap gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewTC(tc.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePDFTC(tc)}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    PDF
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePrintTC(tc)}
                                  >
                                    <Printer className="h-4 w-4 mr-1" />
                                    Print
                                  </Button>
                                  {/* Status Change Buttons */}
                                  {(tc.status === 'draft' || tc.status === 'pending_approval') && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleIssueTC(tc.id)}
                                      className="bg-green-50 text-green-700 hover:bg-green-100 border-green-300"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Issue
                                    </Button>
                                  )}
                                  {tc.status === 'issued' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleCancelTC(tc.id)}
                                      className="bg-red-50 text-red-700 hover:bg-red-100 border-red-300"
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  )}
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
            </>
          ) : (
            // TC Form View
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Generate Transfer Certificate</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Fill in the details to generate a transfer certificate</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setTcView('list');
                        resetTCForm();
                        toast.info('Returned to Transfer Certificate list.');
                      }}
                    >
                      Back to List
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Student Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Student Selection</h3>
                    {selectedStudent ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-emerald-900">Selected Student</p>
                            <p className="text-emerald-700">{selectedStudent.name}</p>
                            <p className="text-sm text-emerald-600">Admission No: {selectedStudent.admission_no}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(null);
                              setTcFormData({...tcFormData, student_id: '', student_name: '', admission_no: ''});
                            }}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowStudentModal(true)}
                          className="flex-1"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Select Student
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* TC Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Admission</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={tcFormData.date_of_admission}
                        onChange={(e) => setTcFormData({...tcFormData, date_of_admission: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Attended Class</label>
                      <select
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={tcFormData.last_class}
                        onChange={(e) => setTcFormData({...tcFormData, last_class: e.target.value})}
                      >
                        <option value="">Select Class</option>
                        <option value="1">Class I</option>
                        <option value="2">Class II</option>
                        <option value="3">Class III</option>
                        <option value="4">Class IV</option>
                        <option value="5">Class V</option>
                        <option value="6">Class VI</option>
                        <option value="7">Class VII</option>
                        <option value="8">Class VIII</option>
                        <option value="9">Class IX</option>
                        <option value="10">Class X</option>
                        <option value="11">Class XI</option>
                        <option value="12">Class XII</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Section</label>
                      <select
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={tcFormData.last_section}
                        onChange={(e) => setTcFormData({...tcFormData, last_section: e.target.value})}
                      >
                        <option value="">Select Section</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Leaving *</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={tcFormData.date_of_leaving}
                        onChange={(e) => setTcFormData({...tcFormData, date_of_leaving: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reason for Transfer *</label>
                    <textarea
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="3"
                      placeholder="Enter reason for transfer..."
                      value={tcFormData.reason_for_transfer}
                      onChange={(e) => setTcFormData({...tcFormData, reason_for_transfer: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Conduct/Behavior Remarks</label>
                    <textarea
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="3"
                      placeholder="Enter conduct and behavior remarks..."
                      value={tcFormData.conduct_remarks}
                      onChange={(e) => setTcFormData({...tcFormData, conduct_remarks: e.target.value})}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={resetTCForm}
                    >
                      Reset
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleTCSubmit('draft')}
                      disabled={!tcFormData.student_id}
                    >
                      Save as Draft
                    </Button>
                    <Button 
                      onClick={() => handleTCSubmit('pending_approval')}
                      className="bg-blue-500 hover:bg-blue-600"
                      disabled={!tcFormData.student_id}
                    >
                      Submit for Approval
                    </Button>
                    <Button 
                      onClick={() => handleTCSubmit('issued')}
                      className="bg-emerald-500 hover:bg-emerald-600"
                      disabled={!tcFormData.student_id}
                    >
                      Issue TC
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Student Selection Modal */}
          {showStudentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Select Student</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowStudentModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading students...</p>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-4">
                      {availableStudents.length === 0 ? (
                        <div>
                          <p className="text-gray-500 font-medium">No students available</p>
                          <p className="text-sm text-gray-400 mt-1">Please add students first or check if they are active.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500 font-medium">No students match your search</p>
                          <p className="text-sm text-gray-400 mt-1">Try searching by name or admission number.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div
                        key={student.id || student.admission_no}
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => selectStudent(student)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{String(student.name || 'Unknown')}</p>
                            <p className="text-sm text-gray-600">Admission: {String(student.admission_no || 'N/A')}</p>
                            <p className="text-xs text-gray-400">Father: {String(student.father_name || 'N/A')}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            Class {String(student.class_id || student.class_name || 'N/A')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {prView === 'list' ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Progress Reports</CardTitle>
                  <Button 
                    onClick={() => {
                      setPrView('form');
                      resetProgressForm();
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Progress Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search progress reports..."
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={prSearchTerm}
                        onChange={(e) => setPrSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-48">
                    <select
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={prStatusFilter}
                      onChange={(e) => setPrStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="issued">Issued</option>
                    </select>
                  </div>
                </div>

                {/* Progress Report Records Table */}
                {filteredPRRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Reports Found</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first student progress report</p>
                    <Button 
                      onClick={() => {
                        setPrView('form');
                        resetProgressForm();
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Progress Report
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPRRecords.map((report) => (
                          <tr key={report._id || report.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{report.student_name}</div>
                                <div className="text-sm text-gray-500">Admission: {report.admission_no}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {report.academic_year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {report.semester}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {report.overall_grade || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                report.status === 'issued' ? 'bg-green-100 text-green-800' :
                                report.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {report.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => handleViewPR(report.id || report._id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-900"
                                onClick={() => handlePDFPR(report)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-600 hover:text-gray-900"
                                onClick={() => handlePrintPR(report)}
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
          ) : (
            // Progress Report Form View
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create Progress Report</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setPrView('list')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Student Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Selection *
                    </label>
                    {selectedProgressStudent ? (
                      <div className="flex items-center justify-between p-4 border rounded-md bg-emerald-50">
                        <div>
                          <p className="font-medium text-emerald-900">{selectedProgressStudent.name}</p>
                          <p className="text-sm text-emerald-700">Admission No: {selectedProgressStudent.admission_no}</p>
                          <p className="text-sm text-emerald-700">Class: {selectedProgressStudent.class_name} - {selectedProgressStudent.section_name}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowProgressStudentModal(true)}
                        >
                          Change Student
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowProgressStudentModal(true)}
                        className="w-full p-8 border-dashed"
                      >
                        <UserPlus className="h-6 w-6 mr-2" />
                        Select Student
                      </Button>
                    )}
                  </div>

                  {/* Academic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., 2023-2024"
                        value={prFormData.academic_year}
                        onChange={(e) => setPrFormData({...prFormData, academic_year: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Term *
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        value={prFormData.term}
                        onChange={(e) => setPrFormData({...prFormData, term: e.target.value})}
                      >
                        <option value="">Select Term</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Half-yearly">Half-yearly</option>
                        <option value="Annual">Annual</option>
                        <option value="1st Term">1st Term</option>
                        <option value="2nd Term">2nd Term</option>
                        <option value="3rd Term">3rd Term</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overall Grade
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., A+, 95%, First Class"
                        value={prFormData.overall_grade}
                        onChange={(e) => setPrFormData({...prFormData, overall_grade: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attendance Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., 95"
                        value={prFormData.attendance_percentage}
                        onChange={(e) => setPrFormData({...prFormData, attendance_percentage: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teacher Remarks
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter teacher's remarks about student performance..."
                        value={prFormData.teacher_remarks}
                        onChange={(e) => setPrFormData({...prFormData, teacher_remarks: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Principal Remarks
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter principal's remarks..."
                        value={prFormData.principal_remarks}
                        onChange={(e) => setPrFormData({...prFormData, principal_remarks: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Issue Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        value={prFormData.issue_date}
                        onChange={(e) => setPrFormData({...prFormData, issue_date: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setPrView('list')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateProgressReport}
                      disabled={prLoading}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {prLoading ? 'Creating...' : 'Create Progress Report'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Progress Report Student Selection Modal */}
          {showProgressStudentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Select Student for Progress Report</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowProgressStudentModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={prSearchTerm}
                      onChange={(e) => setPrSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading students...</p>
                    </div>
                  ) : availableStudents.filter(student =>
                      student.name.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
                      student.admission_no.toLowerCase().includes(prSearchTerm.toLowerCase())
                    ).length === 0 ? (
                    <div className="text-center py-4">
                      {availableStudents.length === 0 ? (
                        <div>
                          <p className="text-gray-500 font-medium">No students available</p>
                          <p className="text-sm text-gray-400 mt-1">Please add students first or check if they are active.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500 font-medium">No students match your search</p>
                          <p className="text-sm text-gray-400 mt-1">Try searching by name or admission number.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    availableStudents.filter(student =>
                      student.name.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
                      student.admission_no.toLowerCase().includes(prSearchTerm.toLowerCase())
                    ).map((student) => (
                      <div
                        key={student.id}
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => selectProgressStudent(student)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-600">Admission: {student.admission_no}</p>
                            <p className="text-xs text-gray-400">Father: {student.father_name}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            Class {student.class_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="adhar" className="space-y-4">
          {aeView === 'list' ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Adhar Extracts</CardTitle>
                  <Button 
                    onClick={() => {
                      setAeView('form');
                      resetAdharForm();
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Adhar Extract
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search adhar extracts..."
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={aeSearchTerm}
                        onChange={(e) => setAeSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-48">
                    <select
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={aeStatusFilter}
                      onChange={(e) => setAeStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="issued">Issued</option>
                    </select>
                  </div>
                </div>

                {/* Adhar Extract Records Table */}
                {filteredAERecords.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Adhar Extracts Found</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first adhar information extract</p>
                    <Button 
                      onClick={() => {
                        setAeView('form');
                        resetAdharForm();
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Adhar Extract
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adhar Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAERecords.map((extract) => (
                          <tr key={extract._id || extract.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{extract.student_name}</div>
                                <div className="text-sm text-gray-500">Admission: {extract.admission_no}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {extract.adhar_number ? `****-****-${extract.adhar_number.slice(-4)}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {extract.purpose}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {extract.guardian_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                extract.status === 'issued' ? 'bg-green-100 text-green-800' :
                                extract.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {extract.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-900"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-600 hover:text-gray-900"
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
          ) : (
            // Adhar Extract Form View
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create Adhar Extract</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setAeView('list')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Student Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Selection *
                    </label>
                    {selectedAdharStudent ? (
                      <div className="flex items-center justify-between p-4 border rounded-md bg-emerald-50">
                        <div>
                          <p className="font-medium text-emerald-900">{selectedAdharStudent.name}</p>
                          <p className="text-sm text-emerald-700">Admission No: {selectedAdharStudent.admission_no}</p>
                          <p className="text-sm text-emerald-700">Class: {selectedAdharStudent.class_name} - {selectedAdharStudent.section_name}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAdharStudentModal(true)}
                        >
                          Change Student
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAdharStudentModal(true)}
                        className="w-full p-8 border-dashed"
                      >
                        <UserPlus className="h-6 w-6 mr-2" />
                        Select Student
                      </Button>
                    )}
                  </div>

                  {/* Extract Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adhar Number *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="xxxx-xxxx-xxxx"
                        maxLength="12"
                        value={aeFormData.adhar_number}
                        onChange={(e) => setAeFormData({...aeFormData, adhar_number: e.target.value.replace(/\D/g, '')})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., Bank Account Opening, Government Scheme"
                        value={aeFormData.purpose}
                        onChange={(e) => setAeFormData({...aeFormData, purpose: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., 2023-2024"
                        value={aeFormData.academic_year}
                        onChange={(e) => setAeFormData({...aeFormData, academic_year: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Guardian's full name"
                        value={aeFormData.guardian_name}
                        onChange={(e) => setAeFormData({...aeFormData, guardian_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Relationship
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        value={aeFormData.guardian_relationship}
                        onChange={(e) => setAeFormData({...aeFormData, guardian_relationship: e.target.value})}
                      >
                        <option value="">Select Relationship</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Grandfather">Grandfather</option>
                        <option value="Grandmother">Grandmother</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        value={aeFormData.contact_number}
                        onChange={(e) => setAeFormData({...aeFormData, contact_number: e.target.value.replace(/\D/g, '')})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Father's full name"
                        value={aeFormData.father_name}
                        onChange={(e) => setAeFormData({...aeFormData, father_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Mother's full name"
                        value={aeFormData.mother_name}
                        onChange={(e) => setAeFormData({...aeFormData, mother_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        value={aeFormData.date_of_birth}
                        onChange={(e) => setAeFormData({...aeFormData, date_of_birth: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verified by *
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        value={aeFormData.verified_by}
                        onChange={(e) => setAeFormData({...aeFormData, verified_by: e.target.value})}
                      >
                        <option value="">Select Verifier</option>
                        <option value="Principal">Principal</option>
                        <option value="Vice Principal">Vice Principal</option>
                        <option value="Class Teacher">Class Teacher</option>
                        <option value="Head Teacher">Head Teacher</option>
                        <option value="Administrative Officer">Administrative Officer</option>
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Complete address as per Adhar card"
                      value={aeFormData.address}
                      onChange={(e) => setAeFormData({...aeFormData, address: e.target.value})}
                    />
                  </div>

                  {/* Issue Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        value={aeFormData.issue_date}
                        onChange={(e) => setAeFormData({...aeFormData, issue_date: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setAeView('list')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateAdharExtract}
                      disabled={aeLoading}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {aeLoading ? 'Creating...' : 'Create Adhar Extract'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Adhar Extract Student Selection Modal */}
          {showAdharStudentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Select Student for Adhar Extract</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAdharStudentModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={aeSearchTerm}
                      onChange={(e) => setAeSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading students...</p>
                    </div>
                  ) : availableStudents.filter(student =>
                      student.name.toLowerCase().includes(aeSearchTerm.toLowerCase()) ||
                      student.admission_no.toLowerCase().includes(aeSearchTerm.toLowerCase())
                    ).length === 0 ? (
                    <div className="text-center py-4">
                      {availableStudents.length === 0 ? (
                        <div>
                          <p className="text-gray-500 font-medium">No students available</p>
                          <p className="text-sm text-gray-400 mt-1">Please add students first or check if they are active.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500 font-medium">No students match your search</p>
                          <p className="text-sm text-gray-400 mt-1">Try searching by name or admission number.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    availableStudents.filter(student =>
                      student.name.toLowerCase().includes(aeSearchTerm.toLowerCase()) ||
                      student.admission_no.toLowerCase().includes(aeSearchTerm.toLowerCase())
                    ).map((student) => (
                      <div
                        key={student.id}
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => selectAdharStudent(student)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-600">Admission: {student.admission_no}</p>
                            <p className="text-xs text-gray-400">Father: {student.father_name}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            Class {student.class_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bonafide" className="space-y-4">
          {bfView === 'list' ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Bonafide Certificates</CardTitle>
                  <Button 
                    onClick={() => {
                      setBfView('form');
                      resetBonafideForm();
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bonafide Certificate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search bonafide certificates..."
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={bfSearchTerm}
                        onChange={(e) => setBfSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-48">
                    <select
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={bfStatusFilter}
                      onChange={(e) => setBfStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="issued">Issued</option>
                    </select>
                  </div>
                </div>

                {/* Bonafide Certificate Records Table */}
                {filteredBFRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Bonafide Certificates Found</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first bonafide certificate</p>
                    <Button 
                      onClick={() => {
                        setBfView('form');
                        resetBonafideForm();
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Bonafide Certificate
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBFRecords.map((certificate) => (
                          <tr key={certificate._id || certificate.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{certificate.student_name}</div>
                                <div className="text-sm text-gray-500">Admission: {certificate.admission_no}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {certificate.purpose}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {certificate.academic_year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {certificate.class_studying || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                certificate.status === 'issued' ? 'bg-green-100 text-green-800' :
                                certificate.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {certificate.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-900"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-600 hover:text-gray-900"
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
          ) : (
            // Bonafide Certificate Form View
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create Bonafide Certificate</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setBfView('list')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Student Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Selection *
                    </label>
                    {selectedBonafideStudent ? (
                      <div className="flex items-center justify-between p-4 border rounded-md bg-emerald-50">
                        <div>
                          <p className="font-medium text-emerald-900">{selectedBonafideStudent.name}</p>
                          <p className="text-sm text-emerald-700">Admission No: {selectedBonafideStudent.admission_no}</p>
                          <p className="text-sm text-emerald-700">Class: {selectedBonafideStudent.class_name} - {selectedBonafideStudent.section_name}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowBonafideStudentModal(true)}
                        >
                          Change Student
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowBonafideStudentModal(true)}
                        className="w-full p-8 border-dashed"
                      >
                        <UserPlus className="h-6 w-6 mr-2" />
                        Select Student
                      </Button>
                    )}
                  </div>

                  {/* Certificate Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., College Admission, Scholarship Application"
                        value={bfFormData.purpose}
                        onChange={(e) => setBfFormData({...bfFormData, purpose: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., 2023-2024"
                        value={bfFormData.academic_year}
                        onChange={(e) => setBfFormData({...bfFormData, academic_year: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., 10, 12, HSS-I"
                        value={bfFormData.class_name}
                        onChange={(e) => setBfFormData({...bfFormData, class_name: e.target.value})}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., A, B, Science"
                        value={bfFormData.section}
                        onChange={(e) => setBfFormData({...bfFormData, section: e.target.value})}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Father's full name"
                        value={bfFormData.father_name}
                        onChange={(e) => setBfFormData({...bfFormData, father_name: e.target.value})}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother's Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Mother's full name"
                        value={bfFormData.mother_name}
                        onChange={(e) => setBfFormData({...bfFormData, mother_name: e.target.value})}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setBfView('list')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateBonafideCertificate}
                      disabled={bfLoading}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {bfLoading ? 'Creating...' : 'Create Bonafide Certificate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Bonafide Certificate Student Selection Modal */}
          {showBonafideStudentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Select Student for Bonafide Certificate</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowBonafideStudentModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={bfSearchTerm}
                      onChange={(e) => setBfSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading students...</p>
                    </div>
                  ) : availableStudents.filter(student =>
                      student.name.toLowerCase().includes(bfSearchTerm.toLowerCase()) ||
                      student.admission_no.toLowerCase().includes(bfSearchTerm.toLowerCase())
                    ).length === 0 ? (
                    <div className="text-center py-4">
                      {availableStudents.length === 0 ? (
                        <div>
                          <p className="text-gray-500 font-medium">No students available</p>
                          <p className="text-sm text-gray-400 mt-1">Please add students first or check if they are active.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500 font-medium">No students match your search</p>
                          <p className="text-sm text-gray-400 mt-1">Try searching by name or admission number.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    availableStudents.filter(student =>
                      student.name.toLowerCase().includes(bfSearchTerm.toLowerCase()) ||
                      student.admission_no.toLowerCase().includes(bfSearchTerm.toLowerCase())
                    ).map((student) => (
                      <div
                        key={student.id}
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => selectBonafideStudent(student)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-600">Admission: {student.admission_no}</p>
                            <p className="text-xs text-gray-400">Father: {student.father_name}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            Class {student.class_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="id-cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ID Cards</CardTitle>
            </CardHeader>
            <CardContent>
              {idCardsView === 'main' ? (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Student & Staff ID Cards</h3>
                  <p className="text-gray-600 mb-4">Generate and print identification cards</p>
                  <div className="flex justify-center space-x-3">
                    <Button variant="outline" onClick={handleStudentIDsClick}>
                      <Users className="h-4 w-4 mr-2" />
                      Student IDs
                    </Button>
                    <Button variant="outline" onClick={handleStaffIDsClick}>
                      <Users className="h-4 w-4 mr-2" />
                      Staff IDs  
                    </Button>
                    <Button 
                      className="bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => {
                        if (generatedIdCards.length > 0) {
                          setIdCardsView('generated');
                        } else {
                          toast.error('No ID cards generated yet. Please generate cards first.');
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Generated Cards ({generatedIdCards.length})
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header with navigation */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Generated ID Cards</h3>
                      <p className="text-sm text-gray-600">{generatedIdCards.length} cards generated</p>
                    </div>
                    <div className="space-x-3">
                      <Button variant="outline" onClick={() => setIdCardsView('main')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Generation
                      </Button>
                      <Button 
                        className="bg-emerald-500 hover:bg-emerald-600"
                        onClick={handlePrintAllCards}
                        disabled={generatedIdCards.length === 0}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print All Cards
                      </Button>
                    </div>
                  </div>

                  {/* Generated Cards Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedIdCards.map((card) => (
                      <div key={card.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-lg">
                                {card.type === 'student' ? card.studentData?.name : card.staffData?.name}
                              </h4>
                              <p className="text-emerald-100 text-sm">
                                {card.type === 'student' ? 'Student' : 'Staff Member'}
                              </p>
                            </div>
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                              {card.type === 'student' ? (
                                <Users className="h-8 w-8 text-white" />
                              ) : (
                                <User className="h-8 w-8 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-3">
                          {card.type === 'student' ? (
                            <>
                              <div>
                                <p className="text-sm text-gray-600">Admission No:</p>
                                <p className="font-medium">{card.studentData?.admission_no}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Class & Section:</p>
                                <p className="font-medium">{card.studentData?.class_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Roll Number:</p>
                                <p className="font-medium">{card.studentData?.roll_number}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Blood Group:</p>
                                <p className="font-medium">{card.studentData?.blood_group}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <p className="text-sm text-gray-600">Employee ID:</p>
                                <p className="font-medium">{card.staffData?.employee_id}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Department:</p>
                                <p className="font-medium">{card.staffData?.department}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Designation:</p>
                                <p className="font-medium">{card.staffData?.designation}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Phone:</p>
                                <p className="font-medium">{card.staffData?.phone}</p>
                              </div>
                            </>
                          )}
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div>
                              <p className="text-xs text-gray-500">Card No:</p>
                              <p className="text-sm font-medium">{card.cardNumber}</p>
                            </div>
                            <div className="space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCardPreview(card)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCardPrint(card)}
                              >
                                <Printer className="h-3 w-3 mr-1" />
                                Print
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {generatedIdCards.length === 0 && (
                    <div className="text-center py-12">
                      <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No ID Cards Generated</h3>
                      <p className="text-gray-600 mb-4">Generate student or staff ID cards to see them here</p>
                      <Button onClick={() => setIdCardsView('main')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate ID Cards
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Certificate Generation Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Generate Certificate</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCertificateModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Select Certificate Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificateTypes.map((certType) => {
                    const IconComponent = certType.icon;
                    return (
                      <div
                        key={certType.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer hover:border-emerald-500 transition-colors"
                        onClick={() => handleCertificateTypeSelect(certType.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-8 w-8 text-emerald-500" />
                          <div>
                            <h5 className="font-medium text-gray-900">{certType.name}</h5>
                            <p className="text-sm text-gray-600">
                              {certType.id === 'transfer' ? 'Generate transfer certificates' :
                               certType.id === 'course' ? 'Issue course completion certificates' :
                               certType.id === 'progress' ? 'Create progress reports' :
                               certType.id === 'bonafide' ? 'Generate bonafide certificates' :
                               'Create student/staff ID cards'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 text-center">
                  Select a certificate type above to continue with the generation process.
                  {certificateStudents.length > 0 && ` ${certificateStudents.length} students available.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TC View Modal */}
      {showTcViewModal && selectedTc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Transfer Certificate Details</h2>
                <p className="text-sm text-gray-600">Certificate ID: {selectedTc.id}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowTcViewModal(false);
                  setSelectedTc(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Student Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Student Name</label>
                      <p className="text-gray-900">{selectedTc.student_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Admission Number</label>
                      <p className="text-gray-900">{selectedTc.admission_no || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Admission</label>
                      <p className="text-gray-900">
                        {selectedTc.date_of_admission ? new Date(selectedTc.date_of_admission).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Class Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Class</label>
                      <p className="text-gray-900">{selectedTc.last_class || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Section</label>
                      <p className="text-gray-900">{selectedTc.last_section || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Leaving</label>
                      <p className="text-gray-900">
                        {selectedTc.date_of_leaving ? new Date(selectedTc.date_of_leaving).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Transfer Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reason for Transfer</label>
                      <p className="text-gray-900">{selectedTc.reason_for_transfer || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Conduct & Behavior</label>
                      <p className="text-gray-900">{selectedTc.conduct_remarks || 'Satisfactory'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Certificate Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        <Badge className={
                          selectedTc.status === 'issued' ? 'bg-green-100 text-green-800' :
                          selectedTc.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {selectedTc.status === 'pending_approval' ? 'Pending Approval' : 
                           selectedTc.status.charAt(0).toUpperCase() + selectedTc.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    {selectedTc.issue_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Issue Date</label>
                        <p className="text-gray-900">{new Date(selectedTc.issue_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created Date</label>
                      <p className="text-gray-900">{new Date(selectedTc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Created by: {selectedTc.created_by || 'System'}
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => handlePDFTC(selectedTc)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePrintTC(selectedTc)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Certificate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CC View Modal */}
      {showCcViewModal && selectedCc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Course Completion Certificate Details</h2>
                <p className="text-sm text-gray-600">Certificate ID: {selectedCc.id}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCcViewModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student Name</label>
                    <p className="text-gray-900 font-semibold">{selectedCc.student_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admission Number</label>
                    <p className="text-gray-900">{selectedCc.admission_no}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Course Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Course Name</label>
                    <p className="text-gray-900 font-semibold">{selectedCc.course_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Course Duration</label>
                    <p className="text-gray-900">{selectedCc.course_duration || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Completion Date</label>
                    <p className="text-gray-900">{new Date(selectedCc.completion_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Grade Obtained</label>
                    <Badge className={
                      selectedCc.grade_obtained === 'A+' || selectedCc.grade_obtained === 'A' ? 'bg-green-100 text-green-800' :
                      selectedCc.grade_obtained === 'B+' || selectedCc.grade_obtained === 'B' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {selectedCc.grade_obtained || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Credits Earned</label>
                    <p className="text-gray-900">{selectedCc.credits_earned || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Instructor Name</label>
                    <p className="text-gray-900">{selectedCc.instructor_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Certificate Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge className={
                        selectedCc.status === 'issued' ? 'bg-green-100 text-green-800' :
                        selectedCc.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {selectedCc.status}
                      </Badge>
                    </div>
                  </div>
                  {selectedCc.issue_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Issue Date</label>
                      <p className="text-gray-900">{new Date(selectedCc.issue_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created Date</label>
                    <p className="text-gray-900">{new Date(selectedCc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Created by: {selectedCc.created_by || 'System'}
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => handleDownloadCC(selectedCc)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePrintCC(selectedCc)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Certificate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PR View Modal */}
      {showPrViewModal && selectedPr && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Progress Report Details</h2>
                <p className="text-sm text-gray-600">Report ID: {selectedPr.id || selectedPr._id}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrViewModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student Name</label>
                    <p className="text-gray-900 font-semibold">{selectedPr.student_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admission Number</label>
                    <p className="text-gray-900">{selectedPr.admission_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Class</label>
                    <p className="text-gray-900">{selectedPr.class_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Section</label>
                    <p className="text-gray-900">{selectedPr.section || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Academic Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Academic Year</label>
                    <p className="text-gray-900">{selectedPr.academic_year || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Semester/Term</label>
                    <p className="text-gray-900">{selectedPr.semester || selectedPr.term || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Overall Grade</label>
                    <Badge className="bg-blue-100 text-blue-800 text-base px-3 py-1">
                      {selectedPr.overall_grade || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Attendance</label>
                    <p className="text-gray-900">{selectedPr.attendance_percentage || 'N/A'}%</p>
                  </div>
                </div>

                {selectedPr.subjects && selectedPr.subjects.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold mb-3 text-gray-800">Subject-wise Performance</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPr.subjects.map((subject, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900">{subject.subject_name || subject.name || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{subject.marks_obtained || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{subject.total_marks || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm">
                                <Badge className="bg-green-100 text-green-800">{subject.grade || 'N/A'}</Badge>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">{subject.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {(selectedPr.teacher_remarks || selectedPr.principal_remarks) && (
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Remarks</h3>
                  {selectedPr.teacher_remarks && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700">👨‍🏫 Class Teacher's Remarks</label>
                      <p className="text-gray-900 mt-1">{selectedPr.teacher_remarks}</p>
                    </div>
                  )}
                  {selectedPr.principal_remarks && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">👔 Principal's Remarks</label>
                      <p className="text-gray-900 mt-1">{selectedPr.principal_remarks}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Report Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge className={
                        selectedPr.status === 'issued' ? 'bg-green-100 text-green-800' :
                        selectedPr.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {selectedPr.status}
                      </Badge>
                    </div>
                  </div>
                  {selectedPr.issue_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Issue Date</label>
                      <p className="text-gray-900">{new Date(selectedPr.issue_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedPr.created_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created Date</label>
                      <p className="text-gray-900">{new Date(selectedPr.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Created by: {selectedPr.created_by || 'System'}
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => handlePDFPR(selectedPr)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePrintPR(selectedPr)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Certificate Student Selection Modal - MOVED OUTSIDE TABS */}
      {showCourseStudentModal && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: '999999',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #f3f4f6',
              paddingBottom: '15px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0'
              }}>
                Select Student for Course Certificate
              </h2>
              <button
                onClick={() => setShowCourseStudentModal(false)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Search Box */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search students by name or admission number..."
                value={ccSearchTerm}
                onChange={(e) => setCcSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Students List */}
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '2px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              {loading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <div style={{
                    fontSize: '18px',
                    marginBottom: '10px'
                  }}>⏳ Loading students...</div>
                </div>
              ) : !availableStudents || availableStudents.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>👥</div>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>No students found</div>
                  <div style={{ fontSize: '14px' }}>Please add students to the system first.</div>
                </div>
              ) : (
                availableStudents
                  .filter(student => {
                    // Ensure student is a valid object with required properties
                    if (!student || typeof student !== 'object' || !student.name || !student.admission_no || !student.id) {
                      return false;
                    }
                    
                    if (!ccSearchTerm) return true;
                    
                    const name = String(student.name).toLowerCase();
                    const admissionNo = String(student.admission_no).toLowerCase();
                    const searchLower = ccSearchTerm.toLowerCase();
                    
                    return name.includes(searchLower) || admissionNo.includes(searchLower);
                  })
                  .map((student, index) => (
                    <div
                      key={student.id || index}
                      onClick={() => selectCourseStudent(student)}
                      style={{
                        padding: '15px',
                        borderBottom: index < availableStudents.length - 1 ? '1px solid #e5e7eb' : 'none',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f0fdf4'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{
                            fontWeight: 'bold',
                            color: '#1f2937',
                            marginBottom: '4px'
                          }}>
                            {String(student.name || 'Unnamed Student')}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            marginBottom: '2px'
                          }}>
                            Admission: {String(student.admission_no || 'N/A')}
                          </div>
                          {student.father_name && (
                            <div style={{
                              fontSize: '12px',
                              color: '#9ca3af'
                            }}>
                              Father: {String(student.father_name)}
                            </div>
                          )}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          fontWeight: 'bold'
                        }}>
                          {student.class_id ? `Class ${String(student.class_id)}` : 'No Class'}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              paddingTop: '15px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setShowCourseStudentModal(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student ID Cards Modal */}
      {showStudentIdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Generate Student ID Cards</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowStudentIdModal(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">Select students to generate ID cards for:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {availableStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedStudentsForId.includes(student.id) 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                    onClick={() => {
                      setSelectedStudentsForId(prev => 
                        prev.includes(student.id) 
                          ? prev.filter(id => id !== student.id)
                          : [...prev, student.id]
                      );
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">Admission: {student.admission_no}</p>
                        <p className="text-xs text-gray-400">Class: {student.class_name || student.class_id || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        {selectedStudentsForId.includes(student.id) && (
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-600">
                  {selectedStudentsForId.length} students selected
                </p>
                <div className="space-x-3">
                  <Button variant="outline" onClick={() => setShowStudentIdModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={async () => {
                      setIdCardsLoading(true);
                      try {
                        await generateStudentIdCards(selectedStudentsForId);
                        setShowStudentIdModal(false);
                        setSelectedStudentsForId([]);
                        toast.success(`${selectedStudentsForId.length} student ID cards generated successfully!`);
                      } catch (error) {
                        toast.error('Failed to generate student ID cards');
                      } finally {
                        setIdCardsLoading(false);
                      }
                    }}
                    disabled={selectedStudentsForId.length === 0 || idCardsLoading}
                  >
                    {idCardsLoading ? 'Generating...' : `Generate Cards (${selectedStudentsForId.length})`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff ID Cards Modal */}
      {showStaffIdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Generate Staff ID Cards</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowStaffIdModal(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">Select staff members to generate ID cards for:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {availableStaff.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No staff members available</p>
                    <p className="text-sm text-gray-400">Please add staff members first</p>
                  </div>
                ) : (
                  availableStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedStaffForId.includes(staff.id) 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                      }`}
                      onClick={() => {
                        setSelectedStaffForId(prev => 
                          prev.includes(staff.id) 
                            ? prev.filter(id => id !== staff.id)
                            : [...prev, staff.id]
                        );
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium dark:text-white">{staff.full_name || staff.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">ID: {staff.employee_id || staff.staff_id || 'N/A'}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Dept: {staff.department || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          {selectedStaffForId.includes(staff.id) && (
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-600">
                  {selectedStaffForId.length} staff members selected
                </p>
                <div className="space-x-3">
                  <Button variant="outline" onClick={() => setShowStaffIdModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={async () => {
                      setIdCardsLoading(true);
                      try {
                        await generateStaffIdCards(selectedStaffForId);
                        setShowStaffIdModal(false);
                        setSelectedStaffForId([]);
                        toast.success(`${selectedStaffForId.length} staff ID cards generated successfully!`);
                      } catch (error) {
                        toast.error('Failed to generate staff ID cards');
                      } finally {
                        setIdCardsLoading(false);
                      }
                    }}
                    disabled={selectedStaffForId.length === 0 || idCardsLoading}
                  >
                    {idCardsLoading ? 'Generating...' : `Generate Cards (${selectedStaffForId.length})`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Cards Modal */}
      {showPrintCardsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Print ID Cards</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPrintCardsModal(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Print Summary</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Student ID Cards: {selectedStudentsForId.length}</p>
                  <p>Staff ID Cards: {selectedStaffForId.length}</p>
                  <p className="font-medium">Total Cards: {selectedStudentsForId.length + selectedStaffForId.length}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Print Quality
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="high">High Quality (Recommended)</option>
                    <option value="medium">Medium Quality</option>
                    <option value="draft">Draft Quality</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Layout
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="standard">Standard Layout</option>
                    <option value="compact">Compact Layout</option>
                    <option value="detailed">Detailed Layout</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setShowPrintCardsModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => {
                    setIdCardsLoading(true);
                    // Simulate printing process
                    setTimeout(() => {
                      setIdCardsLoading(false);
                      setShowPrintCardsModal(false);
                      setSelectedStudentsForId([]);
                      setSelectedStaffForId([]);
                      toast.success('ID cards sent to printer successfully!');
                    }, 2000);
                  }}
                  disabled={idCardsLoading}
                >
                  {idCardsLoading ? 'Printing...' : 'Print ID Cards'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Preview Modal */}
      {showCardPreviewModal && selectedCardForPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                ID Card Preview - {selectedCardForPreview.type === 'student' ? selectedCardForPreview.studentData?.name : selectedCardForPreview.staffData?.name}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCardPreviewModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="flex justify-center">
              <div 
                className="border border-gray-300"
                dangerouslySetInnerHTML={{
                  __html: `<style>${getCardPrintStyles()}</style>${generateCardPrintContent([selectedCardForPreview])}`
                }}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <Button variant="outline" onClick={() => setShowCardPreviewModal(false)}>
                Close
              </Button>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => {
                  handleCardPrint(selectedCardForPreview);
                  setShowCardPreviewModal(false);
                }}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print This Card
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;