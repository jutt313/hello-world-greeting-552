
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Server, Cloud, Shield, Activity, GitBranch } from 'lucide-react';

interface DatabaseInfo {
  name: string;
  description: string;
  type: 'relational' | 'nosql' | 'cache' | 'search' | 'graph';
  connectivity: 'native' | 'orm' | 'api';
  features: string[];
  use_cases: string[];
  integration_complexity: 'low' | 'medium' | 'high';
}

export const DatabaseAnalysisPanel: React.FC = () => {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [agentCount, setAgentCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const { toast } = useToast();

  const databases: DatabaseInfo[] = [
    {
      name: 'Supabase',
      description: 'Open-source Firebase alternative with PostgreSQL backend',
      type: 'relational',
      connectivity: 'native',
      features: ['Real-time subscriptions', 'Row Level Security', 'Edge Functions', 'Storage', 'Auth'],
      use_cases: ['Full-stack apps', 'Real-time features', 'Secure applications'],
      integration_complexity: 'low',
    },
    {
      name: 'Firebase',
      description: 'Google\'s backend-as-a-service platform',
      type: 'nosql',
      connectivity: 'native',
      features: ['Real-time database', 'Firestore', 'Authentication', 'Cloud Functions', 'Hosting'],
      use_cases: ['Mobile apps', 'Real-time chat', 'Rapid prototyping'],
      integration_complexity: 'low',
    },
    {
      name: 'PostgreSQL',
      description: 'Advanced open-source relational database',
      type: 'relational',
      connectivity: 'orm',
      features: ['ACID compliance', 'JSON support', 'Full-text search', 'Extensions', 'Scalability'],
      use_cases: ['Enterprise applications', 'Data analytics', 'Complex queries'],
      integration_complexity: 'medium',
    },
    {
      name: 'MongoDB',
      description: 'Document-oriented NoSQL database',
      type: 'nosql',
      connectivity: 'orm',
      features: ['Document storage', 'Flexible schema', 'Horizontal scaling', 'Aggregation', 'GridFS'],
      use_cases: ['Content management', 'IoT applications', 'Rapid development'],
      integration_complexity: 'medium',
    },
    {
      name: 'Redis',
      description: 'In-memory data structure store',
      type: 'cache',
      connectivity: 'native',
      features: ['Key-value storage', 'Pub/Sub', 'Lua scripting', 'Clustering', 'Persistence'],
      use_cases: ['Caching', 'Session storage', 'Real-time analytics'],
      integration_complexity: 'low',
    },
    {
      name: 'Elasticsearch',
      description: 'Distributed search and analytics engine',
      type: 'search',
      connectivity: 'api',
      features: ['Full-text search', 'Analytics', 'Real-time indexing', 'Distributed', 'RESTful API'],
      use_cases: ['Search engines', 'Log analysis', 'Business intelligence'],
      integration_complexity: 'high',
    },
    {
      name: 'Neo4j',
      description: 'Graph database management system',
      type: 'graph',
      connectivity: 'api',
      features: ['Graph queries', 'ACID compliance', 'Cypher query language', 'Clustering', 'Visualization'],
      use_cases: ['Social networks', 'Recommendation engines', 'Fraud detection'],
      integration_complexity: 'high',
    },
    {
      name: 'SQLite',
      description: 'Lightweight embedded SQL database',
      type: 'relational',
      connectivity: 'native',
      features: ['Zero configuration', 'Self-contained', 'Cross-platform', 'ACID', 'Small footprint'],
      use_cases: ['Mobile apps', 'Desktop applications', 'Prototyping'],
      integration_complexity: 'low',
    },
  ];

  const checkSupabaseConnection = async () => {
    try {
      // Test connection with existing agents table that we know exists
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('id')
        .limit(1);

      if (agentsError) throw agentsError;

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .limit(1);

      if (projectsError) throw projectsError;

      const { data: profiles, error: profilesError } = await supabase
        .from('users_profiles')
        .select('id')
        .limit(1);

      if (profilesError) throw profilesError;

      // Count records from existing tables
      const { count: agentTotal } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true });

      const { count: projectTotal } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      const { count: userTotal } = await supabase
        .from('users_profiles')
        .select('*', { count: 'exact', head: true });

      setAgentCount(agentTotal || 0);
      setProjectCount(projectTotal || 0);
      setUserCount(userTotal || 0);
      setSupabaseStatus('connected');

      toast({
        title: 'Database Connected',
        description: 'Successfully connected to Supabase database',
      });
    } catch (error) {
      console.error('Database connection error:', error);
      setSupabaseStatus('error');
      toast({
        title: 'Database Error',
        description: error instanceof Error ? error.message : 'Failed to connect to database',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-500/10 text-green-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'high': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'relational': return <Database className="w-4 h-4" />;
      case 'nosql': return <Server className="w-4 h-4" />;
      case 'cache': return <Activity className="w-4 h-4" />;
      case 'search': return <GitBranch className="w-4 h-4" />;
      case 'graph': return <Cloud className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Database Integration Analysis</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Status</TabsTrigger>
          <TabsTrigger value="supported">Supported Databases</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    supabaseStatus === 'connected' ? 'bg-green-500' :
                    supabaseStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                  }`} />
                  <div>
                    <div className="font-medium">Status</div>
                    <div className="text-sm text-muted-foreground capitalize">{supabaseStatus}</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium">{agentCount}</div>
                  <div className="text-sm text-muted-foreground">Active Agents</div>
                </div>
                <div>
                  <div className="font-medium">{projectCount}</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div>
                  <div className="font-medium">{userCount}</div>
                  <div className="text-sm text-muted-foreground">Users</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Current Database Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Real-time subscriptions', 'Row Level Security', 'Edge Functions', 'File Storage', 'Authentication', 'PostgreSQL Backend'].map(feature => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={checkSupabaseConnection} 
                className="mt-4"
                variant="outline"
              >
                Refresh Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supported" className="space-y-4">
          <div className="grid gap-4">
            {databases.map(db => (
              <Card key={db.name}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(db.type)}
                      <div>
                        <h3 className="font-semibold">{db.name}</h3>
                        <p className="text-sm text-muted-foreground">{db.description}</p>
                      </div>
                    </div>
                    <Badge className={getComplexityColor(db.integration_complexity)}>
                      {db.integration_complexity} complexity
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {db.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Use Cases</h4>
                      <div className="flex flex-wrap gap-1">
                        {db.use_cases.map(useCase => (
                          <Badge key={useCase} variant="secondary" className="text-xs">
                            {useCase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Type & Connectivity</h4>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {db.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {db.connectivity} integration
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">1. Current Setup (Supabase)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The platform is currently integrated with Supabase, providing:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• PostgreSQL database with full SQL support</li>
                  <li>• Real-time subscriptions for live updates</li>
                  <li>• Row Level Security for data protection</li>
                  <li>• Edge Functions for server-side logic</li>
                  <li>• Built-in authentication and authorization</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Agent Database Knowledge</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Our AI agents have deep knowledge of various databases and can:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Generate database schemas and migrations</li>
                  <li>• Create ORM configurations and models</li>
                  <li>• Set up database connections and connection pooling</li>
                  <li>• Implement database optimization strategies</li>
                  <li>• Create backup and recovery procedures</li>
                  <li>• Design data access layers and repositories</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Multi-Database Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Agents can work with multiple databases simultaneously:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Primary database for application data (PostgreSQL/MySQL)</li>
                  <li>• Cache layer for performance (Redis/Memcached)</li>
                  <li>• Search engine for full-text search (Elasticsearch)</li>
                  <li>• Analytics database for reporting (ClickHouse/BigQuery)</li>
                  <li>• Message queue for async processing (Redis/RabbitMQ)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Database Selection Criteria</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Agents consider these factors when recommending databases:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Technical Requirements</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Data structure complexity</li>
                      <li>• Query patterns and performance</li>
                      <li>• Scalability needs</li>
                      <li>• Consistency requirements</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Operational Factors</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Team expertise</li>
                      <li>• Maintenance overhead</li>
                      <li>• Cost considerations</li>
                      <li>• Integration complexity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
