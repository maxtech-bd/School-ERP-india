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
import { staffAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ADMIN_ROLES = ['super_admin', 'admin', 'principal'];

const StaffCard = ({ staff, canEdit, onEdit, onDelete }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['#9b59b6', '#3498db', '#e74c3c', '#f39c12', '#1abc9c', '#34495e'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getRoleColor = (role) => {
    const colors = {
      teacher: '#3498db',
      admin: '#9b59b6',
      super_admin: '#e74c3c',
      principal: '#f39c12',
    };
    return colors[role?.toLowerCase()] || '#1abc9c';
  };

  return (
    <TouchableOpacity 
      style={styles.staffCard} 
      activeOpacity={0.7}
      onPress={() => canEdit && onEdit(staff)}
    >
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(staff.name || staff.full_name) }]}>
        <Text style={styles.avatarText}>{getInitials(staff.name || staff.full_name)}</Text>
      </View>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{staff.name || staff.full_name || 'Unknown'}</Text>
        <Text style={styles.staffDesignation}>{staff.designation || staff.role || 'Staff'}</Text>
        {staff.department && (
          <Text style={styles.staffDept}>📁 {staff.department}</Text>
        )}
      </View>
      {canEdit ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(staff)}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(staff)}>
            <Text style={styles.deleteBtnText}>Del</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(staff.role) + '30' }]}>
          <Text style={[styles.roleText, { color: getRoleColor(staff.role) }]}>
            {(staff.role || 'Staff').replace(/_/g, ' ')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const StaffFormModal = ({ visible, staff, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    employee_id: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    role: 'teacher',
    qualification: '',
    date_of_joining: '',
    experience_years: '0',
    salary: '0',
    address: '',
    gender: 'Male',
    employment_type: 'Full-time',
  });

  const roles = ['teacher', 'staff', 'accountant', 'librarian', 'counselor'];
  const genders = ['Male', 'Female', 'Other'];
  const employmentTypes = ['Full-time', 'Part-time', 'Contract'];

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || staff.full_name || '',
        employee_id: staff.employee_id || '',
        designation: staff.designation || '',
        department: staff.department || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || 'teacher',
        qualification: staff.qualification || '',
        date_of_joining: staff.date_of_joining || '',
        experience_years: String(staff.experience_years || 0),
        salary: String(staff.salary || 0),
        address: staff.address || '',
        gender: staff.gender || 'Male',
        employment_type: staff.employment_type || 'Full-time',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        name: '',
        employee_id: '',
        designation: '',
        department: '',
        email: '',
        phone: '',
        role: 'teacher',
        qualification: '',
        date_of_joining: today,
        experience_years: '0',
        salary: '0',
        address: '',
        gender: 'Male',
        employment_type: 'Full-time',
      });
    }
  }, [staff, visible]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Staff name is required');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    if (!formData.designation.trim()) {
      Alert.alert('Error', 'Designation is required');
      return;
    }
    if (!formData.department.trim()) {
      Alert.alert('Error', 'Department is required');
      return;
    }
    if (!formData.date_of_joining.trim()) {
      Alert.alert('Error', 'Date of joining is required (YYYY-MM-DD)');
      return;
    }
    
    const dataToSave = {
      ...formData,
      experience_years: parseInt(formData.experience_years) || 0,
      salary: parseFloat(formData.salary) || 0,
    };
    onSave(dataToSave);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{staff ? 'Edit Staff' : 'Add Staff'}</Text>
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
            
            <Text style={styles.inputLabel}>Employee ID</Text>
            <TextInput
              style={styles.input}
              value={formData.employee_id}
              onChangeText={(v) => setFormData({...formData, employee_id: v})}
              placeholder="Auto-generated if empty"
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Designation *</Text>
            <TextInput
              style={styles.input}
              value={formData.designation}
              onChangeText={(v) => setFormData({...formData, designation: v})}
              placeholder="e.g. Senior Teacher"
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Department *</Text>
            <TextInput
              style={styles.input}
              value={formData.department}
              onChangeText={(v) => setFormData({...formData, department: v})}
              placeholder="e.g. Mathematics"
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleSelector}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleOption, formData.role === r && styles.roleOptionActive]}
                  onPress={() => setFormData({...formData, role: r})}
                >
                  <Text style={[styles.roleOptionText, formData.role === r && styles.roleOptionTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Gender</Text>
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
            
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(v) => setFormData({...formData, email: v})}
              placeholder="Enter email"
              placeholderTextColor="#666"
              keyboardType="email-address"
            />
            
            <Text style={styles.inputLabel}>Phone *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(v) => setFormData({...formData, phone: v})}
              placeholder="Enter phone number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Date of Joining * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={formData.date_of_joining}
              onChangeText={(v) => setFormData({...formData, date_of_joining: v})}
              placeholder="e.g. 2024-01-15"
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Qualification</Text>
            <TextInput
              style={styles.input}
              value={formData.qualification}
              onChangeText={(v) => setFormData({...formData, qualification: v})}
              placeholder="e.g. M.Sc, B.Ed"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>Experience (Years)</Text>
            <TextInput
              style={styles.input}
              value={formData.experience_years}
              onChangeText={(v) => setFormData({...formData, experience_years: v})}
              placeholder="e.g. 5"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Salary</Text>
            <TextInput
              style={styles.input}
              value={formData.salary}
              onChangeText={(v) => setFormData({...formData, salary: v})}
              placeholder="e.g. 50000"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Employment Type</Text>
            <View style={styles.roleSelector}>
              {employmentTypes.map((et) => (
                <TouchableOpacity
                  key={et}
                  style={[styles.roleOption, formData.employment_type === et && styles.roleOptionActive]}
                  onPress={() => setFormData({...formData, employment_type: et})}
                >
                  <Text style={[styles.roleOptionText, formData.employment_type === et && styles.roleOptionTextActive]}>
                    {et}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={formData.address}
              onChangeText={(v) => setFormData({...formData, address: v})}
              placeholder="Enter address"
              placeholderTextColor="#666"
              multiline
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
              <Text style={styles.saveBtnText}>{staff ? 'Update Staff' : 'Add Staff'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const StaffListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [saving, setSaving] = useState(false);

  const canEdit = ADMIN_ROLES.includes(user?.role?.toLowerCase());

  const fetchStaff = useCallback(async () => {
    try {
      const response = await staffAPI.getStaff();
      const data = response.data?.staff || response.data || [];
      setStaff(data);
      setFilteredStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
      setFilteredStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStaff(staff);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = staff.filter(s => 
        (s.name || s.full_name || '').toLowerCase().includes(query) ||
        (s.designation || '').toLowerCase().includes(query) ||
        (s.department || '').toLowerCase().includes(query)
      );
      setFilteredStaff(filtered);
    }
  }, [searchQuery, staff]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStaff();
    setRefreshing(false);
  }, [fetchStaff]);

  const handleAdd = () => {
    setSelectedStaff(null);
    setModalVisible(true);
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setModalVisible(true);
  };

  const handleDelete = (staffMember) => {
    Alert.alert(
      'Delete Staff',
      `Are you sure you want to delete ${staffMember.name || staffMember.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await staffAPI.deleteStaff(staffMember._id);
              Alert.alert('Success', 'Staff member deleted successfully');
              fetchStaff();
            } catch (error) {
              if (error.response?.status === 403) {
                Alert.alert('Permission Denied', 'You do not have permission to delete staff members');
              } else {
                Alert.alert('Error', error.response?.data?.detail || 'Failed to delete staff');
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
      if (selectedStaff) {
        await staffAPI.updateStaff(selectedStaff._id, formData);
        Alert.alert('Success', 'Staff updated successfully');
      } else {
        await staffAPI.createStaff(formData);
        Alert.alert('Success', 'Staff added successfully');
      }
      setModalVisible(false);
      fetchStaff();
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
        Alert.alert('Error', error.response?.data?.detail || 'Failed to save staff');
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
          <Text style={styles.headerTitle}>Staff</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredStaff.length}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or designation..."
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
            <ActivityIndicator size="large" color="#9b59b6" />
            <Text style={styles.loadingText}>Loading staff...</Text>
          </View>
        ) : filteredStaff.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👨‍🏫</Text>
            <Text style={styles.emptyText}>No staff found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Staff members will appear here'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredStaff}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={({ item }) => (
              <StaffCard 
                staff={item} 
                canEdit={canEdit}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9b59b6" />
            }
          />
        )}

        {canEdit && (
          <TouchableOpacity style={styles.fab} onPress={handleAdd}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )}

        <StaffFormModal
          visible={modalVisible}
          staff={selectedStaff}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          loading={saving}
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
    backgroundColor: '#9b59b6',
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
  staffCard: {
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
  staffInfo: {
    flex: 1,
    marginLeft: 14,
  },
  staffName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  staffDesignation: {
    color: '#9b59b6',
    fontSize: 13,
    marginTop: 2,
  },
  staffDept: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
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
    backgroundColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#9b59b6',
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
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleOption: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  roleOptionActive: {
    backgroundColor: '#9b59b6',
  },
  roleOptionText: {
    color: '#888',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  roleOptionTextActive: {
    color: '#fff',
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
    backgroundColor: '#9b59b6',
  },
  genderOptionText: {
    color: '#888',
    fontSize: 14,
  },
  genderOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#9b59b6',
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
});

export default StaffListScreen;
