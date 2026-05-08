import { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';
import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.email, values.password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      message.success('登录成功');
      navigate('/dashboard');
    } catch (error) {
      message.error('登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: { name: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.register(values.name, values.email, values.password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      message.success('注册成功');
      navigate('/dashboard');
    } catch (error) {
      message.error('注册失败，邮箱已被注册');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>团队陪跑大师</h1>
          <p style={{ color: '#666', marginTop: 8 }}>让团队管理更科学、更客观</p>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <Tabs.TabPane tab="登录" key="login">
            <Form onFinish={handleLogin} layout="vertical">
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效邮箱' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="注册" key="register">
            <Form onFinish={handleRegister} layout="vertical">
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效邮箱' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  注册
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}