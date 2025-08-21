
-- Insert the 8 core agents into the agents table
INSERT INTO public.agents (id, name, role, description, permissions, is_active) VALUES
(
  gen_random_uuid(),
  'Manager Agent',
  'manager'::agent_role,
  'Orchestrates workflows, delegates tasks, manages project timelines, and coordinates all agents',
  '{"read": true, "write": true, "execute": true, "coordinate": true, "delegate": true}'::jsonb,
  true
),
(
  gen_random_uuid(),
  'Full-Stack Engineer',
  'developer'::agent_role,
  'Generates React/Node.js/Python/Java code, creates complete applications, handles frontend and backend development',
  '{"read": true, "write": true, "execute": true, "generate_code": true, "file_operations": true}'::jsonb,
  true
),
(
  gen_random_uuid(),
  'DevOps Engineer',
  'devops'::agent_role,
  'Creates Docker files, Kubernetes configs, CI/CD pipelines, manages deployments to cloud platforms',
  '{"read": true, "write": true, "execute": true, "deploy": true, "infrastructure": true}'::jsonb,
  true
),
(
  gen_random_uuid(),
  'QA Engineer',
  'qa'::agent_role,
  'Generates test files, runs automated testing frameworks, creates test suites for all programming languages',
  '{"read": true, "write": true, "execute": true, "test": true, "quality_assurance": true}'::jsonb,
  true
),
(
  gen_random_uuid(),
  'Security Engineer',
  'security'::agent_role,
  'Scans code for vulnerabilities, implements security patches, generates security reports',
  '{"read": true, "write": true, "execute": true, "security_scan": true, "vulnerability_analysis": true}'::jsonb,
  true
),
(
  gen_random_uuid(),
  'Solutions Architect',
  'architect'::agent_role,
  'Creates system diagrams, database designs, architecture documentation, plans system structure',
  '{"read": true, "write": true, "execute": true, "design": true, "architecture": true}'::jsonb,
  true
),
(
  gen_random_uuid(),
  'Documentation Specialist',
  'documentation'::agent_role,
  'Generates README files, API documentation, user guides, tutorials for any programming language',
  '{"read": true, "write": true, "execute": true, "documentation": true, "content_generation": true}'::jsonb,
  true
),
(
  gen_random_uuid(),
  'Performance Engineer',
  'performance'::agent_role,
  'Runs performance benchmarks, optimizes code, generates performance reports across all languages',
  '{"read": true, "write": true, "execute": true, "optimize": true, "performance_analysis": true}'::jsonb,
  true
);

-- Create project templates table
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  description TEXT,
  programming_languages TEXT[] DEFAULT '{}',
  frameworks TEXT[] DEFAULT '{}',
  template_config JSONB DEFAULT '{}',
  file_structure JSONB DEFAULT '{}',
  dependencies JSONB DEFAULT '{}',
  build_commands JSONB DEFAULT '{}',
  deployment_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on project templates
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Policy for viewing project templates (everyone can see them)
CREATE POLICY "Anyone can view project templates" 
  ON public.project_templates 
  FOR SELECT 
  USING (true);

-- Insert comprehensive project templates for iOS, Android, Web Apps with all major programming languages
INSERT INTO public.project_templates (name, template_type, description, programming_languages, frameworks, template_config, file_structure, dependencies, build_commands, deployment_config) VALUES

-- iOS Templates
(
  'iOS Swift App',
  'ios',
  'Native iOS application using Swift and UIKit/SwiftUI',
  ARRAY['Swift', 'Objective-C'],
  ARRAY['UIKit', 'SwiftUI', 'Core Data', 'CloudKit'],
  '{"platform": "iOS", "min_version": "15.0", "development_team": "required"}'::jsonb,
  '{"src": ["AppDelegate.swift", "SceneDelegate.swift", "ViewController.swift"], "resources": ["Assets.xcassets", "LaunchScreen.storyboard"], "config": ["Info.plist"]}'::jsonb,
  '{"cocoapods": [], "swift_packages": []}'::jsonb,
  '{"build": "xcodebuild", "test": "xcodebuild test", "archive": "xcodebuild archive"}'::jsonb,
  '{"app_store": true, "testflight": true, "enterprise": false}'::jsonb
),

