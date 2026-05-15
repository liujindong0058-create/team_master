import React from 'react';
import { Layout, Menu, Button, Avatar, Typography, Empty, Dropdown } from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useTeamStore } from '@/store';
import { Team } from '@/types';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  onCreateTeam: () => void;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (team: Team) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onCreateTeam,
  onEditTeam,
  onDeleteTeam,
}) => {
  const { teams, currentTeam, setCurrentTeam, isLoading } = useTeamStore();

  const handleTeamClick = (team: Team) => {
    setCurrentTeam(team);
  };

  const getTeamMenuItems = (team: Team) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑团队',
      onClick: () => onEditTeam(team),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除团队',
      danger: true,
      onClick: () => onDeleteTeam(team),
    },
  ];

  return (
    <Sider
      width={260}
      theme="light"
      style={{
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      {/* 标题区域 */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <Text strong style={{ fontSize: 16 }}>我的团队</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          onClick={onCreateTeam}
        >
          新建
        </Button>
      </div>

      {/* 团队列表 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {teams.length === 0 && !isLoading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无团队"
            style={{ marginTop: 40 }}
          />
        ) : (
          <Menu
            mode="inline"
            selectedKeys={currentTeam ? [currentTeam.id] : []}
            style={{ border: 'none' }}
            items={teams.map((team) => ({
              key: team.id,
              onClick: () => handleTeamClick(team),
              label: (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' }}>
                    <Avatar
                      size="small"
                      style={{
                        backgroundColor: team.id === currentTeam?.id ? '#1890ff' : '#d9d9d9',
                        flexShrink: 0,
                      }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text
                      ellipsis
                      style={{
                        color: team.id === currentTeam?.id ? '#1890ff' : 'inherit',
                      }}
                    >
                      {team.name}
                    </Text>
                  </div>
                  <Dropdown
                    menu={{ items: getTeamMenuItems(team) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      style={{ opacity: 0.6 }}
                    />
                  </Dropdown>
                </div>
              ),
            }))}
          />
        )}
      </div>

      {/* 底部信息 */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          共 {teams.length} 个团队
        </Text>
      </div>
    </Sider>
  );
};

export default Sidebar;
