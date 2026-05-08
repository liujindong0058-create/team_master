import { useState, useEffect } from 'react';
import { Button, message, Modal } from 'antd';
import { RocketOutlined, GroupOutlined, BarChartOutlined, ArrowRightOutlined, StarOutlined, ScanOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const [qrCodeExpired, setQrCodeExpired] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const { setUser } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (showLogin && !qrCodeExpired) {
      const timer = setTimeout(() => {
        setQrCodeExpired(true);
        setScanMessage('二维码已过期，请刷新重试');
      }, 120000);
      return () => clearTimeout(timer);
    }
  }, [showLogin, qrCodeExpired]);

  const refreshQrCode = () => {
    setQrCodeExpired(false);
    setScanSuccess(false);
    setScanMessage('');
  };

  const simulateScan = () => {
    setScanMessage('扫码成功，正在登录...');
    setTimeout(() => {
      setScanSuccess(true);
      setScanMessage('登录成功！正在跳转...');
      setTimeout(() => {
        const mockUser = {
          id: 'mock-user-id',
          name: '用户',
          email: 'user@example.com',
          role: 'manager'
        };
        localStorage.setItem('token', 'mock-token');
        setUser(mockUser);
        message.success('登录成功！');
        setShowLogin(false);
        navigate('/dashboard');
      }, 1500);
    }, 1000);
  };

  const features = [
    {
      icon: <GroupOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
      title: '客观评估',
      description: '告别主观误判，用数据说话，记录每一个关键时刻',
      color: 'blue'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 40, color: '#52c41a' }} />,
      title: '多维分析',
      description: '五大维度评估体系，全面了解团队成员优劣势',
      color: 'green'
    },
    {
      icon: <RocketOutlined style={{ fontSize: 40, color: '#faad14' }} />,
      title: '智能推荐',
      description: '基于评估数据，智能推荐最合适的任务人选',
      color: 'gold'
    }
  ];

  const testimonials = [
    { name: '张经理', role: '技术总监', content: '使用团队陪跑大师后，我们的绩效评估更加客观，团队氛围也更好了！', rating: 5 },
    { name: '李主管', role: '项目经理', content: '长期追踪功能太棒了，可以看到每个成员的成长轨迹', rating: 5 },
    { name: '王组长', role: '前端组长', content: '任务分配变得更科学，效率提升了很多', rating: 5 }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <RocketOutlined style={{ fontSize: 24, color: '#667eea' }} />
          </div>
          <span style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>团队陪跑大师</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button 
            onClick={() => setShowLogin(true)} 
            style={{ background: '#fff', color: '#667eea', fontWeight: 'bold', padding: '10px 24px', borderRadius: 10 }}
          >
            扫码登录
          </Button>
        </div>
      </nav>

      <section style={{ padding: '80px 40px', textAlign: 'center', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 20, fontSize: 14 }}>
            <RocketOutlined style={{ marginRight: 4 }} /> 全新升级
          </span>
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 'bold', marginBottom: 20, lineHeight: 1.2 }}>
          让团队管理<br />
          <span style={{ background: 'linear-gradient(90deg, #ffd700, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>更科学、更有趣</span>
        </h1>
        <p style={{ fontSize: 20, marginBottom: 40, opacity: 0.9, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          告别主观判断，用数据驱动团队成长
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Button 
            size="large" 
            onClick={() => setShowLogin(true)}
            style={{ background: '#fff', color: '#667eea', fontWeight: 'bold', fontSize: 18, padding: '16px 40px', borderRadius: 12, boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}
          >
            扫码登录
            <ArrowRightOutlined style={{ marginLeft: 8 }} />
          </Button>
          <Button 
            size="large" 
            style={{ background: 'transparent', border: '2px solid #fff', color: '#fff', fontSize: 18, padding: '16px 40px', borderRadius: 12 }}
          >
            了解更多
          </Button>
        </div>
        
        <div style={{ marginTop: 80, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', padding: '40px', borderRadius: 24, maxWidth: 800 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 'bold' }}>1000+</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>团队用户</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 'bold' }}>50000+</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>评估记录</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 'bold' }}>98%</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>用户满意度</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 'bold' }}>50+</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>企业客户</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ color: '#667eea', fontWeight: 'bold' }}>核心功能</span>
          <h2 style={{ fontSize: 36, fontWeight: 'bold', marginTop: 12 }}>为什么选择我们</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, maxWidth: 1200, margin: '0 auto' }}>
          {features.map((feature, index) => (
            <div 
              key={index}
              style={{ 
                background: '#f8f9fa', 
                padding: '40px', 
                borderRadius: 20, 
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ marginBottom: 20 }}>{feature.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>{feature.title}</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ color: '#667eea', fontWeight: 'bold' }}>用户评价</span>
          <h2 style={{ fontSize: 36, fontWeight: 'bold', marginTop: 12 }}>他们都在用</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, maxWidth: 1200, margin: '0 auto' }}>
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              style={{ 
                background: '#fff', 
                padding: '40px', 
                borderRadius: 20,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ display: 'flex', gap: 1, marginBottom: 20 }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarOutlined key={i} style={{ color: '#ffd700', fontSize: 16 }} />
                ))}
              </div>
              <p style={{ color: '#666', lineHeight: 1.6, marginBottom: 20 }}>"{testimonial.content}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: '#667eea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                  {testimonial.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{testimonial.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 20 }}>准备好开始了吗？</h2>
        <p style={{ fontSize: 18, marginBottom: 40 }}>加入1000+团队，让管理更科学</p>
        <Button 
          size="large"
          onClick={() => setShowLogin(true)}
          style={{ background: '#fff', color: '#667eea', fontWeight: 'bold', fontSize: 18, padding: '16px 40px', borderRadius: 12, boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}
        >
          扫码登录
          <ArrowRightOutlined style={{ marginLeft: 8 }} />
        </Button>
      </section>

      <footer style={{ background: '#1a1a2e', padding: '40px', color: '#fff', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, background: '#667eea', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RocketOutlined style={{ fontSize: 20 }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 'bold' }}>团队陪跑大师</span>
        </div>
        <p style={{ color: '#999', fontSize: 14 }}>让团队管理更科学、更有趣</p>
      </footer>

      <Modal
        title="微信扫码登录"
        open={showLogin}
        onCancel={() => setShowLogin(false)}
        footer={null}
        centered
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ 
              width: 200, 
              height: 200, 
              margin: '0 auto',
              background: qrCodeExpired ? '#f5f5f5' : '#fff',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: qrCodeExpired ? '2px dashed #ccc' : 'none'
            }}>
              {scanSuccess ? (
                <div style={{ textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 10 }} />
                </div>
              ) : qrCodeExpired ? (
                <div style={{ textAlign: 'center', color: '#999' }}>
                  <ScanOutlined style={{ fontSize: 48, marginBottom: 10 }} />
                  <p style={{ fontSize: 14 }}>二维码已过期</p>
                </div>
              ) : (
                <img 
                  src="https://picsum.photos/seed/qrcode/180/180" 
                  alt="二维码" 
                  style={{ width: 180, height: 180, borderRadius: 12 }}
                />
              )}
            </div>
          </div>

          {scanMessage && (
            <div style={{ 
              marginBottom: 20, 
              padding: 12, 
              borderRadius: 8,
              background: scanSuccess ? 'rgba(82, 196, 26, 0.1)' : 'rgba(250, 173, 20, 0.1)',
              color: scanSuccess ? '#52c41a' : '#faad14'
            }}>
              {scanMessage}
            </div>
          )}

          {!scanSuccess && (
            <>
              <p style={{ color: '#666', marginBottom: 16 }}>
                使用微信扫码登录
              </p>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, background: '#f7f7f7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 24, height: 24, background: '#07c160', borderRadius: 6 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button 
                  type="primary" 
                  onClick={refreshQrCode}
                  disabled={scanMessage !== ''}
                  style={{ background: '#667eea', border: 'none', borderRadius: 8 }}
                >
                  <ReloadOutlined style={{ marginRight: 6 }} />
                  刷新二维码
                </Button>
                <Button 
                  type="primary" 
                  onClick={simulateScan}
                  style={{ background: '#07c160', border: 'none', borderRadius: 8 }}
                >
                  模拟扫码登录
                </Button>
              </div>

              <p style={{ color: '#999', fontSize: 12, marginTop: 16 }}>
                提示：二维码有效期2分钟，请及时扫码
              </p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}