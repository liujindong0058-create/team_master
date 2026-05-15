import React, { useEffect, useState } from 'react';
import { Layout, Modal, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useTeamStore, useMemberStore } from '@/store';
import { Team } from '@/types';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { currentTeam, fetchTeams, createTeam, updateTeam, deleteTeam } = useTeamStore();
  const { clearMembers } = useMemberStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 初始化加载团队列表
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // 当切换团队时，清空成员列表（让成员组件重新加载）
  useEffect(() => {
    if (currentTeam) {
      clearMembers();
    }
  }, [currentTeam?.id, clearMembers]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      message.success('已退出登录');
    } catch {
      message.error('退出登录失败');
    }
  };

  // 创建团队
  const handleCreateTeam = () => {
    form.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createTeam(values);
      setIsCreateModalOpen(false);
      message.success('团队创建成功');
    } catch {
      // 表单验证失败或请求失败
    }
  };

  // 编辑团队
  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    editForm.setFieldsValue({
      name: team.name,
      description: team.description,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingTeam) return;
    try {
      const values = await editForm.validateFields();
      await updateTeam(editingTeam.id, values);
      setIsEditModalOpen(false);
      setEditingTeam(null);
      message.success('团队更新成功');
    } catch {
      // 表单验证失败或请求失败
    }
  };

  // 删除团队
  const handleDeleteTeam = (team: Team) => {
    setDeletingTeam(team);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTeam) return;
    try {
      await deleteTeam(deletingTeam.id);
      setIsDeleteModalOpen(false);
      setDeletingTeam(null);
      message.success('团队删除成功');
    } catch {
      message.error('删除团队失败');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        onCreateTeam={handleCreateTeam}
        onEditTeam={handleEditTeam}
        onDeleteTeam={handleDeleteTeam}
      />
      <Layout>
        <Header onLogout={handleLogout} />
        <Content
          style={{
            margin: 0,
            padding: 0,
            backgroundColor: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Content>
      </Layout>

      {/* 创建团队弹窗 */}
      <Modal
        title="创建新团队"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => setIsCreateModalOpen(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="团队名称"
            rules={[{ required: true, message: '请输入团队名称' }]}
          >
            <Input placeholder="请输入团队名称" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="description"
            label="团队描述"
          >
            <Input.TextArea
              placeholder="请输入团队描述（可选）"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑团队弹窗 */}
      <Modal
        title="编辑团队"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingTeam(null);
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="团队名称"
            rules={[{ required: true, message: '请输入团队名称' }]}
          >
            <Input placeholder="请输入团队名称" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="description"
            label="团队描述"
          >
            <Input.TextArea
              placeholder="请输入团队描述（可选）"
              rows={3}
              maxLength={200}
              showCount
            />
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
          setDeletingTeam(null);
        }}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除团队「{deletingTeam?.name}」吗？</p>
        <p style={{ color: '#999', fontSize: 12 }}>删除后无法恢复，团队内的成员数据也将被删除。</p>
      </Modal>
    </Layout>
  );
};

export default MainLayout;
