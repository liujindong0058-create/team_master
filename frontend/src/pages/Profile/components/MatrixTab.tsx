import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Typography,
  Empty,
  Space,
  Slider,
  InputNumber,
  message,
  Row,
  Col,
} from 'antd';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SaveOutlined, EditOutlined } from '@ant-design/icons';
import { useProfileStore, useMemberStore } from '@/store';
import { MATRIX_DIMENSIONS, CreateMatrixRequest } from '@/types';

const { Text } = Typography;

const MatrixTab: React.FC = () => {
  const { selectedMember } = useMemberStore();
  const { matrix, fetchMatrix, saveMatrix, updateMatrix, isLoading } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({
    technical: 0,
    communication: 0,
    leadership: 0,
    execution: 0,
    learning: 0,
  });

  // 加载能力矩阵
  useEffect(() => {
    if (selectedMember) {
      fetchMatrix(selectedMember.id);
    }
  }, [selectedMember?.id, fetchMatrix]);

  // 同步数据
  useEffect(() => {
    if (matrix) {
      setScores({
        technical: matrix.technical,
        communication: matrix.communication,
        leadership: matrix.leadership,
        execution: matrix.execution,
        learning: matrix.learning,
      });
    } else {
      setScores({
        technical: 3,
        communication: 3,
        leadership: 3,
        execution: 3,
        learning: 3,
      });
    }
  }, [matrix]);

  // 更新分数
  const handleScoreChange = (key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  // 保存能力矩阵
  const handleSave = async () => {
    if (!selectedMember) return;
    try {
      const matrixData: CreateMatrixRequest = {
        technical: scores.technical,
        communication: scores.communication,
        leadership: scores.leadership,
        execution: scores.execution,
        learning: scores.learning,
      };
      if (matrix) {
        await updateMatrix(selectedMember.id, matrixData);
      } else {
        await saveMatrix(selectedMember.id, matrixData);
      }
      setIsEditing(false);
      message.success('能力矩阵保存成功');
    } catch {
      message.error('保存失败');
    }
  };

  // 取消编辑
  const handleCancel = () => {
    if (matrix) {
      setScores({
        technical: matrix.technical,
        communication: matrix.communication,
        leadership: matrix.leadership,
        execution: matrix.execution,
        learning: matrix.learning,
      });
    }
    setIsEditing(false);
  };

  // 准备雷达图数据
  const radarData = MATRIX_DIMENSIONS.map((dim) => ({
    subject: dim.name,
    A: scores[dim.key] || 0,
    fullMark: dim.fullMark,
  }));

  if (!selectedMember) {
    return <Empty description="请先选择一个成员" />;
  }

  return (
    <div className="matrix-tab">
      <Card
        title="能力矩阵"
        extra={
          isEditing ? (
            <Space>
              <Button onClick={handleCancel}>取消</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={isLoading}
              >
                保存
              </Button>
            </Space>
          ) : (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              {matrix ? '编辑' : '创建'}
            </Button>
          )
        }
      >
        <Row gutter={24}>
          {/* 雷达图 */}
          <Col xs={24} md={12}>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 14, fill: '#595959' }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 5]}
                    tick={{ fontSize: 12 }}
                  />
                  <Radar
                    name="能力值"
                    dataKey="A"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Col>

          {/* 评分滑块 */}
          <Col xs={24} md={12}>
            <div style={{ padding: '0 16px' }}>
              {MATRIX_DIMENSIONS.map((dim) => (
                <div key={dim.key} style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text strong>{dim.name}</Text>
                    {isEditing ? (
                      <InputNumber
                        min={0}
                        max={dim.fullMark}
                        value={scores[dim.key]}
                        onChange={(value) =>
                          handleScoreChange(dim.key, value || 0)
                        }
                        style={{ width: 80 }}
                      />
                    ) : (
                      <Text type="secondary">
                        {scores[dim.key]} / {dim.fullMark}
                      </Text>
                    )}
                  </div>
                  {isEditing && (
                    <Slider
                      min={0}
                      max={dim.fullMark}
                      value={scores[dim.key]}
                      onChange={(value) => handleScoreChange(dim.key, value)}
                      marks={{
                        0: '0',
                        [dim.fullMark]: dim.fullMark.toString(),
                      }}
                      tooltip={{
                        formatter: (value) => `${value} 分`,
                      }}
                    />
                  )}
                  {!isEditing && (
                    <div
                      style={{
                        height: 8,
                        backgroundColor: '#f0f0f0',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${(scores[dim.key] / dim.fullMark) * 100}%`,
                          backgroundColor: '#1890ff',
                          borderRadius: 4,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* 能力说明 */}
              <div
                style={{
                  marginTop: 32,
                  padding: 16,
                  backgroundColor: '#fafafa',
                  borderRadius: 8,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>能力维度说明：</strong>
                  <br />
                  技术能力：编程、设计、技术方案等专业技术水平
                  <br />
                  沟通能力：表达、倾听、协调、说服等沟通技巧
                  <br />
                  领导力：团队管理、决策、影响力等领导素质
                  <br />
                  执行力：任务完成、效率、质量等执行能力
                  <br />
                  学习能力：学习速度、知识吸收、持续成长等
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MatrixTab;
