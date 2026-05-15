import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Typography,
  Empty,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Dropdown,
  message,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  EyeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  RadarChartOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useTeamStore, useMemberStore, useProfileStore } from '@/store';
import { Member, MemberRole } from '@/types';
import { FirstImpressionTab, NotesTab, AssessmentsTab, MatrixTab } from './components';
import './profile.css';

const { Text } = Typography;
const { Option } = Select;

const roleColors: Record<MemberRole, string> = {
  owner: 'red',
  admin: 'orange',
  member: 'blue',
};

const roleLabels: Record<MemberRole, string> = {
  owner: '负责人',
  admin: '管理员',
  member: '成员',
};

const roleLabelsMap: Record<string, string> = {
  owner: '负责人',
  admin: '管理员',
  member: '成员',
};

// 左侧导航项
const navItems = [
  { key: 'firstImpression', label: '初印象', icon: <EyeOutlined /> },
  { key: 'notes', label: '小记', icon: <FileTextOutlined /> },
  { key: 'assessments', label: '周期评估', icon: <BarChartOutlined /> },
  { key: 'matrix', label: '能力矩阵', icon: <RadarChartOutlined /> },
];

const ProfilePage: React.FC = () => {
  const { currentTeam } = useTeamStore();
  const {
    members,
    selectedMember,
    fetchMembers,
    selectMember,
    createMember,
    updateMember,
    deleteMember,
    isLoading: _membersLoading,
  } = useMemberStore();
  const { clearProfile } = useProfileStore();

  const [activeTab, setActiveTab] = useState('firstImpression');
  const [searchText, setSearchText] = useState('');

  // 成员 CRUD 相关 state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 加载成员列表
  useEffect(() => {
    if (currentTeam) {
      fetchMembers(currentTeam.id);
    }
  }, [currentTeam?.id, fetchMembers]);

  // 切换成员时清空之前的数据
  useEffect(() => {
    return () => {
      clearProfile();
    };
  }, [selectedMember?.id, clearProfile]);

  // 创建成员
  const handleCreateMember = () => {
    form.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!currentTeam) return;
    try {
      const values = await form.validateFields();
      await createMember(currentTeam.id, values);
      setIsCreateModalOpen(false);
      message.success('成员添加成功');
    } catch {
      // 表单验证失败或请求失败
    }
  };

  // 编辑成员
  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    editForm.setFieldsValue({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      title: member.title,
      department: member.department,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingMember) return;
    try {
      const values = await editForm.validateFields();
      await updateMember(editingMember.id, values);
      setIsEditModalOpen(false);
      setEditingMember(null);
      message.success('成员信息更新成功');
    } catch {
      // 表单验证失败或请求失败
    }
  };

  // 删除成员
  const handleDeleteMember = (member: Member) => {
    setDeletingMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMember) return;
    try {
      await deleteMember(deletingMember.id);
      setIsDeleteModalOpen(false);
      setDeletingMember(null);
      message.success('成员删除成功');
    } catch {
      message.error('删除成员失败');
    }
  };

  // 选择成员
  const handleSelectMember = (member: Member) => {
    selectMember(member);
    setActiveTab('firstImpression');
  };

  // 获取成员菜单项
  const getMemberMenuItems = (member: Member) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: () => handleEditMember(member),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleDeleteMember(member),
    },
  ];

  // 过滤成员
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (m.title && m.title.toLowerCase().includes(searchText.toLowerCase())) ||
    (m.department && m.department.toLowerCase().includes(searchText.toLowerCase()))
  );

  // 渲染内容区域
  const renderContent = () => {
    switch (activeTab) {
      case 'firstImpression':
        return <FirstImpressionTab />;
      case 'notes':
        return <NotesTab />;
      case 'assessments':
        return <AssessmentsTab />;
      case 'matrix':
        return <MatrixTab />;
      default:
        return <FirstImpressionTab />;
    }
  };

  return (
    <div className="profile-layout">
      {/* 左侧：人员列表 */}
      <div className="profile-member-list">
        <div className="member-list-header">
          <div className="member-list-title">
            <TeamOutlined style={{ marginRight: 6 }} />
            {currentTeam?.name || '请选择团队'}
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              {members.length}人
            </Text>
          </div>
          <Tooltip title="添加成员">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={handleCreateMember}
            />
          </Tooltip>
        </div>

        {/* 搜索框 */}
        <div className="member-search">
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="搜索成员..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="small"
          />
        </div>

        {/* 成员列表 */}
        <div className="member-list-body">
          {!currentTeam ? (
            <Empty description="请先选择一个团队" style={{ marginTop: 40 }} />
          ) : filteredMembers.length === 0 ? (
            <Empty description={searchText ? '无匹配结果' : '暂无成员'} style={{ marginTop: 40 }} />
          ) : (
            filteredMembers.map((member) => {
              const isActive = selectedMember?.id === member.id;
              return (
                <div
                  key={member.id}
                  className={`member-list-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectMember(member)}
                >
                  <div className="member-list-item-left">
                    <Avatar
                      size={36}
                      icon={<UserOutlined />}
                      src={member.avatar}
                      style={{
                        backgroundColor: isActive ? '#1890ff' : '#d9d9d9',
                        flexShrink: 0,
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="member-list-item-info">
                      <div className="member-list-item-name">
                        <Text strong ellipsis style={{ fontSize: 13 }}>
                          {member.name}
                        </Text>
                        <Tag
                          color={roleColors[member.role]}
                          style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', marginRight: 0 }}
                        >
                          {roleLabels[member.role]}
                        </Tag>
                      </div>
                      {(member.title || member.department) && (
                        <Text type="secondary" ellipsis style={{ fontSize: 11 }}>
                          {[member.title, member.department].filter(Boolean).join(' · ')}
                        </Text>
                      )}
                    </div>
                  </div>
                  <Dropdown
                    menu={{ items: getMemberMenuItems(member) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      className="member-list-item-more"
                    />
                  </Dropdown>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 中间：竖向导航 */}
      <div className="profile-nav">
        {selectedMember && (
          <>
            {/* 成员信息摘要 */}
            <div className="profile-nav-member-info">
              <Avatar
                size={48}
                icon={<UserOutlined />}
                src={selectedMember.avatar}
                style={{ backgroundColor: '#1890ff' }}
              >
                {selectedMember.name.charAt(0).toUpperCase()}
              </Avatar>
              <div className="profile-nav-member-detail">
                <Text strong style={{ fontSize: 14 }}>{selectedMember.name}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {roleLabelsMap[selectedMember.role] || selectedMember.role}
                  {selectedMember.title ? ` · ${selectedMember.title}` : ''}
                </Text>
                {selectedMember.email && (
                  <Text type="secondary" style={{ fontSize: 11 }} ellipsis>
                    <MailOutlined style={{ marginRight: 4 }} />
                    {selectedMember.email}
                  </Text>
                )}
                {selectedMember.phone && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <PhoneOutlined style={{ marginRight: 4 }} />
                    {selectedMember.phone}
                  </Text>
                )}
              </div>
            </div>

            <div className="profile-nav-divider" />

            {/* 导航菜单 */}
            <div className="profile-nav-menu">
              {navItems.map((item) => (
                <div
                  key={item.key}
                  className={`profile-nav-item ${activeTab === item.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.key)}
                >
                  <span className="profile-nav-icon">{item.icon}</span>
                  <span className="profile-nav-label">{item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {!selectedMember && (
          <div className="profile-nav-empty">
            <UserOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
              请选择成员
            </Text>
          </div>
        )}
      </div>

      {/* 右侧：内容区域 */}
      <div className="profile-content">
        {selectedMember ? (
          renderContent()
        ) : (
          <div className="profile-content-empty">
            <Empty description="请从左侧选择一个成员查看详情" />
          </div>
        )}
      </div>

      {/* 创建成员弹窗 */}
      <Modal
        title="添加成员"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => setIsCreateModalOpen(false)}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入成员姓名' }]}
          >
            <Input placeholder="请输入成员姓名" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="member"
          >
            <Select placeholder="请选择角色">
              <Option value="owner">负责人</Option>
              <Option value="admin">管理员</Option>
              <Option value="member">成员</Option>
            </Select>
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item name="title" label="职位">
            <Input placeholder="请输入职位" maxLength={50} />
          </Form.Item>
          <Form.Item name="department" label="部门">
            <Input placeholder="请输入部门" maxLength={50} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑成员弹窗 */}
      <Modal
        title="编辑成员"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingMember(null);
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入成员姓名' }]}
          >
            <Input placeholder="请输入成员姓名" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="owner">负责人</Option>
              <Option value="admin">管理员</Option>
              <Option value="member">成员</Option>
            </Select>
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item name="title" label="职位">
            <Input placeholder="请输入职位" maxLength={50} />
          </Form.Item>
          <Form.Item name="department" label="部门">
            <Input placeholder="请输入部门" maxLength={50} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        title="确认删除"
        open={isDeleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingMember(null);
        }}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除成员「{deletingMember?.name}」吗？</p>
        <p style={{ color: '#999', fontSize: 12 }}>删除后，该成员的所有数据（包括评估、笔记等）都将被删除。</p>
      </Modal>
    </div>
  );
};

export default ProfilePage;
