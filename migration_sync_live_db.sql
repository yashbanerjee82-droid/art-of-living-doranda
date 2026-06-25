-- ==============================================================================
-- MIGRATION: SYNC LIVE DATABASE WITH LATEST APPLICATION REQUIREMENTS
-- This migration safely adds/updates all functions, triggers, policies,
-- storage buckets, and indexes without dropping existing data or tables.
-- ==============================================================================

-- Enable pgcron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ------------------------------------------------------------------------------
-- 1. FUNCTIONS
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_resps TEXT[];
BEGIN
  v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  
  IF new.raw_user_meta_data ? 'responsibilities' THEN
    SELECT array_agg(value) INTO v_resps 
    FROM jsonb_array_elements_text(new.raw_user_meta_data->'responsibilities');
  ELSE
    v_resps := ARRAY['Volunteer']::TEXT[];
  END IF;

  INSERT INTO public.profiles (id, email, name, responsibilities)
  VALUES (new.id, new.email, v_name, COALESCE(v_resps, ARRAY['Volunteer']::TEXT[]));
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.has_responsibility(req TEXT) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND req = ANY(responsibilities) 
    AND archived_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.is_course_manager(p_course_id UUID) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.course_managers WHERE course_id = p_course_id AND user_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.is_event_manager(p_event_id UUID) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.event_managers WHERE event_id = p_event_id AND user_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.check_course_managers_count_deferred() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = OLD.course_id) THEN
      RETURN NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.course_managers WHERE course_id = OLD.course_id) THEN
      RAISE EXCEPTION 'A course must have at least one Course Manager.';
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (SELECT 1 FROM public.course_managers WHERE course_id = NEW.id) THEN
      RAISE EXCEPTION 'A course must have at least one Course Manager upon creation.';
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.check_event_managers_count_deferred() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF NOT EXISTS (SELECT 1 FROM public.events WHERE id = OLD.event_id) THEN
      RETURN NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.event_managers WHERE event_id = OLD.event_id) THEN
      RAISE EXCEPTION 'An event must have at least one Event Manager.';
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (SELECT 1 FROM public.event_managers WHERE event_id = NEW.id) THEN
      RAISE EXCEPTION 'An event must have at least one Event Manager upon creation.';
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.create_course_with_manager(
  p_title TEXT, p_slug TEXT, p_description TEXT, p_teacher_name TEXT, 
  p_start_date TIMESTAMP WITH TIME ZONE, p_end_date TIMESTAMP WITH TIME ZONE, 
  p_reg_close_date TIMESTAMP WITH TIME ZONE, p_image_url TEXT, p_venue TEXT, 
  p_timings TEXT, p_registration_link TEXT, p_manager_id UUID
) RETURNS UUID AS $$
DECLARE
  v_course_id UUID;
  v_resps TEXT[];
  v_caller_resps TEXT[];
BEGIN
  SELECT responsibilities INTO v_caller_resps FROM public.profiles WHERE id = auth.uid() AND archived_at IS NULL;
  IF v_caller_resps IS NULL OR NOT ('Teacher' = ANY(v_caller_resps) OR 'Administrator' = ANY(v_caller_resps)) THEN
    RAISE EXCEPTION 'Unauthorized: Only active Teachers and Administrators can create courses.';
  END IF;

  SELECT responsibilities INTO v_resps FROM public.profiles WHERE id = p_manager_id AND archived_at IS NULL;
  IF v_resps IS NULL OR NOT ('Teacher' = ANY(v_resps)) THEN
    RAISE EXCEPTION 'Only active Teachers may be assigned as Course Managers.';
  END IF;

  INSERT INTO public.courses (title, slug, description, teacher_name, start_date, end_date, registration_close_date, image_url, venue, timings, registration_link, created_by)
  VALUES (p_title, p_slug, p_description, p_teacher_name, p_start_date, p_end_date, p_reg_close_date, p_image_url, p_venue, p_timings, p_registration_link, auth.uid())
  RETURNING id INTO v_course_id;

  INSERT INTO public.course_managers (course_id, user_id) VALUES (v_course_id, p_manager_id);
  
  IF auth.uid() != p_manager_id AND 'Teacher' = ANY(v_caller_resps) THEN
    INSERT INTO public.course_managers (course_id, user_id) VALUES (v_course_id, auth.uid()) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN v_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.create_course_with_manager FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_course_with_manager TO authenticated;


