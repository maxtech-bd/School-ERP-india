import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { 
  Users,
  Plus,
  Edit,
  UserX,
  UserCheck,
  Key,
  AlertTriangle,
  Shield,
  Mail,
  User,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const UserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isStatusConfirmModalOpen, setIsStatusConfirmModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [deleteUserData, setDeleteUserData] = useState(null);
  
  // Form data for create/edit
  const [userFormData, setUserFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    role: 'admin'
  });
  
  const [resetPasswordData, setResetPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  });
  
  const [statusChangeData, setStatusChangeData] = useState({
    user: null,
    action: null // 'suspend' or 'activate'
  });
  
  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  
  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.users) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        toast.error('Only System Admins can access user management');
      } else {
        toast.error('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.logs) {
        setAuditLogs(response.data.logs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    }
  };
  
  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Create new user
  const handleCreateUser = async () => {
    // Validation
    if (!userFormData.email || !userFormData.username || !userFormData.full_name || !userFormData.password) {
      toast.error('All fields are required');
      return;
    }
    
    if (userFormData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/admin/users`, userFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('User created successfully!');
      setIsCreateUserModalOpen(false);
      setUserFormData({
        email: '',
        username: '',
        full_name: '',
        password: '',
        role: 'admin'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const updateData = {
        email: userFormData.email,
        full_name: userFormData.full_name,
        role: userFormData.role
      };
      
      await axios.put(`${API_BASE_URL}/admin/users/${selectedUser.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('User updated successfully!');
      setIsEditUserModalOpen(false);
      setSelectedUser(null);
      setUserFormData({
        email: '',
        username: '',
        full_name: '',
        password: '',
        role: 'admin'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to update user');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Change user status (suspend/activate)
  const handleConfirmStatusChange = async () => {
    if (!statusChangeData.user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const is_active = statusChangeData.action === 'activate';
      
      await axios.patch(
        `${API_BASE_URL}/admin/users/${statusChangeData.user.id}/status`,
        { is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`User ${is_active ? 'activated' : 'suspended'} successfully!`);
      setIsStatusConfirmModalOpen(false);
      setStatusChangeData({ user: null, action: null });
      fetchUsers();
    } catch (error) {
      console.error('Error changing user status:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to change user status');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    
    if (!resetPasswordData.new_password || !resetPasswordData.confirm_password) {
      toast.error('Both password fields are required');
      return;
    }
    
    if (resetPasswordData.new_password !== resetPasswordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (resetPasswordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_BASE_URL}/admin/users/${selectedUser.id}/reset-password`,
        { new_password: resetPasswordData.new_password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('✅ Password reset successfully.');
      setIsResetPasswordModalOpen(false);
      setSelectedUser(null);
      setResetPasswordData({ new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Error resetting password:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Open edit modal
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      password: '' // Don't populate password
    });
    setIsEditUserModalOpen(true);
  };
  
  // Open reset password modal
  const handleOpenResetPassword = (user) => {
    setSelectedUser(user);
    setResetPasswordData({ new_password: '', confirm_password: '' });
    setIsResetPasswordModalOpen(true);
  };
  
  // Open status change confirmation
  const handleOpenStatusChange = (user, action) => {
    setStatusChangeData({ user, action });
    setIsStatusConfirmModalOpen(true);
  };
  
  // Open audit logs
  const handleViewAuditLogs = async () => {
    await fetchAuditLogs();
    setIsAuditLogModalOpen(true);
  };
  
  // Open delete confirmation
  const handleOpenDeleteUser = (user) => {
    setDeleteUserData(user);
    setIsDeleteConfirmModalOpen(true);
  };
  
  // Confirm delete user
  const handleConfirmDeleteUser = async () => {
    if (!deleteUserData) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/admin/users/${deleteUserData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('User deleted successfully!');
      setIsDeleteConfirmModalOpen(false);
      setDeleteUserData(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to delete user');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 dark:text-white">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
            User Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleViewAuditLogs} variant="outline" className="text-sm">
            <span className="sm:hidden">Logs</span>
            <span className="hidden sm:inline">View Audit Logs</span>
          </Button>
          <Button onClick={() => setIsCreateUserModalOpen(true)} className="text-sm">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="sm:hidden">Create</span>
            <span className="hidden sm:inline">Create User</span>
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Name</th>
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">Username</th>
                    <th className="text-left p-3 font-semibold">Role</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{user.full_name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.username}</td>
                      <td className="p-3">
                        <Badge variant={user.role === 'super_admin' ? 'destructive' : 'default'}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {user.is_active ? (
                          <Badge variant="success" className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Suspended</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenResetPassword(user)}
                          >
                            <Key className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                          {user.is_active ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleOpenStatusChange(user, 'suspend')}
                            >
                              <UserX className="h-3 w-3 mr-1" />
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleOpenStatusChange(user, 'activate')}
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Activate
                            </Button>
                          )}
                          {user.role !== 'super_admin' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleOpenDeleteUser(user)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={userFormData.full_name}
                onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label>Username</Label>
              <Input
                value={userFormData.username}
                onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                placeholder="Enter password (min 6 characters)"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={userFormData.full_name}
                onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label>Username</Label>
              <Input
                value={userFormData.username}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for: <strong>{selectedUser?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={resetPasswordData.new_password}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, new_password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={resetPasswordData.confirm_password}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirm_password: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Modal */}
      <Dialog open={isStatusConfirmModalOpen} onOpenChange={setIsStatusConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Action
            </DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to <strong>{statusChangeData.action}</strong> user:{' '}
            <strong>{statusChangeData.user?.full_name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={statusChangeData.action === 'suspend' ? 'destructive' : 'default'}
              onClick={handleConfirmStatusChange}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Yes, ${statusChangeData.action}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Logs Modal */}
      <Dialog open={isAuditLogModalOpen} onOpenChange={setIsAuditLogModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Logs</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No audit logs found</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Admin</th>
                    <th className="text-left p-2">Action</th>
                    <th className="text-left p-2">Target User</th>
                    <th className="text-left p-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-2">{log.admin_name}</td>
                      <td className="p-2">
                        <Badge variant="outline">{log.action.replace('_', ' ')}</Badge>
                      </td>
                      <td className="p-2">{log.target_user_name || 'N/A'}</td>
                      <td className="p-2 text-xs text-gray-500">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog open={isDeleteConfirmModalOpen} onOpenChange={setIsDeleteConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete User Permanently
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to <strong className="text-red-600">permanently delete</strong> this user?
            </p>
            {deleteUserData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Name:</strong> {deleteUserData.full_name}</p>
                <p><strong>Email:</strong> {deleteUserData.email}</p>
                <p><strong>Username:</strong> {deleteUserData.username}</p>
                <p><strong>Role:</strong> {deleteUserData.role?.replace('_', ' ').toUpperCase()}</p>
              </div>
            )}
            <p className="text-red-500 text-sm mt-4">
              This action cannot be undone. The user will be permanently removed from the system.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteUser}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
