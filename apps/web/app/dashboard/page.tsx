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
import {
  Layout,
  Menu,
  theme,
  Table,
  Tag,
  Modal,
  Input,
  Select,
  Space,
  Checkbox,
  GetProp,
} from 'antd';
import type { CheckboxOptionType } from 'antd/es/checkbox/Group';
import { Button } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import api from '../lib/axios';
import { Form } from 'antd';
import Password from 'antd/es/input/Password';
import { permission } from 'process';

const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;
const availablePermission = [
  'read:users',
  'read:user',
  'create:users',
  'update:users',
  'delete:users',
  'read:roles',
  'create:roles',
  'update:roles',
  'delete:roles',
];
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
  {
    key: '4',
    icon: <VideoCameraOutlined />,
    label: 'Roles',
  },
];

//role permission list

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
const permissionOptions: CheckboxOptionType[] = [
  { label: 'Read all users', value: 'read:users' },
  { label: 'Read user', value: 'read:user' },
  { label: 'Create users', value: 'create:users' },
  { label: 'Update users', value: 'update:users' },
  { label: 'Delete users', value: 'delete:users' },
  { label: 'Read roles', value: 'read:roles' },
  { label: 'Create roles', value: 'create:roles' },
  { label: 'Update roles', value: 'update:roles' },
  { label: 'Delete roles', value: 'delete:roles' },
];
interface Roles {
  id: string;
  key?: React.Key;
  name: string;
  permissions?: string[];
}

