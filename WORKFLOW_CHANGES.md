# Tài liệu Thay đổi Luồng Hệ thống KPI

## Tổng quan
Hệ thống đã được điều chỉnh từ phương pháp tự chấm điểm cuối kỳ sang **Quản trị theo tiến độ thực tế (Progress-based)** với các đặc điểm:

- ✅ Tiến độ tự động dựa trên % hoàn thành công việc nhỏ (Tasks/Checklist)
- ✅ Minh bạch & Real-time tracking
- ✅ Phê duyệt 1 cấp (Direct Manager Approval)
- ✅ 4 cấp phân quyền: Employee → TL → GL → CEO

---

## I. CẤU TRÚC DỮ LIỆU MỚI

### 1. Models đã cập nhật

#### `IKPIRecord` - Thêm fields:
```typescript
managerId?: string;           // ID quản lý trực tiếp
managerName?: string;         // Tên quản lý
isFrozen?: boolean;           // Đóng băng KPI (offboarding)
frozenAt?: string;
frozenReason?: string;
```

#### `IKPITarget` - Thêm fields:
```typescript
tasks?: ITaskItem[];                // Danh sách công việc nhỏ
adjustmentRequested?: boolean;      // Yêu cầu điều chỉnh giữa kỳ
adjustmentReason?: string;
adjustmentApprovedAt?: string;
```

#### `ITaskItem` - Model mới cho công việc nhỏ:
```typescript
interface ITaskItem {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  status: TaskStatus;                    // to_do | pending_verify | verified | overdue
  evidenceUrl?: string;
  evidenceFiles?: IAttachment[];
  evidenceMessage?: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  appealMessage?: string;                // Khiếu nại
  appealedAt?: string;
  extensionRequested?: boolean;          // Xin gia hạn
  extensionReason?: string;
  newDeadline?: string;
}
```

#### `IUser` - Thêm fields:
```typescript
position?: string;
managerId?: string;
managerName?: string;
teamMembers?: string[];        // Danh sách nhân viên quản lý
delegations?: IDelegation[];   // Ủy quyền
isActive?: boolean;
```

#### `IDelegation` - Model mới cho ủy quyền:
```typescript
interface IDelegation {
  id: string;
  delegatorId: string;
  delegatorName: string;
  delegateId: string;
  delegateName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}
```

---

## II. LUỒNG CÔNG VIỆC MỚI

### Giai đoạn 1: Lập Kế hoạch & Phê duyệt (Planning Phase)

```
Employee tạo KPI → Chia nhỏ thành Tasks → Gửi TL
    ↓
TL duyệt → Đồng ý: [Đang thực hiện] / Từ chối: Trả lại
    ↓
TL lập KPI của Team → Gửi GL
    ↓
GL duyệt KPI của TL → Lập KPI của Khối → Gửi CEO
    ↓
CEO duyệt → Kết thúc Planning
```

**Quy tắc:**
- Mỗi KPI phải có ít nhất 1 Task
- Phê duyệt chỉ 1 cấp (Direct Manager)
- Không có phê duyệt vượt cấp trong giai đoạn này

### Giai đoạn 2: Thực thi & Cập nhật Tiến độ (Execution Phase)

```
Employee hoàn thành Task → Đính kèm minh chứng → [Chờ xác nhận]
    ↓
TL nghiệm thu → Đạt: [Xác nhận] / Chưa đạt: [Yêu cầu làm lại]
    ↓
Hệ thống tự động cập nhật % hoàn thành
    ↓
Dashboard GL & CEO tự động cập nhật Real-time
```

**Công thức tính tiến độ:**
```typescript
// Tiến độ 1 Target = (Số task verified / Tổng số task) * 100
targetCompletion = (verifiedTasks / totalTasks) * 100

// Tiến độ tổng KPI = Tổng có trọng số
kpiCompletion = Σ(targetCompletion * weight) / Σ(weight)
```

---

## III. XỬ LÝ EDGE CASES

### 1. Thay đổi giữa kỳ (Mid-cycle Adjustment)
- Employee tạo yêu cầu Thêm/Sửa/Xóa task
- TL duyệt → Hệ thống tính lại % tự động
- Tasks đã hoàn thành giữ nguyên trạng thái

### 2. Quản lý vắng mặt (Manager Absence)
**Cơ chế Ủy quyền:**
- TL/GL/CEO có thể ủy quyền cho người khác
- Thiết lập thời gian bắt đầu/kết thúc

**Cơ chế Vượt cấp (Escalation):**
- Task ở trạng thái "Chờ xác nhận" > 48h
- Hệ thống tự động gửi thông báo lên cấp trên
- GL có thể nghiệm thu thay TL

### 3. Trễ hạn khách quan (External Delays)
- Employee bấm "Xin gia hạn" trước deadline
- TL duyệt → Deadline mới được cập nhật
- Trạng thái quay lại [Đang thực hiện]

### 4. Bất đồng nghiệm thu (Disagreement)
- Employee không đồng ý với TL → Bấm "Khiếu nại"
- Thông báo gửi lên GL
- GL là người phán xử cuối cùng

### 5. Thay đổi nhân sự (Onboarding/Offboarding)
**Nghỉ việc:**
- Quản lý bấm "Đóng băng" (Freeze)
- Tiến độ tại thời điểm nghỉ được chốt cứng

**Chuyển team:**
- KPI team cũ đóng lại
- Thiết lập KPI mới với TL mới

---

## IV. API ENDPOINTS MỚI

