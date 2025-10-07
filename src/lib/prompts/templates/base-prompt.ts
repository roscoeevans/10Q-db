/**
 * Jeopardy!-style clue generator — compact, strict, deterministic
 * Use: getBasePrompt("Renaissance Art", 10, 42)
 */
export const getBasePrompt = (topic: string, count: number = 10, seed?: number) => `
You are generating Jeopardy!-style CLUES (not questions) about: "${topic}"
Return ONLY a JSON array with exactly ${count} items. No preface, no markdown.

OUTPUT OBJECT (all fields required; arrays fixed length):
{
  "question": string,           // A single concise clue, 10–20 words, ends with a period.
  "choices": [string, string, string, string], // First item is the correct answer.
  "answer": string,             // Must exactly equal choices[0].
  "tags": [string, string, string] // Broad, Subcategory, Specific detail.
}

GLOBAL RULES
- Style: Begin with "This ..." (person/place/thing/event/work/idea...) and write a statement, not a question.
- Standalone: Each clue must make sense without any shared context.
- Accuracy: 100% factually correct; prefer widely accepted facts; avoid ambiguous/disputed items.
- Brevity: 10–20 words; engaging, lively, not dry; no fluff.
- Punctuation: End with a period. Never use question marks.
- Choices: 4 total; plausible distractors of same type/era/region as the answer; no “All of the above”.
- Consistency: No answers or distractors may duplicate across the set.
- Tags: Exactly 3 per item → [Broad, Subcategory, Specific]; keep them human-readable.
- JSON: Valid standard JSON only; double quotes; no trailing commas; no special glyphs.

DIFFICULTY (by index)
1–2: EASY (general knowledge)
3–5: INTERMEDIATE (specific facts)
6–8: ADVANCED (detailed knowledge)
9–10: EXPERT (specialist knowledge)

DETERMINISM
- If a seed is provided ("${String(seed ?? "")}"), use it to produce stable selection and ordering.
- Otherwise, vary phrasing but still adhere to all constraints.

FORMAT EXAMPLE (single item shape only; do not copy content):
[
  {
    "question": "This city on the Seine is the capital of France.",
    "choices": ["Paris", "London", "Berlin", "Madrid"],
    "answer": "Paris",
    "tags": ["Geography", "Europe", "Capitals"]
  }
]
`;
