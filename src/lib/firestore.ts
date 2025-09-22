import { 
  doc, 
  writeBatch, 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { geminiAI } from './firebase';

// Authentication helper
export async function ensureAuthenticated(): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Authentication required to access database. Please sign in.');
  }
  console.log('User authenticated:', auth.currentUser.email);
}

// Types
export interface FirestoreQuestion {
  id: string;
  question: string;
  choices: string[]; // NOTE: Correct answer is ALWAYS at index 0
  answer: string;    // Must match choices[0]
  date: string;
  difficulty: number; // 1-10 scale: 1=easy, 10=expert (based on question position)
  lastUsed: string;
  tags: string[];
}

export interface QuestionUpload {
  question: string;
  choices: string[]; // NOTE: Correct answer is ALWAYS at index 0
  answer: string;    // Must match choices[0]
  date: string;
  tags: string[];
}

export interface QuestionStats {
  totalQuestions: number;
  averageDifficulty: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
    expert: number;
  };
}

// Helper function to find the best matching choice for an AI-generated answer
function findBestChoiceMatch(answer: string, choices: string[]): string | null {
  const lowerAnswer = answer.toLowerCase().trim();
  
  // 1. Exact match (case-insensitive)
  for (const choice of choices) {
    if (choice.toLowerCase().trim() === lowerAnswer) {
      return choice;
    }
  }
  
  // 2. Partial match - answer contains choice or vice versa
  for (const choice of choices) {
    const lowerChoice = choice.toLowerCase().trim();
    if (lowerAnswer.includes(lowerChoice) || lowerChoice.includes(lowerAnswer)) {
      return choice;
    }
  }
  
  // 3. Word matching - check if any significant words from the answer appear in choices
  const answerWords = lowerAnswer.split(/\s+/).filter(word => word.length > 2); // Ignore short words
  for (const choice of choices) {
    const lowerChoice = choice.toLowerCase();
    for (const word of answerWords) {
      if (lowerChoice.includes(word)) {
        return choice;
      }
    }
  }
  
  // 4. Check for common patterns that indicate no match
  // If answer suggests "none" or "not applicable", return null to use fallback
  if (lowerAnswer.includes('not') || lowerAnswer.includes('none') || lowerAnswer.includes('neither')) {
    return null;
  }
  
  return null; // No good match found
}

