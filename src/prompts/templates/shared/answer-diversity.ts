import type { PromptTemplate } from '../../types/prompt-types';

// Answer diversity template to ensure unique answers
export const ANSWER_DIVERSITY_TEMPLATE: PromptTemplate = {
  id: 'answer-diversity-v1.0.0',
  name: 'Answer Diversity',
  version: '1.0.0',
  description: 'Requirements for ensuring answer diversity and uniqueness',
  content: `🎯 ANSWER DIVERSITY REQUIREMENTS (CRITICAL):

✅ DIVERSITY REQUIREMENTS:
- Each of the 10 questions must have a UNIQUE answer - no duplicates allowed
- Avoid using the same person, place, thing, or concept as an answer more than once
- Ensure answers cover different aspects, time periods, or categories within the topic
- Each answer should be distinct and not easily confused with others

❌ EXAMPLES OF WHAT TO AVOID:
- Multiple questions about the same person (e.g., 2+ questions about Steve Jobs)
- Multiple questions about the same event (e.g., 2+ questions about the Moon landing)
- Multiple questions about the same place (e.g., 2+ questions about Paris)
- Multiple questions about the same object (e.g., 2+ questions about the iPhone)
- Multiple questions about the same concept (e.g., 2+ questions about gravity)

✅ EXAMPLES OF GOOD ANSWER DIVERSITY:
- Different people: Steve Jobs, Bill Gates, Elon Musk, Mark Zuckerberg
- Different events: Moon landing, Berlin Wall fall, 9/11, COVID pandemic
- Different places: Paris, London, Tokyo, New York
- Different objects: iPhone, Tesla Model S, PlayStation, Hubble Telescope
- Different concepts: Gravity, Evolution, Democracy, Capitalism

🎯 DIVERSITY STRATEGIES:
- Cover different time periods (past, present, future)
- Include different categories (people, places, events, objects, concepts)
- Vary the scope (local, national, international, universal)
- Mix different types of knowledge (factual, conceptual, historical, technical)
- Ensure geographical diversity when applicable
- Include different industries or fields when relevant

⚠️ DIVERSITY VALIDATION:
- Before finalizing, check that all answers are unique
- Ensure no semantic overlap between answers
- Verify that answers cover different aspects of the topic
- Confirm that answers are at appropriate difficulty levels
- Validate that wrong answers are plausible and diverse`,
  variables: [],
  constraints: [
    {
      type: 'content',
      value: 'unique_answers',
      description: 'All answers must be unique across the question set'
    },
    {
      type: 'content',
      value: 'diverse_coverage',
      description: 'Answers should cover different aspects of the topic'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['diversity', 'uniqueness', 'answers'],
    category: 'shared',
    difficulty: 'medium'
  }
};

// Simplified answer diversity for fallback scenarios
export const SIMPLIFIED_ANSWER_DIVERSITY: PromptTemplate = {
  id: 'simplified-answer-diversity-v1.0.0',
  name: 'Simplified Answer Diversity',
  version: '1.0.0',
  description: 'Simplified answer diversity requirements for fallback scenarios',
  content: `🎯 ANSWER DIVERSITY:
- Each question must have a unique answer
- Don't repeat the same person, place, or thing
- Cover different aspects of the topic
- Make sure answers are distinct from each other`,
  variables: [],
  constraints: [
    {
      type: 'content',
      value: 'basic_uniqueness',
      description: 'Basic answer uniqueness requirements'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['diversity', 'simplified', 'fallback'],
    category: 'shared',
    difficulty: 'easy'
  }
};

// Answer diversity validation functions
export interface AnswerDiversityCheck {
  isUnique: boolean;
  conflicts: string[];
  suggestions: string[];
  diversityScore: number;
}

// Function to check answer diversity
export function checkAnswerDiversity(answers: string[]): AnswerDiversityCheck {
  const conflicts: string[] = [];
  const suggestions: string[] = [];
  let diversityScore = 1.0;

  // Check for exact duplicates
  const uniqueAnswers = new Set(answers);
  if (uniqueAnswers.size !== answers.length) {
    conflicts.push('Duplicate answers found');
    diversityScore -= 0.3;
  }

  // Check for semantic similarity (basic check)
  const normalizedAnswers = answers.map(answer => 
    answer.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  );

  for (let i = 0; i < normalizedAnswers.length; i++) {
    for (let j = i + 1; j < normalizedAnswers.length; j++) {
      const similarity = calculateSimilarity(normalizedAnswers[i], normalizedAnswers[j]);
      if (similarity > 0.8) {
        conflicts.push(`Similar answers: "${answers[i]}" and "${answers[j]}"`);
        diversityScore -= 0.1;
      }
    }
  }

  // Generate suggestions for improvement
  if (diversityScore < 0.8) {
    suggestions.push('Consider using answers from different categories (people, places, events, objects)');
    suggestions.push('Include answers from different time periods');
    suggestions.push('Vary the scope (local, national, international)');
  }

  return {
    isUnique: conflicts.length === 0,
    conflicts,
    suggestions,
    diversityScore: Math.max(0, diversityScore)
  };
}

// Simple similarity calculation (can be enhanced with more sophisticated algorithms)
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
}

// Function to suggest diverse answer categories
export function getAnswerCategories(): string[] {
  return [
    'People',
    'Places',
    'Events',
    'Objects',
    'Concepts',
    'Organizations',
    'Technologies',
    'Artworks',
    'Scientific Discoveries',
    'Historical Periods'
  ];
}

// Function to validate answer diversity for a specific topic
export function validateTopicDiversity(topic: string, answers: string[]): AnswerDiversityCheck {
  const baseCheck = checkAnswerDiversity(answers);
  
  // Add topic-specific validation
  if (topic.toLowerCase().includes('history')) {
    // For history topics, ensure time period diversity
    const timePeriods = answers.filter(answer => 
      /\d{4}|\b(century|era|period|age)\b/i.test(answer)
    );
    if (timePeriods.length < 3) {
      baseCheck.suggestions.push('Consider including answers from different time periods for historical topics');
    }
  }
  
  if (topic.toLowerCase().includes('geography')) {
    // For geography topics, ensure geographical diversity
    const continents = ['asia', 'europe', 'africa', 'north america', 'south america', 'australia', 'antarctica'];
    const continentMatches = answers.filter(answer => 
      continents.some(continent => answer.toLowerCase().includes(continent))
    );
    if (continentMatches.length < 3) {
      baseCheck.suggestions.push('Consider including answers from different continents for geography topics');
    }
  }
  
  return baseCheck;
}

export {
  ANSWER_DIVERSITY_TEMPLATE,
  SIMPLIFIED_ANSWER_DIVERSITY,
  checkAnswerDiversity,
  getAnswerCategories,
  validateTopicDiversity
}; 