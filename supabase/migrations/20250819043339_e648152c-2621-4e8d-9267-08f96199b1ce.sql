
-- Create the missing project_analytics table that the dashboard charts need
CREATE TABLE IF NOT EXISTS public.project_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  api_calls_count INTEGER NOT NULL DEFAULT 0,
  tokens_used BIGINT NOT NULL DEFAULT 0,
  daily_cost NUMERIC NOT NULL DEFAULT 0.00,
  files_modified INTEGER NOT NULL DEFAULT 0,
  agent_operations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view analytics of their projects
CREATE POLICY "Users can view analytics of their projects" 
  ON public.project_analytics 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_analytics.project_id 
    AND p.owner_id = auth.uid()
  ));

-- Create policy for system to insert analytics data
CREATE POLICY "System can insert analytics data" 
  ON public.project_analytics 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_analytics.project_id 
    AND p.owner_id = auth.uid()
  ));
