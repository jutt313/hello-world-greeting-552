
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TerminalCommand {
  command: string;
  args: string[];
  projectId: string;
  sessionId: string;
  cwd?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    socket.onopen = () => {
      console.log("WebSocket connection opened for terminal session");
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const { command, args, projectId, sessionId, cwd } = data as TerminalCommand;
        
        console.log(`Executing real command: ${command} ${args.join(' ')}`);
        
        // Create user session directory
        const sessionDir = `/tmp/codexi-session-${sessionId}`;
        await Deno.mkdir(sessionDir, { recursive: true });
        
        // Execute REAL command using Deno subprocess
        const cmd = new Deno.Command(command, {
          args: args,
          cwd: cwd || sessionDir,
          stdout: "piped",
          stderr: "piped",
          env: {
            "PATH": "/usr/local/bin:/usr/bin:/bin",
            "HOME": sessionDir,
            "USER": "codexi"
          }
        });

        const process = cmd.spawn();
        const output = await process.output();
        
        const stdout = new TextDecoder().decode(output.stdout);
        const stderr = new TextDecoder().decode(output.stderr);
        const success = output.success;
        
        // Log real command execution to database
        await supabaseClient
          .from('agent_activity_logs')
          .insert({
            agent_id: '11111111-1111-1111-1111-111111111111', // Terminal agent
            project_id: projectId,
            activity_type: 'command_execution',
            details: {
              command: `${command} ${args.join(' ')}`,
              exit_code: output.code,
              success: success,
              stdout: stdout.substring(0, 1000), // Limit log size
              stderr: stderr.substring(0, 1000),
              session_id: sessionId
            }
          });

        // Send REAL command result back to client
        socket.send(JSON.stringify({
          type: 'command_result',
          command: `${command} ${args.join(' ')}`,
          stdout: stdout,
          stderr: stderr,
          exit_code: output.code,
          success: success,
          cwd: cwd || sessionDir
        }));

      } catch (error) {
        console.error('Terminal command error:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return response;
  }

  // Handle regular HTTP requests for file operations
  try {
    const { action, projectId, sessionId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (action === 'get_session_files') {
      const sessionDir = `/tmp/codexi-session-${sessionId}`;
      
      try {
        const files = [];
        for await (const dirEntry of Deno.readDir(sessionDir)) {
          files.push({
            name: dirEntry.name,
            isFile: dirEntry.isFile,
            isDirectory: dirEntry.isDirectory
          });
        }
        
        return new Response(JSON.stringify({ files }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ files: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Terminal session error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
