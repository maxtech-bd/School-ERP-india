import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BookOpen, 
  Plus, 
  Users,
  UserCheck,
  Edit,
  Trash2,
  Search,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const BACKEND_URL = process.env.REACT_APP_API_URL;
const API = BACKEND_URL;

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editingSection, setEditingSection] = useState(null);

  const [classFormData, setClassFormData] = useState({
    name: '',
    standard: 'select_standard',
    class_teacher_id: 'no_teacher',
    max_students: 60
  });

  const [sectionFormData, setSectionFormData] = useState({
    class_id: 'select_class',
    name: '',
    section_teacher_id: 'no_teacher',
    max_students: 40
  });

  const standards = [
    'Nursery', 'LKG', 'UKG', 
    '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching class management data...');
      const [classesRes, sectionsRes, staffRes] = await Promise.all([
        axios.get(`${API}/classes`),
        axios.get(`${API}/sections`),
        axios.get(`${API}/staff`)
      ]);
      
      console.log('✅ Classes fetched:', classesRes.data);
      console.log('✅ Sections fetched:', sectionsRes.data);
      console.log('✅ Staff fetched:', staffRes.data);
      
      setClasses(classesRes.data);
      setSections(sectionsRes.data);
      
      // Filter staff to include teachers and senior positions
      const teachers = staffRes.data.filter(s => 
        s.designation && (
          s.designation.toLowerCase().includes('teacher') || 
          s.designation.toLowerCase().includes('principal') ||
          s.designation.toLowerCase().includes('head')
        )
      );
      console.log('✅ Teachers filtered:', teachers);
      
      setStaff(teachers);
    } catch (error) {
      console.error('❌ Failed to fetch data:', error);
      toast.error('Failed to load data: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 Submitting class form:', classFormData);
    setLoading(true);

    try {
      // Validate required fields
      if (classFormData.standard === 'select_standard') {
        toast.error('Please select a standard');
        setLoading(false);
        return;
      }

      const submitData = {
        ...classFormData,
        max_students: parseInt(classFormData.max_students),
        class_teacher_id: classFormData.class_teacher_id === 'no_teacher' ? null : classFormData.class_teacher_id
      };

      console.log('📤 Sending data to API:', submitData);

      if (editingClass) {
        await axios.put(`${API}/classes/${editingClass.id}`, submitData);
        toast.success('Class updated successfully');
      } else {
        await axios.post(`${API}/classes`, submitData);
        toast.success('Class added successfully');
      }
      
      setIsClassModalOpen(false);
      setEditingClass(null);
      resetClassForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save class:', error);
      toast.error(error.response?.data?.detail || 'Failed to save class');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 Submitting section form:', sectionFormData);
    setLoading(true);

    try {
      // Validate required fields
      if (sectionFormData.class_id === 'select_class') {
        toast.error('Please select a class');
        setLoading(false);
        return;
      }

      const submitData = {
        ...sectionFormData,
        max_students: parseInt(sectionFormData.max_students),
        section_teacher_id: sectionFormData.section_teacher_id === 'no_teacher' ? null : sectionFormData.section_teacher_id
      };

      console.log('📤 Sending section data to API:', submitData);

      if (editingSection) {
        await axios.put(`${API}/sections/${editingSection.id}`, submitData);
        toast.success('Section updated successfully');
      } else {
        await axios.post(`${API}/sections`, submitData);
        toast.success('Section added successfully');
      }
      
      setIsSectionModalOpen(false);
      setEditingSection(null);
      resetSectionForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save section:', error);
      toast.error(error.response?.data?.detail || 'Failed to save section');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClass = (cls) => {
    setClassFormData({
      name: cls.name,
      standard: cls.standard,
      class_teacher_id: cls.class_teacher_id || 'no_teacher',
      max_students: cls.max_students
    });
    setEditingClass(cls);
    setIsClassModalOpen(true);
  };

  const handleEditSection = (section) => {
    setSectionFormData({
      class_id: section.class_id,
      name: section.name,
      section_teacher_id: section.section_teacher_id || 'no_teacher',
      max_students: section.max_students
    });
    setEditingSection(section);
    setIsSectionModalOpen(true);
  };

  const handleDeleteClass = async (cls) => {
    const result = await Swal.fire({
      title: `Delete ${cls.name}?`,
      text: 'This action will remove all sections under this class and cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/classes/${cls.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success(`Class "${cls.name}" deleted successfully`);
      fetchData(); // Reload data to update counters and list
    } catch (error) {
      console.error('Failed to delete class:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete class');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (section) => {
    const result = await Swal.fire({
      title: `Delete Section ${section.name}?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    toast.info('Section delete functionality is not yet implemented in the backend');
  };

  const resetClassForm = () => {
    setClassFormData({
      name: '',
      standard: 'select_standard',
      class_teacher_id: 'no_teacher',
      max_students: 60
    });
  };

  const resetSectionForm = () => {
    setSectionFormData({
      class_id: 'select_class',
      name: '',
      section_teacher_id: 'no_teacher',
      max_students: 40
    });
  };

  const createSampleTeachers = async () => {
    try {
      console.log('🔄 Creating sample teachers for testing...');
      const sampleTeachers = [
        {
          employee_id: 'TEACH001',
          name: 'John Smith',
          email: 'john.smith@school.com',
          phone: '9876543210',
          designation: 'Teacher',
          department: 'Teaching',
          qualification: 'B.Ed, M.A',
          experience_years: 5,
          date_of_joining: '2024-01-15',
          salary: 45000,
          address: '123 Teacher Street'
        },
        {
          employee_id: 'TEACH002',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@school.com',
          phone: '9876543211',
          designation: 'Senior Teacher',
          department: 'Teaching',
          qualification: 'M.Ed, M.Sc',
          experience_years: 8,
          date_of_joining: '2022-06-01',
          salary: 55000,
          address: '456 Education Lane'
        },
        {
          employee_id: 'HEAD001',
          name: 'Dr. Robert Wilson',
          email: 'robert.wilson@school.com',
          phone: '9876543212',
          designation: 'Head Teacher',
          department: 'Administration',
          qualification: 'Ph.D, B.Ed',
          experience_years: 15,
          date_of_joining: '2020-04-01',
          salary: 75000,
          address: '789 Principal Road'
        }
      ];

      for (const teacher of sampleTeachers) {
        try {
          await axios.post(`${API}/staff`, teacher);
          console.log(`✅ Created teacher: ${teacher.name}`);
        } catch (error) {
          console.log(`ℹ️ Teacher ${teacher.name} already exists or error:`, error.response?.status);
        }
      }
      
      // Refresh data after creating teachers
      fetchData();
      toast.success('Sample teachers created successfully!');
    } catch (error) {
      console.error('❌ Failed to create sample teachers:', error);
      toast.error('Failed to create sample teachers');
    }
  };

  const getTeacherName = (teacherId) => {
    if (!teacherId) return 'Not assigned';
    const teacher = staff.find(s => s.id === teacherId);
    return teacher ? teacher.name : 'Unknown';
  };

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name} (${cls.standard})` : 'Unknown';
  };

  const getSectionsForClass = (classId) => {
    return sections.filter(s => s.class_id === classId);
  };

  if (loading && classes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-600 mt-1">Manage classes, sections, and teacher assignments</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {staff.length === 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={createSampleTeachers}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sample Teachers
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              try {
                console.log('🔄 Exporting class data...');
                // Generate CSV export
                const csvData = [
                  ['Class Name', 'Standard', 'Class Teacher', 'Sections', 'Max Students', 'Current Students'],
                  ...classes.map(cls => [
                    cls.name,
                    cls.standard,
                    getTeacherName(cls.class_teacher_id),
                    getSectionsForClass(cls.id).length,
                    cls.max_students,
                    0 // Will be calculated from actual student data
                  ])
                ];

                const csvContent = csvData.map(row => row.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'class-management-report.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast.success('Class data exported successfully');
              } catch (error) {
                console.error('Export failed:', error);
                toast.error('Failed to export data');
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Classes
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sections</p>
                <p className="text-3xl font-bold text-gray-900">{sections.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Teachers</p>
                <p className="text-3xl font-bold text-gray-900">
                  {classes.filter(c => c.class_teacher_id).length + sections.filter(s => s.section_teacher_id).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Classes and Sections */}
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Classes</h2>
            <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => {
                    console.log('🔄 Add Class button clicked!');
                    console.log('Modal state before:', isClassModalOpen);
                    setIsClassModalOpen(true);
                    console.log('Modal state set to true');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingClass ? 'Edit Class' : 'Add New Class'}
                  </DialogTitle>
                  <DialogDescription>
                    Create or modify class information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleClassSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="class_name">Class Name *</Label>
                    <Input
                      id="class_name"
                      value={classFormData.name}
                      onChange={(e) => setClassFormData({...classFormData, name: e.target.value})}
                      placeholder="e.g., Mathematics, Science"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="standard">Standard *</Label>
                    <Select 
                      value={classFormData.standard} 
                      onValueChange={(value) => setClassFormData({...classFormData, standard: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select_standard" disabled>Select Standard</SelectItem>
                        {standards.map((std) => (
                          <SelectItem key={std} value={std}>
                            {std}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="class_teacher">Class Teacher</Label>
                    <Select 
                      value={classFormData.class_teacher_id} 
                      onValueChange={(value) => setClassFormData({...classFormData, class_teacher_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_teacher">No teacher assigned</SelectItem>
                        {staff.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name} - {teacher.designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="max_students_class">Maximum Students</Label>
                    <Input
                      id="max_students_class"
                      type="number"
                      min="1"
                      value={classFormData.max_students}
                      onChange={(e) => setClassFormData({...classFormData, max_students: e.target.value})}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsClassModalOpen(false);
                        setEditingClass(null);
                        resetClassForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
                      {loading ? 'Saving...' : (editingClass ? 'Update Class' : 'Add Class')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Standard</TableHead>
                      <TableHead>Class Teacher</TableHead>
                      <TableHead>Sections</TableHead>
                      <TableHead>Max Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No classes added yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      classes.map((cls, index) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div className="font-medium">{cls.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{cls.standard}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {cls.class_teacher_id ? (
                                <>
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                                      {getTeacherName(cls.class_teacher_id).split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{getTeacherName(cls.class_teacher_id)}</span>
                                </>
                              ) : (
                                <span className="text-gray-500 text-sm">Not assigned</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getSectionsForClass(cls.id).length} sections
                            </Badge>
                          </TableCell>
                          <TableCell>{cls.max_students}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClass(cls)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteClass(cls)}
                              >
                                <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sections</h2>
            <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => {
                    console.log('🔄 Add Section button clicked!');
                    console.log('Modal state before:', isSectionModalOpen);
                    setIsSectionModalOpen(true);
                    console.log('Modal state set to true');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSection ? 'Edit Section' : 'Add New Section'}
                  </DialogTitle>
                  <DialogDescription>
                    Create or modify section information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSectionSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="section_class">Class *</Label>
                    <Select 
                      value={sectionFormData.class_id} 
                      onValueChange={(value) => setSectionFormData({...sectionFormData, class_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select_class" disabled>Select Class</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.standard})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="section_name">Section Name *</Label>
                    <Input
                      id="section_name"
                      value={sectionFormData.name}
                      onChange={(e) => setSectionFormData({...sectionFormData, name: e.target.value})}
                      placeholder="e.g., A, B, C"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="section_teacher">Section Teacher</Label>
                    <Select 
                      value={sectionFormData.section_teacher_id} 
                      onValueChange={(value) => setSectionFormData({...sectionFormData, section_teacher_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_teacher">No teacher assigned</SelectItem>
                        {staff.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name} - {teacher.designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="max_students_section">Maximum Students</Label>
                    <Input
                      id="max_students_section"
                      type="number"
                      min="1"
                      value={sectionFormData.max_students}
                      onChange={(e) => setSectionFormData({...sectionFormData, max_students: e.target.value})}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsSectionModalOpen(false);
                        setEditingSection(null);
                        resetSectionForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
                      {loading ? 'Saving...' : (editingSection ? 'Update Section' : 'Add Section')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Section Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section Teacher</TableHead>
                      <TableHead>Max Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No sections added yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      sections.map((section, index) => (
                        <TableRow key={section.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-medium">
                              {section.name}
                            </Badge>
                          </TableCell>
                          <TableCell>{getClassName(section.class_id)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {section.section_teacher_id ? (
                                <>
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                      {getTeacherName(section.section_teacher_id).split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{getTeacherName(section.section_teacher_id)}</span>
                                </>
                              ) : (
                                <span className="text-gray-500 text-sm">Not assigned</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{section.max_students}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSection(section)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteSection(section)}
                              >
                                <Trash2 className="h-4 w-4" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassManagement;