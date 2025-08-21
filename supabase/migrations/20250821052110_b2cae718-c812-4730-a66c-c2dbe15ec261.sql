
-- First, create the missing tables that should have been created by the migration

-- Create project_templates table
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- 'web', 'ios', 'android', 'cli', 'api', 'desktop'
  programming_language TEXT NOT NULL,
  framework TEXT,
  template_structure JSONB NOT NULL DEFAULT '{}',
  default_files JSONB NOT NULL DEFAULT '{}',
  dependencies JSONB NOT NULL DEFAULT '{}',
  build_commands JSONB NOT NULL DEFAULT '{}',
  deployment_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_coordination table
CREATE TABLE IF NOT EXISTS public.agent_coordination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  initiator_agent_id UUID NOT NULL,
  target_agent_id UUID NOT NULL,
  coordination_type TEXT NOT NULL, -- 'delegate', 'request', 'update', 'complete', 'handoff'
  message TEXT NOT NULL,
  task_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_file_operations table
CREATE TABLE IF NOT EXISTS public.agent_file_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  project_id UUID NOT NULL,
  operation_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'read'
  file_path TEXT NOT NULL,
  file_content_before TEXT,
  file_content_after TEXT,
  operation_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  error_message TEXT,
  programming_language TEXT,
  framework TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create agent_capabilities table
CREATE TABLE IF NOT EXISTS public.agent_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  capability_name TEXT NOT NULL,
  capability_type TEXT NOT NULL, -- 'file_operation', 'database_analysis', 'deployment', 'testing', 'security_scan'
  capability_config JSONB NOT NULL DEFAULT '{}',
  supported_languages JSONB NOT NULL DEFAULT '[]',
  supported_frameworks JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the 8 agents into the agents table
