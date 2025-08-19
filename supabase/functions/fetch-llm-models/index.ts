
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { provider, apiKey } = await req.json()

    let models: string[] = []
    let apiUrl = ''
    let headers: Record<string, string> = {}

    switch (provider) {
      case 'openai':
        apiUrl = 'https://api.openai.com/v1/models'
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        break

      case 'anthropic':
        // Anthropic doesn't have a public models endpoint, so we return known models
        models = [
          'claude-3-5-sonnet-20241022',
          'claude-3-5-haiku-20241022',
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307'
        ]
        break

      case 'deepseek':
        apiUrl = 'https://api.deepseek.com/v1/models'
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        break

      case 'xai':
        apiUrl = 'https://api.x.ai/v1/models'
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        break

      case 'gemini':
        apiUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        headers = { 'Content-Type': 'application/json' }
        break

      case 'cohere':
        apiUrl = 'https://api.cohere.ai/v1/models'
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        break

      case 'mistral':
        apiUrl = 'https://api.mistral.ai/v1/models'
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        break

      default:
        throw new Error('Unsupported provider')
    }

    if (apiUrl) {
      const response = await fetch(apiUrl, { headers })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Parse models based on provider response format
      if (provider === 'openai' || provider === 'deepseek' || provider === 'xai') {
        models = data.data?.map((model: any) => model.id) || []
      } else if (provider === 'gemini') {
        models = data.models?.map((model: any) => model.name.replace('models/', '')) || []
      } else if (provider === 'cohere') {
        models = data.models?.map((model: any) => model.name) || []
      } else if (provider === 'mistral') {
        models = data.data?.map((model: any) => model.id) || []
      }
    }

    return new Response(
      JSON.stringify({ models }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error fetching models:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
