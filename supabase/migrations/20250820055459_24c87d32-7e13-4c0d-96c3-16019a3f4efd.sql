
-- First, let's see what agent roles currently exist and update the enum
-- We need to drop the existing enum and recreate it with the 8 core roles
DROP TYPE IF EXISTS agent_role CASCADE;

-- Create the new agent_role enum with the 8 core agents
CREATE TYPE agent_role AS ENUM (
  'project_manager',
  'full_stack_engineer', 
  'devops_infrastructure',
  'security_engineer',
  'qa_engineer',
  'solutions_architect',
  'documentation_specialist',
  'performance_engineer'
);

-- Clear existing agents and insert the 8 core agents
DELETE FROM agents;
DELETE FROM project_agents;

-- Insert the 8 core agents
INSERT INTO agents (name, role, description, is_active, permissions) VALUES 
(
  'Project Manager', 
  'project_manager',
  'Plans, coordinates, makes decisions, and manages overall project workflow. Acts as the central coordinator for all agent activities.',
  true,
  '{"read": true, "write": true, "coordinate": true, "manage_tasks": true}'
),
(
  'Full-Stack Engineer',
  'full_stack_engineer', 
  'Handles frontend, backend, APIs, and databases. Responsible for all code generation and application development.',
  true,
  '{"read": true, "write": true, "code_generation": true, "api_development": true}'
),
(
  'DevOps/Infrastructure Engineer',
  'devops_infrastructure',
  'Manages CI/CD pipelines, deployment processes, and environment setup. Ensures smooth deployment and infrastructure management.',
  true,
  '{"read": true, "write": true, "deploy": true, "infrastructure": true}'
),
(
  'Security Engineer', 
  'security_engineer',
  'Performs threat modeling, vulnerability scanning, and ensures compliance. Maintains security standards throughout the project.',
  true,
  '{"read": true, "write": true, "security_scan": true, "compliance_check": true}'
),
(
  'QA Engineer',
  'qa_engineer', 
  'Develops testing strategies, creates automated tests, and implements quality gates. Ensures application quality and reliability.',
  true,
  '{"read": true, "write": true, "test_creation": true, "quality_assurance": true}'
),
(
  'Solutions Architect',
  'solutions_architect',
  'Designs system architecture, makes tech stack decisions, and ensures scalability. Provides technical leadership and architectural guidance.',
  true,
  '{"read": true, "write": true, "system_design": true, "architecture": true}'
),
(
  'Documentation Specialist',
  'documentation_specialist',
  'Creates code documentation, API specifications, and user guides. Ensures comprehensive project documentation.',
  true,
  '{"read": true, "write": true, "documentation": true, "api_specs": true}'
),
(
  'Performance Engineer',
  'performance_engineer',
  'Handles optimization, monitoring, and troubleshooting. Ensures optimal application performance and system reliability.',
  true,
  '{"read": true, "write": true, "optimization": true, "monitoring": true}'
);

-- Also need to update the activity_type enum to match agent activities
DROP TYPE IF EXISTS activity_type CASCADE;
CREATE TYPE activity_type AS ENUM (
  'project_planning',
  'code_generation', 
  'deployment',
  'security_scan',
  'testing',
  'architecture_design',
  'documentation',
  'performance_optimization',
  'task_assignment',
  'quality_review'
);

-- Recreate any tables that depend on these enums
ALTER TABLE agent_activity_logs ALTER COLUMN activity_type TYPE activity_type USING activity_type::text::activity_type;
