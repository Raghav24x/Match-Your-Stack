-- Drop the existing view first
DROP VIEW IF EXISTS public.v_recommendations;

-- Create the v_recommendations view for creator matching with correct data types
CREATE OR REPLACE VIEW public.v_recommendations AS
SELECT 
  b.id as brief_id,
  c.id as creator_id,
  c.name as creator_name,
  c.role_type,
  c.niches,
  c.bio,
  c.substack_url,
  c.audience_size,
  c.linkedin_url,
  c.pricing_tier,
  c.availability,
  c.samples,
  -- Simple scoring algorithm - cast to double precision for consistency
  (CASE 
    WHEN c.role_type = b.role_type_required THEN 50
    ELSE 0
  END +
  CASE 
    WHEN c.niches && b.niches THEN 
      (SELECT COUNT(*) FROM unnest(c.niches) niche WHERE niche = ANY(b.niches)) * 10
    ELSE 0
  END +
  CASE 
    WHEN c.pricing_tier = '$' AND b.budget_max <= 2000 THEN 20
    WHEN c.pricing_tier = '$$' AND b.budget_max BETWEEN 2000 AND 5000 THEN 20
    WHEN c.pricing_tier = '$$$' AND b.budget_max > 5000 THEN 20
    ELSE 5
  END +
  CASE 
    WHEN c.availability = 'open' THEN 15
    WHEN c.availability = 'limited' THEN 10
    ELSE 0
  END)::double precision as score
FROM 
  public.briefs b
  CROSS JOIN public.creators c
WHERE 
  b.status = 'open'
  AND c.availability IN ('open', 'limited');