import type { PromptTemplate } from '../../types/prompt-types';
import { FORMATTING_RULES_TEMPLATE } from '../shared/formatting-rules';
import { DIFFICULTY_SCALING_TEMPLATE } from '../shared/difficulty-scaling';
import { ANSWER_DIVERSITY_TEMPLATE } from '../shared/answer-diversity';
import { FACTUAL_ACCURACY_TEMPLATE } from '../shared/factual-accuracy';
import { ENGAGEMENT_FUN_TEMPLATE } from '../shared/engagement-fun';
import { ZEITGEIST_CULTURE_TEMPLATE } from '../shared/zeitgeist-culture';

// Base template for question generation
export const QUESTION_GENERATION_BASE_TEMPLATE: PromptTemplate = {
  id: 'question-generation-base-v1.0.0',
  name: 'Question Generation Base',
  version: '1.0.0',
  description: 'Base template for generating Jeopardy!-style questions with progressive difficulty',
  content: `Given the theme: "{topic}", generate {count} JEOPARDY!-STYLE clues with PROGRESSIVE DIFFICULTY. Each clue must have exactly 3 tags, ordered from broad to specific.

{formatting_rules}

{difficulty_scaling}

{answer_diversity}

{factual_accuracy}

{engagement_fun}

{zeitgeist_culture}

🏷️ Tag Hierarchy Principle:
- First tag: Very general category (History, Science, Pop Culture, Sports, etc.)
- Second tag: Sub-topic within the first (American History, Physics, TV Shows, Basketball, etc.)
- Third tag: Narrow detail or specific angle (Presidential Elections, Newtonian Mechanics, Sitcoms from the 90s, NBA Records, etc.)

⚠️ IMPORTANT: Return ONLY the JSON array, no markdown formatting, no code blocks, no additional text.

Output in JSON format with this exact structure (note: correct answer is ALWAYS first choice):
[
  {
    "question": "This city on the Seine is the capital of France.",
    "choices": ["Paris", "London", "Berlin", "Madrid"],
    "answer": "Paris",
    "tags": ["Geography", "Europe", "Capitals"]
  }
]`,
  variables: [
    {
      name: 'topic',
      type: 'string',
      required: true,
      description: 'The theme or topic for question generation'
    },
    {
      name: 'count',
      type: 'number',
      required: true,
      defaultValue: 10,
      description: 'Number of questions to generate'
    },
    {
      name: 'formatting_rules',
      type: 'string',
      required: false,
      description: 'Formatting rules content (injected from template)'
    },
    {
      name: 'difficulty_scaling',
      type: 'string',
      required: false,
      description: 'Difficulty scaling content (injected from template)'
    },
    {
      name: 'answer_diversity',
      type: 'string',
      required: false,
      description: 'Answer diversity content (injected from template)'
    },
    {
      name: 'factual_accuracy',
      type: 'string',
      required: false,
      description: 'Factual accuracy content (injected from template)'
    },
    {
      name: 'engagement_fun',
      type: 'string',
      required: false,
      description: 'Engagement and fun content (injected from template)'
    },
    {
      name: 'zeitgeist_culture',
      type: 'string',
      required: false,
      description: 'Zeitgeist and culture content (injected from template)'
    }
  ],
  constraints: [
    {
      type: 'token_limit',
      value: 4000,
      description: 'Maximum token limit for the prompt'
    },
    {
      type: 'format',
      value: 'json_output',
      description: 'Must output valid JSON array'
    },
    {
      type: 'content',
      value: 'jeopardy_style',
      description: 'Must follow Jeopardy! format'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['question-generation', 'base', 'jeopardy'],
    category: 'question-generation',
    difficulty: 'medium'
  }
};

// Simplified base template for fallback scenarios
export const SIMPLIFIED_QUESTION_GENERATION_BASE: PromptTemplate = {
  id: 'simplified-question-generation-base-v1.0.0',
  name: 'Simplified Question Generation Base',
  version: '1.0.0',
  description: 'Simplified base template for question generation fallback',
  content: `Generate {count} Jeopardy!-style questions about "{topic}".

{formatting_rules}

{difficulty_scaling}

{answer_diversity}

Return JSON array with this structure:
[
  {
    "question": "This city on the Seine is the capital of France.",
    "choices": ["Paris", "London", "Berlin", "Madrid"],
    "answer": "Paris",
    "tags": ["Geography", "Europe", "Capitals"]
  }
]`,
  variables: [
    {
      name: 'topic',
      type: 'string',
      required: true,
      description: 'The theme or topic for question generation'
    },
    {
      name: 'count',
      type: 'number',
      required: true,
      defaultValue: 10,
      description: 'Number of questions to generate'
    },
    {
      name: 'formatting_rules',
      type: 'string',
      required: false,
      description: 'Simplified formatting rules'
    },
    {
      name: 'difficulty_scaling',
      type: 'string',
      required: false,
      description: 'Simplified difficulty scaling'
    },
    {
      name: 'answer_diversity',
      type: 'string',
      required: false,
      description: 'Simplified answer diversity'
    }
  ],
  constraints: [
    {
      type: 'token_limit',
      value: 2000,
      description: 'Reduced token limit for simplified prompt'
    },
    {
      type: 'format',
      value: 'json_output',
      description: 'Must output valid JSON array'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['question-generation', 'simplified', 'fallback'],
    category: 'question-generation',
    difficulty: 'easy'
  }
};

// Minimal base template for emergency fallback
export const MINIMAL_QUESTION_GENERATION_BASE: PromptTemplate = {
  id: 'minimal-question-generation-base-v1.0.0',
  name: 'Minimal Question Generation Base',
  version: '1.0.0',
  description: 'Minimal base template for emergency fallback',
  content: `Generate {count} questions about "{topic}".

{formatting_rules}

Return JSON:
[
  {
    "question": "This city on the Seine is the capital of France.",
    "choices": ["Paris", "London", "Berlin", "Madrid"],
    "answer": "Paris",
    "tags": ["Geography", "Europe", "Capitals"]
  }
]`,
  variables: [
    {
      name: 'topic',
      type: 'string',
      required: true,
      description: 'The theme or topic for question generation'
    },
    {
      name: 'count',
      type: 'number',
      required: true,
      defaultValue: 10,
      description: 'Number of questions to generate'
    },
    {
      name: 'formatting_rules',
      type: 'string',
      required: false,
      description: 'Minimal formatting rules'
    }
  ],
  constraints: [
    {
      type: 'token_limit',
      value: 1000,
      description: 'Minimal token limit for emergency prompt'
    },
    {
      type: 'format',
      value: 'json_output',
      description: 'Must output valid JSON array'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['question-generation', 'minimal', 'emergency'],
    category: 'question-generation',
    difficulty: 'easy'
  }
};

// Function to get the appropriate base template based on fallback strategy
export function getBaseTemplate(strategy: 'primary' | 'simplified' | 'minimal' | 'legacy'): PromptTemplate {
  switch (strategy) {
    case 'primary':
      return QUESTION_GENERATION_BASE_TEMPLATE;
    case 'simplified':
      return SIMPLIFIED_QUESTION_GENERATION_BASE;
    case 'minimal':
      return MINIMAL_QUESTION_GENERATION_BASE;
    case 'legacy':
      // Return the original hardcoded prompt structure
      return {
        id: 'legacy-question-generation-v1.0.0',
        name: 'Legacy Question Generation',
        version: '1.0.0',
        description: 'Original hardcoded prompt for legacy fallback',
        content: `Given the theme: "{topic}", generate {count} JEOPARDY!-STYLE clues with PROGRESSIVE DIFFICULTY. Each clue must have exactly 3 tags, ordered from broad to specific:

🎯 JEOPARDY! STYLE REQUIREMENTS (CRITICAL):
- Write CLUES, not questions - contestants respond with questions
- Start with factual statements, end with periods (never question marks)
- Use "This [person/place/thing]..." format for specificity
- Keep clues brief and punchy (10-20 words max)
- Include context hints, dates, or wordplay when possible
- Tone should be academic but playful, trivia-forward but not dry
- NEVER include the answer directly in the clue text
- Provide context clues that lead to the answer, but don't state it

📈 DIFFICULTY PROGRESSION (CRITICAL):
- Question 1: EASY - General knowledge that most people would know
- Question 2-3: BEGINNER - Basic facts that casual fans might know  
- Question 4-6: INTERMEDIATE - Requires some knowledge of the topic
- Question 7-8: ADVANCED - For people well-versed in the subject
- Question 9: EXPERT - Very challenging, specialist knowledge
- Question 10: MASTER - Only true experts/enthusiasts would know this

⚠️ IMPORTANT: Return ONLY the JSON array, no markdown formatting, no code blocks, no additional text.

Output in JSON format with this exact structure (note: correct answer is ALWAYS first choice):
[
  {
    "question": "This city on the Seine is the capital of France.",
    "choices": ["Paris", "London", "Berlin", "Madrid"],
    "answer": "Paris",
    "tags": ["Geography", "Europe", "Capitals"]
  }
]`,
        variables: [
          {
            name: 'topic',
            type: 'string',
            required: true,
            description: 'The theme or topic for question generation'
          },
          {
            name: 'count',
            type: 'number',
            required: true,
            defaultValue: 10,
            description: 'Number of questions to generate'
          }
        ],
        constraints: [
          {
            type: 'token_limit',
            value: 4000,
            description: 'Original token limit'
          },
          {
            type: 'format',
            value: 'json_output',
            description: 'Must output valid JSON array'
          }
        ],
        metadata: {
          author: '10Q Database Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          tags: ['question-generation', 'legacy', 'fallback'],
          category: 'question-generation',
          difficulty: 'medium'
        }
      };
    default:
      return QUESTION_GENERATION_BASE_TEMPLATE;
  }
}

export {
  QUESTION_GENERATION_BASE_TEMPLATE,
  SIMPLIFIED_QUESTION_GENERATION_BASE,
  MINIMAL_QUESTION_GENERATION_BASE,
  getBaseTemplate
}; 