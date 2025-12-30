import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { Users, Calendar, TrendingUp, AlertTriangle, Check, X, Clock, FileText, ChevronDown, Bell, Send } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "/api";

const ParentAttendanceWidget = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childLeaves, setChildLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      const url = selectedChild ? `${API}/attendance/enterprise/parent-view?child_id=${selectedChild}` : `${API}/attendance/enterprise/parent-view`;
      const response = await axios.get(url);
      setAttendanceData(response.data);
      if (!selectedChild && response.data?.children?.length > 0) {
        setSelectedChild(response.data.children[0].student_id);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  const fetchChildLeaves = useCallback(async () => {
    if (!selectedChild) return;
    try {
      const response = await axios.get(`${API}/attendance/leave/list?student_id=${selectedChild}`);
      setChildLeaves(response.data || []);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    }
  }, [selectedChild]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);
  useEffect(() => { if (selectedChild) fetchChildLeaves(); }, [selectedChild, fetchChildLeaves]);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) { toast.error('Please fill all required fields'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/attendance/leave/apply`, { student_id: selectedChild, ...leaveForm });
      toast.success('Leave application submitted successfully');
      setShowLeaveForm(false);
      setLeaveForm({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });
      fetchChildLeaves();
    } catch (error) {
      console.error('Failed to submit leave:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) { case 'present': return 'bg-green-500'; case 'absent': return 'bg-red-500'; case 'late': return 'bg-yellow-500'; case 'leave': return 'bg-blue-500'; default: return 'bg-gray-300'; }
  };

  const getStatusIcon = (status) => {
    switch (status) { case 'present': return <Check className="w-3 h-3" />; case 'absent': return <X className="w-3 h-3" />; case 'late': return <Clock className="w-3 h-3" />; case 'leave': return <FileText className="w-3 h-3" />; default: return null; }
  };

  const getLeaveStatusBadge = (status) => {
    const styles = { pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    return styles[status] || styles.pending;
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  const children = attendanceData?.children || [];
  const currentChild = children.find(c => c.student_id === selectedChild) || children[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      <div className="p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users className="w-6 h-6 text-indigo-600" />Children's Attendance</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your children's school attendance</p>
          </div>
          {currentChild && <button onClick={() => setShowLeaveForm(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"><Send className="w-4 h-4" /><span className="hidden sm:inline">Apply Leave</span></button>}
        </div>

        {children.length > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Select Child</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {children.map((child) => (<button key={child.student_id} onClick={() => setSelectedChild(child.student_id)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedChild === child.student_id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{child.student_name}</button>))}
            </div>
          </div>
        )}

        {currentChild ? (
          <>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white mb-4">
              <div className="flex items-start justify-between mb-4">
                <div><h2 className="text-lg sm:text-xl font-bold">{currentChild.student_name}</h2><p className="text-indigo-200 text-sm">{currentChild.class_name} {currentChild.section_name && `• ${currentChild.section_name}`}</p><p className="text-indigo-200 text-xs mt-1">Adm. No: {currentChild.admission_no}</p></div>
                <div className="text-right"><div className="text-3xl sm:text-4xl font-bold">{currentChild.attendance_percentage}%</div><p className="text-indigo-200 text-xs">Attendance Rate</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                <div className="bg-white/20 rounded-lg p-2 sm:p-3 text-center backdrop-blur"><div className="text-lg sm:text-xl font-bold">{currentChild.present}</div><div className="text-xs text-indigo-200">Present</div></div>
                <div className="bg-white/20 rounded-lg p-2 sm:p-3 text-center backdrop-blur"><div className="text-lg sm:text-xl font-bold">{currentChild.absent}</div><div className="text-xs text-indigo-200">Absent</div></div>
                <div className="bg-white/20 rounded-lg p-2 sm:p-3 text-center backdrop-blur"><div className="text-lg sm:text-xl font-bold">{currentChild.total_days}</div><div className="text-xs text-indigo-200">Total Days</div></div>
              </div>
              {currentChild.consecutive_absences > 0 && <div className="flex items-center gap-2 bg-red-500/20 rounded-lg p-3"><AlertTriangle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{currentChild.consecutive_absences} consecutive absence(s). Please ensure regular attendance.</span></div>}
              {currentChild.attendance_percentage < 75 && <div className="flex items-center gap-2 bg-yellow-500/20 rounded-lg p-3 mt-2"><Bell className="w-5 h-5 flex-shrink-0" /><span className="text-sm">Attendance is below 75%. This may affect exam eligibility.</span></div>}
            </div>

            <div className="flex overflow-x-auto scrollbar-hide gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button onClick={() => setActiveTab('overview')} className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Recent Activity</button>
              <button onClick={() => setActiveTab('leaves')} className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'leaves' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Leave History</button>
            </div>

            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="font-medium text-gray-900 dark:text-white">Last 7 Days</h3></div>
                {currentChild.recent_records && currentChild.recent_records.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {currentChild.recent_records.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 sm:p-4">
                        <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${getStatusColor(record.status)}`}>{getStatusIcon(record.status)}</div><div><p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>{record.reason && <p className="text-xs text-gray-500 dark:text-gray-400">{record.reason}</p>}</div></div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize text-white ${getStatusColor(record.status)}`}>{record.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (<div className="p-8 text-center text-gray-500 dark:text-gray-400"><Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No recent attendance records</p></div>)}
              </div>
            )}

            {activeTab === 'leaves' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                {childLeaves.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No leave applications found</p><button onClick={() => setShowLeaveForm(true)} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Apply for Leave</button></div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {childLeaves.map((leave) => (
                      <div key={leave.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-medium text-gray-900 dark:text-white capitalize">{leave.leave_type} Leave</span><span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getLeaveStatusBadge(leave.status)}`}>{leave.status}</span></div><p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{leave.start_date} to {leave.end_date} ({leave.total_days} days)</p><p className="text-sm text-gray-500 dark:text-gray-400">{leave.reason}</p>{leave.review_remarks && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">Teacher remarks: {leave.review_remarks}</p>}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"><Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" /><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Children Linked</h3><p className="text-sm text-gray-500 dark:text-gray-400">Contact the school administration to link your children to your account.</p></div>)}

        {showLeaveForm && selectedChild && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="text-lg font-medium text-gray-900 dark:text-white">Apply Leave for {currentChild?.student_name}</h3></div>
              <form onSubmit={handleLeaveSubmit} className="p-4 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label><select value={leaveForm.leave_type} onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"><option value="sick">Sick Leave</option><option value="personal">Personal</option><option value="family">Family Emergency</option><option value="other">Other</option></select></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label><input type="date" value={leaveForm.start_date} onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" required /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label><input type="date" value={leaveForm.end_date} onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" required /></div></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label><textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} rows={3} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" placeholder="Enter reason for leave..." required /></div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowLeaveForm(false)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button><button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2">{submitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <><Send className="w-4 h-4" />Submit</>}</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentAttendanceWidget;
