/**
 * Template for regenerating individual questions with feedback
 */

export const getRegenerationPrompt = (
  topic: string,
  feedback: string,
  existingQuestions: Array<{ question: string; answer: string }>,
  questionIndex: number
) => {
  const otherQuestions = existingQuestions
    .map((q, i) => `${i + 1}. "${q.question}" (Answer: ${q.answer})`)
    .join('\n');

  return `
Regenerate question ${questionIndex + 1} for topic: "${topic}"

📝 FEEDBACK TO ADDRESS:
"${feedback}"

🎯 REQUIREMENTS:
- Generate a NEW Jeopardy!-style clue that addresses the feedback
- Maintain the same difficulty level (${questionIndex + 1}/10)
- Ensure the answer is UNIQUE and not used in other questions
- Follow Jeopardy! format (statement, not question)
- Include exactly 3 tags (broad → subcategory → specific)
- Provide exactly 4 multiple choice options
- Correct answer must be FIRST choice
- Make the clue engaging and fun

🚨 CRITICAL: QUESTION MUST BE STANDALONE
- NEVER use pronouns like "he", "she", "it", "they", "this person", "her", "his", "their"
- ALWAYS use the full name or specific identifier
- Question should be completely understandable without reading other questions
- If the topic is a person, use their full name in the question

📋 CONTEXT (other questions to avoid duplicates):
${otherQuestions}

🚨 CRITICAL ACCURACY:
- Every fact must be 100% accurate
- Use specific, verifiable facts
- Avoid ambiguous or disputed information

⚠️ CRITICAL JSON FORMAT REQUIREMENTS:
You MUST return ONLY valid JSON. No markdown, no code blocks, no explanations.

EXACT JSON STRUCTURE REQUIRED:
{
  "question": "This city on the Seine is the capital of France.",
  "choices": ["Paris", "London", "Berlin", "Madrid"],
  "answer": "Paris",
  "tags": ["Geography", "Europe", "Capitals"]
}

🚨 JSON RULES:
- Use ONLY standard JSON syntax
- No special characters, no Unicode arrows (←), no formatting
- All strings must be in double quotes
- No trailing commas
- Correct answer must be FIRST in choices array
- Answer field must exactly match first choice
- All fields are required: question, choices, answer, tags
- Choices array must have exactly 4 items
- Tags array must have exactly 3 items

⚠️ FINAL REMINDER: Return ONLY the JSON object. Nothing else.
`;
}; 