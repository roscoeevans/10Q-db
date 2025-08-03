import type { 
  PromptTemplate, 
  PromptBuilderConfig, 
  BuiltPrompt, 
  BuiltPromptMetadata,
  PromptBuilderOptions 
} from '../types/prompt-types';
import { FORMATTING_RULES_TEMPLATE, SIMPLIFIED_FORMATTING_RULES, MINIMAL_FORMATTING_RULES } from '../templates/shared/formatting-rules';
import { DIFFICULTY_SCALING_TEMPLATE, SIMPLIFIED_DIFFICULTY_SCALING } from '../templates/shared/difficulty-scaling';
import { ANSWER_DIVERSITY_TEMPLATE, SIMPLIFIED_ANSWER_DIVERSITY } from '../templates/shared/answer-diversity';
import { FACTUAL_ACCURACY_TEMPLATE, SIMPLIFIED_FACTUAL_ACCURACY } from '../templates/shared/factual-accuracy';
import { getDifficultyDescription } from '../templates/shared/difficulty-scaling';

// Simple token estimation (rough approximation)
function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Variable substitution with validation
function substituteVariables(template: string, variables: Record<string, any>): { content: string; warnings: string[] } {
  let content = template;
  const warnings: string[] = [];
  
  // Replace variables in the format {variable_name}
  const variableRegex = /\{([^}]+)\}/g;
  
  content = content.replace(variableRegex, (match, variableName) => {
    if (variables.hasOwnProperty(variableName)) {
      const value = variables[variableName];
      return String(value);
    } else {
      warnings.push(`Variable '${variableName}' not provided, keeping placeholder`);
      return match;
    }
  });
  
  return { content, warnings };
}

// Get appropriate shared template based on strategy
function getSharedTemplate(templateType: 'formatting' | 'difficulty' | 'diversity' | 'accuracy', strategy: 'primary' | 'simplified' | 'minimal' | 'legacy'): string {
  switch (templateType) {
    case 'formatting':
      switch (strategy) {
        case 'primary':
          return FORMATTING_RULES_TEMPLATE.content;
        case 'simplified':
          return SIMPLIFIED_FORMATTING_RULES.content;
        case 'minimal':
          return MINIMAL_FORMATTING_RULES.content;
        case 'legacy':
          return FORMATTING_RULES_TEMPLATE.content; // Use full formatting for legacy
        default:
          return FORMATTING_RULES_TEMPLATE.content;
      }
    case 'difficulty':
      switch (strategy) {
        case 'primary':
          return DIFFICULTY_SCALING_TEMPLATE.content;
        case 'simplified':
          return SIMPLIFIED_DIFFICULTY_SCALING.content;
        case 'minimal':
          return 'Start with easy questions and gradually increase difficulty.';
        case 'legacy':
          return DIFFICULTY_SCALING_TEMPLATE.content;
        default:
          return DIFFICULTY_SCALING_TEMPLATE.content;
      }
    case 'diversity':
      switch (strategy) {
        case 'primary':
          return ANSWER_DIVERSITY_TEMPLATE.content;
        case 'simplified':
          return SIMPLIFIED_ANSWER_DIVERSITY.content;
        case 'minimal':
          return 'Each question must have a unique answer.';
        case 'legacy':
          return ANSWER_DIVERSITY_TEMPLATE.content;
        default:
          return ANSWER_DIVERSITY_TEMPLATE.content;
      }
    case 'accuracy':
      switch (strategy) {
        case 'primary':
          return FACTUAL_ACCURACY_TEMPLATE.content;
        case 'simplified':
          return SIMPLIFIED_FACTUAL_ACCURACY.content;
        case 'minimal':
          return 'Use only well-established, accurate facts.';
        case 'legacy':
          return FACTUAL_ACCURACY_TEMPLATE.content;
        default:
          return FACTUAL_ACCURACY_TEMPLATE.content;
      }
  }
}

