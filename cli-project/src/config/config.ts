
export const CONFIG = {
  VERSION: '1.0.0',
  API_BASE_URL: process.env.CODEXI_API_URL || 'https://your-supabase-project-url.supabase.co',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://your-supabase-project-url.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key',
  AUTH_TOKEN_FILE: '.codexi-auth',
  PROJECT_CONFIG_FILE: '.codexi-config.json',
  AGENTS: [
    'manager',
    'solutions-architect', 
    'fullstack-engineer',
    'devops-engineer',
    'security-engineer',
    'performance-engineer',
    'qa-engineer',
    'documentation-specialist'
  ] as const,
  DEFAULT_LLM_PROVIDER: 'openai',
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 30000
};

export type AgentRole = typeof CONFIG.AGENTS[number];
