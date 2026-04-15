-- SalonLink Initial Schema
-- ネイルサロン向け顧客囲い込みSaaS

-- 店舗情報
create table if not exists salons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade,
  address text,
  phone text,
  email text,
  description text,
  business_hours jsonb default '{}'::jsonb,
  line_channel_id text,
  line_channel_secret text,
  line_access_token text,
  line_liff_id text,
  plan text default 'free' check (plan in ('free', 'light', 'standard')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- スタッフ
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade not null,
  name text not null,
  role text default 'staff',
  email text,
  avatar_url text,
  bio text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 顧客
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade not null,
  name text not null,
  name_kana text,
  phone text,
  email text,
  birthday date,
  gender text,
  line_user_id text,
  source text default 'other' check (source in ('hotpepper', 'line', 'instagram', 'referral', 'walk_in', 'web', 'other')),
  first_visit_date date,
  last_visit_date date,
  visit_count int default 0,
  total_spent int default 0,
  tags text[] default array[]::text[],
  notes text,
  is_line_friend boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_customers_salon on customers(salon_id);
create index if not exists idx_customers_line_user_id on customers(line_user_id);
create index if not exists idx_customers_source on customers(source);

-- メニュー
create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade not null,
  name text not null,
  category text default 'その他',
  price int not null,
  duration_minutes int default 60,
  description text,
  image_url text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 予約
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete set null,
  staff_id uuid references staff(id) on delete set null,
  menu_id uuid references menus(id) on delete set null,
  menu_name text,
  menu_price int,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  source text default 'web' check (source in ('line', 'web', 'phone', 'hotpepper', 'walk_in', 'manual')),
  notes text,
  reminder_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_reservations_salon_date on reservations(salon_id, date);
create index if not exists idx_reservations_customer on reservations(customer_id);

-- カルテ（施術記録）
create table if not exists treatment_records (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete cascade not null,
  staff_id uuid references staff(id) on delete set null,
  reservation_id uuid references reservations(id) on delete set null,
  date date not null,
  menu_items jsonb default '[]'::jsonb,
  total_price int default 0,
  duration_minutes int default 60,
  photos text[] default array[]::text[],
  notes text,
  satisfaction_score int,
  created_at timestamptz default now()
);

create index if not exists idx_treatment_customer on treatment_records(customer_id);

-- クーポン
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade not null,
  title text not null,
  description text,
  discount_type text default 'percent' check (discount_type in ('percent', 'amount')),
  discount_value int not null,
  min_purchase int default 0,
  valid_from date,
  valid_until date,
  max_uses int,
  used_count int default 0,
  target_segment text default 'all',
  code text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- クーポン利用
create table if not exists coupon_uses (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references coupons(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  reservation_id uuid references reservations(id) on delete set null,
  used_at timestamptz default now()
);

-- メッセージ配信
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade not null,
  type text default 'broadcast' check (type in ('broadcast', 'segment', 'individual', 'reminder', 'birthday')),
  title text not null,
  content text not null,
  target_segment text default 'all',
  sent_count int default 0,
  opened_count int default 0,
  clicked_count int default 0,
  status text default 'draft' check (status in ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- デザインギャラリー
create table if not exists nail_designs (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade not null,
  staff_id uuid references staff(id) on delete set null,
  title text not null,
  category text,
  photo_url text,
  tags text[] default array[]::text[],
  likes_count int default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- Row Level Security有効化（開発中は簡略化）
alter table salons enable row level security;
alter table staff enable row level security;
alter table customers enable row level security;
alter table menus enable row level security;
alter table reservations enable row level security;
alter table treatment_records enable row level security;
alter table coupons enable row level security;
alter table coupon_uses enable row level security;
alter table messages enable row level security;
alter table nail_designs enable row level security;

-- オーナーベースのRLSポリシー
create policy "owner_all_salons" on salons for all using (auth.uid() = owner_id);
create policy "owner_all_staff" on staff for all using (exists(select 1 from salons where salons.id = staff.salon_id and salons.owner_id = auth.uid()));
create policy "owner_all_customers" on customers for all using (exists(select 1 from salons where salons.id = customers.salon_id and salons.owner_id = auth.uid()));
create policy "owner_all_menus" on menus for all using (exists(select 1 from salons where salons.id = menus.salon_id and salons.owner_id = auth.uid()));
create policy "owner_all_reservations" on reservations for all using (exists(select 1 from salons where salons.id = reservations.salon_id and salons.owner_id = auth.uid()));
create policy "owner_all_treatments" on treatment_records for all using (exists(select 1 from salons where salons.id = treatment_records.salon_id and salons.owner_id = auth.uid()));
create policy "owner_all_coupons" on coupons for all using (exists(select 1 from salons where salons.id = coupons.salon_id and salons.owner_id = auth.uid()));
create policy "owner_all_coupon_uses" on coupon_uses for all using (exists(select 1 from coupons c join salons s on s.id = c.salon_id where c.id = coupon_uses.coupon_id and s.owner_id = auth.uid()));
create policy "owner_all_messages" on messages for all using (exists(select 1 from salons where salons.id = messages.salon_id and salons.owner_id = auth.uid()));
create policy "owner_all_designs" on nail_designs for all using (exists(select 1 from salons where salons.id = nail_designs.salon_id and salons.owner_id = auth.uid()));

-- 公開読み取りポリシー（予約ページ用）
create policy "public_read_salons" on salons for select using (true);
create policy "public_read_menus" on menus for select using (is_active = true);
create policy "public_read_staff" on staff for select using (is_active = true);
create policy "public_read_designs" on nail_designs for select using (is_published = true);
