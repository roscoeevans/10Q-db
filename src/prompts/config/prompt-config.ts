// Simple, hard-coded prompt for question generation
export const QUESTION_GENERATION_PROMPT = `Given the theme: "{topic}", generate {count} JEOPARDY!-STYLE clues with PROGRESSIVE DIFFICULTY. Each clue must have exactly 3 tags, ordered from broad to specific.

🎯 JEOPARDY! STYLE REQUIREMENTS:
- Write CLUES, not questions - contestants respond with questions
- Start with factual statements, end with periods (never question marks)
- Use "This [person/place/thing]..." format for specificity
- Keep clues brief and punchy (10-20 words max)
- Include context hints, dates, or wordplay when possible
- Tone should be academic but playful, trivia-forward but not dry
- NEVER include the answer directly in the clue text
- Provide context clues that lead to the answer, but don't state it

📈 DIFFICULTY PROGRESSION:
- Question 1: EASY - General knowledge that most people would know
- Question 2-3: BEGINNER - Basic facts that casual fans might know  
- Question 4-6: INTERMEDIATE - Requires some knowledge of the topic
- Question 7-8: ADVANCED - For people well-versed in the subject
- Question 9: EXPERT - Very challenging, specialist knowledge
- Question 10: MASTER - Only true experts/enthusiasts would know this

🏷️ Tag Hierarchy:
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
]`;

// Simple function to build the prompt with variables
export function buildSimpleQuestionPrompt(topic: string, count: number = 10): string {
  return QUESTION_GENERATION_PROMPT
    .replace('{topic}', topic)
    .replace('{count}', count.toString());
}

// Simple regeneration prompt
export const QUESTION_REGENERATION_PROMPT = `Given the theme: "{topic}", I need to regenerate question {questionIndex} (difficulty level {questionIndex}/10) because of this feedback: "{feedback}"

{difficulty_description}

Here are some other questions from the same quiz for context (to avoid duplicates):
{existing_questions}

⚠️ CRITICAL: Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text.

Output in JSON format with this exact structure:
{
  "question": "This city on the Seine is the capital of France.",
  "choices": ["Paris", "London", "Berlin", "Madrid"],
  "answer": "Paris",
  "tags": ["Geography", "Europe", "Capitals"]
}`;

// Simple function to build regeneration prompt
export function buildSimpleRegenerationPrompt(
  topic: string,
  feedback: string,
  questionIndex: number,
  existingQuestions: string[]
): string {
  const difficultyDescription = `Question ${questionIndex} should be ${getDifficultyDescription(questionIndex)}`;
  const existingQuestionsText = existingQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n');
  
  return QUESTION_REGENERATION_PROMPT
    .replace('{topic}', topic)
    .replace('{feedback}', feedback)
    .replace('{questionIndex}', questionIndex.toString())
    .replace('{difficulty_description}', difficultyDescription)
    .replace('{existing_questions}', existingQuestionsText);
}

// Simple difficulty description function
function getDifficultyDescription(questionIndex: number): string {
  if (questionIndex === 1) return 'EASY - General knowledge that most people would know';
  if (questionIndex <= 3) return 'BEGINNER - Basic facts that casual fans might know';
  if (questionIndex <= 6) return 'INTERMEDIATE - Requires some knowledge of the topic';
  if (questionIndex <= 8) return 'ADVANCED - For people well-versed in the subject';
  if (questionIndex === 9) return 'EXPERT - Very challenging, specialist knowledge';
  return 'MASTER - Only true experts/enthusiasts would know this';
} 