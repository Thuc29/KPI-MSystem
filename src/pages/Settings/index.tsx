import { Card, Form, Input, Button, Switch, Select, Divider, Avatar } from 'antd';
import { Settings as SettingsIcon, User, Bell, Lock, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { storage } from '../../utils';

const { Option } = Select;

export const SettingsPage = () => {
  const [form] = Form.useForm();
  const userName = storage.getUserName() || 'User';
  const userRole = storage.getUserRole() || 'employee';

  const handleSave = (values: any) => {
    console.log('Settings:', values);
    toast.success('Đã lưu cài đặt');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <SettingsIcon size={32} className="text-primary" />
          Cài đặt
        </h1>
        <p className="text-gray-500">Quản lý thông tin cá nhân và tùy chọn hệ thống</p>
      </div>

      {/* Profile Settings */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <User size={20} className="text-primary" />
            <span>Thông tin cá nhân</span>
          </div>
        }
        className="shadow-sm"
      >
        <div className="flex items-center gap-4 mb-6">
          <Avatar size={80} icon={<User size={40} />} className="bg-blue-500" />
          <div>
            <h3 className="text-lg font-semibold">{userName}</h3>
            <p className="text-gray-500 capitalize">{userRole}</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: userName,
            email: `${userName.toLowerCase().replace(/\s/g, '')}@company.com`,
            phone: '0123456789',
            department: 'Kinh doanh',
          }}
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input size="large" />
          </Form.Item>

          <Form.Item name="department" label="Phòng ban">
            <Select size="large">
              <Option value="Kinh doanh">Kinh doanh</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="IT">IT</Option>
              <Option value="HR">Nhân sự</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<Save size={16} />}
              size="large"
              className="bg-primary"
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Notification Settings */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            <span>Cài đặt thông báo</span>
          </div>
        }
        className="shadow-sm"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Email thông báo</div>
              <div className="text-sm text-gray-500">
                Nhận thông báo qua email
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Thông báo KPI mới</div>
              <div className="text-sm text-gray-500">
                Khi có KPI mới cần duyệt
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Nhắc nhở Check-in</div>
              <div className="text-sm text-gray-500">
                Nhắc nhở cập nhật tiến độ KPI
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Cảnh báo hiệu suất</div>
              <div className="text-sm text-gray-500">
                Khi tiến độ chậm so với kế hoạch
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            <span>Bảo mật</span>
          </div>
        }
        className="shadow-sm"
      >
        <Form layout="vertical">
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
          >
            <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<Lock size={16} />}
              size="large"
              className="bg-primary"
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