// AI-powered Jeopardy!-style clue generation
export async function generateQuestionsWithAI(
  topic: string,
  count: number = 10
): Promise<QuestionUpload[]> {
  try {
    const prompt = `Given the theme: "${topic}", generate ${count} JEOPARDY!-STYLE clues with PROGRESSIVE DIFFICULTY. Each clue must have exactly 3 tags, ordered from broad to specific:

🎯 JEOPARDY! STYLE REQUIREMENTS (CRITICAL):
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

📈 DIFFICULTY PROGRESSION (CRITICAL):
- Question 1: EASY - General knowledge that most people would know
- Question 2-3: BEGINNER - Basic facts that casual fans might know  
- Question 4-6: INTERMEDIATE - Requires some knowledge of the topic
- Question 7-8: ADVANCED - For people well-versed in the subject
- Question 9: EXPERT - Very challenging, specialist knowledge
- Question 10: MASTER - Only true experts/enthusiasts would know this

🏷️ Tag Hierarchy Principle:
- First tag: Very general category (History, Science, Pop Culture, Sports, etc.)
- Second tag: Sub-topic within the first (American History, Physics, TV Shows, Basketball, etc.)
- Third tag: Narrow detail or specific angle (Presidential Elections, Newtonian Mechanics, Sitcoms from the 90s, NBA Records, etc.)

✅ JEOPARDY! STYLE EXAMPLES for "${topic}":
- Easy (Q1): "This city on the Seine is the capital of France." → What is Paris?
- Intermediate (Q5): "This Norse god wields a hammer named Mjolnir." → Who is Thor?
- Expert (Q10): "This 1969 comic issue introduced Bucky Barnes as the Winter Soldier." → What is Captain America #110?

❌ WRONG EXAMPLES (DO NOT DO THIS):
- "This Blighted Minotaur is a Taken enemy in Destiny." → What is Blighted Minotaur? (WRONG - answer in clue!)
- "This Steve Jobs founded Apple." → Who is Steve Jobs? (WRONG - answer in clue!)
- "This Paris is the capital of France." → What is Paris? (WRONG - answer in clue!)

🎯 MORE EXAMPLES OF CORRECT JEOPARDY! FORMAT:
- "This steel magnate made his fortune in the late 19th century." → Who is Andrew Carnegie?
- "This 1994 film features a bus that must stay above 50 miles per hour." → What is Speed?
- "This Greek goddess of wisdom sprang fully grown from Zeus's head." → Who is Athena?
- "This 1969 event saw Neil Armstrong take one small step for man." → What is the Moon landing?

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

Requirements:
- Each clue must have exactly 4 multiple choice options
- Each clue must have exactly 3 tags
- Tags must be unique within each clue
- Tags must be descriptive but concise
- Tags must follow the hierarchy: broad → subcategory → specific
- DIFFICULTY MUST SCALE: Start easy, end expert
- ANSWER DIVERSITY: Each of the 10 answers must be completely unique - no duplicates or very similar answers

⚠️ CRITICAL FORMATTING REQUIREMENTS:
- The correct answer must ALWAYS be the FIRST choice in the "choices" array (index 0)
- The "answer" field must EXACTLY match the first choice in the "choices" array
- Do not provide explanatory text or additional information as the answer - only use the exact text from the first choice

💡 DIFFICULTY SCALING TIPS:
- EASY clues: Mainstream knowledge, famous facts, widely known information
- INTERMEDIATE clues: Specific details, dates, lesser-known but not obscure facts
- EXPERT clues: Deep trivia, technical details, historical minutiae, insider knowledge
- All wrong answers should be plausible for the difficulty level

🎯 ANSWER DIVERSITY REQUIREMENTS (CRITICAL):
- Each of the 10 questions must have a UNIQUE answer - no duplicates allowed
- Avoid using the same person, place, thing, or concept as an answer more than once
- Ensure answers cover different aspects, time periods, or categories within the topic
- Examples of what to AVOID:
  ❌ Multiple questions about the same person (e.g., 2+ questions about Steve Jobs)
  ❌ Multiple questions about the same event (e.g., 2+ questions about the Moon landing)
  ❌ Multiple questions about the same place (e.g., 2+ questions about Paris)
  ❌ Multiple questions about the same object (e.g., 2+ questions about the iPhone)

✅ Examples of GOOD answer diversity:
- Different people: Steve Jobs, Bill Gates, Elon Musk, Mark Zuckerberg
- Different events: Moon landing, Berlin Wall fall, 9/11, COVID pandemic
- Different places: Paris, London, Tokyo, New York
- Different objects: iPhone, Tesla Model S, PlayStation, Hubble Telescope

⚠️ IMPORTANT: Return ONLY the JSON array, no markdown formatting, no code blocks, no additional text.

Output in JSON format with this exact structure (note: correct answer is ALWAYS first choice):
[
  {
    "question": "This city on the Seine is the capital of France.",
    "choices": ["Paris", "London", "Berlin", "Madrid"],
    "answer": "Paris",
    "tags": ["Geography", "Europe", "Capitals"]
  }
]

🚨 FINAL REMINDER: Every clue must be a STATEMENT, never a question. Use "this" to refer to the answer, not question words like "what", "who", "where".`;

    const response = await geminiAI.generateContent(prompt);
    const content = response.text;
    
    if (!content) {
      throw new Error('No content generated from AI');
    }

    console.log('🤖 Raw AI Response:', content);
    console.log('📝 Response preview:', content.substring(0, 200) + '...');

    // Clean the JSON response by removing markdown code blocks
    let cleanedContent = content.trim();
    
    // Remove ```json and ``` markers if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('🧹 Cleaned JSON for parsing:', cleanedContent.substring(0, 200) + '...');

    // Parse the JSON response
    let questions: QuestionUpload[];
    try {
      questions = JSON.parse(cleanedContent) as QuestionUpload[];
      console.log('✅ Successfully parsed', questions.length, 'Jeopardy!-style clues from AI');
      
      // Validate the clues structure
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question || !q.choices || !q.answer || !q.tags) {
          throw new Error(`Clue ${i + 1} is missing required fields (question, choices, answer, tags)`);
        }
        if (!Array.isArray(q.choices) || q.choices.length !== 4) {
          throw new Error(`Clue ${i + 1} must have exactly 4 choices`);
        }
        if (!Array.isArray(q.tags) || q.tags.length !== 3) {
          throw new Error(`Clue ${i + 1} must have exactly 3 tags`);
        }
        // Ensure correct answer is always first choice
        if (q.answer !== q.choices[0]) {
          console.warn(`⚠️  Question ${i + 1}: answer "${q.answer}" is not the first choice`);
          
          // Find the correct answer in the choices and move it to first position
          const correctAnswerIndex = q.choices.findIndex(choice => choice === q.answer);
          if (correctAnswerIndex > 0) {
            console.log(`🔧 Moving correct answer to first position for Question ${i + 1}`);
            // Move correct answer to front
            const correctAnswer = q.choices[correctAnswerIndex];
            q.choices.splice(correctAnswerIndex, 1);
            q.choices.unshift(correctAnswer);
            q.answer = q.choices[0]; // Update answer to match first choice
          } else if (correctAnswerIndex === -1) {
            // Answer not found in choices - try fuzzy matching
            const bestMatch = findBestChoiceMatch(q.answer, q.choices);
            if (bestMatch) {
              console.log(`🔧 Auto-correcting and moving answer for Question ${i + 1}: "${q.answer}" → "${bestMatch}"`);
              const matchIndex = q.choices.findIndex(choice => choice === bestMatch);
              q.choices.splice(matchIndex, 1);
              q.choices.unshift(bestMatch);
              q.answer = bestMatch;
            } else {
              // Fallback: use first choice as answer (already in correct position)
              console.log(`🔧 Fallback for Question ${i + 1}: Using first choice "${q.choices[0]}" as answer`);
              q.answer = q.choices[0];
            }
          }
        }
        
        // Validate Jeopardy! format - ensure clues are statements, not questions
        const questionText = q.question.trim();
        const questionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'which'];
        const hasQuestionWord = questionWords.some(word => 
          questionText.toLowerCase().includes(word + ' ')
        );
        const endsWithQuestionMark = questionText.endsWith('?');
        
        if (hasQuestionWord || endsWithQuestionMark) {
          console.warn(`⚠️  Clue ${i + 1} is in question format instead of Jeopardy! statement format: "${questionText}"`);
          console.warn(`   Should be a statement like "This [person/place/thing]..." not "What/Who/Where..."`);
        }
      }
      
      // Check for duplicate answers across all questions
      const answers = questions.map(q => q.answer.toLowerCase().trim());
      const duplicateAnswers = answers.filter((answer, index) => answers.indexOf(answer) !== index);
      
      if (duplicateAnswers.length > 0) {
        const uniqueDuplicates = [...new Set(duplicateAnswers)];
        console.warn(`⚠️  DUPLICATE ANSWERS DETECTED: ${uniqueDuplicates.join(', ')}`);
        console.warn(`   Each answer should be unique across all 10 questions. Consider regenerating.`);
        
        // Show which questions have duplicates
        uniqueDuplicates.forEach(duplicate => {
          const duplicateIndices = answers
            .map((answer, index) => answer === duplicate ? index + 1 : -1)
            .filter(index => index !== -1);
          console.warn(`   Answer "${duplicate}" appears in questions: ${duplicateIndices.join(', ')}`);
        });
      } else {
        console.log('✅ All answers are unique - good diversity!');
      }
      
      console.log('✅ Clues validated successfully');
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('🔍 Content that failed to parse:', cleanedContent);
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
    // Add the current date to all questions
    const today = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');

    return questions.map(q => ({
      ...q,
      date: today
    }));
  } catch (error) {
    console.error('Error generating questions with AI:', error);
    throw new Error('Failed to generate questions with AI');
  }
}

