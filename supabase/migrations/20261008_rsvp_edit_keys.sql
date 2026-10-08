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
