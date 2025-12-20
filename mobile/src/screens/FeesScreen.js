import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { feesAPI } from '../services/api';

const FeeCard = ({ fee, formatAmount }) => {
  const getStatusColor = (status) => {
    const colors = {
      paid: '#00b894',
      pending: '#fdcb6e',
      overdue: '#d63031',
      partial: '#0984e3',
    };
    return colors[status?.toLowerCase()] || '#636e72';
  };

  return (
    <View style={styles.feeCard}>
      <View style={styles.feeHeader}>
        <View>
          <Text style={styles.feeType}>{fee.fee_type || fee.type || 'Fee'}</Text>
          <Text style={styles.feePeriod}>{fee.period || fee.month || ''}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fee.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(fee.status) }]}>
            {fee.status || 'Pending'}
          </Text>
        </View>
      </View>
      <View style={styles.feeDetails}>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Total Amount</Text>
          <Text style={styles.feeAmount}>{formatAmount(fee.total_amount || fee.amount || 0)}</Text>
        </View>
        {fee.paid_amount > 0 && (
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Paid</Text>
            <Text style={[styles.feeAmount, { color: '#00b894' }]}>{formatAmount(fee.paid_amount)}</Text>
          </View>
        )}
        {(fee.due_amount || fee.balance) > 0 && (
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Due</Text>
            <Text style={[styles.feeAmount, { color: '#d63031' }]}>
              {formatAmount(fee.due_amount || fee.balance)}
            </Text>
          </View>
        )}
      </View>
      {fee.due_date && (
        <Text style={styles.dueDate}>Due: {new Date(fee.due_date).toLocaleDateString()}</Text>
      )}
    </View>
  );
};

const PaymentHistoryCard = ({ payment, formatAmount }) => (
  <View style={styles.paymentCard}>
    <View style={styles.paymentIcon}>
      <Text style={styles.paymentIconText}>💳</Text>
    </View>
    <View style={styles.paymentInfo}>
      <Text style={styles.paymentType}>{payment.fee_type || payment.description || 'Payment'}</Text>
      <Text style={styles.paymentDate}>
        {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
      </Text>
    </View>
    <Text style={styles.paymentAmount}>{formatAmount(payment.amount)}</Text>
  </View>
);

const FeesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currency, setCurrency] = useState('INR');

  const formatAmount = (amount) => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    return `${symbols[currency] || '₹'}${parseFloat(amount || 0).toLocaleString()}`;
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const [summaryRes, historyRes] = await Promise.all([
        feesAPI.getFeesSummary().catch(() => ({ data: null })),
        feesAPI.getFeeHistory({}).catch(() => ({ data: [] })),
      ]);

      if (summaryRes.data) {
        setSummary(summaryRes.data);
        if (summaryRes.data.currency) {
          setCurrency(summaryRes.data.currency);
        }
      }

      const historyData = historyRes.data || [];
      setFees(historyData.filter(item => item.status !== 'paid') || []);
      setPayments(historyData.filter(item => item.status === 'paid') || []);
    } catch (error) {
      console.log('Error fetching fee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeeData();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#00b894', '#00cec9']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fee Management</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b894" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#00b894', '#00cec9']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fee Management</Text>
      </LinearGradient>

      {summary && (
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.summaryGradient}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatAmount(summary.total_fees || 0)}</Text>
                  <Text style={styles.summaryLabel}>Total Fees</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatAmount(summary.paid || 0)}</Text>
                  <Text style={styles.summaryLabel}>Paid</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: '#ffeaa7' }]}>
                    {formatAmount(summary.pending || 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Pending</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: '#ff7675' }]}>
                    {formatAmount(summary.overdue || 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Overdue</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
          onPress={() => setActiveTab('summary')}
        >
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
            Due Fees
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Payment History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'summary' ? (
          fees.length > 0 ? (
            fees.map((fee, index) => (
              <FeeCard key={index} fee={fee} formatAmount={formatAmount} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>No pending fees</Text>
              <Text style={styles.emptySubtext}>All fees are paid up to date</Text>
            </View>
          )
        ) : payments.length > 0 ? (
          payments.map((payment, index) => (
            <PaymentHistoryCard key={index} payment={payment} formatAmount={formatAmount} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No payment history</Text>
            <Text style={styles.emptySubtext}>Your payment records will appear here</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  summarySection: {
    padding: 16,
    paddingBottom: 0,
  },
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryGradient: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00b894',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#00b894',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  feeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feeType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  feePeriod: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feeDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dueDate: {
    fontSize: 12,
    color: '#e17055',
    marginTop: 8,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00b89420',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIconText: {
    fontSize: 20,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00b894',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 30,
  },
});

export default FeesScreen;
