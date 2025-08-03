import type { PromptTemplate } from '../../types/prompt-types';

// Engagement and fun template to make questions more entertaining and well-rounded
export const ENGAGEMENT_FUN_TEMPLATE: PromptTemplate = {
  id: 'engagement-fun-v1.0.0',
  name: 'Engagement and Fun Requirements',
  version: '1.0.0',
  description: 'Requirements for making questions more fun, engaging, and well-rounded',
  content: `🎉 ENGAGEMENT & FUN REQUIREMENTS (CRITICAL):

🎯 MAKE QUESTIONS ENTERTAINING:
- Include wordplay, puns, or clever word associations when possible
- Use interesting, surprising, or "wow factor" facts
- Include cultural references, pop culture connections, or historical anecdotes
- Add humor, wit, or clever phrasing without being silly
- Make clues memorable and shareable
- Include "fun facts" that people want to tell others about

🎨 WELL-ROUNDED CONTENT:
- Mix different types of knowledge: historical, scientific, cultural, artistic, technological
- Include both serious and lighthearted topics within the theme
- Balance academic knowledge with popular culture
- Include diverse perspectives and global content
- Mix different time periods: ancient, historical, modern, contemporary
- Include different fields: arts, sciences, humanities, sports, entertainment

🧠 ENGAGING TECHNIQUES:
- Use "Did you know?" style facts that surprise people
- Include connections between seemingly unrelated topics
- Add historical context that makes facts more interesting
- Use specific, vivid details that paint a picture
- Include "behind the scenes" or "little known" information
- Add cultural significance or impact of events/people/things

🎭 ENTERTAINMENT VALUE:
- Make clues feel like mini-stories or anecdotes
- Include dramatic or memorable moments in history
- Add personality to historical figures or events
- Use vivid, descriptive language that engages the imagination
- Include "fun facts" that make people say "wow!"
- Make clues conversation starters

🌟 DIVERSITY & INCLUSION:
- Include diverse cultural perspectives and global content
- Represent different time periods and regions
- Include both mainstream and niche knowledge
- Balance different types of intelligence: factual, cultural, creative
- Include both "highbrow" and "lowbrow" culture
- Represent different fields of human achievement

🎪 FUN FACTOR EXAMPLES:
- ✅ FUN: "This 1969 event saw Neil Armstrong take one small step for man, but he actually said 'That's one small step for a man' - the 'a' was lost in transmission."
- ✅ FUN: "This element is so dense that a teaspoon of it would weigh as much as an elephant."
- ✅ FUN: "This city's name means 'City of the Dead' in Arabic, but it's actually one of the world's most vibrant living cities."
- ✅ FUN: "This artist cut off his own ear and sent it to a woman, but historians now think it was just the earlobe."

🎯 ENGAGEMENT TECHNIQUES:
- Use specific, surprising numbers or statistics
- Include "firsts" or "only" facts that make things special
- Add historical context that changes how we see things
- Include "what if" scenarios or alternate history
- Use vivid, sensory details that make facts come alive
- Include "human interest" angles on historical events

⚠️ BALANCE REQUIREMENTS:
- Keep it fun but not silly or inappropriate
- Maintain educational value while being entertaining
- Ensure facts are still accurate and verifiable
- Don't sacrifice clarity for cleverness
- Keep clues concise despite added detail
- Maintain appropriate difficulty levels

🎭 CULTURAL DEPTH:
- Include both Western and non-Western perspectives
- Mix high culture and popular culture
- Include both ancient and modern achievements
- Represent different types of human creativity
- Include both individual achievements and collective efforts
- Balance serious topics with lighter fare

🎪 MEMORABLE MOMENTS:
- Use facts that stick in people's minds
- Include "conversation starters" that people want to share
- Add historical context that makes facts more meaningful
- Include "behind the scenes" details that add depth
- Use vivid imagery that helps people remember
- Include "fun facts" that make people want to learn more

⚠️ CRITICAL: While making questions fun and engaging, NEVER sacrifice accuracy, clarity, or educational value. The goal is to make learning more enjoyable, not to entertain at the expense of knowledge.`,
  variables: [],
  constraints: [
    {
      type: 'content',
      value: 'entertaining',
      description: 'Questions should be engaging and fun'
    },
    {
      type: 'content',
      value: 'well_rounded',
      description: 'Content should be diverse and balanced'
    },
    {
      type: 'content',
      value: 'educational',
      description: 'Must maintain educational value'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['engagement', 'fun', 'entertainment', 'diversity'],
    category: 'shared',
    difficulty: 'medium'
  }
};

// Simplified engagement and fun for fallback scenarios
export const SIMPLIFIED_ENGAGEMENT_FUN: PromptTemplate = {
  id: 'simplified-engagement-fun-v1.0.0',
  name: 'Simplified Engagement and Fun',
  version: '1.0.0',
  description: 'Simplified engagement and fun requirements for fallback scenarios',
  content: `🎉 ENGAGEMENT & FUN:
- Include interesting, surprising, or memorable facts
- Use wordplay or clever associations when possible
- Mix different types of knowledge and perspectives
- Add cultural references or historical context
- Make clues engaging and conversation-worthy
- Include diverse content from different fields and time periods`,
  variables: [],
  constraints: [
    {
      type: 'content',
      value: 'basic_engagement',
      description: 'Basic engagement and fun requirements'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['engagement', 'simplified', 'fallback'],
    category: 'shared',
    difficulty: 'easy'
  }
};

// Engagement and fun validation functions
export interface EngagementFunCheck {
  isEngaging: boolean;
  funFactor: number;
  diversity: number;
  suggestions: string[];
  strengths: string[];
}

export function checkEngagementFun(clues: string[]): EngagementFunCheck {
  const suggestions: string[] = [];
  const strengths: string[] = [];
  let funFactor = 0;
  let diversity = 0;

  for (const clue of clues) {
    // Check for fun elements
    if (clue.includes('!') || clue.includes('"') || clue.includes("'")) {
      funFactor += 0.1;
      strengths.push('Includes punctuation that adds personality');
    }

    if (clue.includes('first') || clue.includes('only') || clue.includes('unique')) {
      funFactor += 0.2;
      strengths.push('Uses "first/only/unique" facts that are memorable');
    }

    if (clue.includes('famous') || clue.includes('legendary') || clue.includes('iconic')) {
      funFactor += 0.1;
      strengths.push('References famous or iconic elements');
    }

    if (clue.includes('discovered') || clue.includes('invented') || clue.includes('created')) {
      funFactor += 0.15;
      strengths.push('Includes discovery/invention stories');
    }

    // Check for diversity
    if (clue.includes('ancient') || clue.includes('medieval') || clue.includes('century')) {
      diversity += 0.1;
      strengths.push('Includes historical time periods');
    }

    if (clue.includes('culture') || clue.includes('tradition') || clue.includes('custom')) {
      diversity += 0.15;
      strengths.push('Includes cultural elements');
    }

    // Check for potential improvements
    if (clue.length < 15) {
      suggestions.push('Consider adding more detail or context to make it more engaging');
    }

    if (!clue.includes('This') && !clue.includes('this')) {
      suggestions.push('Consider using "This" format for better Jeopardy! style');
    }
  }

  // Normalize scores
  funFactor = Math.min(funFactor, 1.0);
  diversity = Math.min(diversity, 1.0);

  return {
    isEngaging: funFactor > 0.3 && diversity > 0.2,
    funFactor,
    diversity,
    suggestions,
    strengths
  };
}

export function getEngagementFunGuidelines(): string[] {
  return [
    'Include wordplay, puns, or clever associations',
    'Use interesting, surprising, or "wow factor" facts',
    'Add cultural references and historical context',
    'Mix different types of knowledge and perspectives',
    'Include "fun facts" that people want to share',
    'Use vivid, descriptive language',
    'Balance serious and lighthearted content',
    'Include diverse cultural perspectives',
    'Add "behind the scenes" or little-known details',
    'Make clues conversation starters'
  ];
}

export function validateEngagementFun(topic: string, clues: string[]): EngagementFunCheck {
  const baseCheck = checkEngagementFun(clues);
  
  // Topic-specific suggestions
  if (topic.toLowerCase().includes('history')) {
    baseCheck.suggestions.push('Consider adding dramatic moments or human interest angles');
  }

  if (topic.toLowerCase().includes('science')) {
    baseCheck.suggestions.push('Include surprising facts or "wow factor" discoveries');
  }

  if (topic.toLowerCase().includes('culture')) {
    baseCheck.suggestions.push('Add cultural significance or impact of events/people');
  }

  return {
    ...baseCheck,
    isEngaging: baseCheck.funFactor > 0.3 && baseCheck.diversity > 0.2
  };
} 