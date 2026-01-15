-- Drop previous function
DROP FUNCTION IF EXISTS search_rpas_k10(TEXT, INT);

-- Create simplified search function that returns JSONB array
CREATE OR REPLACE FUNCTION search_rpas_k10(search_query TEXT, result_limit INT DEFAULT 10)
RETURNS JSONB AS $$
DECLARE
  normalized_query TEXT;
BEGIN
  -- Normalize query: lowercase, remove accents
  normalized_query := lower(translate(search_query,
    'àáâãäåāăąèéêëēĕėęěìíîïĩīĭòóôõöōŏőùúûüũūŭůçćĉċčñńņň',
    'aaaaaaaaaeeeeeeeeeiiiiiiiooooooooouuuuuuuucccccnnnn'));

  -- Return results as JSONB array using subquery for ORDER BY and LIMIT
  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(sub)), '[]'::jsonb)
    FROM (
      SELECT
        rpas.k10_id,
        rpas.name,
        rpas.city,
        rpas.region,
        rpas.address,
        rpas.phone,
        rpas.category,
        CASE
          WHEN lower(rpas.k10_id) = lower(search_query) THEN 1.0
          WHEN lower(rpas.k10_id) LIKE '%' || lower(search_query) || '%' THEN 0.95
          WHEN lower(translate(rpas.name,
            'àáâãäåāăąèéêëēĕėęěìíîïĩīĭòóôõöōŏőùúûüũūŭůçćĉċčñńņň',
            'aaaaaaaaaeeeeeeeeeiiiiiiiooooooooouuuuuuuucccccnnnn'))
            LIKE normalized_query || '%' THEN 0.9
          WHEN lower(translate(rpas.name,
            'àáâãäåāăąèéêëēĕėęěìíîïĩīĭòóôõöōŏőùúûüũūŭůçćĉċčñńņň',
            'aaaaaaaaaeeeeeeeeeiiiiiiiooooooooouuuuuuuucccccnnnn'))
            LIKE '%' || normalized_query || '%' THEN 0.7
          WHEN lower(translate(COALESCE(rpas.city, ''),
            'àáâãäåāăąèéêëēĕėęěìíîïĩīĭòóôõöōŏőùúûüũūŭůçćĉċčñńņň',
            'aaaaaaaaaeeeeeeeeeiiiiiiiooooooooouuuuuuuucccccnnnn'))
            LIKE '%' || normalized_query || '%' THEN 0.5
          ELSE 0.3
        END as relevance
      FROM public.rpas
      WHERE rpas.is_active = true
        AND (
          lower(rpas.k10_id) LIKE '%' || lower(search_query) || '%'
          OR lower(translate(rpas.name,
            'àáâãäåāăąèéêëēĕėęěìíîïĩīĭòóôõöōŏőùúûüũūŭůçćĉċčñńņň',
            'aaaaaaaaaeeeeeeeeeiiiiiiiooooooooouuuuuuuucccccnnnn'))
            LIKE '%' || normalized_query || '%'
          OR lower(translate(COALESCE(rpas.city, ''),
            'àáâãäåāăąèéêëēĕėęěìíîïĩīĭòóôõöōŏőùúûüũūŭůçćĉċčñńņň',
            'aaaaaaaaaeeeeeeeeeiiiiiiiooooooooouuuuuuuucccccnnnn'))
            LIKE '%' || normalized_query || '%'
        )
      ORDER BY relevance DESC
      LIMIT result_limit
    ) sub
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_rpas_k10 IS 'Search RPAs with accent-insensitive matching, returns JSONB array';
