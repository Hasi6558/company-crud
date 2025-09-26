'use client';
import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import SharedLayout from '@/components/SharedLayout';
import UserForm from '@/components/UserForm';
import { Role } from '@/types';
import api from '@/app/lib/axios';

const AddUsersPage: React.FC = () => {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [form] = Form.useForm();

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

  const handleAddUser = async (values: {
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

      const userResponse = await api.post('/users', userData);
      await api.post(`/users/${userResponse.data.id}/password`, {
        password: values.password,
      });

      console.log('User added successfully');
      form.resetFields();
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  return (
    <SharedLayout>
      <div>
        <h2 className="text-lg font-semibold mb-4">Add New User</h2>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <UserForm form={form} roles={allRoles} onFinish={handleAddUser} submitText="Add" />
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default AddUsersPage;
