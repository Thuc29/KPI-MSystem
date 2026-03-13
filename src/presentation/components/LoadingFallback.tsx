import { Spin } from 'antd';
import { useTranslation } from '../../infrastructure/i18n';

export const LoadingFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center w-full min-h-[50vh]">
      <Spin size="large" tip={<div className="mt-2 text-gray-500">{t.common?.loading || 'Loading...'}</div>} />
    </div>
  );
};
