import type { PromptTemplate } from '../../types/prompt-types';

// Zeitgeist and culture template to tap into current cultural awareness and popular opinions
export const ZEITGEIST_CULTURE_TEMPLATE: PromptTemplate = {
  id: 'zeitgeist-culture-v1.0.0',
  name: 'Zeitgeist and Culture Requirements',
  version: '1.0.0',
  description: 'Requirements for incorporating current cultural awareness, popular opinions, and zeitgeist knowledge',
  content: `🌍 ZEITGEIST & CULTURE REQUIREMENTS (CRITICAL):

🎯 TAP INTO CURRENT CULTURAL AWARENESS:
- Include references to current popular opinions and cultural conversations
- Use knowledge that reflects how people actually think and talk about topics
- Incorporate "Reddit-style" knowledge - what people discuss, debate, and find interesting
- Include current cultural touchstones and shared references
- Use language and perspectives that reflect current cultural discourse
- Include "hot takes" and popular opinions that people actually hold

📱 REDDIT-STYLE KNOWLEDGE:
- Include "unpopular opinions" that are actually quite popular
- Reference current cultural debates and discussions
- Use knowledge that reflects how people actually experience and discuss topics
- Include "pro tips" and "life hacks" that people share
- Reference current memes, trends, and cultural moments (when appropriate)
- Include "TIL" (Today I Learned) style facts that people find surprising

🎭 POPULAR OPINIONS & CULTURAL PULSE:
- Include widely-held but rarely-stated opinions about topics
- Reference current cultural conversations and debates
- Use knowledge that reflects current cultural values and perspectives
- Include "common knowledge" that's actually quite specific to current culture
- Reference current events, trends, and cultural moments
- Include perspectives that reflect current cultural awareness

🌐 CULTURAL ZEITGEIST EXAMPLES:
- ✅ ZEITGEIST: "This movie is often called 'overrated' on Reddit, but it actually won Best Picture in 1994." (Pulp Fiction)
- ✅ ZEITGEIST: "This programming language is constantly debated on tech forums - some call it 'elegant' while others say it's 'overcomplicated'." (Rust)
- ✅ ZEITGEIST: "This city is often called 'underrated' by travelers, but locals say it's actually the best-kept secret in Europe." (Porto)
- ✅ ZEITGEIST: "This food is controversial - some people love it, others think it's 'just okay' and don't understand the hype." (Avocado toast)

🎪 CULTURAL AWARENESS TECHNIQUES:
- Include "hot takes" that reflect current cultural conversations
- Reference current debates and discussions in various communities
- Use knowledge that shows understanding of current cultural pulse
- Include "unpopular opinions" that are actually quite common
- Reference current trends, memes, and cultural moments
- Include perspectives that reflect current cultural values

📊 REDDIT-STYLE KNOWLEDGE PATTERNS:
- "Actually..." facts that correct common misconceptions
- "Unpopular opinion but..." statements that reflect popular views
- "TIL" (Today I Learned) style surprising facts
- "Pro tip" style practical knowledge
- "Hot take" style controversial but common opinions
- "Underrated/overrated" style cultural assessments

🎯 CULTURAL RELEVANCE:
- Include knowledge that reflects current cultural conversations
- Reference current events, trends, and cultural moments
- Use language and perspectives that feel current and relevant
- Include "hot takes" and popular opinions that people actually discuss
- Reference current cultural touchstones and shared experiences
- Include knowledge that shows understanding of current zeitgeist

⚠️ BALANCE REQUIREMENTS:
- Keep it current but not too time-sensitive
- Include cultural awareness without being too trendy
- Reference current conversations without being too niche
- Use popular opinions without being too controversial
- Include zeitgeist knowledge while maintaining educational value
- Balance current relevance with lasting appeal

🎭 CULTURAL DEPTH:
- Include diverse perspectives from different communities
- Reference current cultural conversations across different groups
- Use knowledge that reflects current cultural values and debates
- Include "hot takes" that reflect current cultural pulse
- Reference current trends and cultural moments
- Include perspectives that show cultural awareness

🎪 MEMORABLE CULTURAL MOMENTS:
- Use facts that reflect current cultural conversations
- Include "hot takes" that people actually discuss
- Reference current debates and cultural discussions
- Include knowledge that shows cultural awareness
- Use language that reflects current cultural discourse
- Include perspectives that feel current and relevant

⚠️ CRITICAL: While incorporating zeitgeist and cultural awareness, maintain accuracy and avoid overly time-sensitive content that will quickly become outdated. Focus on cultural patterns and popular opinions that have staying power.`,
  variables: [],
  constraints: [
    {
      type: 'content',
      value: 'cultural_awareness',
      description: 'Questions should reflect current cultural awareness'
    },
    {
      type: 'content',
      value: 'zeitgeist_knowledge',
      description: 'Include current cultural pulse and popular opinions'
    },
    {
      type: 'content',
      value: 'lasting_relevance',
      description: 'Must maintain relevance beyond current trends'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['zeitgeist', 'culture', 'reddit', 'popular_opinions'],
    category: 'shared',
    difficulty: 'hard'
  }
};

// Simplified zeitgeist and culture for fallback scenarios
export const SIMPLIFIED_ZEITGEIST_CULTURE: PromptTemplate = {
  id: 'simplified-zeitgeist-culture-v1.0.0',
  name: 'Simplified Zeitgeist and Culture',
  version: '1.0.0',
  description: 'Simplified zeitgeist and culture requirements for fallback scenarios',
  content: `🌍 ZEITGEIST & CULTURE:
- Include current cultural awareness and popular opinions
- Reference current debates and cultural conversations
- Use knowledge that reflects how people actually discuss topics
- Include "hot takes" and popular opinions that people share
- Reference current cultural touchstones and shared experiences
- Use language that reflects current cultural discourse`,
  variables: [],
  constraints: [
    {
      type: 'content',
      value: 'basic_cultural_awareness',
      description: 'Basic cultural awareness requirements'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['zeitgeist', 'simplified', 'fallback'],
    category: 'shared',
    difficulty: 'easy'
  }
};

// Zeitgeist and culture validation functions
export interface ZeitgeistCultureCheck {
  hasCulturalAwareness: boolean;
  zeitgeistScore: number;
  culturalRelevance: number;
  suggestions: string[];
  strengths: string[];
}

export function checkZeitgeistCulture(clues: string[]): ZeitgeistCultureCheck {
  const suggestions: string[] = [];
  const strengths: string[] = [];
  let zeitgeistScore = 0;
  let culturalRelevance = 0;

  for (const clue of clues) {
    // Check for cultural awareness elements
    if (clue.includes('often called') || clue.includes('popularly known as') || clue.includes('widely considered')) {
      zeitgeistScore += 0.2;
      strengths.push('References popular opinions and cultural perceptions');
    }

    if (clue.includes('controversial') || clue.includes('debated') || clue.includes('hot take')) {
      zeitgeistScore += 0.25;
      strengths.push('Includes current cultural debates and discussions');
    }

    if (clue.includes('underrated') || clue.includes('overrated') || clue.includes('underappreciated')) {
      zeitgeistScore += 0.2;
      strengths.push('Uses Reddit-style cultural assessments');
    }

    if (clue.includes('actually') || clue.includes('surprisingly') || clue.includes('contrary to popular belief')) {
      zeitgeistScore += 0.15;
      strengths.push('Includes "Actually..." style facts that correct misconceptions');
    }

    // Check for cultural relevance
    if (clue.includes('Reddit') || clue.includes('social media') || clue.includes('online')) {
      culturalRelevance += 0.2;
      strengths.push('References current digital culture and online discussions');
    }

    if (clue.includes('trending') || clue.includes('viral') || clue.includes('popular')) {
      culturalRelevance += 0.15;
      strengths.push('Includes current trends and popular culture');
    }

    if (clue.includes('millennial') || clue.includes('Gen Z') || clue.includes('boomer')) {
      culturalRelevance += 0.1;
      strengths.push('References generational cultural touchstones');
    }

    // Check for potential improvements
    if (!clue.includes('often') && !clue.includes('popularly') && !clue.includes('widely')) {
      suggestions.push('Consider adding popular opinion or cultural perception context');
    }

    if (!clue.includes('actually') && !clue.includes('surprisingly') && !clue.includes('contrary')) {
      suggestions.push('Consider including "Actually..." style facts that correct misconceptions');
    }
  }

  // Normalize scores
  zeitgeistScore = Math.min(zeitgeistScore, 1.0);
  culturalRelevance = Math.min(culturalRelevance, 1.0);

  return {
    hasCulturalAwareness: zeitgeistScore > 0.3 && culturalRelevance > 0.2,
    zeitgeistScore,
    culturalRelevance,
    suggestions,
    strengths
  };
}

export function getZeitgeistCultureGuidelines(): string[] {
  return [
    'Include current cultural awareness and popular opinions',
    'Reference current debates and cultural conversations',
    'Use "Reddit-style" knowledge and perspectives',
    'Include "hot takes" and popular opinions that people actually discuss',
    'Reference current cultural touchstones and shared experiences',
    'Use language that reflects current cultural discourse',
    'Include "Actually..." facts that correct common misconceptions',
    'Reference "underrated/overrated" style cultural assessments',
    'Include current trends and cultural moments',
    'Use knowledge that reflects how people actually discuss topics'
  ];
}

export function validateZeitgeistCulture(topic: string, clues: string[]): ZeitgeistCultureCheck {
  const baseCheck = checkZeitgeistCulture(clues);
  
  // Topic-specific suggestions
  if (topic.toLowerCase().includes('technology') || topic.toLowerCase().includes('tech')) {
    baseCheck.suggestions.push('Consider including current tech debates and "hot takes"');
  }

  if (topic.toLowerCase().includes('entertainment') || topic.toLowerCase().includes('movies')) {
    baseCheck.suggestions.push('Include current entertainment debates and "underrated/overrated" discussions');
  }

  if (topic.toLowerCase().includes('food') || topic.toLowerCase().includes('cuisine')) {
    baseCheck.suggestions.push('Reference current food trends and "controversial" food opinions');
  }

  return {
    ...baseCheck,
    hasCulturalAwareness: baseCheck.zeitgeistScore > 0.3 && baseCheck.culturalRelevance > 0.2
  };
} 