-- React Native iOS
(
  'React Native iOS',
  'ios',
  'Cross-platform iOS app using React Native with JavaScript/TypeScript',
  ARRAY['JavaScript', 'TypeScript', 'Swift', 'Objective-C'],
  ARRAY['React Native', 'Expo', 'Metro'],
  '{"platform": "iOS", "react_native_version": "latest", "expo": "optional"}'::jsonb,
  '{"src": ["App.js", "index.js"], "ios": ["ios/"], "components": ["components/"], "screens": ["screens/"]}'::jsonb,
  '{"npm": ["react-native", "@react-native-community/*"], "pods": []}'::jsonb,
  '{"build": "npx react-native run-ios", "test": "jest", "bundle": "npx react-native bundle"}'::jsonb,
  '{"app_store": true, "testflight": true}'::jsonb
),

-- Android Templates
(
  'Android Kotlin App',
  'android',
  'Native Android application using Kotlin and Android SDK',
  ARRAY['Kotlin', 'Java'],
  ARRAY['Android SDK', 'Jetpack Compose', 'Room', 'Retrofit'],
  '{"platform": "Android", "min_sdk": "21", "target_sdk": "34", "compile_sdk": "34"}'::jsonb,
  '{"src": ["MainActivity.kt", "Application.kt"], "res": ["layout/", "values/", "drawable/"], "manifest": ["AndroidManifest.xml"]}'::jsonb,
  '{"gradle": ["androidx.*", "com.google.android.*"], "kotlin": ["org.jetbrains.kotlin.*"]}'::jsonb,
  '{"build": "./gradlew build", "test": "./gradlew test", "assemble": "./gradlew assembleRelease"}'::jsonb,
  '{"google_play": true, "firebase": true, "aab": true}'::jsonb
),

-- React Native Android
(
  'React Native Android',
  'android',
  'Cross-platform Android app using React Native',
  ARRAY['JavaScript', 'TypeScript', 'Kotlin', 'Java'],
  ARRAY['React Native', 'Expo', 'Metro'],
  '{"platform": "Android", "react_native_version": "latest"}'::jsonb,
  '{"src": ["App.js", "index.js"], "android": ["android/"], "components": ["components/"]}'::jsonb,
  '{"npm": ["react-native"], "gradle": []}'::jsonb,
  '{"build": "npx react-native run-android", "test": "jest"}'::jsonb,
  '{"google_play": true, "firebase": true}'::jsonb
),

-- Web App Templates
(
  'React TypeScript Web App',
  'web',
  'Modern web application using React with TypeScript',
  ARRAY['TypeScript', 'JavaScript', 'HTML', 'CSS'],
  ARRAY['React', 'Vite', 'Tailwind CSS', 'React Router'],
  '{"framework": "React", "language": "TypeScript", "bundler": "Vite"}'::jsonb,
  '{"src": ["App.tsx", "main.tsx", "index.html"], "components": ["components/"], "pages": ["pages/"], "styles": ["styles/"]}'::jsonb,
  '{"npm": ["react", "typescript", "vite", "@types/react"]}'::jsonb,
  '{"build": "npm run build", "dev": "npm run dev", "test": "npm run test"}'::jsonb,
  '{"vercel": true, "netlify": true, "aws": true, "docker": true}'::jsonb
),

(
  'Vue.js TypeScript Web App',
  'web',
  'Modern web application using Vue.js with TypeScript',
  ARRAY['TypeScript', 'JavaScript', 'HTML', 'CSS'],
  ARRAY['Vue.js', 'Vite', 'Vue Router', 'Pinia'],
  '{"framework": "Vue", "language": "TypeScript", "bundler": "Vite"}'::jsonb,
  '{"src": ["App.vue", "main.ts"], "components": ["components/"], "views": ["views/"], "stores": ["stores/"]}'::jsonb,
  '{"npm": ["vue", "typescript", "vite", "@vue/typescript"]}'::jsonb,
  '{"build": "npm run build", "dev": "npm run dev", "test": "npm run test"}'::jsonb,
  '{"vercel": true, "netlify": true, "aws": true}'::jsonb
),

(
  'Angular TypeScript Web App',
  'web',
  'Enterprise web application using Angular with TypeScript',
  ARRAY['TypeScript', 'JavaScript', 'HTML', 'CSS', 'SCSS'],
  ARRAY['Angular', 'Angular CLI', 'RxJS', 'Angular Material'],
  '{"framework": "Angular", "language": "TypeScript", "cli": "Angular CLI"}'::jsonb,
  '{"src": ["app/", "main.ts", "index.html"], "components": ["app/components/"], "services": ["app/services/"]}'::jsonb,
  '{"npm": ["@angular/core", "@angular/cli", "typescript", "rxjs"]}'::jsonb,
  '{"build": "ng build", "dev": "ng serve", "test": "ng test"}'::jsonb,
  '{"aws": true, "azure": true, "docker": true}'::jsonb
),

