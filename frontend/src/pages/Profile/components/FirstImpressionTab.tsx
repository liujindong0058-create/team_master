import React, { useEffect, useState } from 'react';
import { Card, Input, Button, Typography, Empty, message } from 'antd';
import { EditOutlined, SaveOutlined, EyeOutlined } from '@ant-design/icons';
import { useProfileStore, useMemberStore } from '@/store';

const { Text } = Typography;
const { TextArea } = Input;

const FirstImpressionTab: React.FC = () => {
  const { selectedMember } = useMemberStore();
  const { firstImpression, fetchFirstImpression, saveFirstImpression, isLoading } = useProfileStore();

  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // 加载初印象
  useEffect(() => {
    if (selectedMember) {
      fetchFirstImpression(selectedMember.id);
    }
  }, [selectedMember?.id, fetchFirstImpression]);

  // 同步编辑内容
  useEffect(() => {
    if (firstImpression) {
      setContent(firstImpression.content);
    } else {
      setContent('');
    }
  }, [firstImpression]);

  const handleSave = async () => {
    if (!selectedMember) return;
    try {
      await saveFirstImpression(selectedMember.id, content);
      setIsEditing(false);
      message.success('初印象保存成功');
    } catch {
      message.error('保存失败');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setContent(firstImpression?.content || '');
    setIsEditing(false);
  };

  if (!selectedMember) {
    return (
      <Empty description="请先选择一个成员" />
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EyeOutlined />
          <span>初印象</span>
        </div>
      }
      extra={
        isEditing ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={handleCancel}>取消</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={isLoading}
            >
              保存
            </Button>
          </div>
        ) : (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            {firstImpression ? '编辑' : '记录'}
          </Button>
        )
      }
    >
      {isEditing ? (
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记录你对这位成员的第一印象..."
          rows={10}
          maxLength={1000}
          showCount
          style={{ fontSize: 14, lineHeight: 1.8 }}
        />
      ) : firstImpression ? (
        <div style={{ minHeight: 200 }}>
          <Text style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {firstImpression.content}
          </Text>
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              更新时间：{new Date(firstImpression.updatedAt).toLocaleString()}
            </Text>
          </div>
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="还没有记录初印象"
        >
          <Button type="primary" onClick={handleEdit}>
            立即记录
          </Button>
        </Empty>
      )}
    </Card>
  );
};

export default FirstImpressionTab;
