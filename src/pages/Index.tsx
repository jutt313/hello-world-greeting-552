
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code2, Brain, Zap, Users, GitBranch, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const agents = [
    "Manager", "Assistant", "Product Manager", "Business Analyst",
    "UI Designer", "UX Designer", "Frontend Developer", "Backend Developer",
    "Full-stack Developer", "Mobile Developer (iOS)", "Mobile Developer (Android)",
    "Game Developer", "Embedded/IoT Engineer", "QA Testing Engineer",
    "DevOps Engineer", "Security Engineer", "AI/ML Engineer", "Data Engineer",
    "Cloud Engineer", "Technical Writer", "Tech Lead/Architect"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background glow effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-400 p-2 rounded-lg">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Code-XI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            <span className="text-white">Development Platform</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Code-XI revolutionizes software development with 21 specialized AI agents, 
            unified CLI/web interface, and real-time analytics. Build faster, smarter, better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                Start Building
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              View Documentation
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Build
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              From initial concept to production deployment, Code-XI provides the tools and intelligence you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card/10 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-400 p-3 rounded-lg w-fit mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">21 AI Agents</h3>
                <p className="text-gray-300">
                  Specialized agents for every role: managers, designers, developers, QA, DevOps, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/10 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-3 rounded-lg w-fit mb-4">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Unified Interface</h3>
                <p className="text-gray-300">
                  Seamless integration between CLI and web dashboard for maximum productivity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/10 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 p-3 rounded-lg w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-time Analytics</h3>
                <p className="text-gray-300">
                  Track API usage, costs, and project progress with detailed analytics and insights.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/10 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-3 rounded-lg w-fit mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Team Collaboration</h3>
                <p className="text-gray-300">
                  Multi-user support with role-based permissions for seamless team development.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/10 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-orange-400 to-red-400 p-3 rounded-lg w-fit mb-4">
                  <GitBranch className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Version Control</h3>
                <p className="text-gray-300">
                  Integrated Git workflows with automated commit tracking and branch management.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/10 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 p-3 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Multi-LLM Support</h3>
                <p className="text-gray-300">
                  Choose from OpenAI, Anthropic, Google, and Cohere for optimal performance and cost.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AI Agents Showcase */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Meet Your AI Development Team
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              21 specialized agents, each expertly trained for specific development roles and responsibilities.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
            {agents.map((agent, index) => (
              <Badge 
                key={agent} 
                variant="secondary" 
                className="bg-card/20 backdrop-blur-sm border-border/50 text-white hover:bg-card/30 transition-colors px-3 py-2"
              >
                {agent}
              </Badge>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Development Workflow?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join developers who are already building the future with AI-powered development tools.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-400 p-2 rounded-lg">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Code-XI
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 Code-XI. Empowering developers with AI intelligence.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
