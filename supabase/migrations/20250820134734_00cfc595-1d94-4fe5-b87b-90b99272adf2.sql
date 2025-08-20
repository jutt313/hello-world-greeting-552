
-- Insert the Manager Agent with supreme authority
INSERT INTO public.agents (
  id,
  name,
  role,
  description,
  permissions,
  is_active
) VALUES (
  'manager_supreme',
  'Manager Agent',
  'manager',
  'Supreme orchestrator and decision-making authority of the Code-XI platform. Master of 7 specialized development agents with exclusive user communication rights.',
  '{
    "read": true,
    "write": true,
    "delete": true,
    "manage_agents": true,
    "user_communication": true,
    "project_control": true,
    "final_authority": true,
    "technology_decisions": true,
    "resource_allocation": true,
    "quality_control": true
  }'::jsonb,
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active;

-- Insert the 7 specialized agents that the Manager will orchestrate
INSERT INTO public.agents (id, name, role, description, permissions, is_active) VALUES
('fullstack_engineer', 'Full-Stack Engineer', 'developer', 'Frontend and backend development, database systems, API development, mobile development, authentication, testing, and performance optimization.', '{"read": true, "write": true, "implementation": true}'::jsonb, true),
('devops_engineer', 'DevOps Engineer', 'devops', 'Cloud platforms, containerization, CI/CD pipelines, infrastructure as code, monitoring, security, scalability, and environment management.', '{"read": true, "write": true, "infrastructure": true}'::jsonb, true),
('security_engineer', 'Security Engineer', 'security', 'Security auditing, authentication systems, encryption, compliance, threat modeling, security monitoring, secure coding, and API security.', '{"read": true, "write": true, "security_audit": true}'::jsonb, true),
('qa_engineer', 'QA Engineer', 'qa', 'Test strategy, automated testing, quality gates, bug tracking, user acceptance testing, cross-platform testing, load testing, and accessibility testing.', '{"read": true, "write": true, "quality_assurance": true}'::jsonb, true),
('solutions_architect', 'Solutions Architect', 'architect', 'System architecture, technology selection, scalability planning, integration design, data architecture, performance architecture, and documentation.', '{"read": true, "write": true, "architecture_design": true}'::jsonb, true),
('documentation_specialist', 'Documentation Specialist', 'documentation', 'Technical documentation, user documentation, process documentation, API documentation, code comments, knowledge base, and content strategy.', '{"read": true, "write": true, "documentation": true}'::jsonb, true),
('performance_engineer', 'Performance Engineer', 'performance', 'Performance optimization, load testing, monitoring setup, database optimization, frontend/backend performance, system tuning, and capacity planning.', '{"read": true, "write": true, "performance_optimization": true}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active;

-- Create function to assign Manager Agent to projects automatically
CREATE OR REPLACE FUNCTION assign_manager_agent_to_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Automatically assign Manager Agent to every new project
  INSERT INTO public.project_agents (project_id, agent_id, is_assigned, tasks_completed)
  VALUES (NEW.id, 'manager_supreme', true, 0)
  ON CONFLICT (project_id, agent_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign Manager Agent
DROP TRIGGER IF EXISTS auto_assign_manager_agent ON public.projects;
CREATE TRIGGER auto_assign_manager_agent
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION assign_manager_agent_to_project();

-- Create agent task assignments table for Manager to track delegated work
CREATE TABLE IF NOT EXISTS public.agent_task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  assigned_by_agent_id UUID NOT NULL DEFAULT 'manager_supreme',
  assigned_to_agent_id UUID NOT NULL,
  task_type TEXT NOT NULL,
  task_id TEXT NOT NULL,
  task_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'assigned',
  timeline TEXT,
  quality_standards TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Enable RLS on agent task assignments
ALTER TABLE public.agent_task_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent task assignments
CREATE POLICY "Project members can view task assignments" ON public.agent_task_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_users pu ON p.id = pu.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

CREATE POLICY "Manager can create task assignments" ON public.agent_task_assignments
  FOR INSERT WITH CHECK (
    assigned_by_agent_id = 'manager_supreme' AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Manager can update task assignments" ON public.agent_task_assignments
  FOR UPDATE USING (
    assigned_by_agent_id = 'manager_supreme' AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );
