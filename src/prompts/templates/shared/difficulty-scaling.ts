import type { PromptTemplate } from '../../types/prompt-types';

// Difficulty scaling template for progressive question difficulty
export const DIFFICULTY_SCALING_TEMPLATE: PromptTemplate = {
  id: 'difficulty-scaling-v1.0.0',
  name: 'Difficulty Scaling',
  version: '1.0.0',
  description: 'Progressive difficulty guidelines for question generation',
  content: `📈 DIFFICULTY PROGRESSION (CRITICAL):

🎯 DIFFICULTY LEVELS:
- Question 1: EASY - General knowledge that most people would know
- Question 2-3: BEGINNER - Basic facts that casual fans might know  
- Question 4-6: INTERMEDIATE - Requires some knowledge of the topic
- Question 7-8: ADVANCED - For people well-versed in the subject
- Question 9: EXPERT - Very challenging, specialist knowledge
- Question 10: MASTER - Only true experts/enthusiasts would know this

💡 DIFFICULTY SCALING TIPS:
- EASY clues: Mainstream knowledge, famous facts, widely known information
- INTERMEDIATE clues: Specific details, dates, lesser-known but not obscure facts
- EXPERT clues: Deep trivia, technical details, historical minutiae, insider knowledge
- All wrong answers should be plausible for the difficulty level

🎯 DIFFICULTY EXAMPLES for "{topic}":
- Easy (Q1): "This city on the Seine is the capital of France." → What is Paris?
- Intermediate (Q5): "This Norse god wields a hammer named Mjolnir." → Who is Thor?
- Expert (Q10): "This 1969 comic issue introduced Bucky Barnes as the Winter Soldier." → What is Captain America #110?

⚠️ DIFFICULTY REQUIREMENTS:
- DIFFICULTY MUST SCALE: Start easy, end expert
- Each question should be progressively more challenging
- Wrong answers should match the difficulty level
- Avoid sudden difficulty spikes or drops
- Maintain consistency within the topic area`,
  variables: [
    {
      name: 'topic',
      type: 'string',
      required: true,
      description: 'The topic for which to generate difficulty examples'
    }
  ],
  constraints: [
    {
      type: 'format',
      value: 'progressive_difficulty',
      description: 'Must follow progressive difficulty scaling'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['difficulty', 'scaling', 'progression'],
    category: 'shared',
    difficulty: 'medium'
  }
};

// Simplified difficulty scaling for fallback scenarios
export const SIMPLIFIED_DIFFICULTY_SCALING: PromptTemplate = {
  id: 'simplified-difficulty-scaling-v1.0.0',
  name: 'Simplified Difficulty Scaling',
  version: '1.0.0',
  description: 'Simplified difficulty scaling for fallback scenarios',
  content: `📈 DIFFICULTY LEVELS:
- Questions 1-3: EASY - General knowledge
- Questions 4-7: MEDIUM - Some topic knowledge needed
- Questions 8-10: HARD - Expert knowledge required

Start with easy questions and gradually increase difficulty.`,
  variables: [],
  constraints: [
    {
      type: 'format',
      value: 'basic_difficulty',
      description: 'Basic difficulty progression'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['difficulty', 'simplified', 'fallback'],
    category: 'shared',
    difficulty: 'easy'
  }
};

// Difficulty mapping for specific question indices
export const DIFFICULTY_MAPPING = {
  1: { level: 'EASY', description: 'General knowledge that most people would know' },
  2: { level: 'BEGINNER', description: 'Basic facts that casual fans might know' },
  3: { level: 'BEGINNER', description: 'Basic facts that casual fans might know' },
  4: { level: 'INTERMEDIATE', description: 'Requires some knowledge of the topic' },
  5: { level: 'INTERMEDIATE', description: 'Requires some knowledge of the topic' },
  6: { level: 'INTERMEDIATE', description: 'Requires some knowledge of the topic' },
  7: { level: 'ADVANCED', description: 'For people well-versed in the subject' },
  8: { level: 'ADVANCED', description: 'For people well-versed in the subject' },
  9: { level: 'EXPERT', description: 'Very challenging, specialist knowledge' },
  10: { level: 'MASTER', description: 'Only true experts/enthusiasts would know this' }
} as const;

// Function to get difficulty description for a specific question index
export function getDifficultyDescription(questionIndex: number): string {
  const mapping = DIFFICULTY_MAPPING[questionIndex as keyof typeof DIFFICULTY_MAPPING];
  if (!mapping) {
    return 'MEDIUM - Requires some knowledge of the topic';
  }
  return `${mapping.level} - ${mapping.description}`;
}

// Function to get difficulty level for a specific question index
export function getDifficultyLevel(questionIndex: number): string {
  const mapping = DIFFICULTY_MAPPING[questionIndex as keyof typeof DIFFICULTY_MAPPING];
  return mapping?.level || 'MEDIUM';
}

export {
  DIFFICULTY_SCALING_TEMPLATE,
  SIMPLIFIED_DIFFICULTY_SCALING,
  DIFFICULTY_MAPPING,
  getDifficultyDescription,
  getDifficultyLevel
}; 