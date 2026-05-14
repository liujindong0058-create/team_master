import { Button } from 'antd';
import { RocketOutlined, TeamOutlined, BarChartOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import AuthPage from './AuthPage';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAppStore();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontSize: 56, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
            团队陪跑大师
          </h1>
          <p style={{ fontSize: 24, color: 'rgba(255,255,255,0.9)', marginBottom: 40 }}>
            让团队管理更科学、更客观、更高效
          </p>
          <Button 
            type="primary" 
            size="large" 
            onClick={() => navigate('/dashboard')}
            style={{ 
              height: 56, 
              fontSize: 18, 
              padding: '0 40px',
              background: '#fff',
              color: '#667eea',
              border: 'none',
              fontWeight: 'bold'
            }}
          >
            进入控制台
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 16, 
            padding: 32,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <TeamOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>团队管理</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              创建虚拟团队，添加成员信息，系统化管理团队成员数据
            </p>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 16, 
            padding: 32,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <RocketOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>日常小记</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              随时记录成员表现，避免主观误判，积累客观数据
            </p>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 16, 
            padding: 32,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <BarChartOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>多维度评估</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              从专业能力、协作能力、工作态度等多维度客观评估
            </p>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 16, 
            padding: 32,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <SafetyOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>长期追踪</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              追踪成员长期表现，生成完整的人才画像和发展报告
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
