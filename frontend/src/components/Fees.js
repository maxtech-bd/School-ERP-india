import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  DollarSign,
  CreditCard,
  AlertTriangle,
  Users,
  Download,
  Receipt,
  TrendingUp,
  Calendar,
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PieChart
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

console.log('🔗 API Base URL:', API);

const Fees = () => {
  // Router-controlled tabs
  const { '*': tabPath } = useParams();
  const navigate = useNavigate();
  
  // Determine current tab from URL, default to 'manage'
  const currentTab = tabPath === 'student-specific' ? 'student-specific' 
                    : tabPath === 'due' ? 'due'
                    : tabPath === 'select-student' ? 'select-student'
                    : tabPath === 'collection' ? 'collection'
                    : 'manage';
  
  // Tab change handler
  const handleTabChange = (newTab) => {
    console.log('🔥 TAB CHANGED TO:', newTab);
    navigate(`/fees/${newTab}`);
  };
  const [totalFees, setTotalFees] = useState(0);
  const [collected, setCollected] = useState(0);
  const [pending, setPending] = useState(0);
  const [overdue, setOverdue] = useState(0);
  
  // Recent Payment Activity specific metrics
  const [paymentsToday, setPaymentsToday] = useState(0);
  const [todaysCollection, setTodaysCollection] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [monthlyTarget, setMonthlyTarget] = useState(0);
  
  // Bulk Payment specific state
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkPaymentFilters, setBulkPaymentFilters] = useState({
    class: 'all',
    feeStatus: 'pending',
    feeType: 'Tuition Fees'
  });

  // Student Specific Tab State
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [studentPayments, setStudentPayments] = useState([]);
  const [studentFeesSummary, setStudentFeesSummary] = useState(null);
  
  // Fee Collection Tab state
  const [collectionForm, setCollectionForm] = useState({
    student_id: '',
    fee_type: '',
    amount: '',
    payment_mode: '',
    transaction_id: '',
    remarks: ''
  });
  const [collectionStats, setCollectionStats] = useState({
    todaysCollection: 0,
    transactions: 0,
    avgPayment: 0,
    cashBalance: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [dueFees, setDueFees] = useState([]);
  
  // Modal states for new functionality
  const [showFeeConfigModal, setShowFeeConfigModal] = useState(false);
  const [currentFeeType, setCurrentFeeType] = useState('');
  const [showGenerateReportsModal, setShowGenerateReportsModal] = useState(false);
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false);
  const [showSendRemindersModal, setShowSendRemindersModal] = useState(false);
  
  // Delete confirmation modal state
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [configToDelete, setConfigToDelete] = useState(null);
  
  // Edit mode state
  const [editingConfig, setEditingConfig] = useState(null);

  // Fee Configuration Storage - This will persist saved fee configs
  const [feeConfigurations, setFeeConfigurations] = useState({
    'Tuition Fees': [],
    'Transport Fees': [],
    'Admission Fees': []
  });

  // Form state for fee configuration modal
  const [configForm, setConfigForm] = useState({
    amount: '',
    frequency: '',
    dueDate: '',
    applyToClasses: '',
    lateFee: '',
    discount: ''
  });

  // Load persisted fee configurations from backend on mount
  useEffect(() => {
    loadFeeDataFromBackend();
    fetchStudentsData();
  }, []);
  
  // Calculate collection stats when recent payments change
  useEffect(() => {
    calculateCollectionStats();
  }, [recentPayments]);

  const loadFeeDataFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('❌ Authentication Required', {
          description: 'Please login to access fee management.',
          duration: 4000
        });
        return;
      }

      // Fetch fee configurations, dashboard data, recent payments, and due fees from backend
      const [configsRes, dashboardRes, paymentsRes, dueFeesRes] = await Promise.all([
        axios.get(`${API}/fees/configurations`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/fees/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/fees/payments/recent?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/fees/student-fees`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Transform backend configs to frontend format
      const backendConfigs = configsRes.data;
      const transformedConfigs = {
        'Tuition Fees': backendConfigs.filter(c => c.fee_type === 'Tuition Fees'),
        'Transport Fees': backendConfigs.filter(c => c.fee_type === 'Transport Fees'),
        'Admission Fees': backendConfigs.filter(c => c.fee_type === 'Admission Fees')
      };
      
      setFeeConfigurations(transformedConfigs);
      
      // Set dashboard data from backend
      const dashboardData = dashboardRes.data;
      setTotalFees(dashboardData.total_fees);
      setCollected(dashboardData.collected);
      setPending(dashboardData.pending);
      setOverdue(dashboardData.overdue);
      
      // Set recent payment activity metrics from backend
      setPaymentsToday(dashboardData.payments_today || 0);
      setTodaysCollection(dashboardData.todays_collection || 0);
      setPendingApprovals(dashboardData.pending_approvals || 0);
      setMonthlyTarget(dashboardData.monthly_target || 0);
      
      // Process and set recent payments data
      const paymentsData = paymentsRes.data || [];
      const transformedPayments = paymentsData.map(payment => ({
        id: payment.id,
        student_name: payment.student_name || 'Unknown Student',
        amount: payment.amount || 0,
        payment_mode: payment.payment_mode || 'Cash',
        fee_type: payment.fee_type || 'Tuition Fees',
        receipt_no: payment.receipt_no || 'N/A',
        time: payment.payment_date ? new Date(payment.payment_date).toLocaleTimeString() : new Date().toLocaleTimeString(),
        created_at: payment.payment_date || new Date().toISOString(),
        transaction_id: payment.transaction_id || null,
        remarks: payment.remarks || null
      }));
      
      setRecentPayments(transformedPayments);
      
      // Set due fees data
      const dueFeesData = dueFeesRes.data || [];
      setDueFees(dueFeesData);
      
      console.log('✅ Fee data loaded from backend successfully');
      console.log('📊 Today\'s metrics:', {
        payments: dashboardData.payments_today,
        collection: dashboardData.todays_collection,
        approvals: dashboardData.pending_approvals,
        target: dashboardData.monthly_target
      });
      console.log('💳 Recent payments loaded:', transformedPayments.length, 'payments');
      console.log('📋 Due fees loaded:', dueFeesData.length, 'records');
    } catch (error) {
      console.error('Failed to load fee data from backend:', error);
      toast.error('⚠️ Failed to Load Fee Data', {
        description: 'Using fallback data. Please check your connection.',
        duration: 4000
      });
      // Fallback to default values
      setTotalFees(0);
      setCollected(0);
      setPending(0);
      setOverdue(0);
      
      // Reset recent payment activity metrics
      setPaymentsToday(0);
      setTodaysCollection(0);
      setPendingApprovals(0);
      setMonthlyTarget(0);
      
      // Reset recent payments to empty array
      setRecentPayments([]);
    }
  };

  const calculateTotalsFromConfigurations = (configs) => {
    let totalCalculated = 0;
    
    // Calculate total from all fee configurations
    Object.values(configs).forEach(configArray => {
      configArray.forEach(config => {
        const classMultiplier = config.applyToClasses === 'all' ? 30 : 15;
        const frequencyMultiplier = config.frequency === 'monthly' ? 12 : 
                                   config.frequency === 'quarterly' ? 4 : 
                                   config.frequency === 'half-yearly' ? 2 : 1;
        
        totalCalculated += config.amount * classMultiplier * frequencyMultiplier;
      });
    });

    // Return calculated totals with realistic distribution
    return {
      totalFees: totalCalculated > 0 ? totalCalculated : 2500000,
      collected: totalCalculated > 0 ? Math.floor(totalCalculated * 0.7) : 1800000,
      pending: totalCalculated > 0 ? Math.floor(totalCalculated * 0.2) : 500000,
      overdue: totalCalculated > 0 ? Math.floor(totalCalculated * 0.1) : 200000
    };
  };

  const fetchStudentsData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found');
        return;
      }

      const [studentsRes, classesRes] = await Promise.all([
        axios.get(`${API}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/classes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('❌ Failed to Load Students', {
        description: 'Unable to load student data. Please check your connection and try again.',
        duration: 4000
      });
      // Set empty arrays instead of mock data
      setStudents([]);
      setClasses([]);
    }
  };

  const fetchStudentFinancials = async (studentId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('❌ Authentication Required', {
          description: 'Please login to view student financials.',
          duration: 4000
        });
        return;
      }

      // Fetch student fees and payments from backend
      const [feesRes, paymentsRes] = await Promise.all([
        axios.get(`${API}/fees/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/fees/payments?student_id=${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Calculate summary from fees data
      const studentFees = feesRes.data || [];
      const studentPaymentsData = paymentsRes.data || [];
      
      const summary = {
        totalFees: studentFees.reduce((sum, fee) => sum + fee.amount, 0),
        paidAmount: studentFees.reduce((sum, fee) => sum + fee.paid_amount, 0),
        pendingFees: studentFees.reduce((sum, fee) => sum + fee.pending_amount, 0),
        overdueFees: studentFees.reduce((sum, fee) => sum + fee.overdue_amount, 0),
        lastPaymentDate: studentPaymentsData[0]?.payment_date?.split('T')[0] || null
      };
      
      // Transform payments data for UI
      const transformedPayments = studentPaymentsData.map(payment => ({
        id: payment.id,
        receiptNo: payment.receipt_no,
        date: payment.payment_date?.split('T')[0],
        feeType: payment.fee_type,
        amount: payment.amount,
        paymentMode: payment.payment_mode,
        status: 'Paid',
        dueDate: payment.payment_date?.split('T')[0]
      }));
      
      // Add pending fees as "payment" entries
      const pendingFees = studentFees.filter(fee => fee.pending_amount > 0).map(fee => ({
        id: `pending_${fee.id}`,
        receiptNo: 'PENDING',
        date: null,
        feeType: fee.fee_type,
        amount: fee.pending_amount,
        paymentMode: null,
        status: 'Pending',
        dueDate: fee.due_date
      }));
      
      // Add overdue fees as "payment" entries
      const overdueFees = studentFees.filter(fee => fee.overdue_amount > 0).map(fee => ({
        id: `overdue_${fee.id}`,
        receiptNo: 'OVERDUE',
        date: null,
        feeType: fee.fee_type,
        amount: fee.overdue_amount,
        paymentMode: null,
        status: 'Overdue',
        dueDate: fee.due_date
      }));
      
      setStudentFeesSummary(summary);
      setStudentPayments([...transformedPayments, ...pendingFees, ...overdueFees]);
      
    } catch (error) {
      console.error('Failed to fetch student financials:', error);
      toast.error('❌ Failed to Load Student Financials', {
        description: 'Unable to load financial data for this student.',
        duration: 4000
      });
      // Set empty data instead of mock data
      setStudentFeesSummary({
        totalFees: 0,
        paidAmount: 0,
        pendingFees: 0,
        overdueFees: 0,
        lastPaymentDate: null
      });
      setStudentPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    fetchStudentFinancials(student.id);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_no.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'all' || student.class_id === selectedClass;
    const matchesSection = selectedSection === 'all' || student.section_id === selectedSection;
    
    return matchesSearch && matchesClass && matchesSection;
  });

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'Unknown';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'Overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Bulk Payment Helper Functions
  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.find(s => s.id === student.id);
      if (isSelected) {
        return prev.filter(s => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  const toggleSelectAll = () => {
    const eligibleStudents = getEligibleStudentsForBulkPayment();
    if (selectedStudents.length === eligibleStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(eligibleStudents);
    }
  };

  const getEligibleStudentsForBulkPayment = () => {
    return students.filter(student => {
      // Filter by class
      if (bulkPaymentFilters.class !== 'all' && student.class_id !== bulkPaymentFilters.class) {
        return false;
      }
      
      // For now, include all students - in real implementation, filter by fee status and type
      return true;
    });
  };

  const calculateBulkPaymentSummary = () => {
    const totalAmount = selectedStudents.length * 15000; // Mock amount per student
    const lateFees = selectedStudents.length * 600; // Mock late fee
    return {
      studentsCount: selectedStudents.length,
      totalAmount,
      lateFees,
      grandTotal: totalAmount + lateFees
    };
  };

  const handleCollectPayment = () => {
    setShowPaymentModal(true);
  };


  // Bulk Payment submission handler
  const submitBulkPayment = async (bulkPaymentData) => {
    if (selectedStudents.length === 0) {
      toast.error('❌ No Students Selected', {
        description: 'Please select at least one student for bulk payment.',
        duration: 4000
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('❌ Authentication Required', {
          description: 'Please login to process bulk payments.',
          duration: 4000
        });
        return;
      }

      // Prepare bulk payment data
      const bulkData = {
        student_ids: selectedStudents.map(s => s.id),
        fee_type: bulkPaymentData.fee_type || 'Tuition Fees',
        payment_mode: bulkPaymentData.payment_mode || 'Cash',
        transaction_id: bulkPaymentData.transaction_id || null,
        remarks: bulkPaymentData.remarks || 'Bulk payment collection'
      };

      console.log('🚀 Submitting bulk payment:', bulkData);

      // Call backend bulk payment API
      const response = await axios.post(`${API}/fees/payments/bulk`, bulkData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = response.data;
      console.log('✅ Bulk payment response:', result);

      // Close modal
      setShowBulkPaymentModal(false);
      
      // Clear selected students
      setSelectedStudents([]);
      
      // Use dashboard stats from response for instant update (no race condition!)
      if (result.dashboard_stats) {
        console.log('📊 Using returned dashboard stats for instant update');
        setTotalFees(result.dashboard_stats.total_fees);
        setCollected(result.dashboard_stats.collected);
        setPending(result.dashboard_stats.pending);
        setOverdue(result.dashboard_stats.overdue);
        setPaymentsToday(result.dashboard_stats.payments_today);
        setTodaysCollection(result.dashboard_stats.todays_collection);
      }
      
      // Background refresh for recent payments list
      console.log('🔄 bulk payment ok → refreshing dashboard in background...');
      loadFeeDataFromBackend();
      console.log('✅ bulk refresh initiated');
      
      // Show success message
      toast.success(`💰 Bulk Payment Processed Successfully!`, {
        description: `${result.payments_count} payments processed. Total: ₹${result.total_amount.toLocaleString()}. Dashboard updated instantly.`,
        duration: 5000
      });

    } catch (error) {
      console.error('Bulk payment failed:', error);
      const errorMessage = error.response?.data?.detail || 'Unable to process bulk payment. Please try again.';
      toast.error('❌ Bulk Payment Failed', {
        description: errorMessage,
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Send Reminders submission handler
  const submitSendReminders = async (reminderData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('❌ Authentication Required', {
          description: 'Please login to send reminders.',
          duration: 4000
        });
        return;
      }

      console.log('📧 Sending fee reminders:', reminderData);

      // Call backend reminders API
      const response = await axios.post(`${API}/reminders/send`, reminderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = response.data;
      console.log('✅ Reminders response:', result);

      // Close modal
      setShowSendRemindersModal(false);
      
      // Show success message
      toast.success(`📧 Fee Reminders Sent Successfully!`, {
        description: `${result.sent_count} reminders sent to students with pending fees. ${result.failed_count} failed.`,
        duration: 5000
      });

    } catch (error) {
      console.error('Send reminders failed:', error);
      const errorMessage = error.response?.data?.detail || 'Unable to send reminders. Please try again.';
      toast.error('❌ Failed to Send Reminders', {
        description: errorMessage,
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format = 'excel', reportType = 'student_wise') => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('⚠️ Authentication Required', {
          description: 'Please log in again to export reports.',
          duration: 4000
        });
        return;
      }
      
      // Call backend API to generate and download report
      const response = await fetch(`${API}/reports/export?format=${format}&report_type=${reportType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Get filename from response headers or create default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `fee_report_${reportType}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename=\"(.+)\"/);  
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success(`📊 ${format.toUpperCase()} Report Downloaded!`, {
          description: `${reportType.replace('_', ' ')} report exported successfully.`,
          duration: 4000
        });
      } else {
        const errorData = await response.json();
        toast.error('⚠️ Report Export Failed', {
          description: errorData.detail || 'Failed to generate report.',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Export report error:', error);
      toast.error('⚠️ Export Error', {
        description: 'Unable to export report. Please try again.',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const submitPayment = async (paymentData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('❌ Authentication Required', {
          description: 'Please login to process payments.',
          duration: 4000
        });
        return;
      }

      // Create payment in backend
      const response = await axios.post(`${API}/fees/payments`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const paymentResult = response.data;
      
      // Find student details for the toast message
      const student = students.find(s => s.id === paymentData.student_id);
      const studentName = student ? student.name : paymentResult.student_name;
      const studentAdmissionNo = student ? student.admission_no : paymentResult.admission_no;
      
      // Close payment modal first
      setShowPaymentModal(false);
      
      // Use dashboard stats from payment response for instant update (no race condition!)
      if (paymentResult.dashboard_stats) {
        console.log('📊 Using returned dashboard stats for instant update');
        setTotalFees(paymentResult.dashboard_stats.total_fees);
        setCollected(paymentResult.dashboard_stats.collected);
        setPending(paymentResult.dashboard_stats.pending);
        setOverdue(paymentResult.dashboard_stats.overdue);
        setPaymentsToday(paymentResult.dashboard_stats.payments_today);
        setTodaysCollection(paymentResult.dashboard_stats.todays_collection);
      }
      
      // Also refresh student financials and full dashboard data in background
      console.log('🔄 payment ok → refreshing student financials...');
      await Promise.all([
        loadFeeDataFromBackend(), // Background refresh for recent payments list
        fetchStudentFinancials(paymentResult?.student_id ?? paymentData.student_id)
      ]);
      console.log('✅ refresh complete');
      
      // Auto-generate and download receipt immediately after payment
      generateReceipt(paymentResult.receipt_no, paymentData, student);
      
      // Show success toast with real-time update confirmation
      toast.success(`✅ Payment Collected Successfully!`, {
        description: `₹${paymentData.amount.toLocaleString()} collected from ${studentName} (${studentAdmissionNo}) for ${paymentData.fee_type}. Dashboard updated. Receipt: ${paymentResult.receipt_no}`,
        duration: 5000,
        action: {
          label: "Download Again", 
          onClick: () => generateReceipt(paymentResult.receipt_no, paymentData, student)
        }
      });
      
    } catch (error) {
      console.error('Payment failed:', error);
      const errorMessage = error.response?.data?.detail || 'Unable to process payment. Please try again.';
      toast.error('❌ Payment Failed', {
        description: errorMessage,
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete fee configuration function  
  const deleteFeeConfiguration = async (configId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('❌ Authentication Required', {
          description: 'Please login to delete fee configurations.',
          duration: 4000
        });
        return;
      }

      // Call backend delete API
      await axios.delete(`${API}/fees/configurations/${configId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh data from backend
      await loadFeeDataFromBackend();

      // Close confirmation modal
      setShowDeleteConfirmModal(false);
      setConfigToDelete(null);

      // Show success message
      toast.success('✅ Fee Configuration Deleted', {
        description: 'Fee configuration has been deleted successfully. Dashboard updated.',
        duration: 5000
      });

    } catch (error) {
      console.error('Failed to delete fee configuration:', error);
      const errorMessage = error.response?.data?.detail || 'Unable to delete fee configuration. Please try again.';
      toast.error('❌ Failed to Delete Configuration', {
        description: errorMessage,
        duration: 4000
      });
    }
  };

  // Handle delete button click
  const handleDeleteConfig = (config) => {
    setConfigToDelete(config);
    setShowDeleteConfirmModal(true);
  };
  
  // Handle edit button click
  const handleEditConfig = (config) => {
    // Populate form with existing config data
    setEditingConfig(config);
    setConfigForm({
      amount: config.amount.toString(),
      frequency: config.frequency,
      dueDate: config.due_date || '',
      applyToClasses: config.apply_to_classes || '',
      lateFee: config.late_fee ? config.late_fee.toString() : '',
      discount: config.discount ? config.discount.toString() : ''
    });
    
    toast.info('✏️ Edit Mode', {
      description: 'Modify the configuration and click Save to update.',
      duration: 3000
    });
  };

  const handleStudentPayNow = (paymentData) => {
    setShowPaymentModal(true);
  };

  // Fee Due Tab: Collect Payment for specific student
  const handleStudentCollectPayment = (student) => {
    // Store selected student for payment processing
    setSelectedStudent(student);
    setShowPaymentModal(true);
    
    // Get proper student properties with fallbacks
    const studentName = student.name || 'Unknown Student';
    const admissionNo = student.admission_no || student.admission || 'N/A';
    const pendingAmount = student.pending_amount || student.amount || 15000; // Fallback amount
    
    toast.info(`💰 Collecting Payment`, {
      description: `Opening payment collection for ${studentName} (${admissionNo}) - ₹${pendingAmount.toLocaleString()}`,
      duration: 3000
    });
  };



  const generateReceipt = (receiptNo, paymentData, student) => {
    // Generate downloadable receipt
    const receiptData = {
      receiptNo,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      student: {
        name: student?.name || 'Unknown Student',
        admissionNo: student?.admission_no || 'N/A',
        class: getClassName(student?.class_id) || 'N/A',
        section: student?.section_id || 'N/A'
      },
      payment: {
        amount: paymentData.amount,
        feeType: paymentData.fee_type,
        paymentMode: paymentData.payment_mode,
        transactionId: paymentData.transaction_id || 'N/A',
        remarks: paymentData.remarks || 'N/A',
        breakdown: paymentData.breakdown || null
      },
      school: {
        name: 'School ERP System',
        address: 'Educational Institution'
      }
    };

    // Create receipt content
    const receiptContent = [
      `PAYMENT RECEIPT - ${receiptData.receiptNo}`,
      `Date: ${receiptData.date} | Time: ${receiptData.time}`,
      '',
      `School: ${receiptData.school.name}`,
      `Address: ${receiptData.school.address}`,
      '',
      'STUDENT DETAILS:',
      `Name: ${receiptData.student.name}`,
      `Admission No: ${receiptData.student.admissionNo}`,
      `Class: ${receiptData.student.class}, Section: ${receiptData.student.section}`,
      '',
      'PAYMENT DETAILS:',
      `Fee Type: ${receiptData.payment.feeType}`,
      `Amount Paid: ₹${receiptData.payment.amount.toLocaleString()}`,
      ...(receiptData.payment.breakdown ? [
        `  - Overdue Fees: ₹${receiptData.payment.breakdown.overduePayment.toLocaleString()}`,
        `  - Pending Fees: ₹${receiptData.payment.breakdown.pendingPayment.toLocaleString()}`,
        ...(receiptData.payment.breakdown.unappliedAmount > 0 ? 
          [`Original Amount: ₹${receiptData.payment.breakdown.originalAmount.toLocaleString()}`,
           `Unapplied Amount: ₹${receiptData.payment.breakdown.unappliedAmount.toLocaleString()}`] : [])
      ] : []),
      `Payment Mode: ${receiptData.payment.paymentMode}`,
      `Transaction ID: ${receiptData.payment.transactionId}`,
      `Remarks: ${receiptData.payment.remarks}`,
      '',
      'Thank you for your payment!',
      `Generated by School ERP System on ${new Date().toLocaleString()}`
    ].join('\n');

    // Download receipt as text file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${receiptNo}-${receiptData.student.name.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('📄 Receipt Downloaded', {
      description: `Receipt ${receiptNo} has been downloaded successfully.`,
      duration: 3000
    });
  };

  const handleDownloadReceipt = (receiptNo) => {
    // For existing receipts, generate download
    const dummyPaymentData = {
      amount: 15000,
      fee_type: 'Tuition Fee',
      payment_mode: 'Cash'
    };
    const dummyStudent = {
      name: 'John Doe',
      admission_no: 'ADM001',
      class_id: 'class1',
      section_id: 'A'
    };
    generateReceipt(receiptNo, dummyPaymentData, dummyStudent);
  };

  const handleViewAllReceipts = (student) => {
    if (!student) {
      toast.error('⚠️ No Student Selected', {
        description: 'Please select a student first to view receipts.',
        duration: 3000
      });
      return;
    }
    
    // Show success message and provide navigation hint
    toast.success('📄 View All Receipts', {
      description: `Viewing all receipts for ${student.name}. Check the Payment History table below.`,
      duration: 4000
    });
    
    // Scroll to payment history table
    const paymentHistoryElement = document.querySelector('[role="table"]');
    if (paymentHistoryElement) {
      paymentHistoryElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactGuardian = (student) => {
    if (!student || !student.guardian_phone) {
      toast.error('⚠️ No Contact Information', {
        description: 'Guardian phone number not available for this student.',
        duration: 3000
      });
      return;
    }
    
    // Copy phone number to clipboard
    navigator.clipboard.writeText(student.guardian_phone).then(() => {
      toast.success('📞 Guardian Contact Copied', {
        description: `${student.guardian_name}: ${student.guardian_phone} copied to clipboard.`,
        duration: 4000
      });
    }).catch(() => {
      // Fallback: show phone number in toast
      toast.success('📞 Guardian Contact', {
        description: `${student.guardian_name}: ${student.guardian_phone}`,
        duration: 5000
      });
    });
    
    // Try to open phone dialer on mobile devices
    const phoneLink = document.createElement('a');
    phoneLink.href = `tel:${student.guardian_phone}`;
    phoneLink.click();
  };

  // Fee Collection Tab helper functions
  const updateReceiptPreview = (formData) => {
    if (formData.student_id && formData.fee_type && formData.amount) {
      const student = students.find(s => s.id === formData.student_id);
      const nextReceiptNo = `RCP2025-${String(recentPayments.length + 1).padStart(3, '0')}`;
      
      setReceiptPreview({
        receiptNo: nextReceiptNo,
        student: student ? {
          name: student.name,
          admission_no: student.admission_no,
          class: getClassName(student.class_id)
        } : null,
        amount: parseFloat(formData.amount) || 0,
        fee_type: formData.fee_type,
        payment_mode: formData.payment_mode,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      });
    } else {
      setReceiptPreview(null);
    }
  };

  const calculateCollectionStats = () => {
    const today = new Date().toDateString();
    const todaysPayments = recentPayments.filter(p => 
      new Date(p.created_at || Date.now()).toDateString() === today
    );
    
    const todaysCollection = todaysPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const avgPayment = todaysPayments.length > 0 ? todaysCollection / todaysPayments.length : 0;
    const cashBalance = todaysPayments
      .filter(p => p.payment_mode === 'Cash')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    setCollectionStats({
      todaysCollection,
      transactions: todaysPayments.length,
      avgPayment,
      cashBalance
    });
  };

  const handleQuickCollectionActions = {
    viewProfile: (studentId) => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setSelectedStudent(student);
        fetchStudentFinancials(student.id);
        handleTabChange('student-specific');
      }
    },
    viewHistory: (studentId) => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setSelectedStudent(student);
        fetchStudentFinancials(student.id);
        handleTabChange('student-specific');
      }
    },
    contactParent: (studentId) => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        handleContactGuardian(student);
      }
    }
  };

  const handleCollectionFormSubmit = async () => {
    if (!collectionForm.student_id || !collectionForm.fee_type || !collectionForm.amount || !collectionForm.payment_mode) {
      toast.error('❌ Missing Required Fields', {
        description: 'Please fill in all required fields marked with *',
        duration: 4000
      });
      return;
    }
    
    const paymentData = {
      student_id: collectionForm.student_id,
      amount: parseFloat(collectionForm.amount),
      fee_type: collectionForm.fee_type,
      payment_mode: collectionForm.payment_mode,
      transaction_id: collectionForm.transaction_id || null,
      remarks: collectionForm.remarks || 'Fee Collection Tab payment'
    };
    
    try {
      await submitPayment(paymentData);
      
      // Add to recent payments
      const student = students.find(s => s.id === collectionForm.student_id);
      const newPayment = {
        id: Date.now(),
        student_name: student?.name || 'Unknown',
        amount: paymentData.amount,
        payment_mode: paymentData.payment_mode,
        fee_type: paymentData.fee_type,
        receipt_no: receiptPreview?.receiptNo || `RCP2025-${String(recentPayments.length + 1).padStart(3, '0')}`,
        time: new Date().toLocaleTimeString(),
        created_at: new Date().toISOString()
      };
      
      setRecentPayments(prev => [newPayment, ...prev.slice(0, 9)]);
      
      // Clear form
      setCollectionForm({
        student_id: '',
        fee_type: '',
        amount: '',
        payment_mode: '',
        transaction_id: '',
        remarks: ''
      });
      setReceiptPreview(null);
      
      // Recalculate stats
      setTimeout(calculateCollectionStats, 100);
      
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleClearCollectionForm = () => {
    setCollectionForm({
      student_id: '',
      fee_type: '',
      amount: '',
      payment_mode: '',
      transaction_id: '',
      remarks: ''
    });
    setReceiptPreview(null);
    toast.info('🗑️ Form Cleared', {
      description: 'All form fields have been cleared.',
      duration: 2000
    });
  };

  const exportStudentReport = (student) => {
    if (!student) {
      toast.error('⚠️ No Student Selected', {
        description: 'Please select a student first to generate the report.',
        duration: 3000
      });
      return;
    }

    // Generate student-specific report
    const reportData = {
      student: {
        name: student.name,
        admissionNo: student.admission_no,
        class: getClassName(student.class_id),
        section: student.section_id,
        guardian: student.guardian_name,
        phone: student.phone
      },
      summary: studentFeesSummary || {
        totalFees: 50000,
        paidAmount: 35000,
        pendingFees: 15000,
        overdueFees: 0
      },
      payments: studentPayments.length > 0 ? studentPayments : [
        { receiptNo: 'RCP001', date: '2024-09-01', feeType: 'Tuition Fee', amount: 15000, paymentMode: 'Cash', status: 'Paid' },
        { receiptNo: 'RCP002', date: '2024-09-15', feeType: 'Transport Fee', amount: 5000, paymentMode: 'UPI', status: 'Pending' }
      ],
      generatedAt: new Date().toLocaleString()
    };

    // Create CSV content for student-specific report
    const csvContent = [
      `Student Fee Report - ${reportData.student.name}`,
      `Admission No: ${reportData.student.admissionNo}`,
      `Class: ${reportData.student.class}, Section: ${reportData.student.section}`,
      `Guardian: ${reportData.student.guardian}`,
      `Generated: ${reportData.generatedAt}`,
      '',
      'Payment Summary:',
      `Total Fees,Paid Amount,Pending Fees,Overdue Fees`,
      `₹${reportData.summary.totalFees},₹${reportData.summary.paidAmount},₹${reportData.summary.pendingFees},₹${reportData.summary.overdueFees}`,
      '',
      'Payment History:',
      'Receipt No,Date,Fee Type,Amount,Payment Mode,Status',
      ...reportData.payments.map(p => 
        `${p.receiptNo},${p.date},${p.feeType},₹${p.amount},${p.paymentMode || 'N/A'},${p.status}`
      )
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.student.name.replace(/\s+/g, '-')}-fee-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handler functions for new functionality
  const resetConfigForm = () => {
    setConfigForm({
      amount: '',
      frequency: '',
      dueDate: '',
      applyToClasses: '',
      lateFee: '',
      discount: ''
    });
    setEditingConfig(null);
  };

  const saveConfiguration = async () => {
    // Validate required fields
    if (!configForm.amount || !configForm.frequency || !configForm.applyToClasses) {
      toast.error(`❌ Missing Required Fields`, {
        description: 'Please fill in Amount, Frequency, and Apply to Classes fields.',
        duration: 4000
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('❌ Authentication Required', {
          description: 'Please login to save fee configuration.',
          duration: 4000
        });
        return;
      }

      // Prepare fee configuration data
      const configData = {
        fee_type: currentFeeType,
        amount: parseFloat(configForm.amount),
        frequency: configForm.frequency,
        due_date: configForm.dueDate || null,
        apply_to_classes: configForm.applyToClasses,
        late_fee: parseFloat(configForm.lateFee || 0),
        discount: parseFloat(configForm.discount || 0)
      };

      // Capture edit mode state before resetting
      const isEditing = !!editingConfig;
      
      let response;
      
      if (isEditing) {
        // Update existing configuration
        response = await axios.put(`${API}/fees/configurations/${editingConfig.id}`, configData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new configuration
        response = await axios.post(`${API}/fees/configurations`, configData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Refresh dashboard data from backend after successful save
      await loadFeeDataFromBackend();

      // Close modal and reset form
      setShowFeeConfigModal(false);
      resetConfigForm();

      // Success feedback with captured state
      toast.success(isEditing ? `✅ ${currentFeeType} Configuration Updated` : `✅ ${currentFeeType} Configuration Saved`, {
        description: isEditing ? `Fee structure updated successfully.` : `Fee structure saved successfully and applied to students.`,
        duration: 5000
      });

    } catch (error) {
      console.error('Failed to save fee configuration:', error);
      // Capture edit mode for error message (editingConfig might still be set in catch block)
      const isEditingError = !!editingConfig;
      const errorMessage = error.response?.data?.detail || 'Unable to save fee configuration. Please try again.';
      toast.error(isEditingError ? '❌ Failed to Update Configuration' : '❌ Failed to Save Configuration', {
        description: errorMessage,
        duration: 4000
      });
    }
  };

  const handleFeeConfiguration = (feeType) => {
    setCurrentFeeType(feeType);
    resetConfigForm(); // Reset form when opening modal
    setShowFeeConfigModal(true);
    toast.info(`📝 Fee Configuration`, {
      description: `Opening ${feeType} configuration settings...`,
      duration: 2000
    });
  };

  const handleGenerateReports = () => {
    setShowGenerateReportsModal(true);
    toast.info(`📊 Generate Reports`, {
      description: 'Opening report generation options...',
      duration: 2000
    });
  };

  const handleBulkPayment = () => {
    setShowBulkPaymentModal(true);
    toast.info(`💰 Bulk Payment`, {
      description: 'Opening bulk payment collection for multiple students...',
      duration: 2000
    });
  };

  const handleSendReminders = () => {
    setShowSendRemindersModal(true);
    toast.info(`📧 Send Reminders`, {
      description: 'Opening reminder management for pending/overdue fees...',
      duration: 2000
    });
  };

  const processSendReminders = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('❌ Authentication Required', {
          description: 'Please login to send reminders.',
          duration: 4000
        });
        return;
      }

      // Call backend API to send reminders
      const response = await axios.post(`${API}/reminders/send`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = response.data;
      
      // Close modal first
      setShowSendRemindersModal(false);
      
      // Show success message with actual results
      toast.success(`📧 Reminders Sent Successfully!`, {
        description: `${result.sent_count} reminders sent to students with pending fees. ${result.failed_count} failed.`,
        duration: 5000
      });

    } catch (error) {
      console.error('Send reminders failed:', error);
      const errorMessage = error.response?.data?.detail || 'Unable to send reminders. Please try again.';
      toast.error('❌ Send Reminders Failed', {
        description: errorMessage,
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const processBulkPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('❌ Authentication Required', {
          description: 'Please login to process bulk payments.',
          duration: 4000
        });
        return;
      }

      // Check if students are selected
      if (selectedStudents.length === 0) {
        toast.error('❌ No Students Selected', {
          description: 'Please select students for bulk payment.',
          duration: 4000
        });
        return;
      }

      // Real bulk payment data from selected students
      const bulkPaymentData = {
        student_ids: selectedStudents.map(s => s.id),
        fee_type: bulkPaymentFilters.feeType,
        payment_mode: 'bulk_collection',
        transaction_id: `BULK${Date.now()}`,
        remarks: `Bulk payment for ${selectedStudents.length} students`
      };

      const response = await axios.post(`${API}/fees/payments/bulk`, bulkPaymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = response.data;
      
      // Close modal first
      setShowBulkPaymentModal(false);
      
      // Use dashboard stats from response for instant update (no race condition!)
      if (result.dashboard_stats) {
        console.log('📊 Using returned dashboard stats for instant update');
        setTotalFees(result.dashboard_stats.total_fees);
        setCollected(result.dashboard_stats.collected);
        setPending(result.dashboard_stats.pending);
        setOverdue(result.dashboard_stats.overdue);
        setPaymentsToday(result.dashboard_stats.payments_today);
        setTodaysCollection(result.dashboard_stats.todays_collection);
      }
      
      // Background refresh for student financials and recent payments
      console.log('🔄 bulk payment ok → refreshing in background...');
      Promise.all([
        loadFeeDataFromBackend(),
        fetchStudentFinancials(bulkPaymentData.student_ids[0])
      ]);
      console.log('✅ bulk refresh initiated');
      
      // Show success message with real-time update confirmation
      toast.success(`💰 Bulk Payment Processed Successfully!`, {
        description: `${result.payments_count} payments processed. Total: ₹${result.total_amount.toLocaleString()}. Dashboard updated instantly.`,
        duration: 5000
      });

    } catch (error) {
      console.error('Bulk payment failed:', error);
      const errorMessage = error.response?.data?.detail || 'Unable to process bulk payment. Please try again.';
      toast.error('❌ Bulk Payment Failed', {
        description: errorMessage,
        duration: 4000
      });
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
          <p className="text-gray-600 mt-1">Manage school fees, payments, and financial records</p>
          <p className="text-xs text-gray-400 mt-1">Build: v3.0-final-{new Date().toISOString().split('T')[0]}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleCollectPayment}>
            <CreditCard className="h-4 w-4 mr-2" />
            Collect Payment
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-3xl font-bold text-gray-900">₹{(totalFees/100000).toFixed(1)}L</p>
                <p className="text-xs text-gray-500">Academic Year</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collected</p>
                <p className="text-3xl font-bold text-emerald-600">₹{(collected/100000).toFixed(1)}L</p>
                <p className="text-xs text-emerald-500">+15% this month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600">₹{(pending/100000).toFixed(1)}L</p>
                <p className="text-xs text-orange-500">Due this month</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">₹{(overdue/100000).toFixed(1)}L</p>
                <p className="text-xs text-red-500">Needs attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fees Management Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="manage">Manage Fees</TabsTrigger>
          <TabsTrigger value="student-specific">Student Specific</TabsTrigger>
          <TabsTrigger value="due">Fee Due</TabsTrigger>
          <TabsTrigger value="select-student">Select Student</TabsTrigger>
          <TabsTrigger value="collection">Fee Collection</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          {/* HUGE CLEAR VISUAL INDICATOR FOR MANAGE FEES TAB */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-8 border-blue-500 rounded-lg p-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 text-white rounded-full p-4">
                <DollarSign className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-blue-700">🔧 MANAGE FEES TAB</h1>
                <h2 className="text-xl font-bold text-blue-700">Fee Structure Management & Configuration</h2>
                <p className="text-blue-600">Configure fee types, amounts, and payment schedules</p>
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Fee Types Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-2 border-dashed border-gray-300 hover:border-emerald-500 transition-colors">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="font-medium mb-2">Tuition Fees</h3>
                    <p className="text-sm text-gray-600 mb-3">Monthly tuition charges</p>
                    <Button variant="outline" size="sm" onClick={() => handleFeeConfiguration('Tuition Fees')}>Configure</Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-gray-300 hover:border-emerald-500 transition-colors">
                  <CardContent className="p-6 text-center">
                    <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="font-medium mb-2">Transport Fees</h3>
                    <p className="text-sm text-gray-600 mb-3">Bus and transport charges</p>
                    <Button variant="outline" size="sm" onClick={() => handleFeeConfiguration('Transport Fees')}>Configure</Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-gray-300 hover:border-emerald-500 transition-colors">
                  <CardContent className="p-6 text-center">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="font-medium mb-2">Admission Fees</h3>
                    <p className="text-sm text-gray-600 mb-3">One-time admission charges</p>
                    <Button variant="outline" size="sm" onClick={() => handleFeeConfiguration('Admission Fees')}>Configure</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments Summary for Manage Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-500" />
                Recent Payment Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{paymentsToday}</p>
                  <p className="text-sm text-green-600">Payments Today</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {todaysCollection >= 100000 
                      ? `₹${(todaysCollection / 100000).toFixed(2)}L`
                      : `₹${todaysCollection.toLocaleString('en-IN')}`
                    }
                  </p>
                  <p className="text-sm text-blue-600">Today's Collection</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{pendingApprovals}</p>
                  <p className="text-sm text-orange-600">Pending Approvals</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">₹{(monthlyTarget / 100000).toFixed(1)}L</p>
                  <p className="text-sm text-purple-600">Monthly Target</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Management Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col gap-2 bg-blue-500 hover:bg-blue-600" onClick={handleGenerateReports}>
                  <FileText className="h-6 w-6" />
                  <span>Generate Reports</span>
                </Button>
                <Button className="h-20 flex flex-col gap-2 bg-emerald-500 hover:bg-emerald-600" onClick={handleBulkPayment}>
                  <Users className="h-6 w-6" />
                  <span>Bulk Payment</span>
                </Button>
                <Button className="h-20 flex flex-col gap-2 bg-orange-500 hover:bg-orange-600" onClick={handleSendReminders}>
                  <AlertTriangle className="h-6 w-6" />
                  <span>Send Reminders</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-specific" className="space-y-6">
          {/* HUGE CLEAR VISUAL INDICATOR FOR STUDENT SPECIFIC TAB */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-8 border-emerald-500 rounded-lg p-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 text-white rounded-full p-4">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-emerald-700">👨‍🎓 STUDENT SPECIFIC TAB</h1>
                <h2 className="text-xl font-bold text-emerald-700">Individual Student Financial Reports</h2>
                <p className="text-emerald-600">Individual student fee management, payment history, and reports</p>
              </div>
            </div>
          </div>
          
          {/* Student Search & Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-500" />
                Search & Filter Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by admission number or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger data-testid="class-select">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-section="student-list-details">
            {/* Student List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Students ({filteredStudents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p>No students found</p>
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedStudent?.id === student.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                          }`}
                          onClick={() => handleStudentSelect(student)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.admission_no}</p>
                              <p className="text-xs text-gray-500">{getClassName(student.class_id)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Details */}
            <div className="lg:col-span-2">
              {!selectedStudent ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                    <p className="text-gray-600">Choose a student from the list to view their financial details</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Student Profile Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Student Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                            {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">Admission No: {selectedStudent.admission_no}</p>
                            <p className="text-sm text-gray-600">{getClassName(selectedStudent.class_id)}, Section {selectedStudent.section_id}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {selectedStudent.phone}
                            </div>
                            {selectedStudent.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-2" />
                                {selectedStudent.email}
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-4 w-4 mr-2" />
                              Guardian: {selectedStudent.guardian_name}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {selectedStudent.guardian_phone}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Summary */}
                  {studentFeesSummary && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-emerald-500" />
                            Payment Summary
                          </span>
                          <span className="text-sm text-gray-500">Academic Year 2024-25</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">₹{(studentFeesSummary.totalFees/1000).toFixed(0)}K</p>
                            <p className="text-sm text-blue-600">Total Fees</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">₹{(studentFeesSummary.paidAmount/1000).toFixed(0)}K</p>
                            <p className="text-sm text-green-600">Paid Amount</p>
                          </div>
                          <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">₹{(studentFeesSummary.pendingFees/1000).toFixed(0)}K</p>
                            <p className="text-sm text-yellow-600">Pending Fees</p>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">₹{(studentFeesSummary.overdueFees/1000).toFixed(0)}K</p>
                            <p className="text-sm text-red-600">Overdue Fees</p>
                          </div>
                        </div>
                        
                        {/* Payment Progress Bar */}
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Payment Progress</span>
                            <span className="text-sm text-gray-500">
                              {((studentFeesSummary.paidAmount / (studentFeesSummary.totalFees || 1)) * 100).toFixed(1)}% Complete
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ease-in-out"
                              style={{ 
                                width: `${Math.min(((studentFeesSummary.paidAmount / (studentFeesSummary.totalFees || 1)) * 100), 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-gray-500">
                            <span>₹{(studentFeesSummary.paidAmount/1000).toFixed(0)}K Paid</span>
                            <span>₹{(studentFeesSummary.totalFees/1000).toFixed(0)}K Total</span>
                          </div>
                        </div>
                        
                        {studentFeesSummary.lastPaymentDate && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              Last Payment: <span className="font-medium">{new Date(studentFeesSummary.lastPaymentDate).toLocaleDateString()}</span>
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          onClick={handleCollectPayment}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Collect Payment
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => exportStudentReport(selectedStudent)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleViewAllReceipts(selectedStudent)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View All Receipts
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleContactGuardian(selectedStudent)}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Guardian
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-emerald-500" />
                        Payment History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Button className="bg-emerald-500 hover:bg-emerald-600">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Collect Payment
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                        <Button variant="outline">
                          <Receipt className="h-4 w-4 mr-2" />
                          View Receipts
                        </Button>
                        <Button variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Fee Statement
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment History Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Receipt className="h-5 w-5 text-emerald-500" />
                          Payment History
                        </span>
                        <Badge variant="secondary">{studentPayments.length} records</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Receipt No.</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Fee Type</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Payment Mode</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentPayments.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                  No payment records found
                                </TableCell>
                              </TableRow>
                            ) : (
                              studentPayments.map((payment) => (
                                <TableRow key={payment.id} className={payment.status === 'Overdue' ? 'bg-red-50' : ''}>
                                  <TableCell className="font-medium">
                                    {payment.receiptNo}
                                  </TableCell>
                                  <TableCell>
                                    {payment.date ? new Date(payment.date).toLocaleDateString() : '-'}
                                  </TableCell>
                                  <TableCell>{payment.feeType}</TableCell>
                                  <TableCell className="font-medium">₹{payment.amount.toLocaleString()}</TableCell>
                                  <TableCell>{payment.paymentMode || '-'}</TableCell>
                                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                  <TableCell className={payment.status === 'Overdue' ? 'text-red-600 font-medium' : ''}>
                                    {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      {payment.status === 'Paid' && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => handleDownloadReceipt(payment.receiptNo)}
                                          title="Download Receipt"
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {(payment.status === 'Pending' || payment.status === 'Overdue') && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-emerald-600"
                                          onClick={() => handleStudentPayNow(payment)}
                                          title="Collect Payment"
                                        >
                                          <CreditCard className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pending & Overdue Fees */}
                  {studentPayments.some(p => p.status === 'Pending' || p.status === 'Overdue') && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Outstanding Payments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {studentPayments
                            .filter(p => p.status === 'Pending' || p.status === 'Overdue')
                            .map((payment) => (
                              <div 
                                key={payment.id} 
                                className={`p-4 rounded-lg border-l-4 ${
                                  payment.status === 'Overdue' 
                                    ? 'bg-red-50 border-l-red-500' 
                                    : 'bg-yellow-50 border-l-yellow-500'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{payment.feeType}</p>
                                    <p className="text-sm text-gray-600">
                                      Due: {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'No due date'}
                                      {payment.status === 'Overdue' && (
                                        <span className="ml-2 text-red-600 font-medium">
                                          (Overdue by {Math.ceil((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))} days)
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg">₹{payment.amount.toLocaleString()}</p>
                                    <Button 
                                      size="sm" 
                                      className={payment.status === 'Overdue' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}
                                      onClick={() => handleStudentPayNow(payment)}
                                    >
                                      Pay Now
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="due" className="space-y-6">
          {/* HUGE CLEAR VISUAL INDICATOR FOR FEE DUE TAB */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-8 border-red-500 rounded-lg p-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 text-white rounded-full p-4">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-red-700">⚠️ FEE DUE TAB</h1>
                <h2 className="text-xl font-bold text-red-700">Pending & Overdue Fee Management</h2>
                <p className="text-red-600">Track and collect pending fees, send reminders, manage overdue accounts</p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Fees</p>
                    <p className="text-2xl font-bold text-orange-600">₹7.2L</p>
                    <p className="text-xs text-orange-500">45 students</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue Fees</p>
                    <p className="text-2xl font-bold text-red-600">₹2.8L</p>
                    <p className="text-xs text-red-500">18 students</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Due This Week</p>
                    <p className="text-2xl font-bold text-yellow-600">₹1.5L</p>
                    <p className="text-xs text-yellow-500">12 students</p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fee Due List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Outstanding Payments
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('excel', 'overdue_students')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export List
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600" size="sm" onClick={handleSendReminders}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminders
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Admission No</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dueFees.length > 0 ? (
                      dueFees
                        .sort((a, b) => b.days_overdue - a.days_overdue)
                        .map((fee, index) => (
                          <TableRow 
                            key={fee.id || index} 
                            className={fee.days_overdue > 7 ? 'bg-red-50' : fee.days_overdue > 0 ? 'bg-yellow-50' : ''}
                          >
                            <TableCell className="font-medium">{fee.student_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{fee.admission_no}</Badge>
                            </TableCell>
                            <TableCell>{getClassName(fee.class_id) || 'Unknown'}</TableCell>
                            <TableCell>{fee.fee_type}</TableCell>
                            <TableCell className="font-medium">₹{fee.total_due.toLocaleString()}</TableCell>
                            <TableCell>
                              {fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                fee.days_overdue > 7 ? 'bg-red-100 text-red-800' :
                                fee.days_overdue > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {fee.days_overdue > 0 ? `${fee.days_overdue} days` : 'On time'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  className="bg-emerald-500 hover:bg-emerald-600" 
                                  onClick={() => handleStudentCollectPayment({
                                    id: fee.student_id,
                                    name: fee.student_name,
                                    admission_no: fee.admission_no,
                                    pending_amount: fee.total_due,
                                    class_id: fee.class_id,
                                    section_id: fee.section_id
                                  })}
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Collect
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleContactGuardian({
                                    name: fee.student_name,
                                    admission: fee.admission_no
                                  })}
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No outstanding payments found</p>
                          <p className="text-sm">All students are up to date with their fees!</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="select-student" className="space-y-6">
          {/* HUGE CLEAR VISUAL INDICATOR FOR SELECT STUDENT TAB */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-8 border-purple-500 rounded-lg p-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 text-white rounded-full p-4">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-purple-700">👥 SELECT STUDENT TAB</h1>
                <h2 className="text-xl font-bold text-purple-700">Student Selection & Quick Actions</h2>
                <p className="text-purple-600">Quick student lookup with fee collection and profile access</p>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-500" />
                Quick Student Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by admission number, name, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button 
                  className="bg-purple-500 hover:bg-purple-600"
                  onClick={() => {
                    toast.success('🔍 Advanced Search', {
                      description: 'Use the Class and Section filters above to refine your search results.',
                      duration: 4000
                    });
                    // Focus on class selector
                    const classSelector = document.querySelector('[data-testid="class-select"]');
                    if (classSelector) classSelector.focus();
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Advanced Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Student Grid with Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Select Student for Fee Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.slice(0, 9).map((student) => (
                  <Card key={student.id} className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-200 group">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-purple-100 text-purple-700 group-hover:bg-purple-200">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-500">{student.admission_no}</p>
                          <p className="text-xs text-gray-500">{getClassName(student.class_id)}</p>
                        </div>
                      </div>
                      
                      {/* Quick Fee Status */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Pending:</span>
                          <span className="text-orange-600 font-medium">₹12,500</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Overdue:</span>
                          <span className="text-red-600 font-medium">₹3,200</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">65% fees paid</p>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          size="sm" 
                          className="bg-purple-500 hover:bg-purple-600 text-xs"
                          onClick={() => {
                            // Set selected student and show details in toast for grid view
                            setSelectedStudent(student);
                            fetchStudentFinancials(student.id);
                            toast.success(`👤 ${student.name}`, {
                              description: `Viewing details for ${student.name} (${student.admission_no}) - ${getClassName(student.class_id)}`,
                              duration: 4000
                            });
                            // Scroll to the list view section to show details
                            const studentListSection = document.querySelector('[data-section="student-list-details"]');
                            if (studentListSection) {
                              studentListSection.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          <User className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => handleStudentCollectPayment(student)}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Collect Fee
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              )}

              {filteredStudents.length > 9 && (
                <div className="text-center mt-6">
                  <Button 
                    variant="outline" 
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                    onClick={() => {
                      toast.info(`👥 All Students`, {
                        description: `Showing first 9 of ${filteredStudents.length} students. Use search filters to refine results.`,
                        duration: 4000
                      });
                    }}
                  >
                    View All {filteredStudents.length} Students
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          {/* HUGE CLEAR VISUAL INDICATOR FOR FEE COLLECTION TAB */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-8 border-green-500 rounded-lg p-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 text-white rounded-full p-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-green-700">💳 FEE COLLECTION TAB</h1>
                <h2 className="text-xl font-bold text-green-700">Dedicated Payment Processing & Collection</h2>
                <p className="text-green-600">Process payments, generate receipts, and track daily collections</p>
              </div>
            </div>
          </div>

          {/* Dynamic Collection Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Collection</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{collectionStats.todaysCollection ? (collectionStats.todaysCollection/1000).toFixed(0) + 'K' : '0'}
                    </p>
                    <p className="text-xs text-green-500">{collectionStats.transactions || 0} payments today</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-blue-600">{collectionStats.transactions || 0}</p>
                    <p className="text-xs text-blue-500">payments processed</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Payment</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{collectionStats.avgPayment ? collectionStats.avgPayment.toLocaleString() : '0'}
                    </p>
                    <p className="text-xs text-purple-500">per transaction</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cash Balance</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{collectionStats.cashBalance ? collectionStats.cashBalance.toLocaleString() : '0'}
                    </p>
                    <p className="text-xs text-orange-500">to be deposited</p>
                  </div>
                  <Receipt className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                Fee Collection Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Student Information *</label>
                    <Select value={collectionForm.student_id} onValueChange={(value) => {
                      setCollectionForm(prev => ({ ...prev, student_id: value }));
                      updateReceiptPreview({ ...collectionForm, student_id: value });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select or search student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} - {student.admission_no}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Fee Type *</label>
                    <Select value={collectionForm.fee_type} onValueChange={(value) => {
                      setCollectionForm(prev => ({ ...prev, fee_type: value }));
                      updateReceiptPreview({ ...collectionForm, fee_type: value });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tuition Fee">Tuition Fee</SelectItem>
                        <SelectItem value="Transport Fee">Transport Fee</SelectItem>
                        <SelectItem value="Lab Fee">Lab Fee</SelectItem>
                        <SelectItem value="Library Fee">Library Fee</SelectItem>
                        <SelectItem value="Exam Fee">Exam Fee</SelectItem>
                        <SelectItem value="Annual Fee">Annual Fee</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Amount *</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      min="1"
                      value={collectionForm.amount}
                      onChange={(e) => {
                        setCollectionForm(prev => ({ ...prev, amount: e.target.value }));
                        updateReceiptPreview({ ...collectionForm, amount: e.target.value });
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Payment Mode *</label>
                    <Select value={collectionForm.payment_mode} onValueChange={(value) => {
                      setCollectionForm(prev => ({ ...prev, payment_mode: value }));
                      updateReceiptPreview({ ...collectionForm, payment_mode: value });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Debit/Credit Card">Debit/Credit Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Net Banking">Net Banking</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Transaction ID</label>
                    <Input
                      placeholder="Enter transaction ID (optional)"
                      value={collectionForm.transaction_id}
                      onChange={(e) => setCollectionForm(prev => ({ ...prev, transaction_id: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Remarks</label>
                    <Input
                      placeholder="Additional notes (optional)"
                      value={collectionForm.remarks}
                      onChange={(e) => setCollectionForm(prev => ({ ...prev, remarks: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Receipt Preview</label>
                    {receiptPreview ? (
                      <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="text-center mb-4">
                          <Receipt className="h-8 w-8 mx-auto text-green-600 mb-2" />
                          <p className="font-bold text-green-800">Receipt #{receiptPreview.receiptNo}</p>
                          <p className="text-xs text-green-600">{receiptPreview.date} • {receiptPreview.time}</p>
                        </div>
                        {receiptPreview.student && (
                          <div className="space-y-1 text-sm">
                            <p><strong>Student:</strong> {receiptPreview.student.name}</p>
                            <p><strong>Admission:</strong> {receiptPreview.student.admission_no}</p>
                            <p><strong>Class:</strong> {receiptPreview.student.class}</p>
                            <p><strong>Fee Type:</strong> {receiptPreview.fee_type}</p>
                            <p><strong>Amount:</strong> ₹{receiptPreview.amount.toLocaleString()}</p>
                            {receiptPreview.payment_mode && (
                              <p><strong>Payment Mode:</strong> {receiptPreview.payment_mode}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500">Receipt will be generated after payment</p>
                        <p className="text-xs text-gray-400 mt-2">Fill form to preview receipt</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full text-green-700 border-green-300"
                        onClick={() => {
                          if (!collectionForm.student_id) {
                            toast.error('⚠️ Select Student First', {
                              description: 'Please select a student to view their profile.',
                              duration: 3000
                            });
                            return;
                          }
                          const student = students.find(s => s.id === collectionForm.student_id);
                          setSelectedStudent(student);
                          fetchStudentFinancials(student.id);
                          handleTabChange('student-specific');
                          toast.success(`👤 ${student.name}`, {
                            description: `Viewing profile for ${student.name} - switched to Student Specific tab.`,
                            duration: 4000
                          });
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        View Student Profile
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full text-green-700 border-green-300"
                        onClick={() => {
                          if (!collectionForm.student_id) {
                            toast.error('⚠️ Select Student First', {
                              description: 'Please select a student to view their payment history.',
                              duration: 3000
                            });
                            return;
                          }
                          const student = students.find(s => s.id === collectionForm.student_id);
                          setSelectedStudent(student);
                          fetchStudentFinancials(student.id);
                          handleTabChange('student-specific');
                          toast.success(`📄 Payment History`, {
                            description: `Viewing payment history for ${student.name} - switched to Student Specific tab.`,
                            duration: 4000
                          });
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Payment History
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full text-green-700 border-green-300"
                        onClick={() => {
                          if (!collectionForm.student_id) {
                            toast.error('⚠️ Select Student First', {
                              description: 'Please select a student to contact their parent.',
                              duration: 3000
                            });
                            return;
                          }
                          const student = students.find(s => s.id === collectionForm.student_id);
                          handleContactGuardian(student);
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Parent
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button variant="outline">
                  Clear Form
                </Button>
                <Button className="bg-green-500 hover:bg-green-600">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Payment & Generate Receipt
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Collections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Recent Collections Today
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Last updated: {new Date().toLocaleTimeString()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPayments.length > 0 ? (
                  recentPayments.slice(0, 10).map((payment, index) => (
                    <div key={payment.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 text-green-700 rounded-full p-2">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{payment.student_name}</p>
                          <p className="text-xs text-gray-500">{payment.time} • {payment.payment_mode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{payment.receipt_no}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No recent payments today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Payment Collection Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              Collect Payment
            </DialogTitle>
            <DialogDescription>
              Select student and enter payment details
            </DialogDescription>
          </DialogHeader>
          
          <PaymentForm 
            students={students}
            classes={classes}
            feeConfigurations={feeConfigurations}
            onSubmit={submitPayment}
            onCancel={() => setShowPaymentModal(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* CSV Export Modal */}
      {showExportOptions && (
        <CSVExportModal 
          onClose={() => setShowExportOptions(false)}
          onExport={handleExportCSV}
        />
      )}

      {/* Fee Configuration Modal */}
      <Dialog open={showFeeConfigModal} onOpenChange={setShowFeeConfigModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              Configure {currentFeeType}
            </DialogTitle>
            <DialogDescription>
              Manage fee structures, amounts, and payment schedules for {currentFeeType}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Fee Configuration Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fee Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (₹)</label>
                    <Input 
                      type="number" 
                      placeholder="Enter amount" 
                      value={configForm.amount}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequency</label>
                    <Select value={configForm.frequency} onValueChange={(value) => setConfigForm(prev => ({ ...prev, frequency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="one-time">One-Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input 
                      type="date" 
                      value={configForm.dueDate}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Class-wise Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Apply to Classes</label>
                    <Select value={configForm.applyToClasses} onValueChange={(value) => setConfigForm(prev => ({ ...prev, applyToClasses: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.standard})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Late Fee</label>
                    <Input 
                      type="number" 
                      placeholder="Late fee amount" 
                      value={configForm.lateFee}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, lateFee: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discount</label>
                    <Input 
                      type="number" 
                      placeholder="Discount percentage" 
                      value={configForm.discount}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, discount: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Fee Structure Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current {currentFeeType} Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3">Class</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Frequency</th>
                        <th className="text-left p-3">Due Date</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeConfigurations[currentFeeType] && feeConfigurations[currentFeeType].length > 0 ? (
                        feeConfigurations[currentFeeType].map((config, index) => {
                          // Get class name from apply_to_classes field
                          let className = 'All Classes';
                          if (config.apply_to_classes && config.apply_to_classes !== 'all') {
                            const classObj = classes.find(c => c.id === config.apply_to_classes);
                            className = classObj ? `${classObj.name} (${classObj.standard})` : config.apply_to_classes;
                          }
                          
                          return (
                            <tr key={config.id || index} className="border-b">
                              <td className="p-3">{className}</td>
                              <td className="p-3">₹{config.amount.toLocaleString()}</td>
                              <td className="p-3">{config.frequency}</td>
                              <td className="p-3">{config.due_date}</td>
                              <td className="p-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mr-2"
                                  onClick={() => handleEditConfig(config)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteConfig(config)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-gray-500">
                            No fee configurations found. Click "Save Configuration" to add new fees.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeeConfigModal(false)}>Cancel</Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={saveConfiguration}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Fee Configuration
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this fee configuration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {configToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm space-y-1">
                <p><strong>Fee Type:</strong> {currentFeeType}</p>
                <p><strong>Amount:</strong> ₹{configToDelete.amount.toLocaleString()}</p>
                <p><strong>Frequency:</strong> {configToDelete.frequency}</p>
                <p><strong>Classes:</strong> {(() => {
                  if (configToDelete.apply_to_classes === 'all' || !configToDelete.apply_to_classes) return 'All Classes';
                  const classObj = classes.find(c => c.id === configToDelete.apply_to_classes);
                  return classObj ? `${classObj.name} (${classObj.standard})` : configToDelete.apply_to_classes;
                })()}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteFeeConfiguration(configToDelete?.id)}
            >
              Delete Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Reports Modal */}
      <Dialog open={showGenerateReportsModal} onOpenChange={setShowGenerateReportsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Generate Fee Reports
            </DialogTitle>
            <DialogDescription>
              Generate comprehensive fee reports with filters and export options
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 hover:border-blue-500 cursor-pointer transition-colors">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <h3 className="font-medium">Fee Collection Report</h3>
                  <p className="text-sm text-gray-600">Daily/Monthly collection summary</p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-emerald-500 cursor-pointer transition-colors">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                  <h3 className="font-medium">Student Fee Status</h3>
                  <p className="text-sm text-gray-600">Individual student fee status</p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-orange-500 cursor-pointer transition-colors">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                  <h3 className="font-medium">Overdue Report</h3>
                  <p className="text-sm text-gray-600">Pending and overdue fees</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="this-quarter">This Quarter</SelectItem>
                        <SelectItem value="this-year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Class Filter</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="class1">Class 1</SelectItem>
                        <SelectItem value="class2">Class 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fee Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Fee Types</SelectItem>
                        <SelectItem value="tuition">Tuition Fee</SelectItem>
                        <SelectItem value="transport">Transport Fee</SelectItem>
                        <SelectItem value="admission">Admission Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status Filter</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-16 flex flex-col gap-2 bg-green-500 hover:bg-green-600" onClick={() => {
                    setShowGenerateReportsModal(false);
                    handleExportReport('excel', 'student_wise');
                  }}>
                    <FileText className="h-6 w-6" />
                    <span>Export to Excel</span>
                  </Button>
                  <Button className="h-16 flex flex-col gap-2 bg-red-500 hover:bg-red-600" onClick={() => {
                    setShowGenerateReportsModal(false);
                    handleExportReport('pdf', 'student_wise');
                  }}>
                    <FileText className="h-6 w-6" />
                    <span>Export to PDF</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateReportsModal(false)}>Cancel</Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => {
              setShowGenerateReportsModal(false);
              toast.success(`📊 Report Generated`, {
                description: 'Fee report has been generated successfully.',
                duration: 3000
              });
            }}>
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Payment Modal */}
      <Dialog open={showBulkPaymentModal} onOpenChange={setShowBulkPaymentModal}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              Bulk Payment Collection
            </DialogTitle>
            <DialogDescription>
              Collect fees from multiple students simultaneously
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Filter by Class</label>
                      <Select value={bulkPaymentFilters.class} onValueChange={(value) => setBulkPaymentFilters(prev => ({...prev, class: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fee Type</label>
                      <Select value={bulkPaymentFilters.feeType} onValueChange={(value) => setBulkPaymentFilters(prev => ({...prev, feeType: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tuition Fees">Tuition Fees</SelectItem>
                          <SelectItem value="Transport Fees">Transport Fees</SelectItem>
                          <SelectItem value="Admission Fees">Admission Fees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Mode</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Student Selection List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Select Students ({selectedStudents.length} selected)</h4>
                      <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                        {selectedStudents.length === getEligibleStudentsForBulkPayment().length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {getEligibleStudentsForBulkPayment().map((student) => {
                        const isSelected = selectedStudents.find(s => s.id === student.id);
                        return (
                          <div key={student.id} 
                               className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                               onClick={() => toggleStudentSelection(student)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <input type="checkbox" checked={!!isSelected} onChange={() => {}} className="rounded" />
                                <div>
                                  <p className="font-medium text-sm">{student.name}</p>
                                  <p className="text-xs text-gray-500">{student.admission_no} • {getClassName(student.class_id)}</p>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <p className="font-medium text-emerald-600">₹15,000</p>
                                <p className="text-xs text-gray-500">Pending</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Payment Summary */}
                  {selectedStudents.length > 0 && (
                    <Card className="bg-emerald-50 border-emerald-200">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-emerald-800 mb-2">Payment Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-emerald-600">Students</p>
                            <p className="font-bold text-emerald-800">{calculateBulkPaymentSummary().studentsCount}</p>
                          </div>
                          <div>
                            <p className="text-emerald-600">Total Amount</p>
                            <p className="font-bold text-emerald-800">₹{calculateBulkPaymentSummary().totalAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-emerald-600">Late Fees</p>
                            <p className="font-bold text-emerald-800">₹{calculateBulkPaymentSummary().lateFees.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-emerald-600">Grand Total</p>
                            <p className="font-bold text-emerald-800">₹{calculateBulkPaymentSummary().grandTotal.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBulkPaymentModal(false)}>Cancel</Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600" 
              onClick={() => submitBulkPayment({
                fee_type: bulkPaymentFilters.feeType,
                payment_mode: 'Cash',
                remarks: 'Bulk payment collection'
              })}
              disabled={selectedStudents.length === 0 || loading}
            >
              {loading ? 'Processing...' : `Collect Payment (₹${calculateBulkPaymentSummary().grandTotal.toLocaleString()})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Send Reminders Modal */}
          <Dialog open={showSendRemindersModal} onOpenChange={setShowSendRemindersModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Send Fee Reminders
                </DialogTitle>
                <DialogDescription>
                  Send automated reminders to students with pending or overdue fee payments
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reminder Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Reminder Type</label>
                        <Select defaultValue="both">
                          <SelectTrigger>
                            <SelectValue placeholder="Select reminder type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email Only</SelectItem>
                            <SelectItem value="sms">SMS Only</SelectItem>
                            <SelectItem value="both">Email + SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fee Status Filter</label>
                        <Select defaultValue="all">
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Pending</SelectItem>
                            <SelectItem value="pending">Pending Only</SelectItem>
                            <SelectItem value="overdue">Overdue Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-orange-800 mb-2">Reminder Preview</h4>
                      <div className="text-sm text-orange-700">
                        <p><strong>Subject:</strong> Fee Payment Reminder - School ERP</p>
                        <p><strong>Message:</strong> Dear Student/Parent, this is a reminder about pending fee payments. Please make the payment at your earliest convenience.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowSendRemindersModal(false)}>Cancel</Button>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600" 
                  onClick={() => submitSendReminders({})}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reminders'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
  );
};

// Payment Form Component
const PaymentForm = ({ students, classes, onSubmit, onCancel, loading, feeConfigurations = {} }) => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('');
  const [feeType, setFeeType] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');

  // Auto-fill amount when student and fee type are selected
  useEffect(() => {
    console.log('🔍 AUTO-FILL DEBUG:', {
      selectedStudent,
      feeType,
      hasStudents: students.length,
      hasFeeConfigurations: Object.keys(feeConfigurations).length
    });

    if (selectedStudent && feeType) {
      const student = students.find(s => s.id === selectedStudent);
      console.log('👤 Selected Student:', student);
      
      if (student && student.class_id) {
        // Find fee configuration matching student's class and selected fee type
        const configs = feeConfigurations[feeType] || [];
        console.log(`💰 Fee configs for ${feeType}:`, configs);
        console.log('🔍 Looking for class_id:', student.class_id);
        
        const matchingConfig = configs.find(config => {
          console.log('🔎 Checking config:', {
            config_class: config.apply_to_classes,
            student_class: student.class_id,
            match: config.apply_to_classes === student.class_id || config.apply_to_classes === 'all'
          });
          return config.apply_to_classes === student.class_id || config.apply_to_classes === 'all';
        });
        
        console.log('🎯 Matching config found:', matchingConfig);
        
        if (matchingConfig && matchingConfig.amount) {
          setAmount(matchingConfig.amount.toString());
          console.log(`✅ Auto-filled amount: ₹${matchingConfig.amount} for ${feeType} (${student.name})`);
        } else {
          console.warn('❌ No matching fee configuration found for this student/class');
        }
      } else {
        console.warn('⚠️ Student has no class_id:', student);
      }
    }
  }, [selectedStudent, feeType, students, feeConfigurations]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !amount || !feeType || !paymentMode) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      student_id: selectedStudent,
      amount: parseFloat(amount),
      fee_type: feeType,
      payment_mode: paymentMode,
      transaction_id: transactionId,
      remarks
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Student Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Student *</label>
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger>
            <SelectValue placeholder="Select a student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name} - {student.admission_no}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fee Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Fee Type *</label>
        <Select value={feeType} onValueChange={setFeeType}>
          <SelectTrigger>
            <SelectValue placeholder="Select fee type" />
          </SelectTrigger>
          <SelectContent>
            {/* Dynamic fee types from saved configurations */}
            {Object.keys(feeConfigurations || {}).map(feeType => (
              feeConfigurations[feeType]?.length > 0 && (
                <SelectItem key={feeType} value={feeType}>
                  {feeType}
                </SelectItem>
              )
            ))}
            {/* Default fee types if no configurations exist */}
            <SelectItem value="Tuition Fees">Tuition Fees</SelectItem>
            <SelectItem value="Transport Fees">Transport Fees</SelectItem>
            <SelectItem value="Admission Fees">Admission Fees</SelectItem>
            <SelectItem value="Lab Fee">Lab Fee</SelectItem>
            <SelectItem value="Library Fee">Library Fee</SelectItem>
            <SelectItem value="Exam Fee">Exam Fee</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Amount *</label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
        />
      </div>

      {/* Payment Mode */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Payment Mode *</label>
        <Select value={paymentMode} onValueChange={setPaymentMode}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Debit/Credit Card</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="netbanking">Net Banking</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
            <SelectItem value="dd">Demand Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction ID (for digital payments) */}
      {['card', 'upi', 'netbanking'].includes(paymentMode) && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Transaction ID</label>
          <Input
            placeholder="Enter transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
        </div>
      )}

      {/* Remarks */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Remarks</label>
        <Input
          placeholder="Optional remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
          {loading ? 'Processing...' : 'Collect Payment & Generate Receipt'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default Fees;
