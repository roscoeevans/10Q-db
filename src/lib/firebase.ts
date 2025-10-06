// Re-export from new firebase config structure
export * from './firebase/config';

// Import AI dependencies
import { getAI, getGenerativeModel } from 'firebase/ai';
import { app } from './firebase/config';

// Real Gemini AI integration
// Firebase AI Logic - uses Firebase's managed Gemini API integration
export const geminiAI = {
  generateContent: async (prompt: string) => {
    try {
      console.log('🤖 Generating with Firebase AI Logic (Gemini)...');
      console.log('Prompt:', prompt);
      
      // Initialize Firebase AI Logic service
      const ai = getAI(app);
      
      // Create a Gemini model instance (using Gemini Developer API by default)
      // Firebase manages the API keys and authentication automatically
      const model = getGenerativeModel(ai, { model: "gemini-2.0-flash-thinking-exp" });
      
      // Generate content
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log('✅ Firebase AI Logic response received');
      console.log('Response length:', text.length, 'characters');
      
      return { text };
    } catch (error) {
      console.error('❌ Firebase AI Logic Error:', error);
      
      // Provide helpful error messages specific to Firebase AI Logic
      if (error instanceof Error) {
        if (error.message.includes('not enabled') || error.message.includes('permission')) {
          throw new Error(
            'Firebase AI Logic not enabled. Please:\n' +
            '1. Go to Firebase Console → AI Logic\n' +
            '2. Enable the Gemini Developer API\n' +
            '3. Follow the setup wizard'
          );
        }
        if (error.message.includes('quota') || error.message.includes('limit')) {
          throw new Error('API quota exceeded. Please check your Firebase project quotas and usage.');
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error connecting to Firebase AI Logic. Please check your internet connection.');
        }
        if (error.message.includes('billing')) {
          throw new Error('Billing issue. Please ensure your Firebase project has proper billing setup if required.');
        }
      }
      
      throw new Error('Failed to generate content with Firebase AI Logic. Please check your setup and try again.');
    }
  }
};

export default app; 