// Generate a single question with feedback for regeneration
export async function generateSingleQuestionWithFeedback(
  topic: string,
  feedback: string,
  existingQuestions: QuestionUpload[],
  questionIndex: number,
  targetDate: string
): Promise<QuestionUpload> {
  try {
    // Get the other approved questions for context
    const otherQuestions = existingQuestions
      .map((q, i) => ({ ...q, index: i }))
      .filter((_, i) => i !== questionIndex)
      .slice(0, 5); // Limit to 5 for context

    const prompt = `Given the theme: "${topic}", I need to regenerate question ${questionIndex + 1} (difficulty level ${questionIndex + 1}/10) because of this feedback: "${feedback}"

The rejected question was: "${existingQuestions[questionIndex]?.question || 'Unknown'}"

Here are some other questions from the same quiz for context (to avoid duplicates and maintain consistency):
${otherQuestions.map((q, i) => `${i + 1}. "${q.question}" (Answer: ${q.answer})`).join('\n')}

🎯 REQUIREMENTS:
- Generate a NEW Jeopardy!-style clue that addresses the feedback
- Maintain the same difficulty level (${questionIndex + 1}/10)
- Ensure the answer is UNIQUE and not used in other questions
- Follow the same Jeopardy! format (statement, not question)
- Include exactly 3 tags (broad → subcategory → specific)
- Provide exactly 4 multiple choice options
- The correct answer must be the FIRST choice
- NEVER include the answer directly in the clue text
- Provide context clues that lead to the answer, but don't state it

🚨 CRITICAL: DO NOT PUT THE ANSWER IN THE CLUE!
- WRONG: "This Blighted Minotaur is a Taken enemy" (answer is in the clue!)
- CORRECT: "This Taken enemy has a corrupted, shadowy appearance and wields void powers"

🎯 DIFFICULTY GUIDELINES for question ${questionIndex + 1}:
${questionIndex === 0 ? 'EASY - General knowledge that most people would know' :
  questionIndex <= 2 ? 'BEGINNER - Basic facts that casual fans might know' :
  questionIndex <= 5 ? 'INTERMEDIATE - Requires some knowledge of the topic' :
  questionIndex <= 7 ? 'ADVANCED - For people well-versed in the subject' :
  questionIndex === 8 ? 'EXPERT - Very challenging, specialist knowledge' :
  'MASTER - Only true experts/enthusiasts would know this'}

⚠️ CRITICAL: Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text.

Output in JSON format with this exact structure (note: do NOT include the date field - it will be added automatically):
{
  "question": "This city on the Seine is the capital of France.",
  "choices": ["Paris", "London", "Berlin", "Madrid"],
  "answer": "Paris",
  "tags": ["Geography", "Europe", "Capitals"]
}`;

    const response = await geminiAI.generateContent(prompt);
    const content = response.text;
    
    if (!content) {
      throw new Error('No content generated from AI');
    }

    console.log('🤖 Raw AI Response for regeneration:', content);
    console.log('📝 Response preview:', content.substring(0, 200) + '...');

    // Clean the JSON response by removing markdown code blocks
    let cleanedContent = content.trim();
    
    // Remove ```json and ``` markers if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('🧹 Cleaned JSON for parsing:', cleanedContent.substring(0, 200) + '...');

    // Parse the JSON response
    let question: QuestionUpload;
    try {
      question = JSON.parse(cleanedContent) as QuestionUpload;
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Add the date field to the question
    question.date = targetDate;
    
    console.log('🔧 Regenerated question with date:', {
      question: question.question,
      answer: question.answer,
      choices: question.choices,
      tags: question.tags,
      date: question.date
    });
    
    // Validate the regenerated question
    validateQuestion(question);

    // Ensure answer matches first choice
    if (question.answer !== question.choices[0]) {
      const bestMatch = findBestChoiceMatch(question.answer, question.choices);
      if (bestMatch) {
        // Reorder choices to put the correct answer first
        const matchIndex = question.choices.findIndex(choice => choice === bestMatch);
        question.choices.splice(matchIndex, 1);
        question.choices.unshift(bestMatch);
        question.answer = bestMatch;
      } else {
        // Fallback: use first choice as answer
        console.log(`🔧 Fallback for regenerated question: Using first choice "${question.choices[0]}" as answer`);
        question.answer = question.choices[0];
      }
    }

    // Check for duplicate answers with existing questions
    const existingAnswers = existingQuestions
      .filter((_, i) => i !== questionIndex)
      .map(q => q.answer.toLowerCase().trim());
    
    if (existingAnswers.includes(question.answer.toLowerCase().trim())) {
      console.warn(`⚠️  Regenerated question has duplicate answer: "${question.answer}"`);
    }

    return question;
  } catch (error) {
    console.error('Error generating single question with feedback:', error);
    throw new Error('Failed to regenerate question with feedback');
  }
}

// Upload daily questions
export async function uploadDailyQuestions(
  questions: QuestionUpload[], 
  targetDate: string
): Promise<string> {
  try {
    const batch = writeBatch(db);
    
    // Validate we have exactly 10 questions
    if (questions.length !== 10) {
      throw new Error(`Expected 10 questions, got ${questions.length}`);
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
      throw new Error("Date must be in YYYY-MM-DD format");
    }
    
    // Check if questions already exist for this date
    const existingQuestions = await getQuestionsByDate(targetDate);
    if (existingQuestions.length > 0) {
      throw new Error(`Questions already exist for ${targetDate}. Please choose a different date.`);
    }
    
    // Validate each question before processing
    questions.forEach((questionData, index) => {
      try {
        validateQuestion(questionData);
      } catch (error) {
        throw new Error(`Question ${index + 1}: ${error instanceof Error ? error.message : 'Invalid question'}`);
      }
    });
    
    // Process each question
    questions.forEach((questionData, index) => {
      const questionId = `${targetDate}-q${index}`;
      
      // Create the question document
      const questionDocRef = doc(db, 'questions', questionId);
      const firestoreQuestion: FirestoreQuestion = {
        id: questionId,
        question: questionData.question,
        choices: questionData.choices,
        answer: questionData.answer,
        date: targetDate,
        difficulty: index + 1, // Questions 1-10 based on position (1=easy, 10=expert)
        lastUsed: "", // Empty for new questions
        tags: questionData.tags
      };
      
      batch.set(questionDocRef, firestoreQuestion);
      
      // Add to tag subcollections
      questionData.tags.forEach(tag => {
        const tagQuestionsRef = collection(db, 'tags', tag, 'questions');
        const tagQuestionDocRef = doc(tagQuestionsRef, questionId);
        batch.set(tagQuestionDocRef, { questionId });
      });
    });
    
    await batch.commit();
    return `Successfully uploaded ${questions.length} questions for ${targetDate}`;
  } catch (error) {
    console.error("Error uploading questions:", error);
    
    // Handle specific Firebase errors
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        throw new Error('Admin access required to upload questions. Please check your permissions.');
      }
      if (error.message.includes('unavailable')) {
        throw new Error('Database temporarily unavailable. Please try again.');
      }
      throw error;
    }
    
    throw new Error('Failed to upload questions. Please try again.');
  }
}