CREATE OR REPLACE FUNCTION public.create_event_with_manager(
  p_title TEXT, p_slug TEXT, p_description TEXT, p_date TIMESTAMP WITH TIME ZONE, 
  p_image_url TEXT, p_manager_id UUID
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_resps TEXT[];
  v_caller_resps TEXT[];
BEGIN
  SELECT responsibilities INTO v_caller_resps FROM public.profiles WHERE id = auth.uid() AND archived_at IS NULL;
  IF v_caller_resps IS NULL OR NOT ('Teacher' = ANY(v_caller_resps) OR 'Volunteer' = ANY(v_caller_resps) OR 'Administrator' = ANY(v_caller_resps)) THEN
    RAISE EXCEPTION 'Unauthorized: Only active Staff can create events.';
  END IF;

  SELECT responsibilities INTO v_resps FROM public.profiles WHERE id = p_manager_id AND archived_at IS NULL;
  IF v_resps IS NULL OR NOT ('Teacher' = ANY(v_resps) OR 'Volunteer' = ANY(v_resps)) THEN
    RAISE EXCEPTION 'Only active Teachers or Volunteers may be assigned as Event Managers.';
  END IF;

  INSERT INTO public.events (title, slug, description, date, image_url, created_by)
  VALUES (p_title, p_slug, p_description, p_date, p_image_url, auth.uid())
  RETURNING id INTO v_event_id;

  INSERT INTO public.event_managers (event_id, user_id) VALUES (v_event_id, p_manager_id);
  
  IF auth.uid() != p_manager_id AND ('Teacher' = ANY(v_caller_resps) OR 'Volunteer' = ANY(v_caller_resps)) THEN
    INSERT INTO public.event_managers (event_id, user_id) VALUES (v_event_id, auth.uid()) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.create_event_with_manager FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_event_with_manager TO authenticated;


CREATE OR REPLACE FUNCTION public.delete_old_archived_items() 
RETURNS void AS $$
BEGIN
  DELETE FROM public.courses WHERE archived_at < NOW() - INTERVAL '14 days';
  DELETE FROM public.events WHERE archived_at < NOW() - INTERVAL '14 days';
  DELETE FROM public.gallery_items WHERE archived_at < NOW() - INTERVAL '14 days';
  DELETE FROM public.announcements WHERE archived_at < NOW() - INTERVAL '14 days';
  DELETE FROM public.wisdom_quotes WHERE archived_at < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.protect_administrator()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF 'Administrator' = ANY(OLD.responsibilities) THEN
      RAISE EXCEPTION 'Cannot delete an Administrator account';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF 'Administrator' = ANY(OLD.responsibilities) AND NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL THEN
      RAISE EXCEPTION 'Cannot archive an Administrator account';
    END IF;

    IF NOT ('Administrator' = ANY(OLD.responsibilities)) AND 'Administrator' = ANY(NEW.responsibilities) THEN
      INSERT INTO public.admin_assignments (user_id, granted_by, granted_at)
      VALUES (NEW.id, auth.uid(), NOW());
    END IF;
    
    IF 'Administrator' = ANY(OLD.responsibilities) AND NOT ('Administrator' = ANY(NEW.responsibilities)) THEN
      IF auth.uid() = OLD.id THEN
        RETURN NEW;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM public.admin_assignments 
        WHERE user_id = OLD.id 
          AND granted_by = auth.uid() 
          AND granted_at >= NOW() - INTERVAL '3 days'
      ) THEN
        RAISE EXCEPTION 'Cannot remove Administrator responsibility from another user after the 3-day reversal window';
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ------------------------------------------------------------------------------
-- 2. TRIGGERS
-- ------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS ensure_course_manager_count_del ON public.course_managers;
CREATE CONSTRAINT TRIGGER ensure_course_manager_count_del
  AFTER DELETE ON public.course_managers
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE PROCEDURE public.check_course_managers_count_deferred();

DROP TRIGGER IF EXISTS ensure_course_manager_count_ins ON public.courses;
CREATE CONSTRAINT TRIGGER ensure_course_manager_count_ins
  AFTER INSERT ON public.courses
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE PROCEDURE public.check_course_managers_count_deferred();

