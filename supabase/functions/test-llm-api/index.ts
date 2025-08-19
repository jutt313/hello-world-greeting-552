
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
    const { provider, apiKey, message } = await req.json()

    let apiUrl = ''
    let headers: Record<string, string> = {}
    let body: any = {}

    switch (provider) {
      case 'openai':
        apiUrl = 'https://api.openai.com/v1/chat/completions'
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        body = {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          max_tokens: 50
        }
        break

      case 'anthropic':
        apiUrl = 'https://api.anthropic.com/v1/messages'
        headers = { 
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
        body = {
          model: 'claude-3-haiku-20240307',
          max_tokens: 50,
          messages: [{ role: 'user', content: message }]
        }
        break

      case 'deepseek':
        apiUrl = 'https://api.deepseek.com/v1/chat/completions'
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        body = {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: message }],
          max_tokens: 50
        }
        break

      case 'xai':
        apiUrl = 'https://api.x.ai/v1/chat/completions'
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        body = {
          model: 'grok-beta',
          messages: [{ role: 'user', content: message }],
          max_tokens: 50
        }
        break

      case 'gemini':
        apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`
        headers = { 'Content-Type': 'application/json' }
        body = {
          contents: [{ parts: [{ text: message }] }]
        }
        break

      case 'cohere':
        apiUrl = 'https://api.cohere.ai/v1/generate'
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        body = {
          model: 'command',
          prompt: message,
          max_tokens: 50
        }
        break

      case 'mistral':
        apiUrl = 'https://api.mistral.ai/v1/chat/completions'
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        body = {
          model: 'mistral-tiny',
          messages: [{ role: 'user', content: message }],
          max_tokens: 50
        }
        break

      default:
        throw new Error('Unsupported provider')
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    // Extract response based on provider format
    let responseText = ''
    if (provider === 'openai' || provider === 'deepseek' || provider === 'xai' || provider === 'mistral') {
      responseText = data.choices?.[0]?.message?.content || 'No response'
    } else if (provider === 'anthropic') {
      responseText = data.content?.[0]?.text || 'No response'
    } else if (provider === 'gemini') {
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
    } else if (provider === 'cohere') {
      responseText = data.generations?.[0]?.text || 'No response'
    }

    return new Response(
      JSON.stringify({ response: responseText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error testing API:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
