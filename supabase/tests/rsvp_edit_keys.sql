-- Run against a test database after schema.sql. All fixture data is rolled back.
begin;
do $$
declare
  v_key text := encode(extensions.gen_random_bytes(32), 'hex');
  v_other_key text := encode(extensions.gen_random_bytes(32), 'hex');
  v_unknown_key text := encode(extensions.gen_random_bytes(32), 'hex');
  v_id uuid;
  v_retry_id uuid;
  v_other_id uuid;
  v_record record;
begin
  -- Isolate this transaction from pre-existing limits; rollback restores them.
  delete from private.rate_limit_events where action in ('rsvp_save', 'rsvp_save_global', 'rsvp_read');
  v_id := public.save_rsvp(v_key, true, 'groom', '테스트', true, 2, 'yes', '010-1234-5678', '처음');
  v_retry_id := public.save_rsvp(v_key, true, 'groom', '테스트', true, 2, 'yes', null, '재시도');
  assert v_id = v_retry_id, 'Retry must reuse the response';
  assert (select count(*) from public.rsvp where id = v_id) = 1;
  assert (select edit_key_hash from public.rsvp where id = v_id) = encode(extensions.digest(v_key, 'sha256'), 'hex');

  v_other_id := public.save_rsvp(v_other_key, true, 'groom', '테스트', true, 4, 'yes');
  v_retry_id := public.save_rsvp(v_key, false, 'bride', '수정테스트', false, 2, 'yes', null, '수정');
  assert v_retry_id = v_id;
  select * into v_record from public.get_rsvp_by_key(v_key);
  assert v_record.name = '수정테스트' and not v_record.attending;
  assert v_record.party_size = 0 and v_record.meal = 'no';
  assert (select updated_at is not null from public.rsvp where id = v_id);
  assert (select party_size from public.rsvp where id = v_other_id) = 4, 'Other response must be unchanged';

  assert public.save_rsvp(v_unknown_key, false, 'groom', '없는응답', true, 1, 'yes') is null;
  assert not exists (select 1 from public.get_rsvp_by_key(v_unknown_key));
  assert not exists (select 1 from public.get_rsvp_by_key('invalid'));
  assert not exists (select 1 from public.rsvp where edit_key_hash = encode(extensions.digest(v_unknown_key, 'sha256'), 'hex'));
  assert not has_table_privilege('anon', 'public.rsvp', 'SELECT');
  assert not has_table_privilege('anon', 'public.rsvp', 'UPDATE');
  assert has_function_privilege('anon', 'public.get_rsvp_by_key(text)', 'EXECUTE');
  assert has_function_privilege('anon', 'public.save_rsvp(text,boolean,text,text,boolean,integer,text,text,text)', 'EXECUTE');
end;
$$;
rollback;
