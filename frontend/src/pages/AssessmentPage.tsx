import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Select, Rate, Avatar } from 'antd';
import { BarChartOutlined, PlusOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { assessmentAPI, memberAPI } from '../services/api';
import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';
import type { Assessment } from '../types';

const dimensions = [
  { key: 'professional', label: '专业能力', desc: '技术水平、业务理解、问题解决', color: '#667eea' },
  { key: 'collaboration', label: '协作能力', desc: '沟通表达、团队合作、跨部门协作', color: '#52c41a' },
  { key: 'attitude', label: '工作态度', desc: '责任心、主动性、抗压能力', color: '#faad14' },
  { key: 'growth', label: '成长潜力', desc: '学习能力、发展意愿、晋升潜力', color: '#ff4d4f' },
  { key: 'contribution', label: '业务贡献', desc: '交付效率、质量意识、创新能力', color: '#1890ff' },
];

export default function AssessmentPage() {
  const { currentTeam, members, setMembers } = useAppStore();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentTeam) {
      loadMembers();
    }
  }, [currentTeam]);

  useEffect(() => {
    if (selectedMember) {
      loadAssessments();
      form.resetFields();
    }
  }, [selectedMember, form]);

  const loadMembers = async () => {
    try {
      const membersData = await memberAPI.getByTeam(currentTeam!.id);
      setMembers(membersData);
    } catch (error) {
      message.error('加载成员失败');
    }
  };

  const loadAssessments = async () => {
    try {
      const assessmentsData = await assessmentAPI.getByMember(selectedMember);
      setAssessments(assessmentsData);
    } catch (error) {
      message.error('加载评估记录失败');
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!selectedMember) {
      message.error('请先选择成员');
      return;
    }
    try {
      const dimensionsData: Assessment['dimensions'] = {
        professional: (values.professional as number) || 3,
        collaboration: (values.collaboration as number) || 3,
        attitude: (values.attitude as number) || 3,
        growth: (values.growth as number) || 3,
        contribution: (values.contribution as number) || 3,
      };
      const comment = values.comment as string | undefined;
      await assessmentAPI.create(selectedMember, dimensionsData, comment);
      message.success('评估创建成功');
      form.resetFields();
      loadAssessments();
    } catch (error) {
      message.error('创建评估失败');
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || '未知';
  };

  const getAverageScore = (dimensions: Assessment['dimensions']) => {
    const values = Object.values(dimensions);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #cffafe 100%)' }}>
      <div style={{ background: '#fff', padding: '16px 32px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} ghost>返回首页</Button>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
              <BarChartOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 'bold', color: '#1e293b' }}>多维度评估</h1>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>从五个维度客观评估团队成员</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 }}>创建新评估</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Select
                style={{ width: 280 }}
                placeholder="选择评估成员"
                value={selectedMember}
                onChange={setSelectedMember}
                size="large"
              >
                {members.map((member) => (
                  <Select.Option key={member.id} value={member.id}>
                    {member.name}
                  </Select.Option>
                ))}
              </Select>
              {selectedMember && (
                <div style={{ padding: '10px 20px', background: '#e0e7ff', borderRadius: 10 }}>
                  <span style={{ color: '#4338ca', fontWeight: 'bold', fontSize: 14 }}>正在评估: {getMemberName(selectedMember)}</span>
                </div>
              )}
            </div>
          </div>

          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {dimensions.map((dim) => (
                <div key={dim.key} style={{ background: '#fafafa', padding: 20, borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dim.color }} />
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{dim.label}</span>
                  </div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: 13, marginBottom: 12 }}>{dim.desc}</p>
                  <Form.Item name={dim.key} rules={[{ required: true, message: '请评分' }]}>
                    <Rate allowHalf defaultValue={3} style={{ fontSize: 32, color: dim.color }} />
                  </Form.Item>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <Form.Item name="comment" label="评估评语">
                <Input.TextArea 
                  rows={4} 
                  placeholder="请输入评估评语，包括优点、待改进项和建议..." 
                  style={{ borderRadius: 12, border: '1px solid #e2e8f0' }} 
                />
              </Form.Item>
            </div>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<PlusOutlined />} 
                disabled={!selectedMember}
                size="large"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  border: 'none', 
                  height: 48, 
                  fontSize: 16,
                  width: 200
                }}
              >
                提交评估
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>评估历史记录</h2>
            <span style={{ color: '#64748b', fontSize: 14 }}>共 {assessments.length} 条记录</span>
          </div>

          {assessments.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
              {assessments.map((assessment) => (
                <div key={assessment.id} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <Avatar size={48} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} icon={<UserOutlined />} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: 16, color: '#1e293b' }}>{getMemberName(assessment.memberId)}</p>
                      <p style={{ margin: 2, color: '#94a3b8', fontSize: 12 }}>{new Date(assessment.assessedAt).toLocaleString()}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', padding: '6px 14px', background: '#fef3c7', borderRadius: 20 }}>
                      <span style={{ color: '#d97706', fontWeight: 'bold', fontSize: 16 }}>{getAverageScore(assessment.dimensions)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {dimensions.map((dim) => (
                      <div key={dim.key} style={{ flex: 1, textAlign: 'center', padding: 8, background: '#f8fafc', borderRadius: 8 }}>
                        <Rate 
                          defaultValue={assessment.dimensions[dim.key as keyof typeof assessment.dimensions]} 
                          disabled 
                          allowHalf 
                          style={{ fontSize: 16, color: dim.color }} 
                        />
                        <p style={{ margin: 4, fontSize: 11, color: '#64748b' }}>{dim.label}</p>
                      </div>
                    ))}
                  </div>

                  {assessment.comment && (
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                      <p style={{ margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.5 }}>{assessment.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ width: 100, height: 100, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <BarChartOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 }}>暂无评估记录</h3>
              <p style={{ margin: 0, color: '#64748b' }}>选择成员并创建第一次评估</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}