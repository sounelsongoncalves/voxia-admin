-- Migration: Add White-Label Settings
-- Description: Adds app_settings table and org-assets storage bucket for white-label configuration
-- Date: 2023-11-23

-- =====================================================
-- 1. Create app_settings table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_configured BOOLEAN NOT NULL DEFAULT false,
    org_name TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#00CC99',
    support_email TEXT,
    support_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment to table
COMMENT ON TABLE public.app_settings IS 'White-label configuration settings for the organization';

-- =====================================================
-- 2. Create storage bucket for organization assets
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-assets', 'org-assets', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. Storage policies for org-assets bucket
-- =====================================================

-- Allow public read access to org-assets (for logos)
CREATE POLICY "Public read access for org assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'org-assets');

-- Allow authenticated users to upload org assets
CREATE POLICY "Authenticated users can upload org assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'org-assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update org assets
CREATE POLICY "Authenticated users can update org assets"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'org-assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete org assets
CREATE POLICY "Authenticated users can delete org assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'org-assets' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- 4. RLS Policies for app_settings
-- =====================================================

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read app_settings (needed for public setup page and branding)
CREATE POLICY "Anyone can read app settings"
ON public.app_settings FOR SELECT
USING (true);

-- Allow authenticated users to insert app_settings (for initial setup)
CREATE POLICY "Authenticated users can insert app settings"
ON public.app_settings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update app_settings
CREATE POLICY "Authenticated users can update app settings"
ON public.app_settings FOR UPDATE
USING (auth.role() = 'authenticated');

-- =====================================================
-- 5. Create trigger for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. Insert default row (unconfigured state)
-- =====================================================
INSERT INTO public.app_settings (is_configured, org_name, primary_color)
VALUES (false, 'Voxia Logística', '#00CC99')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. Create index for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_app_settings_is_configured 
ON public.app_settings(is_configured);
