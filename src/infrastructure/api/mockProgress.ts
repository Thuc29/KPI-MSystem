import type { IProgressCheckin } from '../../core/models';

export const mockProgressCheckins: IProgressCheckin[] = [
  {
    id: 'checkin-001',
    kpiId: 'KPI-2026-KI-001',
    targetId: '1',
    currentValue: 325000000,
    targetValue: 500000000,
    completionRate: 65,
    note: 'Đã ký được 3 hợp đồng lớn trong tháng. Tiến độ tốt.',
    challenges: 'Thị trường chậm sau Tết, khách hàng thận trọng trong quyết định.',
    nextSteps: 'Tập trung vào các khách hàng tiềm năng đã có trong pipeline.',
    checkinDate: new Date('2026-03-01').toISOString(),
    checkinBy: '1',
    isOnTrack: true,
  },
  {
    id: 'checkin-002',
    kpiId: 'KPI-2026-KI-001',
    targetId: '1',
    currentValue: 200000000,
    targetValue: 500000000,
    completionRate: 40,
    note: 'Tháng 2 đạt kết quả khả quan.',
    challenges: undefined,
    nextSteps: 'Tiếp tục theo dõi các leads mới.',
    checkinDate: new Date('2026-02-01').toISOString(),
    checkinBy: '1',
    isOnTrack: true,
  },
  {
    id: 'checkin-003',
    kpiId: 'KPI-2026-KI-001',
    targetId: '1',
    currentValue: 80000000,
    targetValue: 500000000,
    completionRate: 16,
    note: 'Tháng đầu năm, khởi đầu chậm.',
    challenges: 'Thị trường chậm sau Tết, nhiều khách hàng nghỉ lễ.',
    nextSteps: 'Chuẩn bị kế hoạch cho tháng 2.',
    checkinDate: new Date('2026-01-01').toISOString(),
    checkinBy: '1',
    isOnTrack: false,
  },
  {
    id: 'checkin-004',
    kpiId: 'KPI-2026-KI-001',
    targetId: '2',
    currentValue: 7,
    targetValue: 10,
    completionRate: 70,
    note: 'Đã phát triển được 7 đại lý mới.',
    challenges: undefined,
    nextSteps: 'Tiếp tục tìm kiếm 3 đại lý còn lại.',
    checkinDate: new Date('2026-03-01').toISOString(),
    checkinBy: '1',
    isOnTrack: true,
  },
  {
    id: 'checkin-005',
    kpiId: 'KPI-2026-KI-001',
    targetId: '3',
    currentValue: 88,
    targetValue: 95,
    completionRate: 92,
    note: 'Tỷ lệ tái ký kết cao, khách hàng hài lòng.',
    challenges: 'Một số khách hàng yêu cầu giảm giá.',
    nextSteps: 'Đàm phán với các khách hàng còn lại.',
    checkinDate: new Date('2026-03-01').toISOString(),
    checkinBy: '1',
    isOnTrack: true,
  },
];

export const getCheckinsByKPI = (kpiId: string): IProgressCheckin[] => {
  return mockProgressCheckins
    .filter(c => c.kpiId === kpiId)
    .sort((a, b) => new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime());
};

export const getCheckinsByTarget = (targetId: string): IProgressCheckin[] => {
  return mockProgressCheckins
    .filter(c => c.targetId === targetId)
    .sort((a, b) => new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime());
};

export const getLatestCheckin = (targetId: string): IProgressCheckin | undefined => {
  const checkins = getCheckinsByTarget(targetId);
  return checkins[0];
};