// Build a complete prompt from template and variables
export function buildPrompt(config: PromptBuilderConfig): BuiltPrompt {
  const { template, variables, context, options } = config;
  const strategy = context?.strategy || 'primary';
  const warnings: string[] = [];
  
  // Start with the base template content
  let content = template.content;
  
  // Inject shared templates based on strategy
  if (content.includes('{formatting_rules}')) {
    const formattingRules = getSharedTemplate('formatting', strategy);
    content = content.replace('{formatting_rules}', formattingRules);
  }
  
  if (content.includes('{difficulty_scaling}')) {
    let difficultyScaling = getSharedTemplate('difficulty', strategy);
    
    // Replace topic variable in difficulty scaling if present
    if (variables.topic && difficultyScaling.includes('{topic}')) {
      difficultyScaling = difficultyScaling.replace('{topic}', variables.topic);
    }
    
    content = content.replace('{difficulty_scaling}', difficultyScaling);
  }
  
  if (content.includes('{answer_diversity}')) {
    const answerDiversity = getSharedTemplate('diversity', strategy);
    content = content.replace('{answer_diversity}', answerDiversity);
  }
  
  if (content.includes('{factual_accuracy}')) {
    const factualAccuracy = getSharedTemplate('accuracy', strategy);
    content = content.replace('{factual_accuracy}', factualAccuracy);
  }
  
  // Handle special variables
  if (variables.questionIndex && content.includes('{difficulty_description}')) {
    const difficultyDesc = getDifficultyDescription(variables.questionIndex);
    content = content.replace('{difficulty_description}', difficultyDesc);
  }
  
  // Substitute all other variables
  const substitution = substituteVariables(content, variables);
  content = substitution.content;
  warnings.push(...substitution.warnings);
  
  // Apply strategy-specific modifications
  if (strategy === 'simplified' || strategy === 'minimal') {
    // Remove examples and detailed explanations for simplified prompts
    content = content.replace(/✅.*?examples.*?❌.*?examples/gs, '');
    content = content.replace(/🎯.*?examples.*?⚠️/gs, '⚠️');
  }
  
  // Estimate token count
  const tokenCount = estimateTokenCount(content);
  
  // Validate token count
  const maxTokens = template.constraints.find(c => c.type === 'token_limit')?.value || 4000;
  if (tokenCount > maxTokens * 0.9) {
    warnings.push(`Token count (${tokenCount}) is approaching limit (${maxTokens})`);
  }
  
  // Validate required variables
  const missingVariables = template.variables
    .filter(v => v.required && !variables.hasOwnProperty(v.name))
    .map(v => v.name);
  
  if (missingVariables.length > 0) {
    warnings.push(`Missing required variables: ${missingVariables.join(', ')}`);
  }
  
  // Build metadata
  const metadata: BuiltPromptMetadata = {
    templateId: template.id,
    templateVersion: template.version,
    buildTimestamp: new Date(),
    validationPassed: warnings.length === 0,
    warnings
  };
  
  return {
    content,
    tokenCount,
    variables,
    metadata
  };
}

// Build question generation prompt with context
export function buildQuestionGenerationPrompt(
  topic: string,
  count: number = 10,
  strategy: 'primary' | 'simplified' | 'minimal' | 'legacy' = 'primary',
  options?: Partial<PromptBuilderOptions>
): BuiltPrompt {
  // Import the base template dynamically to avoid circular dependencies
  const { getBaseTemplate } = require('../templates/question-generation/base');
  const template = getBaseTemplate(strategy);
  
  const variables = {
    topic,
    count,
    __version__: '1.0.0',
    __timestamp__: new Date().toISOString()
  };
  
  const context = { strategy };
  
  return buildPrompt({
    template,
    variables,
    context,
    options: {
      includeExamples: strategy !== 'minimal',
      includeConstraints: strategy === 'primary',
      optimizeForTokens: strategy !== 'primary',
      validateOutput: true,
      ...options
    }
  });
}

