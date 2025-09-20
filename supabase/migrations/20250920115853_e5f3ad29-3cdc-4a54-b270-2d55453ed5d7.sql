-- Create the v_recommendations view for creator matching
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
  -- Simple scoring algorithm
  CASE 
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
  END as score
FROM 
  public.briefs b
  CROSS JOIN public.creators c
WHERE 
  b.status = 'open'
  AND c.availability IN ('open', 'limited');

-- Add some seed data for testing
INSERT INTO public.creators (user_id, name, role_type, niches, bio, substack_url, audience_size, pricing_tier, availability, samples) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Sarah Chen', 'content-writer', ARRAY['Technology', 'AI', 'SaaS'], 'Tech writer specializing in AI and SaaS products. 5+ years experience writing for tech companies.', 'https://sarahchen.substack.com', 12000, '$$', 'open', ARRAY['https://example.com/sample1']),
('00000000-0000-0000-0000-000000000002'::uuid, 'Michael Rodriguez', 'ghostwriter', ARRAY['Finance', 'Crypto', 'Investing'], 'Financial content expert with deep knowledge of crypto and traditional investing.', 'https://financewriter.substack.com', 8500, '$$$', 'limited', ARRAY['https://example.com/sample2']),
('00000000-0000-0000-0000-000000000003'::uuid, 'Emma Thompson', 'pm-writes', ARRAY['Product Management', 'Strategy', 'Leadership'], 'Product leader turned writer. Sharing insights on building great products and leading teams.', 'https://pminsights.substack.com', 15000, '$$', 'open', ARRAY['https://example.com/sample3']),
('00000000-0000-0000-0000-000000000004'::uuid, 'David Kim', 'content-writer', ARRAY['Healthcare', 'Biotech', 'Science'], 'Medical writer with PhD in Biology. Making complex science accessible to everyone.', 'https://sciencewriter.substack.com', 6000, '$', 'open', ARRAY['https://example.com/sample4']),
('00000000-0000-0000-0000-000000000005'::uuid, 'Lisa Wang', 'ghostwriter', ARRAY['Marketing', 'Growth', 'SaaS'], 'Growth marketing expert helping B2B SaaS companies scale through content.', 'https://growthwriting.substack.com', 20000, '$$$', 'open', ARRAY['https://example.com/sample5']);