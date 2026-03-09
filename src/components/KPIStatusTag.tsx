import { Tag } from 'antd';
import { getStatusLabel, getStatusColor } from '../utils';
import type { KPIStatus } from '../types';

interface KPIStatusTagProps {
  status: KPIStatus;
}

export const KPIStatusTag = ({ status }: KPIStatusTagProps) => {
  return (
    <Tag color={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Tag>
  );
};
