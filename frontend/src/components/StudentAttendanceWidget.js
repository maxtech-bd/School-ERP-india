import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar, Check, X, Clock, TrendingUp, FileText, ChevronLeft, ChevronRight, AlertTriangle, Send } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "/api";

const StudentAttendanceWidget = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const fetchAttendance = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/attendance/enterprise/my-attendance`);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/attendance/leave/list`);
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchLeaveRequests();
  }, [fetchAttendance, fetchLeaveRequests]);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const studentRes = await axios.get(`${API}/students/me`);
      await axios.post(`${API}/attendance/leave/apply`, {
        student_id: studentRes.data.id,
        ...leaveForm
      });
      toast.success('Leave application submitted successfully');
      setShowLeaveForm(false);
      setLeaveForm({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });
      fetchLeaveRequests();
    } catch (error) {
      console.error('Failed to submit leave:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <Check className="w-3 h-3 text-green-600" />;
      case 'absent': return <X className="w-3 h-3 text-red-600" />;
      case 'late': return <Clock className="w-3 h-3 text-yellow-600" />;
      case 'leave': return <FileText className="w-3 h-3 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'late': return 'bg-yellow-500';
      case 'leave': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getLeaveStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return styles[status] || styles.pending;
  };

  const renderCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const records = attendanceData?.records || [];
    const recordMap = {};
    records.forEach(r => {
      const date = r.date.split('T')[0];
      recordMap[date] = r.status;
    });

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 sm:h-10"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = recordMap[dateStr];
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          className={`h-8 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm relative ${
            isToday ? 'ring-2 ring-indigo-500' : ''
          } ${status ? getStatusColor(status) + ' text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const summary = attendanceData?.summary || {};
  const percentage = summary.attendance_percentage || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      <div className="p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
              My Attendance
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your attendance record</p>
          </div>
          <button
            onClick={() => setShowLeaveForm(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Apply Leave</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-200 text-sm">Attendance Rate</p>
              <p className="text-3xl sm:text-4xl font-bold">{percentage.toFixed(1)}%</p>
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${percentage * 2.83} 283`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-white/20 rounded-lg p-2 sm:p-3 text-center backdrop-blur">
              <div className="text-lg sm:text-xl font-bold">{summary.total_present || 0}</div>
              <div className="text-xs text-indigo-200">Present</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 sm:p-3 text-center backdrop-blur">
              <div className="text-lg sm:text-xl font-bold">{summary.total_absent || 0}</div>
              <div className="text-xs text-indigo-200">Absent</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 sm:p-3 text-center backdrop-blur">
              <div className="text-lg sm:text-xl font-bold">{summary.total_late || 0}</div>
              <div className="text-xs text-indigo-200">Late</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 sm:p-3 text-center backdrop-blur">
              <div className="text-lg sm:text-xl font-bold">{summary.total_leave || 0}</div>
              <div className="text-xs text-indigo-200">Leave</div>
            </div>
          </div>

          {summary.consecutive_absences > 0 && (
            <div className="mt-4 flex items-center gap-2 bg-red-500/20 rounded-lg p-3">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">{summary.consecutive_absences} consecutive absence(s) recorded</span>
            </div>
          )}
        </div>

        <div className="flex overflow-x-auto scrollbar-hide gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button onClick={() => setActiveTab('overview')} className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Calendar</button>
          <button onClick={() => setActiveTab('history')} className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>History</button>
          <button onClick={() => setActiveTab('leaves')} className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'leaves' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>My Leaves</button>
        </div>

        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (<div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">{day}</div>))}</div>
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><div className="w-4 h-4 rounded bg-green-500"></div> Present</div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><div className="w-4 h-4 rounded bg-red-500"></div> Absent</div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><div className="w-4 h-4 rounded bg-yellow-500"></div> Late</div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><div className="w-4 h-4 rounded bg-blue-500"></div> Leave</div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {(attendanceData?.records || []).slice(0, 30).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${record.status === 'present' ? 'bg-green-100 dark:bg-green-900/30' : record.status === 'absent' ? 'bg-red-100 dark:bg-red-900/30' : record.status === 'late' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>{getStatusIcon(record.status)}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      {record.reason && <p className="text-xs text-gray-500 dark:text-gray-400">{record.reason}</p>}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${record.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : record.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : record.status === 'late' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{record.status}</span>
                </div>
              ))}
              {(!attendanceData?.records || attendanceData.records.length === 0) && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400"><Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No attendance records found</p></div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {leaveRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No leave applications found</p>
                <button onClick={() => setShowLeaveForm(true)} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Apply for Leave</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {leaveRequests.map((leave) => (
                  <div key={leave.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white capitalize">{leave.leave_type} Leave</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getLeaveStatusBadge(leave.status)}`}>{leave.status}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{leave.start_date} to {leave.end_date} ({leave.total_days} days)</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{leave.reason}</p>
                        {leave.review_remarks && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">Remarks: {leave.review_remarks}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showLeaveForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="text-lg font-medium text-gray-900 dark:text-white">Apply for Leave</h3></div>
              <form onSubmit={handleLeaveSubmit} className="p-4 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label><select value={leaveForm.leave_type} onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"><option value="sick">Sick Leave</option><option value="personal">Personal</option><option value="family">Family Emergency</option><option value="other">Other</option></select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label><input type="date" value={leaveForm.start_date} onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label><input type="date" value={leaveForm.end_date} onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" required /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label><textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} rows={3} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" placeholder="Enter reason for leave..." required /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowLeaveForm(false)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2">{submitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <><Send className="w-4 h-4" />Submit</>}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceWidget;
