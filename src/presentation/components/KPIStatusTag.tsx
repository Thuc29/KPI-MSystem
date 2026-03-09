import { Tag } from 'antd';
import { getStatusLabel, getStatusColor } from '../../infrastructure/utils';
import type { KPIStatus } from '../../core/models';

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
