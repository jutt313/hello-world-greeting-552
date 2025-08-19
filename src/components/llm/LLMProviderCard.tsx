
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Activity, DollarSign, Zap, Bot } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface LLMProvider {
  id: string;
  provider_name: string;
  selected_models: string[];
  provider_config: {
    credential_name: string;
  };
  is_active: boolean;
}

interface LLMProviderCardProps {
  provider: LLMProvider;
  analytics: {
    totalTokens: number;
    totalCalls: number;
    totalExpenses: number;
    activeModel: string;
    dailyUsage: Array<{ date: string; tokens: number; cost: number }>;
    modelDistribution: Array<{ model: string; usage: number; color: string }>;
  };
}

const LLMProviderCard: React.FC<LLMProviderCardProps> = ({ provider, analytics }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{provider.provider_config.credential_name}</CardTitle>
            <p className="text-sm text-muted-foreground capitalize">{provider.provider_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={provider.is_active ? "default" : "secondary"}>
              {provider.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Zap className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Tokens</p>
              <p className="font-semibold">{analytics.totalTokens.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Activity className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">API Calls</p>
              <p className="font-semibold">{analytics.totalCalls}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <DollarSign className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="font-semibold">${analytics.totalExpenses.toFixed(4)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Bot className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Active Model</p>
              <p className="font-semibold text-xs">{analytics.activeModel}</p>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-6 mt-6 pt-4 border-t">
            {/* Daily Usage Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3">Daily Usage</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.dailyUsage}>
                    <XAxis dataKey="date" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Bar dataKey="tokens" fill="#06b6d4" radius={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Over Time Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3">Cost Over Time</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailyUsage}>
                    <XAxis dataKey="date" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Model Distribution Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3">Model Usage Distribution</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.modelDistribution}
                      dataKey="usage"
                      nameKey="model"
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      fontSize={10}
                    >
                      {analytics.modelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Models List */}
            <div>
              <h4 className="text-sm font-medium mb-3">Available Models</h4>
              <div className="flex flex-wrap gap-1">
                {provider.selected_models.map((model) => (
                  <Badge key={model} variant="outline" className="text-xs">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LLMProviderCard;
