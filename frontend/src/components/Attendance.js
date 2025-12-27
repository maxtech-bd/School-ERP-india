import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  Calendar,
  Check,
  X,
  Clock,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_API_URL;
const API = BACKEND_URL;

// Mark Attendance Component
const MarkAttendance = () => {
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaffAndAttendance();
  }, [selectedDate]);

  const fetchStaffAndAttendance = async () => {
    setLoading(true);
    
    // IMPORTANT: Clear attendance state BEFORE fetching to ensure clean slate
    setAttendance({});
    
    try {
      const token = localStorage.getItem('token');
      
      console.log(`[ATTENDANCE-FETCH] Fetching attendance for date: ${selectedDate}`);
      
      // Fetch staff
      const staffResponse = await axios.get(`${API}/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(staffResponse.data);

      // Fetch existing attendance for the date
      const attendanceResponse = await axios.get(`${API}/attendance?date=${selectedDate}&type=staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`[ATTENDANCE-FETCH] Received ${attendanceResponse.data.length} attendance records for ${selectedDate}`);
      if (attendanceResponse.data.length > 0) {
        console.log(`[ATTENDANCE-FETCH] Sample record:`, attendanceResponse.data[0]);
      }
      
      // Create attendance map from API response
      const attendanceMap = {};
      attendanceResponse.data.forEach(record => {
        attendanceMap[record.staff_id] = record.status;
      });
      
      console.log(`[ATTENDANCE-FETCH] Created attendance map with ${Object.keys(attendanceMap).length} entries`);
      console.log(`[ATTENDANCE-FETCH] Setting attendance state:`, Object.keys(attendanceMap).length === 0 ? 'EMPTY (no saved attendance for this date)' : `${Object.keys(attendanceMap).length} staff members`);
      
      // Update state with new attendance data (could be empty for dates with no saved attendance)
      setAttendance(attendanceMap);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (staffId, status) => {
    setAttendance(prev => ({
      ...prev,
      [staffId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare attendance records
      const records = staff.map(member => ({
        staff_id: member.id,
        status: attendance[member.id] || 'absent',
        date: selectedDate
      }));

      await axios.post(`${API}/attendance/bulk`, {
        date: selectedDate,
        type: 'staff',
        records: records
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Attendance saved successfully');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    staff.forEach(member => {
      newAttendance[member.id] = status;
    });
    setAttendance(newAttendance);
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

  // Filter staff to only show those with attendance records for the selected date
  const displayedStaff = staff.filter(member => attendance[member.id] !== undefined);
  
  console.log(`[ATTENDANCE-RENDER] Total staff: ${staff.length}, Staff with attendance for ${selectedDate}: ${displayedStaff.length}`);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Mark daily attendance for staff members</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600">Total Staff</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600">Present</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600">Absent</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <CardTitle className="text-base sm:text-lg">Attendance Register</CardTitle>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm w-full sm:w-auto"
              />
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9"
                onClick={() => handleMarkAll('present')}
              >
                <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Mark All</span> Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9"
                onClick={() => handleMarkAll('absent')}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Mark All</span> Absent
              </Button>
              <Button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm h-8 sm:h-9"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6 pt-0">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">#</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Employee ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">Name</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Department</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Designation</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No attendance records found for {selectedDate}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedStaff.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{member.employee_id}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>{member.designation}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={attendance[member.id] === 'present' ? 'default' : 'outline'}
                            onClick={() => handleAttendanceChange(member.id, 'present')}
                            className={attendance[member.id] === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={attendance[member.id] === 'absent' ? 'default' : 'outline'}
                            onClick={() => handleAttendanceChange(member.id, 'absent')}
                            className={attendance[member.id] === 'absent' ? 'bg-red-500 hover:bg-red-600' : ''}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Attendance Report Component
const AttendanceReport = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendanceSummary();
  }, [selectedDate]);

  const fetchAttendanceSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/attendance/summary?date=${selectedDate}&type=staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      toast.error('Failed to load attendance summary');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/reports/attendance/staff-attendance?format=${format}&start_date=${selectedDate}&end_date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${selectedDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Attendance Report</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and export reports</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="text-sm">
            <Download className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="sm:hidden">Excel</span>
            <span className="hidden sm:inline">Export Excel</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="text-sm">
            <Download className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="sm:hidden">PDF</span>
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center">Loading...</CardContent>
        </Card>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_staff || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.present || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary.absent || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {summary.total_staff > 0 
                    ? Math.round((summary.present / summary.total_staff) * 100) 
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {summary.by_department && summary.by_department.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.by_department.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dept.department || 'N/A'}</TableCell>
                        <TableCell>{dept.total || 0}</TableCell>
                        <TableCell className="text-green-600">{dept.present || 0}</TableCell>
                        <TableCell className="text-red-600">{dept.absent || 0}</TableCell>
                        <TableCell>
                          <Badge variant={dept.total > 0 && (dept.present / dept.total) >= 0.8 ? 'success' : 'warning'}>
                            {dept.total > 0 ? Math.round((dept.present / dept.total) * 100) : 0}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No attendance data available for this date
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Main Attendance Component with Routes
const Attendance = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // If on base /attendance path, redirect to mark
  useEffect(() => {
    if (location.pathname === '/attendance') {
      navigate('/attendance/mark');
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="mark" element={<MarkAttendance />} />
      <Route path="report" element={<AttendanceReport />} />
    </Routes>
  );
};

export default Attendance;
