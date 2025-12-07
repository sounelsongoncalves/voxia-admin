-- Add fueling details to journey_events or create a dedicated structure if needed.
-- Assuming journey_events has a 'metadata' jsonb column or similar, but let's add explicit columns for better reporting if they don't exist.
-- Checking if journey_events exists first (it should).

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journey_events' AND column_name = 'fuel_liters') THEN
        ALTER TABLE public.journey_events ADD COLUMN fuel_liters numeric;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journey_events' AND column_name = 'fuel_type') THEN
        ALTER TABLE public.journey_events ADD COLUMN fuel_type text; -- 'Diesel', 'Green Diesel', 'AdBlue'
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journey_events' AND column_name = 'target_asset_type') THEN
        ALTER TABLE public.journey_events ADD COLUMN target_asset_type text DEFAULT 'Vehicle'; -- 'Vehicle', 'Trailer'
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journey_events' AND column_name = 'target_asset_id') THEN
        ALTER TABLE public.journey_events ADD COLUMN target_asset_id uuid;
    END IF;
END $$;

-- Create a view for easier querying of fueling events
CREATE OR REPLACE VIEW public.v_fueling_events AS
SELECT
    je.id,
    je.occurred_at,
    je.fuel_liters,
    je.fuel_type,
    je.target_asset_type,
    je.target_asset_id,
    j.driver_id,
    d.name as driver_name,
    j.vehicle_id,
    v.plate as vehicle_plate,
    -- Try to resolve trailer plate if target is trailer
    CASE 
        WHEN je.target_asset_type = 'Trailer' THEN 
            (SELECT plate FROM vehicles WHERE id = je.target_asset_id)
        ELSE NULL
    END as trailer_plate
FROM
    public.journey_events je
JOIN
    public.journeys j ON je.journey_id = j.id
LEFT JOIN
    public.drivers d ON j.driver_id = d.id
LEFT JOIN
    public.vehicles v ON j.vehicle_id = v.id
WHERE
    je.type = 'ABASTECIMENTO';
