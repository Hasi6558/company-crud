'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme, Table, Tag, Modal, Input, Select, Space } from 'antd';
import { Button } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import api from '../lib/axios';
import { Form } from 'antd';
import Password from 'antd/es/input/Password';

const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;
const items = [
  {
    key: '1',
    icon: <VideoCameraOutlined />,
    label: 'Users',
  },
  {
    key: '2',
    icon: <VideoCameraOutlined />,
    label: 'Add Users',
  },
  {
    key: '3',
    icon: <VideoCameraOutlined />,
    label: 'Profiles',
  },
];

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

const DashboardPage: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('1');
  const { user, logout, isLoading } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<{ id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserDeleteModalOpen, setIsUserDeleteModalOpen] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const showModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    await logout();
  };
  const [userEditForm] = Form.useForm();
  const [userAddForm] = Form.useForm();

  const handleAddUser = async (values: {
    fullname: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const selectedRole = allRoles.find(
        (role) => role.name.toLowerCase() === values.role.toLocaleLowerCase(),
      );
      if (!selectedRole) {
        console.log('role Not found !', values.role);
        return;
      }
      const sendingData = {
        fullName: values.fullname,
        email: values.email,
        roleId: selectedRole.id,
      };
      console.log(sendingData);
      const userResponse = await api.post('/users', sendingData);
      const passwordResponse = await api.post(`users/${userResponse.data.id}/password`, {
        password: values.password,
      });
      console.log('user added successfully');
      const refreshedUsers = await api.get('/users');
      setAllUsers(refreshedUsers.data);
      userAddForm.resetFields();
    } catch (e) {
      console.log('Error', e);
    }
  };
  const handleUserUpdate = async (values: { fullname: string; email: string; role: string }) => {
    try {
      console.log('Updating user with ID:', selectedUser?.id);
      console.log('Form values:', values);
      console.log('Available roles:', allRoles);

      // Check if roles are loaded
      if (allRoles.length === 0) {
        console.error('Roles not loaded yet. Please try again.');
        return;
      }

      // Find the role ID based on role name (case insensitive)
      const selectedRole = allRoles.find(
        (role) => role.name.toLowerCase() === values.role.toLowerCase(),
      );
      if (!selectedRole) {
        console.error('Role not found:', values.role);
        console.error(
          'Available role names:',
          allRoles.map((r) => r.name),
        );
        return;
      }

      const updateData = {
        fullName: values.fullname,
        email: values.email,
        roleId: selectedRole.id,
      };

      console.log('Sending to backend:', updateData);

      const response = await api.patch(`/users/update/${selectedUser?.id}`, updateData);
      console.log('Backend response:', response.data);

      setIsEditModalOpen(false);
      // Refresh the user list
      const refreshResponse = await api.get('/users');
      setAllUsers(refreshResponse.data);
      console.log('User updated successfully and list refreshed');
    } catch (e) {
      console.error('Failed to update user:', e);
    }
  };

  // Reset form when selectedUser changes
  useEffect(() => {
    if (selectedUser && isEditModalOpen) {
      userEditForm.setFieldsValue({
        fullname: selectedUser.fullName,
        email: selectedUser.email,
        role: selectedUser.role?.name,
      });
    }
  }, [selectedUser, isEditModalOpen, userEditForm]);

  useEffect(() => {
    const LoadAllUsers = async () => {
      try {
        const response = await api.get('/users');
        setAllUsers(response.data);
      } catch (e) {
        console.log(e);
      }
    };

    const LoadAllRoles = async () => {
      try {
        const response = await api.get('/roles');
        console.log('Loaded roles:', response.data);
        setAllRoles(response.data);
      } catch (e) {
        console.error('Failed to load roles:', e);
        console.error('You might not have permission to access roles endpoint');
      }
    };

    LoadAllUsers();
    LoadAllRoles();
  }, []);
  useEffect(() => {
    console.log('All users:', allUsers);
  }, [allUsers]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleEditUser = (user: User) => {
    console.log('handleEditUser called with:', user);
    setIsEditModalOpen(true);
    setSelectedUser(user);
    console.log('Modal should open now, isEditModalOpen:', true);
  };
  const handleDeleteUser = async (user: User) => {
    setIsUserDeleteModalOpen(true);
    setSelectedUserToDelete(user);
  };
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
          <>
            <span>
              <Tag color={color} key={roleName}>
                {roleName.toUpperCase()}
              </Tag>
            </span>
          </>
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
              e.stopPropagation(); // Prevent row click!
              handleEditUser(record);
            }}
          >
            <EditOutlined />
          </Button>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click!
              handleDeleteUser(record);
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];
  const handleSearch = (value: string) => {
    const resultUsers = allUsers.filter((user) =>
      user.fullName.toLowerCase().includes(value.toLowerCase()),
    );
    console.log('Fil', resultUsers);
    setFilteredUsers(resultUsers);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
        style={{ position: 'relative' }}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['3']}
          items={items}
          selectedKeys={[selectedKey]}
          onSelect={({ key }) => setSelectedKey(key)}
        />

        <div style={{ position: 'absolute', bottom: 30, width: '100%', textAlign: 'center' }}>
          <Button type="primary" onClick={handleLogout}>
            Logout <LogoutOutlined className="ml-2" />
          </Button>
        </div>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="pb-4 pr-12 flex justify-end space-x-4 ">
            <div className="text-md ">Hi,</div>
            <div className="text-md ">{user?.fullName}</div>
          </div>
        </Header>

        <Content style={{ margin: '24px 16px 0' }}>
          {selectedKey === '1' && (
            <>
              <h2 className="text-lg font-semibold">Users List</h2>
              <div
                style={{
                  padding: 24,
                  minHeight: 360,
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                }}
              >
                <div className="max-w-xs mb-4">
                  <Input
                    placeholder="Search users by name..."
                    prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <Table
                  dataSource={filteredUsers.length > 0 ? filteredUsers : allUsers}
                  columns={columns}
                  onRow={(record) => ({
                    onClick: () => showModal(record),
                  })}
                />
              </div>
              <Modal
                open={isModalOpen}
                footer={[
                  <Button key="ok" type="primary" onClick={handleOk}>
                    OK
                  </Button>,
                ]}
                onCancel={() => setIsModalOpen(false)}
              >
                {selectedUser && (
                  <div>
                    <h1 className="text-lg">User info</h1>
                    <div className="flex space-x-4 items-center mt-4">
                      <div>
                        <UserOutlined style={{ fontSize: 100 }} />
                      </div>
                      <div>
                        <div className="flex">
                          <span className="pr-2">Full Name:</span>
                          <span>{selectedUser.fullName}</span>
                        </div>
                        <div className="flex">
                          <span className="pr-2">Email:</span>
                          <span>{selectedUser.email}</span>
                        </div>
                        <div className="flex">
                          <span className="pr-2">Role :</span>
                          <span>{selectedUser.role?.name}</span>
                        </div>
                        <div className="flex">
                          <span className="pr-2">Registered Date :</span>
                          <span>
                            {selectedUser.createdAt
                              ? new Date(selectedUser.createdAt).toLocaleString()
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Modal>

              <Modal
                title="Confirm Deletion"
                open={isUserDeleteModalOpen}
                onOk={async () => {
                  try {
                    await api.delete(`/users/${selectedUserToDelete?.id}`);
                    const refreshedUsers = await api.get('/users');
                    setAllUsers(refreshedUsers.data);
                    setIsUserDeleteModalOpen(false);
                  } catch (e) {
                    console.log('Error deleting user:', e);
                  }
                }}
                onCancel={() => setIsUserDeleteModalOpen(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <p>
                  Are you sure you want to delete user{' '}
                  <strong>{selectedUserToDelete?.fullName}</strong>?
                </p>
              </Modal>
            </>
          )}
          {selectedKey === '2' && (
            <>
              <h2 className="text-lg">Add Users</h2>
              <div
                style={{
                  padding: 24,
                  minHeight: 360,
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Form
                  form={userAddForm}
                  layout="horizontal"
                  name="add user"
                  labelCol={{ span: 8 }}
                  labelAlign="right"
                  wrapperCol={{ span: 16 }}
                  colon={false}
                  style={{ minWidth: 500 }}
                  onFinish={handleAddUser}
                >
                  <Form.Item label="Full Name :" name="fullname" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Email :" name="email" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Password :" name="password" rules={[{ required: true }]}>
                    <Password />
                  </Form.Item>
                  <Form.Item label="Role :" name="role" rules={[{ required: true }]}>
                    <Select placeholder="Select the role" style={{ width: '40%' }}>
                      {allRoles.map((role) => (
                        <Select.Option key={role.id} value={role.name}>
                          {role.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item className="flex justify-end">
                    <Button type="primary" htmlType="submit">
                      Add
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </>
          )}
          {selectedKey === '3' && (
            <>
              <h2 className="text-lg">User Profile</h2>
              <div
                style={{
                  padding: 24,
                  minHeight: 360,
                  maxWidth: 500,
                  margin: 'auto',
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                }}
              >
                <div className="flex space-x-4 items-center justify-center mt-4">
                  <div className="flex flex-col items-center space-y-8">
                    <div className="flex flex-col items-center space-x-4">
                      <div>
                        <UserOutlined style={{ fontSize: 100 }} />
                      </div>
                      <div>
                        <div className="flex mb-2 mt-4">
                          <span className="pr-2 font-semibold text-md">Full Name:</span>
                          <span className="pr-2 font-semibold text-md ">{user?.fullName}</span>
                        </div>
                        <div className="flex mb-2">
                          <span className="pr-2 font-semibold text-md">Email:</span>
                          <span className="pr-2 font-semibold text-md">{user?.email}</span>
                        </div>
                        <div className="flex">
                          <span className="pr-2 font-semibold text-md">Role :</span>
                          <span className="pr-2 font-semibold text-md">{user?.role?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        type="primary"
                        className="px-8"
                        onClick={() => {
                          console.log('Edit Profile clicked, user:', user);
                          if (user) {
                            handleEditUser(user);
                          } else {
                            console.log('No user found');
                          }
                        }}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Content>

        {/* Edit Modal - Available for all tabs */}
        <Modal open={isEditModalOpen} footer={null} onCancel={() => setIsEditModalOpen(false)}>
          {selectedUser && (
            <div>
              <h1 className="text-lg">Edit User info</h1>
              <Form
                form={userEditForm}
                key={selectedUser.id}
                layout="horizontal"
                name="edit user"
                labelCol={{ span: 8 }}
                labelAlign="left"
                labelWrap
                wrapperCol={{ span: 16 }}
                colon={false}
                style={{ maxWidth: 600 }}
                initialValues={{
                  fullname: selectedUser.fullName,
                  email: selectedUser.email,
                  role: selectedUser.role?.name,
                }}
                onFinish={handleUserUpdate}
              >
                <Form.Item label="Full Name :" name="fullname" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Email :" name="email">
                  <Input />
                </Form.Item>
                <Form.Item label="Role :" name="role" rules={[{ required: true }]}>
                  <Select placeholder="Select Role">
                    {allRoles.map((role) => (
                      <Select.Option key={role.id} value={role.name}>
                        {role.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item className="flex justify-end">
                  <Button type="primary" htmlType="submit" className="px-8">
                    Save
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>

        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
