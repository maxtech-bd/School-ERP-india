import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Camera,
  FileUp,
  Image,
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Printer,
  User,
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const API = process.env.REACT_APP_API_URL;

const StudentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all_classes');
  const [selectedSection, setSelectedSection] = useState('all_sections');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [dateError, setDateError] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [isQuickAddSectionModalOpen, setIsQuickAddSectionModalOpen] = useState(false);
  const [quickSectionData, setQuickSectionData] = useState({
    name: '',
    max_students: 40
  });
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [importErrors, setImportErrors] = useState([]);
  const [importSummary, setImportSummary] = useState(null);

  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/students/add') return 'add';
    if (path === '/students/import') return 'import';
    if (path === '/students/photos') return 'photos';
    return 'list';
  };

  const currentView = getCurrentView();

  const [formData, setFormData] = useState({
    admission_no: '',
    roll_no: '',
    name: '',
    father_name: '',
    father_phone: '',
    father_whatsapp: '',
    mother_name: '',
    mother_phone: '',
    mother_whatsapp: '',
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchData();
      setLoading(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    setIsAddModalOpen(false);
    setEditingStudent(null);
    resetForm();
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        axios.get(`${API}/students`),
        axios.get(`${API}/classes`)
      ]);
      
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`${API}/sections?class_id=${classId}`);
      setSections(response.data);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const handleQuickAddSection = async (e) => {
    e.preventDefault();
    
    if (!formData.class_id) {
      toast.error('Please select a class first');
      return;
    }

    if (!quickSectionData.name.trim()) {
      toast.error('Please enter a section name');
      return;
    }

    setIsSavingSection(true);
    try {
      const sectionPayload = {
        class_id: formData.class_id,
        name: quickSectionData.name.trim(),
        max_students: parseInt(quickSectionData.max_students),
        section_teacher_id: null
      };

      const response = await axios.post(`${API}/sections`, sectionPayload);
      toast.success('Section added successfully!');
      
      // Refresh sections for the current class
      await fetchSections(formData.class_id);
      
      // Auto-select the newly created section
      setFormData({...formData, section_id: response.data.id});
      
      // Reset and close modal
      setQuickSectionData({ name: '', max_students: 40 });
      setIsQuickAddSectionModalOpen(false);
    } catch (error) {
      console.error('Failed to add section:', error);
      toast.error(error.response?.data?.detail || 'Failed to add section');
    } finally {
      setIsSavingSection(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    if (!year || !month) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1990; year--) {
      years.push(year);
    }
    return years;
  };

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const handleDateChange = (type, value) => {
    let newYear = birthYear;
    let newMonth = birthMonth;
    let newDay = birthDay;

    if (type === 'year') {
      newYear = value;
      setBirthYear(value);
    } else if (type === 'month') {
      newMonth = value;
      setBirthMonth(value);
      const daysInMonth = getDaysInMonth(birthYear, value);
      if (birthDay && parseInt(birthDay) > daysInMonth) {
        newDay = daysInMonth.toString().padStart(2, '0');
        setBirthDay(newDay);
      }
    } else if (type === 'day') {
      newDay = value;
      setBirthDay(value);
    }

    if (newYear && newMonth && newDay) {
      const selectedDate = new Date(parseInt(newYear), parseInt(newMonth) - 1, parseInt(newDay));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        setDateError('Future dates are not allowed');
        toast.error('Date of Birth cannot be a future date');
        return;
      }

      setDateError('');
      const formattedDate = `${newYear}-${newMonth}-${newDay}`;
      setFormData({ ...formData, date_of_birth: formattedDate });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Photo size should be less than 2MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let studentId = null;
      if (editingStudent) {
        await axios.put(`${API}/students/${editingStudent.id}`, formData);
        studentId = editingStudent.id;
        toast.success('Student updated successfully');
      } else {
        const response = await axios.post(`${API}/students`, formData);
        studentId = response.data.id;
        toast.success('Student added successfully');
      }
      
      if (photoFile && studentId) {
        const photoFormData = new FormData();
        photoFormData.append('file', photoFile);
        try {
          await axios.post(`${API}/students/${studentId}/photo`, photoFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (photoError) {
          console.error('Failed to upload photo:', photoError);
          toast.warning('Student saved but photo upload failed');
        }
      }
      
      await fetchData();
      if (editingStudent) {
        setIsAddModalOpen(false);
      } else {
        setIsAddStudentModalOpen(false);
      }
      
      setEditingStudent(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save student:', error);
      toast.error(error.response?.data?.detail || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      admission_no: student.admission_no,
      roll_no: student.roll_no,
      name: student.name,
      father_name: student.father_name,
      father_phone: student.father_phone || '',
      father_whatsapp: student.father_whatsapp || '',
      mother_name: student.mother_name,
      mother_phone: student.mother_phone || '',
      mother_whatsapp: student.mother_whatsapp || '',
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      class_id: student.class_id,
      section_id: student.section_id,
      phone: student.phone,
      email: student.email || '',
      address: student.address,
      guardian_name: student.guardian_name,
      guardian_phone: student.guardian_phone
    });
    setEditingStudent(student);
    setPhotoFile(null);
    setPhotoPreview(student.photo_url || '');
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`${API}/students/${studentToDelete.id}`);
      toast.success('Student deleted successfully');
      await fetchData();
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      admission_no: '',
      roll_no: '',
      name: '',
      father_name: '',
      father_phone: '',
      father_whatsapp: '',
      mother_name: '',
      mother_phone: '',
      mother_whatsapp: '',
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
    setDateError('');
    setBirthYear('');
    setBirthMonth('');
    setBirthDay('');
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleBulkPhotoUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select at least one photo');
      return;
    }

    // Validate files before upload
    const validatedFiles = [];
    const errors = [];
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

    // Get list of valid admission numbers from current students
    const validAdmissionNumbers = students.map(s => s.admission_no?.toUpperCase());

    Array.from(selectedFiles).forEach((file) => {
      // File type validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPEG and PNG are allowed.`);
        return;
      }

      // File size validation
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 2MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`);
        return;
      }

      // Filename validation (should match student admission number)
      const filename = file.name.split('.')[0].toUpperCase();
      if (!filename || filename.length < 3) {
        errors.push(`${file.name}: Filename must contain student admission number.`);
        return;
      }

      // Check if filename matches any student admission number
      const matchingStudent = validAdmissionNumbers.includes(filename);
      if (!matchingStudent) {
        errors.push(`${file.name}: No matching student found with admission number '${filename}'.`);
        return;
      }

      validatedFiles.push(file);
    });

    // Show validation errors
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      if (validatedFiles.length === 0) {
        return;
      }
      toast.warning(`${validatedFiles.length} valid files will be uploaded. ${errors.length} files rejected.`);
    }

    setLoading(true);
    setUploadProgress('Uploading...');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      validatedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(`${API}/students/bulk-photo-upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const { uploaded_count, total_files, failed_uploads } = response.data;
      
      if (failed_uploads && failed_uploads.length > 0) {
        toast.warning(`Uploaded ${uploaded_count}/${total_files} photos. ${failed_uploads.length} failed.`);
        console.log('Failed uploads:', failed_uploads);
        
        // Show specific failure reasons
        failed_uploads.slice(0, 3).forEach((failure) => {
          toast.error(`${failure.filename}: ${failure.reason || 'Upload failed'}`);
        });
      } else {
        toast.success(`✅ Successfully uploaded ${uploaded_count} photo(s)!`);
      }

      setIsPhotoUploadModalOpen(false);
      setSelectedFiles([]);
      fetchData();
    } catch (error) {
      console.error('Failed to upload photos:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload photos');
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const handleImportStudents = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setLoading(true);
    setUploadProgress('Importing...');
    setImportErrors([]);
    setImportSummary(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await axios.post(`${API}/students/import`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const { imported_count, total_rows, failed_imports } = response.data;
      
      setImportSummary({
        imported_count,
        total_rows,
        failed_count: failed_imports.length
      });
      
      if (failed_imports.length > 0) {
        setImportErrors(failed_imports);
        if (imported_count > 0) {
          toast.warning(`Imported ${imported_count}/${total_rows} students. ${failed_imports.length} record(s) need attention.`);
        } else {
          toast.error(`Import failed for all ${failed_imports.length} record(s). Please review the errors below.`);
        }
      } else {
        toast.success(`Successfully imported all ${imported_count} students!`);
        setIsImportModalOpen(false);
        setImportFile(null);
      }
      
      fetchData();
    } catch (error) {
      console.error('Failed to import students:', error);
      toast.error(error.response?.data?.detail || 'Failed to import students');
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const downloadSampleTemplate = (format = 'excel') => {
    // Sample data for student import template matching the user's Excel format
    const templateData = [
      {
        admission_no: 'HSS001',
        roll_no: '001',
        name: 'John Smith',
        gender: 'Male',
        date_of_birth: '2008-05-12',
        class_id: '8',
        section_id: 'A',
        father_name: 'Robert Smith',
        'F/phone': '9876543210',
        'F/ Whatsapp no': '9876543210',
        mother_name: 'Anna Smith',
        'M/phone': '9876543212',
        'M/whatsapp no': '9876543212',
        address: '123 Main Street, New York',
        'email id': 'john.smith@email.com',
        guardian_name: 'Robert Smith',
        guardian_phone: '9876543210'
      },
      {
        admission_no: 'HSS002',
        roll_no: '002',
        name: 'Sarah Johnson',
        gender: 'Female',
        date_of_birth: '2009-02-20',
        class_id: '8',
        section_id: 'A',
        father_name: 'David Johnson',
        'F/phone': '9876543211',
        'F/ Whatsapp no': '9876543211',
        mother_name: 'Linda Johnson',
        'M/phone': '9876543213',
        'M/whatsapp no': '9876543213',
        address: '456 Oak Avenue, California',
        'email id': 'sarah.johnson@email.com',
        guardian_name: 'David Johnson',
        guardian_phone: '9876543211'
      }
    ];

    if (format === 'excel') {
      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
      
      // Set column widths for better readability
      worksheet['!cols'] = [
        { wch: 15 }, // admission_no
        { wch: 10 }, // roll_no
        { wch: 20 }, // name
        { wch: 10 }, // gender
        { wch: 15 }, // date_of_birth
        { wch: 10 }, // class_id
        { wch: 12 }, // section_id
        { wch: 18 }, // father_name
        { wch: 15 }, // F/phone
        { wch: 18 }, // F/ Whatsapp no
        { wch: 18 }, // mother_name
        { wch: 15 }, // M/phone
        { wch: 18 }, // M/whatsapp no
        { wch: 30 }, // address
        { wch: 25 }, // email id
        { wch: 18 }, // guardian_name
        { wch: 15 }  // guardian_phone
      ];
      
      // Download Excel file
      XLSX.writeFile(workbook, 'student_import_template.xlsx');
      toast.success('Excel template downloaded!');
    } else {
      // Create CSV
      const headers = Object.keys(templateData[0]).join(',');
      const rows = templateData.map(row => Object.values(row).join(','));
      const csvContent = [headers, ...rows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'student_import_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV template downloaded!');
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ format });
      
      if (selectedClass !== 'all_classes') {
        params.append('class_id', selectedClass);
      }
      if (selectedSection !== 'all_sections') {
        params.append('section_id', selectedSection);
      }

      const response = await axios.get(`${API}/students/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fileExtension = format === 'csv' ? 'csv' : format === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.${fileExtension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Students exported as ${format.toUpperCase()}`);
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Failed to export students:', error);
      toast.error(error.response?.data?.detail || 'Failed to export students');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_no.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'all_classes' || student.class_id === selectedClass;
    const matchesSection = selectedSection === 'all_sections' || student.section_id === selectedSection;
    
    return matchesSearch && matchesClass && matchesSection;
  });

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'Unknown';
  };

  const getSectionName = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : 'Unknown';
  };

  if (loading && students.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Add Student View
  if (currentView === 'add') {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/students')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
              <p className="text-gray-600 mt-1">Fill in student information below</p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admission_no">Admission Number *</Label>
                  <Input
                    id="admission_no"
                    value={formData.admission_no}
                    onChange={(e) => setFormData({...formData, admission_no: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="roll_no">Roll Number *</Label>
                  <Input
                    id="roll_no"
                    value={formData.roll_no}
                    onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="father_name">Father's Name *</Label>
                  <Input
                    id="father_name"
                    value={formData.father_name}
                    onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mother_name">Mother's Name *</Label>
                  <Input
                    id="mother_name"
                    value={formData.mother_name}
                    onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
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
                  <Label htmlFor="class_id">Class *</Label>
                  <Select 
                    value={formData.class_id} 
                    onValueChange={(value) => {
                      setFormData({...formData, class_id: value});
                      fetchSections(value);
                    }}
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
                  <Label htmlFor="section_id">Section *</Label>
                  <Select value={formData.section_id} onValueChange={(value) => setFormData({...formData, section_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="guardian_name">Guardian Name *</Label>
                  <Input
                    id="guardian_name"
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="guardian_phone">Guardian Phone *</Label>
                  <Input
                    id="guardian_phone"
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => navigate('/students')}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
                  {loading ? 'Saving...' : 'Add Student'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Bulk Import View
  if (currentView === 'import') {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/students')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Import Students</h1>
              <p className="text-gray-600 mt-1">Import multiple students from CSV or Excel file</p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileUp className="h-5 w-5 text-emerald-500" />
              <span>Upload Student Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your file</h3>
              <p className="text-gray-600 mb-4">Drag and drop your CSV or Excel file here, or click to browse</p>
              <Input 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                className="max-w-xs mx-auto" 
                onChange={(e) => setImportFile(e.target.files[0])}
              />
              {importFile && (
                <p className="text-sm text-emerald-600 mt-2 font-medium">
                  ✓ Selected: {importFile.name}
                </p>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">File Format Requirements:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>File must be in CSV or Excel format (.csv, .xlsx, .xls)</li>
                <li>First row should contain column headers</li>
                <li>Required columns: admission_no, roll_no, name, father_name, mother_name, date_of_birth, gender, class_id, section_id, phone, email, address, guardian_name, guardian_phone</li>
                <li>Date format should be YYYY-MM-DD (e.g., 2008-05-15)</li>
                <li>Gender values: Male or Female</li>
              </ul>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => downloadSampleTemplate('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Excel Template
                </Button>
                <Button variant="outline" onClick={() => downloadSampleTemplate('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={handleImportStudents}
                disabled={loading || !importFile}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadProgress || 'Start Import'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Photo Upload View
  if (currentView === 'photos') {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/students')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Photo Upload</h1>
              <p className="text-gray-600 mt-1">Upload photos for students in bulk</p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-emerald-500" />
              <span>Bulk Photo Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload student photos</h3>
              <p className="text-gray-600 mb-4">Select multiple photos to upload. Files should be named with admission numbers.</p>
              <Input 
                type="file" 
                accept="image/*" 
                multiple 
                className="max-w-xs mx-auto"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              />
              {selectedFiles.length > 0 && (
                <p className="text-sm text-emerald-600 mt-2 font-medium">
                  ✓ Selected: {selectedFiles.length} photo(s)
                </p>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Photo Upload Guidelines:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Accepted formats: JPG, PNG, JPEG</li>
                <li>File name should match student's admission number (e.g., ADM001.jpg)</li>
                <li>Maximum file size: 2MB per photo</li>
                <li>Recommended dimensions: 300x400 pixels (passport size)</li>
                <li>Photos should have clear, well-lit faces</li>
              </ul>
            </div>
            <div className="flex justify-end">
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={handleBulkPhotoUpload}
                disabled={loading || selectedFiles.length === 0}
              >
                <Camera className="h-4 w-4 mr-2" />
                {uploadProgress || 'Upload Photos'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Student List View (default)
  return (
    <div className="space-y-4 sm:space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage student information and records</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={() => setIsPhotoUploadModalOpen(true)}>
            <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Bulk </span>Photo
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={() => setIsExportModalOpen(true)}>
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Export
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm h-8 sm:h-9" onClick={() => setIsAddStudentModalOpen(true)}>
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:flex sm:flex-row">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-40 md:w-48 text-xs sm:text-sm">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_classes">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.standard})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClass}>
                <SelectTrigger className="w-full sm:w-40 md:w-48 text-xs sm:text-sm">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_sections">All Sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              <span className="text-base sm:text-lg">Student List</span>
              <Badge variant="secondary" className="text-xs">{filteredStudents.length} students</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 sm:w-12 px-2 sm:px-4">#</TableHead>
                  <TableHead className="px-2 sm:px-4">Student</TableHead>
                  <TableHead className="px-2 sm:px-4 hidden sm:table-cell">Admission No</TableHead>
                  <TableHead className="px-2 sm:px-4 hidden md:table-cell">Roll No</TableHead>
                  <TableHead className="px-2 sm:px-4">Class</TableHead>
                  <TableHead className="px-2 sm:px-4 hidden lg:table-cell">Guardian</TableHead>
                  <TableHead className="px-2 sm:px-4 hidden md:table-cell">Contact</TableHead>
                  <TableHead className="px-2 sm:px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchTerm || selectedClass || selectedSection 
                        ? 'No students found matching your search criteria'
                        : 'No students added yet'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium px-2 sm:px-4 text-xs sm:text-sm">{index + 1}</TableCell>
                      <TableCell className="px-2 sm:px-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage src={student.photo_url} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs sm:text-sm">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{student.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none">{student.father_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{student.admission_no}</Badge>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs">{student.roll_no}</Badge>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4">
                        <div className="text-xs sm:text-sm">
                          <p className="font-medium">{getClassName(student.class_id)}</p>
                          <p className="text-gray-500 text-xs">Sec {getSectionName(student.section_id)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 hidden lg:table-cell">
                        <div className="text-xs sm:text-sm">
                          <p className="font-medium truncate max-w-[120px]">{student.guardian_name}</p>
                          <div className="flex items-center text-gray-500 text-xs">
                            <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{student.guardian_phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 hidden md:table-cell">
                        <div className="text-xs sm:text-sm">
                          <div className="flex items-center text-gray-500">
                            <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{student.phone}</span>
                          </div>
                          {student.email && (
                            <div className="flex items-center text-gray-500 mt-1">
                              <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate max-w-[100px]">{student.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={() => {
                              setViewingStudent(student);
                              setIsViewModalOpen(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={() => handleEdit(student)}
                            title="Edit"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={() => handleDeleteClick(student)}
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
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

      {/* Bulk Photo Upload Modal */}
      <Dialog open={isPhotoUploadModalOpen} onOpenChange={setIsPhotoUploadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-emerald-500" />
              <span>Bulk Photo Upload</span>
            </DialogTitle>
            <DialogDescription>
              Upload multiple student photos at once. File names should match student admission numbers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo-files">Select Photos</Label>
              <Input
                id="photo-files"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="mt-2"
              />
              {selectedFiles && selectedFiles.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 text-sm mb-2">Guidelines:</h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Formats: JPG, PNG</li>
                <li>File name = Admission Number (e.g., ADM001.jpg)</li>
                <li>Max size: 2MB per photo</li>
                <li>Recommended: 300x400 pixels</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPhotoUploadModalOpen(false);
                setSelectedFiles([]);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={handleBulkPhotoUpload}
              disabled={loading || !selectedFiles || selectedFiles.length === 0}
            >
              {uploadProgress || 'Upload Photos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Students Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={(open) => {
        setIsImportModalOpen(open);
        if (!open) {
          setImportErrors([]);
          setImportSummary(null);
          setImportFile(null);
        }
      }}>
        <DialogContent className={importErrors.length > 0 ? "max-w-2xl max-h-[80vh] overflow-y-auto" : "max-w-md"}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-emerald-500" />
              <span>Import Students</span>
            </DialogTitle>
            <DialogDescription>
              Import student data from CSV or Excel file.
            </DialogDescription>
          </DialogHeader>
          
          {/* Import Summary */}
          {importSummary && (
            <div className={`p-4 rounded-lg border ${
              importSummary.failed_count === 0 
                ? 'bg-green-50 border-green-200' 
                : importSummary.imported_count > 0 
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold ${
                    importSummary.failed_count === 0 
                      ? 'text-green-800' 
                      : importSummary.imported_count > 0 
                        ? 'text-amber-800'
                        : 'text-red-800'
                  }`}>
                    Import Summary
                  </h4>
                  <p className="text-sm mt-1">
                    <span className="text-green-600 font-medium">{importSummary.imported_count} successful</span>
                    {importSummary.failed_count > 0 && (
                      <span className="text-red-600 font-medium ml-2">• {importSummary.failed_count} failed</span>
                    )}
                    <span className="text-gray-500 ml-2">/ {importSummary.total_rows} total</span>
                  </p>
                </div>
                {importSummary.failed_count === 0 && (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                )}
              </div>
            </div>
          )}

          {/* Error Details Table */}
          {importErrors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-red-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Failed Records ({importErrors.length})
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Row</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Admission No</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Student</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Issue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importErrors.map((error, index) => (
                      <tr key={index} className="hover:bg-red-50">
                        <td className="px-3 py-2 text-gray-600">{error.row}</td>
                        <td className="px-3 py-2 font-mono text-xs">{error.admission_no}</td>
                        <td className="px-3 py-2 text-gray-800">{error.student_name || 'Unknown'}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-start space-x-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              error.error_type === 'duplicate' 
                                ? 'bg-orange-100 text-orange-800'
                                : error.error_type === 'missing_fields'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {error.error_type === 'duplicate' ? 'Duplicate' : 
                               error.error_type === 'missing_fields' ? 'Missing Data' : 'Error'}
                            </span>
                          </div>
                          <p className="text-red-600 text-xs mt-1">{error.error}</p>
                          {error.suggestion && (
                            <p className="text-gray-500 text-xs mt-0.5 italic">{error.suggestion}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Please fix these issues in your file and re-upload, or add these students manually.
              </p>
            </div>
          )}

          {/* File Upload Section - only show if no errors or before upload */}
          {importErrors.length === 0 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="import-file">Select File</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="text-emerald-600 hover:text-emerald-700 text-sm p-0 h-auto"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await axios.get(`${API}/download/student-import-sample?format=excel`, {
                          responseType: 'blob',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        
                        const blob = new Blob([response.data], { 
                          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                        });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'student_import_sample.xlsx';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        toast.success('Sample Excel template downloaded successfully');
                      } catch (error) {
                        console.error('Download failed:', error);
                        toast.error('Failed to download template');
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Sample Excel
                  </Button>
                </div>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="mt-2"
                />
                {importFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {importFile.name}
                  </p>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h4 className="font-medium text-amber-900 text-sm mb-2">Required Columns:</h4>
                <p className="text-xs text-amber-800">
                  admission_no, roll_no, name, gender, date_of_birth, class_id, section_id, 
                  father_name, F/phone, mother_name, address, guardian_name, guardian_phone
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Optional: F/ Whatsapp no, M/phone, M/whatsapp no, email id
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {importErrors.length > 0 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportErrors([]);
                    setImportSummary(null);
                    setImportFile(null);
                  }}
                >
                  Upload New File
                </Button>
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportErrors([]);
                    setImportSummary(null);
                    setImportFile(null);
                  }}
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleImportStudents}
                  disabled={loading || !importFile}
                >
                  {uploadProgress || 'Import Students'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-emerald-500" />
              <span>Export Students</span>
            </DialogTitle>
            <DialogDescription>
              Download student list in your preferred format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Current filters: {selectedClass !== 'all_classes' || selectedSection !== 'all_sections' 
                ? 'Filtered data will be exported' 
                : 'All students will be exported'}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center py-6 h-auto hover:border-emerald-500"
                onClick={() => handleExport('csv')}
              >
                <FileUp className="h-8 w-8 mb-2 text-blue-500" />
                <span className="text-sm font-medium">CSV</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center py-6 h-auto hover:border-emerald-500"
                onClick={() => handleExport('excel')}
              >
                <FileUp className="h-8 w-8 mb-2 text-green-500" />
                <span className="text-sm font-medium">Excel</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center py-6 h-auto hover:border-emerald-500"
                onClick={() => handleExport('pdf')}
              >
                <FileUp className="h-8 w-8 mb-2 text-red-500" />
                <span className="text-sm font-medium">PDF</span>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Modal */}
      <Dialog open={isAddStudentModalOpen} onOpenChange={setIsAddStudentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter student information below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center space-y-3 pb-4 border-b">
              <div className="relative">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Student" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <Label htmlFor="student-photo" className="cursor-pointer">
                <div className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700">
                  <Camera className="h-4 w-4" />
                  <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                </div>
                <Input
                  id="student-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add_admission_no">Admission Number *</Label>
                <Input
                  id="add_admission_no"
                  value={formData.admission_no}
                  onChange={(e) => setFormData({...formData, admission_no: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="add_roll_no">Roll Number *</Label>
                <Input
                  id="add_roll_no"
                  value={formData.roll_no}
                  onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="add_name">Full Name *</Label>
                <Input
                  id="add_name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="add_father_name">Father's Name *</Label>
                <Input
                  id="add_father_name"
                  value={formData.father_name}
                  onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="add_father_phone">Father's Phone</Label>
                <Input
                  id="add_father_phone"
                  value={formData.father_phone}
                  onChange={(e) => setFormData({...formData, father_phone: e.target.value})}
                  placeholder="Father's phone number"
                />
              </div>
              <div>
                <Label htmlFor="add_father_whatsapp">Father's WhatsApp</Label>
                <Input
                  id="add_father_whatsapp"
                  value={formData.father_whatsapp}
                  onChange={(e) => setFormData({...formData, father_whatsapp: e.target.value})}
                  placeholder="Father's WhatsApp number"
                />
              </div>
              <div>
                <Label htmlFor="add_mother_name">Mother's Name *</Label>
                <Input
                  id="add_mother_name"
                  value={formData.mother_name}
                  onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="add_mother_phone">Mother's Phone</Label>
                <Input
                  id="add_mother_phone"
                  value={formData.mother_phone}
                  onChange={(e) => setFormData({...formData, mother_phone: e.target.value})}
                  placeholder="Mother's phone number"
                />
              </div>
              <div>
                <Label htmlFor="add_mother_whatsapp">Mother's WhatsApp</Label>
                <Input
                  id="add_mother_whatsapp"
                  value={formData.mother_whatsapp}
                  onChange={(e) => setFormData({...formData, mother_whatsapp: e.target.value})}
                  placeholder="Mother's WhatsApp number"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Date of Birth *</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Select value={birthYear} onValueChange={(value) => handleDateChange('year', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {getYearRange().map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={birthMonth} onValueChange={(value) => handleDateChange('month', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={birthDay} onValueChange={(value) => handleDateChange('day', value)} disabled={!birthYear || !birthMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: getDaysInMonth(birthYear, birthMonth) }, (_, i) => i + 1).map((day) => {
                          const dayValue = day.toString().padStart(2, '0');
                          return (
                            <SelectItem key={day} value={dayValue}>
                              {day}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {dateError && (
                  <p className="text-sm text-red-500 mt-1">{dateError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="add_gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
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
                <Label htmlFor="add_class_id">Class *</Label>
                <Select 
                  value={formData.class_id} 
                  onValueChange={(value) => {
                    setFormData({...formData, class_id: value, section_id: ''});
                    fetchSections(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        No classes found. Please add classes in Manage Classes first.
                      </div>
                    ) : (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.standard})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add_section_id">Section *</Label>
                <Select 
                  value={formData.section_id} 
                  onValueChange={(value) => setFormData({...formData, section_id: value})}
                  disabled={!formData.class_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.class_id ? "Select section" : "Select class first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {!formData.class_id ? (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Please select a class first
                      </div>
                    ) : sections.length === 0 ? (
                      <div className="px-2 py-6 flex flex-col items-center gap-3">
                        <p className="text-sm text-muted-foreground text-center">
                          No sections found for this class.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                          onClick={() => setIsQuickAddSectionModalOpen(true)}
                        >
                          + Add Section
                        </Button>
                      </div>
                    ) : (
                      sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add_phone">Phone Number *</Label>
                <Input
                  id="add_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="add_email">Email</Label>
                <Input
                  id="add_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="add_address">Address *</Label>
                <Input
                  id="add_address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="add_guardian_name">Guardian Name *</Label>
                <Input
                  id="add_guardian_name"
                  value={formData.guardian_name}
                  onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="add_guardian_phone">Guardian Phone *</Label>
                <Input
                  id="add_guardian_phone"
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddStudentModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
                {loading ? 'Saving...' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Add Section Modal */}
      <Dialog open={isQuickAddSectionModalOpen} onOpenChange={setIsQuickAddSectionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Add a section for {classes.find(c => c.id === formData.class_id)?.name || 'the selected class'}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuickAddSection} className="space-y-4">
            <div>
              <Label htmlFor="quick_section_name">Section Name *</Label>
              <Input
                id="quick_section_name"
                value={quickSectionData.name}
                onChange={(e) => setQuickSectionData({...quickSectionData, name: e.target.value})}
                placeholder="e.g., A, B, C"
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="quick_max_students">Maximum Students</Label>
              <Input
                id="quick_max_students"
                type="number"
                min="1"
                value={quickSectionData.max_students}
                onChange={(e) => setQuickSectionData({...quickSectionData, max_students: e.target.value})}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsQuickAddSectionModalOpen(false);
                  setQuickSectionData({ name: '', max_students: 40 });
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-emerald-500 hover:bg-emerald-600" 
                disabled={isSavingSection}
              >
                {isSavingSection ? 'Adding...' : 'Add Section'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {studentToDelete && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm"><span className="font-semibold">Name:</span> {studentToDelete.name}</p>
                <p className="text-sm"><span className="font-semibold">Admission No:</span> {studentToDelete.admission_no}</p>
                <p className="text-sm"><span className="font-semibold">Roll No:</span> {studentToDelete.roll_no}</p>
              </div>
            )}
            <p className="text-sm text-red-600 mt-4 font-medium">
              ⚠️ This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setStudentToDelete(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Student Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-emerald-500" />
              <span>Student Details</span>
            </DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div id="student-print-content" className="space-y-6">
              {/* Student Header */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={viewingStudent.photo_url} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
                    {viewingStudent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{viewingStudent.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{viewingStudent.admission_no}</Badge>
                    <Badge variant="secondary">Roll: {viewingStudent.roll_no}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {getClassName(viewingStudent.class_id)} - Section {getSectionName(viewingStudent.section_id)}
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-emerald-500" />
                    Personal Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-medium">{viewingStudent.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date of Birth:</span>
                      <span className="font-medium">{viewingStudent.date_of_birth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{viewingStudent.email || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{viewingStudent.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Home className="h-4 w-4 mr-2 text-emerald-500" />
                    Address
                  </h4>
                  <p className="text-sm text-gray-700">{viewingStudent.address || '-'}</p>
                </div>
              </div>

              {/* Father's Information */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Father's Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{viewingStudent.father_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{viewingStudent.father_phone || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">WhatsApp:</span>
                    <p className="font-medium">{viewingStudent.father_whatsapp || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Mother's Information */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Mother's Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{viewingStudent.mother_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{viewingStudent.mother_phone || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">WhatsApp:</span>
                    <p className="font-medium">{viewingStudent.mother_whatsapp || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{viewingStudent.guardian_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{viewingStudent.guardian_phone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                const printContent = document.getElementById('student-print-content');
                if (printContent) {
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Student Details - ${viewingStudent?.name}</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 20px; }
                          .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px; }
                          .avatar { width: 80px; height: 80px; border-radius: 50%; background: #d1fae5; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #047857; }
                          .name { font-size: 20px; font-weight: bold; }
                          .badge { display: inline-block; padding: 2px 8px; background: #e5e7eb; border-radius: 4px; margin-right: 8px; font-size: 12px; }
                          .section { margin: 16px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; }
                          .section h4 { margin: 0 0 12px 0; font-weight: 600; }
                          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
                          .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                          .label { color: #6b7280; font-size: 12px; }
                          .value { font-weight: 500; }
                          @media print { body { padding: 0; } }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div class="avatar">${viewingStudent?.name?.split(' ').map(n => n[0]).join('')}</div>
                          <div>
                            <div class="name">${viewingStudent?.name}</div>
                            <div><span class="badge">${viewingStudent?.admission_no}</span><span class="badge">Roll: ${viewingStudent?.roll_no}</span></div>
                            <div style="color: #6b7280; margin-top: 4px;">${getClassName(viewingStudent?.class_id)} - Section ${getSectionName(viewingStudent?.section_id)}</div>
                          </div>
                        </div>
                        
                        <div class="section">
                          <h4>Personal Information</h4>
                          <div class="grid-2">
                            <div><div class="label">Gender</div><div class="value">${viewingStudent?.gender}</div></div>
                            <div><div class="label">Date of Birth</div><div class="value">${viewingStudent?.date_of_birth}</div></div>
                            <div><div class="label">Email</div><div class="value">${viewingStudent?.email || '-'}</div></div>
                            <div><div class="label">Phone</div><div class="value">${viewingStudent?.phone}</div></div>
                          </div>
                        </div>
                        
                        <div class="section">
                          <h4>Address</h4>
                          <p>${viewingStudent?.address || '-'}</p>
                        </div>
                        
                        <div class="section">
                          <h4>Father's Information</h4>
                          <div class="grid">
                            <div><div class="label">Name</div><div class="value">${viewingStudent?.father_name}</div></div>
                            <div><div class="label">Phone</div><div class="value">${viewingStudent?.father_phone || '-'}</div></div>
                            <div><div class="label">WhatsApp</div><div class="value">${viewingStudent?.father_whatsapp || '-'}</div></div>
                          </div>
                        </div>
                        
                        <div class="section">
                          <h4>Mother's Information</h4>
                          <div class="grid">
                            <div><div class="label">Name</div><div class="value">${viewingStudent?.mother_name}</div></div>
                            <div><div class="label">Phone</div><div class="value">${viewingStudent?.mother_phone || '-'}</div></div>
                            <div><div class="label">WhatsApp</div><div class="value">${viewingStudent?.mother_whatsapp || '-'}</div></div>
                          </div>
                        </div>
                        
                        <div class="section">
                          <h4>Guardian Information</h4>
                          <div class="grid-2">
                            <div><div class="label">Name</div><div class="value">${viewingStudent?.guardian_name}</div></div>
                            <div><div class="label">Phone</div><div class="value">${viewingStudent?.guardian_phone}</div></div>
                          </div>
                        </div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center space-y-3 pb-4 border-b">
              <div className="relative">
                {photoPreview || editingStudent?.photo_url ? (
                  <img 
                    src={photoPreview || editingStudent?.photo_url} 
                    alt="Student" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <Label htmlFor="edit-student-photo" className="cursor-pointer">
                <div className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700">
                  <Camera className="h-4 w-4" />
                  <span>{photoPreview || editingStudent?.photo_url ? 'Change Photo' : 'Upload Photo'}</span>
                </div>
                <Input
                  id="edit-student-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admission_no">Admission Number *</Label>
                <Input
                  id="admission_no"
                  value={formData.admission_no}
                  onChange={(e) => setFormData({...formData, admission_no: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="roll_no">Roll Number *</Label>
                <Input
                  id="roll_no"
                  value={formData.roll_no}
                  onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="father_name">Father's Name *</Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_father_phone">Father's Phone</Label>
                <Input
                  id="edit_father_phone"
                  value={formData.father_phone}
                  onChange={(e) => setFormData({...formData, father_phone: e.target.value})}
                  placeholder="Father's phone number"
                />
              </div>
              <div>
                <Label htmlFor="edit_father_whatsapp">Father's WhatsApp</Label>
                <Input
                  id="edit_father_whatsapp"
                  value={formData.father_whatsapp}
                  onChange={(e) => setFormData({...formData, father_whatsapp: e.target.value})}
                  placeholder="Father's WhatsApp number"
                />
              </div>
              <div>
                <Label htmlFor="mother_name">Mother's Name *</Label>
                <Input
                  id="mother_name"
                  value={formData.mother_name}
                  onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_mother_phone">Mother's Phone</Label>
                <Input
                  id="edit_mother_phone"
                  value={formData.mother_phone}
                  onChange={(e) => setFormData({...formData, mother_phone: e.target.value})}
                  placeholder="Mother's phone number"
                />
              </div>
              <div>
                <Label htmlFor="edit_mother_whatsapp">Mother's WhatsApp</Label>
                <Input
                  id="edit_mother_whatsapp"
                  value={formData.mother_whatsapp}
                  onChange={(e) => setFormData({...formData, mother_whatsapp: e.target.value})}
                  placeholder="Mother's WhatsApp number"
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
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
                <Label htmlFor="class_id">Class *</Label>
                <Select 
                  value={formData.class_id} 
                  onValueChange={(value) => {
                    setFormData({...formData, class_id: value, section_id: ''});
                    fetchSections(value);
                  }}
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
                <Label htmlFor="section_id">Section *</Label>
                <Select 
                  value={formData.section_id} 
                  onValueChange={(value) => setFormData({...formData, section_id: value})}
                  disabled={!formData.class_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="guardian_name">Guardian Name *</Label>
                <Input
                  id="guardian_name"
                  value={formData.guardian_name}
                  onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="guardian_phone">Guardian Phone *</Label>
                <Input
                  id="guardian_phone"
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
                {loading ? 'Saving...' : 'Update Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentList;