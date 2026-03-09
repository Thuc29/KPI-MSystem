import { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../../../infrastructure/api';
import { storage } from '../../../infrastructure/utils';
import type { LoginFormValues } from '../../../core/models';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await authApi.login(values.username, values.password);
      
      if (response.data?.statusCode === 200 && response.data.data) {
        const user = response.data.data;
        
        // Save to localStorage
        storage.setToken(user.token || '');
        storage.setUserName(user.name);
        storage.setUserId(user.id);
        storage.setUserRole(user.role);
        storage.setDepartment(user.department);
        
        toast.success(`Chào mừng ${user.name}!`);
        navigate('/kpi');
      } else {
        toast.error('Đăng nhập thất bại');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('./images/backgrlogin.jpg')] bg-cover bg-bottom p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[70rem] grid grid-cols-1 bg-transparent backdrop-blur-sm border border-white rounded-2xl lg:grid-cols-2 gap-0 lg:gap-8 items-center">
        {/* Left Column - Login Form */}
        <div className="w-full flex items-center justify-center  order-2 lg:order-1">
          <Card 
            className="w-full max-w-md hover:shadow border-0 bg-transparent overflow-hidden"
          >
            <div className="p-6 sm:p-8 lg:p-10">
              {/* Logo & Title */}
              <div className="mb-8 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <img 
                        src='./images/logo.png' 
                        alt="Smart KPI Logo" 
                        className="h-auto w-[250px] object-contain" 
                      />
                    </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary-light mb-2">
                  Đăng nhập
                </h2>
                <p className="text-sm text-white">
                  Vui lòng đăng nhập bằng email công ty của bạn
                </p>
              </div>

              {/* Login Form */}
              <Form 
                form={form}
                layout="vertical" 
                onFinish={onFinish}
                size="large"
                initialValues={{ username: '', password: '' }}
                className="w-full"
              >
                <Form.Item
                  name="username"
                  label={<span className="text-sm font-medium text-gray-100">Email</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không đúng định dạng' } 
                  ]}
                >
                  <Input 
                    prefix={<Mail size={18} className="text-gray-400" />} 
                    placeholder="example@vina.co.kr"
                    className="rounded-lg h-9 sm:h-10 bg-gray-50 hover:bg-white focus:bg-white transition-colors border-gray-200"
                  />
                </Form.Item>
                
                <Form.Item 
                  name="password" 
                  label={<span className="text-sm font-semibold text-gray-100">Mật khẩu</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                  className="mb-6"
                >
                  <Input.Password 
                    prefix={<Lock size={18} className="text-gray-400" />}
                    placeholder="Nhập mật khẩu"
                    className="rounded-lg h-9 sm:h-10 bg-gray-50 hover:bg-white focus:bg-white transition-colors border-gray-200"
                  />
                </Form.Item>
                
                <Form.Item className="mb-6">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block
                    loading={loading}
                    className="bg-primary items-center hover:bg-primary-dark border-none h-9 sm:h-10 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    <ArrowRight  className='pt-1'/>
                  </Button>
                </Form.Item>
              </Form>

              
            </div>
          </Card>
        </div>

        {/* Right Column - Illustration */}
        <div className="w-full flex flex-col items-center justify-center order-1 lg:order-2 mb-4 lg:mb-0">
          <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-0">
            {/* Illustration */}
            <div className="relative mb-2 lg:mb-4">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl"></div>
              <img 
                src="./images/login-bg-1.png" 
                alt="KPI Management Illustration" 
                className="relative w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
            
            {/* Title & Description */}
            <div className="text-center lg:text-left space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-white  bg-clip-text text-transparent leading-tight">
              KPI Management System
              </h1>
          
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
