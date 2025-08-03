import type { PromptTemplate } from '../../types/prompt-types';

// Factual accuracy template to ensure well-researched and correct questions
export const FACTUAL_ACCURACY_TEMPLATE: PromptTemplate = {
  id: 'factual-accuracy-v1.0.0',
  name: 'Factual Accuracy Requirements',
  version: '1.0.0',
  description: 'Requirements for ensuring factual accuracy and well-researched questions',
  content: `🔬 FACTUAL ACCURACY REQUIREMENTS (CRITICAL):

✅ RESEARCH STANDARDS:
- All facts must be VERIFIABLE and ACCURATE
- Use ONLY well-established, widely-accepted facts
- Avoid controversial, disputed, or recently-changed information
- Prefer facts that have been stable for at least 5-10 years
- Use authoritative sources and consensus knowledge
- Avoid speculation, opinions, or subjective interpretations

✅ FACT VERIFICATION GUIDELINES:
- Historical events: Use established historical records and consensus
- Scientific facts: Use peer-reviewed, widely-accepted scientific knowledge
- Geographic information: Use current, verified geographic data
- Cultural facts: Use widely-recognized cultural knowledge
- Technical facts: Use established technical standards and definitions
- Biographical information: Use verified biographical facts from reliable sources

❌ WHAT TO AVOID:
- Recent news or current events (may change quickly)
- Controversial or disputed facts
- Speculative or theoretical information
- Personal opinions or subjective interpretations
- Facts that have changed recently or may change soon
- Information from unreliable or unverified sources
- Facts that depend on specific interpretations or contexts

✅ FACTUAL ACCURACY EXAMPLES:
- ✅ CORRECT: "This 1969 event saw Neil Armstrong become the first person to walk on the Moon." (established historical fact)
- ✅ CORRECT: "This element with atomic number 79 is a precious metal used in jewelry." (established scientific fact)
- ✅ CORRECT: "This city on the Seine River is the capital of France." (established geographic fact)
- ❌ AVOID: "This company's stock price reached $150 in 2025." (may change quickly)
- ❌ AVOID: "This politician's approval rating is 45%." (temporary, changing data)
- ❌ AVOID: "This theory suggests that..." (speculative or theoretical)

🎯 RESEARCH QUALITY STANDARDS:
- Use facts that are CONSENSUS knowledge in their field
- Prefer facts that are TEACHABLE and EDUCATIONAL
- Choose facts that are MEMORABLE and INTERESTING
- Ensure facts are APPROPRIATE for the difficulty level
- Verify that facts are TIMELESS and ENDURING
- Confirm that facts are ACCESSIBLE to the target audience

⚠️ FACTUAL VALIDATION CHECKLIST:
- Is this fact widely accepted and uncontroversial?
- Has this information been stable for at least 5 years?
- Is this fact from an authoritative, reliable source?
- Is this fact appropriate for the difficulty level?
- Is this fact educational and teachable?
- Is this fact memorable and interesting?
- Is this fact timeless and unlikely to change soon?

🔍 RESEARCH PROCESS:
1. Start with well-established, consensus facts
2. Verify information from multiple authoritative sources
3. Prefer facts that are educational and teachable
4. Avoid recent, changing, or controversial information
5. Ensure facts are appropriate for the target audience
6. Validate that facts are memorable and interesting
7. Confirm that facts are timeless and enduring

⚠️ CRITICAL: When in doubt, choose SIMPLER, MORE ESTABLISHED facts over complex, recent, or controversial information. Accuracy is more important than novelty.`,
  variables: [],
  constraints: [
    {
      type: 'content',
      value: 'factual_accuracy',
      description: 'All facts must be verifiable and accurate'
    },
    {
      type: 'content',
      value: 'consensus_knowledge',
      description: 'Use only widely-accepted, consensus facts'
    },
    {
      type: 'content',
      value: 'stable_information',
      description: 'Avoid recent or changing information'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['accuracy', 'research', 'facts', 'verification'],
    category: 'shared',
    difficulty: 'hard'
  }
};

// Simplified factual accuracy for fallback scenarios
export const SIMPLIFIED_FACTUAL_ACCURACY: PromptTemplate = {
  id: 'simplified-factual-accuracy-v1.0.0',
  name: 'Simplified Factual Accuracy',
  version: '1.0.0',
  description: 'Simplified factual accuracy requirements for fallback scenarios',
  content: `🔬 FACTUAL ACCURACY:
- Use only well-established, widely-accepted facts
- Avoid recent, changing, or controversial information
- Prefer facts that are educational and teachable
- Verify information from reliable sources
- Choose facts that are timeless and enduring`,
  variables: [],
  constraints: [
    {
      type: 'content',
      value: 'basic_accuracy',
      description: 'Basic factual accuracy requirements'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['accuracy', 'simplified', 'fallback'],
    category: 'shared',
    difficulty: 'easy'
  }
};

// Factual accuracy validation functions
export interface FactualAccuracyCheck {
  isAccurate: boolean;
  issues: string[];
  confidence: number;
  recommendations: string[];
}

export function checkFactualAccuracy(facts: string[]): FactualAccuracyCheck {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let confidence = 1.0;

  for (const fact of facts) {
    // Check for potential issues
    if (fact.includes('2025') || fact.includes('2024') || fact.includes('2023') || fact.includes('recent')) {
      issues.push(`Recent information detected: "${fact}" - may change quickly`);
      recommendations.push('Consider using more established historical facts');
      confidence *= 0.8;
    }

    if (fact.includes('controversial') || fact.includes('disputed') || fact.includes('debated')) {
      issues.push(`Controversial information detected: "${fact}" - may not be consensus knowledge`);
      recommendations.push('Use only widely-accepted, uncontroversial facts');
      confidence *= 0.7;
    }

    if (fact.includes('theory suggests') || fact.includes('some believe') || fact.includes('may be')) {
      issues.push(`Speculative information detected: "${fact}" - not established fact`);
      recommendations.push('Use only established, verified facts');
      confidence *= 0.6;
    }

    if (fact.includes('approval rating') || fact.includes('poll') || fact.includes('survey')) {
      issues.push(`Temporary data detected: "${fact}" - changes frequently`);
      recommendations.push('Use timeless, enduring facts instead');
      confidence *= 0.5;
    }
  }

  return {
    isAccurate: confidence > 0.7,
    issues,
    confidence,
    recommendations
  };
}

export function getFactualAccuracyGuidelines(): string[] {
  return [
    'Use only well-established, consensus facts',
    'Avoid recent, changing, or controversial information',
    'Prefer facts that are educational and teachable',
    'Verify information from reliable sources',
    'Choose facts that are timeless and enduring',
    'Use facts appropriate for the difficulty level',
    'Ensure facts are memorable and interesting'
  ];
}

export function validateFactualAccuracy(topic: string, facts: string[]): FactualAccuracyCheck {
  const baseCheck = checkFactualAccuracy(facts);
  
  // Additional topic-specific validation
  if (topic.toLowerCase().includes('current events') || topic.toLowerCase().includes('news')) {
    baseCheck.issues.push('Current events topics may contain changing information');
    baseCheck.recommendations.push('Consider using historical events instead of current events');
    baseCheck.confidence *= 0.6;
  }

  if (topic.toLowerCase().includes('technology') || topic.toLowerCase().includes('tech')) {
    baseCheck.issues.push('Technology topics may contain rapidly changing information');
    baseCheck.recommendations.push('Focus on established technological concepts and history');
    baseCheck.confidence *= 0.8;
  }

  return {
    ...baseCheck,
    isAccurate: baseCheck.confidence > 0.7
  };
} 