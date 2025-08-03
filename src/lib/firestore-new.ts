import { geminiAI } from './firebase';
import type { QuestionUpload } from '../types/questions';
import { buildQuestionGenerationPrompt, buildQuestionRegenerationPrompt } from '../prompts/utils/prompt-builder';
import { PROMPT_CONFIG, FALLBACK_CONFIG } from '../prompts/config/prompt-config';

// Enhanced question generation with new prompt management system
export async function generateQuestionsWithAI(
  topic: string,
  count: number = 10,
  strategy: 'primary' | 'simplified' | 'minimal' | 'legacy' = 'primary'
): Promise<QuestionUpload[]> {
  let currentStrategy = strategy;
  let attempts = 0;
  const maxAttempts = PROMPT_CONFIG.retryAttempts;

  while (attempts < maxAttempts) {
    try {
      console.log(`🤖 Generating questions with strategy: ${currentStrategy} (attempt ${attempts + 1}/${maxAttempts})`);
      
      // Build prompt using the new prompt management system
      const builtPrompt = buildQuestionGenerationPrompt(topic, count, currentStrategy);
      
      console.log(`📝 Built prompt (${builtPrompt.tokenCount} tokens):`, builtPrompt.content.substring(0, 200) + '...');
      
      if (builtPrompt.metadata.warnings.length > 0) {
        console.warn('⚠️ Prompt warnings:', builtPrompt.metadata.warnings);
      }

      // Generate content with AI
      const response = await geminiAI.generateContent(builtPrompt.content);
      const content = response.text;
      
      if (!content) {
        throw new Error('No content generated from AI');
      }

      console.log('🤖 Raw AI Response:', content);
      console.log('📝 Response preview:', content.substring(0, 200) + '...');

      // Clean and parse the JSON response
      const questions = parseAIResponse(content);
      
      // Validate the generated questions
      const validation = validateGeneratedQuestions(questions, topic);
      if (validation.isValid) {
        console.log('✅ Questions generated successfully');
        return questions;
      } else {
        console.warn('⚠️ Question validation failed:', validation.errors);
        throw new Error(`Question validation failed: ${validation.errors.join(', ')}`);
      }

    } catch (error) {
      console.error(`❌ Error with strategy ${currentStrategy}:`, error);
      attempts++;
      
      // Try next fallback strategy
      if (attempts < maxAttempts) {
        currentStrategy = getNextFallbackStrategy(currentStrategy);
        console.log(`🔄 Switching to fallback strategy: ${currentStrategy}`);
      } else {
        throw new Error(`Failed to generate questions after ${maxAttempts} attempts with all strategies`);
      }
    }
  }

  throw new Error('Failed to generate questions with AI');
}

// Enhanced single question regeneration with new prompt management system
export async function generateSingleQuestionWithFeedback(
  topic: string,
  feedback: string,
  existingQuestions: QuestionUpload[],
  questionIndex: number,
  targetDate: string,
  strategy: 'primary' | 'simplified' | 'minimal' | 'legacy' = 'primary'
): Promise<QuestionUpload> {
  let currentStrategy = strategy;
  let attempts = 0;
  const maxAttempts = PROMPT_CONFIG.retryAttempts;

  while (attempts < maxAttempts) {
    try {
      console.log(`🤖 Regenerating question with strategy: ${currentStrategy} (attempt ${attempts + 1}/${maxAttempts})`);
      
      // Get existing question texts for context
      const existingQuestionTexts = existingQuestions.map(q => q.question);
      
      // Build regeneration prompt using the new prompt management system
      const builtPrompt = buildQuestionRegenerationPrompt(
        topic,
        feedback,
        questionIndex,
        existingQuestionTexts,
        currentStrategy
      );
      
      console.log(`📝 Built regeneration prompt (${builtPrompt.tokenCount} tokens):`, builtPrompt.content.substring(0, 200) + '...');
      
      if (builtPrompt.metadata.warnings.length > 0) {
        console.warn('⚠️ Prompt warnings:', builtPrompt.metadata.warnings);
      }

      // Generate content with AI
      const response = await geminiAI.generateContent(builtPrompt.content);
      const content = response.text;
      
      if (!content) {
        throw new Error('No content generated from AI');
      }

      console.log('🤖 Raw AI Response for regeneration:', content);
      console.log('📝 Response preview:', content.substring(0, 200) + '...');

      // Clean and parse the JSON response
      const questions = parseAIResponse(content);
      
      if (questions.length === 0) {
        throw new Error('No questions generated from AI response');
      }
      
      // Return the first (and should be only) question
      const regeneratedQuestion = questions[0];
      
      // Validate the regenerated question
      const validation = validateSingleQuestion(regeneratedQuestion, topic, existingQuestions);
      if (validation.isValid) {
        console.log('✅ Question regenerated successfully');
        return regeneratedQuestion;
      } else {
        console.warn('⚠️ Regenerated question validation failed:', validation.errors);
        throw new Error(`Question validation failed: ${validation.errors.join(', ')}`);
      }

    } catch (error) {
      console.error(`❌ Error regenerating question with strategy ${currentStrategy}:`, error);
      attempts++;
      
      // Try next fallback strategy
      if (attempts < maxAttempts) {
        currentStrategy = getNextFallbackStrategy(currentStrategy);
        console.log(`🔄 Switching to fallback strategy: ${currentStrategy}`);
      } else {
        throw new Error(`Failed to regenerate question after ${maxAttempts} attempts with all strategies`);
      }
    }
  }

  throw new Error('Failed to regenerate question with AI');
}

