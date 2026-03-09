import { Card, Table, Button, Select, DatePicker, Tag, Progress, Statistic } from 'antd';
import { DollarSign, TrendingUp, Users, Award, Download } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface ISalaryRecord {
  id: string;
  employeeName: string;
  department: string;
  baseSalary: number;
  kpiBonus: number;
  performanceBonus: number;
  totalSalary: number;
  performance: number;
  rating: string;
}

const mockSalaryData: ISalaryRecord[] = [
  {
    id: '1',
    employeeName: 'Nguyễn Văn A',
    department: 'Sales',
    baseSalary: 15000000,
    kpiBonus: 3000000,
    performanceBonus: 2000000,
    totalSalary: 20000000,
    performance: 85,
    rating: 'excellent',
  },
  {
    id: '2',
    employeeName: 'Trần Thị B',
    department: 'Marketing',
    baseSalary: 12000000,
    kpiBonus: 2000000,
    performanceBonus: 1500000,
    totalSalary: 15500000,
    performance: 78,
    rating: 'good',
  },
  {
    id: '3',
    employeeName: 'Lê Văn C',
    department: 'IT',
    baseSalary: 18000000,
    kpiBonus: 4000000,
    performanceBonus: 2500000,
    totalSalary: 24500000,
    performance: 92,
    rating: 'excellent',
  },
];

const bonusDistribution = [
  { name: 'Lương cơ bản', value: 45000000, color: '#4C9C2E' },
  { name: 'Thưởng KPI', value: 9000000, color: '#FFA500' },
  { name: 'Thưởng hiệu suất', value: 6000000, color: '#1890ff' },
];

const departmentSalary = [
  { dept: 'Sales', total: 60000000, bonus: 15000000 },
  { dept: 'Marketing', total: 46500000, bonus: 10500000 },
  { dept: 'IT', total: 73500000, bonus: 19500000 },
  { dept: 'HR', total: 40000000, bonus: 8000000 },
];

export const SalaryPage = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const columns: ColumnsType<ISalaryRecord> = [
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Bộ phận',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      align: 'right',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Thưởng KPI',
      dataIndex: 'kpiBonus',
      key: 'kpiBonus',
      align: 'right',
      render: (value) => <span className="text-orange-600">{formatCurrency(value)}</span>,
    },
    {
      title: 'Thưởng hiệu suất',
      dataIndex: 'performanceBonus',
      key: 'performanceBonus',
      align: 'right',
      render: (value) => <span className="text-blue-600">{formatCurrency(value)}</span>,
    },
    {
      title: 'Tổng thu nhập',
      dataIndex: 'totalSalary',
      key: 'totalSalary',
      align: 'right',
      render: (value) => <span className="font-bold text-primary">{formatCurrency(value)}</span>,
    },
    {
      title: 'Hiệu suất',
      dataIndex: 'performance',
      key: 'performance',
      render: (value) => <Progress percent={value} size="small" />,
    },
    {
      title: 'Xếp loại',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => {
        const config = {
          excellent: { label: 'Xuất sắc', color: 'success' },
          good: { label: 'Tốt', color: 'processing' },
          average: { label: 'Trung bình', color: 'warning' },
          poor: { label: 'Cần cải thiện', color: 'error' },
        };
        const { label, color } = config[rating as keyof typeof config] || config.average;
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  const totalSalary = mockSalaryData.reduce((sum, r) => sum + r.totalSalary, 0);
  const totalBonus = mockSalaryData.reduce((sum, r) => sum + r.kpiBonus + r.performanceBonus, 0);
  const avgPerformance = mockSalaryData.reduce((sum, r) => sum + r.performance, 0) / mockSalaryData.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quỹ lương & Thưởng</h1>
          <p className="text-gray-600 mt-1">Quản lý lương và thưởng theo hiệu suất KPI</p>
        </div>
        <Button type="primary" icon={<Download size={16} />}>
          Xuất bảng lương
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 flex-wrap">
          <Select defaultValue="all" style={{ width: 200 }}>
            <Option value="all">Tất cả bộ phận</Option>
            <Option value="sales">Sales</Option>
            <Option value="marketing">Marketing</Option>
            <Option value="it">IT</Option>
            <Option value="hr">HR</Option>
          </Select>
          <DatePicker.MonthPicker placeholder="Chọn tháng" style={{ width: 200 }} />
          <Select defaultValue="all" style={{ width: 150 }}>
            <Option value="all">Tất cả</Option>
            <Option value="excellent">Xuất sắc</Option>
            <Option value="good">Tốt</Option>
            <Option value="average">Trung bình</Option>
          </Select>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Statistic
            title="Tổng quỹ lương"
            value={totalSalary}
            prefix={<DollarSign size={20} className="text-primary" />}
            suffix="đ"
            valueStyle={{ color: '#4C9C2E', fontSize: '24px' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng thưởng"
            value={totalBonus}
            prefix={<Award size={20} className="text-orange-600" />}
            suffix="đ"
            valueStyle={{ color: '#fa8c16', fontSize: '24px' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Số nhân viên"
            value={mockSalaryData.length}
            prefix={<Users size={20} className="text-blue-600" />}
            valueStyle={{ color: '#1890ff', fontSize: '24px' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Hiệu suất TB"
            value={avgPerformance.toFixed(1)}
            prefix={<TrendingUp size={20} className="text-purple-600" />}
            suffix="%"
            valueStyle={{ color: '#722ed1', fontSize: '24px' }}
          />
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bonus Distribution */}
        <Card title="Phân bổ quỹ lương">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bonusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {bonusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Salary */}
        <Card title="Lương theo bộ phận">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentSalary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="total" fill="#4C9C2E" name="Tổng lương" />
              <Bar dataKey="bonus" fill="#FFA500" name="Thưởng" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Salary Table */}
      <Card title="Chi tiết lương nhân viên">
        <Table
          columns={columns}
          dataSource={mockSalaryData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          summary={(pageData) => {
            const totalBase = pageData.reduce((sum, r) => sum + r.baseSalary, 0);
            const totalKPI = pageData.reduce((sum, r) => sum + r.kpiBonus, 0);
            const totalPerf = pageData.reduce((sum, r) => sum + r.performanceBonus, 0);
            const total = pageData.reduce((sum, r) => sum + r.totalSalary, 0);

            return (
              <Table.Summary.Row className="bg-gray-50 font-bold">
                <Table.Summary.Cell index={0} colSpan={2}>
                  <span className="font-bold">TỔNG CỘNG</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  {formatCurrency(totalBase)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <span className="text-orange-600">{formatCurrency(totalKPI)}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <span className="text-blue-600">{formatCurrency(totalPerf)}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <span className="text-primary">{formatCurrency(total)}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} colSpan={2} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};
