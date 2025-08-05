/**
 * Unified AI Service
 * Supports both OpenAI GPT-4o and Gemini models
 * Defaults to GPT-4o for better factual accuracy
 */

import { openaiAI } from './openai';
import { geminiAI } from '../firebase';

export type AIModel = 'gpt-4o' | 'gemini-1.5-flash' | 'gemini-1.5-pro';

export interface AIResponse {
  text: string;
  model: AIModel;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

class AIService {
  private defaultModel: AIModel = 'gpt-4o';

  constructor() {
    // Check if OpenAI API key is available
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!openaiKey) {
      console.warn('⚠️ OpenAI API key not found, falling back to Gemini');
      this.defaultModel = 'gemini-1.5-flash';
    }
  }

  async generateContent(
    prompt: string, 
    model: AIModel = this.defaultModel
  ): Promise<AIResponse> {
    console.log(`🤖 Using AI model: ${model}`);
    
    try {
      switch (model) {
        case 'gpt-4o':
          const openaiResponse = await openaiAI.generateContent(prompt);
          return {
            text: openaiResponse.text,
            model: 'gpt-4o',
            usage: openaiResponse.usage
          };
          
        case 'gemini-1.5-flash':
        case 'gemini-1.5-pro':
          const geminiResponse = await geminiAI.generateContent(prompt);
          return {
            text: geminiResponse.text,
            model: model as 'gemini-1.5-flash' | 'gemini-1.5-pro'
          };
          
        default:
          throw new Error(`Unsupported AI model: ${model}`);
      }
    } catch (error) {
      console.error(`❌ Error with ${model}:`, error);
      
      // Fallback to Gemini if OpenAI fails
      if (model === 'gpt-4o' && this.defaultModel !== 'gemini-1.5-flash') {
        console.log('🔄 Falling back to Gemini due to OpenAI error');
        return this.generateContent(prompt, 'gemini-1.5-flash');
      }
      
      throw error;
    }
  }

  // Get available models based on API keys
  getAvailableModels(): AIModel[] {
    const models: AIModel[] = [];
    
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      models.push('gpt-4o');
    }
    
    // Gemini is always available through Firebase
    models.push('gemini-1.5-flash');
    models.push('gemini-1.5-pro');
    
    return models;
  }

  // Get the default model
  getDefaultModel(): AIModel {
    return this.defaultModel;
  }

  // Set the default model
  setDefaultModel(model: AIModel) {
    this.defaultModel = model;
    console.log(`🎯 Default AI model set to: ${model}`);
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export individual AI clients for direct access
export { openaiAI } from './openai';
export { geminiAI } from '../firebase'; 