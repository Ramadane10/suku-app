-- Supabase schema + RLS + test data for Suku app
-- Run in Supabase SQL editor.

create extension if not exists "pgcrypto";

-- =========================
-- TABLES
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_per_kg numeric(10,2) not null,
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  description text,
  origin text,
  is_organic boolean default false,
  is_featured boolean default false,
  is_new_arrival boolean default false,
  is_best_seller boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  is_primary boolean default false,
  sort_order int default 0
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity_kg numeric(10,2) not null,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  address_line text not null,
  city text not null,
  postal_code text not null,
  country text not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  payment_status text not null default 'pending',
  total_amount numeric(10,2) not null,
  shipping_address_id uuid references public.addresses(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity_kg numeric(10,2) not null,
  total_price numeric(10,2) not null
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method text not null,
  status text not null default 'pending',
  amount numeric(10,2) not null,
  provider_ref text,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  face_id_enabled boolean default false,
  order_updates boolean default false,
  new_arrivals boolean default true,
  promotions boolean default false,
  sales_alerts boolean default true
);

-- =========================
-- INDEXES
-- =========================

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_cart_items_cart on public.cart_items(cart_id);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_addresses_user on public.addresses(user_id);

-- =========================
-- RLS: ENABLE
-- =========================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.favorites enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.user_settings enable row level security;

-- =========================
-- RLS POLICIES
-- =========================

create policy "profiles select own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles insert own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles update own"
on public.profiles for update
using (auth.uid() = id);

create policy "categories read all"
on public.categories for select
using (true);

create policy "products read all"
on public.products for select
using (true);

create policy "product_images read all"
on public.product_images for select
using (true);

create policy "favorites read own"
on public.favorites for select
using (auth.uid() = user_id);

create policy "favorites insert own"
on public.favorites for insert
with check (auth.uid() = user_id);

create policy "favorites delete own"
on public.favorites for delete
using (auth.uid() = user_id);

create policy "carts read own"
on public.carts for select
using (auth.uid() = user_id);

create policy "carts insert own"
on public.carts for insert
with check (auth.uid() = user_id);

create policy "carts update own"
on public.carts for update
using (auth.uid() = user_id);

create policy "carts delete own"
on public.carts for delete
using (auth.uid() = user_id);

create policy "cart_items read own"
on public.cart_items for select
using (exists (
  select 1 from public.carts c
  where c.id = cart_items.cart_id and c.user_id = auth.uid()
));

create policy "cart_items insert own"
on public.cart_items for insert
with check (exists (
  select 1 from public.carts c
  where c.id = cart_items.cart_id and c.user_id = auth.uid()
));

create policy "cart_items update own"
on public.cart_items for update
using (exists (
  select 1 from public.carts c
  where c.id = cart_items.cart_id and c.user_id = auth.uid()
));

create policy "cart_items delete own"
on public.cart_items for delete
using (exists (
  select 1 from public.carts c
  where c.id = cart_items.cart_id and c.user_id = auth.uid()
));

create policy "addresses read own"
on public.addresses for select
using (auth.uid() = user_id);

create policy "addresses insert own"
on public.addresses for insert
with check (auth.uid() = user_id);

create policy "addresses update own"
on public.addresses for update
using (auth.uid() = user_id);

create policy "addresses delete own"
on public.addresses for delete
using (auth.uid() = user_id);

create policy "orders read own"
on public.orders for select
using (auth.uid() = user_id);

create policy "orders insert own"
on public.orders for insert
with check (auth.uid() = user_id);

create policy "orders update own"
on public.orders for update
using (auth.uid() = user_id);

create policy "order_items read own"
on public.order_items for select
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id and o.user_id = auth.uid()
));

create policy "order_items insert own"
on public.order_items for insert
with check (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id and o.user_id = auth.uid()
));

create policy "order_items update own"
on public.order_items for update
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id and o.user_id = auth.uid()
));

create policy "order_items delete own"
on public.order_items for delete
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id and o.user_id = auth.uid()
));

create policy "payments read own"
on public.payments for select
using (exists (
  select 1 from public.orders o
  where o.id = payments.order_id and o.user_id = auth.uid()
));

create policy "payments insert own"
on public.payments for insert
with check (exists (
  select 1 from public.orders o
  where o.id = payments.order_id and o.user_id = auth.uid()
));

create policy "payments update own"
on public.payments for update
using (exists (
  select 1 from public.orders o
  where o.id = payments.order_id and o.user_id = auth.uid()
));

create policy "reviews read all"
on public.reviews for select
using (true);

create policy "reviews insert own"
on public.reviews for insert
with check (auth.uid() = user_id);

create policy "reviews update own"
on public.reviews for update
using (auth.uid() = user_id);

create policy "reviews delete own"
on public.reviews for delete
using (auth.uid() = user_id);

create policy "user_settings read own"
on public.user_settings for select
using (auth.uid() = user_id);

create policy "user_settings insert own"
on public.user_settings for insert
with check (auth.uid() = user_id);

