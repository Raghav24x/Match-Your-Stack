-- Drop the existing view
DROP VIEW IF EXISTS public.v_recommendations;

-- Recreate the view with SECURITY INVOKER explicitly set
-- This ensures the view respects the querying user's permissions and RLS policies
CREATE VIEW public.v_recommendations 
WITH (security_invoker = true) AS
SELECT 
    b.id AS brief_id,
    c.id AS creator_id,
    c.name AS creator_name,
    c.role_type,
    c.niches,
    c.bio,
    c.substack_url,
    c.audience_size,
    c.linkedin_url,
    c.pricing_tier,
    c.availability,
    c.samples,
    (
        CASE
            WHEN c.role_type = b.role_type_required THEN 50
            ELSE 0
        END +
        CASE
            WHEN c.niches && b.niches THEN (
                SELECT count(*)
                FROM unnest(c.niches) AS niche
                WHERE niche = ANY(b.niches)
            ) * 10
            ELSE 0
        END +
        CASE
            WHEN c.pricing_tier = '$' AND b.budget_max <= 2000 THEN 20
            WHEN c.pricing_tier = '$$' AND b.budget_max >= 2000 AND b.budget_max <= 5000 THEN 20
            WHEN c.pricing_tier = '$$$' AND b.budget_max > 5000 THEN 20
            ELSE 5
        END +
        CASE
            WHEN c.availability = 'open' THEN 15
            WHEN c.availability = 'limited' THEN 10
            ELSE 0
        END
    )::double precision AS score
FROM public.briefs b
CROSS JOIN public.creators c
WHERE b.status = 'open' 
  AND c.availability IN ('open', 'limited');