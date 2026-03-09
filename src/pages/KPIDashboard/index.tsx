import { useEffect, useState } from 'react';
import { Card, Table, Button, Statistic, Row, Col } from 'antd';
import { Plus, Eye, FileText, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../services';
import { storage } from '../../utils';
import { KPIStatusTag } from '../../components';
import type { IKPIRecord } from '../../types';
import type { ColumnsType } from 'antd/es/table';

export const KPIDashboardPage = () => {
  const navigate = useNavigate();
  const [kpiList, setKpiList] = useState<IKPIRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const userRole = storage.getUserRole() || 'employee';
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
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách KPI');
    } finally {
      setLoading(false);
    }
  };

  // Filter KPI list based on user role
  const getFilteredKPIList = () => {
    switch (userRole) {
      case 'employee':
        // Employee sees only their own KPIs
        return kpiList.filter(k => k.employeeId === userId);
      
      case 'manager':
        // Manager sees KPIs pending their approval + approved KPIs
        return kpiList.filter(k => 
          k.status === 'pending_manager' || k.status === 'approved'
        );
      
      case 'hr':
        // HR sees KPIs pending their approval + approved KPIs
        return kpiList.filter(k => 
          k.status === 'pending_hr' || k.status === 'approved'
        );
      
      case 'ceo':
        // CEO sees KPIs pending their approval + approved KPIs
        return kpiList.filter(k => 
          k.status === 'pending_ceo' || k.status === 'approved'
        );
      
      default:
        return kpiList;
    }
  };

  const filteredKPIList = getFilteredKPIList();

  // Statistics based on filtered list
  const totalKPIs = filteredKPIList.length;
  const draftKPIs = filteredKPIList.filter(k => k.status === 'draft').length;
  const pendingKPIs = filteredKPIList.filter(k =>
    k.status === 'pending_manager' ||
    k.status === 'pending_hr' ||
    k.status === 'pending_ceo'
  ).length;
  const approvedKPIs = filteredKPIList.filter(k => k.status === 'approved').length;
  const rejectedKPIs = filteredKPIList.filter(k => k.status === 'rejected').length;

  const columns: ColumnsType<IKPIRecord> = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'id',
      key: 'id',
      width: 180,
      render: (text) => (
        <span className="font-mono text-sm font-semibold text-primary">{text}</span>
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-xs">
              {text.charAt(0)}
            </span>
          </div>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (text) => (
        <span className="text-gray-600">{text}</span>
      ),
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
      width: 100,
      align: 'center',
      render: (text) => (
        <span className="font-semibold text-gray-700">{text}</span>
      ),
    },
    {
      title: 'Số mục tiêu',
      key: 'targets',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
          <FileText size={14} />
          {record.targets.length}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => <KPIStatusTag status={status} />,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Eye size={16} />}
          onClick={() => navigate(`/kpi/${record.id}`)}
          className="bg-primary hover:bg-primary-dark"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách KPI</h1>
          <p className="text-gray-500">Quản lý và theo dõi hồ sơ KPI</p>
        </div>
        {userRole === 'employee' && (
          <Button
            type="primary"
            size="large"
            icon={<Plus size={20} />}
            onClick={() => navigate('/kpi/create')}
            className="bg-primary hover:bg-primary-dark h-10 px-6 shadow-lg hover:shadow-xl transition-all rounded-2xl transform hover:-translate-y-1"
          >
            Tạo KPI mới
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Tổng số KPI</span>}
              value={totalKPIs}
              prefix={<FileText size={24} className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Bản nháp</span>}
              value={draftKPIs}
              prefix={<Clock size={24} className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Đang chờ duyệt</span>}
              value={pendingKPIs}
              prefix={<Clock size={24} className="text-yellow-500" />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Đã duyệt</span>}
              value={approvedKPIs}
              prefix={<CheckCircle size={24} className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card 
        className="shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            <span className="text-lg font-semibold">Danh sách hồ sơ</span>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredKPIList}
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (
              <span className="font-medium">
                Tổng <span className="text-primary">{total}</span> hồ sơ
              </span>
            ),
          }}
          className="custom-table"
        />
      </Card>
    </div>
  );
};
