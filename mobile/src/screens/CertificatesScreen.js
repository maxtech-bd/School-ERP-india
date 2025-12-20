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
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { certificatesAPI } from '../services/api';

const CertificateCard = ({ certificate, onDownload }) => {
  const getTypeIcon = (type) => {
    const icons = {
      'Transfer Certificate': '📜',
      'Character Certificate': '🎖️',
      'Bonafide Certificate': '📋',
      'Study Certificate': '📚',
      'Conduct Certificate': '⭐',
      'Migration Certificate': '🎓',
    };
    return icons[type] || '📄';
  };

  const getStatusColor = (status) => {
    const colors = {
      issued: '#00b894',
      pending: '#fdcb6e',
      rejected: '#d63031',
      processing: '#0984e3',
    };
    return colors[status?.toLowerCase()] || '#636e72';
  };

  return (
    <View style={styles.certificateCard}>
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>{getTypeIcon(certificate.type || certificate.certificate_type)}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.certificateType}>
          {certificate.type || certificate.certificate_type || 'Certificate'}
        </Text>
        <Text style={styles.certificateDate}>
          {certificate.issued_date
            ? `Issued: ${new Date(certificate.issued_date).toLocaleDateString()}`
            : certificate.requested_date
            ? `Requested: ${new Date(certificate.requested_date).toLocaleDateString()}`
            : ''}
        </Text>
        {certificate.certificate_no && (
          <Text style={styles.certificateNo}>No: {certificate.certificate_no}</Text>
        )}
      </View>
      <View style={styles.cardActions}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(certificate.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(certificate.status) }]}>
            {certificate.status || 'Issued'}
          </Text>
        </View>
        {(certificate.status === 'issued' || !certificate.status) && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => onDownload(certificate)}
          >
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const CertificatesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certificateTypes, setCertificateTypes] = useState([]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const [certsRes, typesRes] = await Promise.all([
        certificatesAPI.getMyCertificates().catch(() => ({ data: [] })),
        certificatesAPI.getCertificateTypes().catch(() => ({ data: [] })),
      ]);

      setCertificates(certsRes.data || []);
      setCertificateTypes(typesRes.data || []);
    } catch (error) {
      console.log('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCertificates();
    setRefreshing(false);
  }, []);

  const handleDownload = async (certificate) => {
    try {
      Alert.alert(
        'Download Certificate',
        'The certificate will be downloaded to your device.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                const downloadUrl = certificate.download_url || certificate.file_url;
                if (downloadUrl) {
                  await Linking.openURL(downloadUrl);
                } else {
                  Alert.alert('Info', 'Certificate download will be available soon.');
                }
              } catch (err) {
                Alert.alert('Error', 'Failed to download certificate');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download certificate');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#6c5ce7', '#a29bfe']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Certificates</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#6c5ce7', '#a29bfe']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certificates</Text>
        <Text style={styles.headerSubtitle}>View and download your certificates</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {certificateTypes.length > 0 && (
          <View style={styles.typesSection}>
            <Text style={styles.sectionTitle}>Available Certificate Types</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {certificateTypes.map((type, index) => (
                <View key={index} style={styles.typeChip}>
                  <Text style={styles.typeChipText}>{type.name || type}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.certificatesSection}>
          <Text style={styles.sectionTitle}>Your Certificates</Text>
          {certificates.length > 0 ? (
            certificates.map((cert, index) => (
              <CertificateCard
                key={index}
                certificate={cert}
                onDownload={handleDownload}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📜</Text>
              <Text style={styles.emptyText}>No certificates yet</Text>
              <Text style={styles.emptySubtext}>
                Your certificates will appear here once issued
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Need a Certificate?</Text>
          <Text style={styles.infoText}>
            Contact your school administration to request certificates such as Transfer Certificate, 
            Bonafide Certificate, or Character Certificate.
          </Text>
        </View>

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
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
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
  content: {
    flex: 1,
    padding: 16,
  },
  typesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  typeChip: {
    backgroundColor: '#6c5ce720',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  typeChipText: {
    color: '#6c5ce7',
    fontSize: 13,
    fontWeight: '500',
  },
  certificatesSection: {
    marginBottom: 20,
  },
  certificateCard: {
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
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6c5ce720',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  certificateType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  certificateDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  certificateNo: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  downloadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
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
  infoCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#33691e',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 30,
  },
});

export default CertificatesScreen;