INSERT INTO public.agents (id, name, role, description, permissions, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Manager Agent', 'manager', 'Supreme orchestrator and decision-making authority. Coordinates all agents and communicates with users.', '{"read": true, "write": true, "coordinate": true, "approve": true}', true),
('22222222-2222-2222-2222-222222222222', 'Full-Stack Engineer', 'fullstack_engineer', 'Develops complete applications with frontend, backend, and database integration.', '{"read": true, "write": true, "deploy": true}', true),
('33333333-3333-3333-3333-333333333333', 'DevOps Engineer', 'devops_engineer', 'Manages infrastructure, CI/CD pipelines, containerization, and cloud deployment.', '{"read": true, "write": true, "deploy": true, "infrastructure": true}', true),
('44444444-4444-4444-4444-444444444444', 'Security Engineer', 'security_engineer', 'Performs security audits, vulnerability assessments, and implements security measures.', '{"read": true, "scan": true, "audit": true, "patch": true}', true),
('55555555-5555-5555-5555-555555555555', 'QA Engineer', 'qa_engineer', 'Creates and executes comprehensive testing strategies, automation, and quality assurance.', '{"read": true, "write": true, "test": true, "report": true}', true),
('66666666-6666-6666-6666-666666666666', 'Solutions Architect', 'solutions_architect', 'Designs system architecture, technology stack, and integration patterns.', '{"read": true, "design": true, "analyze": true, "recommend": true}', true),
('77777777-7777-7777-7777-777777777777', 'Documentation Specialist', 'documentation_specialist', 'Creates comprehensive technical documentation, API references, and user guides.', '{"read": true, "write": true, "document": true}', true),
('88888888-8888-8888-8888-888888888888', 'Performance Engineer', 'performance_engineer', 'Optimizes application performance, conducts load testing, and monitors system metrics.', '{"read": true, "analyze": true, "optimize": true, "monitor": true}', true)
ON CONFLICT (id) DO NOTHING;

-- Insert project templates for different platforms and languages
INSERT INTO public.project_templates (name, description, template_type, programming_language, framework, template_structure, default_files, dependencies, build_commands) VALUES
-- Web Applications
('React TypeScript Web App', 'Modern React application with TypeScript, Vite, and Tailwind CSS', 'web', 'TypeScript', 'React', 
'{"src": {"components": {}, "pages": {}, "hooks": {}, "utils": {}}, "public": {}, "tests": {}}',
'{"package.json": "{\n  \"name\": \"react-app\",\n  \"version\": \"1.0.0\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\"\n  },\n  \"devDependencies\": {\n    \"@types/react\": \"^18.2.0\",\n    \"@types/react-dom\": \"^18.2.0\",\n    \"typescript\": \"^5.0.0\",\n    \"vite\": \"^4.4.0\"\n  }\n}"}',
'["react", "react-dom", "@types/react", "@types/react-dom", "typescript", "vite"]',
'{"dev": "vite", "build": "vite build", "preview": "vite preview"}'),

('Vue TypeScript Web App', 'Vue 3 application with TypeScript and Vite', 'web', 'TypeScript', 'Vue',
'{"src": {"components": {}, "views": {}, "composables": {}, "utils": {}}, "public": {}}',
'{"package.json": "{\n  \"name\": \"vue-app\",\n  \"version\": \"1.0.0\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\"\n  },\n  \"dependencies\": {\n    \"vue\": \"^3.3.0\"\n  },\n  \"devDependencies\": {\n    \"@vitejs/plugin-vue\": \"^4.0.0\",\n    \"typescript\": \"^5.0.0\",\n    \"vite\": \"^4.4.0\"\n  }\n}"}',
'["vue", "@vitejs/plugin-vue", "typescript", "vite"]',
'{"dev": "vite", "build": "vite build"}'),

('Angular TypeScript Web App', 'Angular application with TypeScript and Angular CLI', 'web', 'TypeScript', 'Angular',
'{"src": {"app": {"components": {}, "services": {}, "modules": {}}, "assets": {}}}',
'{"package.json": "{\n  \"name\": \"angular-app\",\n  \"version\": \"1.0.0\",\n  \"scripts\": {\n    \"start\": \"ng serve\",\n    \"build\": \"ng build\"\n  },\n  \"dependencies\": {\n    \"@angular/core\": \"^16.0.0\",\n    \"@angular/common\": \"^16.0.0\"\n  },\n  \"devDependencies\": {\n    \"@angular/cli\": \"^16.0.0\",\n    \"typescript\": \"^5.0.0\"\n  }\n}"}',
'["@angular/core", "@angular/common", "@angular/cli", "typescript"]',
'{"start": "ng serve", "build": "ng build"}'),

-- iOS Applications
('Swift iOS App', 'Native iOS application using Swift and UIKit', 'ios', 'Swift', 'UIKit',
'{"Sources": {"App": {}, "Views": {}, "Models": {}, "Services": {}}, "Resources": {}, "Tests": {}}',
'{"Package.swift": "// swift-tools-version: 5.9\nimport PackageDescription\n\nlet package = Package(\n    name: \"iOSApp\",\n    platforms: [.iOS(.v15)],\n    products: [\n        .library(name: \"iOSApp\", targets: [\"iOSApp\"])\n    ],\n    targets: [\n        .target(name: \"iOSApp\")\n    ]\n)"}',
'[]',
'{"build": "swift build", "test": "swift test"}'),

('SwiftUI iOS App', 'Modern iOS application using SwiftUI', 'ios', 'Swift', 'SwiftUI',
'{"Sources": {"App": {}, "Views": {}, "Models": {}, "ViewModels": {}}, "Resources": {}}',
'{"Package.swift": "// swift-tools-version: 5.9\nimport PackageDescription\n\nlet package = Package(\n    name: \"SwiftUIApp\",\n    platforms: [.iOS(.v16)],\n    products: [\n        .library(name: \"SwiftUIApp\", targets: [\"SwiftUIApp\"])\n    ],\n    targets: [\n        .target(name: \"SwiftUIApp\")\n    ]\n)"}',
'[]',
'{"build": "swift build", "test": "swift test"}'),

('React Native iOS App', 'Cross-platform iOS app using React Native', 'ios', 'TypeScript', 'React Native',
'{"src": {"components": {}, "screens": {}, "navigation": {}, "services": {}}, "ios": {}, "android": {}}',
'{"package.json": "{\n  \"name\": \"ReactNativeApp\",\n  \"version\": \"1.0.0\",\n  \"scripts\": {\n    \"ios\": \"react-native run-ios\",\n    \"start\": \"react-native start\"\n  },\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-native\": \"^0.72.0\"\n  }\n}"}',
'["react", "react-native"]',
'{"ios": "react-native run-ios", "start": "react-native start"}'),

-- Android Applications
('Kotlin Android App', 'Native Android application using Kotlin', 'android', 'Kotlin', 'Android SDK',
'{"app": {"src": {"main": {"java": {}, "res": {"layout": {}, "values": {}}}}}, "gradle": {}}',
'{"build.gradle": "plugins {\n    id ''com.android.application''\n    id ''org.jetbrains.kotlin.android''\n}\n\nandroid {\n    compileSdk 34\n    \n    defaultConfig {\n        minSdk 24\n        targetSdk 34\n    }\n}\n\ndependencies {\n    implementation ''androidx.core:core-ktx:1.9.0''\n    implementation ''androidx.appcompat:appcompat:1.6.1''\n}"}',
'["androidx.core:core-ktx", "androidx.appcompat:appcompat"]',
'{"build": "./gradlew build", "run": "./gradlew installDebug"}'),

('Java Android App', 'Native Android application using Java', 'android', 'Java', 'Android SDK',
'{"app": {"src": {"main": {"java": {}, "res": {"layout": {}, "values": {}}}}}, "gradle": {}}',
'{"build.gradle": "plugins {\n    id ''com.android.application''\n}\n\nandroid {\n    compileSdk 34\n    \n    defaultConfig {\n        minSdk 24\n        targetSdk 34\n    }\n}\n\ndependencies {\n    implementation ''androidx.appcompat:appcompat:1.6.1''\n    implementation ''com.google.android.material:material:1.9.0''\n}"}',
'["androidx.appcompat:appcompat", "com.google.android.material:material"]',
'{"build": "./gradlew build", "run": "./gradlew installDebug"}'),

('React Native Android App', 'Cross-platform Android app using React Native', 'android', 'TypeScript', 'React Native',
'{"src": {"components": {}, "screens": {}, "navigation": {}, "services": {}}, "ios": {}, "android": {}}',
'{"package.json": "{\n  \"name\": \"ReactNativeApp\",\n  \"version\": \"1.0.0\",\n  \"scripts\": {\n    \"android\": \"react-native run-android\",\n    \"start\": \"react-native start\"\n  },\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-native\": \"^0.72.0\"\n  }\n}"}',
'["react", "react-native"]',
'{"android": "react-native run-android", "start": "react-native start"}'),

-- CLI Applications
('Node.js CLI App', 'Command-line application using Node.js and TypeScript', 'cli', 'TypeScript', 'Node.js',
'{"src": {"commands": {}, "utils": {}, "types": {}}, "bin": {}, "tests": {}}',
'{"package.json": "{\n  \"name\": \"cli-app\",\n  \"version\": \"1.0.0\",\n  \"bin\": {\n    \"myapp\": \"./bin/index.js\"\n  },\n  \"scripts\": {\n    \"build\": \"tsc\",\n    \"start\": \"node dist/index.js\"\n  },\n  \"dependencies\": {\n    \"commander\": \"^11.0.0\",\n    \"chalk\": \"^5.3.0\"\n  },\n  \"devDependencies\": {\n    \"typescript\": \"^5.0.0\",\n    \"@types/node\": \"^20.0.0\"\n  }\n}"}',
'["commander", "chalk", "typescript", "@types/node"]',
'{"build": "tsc", "start": "node dist/index.js"}'),

('Python CLI App', 'Command-line application using Python and Click', 'cli', 'Python', 'Click',
'{"src": {"commands": {}, "utils": {}}, "tests": {}}',
'{"pyproject.toml": "[build-system]\nrequires = [\"setuptools>=61.0\"]\nbuild-backend = \"setuptools.build_meta\"\n\n[project]\nname = \"cli-app\"\nversion = \"1.0.0\"\ndependencies = [\n    \"click>=8.0.0\",\n    \"rich>=13.0.0\"\n]\n\n[project.scripts]\nmyapp = \"src.main:cli\""}',
'["click", "rich"]',
'{"install": "pip install -e .", "run": "python -m src.main"}'),

('Go CLI App', 'Command-line application using Go and Cobra', 'cli', 'Go', 'Cobra',
'{"cmd": {}, "internal": {}, "pkg": {}}',
'{"go.mod": "module cli-app\n\ngo 1.21\n\nrequire (\n    github.com/spf13/cobra v1.7.0\n    github.com/spf13/viper v1.16.0\n)"}',
'["github.com/spf13/cobra", "github.com/spf13/viper"]',
'{"build": "go build -o bin/myapp", "run": "go run main.go"}')

ON CONFLICT (name) DO NOTHING;

-- Insert agent capabilities
INSERT INTO public.agent_capabilities (agent_id, capability_name, capability_type, capability_config, supported_languages, supported_frameworks) VALUES
-- Manager Agent capabilities
('11111111-1111-1111-1111-111111111111', 'Project Planning', 'coordination', '{"max_concurrent_tasks": 10, "workflow_types": ["web_development", "mobile_development", "api_development"]}', '["TypeScript", "JavaScript", "Python", "Java", "Swift", "Kotlin", "Go", "Rust"]', '["React", "Vue", "Angular", "React Native", "Node.js", "Express", "FastAPI", "Spring Boot"]'),
('11111111-1111-1111-1111-111111111111', 'Agent Coordination', 'coordination', '{"delegation_rules": ["complexity_based", "expertise_match"], "approval_required": true}', '[]', '[]'),

-- Full-Stack Engineer capabilities
('22222222-2222-2222-2222-222222222222', 'Frontend Development', 'file_operation', '{"supported_patterns": ["MVC", "MVVM", "Component-based"], "ui_libraries": ["Tailwind", "Material-UI", "Bootstrap"]}', '["TypeScript", "JavaScript"]', '["React", "Vue", "Angular", "Svelte"]'),
('22222222-2222-2222-2222-222222222222', 'Backend Development', 'file_operation', '{"api_types": ["REST", "GraphQL", "gRPC"], "database_support": ["PostgreSQL", "MongoDB", "Redis"]}', '["TypeScript", "JavaScript", "Python", "Java", "Go"]', '["Node.js", "Express", "Fastify", "FastAPI", "Spring Boot"]'),
('22222222-2222-2222-2222-222222222222', 'Database Integration', 'database_analysis', '{"orm_support": ["Prisma", "TypeORM", "Sequelize", "SQLAlchemy"], "migration_tools": ["Alembic", "Flyway"]}', '["SQL", "TypeScript", "Python", "Java"]', '["Prisma", "TypeORM", "SQLAlchemy"]'),

-- DevOps Engineer capabilities
('33333333-3333-3333-3333-333333333333', 'Containerization', 'deployment', '{"platforms": ["Docker", "Podman"], "orchestration": ["Kubernetes", "Docker Compose"]}', '["Dockerfile", "YAML"]', '["Docker", "Kubernetes"]'),
('33333333-3333-3333-3333-333333333333', 'CI/CD Pipeline', 'deployment', '{"platforms": ["GitHub Actions", "GitLab CI", "Jenkins"], "deployment_targets": ["AWS", "GCP", "Azure", "Vercel"]}', '["YAML", "Bash", "PowerShell"]', '["GitHub Actions", "GitLab CI"]'),
('33333333-3333-3333-3333-333333333333', 'Infrastructure as Code', 'deployment', '{"tools": ["Terraform", "CloudFormation", "Pulumi"], "providers": ["AWS", "GCP", "Azure"]}', '["HCL", "JSON", "YAML"]', '["Terraform", "CloudFormation"]'),

-- Security Engineer capabilities
('44444444-4444-4444-4444-444444444444', 'Vulnerability Scanning', 'security_scan', '{"tools": ["Snyk", "OWASP ZAP", "SonarQube"], "scan_types": ["SAST", "DAST", "dependency"]}', '["TypeScript", "JavaScript", "Python", "Java", "Go"]', '["React", "Node.js", "Spring Boot"]'),
('44444444-4444-4444-4444-444444444444', 'Security Audit', 'security_scan', '{"compliance": ["OWASP Top 10", "CIS", "NIST"], "authentication": ["OAuth2", "JWT", "SAML"]}', '["TypeScript", "Python", "Java"]', '["Express", "FastAPI", "Spring Security"]'),

-- QA Engineer capabilities
('55555555-5555-5555-5555-555555555555', 'Unit Testing', 'testing', '{"frameworks": ["Jest", "Vitest", "pytest", "JUnit"], "coverage_threshold": 80}', '["TypeScript", "JavaScript", "Python", "Java"]', '["Jest", "Vitest", "pytest", "JUnit"]'),
('55555555-5555-5555-5555-555555555555', 'E2E Testing', 'testing', '{"tools": ["Playwright", "Cypress", "Selenium"], "browsers": ["Chrome", "Firefox", "Safari"]}', '["TypeScript", "JavaScript", "Python"]', '["Playwright", "Cypress"]'),
('55555555-5555-5555-5555-555555555555', 'Performance Testing', 'testing', '{"tools": ["k6", "Artillery", "JMeter"], "metrics": ["response_time", "throughput", "error_rate"]}', '["JavaScript", "YAML"]', '["k6", "Artillery"]'),

-- Solutions Architect capabilities
('66666666-6666-6666-6666-666666666666', 'System Design', 'design', '{"patterns": ["Microservices", "Monolith", "Serverless"], "diagrams": ["C4", "UML", "ERD"]}', '[]', '[]'),
('66666666-6666-6666-6666-666666666666', 'Technology Selection', 'analyze', '{"evaluation_criteria": ["performance", "scalability", "maintainability", "cost"], "recommendation_engine": true}', '["TypeScript", "Python", "Java", "Go", "Rust"]', '["React", "Node.js", "Spring Boot", "FastAPI"]'),

-- Documentation Specialist capabilities
('77777777-7777-7777-7777-777777777777', 'API Documentation', 'document', '{"formats": ["OpenAPI", "Swagger", "Postman"], "auto_generation": true}', '["YAML", "JSON", "Markdown"]', '["OpenAPI", "Swagger"]'),
('77777777-7777-7777-7777-777777777777', 'Technical Writing', 'document', '{"document_types": ["README", "tutorials", "guides", "reference"], "formats": ["Markdown", "HTML", "PDF"]}', '["Markdown", "HTML"]', '[]'),

-- Performance Engineer capabilities
('88888888-8888-8888-8888-888888888888', 'Performance Monitoring', 'monitor', '{"tools": ["New Relic", "DataDog", "Prometheus", "Grafana"], "metrics": ["CPU", "Memory", "Network", "Database"]}', '[]', '["Prometheus", "Grafana"]'),
('88888888-8888-8888-8888-888888888888', 'Load Testing', 'testing', '{"tools": ["k6", "Artillery", "JMeter"], "test_types": ["load", "stress", "spike", "volume"]}', '["JavaScript", "YAML"]', '["k6", "Artillery"]'),
('88888888-8888-8888-8888-888888888888', 'Code Optimization', 'analyze', '{"languages": ["TypeScript", "Python", "Java", "Go"], "optimization_types": ["algorithm", "database", "caching"]}', '["TypeScript", "JavaScript", "Python", "Java", "Go"]', '["React", "Node.js", "Spring Boot"]')

ON CONFLICT (agent_id, capability_name) DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_coordination ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_file_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_capabilities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_templates
CREATE POLICY "Anyone can view project templates" ON public.project_templates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage templates" ON public.project_templates FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for agent_coordination
CREATE POLICY "Project members can view coordination" ON public.agent_coordination FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects p 
  LEFT JOIN project_users pu ON p.id = pu.project_id 
  WHERE p.id = agent_coordination.project_id 
  AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
));

CREATE POLICY "System can manage coordination" ON public.agent_coordination FOR ALL 
USING (EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = agent_coordination.project_id 
  AND p.owner_id = auth.uid()
));

-- Create RLS policies for agent_file_operations
CREATE POLICY "Project members can view file operations" ON public.agent_file_operations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects p 
  LEFT JOIN project_users pu ON p.id = pu.project_id 
  WHERE p.id = agent_file_operations.project_id 
  AND (p.owner_id = auth.uid() OR pu.user_id = auth.uid())
));

CREATE POLICY "System can manage file operations" ON public.agent_file_operations FOR ALL 
USING (EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = agent_file_operations.project_id 
  AND p.owner_id = auth.uid()
));

-- Create RLS policies for agent_capabilities
CREATE POLICY "Anyone can view agent capabilities" ON public.agent_capabilities FOR SELECT USING (true);
CREATE POLICY "System can manage capabilities" ON public.agent_capabilities FOR ALL USING (auth.uid() IS NOT NULL);
