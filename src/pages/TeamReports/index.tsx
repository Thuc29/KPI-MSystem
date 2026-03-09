import { Card, Select, DatePicker, Button, Table, Progress } from 'antd';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Users, Target, Award } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Option } = Select;

const performanceData = [
  { month: 'T1', completed: 85, inProgress: 10, delayed: 5 },
  { month: 'T2', completed: 78, inProgress: 15, delayed: 7 },
  { month: 'T3', completed: 92, inProgress: 5, delayed: 3 },
];

const kpiStatusData = [
  { name: 'Hoàn thành', value: 65, color: '#4C9C2E' },
  { name: 'Đang thực hiện', value: 25, color: '#FFA500' },
  { name: 'Chậm tiến độ', value: 10, color: '#FF4D4F' },
];

const employeePerformance = [
  { name: 'Nguyễn Văn A', kpis: 5, completed: 4, progress: 85, score: 4.5 },
  { name: 'Trần Thị B', kpis: 4, completed: 3, progress: 78, score: 4.2 },
  { name: 'Lê Văn C', kpis: 6, completed: 5, progress: 92, score: 4.8 },
];

const trendData = [
  { week: 'Tuần 1', performance: 75 },
  { week: 'Tuần 2', performance: 78 },
  { week: 'Tuần 3', performance: 82 },
  { week: 'Tuần 4', performance: 85 },
];

export const TeamReportsPage = () => {
  const columns: ColumnsType<typeof employeePerformance[0]> = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-semibold">{text}</span>,
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
      render: (value, record) => `${value}/${record.kpis}`,
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (value) => <Progress percent={value} size="small" />,
    },
    {
      title: 'Điểm đánh giá',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      render: (value) => (
        <span className="font-semibold text-primary">{value.toFixed(1)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Báo cáo Team</h1>
          <p className="text-gray-600 mt-1">Phân tích hiệu suất và tiến độ của team</p>
        </div>
        <Button type="primary" icon={<Download size={16} />}>
          Xuất báo cáo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 flex-wrap">
          <Select defaultValue="all" style={{ width: 200 }}>
            <Option value="all">Tất cả nhân viên</Option>
            <Option value="1">Nguyễn Văn A</Option>
            <Option value="2">Trần Thị B</Option>
            <Option value="3">Lê Văn C</Option>
          </Select>
          <RangePicker />
          <Select defaultValue="monthly" style={{ width: 150 }}>
            <Option value="weekly">Theo tuần</Option>
            <Option value="monthly">Theo tháng</Option>
            <Option value="quarterly">Theo quý</Option>
          </Select>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng nhân viên</p>
              <p className="text-3xl font-bold text-gray-800">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng KPI</p>
              <p className="text-3xl font-bold text-gray-800">48</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Target size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tiến độ TB</p>
              <p className="text-3xl font-bold text-primary">85%</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Điểm TB</p>
              <p className="text-3xl font-bold text-orange-600">4.5</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Award size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Month */}
        <Card title="Hiệu suất theo tháng">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#4C9C2E" name="Hoàn thành" />
              <Bar dataKey="inProgress" fill="#FFA500" name="Đang thực hiện" />
              <Bar dataKey="delayed" fill="#FF4D4F" name="Chậm tiến độ" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* KPI Status Distribution */}
        <Card title="Phân bổ trạng thái KPI">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={kpiStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {kpiStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Trend */}
        <Card title="Xu hướng hiệu suất">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="performance" 
                stroke="#4C9C2E" 
                strokeWidth={2}
                name="Hiệu suất (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Performers */}
        <Card title="Top performers">
          <div className="space-y-4">
            {employeePerformance
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map((emp, index) => (
                <div key={emp.name} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{emp.name}</p>
                    <Progress percent={emp.progress} size="small" showInfo={false} />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{emp.score.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">{emp.progress}%</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Employee Performance Table */}
      <Card title="Chi tiết hiệu suất nhân viên">
        <Table
          columns={columns}
          dataSource={employeePerformance}
          rowKey="name"
          pagination={false}
        />
      </Card>
    </div>
  );
};
