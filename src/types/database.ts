// SalonLink Database Types

export type CustomerSource = 'hotpepper' | 'line' | 'instagram' | 'referral' | 'walk_in' | 'web' | 'other';
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type ReservationSource = 'line' | 'web' | 'phone' | 'hotpepper' | 'walk_in' | 'manual';
export type SalonPlan = 'free' | 'light' | 'standard';

export interface Salon {
  id: string;
  slug: string;
  name: string;
  owner_id: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  business_hours: Record<string, { open: string; close: string; is_closed: boolean }>;
  line_channel_id: string | null;
  line_channel_secret: string | null;
  line_access_token: string | null;
  line_liff_id: string | null;
  plan: SalonPlan;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  salon_id: string;
  name: string;
  role: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Customer {
  id: string;
  salon_id: string;
  name: string;
  name_kana: string | null;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  gender: string | null;
  line_user_id: string | null;
  source: CustomerSource;
  first_visit_date: string | null;
  last_visit_date: string | null;
  visit_count: number;
  total_spent: number;
  tags: string[];
  notes: string | null;
  is_line_friend: boolean;
  created_at: string;
  updated_at: string;
}

export interface Menu {
  id: string;
  salon_id: string;
  name: string;
  category: string;
  price: number;
  duration_minutes: number;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Reservation {
  id: string;
  salon_id: string;
  customer_id: string | null;
  staff_id: string | null;
  menu_id: string | null;
  menu_name: string | null;
  menu_price: number | null;
  date: string;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  source: ReservationSource;
  notes: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface TreatmentRecord {
  id: string;
  salon_id: string;
  customer_id: string;
  staff_id: string | null;
  reservation_id: string | null;
  date: string;
  menu_items: { name: string; price: number }[];
  total_price: number;
  duration_minutes: number;
  photos: string[];
  notes: string | null;
  satisfaction_score: number | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  salon_id: string;
  title: string;
  description: string | null;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  min_purchase: number;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  target_segment: string;
  code: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  salon_id: string;
  type: 'broadcast' | 'segment' | 'individual' | 'reminder' | 'birthday';
  title: string;
  content: string;
  target_segment: string;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface NailDesign {
  id: string;
  salon_id: string;
  staff_id: string | null;
  title: string;
  category: string | null;
  photo_url: string | null;
  tags: string[];
  likes_count: number;
  is_published: boolean;
  created_at: string;
}
