import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Download,
  FileText,
  TrendingUp,
  Users,
  User,
  Receipt
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const API = process.env.REACT_APP_API_URL || '/api';

const ParentFeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childDetails, setChildDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [currency, setCurrency] = useState('₹');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API}/fees/parent-dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDashboardData(response.data);
      
      if (response.data.children && response.data.children.length > 0) {
        setSelectedChild(response.data.children[0].student_id);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChildDetails = useCallback(async (studentId) => {
    if (!studentId) return;
    
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API}/fees/student-dashboard/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChildDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch child details:', error);
      toast.error('Failed to load child fee details');
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const fetchCurrency = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/settings/currency`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.symbol) {
        setCurrency(response.data.symbol);
      }
    } catch (error) {
      console.log('Using default currency');
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchCurrency();
  }, [fetchDashboardData, fetchCurrency]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildDetails(selectedChild);
    }
  }, [selectedChild, fetchChildDetails]);

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `${currency}${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `${currency}${(amount / 1000).toFixed(1)}K`;
    }
    return `${currency}${amount?.toLocaleString() || '0'}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedChildData = dashboardData?.children?.find(c => c.student_id === selectedChild);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Parent Fee Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome, {dashboardData?.parent_name}
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download All Statements
          </Button>
        </div>

        {/* Consolidated Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Children</p>
                  <p className="text-2xl font-bold mt-1">
                    {dashboardData?.total_children || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Total Fees</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">
                    {formatCurrency(dashboardData?.summary?.total_fees || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Total Paid</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">
                    {formatCurrency(dashboardData?.summary?.total_paid || 0)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Pending</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">
                    {formatCurrency(dashboardData?.summary?.total_pending || 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Overdue</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">
                    {formatCurrency(dashboardData?.summary?.total_overdue || 0)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Children Cards */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Users className="h-5 w-5" />
              My Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData?.children?.map((child) => (
                <div
                  key={child.student_id}
                  onClick={() => setSelectedChild(child.student_id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedChild === child.student_id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {child.student_name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {child.student_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {child.class_name} | {child.admission_no}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Pending:</span>
                      <span className="ml-1 font-medium text-orange-600 dark:text-orange-400">
                        {formatCurrency(child.total_pending)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Paid:</span>
                      <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(child.total_paid)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          child.status === 'overdue' ? 'bg-red-500' :
                          child.status === 'pending' ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${child.payment_percentage || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {child.payment_percentage || 0}% paid
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Child Details */}
        {selectedChildData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedChildData.student_name}'s Fee Details
              </h2>
            </div>

            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : childDetails ? (
              <>
                {/* Monthly Breakdown */}
                <Card className="dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white text-base">
                      <Calendar className="h-5 w-5" />
                      Monthly Fee Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {childDetails.monthly_breakdown && childDetails.monthly_breakdown.length > 0 ? (
                      <div className="space-y-3">
                        {childDetails.monthly_breakdown.map((month, index) => {
                          const isExpanded = expandedMonth === index;
                          
                          return (
                            <div 
                              key={index}
                              className="border rounded-lg dark:border-gray-700 overflow-hidden"
                            >
                              <div 
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                onClick={() => setExpandedMonth(isExpanded ? null : index)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                      {month.month_name?.split(' ')[0]?.substring(0, 3)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                      {month.month_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Due: {new Date(month.due_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                                      {formatCurrency(month.total_amount)}
                                    </p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(month.status)}`}>
                                      {getStatusIcon(month.status)}
                                      {month.status?.charAt(0).toUpperCase() + month.status?.slice(1)}
                                    </span>
                                  </div>
                                  {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                </div>
                              </div>
                              
                              {isExpanded && (
                                <div className="border-t dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                                  <div className="space-y-2">
                                    {month.fee_items?.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">{item.fee_type}</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {formatCurrency(item.amount)}
                                        </span>
                                      </div>
                                    ))}
                                    <div className="border-t dark:border-gray-700 pt-2 mt-2 space-y-1">
                                      <div className="flex justify-between text-green-600 dark:text-green-400 text-sm">
                                        <span>Paid</span>
                                        <span>{formatCurrency(month.paid_amount || 0)}</span>
                                      </div>
                                      <div className="flex justify-between text-orange-600 dark:text-orange-400 text-sm">
                                        <span>Pending</span>
                                        <span>{formatCurrency(month.pending_amount || 0)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No fee records found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Payments */}
                <Card className="dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white text-base">
                      <Receipt className="h-5 w-5" />
                      Recent Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {childDetails.recent_payments && childDetails.recent_payments.length > 0 ? (
                      <div className="overflow-x-auto -mx-4 md:mx-0">
                        <table className="w-full min-w-[500px]">
                          <thead>
                            <tr className="border-b dark:border-gray-700">
                              <th className="text-left py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Date</th>
                              <th className="text-left py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Receipt</th>
                              <th className="text-left py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Type</th>
                              <th className="text-left py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Mode</th>
                              <th className="text-right py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {childDetails.recent_payments.map((payment, index) => (
                              <tr key={payment.id || index} className="border-b dark:border-gray-700 last:border-0">
                                <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
                                  {new Date(payment.payment_date).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-3 text-xs font-mono text-blue-600 dark:text-blue-400">
                                  {payment.receipt_no}
                                </td>
                                <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
                                  {payment.fee_type}
                                </td>
                                <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400 capitalize">
                                  {payment.payment_mode}
                                </td>
                                <td className="py-2 px-3 text-sm font-medium text-green-600 dark:text-green-400 text-right">
                                  +{formatCurrency(payment.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No payments recorded yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        )}

        {/* Overall Progress */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <TrendingUp className="h-5 w-5" />
              Overall Payment Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Progress (All Children)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dashboardData?.summary?.payment_percentage || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, dashboardData?.summary?.payment_percentage || 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Paid: {formatCurrency(dashboardData?.summary?.total_paid || 0)}</span>
                <span>Total: {formatCurrency(dashboardData?.summary?.total_fees || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentFeeDashboard;