(
  'Node.js Express API',
  'web',
  'Backend API using Node.js with Express and TypeScript',
  ARRAY['TypeScript', 'JavaScript'],
  ARRAY['Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
  '{"runtime": "Node.js", "language": "TypeScript", "database": "configurable"}'::jsonb,
  '{"src": ["server.ts", "app.ts"], "routes": ["routes/"], "models": ["models/"], "middleware": ["middleware/"]}'::jsonb,
  '{"npm": ["express", "typescript", "@types/node", "nodemon"]}'::jsonb,
  '{"build": "npm run build", "dev": "npm run dev", "start": "npm start"}'::jsonb,
  '{"heroku": true, "aws": true, "docker": true}'::jsonb
),

(
  'Next.js Full-Stack App',
  'web',
  'Full-stack web application using Next.js with TypeScript',
  ARRAY['TypeScript', 'JavaScript', 'HTML', 'CSS'],
  ARRAY['Next.js', 'React', 'Tailwind CSS', 'Prisma'],
  '{"framework": "Next.js", "language": "TypeScript", "database": "configurable"}'::jsonb,
  '{"src": ["pages/", "components/", "api/"], "styles": ["styles/"], "prisma": ["prisma/"]}'::jsonb,
  '{"npm": ["next", "react", "typescript", "tailwindcss"]}'::jsonb,
  '{"build": "npm run build", "dev": "npm run dev", "start": "npm start"}'::jsonb,
  '{"vercel": true, "aws": true, "docker": true}'::jsonb
),

-- Multi-language templates
(
  'Python Flask API',
  'web',
  'Backend API using Python Flask framework',
  ARRAY['Python'],
  ARRAY['Flask', 'SQLAlchemy', 'Marshmallow'],
  '{"runtime": "Python", "framework": "Flask", "database": "configurable"}'::jsonb,
  '{"src": ["app.py", "models/", "routes/"], "requirements": ["requirements.txt"], "config": ["config.py"]}'::jsonb,
  '{"pip": ["flask", "sqlalchemy", "marshmallow", "flask-cors"]}'::jsonb,
  '{"run": "python app.py", "test": "pytest", "install": "pip install -r requirements.txt"}'::jsonb,
  '{"heroku": true, "aws": true, "docker": true}'::jsonb
),

(
  'Django Web App',
  'web',
  'Full-featured web application using Django',
  ARRAY['Python', 'HTML', 'CSS', 'JavaScript'],
  ARRAY['Django', 'Django REST Framework', 'PostgreSQL'],
  '{"runtime": "Python", "framework": "Django", "database": "PostgreSQL"}'::jsonb,
  '{"src": ["manage.py", "apps/", "templates/"], "static": ["static/"], "requirements": ["requirements.txt"]}'::jsonb,
  '{"pip": ["django", "djangorestframework", "psycopg2-binary"]}'::jsonb,
  '{"run": "python manage.py runserver", "migrate": "python manage.py migrate", "test": "python manage.py test"}'::jsonb,
  '{"heroku": true, "aws": true, "docker": true}'::jsonb
),

(
  'Spring Boot Java API',
  'web',
  'Enterprise API using Spring Boot with Java',
  ARRAY['Java'],
  ARRAY['Spring Boot', 'Spring Data JPA', 'Maven'],
  '{"runtime": "Java", "framework": "Spring Boot", "build_tool": "Maven"}'::jsonb,
  '{"src": ["src/main/java/", "src/main/resources/"], "pom": ["pom.xml"], "config": ["application.properties"]}'::jsonb,
  '{"maven": ["spring-boot-starter-web", "spring-boot-starter-data-jpa"]}'::jsonb,
  '{"build": "mvn clean install", "run": "mvn spring-boot:run", "test": "mvn test"}'::jsonb,
  '{"aws": true, "docker": true, "kubernetes": true}'::jsonb
),

(
  'Ruby on Rails Web App',
  'web',
  'Full-stack web application using Ruby on Rails',
  ARRAY['Ruby', 'HTML', 'CSS', 'JavaScript'],
  ARRAY['Ruby on Rails', 'ActiveRecord', 'ActionCable'],
  '{"runtime": "Ruby", "framework": "Rails", "database": "PostgreSQL"}'::jsonb,
  '{"src": ["app/", "config/", "db/"], "gemfile": ["Gemfile"], "routes": ["config/routes.rb"]}'::jsonb,
  '{"gems": ["rails", "pg", "puma", "sass-rails"]}'::jsonb,
  '{"run": "rails server", "migrate": "rails db:migrate", "test": "rails test"}'::jsonb,
  '{"heroku": true, "aws": true, "docker": true}'::jsonb
),

(
  'Go REST API',
  'web',
  'High-performance REST API using Go',
  ARRAY['Go'],
  ARRAY['Gin', 'GORM', 'JWT'],
  '{"runtime": "Go", "framework": "Gin", "database": "configurable"}'::jsonb,
  '{"src": ["main.go", "handlers/", "models/"], "go": ["go.mod", "go.sum"], "config": ["config/"]}'::jsonb,
  '{"modules": ["github.com/gin-gonic/gin", "gorm.io/gorm"]}'::jsonb,
  '{"build": "go build", "run": "go run main.go", "test": "go test"}'::jsonb,
  '{"aws": true, "docker": true, "kubernetes": true}'::jsonb
),

(
  'C# .NET Core API',
  'web',
  'Enterprise API using C# and .NET Core',
  ARRAY['C#'],
  ARRAY['.NET Core', 'Entity Framework', 'ASP.NET Core'],
  '{"runtime": ".NET Core", "language": "C#", "database": "SQL Server"}'::jsonb,
  '{"src": ["Controllers/", "Models/", "Services/"], "config": ["appsettings.json"], "project": ["*.csproj"]}'::jsonb,
  '{"nuget": ["Microsoft.AspNetCore", "Microsoft.EntityFrameworkCore"]}'::jsonb,
  '{"build": "dotnet build", "run": "dotnet run", "test": "dotnet test"}'::jsonb,
  '{"azure": true, "aws": true, "docker": true}'::jsonb
),

(
  'Rust Web API',
  'web',
  'High-performance web API using Rust',
  ARRAY['Rust'],
  ARRAY['Actix-web', 'Tokio', 'Serde'],
  '{"runtime": "Rust", "framework": "Actix-web", "async": "Tokio"}'::jsonb,
  '{"src": ["main.rs", "handlers/", "models/"], "cargo": ["Cargo.toml"], "config": ["config/"]}'::jsonb,
  '{"crates": ["actix-web", "tokio", "serde", "sqlx"]}'::jsonb,
  '{"build": "cargo build", "run": "cargo run", "test": "cargo test"}'::jsonb,
  '{"aws": true, "docker": true, "kubernetes": true}'::jsonb
);

-- Create agent capabilities table to define what each agent can do
CREATE TABLE IF NOT EXISTS public.agent_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  capability_name TEXT NOT NULL,
  capability_description TEXT,
  programming_languages TEXT[] DEFAULT '{}',
  frameworks TEXT[] DEFAULT '{}',
  actions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on agent capabilities
ALTER TABLE public.agent_capabilities ENABLE ROW LEVEL SECURITY;

-- Policy for viewing agent capabilities
CREATE POLICY "Users can view agent capabilities" 
  ON public.agent_capabilities 
  FOR SELECT 
  USING (true);

-- Create file operations system table for tracking agent file operations
CREATE TABLE IF NOT EXISTS public.agent_file_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id),
  project_id UUID REFERENCES public.projects(id),
  operation_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'read'
  file_path TEXT NOT NULL,
  file_content_before TEXT,
  file_content_after TEXT,
  operation_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  error_message TEXT,
  programming_language TEXT,
  framework TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on file operations
