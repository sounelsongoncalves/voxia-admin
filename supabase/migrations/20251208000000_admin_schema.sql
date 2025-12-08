-- Migration: Admin Schema
-- Description: Adds tables and enums for Admin panel (Sprint 1) based on Unified Prisma Schema
-- Date: 2025-12-08

-- =====================================================
-- 1. Create ENUMS
-- =====================================================

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE journey_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('LOADING', 'UNLOADING', 'POD', 'FUEL', 'TOLL', 'BREAKDOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('ID_CARD', 'DRIVERS_LICENSE', 'RESIDENCE_PERMIT', 'CONTRACT', 'PAYSLIP', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('VALID', 'EXPIRING', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_type AS ENUM ('VACATION', 'SICK_LEAVE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_channel AS ENUM ('OPERATIONS', 'HR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sender_role AS ENUM ('DRIVER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_type_enum AS ENUM ('TRUCK', 'VAN', 'CAR', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trailer_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE maintenance_type AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'INSPECTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE maintenance_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'DONE', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hr_request_type AS ENUM ('DATA_UPDATE', 'DOCUMENT_REQUEST', 'PAYSLIP_QUESTION', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hr_request_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE training_type AS ENUM ('MANDATORY', 'OPTIONAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE training_modality AS ENUM ('ONLINE', 'PRESENTIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE training_status AS ENUM ('INVITED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('ADMIN', 'OPERATIONS_MANAGER', 'HR_MANAGER', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_status AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('NEW_TRIP', 'LEAVE_STATUS', 'DOCUMENT_EXPIRING', 'NEW_PAYSLIP', 'HR_RESPONSE', 'SYSTEM', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_type AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'SAFETY', 'COMPLIANCE', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity AS ENUM ('INFO', 'WARNING', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'IGNORED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. Create Tables
-- =====================================================

-- AdminUser
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role admin_role DEFAULT 'OPERATIONS_MANAGER',
    status admin_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ
);

-- AuditLog
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    changes JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trailers
CREATE TABLE IF NOT EXISTS public.trailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate TEXT UNIQUE NOT NULL,
    type TEXT,
    max_weight_kg INT,
    status trailer_status DEFAULT 'ACTIVE',
    last_inspection_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MaintenanceRecord
CREATE TABLE IF NOT EXISTS public.maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    type maintenance_type NOT NULL,
    description TEXT NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL,
    performed_by TEXT NOT NULL,
    cost DOUBLE PRECISION,
    next_maintenance_date TIMESTAMPTZ,
    next_maintenance_km INT,
    status maintenance_status DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Note: Foreign key constraint for vehicle_id added later if table exists
DO $$ BEGIN
    ALTER TABLE public.maintenance_records ADD CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;


-- TrainingSession
CREATE TABLE IF NOT EXISTS public.training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type training_type NOT NULL,
    modality training_modality NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TrainingEnrollment
CREATE TABLE IF NOT EXISTS public.training_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID NOT NULL REFERENCES public.training_sessions(id),
    driver_id UUID NOT NULL,
    status training_status DEFAULT 'INVITED',
    score INT,
    completion_date TIMESTAMPTZ
);
-- FK to drivers/users
DO $$ BEGIN
    ALTER TABLE public.training_enrollments ADD CONSTRAINT fk_enrollment_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;


-- HRRequest
CREATE TABLE IF NOT EXISTS public.hr_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    type hr_request_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status hr_request_status DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolver_id UUID REFERENCES public.admin_users(id),
    resolution_note TEXT,
    resolution_date TIMESTAMPTZ
);
DO $$ BEGIN
    ALTER TABLE public.hr_requests ADD CONSTRAINT fk_hr_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;


-- Leaves
CREATE TABLE IF NOT EXISTS public.leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    type leave_type NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    total_days INT NOT NULL,
    reason TEXT,
    status leave_status DEFAULT 'PENDING',
    approver_id UUID REFERENCES public.admin_users(id),
    response_date TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DO $$ BEGIN
    ALTER TABLE public.leaves ADD CONSTRAINT fk_leave_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;


-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    type document_type NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    issue_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    status document_status DEFAULT 'VALID',
    viewed BOOLEAN DEFAULT false,
    viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DO $$ BEGIN
    ALTER TABLE public.documents ADD CONSTRAINT fk_document_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;

-- PerformanceSnapshot
CREATE TABLE IF NOT EXISTS public.performance_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    period TEXT NOT NULL,
    journeys_count INT NOT NULL,
    total_km INT NOT NULL,
    on_time_rate DOUBLE PRECISION NOT NULL,
    breakdowns_count INT NOT NULL,
    fuel_events_count INT NOT NULL,
    avg_fuel_cost_per_km DOUBLE PRECISION NOT NULL,
    safety_incidents_count INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(driver_id, period)
);
DO $$ BEGIN
    ALTER TABLE public.performance_snapshots ADD CONSTRAINT fk_snapshot_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;


-- Trip
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID,
    vehicle_id UUID,
    trailer_id UUID REFERENCES public.trailers(id),
    client_id TEXT,
    origin JSONB NOT NULL,
    destination JSONB NOT NULL,
    cargo_info JSONB,
    status trip_status DEFAULT 'PENDING',
    documents TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DO $$ BEGIN
    ALTER TABLE public.trips ADD CONSTRAINT fk_trip_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
    ALTER TABLE public.trips ADD CONSTRAINT fk_trip_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    status notification_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ
);
DO $$ BEGIN
    ALTER TABLE public.notifications ADD CONSTRAINT fk_notification_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;

-- Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type alert_type NOT NULL,
    severity alert_severity NOT NULL,
    status alert_status DEFAULT 'OPEN',
    message TEXT NOT NULL,
    driver_id UUID,
    vehicle_id UUID,
    journey_id UUID,
    trip_id UUID REFERENCES public.trips(id),
    event_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by_id UUID REFERENCES public.admin_users(id)
);
DO $$ BEGIN
    ALTER TABLE public.alerts ADD CONSTRAINT fk_alert_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
    ALTER TABLE public.alerts ADD CONSTRAINT fk_alert_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);
    ALTER TABLE public.alerts ADD CONSTRAINT fk_alert_journey FOREIGN KEY (journey_id) REFERENCES public.journeys(id);
    ALTER TABLE public.alerts ADD CONSTRAINT fk_alert_event FOREIGN KEY (event_id) REFERENCES public.journey_events(id);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;


