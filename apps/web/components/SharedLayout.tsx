'use client';
import React, { useState } from 'react';
import { Layout, Menu, theme, Button } from 'antd';
import { VideoCameraOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Content, Footer, Sider } = Layout;

interface SharedLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    key: '/users',
    icon: <VideoCameraOutlined />,
    label: 'Users',
  },
  {
    key: '/add-users',
    icon: <VideoCameraOutlined />,
    label: 'Add Users',
  },
  {
    key: '/profiles',
    icon: <VideoCameraOutlined />,
    label: 'Profiles',
  },
  {
    key: '/roles',
    icon: <VideoCameraOutlined />,
    label: 'Roles',
  },
];

const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleMenuClick = (key: string) => {
    router.push(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          selectedKeys={[pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer }}>
          <div className="flex justify-between items-center">
            <div />
            <div className="flex items-center space-x-4">
              <span>Hi, {user?.fullName}</span>
              <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </div>
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
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Company CRUD ©{new Date().getFullYear()}</Footer>
      </Layout>
    </Layout>
  );
};

export default SharedLayout;
