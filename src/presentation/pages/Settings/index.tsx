import { Card, Form, Input, Button, Switch, Divider } from 'antd';
import { Settings as SettingsIcon, Bell, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

export const SettingsPage = () => {
  const [securityForm] = Form.useForm();

  const handlePasswordChange = (values: any) => {
    console.log('Password:', values);
    toast.success('Đã đổi mật khẩu');
    securityForm.resetFields();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <SettingsIcon size={32} className="text-primary" />
          Cài đặt
        </h1>
        <p className="text-gray-500">Quản lý tùy chọn hệ thống</p>
      </div>

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

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Thông báo deadline</div>
              <div className="text-sm text-gray-500">
                Nhắc nhở trước deadline 3 ngày
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
        <Form 
          form={securityForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
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

