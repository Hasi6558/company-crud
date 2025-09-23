'use client';
import * as React from 'react';
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { Button } from 'antd';
import Cookies from 'js-cookie';
import router from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
const { Header, Content, Footer, Sider } = Layout;

const items = [
  {
    key: '1',
    icon: <UserOutlined />,
    label: 'Dashboard',
  },
  {
    key: '2',
    icon: <VideoCameraOutlined />,
    label: 'Users',
  },
  {
    key: '3',
    icon: <UploadOutlined />,
    label: 'Settings',
  },
];
// const items = ['Dashboard', 'Users', 'Settings'].map((label, index) => ({
//   key: String(index + 1),
//   icon: React.createElement(icon),
//   label,
// }));

const DashboardPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log('Authenticated user:', user);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const handleLogout = async () => {
    await logout();
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
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']} items={items} />

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
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            content
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
