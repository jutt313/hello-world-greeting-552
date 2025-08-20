
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Terminal, Copy, Download } from 'lucide-react';
import { useSolutionsArchitect } from '@/hooks/useSolutionsArchitect';

interface SolutionsArchitectCLIProps {
  projectId: string;
}

const SolutionsArchitectCLI: React.FC<SolutionsArchitectCLIProps> = ({ projectId }) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([
    '╭─ Solutions Architect Agent CLI v1.0.0',
    '├─ System Design & Architecture Specialist',
    '├─ Type "help" for available commands',
    '└─ Ready for architectural analysis and design...',
    ''
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const { 
    analyzeArchitecture, 
    designSystem, 
    evaluateTechnology, 
    createADR,
    designAPI,
    planMigration,
    generateDocs,
    designIntegration,
    planDeployment,
    assessScalability,
    reviewPerformance,
    auditSecurity,
    sendMessage 
  } = useSolutionsArchitect(projectId);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (text: string | string[]) => {
    const lines = Array.isArray(text) ? text : [text];
    setOutput(prev => [...prev, ...lines]);
  };

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    setIsProcessing(true);
    addOutput(`┌─ $ ${cmd}`);
    
    const parts = cmd.trim().split(' ');
    const mainCommand = parts[0];
    const args = parts.slice(1);

    try {
      switch (mainCommand) {
        case 'help':
          addOutput([
            '├─ Available Commands:',
            '├─ analyze-architecture [path] - Analyze system architecture',
            '├─ design-system [requirements] - Design comprehensive system architecture',
            '├─ evaluate-technology [stack] - Evaluate technology stack',
            '├─ create-adr [decision] - Create Architecture Decision Record',
            '├─ design-api [spec] - Design API architecture',
            '├─ plan-migration [from] [to] - Plan system migration',
            '├─ generate-docs [component] - Generate architecture docs',
            '├─ design-integration [systems] - Design system integration',
            '├─ plan-deployment [arch] - Plan deployment architecture',
            '├─ assess-scalability [component] - Assess scalability',
            '├─ review-performance [system] - Review performance architecture',
            '├─ audit-security [arch] - Audit security architecture',
            '├─ clear - Clear terminal output',
            '└─ help - Show this help message'
          ]);
          break;

        case 'analyze-architecture':
          const path = args[0] || './';
          addOutput(`├─ Analyzing architecture at: ${path}`);
          const analysisResult = await analyzeArchitecture(path);
          if (analysisResult) {
            addOutput([
              '├─ Architecture Analysis Complete:',
              `├─ Tokens Used: ${analysisResult.tokens_used}`,
              `├─ Cost: $${analysisResult.cost.toFixed(4)}`,
              '├─ Analysis Results:',
              ...analysisResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'design-system':
          const requirements = args.join(' ') || 'Scalable web application';
          addOutput(`├─ Designing system for: ${requirements}`);
          const designResult = await designSystem(requirements);
          if (designResult) {
            addOutput([
              '├─ System Design Complete:',
              `├─ Tokens Used: ${designResult.tokens_used}`,
              `├─ Cost: $${designResult.cost.toFixed(4)}`,
              '├─ Design Specifications:',
              ...designResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'evaluate-technology':
          const techStack = args.join(' ') || 'Current technology stack';
          addOutput(`├─ Evaluating technology: ${techStack}`);
          const evalResult = await evaluateTechnology(techStack);
          if (evalResult) {
            addOutput([
              '├─ Technology Evaluation Complete:',
              `├─ Tokens Used: ${evalResult.tokens_used}`,
              `├─ Cost: $${evalResult.cost.toFixed(4)}`,
              '├─ Evaluation Results:',
              ...evalResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'create-adr':
          const decision = args.join(' ') || 'Architecture decision';
          addOutput(`├─ Creating ADR for: ${decision}`);
          const adrResult = await createADR(decision);
          if (adrResult) {
            addOutput([
              '├─ Architecture Decision Record Created:',
              `├─ Tokens Used: ${adrResult.tokens_used}`,
              `├─ Cost: $${adrResult.cost.toFixed(4)}`,
              '├─ ADR Content:',
              ...adrResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'design-api':
          const apiSpec = args.join(' ') || 'RESTful API specification';
          addOutput(`├─ Designing API: ${apiSpec}`);
          const apiResult = await designAPI(apiSpec);
          if (apiResult) {
            addOutput([
              '├─ API Design Complete:',
              `├─ Tokens Used: ${apiResult.tokens_used}`,
              `├─ Cost: $${apiResult.cost.toFixed(4)}`,
              '├─ API Architecture:',
              ...apiResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'plan-migration':
          const fromSystem = args[0] || 'current';
          const toSystem = args[1] || 'target';
          addOutput(`├─ Planning migration from ${fromSystem} to ${toSystem}`);
          const migrationResult = await planMigration(fromSystem, toSystem);
          if (migrationResult) {
            addOutput([
              '├─ Migration Plan Complete:',
              `├─ Tokens Used: ${migrationResult.tokens_used}`,
              `├─ Cost: $${migrationResult.cost.toFixed(4)}`,
              '├─ Migration Strategy:',
              ...migrationResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'generate-docs':
          const component = args.join(' ') || 'system architecture';
          addOutput(`├─ Generating documentation for: ${component}`);
          const docsResult = await generateDocs(component);
          if (docsResult) {
            addOutput([
              '├─ Documentation Generation Complete:',
              `├─ Tokens Used: ${docsResult.tokens_used}`,
              `├─ Cost: $${docsResult.cost.toFixed(4)}`,
              '├─ Generated Documentation:',
              ...docsResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'design-integration':
          const systems = args.join(' ') || 'system components';
          addOutput(`├─ Designing integration for: ${systems}`);
          const integrationResult = await designIntegration(systems);
          if (integrationResult) {
            addOutput([
              '├─ Integration Design Complete:',
              `├─ Tokens Used: ${integrationResult.tokens_used}`,
              `├─ Cost: $${integrationResult.cost.toFixed(4)}`,
              '├─ Integration Architecture:',
              ...integrationResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'plan-deployment':
          const architecture = args.join(' ') || 'application architecture';
          addOutput(`├─ Planning deployment for: ${architecture}`);
          const deploymentResult = await planDeployment(architecture);
          if (deploymentResult) {
            addOutput([
              '├─ Deployment Plan Complete:',
              `├─ Tokens Used: ${deploymentResult.tokens_used}`,
              `├─ Cost: $${deploymentResult.cost.toFixed(4)}`,
              '├─ Deployment Strategy:',
              ...deploymentResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'assess-scalability':
          const scalabilityComponent = args.join(' ') || 'system components';
          addOutput(`├─ Assessing scalability of: ${scalabilityComponent}`);
          const scalabilityResult = await assessScalability(scalabilityComponent);
          if (scalabilityResult) {
            addOutput([
              '├─ Scalability Assessment Complete:',
              `├─ Tokens Used: ${scalabilityResult.tokens_used}`,
              `├─ Cost: $${scalabilityResult.cost.toFixed(4)}`,
              '├─ Scalability Analysis:',
              ...scalabilityResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'review-performance':
          const perfSystem = args.join(' ') || 'system architecture';
          addOutput(`├─ Reviewing performance of: ${perfSystem}`);
          const performanceResult = await reviewPerformance(perfSystem);
          if (performanceResult) {
            addOutput([
              '├─ Performance Review Complete:',
              `├─ Tokens Used: ${performanceResult.tokens_used}`,
              `├─ Cost: $${performanceResult.cost.toFixed(4)}`,
              '├─ Performance Analysis:',
              ...performanceResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'audit-security':
          const secArch = args.join(' ') || 'security architecture';
          addOutput(`├─ Auditing security of: ${secArch}`);
          const securityResult = await auditSecurity(secArch);
          if (securityResult) {
            addOutput([
              '├─ Security Audit Complete:',
              `├─ Tokens Used: ${securityResult.tokens_used}`,
              `├─ Cost: $${securityResult.cost.toFixed(4)}`,
              '├─ Security Analysis:',
              ...securityResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;

        case 'clear':
          setOutput([
            '╭─ Solutions Architect Agent CLI v1.0.0',
            '├─ System Design & Architecture Specialist', 
            '└─ Terminal cleared. Ready for new commands...',
            ''
          ]);
          break;

        default:
          // Handle as general chat message
          const chatResult = await sendMessage(cmd);
          if (chatResult) {
            addOutput([
              '├─ Solutions Architect Response:',
              `├─ Tokens Used: ${chatResult.tokens_used}`,
              `├─ Cost: $${chatResult.cost.toFixed(4)}`,
              '├─ Response:',
              ...chatResult.response.split('\n').map(line => `│  ${line}`)
            ]);
          }
          break;
      }
    } catch (error) {
      addOutput(`├─ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    addOutput('└─ Command completed');
    addOutput('');
    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      executeCommand(command);
      setCommand('');
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output.join('\n'));
  };

  const downloadOutput = () => {
    const blob = new Blob([output.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solutions-architect-session-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-[600px] flex flex-col font-mono text-sm">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              Solutions Architect CLI
            </span>
            <Badge variant="outline" className="ml-2">
              Architecture Terminal
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyOutput}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={downloadOutput}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Terminal Output */}
        <div 
          ref={outputRef}
          className="flex-1 bg-black/90 text-green-400 p-4 rounded-lg overflow-y-auto font-mono text-sm leading-relaxed"
          style={{ minHeight: '400px' }}
        >
          {output.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2">
              <span>├─ Processing</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Command Input */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 bg-black/90 text-green-400 p-3 rounded-lg font-mono">
            <Terminal className="w-4 h-4" />
            <span className="text-blue-400">solutions-architect@codexi:</span>
            <span className="text-yellow-400">~$</span>
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              className="flex-1 bg-transparent outline-none text-green-400 placeholder-green-600"
              placeholder="Enter architecture command... (type 'help' for commands)"
              autoFocus
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Available: analyze-architecture, design-system, evaluate-technology, create-adr, design-api, plan-migration
          </div>
        </div>
      </CardContent>
    </Card>  
  );
};

export default SolutionsArchitectCLI;
