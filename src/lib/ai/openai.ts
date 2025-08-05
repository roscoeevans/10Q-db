/**
 * OpenAI GPT-4o Integration
 * Provides better factual accuracy compared to Gemini 1.5 Flash
 */

interface OpenAIResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const openaiAI = {
  generateContent: async (prompt: string): Promise<OpenAIResponse> => {
    try {
      console.log('🤖 Generating with OpenAI GPT-4o...');
      console.log('📝 Prompt length:', prompt.length, 'characters');
      
      // Try multiple ways to get the API key
      let apiKey = null;
      
      // Try Vite environment (browser context)
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      }
      
      // Try Node.js environment
      if (!apiKey && typeof process !== 'undefined' && process.env) {
        apiKey = process.env.VITE_OPENAI_API_KEY;
      }
      
      if (!apiKey) {
        throw new Error(
          'OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env.local file.\n' +
          'Get your API key from: https://platform.openai.com/api-keys'
        );
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert quiz question generator with exceptional factual accuracy. Always provide only verified, widely accepted facts. When in doubt, choose the most conservative, well-established fact.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ OpenAI API Error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY.');
        } else if (response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          throw new Error('OpenAI API quota exceeded. Please check your billing and usage at https://platform.openai.com/usage');
        } else if (response.status === 500) {
          throw new Error('OpenAI API server error. Please try again.');
        } else {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content;
      
      if (!text) {
        throw new Error('No content received from OpenAI API');
      }

      console.log('✅ OpenAI GPT-4o response received');
      console.log('📝 Response length:', text.length, 'characters');
      console.log('💰 Token usage:', data.usage);

      return {
        text,
        usage: data.usage
      };
      
    } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error(
            'OpenAI API key issue. Please:\n' +
            '1. Get your API key from https://platform.openai.com/api-keys\n' +
            '2. Add VITE_OPENAI_API_KEY to your .env.local file\n' +
            '3. Restart your development server'
          );
        }
        if (error.message.includes('rate limit')) {
          throw new Error('OpenAI API rate limit exceeded. Please wait a moment and try again.');
        }
        if (error.message.includes('network')) {
          throw new Error('Network error connecting to OpenAI API. Please check your internet connection.');
        }
      }
      
      throw new Error('Failed to generate content with OpenAI. Please check your setup and try again.');
    }
  }
}; 