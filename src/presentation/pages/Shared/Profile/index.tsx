import { Card, Form, Input, Button, Select, Avatar } from 'antd';
import { User, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { storage } from '../../../../infrastructure/utils';

const { Option } = Select;

export const ProfilePage = () => {
  const [form] = Form.useForm();
  const userName = storage.getUserName() || 'User';
  const userRole = storage.getUserRole() || 'employee';

  const handleSave = (values: any) => {
    console.log('Profile:', values);
    toast.success('Đã lưu thông tin cá nhân');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <User size={32} className="text-primary" />
          Thông tin cá nhân
        </h1>
        <p className="text-gray-500">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {/* Profile Card */}
      <Card className="shadow-sm">
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
            position: 'Nhân viên',
            joinDate: '01/01/2024',
          }}
          onFinish={handleSave}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <Form.Item name="position" label="Chức vụ">
              <Input size="large" disabled />
            </Form.Item>

            <Form.Item name="joinDate" label="Ngày vào công ty">
              <Input size="large" disabled />
            </Form.Item>
          </div>

          <Form.Item className="mt-6">
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
    </div>
  );
};
