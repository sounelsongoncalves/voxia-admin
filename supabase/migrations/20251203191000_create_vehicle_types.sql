-- Create vehicle_types table
CREATE TABLE IF NOT EXISTS public.vehicle_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Create vehicle_type_synonyms table
CREATE TABLE IF NOT EXISTS public.vehicle_type_synonyms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_type_id uuid REFERENCES public.vehicle_types(id) ON DELETE CASCADE,
    synonym text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_type_synonyms ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow read access for authenticated users" ON public.vehicle_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.vehicle_type_synonyms FOR SELECT TO authenticated USING (true);

-- Seed Data
DO $$
DECLARE
    v_camiao uuid;
    v_reboque uuid;
    v_ligeiro uuid;
    v_furgao uuid;
BEGIN
    -- Insert Types if not exist
    INSERT INTO public.vehicle_types (name, description) VALUES
    ('Camião', 'Veículo de carga pesado'),
    ('Reboque', 'Veículo de carga sem motor'),
    ('Ligeiro', 'Veículo de passageiros ou carga leve'),
    ('Furgão', 'Veículo de carga fechado')
    ON CONFLICT (name) DO NOTHING;

    -- Get IDs
    SELECT id INTO v_camiao FROM public.vehicle_types WHERE name = 'Camião';
    SELECT id INTO v_reboque FROM public.vehicle_types WHERE name = 'Reboque';
    SELECT id INTO v_ligeiro FROM public.vehicle_types WHERE name = 'Ligeiro';
    SELECT id INTO v_furgao FROM public.vehicle_types WHERE name = 'Furgão';

    -- Insert Synonyms
    INSERT INTO public.vehicle_type_synonyms (vehicle_type_id, synonym) VALUES
    (v_camiao, 'trator'),
    (v_camiao, 'pesado'),
    (v_camiao, 'caminhão'),
    (v_reboque, 'galera'),
    (v_reboque, 'atrelado'),
    (v_reboque, 'semi-reboque'),
    (v_ligeiro, 'carro'),
    (v_ligeiro, 'viatura'),
    (v_furgao, 'van');
END $$;
