'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input, message, FormInstance } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import SharedLayout from '@/components/SharedLayout';
import UserTable from '@/components/UserTable';
import EditUserModal from '@/components/EditUserModal';
import { User, Role } from '@/types';
import api from '@/app/lib/axios';
import AddUserModal from '@/components/AddUserModal';
import { usePermission } from '@/components/UsePermissions';
import ProtectedRoute from '@/components/ProtectedRoute';

const UsersPage: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserAddModalOpen, SetIsUserAddModalOpen] = useState(false);

  const { can } = usePermission();

  const loadUsers = useCallback(async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data);

      if (!searchTerm.trim()) {
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }, [searchTerm]);

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles');
      setAllRoles(response.data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [loadUsers]);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    setIsSearchLoading(true);

    try {
      if (value.trim()) {
        // Search users using backend API
        const response = await api.get(`/users/search?name=${encodeURIComponent(value.trim())}`);
        setFilteredUsers(response.data);
      } else {
        // If empty search, show all users
        setFilteredUsers(allUsers);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
      // Fallback to showing all users on error
      setFilteredUsers(allUsers);
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  interface EditUserFormValues {
    fullname: string;
    email: string;
    role: string;
  }

  const handleUserUpdate = async (values: EditUserFormValues) => {
    try {
      if (!selectedUserToEdit) return;

      const selectedRole = allRoles.find(
        (role) => role.name.toLowerCase() === values.role.toLowerCase(),
      );

      if (!selectedRole) {
        console.error('Role not found:', values.role);
        return;
      }

      const updateData = {
        fullName: values.fullname,
        email: values.email,
        roleId: selectedRole.id,
      };

      await api.patch(`/users/update/${selectedUserToEdit.id}`, updateData);
      setIsEditModalOpen(false);
      await loadUsers();

      // Reset form on successful update
      if (editUserForm) {
        editUserForm.resetFields();
      }
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'response' in e &&
        typeof (e as { response?: unknown }).response === 'object' &&
        (e as { response?: { status?: number; data?: { message?: string[] } } }).response !== null
      ) {
        const { status, data } = (
          e as { response: { status?: number; data?: { message?: string[] } } }
        ).response;

        if (status === 400 && Array.isArray(data?.message) && editUserForm) {
          // Map validation errors to form fields
          const fieldErrors: { name: string; errors: string[] }[] = [];

          data.message.forEach((msg: string) => {
            console.log('Processing update error:', msg);

            // Map error messages to form fields
            if (msg.includes('email')) {
              fieldErrors.push({ name: 'email', errors: [msg] });
            } else if (msg.includes('fullName') || msg.includes('name')) {
              fieldErrors.push({ name: 'fullname', errors: [msg] });
            } else if (msg.includes('role')) {
              fieldErrors.push({ name: 'role', errors: [msg] });
            }
          });

          console.log('Setting edit form field errors:', fieldErrors);
          editUserForm.setFields(fieldErrors);
        } else if (status === 409 && editUserForm) {
          // Handle email already exists error
          const errorMessage = Array.isArray(data?.message)
            ? data.message[0]
            : data?.message || 'Email is already registered';
          editUserForm.setFields([
            {
              name: 'email',
              errors: [errorMessage],
            },
          ]);
        }
      }
      console.log('Failed to update user:', e);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedUserToDelete) return;

      await api.delete(`/users/${selectedUserToDelete.id}`);
      setIsDeleteModalOpen(false);
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };
  const [userForm, setUserForm] = useState<FormInstance | null>(null);
  const [editUserForm, setEditUserForm] = useState<FormInstance | null>(null);

  const handleUserCreate = async (values: {
    fullname: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const selectedRole = allRoles.find(
        (role) => role.name.toLowerCase() === values.role.toLowerCase(),
      );
      if (!selectedRole) {
        console.error('Role not found:', values.role);
        return;
      }
      const userData = {
        fullName: values.fullname,
        email: values.email,
        roleId: selectedRole.id,
      };
      const response = await api.post('/users', userData);
      console.log('User created successfully:', response.data);
      await api.post(`users/${response.data.id}/password`, { password: values.password });
      console.log('Password set successfully');
      await loadUsers();

      // Only reset form and close modal on successful creation
      if (userForm) {
        userForm.resetFields();
      }
      SetIsUserAddModalOpen(false);
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'response' in e &&
        typeof (e as { response?: unknown }).response === 'object' &&
        (e as { response?: { status?: number; data?: { message?: string[] } } }).response !== null
      ) {
        const { status, data } = (
          e as { response: { status?: number; data?: { message?: string[] } } }
        ).response;
        if (status === 400 && Array.isArray(data?.message) && userForm) {
          // Map validation errors to form fields
          const fieldErrors: { name: string; errors: string[] }[] = [];

          data.message.forEach((msg: string) => {
            console.log('Processing error:', msg);

            // Map error messages to form fields
            if (msg.includes('email')) {
              fieldErrors.push({ name: 'email', errors: [msg] });
            } else if (msg.includes('fullName') || msg.includes('name')) {
              fieldErrors.push({ name: 'fullname', errors: [msg] });
            } else if (msg.includes('role')) {
              fieldErrors.push({ name: 'role', errors: [msg] });
            } else if (msg.includes('password')) {
              fieldErrors.push({ name: 'password', errors: [msg] });
            }
          });

          console.log('Setting form field errors:', fieldErrors);
          userForm.setFields(fieldErrors);
        } else if (status === 409 && userForm) {
          // Handle email already exists error
          const errorMessage = Array.isArray(data?.message)
            ? data.message[0]
            : data?.message || 'Email is already registered';
          userForm.setFields([
            {
              name: 'email',
              errors: [errorMessage],
            },
          ]);
        }
      }
      console.log('Failed to create user:', e);
    }
  };

  return (
    <ProtectedRoute>
      <SharedLayout>
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Users Management</h2>
              <div className="max-w-xs mb-4">
                <Input
                  placeholder="Search users by name..."
                  prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  suffix={isSearchLoading ? <span>Searching...</span> : null}
                />
              </div>
            </div>
            <div>
              <Button
                type="primary"
                onClick={() => SetIsUserAddModalOpen(true)}
                disabled={!can(['create:users', 'read:roles'])}
              >
                + Add User
              </Button>
            </div>
          </div>
          <AddUserModal
            roles={allRoles}
            handleUserCreate={handleUserCreate}
            open={isUserAddModalOpen}
            onCancel={() => SetIsUserAddModalOpen(false)}
            onFormReady={setUserForm}
          />

          <UserTable
            users={allUsers}
            filteredUsers={filteredUsers}
            onSearch={handleSearch}
            onRowClick={handleRowClick}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />

          {/* User Info Modal */}
          <Modal
            open={isModalOpen}
            footer={[
              <Button key="ok" type="primary" onClick={() => setIsModalOpen(false)}>
                OK
              </Button>,
            ]}
            onCancel={() => setIsModalOpen(false)}
          >
            {selectedUser && (
              <div>
                <h1 className="text-lg">User Info</h1>
                <div className="flex space-x-4 items-center mt-4">
                  <div>
                    <UserOutlined style={{ fontSize: 100 }} />
                  </div>
                  <div>
                    <div className="flex">
                      <span className="pr-2">Full Name:</span>
                      <span>{selectedUser.fullName}</span>
                    </div>
                    <div className="flex">
                      <span className="pr-2">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex">
                      <span className="pr-2">Role:</span>
                      <span>{selectedUser.role?.name}</span>
                    </div>
                    <div className="flex">
                      <span className="pr-2">Registered Date:</span>
                      <span>
                        {selectedUser.createdAt
                          ? new Date(selectedUser.createdAt).toLocaleString()
                          : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* Edit User Modal */}
          <EditUserModal
            open={isEditModalOpen}
            user={selectedUserToEdit}
            roles={allRoles}
            onCancel={() => setIsEditModalOpen(false)}
            onSave={handleUserUpdate}
            onFormReady={setEditUserForm}
          />

          {/* Delete Confirmation Modal */}
          <Modal
            title="Confirm Deletion"
            open={isDeleteModalOpen}
            onOk={handleDeleteConfirm}
            onCancel={() => setIsDeleteModalOpen(false)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <p>
              Are you sure you want to delete user <strong>{selectedUserToDelete?.fullName}</strong>
              ?
            </p>
          </Modal>
        </div>
      </SharedLayout>
    </ProtectedRoute>
  );
};

export default UsersPage;
