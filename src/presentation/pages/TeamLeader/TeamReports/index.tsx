import { useMemo } from 'react';
import { Card, Select, DatePicker, Button, Table, Progress, Row, Col, Statistic, Tag, Tooltip } from 'antd';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Users, Target, Award, FileText, CheckCircle, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from '../../../../infrastructure/i18n';

const { RangePicker } = DatePicker;
const { Option } = Select;

const employeePerformance = [
  { name: 'Nguyễn Văn A', kpis: 5, completed: 4, progress: 85, score: 4.5 },
  { name: 'Trần Thị B', kpis: 4, completed: 3, progress: 78, score: 4.2 },
  { name: 'Lê Văn C', kpis: 6, completed: 5, progress: 92, score: 4.8 },
];

export const TeamReportsPage = () => {
  const { t } = useTranslation();
  
  const performanceData = [
    { month: t.teamLeader.teamReports.month1, completed: 85, inProgress: 10, delayed: 5 },
    { month: t.teamLeader.teamReports.month2, completed: 78, inProgress: 15, delayed: 7 },
    { month: t.teamLeader.teamReports.month3, completed: 92, inProgress: 5, delayed: 3 },
  ];

  const kpiStatusData = [
    { name: t.teamLeader.teamReports.completed, value: 65, color: '#4C9C2E' },
    { name: t.teamLeader.teamReports.inProgress, value: 25, color: '#FFA500' },
    { name: t.teamLeader.teamReports.delayed, value: 10, color: '#FF4D4F' },
  ];

  const trendData = [
    { week: t.teamLeader.teamReports.week.replace('{count}', '1'), performance: 75 },
    { week: t.teamLeader.teamReports.week.replace('{count}', '2'), performance: 78 },
    { week: t.teamLeader.teamReports.week.replace('{count}', '3'), performance: 82 },
    { week: t.teamLeader.teamReports.week.replace('{count}', '4'), performance: 85 },
  ];
  
  const columns: ColumnsType<typeof employeePerformance[0]> = useMemo(() => [
    {
      title: t.teamLeader.teamReports.employee,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 170,
      render: (text) => <span className="font-semibold text-gray-900">{text}</span>,
    },
    {
      title: t.teamLeader.teamReports.totalKPIsLabel,
      dataIndex: 'kpis',
      key: 'kpis',
      align: 'center',
      width: 100,
      render: (value) => <Tag color="blue">{t.teamLeader.teamReports.kpiCount.replace('{count}', String(value))}</Tag>,
    },
    {
      title: t.teamLeader.teamReports.completedLabel,
      dataIndex: 'completed',
      key: 'completed',
      align: 'center',
      width: 120,
      render: (value, record) => (
        <Tooltip title={t.teamLeader.teamReports.completedCount.replace('{completed}', String(value)).replace('{total}', String(record.kpis))}>
          <Tag color="green" className='flex items-center w-fit gap-2 mx-auto' icon={<CheckCircle size={14} />}>
            {value}/{record.kpis}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: t.teamLeader.teamReports.progress,
      dataIndex: 'progress',
      key: 'progress',
      width: 200,
      render: (value) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{t.teamLeader.teamReports.completed}</span>
            <span className="font-semibold">{value}%</span>
          </div>
          <Progress 
            percent={value} 
            size="small"
            strokeColor={{
              '0%': value >= 80 ? '#52c41a' : value >= 60 ? '#1890ff' : '#faad14',
              '100%': value >= 80 ? '#73d13d' : value >= 60 ? '#40a9ff' : '#ffc53d',
            }}
          />
        </div>
      ),
      sorter: (a, b) => a.progress - b.progress,
    },
    {
      title: t.teamLeader.teamReports.rating,
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      width: 120,
      render: (value) => (
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-primary">{value.toFixed(1)}</span>
          <div className="flex gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Award
                key={i}
                size={12}
                className={i < Math.floor(value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
        </div>
      ),
      sorter: (a, b) => a.score - b.score,
    },
  ], [t]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BarChart3 size={32} className="text-primary" />
            {t.teamLeader.teamReports.title}
          </h1>
          <p className="text-gray-500">{t.teamLeader.teamReports.subtitle}</p>
        </div>
        <Button 
          type="primary" 
          icon={<Download size={18} />}
          size="middle"
          className="bg-primary"
        >
          {t.teamLeader.teamReports.exportReport}
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <div className="flex gap-4 flex-wrap">
          <Select defaultValue="all" style={{ width: 200 }} size="middle">
            <Select.Option value="all">{t.teamLeader.teamReports.allEmployees}</Select.Option>
            <Select.Option value="1">Nguyễn Văn A</Select.Option>
            <Select.Option value="2">Trần Thị B</Select.Option>
            <Select.Option value="3">Lê Văn C</Select.Option>
          </Select>
          <RangePicker size="middle" />
          <Select defaultValue="monthly" style={{ width: 150 }} size="middle">
            <Select.Option value="weekly">{t.teamLeader.teamReports.weekly}</Select.Option>
            <Select.Option value="monthly">{t.teamLeader.teamReports.monthly}</Select.Option>
            <Select.Option value="quarterly">{t.teamLeader.teamReports.quarterly}</Select.Option>
          </Select>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-blue-500 !max-h-20 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.teamLeader.teamReports.totalMembers}</span>}
              value={12}
              prefix={<Users size={20} className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontSize: '25px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-purple-500 !max-h-20 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.teamLeader.teamReports.totalKPIs}</span>}
              value={48}
              prefix={<Target size={20} className="text-purple-500" />}
              valueStyle={{ color: '#722ed1', fontSize: '25px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-green-500 !max-h-20 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.teamLeader.teamReports.avgProgress}</span>}
              value={85}
              suffix="%"
              prefix={<TrendingUp size={20} className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontSize: '25px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-orange-500 !max-h-20 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.teamLeader.teamReports.avgScore}</span>}
              value={4.5}
              precision={1}
              prefix={<Award size={20} className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16', fontSize: '25px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Month */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              <span className="font-semibold">{t.teamLeader.teamReports.performanceByMonth}</span>
            </div>
          }
          className="shadow-md"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="completed" fill="#4C9C2E" name={t.teamLeader.teamReports.completed} radius={[8, 8, 0, 0]} />
              <Bar dataKey="inProgress" fill="#FFA500" name={t.teamLeader.teamReports.inProgress} radius={[8, 8, 0, 0]} />
              <Bar dataKey="delayed" fill="#FF4D4F" name={t.teamLeader.teamReports.delayed} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* KPI Status Distribution */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <Target size={20} className="text-primary" />
              <span className="font-semibold">{t.teamLeader.teamReports.kpiStatusDistribution}</span>
            </div>
          }
          className="shadow-md"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={kpiStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {kpiStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Trend */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              <span className="font-semibold">{t.teamLeader.teamReports.performanceTrend}</span>
            </div>
          }
          className="shadow-md"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="performance" 
                stroke="#4C9C2E" 
                strokeWidth={3}
                name={t.teamLeader.teamReports.performance}
                dot={{ fill: '#4C9C2E', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Performers */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <Award size={20} className="text-primary" />
              <span className="font-semibold">{t.teamLeader.teamReports.topPerformers}</span>
            </div>
          }
          className="shadow-md"
        >
          <div className="space-y-4">
            {employeePerformance
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map((emp, index) => (
                <div key={emp.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                    'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{emp.name}</p>
                    <Progress percent={emp.progress} size="small" showInfo={false} strokeColor="#4C9C2E" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{emp.score.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">{t.teamLeader.teamReports.completionRate.replace('{percent}', String(emp.progress))}</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Employee Performance Table */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            <span className="font-semibold">{t.teamLeader.teamReports.employeePerformanceDetail}</span>
          </div>
        }
        className="shadow-md"
      >
        <Table
          columns={columns}
          dataSource={employeePerformance}
          rowKey="name"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t.teamLeader.teamReports.totalEmployees.replace('{count}', String(total)),
          }}
          scroll={{ x: 900 }}
          bordered
          className="custom-table"
        />
      </Card>
    </div>
  );
};
