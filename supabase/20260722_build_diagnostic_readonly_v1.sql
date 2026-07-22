begin transaction read only;

-- DIGIY BUILD — DIAGNOSTIC PRODUCTION V1 — LECTURE SEULE
-- Aucun téléphone, PIN, slug, nom ou profil d'abonné dans ce fichier.
-- Aucune création, modification ou suppression.
-- Objectif : obtenir le schéma réel avant toute correction BUILD.

-- 1. Fonctions d'accès et fonctions BUILD réellement installées.
select
  '01_FONCTIONS' as section,
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    p.proname in (
      'digiy_verify_pin',
      'digiy_verify_access',
      'digiy_has_access',
      'digiy_has_module_access_from_abos'
    )
    or p.proname ilike '%build%'
  )
order by p.proname, pg_get_function_identity_arguments(p.oid);

-- 2. Relations importantes présentes ou absentes.
with wanted(name) as (
  values
    ('digiy_build_public_profiles'),
    ('digiy_build_pros'),
    ('digiy_access_pins'),
    ('digiy_abonnement_fiches'),
    ('digiy_abonnement_fiches_active'),
    ('digiy_subscriptions_public')
)
select
  '02_RELATIONS' as section,
  w.name as expected_name,
  n.nspname as schema_name,
  c.relname,
  c.relkind,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  c.reltuples::bigint as estimated_rows
from wanted w
left join pg_class c on c.relname = w.name
left join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
order by w.name;

-- 3. Colonnes réelles, types, NULL et valeurs par défaut.
select
  '03_COLONNES' as section,
  n.nspname as schema_name,
  c.relname as relation_name,
  a.attnum as ordinal_position,
  a.attname as column_name,
  pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
  a.attnotnull as not_null,
  pg_get_expr(ad.adbin, ad.adrelid) as default_value,
  col_description(a.attrelid, a.attnum) as comment
from pg_attribute a
join pg_class c on c.oid = a.attrelid
join pg_namespace n on n.oid = c.relnamespace
left join pg_attrdef ad on ad.adrelid = a.attrelid and ad.adnum = a.attnum
where n.nspname = 'public'
  and c.relname in (
    'digiy_build_public_profiles',
    'digiy_build_pros',
    'digiy_access_pins',
    'digiy_abonnement_fiches',
    'digiy_abonnement_fiches_active',
    'digiy_subscriptions_public'
  )
  and a.attnum > 0
  and not a.attisdropped
order by c.relname, a.attnum;

-- 4. Contraintes : PK, UNIQUE, FK, CHECK et NOT VALID.
select
  '04_CONTRAINTES' as section,
  n.nspname as schema_name,
  c.relname as relation_name,
  con.conname as constraint_name,
  con.contype as constraint_type,
  con.convalidated as validated,
  pg_get_constraintdef(con.oid, true) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'digiy_build_public_profiles',
    'digiy_build_pros',
    'digiy_access_pins',
    'digiy_abonnement_fiches'
  )
order by c.relname, con.contype, con.conname;

-- 5. Index réellement utilisés.
select
  '05_INDEX' as section,
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'digiy_build_public_profiles',
    'digiy_build_pros',
    'digiy_access_pins',
    'digiy_abonnement_fiches'
  )
order by tablename, indexname;

-- 6. Politiques RLS.
select
  '06_POLITIQUES_RLS' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'digiy_build_public_profiles',
    'digiy_build_pros',
    'digiy_access_pins',
    'digiy_abonnement_fiches'
  )
order by tablename, policyname;

-- 7. Triggers non internes.
select
  '07_TRIGGERS' as section,
  n.nspname as schema_name,
  c.relname as relation_name,
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  pg_get_triggerdef(t.oid, true) as definition,
  pn.nspname || '.' || p.proname as trigger_function
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
join pg_proc p on p.oid = t.tgfoid
join pg_namespace pn on pn.oid = p.pronamespace
where not t.tgisinternal
  and n.nspname = 'public'
  and c.relname in (
    'digiy_build_public_profiles',
    'digiy_build_pros',
    'digiy_access_pins',
    'digiy_abonnement_fiches'
  )
order by c.relname, t.tgname;

-- 8. Privilèges tables accordés aux rôles exposés.
select
  '08_PRIVILEGES_TABLES' as section,
  table_schema,
  table_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'digiy_build_public_profiles',
    'digiy_build_pros',
    'digiy_access_pins',
    'digiy_abonnement_fiches',
    'digiy_abonnement_fiches_active',
    'digiy_subscriptions_public'
  )
  and grantee in ('anon','authenticated','public')
order by table_name, grantee, privilege_type;

-- 9. Privilèges RPC.
select
  '09_PRIVILEGES_RPC' as section,
  routine_schema,
  routine_name,
  grantee,
  privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public'
  and (
    routine_name in (
      'digiy_verify_pin',
      'digiy_verify_access',
      'digiy_has_access',
      'digiy_has_module_access_from_abos'
    )
    or routine_name ilike '%build%'
  )
  and grantee in ('anon','authenticated','public')
order by routine_name, grantee;

-- 10. Signatures ambiguës ou surchargées des RPC appelées par pin.html.
select
  '10_SIGNATURES_RPC' as section,
  p.proname as function_name,
  count(*) over (partition by p.proname) as overload_count,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'digiy_verify_pin',
    'digiy_verify_access',
    'digiy_has_access',
    'digiy_has_module_access_from_abos'
  )
order by p.proname, arguments;

-- 11. Dépendances des RPC vers tables/vues publiques.
select distinct
  '11_DEPENDANCES_RPC' as section,
  pn.nspname as function_schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  rn.nspname as referenced_schema,
  r.relname as referenced_relation,
  r.relkind as referenced_kind
from pg_depend d
join pg_proc p on p.oid = d.objid
join pg_namespace pn on pn.oid = p.pronamespace
join pg_class r on r.oid = d.refobjid
join pg_namespace rn on rn.oid = r.relnamespace
where d.classid = 'pg_proc'::regclass
  and pn.nspname = 'public'
  and (
    p.proname in (
      'digiy_verify_pin',
      'digiy_verify_access',
      'digiy_has_access',
      'digiy_has_module_access_from_abos'
    )
    or p.proname ilike '%build%'
  )
order by p.proname, r.relname;

-- 12. Résumé neutre installabilité.
select
  '12_RESUME' as section,
  to_regprocedure('public.digiy_verify_pin(text,text,text)') is not null
    as verify_pin_text_text_text,
  to_regprocedure('public.digiy_verify_access(text,text)') is not null
    as verify_access_text_text,
  to_regprocedure('public.digiy_has_access(text,text)') is not null
    as has_access_text_text,
  to_regprocedure('public.digiy_has_module_access_from_abos(text,text)') is not null
    as abos_access_text_text,
  to_regclass('public.digiy_build_public_profiles') is not null
    as build_public_profiles_present,
  to_regclass('public.digiy_build_pros') is not null
    as build_pros_present;

rollback;
