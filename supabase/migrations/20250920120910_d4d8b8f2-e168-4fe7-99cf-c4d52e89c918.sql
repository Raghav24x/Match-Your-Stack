-- Drop the existing security definer view
DROP VIEW IF EXISTS public.v_recommendations;

-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default)
-- This ensures the view respects the querying user's permissions and RLS policies
CREATE VIEW public.v_recommendations AS
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

-- Add RLS policies to the view to ensure proper access control
ALTER VIEW public.v_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow companies to see recommendations for their own briefs
CREATE POLICY "companies can see recommendations for own briefs" 
ON public.v_recommendations 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.briefs b
        JOIN public.companies comp ON comp.id = b.company_id
        WHERE b.id = brief_id 
          AND comp.user_id = auth.uid()
    )
);

-- Allow creators to see recommendations where they are the matched creator
CREATE POLICY "creators can see their own recommendations" 
ON public.v_recommendations 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.creators cr
        WHERE cr.id = creator_id 
          AND cr.user_id = auth.uid()
    )
);