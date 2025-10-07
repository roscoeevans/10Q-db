/**
 * Unified AI Service
 * Supports both OpenAI GPT-4o and Gemini models
 * Defaults to GPT-4o for better factual accuracy
 */

import { openaiAI } from './openai';
import { geminiAI } from '../firebase';

export type AIModel = 'gpt-5' | 'gpt-4o' | 'gemini-2.0-flash-thinking-exp' | 'gemini-1.5-pro';

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
  private defaultModel: AIModel = 'gpt-5';

  constructor() {
    // Check if OpenAI API key is available
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!openaiKey) {
      console.warn('⚠️ OpenAI API key not found, falling back to Gemini');
      this.defaultModel = 'gemini-2.0-flash-thinking-exp';
    }
  }

  async generateContent(
    prompt: string,
    model: AIModel = this.defaultModel
  ): Promise<AIResponse> {
    
    try {
      switch (model) {
        case 'gpt-5':
          const gpt5Response = await openaiAI.generateContent(prompt, 'gpt-5');
          return {
            text: gpt5Response.text,
            model: 'gpt-5',
            usage: gpt5Response.usage
          };
          
        case 'gpt-4o':
          const openaiResponse = await openaiAI.generateContent(prompt, 'gpt-4o');
          return {
            text: openaiResponse.text,
            model: 'gpt-4o',
            usage: openaiResponse.usage
          };
          
        case 'gemini-2.0-flash-thinking-exp':
        case 'gemini-1.5-pro':
          const geminiResponse = await geminiAI.generateContent(prompt);
          return {
            text: geminiResponse.text,
            model: model as 'gemini-2.0-flash-thinking-exp' | 'gemini-1.5-pro'
          };
          
        default:
          throw new Error(`Unsupported AI model: ${model}`);
      }
    } catch (error) {
      console.error(`❌ Error with ${model}:`, error);
      
      // Fallback logic for OpenAI models
      if ((model === 'gpt-5' || model === 'gpt-4o') && this.defaultModel !== 'gemini-2.0-flash-thinking-exp') {
        return this.generateContent(prompt, 'gemini-2.0-flash-thinking-exp');
      }
      
      throw error;
    }
  }

  // Get available models based on API keys
  getAvailableModels(): AIModel[] {
    const models: AIModel[] = [];
    
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      models.push('gpt-5');
      models.push('gpt-4o');
    }
    
    // Gemini is always available through Firebase
    models.push('gemini-2.0-flash-thinking-exp');
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
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export individual AI clients for direct access
export { openaiAI } from './openai';
export { geminiAI } from '../firebase'; 