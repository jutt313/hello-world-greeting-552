
-- ============================================================================
-- CODE-XI DATABASE SCHEMA IMPLEMENTATION
-- Phase 1: Foundation Tables (Core User & System Setup)
-- ============================================================================

-- Create custom types/enums first
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE public.llm_provider_name AS ENUM ('openai', 'anthropic', 'google', 'cohere');
CREATE TYPE public.project_type AS ENUM ('web', 'mobile', 'game', 'embedded', 'ai_ml', 'data');
CREATE TYPE public.project_status AS ENUM ('active', 'paused', 'completed', 'archived');
CREATE TYPE public.agent_role AS ENUM (
  'manager', 'assistant', 'product_manager', 'business_analyst',
  'ui_designer', 'ux_designer', 'frontend_dev', 'backend_dev', 'fullstack_dev',
  'mobile_dev_ios', 'mobile_dev_android', 'game_dev', 'embedded_iot',
  'qa_engineer', 'devops_engineer', 'security_engineer', 'ai_ml_engineer',
  'data_engineer', 'cloud_engineer', 'technical_writer', 'tech_lead'
);
CREATE TYPE public.user_project_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE public.sender_type AS ENUM ('user', 'manager', 'assistant', 'agent');
CREATE TYPE public.message_type AS ENUM ('text', 'file_operation', 'code_change', 'system');
CREATE TYPE public.operation_type AS ENUM ('read', 'write', 'create', 'delete', 'analyze');
CREATE TYPE public.alert_type AS ENUM ('daily_threshold', 'project_threshold', 'monthly_threshold');
CREATE TYPE public.sync_status AS ENUM ('synced', 'pending', 'error');
CREATE TYPE public.session_type AS ENUM ('temporary', 'long_lived');
CREATE TYPE public.activity_type AS ENUM ('login', 'logout', 'assigned_task', 'merged_code', 'comment', 'system_event');
CREATE TYPE public.version_event_type AS ENUM ('commit', 'merge', 'pull_request', 'conflict', 'revert');
CREATE TYPE public.notification_type AS ENUM ('agent_action', 'project_update', 'session_complete', 'cost_alert');

-- ============================================================================
-- PHASE 1: FOUNDATION TABLES
-- ============================================================================

-- 1.1 Core User System
-- users_profiles - Extended user information
CREATE TABLE public.users_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  total_projects INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0
);

-- llm_providers - LLM API configurations
CREATE TABLE public.llm_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
  provider_name llm_provider_name NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  rate_limit_per_minute INTEGER DEFAULT 60,
  cost_per_1k_tokens DECIMAL(10,6) DEFAULT 0.002,
  UNIQUE(user_id, provider_name)
);

-- cli_tokens - Authentication for CLI access
CREATE TABLE public.cli_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_type session_type NOT NULL DEFAULT 'temporary'
);

-- 1.2 Agent Framework
-- agents - Master agent definitions (will be populated later, not hardcoded)
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role agent_role NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{"read": true, "write": true}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- PHASE 2: PROJECT CORE TABLES
-- ============================================================================

-- 2.1 Project Management
-- projects - Main project entities
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type project_type NOT NULL,
  description TEXT,
  repository_url TEXT,
  local_path TEXT,
  status project_status NOT NULL DEFAULT 'active',
  selected_llm_provider_id UUID REFERENCES public.llm_providers(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_tokens_used BIGINT NOT NULL DEFAULT 0,
  total_api_calls INTEGER NOT NULL DEFAULT 0
);

-- project_users - Multi-user collaboration
CREATE TABLE public.project_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
  role user_project_role NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- project_agents - Agent assignments per project
CREATE TABLE public.project_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  is_assigned BOOLEAN NOT NULL DEFAULT true,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, agent_id)
);

-- project_dependencies - Project relationships
CREATE TABLE public.project_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  depends_on_project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, depends_on_project_id),
  CHECK (project_id != depends_on_project_id)
);

-- 2.2 Version Control
-- repository_sync - Git synchronization status
CREATE TABLE public.repository_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL DEFAULT 'main',
  last_commit_hash TEXT,
  sync_status sync_status NOT NULL DEFAULT 'pending',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT,
  UNIQUE(project_id, branch_name)
);

-- version_control_events - Full Git history tracking
CREATE TABLE public.version_control_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL,
  event_type version_event_type NOT NULL,
  commit_hash TEXT,
  author_user_id UUID REFERENCES public.users_profiles(id),
  author_agent_id UUID REFERENCES public.agents(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- PHASE 3: COMMUNICATION SYSTEM TABLES
-- ============================================================================

-- 3.1 Chat Infrastructure
-- chat_sessions - Conversation contexts
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
  title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_messages INTEGER NOT NULL DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- chat_messages - All user-agent communications
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_type sender_type NOT NULL,
  sender_agent_id UUID REFERENCES public.agents(id),
  content TEXT NOT NULL,
  message_type message_type NOT NULL DEFAULT 'text',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10,4) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- 3.2 File Operations
