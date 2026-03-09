import { Card, Select, Button, Table, Progress } from 'antd';
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Building2, TrendingUp, Users, Target } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

const departmentComparison = [
  { dept: 'Sales', performance: 85, kpis: 45, employees: 15 },
  { dept: 'Marketing', performance: 78, kpis: 30, employees: 10 },
  { dept: 'IT', performance: 92, kpis: 36, employees: 12 },
  { dept: 'HR', performance: 88, kpis: 24, employees: 8 },
];

const radarData = [
  { metric: 'Hiệu suất', Sales: 85, Marketing: 78, IT: 92, HR: 88 },
  { metric: 'Chất lượng', Sales: 80, Marketing: 85, IT: 95, HR: 90 },
  { metric: 'Tiến độ', Sales: 88, Marketing: 75, IT: 90, HR: 85 },
  { metric: 'Sáng tạo', Sales: 70, Marketing: 95, IT: 85, HR: 75 },
  { metric: 'Hợp tác', Sales: 85, Marketing: 80, IT: 88, HR: 92 },
];

const trendData = [
  { month: 'T1', Sales: 82, Marketing: 75, IT: 88, HR: 85 },
  { month: 'T2', Sales: 83, Marketing: 76, IT: 90, HR: 86 },
  { month: 'T3', Sales: 85, Marketing: 78, IT: 92, HR: 88 },
];

const departmentDetails = [
  { 
    dept: 'Phòng Kinh doanh',
    employees: 15,
    kpis: 45,
    completed: 38,
    inProgress: 5,
    delayed: 2,
    performance: 85,
  },
  { 
    dept: 'Phòng Marketing',
    employees: 10,
    kpis: 30,
    completed: 23,
    inProgress: 5,
    delayed: 2,
    performance: 78,
  },
  { 
    dept: 'Phòng IT',
    employees: 12,
    kpis: 36,
    completed: 33,
    inProgress: 2,
    delayed: 1,
    performance: 92,
  },
  { 
    dept: 'Phòng Nhân sự',
    employees: 8,
    kpis: 24,
    completed: 21,
    inProgress: 2,
    delayed: 1,
    performance: 88,
  },
];

export const DepartmentReportsPage = () => {
  const columns: ColumnsType<typeof departmentDetails[0]> = [
    {
      title: 'Bộ phận',
      dataIndex: 'dept',
      key: 'dept',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employees',
      key: 'employees',
      align: 'center',
    },
    {
      title: 'Tổng KPI',
      dataIndex: 'kpis',
      key: 'kpis',
      align: 'center',
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'completed',
      key: 'completed',
      align: 'center',
      render: (value) => <span className="text-green-600 font-semibold">{value}</span>,
    },
    {
      title: 'Đang thực hiện',
      dataIndex: 'inProgress',
      key: 'inProgress',
      align: 'center',
      render: (value) => <span className="text-orange-600">{value}</span>,
    },
    {
      title: 'Chậm tiến độ',
      dataIndex: 'delayed',
      key: 'delayed',
      align: 'center',
      render: (value) => <span className="text-red-600">{value}</span>,
    },
    {
      title: 'Hiệu suất',
      dataIndex: 'performance',
      key: 'performance',
      render: (value) => <Progress percent={value} size="small" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Báo cáo & Phân tích</h1>
          <p className="text-gray-600 mt-1">Phân tích hiệu suất các bộ phận</p>
        </div>
        <Button type="primary" icon={<Download size={16} />}>
          Xuất báo cáo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 flex-wrap">
          <Select defaultValue="all" style={{ width: 200 }}>
            <Option value="all">Tất cả bộ phận</Option>
            <Option value="sales">Phòng Kinh doanh</Option>
            <Option value="marketing">Phòng Marketing</Option>
            <Option value="it">Phòng IT</Option>
            <Option value="hr">Phòng Nhân sự</Option>
          </Select>
          <Select defaultValue="q1" style={{ width: 150 }}>
            <Option value="q1">Quý 1/2024</Option>
            <Option value="q2">Quý 2/2024</Option>
            <Option value="q3">Quý 3/2024</Option>
            <Option value="q4">Quý 4/2024</Option>
          </Select>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng bộ phận</p>
              <p className="text-3xl font-bold text-gray-800">4</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng nhân viên</p>
              <p className="text-3xl font-bold text-gray-800">45</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng KPI</p>
              <p className="text-3xl font-bold text-gray-800">135</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Target size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Hiệu suất TB</p>
              <p className="text-3xl font-bold text-primary">85.8%</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Comparison */}
        <Card title="So sánh hiệu suất bộ phận">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="performance" fill="#4C9C2E" name="Hiệu suất (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar Chart */}
        <Card title="Phân tích đa chiều">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Sales" dataKey="Sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Marketing" dataKey="Marketing" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Radar name="IT" dataKey="IT" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
              <Radar name="HR" dataKey="HR" stroke="#ff7c7c" fill="#ff7c7c" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Trend Line */}
        <Card title="Xu hướng hiệu suất theo tháng" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Sales" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="Marketing" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="IT" stroke="#ffc658" strokeWidth={2} />
              <Line type="monotone" dataKey="HR" stroke="#ff7c7c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card title="Chi tiết theo bộ phận">
        <Table
          columns={columns}
          dataSource={departmentDetails}
          rowKey="dept"
          pagination={false}
        />
      </Card>
    </div>
  );
};
