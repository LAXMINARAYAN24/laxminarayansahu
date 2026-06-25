
-- 1. Private schema for internal helpers (not exposed by PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2. Move has_role to private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 3. Recreate a thin public wrapper that simply delegates, so existing
--    policies/code keep working, but revoke execute from anon/authenticated
--    so it cannot be invoked as an RPC. RLS policies will be migrated to
--    call private.has_role directly below.
DROP POLICY IF EXISTS "Admins can delete settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;

DROP POLICY IF EXISTS "Admins can delete profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload profile photos" ON storage.objects;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 4. Recreate policies using private.has_role
CREATE POLICY "Admins can delete settings" ON public.site_settings
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete profile photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profile-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update profile photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can upload profile photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));

-- 5. Lock down handle_new_user (trigger-only, no API exposure needed)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC;

-- 6. Contact messages: allow admins to read and clean up entries
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 7. user_roles: explicit admin-only INSERT and DELETE policies
CREATE POLICY "Admins can assign roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can revoke roles" ON public.user_roles
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
