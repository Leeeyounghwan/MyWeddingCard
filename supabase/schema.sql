-- ============================================================================
--  모바일 청첩장 — Supabase 스키마
--  Supabase Dashboard → SQL Editor 에 이 파일 전체를 붙여넣고 Run 하세요.
--  여러 번 실행해도 안전하도록(idempotent) 작성되어 있습니다.
--
--  보안 설계
--   · guestbook / rsvp 테이블은 RLS 활성화 + anon/authenticated 권한 전부 회수
--     → 브라우저(anon key)로는 테이블을 직접 SELECT/INSERT/UPDATE/DELETE 할 수 없습니다.
--   · 모든 접근은 아래 RPC 함수(security definer)로만 가능하며, 함수가 입력 검증 · 속도 제한을 수행합니다.
--   · 방명록 비밀번호는 bcrypt(pgcrypto crypt) 해시로만 저장되고, 조회 함수는 해시 컬럼을 절대 반환하지 않습니다.
--   · IP 는 원문 저장 없이 salt 를 섞은 SHA-256 해시로만 속도 제한에 사용합니다.
--   · RSVP 관리는 관리자 키가 있는 RPC 로만 조회합니다.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- 외부(API)에 노출되지 않는 내부 스키마
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. 테이블
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.guestbook (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 20),
  message       text not null check (char_length(message) between 1 and 500),
  password_hash text not null,
  ip_hash       text,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists guestbook_visible_created_idx
  on public.guestbook (created_at desc) where is_visible;

create table if not exists public.rsvp (
  id          uuid primary key default gen_random_uuid(),
  side        text not null check (side in ('groom', 'bride')),
  name        text not null check (char_length(name) between 1 and 20),
  attending   boolean not null,
  party_size  smallint not null default 1 check (party_size between 0 and 10),
  meal        text not null default 'undecided' check (meal in ('yes', 'no', 'undecided')),
  phone       text check (phone is null or phone ~ '^[0-9]{9,11}$'),
  memo        text check (memo is null or char_length(memo) <= 300),
  ip_hash     text,
  created_at  timestamptz not null default now()
);
create index if not exists rsvp_created_idx on public.rsvp (created_at desc);

