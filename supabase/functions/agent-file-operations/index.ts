
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FileOperationRequest {
  action: 'create_file' | 'update_file' | 'delete_file' | 'read_file' | 'create_project_structure';
  projectId: string;
  agentId: string;
  filePath: string;
  fileContent?: string;
  programmingLanguage?: string;
  framework?: string;
  templateType?: string;
}

interface ProjectStructure {
  [key: string]: string | ProjectStructure;
}

const generateProjectStructure = (templateType: string, programmingLanguage: string, framework: string): ProjectStructure => {
  const structures: { [key: string]: ProjectStructure } = {
    'react-typescript': {
      'package.json': JSON.stringify({
        name: 'my-app',
        version: '1.0.0',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          typescript: '^5.0.0',
          vite: '^4.4.0',
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0'
        }
      }, null, 2),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }]
      }, null, 2),
      'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
      'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      src: {
        'main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        'App.tsx': `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>My React TypeScript App</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </div>
    </>
  )
}

export default App`,
        'App.css': `.App {
  text-align: center;
}

.card {
  padding: 2em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}`,
        'index.css': `body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}`
      }
    },
    'react-native-ios': {
      'package.json': JSON.stringify({
        name: 'MyApp',
        version: '0.0.1',
        scripts: {
          android: 'react-native run-android',
          ios: 'react-native run-ios',
          start: 'react-native start',
          test: 'jest',
          lint: 'eslint .'
        },
        dependencies: {
          'react': '^18.2.0',
          'react-native': '^0.72.0'
        },
        devDependencies: {
          '@babel/core': '^7.20.0',
          '@babel/preset-env': '^7.20.0',
          '@babel/runtime': '^7.20.0',
          'metro-react-native-babel-preset': '^0.76.0'
        }
      }, null, 2),
      'App.tsx': `import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

function App(): JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to React Native!</Text>
        <Text style={styles.subtitle}>iOS App Created by CodeXI</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default App;`,
      'index.js': `import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);`,
      'app.json': JSON.stringify({
        name: 'MyApp',
        displayName: 'My App'
      }, null, 2)
    },
    'node-express': {
      'package.json': JSON.stringify({
        name: 'my-api',
        version: '1.0.0',
        main: 'dist/server.js',
        scripts: {
          build: 'tsc',
          start: 'node dist/server.js',
          dev: 'ts-node-dev --respawn --transpile-only src/server.ts',
          test: 'jest'
        },
        dependencies: {
          express: '^4.18.0',
          cors: '^2.8.5',
          helmet: '^7.0.0'
        },
        devDependencies: {
          typescript: '^5.0.0',
          '@types/express': '^4.17.0',
          '@types/cors': '^2.8.0',
          'ts-node-dev': '^2.0.0'
        }
      }, null, 2),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          lib: ['ES2020'],
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist']
      }, null, 2),
      src: {
        'server.ts': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API Server is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});`,
        routes: {
          'index.ts': `import { Router } from 'express';

const router = Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

export default router;`
        }
      }
    }
  };

  return structures[`${framework.toLowerCase()}-${programmingLanguage.toLowerCase()}`] || structures['react-typescript'];
};

const flattenStructure = (structure: ProjectStructure, basePath = ''): Array<{path: string, content: string}> => {
  const files: Array<{path: string, content: string}> = [];
  
  for (const [key, value] of Object.entries(structure)) {
    const fullPath = basePath ? `${basePath}/${key}` : key;
    
    if (typeof value === 'string') {
      files.push({ path: fullPath, content: value });
    } else {
      files.push(...flattenStructure(value, fullPath));
    }
  }
  
  return files;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, projectId, agentId, filePath, fileContent, programmingLanguage = 'TypeScript', framework = 'React', templateType }: FileOperationRequest = await req.json()

    console.log(`File Operation - Action: ${action}, Project: ${projectId}, Agent: ${agentId}`)

    switch (action) {
      case 'create_project_structure': {
        if (!templateType) throw new Error('Template type is required for project structure creation')
        
        const structure = generateProjectStructure(templateType, programmingLanguage, framework);
        const files = flattenStructure(structure);
        
        const operations = [];
        
        for (const file of files) {
          const { data: operation, error } = await supabaseClient
            .from('agent_file_operations')
            .insert({
              agent_id: agentId,
              project_id: projectId,
              operation_type: 'create',
              file_path: file.path,
              file_content_after: file.content,
              operation_status: 'completed',
              programming_language: programmingLanguage,
              framework: framework,
              completed_at: new Date().toISOString()
            })
            .select()
            .single()

          if (error) throw error
          operations.push(operation)
        }

        console.log(`Created project structure: ${files.length} files for ${templateType}`)

        return new Response(JSON.stringify({ 
          success: true, 
          operations,
          filesCreated: files.length,
          structure: templateType
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'create_file': {
        const { data: operation, error } = await supabaseClient
          .from('agent_file_operations')
          .insert({
            agent_id: agentId,
            project_id: projectId,
            operation_type: 'create',
            file_path: filePath,
            file_content_after: fileContent,
            operation_status: 'completed',
            programming_language: programmingLanguage,
            framework: framework,
            completed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        console.log(`File created: ${filePath} by agent ${agentId}`)

        return new Response(JSON.stringify({ success: true, operation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'update_file': {
        // Get existing file content
        const { data: existingFile } = await supabaseClient
          .from('agent_file_operations')
          .select('file_content_after')
          .eq('project_id', projectId)
          .eq('file_path', filePath)
          .eq('operation_status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const { data: operation, error } = await supabaseClient
          .from('agent_file_operations')
          .insert({
            agent_id: agentId,
            project_id: projectId,
            operation_type: 'update',
            file_path: filePath,
            file_content_before: existingFile?.file_content_after || '',
            file_content_after: fileContent,
            operation_status: 'completed',
            programming_language: programmingLanguage,
            framework: framework,
            completed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        console.log(`File updated: ${filePath} by agent ${agentId}`)

        return new Response(JSON.stringify({ success: true, operation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'read_file': {
        const { data: fileOperation, error } = await supabaseClient
          .from('agent_file_operations')
          .select('file_content_after, programming_language, framework')
          .eq('project_id', projectId)
          .eq('file_path', filePath)
          .eq('operation_status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (!fileOperation) {
          return new Response(JSON.stringify({ success: true, fileExists: false }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify({ 
          success: true, 
          fileExists: true,
          content: fileOperation.file_content_after,
          programmingLanguage: fileOperation.programming_language,
          framework: fileOperation.framework
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'delete_file': {
        const { data: operation, error } = await supabaseClient
          .from('agent_file_operations')
          .insert({
            agent_id: agentId,
            project_id: projectId,
            operation_type: 'delete',
            file_path: filePath,
            operation_status: 'completed',
            completed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        console.log(`File deleted: ${filePath} by agent ${agentId}`)

        return new Response(JSON.stringify({ success: true, operation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('File Operations Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
