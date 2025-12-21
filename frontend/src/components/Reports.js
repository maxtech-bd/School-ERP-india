import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { toast } from 'sonner';
import { 
  BarChart3,
  FileText,
  Download,
  Users,
  Calendar,
  GraduationCap,
  TrendingUp,
  Clock,
  UserCheck,
  Filter,
  Loader2,
  FileDown
} from 'lucide-react';

const Reports = () => {
  // Router-controlled tabs - same pattern as Fees module
  const { '*': reportSlug } = useParams();
  const navigate = useNavigate();
  
  // Map report slugs to tabs
  const slugToTabMap = {
    'admission': 'administrative',
    'login': 'administrative',
    'students': 'administrative',
    'cross-count': 'administrative',
    'teachers': 'administrative',
    'marksheet': 'academic',
    'attendance': 'attendance',
    'staff-attendance': 'attendance'
  };
  
  // Determine current tab from URL slug, default to 'academic'
  const currentTab = slugToTabMap[reportSlug] || 'academic';
  
  // Tab change handler - same pattern as Fees
  const handleTabChange = (newTab) => {
    navigate(`/reports`); // Navigate to base reports page
  };
  
  const [activeReports, setActiveReports] = useState(8);
  const [showDailyAttendanceModal, setShowDailyAttendanceModal] = useState(false);
  const [dailyAttendanceData, setDailyAttendanceData] = useState([]);
  const [loadingDailyAttendance, setLoadingDailyAttendance] = useState(false);
  const [quickStats, setQuickStats] = useState({
    todayAttendance: { present: 0, total: 0 },
    newAdmissions: 0,
    feeCollection: 0,
    pendingReports: 0
  });

  // Report data state - similar to Fees module pattern
  const [admissionData, setAdmissionData] = useState([]);
  const [loginActivityData, setLoginActivityData] = useState([]);
  const [studentInfoData, setStudentInfoData] = useState([]);
  
  // Separate loading states for each report type
  const [admissionLoading, setAdmissionLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  
  // Report filters state
  const [admissionFilters, setAdmissionFilters] = useState({
    year: '2024-25',
    class: 'all_classes',
    gender: 'all_genders',
    status: 'all_statuses'
  });
  
  const [loginFilters, setLoginFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all'
  });
  
  const [studentFilters, setStudentFilters] = useState({
    class: 'all_classes',
    section: 'all_sections',
    status: 'all_statuses',
    search: ''
  });
  
  // Cross Counting Report state
  const [crossCountData, setCrossCountData] = useState([]);
  const [crossCountLoading, setCrossCountLoading] = useState(false);
  const [crossCountFilters, setCrossCountFilters] = useState({
    year: '2024-25',
    department: 'all',
    class: 'all_classes'
  });
  
  // Teacher List Report state
  const [teacherData, setTeacherData] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherFilters, setTeacherFilters] = useState({
    department: 'all',
    designation: 'all',
    status: 'active',
    search: ''
  });

  // API base URL from environment
  const API = process.env.REACT_APP_API_URL;

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Academic Report API Functions
  const generateConsolidatedMarksheet = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating consolidated marksheet... Please wait');
      
      const response = await fetch(`${API}/reports/academic/consolidated-marksheet?format=pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate consolidated marksheet: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consolidated_marksheet_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Consolidated marksheet downloaded successfully!');
    } catch (error) {
      console.error('Error generating consolidated marksheet:', error);
      toast.error('Failed to generate consolidated marksheet');
    }
  };

  const generateMonthlyAttendanceReport = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating monthly attendance report... Please wait');
      
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      
      const response = await fetch(`${API}/reports/attendance/monthly-summary?format=pdf&year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate monthly attendance report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly_attendance_${year}_${month}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Monthly attendance report downloaded successfully!');
    } catch (error) {
      console.error('Error generating monthly attendance report:', error);
      toast.error('Failed to generate monthly attendance report');
    }
  };

  const generateStaffAttendanceReport = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating staff attendance report... Please wait');
      
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      
      // Default to current month date range
      const startDate = `${year}-${month}-01`;
      const nextMonth = currentDate.getMonth() === 11 ? 1 : currentDate.getMonth() + 2;
      const nextYear = currentDate.getMonth() === 11 ? year + 1 : year;
      const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
      
      const response = await fetch(`${API}/reports/attendance/staff-attendance?format=pdf&start_date=${startDate}&end_date=${endDate}&department=all_departments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate staff attendance report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `staff_attendance_${startDate.replace(/-/g, '_')}_${endDate.replace(/-/g, '_')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Staff attendance report downloaded successfully!');
    } catch (error) {
      console.error('Error generating staff attendance report:', error);
      toast.error('Failed to generate staff attendance report');
    }
  };

  // Daily Attendance Functions
  const fetchDailyAttendance = async () => {
    try {
      setLoadingDailyAttendance(true);
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to view attendance');
        return;
      }

      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const response = await fetch(`${API}/attendance?date=${currentDate}&type=staff`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch daily attendance: ${response.statusText}`);
      }

      const data = await response.json();
      setDailyAttendanceData(data);
      setShowDailyAttendanceModal(true);
      
    } catch (error) {
      console.error('Error fetching daily attendance:', error);
      toast.error('Failed to fetch daily attendance data');
    } finally {
      setLoadingDailyAttendance(false);
    }
  };

  const handleViewDailyAttendance = () => {
    fetchDailyAttendance();
  };

  // Temporary function to create sample attendance data
  const createSampleAttendanceData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to create sample data');
        return;
      }

      toast.info('Creating sample attendance data... Please wait');
      
      const response = await fetch(`${API}/attendance/create-sample-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to create sample data: ${response.statusText}`);
      }

      const data = await response.json();
      toast.success(`Successfully created ${data.records_count} sample attendance records!`);
      
    } catch (error) {
      console.error('Error creating sample attendance data:', error);
      toast.error('Failed to create sample attendance data');
    }
  };

  const generateSubjectWiseAnalysis = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating subject-wise analysis... Please wait');
      
      const response = await fetch(`${API}/reports/academic/subject-wise-analysis?format=pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate subject-wise analysis: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subject_wise_analysis_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Subject-wise analysis downloaded successfully!');
    } catch (error) {
      console.error('Error generating subject-wise analysis:', error);
      toast.error('Failed to generate subject-wise analysis');
    }
  };

  const generateClassPerformance = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating class performance report... Please wait');
      
      const response = await fetch(`${API}/reports/academic/class-performance?format=pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate class performance report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `class_performance_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Class performance report downloaded successfully!');
    } catch (error) {
      console.error('Error generating class performance report:', error);
      toast.error('Failed to generate class performance report');
    }
  };

  // Administrative Report API Functions
  const generateAdmissionReport = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating admission report... Please wait');
      
      // Include current filter parameters in PDF export
      const params = new URLSearchParams({
        format: 'pdf',
        year: admissionFilters.year,
        class_filter: admissionFilters.class,
        gender: admissionFilters.gender,
        status: admissionFilters.status
      });
      
      const response = await fetch(`${API}/reports/admission-summary?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate admission report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admission_report_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Admission report downloaded successfully!');
    } catch (error) {
      console.error('Error generating admission report:', error);
      toast.error('Failed to generate admission report');
    }
  };

  // Login Activity Report
  const generateLoginActivity = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating login activity report... Please wait');
      
      // Include current filter parameters in PDF export
      const params = new URLSearchParams({
        format: 'pdf',
        start_date: loginFilters.startDate,
        end_date: loginFilters.endDate
      });
      
      const response = await fetch(`${API}/reports/login-activity?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate login activity report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `login_activity_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Login activity report downloaded successfully!');
    } catch (error) {
      console.error('Error generating login activity report:', error);
      toast.error('Failed to generate login activity report');
    }
  };

  // Student Information Report
  const generateStudentInformation = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating student information report... Please wait');
      
      // Include current filter parameters in Excel export
      const params = new URLSearchParams({
        format: 'excel',
        class_filter: studentFilters.class,
        status: studentFilters.status
      });
      
      const response = await fetch(`${API}/reports/student-information?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate student information report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_information_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Student information report downloaded successfully!');
    } catch (error) {
      console.error('Error generating student information report:', error);
      toast.error('Failed to generate student information report');
    }
  };

  // ==================== TRANSPORT REPORT FUNCTIONS ====================

  const generateVehicleReport = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating vehicle report... Please wait');
      
      const response = await fetch(`${API}/reports/vehicle?format=pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate vehicle report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vehicle_report_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Vehicle report downloaded successfully!');
    } catch (error) {
      console.error('Error generating vehicle report:', error);
      toast.error('Failed to generate vehicle report');
    }
  };

  const generateRouteEfficiencyReport = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating route efficiency report... Please wait');
      
      const response = await fetch(`${API}/reports/route-efficiency?format=excel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate route efficiency report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `route_efficiency_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Route efficiency report downloaded successfully!');
    } catch (error) {
      console.error('Error generating route efficiency report:', error);
      toast.error('Failed to generate route efficiency report');
    }
  };

  const generateTransportFeesReport = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      toast.info('Generating transport fees report... Please wait');
      
      const response = await fetch(`${API}/reports/transport-fees?format=pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate transport fees report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transport_fees_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Transport fees report downloaded successfully!');
    } catch (error) {
      console.error('Error generating transport fees report:', error);
      toast.error('Failed to generate transport fees report');
    }
  };

  const reportCategories = [
    {
      title: 'Academic Reports',
      icon: GraduationCap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      reports: [
        'Student Performance Report',
        'Class-wise Academic Summary', 
        'Subject-wise Analysis',
        'Consolidated Marksheet'
      ]
    },
    {
      title: 'Attendance Reports',
      icon: UserCheck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100',
      reports: [
        'Daily Attendance Report',
        'Monthly Attendance Summary',
        'Staff Attendance Report',
        'Class-wise Attendance'
      ]
    },
    {
      title: 'Administrative Reports',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      reports: [
        'Admission Report',
        'Login Activity Report',
        'Fee Collection Report',
        'Student Information Report'
      ]
    },
    {
      title: 'Transport Reports',
      icon: BarChart3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      reports: [
        'Vehicle Utilization Report',
        'Route Efficiency Report',
        'Transport Fee Report',
        'Driver Performance Report'
      ]
    }
  ];

  const quickReports = [
    { name: 'Today\'s Attendance', icon: UserCheck, count: `${quickStats.todayAttendance.present}/${quickStats.todayAttendance.total}` },
    { name: 'New Admissions', icon: Users, count: String(quickStats.newAdmissions) },
    { name: 'Fee Collection', icon: TrendingUp, count: `₹${(quickStats.feeCollection / 100000).toFixed(1)}L` },
    { name: 'Pending Reports', icon: Clock, count: String(quickStats.pendingReports) }
  ];

  // DATA FETCHING FUNCTIONS - Similar to Fees module pattern
  const fetchAdmissionData = async () => {
    try {
      setAdmissionLoading(true);
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to view reports');
        return;
      }

      const params = new URLSearchParams({
        format: 'json',
        year: admissionFilters.year,
        class_filter: admissionFilters.class,
        gender: admissionFilters.gender,
        status: admissionFilters.status
      });

      const response = await fetch(`${API}/reports/admission-summary?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch admission data');

      const result = await response.json();
      setAdmissionData(result.data?.students || []);
    } catch (error) {
      console.error('Error fetching admission data:', error);
      toast.error('Failed to load admission data');
    } finally {
      setAdmissionLoading(false);
    }
  };

  const fetchLoginActivityData = async () => {
    try {
      setLoginLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const params = new URLSearchParams({
        format: 'json',
        start_date: loginFilters.startDate,
        end_date: loginFilters.endDate
      });

      const response = await fetch(`${API}/reports/login-activity?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch login data');

      const result = await response.json();
      setLoginActivityData(result.data?.login_activities || []);
    } catch (error) {
      console.error('Error fetching login data:', error);
      toast.error('Failed to load login activity data');
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchStudentInfoData = async () => {
    try {
      setStudentLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const params = new URLSearchParams({
        format: 'json',
        class_filter: studentFilters.class,
        status: studentFilters.status
      });

      const response = await fetch(`${API}/reports/student-information?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch student data');

      const result = await response.json();
      setStudentInfoData(result.data?.students || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load student information');
    } finally {
      setStudentLoading(false);
    }
  };

  const fetchCrossCountData = async () => {
    try {
      setCrossCountLoading(true);
      const token = getAuthToken();
      if (!token) return;

      // Use student information endpoint to get data for cross counting
      const params = new URLSearchParams({
        format: 'json',
        class_filter: crossCountFilters.class,
        status: 'active'
      });

      const response = await fetch(`${API}/reports/student-information?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch cross count data');

      const result = await response.json();
      setCrossCountData(result.data?.students || []);
    } catch (error) {
      console.error('Error fetching cross count data:', error);
      toast.error('Failed to load cross counting data');
    } finally {
      setCrossCountLoading(false);
    }
  };

  const fetchTeacherData = async () => {
    try {
      setTeacherLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API}/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch teacher data');

      const result = await response.json();
      setTeacherData(result || []);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('Failed to load teacher information');
    } finally {
      setTeacherLoading(false);
    }
  };

  // Load report data when specific report slug is accessed
  useEffect(() => {
    if (reportSlug === 'admission') {
      fetchAdmissionData();
    }
  }, [reportSlug, admissionFilters]);
  
  useEffect(() => {
    if (reportSlug === 'login') {
      fetchLoginActivityData();
    }
  }, [reportSlug, loginFilters]);
  
  useEffect(() => {
    if (reportSlug === 'students') {
      fetchStudentInfoData();
    }
  }, [reportSlug, studentFilters]);
  
  useEffect(() => {
    if (reportSlug === 'cross-count') {
      fetchCrossCountData();
    }
  }, [reportSlug, crossCountFilters]);
  
  useEffect(() => {
    if (reportSlug === 'teachers') {
      fetchTeacherData();
    }
  }, [reportSlug, teacherFilters]);

  // Fetch quick stats for the dashboard cards
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        
        const [attendanceRes, statsRes] = await Promise.all([
          fetch(`${API}/attendance/summary?type=student`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        if (attendanceRes.ok) {
          const attendance = await attendanceRes.json();
          setQuickStats(prev => ({
            ...prev,
            todayAttendance: {
              present: attendance.present || 0,
              total: attendance.total || 0
            }
          }));
        }
        
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setQuickStats(prev => ({
            ...prev,
            newAdmissions: stats.new_admissions_this_month || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      }
    };
    
    fetchQuickStats();
  }, [API]);

  // Show guidance toast when a specific report is accessed via sidebar
  useEffect(() => {
    const reportMessages = {
      'admission': 'Administrative tab opened. Click "Generate" to download Admission Report',
      'login': 'Administrative tab opened. Click "Generate" to download Login Activity Report',
      'students': 'Administrative tab opened. Click "Generate" to download Student Information Report',
      'cross-count': 'Administrative tab opened. View student cross-counting by class and gender',
      'teachers': 'Administrative tab opened. View comprehensive teacher information',
      'marksheet': 'Academic tab opened. Click "Generate" to download Consolidated Marksheet',
      'attendance': 'Attendance tab opened. Select a report to generate',
      'staff-attendance': 'Attendance tab opened. Click "Generate" to download Staff Attendance Report'
    };
    
    if (reportSlug && reportMessages[reportSlug]) {
      toast.info(reportMessages[reportSlug]);
    }
  }, [reportSlug, currentTab]);

  return (
    <div className="space-y-4 sm:space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Comprehensive reporting and analytics dashboard</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Date
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Export
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm h-8 sm:h-9">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Generate
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {quickReports.map((report, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{report.name}</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{report.count}</p>
                </div>
                <report.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Categories */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="academic" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Academic</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Attendance</TabsTrigger>
          <TabsTrigger value="administrative" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Admin</TabsTrigger>
          <TabsTrigger value="transport" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Transport</TabsTrigger>
        </TabsList>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                <span>Academic Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 dark:text-white">Consolidated Marksheet</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Complete academic performance report</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">Ready</Badge>
                      <Button size="sm" variant="outline" onClick={generateConsolidatedMarksheet}>Generate</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 dark:text-white">Subject-wise Analysis</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Performance analysis by subjects</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">Ready</Badge>
                      <Button size="sm" variant="outline" onClick={generateSubjectWiseAnalysis}>Generate</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 dark:text-white">Class Performance</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Class-wise academic summary</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">Ready</Badge>
                      <Button size="sm" variant="outline" onClick={generateClassPerformance}>Generate</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-emerald-500" />
                  <span>Attendance Reports</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={createSampleAttendanceData}
                  className="text-xs bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  📊 Create Sample Data (Test)
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 dark:text-white">Daily Attendance</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Today's attendance summary</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Live</Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleViewDailyAttendance}
                        disabled={loadingDailyAttendance}
                      >
                        {loadingDailyAttendance ? 'Loading...' : 'View'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 dark:text-white">Monthly Summary</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Complete month attendance report</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">Ready</Badge>
                      <Button size="sm" variant="outline" onClick={generateMonthlyAttendanceReport}>Generate</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 dark:text-white">Staff Attendance</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Employee attendance tracking</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">Ready</Badge>
                      <Button size="sm" variant="outline" onClick={generateStaffAttendanceReport}>Generate</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="administrative" className="space-y-4">
          {/* INTERACTIVE ADMISSION REPORT TABLE */}
          {reportSlug === 'admission' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <span>Admission Report - Academic Year {admissionFilters.year}</span>
                  </CardTitle>
                  <Button onClick={generateAdmissionReport} className="gap-2">
                    <FileDown className="h-4 w-4" />
                    Generate PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select 
                      value={admissionFilters.year} 
                      onValueChange={(value) => setAdmissionFilters({...admissionFilters, year: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2023-24">2023-24</SelectItem>
                        <SelectItem value="2022-23">2022-23</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select 
                      value={admissionFilters.class} 
                      onValueChange={(value) => setAdmissionFilters({...admissionFilters, class: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_classes">All Classes</SelectItem>
                        <SelectItem value="class_1">Class 1</SelectItem>
                        <SelectItem value="class_2">Class 2</SelectItem>
                        <SelectItem value="class_3">Class 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select 
                      value={admissionFilters.gender} 
                      onValueChange={(value) => setAdmissionFilters({...admissionFilters, gender: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_genders">All Genders</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={admissionFilters.status} 
                      onValueChange={(value) => setAdmissionFilters({...admissionFilters, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_statuses">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Data Table */}
                {admissionLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading admission data...</span>
                  </div>
                ) : admissionData.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No admission records found with current filters</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Card className="bg-blue-50 dark:bg-blue-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{admissionData.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-50 dark:bg-green-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {admissionData.filter(s => s.gender === 'Male').length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Male Students</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-pink-50 dark:bg-pink-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {admissionData.filter(s => s.gender === 'Female').length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Female Students</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Admission No</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Admission Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {admissionData.slice(0, 50).map((student, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{student.admission_no || 'N/A'}</TableCell>
                              <TableCell>{student.full_name || student.name || 'N/A'}</TableCell>
                              <TableCell>{student.class_name || student.class || 'N/A'}</TableCell>
                              <TableCell>{student.gender || 'N/A'}</TableCell>
                              <TableCell>{student.admission_date || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={student.is_active ? "success" : "secondary"}>
                                  {student.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {admissionData.length > 50 && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Showing first 50 of {admissionData.length} records. Export to see all data.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* INTERACTIVE LOGIN ACTIVITY REPORT TABLE */}
          {reportSlug === 'login' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <span>Login Activity Report</span>
                  </CardTitle>
                  <Button onClick={generateLoginActivity} className="gap-2">
                    <FileDown className="h-4 w-4" />
                    Generate PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={loginFilters.startDate}
                      onChange={(e) => setLoginFilters({...loginFilters, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={loginFilters.endDate}
                      onChange={(e) => setLoginFilters({...loginFilters, endDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={loginFilters.status} 
                      onValueChange={(value) => setLoginFilters({...loginFilters, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="success">Success Only</SelectItem>
                        <SelectItem value="failed">Failed Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Data Table */}
                {loginLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-3 text-gray-600">Loading login activity data...</span>
                  </div>
                ) : loginActivityData.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No login activity records found</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Card className="bg-blue-50 dark:bg-blue-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{loginActivityData.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Logins</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-50 dark:bg-green-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {loginActivityData.filter(l => l.status === 'Success').length}
                          </div>
                          <div className="text-sm text-gray-600">Successful</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-red-50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {loginActivityData.filter(l => l.status === 'Failed').length}
                          </div>
                          <div className="text-sm text-gray-600">Failed</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User Email</TableHead>
                            <TableHead>Login Date</TableHead>
                            <TableHead>Login Time</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loginActivityData
                            .filter(login => loginFilters.status === 'all' || login.status?.toLowerCase() === loginFilters.status.toLowerCase())
                            .slice(0, 50)
                            .map((login, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{login.user_email || 'N/A'}</TableCell>
                              <TableCell>{login.login_date || 'N/A'}</TableCell>
                              <TableCell>{login.login_time || 'N/A'}</TableCell>
                              <TableCell>{login.ip_address || 'N/A'}</TableCell>
                              <TableCell>{login.device || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={login.status === 'Success' ? "success" : "destructive"}>
                                  {login.status || 'N/A'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {loginActivityData.filter(l => loginFilters.status === 'all' || l.status?.toLowerCase() === loginFilters.status.toLowerCase()).length > 50 && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Showing first 50 of {loginActivityData.filter(l => loginFilters.status === 'all' || l.status?.toLowerCase() === loginFilters.status.toLowerCase()).length} records. Export to see all data.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* INTERACTIVE STUDENT INFORMATION REPORT TABLE */}
          {reportSlug === 'students' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <span>Student Information Report</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={generateStudentInformation} variant="outline" className="gap-2">
                      <FileDown className="h-4 w-4" />
                      Generate Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select 
                      value={studentFilters.class} 
                      onValueChange={(value) => setStudentFilters({...studentFilters, class: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_classes">All Classes</SelectItem>
                        <SelectItem value="class_1">Class 1</SelectItem>
                        <SelectItem value="class_2">Class 2</SelectItem>
                        <SelectItem value="class_3">Class 3</SelectItem>
                        <SelectItem value="class_4">Class 4</SelectItem>
                        <SelectItem value="class_5">Class 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Select 
                      value={studentFilters.section} 
                      onValueChange={(value) => setStudentFilters({...studentFilters, section: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_sections">All Sections</SelectItem>
                        <SelectItem value="A">Section A</SelectItem>
                        <SelectItem value="B">Section B</SelectItem>
                        <SelectItem value="C">Section C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={studentFilters.status} 
                      onValueChange={(value) => setStudentFilters({...studentFilters, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_statuses">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Search Student</Label>
                    <Input
                      type="text"
                      placeholder="Search by name or roll no..."
                      onChange={(e) => setStudentFilters({...studentFilters, search: e.target.value})}
                    />
                  </div>
                </div>

                {/* Data Table */}
                {studentLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-3 text-gray-600">Loading student information...</span>
                  </div>
                ) : studentInfoData.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No student records found with current filters</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <Card className="bg-blue-50 dark:bg-blue-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{studentInfoData.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-50 dark:bg-green-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {studentInfoData.filter(s => s.is_active || s.status === 'active').length}
                          </div>
                          <div className="text-sm text-gray-600">Active Students</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {studentInfoData.filter(s => s.gender === 'Male').length}
                          </div>
                          <div className="text-sm text-gray-600">Male</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-pink-50 dark:bg-pink-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {studentInfoData.filter(s => s.gender === 'Female').length}
                          </div>
                          <div className="text-sm text-gray-600">Female</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Stream</TableHead>
                            <TableHead>Admission Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentInfoData
                            .filter(student => {
                              const search = studentFilters.search?.toLowerCase() || '';
                              const matchesSearch = !search || 
                                student.full_name?.toLowerCase().includes(search) || 
                                student.name?.toLowerCase().includes(search) ||
                                student.roll_no?.toLowerCase().includes(search) ||
                                student.admission_no?.toLowerCase().includes(search);
                              return matchesSearch;
                            })
                            .slice(0, 50)
                            .map((student, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{student.roll_no || student.admission_no || 'N/A'}</TableCell>
                              <TableCell>{student.full_name || student.name || 'N/A'}</TableCell>
                              <TableCell>{student.class_name || student.class || 'N/A'}</TableCell>
                              <TableCell>{student.section || 'N/A'}</TableCell>
                              <TableCell>{student.stream || student.department || 'N/A'}</TableCell>
                              <TableCell>{student.admission_date || student.date_of_admission || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={(student.is_active || student.status === 'active') ? "success" : "secondary"}>
                                  {(student.is_active || student.status === 'active') ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {studentInfoData.filter(s => {
                      const search = studentFilters.search?.toLowerCase() || '';
                      return !search || s.full_name?.toLowerCase().includes(search) || s.name?.toLowerCase().includes(search) || s.roll_no?.toLowerCase().includes(search);
                    }).length > 50 && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Showing first 50 of {studentInfoData.filter(s => {
                          const search = studentFilters.search?.toLowerCase() || '';
                          return !search || s.full_name?.toLowerCase().includes(search) || s.name?.toLowerCase().includes(search) || s.roll_no?.toLowerCase().includes(search);
                        }).length} records. Export to see all data.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* INTERACTIVE CROSS COUNTING REPORT TABLE */}
          {reportSlug === 'cross-count' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <span>Cross Counting Report - Student Distribution</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select 
                      value={crossCountFilters.year} 
                      onValueChange={(value) => setCrossCountFilters({...crossCountFilters, year: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2023-24">2023-24</SelectItem>
                        <SelectItem value="2022-23">2022-23</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select 
                      value={crossCountFilters.department} 
                      onValueChange={(value) => setCrossCountFilters({...crossCountFilters, department: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="commerce">Commerce</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Class Filter</Label>
                    <Select 
                      value={crossCountFilters.class} 
                      onValueChange={(value) => setCrossCountFilters({...crossCountFilters, class: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_classes">All Classes</SelectItem>
                        <SelectItem value="class_1">Class 1</SelectItem>
                        <SelectItem value="class_2">Class 2</SelectItem>
                        <SelectItem value="class_3">Class 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cross Count Summary Cards */}
                {crossCountLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-3 text-gray-600">Loading cross counting data...</span>
                  </div>
                ) : crossCountData.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No student records found for cross counting</p>
                  </div>
                ) : (
                  <>
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <Card className="bg-blue-50 dark:bg-blue-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{crossCountData.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-50 dark:bg-green-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {crossCountData.filter(s => s.gender === 'Male').length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Male Students</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-pink-50 dark:bg-pink-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {crossCountData.filter(s => s.gender === 'Female').length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Female Students</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {new Set(crossCountData.map(s => s.class_name || s.class)).size}
                          </div>
                          <div className="text-sm text-gray-600">Total Classes</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Cross-Tabulation Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-bold">Class</TableHead>
                            <TableHead className="text-center font-bold">Male</TableHead>
                            <TableHead className="text-center font-bold">Female</TableHead>
                            <TableHead className="text-center font-bold">Other</TableHead>
                            <TableHead className="text-center font-bold">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            // Group students by class
                            const classCounts = {};
                            crossCountData.forEach(student => {
                              const className = student.class_name || student.class || 'Unassigned';
                              if (!classCounts[className]) {
                                classCounts[className] = { male: 0, female: 0, other: 0, total: 0 };
                              }
                              const gender = student.gender?.toLowerCase();
                              if (gender === 'male') classCounts[className].male++;
                              else if (gender === 'female') classCounts[className].female++;
                              else classCounts[className].other++;
                              classCounts[className].total++;
                            });
                            
                            // Calculate totals
                            const grandTotal = { male: 0, female: 0, other: 0, total: 0 };
                            Object.values(classCounts).forEach(counts => {
                              grandTotal.male += counts.male;
                              grandTotal.female += counts.female;
                              grandTotal.other += counts.other;
                              grandTotal.total += counts.total;
                            });

                            return (
                              <>
                                {Object.entries(classCounts)
                                  .sort(([a], [b]) => a.localeCompare(b))
                                  .map(([className, counts]) => (
                                  <TableRow key={className}>
                                    <TableCell className="font-medium">{className}</TableCell>
                                    <TableCell className="text-center">{counts.male}</TableCell>
                                    <TableCell className="text-center">{counts.female}</TableCell>
                                    <TableCell className="text-center">{counts.other}</TableCell>
                                    <TableCell className="text-center font-semibold">{counts.total}</TableCell>
                                  </TableRow>
                                ))}
                                <TableRow className="bg-gray-100 font-bold">
                                  <TableCell>Grand Total</TableCell>
                                  <TableCell className="text-center">{grandTotal.male}</TableCell>
                                  <TableCell className="text-center">{grandTotal.female}</TableCell>
                                  <TableCell className="text-center">{grandTotal.other}</TableCell>
                                  <TableCell className="text-center">{grandTotal.total}</TableCell>
                                </TableRow>
                              </>
                            );
                          })()}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Gender Distribution Chart Info */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Gender Distribution Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Male Percentage:</span>
                          <span className="font-semibold">
                            {crossCountData.length > 0 
                              ? ((crossCountData.filter(s => s.gender === 'Male').length / crossCountData.length) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Female Percentage:</span>
                          <span className="font-semibold">
                            {crossCountData.length > 0 
                              ? ((crossCountData.filter(s => s.gender === 'Female').length / crossCountData.length) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gender Ratio (M:F):</span>
                          <span className="font-semibold">
                            {crossCountData.filter(s => s.gender === 'Male').length}:
                            {crossCountData.filter(s => s.gender === 'Female').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* INTERACTIVE TEACHER LIST REPORT TABLE */}
          {reportSlug === 'teachers' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <span>Teacher Information Report</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select 
                      value={teacherFilters.department} 
                      onValueChange={(value) => setTeacherFilters({...teacherFilters, department: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="social_studies">Social Studies</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Select 
                      value={teacherFilters.designation} 
                      onValueChange={(value) => setTeacherFilters({...teacherFilters, designation: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Designations</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="vice_principal">Vice Principal</SelectItem>
                        <SelectItem value="hod">HOD</SelectItem>
                        <SelectItem value="senior_teacher">Senior Teacher</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="assistant_teacher">Assistant Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={teacherFilters.status} 
                      onValueChange={(value) => setTeacherFilters({...teacherFilters, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="all">All Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Search Teacher</Label>
                    <Input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={teacherFilters.search}
                      onChange={(e) => setTeacherFilters({...teacherFilters, search: e.target.value})}
                    />
                  </div>
                </div>

                {/* Data Table */}
                {teacherLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-3 text-gray-600">Loading teacher information...</span>
                  </div>
                ) : teacherData.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No teacher records found</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Card className="bg-blue-50 dark:bg-blue-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{teacherData.length}</div>
                          <div className="text-sm text-gray-600">Total Teachers</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-50 dark:bg-green-900/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {teacherData.filter(t => t.is_active || t.status === 'active').length}
                          </div>
                          <div className="text-sm text-gray-600">Active Teachers</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-red-50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {teacherData.filter(t => !t.is_active && t.status !== 'active').length}
                          </div>
                          <div className="text-sm text-gray-600">Inactive Teachers</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee ID</TableHead>
                            <TableHead>Teacher Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Joining Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teacherData
                            .filter(teacher => {
                              // Filter by department
                              if (teacherFilters.department !== 'all' && teacher.department?.toLowerCase() !== teacherFilters.department.toLowerCase()) {
                                return false;
                              }
                              // Filter by designation
                              if (teacherFilters.designation !== 'all' && teacher.designation?.toLowerCase() !== teacherFilters.designation.toLowerCase()) {
                                return false;
                              }
                              // Filter by status
                              if (teacherFilters.status !== 'all') {
                                const isActive = teacher.is_active || teacher.status === 'active';
                                if (teacherFilters.status === 'active' && !isActive) return false;
                                if (teacherFilters.status === 'inactive' && isActive) return false;
                              }
                              // Filter by search
                              const search = teacherFilters.search?.toLowerCase() || '';
                              if (search) {
                                const matchesSearch = 
                                  teacher.full_name?.toLowerCase().includes(search) ||
                                  teacher.name?.toLowerCase().includes(search) ||
                                  teacher.employee_id?.toLowerCase().includes(search) ||
                                  teacher.staff_id?.toLowerCase().includes(search);
                                if (!matchesSearch) return false;
                              }
                              return true;
                            })
                            .slice(0, 50)
                            .map((teacher, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{teacher.employee_id || teacher.staff_id || 'N/A'}</TableCell>
                              <TableCell>{teacher.full_name || teacher.name || 'N/A'}</TableCell>
                              <TableCell>{teacher.department || 'N/A'}</TableCell>
                              <TableCell>{teacher.subject || teacher.subjects?.join(', ') || 'N/A'}</TableCell>
                              <TableCell>{teacher.designation || teacher.role || 'N/A'}</TableCell>
                              <TableCell>{teacher.joining_date || teacher.date_of_joining || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={(teacher.is_active || teacher.status === 'active') ? "success" : "secondary"}>
                                  {(teacher.is_active || teacher.status === 'active') ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {teacherData.filter(teacher => {
                      if (teacherFilters.department !== 'all' && teacher.department?.toLowerCase() !== teacherFilters.department.toLowerCase()) return false;
                      if (teacherFilters.designation !== 'all' && teacher.designation?.toLowerCase() !== teacherFilters.designation.toLowerCase()) return false;
                      if (teacherFilters.status !== 'all') {
                        const isActive = teacher.is_active || teacher.status === 'active';
                        if (teacherFilters.status === 'active' && !isActive) return false;
                        if (teacherFilters.status === 'inactive' && isActive) return false;
                      }
                      const search = teacherFilters.search?.toLowerCase() || '';
                      if (search) {
                        const matchesSearch = 
                          teacher.full_name?.toLowerCase().includes(search) ||
                          teacher.name?.toLowerCase().includes(search) ||
                          teacher.employee_id?.toLowerCase().includes(search);
                        if (!matchesSearch) return false;
                      }
                      return true;
                    }).length > 50 && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Showing first 50 of {teacherData.filter(t => {
                          // Same filters applied
                          return true;
                        }).length} records.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Static report cards - shown when no specific report is accessed */}
          {!reportSlug && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <span>Administrative Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border border-gray-200 dark:border-gray-600 hover:border-purple-300 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 dark:text-white">Admission Report</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">New admissions and trends</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">Ready</Badge>
                        <Button size="sm" variant="outline" onClick={() => navigate('/reports/admission')}>View</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 dark:border-gray-600 hover:border-purple-300 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 dark:text-white">Login Activity</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">System access and usage report</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">Ready</Badge>
                        <Button size="sm" variant="outline" onClick={() => navigate('/reports/login')}>View</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 dark:border-gray-600 hover:border-purple-300 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 dark:text-white">Student Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Comprehensive student database</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">Ready</Badge>
                        <Button size="sm" variant="outline" onClick={() => navigate('/reports/students')}>View</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transport" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                <span>Transport Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border border-gray-200 dark:border-gray-600 hover:border-orange-300 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 dark:text-white">Vehicle Report</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Fleet utilization and maintenance</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">Ready</Badge>
                      <Button size="sm" variant="outline" onClick={generateVehicleReport}>Generate</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-600 hover:border-orange-300 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 dark:text-white">Route Efficiency</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Route performance analysis</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">Ready</Badge>
                      <Button size="sm" variant="outline" onClick={generateRouteEfficiencyReport}>Generate</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-600 hover:border-orange-300 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 dark:text-white">Transport Fees</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Transport fee collection report</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">Ready</Badge>
                      <Button size="sm" variant="outline" onClick={generateTransportFeesReport}>Generate</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Daily Attendance Modal */}
      {showDailyAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Daily Attendance - {new Date().toLocaleDateString()}</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDailyAttendanceModal(false)}
              >
                ✕
              </Button>
            </div>
            
            {dailyAttendanceData.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No attendance records found for today.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Attendance data may not have been marked yet or there might be no staff records in the system.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {dailyAttendanceData.filter(record => record.status === 'present').length}
                      </div>
                      <div className="text-sm text-gray-600">Present</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {dailyAttendanceData.filter(record => record.status === 'absent').length}
                      </div>
                      <div className="text-sm text-gray-600">Absent</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {dailyAttendanceData.filter(record => record.status === 'late').length}
                      </div>
                      <div className="text-sm text-gray-600">Late</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {dailyAttendanceData.length}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Staff Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Department</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Notes</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Marked By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyAttendanceData.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{record.staff_name || 'N/A'}</td>
                          <td className="border border-gray-300 px-4 py-2">{record.department || 'N/A'}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <Badge 
                              variant={
                                record.status === 'present' ? 'default' : 
                                record.status === 'absent' ? 'destructive' :
                                record.status === 'late' ? 'secondary' : 'outline'
                              }
                              className={
                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }
                            >
                              {record.status || 'Unknown'}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{record.notes || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2">{record.marked_by_name || 'System'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;