
-- First, update the agent_role enum to include all 27 roles
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'project_manager';
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'hardware_engineer';
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'marketing_seo';
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'compliance_legal';
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'database_administrator';
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'site_reliability_engineer';
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'solutions_architect';
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'customer_support';
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'research_development';

-- Insert all 27 agents into the agents table
INSERT INTO public.agents (name, role, description, is_active, permissions) VALUES
('Manager Agent', 'manager', 'Oversees vision, strategy, and final approvals.', true, '{"read": true, "write": true, "approve": true, "manage_team": true}'),
('Assistant Agent', 'assistant', 'Supports manager, clarifies tasks, ensures smooth flow.', true, '{"read": true, "write": true, "support": true}'),
('Project Manager Agent', 'project_manager', 'Plans timelines, milestones, coordinates execution.', true, '{"read": true, "write": true, "coordinate": true, "timeline_management": true}'),
('Business Analyst Agent', 'business_analyst', 'Translates business needs into technical requirements.', true, '{"read": true, "write": true, "analyze": true, "requirements": true}'),
('UI Designer Agent', 'ui_designer', 'Designs visual interface and layouts.', true, '{"read": true, "write": true, "design": true, "ui": true}'),
('UX Designer Agent', 'ux_designer', 'Ensures usability, user flows, and accessibility.', true, '{"read": true, "write": true, "design": true, "ux": true, "accessibility": true}'),
('Front-End Engineer Agent', 'frontend_dev', 'Builds web interfaces and client-side code.', true, '{"read": true, "write": true, "develop": true, "frontend": true}'),
('Back-End Engineer Agent', 'backend_dev', 'Develops APIs, server logic, and databases.', true, '{"read": true, "write": true, "develop": true, "backend": true, "api": true}'),
('Full-Stack Engineer Agent', 'fullstack_dev', 'Bridges front-end and back-end systems.', true, '{"read": true, "write": true, "develop": true, "fullstack": true}'),
('iOS Developer Agent', 'mobile_dev_ios', 'Creates native iOS applications.', true, '{"read": true, "write": true, "develop": true, "ios": true, "mobile": true}'),
('Android Developer Agent', 'mobile_dev_android', 'Creates native Android applications.', true, '{"read": true, "write": true, "develop": true, "android": true, "mobile": true}'),
('Game Developer Agent', 'game_dev', 'Builds games, VR/AR, and interactive apps.', true, '{"read": true, "write": true, "develop": true, "games": true, "vr": true, "ar": true}'),
('QA/Testing Engineer Agent', 'qa_engineer', 'Tests, validates, and ensures quality.', true, '{"read": true, "write": true, "test": true, "validate": true, "quality": true}'),
('DevOps Engineer Agent', 'devops_engineer', 'Automates CI/CD, deployment, scaling.', true, '{"read": true, "write": true, "deploy": true, "cicd": true, "scaling": true}'),
('Security Engineer Agent', 'security_engineer', 'Protects systems with security and compliance.', true, '{"read": true, "write": true, "security": true, "compliance": true, "audit": true}'),
('Data Engineer Agent', 'data_engineer', 'Manages pipelines, storage, and ETL workflows.', true, '{"read": true, "write": true, "data": true, "etl": true, "pipelines": true}'),
('AI/ML Engineer Agent', 'ai_ml_engineer', 'Builds and deploys AI/ML models.', true, '{"read": true, "write": true, "ai": true, "ml": true, "models": true}'),
('Embedded/IoT Engineer Agent', 'embedded_iot', 'Develops firmware and IoT integrations.', true, '{"read": true, "write": true, "embedded": true, "iot": true, "firmware": true}'),
('Hardware Engineer Agent', 'hardware_engineer', 'Designs electronics and physical devices.', true, '{"read": true, "write": true, "hardware": true, "electronics": true, "devices": true}'),
('Marketing/SEO Agent', 'marketing_seo', 'Manages campaigns, branding, and growth.', true, '{"read": true, "write": true, "marketing": true, "seo": true, "branding": true, "growth": true}'),
('Compliance/Legal Agent', 'compliance_legal', 'Ensures legal, regulatory, and license compliance.', true, '{"read": true, "write": true, "legal": true, "compliance": true, "regulatory": true}'),
('Technical Writer Agent', 'technical_writer', 'Creates documentation and manuals.', true, '{"read": true, "write": true, "documentation": true, "technical_writing": true}'),
('Database Administrator Agent', 'database_administrator', 'Optimizes, secures, and scales databases.', true, '{"read": true, "write": true, "database": true, "optimization": true, "security": true}'),
('Site Reliability Engineer Agent', 'site_reliability_engineer', 'Handles monitoring, incidents, uptime.', true, '{"read": true, "write": true, "monitoring": true, "incidents": true, "reliability": true}'),
('Solutions Architect Agent', 'solutions_architect', 'Designs system architecture and integrations.', true, '{"read": true, "write": true, "architecture": true, "design": true, "integrations": true}'),
('Customer Support Agent', 'customer_support', 'Handles feedback, tickets, and user support.', true, '{"read": true, "write": true, "support": true, "feedback": true, "tickets": true}'),
('R&D Agent', 'research_development', 'Explores new technologies and innovations.', true, '{"read": true, "write": true, "research": true, "development": true, "innovation": true}');
