
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

    // Parse request body
    const { token } = await req.json();

    if (!token) {
      throw new Error('Missing CLI token');
    }

    console.log('Verifying CLI token');

    // Verify the CLI token
    const { data: tokenData, error: tokenError } = await supabase
      .from('cli_tokens')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      console.error('Invalid or expired CLI token:', tokenError);
      throw new Error('Invalid or expired CLI token');
    }

    // Get user data
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(tokenData.user_id);

    if (userError || !userData.user) {
      console.error('User not found:', userError);
      throw new Error('User not found');
    }

    // Update token last used timestamp
    await supabase
      .from('cli_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token', token);

    console.log('CLI token verified successfully for user:', tokenData.user_id);

    return new Response(
      JSON.stringify({ 
        user: userData.user,
        session: tokenData.session_data,
        message: 'CLI token verified successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('CLI token verification error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to verify CLI authentication token'
      }),
      { 
        status: 401,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
