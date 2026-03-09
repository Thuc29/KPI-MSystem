import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại."
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate('/kpi')}
            className="bg-primary"
          >
            Về trang chủ
          </Button>
        }
      />
    </div>
  );
};
