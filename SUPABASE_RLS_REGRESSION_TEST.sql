-- SpaceFlip Pro — RLS regression test
-- Safe to run against the live project: every test is wrapped in one transaction
-- and the script ends with ROLLBACK, leaving no test users, rows, or objects.

begin;

-- Test identities (fixed UUIDs so the assertions are easy to read).
insert into auth.users (
  id, aud, role, raw_app_meta_data, raw_user_meta_data,
  is_sso_user, is_anonymous, created_at, updated_at
) values
(
  '00000000-0000-4000-8000-00000000b001'::uuid,
  'authenticated','authenticated','{}'::jsonb,'{}'::jsonb,
  false,true,now(),now()
),
(
  '00000000-0000-4000-8000-00000000b002'::uuid,
  'authenticated','authenticated','{}'::jsonb,'{}'::jsonb,
  false,true,now(),now()
);

-- Guest A: own job/project writes must succeed.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000b001', true);
select set_config('request.jwt.claim.role','authenticated', true);

insert into public.generation_jobs (
  id,user_id,project_type,goal,status,source
) values (
  '10000000-0000-4000-8000-00000000b001'::uuid,
  '00000000-0000-4000-8000-00000000b001'::uuid,
  'airbnb-unit','RLS guest A','queued','gallery'
);

insert into public.design_projects (
  id,user_id,generation_job_id,project_type,goal,status
) values (
  '20000000-0000-4000-8000-00000000b001'::uuid,
  '00000000-0000-4000-8000-00000000b001'::uuid,
  '10000000-0000-4000-8000-00000000b001'::uuid,
  'airbnb-unit','RLS guest A','saved'
);

insert into storage.objects (
  id,bucket_id,name,owner,owner_id,metadata
) values (
  '30000000-0000-4000-8000-00000000b001'::uuid,
  'design-inputs',
  'users/00000000-0000-4000-8000-00000000b001/inputs/rls-test.jpg',
  '00000000-0000-4000-8000-00000000b001'::uuid,
  '00000000-0000-4000-8000-00000000b001',
  '{}'::jsonb
);

do $$
begin
  if (select count(*) from public.generation_jobs where id='10000000-0000-4000-8000-00000000b001'::uuid) <> 1 then
    raise exception 'RLS regression: guest A cannot read its own generation job';
  end if;
  if (select count(*) from public.design_projects where id='20000000-0000-4000-8000-00000000b001'::uuid) <> 1 then
    raise exception 'RLS regression: guest A cannot read its own project';
  end if;
  if (select count(*) from storage.objects where id='30000000-0000-4000-8000-00000000b001'::uuid) <> 1 then
    raise exception 'RLS regression: guest A cannot read its own storage object';
  end if;
end
$$;

-- Guest B: own job allowed; Guest A resources must be invisible/immutable.
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000b002', true);
select set_config('request.jwt.claim.role','authenticated', true);

insert into public.generation_jobs (
  id,user_id,project_type,goal,status,source
) values (
  '10000000-0000-4000-8000-00000000b002'::uuid,
  '00000000-0000-4000-8000-00000000b002'::uuid,
  'office-space','RLS guest B','queued','gallery'
);

do $$
declare
  touched integer;
begin
  if (select count(*) from public.generation_jobs where id='10000000-0000-4000-8000-00000000b001'::uuid) <> 0 then
    raise exception 'RLS regression: guest B can read guest A job';
  end if;
  if (select count(*) from public.design_projects where id='20000000-0000-4000-8000-00000000b001'::uuid) <> 0 then
    raise exception 'RLS regression: guest B can read guest A project';
  end if;
  if (select count(*) from storage.objects where id='30000000-0000-4000-8000-00000000b001'::uuid) <> 0 then
    raise exception 'RLS regression: guest B can read guest A storage object';
  end if;

  update public.generation_jobs
  set goal='SHOULD NOT CHANGE'
  where id='10000000-0000-4000-8000-00000000b001'::uuid;
  get diagnostics touched = row_count;
  if touched <> 0 then
    raise exception 'RLS regression: guest B updated guest A job';
  end if;

  delete from public.design_projects
  where id='20000000-0000-4000-8000-00000000b001'::uuid;
  get diagnostics touched = row_count;
  if touched <> 0 then
    raise exception 'RLS regression: guest B deleted guest A project';
  end if;

  begin
    insert into public.design_projects (
      id,user_id,generation_job_id,project_type,goal,status
    ) values (
      '20000000-0000-4000-8000-00000000b002'::uuid,
      '00000000-0000-4000-8000-00000000b002'::uuid,
      '10000000-0000-4000-8000-00000000b001'::uuid,
      'office-space','Cross-owner job link','saved'
    );
    raise exception 'RLS regression: cross-owner project/job link was allowed';
  exception
    when sqlstate '42501' then
      null;
  end;

  begin
    insert into storage.objects (
      id,bucket_id,name,owner,owner_id,metadata
    ) values (
      '30000000-0000-4000-8000-00000000b002'::uuid,
      'design-inputs',
      'users/00000000-0000-4000-8000-00000000b001/inputs/cross-owner.jpg',
      '00000000-0000-4000-8000-00000000b002'::uuid,
      '00000000-0000-4000-8000-00000000b002',
      '{}'::jsonb
    );
    raise exception 'RLS regression: cross-owner storage insert was allowed';
  exception
    when sqlstate '42501' then
      null;
  end;
end
$$;

rollback;
