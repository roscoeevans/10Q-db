/**
 * Base prompt template for Jeopardy!-style question generation
 * Focuses on core format and accuracy requirements
 */

export const getBasePrompt = (topic: string, count: number = 10) => {
  return `
Generate ${count} Jeopardy!-style clues for the topic: "${topic}"

🎯 CORE FORMAT:
- Write CLUES (statements), not questions
- Use "This [person/place/thing]..." format
- End with periods, never question marks
- Keep clues concise (10-20 words)
- Make clues engaging and fun, not dry

🚨 CRITICAL: EACH QUESTION MUST BE STANDALONE
- Although each set of questions will have a theme, each one must be understandable in isolation. Never assume that the user has context from previous questions. This is in case we ever want to dynamically generate new quizzes that didn't come from the same set, but share a common tag.

🚨 CRITICAL ACCURACY REQUIREMENTS:
- Every fact must be 100% accurate
- Double-check dates, names, and details
- Avoid ambiguous or disputed information
- Use specific, verifiable facts
- When in doubt, choose the most widely accepted fact

✅ CORRECT FORMAT EXAMPLES:
- "This city on the Seine is the capital of France." → What is Paris?
- "This Norse god wields a hammer named Mjolnir." → Who is Thor?
- "This 1969 event saw Neil Armstrong take one small step." → What is the Moon landing?

✅ STANDALONE QUESTION EXAMPLES (for topic "Taylor Swift"):
- "This country music singer-turned-pop star released the album '1989' in 2014." → Who is Taylor Swift?
- "Taylor Swift's 2020 album recorded during the pandemic shares its name with this type of vegetation." → What is Folklore?

❌ WRONG FORMAT (NEVER DO THIS):
- "What is the capital of France?" (WRONG - direct question)
- "This Paris is the capital of France." (WRONG - answer in clue)
- "This city is the capital of France." (WRONG - too vague)

📈 DIFFICULTY PROGRESSION:
- Questions 1-2: EASY (general knowledge)
- Questions 3-5: INTERMEDIATE (specific facts)
- Questions 6-8: ADVANCED (detailed knowledge)
- Questions 9-10: EXPERT (specialist knowledge)

🏷️ TAG STRUCTURE (3 tags per question):
- First: Broad category (History, Science, Pop Culture, etc.)
- Second: Sub-category (American History, Physics, TV Shows, etc.)
- Third: Specific detail (Presidential Elections, Newtonian Mechanics, 90s Sitcoms, etc.)

⚠️ CRITICAL JSON FORMAT REQUIREMENTS:
You MUST return ONLY valid JSON. No markdown, no code blocks, no explanations.

EXACT JSON STRUCTURE REQUIRED:
[
  {
    "question": "This city on the Seine is the capital of France.",
    "choices": ["Paris", "London", "Berlin", "Madrid"],
    "answer": "Paris",
    "tags": ["Geography", "Europe", "Capitals"]
  }
]

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

❌ COMMON MISTAKES TO AVOID:
- Don't use Unicode arrows: ← → ↑ ↓
- Don't use smart quotes: " " ' '
- Don't add markdown formatting: \`\`\`json or \`\`\`
- Don't add explanations before or after JSON
- Don't use bullet points or special characters
- Don't put answer in wrong position in choices array

✅ CORRECT EXAMPLE:
[
  {
    "question": "This fashion accessory was popularized by Madonna in the 1980s.",
    "choices": ["Studded belt", "Choker", "Leg warmers", "Shoulder pads"],
    "answer": "Studded belt",
    "tags": ["Fashion", "1980s", "Pop Culture"]
  }
]

⚠️ FINAL REMINDER: Return ONLY the JSON array. Nothing else.
`;
}; 