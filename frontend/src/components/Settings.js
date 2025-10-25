import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { 
  Settings as SettingsIcon,
  Calendar,
  BookOpen,
  Clock,
  Award,
  Users,
  Building,
  Shield,
  Database,
  Bell,
  Plus,
  Trash2,
  Edit,
  Phone,
  Palette,
  Info,
  Globe
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSettings, setActiveSettings] = useState(12);
  const [loading, setLoading] = useState(false);
  
  const getTabFromPath = (pathname) => {
    const tabMap = {
      '/settings/academic': 'academic',
      '/settings/classes': 'classes',
      '/settings/timetable': 'timetable',
      '/settings/grades': 'grades',
      '/settings/curriculum': 'curriculum',
      '/settings/institution': 'institution',
      '/settings/staff': 'staff-settings',
      '/settings/permissions': 'permissions'
    };
    return tabMap[pathname] || 'academic';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    const newTab = getTabFromPath(location.pathname);
    setActiveTab(newTab);
  }, [location.pathname]);

  const handleTabChange = (value) => {
    const pathMap = {
      'academic': '/settings/academic',
      'classes': '/settings/classes',
      'timetable': '/settings/timetable',
      'grades': '/settings/grades',
      'curriculum': '/settings/curriculum',
      'institution': '/settings/institution',
      'staff-settings': '/settings/staff',
      'permissions': '/settings/permissions'
    };
    setActiveTab(value);
    navigate(pathMap[value] || '/settings');
  };
  
  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  
  // Modal states
  const [isAcademicYearModalOpen, setIsAcademicYearModalOpen] = useState(false);
  const [isSemesterSystemModalOpen, setIsSemesterSystemModalOpen] = useState(false);
  const [isHolidayCalendarModalOpen, setIsHolidayCalendarModalOpen] = useState(false);
  const [isTermDatesModalOpen, setIsTermDatesModalOpen] = useState(false);
  
  // Configuration states
  const [academicYearConfig, setAcademicYearConfig] = useState({
    currentYear: "2024-25",
    startDate: "2024-04-01",
    endDate: "2025-03-31",
    isActive: true,
    description: "Academic year 2024-25"
  });
  
  const [semesterSystemConfig, setSemesterSystemConfig] = useState({
    systemType: "semester", // semester, trimester, quarter
    numberOfPeriods: 2,
    periods: [
      { name: "First Semester", startDate: "2024-04-01", endDate: "2024-09-30" },
      { name: "Second Semester", startDate: "2024-10-01", endDate: "2025-03-31" }
    ]
  });
  
  const [holidayCalendarConfig, setHolidayCalendarConfig] = useState({
    holidays: [
      { id: 1, name: "Independence Day", date: "2024-08-15", type: "national" },
      { id: 2, name: "Gandhi Jayanti", date: "2024-10-02", type: "national" },
      { id: 3, name: "Winter Break", startDate: "2024-12-25", endDate: "2025-01-05", type: "school_break" }
    ]
  });
  
  const [termDatesConfig, setTermDatesConfig] = useState({
    terms: [
      { id: 1, name: "First Term", startDate: "2024-04-01", endDate: "2024-07-31" },
      { id: 2, name: "Second Term", startDate: "2024-08-01", endDate: "2024-11-30" },
      { id: 3, name: "Third Term", startDate: "2024-12-01", endDate: "2025-03-31" }
    ]
  });

  // Class Management State
  const [isViewClassesModalOpen, setIsViewClassesModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [editingClass, setEditingClass] = useState(null);
  const [classFormData, setClassFormData] = useState({
    name: '',
    standard: '',
    sections: ['A'],
    description: ''
  });

  // Timetable Management State
  const [isViewTimetableModalOpen, setIsViewTimetableModalOpen] = useState(false);
  const [isCreateScheduleModalOpen, setIsCreateScheduleModalOpen] = useState(false);
  const [isEditScheduleMode, setIsEditScheduleMode] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    class_id: '',
    class_name: '',
    standard: '',
    academic_year: '2024-25',
    effective_from: new Date().toISOString().split('T')[0],
    total_periods_per_day: 8,
    break_periods: [4, 7]
  });

  // Grading System State
  const [isViewGradesModalOpen, setIsViewGradesModalOpen] = useState(false);
  const [isConfigureGradingModalOpen, setIsConfigureGradingModalOpen] = useState(false);
  const [isEditGradingMode, setIsEditGradingMode] = useState(false);
  const [gradingScales, setGradingScales] = useState([]);
  const [editingGradingScale, setEditingGradingScale] = useState(null);
  const [gradingFormData, setGradingFormData] = useState({
    scale_name: '',
    scale_type: 'percentage',
    max_gpa: 10.0,
    passing_grade: 'D',
    is_default: false,
    applicable_standards: ['all'],
    grade_boundaries: [
      { grade: 'A+', min_marks: 90, max_marks: 100, grade_point: 10.0, description: 'Outstanding' },
      { grade: 'A', min_marks: 80, max_marks: 89, grade_point: 9.0, description: 'Excellent' },
      { grade: 'B+', min_marks: 70, max_marks: 79, grade_point: 8.0, description: 'Very Good' },
      { grade: 'B', min_marks: 60, max_marks: 69, grade_point: 7.0, description: 'Good' },
      { grade: 'C+', min_marks: 50, max_marks: 59, grade_point: 6.0, description: 'Above Average' },
      { grade: 'C', min_marks: 40, max_marks: 49, grade_point: 5.0, description: 'Average' },
      { grade: 'D', min_marks: 33, max_marks: 39, grade_point: 4.0, description: 'Pass' },
      { grade: 'F', min_marks: 0, max_marks: 32, grade_point: 0.0, description: 'Fail' }
    ]
  });

  // Curriculum Management State
  const [isCurriculumDashboardOpen, setIsCurriculumDashboardOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isEditSubjectMode, setIsEditSubjectMode] = useState(false);
  const [isSyllabusBuilderOpen, setIsSyllabusBuilderOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [subjectFormData, setSubjectFormData] = useState({
    subject_name: '',
    subject_code: '',
    class_standard: '6th',
    credits: 1.0,
    description: '',
    total_hours: null,
    is_elective: false,
    prerequisites: [],
    syllabus: []
  });

  // Institution Management State
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);
  const [institutionData, setInstitutionData] = useState({
    school_name: '',
    school_code: '',
    school_type: '',
    established_year: null,
    address: '',
    phone: '',
    email: '',
    website: '',
    logo_url: '',
    theme_color: '#10b981',
    principal_name: '',
    motto: '',
    vision: '',
    social_links: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  // Staff Settings State
  const [isStaffSettingsModalOpen, setIsStaffSettingsModalOpen] = useState(false);
  const [staffRoles, setStaffRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [activeSettingsTab, setActiveSettingsTab] = useState('roles');
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  const [isAddEmploymentModalOpen, setIsAddEmploymentModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingEmploymentType, setEditingEmploymentType] = useState(null);
  const [roleFormData, setRoleFormData] = useState({
    role_name: '',
    description: '',
    is_active: true
  });
  const [departmentFormData, setDepartmentFormData] = useState({
    department_name: '',
    description: '',
    head_id: null,
    is_active: true
  });
  const [employmentFormData, setEmploymentFormData] = useState({
    type_name: '',
    description: '',
    is_active: true
  });

  // Role Permissions (RBAC) State
  const [isViewRolesModalOpen, setIsViewRolesModalOpen] = useState(false);
  const [isManagePermissionsModalOpen, setIsManagePermissionsModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [editingPermissionRole, setEditingPermissionRole] = useState(null);
  const [permissionFormData, setPermissionFormData] = useState({
    role_name: '',
    description: '',
    permissions: {},
    is_active: true
  });

  // Permission modules configuration
  const permissionModules = [
    { key: 'students', label: 'Students' },
    { key: 'classes', label: 'Classes' },
    { key: 'fees', label: 'Fees' },
    { key: 'reports', label: 'Reports' },
    { key: 'staff', label: 'Staff Management' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'timetable', label: 'Timetable' },
    { key: 'exams', label: 'Exams & Grades' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'transport', label: 'Transport' },
    { key: 'accounts', label: 'Accounts' }
  ];

  // Configuration button handlers with data loading
  const handleEditAcademicYear = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/settings/academic-year`, {
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

  const handleConfigureSemesterSystem = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/settings/semester-system`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setSemesterSystemConfig(response.data);
      }
    } catch (error) {
      console.error('Error loading semester system config:', error);
      toast.error('Failed to load semester system configuration');
    } finally {
      setLoading(false);
    }
    setIsSemesterSystemModalOpen(true);
  };

  const handleManageHolidays = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/settings/holidays`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.holidays) {
        setHolidayCalendarConfig(response.data);
      }
    } catch (error) {
      console.error('Error loading holiday calendar config:', error);
      toast.error('Failed to load holiday calendar configuration');
    } finally {
      setLoading(false);
    }
    setIsHolidayCalendarModalOpen(true);
  };

  const handleSetTermDates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/settings/term-dates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.terms) {
        setTermDatesConfig(response.data);
      }
    } catch (error) {
      console.error('Error loading term dates config:', error);
      toast.error('Failed to load term dates configuration');
    } finally {
      setLoading(false);
    }
    setIsTermDatesModalOpen(true);
  };

  // Save configuration handlers
  const handleSaveAcademicYear = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/settings/academic-year`, academicYearConfig, {
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

  const handleSaveSemesterSystem = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/settings/semester-system`, semesterSystemConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Semester system configuration saved successfully!');
      setIsSemesterSystemModalOpen(false);
    } catch (error) {
      console.error('Error saving semester system config:', error);
      toast.error('Failed to save semester system configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHolidayCalendar = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/settings/holidays`, holidayCalendarConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Holiday calendar saved successfully!');
      setIsHolidayCalendarModalOpen(false);
    } catch (error) {
      console.error('Error saving holiday calendar config:', error);
      toast.error('Failed to save holiday calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTermDates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/settings/term-dates`, termDatesConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Term dates configuration saved successfully!');
      setIsTermDatesModalOpen(false);
    } catch (error) {
      console.error('Error saving term dates config:', error);
      toast.error('Failed to save term dates configuration');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for managing holidays and terms
  const addNewHoliday = () => {
    const newHoliday = {
      id: Date.now(),
      name: '',
      date: '',
      type: 'national'
    };
    setHolidayCalendarConfig({
      ...holidayCalendarConfig,
      holidays: [...holidayCalendarConfig.holidays, newHoliday]
    });
  };

  const updateHoliday = (id, field, value) => {
    const updatedHolidays = holidayCalendarConfig.holidays.map(holiday =>
      holiday.id === id ? { ...holiday, [field]: value } : holiday
    );
    setHolidayCalendarConfig({ ...holidayCalendarConfig, holidays: updatedHolidays });
  };

  const removeHoliday = (id) => {
    const updatedHolidays = holidayCalendarConfig.holidays.filter(holiday => holiday.id !== id);
    setHolidayCalendarConfig({ ...holidayCalendarConfig, holidays: updatedHolidays });
  };

  const addNewTerm = () => {
    const newTerm = {
      id: Date.now(),
      name: '',
      startDate: '',
      endDate: ''
    };
    setTermDatesConfig({
      ...termDatesConfig,
      terms: [...termDatesConfig.terms, newTerm]
    });
  };

  const updateTerm = (id, field, value) => {
    const updatedTerms = termDatesConfig.terms.map(term =>
      term.id === id ? { ...term, [field]: value } : term
    );
    setTermDatesConfig({ ...termDatesConfig, terms: updatedTerms });
  };

  const removeTerm = (id) => {
    const updatedTerms = termDatesConfig.terms.filter(term => term.id !== id);
    setTermDatesConfig({ ...termDatesConfig, terms: updatedTerms });
  };

  // Class Management Handlers
  const handleViewClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
    setIsViewClassesModalOpen(true);
  };

  const handleAddNewClass = () => {
    setClassFormData({
      name: '',
      standard: '',
      sections: ['A'],
      description: ''
    });
    setIsAddClassModalOpen(true);
  };

  const handleSaveClass = async () => {
    // Client-side validation
    if (!classFormData.name.trim()) {
      toast.error('Class name is required');
      return;
    }
    if (!classFormData.standard) {
      toast.error('Standard is required');
      return;
    }
    if (classFormData.sections.length === 0) {
      toast.error('At least one section is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Send only the data needed by backend (let backend generate ID)
      const classData = {
        name: classFormData.name.trim(),
        standard: classFormData.standard,
        max_students: 60, // Default value
        class_teacher_id: null // No teacher assigned initially
      };
      
      await axios.post(`${API_BASE_URL}/classes`, classData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Class added successfully!');
      setIsAddClassModalOpen(false);
      
      // Reset form
      setClassFormData({
        name: '',
        standard: '',
        sections: ['A'],
        description: ''
      });
      
      // Refresh classes list if view modal is open
      if (isViewClassesModalOpen) {
        handleViewClasses();
      }
    } catch (error) {
      console.error('Error saving class:', error);
      if (error.response?.status === 422) {
        toast.error('Invalid class data. Please check all fields.');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.detail || 'Class with this name might already exist');
      } else {
        toast.error('Failed to add class. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setClassFormData({
      name: classItem.name || '',
      standard: classItem.standard || '',
      sections: classItem.sections || ['A'],
      description: classItem.description || ''
    });
    setIsEditClassModalOpen(true);
  };

  const handleUpdateClass = async () => {
    // Client-side validation
    if (!classFormData.name.trim()) {
      toast.error('Class name is required');
      return;
    }
    if (!classFormData.standard) {
      toast.error('Standard is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const updateData = {
        name: classFormData.name.trim(),
        standard: classFormData.standard,
        max_students: 60 // Keep existing or default
      };
      
      await axios.put(`${API_BASE_URL}/classes/${editingClass.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Class updated successfully!');
      setIsEditClassModalOpen(false);
      setEditingClass(null);
      
      // Reset form
      setClassFormData({
        name: '',
        standard: '',
        sections: ['A'],
        description: ''
      });
      
      // Refresh classes list
      handleViewClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      if (error.response?.status === 422) {
        toast.error('Invalid class data. Please check all fields.');
      } else if (error.response?.status === 404) {
        toast.error('Class not found. It may have been deleted.');
      } else {
        toast.error('Failed to update class. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Class deleted successfully!');
      // Refresh classes list
      handleViewClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for class management
  const addSection = () => {
    const newSection = String.fromCharCode(65 + classFormData.sections.length); // A, B, C, etc.
    setClassFormData({
      ...classFormData,
      sections: [...classFormData.sections, newSection]
    });
  };

  const removeSection = (index) => {
    const updatedSections = classFormData.sections.filter((_, i) => i !== index);
    setClassFormData({ ...classFormData, sections: updatedSections });
  };

  // ==================== TIMETABLE HANDLERS ====================

  const handleViewTimetable = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/timetables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTimetables(response.data);
      setIsViewTimetableModalOpen(true);
    } catch (error) {
      console.error('Error fetching timetables:', error);
      toast.error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch classes to populate dropdown
      const classesResponse = await axios.get(`${API_BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setClasses(classesResponse.data);
      
      // Reset to create mode
      setIsEditScheduleMode(false);
      setEditingTimetable(null);
      setScheduleFormData({
        class_id: '',
        class_name: '',
        standard: '',
        academic_year: '2024-25',
        effective_from: new Date().toISOString().split('T')[0],
        total_periods_per_day: 8,
        break_periods: [4, 7]
      });
      
      setIsCreateScheduleModalOpen(true);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = async (timetable) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch classes to populate dropdown
      const classesResponse = await axios.get(`${API_BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setClasses(classesResponse.data);
      
      // Set to edit mode
      setIsEditScheduleMode(true);
      setEditingTimetable(timetable);
      setScheduleFormData({
        class_id: timetable.class_id,
        class_name: timetable.class_name,
        standard: timetable.standard,
        academic_year: timetable.academic_year,
        effective_from: timetable.effective_from,
        total_periods_per_day: timetable.total_periods_per_day,
        break_periods: timetable.break_periods
      });
      
      setIsCreateScheduleModalOpen(true);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingTimetableForClass = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/timetables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.find(timetable => timetable.class_id === classId);
    } catch (error) {
      console.error('Error checking existing timetables:', error);
      return null;
    }
  };

  const handleSaveSchedule = async () => {
    // Client-side validation
    if (!scheduleFormData.class_id) {
      toast.error('Please select a class');
      return;
    }
    if (!scheduleFormData.class_name.trim()) {
      toast.error('Class name is required');
      return;
    }
    if (!scheduleFormData.effective_from) {
      toast.error('Effective from date is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const scheduleData = {
        class_id: scheduleFormData.class_id,
        class_name: scheduleFormData.class_name,
        standard: scheduleFormData.standard,
        academic_year: scheduleFormData.academic_year,
        effective_from: scheduleFormData.effective_from,
        total_periods_per_day: scheduleFormData.total_periods_per_day,
        break_periods: scheduleFormData.break_periods
      };

      if (isEditScheduleMode && editingTimetable) {
        // Update existing timetable
        await axios.put(`${API_BASE_URL}/timetables/${editingTimetable.id}`, scheduleData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('Schedule updated successfully!');
      } else {
        // Check if timetable already exists for this class
        const existingTimetable = await checkExistingTimetableForClass(scheduleFormData.class_id);
        
        if (existingTimetable) {
          const shouldEdit = window.confirm(
            `A timetable already exists for class "${scheduleFormData.class_name}". Would you like to edit it instead of creating a new one?`
          );
          
          if (shouldEdit) {
            // Switch to edit mode
            await handleEditSchedule(existingTimetable);
            return;
          } else {
            toast.error('Cannot create duplicate timetable for the same class');
            return;
          }
        }
        
        // Create new timetable
        await axios.post(`${API_BASE_URL}/timetables`, scheduleData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('Schedule created successfully!');
      }
      
      setIsCreateScheduleModalOpen(false);
      setIsEditScheduleMode(false);
      setEditingTimetable(null);
      
      // Reset form
      setScheduleFormData({
        class_id: '',
        class_name: '',
        standard: '',
        academic_year: '2024-25',
        effective_from: new Date().toISOString().split('T')[0],
        total_periods_per_day: 8,
        break_periods: [4, 7]
      });
      
      // Refresh timetables if view modal is open
      if (isViewTimetableModalOpen) {
        handleViewTimetable();
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      if (error.response?.status === 400) {
        const message = error.response.data?.detail || 'Validation error';
        if (message.includes('already exists')) {
          toast.error('Timetable already exists for this class. Please edit the existing one.');
        } else {
          toast.error(message);
        }
      } else if (error.response?.status === 422) {
        toast.error('Invalid schedule data. Please check all fields.');
      } else if (error.response?.status === 404) {
        toast.error('Timetable not found. It may have been deleted.');
      } else {
        toast.error(`Failed to ${isEditScheduleMode ? 'update' : 'create'} schedule. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimetable = async (timetableId) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/timetables/${timetableId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Timetable deleted successfully!');
      
      // Refresh timetables list
      handleViewTimetable();
    } catch (error) {
      console.error('Error deleting timetable:', error);
      toast.error('Failed to delete timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTimetableDetails = (timetable) => {
    // For now, just show an alert with timetable info
    // In the future, this could open a detailed weekly schedule modal
    alert(`Timetable Details:\n\nClass: ${timetable.class_name}\nStandard: ${timetable.standard}\nAcademic Year: ${timetable.academic_year}\nTotal Periods: ${timetable.total_periods_per_day}\nBreak Periods: ${timetable.break_periods.join(', ')}\n\nDetailed weekly schedule view coming soon!`);
  };

  // ==================== GRADING SYSTEM HANDLERS ====================

  const handleViewGrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/grading-scales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGradingScales(response.data);
      setIsViewGradesModalOpen(true);
    } catch (error) {
      console.error('Error fetching grading scales:', error);
      toast.error('Failed to load grading scales');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureGrading = async () => {
    try {
      setLoading(true);
      
      // Reset to create mode
      setIsEditGradingMode(false);
      setEditingGradingScale(null);
      setGradingFormData({
        scale_name: '',
        scale_type: 'percentage',
        max_gpa: 10.0,
        passing_grade: 'D',
        is_default: false,
        applicable_standards: ['all'],
        grade_boundaries: [
          { grade: 'A+', min_marks: 90, max_marks: 100, grade_point: 10.0, description: 'Outstanding' },
          { grade: 'A', min_marks: 80, max_marks: 89, grade_point: 9.0, description: 'Excellent' },
          { grade: 'B+', min_marks: 70, max_marks: 79, grade_point: 8.0, description: 'Very Good' },
          { grade: 'B', min_marks: 60, max_marks: 69, grade_point: 7.0, description: 'Good' },
          { grade: 'C+', min_marks: 50, max_marks: 59, grade_point: 6.0, description: 'Above Average' },
          { grade: 'C', min_marks: 40, max_marks: 49, grade_point: 5.0, description: 'Average' },
          { grade: 'D', min_marks: 33, max_marks: 39, grade_point: 4.0, description: 'Pass' },
          { grade: 'F', min_marks: 0, max_marks: 32, grade_point: 0.0, description: 'Fail' }
        ]
      });
      
      setIsConfigureGradingModalOpen(true);
    } catch (error) {
      console.error('Error opening grading configuration:', error);
      toast.error('Failed to open grading configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGradingScale = (scale) => {
    setIsEditGradingMode(true);
    setEditingGradingScale(scale);
    setGradingFormData({
      scale_name: scale.scale_name,
      scale_type: scale.scale_type,
      max_gpa: scale.max_gpa,
      passing_grade: scale.passing_grade,
      is_default: scale.is_default,
      applicable_standards: scale.applicable_standards || ['all'],
      grade_boundaries: scale.grade_boundaries || []
    });
    setIsViewGradesModalOpen(false);
    setIsConfigureGradingModalOpen(true);
  };

  const handleSaveGradingScale = async () => {
    if (!gradingFormData.scale_name.trim()) {
      toast.error('Please enter a scale name');
      return;
    }

    if (gradingFormData.grade_boundaries.length === 0) {
      toast.error('Please add at least one grade boundary');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (isEditGradingMode && editingGradingScale) {
        // Update existing grading scale
        await axios.put(
          `${API_BASE_URL}/grading-scales/${editingGradingScale.id}`,
          gradingFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Grading scale updated successfully!');
      } else {
        // Create new grading scale
        await axios.post(
          `${API_BASE_URL}/grading-scales`,
          gradingFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Grading scale created successfully!');
      }
      
      setIsConfigureGradingModalOpen(false);
      
      // Refresh grading scales if view modal was open
      if (isViewGradesModalOpen) {
        handleViewGrades();
      }
    } catch (error) {
      console.error('Error saving grading scale:', error);
      if (error.response?.status === 400) {
        const message = error.response.data?.detail || 'Validation error';
        if (message.includes('already exists')) {
          toast.error('Grading scale with this name already exists. Please use a different name.');
        } else {
          toast.error(message);
        }
      } else {
        toast.error(`Failed to ${isEditGradingMode ? 'update' : 'create'} grading scale. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGradingScale = async (scaleId) => {
    if (!window.confirm('Are you sure you want to delete this grading scale?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/grading-scales/${scaleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Grading scale deleted successfully!');
      
      // Refresh grading scales list
      handleViewGrades();
    } catch (error) {
      console.error('Error deleting grading scale:', error);
      toast.error('Failed to delete grading scale');
    } finally {
      setLoading(false);
    }
  };

  // ==================== CURRICULUM MANAGEMENT HANDLERS ====================

  const handleManageCurriculum = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSubjects(response.data);
      setIsCurriculumDashboardOpen(true);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    setIsEditSubjectMode(false);
    setEditingSubject(null);
    setSubjectFormData({
      subject_name: '',
      subject_code: '',
      class_standard: '6th',
      credits: 1.0,
      description: '',
      total_hours: null,
      is_elective: false,
      prerequisites: [],
      syllabus: []
    });
    setIsAddSubjectModalOpen(true);
  };

  const handleEditSubject = (subject) => {
    setIsEditSubjectMode(true);
    setEditingSubject(subject);
    setSubjectFormData({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code,
      class_standard: subject.class_standard,
      credits: subject.credits || 1.0,
      description: subject.description || '',
      total_hours: subject.total_hours,
      is_elective: subject.is_elective,
      prerequisites: subject.prerequisites || [],
      syllabus: subject.syllabus || []
    });
    setIsAddSubjectModalOpen(true);
  };

  const handleSaveSubject = async () => {
    if (!subjectFormData.subject_name.trim() || !subjectFormData.subject_code.trim()) {
      toast.error('Please enter subject name and code');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (isEditSubjectMode && editingSubject) {
        // Update existing subject
        await axios.put(
          `${API_BASE_URL}/subjects/${editingSubject.id}`,
          subjectFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Subject updated successfully!');
      } else {
        // Create new subject
        await axios.post(
          `${API_BASE_URL}/subjects`,
          subjectFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Subject created successfully!');
      }
      
      setIsAddSubjectModalOpen(false);
      
      // Refresh subjects list
      handleManageCurriculum();
    } catch (error) {
      console.error('Error saving subject:', error);
      if (error.response?.status === 400) {
        const message = error.response.data?.detail || 'Validation error';
        if (message.includes('already exists')) {
          toast.error('Subject with this code already exists for this class. Please use a different code.');
        } else {
          toast.error(message);
        }
      } else {
        toast.error(`Failed to ${isEditSubjectMode ? 'update' : 'create'} subject. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject? This will also delete all associated syllabus data.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/subjects/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Subject deleted successfully!');
      
      // Refresh subjects list
      handleManageCurriculum();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSyllabusBuilder = async (subject) => {
    setEditingSubject(subject);
    setSubjectFormData({
      ...subject,
      syllabus: subject.syllabus || []
    });
    setIsSyllabusBuilderOpen(true);
  };

  const handleSaveSyllabus = async () => {
    if (!editingSubject) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/subjects/${editingSubject.id}/syllabus`,
        subjectFormData.syllabus,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Syllabus updated successfully!');
      setIsSyllabusBuilderOpen(false);
      
      // Refresh subjects list
      handleManageCurriculum();
    } catch (error) {
      console.error('Error saving syllabus:', error);
      toast.error('Failed to save syllabus');
    } finally {
      setLoading(false);
    }
  };

  const addSyllabusUnit = () => {
    const newUnit = {
      unit_number: (subjectFormData.syllabus?.length || 0) + 1,
      unit_name: '',
      description: '',
      topics: [],
      estimated_duration: null,
      is_completed: false,
      completion_percentage: 0
    };
    setSubjectFormData({
      ...subjectFormData,
      syllabus: [...(subjectFormData.syllabus || []), newUnit]
    });
  };

  const updateSyllabusUnit = (unitIndex, field, value) => {
    const updatedSyllabus = [...(subjectFormData.syllabus || [])];
    updatedSyllabus[unitIndex] = {
      ...updatedSyllabus[unitIndex],
      [field]: value
    };
    setSubjectFormData({
      ...subjectFormData,
      syllabus: updatedSyllabus
    });
  };

  const addTopicToUnit = (unitIndex) => {
    const updatedSyllabus = [...(subjectFormData.syllabus || [])];
    const newTopic = {
      topic_name: '',
      duration_hours: null,
      learning_objectives: [],
      is_completed: false,
      completion_percentage: 0
    };
    updatedSyllabus[unitIndex].topics = [
      ...(updatedSyllabus[unitIndex].topics || []),
      newTopic
    ];
    setSubjectFormData({
      ...subjectFormData,
      syllabus: updatedSyllabus
    });
  };

  const updateTopic = (unitIndex, topicIndex, field, value) => {
    const updatedSyllabus = [...(subjectFormData.syllabus || [])];
    updatedSyllabus[unitIndex].topics[topicIndex] = {
      ...updatedSyllabus[unitIndex].topics[topicIndex],
      [field]: value
    };
    setSubjectFormData({
      ...subjectFormData,
      syllabus: updatedSyllabus
    });
  };

  const addLearningObjective = (unitIndex, topicIndex) => {
    const updatedSyllabus = [...(subjectFormData.syllabus || [])];
    const newObjective = {
      objective: '',
      is_completed: false,
      completion_date: null
    };
    updatedSyllabus[unitIndex].topics[topicIndex].learning_objectives = [
      ...(updatedSyllabus[unitIndex].topics[topicIndex].learning_objectives || []),
      newObjective
    ];
    setSubjectFormData({
      ...subjectFormData,
      syllabus: updatedSyllabus
    });
  };

  const updateLearningObjective = (unitIndex, topicIndex, objIndex, field, value) => {
    const updatedSyllabus = [...(subjectFormData.syllabus || [])];
    updatedSyllabus[unitIndex].topics[topicIndex].learning_objectives[objIndex] = {
      ...updatedSyllabus[unitIndex].topics[topicIndex].learning_objectives[objIndex],
      [field]: value
    };
    setSubjectFormData({
      ...subjectFormData,
      syllabus: updatedSyllabus
    });
  };

  const deleteSyllabusUnit = (unitIndex) => {
    const updatedSyllabus = subjectFormData.syllabus.filter((_, index) => index !== unitIndex);
    setSubjectFormData({
      ...subjectFormData,
      syllabus: updatedSyllabus
    });
  };

  const deleteTopic = (unitIndex, topicIndex) => {
    const updatedSyllabus = [...subjectFormData.syllabus];
    updatedSyllabus[unitIndex].topics = updatedSyllabus[unitIndex].topics.filter(
      (_, index) => index !== topicIndex
    );
    setSubjectFormData({
      ...subjectFormData,
      syllabus: updatedSyllabus
    });
  };

  const deleteLearningObjective = (unitIndex, topicIndex, objIndex) => {
    const updatedSyllabus = [...subjectFormData.syllabus];
    updatedSyllabus[unitIndex].topics[topicIndex].learning_objectives = 
      updatedSyllabus[unitIndex].topics[topicIndex].learning_objectives.filter(
        (_, index) => index !== objIndex
      );
    setSubjectFormData({
      ...subjectFormData,
      syllabus: updatedSyllabus
    });
  };

  const calculateSubjectProgress = (subject) => {
    if (!subject.syllabus || subject.syllabus.length === 0) return 0;
    
    let totalTopics = 0;
    let completedTopics = 0;
    
    subject.syllabus.forEach(unit => {
      unit.topics?.forEach(topic => {
        totalTopics++;
        if (topic.is_completed) completedTopics++;
      });
    });
    
    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  };

  // ==================== INSTITUTION MANAGEMENT HANDLERS ====================

  const handleUpdateInstitution = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch existing institution data
      const response = await axios.get(`${API_BASE_URL}/institution`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setInstitutionData({
          school_name: response.data.school_name || '',
          school_code: response.data.school_code || '',
          school_type: response.data.school_type || '',
          established_year: response.data.established_year || null,
          address: response.data.address || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          website: response.data.website || '',
          logo_url: response.data.logo_url || '',
          theme_color: response.data.theme_color || '#10b981',
          principal_name: response.data.principal_name || '',
          motto: response.data.motto || '',
          vision: response.data.vision || '',
          social_links: response.data.social_links || {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
          }
        });
      }
    } catch (error) {
      console.error('Error loading institution data:', error);
      toast.error('Failed to load institution details');
    } finally {
      setLoading(false);
    }
    setIsInstitutionModalOpen(true);
  };

  const handleSaveInstitution = async () => {
    if (!institutionData.school_name.trim()) {
      toast.error('Please enter school name');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/institution`,
        institutionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Institution details updated successfully!');
      setIsInstitutionModalOpen(false);
    } catch (error) {
      console.error('Error saving institution:', error);
      toast.error('Failed to update institution details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== STAFF SETTINGS HANDLERS ====================

  const handleOpenStaffSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/staff/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setStaffRoles(response.data.roles || []);
        setDepartments(response.data.departments || []);
        setEmploymentTypes(response.data.employment_types || []);
      }
    } catch (error) {
      console.error('Error loading staff settings:', error);
      toast.error('Failed to load staff settings');
    } finally {
      setLoading(false);
    }
    setIsStaffSettingsModalOpen(true);
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleFormData({ role_name: '', description: '', is_active: true });
    setIsAddRoleModalOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleFormData({
      role_name: role.role_name,
      description: role.description || '',
      is_active: role.is_active
    });
    setIsAddRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!roleFormData.role_name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editingRole) {
        await axios.put(
          `${API_BASE_URL}/staff/roles/${editingRole.id}`,
          roleFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Role updated successfully!');
      } else {
        await axios.post(
          `${API_BASE_URL}/staff/roles`,
          roleFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Role added successfully!');
      }
      
      setIsAddRoleModalOpen(false);
      handleOpenStaffSettings();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(error.response?.data?.detail || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/staff/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Role deleted successfully!');
      handleOpenStaffSettings();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setDepartmentFormData({ department_name: '', description: '', head_id: null, is_active: true });
    setIsAddDepartmentModalOpen(true);
  };

  const handleEditDepartment = (dept) => {
    setEditingDepartment(dept);
    setDepartmentFormData({
      department_name: dept.department_name,
      description: dept.description || '',
      head_id: dept.head_id,
      is_active: dept.is_active
    });
    setIsAddDepartmentModalOpen(true);
  };

  const handleSaveDepartment = async () => {
    if (!departmentFormData.department_name.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editingDepartment) {
        await axios.put(
          `${API_BASE_URL}/staff/departments/${editingDepartment.id}`,
          departmentFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Department updated successfully!');
      } else {
        await axios.post(
          `${API_BASE_URL}/staff/departments`,
          departmentFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Department added successfully!');
      }
      
      setIsAddDepartmentModalOpen(false);
      handleOpenStaffSettings();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error.response?.data?.detail || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/staff/departments/${deptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Department deleted successfully!');
      handleOpenStaffSettings();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmploymentType = () => {
    setEditingEmploymentType(null);
    setEmploymentFormData({ type_name: '', description: '', is_active: true });
    setIsAddEmploymentModalOpen(true);
  };

  const handleEditEmploymentType = (emp) => {
    setEditingEmploymentType(emp);
    setEmploymentFormData({
      type_name: emp.type_name,
      description: emp.description || '',
      is_active: emp.is_active
    });
    setIsAddEmploymentModalOpen(true);
  };

  const handleSaveEmploymentType = async () => {
    if (!employmentFormData.type_name.trim()) {
      toast.error('Employment type name is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editingEmploymentType) {
        await axios.put(
          `${API_BASE_URL}/staff/employment-types/${editingEmploymentType.id}`,
          employmentFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Employment type updated successfully!');
      } else {
        await axios.post(
          `${API_BASE_URL}/staff/employment-types`,
          employmentFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Employment type added successfully!');
      }
      
      setIsAddEmploymentModalOpen(false);
      handleOpenStaffSettings();
    } catch (error) {
      console.error('Error saving employment type:', error);
      toast.error(error.response?.data?.detail || 'Failed to save employment type');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmploymentType = async (empId) => {
    if (!window.confirm('Are you sure you want to delete this employment type?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/staff/employment-types/${empId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Employment type deleted successfully!');
      handleOpenStaffSettings();
    } catch (error) {
      console.error('Error deleting employment type:', error);
      toast.error('Failed to delete employment type');
    } finally {
      setLoading(false);
    }
  };

  // ==================== ROLE PERMISSIONS HANDLERS ====================

  const handleViewRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setRoles(response.data.roles || []);
      }
      setIsViewRolesModalOpen(true);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleManagePermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setRoles(response.data.roles || []);
      }
      
      setEditingPermissionRole(null);
      const defaultPermissions = {};
      permissionModules.forEach(module => {
        defaultPermissions[module.key] = {
          create: false,
          read: false,
          update: false,
          delete: false
        };
      });
      setPermissionFormData({
        role_name: '',
        description: '',
        permissions: defaultPermissions,
        is_active: true
      });
      setIsManagePermissionsModalOpen(true);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRolePermissions = (role) => {
    setEditingPermissionRole(role);
    const permissions = role.permissions || {};
    const defaultPermissions = {};
    permissionModules.forEach(module => {
      defaultPermissions[module.key] = permissions[module.key] || {
        create: false,
        read: false,
        update: false,
        delete: false
      };
    });
    setPermissionFormData({
      role_name: role.role_name,
      description: role.description || '',
      permissions: defaultPermissions,
      is_active: role.is_active !== false
    });
    setIsManagePermissionsModalOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!permissionFormData.role_name) {
      toast.error('Please enter a role name');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editingPermissionRole) {
        await axios.put(
          `${API_BASE_URL}/roles/${editingPermissionRole.id}`,
          permissionFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Role permissions updated successfully!');
      } else {
        await axios.post(
          `${API_BASE_URL}/roles`,
          permissionFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Role created successfully!');
      }
      
      setIsManagePermissionsModalOpen(false);
      await handleViewRoles();
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast.error(error.response?.data?.detail || 'Failed to save role permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRolePermission = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Role deleted successfully!');
      await handleViewRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (moduleKey, permission) => {
    setPermissionFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          ...prev.permissions[moduleKey],
          [permission]: !prev.permissions[moduleKey]?.[permission]
        }
      }
    }));
  };

  const settingsCategories = [
    {
      title: 'Academic Settings',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      settings: [
        'Academic Periods',
        'Academic Calendar',
        'Grading System',
        'Examination Settings'
      ]
    },
    {
      title: 'Class Management',
      icon: BookOpen,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100',
      settings: [
        'Manage Classes',
        'Time Table',
        'Subject Management',
        'Class Assignments'
      ]
    },
    {
      title: 'Staff Configuration',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      settings: [
        'Staff Categories',
        'Role Permissions',
        'Department Setup',
        'Salary Structure'
      ]
    },
    {
      title: 'System Settings',
      icon: SettingsIcon,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      settings: [
        'General Settings',
        'Backup Configuration',
        'Security Settings',
        'Integration Settings'
      ]
    }
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure system settings and preferences</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Backup Settings
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <SettingsIcon className="h-4 w-4 mr-2" />
            System Configuration
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Settings</p>
                <p className="text-3xl font-bold text-gray-900">{activeSettings}</p>
              </div>
              <SettingsIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Roles</p>
                <p className="text-3xl font-bold text-emerald-600">5</p>
              </div>
              <Users className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Permissions</p>
                <p className="text-3xl font-bold text-purple-600">24</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Backup</p>
                <p className="text-lg font-bold text-orange-600">2 hours ago</p>
              </div>
              <Database className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Categories Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="academic">Academic Periods</TabsTrigger>
          <TabsTrigger value="classes">Manage Classes</TabsTrigger>
          <TabsTrigger value="timetable">Time Table</TabsTrigger>
          <TabsTrigger value="grades">Manage Grades</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="institution">Institution</TabsTrigger>
          <TabsTrigger value="staff-settings">Staff Settings</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Academic Period Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">Academic Year 2024-25</h4>
                    <p className="text-sm text-gray-600 mb-3">Configure academic year dates and terms</p>
                    <div className="flex space-x-2">
                      <Badge variant="secondary">Active</Badge>
                      <Button size="sm" variant="outline" onClick={handleEditAcademicYear}>Edit</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">Semester System</h4>
                    <p className="text-sm text-gray-600 mb-3">Configure semester or trimester system</p>
                    <Button size="sm" variant="outline" onClick={handleConfigureSemesterSystem}>Configure</Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">Holiday Calendar</h4>
                    <p className="text-sm text-gray-600 mb-3">Set public holidays and school breaks</p>
                    <Button size="sm" variant="outline" onClick={handleManageHolidays}>Manage Holidays</Button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">Term Dates</h4>
                    <p className="text-sm text-gray-600 mb-3">Configure term start and end dates</p>
                    <Button size="sm" variant="outline" onClick={handleSetTermDates}>Set Dates</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                <span>Class Management Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Class Structure Configuration</h3>
                <p className="text-gray-600 mb-4">Set up class hierarchies, standards, and sections</p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" onClick={handleViewClasses}>View Classes</Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleAddNewClass}>Add New Class</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span>Time Table Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule Management</h3>
                <p className="text-gray-600 mb-4">Configure class periods, break times, and schedules</p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" onClick={handleViewTimetable} disabled={loading}>
                    {loading ? 'Loading...' : 'View Timetable'}
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleCreateSchedule} disabled={loading}>
                    {loading ? 'Loading...' : 'Create Schedule'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-orange-500" />
                <span>Grading System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Configuration</h3>
                <p className="text-gray-600 mb-4">Set up grading scales, assessment criteria, and report cards</p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" onClick={handleViewGrades} disabled={loading}>
                    {loading ? 'Loading...' : 'View Grades'}
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleConfigureGrading} disabled={loading}>
                    {loading ? 'Loading...' : 'Configure Grading'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <span>Curriculum Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Course Structure</h3>
                <p className="text-gray-600 mb-4">Configure subjects, syllabi, and learning objectives</p>
                <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleManageCurriculum} disabled={loading}>
                  {loading ? 'Loading...' : 'Manage Curriculum'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="institution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-emerald-500" />
                <span>Institution Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">School Information</h3>
                <p className="text-gray-600 mb-4">Update school details, contact information, and branding</p>
                <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleUpdateInstitution} disabled={loading}>
                  {loading ? 'Loading...' : 'Update Details'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span>Staff Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Staff Management Settings</h3>
                <p className="text-gray-600 mb-4">Configure staff roles, departments, and employment settings</p>
                <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleOpenStaffSettings} disabled={loading}>
                  {loading ? 'Loading...' : 'Staff Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span>Role & Permission Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Control</h3>
                <p className="text-gray-600 mb-4">Manage user roles and system permissions</p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" onClick={handleViewRoles} disabled={loading}>
                    {loading ? 'Loading...' : 'View Roles'}
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleManagePermissions} disabled={loading}>
                    {loading ? 'Loading...' : 'Manage Permissions'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Academic Year Configuration Modal */}
      <Dialog open={isAcademicYearModalOpen} onOpenChange={setIsAcademicYearModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span>Academic Year Configuration</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                value={academicYearConfig.currentYear}
                onChange={(e) => setAcademicYearConfig({...academicYearConfig, currentYear: e.target.value})}
                placeholder="2024-25"
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={academicYearConfig.startDate}
                onChange={(e) => setAcademicYearConfig({...academicYearConfig, startDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={academicYearConfig.endDate}
                onChange={(e) => setAcademicYearConfig({...academicYearConfig, endDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={academicYearConfig.description}
                onChange={(e) => setAcademicYearConfig({...academicYearConfig, description: e.target.value})}
                placeholder="Academic year description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={academicYearConfig.isActive}
                onCheckedChange={(checked) => setAcademicYearConfig({...academicYearConfig, isActive: checked})}
              />
              <Label htmlFor="isActive">Set as Active Academic Year</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcademicYearModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAcademicYear} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Semester System Configuration Modal */}
      <Dialog open={isSemesterSystemModalOpen} onOpenChange={setIsSemesterSystemModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <span>Semester System Configuration</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="systemType">System Type</Label>
              <Select value={semesterSystemConfig.systemType} onValueChange={(value) => setSemesterSystemConfig({...semesterSystemConfig, systemType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select system type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semester">Semester (2 periods)</SelectItem>
                  <SelectItem value="trimester">Trimester (3 periods)</SelectItem>
                  <SelectItem value="quarter">Quarter (4 periods)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Periods</Label>
              <div className="space-y-3">
                {semesterSystemConfig.periods.map((period, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 p-3 border rounded-lg">
                    <Input
                      placeholder="Period name"
                      value={period.name}
                      onChange={(e) => {
                        const newPeriods = [...semesterSystemConfig.periods];
                        newPeriods[index].name = e.target.value;
                        setSemesterSystemConfig({...semesterSystemConfig, periods: newPeriods});
                      }}
                    />
                    <Input
                      type="date"
                      value={period.startDate}
                      onChange={(e) => {
                        const newPeriods = [...semesterSystemConfig.periods];
                        newPeriods[index].startDate = e.target.value;
                        setSemesterSystemConfig({...semesterSystemConfig, periods: newPeriods});
                      }}
                    />
                    <Input
                      type="date"
                      value={period.endDate}
                      onChange={(e) => {
                        const newPeriods = [...semesterSystemConfig.periods];
                        newPeriods[index].endDate = e.target.value;
                        setSemesterSystemConfig({...semesterSystemConfig, periods: newPeriods});
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSemesterSystemModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSemesterSystem} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Holiday Calendar Modal */}
      <Dialog open={isHolidayCalendarModalOpen} onOpenChange={setIsHolidayCalendarModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <span>Holiday Calendar Management</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Holidays & School Breaks</h4>
              <Button size="sm" onClick={addNewHoliday}>
                <Plus className="h-4 w-4 mr-2" />
                Add Holiday
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {holidayCalendarConfig.holidays.map((holiday, index) => (
                <div key={holiday.id} className="grid grid-cols-4 gap-3 p-3 border rounded-lg">
                  <Input
                    placeholder="Holiday name"
                    value={holiday.name}
                    onChange={(e) => updateHoliday(holiday.id, 'name', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={holiday.date || holiday.startDate}
                    onChange={(e) => updateHoliday(holiday.id, holiday.date ? 'date' : 'startDate', e.target.value)}
                  />
                  {holiday.endDate && (
                    <Input
                      type="date"
                      value={holiday.endDate}
                      onChange={(e) => updateHoliday(holiday.id, 'endDate', e.target.value)}
                    />
                  )}
                  <div className="flex space-x-2">
                    <Select value={holiday.type} onValueChange={(value) => updateHoliday(holiday.id, 'type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">National Holiday</SelectItem>
                        <SelectItem value="religious">Religious Holiday</SelectItem>
                        <SelectItem value="school_break">School Break</SelectItem>
                        <SelectItem value="local">Local Holiday</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => removeHoliday(holiday.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHolidayCalendarModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveHolidayCalendar} disabled={loading}>
              {loading ? 'Saving...' : 'Save Calendar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Term Dates Configuration Modal */}
      <Dialog open={isTermDatesModalOpen} onOpenChange={setIsTermDatesModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <span>Term Dates Configuration</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Academic Terms</h4>
              <Button size="sm" onClick={addNewTerm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Term
              </Button>
            </div>
            <div className="space-y-3">
              {termDatesConfig.terms.map((term, index) => (
                <div key={term.id} className="grid grid-cols-4 gap-3 p-3 border rounded-lg">
                  <Input
                    placeholder="Term name"
                    value={term.name}
                    onChange={(e) => updateTerm(term.id, 'name', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={term.startDate}
                    onChange={(e) => updateTerm(term.id, 'startDate', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={term.endDate}
                    onChange={(e) => updateTerm(term.id, 'endDate', e.target.value)}
                  />
                  <Button size="sm" variant="outline" onClick={() => removeTerm(term.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTermDatesModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTermDates} disabled={loading}>
              {loading ? 'Saving...' : 'Save Term Dates'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Classes Modal */}
      <Dialog open={isViewClassesModalOpen} onOpenChange={setIsViewClassesModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Classes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {classes.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sections</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classes.map((cls) => (
                      <tr key={cls.id || cls.class_id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{cls.standard}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {(cls.sections || []).map((section, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{section}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">{cls.description}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleEditClass(cls)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteClass(cls.id || cls.class_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No classes found. Add your first class to get started.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewClassesModalOpen(false)}>Close</Button>
            <Button onClick={handleAddNewClass} className="bg-emerald-500 hover:bg-emerald-600">Add New Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Class Modal */}
      <Dialog open={isAddClassModalOpen} onOpenChange={setIsAddClassModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="className">Class Name *</Label>
              <Input
                id="className"
                value={classFormData.name}
                onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                placeholder="e.g., Class 5, Mathematics"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="standard">Standard *</Label>
              <Select 
                value={classFormData.standard} 
                onValueChange={(value) => setClassFormData({ ...classFormData, standard: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nursery">Nursery</SelectItem>
                  <SelectItem value="LKG">LKG</SelectItem>
                  <SelectItem value="UKG">UKG</SelectItem>
                  <SelectItem value="1st">1st</SelectItem>
                  <SelectItem value="2nd">2nd</SelectItem>
                  <SelectItem value="3rd">3rd</SelectItem>
                  <SelectItem value="4th">4th</SelectItem>
                  <SelectItem value="5th">5th</SelectItem>
                  <SelectItem value="6th">6th</SelectItem>
                  <SelectItem value="7th">7th</SelectItem>
                  <SelectItem value="8th">8th</SelectItem>
                  <SelectItem value="9th">9th</SelectItem>
                  <SelectItem value="10th">10th</SelectItem>
                  <SelectItem value="11th">11th</SelectItem>
                  <SelectItem value="12th">12th</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sections</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {classFormData.sections.map((section, index) => (
                    <div key={index} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                      <span className="text-sm">{section}</span>
                      {classFormData.sections.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={() => removeSection(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" onClick={addSection}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={classFormData.description}
                onChange={(e) => setClassFormData({ ...classFormData, description: e.target.value })}
                placeholder="Brief description of the class"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClassModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveClass} 
              disabled={loading || !classFormData.name.trim() || !classFormData.standard}
              className={(!classFormData.name.trim() || !classFormData.standard) ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {loading ? 'Saving...' : 'Save Class'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Modal */}
      <Dialog open={isEditClassModalOpen} onOpenChange={setIsEditClassModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editClassName">Class Name *</Label>
              <Input
                id="editClassName"
                value={classFormData.name}
                onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                placeholder="e.g., Class 5, Mathematics"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="editStandard">Standard *</Label>
              <Select 
                value={classFormData.standard} 
                onValueChange={(value) => setClassFormData({ ...classFormData, standard: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nursery">Nursery</SelectItem>
                  <SelectItem value="LKG">LKG</SelectItem>
                  <SelectItem value="UKG">UKG</SelectItem>
                  <SelectItem value="1st">1st</SelectItem>
                  <SelectItem value="2nd">2nd</SelectItem>
                  <SelectItem value="3rd">3rd</SelectItem>
                  <SelectItem value="4th">4th</SelectItem>
                  <SelectItem value="5th">5th</SelectItem>
                  <SelectItem value="6th">6th</SelectItem>
                  <SelectItem value="7th">7th</SelectItem>
                  <SelectItem value="8th">8th</SelectItem>
                  <SelectItem value="9th">9th</SelectItem>
                  <SelectItem value="10th">10th</SelectItem>
                  <SelectItem value="11th">11th</SelectItem>
                  <SelectItem value="12th">12th</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sections</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {classFormData.sections.map((section, index) => (
                    <div key={index} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                      <span className="text-sm">{section}</span>
                      {classFormData.sections.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={() => removeSection(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" onClick={addSection}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={classFormData.description}
                onChange={(e) => setClassFormData({ ...classFormData, description: e.target.value })}
                placeholder="Brief description of the class"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClassModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateClass} 
              disabled={loading || !classFormData.name.trim() || !classFormData.standard}
              className={(!classFormData.name.trim() || !classFormData.standard) ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {loading ? 'Updating...' : 'Update Class'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Timetable Modal */}
      <Dialog open={isViewTimetableModalOpen} onOpenChange={setIsViewTimetableModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Timetables</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {timetables.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective From</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Periods</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timetables.map((timetable) => (
                      <tr key={timetable.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{timetable.class_name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{timetable.standard}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{timetable.academic_year}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{timetable.effective_from}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{timetable.total_periods_per_day}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleViewTimetableDetails(timetable)}
                              title="View Details"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleEditSchedule(timetable)}
                              title="Edit Schedule"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteTimetable(timetable.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No timetables found. Create your first schedule to get started.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewTimetableModalOpen(false)}>Close</Button>
            <Button onClick={handleCreateSchedule} className="bg-emerald-500 hover:bg-emerald-600">Create Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Schedule Modal */}
      <Dialog open={isCreateScheduleModalOpen} onOpenChange={setIsCreateScheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditScheduleMode ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="scheduleClass">Select Class *</Label>
              <Select 
                value={scheduleFormData.class_id} 
                onValueChange={(value) => {
                  const selectedClass = classes.find(cls => cls.id === value);
                  setScheduleFormData({ 
                    ...scheduleFormData, 
                    class_id: value,
                    class_name: selectedClass?.name || '',
                    standard: selectedClass?.standard || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
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
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                value={scheduleFormData.academic_year}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, academic_year: e.target.value })}
                placeholder="2024-25"
              />
            </div>

            <div>
              <Label htmlFor="effectiveFrom">Effective From *</Label>
              <Input
                id="effectiveFrom"
                type="date"
                value={scheduleFormData.effective_from}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, effective_from: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="totalPeriods">Total Periods Per Day</Label>
              <Select 
                value={scheduleFormData.total_periods_per_day.toString()} 
                onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, total_periods_per_day: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Periods</SelectItem>
                  <SelectItem value="7">7 Periods</SelectItem>
                  <SelectItem value="8">8 Periods</SelectItem>
                  <SelectItem value="9">9 Periods</SelectItem>
                  <SelectItem value="10">10 Periods</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Break Periods</Label>
              <p className="text-sm text-gray-600 mb-2">
                Current breaks: Period {scheduleFormData.break_periods.join(', Period ')}
              </p>
              <div className="text-xs text-gray-500">
                Default: Period 4 (Morning Break), Period 7 (Lunch Break)
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateScheduleModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveSchedule} 
              disabled={loading || !scheduleFormData.class_id || !scheduleFormData.effective_from}
              className={(!scheduleFormData.class_id || !scheduleFormData.effective_from) ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {loading ? (isEditScheduleMode ? 'Updating...' : 'Creating...') : (isEditScheduleMode ? 'Update Schedule' : 'Create Schedule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Grades Modal */}
      <Dialog open={isViewGradesModalOpen} onOpenChange={setIsViewGradesModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Grading Scales</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {gradingScales.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Scale Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Max GPA</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Passing Grade</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Standards</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Default</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gradingScales.map((scale) => (
                      <tr key={scale.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{scale.scale_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{scale.scale_type}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{scale.max_gpa}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{scale.passing_grade}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {scale.applicable_standards?.join(', ') || 'All'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {scale.is_default ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Default</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditGradingScale(scale)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteGradingScale(scale.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No grading scales configured yet.</p>
                <p className="text-sm mt-2">Click &quot;Configure Grading&quot; to create your first grading scale.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewGradesModalOpen(false)}>Close</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleConfigureGrading}>
              Add New Scale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Grading Modal */}
      <Dialog open={isConfigureGradingModalOpen} onOpenChange={setIsConfigureGradingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditGradingMode ? 'Edit Grading Scale' : 'Configure Grading Scale'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Scale Name *</Label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., 10-Point Scale, CBSE Pattern"
                  value={gradingFormData.scale_name}
                  onChange={(e) => setGradingFormData({...gradingFormData, scale_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Scale Type</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={gradingFormData.scale_type}
                  onChange={(e) => setGradingFormData({...gradingFormData, scale_type: e.target.value})}
                >
                  <option value="percentage">Percentage</option>
                  <option value="points">Points</option>
                  <option value="letter">Letter Grade</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Maximum GPA</Label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={gradingFormData.max_gpa}
                  onChange={(e) => setGradingFormData({...gradingFormData, max_gpa: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Passing Grade</Label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., D"
                  value={gradingFormData.passing_grade}
                  onChange={(e) => setGradingFormData({...gradingFormData, passing_grade: e.target.value})}
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="is_default"
                  className="mr-2"
                  checked={gradingFormData.is_default}
                  onChange={(e) => setGradingFormData({...gradingFormData, is_default: e.target.checked})}
                />
                <Label htmlFor="is_default" className="mb-0">Set as Default Scale</Label>
              </div>
            </div>

            <div>
              <Label>Grade Boundaries</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-900">Grade</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-900">Min %</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-900">Max %</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-900">GPA Points</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-900">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gradingFormData.grade_boundaries.map((boundary, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded text-sm"
                            value={boundary.grade}
                            onChange={(e) => {
                              const newBoundaries = [...gradingFormData.grade_boundaries];
                              newBoundaries[index].grade = e.target.value;
                              setGradingFormData({...gradingFormData, grade_boundaries: newBoundaries});
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border rounded text-sm"
                            value={boundary.min_marks}
                            onChange={(e) => {
                              const newBoundaries = [...gradingFormData.grade_boundaries];
                              newBoundaries[index].min_marks = parseFloat(e.target.value);
                              setGradingFormData({...gradingFormData, grade_boundaries: newBoundaries});
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border rounded text-sm"
                            value={boundary.max_marks}
                            onChange={(e) => {
                              const newBoundaries = [...gradingFormData.grade_boundaries];
                              newBoundaries[index].max_marks = parseFloat(e.target.value);
                              setGradingFormData({...gradingFormData, grade_boundaries: newBoundaries});
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.1"
                            className="w-full px-2 py-1 border rounded text-sm"
                            value={boundary.grade_point}
                            onChange={(e) => {
                              const newBoundaries = [...gradingFormData.grade_boundaries];
                              newBoundaries[index].grade_point = parseFloat(e.target.value);
                              setGradingFormData({...gradingFormData, grade_boundaries: newBoundaries});
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="Optional"
                            value={boundary.description || ''}
                            onChange={(e) => {
                              const newBoundaries = [...gradingFormData.grade_boundaries];
                              newBoundaries[index].description = e.target.value;
                              setGradingFormData({...gradingFormData, grade_boundaries: newBoundaries});
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Default grade boundaries are pre-filled. Modify as needed for your school&apos;s grading system.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigureGradingModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveGradingScale} 
              disabled={loading || !gradingFormData.scale_name.trim()}
              className={!gradingFormData.scale_name.trim() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {loading ? (isEditGradingMode ? 'Updating...' : 'Creating...') : (isEditGradingMode ? 'Update Scale' : 'Create Scale')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Curriculum Dashboard Modal */}
      <Dialog open={isCurriculumDashboardOpen} onOpenChange={setIsCurriculumDashboardOpen}>
        <DialogContent className="max-w-7xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Curriculum Management - Course Structure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                >
                  <option value="all">All Classes</option>
                  <option value="6th">6th Standard</option>
                  <option value="7th">7th Standard</option>
                  <option value="8th">8th Standard</option>
                  <option value="9th">9th Standard</option>
                  <option value="10th">10th Standard</option>
                  <option value="11th">11th Standard</option>
                  <option value="12th">12th Standard</option>
                </select>
              </div>
              <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleAddSubject}>
                + Add New Subject
              </Button>
            </div>

            {subjects.filter(s => selectedClassFilter === 'all' || s.class_standard === selectedClassFilter).length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Class</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Credits</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Units</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Progress</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subjects.filter(s => selectedClassFilter === 'all' || s.class_standard === selectedClassFilter).map((subject) => {
                      const progress = calculateSubjectProgress(subject);
                      return (
                        <tr key={subject.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{subject.subject_name}</div>
                            {subject.description && (
                              <div className="text-xs text-gray-500 mt-1">{subject.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{subject.subject_code}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{subject.class_standard}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{subject.credits || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {subject.syllabus?.length || 0} units
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-emerald-500 h-2 rounded-full" 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenSyllabusBuilder(subject)}
                            >
                              Syllabus
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditSubject(subject)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteSubject(subject.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No subjects configured yet for {selectedClassFilter === 'all' ? 'any class' : selectedClassFilter}.</p>
                <p className="text-sm mt-2">Click &quot;Add New Subject&quot; to create your first subject.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCurriculumDashboardOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Subject Modal */}
      <Dialog open={isAddSubjectModalOpen} onOpenChange={setIsAddSubjectModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditSubjectMode ? 'Edit Subject' : 'Add New Subject'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subject Name *</Label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., Mathematics, English, Science"
                  value={subjectFormData.subject_name}
                  onChange={(e) => setSubjectFormData({...subjectFormData, subject_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Subject Code *</Label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., MATH6, ENG7"
                  value={subjectFormData.subject_code}
                  onChange={(e) => setSubjectFormData({...subjectFormData, subject_code: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Class Standard *</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={subjectFormData.class_standard}
                  onChange={(e) => setSubjectFormData({...subjectFormData, class_standard: e.target.value})}
                >
                  <option value="6th">6th Standard</option>
                  <option value="7th">7th Standard</option>
                  <option value="8th">8th Standard</option>
                  <option value="9th">9th Standard</option>
                  <option value="10th">10th Standard</option>
                  <option value="11th">11th Standard</option>
                  <option value="12th">12th Standard</option>
                </select>
              </div>
              <div>
                <Label>Credits</Label>
                <input
                  type="number"
                  step="0.5"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={subjectFormData.credits}
                  onChange={(e) => setSubjectFormData({...subjectFormData, credits: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Total Hours</Label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Optional"
                  value={subjectFormData.total_hours || ''}
                  onChange={(e) => setSubjectFormData({...subjectFormData, total_hours: e.target.value ? parseFloat(e.target.value) : null})}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows="3"
                placeholder="Brief description of the subject..."
                value={subjectFormData.description}
                onChange={(e) => setSubjectFormData({...subjectFormData, description: e.target.value})}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_elective"
                className="mr-2"
                checked={subjectFormData.is_elective}
                onChange={(e) => setSubjectFormData({...subjectFormData, is_elective: e.target.checked})}
              />
              <Label htmlFor="is_elective" className="mb-0">This is an elective subject</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubjectModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveSubject} 
              disabled={loading || !subjectFormData.subject_name.trim() || !subjectFormData.subject_code.trim()}
              className={(!subjectFormData.subject_name.trim() || !subjectFormData.subject_code.trim()) ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {loading ? (isEditSubjectMode ? 'Updating...' : 'Creating...') : (isEditSubjectMode ? 'Update Subject' : 'Create Subject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Syllabus Builder Modal */}
      <Dialog open={isSyllabusBuilderOpen} onOpenChange={setIsSyllabusBuilderOpen}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Syllabus Builder - {editingSubject?.subject_name} ({editingSubject?.class_standard})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Build your syllabus by adding units, topics, and learning objectives
              </p>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={addSyllabusUnit}>
                + Add Unit
              </Button>
            </div>

            {subjectFormData.syllabus && subjectFormData.syllabus.length > 0 ? (
              <div className="space-y-4">
                {subjectFormData.syllabus.map((unit, unitIndex) => (
                  <div key={unitIndex} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Unit Number</Label>
                          <input
                            type="number"
                            className="w-full px-2 py-1 border rounded text-sm"
                            value={unit.unit_number}
                            onChange={(e) => updateSyllabusUnit(unitIndex, 'unit_number', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Unit Name *</Label>
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="e.g., Algebra Basics, Cell Biology"
                            value={unit.unit_name}
                            onChange={(e) => updateSyllabusUnit(unitIndex, 'unit_name', e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteSyllabusUnit(unitIndex)}
                        className="ml-2"
                      >
                        Delete Unit
                      </Button>
                    </div>

                    <div className="mb-3">
                      <Label className="text-xs">Description</Label>
                      <textarea
                        className="w-full px-2 py-1 border rounded text-sm"
                        rows="2"
                        placeholder="Unit description..."
                        value={unit.description || ''}
                        onChange={(e) => updateSyllabusUnit(unitIndex, 'description', e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-xs font-semibold">Topics</Label>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => addTopicToUnit(unitIndex)}
                        >
                          + Add Topic
                        </Button>
                      </div>

                      {unit.topics && unit.topics.length > 0 ? (
                        <div className="space-y-2 pl-4 border-l-2 border-blue-300">
                          {unit.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start mb-2">
                                <input
                                  type="text"
                                  className="flex-1 px-2 py-1 border rounded text-sm"
                                  placeholder="Topic name..."
                                  value={topic.topic_name}
                                  onChange={(e) => updateTopic(unitIndex, topicIndex, 'topic_name', e.target.value)}
                                />
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => deleteTopic(unitIndex, topicIndex)}
                                  className="ml-2"
                                >
                                  X
                                </Button>
                              </div>

                              <div className="mb-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => addLearningObjective(unitIndex, topicIndex)}
                                  className="text-xs"
                                >
                                  + Learning Objective
                                </Button>
                              </div>

                              {topic.learning_objectives && topic.learning_objectives.length > 0 && (
                                <div className="space-y-1 pl-3">
                                  {topic.learning_objectives.map((obj, objIndex) => (
                                    <div key={objIndex} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={obj.is_completed}
                                        onChange={(e) => updateLearningObjective(unitIndex, topicIndex, objIndex, 'is_completed', e.target.checked)}
                                      />
                                      <input
                                        type="text"
                                        className="flex-1 px-2 py-1 border rounded text-xs"
                                        placeholder="Learning objective..."
                                        value={obj.objective}
                                        onChange={(e) => updateLearningObjective(unitIndex, topicIndex, objIndex, 'objective', e.target.value)}
                                      />
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => deleteLearningObjective(unitIndex, topicIndex, objIndex)}
                                        className="text-xs"
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-2">No topics added yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No units added yet. Click &quot;Add Unit&quot; to start building your syllabus.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSyllabusBuilderOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveSyllabus} 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Syllabus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Institution Update Modal */}
      <Dialog open={isInstitutionModalOpen} onOpenChange={setIsInstitutionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Institution Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Building className="h-4 w-4 mr-2 text-emerald-500" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>School Name *</Label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Enter school name"
                    value={institutionData.school_name}
                    onChange={(e) => setInstitutionData({...institutionData, school_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>School Code</Label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="e.g., SCH001"
                    value={institutionData.school_code}
                    onChange={(e) => setInstitutionData({...institutionData, school_code: e.target.value})}
                  />
                </div>
                <div>
                  <Label>School Type</Label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    value={institutionData.school_type}
                    onChange={(e) => setInstitutionData({...institutionData, school_type: e.target.value})}
                  >
                    <option value="">Select type</option>
                    <option value="Primary">Primary School</option>
                    <option value="Secondary">Secondary School</option>
                    <option value="Higher Secondary">Higher Secondary School</option>
                    <option value="K-12">K-12 School</option>
                    <option value="International">International School</option>
                  </select>
                </div>
                <div>
                  <Label>Established Year</Label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="e.g., 1990"
                    value={institutionData.established_year || ''}
                    onChange={(e) => setInstitutionData({...institutionData, established_year: e.target.value ? parseInt(e.target.value) : null})}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Phone className="h-4 w-4 mr-2 text-blue-500" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>Address</Label>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    rows="2"
                    placeholder="Enter full address"
                    value={institutionData.address}
                    onChange={(e) => setInstitutionData({...institutionData, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <input
                      type="tel"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="+91-XXX-XXX-XXXX"
                      value={institutionData.phone}
                      onChange={(e) => setInstitutionData({...institutionData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <input
                      type="email"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="school@example.com"
                      value={institutionData.email}
                      onChange={(e) => setInstitutionData({...institutionData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Website</Label>
                  <input
                    type="url"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="https://www.school.com"
                    value={institutionData.website}
                    onChange={(e) => setInstitutionData({...institutionData, website: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Branding */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Palette className="h-4 w-4 mr-2 text-purple-500" />
                Branding
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Logo URL</Label>
                  <input
                    type="url"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="https://example.com/logo.png"
                    value={institutionData.logo_url}
                    onChange={(e) => setInstitutionData({...institutionData, logo_url: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload logo to cloud storage and paste URL here</p>
                </div>
                <div>
                  <Label>Theme Color</Label>
                  <div className="flex items-center mt-1 space-x-2">
                    <input
                      type="color"
                      className="h-10 w-20 border rounded-md cursor-pointer"
                      value={institutionData.theme_color}
                      onChange={(e) => setInstitutionData({...institutionData, theme_color: e.target.value})}
                    />
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="#10b981"
                      value={institutionData.theme_color}
                      onChange={(e) => setInstitutionData({...institutionData, theme_color: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Other Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Info className="h-4 w-4 mr-2 text-orange-500" />
                Other Information
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>Principal/Headmaster Name</Label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Enter principal name"
                    value={institutionData.principal_name}
                    onChange={(e) => setInstitutionData({...institutionData, principal_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>School Motto</Label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="e.g., Excellence in Education"
                    value={institutionData.motto}
                    onChange={(e) => setInstitutionData({...institutionData, motto: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Vision Statement</Label>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    rows="3"
                    placeholder="Enter school vision and mission"
                    value={institutionData.vision}
                    onChange={(e) => setInstitutionData({...institutionData, vision: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Globe className="h-4 w-4 mr-2 text-cyan-500" />
                Social Media Links
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Facebook</Label>
                  <input
                    type="url"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="https://facebook.com/school"
                    value={institutionData.social_links?.facebook || ''}
                    onChange={(e) => setInstitutionData({
                      ...institutionData, 
                      social_links: {...institutionData.social_links, facebook: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label>Twitter</Label>
                  <input
                    type="url"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="https://twitter.com/school"
                    value={institutionData.social_links?.twitter || ''}
                    onChange={(e) => setInstitutionData({
                      ...institutionData, 
                      social_links: {...institutionData.social_links, twitter: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <input
                    type="url"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="https://instagram.com/school"
                    value={institutionData.social_links?.instagram || ''}
                    onChange={(e) => setInstitutionData({
                      ...institutionData, 
                      social_links: {...institutionData.social_links, instagram: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <input
                    type="url"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="https://linkedin.com/school"
                    value={institutionData.social_links?.linkedin || ''}
                    onChange={(e) => setInstitutionData({
                      ...institutionData, 
                      social_links: {...institutionData.social_links, linkedin: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInstitutionModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveInstitution} 
              disabled={loading || !institutionData.school_name.trim()}
              className={!institutionData.school_name.trim() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {loading ? 'Saving...' : 'Update Institution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Settings Main Modal */}
      <Dialog open={isStaffSettingsModalOpen} onOpenChange={setIsStaffSettingsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Staff Management Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="roles">Staff Roles</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="employment">Employment Types</TabsTrigger>
              </TabsList>

              <TabsContent value="roles" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Manage staff roles and positions</p>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleAddRole}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </div>
                {staffRoles.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Role Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {staffRoles.map((role) => (
                          <tr key={role.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{role.role_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{role.description || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">
                              {role.is_active ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Inactive</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditRole(role)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteRole(role.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No roles configured yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="departments" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Manage school departments</p>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleAddDepartment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </div>
                {departments.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Department Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {departments.map((dept) => (
                          <tr key={dept.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{dept.department_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{dept.description || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">
                              {dept.is_active ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Inactive</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditDepartment(dept)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteDepartment(dept.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <Building className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No departments configured yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="employment" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Manage employment types</p>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleAddEmploymentType}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employment Type
                  </Button>
                </div>
                {employmentTypes.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {employmentTypes.map((emp) => (
                          <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{emp.type_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{emp.description || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">
                              {emp.is_active ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Inactive</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditEmploymentType(emp)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteEmploymentType(emp.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No employment types configured yet</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStaffSettingsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Role Modal */}
      <Dialog open={isAddRoleModalOpen} onOpenChange={setIsAddRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role Name *</Label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="e.g., Teacher, Accountant, Admin Staff"
                value={roleFormData.role_name}
                onChange={(e) => setRoleFormData({...roleFormData, role_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows="3"
                placeholder="Enter role description"
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="role_active"
                className="mr-2"
                checked={roleFormData.is_active}
                onChange={(e) => setRoleFormData({...roleFormData, is_active: e.target.checked})}
              />
              <Label htmlFor="role_active" className="mb-0">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} disabled={loading || !roleFormData.role_name.trim()}>
              {loading ? 'Saving...' : (editingRole ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Department Modal */}
      <Dialog open={isAddDepartmentModalOpen} onOpenChange={setIsAddDepartmentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add New Department'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Department Name *</Label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="e.g., Science, Mathematics, Administration"
                value={departmentFormData.department_name}
                onChange={(e) => setDepartmentFormData({...departmentFormData, department_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows="3"
                placeholder="Enter department description"
                value={departmentFormData.description}
                onChange={(e) => setDepartmentFormData({...departmentFormData, description: e.target.value})}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="dept_active"
                className="mr-2"
                checked={departmentFormData.is_active}
                onChange={(e) => setDepartmentFormData({...departmentFormData, is_active: e.target.checked})}
              />
              <Label htmlFor="dept_active" className="mb-0">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDepartmentModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDepartment} disabled={loading || !departmentFormData.department_name.trim()}>
              {loading ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Employment Type Modal */}
      <Dialog open={isAddEmploymentModalOpen} onOpenChange={setIsAddEmploymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEmploymentType ? 'Edit Employment Type' : 'Add New Employment Type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employment Type Name *</Label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="e.g., Full-time, Part-time, Contract"
                value={employmentFormData.type_name}
                onChange={(e) => setEmploymentFormData({...employmentFormData, type_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows="3"
                placeholder="Enter employment type description"
                value={employmentFormData.description}
                onChange={(e) => setEmploymentFormData({...employmentFormData, description: e.target.value})}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emp_active"
                className="mr-2"
                checked={employmentFormData.is_active}
                onChange={(e) => setEmploymentFormData({...employmentFormData, is_active: e.target.checked})}
              />
              <Label htmlFor="emp_active" className="mb-0">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEmploymentModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEmploymentType} disabled={loading || !employmentFormData.type_name.trim()}>
              {loading ? 'Saving...' : (editingEmploymentType ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Roles Modal */}
      <Dialog open={isViewRolesModalOpen} onOpenChange={setIsViewRolesModalOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-500" />
              <span>User Roles</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Manage user roles and their access permissions
              </p>
              <Button onClick={handleManagePermissions} className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="h-4 w-4 mr-2" />
                Create New Role
              </Button>
            </div>
            
            {roles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Shield className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p>No roles found. Create your first role to get started.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((role) => {
                      const permissionCount = Object.values(role.permissions || {}).reduce((count, perms) => {
                        return count + Object.values(perms).filter(p => p === true).length;
                      }, 0);
                      
                      return (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Shield className="h-5 w-5 text-red-500 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{role.role_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{role.description || 'No description'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={role.is_active ? 'success' : 'secondary'}>
                              {role.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{permissionCount} permissions</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditRolePermissions(role)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteRolePermission(role.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Modal */}
      <Dialog open={isManagePermissionsModalOpen} onOpenChange={setIsManagePermissionsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-500" />
              <span>{editingPermissionRole ? 'Edit Role Permissions' : 'Create New Role'}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role Name *</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g., Admin, Teacher, Accountant"
                  value={permissionFormData.role_name}
                  onChange={(e) => setPermissionFormData({...permissionFormData, role_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  className="mt-1"
                  placeholder="Brief description of this role"
                  value={permissionFormData.description}
                  onChange={(e) => setPermissionFormData({...permissionFormData, description: e.target.value})}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Module Permissions</h3>
                <p className="text-xs text-gray-500">Configure CRUD permissions for each module</p>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Module</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Create</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Read</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {permissionModules.map((module) => (
                      <tr key={module.key} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{module.label}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                            checked={permissionFormData.permissions[module.key]?.create || false}
                            onChange={() => handlePermissionChange(module.key, 'create')}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                            checked={permissionFormData.permissions[module.key]?.read || false}
                            onChange={() => handlePermissionChange(module.key, 'read')}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                            checked={permissionFormData.permissions[module.key]?.update || false}
                            onChange={() => handlePermissionChange(module.key, 'update')}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                            checked={permissionFormData.permissions[module.key]?.delete || false}
                            onChange={() => handlePermissionChange(module.key, 'delete')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="role_active"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mr-2 cursor-pointer"
                checked={permissionFormData.is_active}
                onChange={(e) => setPermissionFormData({...permissionFormData, is_active: e.target.checked})}
              />
              <Label htmlFor="role_active" className="mb-0 cursor-pointer">Active</Label>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsManagePermissionsModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSavePermissions} 
              disabled={loading || !permissionFormData.role_name.trim()}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? 'Saving...' : (editingPermissionRole ? 'Update Role' : 'Create Role')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
