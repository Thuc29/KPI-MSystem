import { useMemo } from 'react';
import { Card, Select, Button, Table, Progress } from 'antd';
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Building2, TrendingUp, Users, Target } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from '../../../../infrastructure/i18n';

const { Option } = Select;

export const DepartmentReportsPage = () => {
  const { t } = useTranslation();

  const departmentComparison = [
    { dept: t.groupLeader.departmentReports.sales, performance: 85, kpis: 45, employees: 15 },
    { dept: t.groupLeader.departmentReports.marketing, performance: 78, kpis: 30, employees: 10 },
    { dept: t.groupLeader.departmentReports.it, performance: 92, kpis: 36, employees: 12 },
    { dept: t.groupLeader.departmentReports.hr, performance: 88, kpis: 24, employees: 8 },
  ];

  const radarData = [
    { 
      metric: t.groupLeader.departmentReports.metricPerformance, 
      [t.groupLeader.departmentReports.sales]: 85, 
      [t.groupLeader.departmentReports.marketing]: 78, 
      [t.groupLeader.departmentReports.it]: 92, 
      [t.groupLeader.departmentReports.hr]: 88 
    },
    { 
      metric: t.groupLeader.departmentReports.metricQuality, 
      [t.groupLeader.departmentReports.sales]: 80, 
      [t.groupLeader.departmentReports.marketing]: 85, 
      [t.groupLeader.departmentReports.it]: 95, 
      [t.groupLeader.departmentReports.hr]: 90 
    },
    { 
      metric: t.groupLeader.departmentReports.metricProgress, 
      [t.groupLeader.departmentReports.sales]: 88, 
      [t.groupLeader.departmentReports.marketing]: 75, 
      [t.groupLeader.departmentReports.it]: 90, 
      [t.groupLeader.departmentReports.hr]: 85 
    },
    { 
      metric: t.groupLeader.departmentReports.metricInnovation, 
      [t.groupLeader.departmentReports.sales]: 70, 
      [t.groupLeader.departmentReports.marketing]: 95, 
      [t.groupLeader.departmentReports.it]: 85, 
      [t.groupLeader.departmentReports.hr]: 75 
    },
    { 
      metric: t.groupLeader.departmentReports.metricCollaboration, 
      [t.groupLeader.departmentReports.sales]: 85, 
      [t.groupLeader.departmentReports.marketing]: 80, 
      [t.groupLeader.departmentReports.it]: 88, 
      [t.groupLeader.departmentReports.hr]: 92 
    },
  ];

  const trendData = [
    { 
      month: t.groupLeader.departmentReports.month1, 
      [t.groupLeader.departmentReports.sales]: 82, 
      [t.groupLeader.departmentReports.marketing]: 75, 
      [t.groupLeader.departmentReports.it]: 88, 
      [t.groupLeader.departmentReports.hr]: 85 
    },
    { 
      month: t.groupLeader.departmentReports.month2, 
      [t.groupLeader.departmentReports.sales]: 83, 
      [t.groupLeader.departmentReports.marketing]: 76, 
      [t.groupLeader.departmentReports.it]: 90, 
      [t.groupLeader.departmentReports.hr]: 86 
    },
    { 
      month: t.groupLeader.departmentReports.month3, 
      [t.groupLeader.departmentReports.sales]: 85, 
      [t.groupLeader.departmentReports.marketing]: 78, 
      [t.groupLeader.departmentReports.it]: 92, 
      [t.groupLeader.departmentReports.hr]: 88 
    },
  ];

  const departmentDetails = [
    { 
      dept: t.groupLeader.departmentReports.salesDept,
      employees: 15,
      kpis: 45,
      completed: 38,
      inProgress: 5,
      delayed: 2,
      performance: 85,
    },
    { 
      dept: t.groupLeader.departmentReports.marketingDept,
      employees: 10,
      kpis: 30,
      completed: 23,
      inProgress: 5,
      delayed: 2,
      performance: 78,
    },
    { 
      dept: t.groupLeader.departmentReports.itDept,
      employees: 12,
      kpis: 36,
      completed: 33,
      inProgress: 2,
      delayed: 1,
      performance: 92,
    },
    { 
      dept: t.groupLeader.departmentReports.hrDept,
      employees: 8,
      kpis: 24,
      completed: 21,
      inProgress: 2,
      delayed: 1,
      performance: 88,
    },
  ];

  const columns: ColumnsType<typeof departmentDetails[0]> = useMemo(() => [
    {
      title: t.groupLeader.departmentReports.department,
      dataIndex: 'dept',
      key: 'dept',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: t.groupLeader.departmentReports.employees,
      dataIndex: 'employees',
      key: 'employees',
      align: 'center',
    },
    {
      title: t.groupLeader.departmentReports.kpis,
      dataIndex: 'kpis',
      key: 'kpis',
      align: 'center',
    },
    {
      title: t.groupLeader.departmentReports.completed,
      dataIndex: 'completed',
      key: 'completed',
      align: 'center',
      render: (value) => <span className="text-green-600 font-semibold">{value}</span>,
    },
    {
      title: t.groupLeader.departmentReports.inProgress,
      dataIndex: 'inProgress',
      key: 'inProgress',
      align: 'center',
      render: (value) => <span className="text-orange-600">{value}</span>,
    },
    {
      title: t.groupLeader.departmentReports.delayed,
      dataIndex: 'delayed',
      key: 'delayed',
      align: 'center',
      render: (value) => <span className="text-red-600">{value}</span>,
    },
    {
      title: t.groupLeader.departmentReports.performance,
      dataIndex: 'performance',
      key: 'performance',
      render: (value) => <Progress percent={value} size="small" />,
    },
  ], [t]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t.groupLeader.departmentReports.title}</h1>
          <p className="text-gray-600 mt-1">{t.groupLeader.departmentReports.subtitle}</p>
        </div>
        <Button type="primary" icon={<Download size={16} />}>
          {t.groupLeader.departmentReports.exportReport}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 flex-wrap">
          <Select defaultValue="all" style={{ width: 200 }}>
            <Option value="all">{t.groupLeader.departmentReports.allDepartments}</Option>
            <Option value="sales">{t.groupLeader.departmentReports.salesDept}</Option>
            <Option value="marketing">{t.groupLeader.departmentReports.marketingDept}</Option>
            <Option value="it">{t.groupLeader.departmentReports.itDept}</Option>
            <Option value="hr">{t.groupLeader.departmentReports.hrDept}</Option>
          </Select>
          <Select defaultValue="q1" style={{ width: 150 }}>
            <Option value="q1">{t.groupLeader.departmentReports.quarter1}</Option>
            <Option value="q2">{t.groupLeader.departmentReports.quarter2}</Option>
            <Option value="q3">{t.groupLeader.departmentReports.quarter3}</Option>
            <Option value="q4">{t.groupLeader.departmentReports.quarter4}</Option>
          </Select>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t.groupLeader.departmentReports.totalDepartments}</p>
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
              <p className="text-gray-600 text-sm">{t.groupLeader.departmentReports.totalEmployees}</p>
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
              <p className="text-gray-600 text-sm">{t.groupLeader.departmentReports.totalKPIs}</p>
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
              <p className="text-gray-600 text-sm">{t.groupLeader.departmentReports.avgPerformance}</p>
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
        <Card title={t.groupLeader.departmentReports.departmentComparison}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="performance" fill="#4C9C2E" name={t.groupLeader.departmentReports.performancePercent} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar Chart */}
        <Card title={t.groupLeader.departmentReports.multiDimensionalAnalysis}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name={t.groupLeader.departmentReports.sales} dataKey={t.groupLeader.departmentReports.sales} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name={t.groupLeader.departmentReports.marketing} dataKey={t.groupLeader.departmentReports.marketing} stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Radar name={t.groupLeader.departmentReports.it} dataKey={t.groupLeader.departmentReports.it} stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
              <Radar name={t.groupLeader.departmentReports.hr} dataKey={t.groupLeader.departmentReports.hr} stroke="#ff7c7c" fill="#ff7c7c" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Trend Line */}
        <Card title={t.groupLeader.departmentReports.performanceTrend} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={t.groupLeader.departmentReports.sales} stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey={t.groupLeader.departmentReports.marketing} stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey={t.groupLeader.departmentReports.it} stroke="#ffc658" strokeWidth={2} />
              <Line type="monotone" dataKey={t.groupLeader.departmentReports.hr} stroke="#ff7c7c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card title={t.groupLeader.departmentReports.detailByDepartment}>
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
