import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select, Tag, Space, Statistic } from 'antd';
import { Library, Plus, Eye, Edit, Trash2, Search, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { storage } from '../../utils';
import { mockKPITemplates } from '../../services/mockTemplates';
import type { IKPITemplate } from '../../types';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

export const KPILibraryPage = () => {
  const [templates, setTemplates] = useState<IKPITemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<IKPITemplate[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const userRole = storage.getUserRole();
  const isHR = userRole === 'hr';

  useEffect(() => {
    setTemplates(mockKPITemplates);
    setFilteredTemplates(mockKPITemplates);
  }, []);

  useEffect(() => {
    let filtered = [...templates];
    if (searchText) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(t => t.department === filterDepartment);
    }
    setFilteredTemplates(filtered);
  }, [searchText, filterDepartment, templates]);

  const departments = Array.from(new Set(templates.map(t => t.department)));

  const columns: ColumnsType<IKPITemplate> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-semibold text-primary">{text}</div>
          <div className="text-xs text-gray-500">{record.position}</div>
        </div>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },

    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: 'Trọng số',
      dataIndex: 'suggestedWeight',
      key: 'suggestedWeight',
      align: 'center',
      render: (weight) => <Tag color="orange">{weight}%</Tag>,
    },
    {
      title: 'Lượt dùng',
      dataIndex: 'usageCount',
      key: 'usageCount',
      align: 'center',
      sorter: (a, b) => b.usageCount - a.usageCount,
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<Eye size={14} />} />
          {!isHR && (
            <Button
              type="primary"
              size="small"
              icon={<Copy size={14} />}
              onClick={() => toast.success(`Đã sao chép mẫu "${record.title}"`)}
              className="bg-primary"
            >
              Sử dụng
            </Button>
          )}
          {isHR && (
            <>
              <Button size="small" icon={<Edit size={14} />} />
              <Button danger size="small" icon={<Trash2 size={14} />} />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Library size={32} className="text-primary" />
            Thư viện KPI
          </h1>
          <p className="text-gray-500">
            {isHR ? 'Quản lý mẫu KPI' : 'Tham khảo mẫu KPI có sẵn'}
          </p>
        </div>
        {isHR && (
          <Button
            type="primary"
            size="large"
            icon={<Plus size={20} />}
            className="bg-primary"
          >
            Tạo mẫu mới
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Statistic title="Tổng số mẫu" value={templates.length} />
        </Card>
        <Card>
          <Statistic title="Phòng ban" value={departments.length} />
        </Card>
        <Card>
          <Statistic title="Mẫu phổ biến" value={5} />
        </Card>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Tìm kiếm mẫu KPI..."
            prefix={<Search size={16} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filterDepartment}
            onChange={setFilterDepartment}
            style={{ width: 200 }}
          >
            <Option value="all">Tất cả phòng ban</Option>
            {departments.map(dept => (
              <Option key={dept} value={dept}>{dept}</Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTemplates}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};
