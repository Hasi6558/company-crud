'use client';
import React, { useState, useEffect } from 'react';
import { Button, Card, Descriptions, Divider } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import SharedLayout from '@/components/SharedLayout';
import EditUserModal from '@/components/EditUserModal';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import api from '@/app/lib/axios';
4;
import { PERMISSION_LABELS } from '@/constants/permissions';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { usePermission } from '@/components/UsePermissions';
import EditProfileModal from '@/components/EditProfileModal';

const ProfilesPage: React.FC = () => {
  const { user } = useAuth();
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles');
      setAllRoles(response.data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const handleEditProfile = () => {
    if (user) {
      setIsEditModalOpen(true);
    }
  };
  const { can } = usePermission();

  const handleProfileUpdate = async (values: { fullname: string; email: string }) => {
    try {
      if (!user) return;

      const updateData = {
        fullName: values.fullname,
        email: values.email,
      };

      await api.patch(`/users/update/${user.id}`, updateData);
      setIsEditModalOpen(false);

      // You might want to refresh the user context here
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  const getPermissionLabel = (permission: string) => {
    return PERMISSION_LABELS[permission] || permission;
  };

  //password change
  const handlePasswordChange = () => {
    setIsPasswordChangeModalOpen(true);
  };

  const changePassword = async (value: string) => {
    if (!user) return;
    try {
      await api.patch(`users/${user.id}/password`, { newPassword: value });
      console.log('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsPasswordChangeModalOpen(false);
    }
  };

  return (
    <SharedLayout>
      <div>
        <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
        <Card
          title={
            <div className="flex items-center gap-2 space-x-2">
              <UserOutlined />
              profile Information
            </div>
          }
          extra={
            <Button
              type="primary"
              className="px-8"
              onClick={handleEditProfile}
              disabled={!can(['update:users', 'read:roles'])}
            >
              Edit Profile
            </Button>
          }
        >
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Full Name">{user?.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
            <Descriptions.Item label="Role">{user?.role?.name}</Descriptions.Item>
            <Descriptions.Item label="Permissions">
              <ul>
                {user?.role?.permissions?.map((permission, index) => (
                  <li key={index}>{getPermissionLabel(permission)}</li>
                ))}
              </ul>
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="Security Settings">
          <Button type="default" onClick={handlePasswordChange}>
            Change Password
          </Button>
        </Card>
        <ChangePasswordModal
          open={isPasswordChangeModalOpen}
          onCancel={() => setIsPasswordChangeModalOpen(false)}
          changePassword={changePassword}
        />
        <EditProfileModal
          open={isEditModalOpen}
          user={user}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleProfileUpdate}
        />
      </div>
    </SharedLayout>
  );
};

export default ProfilesPage;
