import React, { useEffect, useState } from 'react';
import {
  Card,
  List,
  Button,
  Typography,
  Empty,
  Modal,
  Form,
  Input,
  Rate,
  Popconfirm,
  Tooltip,
  Space,
  Tag,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useProfileStore, useMemberStore } from '@/store';
import { Assessment } from '@/types';
import { formatDate } from '@/utils';

const { Text } = Typography;
const { TextArea } = Input;

const AssessmentsTab: React.FC = () => {
  const { selectedMember } = useMemberStore();
  const {
    assessments,
    fetchAssessments,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    isLoading,
  } = useProfileStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 加载评估列表
  useEffect(() => {
    if (selectedMember) {
      fetchAssessments(selectedMember.id);
    }
  }, [selectedMember?.id, fetchAssessments]);

  // 打开创建弹窗
  const handleCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      period: formatDate(new Date(), 'YYYY-MM'),
    });
    setIsModalOpen(true);
  };

  // 创建评估
  const handleCreateSubmit = async () => {
    if (!selectedMember) return;
    try {
      const values = await form.validateFields();
      await createAssessment(selectedMember.id, values);
      setIsModalOpen(false);
    } catch {
      // 表单验证失败
    }
  };

  // 打开编辑弹窗
  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    editForm.setFieldsValue({
      period: assessment.period,
      workQuality: assessment.workQuality,
      efficiency: assessment.efficiency,
      communication: assessment.communication,
      innovation: assessment.innovation,
      teamwork: assessment.teamwork,
      summary: assessment.summary,
    });
    setIsEditModalOpen(true);
  };

  // 更新评估
  const handleEditSubmit = async () => {
    if (!editingAssessment) return;
    try {
      const values = await editForm.validateFields();
      await updateAssessment(editingAssessment.id, values);
      setIsEditModalOpen(false);
      setEditingAssessment(null);
    } catch {
      // 表单验证失败
    }
  };

  // 删除评估
  const handleDelete = async (assessmentId: string) => {
    try {
      await deleteAssessment(assessmentId);
    } catch {
      // 删除失败
    }
  };

  // 计算总分
  const calculateTotalScore = (assessment: Assessment) => {
    const total =
      assessment.workQuality +
      assessment.efficiency +
      assessment.communication +
      assessment.innovation +
      assessment.teamwork;
    return total;
  };

  // 计算平均分
  const calculateAverageScore = (assessment: Assessment) => {
    const total = calculateTotalScore(assessment);
    return (total / 5).toFixed(1);
  };

  // 渲染评分项
  const renderScoreItem = (label: string, score: number, maxScore: number = 10) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text>{label}</Text>
      <Space>
        <Rate disabled value={score} count={maxScore} style={{ fontSize: 14 }} />
        <Text type="secondary">{score}/{maxScore}</Text>
      </Space>
    </div>
  );

  if (!selectedMember) {
    return <Empty description="请先选择一个成员" />;
  }

  return (
    <div className="assessments-tab">
      {/* 操作区 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text type="secondary">历史评估记录</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建评估
          </Button>
        </div>
      </Card>

      {/* 评估列表 */}
      <List
        loading={isLoading}
        dataSource={assessments}
        locale={{
          emptyText: <Empty description="暂无评估记录" />,
        }}
        renderItem={(assessment) => (
          <Card
            key={assessment.id}
            size="small"
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text strong>{assessment.period}</Text>
                <Tag color="blue">平均 {(calculateAverageScore(assessment))} 分</Tag>
              </Space>
            }
            extra={
              <Space>
                <Tooltip title="编辑">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(assessment)}
                  />
                </Tooltip>
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这条评估记录吗？"
                  onConfirm={() => handleDelete(assessment.id)}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip title="删除">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </Space>
            }
          >
            <div style={{ marginBottom: 16 }}>
              {renderScoreItem('工作质量', assessment.workQuality)}
              {renderScoreItem('工作效率', assessment.efficiency)}
              {renderScoreItem('沟通能力', assessment.communication)}
              {renderScoreItem('创新能力', assessment.innovation)}
              {renderScoreItem('团队协作', assessment.teamwork)}
              <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                <Text type="secondary">综合评分：</Text>
                <Progress
                  percent={Math.round((calculateTotalScore(assessment) / 50) * 100)}
                  size="small"
                  format={() => `${calculateTotalScore(assessment)}/50`}
                  style={{ marginTop: 4 }}
                />
              </div>
            </div>

            {assessment.summary && (
              <div style={{ marginTop: 12 }}>
                <Text strong>评估总结：</Text>
                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#fafafa', borderRadius: 4 }}>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{assessment.summary}</Text>
                </div>
              </div>
            )}

            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                评估时间：{formatDate(assessment.createdAt)}
              </Text>
            </div>
          </Card>
        )}
      />

      {/* 创建评估弹窗 */}
      <Modal
        title="创建评估"
        open={isModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="创建"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="period"
            label="评估周期"
            rules={[{ required: true, message: '请选择评估周期' }]}
          >
            <Input placeholder="例如：2024-01" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="workQuality"
              label="工作质量"
              rules={[{ required: true, message: '请评分' }]}
              initialValue={5}
            >
              <Rate count={10} />
            </Form.Item>
            <Form.Item
              name="efficiency"
              label="工作效率"
              rules={[{ required: true, message: '请评分' }]}
              initialValue={5}
            >
              <Rate count={10} />
            </Form.Item>
            <Form.Item
              name="communication"
              label="沟通能力"
              rules={[{ required: true, message: '请评分' }]}
              initialValue={5}
            >
              <Rate count={10} />
            </Form.Item>
            <Form.Item
              name="innovation"
              label="创新能力"
              rules={[{ required: true, message: '请评分' }]}
              initialValue={5}
            >
              <Rate count={10} />
            </Form.Item>
            <Form.Item
              name="teamwork"
              label="团队协作"
              rules={[{ required: true, message: '请评分' }]}
              initialValue={5}
            >
              <Rate count={10} />
            </Form.Item>
          </div>

          <Form.Item
            name="summary"
            label="评估总结"
          >
            <TextArea rows={4} placeholder="请输入评估总结..." maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑评估弹窗 */}
      <Modal
        title="编辑评估"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingAssessment(null);
        }}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="period"
            label="评估周期"
            rules={[{ required: true, message: '请选择评估周期' }]}
          >
            <Input placeholder="例如：2024-01" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="workQuality" label="工作质量" rules={[{ required: true }]}>
              <Rate count={10} />
            </Form.Item>
            <Form.Item name="efficiency" label="工作效率" rules={[{ required: true }]}>
              <Rate count={10} />
            </Form.Item>
            <Form.Item name="communication" label="沟通能力" rules={[{ required: true }]}>
              <Rate count={10} />
            </Form.Item>
            <Form.Item name="innovation" label="创新能力" rules={[{ required: true }]}>
              <Rate count={10} />
            </Form.Item>
            <Form.Item name="teamwork" label="团队协作" rules={[{ required: true }]}>
              <Rate count={10} />
            </Form.Item>
          </div>

          <Form.Item name="summary" label="评估总结">
            <TextArea rows={4} placeholder="请输入评估总结..." maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssessmentsTab;
