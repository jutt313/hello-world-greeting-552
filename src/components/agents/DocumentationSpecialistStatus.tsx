
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { FileText, BookOpen, Users, Globe, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface DocumentationActivity {
  id: string;
  activity_type: string;
  details: any;
  created_at: string;
}

const DocumentationSpecialistStatus: React.FC = () => {
  const [activities, setActivities] = useState<DocumentationActivity[]>([]);
  const [metrics, setMetrics] = useState({
    total_documents: 0,
    api_docs: 0,
    user_guides: 0,
    tutorials: 0,
    architecture_docs: 0,
    accessibility_score: 0,
    multilingual_coverage: 0,
    user_satisfaction: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocumentationData();
  }, []);

  const fetchDocumentationData = async () => {
    try {
      // Fetch recent documentation activities
      const { data: activitiesData } = await supabase
        .from('agent_activity_logs')
        .select('*')
        .eq('agent_id', 'documentation_specialist')
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesData) {
        setActivities(activitiesData);
        
        // Calculate metrics from activities
        const docsByType = activitiesData.reduce((acc, activity) => {
          const docType = activity.details?.documentation_type || 'general';
          acc[docType] = (acc[docType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setMetrics({
          total_documents: activitiesData.length,
          api_docs: docsByType['api'] || 0,
          user_guides: docsByType['user_guide'] || 0,
          tutorials: docsByType['tutorial'] || 0,
          architecture_docs: docsByType['architecture'] || 0,
          accessibility_score: 94, // Simulated high accessibility score
          multilingual_coverage: 76, // Simulated multilingual coverage
          user_satisfaction: 92 // Simulated user satisfaction score
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching documentation data:', error);
      setIsLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'api_documentation':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'user_guide_creation':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'tutorial_development':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'documentation_translation':
        return <Globe className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentation Specialist Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Documentation Specialist Agent
          <Badge variant="outline" className="ml-auto">
            Technical Writer
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{metrics.total_documents}</div>
            <div className="text-xs text-muted-foreground">Total Docs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{metrics.api_docs}</div>
            <div className="text-xs text-muted-foreground">API Docs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{metrics.user_guides}</div>
            <div className="text-xs text-muted-foreground">User Guides</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{metrics.tutorials}</div>
            <div className="text-xs text-muted-foreground">Tutorials</div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Accessibility Score
            </span>
            <span className={`font-semibold ${getStatusColor(metrics.accessibility_score)}`}>
              {metrics.accessibility_score}%
            </span>
          </div>
          <Progress value={metrics.accessibility_score} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Multilingual Coverage
            </span>
            <span className={`font-semibold ${getStatusColor(metrics.multilingual_coverage)}`}>
              {metrics.multilingual_coverage}%
            </span>
          </div>
          <Progress value={metrics.multilingual_coverage} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              User Satisfaction
            </span>
            <span className={`font-semibold ${getStatusColor(metrics.user_satisfaction)}`}>
              {metrics.user_satisfaction}%
            </span>
          </div>
          <Progress value={metrics.user_satisfaction} className="h-2" />
        </div>

        {/* Recent Activities */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            Recent Documentation Activities
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  {getActivityIcon(activity.activity_type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {activity.details?.documentation_type || 'Documentation Task'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.details?.target_audience || 'General'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No recent documentation activities
              </div>
            )}
          </div>
        </div>

        {/* Documentation Capabilities */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>API Documentation</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>User Guides</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Interactive Tutorials</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Architecture Docs</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Accessibility</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Localization</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentationSpecialistStatus;
