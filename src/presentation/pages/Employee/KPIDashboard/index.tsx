import { useEffect, useState } from 'react';
import { Card, Table, Button, Statistic, Row, Col, Tag, Collapse } from 'antd';
import { Plus, Eye, FileText, Clock, CheckCircle, ChevronDown, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../../infrastructure/api';
import { storage } from '../../../../infrastructure/utils';
import { KPIStatusTag } from '../../../components';
import type { IKPIRecord } from '../../../../core/models';
import type { ColumnsType } from 'antd/es/table';

const { Panel } = Collapse;

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
        return kpiList.filter(k => k.employeeId === userId);
      
      case 'tl':
      case 'gl':
      case 'ceo':
        // For managers, show KPIs pending approval or already approved/in progress
        return kpiList.filter(k => 
          k.status === 'pending_approval' || k.status === 'in_progress' || k.status === 'completed' || k.employeeId === userId
        );
      
      default:
        return kpiList;
    }
  };

  const filteredKPIList = getFilteredKPIList();

  // Statistics based on filtered list
  const totalKPIs = filteredKPIList.length;
  const draftKPIs = filteredKPIList.filter(k => k.status === 'draft').length;
  const pendingKPIs = filteredKPIList.filter(k => k.status === 'pending_approval').length;
  const approvedKPIs = filteredKPIList.filter(k => k.status === 'in_progress' || k.status === 'completed').length;
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
      title: 'Cấu trúc KPI',
      key: 'structure',
      width: 180,
      align: 'center',
      render: (_, record) => {
        const hasGroups = record.groups && record.groups.length > 0;
        const groupCount = hasGroups ? record.groups!.length : 0;
        const targetCount = record.targets.length;
        
        return (
          <div className="flex flex-col gap-1">
            {hasGroups ? (
              <>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 rounded-full text-sm font-medium text-purple-700">
                  <FolderOpen size={14} />
                  {groupCount} nhóm
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-blue-700">
                  <FileText size={14} />
                  {targetCount} mục tiêu
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                <FileText size={14} />
                {targetCount} mục tiêu
              </span>
            )}
          </div>
        );
      },
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

  // Expandable row render for KPI groups
  const expandedRowRender = (record: IKPIRecord) => {
    const hasGroups = record.groups && record.groups.length > 0;

    if (!hasGroups) {
      // Show flat list of targets if no groups
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-gray-700">Danh sách mục tiêu:</h4>
          <div className="space-y-2">
            {record.targets.map((target, index) => (
              <div key={target.id} className="bg-white p-3 rounded border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-700">
                        {index + 1}. {target.title}
                      </span>
                      <Tag color="blue">{target.weight}%</Tag>
                      {target.category && (
                        <Tag color="default">{target.category}</Tag>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{target.description}</p>
                    <p className="text-sm">
                      <span className="font-medium">Chỉ tiêu:</span> {target.target} {target.unit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Show grouped structure
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-gray-700">
          Cấu trúc KPI theo nhóm ({record.groups!.length} nhóm):
        </h4>
        <Collapse
          expandIcon={({ isActive }) => (
            <ChevronDown 
              size={18} 
              className={`transition-transform ${isActive ? 'rotate-180' : ''}`} 
            />
          )}
          className="bg-white"
        >
          {record.groups!.map((group, groupIndex) => {
            const groupWeight = group.targets.reduce((sum, t) => sum + t.weight, 0);
            
            return (
              <Panel
                key={group.id}
                header={
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-base text-purple-700">
                        #{groupIndex + 1} {group.name}
                      </span>
                      <Tag color="purple">{group.targets.length} mục tiêu</Tag>
                      <Tag color="green">{groupWeight}%</Tag>
                    </div>
                  </div>
                }
                className="border-l-4 border-l-purple-500"
              >
                {group.description && (
                  <p className="text-sm text-gray-600 italic mb-3 bg-purple-50 p-2 rounded">
                    {group.description}
                  </p>
                )}
                <div className="space-y-2">
                  {group.targets.map((target, targetIndex) => (
                    <div 
                      key={target.id} 
                      className="bg-blue-50 p-3 rounded border-l-4 border-l-blue-400"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-700">
                              {groupIndex + 1}.{targetIndex + 1}. {target.title}
                            </span>
                            <Tag color="blue">{target.weight}%</Tag>
                            {target.category && (
                              <Tag color="default">{target.category}</Tag>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{target.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              <span className="font-medium">Chỉ tiêu:</span> {target.target} {target.unit}
                            </span>
                            {target.measurementMethod && (
                              <span className="text-gray-500">
                                <span className="font-medium">Đo lường:</span> {target.measurementMethod}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            );
          })}
        </Collapse>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Danh sách KPI</h1>
          <p className="text-gray-500">Quản lý và theo dõi hồ sơ KPI</p>
        </div>
        {(userRole === 'employee' || userRole === 'tl') && (
          <Button
            type="primary"
            size="large"
            icon={<Plus size={20} className='mt-1' />}
            onClick={() => navigate('/kpi/create')}
            className="bg-primary hover:bg-primary-dark md:h-9 h-8 px-5 shadow-lg md:text-base text-sm
            hover:shadow-xl transition-all md:rounded-2xl rounded-xl transform hover:-translate-y-1"
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
          expandable={{
            expandedRowRender,
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                type="text"
                size="small"
                icon={
                  <ChevronDown 
                    size={18} 
                    className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                }
                onClick={(e) => onExpand(record, e)}
              />
            ),
          }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (
              <span className="font-medium">
                Tổng <span className="text-red-500">{total}</span> hồ sơ
              </span>
            ),
          }}
          bordered
          scroll={{x:500}}
          className="custom-table"
        />
      </Card>
    </div>
  );
};
