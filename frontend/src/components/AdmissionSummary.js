import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  FileText,
  UserPlus,
  GraduationCap,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Eye,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_API_URL;
const API = BACKEND_URL;

const AdmissionSummary = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_students: 0,
    new_admissions_this_month: 0,
    pending_applications: 0,
    total_classes: 0
  });
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [filters, setFilters] = useState({
    class: 'all_classes',
    gender: 'all_genders',
    status: 'all_statuses'
  });
  const [isNewAdmissionOpen, setIsNewAdmissionOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  
  // Chart data state - calculated from real student data
  const [classWiseData, setClassWiseData] = useState([]);
  const [genderDistribution, setGenderDistribution] = useState([]);
  const [monthlyAdmissions, setMonthlyAdmissions] = useState([]);
  const [admissionTrendData, setAdmissionTrendData] = useState([]);

  // New admission form state
  const [newStudent, setNewStudent] = useState({
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
    guardian_phone: '',
    admission_no: '',
    roll_no: ''
  });

  useEffect(() => {
    fetchData();
  }, [selectedYear, filters]);

  const fetchData = async () => {
    try {
      const [statsRes, studentsRes, classesRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats?year=${selectedYear}`),
        axios.get(`${API}/students?year=${selectedYear}`),
        axios.get(`${API}/classes`)
      ]);
      
      setStats(statsRes.data);
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
      
      // Calculate chart data from real student data
      calculateChartData(studentsRes.data, classesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load admission data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate chart data from real student data
  const calculateChartData = (studentsData, classesData) => {
    // 1. Class-wise Distribution - Use actual classes from API
    const classCount = {};
    
    // Count students per class
    studentsData.forEach(student => {
      const classId = student.class_id;
      classCount[classId] = (classCount[classId] || 0) + 1;
    });

    // Build chart data from actual classes in database
    const classWise = classesData.map(cls => ({
      class: cls.name,
      students: classCount[cls.id] || 0,
      capacity: cls.capacity || 40 // Use capacity from API or default to 40
    }));
    
    setClassWiseData(classWise);

    // 2. Gender Distribution (case-insensitive)
    const genderCount = {
      Male: 0,
      Female: 0,
      Other: 0
    };
    
    studentsData.forEach(student => {
      if (student.gender) {
        // Normalize gender to handle case variations
        const normalizedGender = student.gender.charAt(0).toUpperCase() + student.gender.slice(1).toLowerCase();
        if (genderCount[normalizedGender] !== undefined) {
          genderCount[normalizedGender]++;
        }
      }
    });

    const genderDist = [
      { name: 'Male', value: genderCount.Male, color: '#3B82F6' },
      { name: 'Female', value: genderCount.Female, color: '#EC4899' },
      { name: 'Other', value: genderCount.Other, color: '#8B5CF6' }
    ];
    setGenderDistribution(genderDist);

    // 3. Monthly Admissions (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const monthCounts = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]}`;
      monthCounts[monthKey] = 0;
    }
    
    // Count admissions by month
    studentsData.forEach(student => {
      if (student.created_at) {
        const admissionDate = new Date(student.created_at);
        const monthKey = monthNames[admissionDate.getMonth()];
        if (monthCounts[monthKey] !== undefined) {
          monthCounts[monthKey]++;
        }
      }
    });

    const monthlyAdm = Object.keys(monthCounts).map(month => ({
      month,
      count: monthCounts[month]
    }));
    setMonthlyAdmissions(monthlyAdm);

    // 4. Admission Trends (monthly with applications estimate)
    const trendData = Object.keys(monthCounts).map(month => ({
      month,
      admissions: monthCounts[month],
      applications: Math.ceil(monthCounts[month] * 1.15) // Estimate 15% more applications than admissions
    }));
    setAdmissionTrendData(trendData);
  };

  // Export functionality
  const handleExport = async () => {
    try {
      console.log('🔄 Starting export with format:', exportFormat);
      
      const response = await axios.get(`${API}/reports/admission-summary`, {
        params: { 
          format: exportFormat,
          year: selectedYear,
          ...filters
        },
        responseType: 'blob'
      });

      // Create blob and download
      const blob = new Blob([response.data], {
        type: exportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admission-summary-${selectedYear}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report exported successfully as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      
      // Fallback: Generate CSV client-side
      if (exportFormat === 'csv') {
        generateCSVFallback();
      } else {
        toast.error('Export failed. Please try again.');
      }
    }
  };

  const generateCSVFallback = () => {
    try {
      const csvData = [
        ['Student Name', 'Admission No', 'Class', 'Father Name', 'Phone', 'Admission Date'],
        ...students.map(student => [
          student.name,
          student.admission_no,
          getClassName(student.class_id),
          student.father_name,
          student.phone,
          new Date(student.created_at).toLocaleDateString()
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `admission-summary-${selectedYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV report generated successfully');
    } catch (error) {
      console.error('CSV generation failed:', error);
      toast.error('Failed to generate CSV report');
    }
  };

  // New admission functionality
  const handleNewAdmission = () => {
    console.log('🔄 Opening new admission form');
    setIsNewAdmissionOpen(true);
  };

  const handleSubmitNewAdmission = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API}/students`, newStudent);
      toast.success('New admission added successfully!');
      setIsNewAdmissionOpen(false);
      resetNewStudentForm();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to add new admission:', error);
      toast.error(error.response?.data?.detail || 'Failed to add admission');
    }
  };

  const resetNewStudentForm = () => {
    setNewStudent({
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
      guardian_phone: '',
      admission_no: '',
      roll_no: ''
    });
  };

  // Academic year change handler
  const handleYearChange = (year) => {
    console.log('🔄 Academic year changed to:', year);
    setSelectedYear(year);
    toast.success(`Switched to Academic Year ${year}`);
  };

  // Chart interaction handlers
  const handleChartClick = (data, chartType) => {
    console.log('📊 Chart clicked:', chartType, data);
    
    if (chartType === 'classwise' && data) {
      // Navigate to students page with class filter
      navigate(`/students?class=${data.class}`);
      toast.info(`Viewing students in ${data.class}`);
    } else if (chartType === 'gender' && data) {
      // Navigate to students page with gender filter
      navigate(`/students?gender=${data.name}`);
      toast.info(`Viewing ${data.name.toLowerCase()} students`);
    }
  };

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admission Summary</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive overview of student admissions and analytics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-25">Academic Year 2024-25</SelectItem>
              <SelectItem value="2023-24">Academic Year 2023-24</SelectItem>
              <SelectItem value="2022-23">Academic Year 2022-23</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Admission Report</DialogTitle>
                <DialogDescription>
                  Choose your preferred export format and options
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Class Filter</Label>
                    <Select 
                      value={filters.class} 
                      onValueChange={(value) => setFilters({...filters, class: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_classes">All Classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Gender Filter</Label>
                    <Select 
                      value={filters.gender} 
                      onValueChange={(value) => setFilters({...filters, gender: value})}
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
                  <div>
                    <Label>Status Filter</Label>
                    <Select 
                      value={filters.status} 
                      onValueChange={(value) => setFilters({...filters, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_statuses">All Status</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportFormat('pdf')}>
                  Cancel
                </Button>
                <Button onClick={handleExport} className="bg-emerald-500 hover:bg-emerald-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isNewAdmissionOpen} onOpenChange={setIsNewAdmissionOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={handleNewAdmission}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Admission
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Student Admission</DialogTitle>
                <DialogDescription>
                  Enter student details for new admission
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitNewAdmission} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admission_no">Admission Number *</Label>
                    <Input
                      id="admission_no"
                      value={newStudent.admission_no}
                      onChange={(e) => setNewStudent({...newStudent, admission_no: e.target.value})}
                      placeholder="Auto-generated if empty"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="roll_no">Roll Number *</Label>
                    <Input
                      id="roll_no"
                      value={newStudent.roll_no}
                      onChange={(e) => setNewStudent({...newStudent, roll_no: e.target.value})}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="student_name">Student Name *</Label>
                    <Input
                      id="student_name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="father_name">Father's Name *</Label>
                    <Input
                      id="father_name"
                      value={newStudent.father_name}
                      onChange={(e) => setNewStudent({...newStudent, father_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mother_name">Mother's Name *</Label>
                    <Input
                      id="mother_name"
                      value={newStudent.mother_name}
                      onChange={(e) => setNewStudent({...newStudent, mother_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={newStudent.date_of_birth}
                      onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select 
                      value={newStudent.gender} 
                      onValueChange={(value) => setNewStudent({...newStudent, gender: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="class">Class *</Label>
                    <Select 
                      value={newStudent.class_id} 
                      onValueChange={(value) => setNewStudent({...newStudent, class_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.standard})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardian_name">Guardian Name *</Label>
                    <Input
                      id="guardian_name"
                      value={newStudent.guardian_name}
                      onChange={(e) => setNewStudent({...newStudent, guardian_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardian_phone">Guardian Phone *</Label>
                    <Input
                      id="guardian_phone"
                      value={newStudent.guardian_phone}
                      onChange={(e) => setNewStudent({...newStudent, guardian_phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={newStudent.address}
                      onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsNewAdmissionOpen(false);
                      resetNewStudentForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                    Add Admission
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stats-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-3xl font-bold text-gray-900">{stats.total_students}</p>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12%
                  </Badge>
                </div>
              </div>
              <div className="p-3 rounded-full bg-emerald-500">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Admissions</p>
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-3xl font-bold text-gray-900">71</p>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +18%
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-3xl font-bold text-gray-900">15</p>
                  <Badge variant="outline" className="text-xs text-orange-600">
                    Pending Review
                  </Badge>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-3xl font-bold text-gray-900">{stats.total_classes}</p>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-500">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admission Trends */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              <span>Admission Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={admissionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stackId="1"
                  stroke="#94a3b8"
                  fill="#e2e8f0"
                  name="Applications"
                />
                <Area
                  type="monotone"
                  dataKey="admissions"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  name="Admissions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-blue-500" />
              <span>Gender Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data) => handleChartClick(data, 'gender')}
                  style={{ cursor: 'pointer' }}
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              {genderDistribution.map((entry, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => handleChartClick(entry, 'gender')}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Class-wise Student Distribution */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <span>Class-wise Student Distribution</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Current Capacity: {classWiseData.reduce((acc, curr) => acc + curr.students, 0)} / {classWiseData.reduce((acc, curr) => acc + curr.capacity, 0)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={classWiseData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onClick={(data) => handleChartClick(data?.activePayload?.[0]?.payload, 'classwise')}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                <Bar 
                  dataKey="capacity" 
                  fill="#e2e8f0" 
                  name="Capacity"
                />
                <Bar 
                  dataKey="students" 
                  fill="#8b5cf6" 
                  name="Current Students"
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admissions */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-emerald-500" />
              <span>Recent Admissions</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/students')}
            >
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent admissions found
              </div>
            ) : (
              students.slice(0, 5).map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">
                        Admission No: {student.admission_no} | Class: {getClassName(student.class_id)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Father: {student.father_name} | Guardian: {student.guardian_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        Roll No: {student.roll_no}
                      </Badge>
                      <p className="text-sm text-gray-500">
                        {new Date(student.created_at).toLocaleDateString()}
                      </p>
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-emerald-100 text-emerald-800 mt-1"
                      >
                        Approved
                      </Badge>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigate(`/students?id=${student.id}`);
                          toast.info(`Viewing ${student.name}'s details`);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigate(`/students?edit=${student.id}`);
                          toast.info(`Editing ${student.name}'s details`);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Admissions Chart */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Monthly Admission Count</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyAdmissions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionSummary;