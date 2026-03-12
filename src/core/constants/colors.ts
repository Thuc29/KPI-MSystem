/**
 * Bảng màu nhận diện & Bổ trợ (Brand Palette)
 * Áp dụng cho toàn bộ hệ thống Smart KPI
 */

export const BRAND_COLORS = {
  // Màu chủ đạo - Rio Grande (Xanh lá mạ)
  // Màu của năng lượng tái tạo và công nghệ sạch
  primary: '#4C9C2E',
  
  // Màu nhấn mạnh - Dark Charcoal (Xám đen)
  // Dùng cho Logo và văn bản, tạo sự vững chãi, uy tín
  charcoal: '#333333',
  
  // Màu bổ trợ 1 - Apple Green (Xanh táo)
  // Tạo chiều sâu khi đổ bóng hoặc gradient cho màu chủ đạo
  apple: '#2d5f1b',
  
  // Màu bổ trợ 2 - Light Gray (Xám nhạt)
  // Dùng cho các đường kẻ bảng, phân cách hoặc nền phụ
  lightGray: '#E0E0E0',
  
  // Màu tương phản - White (Trắng)
  // Tạo không gian "thở" và sự minh bạch cho thiết kế
  white: '#FFFFFF',
  
  // Màu điểm nhấn - Slate Gray (Xám đá)
  // Màu của kim loại/linh kiện, liên quan đến tính kỹ thuật
  slate: '#708090',
} as const;

/**
 * Màu sắc cho các vai trò người dùng
 * Sử dụng bảng màu brand để đảm bảo tính nhất quán
 */
export const ROLE_COLORS = {
  employee: BRAND_COLORS.slate,    // Xám đá cho nhân viên
  tl: BRAND_COLORS.apple,          // Xanh táo cho Team Leader
  gl: BRAND_COLORS.primary,        // Xanh lá mạ cho Group Leader
  ceo: BRAND_COLORS.charcoal,      // Xám đen cho CEO
} as const;

/**
 * Màu sắc cho trạng thái chung (không dùng cho KPI status)
 * Dùng cho các component UI chung
 */
export const UI_STATUS_COLORS = {
  success: BRAND_COLORS.apple,
  warning: '#FFA500',
  error: '#FF4D4F',
  info: BRAND_COLORS.slate,
  pending: BRAND_COLORS.lightGray,
} as const;

/**
 * Gradient colors
 */
export const GRADIENTS = {
  primary: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.apple} 100%)`,
  dark: `linear-gradient(135deg, ${BRAND_COLORS.charcoal} 0%, ${BRAND_COLORS.slate} 100%)`,
} as const;
