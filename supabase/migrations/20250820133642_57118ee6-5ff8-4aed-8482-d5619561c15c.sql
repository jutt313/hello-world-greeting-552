
-- Create enum for memory types
CREATE TYPE memory_type AS ENUM ('conversation', 'task', 'code_change', 'decision', 'learning', 'error', 'success');

-- Create enum for expertise categories
CREATE TYPE expertise_category AS ENUM ('frontend', 'backend', 'database', 'devops', 'testing', 'security', 'performance', 'architecture');

-- Enhanced agent memory contexts table
CREATE TABLE agent_memory_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  memory_type memory_type NOT NULL,
  context_key TEXT NOT NULL, -- e.g., 'task_completion', 'code_pattern', 'error_resolution'
  context_data JSONB NOT NULL DEFAULT '{}', -- Structured memory data
  relevance_score NUMERIC(3,2) DEFAULT 1.0, -- 0.0 to 1.0 for memory importance
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration for temporary memories
  tags TEXT[] DEFAULT '{}', -- For easy categorization and search
  related_message_id UUID REFERENCES chat_messages(id), -- Link to triggering conversation
  
  -- Ensure unique context per agent per project
  UNIQUE(agent_id, project_id, context_key)
);

-- Agent expertise patterns table for learning
CREATE TABLE agent_expertise_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  expertise_category expertise_category NOT NULL,
  pattern_name TEXT NOT NULL, -- e.g., 'react_component_optimization', 'database_query_performance'
  pattern_description TEXT,
  pattern_data JSONB NOT NULL DEFAULT '{}', -- The actual learned pattern/solution
  success_rate NUMERIC(5,2) DEFAULT 0.0, -- Success percentage
  usage_count INTEGER DEFAULT 0,
  projects_applied UUID[] DEFAULT '{}', -- Track which projects used this pattern
  effectiveness_score NUMERIC(3,2) DEFAULT 0.0, -- 0.0 to 1.0 based on outcomes
  last_applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Metadata for pattern evolution
  metadata JSONB DEFAULT '{
    "conditions": [],
    "prerequisites": [],
    "common_errors": [],
    "optimization_tips": []
  }'::jsonb
);

-- Cross-agent knowledge sharing (managed by Manager Agent)
CREATE TABLE agent_knowledge_sharing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  target_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  knowledge_type TEXT NOT NULL, -- 'pattern', 'solution', 'warning', 'recommendation'
  knowledge_data JSONB NOT NULL DEFAULT '{}',
  shared_by_manager BOOLEAN DEFAULT true, -- Manager Agent controls sharing
  relevance_score NUMERIC(3,2) DEFAULT 1.0,
  project_context UUID REFERENCES projects(id), -- Optional project context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE -- When target agent processed the knowledge
);

-- Memory optimization and compression log
CREATE TABLE agent_memory_optimization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  optimization_type TEXT NOT NULL, -- 'compression', 'cleanup', 'archival'
  memories_processed INTEGER DEFAULT 0,
  memories_compressed INTEGER DEFAULT 0,
  memories_archived INTEGER DEFAULT 0,
  space_saved_bytes BIGINT DEFAULT 0,
  optimization_summary JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE agent_memory_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_expertise_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memory_optimization ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_memory_contexts
CREATE POLICY "Project members can view agent memories" ON agent_memory_contexts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_users pu ON p.id = pu.project_id
      WHERE p.id = agent_memory_contexts.project_id 
      AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

CREATE POLICY "System can manage agent memories" ON agent_memory_contexts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = agent_memory_contexts.project_id 
      AND p.owner_id = auth.uid()
    )
  );

-- RLS Policies for agent_expertise_patterns
CREATE POLICY "Users can view agent expertise patterns" ON agent_expertise_patterns
  FOR SELECT USING (true); -- Expertise patterns can be viewed by all authenticated users

CREATE POLICY "System can manage expertise patterns" ON agent_expertise_patterns
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for agent_knowledge_sharing
CREATE POLICY "Project context knowledge sharing" ON agent_knowledge_sharing
  FOR ALL USING (
    project_context IS NULL OR 
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = agent_knowledge_sharing.project_context 
      AND p.owner_id = auth.uid()
    )
  );

-- RLS Policies for agent_memory_optimization
CREATE POLICY "Users can view memory optimization logs" ON agent_memory_optimization
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Indexes for performance
CREATE INDEX idx_agent_memory_contexts_agent_project ON agent_memory_contexts(agent_id, project_id);
CREATE INDEX idx_agent_memory_contexts_type_relevance ON agent_memory_contexts(memory_type, relevance_score DESC);
CREATE INDEX idx_agent_memory_contexts_last_accessed ON agent_memory_contexts(last_accessed_at DESC);
CREATE INDEX idx_agent_memory_contexts_tags ON agent_memory_contexts USING GIN(tags);

CREATE INDEX idx_agent_expertise_patterns_agent_category ON agent_expertise_patterns(agent_id, expertise_category);
CREATE INDEX idx_agent_expertise_patterns_effectiveness ON agent_expertise_patterns(effectiveness_score DESC);
CREATE INDEX idx_agent_expertise_patterns_usage ON agent_expertise_patterns(usage_count DESC);

CREATE INDEX idx_agent_knowledge_sharing_target ON agent_knowledge_sharing(target_agent_id, acknowledged_at);
CREATE INDEX idx_agent_knowledge_sharing_relevance ON agent_knowledge_sharing(relevance_score DESC);

-- Function to automatically update last_accessed_at when memory is retrieved
CREATE OR REPLACE FUNCTION update_memory_access_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update access time on memory context updates
CREATE TRIGGER trigger_update_memory_access_time
  BEFORE UPDATE ON agent_memory_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_access_time();

-- Function to automatically update expertise pattern metrics
CREATE OR REPLACE FUNCTION update_expertise_pattern_metrics()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.usage_count = NEW.usage_count + 1;
  NEW.last_applied_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add some initial agent memory contexts for existing agents (optional)
INSERT INTO agent_memory_contexts (agent_id, project_id, memory_type, context_key, context_data, tags)
SELECT 
  a.id as agent_id,
  p.id as project_id,
  'learning'::memory_type,
  'initialization',
  jsonb_build_object(
    'role', a.role,
    'capabilities', a.permissions,
    'specialization', a.description,
    'initialization_date', now()
  ),
  ARRAY['initialization', 'setup']
FROM agents a
CROSS JOIN projects p
WHERE EXISTS (
  SELECT 1 FROM projects pr WHERE pr.owner_id = auth.uid()
)
LIMIT 10; -- Limit to avoid too many entries
