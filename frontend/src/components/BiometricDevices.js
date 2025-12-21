import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';
import { 
  Fingerprint,
  Wifi,
  WifiOff,
  Clock,
  Users,
  Download,
  Settings,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

const BiometricDevices = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current tab from URL path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/biometric/staff')) return 'staff';
    if (path.includes('/biometric/punch-log')) return 'punch-log';
    if (path.includes('/biometric/devices')) return 'devices';
    if (path.includes('/biometric/calendar')) return 'calendar';
    if (path.includes('/biometric/status')) return 'status';
    return 'overview'; // default
  };

  // Handle tab change and update URL
  const handleTabChange = (tabValue) => {
    const pathMap = {
      'overview': '/biometric/overview',
      'staff': '/biometric/staff',
      'punch-log': '/biometric/punch-log',
      'devices': '/biometric/devices',
      'calendar': '/biometric/calendar',
      'status': '/biometric/status'
    };
    
    if (pathMap[tabValue]) {
      navigate(pathMap[tabValue]);
    }
  };

  const [activeTab, setActiveTab] = useState(getCurrentTab());
  const [totalDevices, setTotalDevices] = useState(0);
  const [onlineDevices, setOnlineDevices] = useState(0);
  const [todayPunches, setTodayPunches] = useState(0);
  const [staffList, setStaffList] = useState([]);
  const [punchLog, setPunchLog] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStaffList, setShowStaffList] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showPunchLog, setShowPunchLog] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceFormData, setDeviceFormData] = useState({
    device_name: '',
    device_model: 'ZKTeco K40',
    ip_address: '',
    port: '4370',
    location: '',
    status: 'active',
    description: ''
  });
  const [editingDevice, setEditingDevice] = useState(null);
  const [isDailyAttendanceModalOpen, setIsDailyAttendanceModalOpen] = useState(false);
  const [dailyAttendanceData, setDailyAttendanceData] = useState(null);
  const [sampleDataLoading, setSampleDataLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://3516d251-7e36-40e8-b0eb-3a3eaa6959f7-00-3t9xpjugl0f0e.pike.replit.dev:8000/api';

  // Update active tab when URL changes (e.g., from sidebar navigation)
  useEffect(() => {
    setActiveTab(getCurrentTab());
  }, [location.pathname]);

  useEffect(() => {
    fetchBiometricData();
    fetchDevicesList();
  }, []);

  const fetchBiometricData = async () => {
    setTotalDevices(8);
    setOnlineDevices(6);
    setTodayPunches(234);
  };

  // Sample Data Generator Function
  const handleGenerateSampleData = async () => {
    try {
      setSampleDataLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/biometric/generate-sample-data`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.summary) {
        const summary = response.data.summary;
        toast.success(`Sample data generated successfully! 🎉\n${summary.punch_records_generated} punch records created for ${summary.staff_created} staff members across ${summary.devices_available} devices.\nDate range: ${summary.date_range}\nStatus: ${summary.status}`, {
          duration: 8000,
          style: {
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534'
          }
        });
      } else {
        toast.success(response.data.message || 'Sample data generated successfully! 🎉');
      }
      
      // Refresh data after generation
      setTimeout(() => {
        fetchBiometricData();
        if (isDailyAttendanceModalOpen) {
          handleViewDailyAttendance();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast.error('Failed to generate sample data. Please try again.');
    } finally {
      setSampleDataLoading(false);
    }
  };

  // Daily Attendance Functions
  const handleViewDailyAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/live-attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDailyAttendanceData(response.data.attendance);
      setIsDailyAttendanceModalOpen(true);
      console.log('Daily attendance data loaded:', response.data);
    } catch (error) {
      console.error('Error fetching daily attendance:', error);
      alert('Failed to load daily attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Staff List Functions
  const handleViewEnrolledStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/staff-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(response.data.staff || []);
      setShowStaffList(true);
      console.log('Staff list loaded:', response.data);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      alert('Failed to load enrolled staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollNewStaff = async () => {
    setShowEnrollModal(true);
  };

  const handleCloseEnrollModal = () => {
    setShowEnrollModal(false);
  };

  const handleSaveNewStaff = async (staffData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/biometric/enroll-staff`, staffData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Staff enrolled successfully:', response.data);
      alert('Staff enrolled successfully!');
      handleCloseEnrollModal();
      // Refresh staff list
      handleViewEnrolledStaff();
    } catch (error) {
      console.error('Error enrolling staff:', error);
      alert('Failed to enroll staff');
    } finally {
      setLoading(false);
    }
  };

  // Punch Log Functions
  const handleViewLiveLog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/punch-log`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPunchLog(response.data.punches || []);
      setShowPunchLog(true);
      console.log('Punch log loaded:', response.data);
    } catch (error) {
      console.error('Error fetching punch log:', error);
      alert('Failed to load punch log data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportLog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/punch-log?format=excel`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `punch_log_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Punch log exported successfully');
    } catch (error) {
      console.error('Error exporting punch log:', error);
      alert('Failed to export punch log');
    } finally {
      setLoading(false);
    }
  };

  // Device Management Functions
  const handleDeviceSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevicesList(response.data.devices || []);
      console.log('Device list loaded:', response.data);
    } catch (error) {
      console.error('Error fetching device list:', error);
      alert('Failed to load device settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewDevice = async () => {
    setEditingDevice(null);
    setDeviceFormData({
      device_name: '',
      device_model: 'ZKTeco K40',
      ip_address: '',
      port: '4370',
      location: '',
      status: 'active',
      description: ''
    });
    setIsDeviceModalOpen(true);
  };

  const handleDeviceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const submitData = {
        ...deviceFormData,
        port: parseInt(deviceFormData.port)
      };

      if (editingDevice) {
        await axios.put(`${API_BASE_URL}/biometric/devices/${editingDevice.device_id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Device updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/biometric/add-device`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Device added successfully');
      }

      setIsDeviceModalOpen(false);
      resetDeviceForm();
      await fetchDevicesList(); // Refresh device list

    } catch (error) {
      console.error('Device operation failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to save device');
    } finally {
      setLoading(false);
    }
  };

  const resetDeviceForm = () => {
    setDeviceFormData({
      device_name: '',
      device_model: 'ZKTeco K40',
      ip_address: '',
      port: '4370',
      location: '',
      status: 'active',
      description: ''
    });
    setEditingDevice(null);
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setDeviceFormData({
      device_name: device.device_name,
      device_model: device.device_model,
      ip_address: device.ip_address,
      port: device.port.toString(),
      location: device.location,
      status: device.status,
      description: device.description || ''
    });
    setIsDeviceModalOpen(true);
  };

  const fetchDevicesList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevicesList(response.data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleExportDevices = async (format) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/devices?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: format === 'excel' ? 'blob' : 'json'
      });

      if (format === 'excel') {
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `biometric_devices_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Device list exported to Excel');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export device list');
    } finally {
      setLoading(false);
    }
  };

  // Calendar Functions
  const [calendarData, setCalendarData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleViewCalendar = async (month = selectedMonth, year = selectedYear) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/calendar?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCalendarData(response.data);
      console.log('Calendar data loaded:', response.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      alert('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (presentCount, totalStaff) => {
    if (totalStaff === 0) return 'bg-gray-100 text-gray-500';
    const percentage = (presentCount / totalStaff) * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Status Report Functions
  const handleDailyReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/status-report?format=pdf&type=daily`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daily_biometric_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Daily report generated successfully');
    } catch (error) {
      console.error('Error generating daily report:', error);
      alert('Failed to generate daily report');
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklyReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/status-report?format=excel&type=weekly`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weekly_biometric_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Weekly report generated successfully');
    } catch (error) {
      console.error('Error generating weekly report:', error);
      alert('Failed to generate weekly report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/biometric/status-report?format=pdf&type=comprehensive`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprehensive_biometric_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Comprehensive report generated successfully');
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      alert('Failed to generate comprehensive report');
    } finally {
      setLoading(false);
    }
  };

  // Mock device data
  const devices = [
    { 
      id: 1, 
      name: 'Main Entrance', 
      location: 'Ground Floor', 
      status: 'Online', 
      lastSync: '2 mins ago',
      punches: 45,
      model: 'ZKTeco K40'
    },
    { 
      id: 2, 
      name: 'Staff Room', 
      location: 'First Floor', 
      status: 'Online', 
      lastSync: '5 mins ago',
      punches: 32,
      model: 'ZKTeco K30'
    },
    { 
      id: 3, 
      name: 'Admin Block', 
      location: 'Second Floor', 
      status: 'Offline', 
      lastSync: '2 hours ago',
      punches: 0,
      model: 'ZKTeco K40'
    }
  ];

  const recentPunches = [
    { id: 1, employee: 'John Doe', time: '09:15 AM', type: 'IN', device: 'Main Entrance' },
    { id: 2, employee: 'Jane Smith', time: '09:12 AM', type: 'IN', device: 'Staff Room' },
    { id: 3, employee: 'Mike Johnson', time: '09:10 AM', type: 'IN', device: 'Main Entrance' },
    { id: 4, employee: 'Sarah Wilson', time: '09:08 AM', type: 'IN', device: 'Admin Block' }
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Biometric Devices</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage ZKTeco attendance devices</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGenerateSampleData}
            disabled={sampleDataLoading}
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <FileText className="h-4 w-4 mr-2" />
            {sampleDataLoading ? 'Generating...' : '📊 Create Sample Data (Test)'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Device Settings
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Fingerprint className="h-4 w-4 mr-2" />
            Sync All Devices
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devices</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalDevices}</p>
              </div>
              <Fingerprint className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Devices</p>
                <p className="text-3xl font-bold text-emerald-600">{onlineDevices}</p>
              </div>
              <Wifi className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Offline Devices</p>
                <p className="text-3xl font-bold text-red-600">{totalDevices - onlineDevices}</p>
              </div>
              <WifiOff className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Punches</p>
                <p className="text-3xl font-bold text-purple-600">{todayPunches}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Biometric Management Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff List</TabsTrigger>
          <TabsTrigger value="punch-log">Punch Log</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="status">Status Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${device.status === 'Online' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                          {device.status === 'Online' ? 
                            <CheckCircle className="h-4 w-4 text-emerald-600" /> :
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div>
                          <h4 className="font-medium">{device.name}</h4>
                          <p className="text-sm text-gray-500">{device.location} • {device.model}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={device.status === 'Online' ? 'default' : 'destructive'}
                          className={device.status === 'Online' ? 'bg-emerald-100 text-emerald-800' : ''}
                        >
                          {device.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{device.lastSync}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Today's Live Attendance</span>
                  <Button 
                    variant="outline" 
                    onClick={handleViewDailyAttendance} 
                    disabled={loading}
                    className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {loading ? 'Loading...' : 'View Daily Attendance'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Real-time Attendance Tracking</h3>
                  <p className="text-gray-600 mb-4">Monitor live attendance from biometric devices. Click "View Daily Attendance" to see today's complete attendance data.</p>
                  <div className="grid grid-cols-3 gap-4 text-center mt-6">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{dailyAttendanceData?.students_present || 0}</p>
                      <p className="text-sm text-gray-500">Students Present</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{dailyAttendanceData?.staff_present || 0}</p>
                      <p className="text-sm text-gray-500">Staff Present</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{dailyAttendanceData?.total_punches || 0}</p>
                      <p className="text-sm text-gray-500">Total Punches</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Punch Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPunches.map((punch) => (
                    <div key={punch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${punch.type === 'IN' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                          <Clock className={`h-4 w-4 ${punch.type === 'IN' ? 'text-emerald-600' : 'text-orange-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{punch.employee}</h4>
                          <p className="text-sm text-gray-500">{punch.device}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={punch.type === 'IN' ? 'default' : 'secondary'}>
                          {punch.type}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{punch.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Enrolled Staff List</span>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleViewEnrolledStaff} disabled={loading}>
                    <Users className="h-4 w-4 mr-2" />
                    {loading ? 'Loading...' : 'Refresh List'}
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleEnrollNewStaff} disabled={loading}>
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Enroll New Staff
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showStaffList ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Staff Biometric Enrollment</h3>
                  <p className="text-gray-600 mb-4">Click "Refresh List" to view enrolled staff with fingerprint and face data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Total Staff: {staffList.length}</p>
                    <p className="text-sm text-gray-600">
                      Enrolled: {staffList.filter(staff => staff.fingerprint_enrolled || staff.face_enrolled).length}
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-emerald-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Staff ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Designation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Fingerprint</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Face</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Enrollment Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {staffList.map((staff) => (
                          <tr key={staff.staff_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.staff_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{staff.department}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{staff.designation}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={staff.fingerprint_enrolled ? 'default' : 'secondary'} 
                                className={staff.fingerprint_enrolled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}>
                                {staff.fingerprint_enrolled ? 'Enrolled' : 'Not Enrolled'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={staff.face_enrolled ? 'default' : 'secondary'} 
                                className={staff.face_enrolled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}>
                                {staff.face_enrolled ? 'Enrolled' : 'Not Enrolled'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{staff.enrollment_date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={staff.status === 'Active' ? 'default' : 'destructive'}>
                                {staff.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {staffList.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No enrolled staff found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Enrollment Modal */}
          {showEnrollModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Fingerprint className="h-5 w-5 mr-2 text-emerald-600" />
                  Enroll New Staff
                </h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const staffData = {
                    name: formData.get('name'),
                    department: formData.get('department'),
                    designation: formData.get('designation'),
                    fingerprint_enrolled: formData.get('fingerprint') === 'on',
                    face_enrolled: formData.get('face') === 'on'
                  };
                  handleSaveNewStaff(staffData);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
                    <input name="name" type="text" required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                      placeholder="Enter staff name" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select name="department" required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">Select Department</option>
                      <option value="Teaching">Teaching</option>
                      <option value="Administration">Administration</option>
                      <option value="Support">Support</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input name="designation" type="text" required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                      placeholder="e.g., Teacher, Admin Officer" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Biometric Enrollment</label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input name="fingerprint" type="checkbox" className="mr-2" />
                        <Fingerprint className="h-4 w-4 mr-1 text-emerald-600" />
                        Fingerprint
                      </label>
                      <label className="flex items-center">
                        <input name="face" type="checkbox" className="mr-2" />
                        <Users className="h-4 w-4 mr-1 text-blue-600" />
                        Face
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleCloseEnrollModal} disabled={loading}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
                      {loading ? 'Enrolling...' : 'Enroll Staff'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="punch-log" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Real-time Punch Log</span>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleViewLiveLog} disabled={loading}>
                    <Clock className="h-4 w-4 mr-2" />
                    {loading ? 'Loading...' : 'View Live Log'}
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleExportLog} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Log
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showPunchLog ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Live Attendance Tracking</h3>
                  <p className="text-gray-600 mb-4">Click "View Live Log" to monitor real-time attendance punches from all devices</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Total Punches: {punchLog.length}</p>
                    <p className="text-sm text-gray-600">
                      Recent Activity: {punchLog.filter(p => {
                        const punchTime = new Date(p.punch_time);
                        const now = new Date();
                        return (now - punchTime) < 24 * 60 * 60 * 1000; // Last 24 hours
                      }).length} in last 24h
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-emerald-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Punch ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Staff Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Device</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {punchLog.map((punch) => (
                          <tr key={punch.punch_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{punch.punch_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{punch.staff_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{punch.device}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(punch.punch_time).toLocaleString('en-US', {
                                month: 'short', day: 'numeric', 
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                {punch.verification_method}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={punch.punch_type === 'IN' ? 'default' : 'secondary'} 
                                className={punch.punch_type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}>
                                {punch.punch_type}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline" 
                                className={punch.verification_score >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {punch.verification_score}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {punchLog.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No punch records found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Device Management</span>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => handleExportDevices('excel')} disabled={loading}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleAddNewDevice} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Device
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {devicesList.length === 0 ? (
                <div className="text-center py-12">
                  <Fingerprint className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Devices Configured</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Add your first biometric device to get started</p>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleAddNewDevice} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Device
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {devicesList.map((device) => (
                      <Card key={device.device_id} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${device.status === 'active' ? 'bg-green-500' : device.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                              <h4 className="font-medium text-gray-900 dark:text-white">{device.device_name}</h4>
                            </div>
                            <Badge variant={device.status === 'active' ? 'default' : device.status === 'maintenance' ? 'secondary' : 'destructive'} 
                              className={`text-xs ${device.status === 'active' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
                              {device.status === 'active' ? 'Online' : device.status === 'maintenance' ? 'Maintenance' : 'Offline'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between">
                              <span>Model:</span>
                              <span>{device.device_model}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>IP Address:</span>
                              <span className="font-mono">{device.ip_address}:{device.port}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Location:</span>
                              <span>{device.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Storage:</span>
                              <span>{Math.floor(Math.random() * 80 + 10)}% used</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Seen:</span>
                              <span>{device.status === 'active' ? 'Just now' : '2 hours ago'}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-3 border-t">
                            <Button variant="outline" size="sm" onClick={() => handleEditDevice(device)}>
                              <Settings className="h-3 w-3 mr-1" />
                              Settings
                            </Button>
                            <div className="flex space-x-1">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                <Wifi className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">{devicesList.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Devices</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{devicesList.filter(d => d.status === 'active').length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{devicesList.filter(d => d.status === 'maintenance').length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{devicesList.filter(d => d.status === 'inactive').length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Offline</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Attendance Calendar</span>
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={i+1}>
                        {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    {[2023, 2024, 2025].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <Button 
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600" 
                    onClick={() => handleViewCalendar(selectedMonth, selectedYear)} 
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load Calendar'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!calendarData ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Monthly Attendance View</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Select month/year and click Load Calendar to view attendance patterns</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Calendar Header */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {calendarData.month_name} {calendarData.year}
                    </h2>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{calendarData.summary.total_days}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{calendarData.summary.working_days}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Working Days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{calendarData.summary.weekend_days}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Weekends</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">{calendarData.summary.average_attendance_percentage}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{calendarData.summary.highest_attendance}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Highest Day</p>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="border rounded-lg overflow-hidden">
                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-700">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-3 text-center font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                      {/* Generate calendar grid */}
                      {(() => {
                        const firstDay = new Date(calendarData.year, selectedMonth - 1, 1).getDay();
                        const daysInMonth = new Date(calendarData.year, selectedMonth, 0).getDate();
                        const days = [];
                        
                        // Empty cells for days before month starts
                        for (let i = 0; i < firstDay; i++) {
                          days.push(
                            <div key={`empty-${i}`} className="p-3 h-24 border-r border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"></div>
                          );
                        }
                        
                        // Days of the month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dayData = calendarData.calendar_data.find(d => 
                            new Date(d.date).getDate() === day
                          );
                          
                          days.push(
                            <div key={day} className={`p-2 h-24 border-r border-b border-gray-200 dark:border-gray-600 ${dayData?.is_weekend ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
                              <div className="flex flex-col h-full">
                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{day}</div>
                                {dayData && !dayData.is_weekend && (
                                  <div className={`flex-1 rounded text-xs p-1 text-center border ${getStatusColor(dayData.present_count, dayData.total_staff)}`}>
                                    <div className="font-medium">{dayData.present_count}/{dayData.total_staff}</div>
                                    <div>{dayData.attendance_percentage}%</div>
                                  </div>
                                )}
                                {dayData?.is_weekend && (
                                  <div className="flex-1 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">Weekend</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        
                        return days;
                      })()}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                      <span>90%+ Attendance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                      <span>70-89% Attendance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
                      <span>50-69% Attendance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                      <span>&lt;50% Attendance</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Status Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Download className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Comprehensive Status Report</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Generate detailed device performance reports</p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" onClick={handleDailyReport} disabled={loading}>Daily Report</Button>
                  <Button variant="outline" onClick={handleWeeklyReport} disabled={loading}>Weekly Report</Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleGenerateReport} disabled={loading}>Generate Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Device Configuration Modal */}
      <Dialog open={isDeviceModalOpen} onOpenChange={setIsDeviceModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDevice ? 'Edit Device' : 'Add New Device'}</DialogTitle>
            <DialogDescription>
              Configure biometric device settings and connection parameters
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeviceSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="device_name">Device Name *</Label>
                <Input
                  id="device_name"
                  value={deviceFormData.device_name}
                  onChange={(e) => setDeviceFormData({...deviceFormData, device_name: e.target.value})}
                  placeholder="e.g., Main Entrance"
                  required
                />
              </div>
              <div>
                <Label htmlFor="device_model">Device Model *</Label>
                <Select 
                  value={deviceFormData.device_model} 
                  onValueChange={(value) => setDeviceFormData({...deviceFormData, device_model: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZKTeco K40">ZKTeco K40</SelectItem>
                    <SelectItem value="ZKTeco K30">ZKTeco K30</SelectItem>
                    <SelectItem value="ZKTeco F18">ZKTeco F18</SelectItem>
                    <SelectItem value="ZKTeco MA300">ZKTeco MA300</SelectItem>
                    <SelectItem value="ZKTeco K14">ZKTeco K14</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ip_address">IP Address *</Label>
                <Input
                  id="ip_address"
                  value={deviceFormData.ip_address}
                  onChange={(e) => setDeviceFormData({...deviceFormData, ip_address: e.target.value})}
                  placeholder="192.168.1.100"
                  pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                  required
                />
              </div>
              <div>
                <Label htmlFor="port">Port Number</Label>
                <Input
                  id="port"
                  type="number"
                  value={deviceFormData.port}
                  onChange={(e) => setDeviceFormData({...deviceFormData, port: e.target.value})}
                  placeholder="4370"
                  min="1"
                  max="65535"
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={deviceFormData.location}
                  onChange={(e) => setDeviceFormData({...deviceFormData, location: e.target.value})}
                  placeholder="Ground Floor, Main Building"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={deviceFormData.status} 
                  onValueChange={(value) => setDeviceFormData({...deviceFormData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={deviceFormData.description}
                  onChange={(e) => setDeviceFormData({...deviceFormData, description: e.target.value})}
                  placeholder="Additional device notes or configuration details"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDeviceModalOpen(false);
                  resetDeviceForm();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-emerald-500 hover:bg-emerald-600" 
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingDevice ? 'Update Device' : 'Add Device')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Daily Attendance Modal */}
      <Dialog open={isDailyAttendanceModalOpen} onOpenChange={setIsDailyAttendanceModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Today's Live Attendance - {dailyAttendanceData?.date || new Date().toISOString().split('T')[0]}
            </DialogTitle>
            <DialogDescription>
              Real-time attendance data from biometric devices
            </DialogDescription>
          </DialogHeader>
          
          {dailyAttendanceData ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{dailyAttendanceData.students_present}</p>
                    <p className="text-sm text-emerald-700">Students Present</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{dailyAttendanceData.staff_present}</p>
                    <p className="text-sm text-blue-700">Staff Present</p>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{dailyAttendanceData.total_punches}</p>
                    <p className="text-sm text-purple-700">Total Punches</p>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{dailyAttendanceData.unique_persons}</p>
                    <p className="text-sm text-orange-700">Unique Persons</p>
                  </div>
                </div>
              </div>

              {/* Latest Punches Table */}
              <div>
                <h3 className="text-lg font-medium mb-4">Latest Attendance Punches</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Additional Info</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailyAttendanceData.latest_punches && dailyAttendanceData.latest_punches.length > 0 ? (
                          dailyAttendanceData.latest_punches.map((punch, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{punch.person_name}</div>
                                  <div className="text-xs text-gray-500">{punch.person_id}</div>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <Badge 
                                  variant={punch.person_type === 'staff' ? 'default' : 'secondary'}
                                  className={punch.person_type === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}
                                >
                                  {punch.person_type}
                                </Badge>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {new Date(punch.punch_time).toLocaleTimeString()}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <Badge 
                                  variant={punch.punch_type === 'IN' ? 'default' : 'secondary'}
                                  className={punch.punch_type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}
                                >
                                  {punch.punch_type}
                                </Badge>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {punch.device_name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {punch.verification_score ? (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    punch.verification_score >= 90 ? 'bg-green-100 text-green-800' :
                                    punch.verification_score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    Score: {punch.verification_score}%
                                  </span>
                                ) : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                              No attendance punches recorded today
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Attendance Data</h3>
              <p className="text-gray-600">Please wait while we fetch today's attendance records...</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDailyAttendanceModalOpen(false)}
            >
              Close
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={handleViewDailyAttendance}
              disabled={loading}
            >
              <Clock className="h-4 w-4 mr-2" />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BiometricDevices;