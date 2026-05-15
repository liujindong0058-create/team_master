import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  List,
  Input,
  Button,
  Typography,
  Empty,
  message,
  Tooltip,
  Popconfirm,
  Image,
  Space,
  Tag,
} from 'antd';
import {
  SendOutlined,
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useProfileStore, useMemberStore } from '@/store';
import { formatRelativeTime } from '@/utils';
import type { Note } from '@/types';

const { Text } = Typography;
const { TextArea } = Input;

// 解析内容中的图片
const parseContent = (content: string) => {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[1]);
  }
  const textContent = content.replace(imageRegex, '').trim();
  return { textContent, images };
};

const NotesTab: React.FC = () => {
  const { selectedMember } = useMemberStore();
  const { notes, fetchNotes, createNote, updateNote, deleteNote, uploadImage, isLoading } = useProfileStore();

  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // 加载笔记列表
  useEffect(() => {
    if (selectedMember) {
      fetchNotes(selectedMember.id);
    }
  }, [selectedMember?.id, fetchNotes]);

  // 监听粘贴事件（截图粘贴）
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!textAreaRef.current || document.activeElement !== textAreaRef.current) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            setIsUploading(true);
            try {
              const url = await uploadImage(blob);
              setUploadedImages((prev) => [...prev, url]);
              message.success('图片已粘贴');
            } catch {
              message.error('图片上传失败');
            } finally {
              setIsUploading(false);
            }
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [uploadImage]);

  // 创建笔记
  const handleCreateNote = async () => {
    if (!selectedMember || !newNoteContent.trim()) return;

    try {
      let content = newNoteContent;
      if (uploadedImages.length > 0) {
        const imageMarkdown = uploadedImages.map((url) => `![image](${url})`).join('\n');
        content += '\n\n' + imageMarkdown;
      }

      await createNote(selectedMember.id, { content });
      setNewNoteContent('');
      setUploadedImages([]);
      message.success('笔记添加成功');
    } catch {
      message.error('添加失败');
    }
  };

  // 开始编辑
  const handleStartEdit = (note: Note) => {
    const { textContent } = parseContent(note.content);
    setEditingNoteId(note.id);
    setEditContent(textContent);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingNoteId || !editContent.trim()) return;

    try {
      await updateNote(editingNoteId, editContent);
      setEditingNoteId(null);
      setEditContent('');
      message.success('笔记更新成功');
    } catch {
      message.error('更新失败');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  // 删除笔记
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      message.success('笔记删除成功');
    } catch {
      message.error('删除失败');
    }
  };

  // 移除待上传的图片
  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (!selectedMember) {
    return <Empty description="请先选择一个成员" />;
  }

  return (
    <div className="notes-tab">
      {/* 新建笔记区域 */}
      <Card style={{ marginBottom: 16 }}>
        <TextArea
          ref={textAreaRef}
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="记录关于这位成员的笔记...支持截图粘贴"
          rows={4}
          maxLength={2000}
          showCount
        />

        {/* 已粘贴的图片预览 */}
        {uploadedImages.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {uploadedImages.map((url, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <Image
                  src={url}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                  preview
                />
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 20,
                    height: 20,
                    minWidth: 20,
                    padding: 0,
                  }}
                  onClick={() => handleRemoveImage(index)}
                />
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tooltip title="支持截图粘贴">
            <Tag icon={<PictureOutlined />} color="blue">
              截图粘贴
            </Tag>
          </Tooltip>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleCreateNote}
            loading={isLoading || isUploading}
            disabled={!newNoteContent.trim()}
          >
            发布笔记
          </Button>
        </div>
      </Card>

      {/* 笔记列表 */}
      <List
        loading={isLoading}
        dataSource={notes}
        locale={{
          emptyText: <Empty description="暂无笔记" />,
        }}
        renderItem={(note) => {
          const { textContent, images } = parseContent(note.content);
          const isEditing = editingNoteId === note.id;

          return (
            <Card
              key={note.id}
              size="small"
              style={{ marginBottom: 12 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <TextArea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      showCount
                    />
                  ) : (
                    <>
                      <Text style={{ whiteSpace: 'pre-wrap' }}>{textContent}</Text>
                      {images.length > 0 && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Image.PreviewGroup>
                            {images.map((url, idx) => (
                              <Image
                                key={idx}
                                src={url}
                                width={100}
                                height={100}
                                style={{ objectFit: 'cover', borderRadius: 4 }}
                              />
                            ))}
                          </Image.PreviewGroup>
                        </div>
                      )}
                    </>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatRelativeTime(note.createdAt)}
                    </Text>
                  </div>
                </div>
                <Space>
                  {isEditing ? (
                    <>
                      <Button size="small" onClick={handleCancelEdit}>取消</Button>
                      <Button type="primary" size="small" onClick={handleSaveEdit}>保存</Button>
                    </>
                  ) : (
                    <>
                      <Tooltip title="编辑">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleStartEdit(note)}
                        />
                      </Tooltip>
                      <Tooltip title="删除">
                        <Popconfirm
                          title="确认删除"
                          description="确定要删除这条笔记吗？"
                          onConfirm={() => handleDeleteNote(note.id)}
                          okText="删除"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </Tooltip>
                    </>
                  )}
                </Space>
              </div>
            </Card>
          );
        }}
      />
    </div>
  );
};

export default NotesTab;
