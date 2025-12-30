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
  Receipt
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const API = process.env.REACT_APP_API_URL || '/api';

const StudentFeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState(null);
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [currency, setCurrency] = useState('₹');

  const fetchFeeData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API}/fees/my-fees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFeeData(response.data);
    } catch (error) {
      console.error('Failed to fetch fee data:', error);
      toast.error('Failed to load fee information');
    } finally {
      setLoading(false);
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
    fetchFeeData();
    fetchCurrency();
  }, [fetchFeeData, fetchCurrency]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              My Fee Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {feeData?.student_name} | {feeData?.admission_no}
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Statement
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Total Fees</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">
                    {formatCurrency(feeData?.summary?.total_fees || 0)}
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
                    {formatCurrency(feeData?.summary?.total_paid || 0)}
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
                    {formatCurrency(feeData?.summary?.total_pending || 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Overdue</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">
                    {formatCurrency(feeData?.summary?.total_overdue || 0)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Fee Breakdown */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Calendar className="h-5 w-5" />
              Monthly Fee Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feeData?.invoices && feeData.invoices.length > 0 ? (
              <div className="space-y-3">
                {feeData.invoices.map((invoice, index) => {
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const monthName = monthNames[invoice.billing_month - 1];
                  const isExpanded = expandedMonth === index;
                  
                  return (
                    <div 
                      key={invoice.id || index}
                      className="border rounded-lg dark:border-gray-700 overflow-hidden"
                    >
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        onClick={() => setExpandedMonth(isExpanded ? null : index)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {monthName}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {monthName} {invoice.billing_year}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Due: {new Date(invoice.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(invoice.total_amount)}
                            </p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {getStatusIcon(invoice.status)}
                              {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Fee Breakdown</h4>
                            {invoice.fee_items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{item.fee_type}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(item.amount)}
                                </span>
                              </div>
                            ))}
                            <div className="border-t dark:border-gray-700 pt-2 mt-2">
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">Total</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {formatCurrency(invoice.total_amount)}
                                </span>
                              </div>
                              <div className="flex justify-between text-green-600 dark:text-green-400">
                                <span>Paid</span>
                                <span>{formatCurrency(invoice.paid_amount || 0)}</span>
                              </div>
                              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                                <span>Pending</span>
                                <span>{formatCurrency(invoice.pending_amount || 0)}</span>
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
                <p>No fee invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Receipt className="h-5 w-5" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feeData?.payments && feeData.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Receipt No</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Fee Type</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Mode</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeData.payments.map((payment, index) => (
                      <tr key={payment.id || index} className="border-b dark:border-gray-700 last:border-0">
                        <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-sm font-mono text-blue-600 dark:text-blue-400">
                          {payment.receipt_no}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">
                          {payment.fee_type}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {payment.payment_mode}
                        </td>
                        <td className="py-3 px-2 text-sm font-medium text-green-600 dark:text-green-400 text-right">
                          +{formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No payments recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Progress */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <TrendingUp className="h-5 w-5" />
              Payment Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {((feeData?.summary?.total_paid || 0) / (feeData?.summary?.total_fees || 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, ((feeData?.summary?.total_paid || 0) / (feeData?.summary?.total_fees || 1) * 100))}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Paid: {formatCurrency(feeData?.summary?.total_paid || 0)}</span>
                <span>Total: {formatCurrency(feeData?.summary?.total_fees || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentFeeDashboard;
