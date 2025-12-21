import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { studentsAPI, classesAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ADMIN_ROLES = ['super_admin', 'admin', 'principal'];
const VIEW_ROLES = ['super_admin', 'admin', 'principal', 'teacher'];

const StudentCard = ({ student, canEdit, canView, onEdit, onDelete, onView }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['#00b894', '#0984e3', '#6c5ce7', '#e17055', '#fdcb6e', '#74b9ff'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <TouchableOpacity 
      style={styles.studentCard} 
      activeOpacity={0.7}
      onPress={() => canView && onView(student)}
    >
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(student.name || student.full_name) }]}>
        <Text style={styles.avatarText}>{getInitials(student.name || student.full_name)}</Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name || student.full_name || 'Unknown'}</Text>
        <Text style={styles.studentDetails}>
          {student.class_name || student.class_standard || 'N/A'} {student.section_name ? `- ${student.section_name}` : ''}
        </Text>
        <Text style={styles.studentId}>ID: {student.admission_no || student.admission_number || student._id?.slice(-8) || 'N/A'}</Text>
      </View>
      {canEdit ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.viewBtn} onPress={() => onView(student)}>
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(student)}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(student)}>
            <Text style={styles.deleteBtnText}>Del</Text>
          </TouchableOpacity>
        </View>
      ) : canView ? (
        <TouchableOpacity style={styles.viewOnlyBtn} onPress={() => onView(student)}>
          <Text style={styles.viewOnlyBtnText}>View</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Active</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const StudentDetailModal = ({ visible, student, onClose, onViewResults, canEdit, onEdit }) => {
  if (!student) return null;

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Student Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>X</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <InfoRow label="Full Name" value={student.name || student.full_name} />
              <InfoRow label="Admission No" value={student.admission_no || student.admission_number} />
              <InfoRow label="Roll No" value={student.roll_no} />
              <InfoRow label="Date of Birth" value={student.date_of_birth} />
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Phone" value={student.phone} />
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Academic Information</Text>
              <InfoRow label="Class" value={student.class_name || student.class_standard} />
              <InfoRow label="Section" value={student.section_name} />
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Guardian Information</Text>
              <InfoRow label="Father's Name" value={student.father_name} />
              <InfoRow label="Mother's Name" value={student.mother_name} />
              <InfoRow label="Guardian Name" value={student.guardian_name} />
              <InfoRow label="Guardian Phone" value={student.guardian_phone} />
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Address</Text>
              <Text style={styles.addressText}>{student.address || 'Not provided'}</Text>
            </View>

            <View style={styles.detailActions}>
              <TouchableOpacity 
                style={styles.viewResultsBtn} 
                onPress={() => onViewResults(student)}
              >
                <Text style={styles.viewResultsBtnText}>View Results</Text>
              </TouchableOpacity>
              {canEdit && (
                <TouchableOpacity 
                  style={styles.editStudentBtn} 
                  onPress={() => {
                    onClose();
                    onEdit(student);
                  }}
                >
                  <Text style={styles.editStudentBtnText}>Edit Student</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const StudentFormModal = ({ visible, student, classes, sections, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    admission_no: '',
    roll_no: '',
    class_id: '',
    section_id: '',
    date_of_birth: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    father_name: '',
    mother_name: '',
    guardian_name: '',
    guardian_phone: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || student.full_name || '',
        admission_no: student.admission_no || student.admission_number || '',
        roll_no: student.roll_no || '',
        class_id: student.class_id || '',
        section_id: student.section_id || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || 'Male',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        father_name: student.father_name || '',
        mother_name: student.mother_name || '',
        guardian_name: student.guardian_name || '',
        guardian_phone: student.guardian_phone || '',
      });
    } else {
      setFormData({
        name: '',
        admission_no: '',
        roll_no: '',
        class_id: classes[0]?._id || '',
        section_id: sections[0]?._id || '',
        date_of_birth: '',
        gender: 'Male',
        email: '',
        phone: '',
        address: '',
        father_name: '',
        mother_name: '',
        guardian_name: '',
        guardian_phone: '',
      });
    }
  }, [student, visible, classes, sections]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Student name is required');
      return;
    }
    if (!formData.admission_no.trim()) {
      Alert.alert('Error', 'Admission number is required');
      return;
    }
    if (!formData.roll_no.trim()) {
      Alert.alert('Error', 'Roll number is required');
      return;
    }
    if (!formData.father_name.trim()) {
      Alert.alert('Error', "Father's name is required");
      return;
    }
    if (!formData.mother_name.trim()) {
      Alert.alert('Error', "Mother's name is required");
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Address is required');
      return;
    }
    if (!formData.guardian_name.trim()) {
      Alert.alert('Error', 'Guardian name is required');
      return;
    }
    if (!formData.guardian_phone.trim()) {
      Alert.alert('Error', 'Guardian phone is required');
      return;
    }
    if (!formData.date_of_birth.trim()) {
      Alert.alert('Error', 'Date of birth is required (YYYY-MM-DD)');
      return;
    }
    onSave(formData);
  };

  const genders = ['Male', 'Female', 'Other'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{student ? 'Edit Student' : 'Add Student'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>X</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(v) => setFormData({...formData, name: v})}
              placeholder="Enter full name"
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Admission Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.admission_no}
              onChangeText={(v) => setFormData({...formData, admission_no: v})}
              placeholder="Enter admission number"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>Roll Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.roll_no}
              onChangeText={(v) => setFormData({...formData, roll_no: v})}
              placeholder="Enter roll number"
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Date of Birth * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={formData.date_of_birth}
              onChangeText={(v) => setFormData({...formData, date_of_birth: v})}
              placeholder="e.g. 2010-05-15"
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Gender *</Text>
            <View style={styles.genderSelector}>
              {genders.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderOption, formData.gender === g && styles.genderOptionActive]}
                  onPress={() => setFormData({...formData, gender: g})}
                >
                  <Text style={[styles.genderOptionText, formData.gender === g && styles.genderOptionTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Class</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {classes.map((c) => (
                  <TouchableOpacity
                    key={c._id}
                    style={[styles.pickerOption, formData.class_id === c._id && styles.pickerOptionActive]}
                    onPress={() => setFormData({...formData, class_id: c._id})}
                  >
                    <Text style={[styles.pickerOptionText, formData.class_id === c._id && styles.pickerOptionTextActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.inputLabel}>Section</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sections.map((s) => (
                  <TouchableOpacity
                    key={s._id}
                    style={[styles.pickerOption, formData.section_id === s._id && styles.pickerOptionActive]}
                    onPress={() => setFormData({...formData, section_id: s._id})}
                  >
                    <Text style={[styles.pickerOptionText, formData.section_id === s._id && styles.pickerOptionTextActive]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <Text style={styles.inputLabel}>Phone *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(v) => setFormData({...formData, phone: v})}
              placeholder="Enter phone number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(v) => setFormData({...formData, email: v})}
              placeholder="Enter email"
              placeholderTextColor="#666"
              keyboardType="email-address"
            />
            
            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={formData.address}
              onChangeText={(v) => setFormData({...formData, address: v})}
              placeholder="Enter address"
              placeholderTextColor="#666"
              multiline
            />
            
            <Text style={styles.inputLabel}>Father's Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.father_name}
              onChangeText={(v) => setFormData({...formData, father_name: v})}
              placeholder="Enter father's name"
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Mother's Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.mother_name}
              onChangeText={(v) => setFormData({...formData, mother_name: v})}
              placeholder="Enter mother's name"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>Guardian Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.guardian_name}
              onChangeText={(v) => setFormData({...formData, guardian_name: v})}
              placeholder="Enter guardian name"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>Guardian Phone *</Text>
            <TextInput
              style={styles.input}
              value={formData.guardian_phone}
              onChangeText={(v) => setFormData({...formData, guardian_phone: v})}
              placeholder="Enter guardian phone"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>{student ? 'Update Student' : 'Add Student'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const StudentListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [saving, setSaving] = useState(false);

  const canEdit = ADMIN_ROLES.includes(user?.role?.toLowerCase());
  const canView = VIEW_ROLES.includes(user?.role?.toLowerCase());

  const fetchStudents = useCallback(async () => {
    try {
      const response = await studentsAPI.getStudents();
      const data = response.data?.students || response.data || [];
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await classesAPI.getClasses();
      const classData = response.data?.classes || response.data || [];
      setClasses(classData);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, []);

  const fetchSections = useCallback(async () => {
    try {
      const response = await classesAPI.getSections();
      const sectionData = response.data?.sections || response.data || [];
      setSections(sectionData);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchSections();
  }, [fetchStudents, fetchClasses, fetchSections]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(s => 
        (s.name || s.full_name || '').toLowerCase().includes(query) ||
        (s.admission_no || s.admission_number || '').toLowerCase().includes(query) ||
        (s.class_name || '').toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  }, [fetchStudents]);

  const handleAdd = () => {
    setSelectedStudent(null);
    setModalVisible(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const handleView = (student) => {
    setViewingStudent(student);
    setDetailModalVisible(true);
  };

  const handleViewResults = (student) => {
    setDetailModalVisible(false);
    navigation.navigate('Results', { studentId: student._id, studentName: student.name || student.full_name });
  };

  const handleDelete = (student) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${student.name || student.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await studentsAPI.deleteStudent(student._id);
              Alert.alert('Success', 'Student deleted successfully');
              fetchStudents();
            } catch (error) {
              if (error.response?.status === 403) {
                Alert.alert('Permission Denied', 'You do not have permission to delete students');
              } else {
                Alert.alert('Error', error.response?.data?.detail || 'Failed to delete student');
              }
            }
          },
        },
      ]
    );
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (selectedStudent) {
        await studentsAPI.updateStudent(selectedStudent._id, formData);
        Alert.alert('Success', 'Student updated successfully');
      } else {
        await studentsAPI.createStudent(formData);
        Alert.alert('Success', 'Student added successfully');
      }
      setModalVisible(false);
      fetchStudents();
    } catch (error) {
      if (error.response?.status === 403) {
        Alert.alert('Permission Denied', 'You do not have permission to perform this action');
      } else if (error.response?.status === 422) {
        const detail = error.response?.data?.detail;
        let message = 'Validation error. Please check all required fields.';
        if (Array.isArray(detail)) {
          message = detail.map(e => e.msg || e.message).join(', ');
        } else if (typeof detail === 'string') {
          message = detail;
        }
        Alert.alert('Validation Error', message);
      } else {
        Alert.alert('Error', error.response?.data?.detail || 'Failed to save student');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Students</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredStudents.length}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or class..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00b894" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : filteredStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No students found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Students will appear here'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredStudents}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={({ item }) => (
              <StudentCard 
                student={item} 
                canEdit={canEdit}
                canView={canView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00b894" />
            }
          />
        )}

        {canEdit && (
          <TouchableOpacity style={styles.fab} onPress={handleAdd}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )}

        <StudentFormModal
          visible={modalVisible}
          student={selectedStudent}
          classes={classes}
          sections={sections}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          loading={saving}
        />

        <StudentDetailModal
          visible={detailModalVisible}
          student={viewingStudent}
          onClose={() => setDetailModalVisible(false)}
          onViewResults={handleViewResults}
          canEdit={canEdit}
          onEdit={handleEdit}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  countBadge: {
    backgroundColor: '#00b894',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 50,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  clearIcon: {
    color: '#888',
    fontSize: 18,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  studentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  studentDetails: {
    color: '#00b894',
    fontSize: 13,
    marginTop: 2,
  },
  studentId: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 6,
  },
  editBtn: {
    backgroundColor: 'rgba(52, 152, 219, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: {
    color: '#3498db',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: 'rgba(231, 76, 60, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteBtnText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    color: '#888',
    fontSize: 24,
    padding: 4,
  },
  formScroll: {
    maxHeight: 450,
  },
  inputLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  genderOption: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: '#00b894',
  },
  genderOptionText: {
    color: '#888',
    fontSize: 14,
  },
  genderOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  pickerContainer: {
    marginTop: 4,
  },
  pickerOption: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  pickerOptionActive: {
    backgroundColor: '#00b894',
  },
  pickerOptionText: {
    color: '#888',
    fontSize: 14,
  },
  pickerOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#00b894',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewBtn: {
    backgroundColor: 'rgba(46, 204, 113, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewBtnText: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '600',
  },
  viewOnlyBtn: {
    backgroundColor: 'rgba(46, 204, 113, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  viewOnlyBtnText: {
    color: '#2ecc71',
    fontSize: 13,
    fontWeight: '600',
  },
  detailModalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  detailSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    color: '#00b894',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  addressText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  detailActions: {
    marginTop: 10,
    gap: 12,
  },
  viewResultsBtn: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewResultsBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editStudentBtn: {
    backgroundColor: 'rgba(52, 152, 219, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editStudentBtnText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StudentListScreen;
