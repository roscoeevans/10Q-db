/**
 * Difficulty scaling template for progressive question difficulty
 */

export const getDifficultyScaling = (questionIndex: number) => {
  const difficultyLevels = {
    0: 'EASY - General knowledge that most people would know (famous facts, widely known information)',
    1: 'EASY - Basic facts that casual fans might know (mainstream knowledge)',
    2: 'BEGINNER - Specific details that require some interest in the topic',
    3: 'INTERMEDIATE - Requires some knowledge of the subject (specific facts, dates)',
    4: 'INTERMEDIATE - Lesser-known but not obscure facts (detailed knowledge)',
    5: 'INTERMEDIATE - Specific details that enthusiasts would know',
    6: 'ADVANCED - For people well-versed in the subject (detailed knowledge)',
    7: 'ADVANCED - Specialist knowledge that requires deep interest',
    8: 'EXPERT - Very challenging, specialist knowledge (deep trivia)',
    9: 'MASTER - Only true experts/enthusiasts would know this (insider knowledge)'
  };

  return `
📈 DIFFICULTY FOR QUESTION ${questionIndex + 1}:
${difficultyLevels[questionIndex as keyof typeof difficultyLevels]}

💡 DIFFICULTY GUIDELINES:
- EASY (1-2): Mainstream knowledge, famous facts, widely known information
- INTERMEDIATE (3-5): Specific details, dates, lesser-known but not obscure facts
- ADVANCED (6-7): Detailed knowledge, specialist information, deep facts
- EXPERT (8-9): Deep trivia, technical details, historical minutiae
- MASTER (10): Insider knowledge, obscure facts, expert-level details

🎯 ANSWER DIVERSITY:
- Each answer must be UNIQUE - no duplicates across all 10 questions
- Cover different aspects, time periods, or categories within the topic
- Avoid using the same person, place, thing, or concept multiple times
`;
}; 