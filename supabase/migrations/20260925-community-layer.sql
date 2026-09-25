-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select using (true);

create policy "users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists reviews_slug_idx on public.reviews (slug);
create index if not exists reviews_user_idx on public.reviews (user_id);

alter table public.reviews enable row level security;

create policy "reviews are publicly readable"
  on public.reviews for select using (true);
create policy "users can insert their own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "users can update their own reviews"
  on public.reviews for update using (auth.uid() = user_id);
create policy "users can delete their own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

-- ---------- favorites ----------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists favorites_user_idx on public.favorites (user_id);
create index if not exists favorites_slug_idx on public.favorites (slug);

alter table public.favorites enable row level security;

create policy "users can read their own favorites"
  on public.favorites for select using (auth.uid() = user_id);
create policy "users can insert their own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);
create policy "users can delete their own favorites"
  on public.favorites for delete using (auth.uid() = user_id);

-- ---------- tool_stats view ----------
create or replace view public.tool_stats as
select slug, count(*) as review_count, round(avg(rating), 1) as avg_rating
from public.reviews
group by slug;

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.reviews, public.favorites, public.tool_stats
  to anon, authenticated;
grant insert, update, delete on public.profiles, public.reviews, public.favorites
  to authenticated;