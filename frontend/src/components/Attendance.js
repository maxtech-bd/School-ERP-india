import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
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
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_API_URL || '/api';

const Attendance = () => {
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
    setAttendance({});
    
    try {
      const token = localStorage.getItem('token');
      
      const staffResponse = await axios.get(`${API}/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(staffResponse.data);

      const attendanceResponse = await axios.get(`${API}/attendance?date=${selectedDate}&type=staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const attendanceMap = {};
      attendanceResponse.data.forEach(record => {
        attendanceMap[record.staff_id] = record.status;
      });
      
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

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                Staff Attendance
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Mark attendance for staff members
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button variant="ghost" size="sm" onClick={() => changeDate(-1)} className="h-7 sm:h-8 px-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 sm:gap-2 px-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-xs sm:text-sm font-medium outline-none w-28 sm:w-32"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => changeDate(1)} className="h-7 sm:h-8 px-2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm h-8 sm:h-9"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Present: {presentCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Absent: {absentCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span>Not Marked: {staff.length - presentCount - absentCount}</span>
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
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No staff members found
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="hidden md:table-cell">{member.employee_id}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell className="hidden lg:table-cell">{member.department}</TableCell>
                      <TableCell className="hidden sm:table-cell">{member.designation}</TableCell>
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

export default Attendance;
