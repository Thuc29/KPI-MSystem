import { Card, Progress, Tag, Statistic } from 'antd';
import { Building2, Users, TrendingUp, Award, Target, Briefcase, UserCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const organizationStructure = [
  {
    dept: 'Sales',
    manager: 'Nguyễn Văn A',
    employees: 15,
    performance: 85,
    kpis: 45,
    budget: 500,
  },
  {
    dept: 'Marketing',
    manager: 'Trần Thị B',
    employees: 10,
    performance: 78,
    kpis: 30,
    budget: 350,
  },
  {
    dept: 'IT',
    manager: 'Lê Văn C',
    employees: 12,
    performance: 92,
    kpis: 36,
    budget: 600,
  },
  {
    dept: 'HR',
    manager: 'Phạm Thị D',
    employees: 8,
    performance: 88,
    kpis: 24,
    budget: 250,
  },
];

const employeeDistribution = [
  { name: 'Sales', value: 15, color: '#4C9C2E' },
  { name: 'Marketing', value: 10, color: '#1890ff' },
  { name: 'IT', value: 12, color: '#722ed1' },
  { name: 'HR', value: 8, color: '#fa8c16' },
];

const performanceByLevel = [
  { level: 'Xuất sắc', count: 12, percent: 27 },
  { level: 'Tốt', count: 20, percent: 44 },
  { level: 'Trung bình', count: 10, percent: 22 },
  { level: 'Cần cải thiện', count: 3, percent: 7 },
];

const budgetAllocation = [
  { dept: 'Sales', budget: 500, spent: 420 },
  { dept: 'Marketing', budget: 350, spent: 280 },
  { dept: 'IT', budget: 600, spent: 550 },
  { dept: 'HR', budget: 250, spent: 200 },
];

export const OrganizationPage = () => {
  const totalEmployees = organizationStructure.reduce((sum, d) => sum + d.employees, 0);
  const totalKPIs = organizationStructure.reduce((sum, d) => sum + d.kpis, 0);
  const avgPerformance = organizationStructure.reduce((sum, d) => sum + d.performance, 0) / organizationStructure.length;
  const totalBudget = organizationStructure.reduce((sum, d) => sum + d.budget, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan Tổ chức</h1>
        <p className="text-gray-600 mt-1">Cấu trúc và hiệu suất tổ chức</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Statistic
            title="Tổng nhân viên"
            value={totalEmployees}
            prefix={<Users size={20} className="text-blue-600" />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Số bộ phận"
            value={organizationStructure.length}
            prefix={<Building2 size={20} className="text-purple-600" />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng KPI"
            value={totalKPIs}
            prefix={<Target size={20} className="text-orange-600" />}
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

      {/* Organization Structure */}
      <Card title="Cấu trúc tổ chức">
        <div className="space-y-4">
          {organizationStructure.map((dept) => (
            <div key={dept.dept} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{dept.dept}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase size={14} />
                      <span>Trưởng phòng: {dept.manager}</span>
                    </div>
                  </div>
                </div>
                <Tag color="blue" className="text-sm">
                  {dept.employees} nhân viên
                </Tag>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Hiệu suất</p>
                  <Progress 
                    percent={dept.performance} 
                    strokeColor={dept.performance >= 85 ? '#4C9C2E' : '#FFA500'}
                    size="small"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Số KPI</p>
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-gray-500" />
                    <span className="font-semibold">{dept.kpis}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Ngân sách (M)</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{dept.budget}M</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">KPI/Người</p>
                  <div className="flex items-center gap-2">
                    <UserCircle size={16} className="text-gray-500" />
                    <span className="font-semibold">{(dept.kpis / dept.employees).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Distribution */}
        <Card title="Phân bổ nhân sự">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={employeeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }: any) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {employeeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Distribution */}
        <Card title="Phân bổ hiệu suất">
          <div className="space-y-4">
            {performanceByLevel.map((level) => (
              <div key={level.level} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-gray-500" />
                    <span className="font-semibold">{level.level}</span>
                  </div>
                  <span className="text-sm text-gray-600">{level.count} người ({level.percent}%)</span>
                </div>
                <Progress 
                  percent={level.percent} 
                  strokeColor={
                    level.level === 'Xuất sắc' ? '#4C9C2E' :
                    level.level === 'Tốt' ? '#1890ff' :
                    level.level === 'Trung bình' ? '#FFA500' :
                    '#FF4D4F'
                  }
                  showInfo={false}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Budget Allocation */}
        <Card title="Phân bổ ngân sách" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetAllocation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#4C9C2E" name="Ngân sách (M)" />
              <Bar dataKey="spent" fill="#1890ff" name="Đã sử dụng (M)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award size={32} className="text-green-600" />
            </div>
            <p className="text-gray-600 text-sm">Top Performer</p>
            <p className="text-xl font-bold text-gray-800">Phòng IT</p>
            <p className="text-sm text-primary">92% hiệu suất</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={32} className="text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm">Bộ phận lớn nhất</p>
            <p className="text-xl font-bold text-gray-800">Phòng Sales</p>
            <p className="text-sm text-blue-600">15 nhân viên</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target size={32} className="text-orange-600" />
            </div>
            <p className="text-gray-600 text-sm">Tổng ngân sách</p>
            <p className="text-xl font-bold text-gray-800">{totalBudget}M</p>
            <p className="text-sm text-orange-600">Quý 3/2024</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
