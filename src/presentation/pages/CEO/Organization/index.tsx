import { Card, Progress, Tag, Statistic } from 'antd';
import { Building2, Users, TrendingUp, Award, Target, Briefcase, UserCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../../../../infrastructure/i18n';

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

const budgetAllocation = [
  { dept: 'Sales', budget: 500, spent: 420 },
  { dept: 'Marketing', budget: 350, spent: 280 },
  { dept: 'IT', budget: 600, spent: 550 },
  { dept: 'HR', budget: 250, spent: 200 },
];

export const OrganizationPage = () => {
  const { t } = useTranslation();
  
  const totalEmployees = organizationStructure.reduce((sum, d) => sum + d.employees, 0);
  const totalKPIs = organizationStructure.reduce((sum, d) => sum + d.kpis, 0);
  const avgPerformance = organizationStructure.reduce((sum, d) => sum + d.performance, 0) / organizationStructure.length;
  const totalBudget = organizationStructure.reduce((sum, d) => sum + d.budget, 0);

  const performanceByLevel = [
    { level: t.ceo.organization.performanceLevels.excellent, count: 12, percent: 27 },
    { level: t.ceo.organization.performanceLevels.good, count: 20, percent: 44 },
    { level: t.ceo.organization.performanceLevels.average, count: 10, percent: 22 },
    { level: t.ceo.organization.performanceLevels.needsImprovement, count: 3, percent: 7 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t.ceo.organization.title}</h1>
        <p className="text-gray-600 mt-1">{t.ceo.organization.subtitle}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Statistic
            title={t.ceo.organization.metrics.totalEmployees}
            value={totalEmployees}
            prefix={<Users size={20} className="text-blue-600" />}
            valueStyle={{ color: '#1890ff' }}
            
          />
        </Card>
        <Card>
          <Statistic
            title={t.ceo.organization.metrics.departments}
            value={organizationStructure.length}
            prefix={<Building2 size={20} className="text-purple-600" />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
        <Card>
          <Statistic
            title={t.ceo.organization.metrics.totalKPI}
            value={totalKPIs}
            prefix={<Target size={20} className="text-orange-600" />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
        <Card>
          <Statistic
            title={t.ceo.organization.metrics.avgPerformance}
            value={avgPerformance.toFixed(1)}
            suffix="%"
            prefix={<TrendingUp size={20} className="text-primary" />}
            valueStyle={{ color: '#4C9C2E' }}
          />
        </Card>
      </div>

      {/* Organization Structure */}
      <Card title={t.ceo.organization.structure.title}>
        <div className="space-y-2">
          {organizationStructure.map((dept) => (
            <div key={dept.dept} className="border border-primary/40 bg-primary-dark/5 rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{dept.dept}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase size={14} />
                      <span>{t.ceo.organization.structure.manager}: {dept.manager}</span>
                    </div>
                  </div>
                </div>
                <Tag color="blue" className="text-xs rounded-lg md:text-sm">
                  {dept.employees} {t.ceo.organization.structure.employees}
                </Tag>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2  gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">{t.ceo.organization.structure.performance}</p>
                  <Progress 
                    percent={dept.performance} 
                    strokeColor={dept.performance >= 85 ? '#4C9C2E' : '#FFA500'}
                    size="small"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">{t.ceo.organization.structure.kpiCount}</p>
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-gray-500" />
                    <span className="font-semibold">{dept.kpis}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">{t.ceo.organization.structure.budget}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{dept.budget}M</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">{t.ceo.organization.structure.kpiPerPerson}</p>
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
        <Card title={t.ceo.organization.charts.employeeDistribution}>
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
        <Card title={t.ceo.organization.charts.performanceDistribution}>
          <div className="space-y-4">
            {performanceByLevel.map((level) => (
              <div key={level.level} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-gray-500" />
                    <span className="font-semibold">{level.level}</span>
                  </div>
                  <span className="text-sm text-gray-600">{level.count} {t.ceo.organization.charts.people} ({level.percent}%)</span>
                </div>
                <Progress 
                  percent={level.percent} 
                  strokeColor={
                    level.level === t.ceo.organization.performanceLevels.excellent ? '#4C9C2E' :
                    level.level === t.ceo.organization.performanceLevels.good ? '#1890ff' :
                    level.level === t.ceo.organization.performanceLevels.average ? '#FFA500' :
                    '#FF4D4F'
                  }
                  showInfo={false}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Budget Allocation */}
        <Card title={t.ceo.organization.charts.budgetAllocation} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetAllocation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#4C9C2E" name={t.ceo.organization.charts.budgetLabel} />
              <Bar dataKey="spent" fill="#1890ff" name={t.ceo.organization.charts.spentLabel} />
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
            <p className="text-gray-600 text-sm">{t.ceo.organization.summary.topPerformer}</p>
            <p className="text-xl font-bold text-gray-800">{t.ceo.organization.departments.it}</p>
            <p className="text-sm text-primary">92% {t.ceo.organization.summary.performance}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={32} className="text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm">{t.ceo.organization.summary.largestDept}</p>
            <p className="text-xl font-bold text-gray-800">{t.ceo.organization.departments.sales}</p>
            <p className="text-sm text-blue-600">15 {t.ceo.organization.structure.employees}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target size={32} className="text-orange-600" />
            </div>
            <p className="text-gray-600 text-sm">{t.ceo.organization.summary.totalBudget}</p>
            <p className="text-xl font-bold text-gray-800">{totalBudget}M</p>
            <p className="text-sm text-orange-600">{t.ceo.organization.summary.quarter}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
