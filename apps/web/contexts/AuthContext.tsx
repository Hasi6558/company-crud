'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '../app/lib/axios';

interface User {
  id: string;
  key?: React.Key;
  fullName: string;
  email: string;
  role?: {
    id?: string;
    name?: string;
    permissions?: string[];
  };
  createdAt?: Date | string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to get user details from backend
  const fetchUserProfile = useCallback(async () => {
    try {
      // First get user ID from JWT token
      const authResponse = await api.get('/auth/me');
      const userId = authResponse.data.user.sub;

      // Then get full user details
      const userResponse = await api.get(`/users/${userId}`);

      setUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      localStorage.removeItem('authToken');
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchUserProfile();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Optional: notify backend about logout (if you want to blacklist tokens)
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove token from localStorage
      localStorage.removeItem('authToken');
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        await fetchUserProfile();
      } catch (error) {
        console.error('Failed to check auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      logout,
      refreshUser,
      isAuthenticated,
    }),
    [user, isLoading, logout, refreshUser, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
