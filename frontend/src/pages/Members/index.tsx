import React, { useEffect, useState } from 'react';
import {
  List,
  Avatar,
  Typography,
  Button,
  Tag,
  Empty,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Dropdown,
  message,
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
} from '@ant-design/icons';
import { useTeamStore, useMemberStore } from '@/store';
import { Member, MemberRole } from '@/types';
import './styles.css';

const { Title, Text } = Typography;
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

const MembersPage: React.FC = () => {
  const { currentTeam } = useTeamStore();
  const {
    members,
    selectedMember,
    fetchMembers,
    selectMember,
    createMember,
    updateMember,
    deleteMember,
    isLoading,
  } = useMemberStore();

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

  if (!currentTeam) {
    return (
      <div className="members-page">
        <Empty description="请先选择一个团队" />
      </div>
    );
  }

  return (
    <div className="members-page">
      {/* 头部 */}
      <div className="members-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            {currentTeam.name}
          </Title>
          <Text type="secondary">共 {members.length} 名成员</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateMember}
        >
          添加成员
        </Button>
      </div>

      {/* 成员列表 */}
      <List
        className="members-list"
        loading={isLoading}
        dataSource={members}
        locale={{
          emptyText: <Empty description="暂无成员，点击右上角添加" />,
        }}
        renderItem={(member) => (
          <List.Item
            className={`member-item ${selectedMember?.id === member.id ? 'selected' : ''}`}
            onClick={() => handleSelectMember(member)}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  size={48}
                  icon={<UserOutlined />}
                  src={member.avatar}
                  style={{
                    backgroundColor: selectedMember?.id === member.id ? '#1890ff' : '#d9d9d9',
                  }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </Avatar>
              }
              title={
                <Space>
                  <Text strong>{member.name}</Text>
                  <Tag color={roleColors[member.role]}>
                    {roleLabels[member.role]}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  {member.title && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {member.title}
                    </Text>
                  )}
                  {member.department && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {member.department}
                    </Text>
                  )}
                  <Space size={16} style={{ marginTop: 4 }}>
                    {member.email && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <MailOutlined style={{ marginRight: 4 }} />
                        {member.email}
                      </Text>
                    )}
                    {member.phone && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <PhoneOutlined style={{ marginRight: 4 }} />
                        {member.phone}
                      </Text>
                    )}
                  </Space>
                </Space>
              }
            />
            <Dropdown
              menu={{ items: getMemberMenuItems(member) }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </List.Item>
        )}
      />

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
          <Form.Item
            name="email"
            label="邮箱"
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="title"
            label="职位"
          >
            <Input placeholder="请输入职位" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="department"
            label="部门"
          >
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
          <Form.Item
            name="email"
            label="邮箱"
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="title"
            label="职位"
          >
            <Input placeholder="请输入职位" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="department"
            label="部门"
          >
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

export default MembersPage;
