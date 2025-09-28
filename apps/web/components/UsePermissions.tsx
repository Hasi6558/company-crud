import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

export function usePermission() {
  const { user } = useAuth();

  const can = (permission: string | string[]) => {
    if (!user?.role?.permissions) return false;
    const perms = Array.isArray(permission) ? permission : [permission];
    return perms.every((p) => user.role?.permissions?.includes(p));
  };

  return { can };
}
