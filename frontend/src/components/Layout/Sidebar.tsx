import React, { useState } from 'react';
import { Button, Avatar, Typography, Empty, Dropdown, Tooltip } from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useTeamStore } from '@/store';
import { Team } from '@/types';

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
  const [collapsed, setCollapsed] = useState(true);

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
    <div
      style={{
        width: collapsed ? 56 : 240,
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#fff',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* 标题区域 */}
      <div
        style={{
          padding: collapsed ? '16px 0' : '16px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamOutlined style={{ fontSize: 18, color: '#1890ff', flexShrink: 0 }} />
          {!collapsed && (
            <Text strong style={{ fontSize: 15, whiteSpace: 'nowrap' }}>我的团队</Text>
          )}
        </div>
        {!collapsed && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={onCreateTeam}
            style={{ flexShrink: 0 }}
          >
            新建
          </Button>
        )}
      </div>

      {/* 团队列表 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {teams.length === 0 && !isLoading ? (
          collapsed ? (
            <div style={{ padding: '8px 0', textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: 16, color: '#d9d9d9' }} />
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无团队"
              style={{ marginTop: 40 }}
            />
          )
        ) : (
          teams.map((team) => {
            const isActive = currentTeam?.id === team.id;
            if (collapsed) {
              return (
                <Tooltip key={team.id} title={team.name} placement="right">
                  <div
                    onClick={() => handleTeamClick(team)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 0',
                      cursor: 'pointer',
                      backgroundColor: isActive ? '#e6f7ff' : 'transparent',
                      borderLeft: isActive ? '3px solid #1890ff' : '3px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Avatar
                      size="small"
                      style={{
                        backgroundColor: isActive ? '#1890ff' : '#d9d9d9',
                        fontSize: 12,
                      }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </div>
                </Tooltip>
              );
            }
            return (
              <div
                key={team.id}
                onClick={() => handleTeamClick(team)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#e6f7ff' : 'transparent',
                  borderLeft: isActive ? '3px solid #1890ff' : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, overflow: 'hidden' }}>
                  <Avatar
                    size="small"
                    style={{
                      backgroundColor: isActive ? '#1890ff' : '#d9d9d9',
                      flexShrink: 0,
                    }}
                  >
                    {team.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text
                    ellipsis
                    style={{
                      color: isActive ? '#1890ff' : 'inherit',
                      fontSize: 14,
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
                    style={{ opacity: 0.6, flexShrink: 0 }}
                  />
                </Dropdown>
              </div>
            );
          })
        )}
      </div>

      {/* 底部：折叠按钮 + 团队数 */}
      <div
        style={{
          padding: collapsed ? '12px 0' : '12px 16px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {!collapsed && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            共 {teams.length} 个团队
          </Text>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ color: '#8c8c8c' }}
        />
      </div>
    </div>
  );
};

export default Sidebar;
