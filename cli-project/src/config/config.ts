
export const CONFIG = {
  VERSION: '1.0.0',
  API_BASE_URL: process.env.CODEXI_API_URL || 'https://your-supabase-project-url.supabase.co',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://https://akoclehzeocqlgmmbkza.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk',
  CLI_REDIRECT_URL: 'http://localhost:3000/auth/callback',
  CLI_AUTH_PORT: 3000,
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
