'use client';
import { Button, Input } from 'antd';
import React, { useState } from 'react';
import app from '../lib/axios';
import { useRouter } from 'next/navigation';
import { Alert } from 'antd';
import type { AxiosError } from 'axios';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await app.post('/auth/login', { email, password });

      if (response.status === 201) {
        router.push('/dashboard');
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
    <div className="min-h-screen flex items-center justify-center ">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </div>
        <div>{error && <Alert message={error} type="error" showIcon closable />}</div>
        <div>
          <form action="" onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </form>
        </div>
        <div>
          <Button
            type="primary"
            className="w-full"
            htmlType="submit"
            loading={isLoading}
            onClick={handleSubmit}
          >
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
