import React, { useEffect, useRef, useState } from 'react';
import {
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
  PlusOutlined,
  FileTextOutlined,
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
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
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
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
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

  // 当前选中的笔记
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className="notes-tab-layout">
      {/* 左侧：记录列表 */}
      <div className="notes-list-panel">
        <div className="notes-list-header">
          <Text strong style={{ fontSize: 14 }}>
            <FileTextOutlined style={{ marginRight: 6 }} />
            记录列表
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {notes.length} 条
          </Text>
        </div>
        <div className="notes-list-body">
          {isLoading ? (
            <div style={{ padding: 20, textAlign: 'center' }}>加载中...</div>
          ) : notes.length === 0 ? (
            <Empty description="暂无笔记" style={{ marginTop: 40 }} />
          ) : (
            notes.map((note) => {
              const { textContent, images } = parseContent(note.content);
              const isSelected = selectedNoteId === note.id;
              return (
                <div
                  key={note.id}
                  className={`notes-list-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <div className="notes-list-item-content">
                    <Text ellipsis style={{ fontSize: 13, lineHeight: '20px' }}>
                      {textContent || (images.length > 0 ? '[图片]' : '空笔记')}
                    </Text>
                  </div>
                  <div className="notes-list-item-meta">
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {formatRelativeTime(note.createdAt)}
                    </Text>
                    {images.length > 0 && (
                      <PictureOutlined style={{ fontSize: 11, color: '#1890ff', marginLeft: 6 }} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 右侧：新增/查看小记 */}
      <div className="notes-detail-panel">
        {selectedNote && editingNoteId !== selectedNote.id ? (
          /* 查看笔记详情 */
          <div className="notes-detail-view">
            <div className="notes-detail-header">
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatRelativeTime(selectedNote.createdAt)}
              </Text>
              <Space>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleStartEdit(selectedNote)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这条笔记吗？"
                  onConfirm={() => handleDeleteNote(selectedNote.id)}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button size="small" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            </div>
            <div className="notes-detail-body">
              {(() => {
                const { textContent, images } = parseContent(selectedNote.content);
                return (
                  <>
                    <Text style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8 }}>
                      {textContent}
                    </Text>
                    {images.length > 0 && (
                      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Image.PreviewGroup>
                          {images.map((url, idx) => (
                            <Image
                              key={idx}
                              src={url}
                              width={120}
                              height={120}
                              style={{ objectFit: 'cover', borderRadius: 6 }}
                            />
                          ))}
                        </Image.PreviewGroup>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        ) : editingNoteId ? (
          /* 编辑笔记 */
          <div className="notes-detail-view">
            <div className="notes-detail-header">
              <Text strong style={{ fontSize: 14 }}>编辑笔记</Text>
              <Space>
                <Button size="small" onClick={handleCancelEdit}>取消</Button>
                <Button type="primary" size="small" onClick={handleSaveEdit}>保存</Button>
              </Space>
            </div>
            <div className="notes-detail-body">
              <TextArea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                maxLength={2000}
                showCount
                placeholder="编辑笔记内容..."
                style={{ fontSize: 14, lineHeight: 1.8 }}
              />
            </div>
          </div>
        ) : (
          /* 新增笔记 */
          <div className="notes-detail-view">
            <div className="notes-detail-header">
              <Text strong style={{ fontSize: 14 }}>
                <PlusOutlined style={{ marginRight: 6 }} />
                新增小记
              </Text>
            </div>
            <div className="notes-detail-body">
              <TextArea
                ref={textAreaRef}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="记录关于这位成员的笔记...支持截图粘贴"
                rows={8}
                maxLength={2000}
                showCount
                style={{ fontSize: 14, lineHeight: 1.8 }}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesTab;
