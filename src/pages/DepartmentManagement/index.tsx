import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, Statistic } from 'antd';
import { Building2, Users, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface IDepartment {
  id: string;
  name: string;
  code: string;
  manager: string;
  employeeCount: number;
  kpiCount: number;
  avgPerformance: number;
  status: 'active' | 'inactive';
}

const mockDepartments: IDepartment[] = [
  {
    id: '1',
    name: 'Phòng Kinh doanh',
    code: 'SALES',
    manager: 'Nguyễn Văn A',
    employeeCount: 15,
    kpiCount: 45,
    avgPerformance: 85,
    status: 'active',
  },
  {
    id: '2',
    name: 'Phòng Marketing',
    code: 'MKT',
    manager: 'Trần Thị B',
    employeeCount: 10,
    kpiCount: 30,
    avgPerformance: 78,
    status: 'active',
  },
  {
    id: '3',
    name: 'Phòng IT',
    code: 'IT',
    manager: 'Lê Văn C',
    employeeCount: 12,
    kpiCount: 36,
    avgPerformance: 92,
    status: 'active',
  },
  {
    id: '4',
    name: 'Phòng Nhân sự',
    code: 'HR',
    manager: 'Phạm Thị D',
    employeeCount: 8,
    kpiCount: 24,
    avgPerformance: 88,
    status: 'active',
  },
];

export const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState<IDepartment[]>(mockDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<IDepartment | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingDept(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: IDepartment) => {
    setEditingDept(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bộ phận này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        setDepartments(prev => prev.filter(d => d.id !== id));
      },
    });
  };

  const handleSubmit = async (values: any) => {
    if (editingDept) {
      // Update
      setDepartments(prev => prev.map(d => 
        d.id === editingDept.id ? { ...d, ...values } : d
      ));
    } else {
      // Create
      const newDept: IDepartment = {
        id: Date.now().toString(),
        ...values,
        employeeCount: 0,
        kpiCount: 0,
        avgPerformance: 0,
        status: 'active',
      };
      setDepartments(prev => [...prev, newDept]);
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns: ColumnsType<IDepartment> = [
    {
      title: 'Mã BP',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Tên bộ phận',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Trưởng phòng',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: 'Số nhân viên',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      align: 'center',
      render: (count) => (
        <div className="flex items-center justify-center gap-1">
          <Users size={14} className="text-gray-500" />
          <span>{count}</span>
        </div>
      ),
    },
    {
      title: 'Số KPI',
      dataIndex: 'kpiCount',
      key: 'kpiCount',
      align: 'center',
    },
    {
      title: 'Hiệu suất TB',
      dataIndex: 'avgPerformance',
      key: 'avgPerformance',
      align: 'center',
      render: (value) => (
        <div className="flex items-center justify-center gap-1">
          <TrendingUp size={14} className="text-primary" />
          <span className="font-semibold text-primary">{value}%</span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<Edit size={16} />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            type="link" 
            danger
            icon={<Trash2 size={16} />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
  const totalKPIs = departments.reduce((sum, d) => sum + d.kpiCount, 0);
  const avgPerformance = departments.length > 0
    ? departments.reduce((sum, d) => sum + d.avgPerformance, 0) / departments.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Bộ phận</h1>
          <p className="text-gray-600 mt-1">Quản lý các phòng ban trong tổ chức</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={16} />}
          onClick={handleAdd}
        >
          Thêm bộ phận
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Statistic
            title="Tổng bộ phận"
            value={departments.length}
            prefix={<Building2 size={20} className="text-blue-600" />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng nhân viên"
            value={totalEmployees}
            prefix={<Users size={20} className="text-purple-600" />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng KPI"
            value={totalKPIs}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Hiệu suất TB"
            value={avgPerformance.toFixed(1)}
            suffix="%"
            prefix={<TrendingUp size={20} className="text-primary" />}
            valueStyle={{ color: '#4C9C2E' }}
          />
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingDept ? 'Chỉnh sửa bộ phận' : 'Thêm bộ phận mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Mã bộ phận"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã bộ phận!' }]}
          >
            <Input placeholder="VD: SALES, MKT, IT..." />
          </Form.Item>

          <Form.Item
            label="Tên bộ phận"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên bộ phận!' }]}
          >
            <Input placeholder="VD: Phòng Kinh doanh" />
          </Form.Item>

          <Form.Item
            label="Trưởng phòng"
            name="manager"
            rules={[{ required: true, message: 'Vui lòng chọn trưởng phòng!' }]}
          >
            <Select placeholder="Chọn trưởng phòng">
              <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
              <Option value="Trần Thị B">Trần Thị B</Option>
              <Option value="Lê Văn C">Lê Văn C</Option>
              <Option value="Phạm Thị D">Phạm Thị D</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue="active"
          >
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Ngừng hoạt động</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingDept ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