const DashboardPage: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('1');
  const { user, logout, isLoading } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<{ id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserDeleteModalOpen, setIsUserDeleteModalOpen] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRoleToDelete, setSelectedRoleToDelete] = useState<Roles | null>(null);
  const [isRoleDeleteModalOpen, setIsRoleDeleteModalOpen] = useState(false);
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false);
  const [editPermissionsRole, setEditPermissionsRole] = useState<Roles | null>(null);
  const [selectedPermissionsToAdd, setSelectedPermissionsToAdd] = useState<string[]>([]);

  useEffect(() => {
    console.log('consoleee:', editPermissionsRole);
  }, [editPermissionsRole]);

  const handleEditPermissions = (role: Roles) => {
    console.log('Editing permissions for role:', role);
    setSelectedPermissionsToAdd(role.permissions || []);
    setEditPermissionsRole(role);
    setIsEditPermissionsModalOpen(true);
  };

  const showModal = (user: User) => {
    setSelectedUserToEdit(user);
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

  const onChangePermissionCheckbox: GetProp<typeof Checkbox.Group, 'onChange'> = (
    checkedValues,
  ) => {
    console.log('checked = ', checkedValues);
    setSelectedPermissionsToAdd(checkedValues as string[]);
  };

  const handleSavePermissions = async () => {
    if (!editPermissionsRole) return;

    try {
      console.log('Saving permissions for role:', editPermissionsRole.name);
      console.log('New permissions:', selectedPermissionsToAdd);

      await api.patch(`/roles/${editPermissionsRole.id}`, {
        permissions: selectedPermissionsToAdd,
      });

      // Refresh roles list
      const refreshedRoles = await api.get('/roles');
      setAllRoles(refreshedRoles.data);

      setIsEditPermissionsModalOpen(false);
      console.log('Permissions updated successfully');
    } catch (error) {
      console.error('Failed to update permissions:', error);
    }
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
      await api.post(`users/${userResponse.data.id}/password`, {
        password: values.password,
      });
      console.log('User added successfully');
      const refreshedUsers = await api.get('/users');
      setAllUsers(refreshedUsers.data);
      userAddForm.resetFields();
    } catch (e) {
      console.log('Error', e);
    }
  };

  const handleUserUpdate = async (values: { fullname: string; email: string; role: string }) => {
    try {
      console.log('Updating user with ID:', selectedUserToEdit?.id);
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

      const response = await api.patch(`/users/update/${selectedUserToEdit?.id}`, updateData);
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
    if (selectedUserToEdit && isEditModalOpen) {
      userEditForm.setFieldsValue({
        fullname: selectedUserToEdit.fullName,
        email: selectedUserToEdit.email,
        role: selectedUserToEdit.role?.name,
      });
    }
  }, [selectedUserToEdit, isEditModalOpen, userEditForm]);

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
    setSelectedUserToEdit(user);
    console.log('Modal should open now, isEditModalOpen:', true);
  };
  const handleDeleteUser = async (user: User) => {
    console.log('handleDeleteUser called with user:', user);
    console.log('User ID to delete:', user.id);
    setIsUserDeleteModalOpen(true);
    setSelectedUserToDelete(user);
  };
  const handleDeleteRole = async (role: Roles) => {
    setIsRoleDeleteModalOpen(true);
    setSelectedRoleToDelete(role);
  };
  const getPermissionLabel = (permissionValue: string) => {
    const option = permissionOptions.find((perm) => perm.value === permissionValue);
    return option ? option.label : permissionValue;
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
              console.log('Delete button clicked for user:', record);
              handleDeleteUser(record);
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  const RoleColumns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Available permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[], record: Roles) => (
        <div className="flex items-center space-x-4 ">
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
            <Button type="link" onClick={() => handleEditPermissions(record)}>
              <EditOutlined />
            </Button>
          </div>
        </div>
      ),
    },

    {
      title: 'Delete',
      key: 'action',
      render: (_: unknown, record: Roles) => (
        <div>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRole(record);
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
          defaultSelectedKeys={['4']}
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
                {selectedUserToEdit && (
                  <div>
                    <h1 className="text-lg">User info</h1>
                    <div className="flex space-x-4 items-center mt-4">
                      <div>
                        <UserOutlined style={{ fontSize: 100 }} />
                      </div>
                      <div>
                        <div className="flex">
                          <span className="pr-2">Full Name:</span>
                          <span>{selectedUserToEdit.fullName}</span>
                        </div>
                        <div className="flex">
                          <span className="pr-2">Email:</span>
                          <span>{selectedUserToEdit.email}</span>
                        </div>
                        <div className="flex">
                          <span className="pr-2">Role :</span>
                          <span>{selectedUserToEdit.role?.name}</span>
                        </div>
                        <div className="flex">
                          <span className="pr-2">Registered Date :</span>
                          <span>
                            {selectedUserToEdit.createdAt
                              ? new Date(selectedUserToEdit.createdAt).toLocaleString()
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
                    console.log('About to delete user:', selectedUserToDelete);
                    console.log('Delete API call with ID:', selectedUserToDelete?.id);
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
          {selectedKey === '4' && (
            <>
              <h2 className="text-lg">User Roles</h2>
              <div
                style={{
                  padding: 24,
                  minHeight: 360,
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                }}
              >
                <Table dataSource={allRoles} columns={RoleColumns} rowKey="id" />
              </div>
              <Modal
                title="Confirm Deletion"
                open={isRoleDeleteModalOpen}
                onOk={async () => {
                  try {
                    await api.delete(`/roles/${selectedRoleToDelete?.id}`);
                    const refreshedRoles = await api.get('/roles');
                    setAllRoles(refreshedRoles.data);
                    setIsRoleDeleteModalOpen(false);
                  } catch (e) {
                    console.log('Error deleting role:', e);
                  }
                }}
                onCancel={() => setIsRoleDeleteModalOpen(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <p>
                  Are you sure you want to delete role <strong>{selectedRoleToDelete?.name}</strong>
                  ?
                </p>
              </Modal>
            </>
          )}
        </Content>

        {/* Edit Modal - Available for all tabs */}
        <Modal open={isEditModalOpen} footer={null} onCancel={() => setIsEditModalOpen(false)}>
          {selectedUserToEdit && (
            <div>
              <h1 className="text-lg">Edit User info</h1>
              <Form
                form={userEditForm}
                key={selectedUserToEdit.id}
                layout="horizontal"
                name="edit user"
                labelCol={{ span: 8 }}
                labelAlign="left"
                labelWrap
                wrapperCol={{ span: 16 }}
                colon={false}
                style={{ maxWidth: 600 }}
                initialValues={{
                  fullname: selectedUserToEdit.fullName,
                  email: selectedUserToEdit.email,
                  role: selectedUserToEdit.role?.name,
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

        <Modal
          title="Edit Permissions"
          open={isEditPermissionsModalOpen}
          onOk={handleSavePermissions}
          onCancel={() => setIsEditPermissionsModalOpen(false)}
        >
          <Form>
            <Checkbox.Group
              options={permissionOptions}
              onChange={onChangePermissionCheckbox}
              value={selectedPermissionsToAdd}
            />
          </Form>
        </Modal>

        <Footer style={{ textAlign: 'center' }}></Footer>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
