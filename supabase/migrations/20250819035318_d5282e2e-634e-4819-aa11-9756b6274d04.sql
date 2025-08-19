
-- Add credits_remaining column to users_profiles table
ALTER TABLE public.users_profiles 
ADD COLUMN IF NOT EXISTS credits_remaining integer NOT NULL DEFAULT 1000;

-- Add an index for better performance on credits queries
CREATE INDEX IF NOT EXISTS idx_users_profiles_credits 
ON public.users_profiles(credits_remaining);
