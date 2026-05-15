import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Space,
  QRCode,
  message,
  Carousel,
} from 'antd';
import {
  WechatOutlined,
  TeamOutlined,
  BarChartOutlined,
  SafetyOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store';
import './styles.css';

const { Title, Text, Paragraph } = Typography;

// 轮播图数据
const carouselItems = [
  {
    icon: <TeamOutlined style={{ fontSize: 64, color: '#1890ff' }} />,
    title: '高效团队管理',
    description: '一站式团队管理解决方案，让团队协作更加高效便捷',
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 64, color: '#52c41a' }} />,
    title: '成员能力评估',
    description: '多维度评估体系，全面掌握团队成员能力与成长轨迹',
  },
  {
    icon: <SafetyOutlined style={{ fontSize: 64, color: '#faad14' }} />,
    title: '数据安全可靠',
    description: '企业级数据安全保障，让您的团队数据安全无忧',
  },
  {
    icon: <MobileOutlined style={{ fontSize: 64, color: '#eb2f96' }} />,
    title: '随时随地访问',
    description: '支持多端访问，随时随地管理团队，高效办公',
  },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const [qrValue, setQrValue] = useState('wechat-login-mock');

  // 如果已登录，跳转到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  // 模拟登录
  const handleMockLogin = async () => {
    try {
      await login();
      message.success('登录成功');
      navigate('/app');
    } catch {
      message.error('登录失败，请重试');
    }
  };

  // 刷新二维码
  const refreshQRCode = () => {
    setQrValue(`wechat-login-mock-${Date.now()}`);
  };

  return (
    <div className="login-page">
      <Row className="login-container">
        {/* 左侧轮播区域 */}
        <Col xs={0} md={12} className="login-left">
          <div className="login-carousel-wrapper">
            <div className="login-brand">
              <div className="login-logo">T</div>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                TeamMaster
              </Title>
            </div>
            <Carousel
              autoplay
              dots
              className="login-carousel"
              autoplaySpeed={4000}
            >
              {carouselItems.map((item, index) => (
                <div key={index} className="carousel-item">
                  <div className="carousel-icon">{item.icon}</div>
                  <Title level={4} style={{ color: '#fff', marginTop: 24 }}>
                    {item.title}
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
                    {item.description}
                  </Paragraph>
                </div>
              ))}
            </Carousel>
          </div>
        </Col>

        {/* 右侧登录区域 */}
        <Col xs={24} md={12} className="login-right">
          <Card className="login-card" bordered={false}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 标题 */}
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ marginBottom: 8 }}>
                  欢迎登录
                </Title>
                <Text type="secondary">使用微信扫码快速登录</Text>
              </div>

              {/* 二维码区域 */}
              <div className="qr-code-container">
                <div className="qr-code-wrapper">
                  <QRCode
                    value={qrValue}
                    size={200}
                    icon="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                    iconSize={40}
                    status="active"
                  />
                </div>
                <Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
                  请使用微信扫一扫登录
                </Text>
                <Button
                  type="link"
                  size="small"
                  onClick={refreshQRCode}
                  style={{ marginTop: 8 }}
                >
                  刷新二维码
                </Button>
              </div>

              {/* 分隔线 */}
              <div className="divider">
                <span>或</span>
              </div>

              {/* 模拟登录按钮 */}
              <Button
                type="primary"
                size="large"
                icon={<WechatOutlined />}
                onClick={handleMockLogin}
                loading={isLoading}
                block
                style={{ height: 48, fontSize: 16 }}
              >
                模拟微信登录
              </Button>

              {/* 底部提示 */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  登录即表示您同意我们的
                  <Button type="link" size="small" style={{ padding: '0 4px' }}>
                    服务条款
                  </Button>
                  和
                  <Button type="link" size="small" style={{ padding: '0 4px' }}>
                    隐私政策
                  </Button>
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;
