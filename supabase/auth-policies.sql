-- ============================================================
-- AlpaCash · Auth Trigger + Row Level Security Policies
-- Ejecutar en Supabase SQL Editor DESPUÉS del schema principal.
-- ============================================================
-- Este archivo es IDEMPOTENTE: se puede correr varias veces.
-- Usa `drop ... if exists` antes de cada `create` para evitar conflictos.
-- ============================================================


-- ------------------------------------------------------------
-- 1) TRIGGER: AUTO-CREAR PROFILE AL REGISTRARSE
-- ------------------------------------------------------------
-- Cuando un usuario nuevo se crea en auth.users (via signUp del cliente),
-- creamos automáticamente su row en public.profiles tomando el rol
-- desde raw_user_meta_data->>'role' que el frontend envía en signUp options.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, nombre, email, rol, telefono, avatar_url)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.email),
        new.email,
        coalesce(new.raw_user_meta_data->>'role', 'productor'),
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();


-- ------------------------------------------------------------
-- 2) ENABLE ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table profiles                enable row level security;
alter table productores             enable row level security;
alter table empresas                enable row level security;
alter table entidades_financieras   enable row level security;
alter table lotes_fibra             enable row level security;
alter table fotos_lote              enable row level security;
alter table solicitudes_compra      enable row level security;
alter table mensajes_solicitud      enable row level security;
alter table transacciones           enable row level security;
alter table validaciones_productor  enable row level security;
alter table calificaciones          enable row level security;
alter table evaluaciones_crediticias enable row level security;
alter table notificaciones          enable row level security;


-- ------------------------------------------------------------
-- 3) PROFILES
-- ------------------------------------------------------------
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
    on profiles for select
    using (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
    on profiles for update
    using (auth.uid() = id);

drop policy if exists "profiles_admin_select_all" on profiles;
create policy "profiles_admin_select_all"
    on profiles for select
    using (
        exists (
            select 1 from profiles p
            where p.id = auth.uid() and p.rol = 'admin'
        )
    );


-- ------------------------------------------------------------
-- 4) PRODUCTORES
-- ------------------------------------------------------------
drop policy if exists "productores_insert_own" on productores;
create policy "productores_insert_own"
    on productores for insert
    with check (auth.uid() = profile_id);

drop policy if exists "productores_select_authenticated" on productores;
create policy "productores_select_authenticated"
    on productores for select
    to authenticated
    using (true);

drop policy if exists "productores_update_own" on productores;
create policy "productores_update_own"
    on productores for update
    using (auth.uid() = profile_id);


-- ------------------------------------------------------------
-- 5) EMPRESAS
-- ------------------------------------------------------------
drop policy if exists "empresas_insert_own" on empresas;
create policy "empresas_insert_own"
    on empresas for insert
    with check (auth.uid() = profile_id);

drop policy if exists "empresas_select_own" on empresas;
create policy "empresas_select_own"
    on empresas for select
    using (auth.uid() = profile_id);

drop policy if exists "empresas_update_own" on empresas;
create policy "empresas_update_own"
    on empresas for update
    using (auth.uid() = profile_id);


-- ------------------------------------------------------------
-- 6) ENTIDADES FINANCIERAS
-- ------------------------------------------------------------
drop policy if exists "financiera_insert_own" on entidades_financieras;
create policy "financiera_insert_own"
    on entidades_financieras for insert
    with check (auth.uid() = profile_id);

drop policy if exists "financiera_select_own" on entidades_financieras;
create policy "financiera_select_own"
    on entidades_financieras for select
    using (auth.uid() = profile_id);

drop policy if exists "financiera_update_own" on entidades_financieras;
create policy "financiera_update_own"
    on entidades_financieras for update
    using (auth.uid() = profile_id);


-- ------------------------------------------------------------
-- 7) LOTES_FIBRA
-- ------------------------------------------------------------
drop policy if exists "lotes_productor_manage" on lotes_fibra;
create policy "lotes_productor_manage"
    on lotes_fibra for all
    using (productor_id in (select id from productores where profile_id = auth.uid()))
    with check (productor_id in (select id from productores where profile_id = auth.uid()));

drop policy if exists "lotes_authenticated_read" on lotes_fibra;
create policy "lotes_authenticated_read"
    on lotes_fibra for select
    to authenticated
    using (true);


-- ------------------------------------------------------------
-- 8) NOTIFICACIONES (cada usuario solo las suyas)
-- ------------------------------------------------------------
drop policy if exists "notif_select_own" on notificaciones;
create policy "notif_select_own"
    on notificaciones for select
    using (profile_id = auth.uid());

drop policy if exists "notif_update_own" on notificaciones;
create policy "notif_update_own"
    on notificaciones for update
    using (profile_id = auth.uid());


-- ============================================================
-- FIN
-- ============================================================
-- Después de correr este archivo:
-- 1. Cualquier signUp via frontend creará profile automáticamente.
-- 2. RLS está activo: usuarios solo ven/modifican sus propios datos.
-- 3. Admins pueden ver todos los profiles.
-- 4. Marketplace de lotes es visible para cualquier authenticated.
-- ============================================================
