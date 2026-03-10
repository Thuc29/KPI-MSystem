# Hướng dẫn Triển khai Luồng Mới

## Tổng quan
Tài liệu này hướng dẫn cách cập nhật các pages hiện có để phù hợp với luồng Progress-based mới.

---

## I. CẬP NHẬT EMPLOYEE DASHBOARD

### File: `src/presentation/pages/EmployeeDashboard/index.tsx`

#### Thay đổi cần thực hiện:

1. **Import components mới:**
```typescript
import { KPITargetCard, ProgressBar } from '../../components';
import { calculateKPICompletionRate, getPendingVerificationCount, getOverdueTasksCount } from '../../../infrastructure/utils';
```

2. **Hiển thị thống kê tasks:**
```typescript
const totalTasks = kpiRecord.targets.flatMap(t => t.tasks || []).length;
const verifiedTasks = kpiRecord.targets.flatMap(t => t.tasks || []).filter(t => t.status === 'verified').length;
const pendingTasks = getPendingVerificationCount(kpiRecord.targets.flatMap(t => t.tasks || []));
const overdueTasks = getOverdueTasksCount(kpiRecord.targets.flatMap(t => t.tasks || []));
```

3. **Thay thế hiển thị targets bằng KPITargetCard:**
```typescript
{kpiRecord.targets.map(target => (
  <KPITargetCard
    key={target.id}
    target={target}
    onAddTask={handleAddTask}
    onTaskComplete={handleTaskComplete}
    onRequestExtension={handleRequestExtension}
    onAppeal={handleAppeal}
    canEdit={kpiRecord.status === 'draft' || kpiRecord.status === 'rejected'}
  />
))}
```

4. **Thêm handlers:**
```typescript
const handleAddTask = async (targetId: string, taskData: any) => {
  try {
    const response = await taskApi.createTask(targetId, taskData);
    // Update local state
    toast.success('Thêm công việc thành công');
  } catch (error) {
    toast.error('Lỗi khi thêm công việc');
  }
};

const handleTaskComplete = async (taskId: string, evidence: any) => {
  try {
    await taskApi.submitTaskCompletion(taskId, evidence);
    toast.success('Đã gửi báo cáo hoàn thành. Chờ quản lý xác nhận.');
  } catch (error) {
    toast.error('Lỗi khi gửi báo cáo');
  }
};

const handleRequestExtension = async (taskId: string, newDeadline: string, reason: string) => {
  try {
    await taskApi.requestExtension({ taskId, newDeadline, reason });
    toast.success('Đã gửi yêu cầu gia hạn');
  } catch (error) {
    toast.error('Lỗi khi gửi yêu cầu');
  }
};

const handleAppeal = async (taskId: string, message: string) => {
  try {
    await taskApi.appealTask({ taskId, appealMessage: message });
    toast.success('Đã gửi khiếu nại lên cấp trên');
  } catch (error) {
    toast.error('Lỗi khi gửi khiếu nại');
  }
};
```

---

## II. CẬP NHẬT MANAGER DASHBOARD (TL/GL)

### File: `src/presentation/pages/ManagerDashboard/index.tsx`

#### Thay đổi cần thực hiện:

1. **Hiển thị danh sách KPI của team members:**
```typescript
const [teamKPIs, setTeamKPIs] = useState<IKPIRecord[]>([]);

useEffect(() => {
  const fetchTeamKPIs = async () => {
    const response = await kpiApi.getList();
    // Filter KPIs của team members
    const filtered = response.data.data.filter(kpi => 
      user?.teamMembers?.includes(kpi.employeeId)
    );
    setTeamKPIs(filtered);
  };
  fetchTeamKPIs();
}, [user]);
```

2. **Hiển thị pending verifications:**
```typescript
const pendingVerifications = teamKPIs.flatMap(kpi => 
  kpi.targets.flatMap(target => 
    (target.tasks || []).filter(task => task.status === 'pending_verify')
  )
);
```

3. **Thêm verification handlers:**
```typescript
const handleVerifyTask = async (taskId: string) => {
  try {
    await taskApi.verifyTask(taskId, user!.id);
    toast.success('Đã xác nhận công việc hoàn thành');
    // Refresh data
  } catch (error) {
    toast.error('Lỗi khi xác nhận');
  }
};

const handleRejectTask = async (taskId: string, reason: string) => {
  try {
    await taskApi.rejectTask(taskId, user!.id, reason);
    toast.success('Đã yêu cầu làm lại');
    // Refresh data
  } catch (error) {
    toast.error('Lỗi khi từ chối');
  }
};
```

