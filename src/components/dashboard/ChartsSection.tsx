
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface ChartData {
  typeData: Array<{ name: string; count: number }>;
  activityData: Array<{ date: string; calls: number }>;
  statusData: Array<{ name: string; count: number; color: string }>;
}

export const ChartsSection: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({
    typeData: [],
    activityData: [],
    statusData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch project status distribution
      const { data: statusData } = await supabase
        .from('projects')
        .select('status')
        .eq('owner_id', user.id);

      const statusCounts = statusData?.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const statusChartData = [
        { name: 'Active', count: statusCounts.active || 0, color: 'hsl(120, 60%, 50%)' },
        { name: 'Paused', count: statusCounts.paused || 0, color: 'hsl(45, 100%, 60%)' },
        { name: 'Completed', count: statusCounts.completed || 0, color: 'hsl(195, 100%, 50%)' },
        { name: 'Archived', count: statusCounts.archived || 0, color: 'hsl(220, 15%, 70%)' },
      ].filter(item => item.count > 0);

      // Fetch project types distribution
      const { data: typeData } = await supabase
        .from('projects')
        .select('type')
        .eq('owner_id', user.id);

      const typeCounts = typeData?.reduce((acc, project) => {
        acc[project.type] = (acc[project.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const typeChartData = Object.entries(typeCounts).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: count as number,
      }));

      // Fetch 30-day activity data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: analyticsData } = await supabase
        .from('project_analytics')
        .select('date, api_calls_count')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const activityChartData = analyticsData?.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calls: item.api_calls_count || 0,
      })) || [];

      setChartData({
        typeData: typeChartData,
        activityData: activityChartData,
        statusData: statusChartData,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl p-6 animate-pulse"
               style={{
                 background: 'hsla(230, 30%, 18%, 0.8)',
                 border: '1px solid hsla(220, 40%, 30%, 0.3)',
               }}>
            <div className="h-4 bg-gray-600 rounded mb-4"></div>
            <div className="h-48 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Bar Chart: Projects by Type */}
      <div className="rounded-xl p-6"
           style={{
             background: 'hsla(230, 30%, 18%, 0.8)',
             border: '1px solid hsla(220, 40%, 30%, 0.3)',
           }}>
        <h3 className="text-lg font-semibold mb-4 text-left" style={{ color: 'hsl(0, 0%, 95%)' }}>
          Projects by Type
        </h3>
        {chartData.typeData.length > 0 ? (
          <ChartContainer config={{}} className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 40%, 30%, 0.3)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(220, 15%, 70%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(220, 15%, 70%)', fontSize: 12 }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'hsla(195, 100%, 50%, 0.1)' }}
                />
                <Bar dataKey="count" 
                     fill="hsl(195, 100%, 50%)"
                     radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-center" style={{ color: 'hsl(220, 15%, 70%)' }}>
              No project data available
            </p>
          </div>
        )}
      </div>

      {/* Line Chart: Daily Activity */}
      <div className="rounded-xl p-6"
           style={{
             background: 'hsla(230, 30%, 18%, 0.8)',
             border: '1px solid hsla(220, 40%, 30%, 0.3)',
           }}>
        <h3 className="text-lg font-semibold mb-4 text-left" style={{ color: 'hsl(0, 0%, 95%)' }}>
          Daily Activity (30 Days)
        </h3>
        {chartData.activityData.length > 0 ? (
          <ChartContainer config={{}} className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 40%, 30%, 0.3)" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(220, 15%, 70%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(220, 15%, 70%)', fontSize: 12 }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: 'hsl(195, 100%, 50%)', strokeWidth: 1 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="hsl(195, 100%, 50%)"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(195, 100%, 50%)', r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(195, 100%, 50%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-center" style={{ color: 'hsl(220, 15%, 70%)' }}>
              No activity data available
            </p>
          </div>
        )}
      </div>

      {/* Pie Chart: Project Status */}
      <div className="rounded-xl p-6"
           style={{
             background: 'hsla(230, 30%, 18%, 0.8)',
             border: '1px solid hsla(220, 40%, 30%, 0.3)',
           }}>
        <h3 className="text-lg font-semibold mb-4 text-left" style={{ color: 'hsl(0, 0%, 95%)' }}>
          Project Status Distribution
        </h3>
        {chartData.statusData.length > 0 ? (
          <>
            <ChartContainer config={{}} className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="count"
                  >
                    {chartData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {chartData.statusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm" style={{ color: 'hsl(220, 15%, 70%)' }}>
                    {item.name}: {((item.count / chartData.statusData.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-center" style={{ color: 'hsl(220, 15%, 70%)' }}>
              No project status data
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