-- Locations
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID,
    vehicle_id UUID,
    journey_id UUID,
    trip_id UUID REFERENCES public.trips(id),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT now()
);
DO $$ BEGIN
    ALTER TABLE public.locations ADD CONSTRAINT fk_location_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
    ALTER TABLE public.locations ADD CONSTRAINT fk_location_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);
    ALTER TABLE public.locations ADD CONSTRAINT fk_location_journey FOREIGN KEY (journey_id) REFERENCES public.journeys(id);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;


-- =====================================================
-- 3. Modify Existing Tables
-- =====================================================

-- journeys
DO $$ BEGIN
    ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES public.trips(id);
    ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS trailer_id UUID REFERENCES public.trailers(id);
    ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS initial_checklist JSONB;
    ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS final_checklist JSONB;
    ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT false;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;

-- journey_events (Event)
DO $$ BEGIN
    ALTER TABLE public.journey_events ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES public.trips(id);
    ALTER TABLE public.journey_events ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT false;
    ALTER TABLE public.journey_events ADD COLUMN IF NOT EXISTS photos TEXT[];
    ALTER TABLE public.journey_events ADD COLUMN IF NOT EXISTS data JSONB;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;

-- chat_messages (Message)
DO $$ BEGIN
    ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES public.admin_users(id);
    -- chat_messages might already have sender_role as text. If so, we leave it.
    -- We add channel if missing
    ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS channel message_channel;
    ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS attachments TEXT[];
    ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS "read" BOOLEAN DEFAULT false;
    ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;

-- drivers (User)
DO $$ BEGIN
    ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS nif TEXT UNIQUE;
    ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS niss TEXT UNIQUE;
    ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS admission_date TIMESTAMPTZ;
    ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'ACTIVE';
    ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS photo_url TEXT;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;

-- vehicles
DO $$ BEGIN
    ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS odometer INT;
    -- Only add type if it doesn't exist, to avoid conflict with existing foreign key
    -- ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS type vehicle_type_enum DEFAULT 'TRUCK';
    ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS status vehicle_status DEFAULT 'ACTIVE';
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;


-- =====================================================
-- 4. Seed Data
-- =====================================================

-- Insert into public.admin_users
INSERT INTO public.admin_users (email, password_hash, full_name, role, status)
VALUES (
    'admin@tpcf.com',
    '$2b$10$V7Q669hpDyx7h8xipxUyYudBseGbNKSuu96cmjG86kkdNdereg5aG', -- Hashed 'admin123'
    'System Administrator',
    'ADMIN',
    'ACTIVE'
)
ON CONFLICT (email) DO NOTHING;

-- Insert into auth.users (Supabase Auth)
-- This is needed for signInWithPassword to work
INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
VALUES (
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@tpcf.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (email) DO NOTHING;

-- Enable RLS for new tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.admin_users FOR SELECT USING (true);
