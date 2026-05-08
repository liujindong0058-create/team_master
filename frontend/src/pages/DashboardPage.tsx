import { useEffect, useState, useRef } from 'react';
import { Card, Avatar, Button, message, Modal, Form, Input, Tag, Progress } from 'antd';
import { RocketOutlined, PlusOutlined, TeamOutlined, FileTextOutlined, BarChartOutlined, LogoutOutlined, DeleteOutlined, UserAddOutlined, UserOutlined, SendOutlined, EditOutlined, StarOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, ArrowUpOutlined, WarningOutlined } from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { teamAPI, memberAPI, noteAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import type { Member } from '../types';

export default function DashboardPage() {
  const { user, teams, currentTeam, setTeams, setCurrentTeam, members, setMembers, notes, setNotes } = useAppStore();
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [showNewMember, setShowNewMember] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showAssessmentDetail, setShowAssessmentDetail] = useState(false);
  const [showFirstImpression, setShowFirstImpression] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('daily');
  const [activeTab, setActiveTab] = useState('notes');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [firstImpressionDataMap, setFirstImpressionDataMap] = useState<Record<string, {
    overall: string;
    description: string;
    strengths: string;
    development: string;
  }>>({});
  const [editMemberForm] = Form.useForm();
  const [firstImpressionForm] = Form.useForm();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const notesContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [user]);

  useEffect(() => {
    if (currentTeam && user) {
      loadTeamData();
    }
  }, [currentTeam, user]);

  useEffect(() => {
    if (selectedMember && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedMember]);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              setUploadedImages(prev => [...prev, result]);
              message.success('截图粘贴成功');
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const loadTeams = async () => {
    try {
      const teamsData = await teamAPI.getAll();
      setTeams(teamsData);
      if (teamsData.length > 0 && !currentTeam) {
        setCurrentTeam(teamsData[0]);
      }
    } catch (error) {
      console.error('加载团队失败:', error);
    }
  };

  const loadTeamData = async () => {
    if (!currentTeam) return;
    try {
      const memberData = await memberAPI.getByTeam(currentTeam.id);
      setMembers(memberData);

      const noteData = await noteAPI.getTimeline(currentTeam.id);
      setNotes(noteData);
    } catch (error) {
      console.error('加载团队数据失败:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleCreateTeam = async (values: { name: string; description?: string }) => {
    if (!values.name.trim()) {
      message.error('请输入团队名称');
      return;
    }
    try {
      await teamAPI.create(values.name, values.description);
      message.success('团队创建成功');
      setShowNewTeam(false);
      loadTeams();
    } catch (error) {
      message.error('创建团队失败，请重试');
      console.error('创建团队失败:', error);
    }
  };

  const handleAddMember = async (values: { name: string; position?: string }) => {
    if (!currentTeam) return;
    if (!values.name.trim()) {
      message.error('请输入成员姓名');
      return;
    }
    try {
      const isFirstMember = members.length === 0;
      await memberAPI.add(currentTeam.id, values.name, values.position);
      message.success('成员添加成功');
      setShowNewMember(false);
      await loadTeamData();
      if (isFirstMember) {
        const newMembers = members;
        if (newMembers.length > 0) {
          setSelectedMember(newMembers[newMembers.length - 1].id);
          setTimeout(() => {
            setShowFirstImpression(true);
          }, 500);
        }
      }
    } catch (error) {
      message.error('添加成员失败，请重试');
    }
  };

  const handleEditMember = async (values: { name: string; position?: string; strengths?: string; weaknesses?: string; tags?: string; futureDirection?: string }) => {
    if (!selectedMember) return;
    if (!values.name.trim()) {
      message.error('请输入成员姓名');
      return;
    }
    try {
      await memberAPI.update(selectedMember, values.name, values.position, values.strengths, values.weaknesses, values.tags, values.futureDirection);
      message.success('成员信息更新成功');
      setShowEditMember(false);
      loadTeamData();
    } catch (error) {
      message.error('更新成员失败');
    }
  };

  const handleAddNote = async () => {
    if (!selectedMember) {
      message.error('请先选择成员');
      return;
    }
    if (!noteContent.trim()) {
      message.error('请填写小记内容');
      return;
    }
    try {
      console.log('=== Adding note ===');
      console.log('Selected member:', selectedMember);
      console.log('Current team:', currentTeam);
      console.log('Note content:', noteContent);
      console.log('Note type:', noteType);
      
      const addedNote = await noteAPI.add(selectedMember, noteContent, noteType, 'private', uploadedImages);
      console.log('Added note response:', addedNote);
      
      const noteData = await noteAPI.getTimeline(currentTeam?.id || '');
      console.log('Loaded notes after add:', noteData.length);
      console.log('Note data sample:', noteData.slice(0, 2));
      setNotes(noteData);
      
      message.success('小记添加成功');
      setNoteContent('');
      setUploadedImages([]);
    } catch (error: any) {
      console.error('=== Add note error ===');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error:', error);
      message.error('添加小记失败: ' + (error.response?.data?.message || error.message || '未知错误'));
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteAPI.delete(noteId);
      message.success('小记已删除');
      loadTeamData();
    } catch (error) {
      message.error('删除小记失败');
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const getNoteTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      strength: '优点',
      weakness: '待改进',
      critical: '关键时刻',
      daily: '日常表现'
    };
    return types[type] || type;
  };

  const getNoteTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string; color: string; border: string; icon: typeof CheckCircleOutlined }> = {
      strength: { bg: '#dcfce7', color: '#16a34a', border: '#86efac', icon: CheckCircleOutlined },
      weakness: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', icon: CloseCircleOutlined },
      critical: { bg: '#fef3c7', color: '#d97706', border: '#fcd34d', icon: ClockCircleOutlined },
      daily: { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd', icon: InfoCircleOutlined }
    };
    return styles[type] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', icon: InfoCircleOutlined };
  };

  const selectedMemberData = members.find(m => m.id === selectedMember);
  const memberNotes = notes.filter(n => n.memberId === selectedMember);

  const getAbilityScore = (member: Member) => {
    const memberNotesData = notes.filter(n => n.memberId === member.id);
    if (memberNotesData.length === 0) return 50;
    
    let score = 50;
    memberNotesData.forEach(note => {
      if (note.type === 'strength') score += 5;
      if (note.type === 'weakness') score -= 3;
      if (note.type === 'critical') score += 10;
    });
    
    return Math.min(100, Math.max(0, score));
  };

  const getGrowthPotential = (member: Member) => {
    const memberNotesData = notes.filter(n => n.memberId === member.id);
    if (memberNotesData.length === 0) return 50;
    
    const recentNotes = memberNotesData.slice(0, 10);
    const strengthRatio = recentNotes.filter(n => n.type === 'strength').length / recentNotes.length;
    return Math.round(strengthRatio * 100);
  };

  const getQuadrantPosition = (member: Member) => {
    return {
      x: getAbilityScore(member),
      y: getGrowthPotential(member)
    };
  };

  const getQuadrantLabel = (member: Member) => {
    const ability = getAbilityScore(member);
    const growth = getGrowthPotential(member);
    
    if (ability >= 70 && growth >= 70) return { label: '核心骨干', color: '#2563eb' };
    if (ability < 70 && growth >= 70) return { label: '明星潜力', color: '#16a34a' };
    if (ability >= 70 && growth < 70) return { label: '稳定贡献者', color: '#d97706' };
    return { label: '待培养', color: '#dc2626' };
  };

  const generateTagsFromNotes = (member: Member) => {
    const memberNotesData = notes.filter(n => n.memberId === member.id);
    const keywords: Record<string, number> = {};
    
    memberNotesData.forEach(note => {
      const words = note.content.toLowerCase().split(/[\s,.，。！!]+/);
      words.forEach(word => {
        if (word.length >= 2) {
          keywords[word] = (keywords[word] || 0) + 1;
        }
      });
    });
    
    return Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: '#fff', padding: '14px 28px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>
              <RocketOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 'bold', color: '#1e293b' }}>团队陪跑大师</h1>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>让团队管理更科学、更有趣</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ padding: '8px 16px', background: '#e0e7ff', borderRadius: 10 }}>
              <span style={{ color: '#4338ca', fontWeight: 'bold', fontSize: 14 }}>{user.name}</span>
            </div>
            <Avatar style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)' }} icon={<UserOutlined />} />
            <Button icon={<LogoutOutlined />} onClick={handleLogout} danger size="small" style={{ borderRadius: 8 }}>退出</Button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 80px)', padding: 16, gap: 16 }}>
        <div style={{ width: 270, flexShrink: 0 }}>
          <Card 
            style={{ 
              borderRadius: 16, 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              background: '#fff'
            }}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setShowNewTeam(true)}
              style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                border: 'none', 
                height: 44,
                borderRadius: 12,
                fontWeight: 'bold',
                fontSize: 15,
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                color: '#fff'
              }}
            >
              创建新团队
            </Button>
          </Card>

          <Card 
            title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TeamOutlined style={{ color: '#6366f1', fontSize: 18 }} /><span style={{ fontWeight: 'bold', color: '#1e293b' }}>我的团队</span></div>} 
            style={{ 
              borderRadius: 16, 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              marginTop: 16,
              background: '#fff'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {teams.length > 0 ? teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => { setCurrentTeam(team); setSelectedMember(''); }}
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: 'none',
                    background: currentTeam?.id === team.id ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#f8fafc',
                    color: currentTeam?.id === team.id ? '#fff' : '#374151',
                    cursor: 'pointer',
                    fontSize: 14,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: currentTeam?.id === team.id ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none'
                  }}
                >
                  <div style={{ width: 34, height: 34, background: currentTeam?.id === team.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TeamOutlined style={{ fontSize: 16 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: 14 }}>{team.name}</p>
                    <p style={{ margin: 1, fontSize: 11, opacity: 0.7 }}>{team.description || '暂无描述'}</p>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: currentTeam?.id === team.id ? '#fff' : '#cbd5e1' }} />
                </button>
              )) : (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <TeamOutlined style={{ fontSize: 32, color: '#cbd5e1', marginBottom: 8 }} />
                  <p style={{ color: '#94a3b8', fontSize: 13 }}>暂无团队</p>
                  <Button 
                    icon={<PlusOutlined />} 
                    onClick={() => setShowNewTeam(true)} 
                    size="small" 
                    style={{ marginTop: 8, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', color: '#fff' }}
                  >
                    创建团队
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div style={{ width: 300, flexShrink: 0, background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              {currentTeam?.name || '团队成员'}
              <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 'normal' }}>({members.length})</span>
            </h3>
            <Button 
              icon={<UserAddOutlined />} 
              onClick={() => setShowNewMember(true)} 
              size="small" 
              style={{ 
                background: '#10b981', 
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
            >
              添加
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 'calc(100% - 50px)', overflowY: 'auto' }}>
            {members.length > 0 ? members.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                style={{
                  borderRadius: 14,
                  border: selectedMember === member.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  background: selectedMember === member.id ? '#f0f5ff' : '#fff',
                  padding: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedMember === member.id ? '0 4px 15px rgba(99, 102, 241, 0.2)' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar size={48} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)' }} icon={<UserOutlined />} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: 15, color: '#1e293b' }}>{member.name}</p>
                    <p style={{ margin: 2, color: '#64748b', fontSize: 12 }}>{member.position || '团队成员'}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <UserOutlined style={{ fontSize: 32, color: '#94a3b8' }} />
                </div>
                <p style={{ color: '#64748b', fontSize: 14 }}>暂无团队成员</p>
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={() => setShowNewMember(true)} 
                  size="small" 
                  style={{ marginTop: 8, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', color: '#fff' }}
                >
                  添加成员
                </Button>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, background: '#fff', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          {selectedMemberData ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar size={72} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }} icon={<UserOutlined />} />
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, background: '#10b981', borderRadius: '50%', border: '3px solid #fff' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#1e293b' }}>{selectedMemberData.name}</h2>
                  <p style={{ margin: 4, color: '#64748b', fontSize: 14 }}>{selectedMemberData.position || '团队成员'}</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                  <Button 
                    icon={<EditOutlined />} 
                    size="small" 
                    style={{ borderRadius: 10, border: '1px solid #e2e8f0', color: '#475569' }}
                    onClick={() => {
                      editMemberForm.setFieldsValue({
                        name: selectedMemberData.name,
                        position: selectedMemberData.position,
                        strengths: selectedMemberData.strengths,
                        weaknesses: selectedMemberData.weaknesses,
                        tags: selectedMemberData.tags,
                        futureDirection: selectedMemberData.futureDirection
                      });
                      setShowEditMember(true);
                    }}
                  >
                    编辑资料
                  </Button>
                  <Button 
                    icon={<DeleteOutlined />} 
                    danger 
                    size="small" 
                    onClick={() => { setMemberToDelete(selectedMemberData.id); setShowDeleteConfirm(true); }}
                    style={{ borderRadius: 10 }}
                  >
                    删除成员
                  </Button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, backgroundColor: '#f8fafc', padding: 6, borderRadius: 14 }}>
                {['notes', 'summary', 'analysis'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 12,
                      border: 'none',
                      background: activeTab === tab ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                      color: activeTab === tab ? '#fff' : '#475569',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: 14,
                      transition: 'all 0.2s ease',
                      boxShadow: activeTab === tab ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                      minWidth: 140
                    }}
                  >
                    {tab === 'notes' && <><FileTextOutlined style={{ marginRight: 6 }} />小记</>}
                    {tab === 'summary' && <><ClockCircleOutlined style={{ marginRight: 6 }} />阶段评估</>}
                    {tab === 'analysis' && <><BarChartOutlined style={{ marginRight: 6 }} />能力分析</>}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f0f5ff', borderRadius: 12, borderLeft: '4px solid #6366f1' }}>
                {activeTab === 'notes' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <h4 style={{ margin: 0, fontWeight: 'bold', color: '#4338ca', marginBottom: 4 }}>📝 小记 - 日常记录</h4>
                      {selectedMember && !firstImpressionDataMap[selectedMember] && (
                        <div style={{ padding: '4px 12px', background: '#fef3c7', borderRadius: 20 }}>
                          <span style={{ color: '#92400e', fontSize: 12, fontWeight: 'bold' }}>💡 建议先记录初印象</span>
                        </div>
                      )}
                    </div>
                    <p style={{ margin: 0, color: '#6366f1', fontSize: 13 }}>应用场景：日常工作中随时记录团队成员的表现、优点、待改进项，支持直接截图聊天记录粘贴，为绩效评估提供数据支撑</p>
                  </>
                )}
                {activeTab === 'summary' && (
                  <>
                    <h4 style={{ margin: 0, fontWeight: 'bold', color: '#4338ca', marginBottom: 4 }}>📊 阶段评估 - 定期评估</h4>
                    <p style={{ margin: 0, color: '#6366f1', fontSize: 13 }}>应用场景：每周/每月/每季度对成员进行阶段性绩效评估，汇总小记数据，生成综合评价报告</p>
                  </>
                )}
                {activeTab === 'analysis' && (
                  <>
                    <h4 style={{ margin: 0, fontWeight: 'bold', color: '#4338ca', marginBottom: 4 }}>🎯 能力分析 - 深度洞察</h4>
                    <p style={{ margin: 0, color: '#6366f1', fontSize: 13 }}>应用场景：基于历史小记数据，分析成员的综合能力、成长潜力、能力象限定位，辅助人才发展决策</p>
                  </>
                )}
              </div>

              {activeTab === 'notes' && (
                <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 500 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                    <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileTextOutlined style={{ color: '#6366f1' }} /> 小记列表
                        <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 'normal' }}>（{memberNotes.length}条）</span>
                      </h4>
                      {selectedMember && (
                        <Button 
                          onClick={() => setShowFirstImpression(true)}
                          style={{ 
                            background: firstImpressionDataMap[selectedMember] ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            border: 'none',
                            borderRadius: 10,
                            padding: '8px 20px',
                            fontWeight: 'bold',
                            color: '#fff',
                            fontSize: 13,
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                          }}
                        >
                          {firstImpressionDataMap[selectedMember] ? '✓ 查看初印象' : '★ 记录初印象'}
                        </Button>
                      )}
                    </div>
                    <div ref={notesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: 20, maxHeight: 600 }}>
                    {memberNotes.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {memberNotes.map((note) => {
                          const style = getNoteTypeStyle(note.type);
                          const IconComponent = style.icon;
                          return (
                            <Card 
                              key={note.id} 
                              style={{ 
                                borderRadius: 14, 
                                border: '1px solid #e2e8f0', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                <Avatar size={44} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }} icon={<UserOutlined />} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <span style={{ fontWeight: 'bold', fontSize: 15, color: '#1e293b' }}>{user.name}</span>
                                    <span style={{ padding: '4px 12px', borderRadius: 20, background: style.bg, color: style.color, fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <IconComponent style={{ fontSize: 14 }} />
                                      {getNoteTypeLabel(note.type)}
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(note.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    <div style={{ flex: 1 }}>
                                      <p style={{ margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{note.content}</p>
                                    </div>
                                    {note.images && note.images.length > 0 && (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {note.images.map((img, index) => (
                                          <img 
                                            key={index} 
                                            src={img} 
                                            alt={`截图${index + 1}`} 
                                            style={{ 
                                              width: 120, 
                                              height: 90, 
                                              objectFit: 'cover', 
                                              borderRadius: 8, 
                                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                                            }} 
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  icon={<DeleteOutlined />} 
                                  danger 
                                  size="small" 
                                  onClick={() => handleDeleteNote(note.id)}
                                  style={{ borderRadius: 8 }}
                                />
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 48 }}>
                        <div style={{ width: 80, height: 80, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                          <FileTextOutlined style={{ fontSize: 40, color: '#94a3b8' }} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 }}>暂无小记记录</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>开始记录 {selectedMemberData.name} 的表现吧</p>
                      </div>
                    )}
                  </div>
                  </div>
              
              <div style={{ width: 420, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <h4 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <EditOutlined style={{ color: '#10b981' }} /> 快速记录
                  </h4>
                </div>
                <div style={{ padding: 20, flex: 1 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {['strength', 'weakness', 'critical', 'daily'].map((type) => {
                      const style = getNoteTypeStyle(type);
                      const IconComponent = style.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => setNoteType(type)}
                          style={{
                            padding: '10px 20px',
                            borderRadius: 12,
                            border: `2px solid ${noteType === type ? style.border : '#e2e8f0'}`,
                            background: noteType === type ? style.bg : '#fff',
                            color: noteType === type ? style.color : '#475569',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <IconComponent style={{ fontSize: 16 }} />
                          {getNoteTypeLabel(type)}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {uploadedImages.length > 0 && (
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {uploadedImages.map((img, index) => (
                          <div key={index} style={{ position: 'relative' }}>
                            <img src={img} alt="" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                            <button 
                              onClick={() => removeImage(index)} 
                              style={{ 
                                position: 'absolute', 
                                top: -8, 
                                right: -8, 
                                width: 28, 
                                height: 28, 
                                background: '#ef4444', 
                                borderRadius: '50%', 
                                border: '2px solid #fff',
                                color: '#fff', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: 18,
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea
                      ref={inputRef}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="记录成员的表现、优点、待改进项... (支持Ctrl+V粘贴截图)"
                      rows={6}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: '2px solid #e2e8f0',
                        resize: 'none',
                        fontSize: 15,
                        background: '#fff',
                        color: '#1e293b',
                        fontFamily: 'inherit',
                        minHeight: 150
                      }}
                    />
                    <div style={{ padding: 14, borderRadius: 12, border: '2px dashed #cbd5e1', background: '#f8fafc', textAlign: 'center' }}>
                      <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                        💡 提示：直接使用 <span style={{ fontWeight: 'bold', color: '#6366f1' }}>Ctrl+V</span> 粘贴截图聊天记录
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleAddNote}
                      disabled={!noteContent.trim()}
                      style={{
                        background: noteContent.trim() ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#cbd5e1',
                        border: 'none',
                        height: 46,
                        borderRadius: 12,
                        fontWeight: 'bold',
                        fontSize: 15,
                        color: '#fff',
                        boxShadow: noteContent.trim() ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                      }}
                    >
                      发送
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

              {activeTab === 'summary' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>📊 评估历史记录</h4>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setShowAssessmentModal(true)}
                      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 'bold', color: '#fff' }}
                    >
                      创建评估
                    </Button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
                    <div 
                      style={{ padding: 16, background: '#f8fafc', borderRadius: 12, borderLeft: '4px solid #10b981', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setShowAssessmentDetail(true)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>2026年4月评估</span>
                        <span style={{ padding: '4px 12px', background: '#dcfce7', color: '#16a34a', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>优秀</span>
                      </div>
                      <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>综合评分：85分</p>
                      <p style={{ margin: 4, color: '#475569', fontSize: 13 }}>核心评价：本季度表现出色，带领团队完成多个关键项目...</p>
                      <p style={{ margin: 8, color: '#6366f1', fontSize: 12, fontWeight: 'bold' }}>点击查看详情 →</p>
                    </div>
                    <div 
                      style={{ padding: 16, background: '#f8fafc', borderRadius: 12, borderLeft: '4px solid #2563eb', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setShowAssessmentDetail(true)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>2026年3月评估</span>
                        <span style={{ padding: '4px 12px', background: '#dbeafe', color: '#2563eb', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>良好</span>
                      </div>
                      <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>综合评分：78分</p>
                      <p style={{ margin: 4, color: '#475569', fontSize: 13 }}>核心评价：工作态度积极，技术能力稳步提升...</p>
                      <p style={{ margin: 8, color: '#6366f1', fontSize: 12, fontWeight: 'bold' }}>点击查看详情 →</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, background: '#dcfce7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ArrowUpOutlined style={{ fontSize: 24, color: '#16a34a' }} />
                        </div>
                        <div>
                          <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>综合能力</p>
                          <p style={{ margin: 0, fontSize: 28, fontWeight: 'bold', color: '#16a34a' }}>{getAbilityScore(selectedMemberData)}%</p>
                        </div>
                      </div>
                      <Progress percent={getAbilityScore(selectedMemberData)} strokeColor="#16a34a" size="small" showInfo={false} style={{ marginTop: 12 }} />
                    </Card>

                    <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, background: '#dbeafe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <StarOutlined style={{ fontSize: 24, color: '#2563eb' }} />
                        </div>
                        <div>
                          <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>成长潜力</p>
                          <p style={{ margin: 0, fontSize: 28, fontWeight: 'bold', color: '#2563eb' }}>{getGrowthPotential(selectedMemberData)}%</p>
                        </div>
                      </div>
                      <Progress percent={getGrowthPotential(selectedMemberData)} strokeColor="#2563eb" size="small" showInfo={false} style={{ marginTop: 12 }} />
                    </Card>

                    <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, background: '#fef3c7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <StarOutlined style={{ fontSize: 24, color: '#d97706' }} />
                        </div>
                        <div>
                          <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>评估定位</p>
                          <p style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: getQuadrantLabel(selectedMemberData).color }}>
                            {getQuadrantLabel(selectedMemberData).label}
                          </p>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, padding: 8, background: `${getQuadrantLabel(selectedMemberData).color}15`, borderRadius: 8 }}>
                        <p style={{ margin: 0, fontSize: 11, color: getQuadrantLabel(selectedMemberData).color }}>
                          {getQuadrantLabel(selectedMemberData).label === '核心骨干' && '高能力+高潜力，团队核心力量'}
                          {getQuadrantLabel(selectedMemberData).label === '明星潜力' && '高潜力待培养，未来之星'}
                          {getQuadrantLabel(selectedMemberData).label === '稳定贡献者' && '能力稳定，持续贡献'}
                          {getQuadrantLabel(selectedMemberData).label === '待培养' && '需要更多关注和指导'}
                        </p>
                      </div>
                    </Card>
                  </div>

                  <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h4 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 }}>📊 能力象限分析</h4>
                    <div style={{ position: 'relative', width: '100%', height: 200, background: '#f8fafc', borderRadius: 12, overflow: 'hidden' }}>
                      <svg width="100%" height="100%">
                        <rect x="0" y="0" width="50%" height="50%" fill="#dcfce730" />
                        <rect x="50%" y="0" width="50%" height="50%" fill="#dbeafe30" />
                        <rect x="0" y="50%" width="50%" height="50%" fill="#fef3c730" />
                        <rect x="50%" y="50%" width="50%" height="50%" fill="#fee2e230" />
                        
                        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#e2e8f0" strokeWidth="2" />
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeWidth="2" />
                        
                        <text x="25%" y="25" textAnchor="middle" fill="#16a34a" fontSize="12" fontWeight="bold">明星潜力</text>
                        <text x="75%" y="25" textAnchor="middle" fill="#2563eb" fontSize="12" fontWeight="bold">核心骨干</text>
                        <text x="25%" y="180" textAnchor="middle" fill="#d97706" fontSize="12" fontWeight="bold">待培养</text>
                        <text x="75%" y="180" textAnchor="middle" fill="#dc2626" fontSize="12" fontWeight="bold">待优化</text>
                        
                        <text x="52%" y="48%" textAnchor="start" fill="#64748b" fontSize="11">当前能力</text>
                        <text x="2%" y="52%" textAnchor="start" fill="#64748b" fontSize="11" transform="rotate(-90, 20, 100)">成长潜力</text>
                        
                        {(() => {
                          const quadrant = getQuadrantPosition(selectedMemberData);
                          return (
                            <>
                              <circle cx={`${quadrant.x}%`} cy={`${100 - quadrant.y}%`} r="14" fill="#6366f1" opacity="0.9">
                                <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
                              </circle>
                              <circle cx={`${quadrant.x}%`} cy={`${100 - quadrant.y}%`} r="6" fill="#fff" />
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </Card>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <h4 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 }}>💪 能力亮点</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {memberNotes.filter(n => n.type === 'strength').length > 0 ? (
                          memberNotes.filter(n => n.type === 'strength').slice(0, 3).map((note, index) => (
                            <div key={index} style={{ padding: 10, background: '#dcfce7', borderRadius: 8, borderLeft: '3px solid #16a34a' }}>
                              <p style={{ margin: 0, color: '#166534', fontSize: 13 }}>{note.content}</p>
                            </div>
                          ))
                        ) : (
                          <p style={{ color: '#94a3b8', fontSize: 13 }}>暂无记录，通过小记记录优点</p>
                        )}
                      </div>
                    </Card>

                    <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <h4 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 }}>⚠️ 待改进项</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {memberNotes.filter(n => n.type === 'weakness').length > 0 ? (
                          memberNotes.filter(n => n.type === 'weakness').slice(0, 3).map((note, index) => (
                            <div key={index} style={{ padding: 10, background: '#fee2e2', borderRadius: 8, borderLeft: '3px solid #dc2626' }}>
                              <p style={{ margin: 0, color: '#991b1b', fontSize: 13 }}>{note.content}</p>
                            </div>
                          ))
                        ) : (
                          <p style={{ color: '#94a3b8', fontSize: 13 }}>暂无记录，通过小记记录待改进项</p>
                        )}
                      </div>
                    </Card>
                  </div>

                  <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h4 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 }}>🏷️ 行为标签</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {generateTagsFromNotes(selectedMemberData).length > 0 ? (
                        generateTagsFromNotes(selectedMemberData).map((tag, index) => (
                          <Tag key={index} color="purple" style={{ background: '#e9d5ff', border: "1px solid #a855f7", color: '#7c3aed' }}>
                            {tag}
                          </Tag>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>暂无标签（根据小记内容自动生成）</span>
                      )}
                    </div>
                  </Card>

                  <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, background: '#fef3c7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <StarOutlined style={{ fontSize: 20, color: '#d97706' }} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>💫 初印象记录</h4>
                          <p style={{ margin: 2, color: '#64748b', fontSize: 12 }}>成员加入时的第一印象</p>
                        </div>
                      </div>
                      <Button 
                        icon={<EditOutlined />} 
                        size="small" 
                        onClick={() => setShowFirstImpression(true)}
                        style={{ borderRadius: 8, border: '1px solid #e2e8f0', color: '#475569' }}
                      >
                        查看/编辑
                      </Button>
                    </div>
                    <div style={{ marginTop: 12, padding: 12, background: '#fef3c7', borderRadius: 10 }}>
                      <p style={{ margin: 0, color: '#92400e', fontSize: 13, fontStyle: 'italic' }}>
                        "第一印象是了解成员的起点，记录下来有助于后续对比观察成长变化。"
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 140, height: 140, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <UserOutlined style={{ fontSize: 72, color: '#94a3b8' }} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 }}>选择团队成员</h2>
                <p style={{ color: '#64748b', fontSize: 15, maxWidth: 300, margin: '0 auto' }}>从左侧成员列表中选择一位成员，查看详情并快速记录行为</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PlusOutlined style={{ color: '#6366f1' }} /><span style={{ fontWeight: 'bold' }}>创建新团队</span></div>}
        open={showNewTeam}
        onCancel={() => setShowNewTeam(false)}
        footer={null}
        centered
      >
        <Form onFinish={handleCreateTeam} layout="vertical">
          <Form.Item name="name" label="团队名称" rules={[{ required: true, message: '请输入团队名称' }]}>
            <Input placeholder="例如：前端开发组" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </Form.Item>
          <Form.Item name="description" label="团队描述">
            <Input.TextArea rows={3} placeholder="请简要描述团队..." style={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: 10, height: 44, color: '#fff', fontWeight: 'bold' }}>
              创建团队
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><UserAddOutlined style={{ color: '#10b981' }} /><span style={{ fontWeight: 'bold' }}>添加团队成员</span></div>}
        open={showNewMember}
        onCancel={() => setShowNewMember(false)}
        footer={null}
        centered
      >
        <Form onFinish={handleAddMember} layout="vertical">
          <Form.Item name="name" label="成员姓名" rules={[{ required: true, message: '请输入成员姓名' }]}>
            <Input placeholder="请输入成员姓名" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </Form.Item>
          <Form.Item name="position" label="职位">
            <Input placeholder="例如：高级工程师" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', background: '#10b981', border: 'none', borderRadius: 10, height: 44, color: '#fff', fontWeight: 'bold' }}>
              添加成员
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><EditOutlined style={{ color: '#6366f1' }} /><span style={{ fontWeight: 'bold' }}>编辑成员资料</span></div>}
        open={showEditMember}
        onCancel={() => setShowEditMember(false)}
        footer={null}
        centered
      >
        <Form form={editMemberForm} onFinish={handleEditMember} layout="vertical">
          <Form.Item name="name" label="成员姓名" rules={[{ required: true, message: '请输入成员姓名' }]}>
            <Input placeholder="请输入成员姓名" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </Form.Item>
          <Form.Item name="position" label="职位">
            <Input placeholder="例如：高级工程师" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: 10, height: 44, color: '#fff', fontWeight: 'bold' }}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PlusOutlined style={{ color: '#6366f1' }} /><span style={{ fontWeight: 'bold' }}>创建阶段评估</span></div>}
        open={showAssessmentModal}
        onCancel={() => setShowAssessmentModal(false)}
        footer={null}
        centered
        width={600}
      >
        <Form layout="vertical">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: '#64748b', fontSize: 13 }}>评估周期</span>
            <select style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569' }}>
              <option>本周</option>
              <option>本月</option>
              <option>本季度</option>
              <option>自定义</option>
            </select>
          </div>
          <Form.Item label="综合评分">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="75"
                  style={{ width: '100%', height: 8, borderRadius: 4, background: '#e2e8f0', appearance: 'none' }}
                />
              </div>
              <span style={{ fontSize: 24, fontWeight: 'bold', color: '#6366f1' }}>75</span>
            </div>
          </Form.Item>
          <Form.Item label="核心评价">
            <textarea 
              rows={3} 
              placeholder="请输入本阶段的核心评价，包括成员的整体表现、主要贡献和成长情况..." 
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', resize: 'none' }}
            />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <Form.Item label="亮点与成就">
              <textarea 
                rows={2} 
                placeholder="列举本阶段的主要亮点和成就，如完成的重要项目、解决的关键问题..." 
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', resize: 'none' }}
              />
            </Form.Item>
            <Form.Item label="待改进项">
              <textarea 
                rows={2} 
                placeholder="列出需要改进的方面和建议，如技能提升方向、工作方法优化..." 
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', resize: 'none' }}
              />
            </Form.Item>
          </div>
          <Form.Item>
            <Button 
              type="primary" 
              style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: 12, height: 44, fontWeight: 'bold', color: '#fff' }}
              onClick={() => { setShowAssessmentModal(false); message.success('评估创建成功'); }}
            >
              提交评估
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><StarOutlined style={{ color: '#d97706' }} /><span style={{ fontWeight: 'bold' }}>评估详情</span></div>}
        open={showAssessmentDetail}
        onCancel={() => setShowAssessmentDetail(false)}
        footer={null}
        centered
        width={500}
      >
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>2026年4月评估</h3>
              <p style={{ margin: 4, color: '#64748b', fontSize: 13 }}>评估周期：2026年4月1日 - 2026年4月30日</p>
            </div>
            <span style={{ padding: '6px 16px', background: '#dcfce7', color: '#16a34a', borderRadius: 20, fontSize: 14, fontWeight: 'bold' }}>优秀</span>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, background: '#fef3c7', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 32, fontWeight: 'bold', color: '#d97706' }}>85</span>
              </div>
              <div>
                <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>综合评分</p>
                <p style={{ margin: 2, color: '#1e293b', fontSize: 16, fontWeight: 'bold' }}>85/100</p>
              </div>
            </div>
            <Progress percent={85} strokeColor="#d97706" size="small" showInfo={false} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 }}>核心评价</h4>
            <p style={{ margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
              本季度表现出色，带领团队完成多个关键项目，展现了出色的领导能力和技术实力。在项目管理、团队协调和技术攻坚方面都有突出表现。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div style={{ padding: 12, background: '#dcfce7', borderRadius: 12 }}>
              <h4 style={{ margin: 0, fontWeight: 'bold', color: '#166534', fontSize: 13, marginBottom: 8 }}>✨ 亮点与成就</h4>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li style={{ color: '#166534', fontSize: 13, marginBottom: 4 }}>成功交付XX项目，提前完成任务</li>
                <li style={{ color: '#166534', fontSize: 13 }}>主导技术架构优化，性能提升30%</li>
              </ul>
            </div>
            <div style={{ padding: 12, background: '#fee2e2', borderRadius: 12 }}>
              <h4 style={{ margin: 0, fontWeight: 'bold', color: '#991b1b', fontSize: 13, marginBottom: 8 }}>📝 待改进项</h4>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li style={{ color: '#991b1b', fontSize: 13, marginBottom: 4 }}>跨部门沟通可进一步加强</li>
                <li style={{ color: '#991b1b', fontSize: 13 }}>文档输出需更加规范</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><StarOutlined style={{ color: '#6366f1' }} /><span style={{ fontWeight: 'bold' }}>记录初印象</span></div>}
        open={showFirstImpression}
        onCancel={() => { setShowFirstImpression(false); firstImpressionForm.resetFields(); }}
        footer={null}
        centered
        width={500}
        afterOpenChange={(open) => {
          if (open && selectedMember) {
            firstImpressionForm.setFieldsValue(firstImpressionDataMap[selectedMember] || {});
          }
        }}
      >
        <div style={{ padding: 16, background: '#f0f5ff', borderRadius: 12, marginBottom: 20, borderLeft: '4px solid #6366f1' }}>
          <p style={{ margin: 0, color: '#4338ca', fontSize: 14, lineHeight: 1.6 }}>
            💡 <strong>欢迎新成员！</strong>请记录您对{selectedMemberData?.name}的第一印象，这将帮助您更好地了解和培养这位新伙伴。
          </p>
        </div>
        <Form form={firstImpressionForm} layout="vertical">
          <Form.Item name="overall" label="整体印象">
            <div style={{ display: 'flex', gap: 8 }}>
              {['非常好', '好', '一般', '需观察'].map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => firstImpressionForm.setFieldValue('overall', option)}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    borderRadius: 10,
                    border: `2px solid ${firstImpressionForm.getFieldValue('overall') === option ? '#6366f1' : '#e2e8f0'}`,
                    background: firstImpressionForm.getFieldValue('overall') === option ? '#e0e7ff' : '#fff',
                    color: firstImpressionForm.getFieldValue('overall') === option ? '#4338ca' : '#475569',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {['🌟', '😊', '🤔', '💡'][index]} {option}
                </button>
              ))}
            </div>
          </Form.Item>
          <Form.Item name="description" label="第一印象描述">
            <textarea 
              rows={3} 
              placeholder="请描述您对这位新成员的第一印象，包括外貌、言谈举止、专业背景等方面的初步感受..." 
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', resize: 'none' }}
            />
          </Form.Item>
          <Form.Item name="strengths" label="预期优势领域">
            <textarea 
              rows={2} 
              placeholder="根据初步了解，您认为这位成员可能在哪些领域有优势？如技术能力、沟通能力、团队协作等..." 
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', resize: 'none' }}
            />
          </Form.Item>
          <Form.Item name="development" label="潜在发展方向">
            <textarea 
              rows={2} 
              placeholder="您对这位成员未来的发展有什么期待或建议？希望他在哪些方面成长？" 
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', resize: 'none' }}
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: 12, height: 44, fontWeight: 'bold', color: '#fff' }}
              onClick={async () => { 
                const values = firstImpressionForm.getFieldsValue();
                const hasExisting = !!firstImpressionDataMap[selectedMember];
                
                setFirstImpressionDataMap(prev => ({
                  ...prev,
                  [selectedMember]: values
                }));
                
                if (!hasExisting && selectedMember && currentTeam) {
                  const impressionNote = `【初印象】整体印象：${values.overall || '未评价'}\n描述：${values.description || '无'}\n预期优势：${values.strengths || '无'}\n发展方向：${values.development || '无'}`;
                  await noteAPI.add(selectedMember, impressionNote, 'daily', 'private');
                  const noteData = await noteAPI.getTimeline(currentTeam.id);
                  setNotes(noteData);
                }
                
                setShowFirstImpression(false); 
                firstImpressionForm.resetFields();
                message.success(hasExisting ? '初印象更新成功' : '初印象记录成功，已自动生成小记'); 
              }}
            >
              {firstImpressionDataMap[selectedMember] ? '保存修改' : '保存初印象'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><DeleteOutlined style={{ color: '#ef4444' }} /><span style={{ fontWeight: 'bold' }}>确认删除</span></div>}
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        footer={null}
        centered
      >
        <div style={{ padding: 20 }}>
          <div style={{ width: 64, height: 64, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <WarningOutlined style={{ fontSize: 32, color: '#ef4444' }} />
          </div>
          <h3 style={{ margin: 0, textAlign: 'center', fontWeight: 'bold', color: '#1e293b', marginBottom: 12, fontSize: 18 }}>确认删除成员？</h3>
          <p style={{ margin: 0, textAlign: 'center', color: '#64748b', fontSize: 14 }}>删除后将无法恢复该成员的所有数据，包括小记、评估记录等。</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Button 
              onClick={() => setShowDeleteConfirm(false)}
              style={{ flex: 1, height: 44, borderRadius: 12, border: '2px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 'bold' }}
            >
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (memberToDelete && currentTeam) {
                  await memberAPI.delete(memberToDelete);
                  const memberData = await memberAPI.getByTeam(currentTeam.id);
                  setMembers(memberData);
                  if (selectedMember === memberToDelete) {
                    setSelectedMember('');
                  }
                  message.success('成员删除成功');
                }
                setShowDeleteConfirm(false);
                setMemberToDelete('');
              }}
              danger
              style={{ flex: 1, height: 44, borderRadius: 12, background: '#ef4444', border: 'none', color: '#fff', fontWeight: 'bold' }}
            >
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}