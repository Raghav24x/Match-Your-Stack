-- Add engagement fields to creators table
ALTER TABLE public.creators 
ADD COLUMN subscribers INTEGER DEFAULT 0,
ADD COLUMN posts_count INTEGER DEFAULT 0,
ADD COLUMN activity_score INTEGER DEFAULT 0;

-- Add index for better performance on engagement filtering
CREATE INDEX idx_creators_engagement ON public.creators(subscribers, posts_count, activity_score);