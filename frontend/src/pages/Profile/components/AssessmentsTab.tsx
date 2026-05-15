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
  Radio,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useProfileStore, useMemberStore } from '@/store';
import { Assessment } from '@/types';
import { formatDate } from '@/utils';

const { Text } = Typography;
const { TextArea } = Input;

// 评估周期类型
type PeriodType = 'month' | 'quarter' | 'halfYear' | 'year';

const periodOptions: { label: string; value: PeriodType }[] = [
  { label: '月度', value: 'month' },
  { label: '季度', value: 'quarter' },
  { label: '半年', value: 'halfYear' },
  { label: '年度', value: 'year' },
];

// 根据周期类型和日期计算起止日期
const getPeriodRange = (periodType: PeriodType, date: dayjs.Dayjs) => {
  let start: dayjs.Dayjs;
  let end: dayjs.Dayjs;

  switch (periodType) {
    case 'month':
      start = date.startOf('month');
      end = date.endOf('month');
      break;
    case 'quarter': {
      const quarterMonth = Math.floor(date.month() / 3) * 3;
      start = date.month(quarterMonth).startOf('month');
      end = date.month(quarterMonth + 2).endOf('month');
      break;
    }
    case 'halfYear': {
      const halfYearMonth = date.month() < 6 ? 0 : 6;
      start = date.month(halfYearMonth).startOf('month');
      end = date.month(halfYearMonth + 5).endOf('month');
      break;
    }
    case 'year':
      start = date.startOf('year');
      end = date.endOf('year');
      break;
  }

  return { start, end };
};

// 生成 period 字符串
const buildPeriodString = (periodType: PeriodType, date: dayjs.Dayjs): string => {
  const { start, end } = getPeriodRange(periodType, date);
  return `${start.format('YYYY.MM.DD')} - ${end.format('YYYY.MM.DD')}`;
};

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

  // 创建表单中的周期类型和日期
  const [createPeriodType, setCreatePeriodType] = useState<PeriodType>('month');
  const [createDate, setCreateDate] = useState<dayjs.Dayjs>(dayjs());

  // 编辑表单中的周期类型和日期
  const [editPeriodType, setEditPeriodType] = useState<PeriodType>('month');
  const [editDate, setEditDate] = useState<dayjs.Dayjs>(dayjs());

  // 加载评估列表
  useEffect(() => {
    if (selectedMember) {
      fetchAssessments(selectedMember.id);
    }
  }, [selectedMember?.id, fetchAssessments]);

  // 打开创建弹窗
  const handleCreate = () => {
    form.resetFields();
    setCreatePeriodType('month');
    setCreateDate(dayjs());
    setIsModalOpen(true);
  };

  // 创建评估
  const handleCreateSubmit = async () => {
    if (!selectedMember) return;
    try {
      const values = await form.validateFields();
      const periodStr = buildPeriodString(createPeriodType, createDate);
      await createAssessment(selectedMember.id, {
        ...values,
        period: periodStr,
      });
      setIsModalOpen(false);
    } catch {
      // 表单验证失败
    }
  };

  // 打开编辑弹窗
  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    editForm.setFieldsValue({
      workQuality: assessment.workQuality,
      efficiency: assessment.efficiency,
      communication: assessment.communication,
      innovation: assessment.innovation,
      teamwork: assessment.teamwork,
      summary: assessment.summary,
    });
    // 尝试解析已有的 period
    setEditPeriodType('month');
    setEditDate(dayjs());
    setIsEditModalOpen(true);
  };

  // 更新评估
  const handleEditSubmit = async () => {
    if (!editingAssessment) return;
    try {
      const values = await editForm.validateFields();
      const periodStr = buildPeriodString(editPeriodType, editDate);
      await updateAssessment(editingAssessment.id, {
        ...values,
        period: periodStr,
      });
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
    return (
      assessment.workQuality +
      assessment.efficiency +
      assessment.communication +
      assessment.innovation +
      assessment.teamwork
    );
  };

  // 计算平均分
  const calculateAverageScore = (assessment: Assessment) => {
    return (calculateTotalScore(assessment) / 5).toFixed(1);
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

  // 渲染周期选择器（创建和编辑共用逻辑）
  const renderPeriodSelector = (
    periodType: PeriodType,
    date: dayjs.Dayjs,
    onTypeChange: (val: PeriodType) => void,
    onDateChange: (val: dayjs.Dayjs) => void,
  ) => {
    const { start, end } = getPeriodRange(periodType, date);
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>评估周期类型</Text>
          <Radio.Group
            value={periodType}
            onChange={(e) => onTypeChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="middle"
          >
            {periodOptions.map((opt) => (
              <Radio.Button key={opt.value} value={opt.value}>
                {opt.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>选择日期</Text>
          <DatePicker
            value={date}
            onChange={(val) => val && onDateChange(val)}
            picker="month"
            style={{ width: '100%' }}
          />
        </div>
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CalendarOutlined style={{ color: '#52c41a', fontSize: 16 }} />
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>评估周期范围</Text>
            <div>
              <Text strong style={{ fontSize: 14 }}>
                {start.format('YYYY年MM月DD日')} — {end.format('YYYY年MM月DD日')}
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!selectedMember) {
    return <Empty description="请先选择一个成员" />;
  }

  return (
    <div className="assessments-tab" style={{ padding: 20, height: '100%', overflow: 'auto' }}>
      {/* 操作区 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text type="secondary">历史评估记录</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          创建评估
        </Button>
      </div>

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
                <Tag color="blue">平均 {calculateAverageScore(assessment)} 分</Tag>
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
          <Form.Item label="评估周期" required>
            {renderPeriodSelector(createPeriodType, createDate, setCreatePeriodType, setCreateDate)}
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

          <Form.Item name="summary" label="评估总结">
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
          <Form.Item label="评估周期" required>
            {renderPeriodSelector(editPeriodType, editDate, setEditPeriodType, setEditDate)}
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
