'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { Layout, Menu, theme, Button, ConfigProvider } from 'antd';
import {
  VideoCameraOutlined,
  LogoutOutlined,
  UserOutlined,
  ProfileOutlined,
  CheckSquareTwoTone,
  CheckSquareOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Content, Footer, Sider } = Layout;

interface SharedLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    key: '/profiles',
    icon: <ProfileOutlined />,
    label: 'Profiles',
    Permissions: ['read:user'],
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: 'Users Management',
    Permissions: ['read:users'],
  },

  {
    key: '/roles',

    icon: <CheckSquareOutlined />,
    label: 'Roles Management',
    Permissions: ['read:roles', 'create:roles'],
  },
];

const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const hasAllPermission = useCallback(
    (perms: string[]) => perms.every((perm) => user?.role?.permissions?.includes(perm)),
    [user?.role?.permissions],
  );

  const allowedMenuItems = useMemo(
    () =>
      menuItems
        .filter((section) => hasAllPermission(section.Permissions))
        .map((section) => ({
          key: section.key,
          label: section.label,
          icon: section.icon,
        })),
    [hasAllPermission],
  );

  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  const handleMenuClick = useCallback(
    (key: string) => {
      router.push(key);
    },
    [router],
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          collapsedWidth={0}
          theme={isDarkMode ? 'dark' : 'light'}
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme={isDarkMode ? 'dark' : 'light'}
            selectedKeys={[pathname]}
            mode="inline"
            items={allowedMenuItems}
            onClick={({ key }) => handleMenuClick(key)}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: '0 24px',
              background: isDarkMode ? '#141414' : '#ffffff',
              borderBottom: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0',
            }}
          >
            <div className="flex justify-between items-center">
              <div />
              <div className="flex items-center space-x-4">
                <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                  Hi, {user?.fullName}
                </span>
                <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                  Logout
                </Button>

                <Button
                  type="text"
                  icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                  onClick={toggleDarkMode}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? 'Light' : 'Dark'}
                </Button>
              </div>
            </div>
          </Header>
          <Content
            style={{
              margin: '24px 16px 0',
              background: isDarkMode ? '#0f0f0f' : '#f5f5f5',
            }}
          >
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: isDarkMode ? '#1f1f1f' : '#ffffff',
                borderRadius: borderRadiusLG,
                border: isDarkMode ? '1px solid #303030' : '1px solid #d9d9d9',
              }}
            >
              {children}
            </div>
          </Content>
          <Footer
            style={{
              textAlign: 'center',
              background: isDarkMode ? '#141414' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
              borderTop: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0',
            }}
          >
            Company CRUD ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default SharedLayout;
