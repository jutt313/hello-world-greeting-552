
import type { Json } from '@/integrations/supabase/types';

export type MemoryType = 'conversation' | 'task' | 'code_change' | 'decision' | 'learning' | 'error' | 'success';

export type ExpertiseCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'testing' | 'security' | 'performance' | 'architecture';

export interface AgentMemoryContext {
  id: string;
  agent_id: string;
  project_id: string;
  memory_type: MemoryType;
  context_key: string;
  context_data: Json;
  relevance_score: number;
  last_accessed_at: string;
  created_at: string;
  expires_at?: string;
  tags: string[];
  related_message_id?: string;
}

export interface AgentExpertisePattern {
  id: string;
  agent_id: string;
  expertise_category: ExpertiseCategory;
  pattern_name: string;
  pattern_description?: string;
  pattern_data: Json;
  success_rate: number;
  usage_count: number;
  projects_applied: string[];
  effectiveness_score: number;
  last_applied_at?: string;
  created_at: string;
  updated_at: string;
  metadata: Json;
}

export interface AgentKnowledgeSharing {
  id: string;
  source_agent_id: string;
  target_agent_id: string;
  knowledge_type: string;
  knowledge_data: Json;
  shared_by_manager: boolean;
  relevance_score: number;
  project_context?: string;
  created_at: string;
  acknowledged_at?: string;
}

export interface AgentMemoryOptimization {
  id: string;
  agent_id: string;
  optimization_type: string;
  memories_processed: number;
  memories_compressed: number;
  memories_archived: number;
  space_saved_bytes: number;
  optimization_summary: Json;
  created_at: string;
}