create policy "user_settings update own"
on public.user_settings for update
using (auth.uid() = user_id);

-- =========================
-- TEST DATA
-- =========================
-- Note: for user-bound tables, replace the UUID below with a real auth.users.id.
-- Example: after creating a user in Supabase Auth, copy its id and set it here.
do $$
declare
  demo_user uuid := '00000000-0000-0000-0000-000000000001';
  fruits_id uuid;
  veggies_id uuid;
  herbs_id uuid;
  spices_id uuid;
  bio_id uuid;
  p1 uuid;
  p2 uuid;
  p3 uuid;
  p4 uuid;
  p5 uuid;
  addr_id uuid;
  cart_id uuid;
  order_id uuid;
begin
  insert into public.categories (name, slug) values
    ('FRUITS', 'fruits'),
    ('LEGUMES', 'legumes'),
    ('HERBES', 'herbes'),
    ('EPICES', 'epices'),
    ('BIO', 'bio')
  on conflict do nothing;

  select id into fruits_id from public.categories where slug = 'fruits';
  select id into veggies_id from public.categories where slug = 'legumes';
  select id into herbs_id from public.categories where slug = 'herbes';
  select id into spices_id from public.categories where slug = 'epices';
  select id into bio_id from public.categories where slug = 'bio';

  insert into public.products
    (name, price_per_kg, category_id, image_url, description, origin, is_organic, is_new_arrival, is_featured, is_best_seller)
  values
    ('Pommes Gala Bio', 4.99, fruits_id, 'https://picsum.photos/seed/pommes/600', 'Pommes bio fraiches et juteuses.', 'France', true, true, false, false),
    ('Bananes Cavendish', 2.49, fruits_id, 'https://picsum.photos/seed/bananes/600', 'Bananes douces et mures.', 'Cote dIvoire', false, true, false, false),
    ('Tomates Cerises', 5.99, veggies_id, 'https://picsum.photos/seed/tomates/600', 'Tomates cerises sucrees.', 'France', false, false, true, false),
    ('Concombres Bio', 2.99, veggies_id, 'https://picsum.photos/seed/concombres/600', 'Concombres bio croquants.', 'France', true, false, true, false),
    ('Fraises Gariguette', 8.99, fruits_id, 'https://picsum.photos/seed/fraises/600', 'Fraises parfumees.', 'Espagne', false, false, false, true)
  returning id into p1;

  select id into p2 from public.products where name = 'Bananes Cavendish';
  select id into p3 from public.products where name = 'Tomates Cerises';
  select id into p4 from public.products where name = 'Concombres Bio';
  select id into p5 from public.products where name = 'Fraises Gariguette';

  insert into public.product_images (product_id, url, is_primary, sort_order) values
    (p1, 'https://picsum.photos/seed/pommes1/800', true, 0),
    (p1, 'https://picsum.photos/seed/pommes2/800', false, 1),
    (p3, 'https://picsum.photos/seed/tomates1/800', true, 0)
  on conflict do nothing;

  -- User-bound demo data (replace demo_user with a real auth.users.id)
  begin
    insert into public.profiles (id, full_name, first_name, last_name, email, phone)
    values (demo_user, 'Mamadou Ramadane Barry', 'Mamadou', 'Barry', 'contact@suku-app.com', '+2246269279451')
    on conflict (id) do nothing;

    insert into public.user_settings (user_id, face_id_enabled, order_updates, new_arrivals, promotions, sales_alerts)
    values (demo_user, true, true, true, false, true)
    on conflict (user_id) do nothing;

    insert into public.addresses (user_id, address_line, city, postal_code, country, is_default)
    values (demo_user, '1412 rue Steiner', 'Paris', '75015', 'France', true)
    returning id into addr_id;

    insert into public.carts (user_id, status) values (demo_user, 'active')
    returning id into cart_id;

    insert into public.cart_items (cart_id, product_id, quantity_kg, unit_price, total_price)
    values
      (cart_id, p1, 1.0, 4.99, 4.99),
      (cart_id, p3, 0.5, 5.99, 3.00);

    insert into public.favorites (user_id, product_id)
    values (demo_user, p5)
    on conflict do nothing;

    insert into public.orders (user_id, status, payment_status, total_amount, shipping_address_id)
    values (demo_user, 'paid', 'paid', 12.98, addr_id)
    returning id into order_id;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity_kg, total_price)
    values
      (order_id, p1, 'Pommes Gala Bio', 4.99, 1.0, 4.99),
      (order_id, p2, 'Bananes Cavendish', 2.49, 3.2, 7.97);

    insert into public.payments (order_id, method, status, amount, provider_ref)
    values (order_id, 'orange', 'paid', 12.98, 'DEMO-OM-0001');

    insert into public.reviews (user_id, product_id, rating, comment)
    values (demo_user, p1, 5, 'Tres frais et savoureux.')
    on conflict do nothing;
  exception when foreign_key_violation then
    -- If demo_user does not exist in auth.users, skip user-bound inserts.
    raise notice 'demo_user not found in auth.users; user-bound test data skipped.';
  end;
end $$;
