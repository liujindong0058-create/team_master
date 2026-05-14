import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, message, Modal, Form, Input, List, Tag, Empty } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  PlusOutlined, 
  BarChartOutlined, 
  LogoutOutlined,
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { teamAPI, memberAPI, noteAPI } from '../services/api';
import type { Team, Member } from '../types';

const { Header, Sider, Content } = Layout;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, setUser, currentTeam, setCurrentTeam, members, setMembers, notes, setNotes } = useAppStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [teamForm] = Form.useForm();
  const [memberForm] = Form.useForm();
  const [noteForm] = Form.useForm();

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (currentTeam) {
      loadMembers();
      loadNotes();
    }
  }, [currentTeam]);

  const loadTeams = async () => {
    try {
      const teamsData = await teamAPI.getAll();
      setTeams(teamsData);
      if (teamsData.length > 0 && !currentTeam) {
        setCurrentTeam(teamsData[0]);
      }
    } catch (error) {
      message.error('加载团队失败');
    }
  };

  const loadMembers = async () => {
    if (!currentTeam) return;
    try {
      const membersData = await memberAPI.getByTeam(currentTeam.id);
      setMembers(membersData);
    } catch (error) {
      message.error('加载成员失败');
    }
  };

  const loadNotes = async () => {
    if (!currentTeam) return;
    try {
      const notesData = await noteAPI.getTimeline(currentTeam.id);
      setNotes(notesData);
    } catch (error) {
      message.error('加载小记失败');
    }
  };

  const handleCreateTeam = async (values: { name: string; description: string }) => {
    setLoading(true);
    try {
      const newTeam = await teamAPI.create(values.name, values.description);
      setTeams([...teams, newTeam]);
      setCurrentTeam(newTeam);
      setTeamModalVisible(false);
      teamForm.resetFields();
      message.success('团队创建成功');
    } catch (error) {
      message.error('创建团队失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (values: { name: string; position: string }) => {
    if (!currentTeam) {
      message.error('请先选择团队');
      return;
    }
    setLoading(true);
    try {
      const newMember = await memberAPI.add(currentTeam.id, values.name, values.position);
      setMembers([...members, newMember]);
      setMemberModalVisible(false);
      memberForm.resetFields();
      message.success('成员添加成功');
    } catch (error) {
      message.error('添加成员失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (values: { content: string; type: string }) => {
    if (!selectedMember) {
      message.error('请先选择成员');
      return;
    }
    setLoading(true);
    try {
      const newNote = await noteAPI.add(selectedMember.id, values.content, values.type);
      setNotes([newNote, ...notes]);
      setNoteModalVisible(false);
      noteForm.resetFields();
      setSelectedMember(null);
      message.success('小记添加成功');
    } catch (error) {
      message.error('添加小记失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const userMenuItems = [
    { key: 'settings', icon: <SettingOutlined />, label: '设置' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  const getNoteTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      strength: { color: 'green', text: '优点' },
      weakness: { color: 'red', text: '缺点' },
      critical: { color: 'gold', text: '关键时刻' },
      daily: { color: 'blue', text: '日常表现' },
    };
    const item = typeMap[type] || { color: 'default', text: type };
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={260} style={{ background: '#fff', boxShadow: '2px 0 8px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TeamOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>团队陪跑大师</h2>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Team Master</p>
            </div>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 'bold', color: '#475569' }}>我的团队</span>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setTeamModalVisible(true)}>
              新建
            </Button>
          </div>
          <Menu
            mode="inline"
            selectedKeys={currentTeam ? [currentTeam.id] : []}
            style={{ border: 'none' }}
            items={teams.map(team => ({
              key: team.id,
              icon: <TeamOutlined />,
              label: team.name,
              onClick: () => setCurrentTeam(team),
            }))}
          />
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 'bold', color: '#475569' }}>团队成员</span>
            <Button size="small" icon={<PlusOutlined />} onClick={() => setMemberModalVisible(true)} disabled={!currentTeam}>
              添加
            </Button>
          </div>
          <List
            dataSource={members}
            renderItem={(member) => (
              <List.Item 
                style={{ padding: '8px 0', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedMember(member);
                  setNoteModalVisible(true);
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} icon={<UserOutlined />} />}
                  title={<span style={{ fontSize: 14 }}>{member.name}</span>}
                  description={<span style={{ fontSize: 12, color: '#94a3b8' }}>{member.position}</span>}
                />
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="暂无成员" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          />
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>
              {currentTeam?.name || '请选择团队'}
            </h1>
            {currentTeam && (
              <Tag color="blue">{members.length} 名成员</Tag>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button icon={<BarChartOutlined />} onClick={() => navigate('/assessments')}>
              多维度评估
            </Button>
            <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => key === 'logout' && handleLogout() }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} icon={<UserOutlined />} />
                <span style={{ fontWeight: 500 }}>{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 'bold' }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              日常小记
            </h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              if (members.length > 0) {
                setSelectedMember(members[0]);
                setNoteModalVisible(true);
              } else {
                message.warning('请先添加团队成员');
              }
            }}>
              添加小记
            </Button>
          </div>

          <List
            dataSource={notes}
            renderItem={(note) => {
              const member = members.find(m => m.id === note.memberId);
              return (
                <List.Item style={{ padding: 16, background: '#fafafa', borderRadius: 12, marginBottom: 12 }}>
                  <List.Item.Meta
                    avatar={<Avatar style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} icon={<UserOutlined />} />}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 'bold' }}>{member?.name || '未知成员'}</span>
                        {getNoteTypeTag(note.type)}
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                    }
                    description={<p style={{ margin: '8px 0 0', color: '#475569' }}>{note.content}</p>}
                  />
                </List.Item>
              );
            }}
            locale={{ emptyText: <Empty description="暂无小记，点击上方按钮添加" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          />
        </Content>
      </Layout>

      {/* 创建团队弹窗 */}
      <Modal
        title="创建新团队"
        open={teamModalVisible}
        onCancel={() => setTeamModalVisible(false)}
        footer={null}
      >
        <Form form={teamForm} onFinish={handleCreateTeam} layout="vertical">
          <Form.Item name="name" label="团队名称" rules={[{ required: true, message: '请输入团队名称' }]}>
            <Input placeholder="例如：前端组、后端组" />
          </Form.Item>
          <Form.Item name="description" label="团队描述">
            <Input.TextArea placeholder="请输入团队描述（可选）" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              创建团队
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加成员弹窗 */}
      <Modal
        title="添加团队成员"
        open={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={null}
      >
        <Form form={memberForm} onFinish={handleCreateMember} layout="vertical">
          <Form.Item name="name" label="成员姓名" rules={[{ required: true, message: '请输入成员姓名' }]}>
            <Input placeholder="请输入成员姓名" />
          </Form.Item>
          <Form.Item name="position" label="职位" rules={[{ required: true, message: '请输入职位' }]}>
            <Input placeholder="例如：前端工程师、产品经理" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              添加成员
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加小记弹窗 */}
      <Modal
        title={`为 ${selectedMember?.name || ''} 添加小记`}
        open={noteModalVisible}
        onCancel={() => {
          setNoteModalVisible(false);
          setSelectedMember(null);
        }}
        footer={null}
      >
        <Form form={noteForm} onFinish={handleCreateNote} layout="vertical">
          <Form.Item name="type" label="小记类型" rules={[{ required: true, message: '请选择类型' }]}>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d9d9d9' }}>
              <option value="strength">优点</option>
              <option value="weakness">缺点</option>
              <option value="critical">关键时刻</option>
              <option value="daily">日常表现</option>
            </select>
          </Form.Item>
          <Form.Item name="content" label="小记内容" rules={[{ required: true, message: '请输入小记内容' }]}>
            <Input.TextArea rows={4} placeholder="请详细描述..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              添加小记
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
