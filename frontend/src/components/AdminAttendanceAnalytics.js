import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { BarChart3, Users, Calendar, TrendingDown, TrendingUp, Settings, Download, Filter, ChevronDown, RefreshCw, AlertTriangle, Clock, Check, X, FileText, PieChart } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "/api";

const AdminAttendanceAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [dateRange, setDateRange] = useState({ start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
  const [rules, setRules] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [editedRules, setEditedRules] = useState({});

  const fetchClasses = useCallback(async () => { try { const response = await axios.get(`${API}/classes`); setClasses(response.data || []); } catch (error) { console.error('Failed to fetch classes:', error); } }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ start_date: dateRange.start, end_date: dateRange.end });
      if (selectedClass) params.append('class_id', selectedClass);
      const response = await axios.get(`${API}/attendance/enterprise/analytics?${params.toString()}`);
      setAnalytics(response.data);
    } catch (error) { console.error('Failed to fetch analytics:', error); toast.error('Failed to load analytics'); } finally { setLoading(false); }
  }, [selectedClass, dateRange]);

  const fetchRules = useCallback(async () => { try { const response = await axios.get(`${API}/attendance/enterprise/rules`); setRules(response.data || {}); setEditedRules(response.data || {}); } catch (error) { console.error('Failed to fetch rules:', error); } }, []);

  useEffect(() => { fetchClasses(); fetchRules(); }, [fetchClasses, fetchRules]);
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const handleSaveRules = async () => {
    setSavingRules(true);
    try { await axios.put(`${API}/attendance/enterprise/rules`, editedRules); setRules(editedRules); toast.success('Attendance rules updated successfully'); setShowRulesModal(false); } catch (error) { console.error('Failed to save rules:', error); toast.error('Failed to update rules'); } finally { setSavingRules(false); }
  };

  const summary = analytics?.summary || {};
  const dailyTrend = analytics?.daily_trend || [];
  const classSummary = analytics?.class_summary || [];
  const lowAttendance = analytics?.low_attendance_students || [];
  const maxDailyTotal = Math.max(...dailyTrend.map(d => d.total), 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div><h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><BarChart3 className="w-6 h-6 text-indigo-600" />Attendance Analytics</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor and analyze attendance patterns</p></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowRulesModal(true)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Attendance Rules"><Settings className="w-5 h-5" /></button>
            <button onClick={fetchAnalytics} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><RefreshCw className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Class Filter</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"><option value="">All Classes</option>{classes.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
            <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label><input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label><input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
          </div>
        </div>

        {loading ? (<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"><div className="flex items-center justify-between mb-2"><div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><Check className="w-5 h-5 text-green-600 dark:text-green-400" /></div><span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" />{summary.attendance_rate?.toFixed(1)}%</span></div><p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.present || 0}</p><p className="text-xs text-gray-500 dark:text-gray-400">Present Days</p></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"><div className="flex items-center justify-between mb-2"><div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></div></div><p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.absent || 0}</p><p className="text-xs text-gray-500 dark:text-gray-400">Absent Days</p></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"><div className="flex items-center justify-between mb-2"><div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" /></div></div><p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.late || 0}</p><p className="text-xs text-gray-500 dark:text-gray-400">Late Arrivals</p></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"><div className="flex items-center justify-between mb-2"><div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div></div><p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.leave || 0}</p><p className="text-xs text-gray-500 dark:text-gray-400">On Leave</p></div>
            </div>

            <div className="flex overflow-x-auto scrollbar-hide gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button onClick={() => setActiveTab('overview')} className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Daily Trend</button>
              <button onClick={() => setActiveTab('classes')} className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'classes' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>By Class</button>
              <button onClick={() => setActiveTab('alerts')} className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${activeTab === 'alerts' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Low Attendance{lowAttendance.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{lowAttendance.length}</span>}</button>
            </div>

            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4"><h3 className="font-medium text-gray-900 dark:text-white">Daily Attendance Trend</h3></div>
                {dailyTrend.length > 0 ? (
                  <div className="overflow-x-auto"><div className="min-w-[600px]"><div className="flex items-end gap-1 h-48 mb-2">{dailyTrend.slice(-14).map((day, index) => { const presentHeight = (day.present / maxDailyTotal) * 100; const absentHeight = (day.absent / maxDailyTotal) * 100; return (<div key={index} className="flex-1 flex flex-col items-center gap-1"><div className="w-full flex flex-col justify-end h-40"><div className="w-full bg-red-400 dark:bg-red-500 rounded-t" style={{ height: `${absentHeight}%` }} title={`Absent: ${day.absent}`}></div><div className="w-full bg-green-400 dark:bg-green-500 rounded-t" style={{ height: `${presentHeight}%` }} title={`Present: ${day.present}`}></div></div></div>); })}</div><div className="flex gap-1">{dailyTrend.slice(-14).map((day, index) => (<div key={index} className="flex-1 text-center"><span className="text-xs text-gray-500 dark:text-gray-400 block truncate">{new Date(day.date).getDate()}</span></div>))}</div></div></div>
                ) : (<div className="text-center py-12 text-gray-500 dark:text-gray-400"><BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No data available for selected period</p></div>)}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"><div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><div className="w-3 h-3 rounded bg-green-400 dark:bg-green-500"></div> Present</div><div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><div className="w-3 h-3 rounded bg-red-400 dark:bg-red-500"></div> Absent</div></div>
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="font-medium text-gray-900 dark:text-white">Class-wise Attendance</h3></div>
                {classSummary.length > 0 ? (<div className="divide-y divide-gray-100 dark:divide-gray-700">{classSummary.map((cls, index) => { const percentage = cls.total > 0 ? (cls.present / cls.total * 100) : 0; return (<div key={index} className="p-4"><div className="flex items-center justify-between mb-2"><span className="font-medium text-gray-900 dark:text-white">{cls.class_name}</span><span className={`text-sm font-medium ${percentage >= 75 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{percentage.toFixed(1)}%</span></div><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2"><div className={`h-2 rounded-full ${percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div></div><div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400"><span>Present: {cls.present}</span><span>Absent: {cls.absent}</span><span>Late: {cls.late || 0}</span><span>Total: {cls.total}</span></div></div>); })}</div>) : (<div className="p-8 text-center text-gray-500 dark:text-gray-400"><PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No class data available</p></div>)}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" />Students with Low Attendance (&lt;75%)</h3></div>
                {lowAttendance.length > 0 ? (<div className="divide-y divide-gray-100 dark:divide-gray-700">{lowAttendance.map((student, index) => (<div key={index} className="p-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3 min-w-0 flex-1"><div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{student.student_name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{student.class_name} • Present: {student.present}/{student.total}</p></div></div><span className="flex-shrink-0 px-3 py-1 text-sm font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">{student.attendance_percentage.toFixed(1)}%</span></div>))}</div>) : (<div className="p-8 text-center text-gray-500 dark:text-gray-400"><Check className="w-12 h-12 mx-auto mb-3 text-green-500" /><p>All students have satisfactory attendance</p></div>)}
              </div>
            )}
          </>
        )}

        {showRulesModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"><Settings className="w-5 h-5" />Attendance Rules</h3></div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Late Threshold (mins)</label><input type="number" value={editedRules.late_threshold_minutes || 15} onChange={(e) => setEditedRules({ ...editedRules, late_threshold_minutes: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Attendance %</label><input type="number" value={editedRules.minimum_attendance_percentage || 75} onChange={(e) => setEditedRules({ ...editedRules, minimum_attendance_percentage: parseFloat(e.target.value) })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School Start Time</label><input type="time" value={editedRules.school_start_time || '08:00'} onChange={(e) => setEditedRules({ ...editedRules, school_start_time: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School End Time</label><input type="time" value={editedRules.school_end_time || '15:00'} onChange={(e) => setEditedRules({ ...editedRules, school_end_time: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notify Parent After Absences</label><input type="number" value={editedRules.notify_after_absences || 3} onChange={(e) => setEditedRules({ ...editedRules, notify_after_absences: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"><span className="text-sm text-gray-700 dark:text-gray-300">Auto Notify Parents</span><button onClick={() => setEditedRules({ ...editedRules, auto_notify_parents: !editedRules.auto_notify_parents })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editedRules.auto_notify_parents ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editedRules.auto_notify_parents ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"><span className="text-sm text-gray-700 dark:text-gray-300">Enable Period-wise Attendance</span><button onClick={() => setEditedRules({ ...editedRules, enable_period_wise: !editedRules.enable_period_wise })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editedRules.enable_period_wise ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editedRules.enable_period_wise ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
                <div className="flex gap-3 pt-4"><button type="button" onClick={() => { setEditedRules(rules); setShowRulesModal(false); }} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button><button onClick={handleSaveRules} disabled={savingRules} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2">{savingRules ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : 'Save Rules'}</button></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceAnalytics;
