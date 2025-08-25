
import React, { useState, useEffect } from 'react';
import { useQAEngineer } from '@/hooks/useQAEngineer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TestTube, Play, FileText, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QAEngineerCLIProps {
  projectId: string;
  projectName: string;
}

const QAEngineerCLI: React.FC<QAEngineerCLIProps> = ({ projectId, projectName }) => {
  const [activeCommand, setActiveCommand] = useState<string>('');
  const [testRequirements, setTestRequirements] = useState<string>('');
  const [filePaths, setFilePaths] = useState<string>('');
  const [testType, setTestType] = useState<string>('unit');
  const [performanceConfig, setPerformanceConfig] = useState<string>('');
  const [commandOutput, setCommandOutput] = useState<string>('');
  
  const {
    sendMessageToQAEngineer,
    createTestStrategy,
    analyzeCodeForTesting,
    createAutomatedTests,
    runPerformanceTest,
    isLoading
  } = useQAEngineer(projectId);
  
  const { toast } = useToast();

  const handleCommand = async (command: string) => {
    setActiveCommand(command);
    setCommandOutput('');
    
    try {
      let result = null;
      
      switch (command) {
        case 'test-strategy':
          if (!testRequirements.trim()) {
            toast({
              title: 'Missing Requirements',
              description: 'Please provide test requirements',
              variant: 'destructive',
            });
            return;
          }
          result = await createTestStrategy(testRequirements);
          break;
          
        case 'analyze-code':
          if (!filePaths.trim()) {
            toast({
              title: 'Missing File Paths',
              description: 'Please provide file paths to analyze',
              variant: 'destructive',
            });
            return;
          }
          result = await analyzeCodeForTesting(filePaths.split(',').map(f => f.trim()));
          break;
          
        case 'create-tests':
          if (!testRequirements.trim()) {
            toast({
              title: 'Missing Requirements',
              description: 'Please provide test requirements',
              variant: 'destructive',
            });
            return;
          }
          result = await createAutomatedTests(testType, { requirements: testRequirements });
          break;
          
        case 'performance-test':
          let config = {};
          if (performanceConfig.trim()) {
            try {
              config = JSON.parse(performanceConfig);
            } catch (e) {
              config = { config: performanceConfig };
            }
          }
          result = await runPerformanceTest(config);
          break;
          
        default:
          result = await sendMessageToQAEngineer(`Execute CLI command: ${command}`);
      }
      
      if (result && result.success) {
        setCommandOutput(result.response);
        toast({
          title: 'Command Executed',
          description: `QA Engineer completed: ${command}`,
        });
      }
    } catch (error) {
      console.error('Command execution error:', error);
      toast({
        title: 'Command Failed',
        description: error instanceof Error ? error.message : 'Command execution failed',
        variant: 'destructive',
      });
    } finally {
      setActiveCommand('');
    }
  };

  const commands = [
    {
      id: 'test-strategy',
      name: 'Create Test Strategy',
      description: 'Generate comprehensive testing strategy',
      icon: <TestTube className="w-4 h-4" />,
      requiresInput: 'testRequirements'
    },
    {
      id: 'analyze-code',
      name: 'Analyze Code for Testing',
      description: 'Analyze code files for testability assessment',
      icon: <FileText className="w-4 h-4" />,
      requiresInput: 'filePaths'
    },
    {
      id: 'create-tests',
      name: 'Create Automated Tests',
      description: 'Generate automated test suites',
      icon: <CheckCircle className="w-4 h-4" />,
      requiresInput: 'testRequirements'
    },
    {
      id: 'performance-test',
      name: 'Run Performance Tests',
      description: 'Execute performance testing',
      icon: <BarChart3 className="w-4 h-4" />,
      requiresInput: 'performanceConfig'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-green-500" />
          QA Engineer CLI Interface
          <Badge variant="outline" className="ml-auto">
            {projectName}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Command Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {commands.map((cmd) => (
            <Button
              key={cmd.id}
              variant="outline"
              className="flex items-center gap-2 p-4 h-auto"
              onClick={() => handleCommand(cmd.id)}
              disabled={isLoading}
            >
              {cmd.icon}
              <div className="text-left">
                <div className="font-semibold">{cmd.name}</div>
                <div className="text-xs text-muted-foreground">{cmd.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Test Requirements</label>
            <Textarea
              value={testRequirements}
              onChange={(e) => setTestRequirements(e.target.value)}
              placeholder="Describe your testing requirements, features to test, quality standards..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">File Paths (comma-separated)</label>
            <Input
              value={filePaths}
              onChange={(e) => setFilePaths(e.target.value)}
              placeholder="src/components/App.tsx, src/utils/helper.ts, ..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Test Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="unit">Unit Tests</option>
                <option value="integration">Integration Tests</option>
                <option value="e2e">End-to-End Tests</option>
                <option value="performance">Performance Tests</option>
                <option value="security">Security Tests</option>
                <option value="accessibility">Accessibility Tests</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Performance Config (JSON)</label>
              <Input
                value={performanceConfig}
                onChange={(e) => setPerformanceConfig(e.target.value)}
                placeholder='{"users": 100, "duration": "5m"}'
              />
            </div>
          </div>
        </div>

        {/* Command Output */}
        {commandOutput && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Command Output:</label>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {commandOutput}
            </div>
          </div>
        )}

        {/* Status Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            QA Engineer is {activeCommand ? `executing: ${activeCommand}` : 'processing'}...
          </div>
        )}

        {/* CLI Help */}
        <div className="text-xs text-muted-foreground bg-accent/20 rounded p-3">
          <strong>QA Engineer CLI Commands:</strong> Use these commands to interact with the QA Engineer Agent 
          for comprehensive testing strategies, code analysis, automated test creation, and quality validation. 
          All testing activities are coordinated through the Manager Agent for optimal integration.
        </div>
      </CardContent>
    </Card>
  );
};

export default QAEngineerCLI;