DROP TRIGGER IF EXISTS ensure_event_manager_count_del ON public.event_managers;
CREATE CONSTRAINT TRIGGER ensure_event_manager_count_del
  AFTER DELETE ON public.event_managers
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE PROCEDURE public.check_event_managers_count_deferred();

DROP TRIGGER IF EXISTS ensure_event_manager_count_ins ON public.events;
CREATE CONSTRAINT TRIGGER ensure_event_manager_count_ins
  AFTER INSERT ON public.events
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE PROCEDURE public.check_event_managers_count_deferred();

DROP TRIGGER IF EXISTS protect_admin_trigger ON public.profiles;
CREATE TRIGGER protect_admin_trigger
  BEFORE DELETE OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_administrator();


-- ------------------------------------------------------------------------------
-- 3. INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_course_managers_course_id ON public.course_managers(course_id);
CREATE INDEX IF NOT EXISTS idx_event_managers_event_id ON public.event_managers(event_id);
CREATE INDEX IF NOT EXISTS idx_course_managers_user_id ON public.course_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_event_managers_user_id ON public.event_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_archived_at ON public.courses(archived_at);
CREATE INDEX IF NOT EXISTS idx_events_archived_at ON public.events(archived_at);
CREATE INDEX IF NOT EXISTS idx_profiles_archived_at ON public.profiles(archived_at);
CREATE INDEX IF NOT EXISTS idx_gallery_archived_at ON public.gallery_items(archived_at);
CREATE INDEX IF NOT EXISTS idx_announcements_archived_at ON public.announcements(archived_at);
CREATE INDEX IF NOT EXISTS idx_wisdom_quotes_archived_at ON public.wisdom_quotes(archived_at);


-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Ensure RLS is active
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wisdom_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_managers ENABLE ROW LEVEL SECURITY;

-- Public can read active content
DROP POLICY IF EXISTS "Public can view active courses" ON public.courses;
CREATE POLICY "Public can view active courses" ON public.courses FOR SELECT USING (archived_at IS NULL);
DROP POLICY IF EXISTS "Public can view active events" ON public.events;
CREATE POLICY "Public can view active events" ON public.events FOR SELECT USING (archived_at IS NULL);
DROP POLICY IF EXISTS "Public can view active gallery items" ON public.gallery_items;
CREATE POLICY "Public can view active gallery items" ON public.gallery_items FOR SELECT USING (archived_at IS NULL);
DROP POLICY IF EXISTS "Public can view active announcements" ON public.announcements;
CREATE POLICY "Public can view active announcements" ON public.announcements FOR SELECT USING (archived_at IS NULL AND active = true);
DROP POLICY IF EXISTS "Public can view active wisdom quotes" ON public.wisdom_quotes;
CREATE POLICY "Public can view active wisdom quotes" ON public.wisdom_quotes FOR SELECT USING (archived_at IS NULL AND active = true);

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT USING (
  public.has_responsibility('Administrator') OR 
  public.has_responsibility('Teacher') OR 
  public.has_responsibility('Volunteer')
);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.has_responsibility('Administrator'));

-- Courses
DROP POLICY IF EXISTS "Admins can manage all courses" ON public.courses;
CREATE POLICY "Admins can manage all courses" ON public.courses FOR ALL USING (public.has_responsibility('Administrator'));
DROP POLICY IF EXISTS "Teachers can insert courses" ON public.courses;
CREATE POLICY "Teachers can insert courses" ON public.courses FOR INSERT WITH CHECK (public.has_responsibility('Teacher'));
DROP POLICY IF EXISTS "Teachers can manage assigned courses" ON public.courses;
CREATE POLICY "Teachers can manage assigned courses" ON public.courses FOR ALL USING (
  public.has_responsibility('Teacher') AND 
  public.is_course_manager(id)
);

-- Events
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events" ON public.events FOR ALL USING (public.has_responsibility('Administrator'));
DROP POLICY IF EXISTS "Staff can insert events" ON public.events;
CREATE POLICY "Staff can insert events" ON public.events FOR INSERT WITH CHECK (
  public.has_responsibility('Teacher') OR public.has_responsibility('Volunteer')
);
DROP POLICY IF EXISTS "Staff can manage assigned events" ON public.events;
CREATE POLICY "Staff can manage assigned events" ON public.events FOR ALL USING (
  (public.has_responsibility('Teacher') OR public.has_responsibility('Volunteer')) AND 
  public.is_event_manager(id)
);

