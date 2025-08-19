
-- Update llm_providers table to add new columns
ALTER TABLE public.llm_providers 
ADD COLUMN selected_models JSONB DEFAULT '[]'::jsonb,
ADD COLUMN provider_config JSONB DEFAULT '{}'::jsonb;

-- Create llm_usage_analytics table for real-time tracking
CREATE TABLE public.llm_usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.llm_providers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  model_name TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(10,6) NOT NULL DEFAULT 0.00,
  request_type TEXT NOT NULL DEFAULT 'completion',
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on llm_usage_analytics
ALTER TABLE public.llm_usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policy for llm_usage_analytics - users can manage their own analytics
CREATE POLICY "Users can manage their own LLM usage analytics" 
  ON public.llm_usage_analytics 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add realtime support for llm_usage_analytics
ALTER TABLE public.llm_usage_analytics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.llm_usage_analytics;
