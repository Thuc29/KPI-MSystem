import { Card, Select, Progress, Tag } from 'antd';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Building2, Users, Target, Award, DollarSign, Activity } from 'lucide-react';

const { Option } = Select;

const companyMetrics = [
  { metric: 'Hiệu suất', value: 85, target: 90 },
  { metric: 'Chất lượng', value: 88, target: 85 },
  { metric: 'Tiến độ', value: 82, target: 80 },
  { metric: 'Sáng tạo', value: 78, target: 75 },
  { metric: 'Hợp tác', value: 90, target: 85 },
  { metric: 'Khách hàng', value: 92, target: 90 },
];

const departmentPerformance = [
  { dept: 'Sales', q1: 82, q2: 85, q3: 88, target: 85 },
  { dept: 'Marketing', q1: 75, q2: 78, q3: 80, target: 80 },
  { dept: 'IT', q1: 88, q2: 90, q3: 92, target: 90 },
  { dept: 'HR', q1: 85, q2: 86, q3: 88, target: 85 },
];

const monthlyTrend = [
  { month: 'T1', revenue: 850, kpi: 82, employees: 42 },
  { month: 'T2', revenue: 920, kpi: 85, employees: 43 },
  { month: 'T3', revenue: 980, kpi: 88, employees: 45 },
  { month: 'T4', revenue: 1050, kpi: 90, employees: 45 },
];

const topPerformers = [
  { name: 'Lê Văn C', dept: 'IT', score: 4.8, kpis: 6, completed: 6 },
  { name: 'Phạm Thị D', dept: 'HR', score: 4.6, kpis: 5, completed: 5 },
  { name: 'Nguyễn Văn A', dept: 'Sales', score: 4.5, kpis: 5, completed: 4 },
];

export const ExecutiveDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan hiệu suất toàn công ty</p>
        </div>
        <Select defaultValue="q3" style={{ width: 150 }}>
          <Option value="q1">Quý 1/2024</Option>
          <Option value="q2">Quý 2/2024</Option>
          <Option value="q3">Quý 3/2024</Option>
          <Option value="q4">Quý 4/2024</Option>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-primary">3.8B</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-green-600" />
                <span className="text-xs text-green-600">+12.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <DollarSign size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Hiệu suất TB</p>
              <p className="text-3xl font-bold text-blue-600">85.8%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-green-600" />
                <span className="text-xs text-green-600">+3.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng nhân viên</p>
              <p className="text-3xl font-bold text-purple-600">45</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-green-600" />
                <span className="text-xs text-green-600">+2</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">KPI hoàn thành</p>
              <p className="text-3xl font-bold text-orange-600">92%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown size={14} className="text-red-600" />
                <span className="text-xs text-red-600">-1.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Target size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Radar */}
        <Card title="Chỉ số tổng thể công ty">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={companyMetrics}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="Thực tế" 
                dataKey="value" 
                stroke="#4C9C2E" 
                fill="#4C9C2E" 
                fillOpacity={0.6} 
              />
              <Radar 
                name="Mục tiêu" 
                dataKey="target" 
                stroke="#FFA500" 
                fill="#FFA500" 
                fillOpacity={0.3} 
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Performance */}
        <Card title="Hiệu suất theo bộ phận">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="q1" fill="#8884d8" name="Q1" />
              <Bar dataKey="q2" fill="#82ca9d" name="Q2" />
              <Bar dataKey="q3" fill="#4C9C2E" name="Q3" />
              <Bar dataKey="target" fill="#FFA500" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card title="Xu hướng theo tháng">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#4C9C2E" 
              strokeWidth={2}
              name="Doanh thu (M)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="kpi" 
              stroke="#1890ff" 
              strokeWidth={2}
              name="KPI (%)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="employees" 
              stroke="#722ed1" 
              strokeWidth={2}
              name="Nhân viên"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <Card title="Top Performers" className="lg:col-span-2">
          <div className="space-y-2">
            {topPerformers.map((performer, index) => (
              <div key={performer.name} className="flex items-center gap-3 py-1 px-3 bg-gray-100 rounded-xl border border-gray-200">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600 border border-yellow-300' :
                  index === 1 ? 'bg-gray-200 text-gray-600 border border-gray-300' :
                  'bg-orange-100 text-orange-600 border border-orange-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base">{performer.name}</span>
                    <Tag color="blue" className='px-1'>{performer.dept}</Tag>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span>KPI: {performer.completed}/{performer.kpis}</span>
                    <Progress 
                      percent={(performer.completed / performer.kpis) * 100} 
                      size="small" 
                      showInfo={false}
                      className="flex-1 max-w-[200px]"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Award size={20} className="text-primary" />
                    <span className="text-2xl font-bold text-primary">{performer.score}</span>
                  </div>
                  <span className="text-xs text-gray-500">Điểm đánh giá</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Department Summary */}
        <Card title="Tổng quan bộ phận">
          <div className="space-y-4">
            {departmentPerformance.map((dept) => (
              <div key={dept.dept} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-500" />
                    <span className="font-semibold">{dept.dept}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{dept.q3}%</span>
                </div>
                <Progress 
                  percent={dept.q3} 
                  strokeColor={dept.q3 >= dept.target ? '#4C9C2E' : '#FFA500'}
                  size="small"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Target: {dept.target}%</span>
                  <span className={dept.q3 >= dept.target ? 'text-green-600' : 'text-orange-600'}>
                    {dept.q3 >= dept.target ? '✓ Đạt' : '⚠ Chưa đạt'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
