'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import SharedLayout from '@/components/SharedLayout';
import UserTable from '@/components/UserTable';
import EditUserModal from '@/components/EditUserModal';
import { User, Role } from '@/types';
import api from '@/app/lib/axios';
import AddUserModal from '@/components/AddUserModal';

const UsersPage: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserAddModalOpen, SetIsUserAddModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles');
      setAllRoles(response.data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const handleSearch = (value: string) => {
    const filtered = allUsers.filter((user) =>
      user.fullName.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredUsers(filtered);
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
    } catch (error) {
      console.error('Failed to update user:', error);
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
    } catch (e) {
      console.log('Failed to create user:', e);
    } finally {
      SetIsUserAddModalOpen(false);
    }
  };

  return (
    <SharedLayout>
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Users Management</h2>
            <div className="max-w-xs mb-4">
              <Input
                placeholder="Search users by name..."
                prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Button type="primary" onClick={() => SetIsUserAddModalOpen(true)}>
              + Add User
            </Button>
          </div>
        </div>
        <AddUserModal
          roles={allRoles}
          handleUserCreate={handleUserCreate}
          open={isUserAddModalOpen}
          onCancel={() => SetIsUserAddModalOpen(false)}
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
            Are you sure you want to delete user <strong>{selectedUserToDelete?.fullName}</strong>?
          </p>
        </Modal>
      </div>
    </SharedLayout>
  );
};

export default UsersPage;
