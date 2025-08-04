// Simple Prompt Management System - Main Export File

// Simple prompt functions
export { 
  QUESTION_GENERATION_PROMPT,
  QUESTION_REGENERATION_PROMPT,
  buildSimpleQuestionPrompt,
  buildSimpleRegenerationPrompt
} from './config/prompt-config';

// Simple wrapper functions for common use cases
export function createQuestionGenerationPrompt(topic: string, count: number = 10): string {
  const { buildSimpleQuestionPrompt } = require('./config/prompt-config');
  return buildSimpleQuestionPrompt(topic, count);
}

export function createQuestionRegenerationPrompt(
  topic: string,
  feedback: string,
  questionIndex: number,
  existingQuestions: string[]
): string {
  const { buildSimpleRegenerationPrompt } = require('./config/prompt-config');
  return buildSimpleRegenerationPrompt(topic, feedback, questionIndex, existingQuestions);
}

// Version information
export const PROMPT_SYSTEM_VERSION = '2.0.0';
export const PROMPT_SYSTEM_DESCRIPTION = 'Simplified, hard-coded prompt system for 10Q Database';

// System health check
export function getPromptSystemHealth() {
  return {
    version: PROMPT_SYSTEM_VERSION,
    status: 'healthy',
    description: 'Simplified prompt system',
    timestamp: new Date().toISOString()
  };
} 