4. **Dashboard overview:**
```typescript
<div className="grid grid-cols-4 gap-4 mb-6">
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-gray-500 text-sm">Tổng KPI</h3>
    <p className="text-2xl font-bold">{teamKPIs.length}</p>
  </div>
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-gray-500 text-sm">Chờ xác nhận</h3>
    <p className="text-2xl font-bold text-yellow-600">{pendingVerifications.length}</p>
  </div>
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-gray-500 text-sm">Tiến độ trung bình</h3>
    <p className="text-2xl font-bold text-green-600">
      {Math.round(teamKPIs.reduce((sum, kpi) => sum + calculateKPICompletionRate(kpi.targets), 0) / teamKPIs.length)}%
    </p>
  </div>
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-gray-500 text-sm">Quá hạn</h3>
    <p className="text-2xl font-bold text-red-600">
      {teamKPIs.flatMap(kpi => kpi.targets.flatMap(t => t.tasks || [])).filter(isTaskOverdue).length}
    </p>
  </div>
</div>
```

---

## III. CẬP NHẬT APPROVAL PAGE

### File: `src/presentation/pages/Approval/index.tsx`

#### Thay đổi cần thực hiện:

1. **Lọc KPI cần duyệt (Direct reports only):**
```typescript
const pendingKPIs = kpiList.filter(kpi => 
  kpi.status === 'pending_approval' && 
  kpi.currentApprover === user?.id
);
```

2. **Hiển thị chi tiết KPI với tasks:**
```typescript
{selectedKPI && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">
      KPI của {selectedKPI.employeeName} - {selectedKPI.position}
    </h3>
    
    {selectedKPI.targets.map(target => (
      <div key={target.id} className="border rounded p-4">
        <h4 className="font-medium mb-2">{target.title}</h4>
        <p className="text-sm text-gray-600 mb-2">{target.description}</p>
        
        {target.tasks && target.tasks.length > 0 ? (
          <div className="mt-3">
            <p className="text-sm font-medium mb-2">Công việc chi tiết:</p>
            <ul className="list-disc list-inside space-y-1">
              {target.tasks.map(task => (
                <li key={task.id} className="text-sm">
                  {task.title} - Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-red-500">⚠️ Chưa có công việc chi tiết</p>
        )}
      </div>
    ))}
    
    <div className="flex gap-3 mt-4">
      <button
        onClick={() => handleApprove(selectedKPI.id)}
        disabled={!canApprove(selectedKPI)}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
      >
        Phê duyệt
      </button>
      <button
        onClick={() => setShowRejectModal(true)}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Từ chối
      </button>
    </div>
  </div>
)}
```

3. **Validation trước khi duyệt:**
```typescript
const canApprove = (kpi: IKPIRecord): boolean => {
  // Kiểm tra mỗi target phải có ít nhất 1 task
  return kpi.targets.every(target => 
    target.tasks && target.tasks.length > 0
  );
};
```

---

## IV. CẬP NHẬT CEO DASHBOARD

### File: `src/presentation/pages/ExecutiveDashboard/index.tsx`

#### Thay đổi cần thực hiện:

1. **Tổng quan toàn công ty:**
```typescript
const companyStats = {
  totalEmployees: allKPIs.length,
  avgCompletion: Math.round(
    allKPIs.reduce((sum, kpi) => sum + calculateKPICompletionRate(kpi.targets), 0) / allKPIs.length
  ),
  onTrack: allKPIs.filter(kpi => calculateKPICompletionRate(kpi.targets) >= 70).length,
  atRisk: allKPIs.filter(kpi => calculateKPICompletionRate(kpi.targets) < 50).length,
};
```

2. **Biểu đồ theo department:**
```typescript
const departmentStats = departments.map(dept => ({
  name: dept,
  kpis: allKPIs.filter(kpi => kpi.department === dept),
  avgCompletion: Math.round(
    allKPIs
      .filter(kpi => kpi.department === dept)
      .reduce((sum, kpi) => sum + calculateKPICompletionRate(kpi.targets), 0) / 
    allKPIs.filter(kpi => kpi.department === dept).length
  ),
}));
```

3. **Real-time updates:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Refresh data every 30 seconds
    fetchAllKPIs();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

---

## V. XÓA/CẬP NHẬT PROGRESS PAGE

### File: `src/presentation/pages/Progress/index.tsx`

#### Thay đổi:

**KHÔNG CẦN trang Progress riêng nữa** vì:
- Tiến độ được cập nhật real-time qua task verification
- Employee cập nhật tiến độ bằng cách hoàn thành tasks
- Manager xác nhận tasks thay vì check-in

**Có thể:**
- Xóa page này hoàn toàn
- Hoặc chuyển thành "Task History" để xem lịch sử các tasks đã hoàn thành

---

## VI. CẬP NHẬT CREATE KPI PAGE

### File: `src/presentation/pages/CreateKPI/index.tsx`

#### Thay đổi cần thực hiện:

1. **Bắt buộc thêm tasks khi tạo target:**
```typescript
const [currentTarget, setCurrentTarget] = useState<IKPITarget | null>(null);
const [tasks, setTasks] = useState<ITaskItem[]>([]);

const handleAddTarget = () => {
  if (tasks.length === 0) {
    toast.error('Vui lòng thêm ít nhất 1 công việc cho mục tiêu này');
    return;
  }
  
  const newTarget: IKPITarget = {
    ...targetFormData,
    id: `target-${Date.now()}`,
    tasks: tasks,
  };
  
  setTargets([...targets, newTarget]);
  setTasks([]);
  setTargetFormData(initialState);
};
```

