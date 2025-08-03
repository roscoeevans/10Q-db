import type { PromptTemplate } from '../../types/prompt-types';

// Shared formatting rules for all question generation prompts
export const FORMATTING_RULES_TEMPLATE: PromptTemplate = {
  id: 'formatting-rules-v1.0.0',
  name: 'Formatting Rules',
  version: '1.0.0',
  description: 'Core formatting rules and requirements for question generation',
  content: `🎯 CORE FORMATTING REQUIREMENTS:

📝 QUESTION FORMAT:
- Write CLUES, not questions - contestants respond with questions
- Start with factual statements, end with periods (never question marks)
- Use "This [person/place/thing]..." format for specificity
- Keep clues brief and punchy (10-20 words max)
- Include context hints, dates, or wordplay when possible
- Tone should be academic but playful, trivia-forward but not dry
- NEVER include the answer directly in the clue text
- Provide context clues that lead to the answer, but don't state it

🚨 CRITICAL: NEVER USE QUESTION FORMAT
- ❌ WRONG: "What industry did Andrew Carnegie make his fortune in?"
- ❌ WRONG: "Who plays Iron Man in the Marvel movies?"
- ❌ WRONG: "Where is the capital of France located?"
- ✅ CORRECT: "Andrew Carnegie made his fortune in this industry."
- ✅ CORRECT: "This actor plays Iron Man in the Marvel movies."
- ✅ CORRECT: "This city on the Seine is the capital of France."

✅ CORRECT JEOPARDY! FORMAT EXAMPLES:
- "This steel magnate made his fortune in the late 19th century." → Who is Andrew Carnegie?
- "This 1994 film features a bus that must stay above 50 miles per hour." → What is Speed?
- "This Greek goddess of wisdom sprang fully grown from Zeus's head." → Who is Athena?
- "This 1969 event saw Neil Armstrong take one small step for man." → What is the Moon landing?

❌ WRONG EXAMPLES (DO NOT DO THIS):
- "This Blighted Minotaur is a Taken enemy in Destiny." → What is Blighted Minotaur? (WRONG - answer in clue!)
- "This Steve Jobs founded Apple." → Who is Steve Jobs? (WRONG - answer in clue!)
- "This Paris is the capital of France." → What is Paris? (WRONG - answer in clue!)

🧠 JEOPARDY! WRITING RULES:
✅ DO:
- Start with "This [person/place/thing]..." or factual statements
- Use specific nouns, dates, or context clues
- Include wordplay, puns, or clever associations when possible
- Keep clues concise and fact-packed
- End with periods, never question marks
- Make the expected answer a specific noun phrase
- Use "this" to refer to the answer (e.g., "this industry", "this actor", "this city")

❌ DON'T:
- Ask direct questions ("What is...?", "Who is...?", "Where is...?")
- Use question words in the clue ("what", "who", "where", "when", "why", "how")
- Include the answer directly in the clue text
- Make clues too long or verbose
- Use subjective or opinion-based statements
- End with question marks
- Tell contestants how to answer (e.g., "what industry" tells them to say "What is...")
- Put the answer in the clue (e.g., "This Blighted Minotaur is a Taken enemy" - WRONG!)
- Use the answer as a descriptor in the clue

⚠️ CRITICAL FORMATTING REQUIREMENTS:
- The correct answer must ALWAYS be the FIRST choice in the "choices" array (index 0)
- The "answer" field must EXACTLY match the first choice in the "choices" array
- Do not provide explanatory text or additional information as the answer - only use the exact text from the first choice
- Each clue must have exactly 4 multiple choice options
- Each clue must have exactly 3 tags
- Tags must be unique within each clue
- Tags must be descriptive but concise
- Tags must follow the hierarchy: broad → subcategory → specific

🚨 FINAL REMINDER: Every clue must be a STATEMENT, never a question. Use "this" to refer to the answer, not question words like "what", "who", "where".`,
  variables: [],
  constraints: [
    {
      type: 'format',
      value: 'jeopardy_style',
      description: 'Must follow Jeopardy! format rules'
    },
    {
      type: 'content',
      value: 'no_questions',
      description: 'Must not contain question words or question marks'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['formatting', 'jeopardy', 'rules'],
    category: 'shared',
    difficulty: 'easy'
  }
};

// Simplified formatting rules for fallback scenarios
export const SIMPLIFIED_FORMATTING_RULES: PromptTemplate = {
  id: 'simplified-formatting-rules-v1.0.0',
  name: 'Simplified Formatting Rules',
  version: '1.0.0',
  description: 'Simplified formatting rules for fallback scenarios',
  content: `📝 BASIC FORMATTING:
- Write statements, not questions
- Use "This [thing]..." format
- Keep clues short and clear
- Don't include the answer in the clue
- End with periods, not question marks
- Correct answer must be first choice
- Include 4 choices and 3 tags`,
  variables: [],
  constraints: [
    {
      type: 'format',
      value: 'basic_jeopardy',
      description: 'Basic Jeopardy! format'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['formatting', 'simplified', 'fallback'],
    category: 'shared',
    difficulty: 'easy'
  }
};

// Minimal formatting rules for emergency fallback
export const MINIMAL_FORMATTING_RULES: PromptTemplate = {
  id: 'minimal-formatting-rules-v1.0.0',
  name: 'Minimal Formatting Rules',
  version: '1.0.0',
  description: 'Minimal formatting rules for emergency fallback',
  content: `FORMAT: Statements, not questions. Use "This [thing]..." format. 4 choices, correct answer first. 3 tags.`,
  variables: [],
  constraints: [
    {
      type: 'format',
      value: 'minimal',
      description: 'Minimal formatting requirements'
    }
  ],
  metadata: {
    author: '10Q Database Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['formatting', 'minimal', 'emergency'],
    category: 'shared',
    difficulty: 'easy'
  }
};

export {
  FORMATTING_RULES_TEMPLATE,
  SIMPLIFIED_FORMATTING_RULES,
  MINIMAL_FORMATTING_RULES
}; 