// Validation function
export function validateQuestion(question: QuestionUpload): void {
  if (!question.question || question.question.trim().length === 0) {
    throw new Error("Question text is required");
  }
  
  if (!question.choices || question.choices.length !== 4) {
    throw new Error("Question must have exactly 4 choices");
  }
  
  if (question.answer !== question.choices[0]) {
    throw new Error("Answer must match the first choice");
  }
  
  if (!question.tags || question.tags.length !== 3) {
    throw new Error("Question must have exactly 3 tags (broad → subcategory → specific)");
  }
  
  // Check for unique tags within the question
  const uniqueTags = new Set(question.tags.filter(tag => tag.trim()));
  if (uniqueTags.size !== 3) {
    throw new Error("Question must have 3 unique tags");
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(question.date)) {
    throw new Error("Date must be in YYYY-MM-DD format");
  }
}

// Read operations
export async function getQuestionsByDate(date: string): Promise<FirestoreQuestion[]> {
  try {
    console.log('Checking questions for date:', date);
    
    // Ensure we're authenticated
    await ensureAuthenticated();
    
    const questionsRef = collection(db, 'questions');
    const q = query(questionsRef, where('date', '==', date));
    const snapshot = await getDocs(q);
    
    console.log('Found', snapshot.docs.length, 'questions for date', date);
    const questions = snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreQuestion;
      console.log('Question ID:', doc.id, 'Date:', data.date);
      return data;
    });
    
    return questions;
  } catch (error) {
    console.error('Error fetching questions by date:', error);
    throw error;
  }
}

