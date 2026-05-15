import React from 'react';
import { Layout, Avatar, Dropdown, Typography, Space, Badge } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { user } = useAuthStore();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: onLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* 左侧：Logo 和标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
          }}
        >
          T
        </div>
        <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
          TeamMaster
        </Text>
      </div>

      {/* 右侧：通知和用户信息 */}
      <Space size={24}>
        {/* 通知图标 */}
        <Badge count={0} size="small">
          <BellOutlined style={{ fontSize: 18, color: '#595959', cursor: 'pointer' }} />
        </Badge>

        {/* 用户下拉菜单 */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={user?.avatar}
              style={{ backgroundColor: '#1890ff' }}
            />
            <Text style={{ color: '#262626' }}>{user?.name || '用户'}</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
