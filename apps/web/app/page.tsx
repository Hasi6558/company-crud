'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SharedLayout from '@/components/SharedLayout';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user) {
      router.push('/users');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SharedLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Company CRUD</h2>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    </SharedLayout>
  );
};

export default HomePage;