### Task Management APIs
```typescript
// taskApi.ts
- getTasksByTarget(targetId)
- createTask(targetId, taskData)
- updateTask(taskId, taskData)
- submitTaskCompletion(taskId, evidence)
- verifyTask(taskId, verifierId)
- rejectTask(taskId, rejectorId, reason)
- requestExtension(request)
- approveExtension(taskId)
- appealTask(appeal)
- requestAdjustment(request)
- deleteTask(taskId)
```

---

## V. COMPONENTS MỚI

### 1. `TaskList.tsx`
Hiển thị danh sách tasks với các actions:
- Employee: Báo cáo hoàn thành, Xin gia hạn, Khiếu nại
- Manager: Xác nhận, Từ chối

### 2. `ProgressBar.tsx`
Thanh tiến độ với:
- Màu sắc theo % (đỏ < 50%, vàng 50-80%, xanh > 80%)
- Hiển thị trend (tăng/giảm)

### 3. `KPITargetCard.tsx`
Card hiển thị 1 Target với:
- Thông tin target
- Danh sách tasks
- Thêm/Sửa/Xóa tasks
- Progress bar

---

## VI. HELPER FUNCTIONS

### `taskHelpers.ts`
```typescript
- calculateTaskCompletionRate(tasks)      // Tính % hoàn thành
- calculateKPICompletionRate(targets)     // Tính % tổng KPI
- isTaskOverdue(task)                     // Check quá hạn
- getOverdueTasksCount(tasks)
- getPendingVerificationCount(tasks)
- updateTargetCompletionFromTasks(target)
- formatDeadline(deadline)                // Format hiển thị
```

### `workflowHelpers.ts`
```typescript
- getDirectApprover(employeeRole)         // Lấy người duyệt trực tiếp
- canApproveKPI(userRole, kpiRecord)
- canViewKPI(userRole, userId, kpiRecord)
- getDashboardScope(role)                 // personal/team/department/company
- canEditKPI(kpiRecord, userId)
- canSubmitKPI(kpiRecord, userId)
- canRequestAdjustment(kpiRecord)
- getEscalationManager(currentApproverRole)
- canDelegate(userRole)
- canFreezeKPI(userRole)
```

---

## VII. REDUX STORE MỚI

### `taskSlice.ts`
```typescript
Actions:
- setTasks(tasks)
- addTask(task)
- updateTask(task)
- removeTask(taskId)
- markTaskComplete(taskId, evidence)
- verifyTask(taskId, verifiedBy)
- rejectTask(taskId, rejectedBy, reason)
```

---

## VIII. PHÂN QUYỀN & DASHBOARD

### Employee (Cấp 1)
- Xem: KPI cá nhân
- Thao tác: Tạo KPI, Thêm tasks, Báo cáo hoàn thành, Xin gia hạn, Khiếu nại

### Team Leader (Cấp 2)
- Xem: KPI bản thân + toàn bộ nhân viên trong team
- Thao tác: Duyệt KPI nhân viên, Nghiệm thu tasks, Ủy quyền

### Group Leader (Cấp 3)
- Xem: KPI bản thân + tiến độ tổng khối + chi tiết TL trực thuộc
- Thao tác: Duyệt KPI của TL, Phán xử khiếu nại, Ủy quyền

### CEO (Cấp 4)
- Xem: Dashboard tổng toàn công ty + tiến độ từng khối
- Thao tác: Duyệt KPI của GL, Ủy quyền

---

## IX. TRẠNG THÁI (STATUS)

### KPI Status
- `draft`: Đang soạn thảo
- `pending_approval`: Chờ phê duyệt
- `in_progress`: Đang thực hiện
- `completed`: Hoàn thành
- `rejected`: Bị từ chối

### Task Status
- `to_do`: Cần làm
- `pending_verify`: Chờ xác nhận
- `verified`: Hoàn tất
- `overdue`: Quá hạn

---

## X. NEXT STEPS - CẦN HOÀN THIỆN

### 1. Cập nhật UI Pages
- [ ] `EmployeeDashboard` - Thêm task management
- [ ] `KPIDashboard` - Hiển thị progress real-time
- [ ] `Approval` - Workflow duyệt 1 cấp
- [ ] `Progress` - Thay thế check-in bằng task verification

### 2. Notification System
- [ ] Thông báo khi task pending verify
- [ ] Thông báo escalation (48h timeout)
- [ ] Thông báo khiếu nại
- [ ] Thông báo gia hạn deadline

### 3. Dashboard Real-time
- [ ] CEO Dashboard - Tổng quan công ty
- [ ] GL Dashboard - Tổng quan khối
- [ ] TL Dashboard - Tổng quan team
- [ ] Auto-refresh khi có task verified

### 4. Mock Data
- [ ] Cập nhật mockUsers với managerId, teamMembers
- [ ] Thêm mock tasks vào KPI targets
- [ ] Mock delegations data

### 5. Testing
- [ ] Test workflow phê duyệt 1 cấp
- [ ] Test tính toán % tự động
- [ ] Test escalation mechanism
- [ ] Test freeze KPI

---

## XI. MIGRATION GUIDE

Nếu có dữ liệu cũ, cần:

1. **Thêm managerId vào users**
2. **Convert currentValue/completionRate sang tasks**
3. **Thiết lập direct approver cho mỗi KPI**
4. **Migrate progress check-ins sang task verifications**

---

**Ngày cập nhật:** 2026-03-10
**Phiên bản:** 2.0.0 - Progress-based System
