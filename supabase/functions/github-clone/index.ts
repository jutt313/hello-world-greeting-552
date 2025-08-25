
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CloneRequest {
  repositoryUrl: string;
  projectId: string;
  sessionId: string;
  branch?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { repositoryUrl, projectId, sessionId, branch = 'main' }: CloneRequest = await req.json()
    
    console.log(`Real GitHub clone: ${repositoryUrl}`)
    
    // Extract repository name from URL
    const repoName = repositoryUrl.split('/').pop()?.replace('.git', '') || 'repository'
    const sessionDir = `/tmp/codexi-session-${sessionId}`
    const repoDir = `${sessionDir}/${repoName}`
    
    // Create session directory
    await Deno.mkdir(sessionDir, { recursive: true })
    
    // Update repository sync status to cloning
    await supabaseClient
      .from('repository_sync')
      .upsert({
        project_id: projectId,
        sync_status: 'cloning',
        branch_name: branch,
        created_at: new Date().toISOString()
      })

    // Execute REAL git clone command
    const cloneCmd = new Deno.Command('git', {
      args: ['clone', '--depth=1', '-b', branch, repositoryUrl, repoDir],
      stdout: 'piped',
      stderr: 'piped',
      cwd: sessionDir
    })

    const cloneProcess = cloneCmd.spawn()
    const cloneOutput = await cloneProcess.output()
    
    const stdout = new TextDecoder().decode(cloneOutput.stdout)
    const stderr = new TextDecoder().decode(cloneOutput.stderr)
    
    if (!cloneOutput.success) {
      // Update sync status to failed
      await supabaseClient
        .from('repository_sync')
        .update({
          sync_status: 'failed',
          error_message: stderr,
          last_sync_at: new Date().toISOString()
        })
        .eq('project_id', projectId)

      throw new Error(`Git clone failed: ${stderr}`)
    }

    console.log(`Successfully cloned ${repositoryUrl}`)

    // Read REAL files from cloned repository
    const files = await readDirectoryRecursively(repoDir)
    
    // Store REAL files in agent_file_operations table
    for (const file of files) {
      try {
        const content = await Deno.readTextFile(file.fullPath)
        
        await supabaseClient
          .from('agent_file_operations')
          .insert({
            agent_id: '11111111-1111-1111-1111-111111111111', // GitHub clone agent
            project_id: projectId,
            operation_type: 'create',
            file_path: file.relativePath,
            file_content_after: content,
            operation_status: 'completed',
            programming_language: detectLanguage(file.relativePath),
            framework: 'Git Repository',
            completed_at: new Date().toISOString()
          })
      } catch (error) {
        console.error(`Error reading file ${file.relativePath}:`, error)
      }
    }

    // Update sync status to completed
    await supabaseClient
      .from('repository_sync')
      .update({
        sync_status: 'completed',
        last_sync_at: new Date().toISOString(),
        last_commit_hash: await getLastCommitHash(repoDir)
      })
      .eq('project_id', projectId)

    // Update project with repository info
    await supabaseClient
      .from('projects')
      .update({
        repository_url: repositoryUrl,
        local_path: repoDir,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    return new Response(JSON.stringify({
      success: true,
      repository: {
        name: repoName,
        url: repositoryUrl,
        branch: branch,
        localPath: repoDir,
        filesCount: files.length
      },
      files: files.map(f => f.relativePath),
      cloneOutput: stdout
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('GitHub clone error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function readDirectoryRecursively(dirPath: string, basePath: string = dirPath): Promise<Array<{relativePath: string, fullPath: string}>> {
  const files: Array<{relativePath: string, fullPath: string}> = []
  
  try {
    for await (const dirEntry of Deno.readDir(dirPath)) {
      const fullPath = `${dirPath}/${dirEntry.name}`
      const relativePath = fullPath.replace(basePath + '/', '')
      
      // Skip .git directory and other hidden files
      if (dirEntry.name.startsWith('.')) continue
      
      if (dirEntry.isFile) {
        files.push({ relativePath, fullPath })
      } else if (dirEntry.isDirectory) {
        const subFiles = await readDirectoryRecursively(fullPath, basePath)
        files.push(...subFiles)
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
  }
  
  return files
}

function detectLanguage(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase()
  const languageMap: { [key: string]: string } = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'jsx': 'JavaScript',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'dart': 'Dart',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'md': 'Markdown',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML'
  }
  
  return languageMap[extension || ''] || 'Text'
}

async function getLastCommitHash(repoDir: string): Promise<string> {
  try {
    const cmd = new Deno.Command('git', {
      args: ['rev-parse', 'HEAD'],
      cwd: repoDir,
      stdout: 'piped'
    })
    
    const output = await cmd.output()
    return new TextDecoder().decode(output.stdout).trim()
  } catch (error) {
    console.error('Error getting commit hash:', error)
    return ''
  }
}
