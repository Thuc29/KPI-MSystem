import { useState, useEffect } from 'react';
import { Card, Table, Tag, Progress, Button, Avatar, Statistic, Row, Col } from 'antd';
import { Users, Eye, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { kpiApi } from '../../../infrastructure/api';
import { storage } from '../../../infrastructure/utils';
import type { IKPIRecord } from '../../../core/models';
import type { ColumnsType } from 'antd/es/table';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  position: string;
  kpiCount: number;
  avgCompletion: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

export const TeamManagementPage = () => {
  const navigate = useNavigate();
  const [kpiList, setKpiList] = useState<IKPIRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = storage.getUserId();

  useEffect(() => {
    fetchKPIList();
  }, []);

  const fetchKPIList = async () => {
    setLoading(true);
    try {
      const response = await kpiApi.getList();
      if (response.data.data) {
        setKpiList(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Mock team members data
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Trần Văn Bình',
      email: 'employee1@gmail.com',
      position: 'Nhân viên kinh doanh',
      kpiCount: 3,
      avgCompletion: 75,
      status: 'good',
    },
    {
      id: '5',
      name: 'Lê Thị C',
      email: 'employee2@gmail.com',
      position: 'Marketing Executive',
      kpiCount: 2,
      avgCompletion: 85,
      status: 'excellent',
    },
    {
      id: '6',
      name: 'Phạm Văn D',
      email: 'employee3@gmail.com',
      position: 'Content Creator',
      kpiCount: 2,
      avgCompletion: 65,
      status: 'average',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: 'green',
      good: 'blue',
      average: 'orange',
      poor: 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      excellent: 'Xuất sắc',
      good: 'Tốt',
      average: 'Trung bình',
      poor: 'Cần cải thiện',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const columns: ColumnsType<TeamMember> = [
    {
      title: 'Nhân viên',
      key: 'member',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} className="bg-blue-500">
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <div className="font-semibold">{record.name}</div>
            <div className="text-xs text-gray-500">{record.position}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số KPI',
      dataIndex: 'kpiCount',
      key: 'kpiCount',
      align: 'center',
      render: (count) => <Tag color="blue">{count} KPI</Tag>,
    },
    {
      title: 'Hiệu suất',
      key: 'performance',
      render: (_, record) => (
        <div className="space-y-1">
          <Progress 
            percent={record.avgCompletion} 
            strokeColor={
              record.avgCompletion >= 80 ? '#52c41a' :
              record.avgCompletion >= 60 ? '#1890ff' :
              record.avgCompletion >= 40 ? '#faad14' : '#ff4d4f'
            }
          />
        </div>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          icon={<Eye size={14} />}
          onClick={() => navigate(`/team/${record.id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const excellentCount = teamMembers.filter(m => m.status === 'excellent').length;
  const goodCount = teamMembers.filter(m => m.status === 'good').length;
  const avgCount = teamMembers.filter(m => m.status === 'average').length;
  const poorCount = teamMembers.filter(m => m.status === 'poor').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Users size={32} className="text-primary" />
          Quản lý Team
        </h1>
        <p className="text-gray-500">Theo dõi và quản lý hiệu suất của team</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <Statistic
              title="Tổng nhân viên"
              value={teamMembers.length}
              prefix={<Users size={24} className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-green-500">
            <Statistic
              title="Xuất sắc"
              value={excellentCount}
              prefix={<Award size={24} className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-orange-500">
            <Statistic
              title="Trung bình"
              value={avgCount}
              prefix={<TrendingDown size={24} className="text-orange-500" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-red-500">
            <Statistic
              title="Cần cải thiện"
              value={poorCount}
              prefix={<AlertTriangle size={24} className="text-red-500" />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Team Members Table */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary" />
            <span>Danh sách nhân viên</span>
          </div>
        }
        className="shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={teamMembers}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};