-- 속도 제한 기록
create table if not exists private.rate_limit_events (
  id         bigint generated always as identity primary key,
  action     text not null,
  key_hash   text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_limit_lookup_idx
  on private.rate_limit_events (action, key_hash, created_at desc);

-- 금칙어 (부분 일치, 소문자·공백 제거 후 비교). 필요에 따라 insert/delete 하세요.
create table if not exists private.blocked_words (
  word text primary key
);
insert into private.blocked_words (word) values
  ('시발'), ('씨발'), ('ㅅㅂ'), ('병신'), ('ㅂㅅ'), ('개새'), ('좆'), ('존나'),
  ('꺼져'), ('닥쳐'), ('미친놈'), ('미친년'), ('fuck'), ('shit'),
  ('카지노'), ('토토'), ('바카라'), ('대출'), ('텔레그램')
on conflict do nothing;

-- IP 해시용 salt (설치 시 1회 무작위 생성)
create table if not exists private.settings (
  key   text primary key,
  value text not null
);
insert into private.settings (key, value)
values ('ip_salt', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. RLS — 정책을 만들지 않으므로 API 로는 어떤 행도 접근할 수 없습니다.
-- ────────────────────────────────────────────────────────────────────────────
alter table public.guestbook enable row level security;
alter table public.rsvp      enable row level security;
alter table private.rate_limit_events enable row level security;
alter table private.blocked_words     enable row level security;
alter table private.settings          enable row level security;

revoke all on table public.guestbook from anon, authenticated;
revoke all on table public.rsvp      from anon, authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. 내부 헬퍼 함수 (private — API 에 노출되지 않음)
-- ────────────────────────────────────────────────────────────────────────────

-- 요청자 식별 키: salt + IP 의 SHA-256 (IP 원문은 저장하지 않음)
create or replace function private.client_key()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_headers json;
  v_ip text;
  v_salt text;
begin
  begin
    v_headers := current_setting('request.headers', true)::json;
  exception when others then
    v_headers := null;
  end;
  v_ip := coalesce(
    v_headers ->> 'cf-connecting-ip',
    v_headers ->> 'x-real-ip',
    split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1),
    'unknown'
  );
  if v_ip = '' then v_ip := 'unknown'; end if;
  select value into v_salt from private.settings where key = 'ip_salt';
  return encode(extensions.digest(coalesce(v_salt, '') || trim(v_ip), 'sha256'), 'hex');
end;
$$;

-- 속도 제한: p_window 동안 p_limit 회를 넘으면 RATE_LIMITED 예외
create or replace function private.check_rate_limit(p_action text, p_key text, p_limit int, p_window interval)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  -- 오래된 기록 정리 (가끔만 수행)
  if random() < 0.05 then
    delete from private.rate_limit_events where created_at < now() - interval '2 days';
  end if;

  select count(*) into v_count
  from private.rate_limit_events
  where action = p_action and key_hash = p_key and created_at > now() - p_window;

  if v_count >= p_limit then
    raise exception 'RATE_LIMITED' using errcode = 'P0001';
  end if;

  insert into private.rate_limit_events (action, key_hash) values (p_action, p_key);
end;
$$;

create or replace function private.has_blocked_word(p_text text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.blocked_words b
    where position(b.word in regexp_replace(lower(p_text), '[\s\.\-_\*~!@#]', '', 'g')) > 0
  );
$$;

-- 입력 정리: 제어문자 제거 + 앞뒤 공백 제거
create or replace function private.clean_text(p_text text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(btrim(regexp_replace(coalesce(p_text, ''), '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F​-‏‪-‮]', '', 'g')), '');
$$;

revoke all on all functions in schema private from public, anon, authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. 공개 RPC 함수 (브라우저에서 supabase.rpc(...) 로 호출)
-- ────────────────────────────────────────────────────────────────────────────

-- 방명록 목록 (비밀번호 해시 · IP 해시는 반환하지 않음)
create or replace function public.get_guestbook(p_limit int default 5, p_offset int default 0)
returns table (id uuid, name text, message text, created_at timestamptz, total_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select g.id, g.name, g.message, g.created_at, count(*) over () as total_count
  from public.guestbook g
  where g.is_visible
  order by g.created_at desc
  limit least(greatest(coalesce(p_limit, 5), 1), 50)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

-- 방명록 작성
create or replace function public.add_guestbook(p_name text, p_message text, p_password text)
returns table (id uuid, name text, message text, created_at timestamptz)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_name text := private.clean_text(p_name);
  v_message text := private.clean_text(p_message);
  v_key text := private.client_key();
begin
  if v_name is null or char_length(v_name) > 20 then
    raise exception 'INVALID_NAME' using errcode = 'P0001';
  end if;
  if v_message is null or char_length(v_message) > 500 then
    raise exception 'INVALID_MESSAGE' using errcode = 'P0001';
  end if;
  if p_password is null or char_length(p_password) not between 4 and 20 then
    raise exception 'INVALID_PASSWORD' using errcode = 'P0001';
  end if;
  if (v_name || ' ' || v_message) ~* '(https?://|www\.|\.(com|net|kr|io|xyz|co)\M)' then
    raise exception 'LINK_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  if private.has_blocked_word(v_name || ' ' || v_message) then
    raise exception 'BLOCKED_WORD' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.guestbook g
    where g.message = v_message and g.created_at > now() - interval '10 minutes'
  ) then
    raise exception 'DUPLICATE' using errcode = 'P0001';
  end if;

  -- 같은 사용자: 10분에 3개 / 전체: 1시간에 60개
  perform private.check_rate_limit('guestbook_insert', v_key, 3, interval '10 minutes');
  perform private.check_rate_limit('guestbook_insert_global', 'global', 60, interval '1 hour');

  return query
  with ins as (
    insert into public.guestbook (name, message, password_hash, ip_hash)
    values (v_name, v_message, extensions.crypt(p_password, extensions.gen_salt('bf', 8)), v_key)
    returning guestbook.id, guestbook.name, guestbook.message, guestbook.created_at
  )
  select ins.id, ins.name, ins.message, ins.created_at from ins;
end;
$$;

-- 방명록 삭제 (작성 시 비밀번호 필요, 실제로는 숨김 처리 — 기록 보존)
create or replace function public.delete_guestbook(p_id uuid, p_password text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_hash text;
begin
  -- 비밀번호 무차별 대입 방지: 10분에 10회
  perform private.check_rate_limit('guestbook_delete', private.client_key(), 10, interval '10 minutes');

  select g.password_hash into v_hash
  from public.guestbook g
  where g.id = p_id and g.is_visible;

  if v_hash is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  -- ⚠️ 예외를 던지면 트랜잭션이 롤백되어 위의 시도 기록도 사라지므로, 비밀번호 불일치는 false 로 반환합니다.
  if p_password is null or extensions.crypt(p_password, v_hash) <> v_hash then
    return false;
  end if;

  update public.guestbook set is_visible = false where id = p_id;
  return true;
end;
$$;

-- RSVP 제출 (조회 함수는 제공하지 않음)
create or replace function public.submit_rsvp(
  p_side text,
  p_name text,
  p_attending boolean,
  p_party_size int,
  p_meal text,
  p_phone text default null,
  p_memo text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_name text := private.clean_text(p_name);
  v_memo text := private.clean_text(p_memo);
  v_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), '');
  v_id uuid;
begin
  if p_side not in ('groom', 'bride') or p_attending is null then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;
  if v_name is null or char_length(v_name) > 20 then
    raise exception 'INVALID_NAME' using errcode = 'P0001';
  end if;
  if coalesce(p_party_size, 0) not between 0 and 10 or coalesce(p_meal, '') not in ('yes', 'no', 'undecided') then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;
  if v_phone is not null and v_phone !~ '^[0-9]{9,11}$' then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;
  if v_memo is not null and (char_length(v_memo) > 300 or private.has_blocked_word(v_memo)) then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;

  perform private.check_rate_limit('rsvp_insert', private.client_key(), 5, interval '10 minutes');
  perform private.check_rate_limit('rsvp_insert_global', 'global', 200, interval '1 hour');

  insert into public.rsvp (side, name, attending, party_size, meal, phone, memo, ip_hash)
  values (
    p_side, v_name, p_attending,
    case when p_attending then greatest(p_party_size, 1) else 0 end,
    case when p_attending then p_meal else 'no' end,
    v_phone, v_memo, private.client_key()
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- RSVP 관리자 조회
-- 관리자 키 설정(SQL Editor 에서 1회 실행):
-- insert into private.settings (key, value)
-- values ('admin_key_hash', extensions.crypt('yhej270425', extensions.gen_salt('bf', 10)))
-- on conflict (key) do update set value = excluded.value;
create or replace function public.get_rsvp_admin(p_key text)
returns table (
  id uuid,
  side text,
  name text,
  attending boolean,
  party_size smallint,
  meal text,
  phone text,
  memo text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_hash text;
begin
  select value into v_hash from private.settings where key = 'admin_key_hash';
  if v_hash is null then
    raise exception 'ADMIN_NOT_CONFIGURED' using errcode = 'P0001';
  end if;
  if p_key is null or extensions.crypt(p_key, v_hash) <> v_hash then
    raise exception 'ADMIN_DENIED' using errcode = 'P0001';
  end if;

  return query
  select r.id, r.side, r.name, r.attending, r.party_size, r.meal, r.phone, r.memo, r.created_at
  from public.rsvp r
  order by r.created_at desc;
end;
$$;

-- 공개 함수 실행 권한: 기본(PUBLIC) 권한을 회수하고 필요한 것만 anon 에 부여
revoke all on function public.get_guestbook(int, int) from public;
revoke all on function public.add_guestbook(text, text, text) from public;
revoke all on function public.delete_guestbook(uuid, text) from public;
revoke all on function public.submit_rsvp(text, text, boolean, int, text, text, text) from public;
revoke all on function public.get_rsvp_admin(text) from public;

grant execute on function public.get_guestbook(int, int) to anon, authenticated;
grant execute on function public.add_guestbook(text, text, text) to anon, authenticated;
grant execute on function public.delete_guestbook(uuid, text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, boolean, int, text, text, text) to anon, authenticated;
grant execute on function public.get_rsvp_admin(text) to anon, authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. 관리용 뷰 (Dashboard · SQL Editor 에서만 사용. API 에서는 접근 불가)
-- ────────────────────────────────────────────────────────────────────────────
create or replace view private.rsvp_summary as
select
  side,
  count(*) filter (where attending)            as attending_responses,
  coalesce(sum(party_size) filter (where attending), 0) as attending_people,
  count(*) filter (where attending and meal = 'yes') as meal_yes_responses,
  count(*) filter (where not attending)        as not_attending
from public.rsvp
group by side;

-- RSVP edit keys: run once in Supabase SQL Editor before deploying the client.
begin;

alter table public.rsvp add column if not exists edit_key_hash text;
alter table public.rsvp add column if not exists updated_at timestamptz;
create unique index if not exists rsvp_edit_key_hash_idx on public.rsvp (edit_key_hash);

create or replace function public.get_rsvp_by_key(p_edit_key text)
returns table (
  side text, name text, attending boolean, party_size smallint,
  meal text, phone text, memo text
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if p_edit_key is null or p_edit_key !~ '^[a-f0-9]{64}$' then
    return;
  end if;
  perform private.check_rate_limit('rsvp_read', private.client_key(), 60, interval '10 minutes');
  return query
  select r.side, r.name, r.attending, r.party_size, r.meal, r.phone, r.memo
  from public.rsvp r
  where r.edit_key_hash = encode(extensions.digest(p_edit_key, 'sha256'), 'hex');
end;
$$;

create or replace function public.save_rsvp(
  p_edit_key text, p_create boolean,
  p_side text, p_name text, p_attending boolean, p_party_size int, p_meal text,
  p_phone text default null, p_memo text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_hash text;
  v_name text := private.clean_text(p_name);
  v_memo text := private.clean_text(p_memo);
  v_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), '');
  v_id uuid;
begin
  if p_edit_key is null or p_edit_key !~ '^[a-f0-9]{64}$' or p_create is null then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;
  if p_side is null or p_side not in ('groom', 'bride') or p_attending is null then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;
  if v_name is null or char_length(v_name) > 20 then
    raise exception 'INVALID_NAME' using errcode = 'P0001';
  end if;
  if p_party_size is null or p_party_size not between 0 and 10
    or p_meal is null or p_meal not in ('yes', 'no', 'undecided') then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;
  if v_phone is not null and v_phone !~ '^01[016789][0-9]{7,8}$' then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;
  if v_memo is not null and char_length(v_memo) > 300 then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;
  if (v_name || ' ' || coalesce(v_memo, '')) ~* '(https?://|www\.|\.(com|net|kr|io|xyz|co)\M)' then
    raise exception 'LINK_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  if private.has_blocked_word(v_name || ' ' || coalesce(v_memo, '')) then
    raise exception 'BLOCKED_WORD' using errcode = 'P0001';
  end if;

  perform private.check_rate_limit('rsvp_save', private.client_key(), 5, interval '10 minutes');
  perform private.check_rate_limit('rsvp_save_global', 'global', 200, interval '1 hour');
  v_hash := encode(extensions.digest(p_edit_key, 'sha256'), 'hex');

  if p_create then
    -- Reusing the same key after a network timeout must not create a duplicate.
    insert into public.rsvp (side, name, attending, party_size, meal, phone, memo, ip_hash, edit_key_hash)
    values (
      p_side, v_name, p_attending,
      case when p_attending then greatest(p_party_size, 1) else 0 end,
      case when p_attending then p_meal else 'no' end,
      v_phone, v_memo, private.client_key(), v_hash
    )
    on conflict (edit_key_hash) do update set
      side = excluded.side, name = excluded.name, attending = excluded.attending,
      party_size = excluded.party_size, meal = excluded.meal, phone = excluded.phone,
      memo = excluded.memo, updated_at = now()
    returning id into v_id;
  else
    update public.rsvp set
      side = p_side, name = v_name, attending = p_attending,
      party_size = case when p_attending then greatest(p_party_size, 1) else 0 end,
      meal = case when p_attending then p_meal else 'no' end,
      phone = v_phone, memo = v_memo, updated_at = now()
    where edit_key_hash = v_hash
    returning id into v_id;
    -- Return null so unsuccessful attempts still count toward the rate limit.
  end if;
  return v_id;
end;
$$;

revoke all on function public.get_rsvp_by_key(text) from public;
revoke all on function public.save_rsvp(text, boolean, text, text, boolean, int, text, text, text) from public;
grant execute on function public.get_rsvp_by_key(text) to anon, authenticated;
grant execute on function public.save_rsvp(text, boolean, text, text, boolean, int, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
commit;