-- file_operations - Agent read/write activities
CREATE TABLE public.file_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  operation_type operation_type NOT NULL,
  file_path TEXT NOT NULL,
  file_content_before TEXT,
  file_content_after TEXT,
  user_approved BOOLEAN NOT NULL DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10,4) NOT NULL DEFAULT 0.00
);

-- ============================================================================
-- PHASE 4: ANALYTICS & MONITORING TABLES
-- ============================================================================

-- 4.1 Usage Analytics
-- project_analytics - Daily usage metrics
CREATE TABLE public.project_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  api_calls_count INTEGER NOT NULL DEFAULT 0,
  tokens_used BIGINT NOT NULL DEFAULT 0,
  daily_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  files_modified INTEGER NOT NULL DEFAULT 0,
  agent_operations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, date)
);

-- agent_activity_logs - Detailed agent actions
CREATE TABLE public.agent_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4.2 Cost Management
-- cost_alerts - Spending thresholds
CREATE TABLE public.cost_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  threshold_amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- PHASE 5: USER EXPERIENCE ENHANCEMENTS
-- ============================================================================

-- 5.1 Notifications
-- notifications - User alerts system
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cli_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.version_control_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can manage their own profiles
CREATE POLICY "Users can manage their own profile" ON public.users_profiles
  FOR ALL USING (auth.uid() = id);

-- Users can manage their own LLM providers
CREATE POLICY "Users can manage their own LLM providers" ON public.llm_providers
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own CLI tokens
CREATE POLICY "Users can manage their own CLI tokens" ON public.cli_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Agents are visible to all authenticated users (read-only for most)
CREATE POLICY "Authenticated users can view agents" ON public.agents
  FOR SELECT TO authenticated USING (true);

-- Projects: users can see projects they own or are members of
CREATE POLICY "Users can manage projects they own" ON public.projects
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can view projects they are members of" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_users 
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

-- Project users: users can see memberships for projects they're involved in
CREATE POLICY "Project members can view project users" ON public.project_users
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Project owners can manage project memberships
CREATE POLICY "Project owners can manage memberships" ON public.project_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Project agents: members can view, owners can manage
CREATE POLICY "Project members can view project agents" ON public.project_agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_users pu ON p.id = pu.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

CREATE POLICY "Project owners can manage project agents" ON public.project_agents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Apply similar patterns for all other project-related tables
CREATE POLICY "Project members can view dependencies" ON public.project_dependencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_users pu ON p.id = pu.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

CREATE POLICY "Project owners can manage dependencies" ON public.project_dependencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Repository sync policies
CREATE POLICY "Project members can view repository sync" ON public.repository_sync
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_users pu ON p.id = pu.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

CREATE POLICY "Project owners can manage repository sync" ON public.repository_sync
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Version control events policies
CREATE POLICY "Project members can view version control events" ON public.version_control_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_users pu ON p.id = pu.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create version control events for their projects" ON public.version_control_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_users pu ON p.id = pu.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

-- Chat sessions policies
CREATE POLICY "Users can manage their own chat sessions" ON public.chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view messages from their sessions" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- File operations policies
CREATE POLICY "Project members can view file operations" ON public.file_operations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_users pu ON p.id = pu.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

CREATE POLICY "System can create file operations for user projects" ON public.file_operations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_users pu ON p.id = pu.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

-- Project analytics policies
CREATE POLICY "Project members can view analytics" ON public.project_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_users pu ON p.id = pu.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

-- Agent activity logs policies
CREATE POLICY "Project members can view agent activity logs" ON public.agent_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_users pu ON p.id = pu.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
    )
  );

-- Cost alerts policies
CREATE POLICY "Users can manage their own cost alerts" ON public.cost_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC PROFILE CREATION
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users_profiles (id, username, full_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  RETURN new;
END;
$$;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User-related indexes
CREATE INDEX idx_users_profiles_username ON public.users_profiles(username);
CREATE INDEX idx_llm_providers_user_id ON public.llm_providers(user_id);
CREATE INDEX idx_cli_tokens_user_id ON public.cli_tokens(user_id);
CREATE INDEX idx_cli_tokens_token_hash ON public.cli_tokens(token_hash);

-- Project-related indexes
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_project_users_project_id ON public.project_users(project_id);
CREATE INDEX idx_project_users_user_id ON public.project_users(user_id);
CREATE INDEX idx_project_agents_project_id ON public.project_agents(project_id);

-- Communication indexes
CREATE INDEX idx_chat_sessions_project_id ON public.chat_sessions(project_id);
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- File operations indexes
CREATE INDEX idx_file_operations_project_id ON public.file_operations(project_id);
CREATE INDEX idx_file_operations_agent_id ON public.file_operations(agent_id);
CREATE INDEX idx_file_operations_created_at ON public.file_operations(created_at);

-- Analytics indexes
CREATE INDEX idx_project_analytics_project_date ON public.project_analytics(project_id, date);
CREATE INDEX idx_agent_activity_logs_project_id ON public.agent_activity_logs(project_id);
CREATE INDEX idx_agent_activity_logs_created_at ON public.agent_activity_logs(created_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_cost_alerts_user_id ON public.cost_alerts(user_id);
