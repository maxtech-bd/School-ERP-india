import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar, Check, X, Clock, Users, Search, Filter, ChevronDown, Save, RefreshCw, UserCheck, AlertCircle, FileText } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "/api";

const TeacherAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('daily');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periods, setPeriods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [rules, setRules] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('mark');

  const fetchClasses = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/classes`);
      setClasses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  }, []);

  const fetchSections = useCallback(async (classId) => {
    try {
      const response = await axios.get(`${API}/sections?class_id=${classId}`);
      setSections(response.data || []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      setSections([]);
    }
  }, []);

  const fetchPeriods = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/timetable/periods`);
      setPeriods(response.data || []);
    } catch (error) {
      console.error('Failed to fetch periods:', error);
    }
  }, []);

  const fetchRules = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/attendance/enterprise/rules`);
      setRules(response.data || {});
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      let url = `${API}/attendance/enterprise/class-students/${selectedClass}`;
      if (selectedSection) {
        url += `?section_id=${selectedSection}`;
      }
      const response = await axios.get(url);
      const studentList = response.data || [];
      setStudents(studentList);
      
      const initialData = {};
      studentList.forEach(s => {
        initialData[s.id] = { status: 'present', reason: '', late_minutes: 0 };
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSection]);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      let url = `${API}/attendance/leave/list?status=pending`;
      if (selectedClass) {
        url += `&class_id=${selectedClass}`;
      }
      const response = await axios.get(url);
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    }
  }, [selectedClass]);

  const fetchExistingAttendance = useCallback(async () => {
    if (!selectedClass || !selectedDate || students.length === 0) return;
    
    try {
      const params = new URLSearchParams({
        class_id: selectedClass,
        date: selectedDate,
        session_type: sessionType
      });
      if (selectedSection) params.append('section_id', selectedSection);
      if (selectedPeriod && sessionType === 'period') params.append('period_id', selectedPeriod);
      
      const response = await axios.get(`${API}/attendance/enterprise/sessions?${params.toString()}`);
      const sessions = response.data || [];
      
      if (sessions.length > 0) {
        const session = sessions[0];
        setSessionInfo(session);
        
        const existingData = {};
        students.forEach(s => {
          existingData[s.id] = { status: 'present', reason: '', late_minutes: 0 };
        });
        
        if (session.records && Array.isArray(session.records)) {
          session.records.forEach(record => {
            if (existingData[record.student_id]) {
              existingData[record.student_id] = {
                status: record.status || 'present',
                reason: record.reason || '',
                late_minutes: record.late_minutes || 0
              };
            }
          });
        }
        
        setAttendanceData(existingData);
      } else {
        setSessionInfo(null);
      }
    } catch (error) {
      console.error('Failed to fetch existing attendance:', error);
    }
  }, [selectedClass, selectedSection, selectedDate, sessionType, selectedPeriod, students]);

  useEffect(() => {
    fetchClasses();
    fetchPeriods();
    fetchRules();
  }, [fetchClasses, fetchPeriods, fetchRules]);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
      fetchStudents();
      fetchLeaveRequests();
    }
  }, [selectedClass, fetchSections, fetchStudents, fetchLeaveRequests]);

  useEffect(() => {
    if (students.length > 0) {
      fetchExistingAttendance();
    }
  }, [selectedDate, sessionType, selectedPeriod, students, fetchExistingAttendance]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleBulkAction = (status) => {
    const updatedData = {};
    students.forEach(s => {
      updatedData[s.id] = { ...attendanceData[s.id], status };
    });
    setAttendanceData(updatedData);
    toast.success(`All students marked as ${status}`);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      toast.error('Please select class and date');
      return;
    }

    setSaving(true);
    try {
      const records = Object.entries(attendanceData).map(([studentId, data]) => ({
        student_id: studentId,
        status: data.status,
        reason: data.reason,
        late_minutes: data.late_minutes
      }));

      const payload = {
        class_id: selectedClass,
        section_id: selectedSection || null,
        date: selectedDate,
        period_id: sessionType === 'period' ? selectedPeriod : null,
        session_type: sessionType,
        records
      };

      const response = await axios.post(`${API}/attendance/enterprise/mark`, payload);
      setSessionInfo(response.data);
      toast.success(`Attendance saved! Present: ${response.data.present}, Absent: ${response.data.absent}`);
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast.error(error.response?.data?.detail || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveAction = async (leaveId, action) => {
    try {
      await axios.put(`${API}/attendance/leave/${leaveId}`, {
        status: action,
        review_remarks: action === 'approved' ? 'Approved by teacher' : 'Rejected by teacher'
      });
      toast.success(`Leave request ${action}`);
      fetchLeaveRequests();
    } catch (error) {
      console.error('Failed to update leave:', error);
      toast.error('Failed to update leave request');
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    present: Object.values(attendanceData).filter(d => d.status === 'present').length,
    absent: Object.values(attendanceData).filter(d => d.status === 'absent').length,
    late: Object.values(attendanceData).filter(d => d.status === 'late').length,
    leave: Object.values(attendanceData).filter(d => d.status === 'leave').length,
    total: students.length
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 dark:bg-green-900/30 border-green-500';
      case 'absent': return 'bg-red-100 dark:bg-red-900/30 border-red-500';
      case 'late': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500';
      case 'leave': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500';
      default: return 'bg-gray-100 dark:bg-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-600" />
              Attendance
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mark and manage student attendance</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStudents()}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto scrollbar-hide gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('mark')}
            className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'mark'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
              activeTab === 'leave'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Leave Requests
            {leaveRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {leaveRequests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'mark' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:hidden p-1 text-gray-500"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${showFilters ? '' : 'hidden sm:grid'}`}>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Class *</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedSection('');
                    }}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    disabled={!selectedClass}
                  >
                    <option value="">All Sections</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date *</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  >
                    <option value="daily">Daily Attendance</option>
                    <option value="period">Period-wise</option>
                  </select>
                </div>
              </div>
            </div>

            {selectedClass && (
              <>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</div>
                    <div className="text-xs text-green-700 dark:text-green-300">Present</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</div>
                    <div className="text-xs text-red-700 dark:text-red-300">Absent</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-lg sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300">Late</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.leave}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Leave</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                      </div>
                      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        <button
                          onClick={() => handleBulkAction('present')}
                          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          All Present
                        </button>
                        <button
                          onClick={() => handleBulkAction('absent')}
                          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          All Absent
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[50vh] overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                        <Users className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">No students found</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredStudents.map((student, index) => (
                          <div
                            key={student.id}
                            className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${getStatusBg(attendanceData[student.id]?.status)}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {student.admission_no} {student.roll_no ? `• Roll: ${student.roll_no}` : ''}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleStatusChange(student.id, 'present')}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${
                                    attendanceData[student.id]?.status === 'present'
                                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                                  }`}
                                  title="Present"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(student.id, 'absent')}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${
                                    attendanceData[student.id]?.status === 'absent'
                                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                                  }`}
                                  title="Absent"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(student.id, 'late')}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${
                                    attendanceData[student.id]?.status === 'late'
                                      ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                                  }`}
                                  title="Late"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(student.id, 'leave')}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${
                                    attendanceData[student.id]?.status === 'leave'
                                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                  }`}
                                  title="Leave"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-gray-800 border-t sm:border border-gray-200 dark:border-gray-700 p-3 sm:rounded-xl sm:shadow-sm">
                  <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{stats.total}</span> students
                      {sessionInfo && (
                        <span className="text-green-600 dark:text-green-400 ml-2">• Saved</span>
                      )}
                    </div>
                    <button
                      onClick={handleSaveAttendance}
                      disabled={saving || !selectedClass || students.length === 0}
                      className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/30"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span className="hidden sm:inline">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Attendance</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {!selectedClass && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Class</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose a class from the filters above to view and mark student attendance</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'leave' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pending Leave Requests</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and approve student leave applications</p>
            </div>

            {leaveRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending leave requests</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {leaveRequests.map((leave) => (
                  <div key={leave.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{leave.student_name}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {leave.class_name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span className="capitalize">{leave.leave_type}</span> • {leave.start_date} to {leave.end_date} ({leave.total_days} days)
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{leave.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'approved')}
                          className="px-4 py-2 text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'rejected')}
                          className="px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
