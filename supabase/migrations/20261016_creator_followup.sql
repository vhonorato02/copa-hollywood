-- Copa Hollywood 1.2.0: avaliacao privada e avatares.
-- Sem apagar perfis ou o estado dos alunos.
alter table public.copa_profiles drop constraint if exists copa_profiles_avatar_check;
alter table public.copa_profiles add constraint copa_profiles_avatar_check check (avatar between 0 and 11);
create table if not exists copa_private.reviews (
 id text primary key references public.copa_profiles(id) on delete cascade,
 narrative smallint check (narrative between 0 and 5),
 editing smallint check (editing between 0 and 5),
 sound smallint check (sound between 0 and 5),
 creativity smallint check (creativity between 0 and 5),
 finish smallint check (finish between 0 and 5),
 award text not null default '' check (char_length(award) <= 90),
 verified boolean not null default false,
 comment text not null default '' check (char_length(comment) <= 1000),
 video_url text not null default '' check (char_length(video_url) <= 400),
 updated_at timestamptz not null default now()
);
revoke all on copa_private.reviews from public, anon, authenticated;
-- A senha de acesso e validada no banco. Nunca armazenar em JS ou neste repositorio.
create or replace function public.copa_teacher(p_pass text,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare expected text; result jsonb; sid text; review_payload jsonb;
begin
 select value_hash into expected from copa_private.access where key='teacher';
 if p_pass is null or length(p_pass)>128 or expected is null
 or pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_pass,'UTF8')),'hex')<>expected then
   raise exception 'Acesso negado' using errcode='28000';
 end if;
 if p_action='list' then
   select coalesce(jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.name,'avatar',p.avatar,'drive_url',p.drive_url,
    'active',p.active,'teacher_message',p.teacher_message,
    'state',p.state,'updated_at',p.updated_at,'note',coalesce(n.note,''),
    'review',case when v.id is null then '{}'::jsonb else jsonb_build_object(
      'narrative',v.narrative,'editing',v.editing,'sound',v.sound,
      'creativity',v.creativity,'finish',v.finish,'award',v.award,
      'verified',v.verified,'comment',v.comment,'video_url',v.video_url,
      'updated_at',v.updated_at) end
   ) order by p.name),'[]'::jsonb) into result
   from public.copa_profiles p
   left join copa_private.notes n on n.id=p.id
   left join copa_private.reviews v on v.id=p.id;
   return jsonb_build_object('ok',true,'students',result);
 elsif p_action='create' then
   sid=coalesce(p_payload->>'id','');
   if sid !~ '^[a-z0-9-]{2,40}$' then raise exception 'Identificador invalido'; end if;
   insert into public.copa_profiles(id,name,avatar,drive_url,active)
   values(sid,left(trim(coalesce(p_payload->>'name','')),30),
    least(11,greatest(0,coalesce((p_payload->>'avatar')::smallint,0))),
    coalesce(nullif(trim(p_payload->>'drive_url'),''),
      'https://drive.google.com/drive/folders/1X6IyCzQTcAPaeWdkiV6MuTjuqVLFQSew'),true);
   return jsonb_build_object('ok',true,'id',sid);
 elsif p_action='update' then
   sid=coalesce(p_payload->>'id','');
   if not exists(select 1 from public.copa_profiles p where p.id=sid) then raise exception 'Perfil nao encontrado'; end if;
   update public.copa_profiles set
    name=coalesce(nullif(left(trim(p_payload->>'name'),30),''),name),
    avatar=least(11,greatest(0,coalesce((p_payload->>'avatar')::smallint,avatar))),
    drive_url=coalesce(nullif(trim(p_payload->>'drive_url'),''),drive_url),
    active=coalesce((p_payload->>'active')::boolean,active),
    teacher_message=left(coalesce(p_payload->>'teacher_message',teacher_message),450)
   where id=sid;
   if p_payload ? 'note' then
     insert into copa_private.notes(id,note,updated_at)
     values(sid,left(coalesce(p_payload->>'note',''),1400),now())
     on conflict(id) do update set note=excluded.note,updated_at=now();
   end if;
   return jsonb_build_object('ok',true,'id',sid);
 elsif p_action='review' then
   sid=coalesce(p_payload->>'id','');
   if not exists(select 1 from public.copa_profiles p where p.id=sid) then raise exception 'Perfil nao encontrado'; end if;
   review_payload=coalesce(p_payload->'review','{}'::jsonb);
   if jsonb_typeof(review_payload)<>'object' then raise exception 'Avaliacao invalida'; end if;
   insert into copa_private.reviews(id,narrative,editing,sound,creativity,finish,award,verified,comment,video_url,updated_at)
   values(sid,
    nullif(review_payload->>'narrative','')::smallint,
    nullif(review_payload->>'editing','')::smallint,
    nullif(review_payload->>'sound','')::smallint,
    nullif(review_payload->>'creativity','')::smallint,
    nullif(review_payload->>'finish','')::smallint,
    left(coalesce(review_payload->>'award',''),90),
    coalesce((review_payload->>'verified')::boolean,false),
    left(coalesce(review_payload->>'comment',''),1000),
    left(coalesce(review_payload->>'video_url',''),400),now())
   on conflict(id) do update set
    narrative=excluded.narrative,editing=excluded.editing,sound=excluded.sound,
    creativity=excluded.creativity,finish=excluded.finish,
    award=excluded.award,verified=excluded.verified,comment=excluded.comment,
    video_url=excluded.video_url,updated_at=now();
   return jsonb_build_object('ok',true,'id',sid);
 else
   raise exception 'Operacao invalida';
 end if;
end;$$;
revoke all on function public.copa_teacher(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.copa_teacher(text,text,jsonb) to anon;
