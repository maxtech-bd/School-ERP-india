import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { 
  UserPlus,
  Globe,
  FileText,
  Settings,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Trash2,
  ExternalLink
} from 'lucide-react';

const OnlineAdmission = () => {
  const navigate = useNavigate();
  const [totalApplications, setTotalApplications] = useState(0);
  const [pendingReview, setPendingReview] = useState(0);
  const [approved, setApproved] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [exportFormat, setExportFormat] = useState('excel');
  
  // Configuration modal states
  const [isFormConfigModalOpen, setIsFormConfigModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isFeesModalOpen, setIsFeesModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAcademicYearModalOpen, setIsAcademicYearModalOpen] = useState(false);
  
  // Settings form state
  const [settingsData, setSettingsData] = useState({
    classLimits: {
      'Class 1': 40, 'Class 2': 40, 'Class 3': 40, 'Class 4': 40, 'Class 5': 40,
      'Class 6': 40, 'Class 7': 40, 'Class 8': 40, 'Class 9': 40, 'Class 10': 40
    },
    autoApproval: false,
    emailNotifications: true,
    smsNotifications: true
  });

  // Configuration form states
  const [formConfig, setFormConfig] = useState({
    personalInfo: { required: true, fields: ['name', 'dob', 'gender', 'address'] },
    parentInfo: { required: true, fields: ['father_name', 'mother_name', 'guardian_phone'] },
    academicInfo: { required: true, fields: ['previous_school', 'class_applied', 'marks'] },
    customFields: []
  });

  const [documentsConfig, setDocumentsConfig] = useState([
    { id: 1, name: 'Birth Certificate', required: true, maxSize: '2MB' },
    { id: 2, name: 'Transfer Certificate', required: true, maxSize: '2MB' },
    { id: 3, name: 'Previous School Marksheet', required: true, maxSize: '2MB' },
    { id: 4, name: 'Passport Photo', required: true, maxSize: '1MB' },
    { id: 5, name: 'Address Proof', required: false, maxSize: '2MB' }
  ]);

  const [feesConfig, setFeesConfig] = useState({
    admissionFee: 5000,
    registrationFee: 1000,
    monthlyFee: { 'Class 1-5': 3000, 'Class 6-8': 3500, 'Class 9-10': 4000 },
    lateFeePercentage: 10,
    scholarshipAvailable: true
  });

  const [portalConfig, setPortalConfig] = useState({
    isEnabled: true,
    portalTitle: 'School Admission Portal',
    welcomeMessage: 'Welcome to our online admission process',
    instructions: 'Please fill all details carefully',
    enableTracking: true,
    maintenanceMode: false
  });

  const [notificationsConfig, setNotificationsConfig] = useState({
    emailEnabled: true,
    smsEnabled: true,
    autoConfirmation: true,
    statusUpdates: true,
    reminderEmails: true,
    adminNotifications: true
  });

  const [academicYearConfig, setAcademicYearConfig] = useState({
    currentYear: '2025-26',
    admissionStartDate: '2025-04-01',
    admissionEndDate: '2025-06-30',
    resultDate: '2025-07-15',
    sessionStartDate: '2025-08-01',
    isActive: true
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://3516d251-7e36-40e8-b0eb-3a3eaa6959f7-00-3t9xpjugl0f0e.pike.replit.dev:8000/api';

  useEffect(() => {
    fetchAdmissionData();
  }, []);

  const fetchAdmissionData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admission/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setTotalApplications(data.totalApplications || 87);
      setPendingReview(data.pendingReview || 23);
      setApproved(data.approved || 52);
      setRejected(data.rejected || 12);
      setApplications(data.applications || initialApplications);
    } catch (error) {
      console.error('Error fetching admission data:', error);
      // Use mock data if API fails
      setTotalApplications(87);
      setPendingReview(23);
      setApproved(52);
      setRejected(12);
      setApplications(initialApplications);
    } finally {
      setLoading(false);
    }
  };

  // Public Portal redirect
  const handlePublicPortal = () => {
    window.open('/admission/public', '_blank');
  };

  // Export Applications functionality
  const handleExportApplications = async (format = exportFormat) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admission/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const fileExtension = format === 'pdf' ? 'pdf' : (format === 'csv' ? 'csv' : 'xlsx');
      const fileName = `admission_applications_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Applications exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Error exporting applications:', error);
      toast.error('Failed to export applications');
    } finally {
      setLoading(false);
    }
  };

  // Admission Settings modal
  const handleOpenSettings = async () => {
    try {
      // Load current settings from backend
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admission/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setSettingsData({
          classLimits: response.data.class_limits || settingsData.classLimits,
          autoApproval: response.data.auto_approval || false,
          emailNotifications: response.data.email_notifications !== false,
          smsNotifications: response.data.sms_notifications !== false
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if API fails
    }
    setIsSettingsModalOpen(true);
  };

  // Save Settings functionality
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        class_limits: settingsData.classLimits,
        auto_approval: settingsData.autoApproval,
        email_notifications: settingsData.emailNotifications,
        sms_notifications: settingsData.smsNotifications,
        updated_at: new Date().toISOString()
      };
      
      await axios.put(`${API_BASE_URL}/admission/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Admission settings saved successfully!');
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save admission settings');
    } finally {
      setLoading(false);
    }
  };

  // Update class limit
  const handleClassLimitChange = (className, value) => {
    setSettingsData(prev => ({
      ...prev,
      classLimits: {
        ...prev.classLimits,
        [className]: parseInt(value) || 40
      }
    }));
  };

  // Configuration button handlers with data loading
  const handleConfigureForm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admission/form-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setFormConfig(response.data);
      }
    } catch (error) {
      console.error('Error loading form config:', error);
      toast.error('Failed to load form configuration');
    } finally {
      setLoading(false);
    }
    setIsFormConfigModalOpen(true);
  };

  const handleManageDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admission/documents-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.documents) {
        setDocumentsConfig(response.data.documents);
      }
    } catch (error) {
      console.error('Error loading documents config:', error);
      toast.error('Failed to load documents configuration');
    } finally {
      setLoading(false);
    }
    setIsDocumentsModalOpen(true);
  };

  const handleSetFees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admission/fees-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setFeesConfig(response.data);
      }
    } catch (error) {
      console.error('Error loading fees config:', error);
      toast.error('Failed to load fees configuration');
    } finally {
      setLoading(false);
    }
    setIsFeesModalOpen(true);
  };

  const handleEnablePublicPortal = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admission/portal-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setPortalConfig(response.data);
      }
    } catch (error) {
      console.error('Error loading portal config:', error);
      toast.error('Failed to load portal configuration');
    } finally {
      setLoading(false);
    }
    setIsPortalModalOpen(true);
  };

  const handleConfigureNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admission/notifications-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setNotificationsConfig(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications config:', error);
      toast.error('Failed to load notifications configuration');
    } finally {
      setLoading(false);
    }
    setIsNotificationsModalOpen(true);
  };

  const handleSetAcademicYear = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admission/academic-year-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setAcademicYearConfig(response.data);
      }
    } catch (error) {
      console.error('Error loading academic year config:', error);
      toast.error('Failed to load academic year configuration');
    } finally {
      setLoading(false);
    }
    setIsAcademicYearModalOpen(true);
  };

  // Save configuration handlers
  const handleSaveFormConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admission/form-config`, formConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Form configuration saved successfully!');
      setIsFormConfigModalOpen(false);
    } catch (error) {
      console.error('Error saving form config:', error);
      toast.error('Failed to save form configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocumentsConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admission/documents-config`, { documents: documentsConfig }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Documents configuration saved successfully!');
      setIsDocumentsModalOpen(false);
    } catch (error) {
      console.error('Error saving documents config:', error);
      toast.error('Failed to save documents configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeesConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admission/fees-config`, feesConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Fee structure saved successfully!');
      setIsFeesModalOpen(false);
    } catch (error) {
      console.error('Error saving fees config:', error);
      toast.error('Failed to save fee structure');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePortalConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admission/portal-config`, portalConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Portal configuration saved successfully!');
      setIsPortalModalOpen(false);
    } catch (error) {
      console.error('Error saving portal config:', error);
      toast.error('Failed to save portal configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationsConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admission/notifications-config`, notificationsConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Notifications configuration saved successfully!');
      setIsNotificationsModalOpen(false);
    } catch (error) {
      console.error('Error saving notifications config:', error);
      toast.error('Failed to save notifications configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAcademicYearConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admission/academic-year-config`, academicYearConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Academic year configuration saved successfully!');
      setIsAcademicYearModalOpen(false);
    } catch (error) {
      console.error('Error saving academic year config:', error);
      toast.error('Failed to save academic year configuration');
    } finally {
      setLoading(false);
    }
  };

  // Application actions
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setIsViewModalOpen(true);
  };

  const handleApproveApplication = async (applicationId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admission/update-status`, {
        applicationId,
        status: 'Approved'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Application approved successfully!');
      await fetchAdmissionData(); // Refresh data
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admission/update-status`, {
        applicationId,
        status: 'Rejected'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Application rejected successfully!');
      await fetchAdmissionData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/admission/delete/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Application deleted successfully!');
      await fetchAdmissionData(); // Refresh data
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
  const initialApplications = [
    {
      id: 1,
      studentName: 'Arjun Patel',
      class: 'Class 10',
      appliedDate: '2025-09-05',
      status: 'Pending',
      guardianName: 'Raj Patel',
      phone: '+91 9876543210'
    },
    {
      id: 2,
      studentName: 'Priya Sharma',
      class: 'Class 8',
      appliedDate: '2025-09-04',
      status: 'Approved',
      guardianName: 'Suresh Sharma',
      phone: '+91 9876543211'
    },
    {
      id: 3,
      studentName: 'Rohit Kumar',
      class: 'Class 12',
      appliedDate: '2025-09-03',
      status: 'Under Review',
      guardianName: 'Amit Kumar',
      phone: '+91 9876543212'
    }
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Online Admission</h1>
          <p className="text-gray-600 mt-1">Manage digital admission process and applications</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePublicPortal}>
            <Globe className="h-4 w-4 mr-2" />
            Public Portal
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportApplications('excel')} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Export Applications
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleOpenSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Admission Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-orange-600">{pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-emerald-600">{approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Online Admission Tabs */}
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">Online Applications</TabsTrigger>
          <TabsTrigger value="settings">Admission Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Applications</span>
                <Badge variant="secondary">{applications.length} applications</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{application.studentName}</h4>
                        <p className="text-sm text-gray-600">Applied for {application.class}</p>
                        <p className="text-xs text-gray-500">Guardian: {application.guardianName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge 
                          variant={
                            application.status === 'Approved' ? 'default' :
                            application.status === 'Pending' ? 'secondary' : 'outline'
                          }
                          className={
                            application.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            application.status === 'Pending' ? 'bg-orange-100 text-orange-800' : 
                            'bg-blue-100 text-blue-800'
                          }
                        >
                          {application.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{application.appliedDate}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewApplication(application)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {application.status === 'Pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-emerald-500 hover:bg-emerald-600" 
                              onClick={() => handleApproveApplication(application.id)}
                              disabled={loading}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700" 
                              onClick={() => handleRejectApplication(application.id)}
                              disabled={loading}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700" 
                          onClick={() => handleDeleteApplication(application.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {applications.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-4">Online admission applications will appear here</p>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    View Public Portal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Admission Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Application Form</h4>
                  <p className="text-sm text-gray-600 mb-3">Configure admission form fields and requirements</p>
                  <Button variant="outline" size="sm" onClick={handleConfigureForm}>Configure Form</Button>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Document Requirements</h4>
                  <p className="text-sm text-gray-600 mb-3">Set required documents for admission</p>
                  <Button variant="outline" size="sm" onClick={handleManageDocuments}>Manage Documents</Button>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Fee Structure</h4>
                  <p className="text-sm text-gray-600 mb-3">Configure admission and monthly fees</p>
                  <Button variant="outline" size="sm" onClick={handleSetFees}>Set Fees</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portal Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Public Portal</h4>
                  <p className="text-sm text-gray-600 mb-3">Manage public admission portal visibility</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      View Portal
                    </Button>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={handleEnablePublicPortal}>Configure</Button>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Notification Settings</h4>
                  <p className="text-sm text-gray-600 mb-3">Configure email and SMS notifications</p>
                  <Button variant="outline" size="sm" onClick={handleConfigureNotifications}>Configure Notifications</Button>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Academic Year</h4>
                  <p className="text-sm text-gray-600 mb-3">Set admission period and deadlines</p>
                  <Button variant="outline" size="sm" onClick={handleSetAcademicYear}>Set Academic Year</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Application Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete information about the admission application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Student Name</Label>
                  <p className="text-sm font-semibold">{selectedApplication.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Applied Class</Label>
                  <p className="text-sm">{selectedApplication.class}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Guardian Name</Label>
                  <p className="text-sm">{selectedApplication.guardianName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contact Number</Label>
                  <p className="text-sm">{selectedApplication.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Applied Date</Label>
                  <p className="text-sm">{selectedApplication.appliedDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge 
                    variant={
                      selectedApplication.status === 'Approved' ? 'default' :
                      selectedApplication.status === 'Pending' ? 'secondary' : 'outline'
                    }
                    className={
                      selectedApplication.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      selectedApplication.status === 'Pending' ? 'bg-orange-100 text-orange-800' : 
                      'bg-blue-100 text-blue-800'
                    }
                  >
                    {selectedApplication.status}
                  </Badge>
                </div>
              </div>
              
              {/* Additional Details */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Student Address</Label>
                  <p className="text-sm">123 Main Street, City, State - 123456</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Previous School</Label>
                  <p className="text-sm">ABC Public School</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Documents Submitted</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline">Birth Certificate</Badge>
                    <Badge variant="outline">Transfer Certificate</Badge>
                    <Badge variant="outline">Previous School Marksheet</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            {selectedApplication?.status === 'Pending' && (
              <>
                <Button 
                  className="bg-emerald-500 hover:bg-emerald-600" 
                  onClick={() => {
                    handleApproveApplication(selectedApplication.id);
                    setIsViewModalOpen(false);
                  }}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700" 
                  onClick={() => {
                    handleRejectApplication(selectedApplication.id);
                    setIsViewModalOpen(false);
                  }}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admission Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Admission Settings</DialogTitle>
            <DialogDescription>
              Configure admission parameters, class limits, and automation rules
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class-wise Seat Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((className) => (
                  <div key={className} className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{className}</Label>
                    <Input 
                      type="number" 
                      value={settingsData.classLimits[className] || 40}
                      onChange={(e) => handleClassLimitChange(className, e.target.value)}
                      className="w-20"
                      min={1}
                      max={100}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Automation Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Automation Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Auto-Approve Applications</Label>
                    <Select 
                      value={settingsData.autoApproval ? "enabled" : "disabled"}
                      onValueChange={(value) => setSettingsData(prev => ({...prev, autoApproval: value === "enabled"}))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="enabled">Enabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <Select 
                      value={settingsData.emailNotifications ? "enabled" : "disabled"}
                      onValueChange={(value) => setSettingsData(prev => ({...prev, emailNotifications: value === "enabled"}))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">SMS Notifications</Label>
                    <Select 
                      value={settingsData.smsNotifications ? "enabled" : "disabled"}
                      onValueChange={(value) => setSettingsData(prev => ({...prev, smsNotifications: value === "enabled"}))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Label className="text-sm font-medium">Export Options</Label>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleExportApplications('csv')}
                      disabled={loading}
                    >
                      Export CSV
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleExportApplications('excel')}
                      disabled={loading}
                    >
                      Export Excel
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleExportApplications('pdf')}
                      disabled={loading}
                    >
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600" 
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Form Modal */}
      <Dialog open={isFormConfigModalOpen} onOpenChange={setIsFormConfigModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configure Admission Form</DialogTitle>
            <DialogDescription>Customize form fields and requirements for online admission</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {['name', 'dob', 'gender', 'address'].map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <Label className="text-sm">{field.replace('_', ' ').toUpperCase()}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Parent Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parent Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {['father_name', 'mother_name', 'guardian_phone'].map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <Label className="text-sm">{field.replace('_', ' ').toUpperCase()}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {['previous_school', 'class_applied', 'marks'].map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <Label className="text-sm">{field.replace('_', ' ').toUpperCase()}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormConfigModalOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleSaveFormConfig} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Documents Modal */}
      <Dialog open={isDocumentsModalOpen} onOpenChange={setIsDocumentsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Document Requirements</DialogTitle>
            <DialogDescription>Configure required documents for admission</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {documentsConfig.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={doc.required} 
                    onChange={(e) => setDocumentsConfig(prev => 
                      prev.map(d => d.id === doc.id ? {...d, required: e.target.checked} : d)
                    )}
                    className="rounded" 
                  />
                  <div>
                    <Label className="font-medium">{doc.name}</Label>
                    <p className="text-xs text-gray-500">Max size: {doc.maxSize}</p>
                  </div>
                </div>
                <Badge variant={doc.required ? "default" : "outline"}>
                  {doc.required ? "Required" : "Optional"}
                </Badge>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDocumentsModalOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleSaveDocumentsConfig} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Fees Modal */}
      <Dialog open={isFeesModalOpen} onOpenChange={setIsFeesModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Fee Structure</DialogTitle>
            <DialogDescription>Set admission and monthly fees</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Admission Fee (₹)</Label>
                <Input 
                  type="number" 
                  value={feesConfig.admissionFee}
                  onChange={(e) => setFeesConfig(prev => ({...prev, admissionFee: parseInt(e.target.value) || 0}))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Registration Fee (₹)</Label>
                <Input 
                  type="number" 
                  value={feesConfig.registrationFee}
                  onChange={(e) => setFeesConfig(prev => ({...prev, registrationFee: parseInt(e.target.value) || 0}))}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Fees by Class</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(feesConfig.monthlyFee).map(([classRange, fee]) => (
                  <div key={classRange} className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{classRange}</Label>
                    <Input 
                      type="number" 
                      value={fee}
                      onChange={(e) => setFeesConfig(prev => ({
                        ...prev, 
                        monthlyFee: {...prev.monthlyFee, [classRange]: parseInt(e.target.value) || 0}
                      }))}
                      className="w-24"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Late Fee Percentage (%)</Label>
              <Input 
                type="number" 
                value={feesConfig.lateFeePercentage}
                onChange={(e) => setFeesConfig(prev => ({...prev, lateFeePercentage: parseInt(e.target.value) || 0}))}
                className="w-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeesModalOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleSaveFeesConfig} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Portal Configuration Modal */}
      <Dialog open={isPortalModalOpen} onOpenChange={setIsPortalModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Public Portal Configuration</DialogTitle>
            <DialogDescription>Configure public admission portal settings</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Portal Status</Label>
              <Select 
                value={portalConfig.isEnabled ? "enabled" : "disabled"}
                onValueChange={(value) => setPortalConfig(prev => ({...prev, isEnabled: value === "enabled"}))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Portal Title</Label>
              <Input 
                value={portalConfig.portalTitle}
                onChange={(e) => setPortalConfig(prev => ({...prev, portalTitle: e.target.value}))}
                placeholder="School Admission Portal"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Welcome Message</Label>
              <Input 
                value={portalConfig.welcomeMessage}
                onChange={(e) => setPortalConfig(prev => ({...prev, welcomeMessage: e.target.value}))}
                placeholder="Welcome message for applicants"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Instructions</Label>
              <Input 
                value={portalConfig.instructions}
                onChange={(e) => setPortalConfig(prev => ({...prev, instructions: e.target.value}))}
                placeholder="Instructions for filling the form"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Application Tracking</Label>
              <Select 
                value={portalConfig.enableTracking ? "enabled" : "disabled"}
                onValueChange={(value) => setPortalConfig(prev => ({...prev, enableTracking: value === "enabled"}))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPortalModalOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleSavePortalConfig} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Configuration Modal */}
      <Dialog open={isNotificationsModalOpen} onOpenChange={setIsNotificationsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>Configure email and SMS notifications</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {Object.entries(notificationsConfig).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <Select 
                  value={value ? "enabled" : "disabled"}
                  onValueChange={(val) => setNotificationsConfig(prev => ({...prev, [key]: val === "enabled"}))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotificationsModalOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleSaveNotificationsConfig} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Academic Year Configuration Modal */}
      <Dialog open={isAcademicYearModalOpen} onOpenChange={setIsAcademicYearModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Academic Year Configuration</DialogTitle>
            <DialogDescription>Set academic year and admission deadlines</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Academic Year</Label>
              <Input 
                value={academicYearConfig.currentYear}
                onChange={(e) => setAcademicYearConfig(prev => ({...prev, currentYear: e.target.value}))}
                placeholder="2025-26"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Admission Start Date</Label>
                <Input 
                  type="date"
                  value={academicYearConfig.admissionStartDate}
                  onChange={(e) => setAcademicYearConfig(prev => ({...prev, admissionStartDate: e.target.value}))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Admission End Date</Label>
                <Input 
                  type="date"
                  value={academicYearConfig.admissionEndDate}
                  onChange={(e) => setAcademicYearConfig(prev => ({...prev, admissionEndDate: e.target.value}))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Result Declaration Date</Label>
                <Input 
                  type="date"
                  value={academicYearConfig.resultDate}
                  onChange={(e) => setAcademicYearConfig(prev => ({...prev, resultDate: e.target.value}))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Session Start Date</Label>
                <Input 
                  type="date"
                  value={academicYearConfig.sessionStartDate}
                  onChange={(e) => setAcademicYearConfig(prev => ({...prev, sessionStartDate: e.target.value}))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Status</Label>
              <Select 
                value={academicYearConfig.isActive ? "active" : "inactive"}
                onValueChange={(value) => setAcademicYearConfig(prev => ({...prev, isActive: value === "active"}))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcademicYearModalOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleSaveAcademicYearConfig} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnlineAdmission;