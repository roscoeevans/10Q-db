import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

// OpenAI integration for question generation
export const openaiAI = {
  generateContent: async (prompt: string) => {
    try {
      console.log('🤖 Generating with OpenAI GPT-4...');
      console.log('Prompt length:', prompt.length, 'characters');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating Jeopardy!-style trivia questions. Always respond with valid JSON arrays containing question objects with the exact structure specified in the user's prompt. Never include markdown formatting or code blocks - return only the JSON array."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });
      
      const text = completion.choices[0].message.content;
      
      if (!text) {
        throw new Error('No content generated from OpenAI');
      }
      
      console.log('✅ OpenAI GPT-4 response received');
      console.log('Response length:', text.length, 'characters');
      console.log('Tokens used:', completion.usage?.total_tokens);
      
      return { text };
    } catch (error) {
      console.error('❌ OpenAI Error:', error);
      
      // Provide helpful error messages specific to OpenAI
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('authentication')) {
          throw new Error(
            'OpenAI API key issue. Please:\n' +
            '1. Check your .env.local file has VITE_OPENAI_API_KEY\n' +
            '2. Verify the API key is valid\n' +
            '3. Ensure you have sufficient credits'
          );
        }
        if (error.message.includes('quota') || error.message.includes('limit')) {
          throw new Error('OpenAI API quota exceeded. Please check your usage and billing.');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('OpenAI rate limit exceeded. Please wait a moment and try again.');
        }
        if (error.message.includes('model')) {
          throw new Error('OpenAI model error. Please check if GPT-4 is available in your account.');
        }
      }
      
      throw new Error('Failed to generate content with OpenAI. Please check your setup and try again.');
    }
  }
};

export default openaiAI; 