2. **Form thêm tasks:**
```typescript
<div className="border-t pt-4 mt-4">
  <h4 className="font-medium mb-3">Danh sách công việc chi tiết</h4>
  
  <div className="space-y-2 mb-3">
    {tasks.map((task, index) => (
      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <div>
          <p className="font-medium">{task.title}</p>
          <p className="text-sm text-gray-500">Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}</p>
        </div>
        <button
          onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
          className="text-red-500 hover:text-red-700"
        >
          Xóa
        </button>
      </div>
    ))}
  </div>
  
  <div className="grid grid-cols-2 gap-3">
    <input
      type="text"
      placeholder="Tên công việc"
      value={newTaskTitle}
      onChange={(e) => setNewTaskTitle(e.target.value)}
      className="p-2 border rounded"
    />
    <input
      type="date"
      value={newTaskDeadline}
      onChange={(e) => setNewTaskDeadline(e.target.value)}
      className="p-2 border rounded"
    />
  </div>
  
  <button
    onClick={handleAddTaskToTarget}
    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    + Thêm công việc
  </button>
  
  {tasks.length === 0 && (
    <p className="text-sm text-red-500 mt-2">
      ⚠️ Bắt buộc phải có ít nhất 1 công việc
    </p>
  )}
</div>
```

---

## VII. NOTIFICATIONS

### Thêm vào `src/core/models/notification.ts`:

```typescript
export type NotificationType = 
  | 'kpi_submitted'
  | 'kpi_approved'
  | 'kpi_rejected'
  | 'task_pending_verify'      // NEW
  | 'task_verified'            // NEW
  | 'task_rejected'            // NEW
  | 'extension_requested'      // NEW
  | 'extension_approved'       // NEW
  | 'appeal_submitted'         // NEW
  | 'escalation_timeout';      // NEW
```

### Cập nhật notification messages:

```typescript
const notificationMessages = {
  task_pending_verify: (data) => 
    `${data.employeeName} đã hoàn thành công việc "${data.taskTitle}" và chờ bạn xác nhận`,
  task_verified: (data) => 
    `Công việc "${data.taskTitle}" đã được ${data.managerName} xác nhận`,
  task_rejected: (data) => 
    `Công việc "${data.taskTitle}" cần làm lại. Lý do: ${data.reason}`,
  escalation_timeout: (data) => 
    `Công việc "${data.taskTitle}" chờ xác nhận quá 48h. Vui lòng xử lý ngay.`,
};
```

---

## VIII. TESTING CHECKLIST

### Employee Flow:
- [ ] Tạo KPI với targets và tasks
- [ ] Gửi KPI lên TL
- [ ] Hoàn thành task và đính kèm minh chứng
- [ ] Xin gia hạn deadline
- [ ] Khiếu nại khi bị từ chối
- [ ] Yêu cầu điều chỉnh giữa kỳ

### Manager Flow:
- [ ] Xem danh sách KPI chờ duyệt
- [ ] Duyệt KPI (kiểm tra có tasks)
- [ ] Xác nhận tasks hoàn thành
- [ ] Từ chối tasks với lý do
- [ ] Duyệt yêu cầu gia hạn
- [ ] Xử lý khiếu nại
- [ ] Ủy quyền khi vắng mặt

### Dashboard:
- [ ] Tiến độ tự động cập nhật khi task verified
- [ ] Hiển thị số tasks pending verify
- [ ] Hiển thị tasks overdue
- [ ] Real-time updates (30s interval)

### Edge Cases:
- [ ] Escalation sau 48h
- [ ] Freeze KPI khi nghỉ việc
- [ ] Transfer KPI khi chuyển team
- [ ] Mid-cycle adjustment

---

## IX. MIGRATION SCRIPT (Nếu có dữ liệu cũ)

```typescript
// scripts/migrate-to-progress-based.ts

async function migrateKPIs() {
  const oldKPIs = await fetchOldKPIs();
  
  for (const kpi of oldKPIs) {
    for (const target of kpi.targets) {
      // Convert currentValue/completionRate to tasks
      if (target.completionRate && !target.tasks) {
        const numTasks = 5; // Default 5 tasks per target
        const verifiedTasks = Math.round((target.completionRate / 100) * numTasks);
        
        target.tasks = Array.from({ length: numTasks }, (_, i) => ({
          id: `migrated-task-${i}`,
          title: `Công việc ${i + 1} - ${target.title}`,
          deadline: target.endDate || new Date().toISOString(),
          status: i < verifiedTasks ? 'verified' : 'to_do',
          verifiedAt: i < verifiedTasks ? new Date().toISOString() : undefined,
        }));
      }
    }
    
    await updateKPI(kpi);
  }
}
```

---

**Lưu ý quan trọng:**
1. Backup dữ liệu trước khi migrate
2. Test kỹ trên môi trường dev trước
3. Thông báo cho users về thay đổi luồng
4. Chuẩn bị tài liệu hướng dẫn sử dụng cho end-users
