'use client';
import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import SharedLayout from '@/components/SharedLayout';
import EditUserModal from '@/components/EditUserModal';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import api from '@/app/lib/axios';

const ProfilesPage: React.FC = () => {
  const { user } = useAuth();
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleProfileUpdate = async (values: { fullname: string; email: string; role: string }) => {
    try {
      if (!user) return;

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

      await api.patch(`/users/update/${user.id}`, updateData);
      setIsEditModalOpen(false);

      // You might want to refresh the user context here
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <SharedLayout>
      <div>
        <h2 className="text-lg font-semibold mb-4">User Profile</h2>

        <div className="flex justify-center">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg" style={{ minHeight: 400 }}>
            <div className="flex flex-col items-center space-y-8">
              <div className="flex flex-col items-center">
                <div>
                  <UserOutlined style={{ fontSize: 100 }} />
                </div>
                <div className="mt-4 text-center">
                  <div className="flex justify-center mb-2">
                    <span className="pr-2 font-semibold text-md">Full Name:</span>
                    <span className="font-semibold text-md">{user?.fullName}</span>
                  </div>
                  <div className="flex justify-center mb-2">
                    <span className="pr-2 font-semibold text-md">Email:</span>
                    <span className="font-semibold text-md">{user?.email}</span>
                  </div>
                  <div className="flex justify-center">
                    <span className="pr-2 font-semibold text-md">Role:</span>
                    <span className="font-semibold text-md">{user?.role?.name}</span>
                  </div>
                </div>
              </div>
              <div>
                <Button type="primary" className="px-8" onClick={handleEditProfile}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditUserModal
          open={isEditModalOpen}
          user={user}
          roles={allRoles}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleProfileUpdate}
        />
      </div>
    </SharedLayout>
  );
};

export default ProfilesPage;
