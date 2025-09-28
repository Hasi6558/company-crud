'use client';
import { Button, Form, Input, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import app from '../lib/axios';
import { useRouter } from 'next/navigation';
import type { AxiosError } from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await app.post('/auth/login', values);

      if (response.status === 201) {
        // Store token in localStorage
        const token = response.data.accessToken;
        if (token) {
          localStorage.setItem('authToken', token);
          await refreshUser();
          router.push('/profiles');
        } else {
          setError('No token received from server');
        }
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError?.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Network Error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card title="Sign in to your account" className="w-full max-w-md shadow-lg">
        {error && <Alert message={error} type="error" showIcon closable className="mb-4" />}
        <Form layout="vertical" onFinish={handleSubmit} initialValues={{ email: '', password: '' }}>
          <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" loading={isLoading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
