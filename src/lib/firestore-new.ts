import { openaiAI } from './openai';
import type { GeneratedQuestion } from '../types/questions';
import { buildSimpleQuestionPrompt, buildSimpleRegenerationPrompt } from '../prompts/config/prompt-config';

// Simple question generation with hard-coded prompt
export async function generateQuestionsWithAI(
  topic: string,
  count: number = 10
): Promise<GeneratedQuestion[]> {
  try {
    console.log(`🤖 Generating ${count} questions for topic: ${topic}`);
    
    // Build simple prompt
    const prompt = buildSimpleQuestionPrompt(topic, count);
    
    console.log(`📝 Using simple prompt (${prompt.length} characters):`, prompt.substring(0, 200) + '...');

    // Generate content with AI
    const response = await openaiAI.generateContent(prompt);
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
    console.error('❌ Error generating questions:', error);
    throw new Error(`Failed to generate questions: ${error}`);
  }
}

// Simple single question regeneration
export async function generateSingleQuestionWithFeedback(
  topic: string,
  feedback: string,
  existingQuestions: GeneratedQuestion[],
  questionIndex: number,
  targetDate: string
): Promise<GeneratedQuestion> {
  try {
    console.log(`🤖 Regenerating question ${questionIndex} for topic: ${topic}`);
    
    // Get existing question texts for context
    const existingQuestionTexts = existingQuestions.map(q => q.question);
    
    // Build simple regeneration prompt
    const prompt = buildSimpleRegenerationPrompt(
      topic,
      feedback,
      questionIndex,
      existingQuestionTexts
    );
    
    console.log(`📝 Using simple regeneration prompt (${prompt.length} characters):`, prompt.substring(0, 200) + '...');

    // Generate content with AI
    const response = await openaiAI.generateContent(prompt);
    const content = response.text;
    
    if (!content) {
      throw new Error('No content generated from AI');
    }

    console.log('🤖 Raw AI Response:', content);
    console.log('📝 Response preview:', content.substring(0, 200) + '...');

    // Clean and parse the JSON response
    const questions = parseAIResponse(content);
    
    if (questions.length === 0) {
      throw new Error('No questions generated from AI response');
    }

    // Validate the regenerated question
    const validation = validateSingleQuestion(questions[0], topic, existingQuestions);
    if (validation.isValid) {
      console.log('✅ Question regenerated successfully');
      return questions[0];
    } else {
      console.warn('⚠️ Question validation failed:', validation.errors);
      throw new Error(`Question validation failed: ${validation.errors.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error regenerating question:', error);
    throw new Error(`Failed to regenerate question: ${error}`);
  }
}

// Parse AI response and clean JSON
function parseAIResponse(content: string): GeneratedQuestion[] {
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
    const questions = JSON.parse(cleanedContent) as GeneratedQuestion[];
    
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
function validateGeneratedQuestions(questions: GeneratedQuestion[], topic: string): { isValid: boolean; errors: string[] } {
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
  question: GeneratedQuestion, 
  topic: string, 
  existingQuestions: GeneratedQuestion[]
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