// Helper function to get next fallback strategy
function getNextFallbackStrategy(currentStrategy: 'primary' | 'simplified' | 'minimal' | 'legacy'): 'primary' | 'simplified' | 'minimal' | 'legacy' {
  const strategies: ('primary' | 'simplified' | 'minimal' | 'legacy')[] = ['primary', 'simplified', 'minimal', 'legacy'];
  const currentIndex = strategies.indexOf(currentStrategy);
  const nextIndex = Math.min(currentIndex + 1, strategies.length - 1);
  return strategies[nextIndex];
}

// Parse AI response and clean JSON
function parseAIResponse(content: string): QuestionUpload[] {
  // Clean the JSON response by removing markdown code blocks
  let cleanedContent = content.trim();
  
  // Remove ```json and ``` markers if present
  if (cleanedContent.startsWith('```json')) {
    cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedContent.startsWith('```')) {
    cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  console.log('🧹 Cleaned JSON for parsing:', cleanedContent.substring(0, 200) + '...');

  // Parse the JSON response
  try {
    const questions = JSON.parse(cleanedContent) as QuestionUpload[];
    
    // Ensure it's an array
    if (!Array.isArray(questions)) {
      throw new Error('AI response is not an array');
    }
    
    return questions;
  } catch (error) {
    console.error('❌ JSON parsing error:', error);
    throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Validate generated questions
function validateGeneratedQuestions(questions: QuestionUpload[], topic: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(questions)) {
    errors.push('Questions must be an array');
    return { isValid: false, errors };
  }
  
  if (questions.length === 0) {
    errors.push('No questions generated');
    return { isValid: false, errors };
  }
  
  // Validate each question
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const questionErrors = validateQuestionStructure(question, i);
    errors.push(...questionErrors.map(error => `Question ${i + 1}: ${error}`));
  }
  
  // Check for duplicate answers
  const answers = questions.map(q => q.answer);
  const uniqueAnswers = new Set(answers);
  if (uniqueAnswers.size !== answers.length) {
    errors.push('Duplicate answers found across questions');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate single question
function validateSingleQuestion(
  question: QuestionUpload, 
  topic: string, 
  existingQuestions: QuestionUpload[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate question structure
  const structureErrors = validateQuestionStructure(question, 0);
  errors.push(...structureErrors);
  
  // Check for duplicate with existing questions
  const existingAnswers = existingQuestions.map(q => q.answer);
  if (existingAnswers.includes(question.answer)) {
    errors.push('Answer already exists in other questions');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate individual question structure
function validateQuestionStructure(question: any, index: number): string[] {
  const errors: string[] = [];
  
  // Check required fields
  if (!question.question || typeof question.question !== 'string') {
    errors.push('Missing or invalid question field');
  }
  
  if (!Array.isArray(question.choices) || question.choices.length < 2) {
    errors.push('Missing or invalid choices array (must have at least 2 choices)');
  }
  
  if (!question.answer || typeof question.answer !== 'string') {
    errors.push('Missing or invalid answer field');
  }
  
  if (!Array.isArray(question.tags) || question.tags.length < 1) {
    errors.push('Missing or invalid tags array (must have at least 1 tag)');
  }
  
  // Check if answer is in choices
  if (question.choices && question.answer) {
    if (!question.choices.includes(question.answer)) {
      errors.push('Answer must be one of the choices');
    }
    
    // Check if answer is first choice (as required by our format)
    if (question.choices[0] !== question.answer) {
      errors.push('Answer must be the first choice in the choices array');
    }
  }
  
  // Check question format (Jeopardy! style)
  if (question.question) {
    const questionText = question.question.toLowerCase();
    if (questionText.includes('what') || questionText.includes('who') || questionText.includes('where') || 
        questionText.includes('when') || questionText.includes('why') || questionText.includes('how')) {
      errors.push('Question should be a statement, not a question (no question words)');
    }
    
    if (questionText.endsWith('?')) {
      errors.push('Question should end with a period, not a question mark');
    }
  }
  
  return errors;
}

// Legacy function for backward compatibility
export async function generateQuestionsWithAILegacy(
  topic: string,
  count: number = 10
): Promise<QuestionUpload[]> {
  console.warn('⚠️ Using legacy question generation function. Consider migrating to the new prompt management system.');
  return generateQuestionsWithAI(topic, count, 'legacy');
}

// Legacy function for backward compatibility
export async function generateSingleQuestionWithFeedbackLegacy(
  topic: string,
  feedback: string,
  existingQuestions: QuestionUpload[],
  questionIndex: number,
  targetDate: string
): Promise<QuestionUpload> {
  console.warn('⚠️ Using legacy question regeneration function. Consider migrating to the new prompt management system.');
  return generateSingleQuestionWithFeedback(topic, feedback, existingQuestions, questionIndex, targetDate, 'legacy');
}

export {
  generateQuestionsWithAI,
  generateSingleQuestionWithFeedback,
  generateQuestionsWithAILegacy,
  generateSingleQuestionWithFeedbackLegacy
}; 