export async function checkDateAvailability(date: string): Promise<{ available: boolean; questionCount: number }> {
  try {
    console.log('Checking date availability for:', date);
    const questions = await getQuestionsByDate(date);
    const result = {
      available: questions.length < 10,
      questionCount: questions.length
    };
    console.log('Date availability result:', result);
    return result;
  } catch (error) {
    console.error('Error checking date availability:', error);
    return {
      available: false,
      questionCount: 0
    };
  }
}

export async function findNextAvailableDate(startDate?: Date): Promise<string> {
  const start = startDate || new Date();
  let checkDate = new Date(start);
  
  // Check the next 30 days for availability
  for (let i = 0; i < 30; i++) {
    const dateStr = checkDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
    
    const { available } = await checkDateAvailability(dateStr);
    if (available) {
      return dateStr;
    }
    
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  // If no available date found, return today's date
  return start.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
}

export async function getAllQuestions(): Promise<FirestoreQuestion[]> {
  try {
    console.log('Fetching all questions...');
    
    // Ensure we're authenticated
    await ensureAuthenticated();
    
    const questionsRef = collection(db, 'questions');
    const q = query(questionsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    console.log('Total questions found:', snapshot.docs.length);
    return snapshot.docs.map(doc => doc.data() as FirestoreQuestion);
  } catch (error) {
    console.error('Error fetching all questions:', error);
    throw error;
  }
}

export async function getQuestionsByTag(tag: string): Promise<FirestoreQuestion[]> {
  const tagQuestionsRef = collection(db, 'tags', tag, 'questions');
  const snapshot = await getDocs(tagQuestionsRef);
  
  const questionIds = snapshot.docs.map(doc => doc.data().questionId);
  
  // Fetch the actual question documents
  const questions = await Promise.all(
    questionIds.map(async (id) => {
      const questionDoc = await getDoc(doc(db, 'questions', id));
      return questionDoc.data() as FirestoreQuestion;
    })
  );
  
  return questions;
}

export async function getAvailableTags(): Promise<string[]> {
  const tagsRef = collection(db, 'tags');
  const snapshot = await getDocs(tagsRef);
  
  return snapshot.docs.map(doc => doc.id);
}

// Statistics
export async function getQuestionStatistics(): Promise<QuestionStats> {
  const questions = await getAllQuestions();
  
  const difficulties = questions.map(q => q.difficulty);
  const averageDifficulty = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
  
  const distribution = {
    easy: difficulties.filter(d => d <= 25).length,
    medium: difficulties.filter(d => d > 25 && d <= 50).length,
    hard: difficulties.filter(d => d > 50 && d <= 75).length,
    expert: difficulties.filter(d => d > 75).length
  };
  
  return {
    totalQuestions: questions.length,
    averageDifficulty: Math.round(averageDifficulty * 10) / 10,
    difficultyDistribution: distribution
  };
}

// Search questions
export async function searchQuestions(
  searchTerm: string,
  filters?: {
    tags?: string[];
    dateRange?: { start: string; end: string };
    difficultyRange?: { min: number; max: number };
  }
): Promise<FirestoreQuestion[]> {
  let questions = await getAllQuestions();
  
  // Text search
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    questions = questions.filter(q => 
      q.question.toLowerCase().includes(term) ||
      q.answer.toLowerCase().includes(term) ||
      q.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }
  
  // Apply filters
  if (filters?.tags?.length) {
    questions = questions.filter(q => 
      filters.tags!.some(tag => q.tags.includes(tag))
    );
  }
  
  if (filters?.dateRange) {
    questions = questions.filter(q => 
      q.date >= filters.dateRange!.start && q.date <= filters.dateRange!.end
    );
  }
  
  if (filters?.difficultyRange) {
    questions = questions.filter(q => 
      q.difficulty >= filters.difficultyRange!.min && 
      q.difficulty <= filters.difficultyRange!.max
    );
  }
  
  return questions;
} 