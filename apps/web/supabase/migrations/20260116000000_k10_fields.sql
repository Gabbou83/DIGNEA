-- Add K10-specific fields to rpas table

ALTER TABLE public.rpas
ADD COLUMN IF NOT EXISTS k10_certification_status VARCHAR,
ADD COLUMN IF NOT EXISTS k10_certification_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS k10_last_synced_at TIMESTAMPTZ;

-- Add index for K10 sync queries
CREATE INDEX IF NOT EXISTS idx_rpas_k10_synced ON public.rpas(k10_last_synced_at);

-- Add comment
COMMENT ON COLUMN public.rpas.k10_certification_status IS 'K10 certification status: active, suspended, expired';
COMMENT ON COLUMN public.rpas.k10_certification_date IS 'Date of K10 certification';
COMMENT ON COLUMN public.rpas.k10_last_synced_at IS 'Last sync with K10 registry';
