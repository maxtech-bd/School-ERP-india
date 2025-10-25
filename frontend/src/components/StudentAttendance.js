import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Check, X, Users, UserCheck, UserX, Calendar, Download, FileSpreadsheet } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const MarkStudentAttendance = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedClass, selectedSection, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API}/classes`);
      setClasses(response.data);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`${API}/sections?class_id=${classId}`);
      setSections(response.data);
    } catch (error) {
      toast.error('Failed to load sections');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/students`, {
        params: {
          class_id: selectedClass,
          section_id: selectedSection,
          is_active: true
        }
      });
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const response = await axios.get(`${API}/attendance`, {
        params: {
          date: selectedDate,
          type: 'student',
          class_id: selectedClass,
          section_id: selectedSection
        }
      });
      
      const attendanceMap = {};
      response.data.forEach(record => {
        attendanceMap[record.person_id] = record.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Failed to load existing attendance:', error);
    }
  };

  const markAttendance = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
    toast.success(`All students marked as ${status}`);
  };

  const saveAttendance = async () => {
    if (Object.keys(attendance).length === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }

    try {
      setSaving(true);
      
      const selectedClassObj = classes.find(c => c.id === selectedClass);
      const selectedSectionObj = sections.find(s => s.id === selectedSection);
      
      const records = Object.entries(attendance).map(([studentId, status]) => {
        const student = students.find(s => s.id === studentId);
        return {
          person_id: studentId,
          person_name: student?.name || '',
          status: status,
          date: selectedDate,
          type: 'student',
          class_id: selectedClass,
          section_id: selectedSection,
          class_name: selectedClassObj?.name || '',
          section_name: selectedSectionObj?.name || ''
        };
      });

      await axios.post(`${API}/attendance/bulk`, {
        date: selectedDate,
        type: 'student',
        records: records
      });

      toast.success('Student attendance saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mark Student Attendance</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('');
                  setStudents([]);
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!selectedClass}
              >
                <option value="">Select Section</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSection && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2">
            <Button onClick={() => markAll('present')} variant="outline" className="gap-2">
              <Check className="h-4 w-4" />
              Mark All Present
            </Button>
            <Button onClick={() => markAll('absent')} variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Mark All Absent
            </Button>
          </div>

          {/* Student List */}
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No students found</div>
              ) : (
                <div className="space-y-2">
                  {students.map(student => (
                    <div 
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">Roll: {student.roll_number || student.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => markAttendance(student.id, 'present')}
                          variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                          size="sm"
                          className={attendance[student.id] === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Present
                        </Button>
                        <Button
                          onClick={() => markAttendance(student.id, 'absent')}
                          variant={attendance[student.id] === 'absent' ? 'default' : 'outline'}
                          size="sm"
                          className={attendance[student.id] === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Absent
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveAttendance}
              disabled={saving || Object.keys(attendance).length === 0}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const StudentAttendanceReport = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedClass !== 'all') {
      fetchSections(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchSummary();
  }, [selectedDate, selectedClass, selectedSection]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API}/classes`);
      setClasses(response.data);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`${API}/sections?class_id=${classId}`);
      setSections(response.data);
    } catch (error) {
      toast.error('Failed to load sections');
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const params = {
        date: selectedDate,
        type: 'student'
      };
      
      if (selectedClass !== 'all') {
        params.class_id = selectedClass;
      }
      if (selectedSection !== 'all') {
        params.section_id = selectedSection;
      }

      const response = await axios.get(`${API}/attendance/summary`, { params });
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const params = {
        format: format,
        date: selectedDate,
        type: 'student'
      };
      
      if (selectedClass !== 'all') {
        params.class_id = selectedClass;
      }
      if (selectedSection !== 'all') {
        params.section_id = selectedSection;
      }

      const response = await axios.get(`${API}/reports/attendance/student-attendance`, {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_attendance_${selectedDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
      console.error(error);
    }
  };

  const attendanceRate = summary?.total > 0 
    ? ((summary.present / summary.total) * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Attendance Report</h2>
        <div className="flex gap-2">
          <Button onClick={() => exportReport('excel')} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => exportReport('pdf')} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('all');
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={selectedClass === 'all'}
              >
                <option value="all">All Sections</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.present || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary.absent || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

const StudentAttendance = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Mark Attendance', path: '/students/attendance/mark' },
    { name: 'Attendance Report', path: '/students/attendance/report' }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${location.pathname === tab.path
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="mark" element={<MarkStudentAttendance />} />
        <Route path="report" element={<StudentAttendanceReport />} />
        <Route path="/" element={<MarkStudentAttendance />} />
      </Routes>
    </div>
  );
};

export default StudentAttendance;
