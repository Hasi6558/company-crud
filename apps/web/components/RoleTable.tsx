'use client';
import React from 'react';
import { Table, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Role } from '@/types';
import { PERMISSION_LABELS } from '../constants/permissions';

interface RoleTableProps {
  roles: Role[];
  onEditPermissions: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
}

const RoleTable: React.FC<RoleTableProps> = ({ roles, onEditPermissions, onDeleteRole }) => {
  const getPermissionLabel = (permissionValue: string) => {
    return PERMISSION_LABELS[permissionValue] || permissionValue;
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Available permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[], record: Role) => (
        <div className="flex items-center space-x-4">
          <div>
            <ul>
              {permissions && permissions.length > 0 ? (
                permissions.map((permission, index) => (
                  <li key={index}>{getPermissionLabel(permission)}</li>
                ))
              ) : (
                <p>No Permissions for this role</p>
              )}
            </ul>
          </div>
          <div>
            <Button type="link" onClick={() => onEditPermissions(record)}>
              <EditOutlined />
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Delete',
      key: 'action',
      render: (_: unknown, record: Role) => (
        <div>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRole(record);
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  return <Table dataSource={roles} columns={columns} rowKey="id" />;
};

export default RoleTable;
