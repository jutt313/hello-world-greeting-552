
# Code-XI CLI

Professional AI Development Team CLI - 8 Specialized Agents for Complete Application Development

## Overview

Code-XI CLI is a powerful command-line interface that connects you to a professional team of 8 AI agents specialized in different aspects of software development. From project architecture to deployment, our AI team handles the complete development lifecycle.

## 🤖 AI Development Team

- **Manager Agent** - Project coordination, task assignment, workflow management
- **Solutions Architect** - System design, architecture planning, scalability
- **FullStack Engineer** - Frontend + Backend development, API integration
- **DevOps Engineer** - Deployment, CI/CD, infrastructure management
- **Security Engineer** - Security analysis, vulnerability scanning, compliance
- **Performance Engineer** - Optimization, load testing, monitoring setup
- **QA Engineer** - Testing strategies, quality assurance, bug detection
- **Documentation Specialist** - Technical documentation, API docs, guides

## 🚀 Quick Start

### Installation

```bash
npm install -g @codexi/cli
```

### Authentication

```bash
codexi auth
# Enter your Code-XI authentication token from the web dashboard
```

### Initialize Project

```bash
# In existing directory
codexi init

# Or create new project
codexi create-project my-app --type web --framework react
```

## 📋 Commands

### Project Management
```bash
codexi init                          # Initialize Code-XI in current directory
codexi create-project <name>         # Create new project with AI agents
codexi status                        # Show project and agents status
```

### Agent Interaction
```bash
codexi agents                        # List all available AI agents
codexi agent <role> --command <task> # Interact with specific agent
```

### Specialized Agent Commands
```bash
codexi manager "create React app"         # Project coordination
codexi architect "design microservices"   # Architecture planning
codexi fullstack "build user dashboard"   # Full-stack development
codexi devops "setup CI/CD pipeline"      # DevOps operations
codexi security "audit application"       # Security analysis
codexi performance "optimize database"    # Performance tuning
codexi qa "create test suite"             # Quality assurance
codexi docs "generate API documentation"  # Documentation
```

### Code Operations
```bash
codexi analyze <path>                # Analyze code files or repositories
codexi read <path>                   # Read and understand code structure
codexi write <path> --prompt <desc>  # Generate or modify code files
```

### Deployment & Testing
```bash
codexi deploy --env production       # Deploy with DevOps agent
codexi test --type unit             # Run tests with QA engineer
codexi workflow                     # Show current workflow status
```

## 🔧 Configuration

The CLI creates two configuration files:

- `.codexi-auth` - Authentication token (keep private)
- `.codexi-config.json` - Project configuration

## 🌐 Environment Variables

```bash
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## 💡 Usage Examples

### Complete App Development Workflow

```bash
# 1. Initialize project
codexi init --type fullstack --framework react

# 2. Architecture planning
codexi architect "design e-commerce platform with user auth, product catalog, and payment processing"

# 3. Development
codexi fullstack "implement user authentication system"
codexi fullstack "create product listing and search functionality"
codexi fullstack "integrate payment gateway"

# 4. Security & Performance
codexi security "audit authentication and payment flows"
codexi performance "optimize database queries and API responses"

# 5. Testing
codexi qa "create comprehensive test suite"
codexi test --type e2e

# 6. Documentation
codexi docs "generate API documentation and user guides"

# 7. Deployment
codexi deploy --env production
```

### Code Analysis & Improvement

```bash
# Analyze existing codebase
codexi analyze ./src

# Get architecture recommendations
codexi architect "review current architecture and suggest improvements"

# Performance optimization
codexi performance "analyze and optimize frontend bundle size"

# Security audit
codexi security "scan for vulnerabilities and security best practices"
```

## 🔗 Integration

Code-XI CLI integrates seamlessly with:

- **Supabase** - Real-time backend and database
- **Multiple LLM Providers** - OpenAI, Anthropic, Google, etc.
- **Git Repositories** - GitHub, GitLab, Bitbucket
- **Cloud Platforms** - AWS, Vercel, Netlify, Heroku
- **CI/CD Tools** - GitHub Actions, GitLab CI, Jenkins

## 📊 Features

- **Real-time Agent Coordination** - Agents work together seamlessly
- **Project Memory** - AI remembers your project context and history
- **Multi-LLM Support** - Switch between different AI providers
- **Cost Tracking** - Monitor token usage and costs
- **Workflow Management** - Track progress across all agents
- **Database Connectivity** - Direct integration with your backend

## 🆘 Help & Support

```bash
codexi help              # General help
codexi help-agents       # Detailed agent information
codexi status           # System status
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

---

**Code-XI CLI** - Professional AI Development Team at Your Command
```
