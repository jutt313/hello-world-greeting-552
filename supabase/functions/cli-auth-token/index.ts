
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Parse request body
    const { userId, session } = await req.json();

    if (!userId || !session) {
      throw new Error('Missing required parameters: userId and session');
    }

    console.log('Generating CLI token for user:', userId);

    // Generate a unique CLI token
    const cliToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Token expires in 30 days

    // Store the CLI token in the database
    const { error: insertError } = await supabase
      .from('cli_tokens')
      .insert({
        token: cliToken,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
        session_data: session,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error storing CLI token:', insertError);
      throw new Error('Failed to store CLI token');
    }

    console.log('CLI token generated successfully for user:', userId);

    return new Response(
      JSON.stringify({ 
        token: cliToken,
        expiresAt: expiresAt.toISOString(),
        message: 'CLI token generated successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('CLI token generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to generate CLI authentication token'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
