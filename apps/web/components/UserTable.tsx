'use client';
import React from 'react';
import { Table, Tag, Button, Input } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
// Update the import path below to the correct relative path where your User type is defined.
// For example, if User is defined in 'types/index.ts' at the project root, use:
import { User } from '../../web/types/index';
// Or adjust the path as needed to match your project structure.

interface UserTableProps {
  users: User[];
  filteredUsers: User[];
  onSearch: (value: string) => void;
  onRowClick: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  filteredUsers,
  onSearch,
  onRowClick,
  onEditUser,
  onDeleteUser,
}) => {
  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      key: 'role',
      render: (_: unknown, record: User) => {
        const roleName = record.role?.name;
        if (!roleName) return null;
        let color = roleName.length > 5 ? 'geekblue' : 'green';
        if (roleName === 'admin') color = 'volcano';
        return (
          <Tag color={color} key={roleName}>
            {roleName.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: User) => (
        <div>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              onEditUser(record);
            }}
          >
            <EditOutlined />
          </Button>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteUser(record);
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={filteredUsers.length > 0 ? filteredUsers : users}
        columns={columns}
        onRow={(record) => ({
          onClick: () => onRowClick(record),
        })}
        rowKey="id"
      />
    </>
  );
};

export default UserTable;
