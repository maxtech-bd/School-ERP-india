import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import { 
  UserCheck, 
  Plus, 
  Search, 
  Download,
  Upload,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CalendarDays,
  Check,
  X,
  GraduationCap,
  Camera,
  Image
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_API_URL;
const API = BACKEND_URL;

// Staff List Component (shows all staff)
const StaffListView = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all_departments');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [isBulkPhotoModalOpen, setIsBulkPhotoModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    qualification: '',
    experience_years: 0,
    date_of_joining: '',
    salary: 0,
    address: ''
  });

  const departments = [
    'Administration',
    'Teaching',
    'Accounts',
    'Transport',
    'Maintenance',
    'Library',
    'Laboratory',
    'Sports',
    'Medical'
  ];

  const designations = [
    'Principal',
    'Vice Principal',
    'Head Teacher',
    'Senior Teacher',
    'Teacher',
    'Assistant Teacher',
    'Accountant',
    'Librarian',
    'Lab Assistant',
    'Sports Instructor',
    'Nurse',
    'Security Guard',
    'Driver',
    'Cleaning Staff'
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/staff`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStaff(response.data);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        experience_years: parseInt(formData.experience_years),
        salary: parseFloat(formData.salary)
      };

      let staffId;
      if (editingStaff) {
        await axios.put(`${API}/staff/${editingStaff.id}`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        staffId = editingStaff.id;
        toast.success('Staff updated successfully');
      } else {
        const response = await axios.post(`${API}/staff`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        staffId = response.data.id;
        toast.success('Staff added successfully');
      }

      // Upload photo if selected
      if (photoFile && staffId) {
        const photoFormData = new FormData();
        photoFormData.append('file', photoFile);
        
        try {
          await axios.post(`${API}/staff/${staffId}/photo`, photoFormData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (photoError) {
          console.error('Failed to upload photo:', photoError);
          toast.warning('Staff saved but photo upload failed');
        }
      }
      
      setIsAddModalOpen(false);
      setEditingStaff(null);
      resetForm();
      fetchStaff();
    } catch (error) {
      console.error('Failed to save staff:', error);
      toast.error(error.response?.data?.detail || 'Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staffMember) => {
    setFormData({
      employee_id: staffMember.employee_id,
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      designation: staffMember.designation,
      department: staffMember.department,
      qualification: staffMember.qualification,
      experience_years: staffMember.experience_years,
      date_of_joining: staffMember.date_of_joining,
      salary: staffMember.salary,
      address: staffMember.address
    });
    setEditingStaff(staffMember);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (staffMember) => {
    setStaffToDelete(staffMember);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/staff/${staffToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Staff member deleted successfully');
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
      await fetchStaff();
    } catch (error) {
      console.error('Failed to delete staff:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/staff/export?format=${format}&department=${selectedDepartment}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `staff_directory_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Staff data exported as ${format.toUpperCase()} successfully`);
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export staff data');
    }
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(fileExtension)) {
        toast.error('Invalid file type. Please upload .csv, .xlsx, or .xls file');
        return;
      }
      
      setImportFile(file);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/staff/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const { success_count, error_count, errors } = response.data;
      
      if (success_count > 0) {
        toast.success(`${success_count} staff members imported successfully`);
        await fetchStaff(); // Refresh the staff list
      }
      
      if (error_count > 0) {
        const errorMsg = errors && errors.length > 0 
          ? `${error_count} errors occurred. First error: ${errors[0]}` 
          : `${error_count} errors occurred during import`;
        toast.warning(errorMsg);
      }
      
      setIsImportModalOpen(false);
      setImportFile(null);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to import staff data');
    } finally {
      setImporting(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBulkPhotoUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select at least one photo to upload');
      return;
    }

    setUploadProgress('Uploading...');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(`${API}/staff/bulk-photo-upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const { uploaded_count, total_files, failed_uploads } = response.data;
      
      if (failed_uploads && failed_uploads.length > 0) {
        toast.warning(`Uploaded ${uploaded_count}/${total_files} photos. ${failed_uploads.length} failed.`);
      } else {
        toast.success(`Successfully uploaded ${uploaded_count} photo(s)`);
      }
      
      setIsBulkPhotoModalOpen(false);
      setSelectedFiles([]);
      setUploadProgress('');
      await fetchStaff(); // Refresh staff list
    } catch (error) {
      console.error('Bulk photo upload failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload photos');
      setUploadProgress('');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      name: '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      qualification: '',
      experience_years: 0,
      date_of_joining: '',
      salary: 0,
      address: ''
    });
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = !searchTerm || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all_departments' || member.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const getDesignationColor = (designation) => {
    const colors = {
      'Principal': 'bg-red-100 text-red-800',
      'Vice Principal': 'bg-orange-100 text-orange-800',
      'Head Teacher': 'bg-purple-100 text-purple-800',
      'Senior Teacher': 'bg-blue-100 text-blue-800',
      'Teacher': 'bg-emerald-100 text-emerald-800',
      'Assistant Teacher': 'bg-green-100 text-green-800',
    };
    return colors[designation] || 'bg-gray-100 text-gray-800';
  };

  if (loading && staff.length === 0) {
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
    <div className="space-y-4 sm:space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage school staff and employee records</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={handleImport}>
            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 hidden md:flex" onClick={() => setIsBulkPhotoModalOpen(true)}>
            <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Photos
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={() => setIsExportModalOpen(true)}>
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm h-8 sm:h-9">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </DialogTitle>
                <DialogDescription>
                  Fill in the staff member information below. All fields marked with * are required.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Upload Section */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {photoPreview || editingStaff?.photo_url ? (
                      <img 
                        src={photoPreview || `${API}${editingStaff?.photo_url}`} 
                        alt="Staff" 
                        className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="photo" className="cursor-pointer">
                      <div className="flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-700">
                        <Camera className="h-4 w-4" />
                        <span>Upload Photo</span>
                      </div>
                    </Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, max 2MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee_id">Employee ID *</Label>
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
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
                    <Label htmlFor="designation">Designation *</Label>
                    <Select 
                      value={formData.designation} 
                      onValueChange={(value) => setFormData({...formData, designation: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((designation) => (
                          <SelectItem key={designation} value={designation}>
                            {designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => setFormData({...formData, department: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="qualification">Qualification *</Label>
                    <Input
                      id="qualification"
                      value={formData.qualification}
                      onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                      placeholder="e.g., B.Ed, M.A, B.Tech"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience_years">Experience (Years) *</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_joining">Date of Joining *</Label>
                    <Input
                      id="date_of_joining"
                      type="date"
                      value={formData.date_of_joining}
                      onChange={(e) => setFormData({...formData, date_of_joining: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Monthly Salary *</Label>
                    <Input
                      id="salary"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      required
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
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingStaff(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
                    {loading ? 'Saving...' : (editingStaff ? 'Update Staff' : 'Add Staff')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => s.designation.toLowerCase().includes('teacher')).length}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin Staff</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => s.department === 'Administration').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, employee ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_departments">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-emerald-500" />
              <span>Staff List</span>
              <Badge variant="secondary">{filteredStaff.length} members</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {searchTerm || selectedDepartment
                        ? 'No staff found matching your search criteria'
                        : 'No staff added yet'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.photo_url} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.qualification}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.employee_id}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDesignationColor(member.designation)}>
                          {member.designation}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{member.department}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {member.experience_years} years
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          ₹{member.salary?.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {member.phone}
                          </div>
                          <div className="flex items-center text-gray-500 mt-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(member)}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {staffToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Name:</span> {staffToDelete.name}</p>
                <p><span className="font-medium">Employee ID:</span> {staffToDelete.employee_id}</p>
                <p><span className="font-medium">Department:</span> {staffToDelete.department}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Staff'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Staff Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Staff Data</DialogTitle>
            <DialogDescription>
              Upload an Excel (.xlsx, .xls) or CSV file to import staff members in bulk
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImportFileChange}
                  className="hidden"
                  id="staff-import-file"
                />
                <label htmlFor="staff-import-file" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {importFile ? importFile.name : 'Click to select file'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: .csv, .xlsx, .xls
                  </p>
                </label>
              </div>
              <div className="flex items-center justify-center mb-2">
                <Button
                  type="button"
                  variant="link"
                  className="text-emerald-600 hover:text-emerald-700 text-sm p-0 h-auto"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `${API}/download/staff-import-sample`;
                    link.download = 'staff_import_sample.csv';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Sample template downloaded successfully');
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Sample CSV
                </Button>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Required columns:</strong> Name, Email (others optional)
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportFile(null);
              }}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportSubmit}
              disabled={!importFile || importing}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Staff Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Staff Directory</DialogTitle>
            <DialogDescription>
              Choose the format for exporting staff data
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <Button
                onClick={() => handleExport('excel')}
                className="w-full justify-start bg-emerald-500 hover:bg-emerald-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export as Excel (.xlsx)
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                className="w-full justify-start bg-blue-500 hover:bg-blue-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export as PDF (Professional Report)
              </Button>
            </div>
            <div className="mt-4 bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                {selectedDepartment !== 'all_departments' 
                  ? `Exporting: ${selectedDepartment} department only`
                  : 'Exporting: All departments'
                }
              </p>
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

      {/* Bulk Photo Upload Modal */}
      <Dialog open={isBulkPhotoModalOpen} onOpenChange={setIsBulkPhotoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-emerald-500" />
              <span>Bulk Photo Upload (Staff)</span>
            </DialogTitle>
            <DialogDescription>
              Upload multiple staff photos at once. File names should match staff Employee IDs.
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
                <li>Max size: 2MB per photo</li>
                <li>Recommended: 300x400 pixels</li>
                <li><strong>File name = Employee ID</strong></li>
                <li>Example: <code>EMP-2025-0004.jpg</code>, <code>EMP-2025-0005.png</code></li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkPhotoModalOpen(false);
                setSelectedFiles([]);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={handleBulkPhotoUpload}
              disabled={!selectedFiles || selectedFiles.length === 0}
            >
              {uploadProgress || 'Upload Photos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add Staff Component
const AddStaffView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    gender: undefined,
    date_of_birth: '',
    address: '',
    department: undefined,
    designation: undefined,
    role: 'staff',
    date_of_joining: '',
    employment_type: 'Full-time',
    experience_years: 0,
    salary: 0,
    qualification: '',
    status: 'Active'
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadLookupData();
  }, []);

  const loadLookupData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [deptResponse, desigResponse, rolesResponse] = await Promise.all([
        axios.get(`${API}/departments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/designations`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/staff-roles`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setDepartments(deptResponse.data.departments);
      setDesignations(desigResponse.data.designations);
      setRoles(rolesResponse.data.roles);
    } catch (error) {
      console.error('Failed to load lookup data:', error);
      toast.error('Failed to load form data');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.date_of_joining) newErrors.date_of_joining = 'Date of joining is required';
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone format validation (basic)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Salary validation
    if (formData.salary < 0) {
      newErrors.salary = 'Salary cannot be negative';
    }
    
    // Experience validation
    if (formData.experience_years < 0 || formData.experience_years > 50) {
      newErrors.experience_years = 'Experience must be between 0 and 50 years';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (addAnother = false) => {
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/staff`, formData);
      
      toast.success('Staff member added successfully!');
      
      if (addAnother) {
        // Clear form but keep some defaults
        setFormData({
          employee_id: '',
          name: '',
          email: '',
          phone: '',
          gender: undefined,
          date_of_birth: '',
          address: '',
          department: formData.department, // Keep same department
          designation: undefined,
          role: 'staff',
          date_of_joining: '',
          employment_type: 'Full-time',
          experience_years: 0,
          salary: 0,
          qualification: '',
          status: 'Active'
        });
        setErrors({});
      } else {
        // Navigate to staff list
        navigate('/staff');
      }
    } catch (error) {
      console.error('Failed to create staff:', error);
      if (error.response?.status === 409) {
        setErrors({ email: error.response.data.detail });
        toast.error(error.response.data.detail);
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to add staff members');
      } else {
        toast.error('Failed to add staff member. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Staff</h1>
          <p className="text-muted-foreground">Add a new staff member to your school</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/staff')}>
          Back to Staff List
        </Button>
      </div>
      
      <div className="grid gap-6">
        {/* Identity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Identity Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID (Optional)</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  placeholder="Auto-generated if empty"
                />
                <p className="text-sm text-muted-foreground">Leave empty to auto-generate</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
              
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                  placeholder="+880171234567"
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full address including city, state, postal code"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Employment Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Select value={formData.designation} onValueChange={(value) => handleInputChange('designation', value)}>
                  <SelectTrigger className={errors.designation ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((desig) => (
                      <SelectItem key={desig} value={desig}>{desig}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.designation && <p className="text-sm text-red-500">{errors.designation}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">System Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select value={formData.employment_type} onValueChange={(value) => handleInputChange('employment_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_of_joining">Date of Joining *</Label>
                <Input
                  id="date_of_joining"
                  type="date"
                  value={formData.date_of_joining}
                  onChange={(e) => handleInputChange('date_of_joining', e.target.value)}
                  className={errors.date_of_joining ? 'border-red-500' : ''}
                />
                {errors.date_of_joining && <p className="text-sm text-red-500">{errors.date_of_joining}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience_years">Experience (Years)</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                  className={errors.experience_years ? 'border-red-500' : ''}
                />
                {errors.experience_years && <p className="text-sm text-red-500">{errors.experience_years}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', parseFloat(e.target.value) || 0)}
                  className={errors.salary ? 'border-red-500' : ''}
                  placeholder="0"
                />
                {errors.salary && <p className="text-sm text-red-500">{errors.salary}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  placeholder="e.g., M.Sc Mathematics, B.Ed"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/staff')}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save & Add Another'
                )}
              </Button>
              
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Staff'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Leave Requests Component
const LeaveRequestsView = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [departmentFilter, setDepartmentFilter] = useState(undefined);
  
  // New Leave Request Form
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: undefined,
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Action Modal (Approve/Reject)
  const [actionModal, setActionModal] = useState({ open: false, request: null, action: '' });
  const [actionNote, setActionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadLeaveRequests();
    loadLeaveTypes();
  }, [statusFilter, departmentFilter]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (departmentFilter && departmentFilter !== 'all') params.append('department', departmentFilter);
      
      const response = await axios.get(`${API}/leave-requests?${params}`);
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Failed to load leave requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveTypes = async () => {
    try {
      const response = await axios.get(`${API}/leave-types`);
      setLeaveTypes(response.data.leave_types);
    } catch (error) {
      console.error('Failed to load leave types:', error);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.leave_type) errors.leave_type = 'Leave type is required';
    if (!formData.start_date) errors.start_date = 'Start date is required';
    if (!formData.end_date) errors.end_date = 'End date is required';
    if (!formData.reason.trim()) errors.reason = 'Reason is required';
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async () => {
    if (!validateForm()) return;
    
    setCreating(true);
    try {
      await axios.post(`${API}/leave-requests`, formData);
      toast.success('Leave request submitted successfully!');
      setIsCreateModalOpen(false);
      setFormData({ leave_type: undefined, start_date: '', end_date: '', reason: '' });
      setFormErrors({});
      loadLeaveRequests();
    } catch (error) {
      console.error('Failed to create leave request:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown error';
      console.error('Detailed error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      if (error.response?.status === 400) {
        toast.error(errorMessage);
      } else if (error.response?.status === 404) {
        toast.error(`Staff record not found. ${errorMessage}`);
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to create leave requests');
      } else {
        toast.error(`Failed to submit leave request: ${errorMessage}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      await axios.put(`${API}/leave-requests/${actionModal.request.id}`, {
        status: actionModal.action,
        approver_note: actionNote
      });
      
      const actionText = actionModal.action === 'approved' ? 'approved' : 'rejected';
      toast.success(`Leave request ${actionText} successfully!`);
      
      setActionModal({ open: false, request: null, action: '' });
      setActionNote('');
      loadLeaveRequests();
    } catch (error) {
      console.error('Failed to update leave request:', error);
      toast.error('Failed to update leave request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      await axios.put(`${API}/leave-requests/${requestId}`, {
        status: 'cancelled'
      });
      toast.success('Leave request cancelled successfully!');
      loadLeaveRequests();
    } catch (error) {
      console.error('Failed to cancel leave request:', error);
      toast.error('Failed to cancel leave request');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
          <p className="text-muted-foreground">Manage staff leave requests</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
          <Button variant="outline" onClick={() => navigate('/staff')}>
            Back to Staff List
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-48">
              <Label>Filter by Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  <SelectItem value="Teaching">Teaching</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Accounts">Accounts</SelectItem>
                  <SelectItem value="Library">Library</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests ({leaveRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leave requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="font-semibold">{request.staff_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.staff_employee_id} • {request.staff_department}
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-sm font-medium">Leave Type</div>
                          <div className="text-sm text-muted-foreground">{request.leave_type}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Duration</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(request.start_date)} - {formatDate(request.end_date)}
                            <span className="ml-2 font-medium">({request.total_days} days)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Applied On</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(request.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1">Reason</div>
                        <div className="text-sm text-muted-foreground">{request.reason}</div>
                      </div>
                      
                      {request.approver_name && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-1">
                            {request.status === 'approved' ? 'Approved by' : 'Rejected by'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.approver_name} • {formatDate(request.approved_at)}
                          </div>
                          {request.approver_note && (
                            <div className="text-sm text-muted-foreground mt-1 italic">
                              Note: {request.approver_note}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setActionModal({ open: true, request, action: 'approved' })}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActionModal({ open: true, request, action: 'rejected' })}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(request.id)}
                            className="text-gray-600"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Leave Request Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">New Leave Request</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Leave Type *</Label>
                <Select 
                  value={formData.leave_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, leave_type: value }))}
                >
                  <SelectTrigger className={formErrors.leave_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.leave_type && <p className="text-red-500 text-sm mt-1">{formErrors.leave_type}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className={formErrors.start_date ? 'border-red-500' : ''}
                  />
                  {formErrors.start_date && <p className="text-red-500 text-sm mt-1">{formErrors.start_date}</p>}
                </div>
                
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className={formErrors.end_date ? 'border-red-500' : ''}
                  />
                  {formErrors.end_date && <p className="text-red-500 text-sm mt-1">{formErrors.end_date}</p>}
                </div>
              </div>
              
              <div>
                <Label>Reason *</Label>
                <textarea
                  className={`w-full min-h-20 p-2 border rounded-md resize-none ${formErrors.reason ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please provide a detailed reason for your leave request..."
                />
                {formErrors.reason && <p className="text-red-500 text-sm mt-1">{formErrors.reason}</p>}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSubmit} disabled={creating}>
                {creating ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve/Reject) */}
      {actionModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              {actionModal.action === 'approved' ? 'Approve' : 'Reject'} Leave Request
            </h2>
            
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm dark:text-gray-300">
                <div><strong>Staff:</strong> {actionModal.request?.staff_name}</div>
                <div><strong>Type:</strong> {actionModal.request?.leave_type}</div>
                <div><strong>Duration:</strong> {actionModal.request?.total_days} days</div>
              </div>
            </div>
            
            <div className="mb-4">
              <Label className="dark:text-gray-300">Note (Optional)</Label>
              <textarea
                className="w-full min-h-20 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md resize-none"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Add a note for the staff member..."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setActionModal({ open: false, request: null, action: '' })}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAction}
                disabled={actionLoading}
                className={actionModal.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {actionLoading ? 'Processing...' : (actionModal.action === 'approved' ? 'Approve' : 'Reject')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Staff Attendance Component
const AttendanceView = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('all_departments');
  const [staffList, setStaffList] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load staff based on filters
  const loadStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/staff`, {
        params: {
          department: selectedDepartment === 'all_departments' ? undefined : selectedDepartment,
          is_active: true
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStaffList(response.data);
      
      // Initialize attendance records for new staff
      const newRecords = {};
      response.data.forEach(staff => {
        if (!attendanceRecords[staff.employee_id]) {
          newRecords[staff.employee_id] = 'present';
        }
      });
      setAttendanceRecords(prev => ({ ...prev, ...newRecords }));
    } catch (error) {
      console.error('Failed to load staff:', error);
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  // Load existing attendance for selected date
  const loadAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/attendance`, {
        params: {
          date: selectedDate,
          type: 'staff'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const records = {};
      response.data.forEach(record => {
        records[record.employee_id] = record.status;
      });
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Failed to load attendance:', error);
      // Don't show error toast as this might be expected for new dates
    }
  };

  // Save attendance records
  const saveAttendance = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const attendanceData = staffList.map(staff => ({
        employee_id: staff.employee_id,
        staff_name: staff.name,
        department: staff.department,
        date: selectedDate,
        status: attendanceRecords[staff.employee_id] || 'present',
        marked_by: 'admin', // Will be set by backend based on current user
        type: 'staff'
      }));

      await axios.post(`${API}/attendance/bulk`, {
        date: selectedDate,
        type: 'staff',
        records: attendanceData
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success(`Attendance saved for ${selectedDate}`);
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast.error('Failed to save attendance records');
    } finally {
      setSaving(false);
    }
  };

  // Update individual attendance
  const updateAttendance = (employeeId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [employeeId]: status
    }));
  };

  // Calculate summary with useMemo to ensure it updates when dependencies change
  // Logic: "Late" and "Out Pass" count as present (they attended), only "Absent" doesn't count as present
  const attendanceSummary = useMemo(() => {
    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      outpass: 0
    };
    
    staffList.forEach(staff => {
      const status = attendanceRecords[staff.employee_id] || 'present';
      
      // Count specific statuses
      if (status === 'absent') {
        summary.absent++;
      } else if (status === 'late') {
        summary.late++;
        summary.present++; // Late staff are still present
      } else if (status === 'outpass') {
        summary.outpass++;
        summary.present++; // Out pass staff are still present
      } else {
        summary.present++; // Regular present
      }
    });
    
    return summary;
  }, [staffList, attendanceRecords]);

  useEffect(() => {
    loadStaff();
  }, [selectedDepartment]);

  useEffect(() => {
    if (staffList.length > 0) {
      loadAttendance();
    }
  }, [selectedDate, staffList]);

  const departments = [
    'all_departments',
    'Administration',
    'Teaching',
    'Support Staff',
    'IT',
    'Finance',
    'Maintenance'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
          <p className="text-muted-foreground">Mark and track staff attendance</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/staff')}>
          Back to Staff List
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="department">Department</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept === 'all_departments' ? 'All Departments' : dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
            <div>
              <p className="text-2xl font-bold">{attendanceSummary.present || 0}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
            <div>
              <p className="text-2xl font-bold">{attendanceSummary.absent || 0}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
            <div>
              <p className="text-2xl font-bold">{attendanceSummary.late || 0}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
            <div>
              <p className="text-2xl font-bold">{attendanceSummary.outpass || 0}</p>
              <p className="text-xs text-muted-foreground">Out Pass</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Staff Attendance - {selectedDate}</CardTitle>
          <Button 
            onClick={saveAttendance} 
            disabled={saving || staffList.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff found for selected filters
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((staff) => (
                  <TableRow key={staff.employee_id}>
                    <TableCell className="font-medium">{staff.employee_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={staff.photo_url} />
                          <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{staff.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>{staff.designation}</TableCell>
                    <TableCell>
                      <Select 
                        value={attendanceRecords[staff.employee_id] || 'present'} 
                        onValueChange={(value) => updateAttendance(staff.employee_id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Present
                            </div>
                          </SelectItem>
                          <SelectItem value="absent">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              Absent
                            </div>
                          </SelectItem>
                          <SelectItem value="late">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              Late
                            </div>
                          </SelectItem>
                          <SelectItem value="outpass">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              Out Pass
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main Staff Component with Routing
const StaffList = () => {
  return (
    <Routes>
      <Route index element={<StaffListView />} />
      <Route path="add" element={<AddStaffView />} />
      <Route path="leave-requests" element={<LeaveRequestsView />} />
      <Route path="attendance" element={<AttendanceView />} />
    </Routes>
  );
};

export default StaffList;