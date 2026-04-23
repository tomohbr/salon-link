// Zod バリデーションスキーマ集約
import { z } from 'zod';

const trimmed = (max: number) => z.string().trim().min(1).max(max);
const optTrimmed = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const customerCreateSchema = z.object({
  name: trimmed(100),
  nameKana: optTrimmed(100),
  phone: optTrimmed(20),
  email: z.string().trim().email().optional().or(z.literal('')),
  source: z.enum(['hotpepper', 'line', 'instagram', 'referral', 'walk_in', 'web', 'other']).default('other'),
  notes: optTrimmed(2000),
  isLineFriend: z.boolean().optional().default(false),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const menuSchema = z.object({
  name: trimmed(100),
  category: z.string().trim().max(50).default('その他'),
  price: z.coerce.number().int().min(0).max(1_000_000),
  durationMinutes: z.coerce.number().int().min(5).max(480).default(60),
  description: optTrimmed(500),
  isActive: z.boolean().optional().default(true),
});

export const couponSchema = z.object({
  title: trimmed(100),
  description: optTrimmed(500),
  discountType: z.enum(['percent', 'amount']).default('percent'),
  discountValue: z.coerce.number().int().min(0).max(100_000),
  minPurchase: z.coerce.number().int().min(0).max(1_000_000).default(0),
  validFrom: z.string().optional().or(z.literal('')),
  validUntil: z.string().optional().or(z.literal('')),
  maxUses: z.coerce.number().int().min(0).optional().nullable(),
  targetSegment: z.string().default('all'),
  code: optTrimmed(50),
  isActive: z.boolean().optional().default(true),
});

export const reservationSchema = z.object({
  customerId: z.string().optional().nullable(),
  staffId: z.string().optional().nullable(),
  menuId: z.string().optional().nullable(),
  menuName: trimmed(200),
  menuPrice: z.coerce.number().int().min(0).max(1_000_000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  source: z.enum(['line', 'web', 'phone', 'hotpepper', 'walk_in', 'manual']).default('web'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).default('confirmed'),
  externalId: z.string().optional().nullable(),
  notes: optTrimmed(1000),
});

export const paymentRecordSchema = z.object({
  reservationId: z.string(),
  paymentMethod: z.enum(['cash', 'credit', 'qr', 'coin', 'point', 'other']),
  paidAmount: z.coerce.number().int().min(0).max(10_000_000),
  retailAmount: z.coerce.number().int().min(0).max(10_000_000).default(0),
  tip: z.coerce.number().int().min(0).max(1_000_000).default(0),
  designationFee: z.coerce.number().int().min(0).max(100_000).default(0),
});

export const productSchema = z.object({
  name: trimmed(100),
  category: optTrimmed(50),
  brand: optTrimmed(100),
  colorCode: optTrimmed(50),
  price: z.coerce.number().int().min(0).default(0),
  cost: z.coerce.number().int().min(0).default(0),
  stockQty: z.coerce.number().int().min(0).default(0),
  reorderAt: z.coerce.number().int().min(0).default(0),
  isRetail: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export const registerSchema = z.object({
  salonName: trimmed(100),
  name: trimmed(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
  plan: z.enum(['free', 'light', 'standard']).default('light'),
});

export const messageSendSchema = z.object({
  title: trimmed(100),
  content: trimmed(5000),
  targetSegment: z.enum(['all', 'dormant', 'vip', 'new', 'line_friend']).default('all'),
});

export const salonSettingsSchema = z.object({
  name: optTrimmed(100),
  address: optTrimmed(200),
  phone: optTrimmed(20),
  description: optTrimmed(1000),
  lineChannelId: optTrimmed(100),
  lineChannelSecret: optTrimmed(200),
  lineAccessToken: optTrimmed(500),
  lineLiffId: optTrimmed(100),
  businessHours: z.any().optional(),
});

/** FormData をパースして型付きオブジェクトを返すヘルパ */
export function zodParseFormData<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData
): z.infer<T> {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (obj[k] !== undefined) {
      // 複数値は配列化
      const existing = obj[k];
      obj[k] = Array.isArray(existing) ? [...existing, v] : [existing, v];
    } else {
      obj[k] = v;
    }
  }
  // チェックボックス: "on" は true、未送信(undefined)は false
  return schema.parse(obj);
}
