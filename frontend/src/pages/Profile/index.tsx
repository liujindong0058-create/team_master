import React, { useEffect } from 'react';
import { Tabs, Card, Avatar, Typography, Empty, Descriptions } from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  RadarChartOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useMemberStore, useProfileStore } from '@/store';
import { FirstImpressionTab, NotesTab, AssessmentsTab, MatrixTab } from './components';
import { formatDate } from '@/utils';

const { Title } = Typography;

// 角色映射
const roleLabels: Record<string, string> = {
  owner: '负责人',
  admin: '管理员',
  member: '成员',
};

const ProfilePage: React.FC = () => {
  const { selectedMember } = useMemberStore();
  const { clearProfile } = useProfileStore();

  // 切换成员时清空之前的数据
  useEffect(() => {
    return () => {
      clearProfile();
    };
  }, [selectedMember?.id, clearProfile]);

  if (!selectedMember) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Empty description="请从左侧选择一个成员查看详情" />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'firstImpression',
      label: (
        <span>
          <EyeOutlined />
          初印象
        </span>
      ),
      children: <FirstImpressionTab />,
    },
    {
      key: 'notes',
      label: (
        <span>
          <FileTextOutlined />
          小记
        </span>
      ),
      children: <NotesTab />,
    },
    {
      key: 'assessments',
      label: (
        <span>
          <BarChartOutlined />
          周期评估
        </span>
      ),
      children: <AssessmentsTab />,
    },
    {
      key: 'matrix',
      label: (
        <span>
          <RadarChartOutlined />
          能力矩阵
        </span>
      ),
      children: <MatrixTab />,
    },
  ];

  return (
    <div className="profile-page" style={{ height: '100%', overflow: 'auto' }}>
      {/* 成员基本信息卡片 */}
      <Card style={{ margin: 16, marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            src={selectedMember.avatar}
            style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
          >
            {selectedMember.name.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
              {selectedMember.name}
            </Title>
            <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label={<><IdcardOutlined /> 角色</>}>
                {roleLabels[selectedMember.role] || selectedMember.role}
              </Descriptions.Item>
              {selectedMember.title && (
                <Descriptions.Item label="职位">
                  {selectedMember.title}
                </Descriptions.Item>
              )}
              {selectedMember.department && (
                <Descriptions.Item label="部门">
                  {selectedMember.department}
                </Descriptions.Item>
              )}
              {selectedMember.email && (
                <Descriptions.Item label={<><MailOutlined /> 邮箱</>}>
                  {selectedMember.email}
                </Descriptions.Item>
              )}
              {selectedMember.phone && (
                <Descriptions.Item label={<><PhoneOutlined /> 电话</>}>
                  {selectedMember.phone}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="加入时间">
                {formatDate(selectedMember.joinDate)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>

      {/* 标签页内容 */}
      <div style={{ padding: 16 }}>
        <Tabs
          defaultActiveKey="firstImpression"
          items={tabItems}
          type="card"
          style={{ background: '#fff', padding: 16, borderRadius: 8 }}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