// Build question regeneration prompt
export function buildQuestionRegenerationPrompt(
  topic: string,
  feedback: string,
  questionIndex: number,
  existingQuestions: string[],
  strategy: 'primary' | 'simplified' | 'minimal' | 'legacy' = 'primary'
): BuiltPrompt {
  // For now, we'll create a simple regeneration prompt
  // This can be enhanced with a dedicated regeneration template
  const template: PromptTemplate = {
    id: 'question-regeneration-v1.0.0',
    name: 'Question Regeneration',
    version: '1.0.0',
    description: 'Template for regenerating questions based on feedback',
    content: `Given the theme: "{topic}", I need to regenerate question {questionIndex} (difficulty level {questionIndex}/10) because of this feedback: "{feedback}"

{difficulty_description}

{formatting_rules}

{answer_diversity}

Here are some other questions from the same quiz for context (to avoid duplicates):
{existing_questions}

⚠️ CRITICAL: Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text.

Output in JSON format with this exact structure:
{
  "question": "This city on the Seine is the capital of France.",
  "choices": ["Paris", "London", "Berlin", "Madrid"],
  "answer": "Paris",
  "tags": ["Geography", "Europe", "Capitals"]
}`,
    variables: [
      {
        name: 'topic',
        type: 'string',
        required: true,
        description: 'The theme or topic'
      },
      {
        name: 'feedback',
        type: 'string',
        required: true,
        description: 'User feedback for regeneration'
      },
      {
        name: 'questionIndex',
        type: 'number',
        required: true,
        description: 'Index of the question to regenerate'
      },
      {
        name: 'difficulty_description',
        type: 'string',
        required: false,
        description: 'Difficulty description for this question'
      },
      {
        name: 'formatting_rules',
        type: 'string',
        required: false,
        description: 'Formatting rules content'
      },
      {
        name: 'answer_diversity',
        type: 'string',
        required: false,
        description: 'Answer diversity content'
      },
      {
        name: 'existing_questions',
        type: 'string',
        required: false,
        description: 'List of existing questions for context'
      }
    ],
    constraints: [
      {
        type: 'token_limit',
        value: 3000,
        description: 'Token limit for regeneration prompt'
      },
      {
        type: 'format',
        value: 'json_output',
        description: 'Must output valid JSON object'
      }
    ],
    metadata: {
      author: '10Q Database Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tags: ['regeneration', 'feedback'],
      category: 'question-regeneration',
      difficulty: 'medium'
    }
  };
  
  const variables = {
    topic,
    feedback,
    questionIndex,
    difficulty_description: getDifficultyDescription(questionIndex),
    existing_questions: existingQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n'),
    __version__: '1.0.0',
    __timestamp__: new Date().toISOString()
  };
  
  const context = { strategy };
  
  return buildPrompt({
    template,
    variables,
    context,
    options: {
      includeExamples: strategy !== 'minimal',
      includeConstraints: strategy === 'primary',
      optimizeForTokens: strategy !== 'primary',
      validateOutput: true
    }
  });
}

// Utility function to validate prompt before building
export function validatePromptConfig(config: PromptBuilderConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if template exists
  if (!config.template) {
    errors.push('Template is required');
  }
  
  // Check required variables
  if (config.template) {
    const missingVariables = config.template.variables
      .filter(v => v.required && !config.variables.hasOwnProperty(v.name))
      .map(v => v.name);
    
    if (missingVariables.length > 0) {
      errors.push(`Missing required variables: ${missingVariables.join(', ')}`);
    }
  }
  
  // Check variable types
  if (config.template && config.variables) {
    for (const [name, value] of Object.entries(config.variables)) {
      const variableDef = config.template.variables.find(v => v.name === name);
      if (variableDef) {
        // Basic type checking
        const expectedType = variableDef.type;
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        if (expectedType !== actualType && expectedType !== 'object') {
          errors.push(`Variable '${name}' expected type '${expectedType}' but got '${actualType}'`);
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export {
  buildPrompt,
  buildQuestionGenerationPrompt,
  buildQuestionRegenerationPrompt,
  validatePromptConfig
}; 