-- Course Managers
DROP POLICY IF EXISTS "Admins can manage course_managers" ON public.course_managers;
CREATE POLICY "Admins can manage course_managers" ON public.course_managers FOR ALL 
  USING (public.has_responsibility('Administrator')) 
  WITH CHECK (public.has_responsibility('Administrator'));
DROP POLICY IF EXISTS "Course managers can manage course_managers" ON public.course_managers;
CREATE POLICY "Course managers can manage course_managers" ON public.course_managers FOR ALL 
  USING (public.is_course_manager(course_id))
  WITH CHECK (public.is_course_manager(course_id));
DROP POLICY IF EXISTS "Staff can view course_managers" ON public.course_managers;
CREATE POLICY "Staff can view course_managers" ON public.course_managers FOR SELECT USING (
  public.has_responsibility('Administrator') OR public.has_responsibility('Teacher') OR public.has_responsibility('Volunteer')
);

-- Event Managers
DROP POLICY IF EXISTS "Admins can manage event_managers" ON public.event_managers;
CREATE POLICY "Admins can manage event_managers" ON public.event_managers FOR ALL 
  USING (public.has_responsibility('Administrator')) 
  WITH CHECK (public.has_responsibility('Administrator'));
DROP POLICY IF EXISTS "Event managers can manage event_managers" ON public.event_managers;
CREATE POLICY "Event managers can manage event_managers" ON public.event_managers FOR ALL 
  USING (public.is_event_manager(event_id))
  WITH CHECK (public.is_event_manager(event_id));
DROP POLICY IF EXISTS "Staff can view event_managers" ON public.event_managers;
CREATE POLICY "Staff can view event_managers" ON public.event_managers FOR SELECT USING (
  public.has_responsibility('Administrator') OR public.has_responsibility('Teacher') OR public.has_responsibility('Volunteer')
);

-- Gallery
DROP POLICY IF EXISTS "Staff can manage gallery" ON public.gallery_items;
CREATE POLICY "Staff can manage gallery" ON public.gallery_items FOR ALL USING (
  public.has_responsibility('Administrator') OR 
  public.has_responsibility('Teacher') OR 
  public.has_responsibility('Volunteer')
);

-- Announcements & Wisdom
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (public.has_responsibility('Administrator'));
DROP POLICY IF EXISTS "Admins can manage wisdom quotes" ON public.wisdom_quotes;
CREATE POLICY "Admins can manage wisdom quotes" ON public.wisdom_quotes FOR ALL USING (public.has_responsibility('Administrator'));

-- Notifications
DROP POLICY IF EXISTS "Users can view and update own notifications" ON public.notifications;
CREATE POLICY "Users can view and update own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- Admin Assignments
DROP POLICY IF EXISTS "Admins can view and manage assignments" ON public.admin_assignments;
CREATE POLICY "Admins can view and manage assignments" ON public.admin_assignments FOR ALL USING (public.has_responsibility('Administrator'));
DROP POLICY IF EXISTS "Users can view their own assignments" ON public.admin_assignments;
CREATE POLICY "Users can view their own assignments" ON public.admin_assignments FOR SELECT USING (user_id = auth.uid());


-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKETS & POLICIES
-- ------------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('gallery', 'profiles') );

DROP POLICY IF EXISTS "Staff Uploads" ON storage.objects;
CREATE POLICY "Staff Uploads" ON storage.objects FOR INSERT WITH CHECK ( 
  bucket_id IN ('gallery', 'profiles') AND auth.role() = 'authenticated' 
);

DROP POLICY IF EXISTS "Staff Updates" ON storage.objects;
CREATE POLICY "Staff Updates" ON storage.objects FOR UPDATE USING ( 
  bucket_id IN ('gallery', 'profiles') AND auth.role() = 'authenticated' 
);

DROP POLICY IF EXISTS "Staff Deletes" ON storage.objects;
CREATE POLICY "Staff Deletes" ON storage.objects FOR DELETE USING ( 
  bucket_id IN ('gallery', 'profiles') AND auth.role() = 'authenticated' 
);


-- ------------------------------------------------------------------------------
-- 6. CRON SCHEDULES
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  PERFORM cron.unschedule('delete_expired_archive_items');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule('delete_expired_archive_items', '0 0 * * *', $$SELECT public.delete_old_archived_items()$$);