ALTER TABLE public.agent_file_operations ENABLE ROW LEVEL SECURITY;

-- Policy for file operations
CREATE POLICY "Project members can view file operations" 
  ON public.agent_file_operations 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = agent_file_operations.project_id 
    AND p.owner_id = auth.uid()
  ));

CREATE POLICY "System can manage file operations" 
  ON public.agent_file_operations 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = agent_file_operations.project_id 
    AND p.owner_id = auth.uid()
  ));

-- Create agent coordination table for inter-agent communication
CREATE TABLE IF NOT EXISTS public.agent_coordination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  initiator_agent_id UUID REFERENCES public.agents(id),
  target_agent_id UUID REFERENCES public.agents(id),
  coordination_type TEXT NOT NULL, -- 'delegate', 'request', 'update', 'complete'
  message TEXT NOT NULL,
  task_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on agent coordination
ALTER TABLE public.agent_coordination ENABLE ROW LEVEL SECURITY;

-- Policy for agent coordination
CREATE POLICY "Project members can view agent coordination" 
  ON public.agent_coordination 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = agent_coordination.project_id 
    AND p.owner_id = auth.uid()
  ));

CREATE POLICY "System can manage agent coordination" 
  ON public.agent_coordination 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = agent_coordination.project_id 
    AND p.owner_id = auth.uid()
  ));
