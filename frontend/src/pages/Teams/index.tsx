import React from 'react';
import { Empty } from 'antd';

/**
 * 团队管理页面
 * 注意：团队管理功能已集成在 Layout/Sidebar 组件中
 * 此页面仅作为占位，实际团队列表、创建、编辑、删除功能在 Sidebar 中实现
 */
const TeamsPage: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Empty description="团队管理功能已集成在左侧边栏中" />
    </div>
  );
};

export default TeamsPage;
