import { auth, db } from './firebase';
import { aiService } from './ai';
import { generateMainPrompt, generateRegenerationPrompt } from './prompts';
import { getAllQuestions } from './firestore-admin';
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';

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
  topic?: string; // Main topic for the question set
}

export interface QuestionUpload {
  question: string;
  choices: string[]; // NOTE: Correct answer is ALWAYS at index 0
  answer: string;    // Must match choices[0]
  date: string;
  tags: string[];
  topic?: string; // Main topic for the question set
}

export interface TopicHistory {
  topic: string;
  date: string;
  questionCount: number;
  tags: string[];
}

export interface TopicStats {
  totalTopics: number;
  mostUsedTopics: Array<{ topic: string; count: number }>;
  recentTopics: TopicHistory[];
  topicDiversity: number; // 0-1 score of topic variety
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
    // Use the new modular prompt system
    const prompt = generateMainPrompt(topic, count);
    
    console.log('🤖 Generating questions with unified AI service...');
    console.log('📝 Prompt length:', prompt.length, 'characters');
    console.log('🎯 Topic:', topic);
    console.log('📊 Question count:', count);

    const response = await aiService.generateContent(prompt);
    const content = response.text;
    
    if (!content) {
      throw new Error('No content generated from AI');
    }

    console.log('✅ AI response received');
    console.log('🤖 Model used:', response.model);
    console.log('📝 Response length:', content.length, 'characters');
    console.log('📋 Response preview:', content.substring(0, 200) + '...');

    // Enhanced JSON cleaning and parsing
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any leading/trailing text that's not JSON
    const jsonStart = cleanedContent.indexOf('[');
    const jsonEnd = cleanedContent.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
    }
    
    // Clean up common JSON formatting issues
    cleanedContent = cleanedContent
      .replace(/[\u2190\u2192\u2191\u2193\u2194\u2195]/g, '') // Remove all arrow characters
      .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes with regular quotes
      .replace(/[\u2018\u2019]/g, "'") // Replace smart apostrophes
      .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '') // Remove bullet points
      .replace(/[\u2013\u2014]/g, '-') // Replace em/en dashes with regular dash
      .replace(/\n/g, ' ') // Remove newlines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log('🧹 Cleaned JSON for parsing:', cleanedContent.substring(0, 200) + '...');

    // Parse the JSON response with enhanced error handling
    let questions: QuestionUpload[];
    try {
      questions = JSON.parse(cleanedContent) as QuestionUpload[];
      
      // Validate the questions
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      if (questions.length !== count) {
        console.warn(`⚠️ Expected ${count} questions, got ${questions.length}`);
      }
      
      // Validate each question with detailed error messages
      questions.forEach((question, index) => {
        if (!question.question || !question.choices || !question.answer || !question.tags) {
          throw new Error(`Question ${index + 1}: Missing required fields (question, choices, answer, tags)`);
        }
        
        if (question.choices.length !== 4) {
          throw new Error(`Question ${index + 1}: Must have exactly 4 choices, got ${question.choices.length}`);
        }
        
        if (question.tags.length !== 3) {
          throw new Error(`Question ${index + 1}: Must have exactly 3 tags, got ${question.tags.length}`);
        }
        
        // More flexible answer validation - check if answer exists in choices
        const answerExists = question.choices.some(choice => 
          choice.toLowerCase().trim() === question.answer.toLowerCase().trim()
        );
        
        if (!answerExists) {
          // Try to find a close match
          const bestMatch = findBestChoiceMatch(question.answer, question.choices);
          if (bestMatch) {
            console.warn(`⚠️ Question ${index + 1}: Answer "${question.answer}" not found, using best match "${bestMatch}"`);
            question.answer = bestMatch;
          } else {
            throw new Error(`Question ${index + 1}: Answer "${question.answer}" not found in choices: [${question.choices.join(', ')}]`);
          }
        }
        
        // Ensure answer is first choice (move it if needed)
        const answerIndex = question.choices.findIndex(choice => 
          choice.toLowerCase().trim() === question.answer.toLowerCase().trim()
        );
        
        if (answerIndex > 0) {
          console.warn(`⚠️ Question ${index + 1}: Moving answer "${question.answer}" to first position`);
          const answer = question.choices[answerIndex];
          question.choices.splice(answerIndex, 1);
          question.choices.unshift(answer);
        }
        
        // Validate question format (should be a statement, not a question)
        const questionText = question.question.trim();
        const questionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'which'];
        const hasQuestionWord = questionWords.some(word => 
          questionText.toLowerCase().includes(word + ' ')
        );
        const endsWithQuestionMark = questionText.endsWith('?');
        
        if (hasQuestionWord || endsWithQuestionMark) {
          console.warn(`⚠️ Question ${index + 1} is in question format instead of Jeopardy! statement format: "${questionText}"`);
        }
      });
      
      console.log(`✅ Successfully generated ${questions.length} questions with ${response.model}`);
      return questions;
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.error('📝 Raw content:', content);
      console.error('🧹 Cleaned content:', cleanedContent);
      
      // Provide more helpful error messages
      if (parseError instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${parseError.message}. Please check the AI response format.`);
      } else {
        throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error generating questions with AI:', error);
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
    // Use the new modular regeneration prompt
    const prompt = generateRegenerationPrompt(
      topic,
      feedback,
      existingQuestions.map(q => ({ question: q.question, answer: q.answer })),
      questionIndex
    );
    
    console.log('🤖 Regenerating question with modular prompt system...');
    console.log('📝 Feedback:', feedback);
    console.log('🎯 Question index:', questionIndex + 1);

    const response = await aiService.generateContent(prompt);
    const content = response.text;
    
    if (!content) {
      throw new Error('No content generated from AI');
    }

    console.log('✅ AI response received for regeneration');
    console.log('📝 Response length:', content.length, 'characters');

    // Enhanced JSON cleaning and parsing
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any leading/trailing text that's not JSON
    const jsonStart = cleanedContent.indexOf('{');
    const jsonEnd = cleanedContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
    }
    
    // Clean up common JSON formatting issues
    cleanedContent = cleanedContent
      .replace(/[\u2190\u2192\u2191\u2193]/g, '') // Remove arrow characters
      .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes with regular quotes
      .replace(/[\u2018\u2019]/g, "'") // Replace smart apostrophes
      .replace(/\n/g, ' ') // Remove newlines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log('🧹 Cleaned JSON for parsing:', cleanedContent.substring(0, 200) + '...');

    // Parse the JSON response with enhanced error handling
    let question: QuestionUpload;
    try {
      question = JSON.parse(cleanedContent) as QuestionUpload;
      
      // Validate the question with detailed error messages
      if (!question.question || !question.choices || !question.answer || !question.tags) {
        throw new Error('Missing required fields (question, choices, answer, tags)');
      }
      
      if (question.choices.length !== 4) {
        throw new Error(`Must have exactly 4 choices, got ${question.choices.length}`);
      }
      
      if (question.tags.length !== 3) {
        throw new Error(`Must have exactly 3 tags, got ${question.tags.length}`);
      }
      
      if (question.choices[0] !== question.answer) {
        throw new Error(`Answer "${question.answer}" must be first choice "${question.choices[0]}"`);
      }
      
      // Add the date
      question.date = targetDate;
      
      console.log('✅ Successfully regenerated question');
      return question;
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed for regeneration:', parseError);
      console.error('📝 Raw content:', content);
      console.error('🧹 Cleaned content:', cleanedContent);
      
      // Provide more helpful error messages
      if (parseError instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${parseError.message}. Please check the AI response format.`);
      } else {
        throw new Error(`Failed to parse regenerated question: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error regenerating question with AI:', error);
    throw new Error('Failed to regenerate question with AI');
  }
}

// Upload daily questions
export async function uploadDailyQuestions(
  questions: QuestionUpload[], 
  targetDate: string
): Promise<string> {
  try {
    await ensureAuthenticated();
    
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
    const questions = await getQuestionsByDate(date);
    return {
      available: questions.length === 0,
      questionCount: questions.length
    };
  } catch (error) {
    console.error('Error checking date availability:', error);
    throw error;
  }
}

export async function findNextAvailableDate(startDate?: Date): Promise<string> {
  const currentDate = startDate || new Date();
  
  for (let i = 0; i < 365; i++) { // Check up to a year ahead
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() + i);
    
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, '0');
    const day = String(checkDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const availability = await checkDateAvailability(dateString);
    if (availability.available) {
      return dateString;
    }
  }
  
  // Fallback: return tomorrow's date in the new format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

// Topic tracking and management functions
export async function getTopicHistory(daysBack: number = 30): Promise<TopicHistory[]> {
  try {
    await ensureAuthenticated();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const questions = await getAllQuestions();
    
    // If no questions exist, return empty array
    if (questions.length === 0) {
      console.log('📝 No questions found in database');
      return [];
    }
    
    // Group questions by date and extract topic information
    const topicHistory: TopicHistory[] = [];
    const questionsByDate = new Map<string, FirestoreQuestion[]>();
    
    questions.forEach(question => {
      const date = question.date;
      if (!questionsByDate.has(date)) {
        questionsByDate.set(date, []);
      }
      questionsByDate.get(date)!.push(question);
    });
    
    // Process each date's questions
    for (const [date, questions] of questionsByDate) {
      if (questions.length > 0) {
        // Get the most common topic from the question set
        const topics = questions.map(q => q.topic).filter(Boolean) as string[];
        
        // If no topics found, try to infer from tags
        let topic: string | undefined = undefined; // Don't default to 'General'
        if (topics.length > 0) {
          topic = topics[0];
        } else {
          // Try to infer topic from tags
          const allTags = new Set<string>();
          questions.forEach(q => q.tags.forEach(tag => allTags.add(tag)));
          
          // Map common tags to topics
          const tagToTopic: { [key: string]: string } = {
            'History': 'World History',
            'Geography': 'Geography & Travel',
            'Science': 'Science & Technology',
            'Literature': 'Literature & Books',
            'Sports': 'Sports & Athletics',
            'Politics': 'Politics & Government',
            'Pop Culture': 'Pop Culture',
            'Music': 'Music & Musicians',
            'Art': 'Art & Artists',
            'Food': 'Food & Cuisine',
            'Business': 'Business & Economics',
            'Nature': 'Nature & Environment',
            'Mathematics': 'Mathematics'
          };
          
          for (const tag of allTags) {
            if (tagToTopic[tag]) {
              topic = tagToTopic[tag];
              break;
            }
          }
        }
        
        // Get all unique tags from the question set
        const allTags = new Set<string>();
        questions.forEach(q => q.tags.forEach(tag => allTags.add(tag)));
        
        topicHistory.push({
          topic: topic || 'Unknown', // Use 'Unknown' instead of 'General'
          date,
          questionCount: questions.length,
          tags: Array.from(allTags)
        });
      }
    }
    
    // Sort by date (newest first)
    return topicHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error getting topic history:', error);
    // Return empty array instead of throwing
    return [];
  }
}

export async function getTopicStats(): Promise<TopicStats> {
  try {
    const topicHistory = await getTopicHistory(90); // Last 90 days
    
    // Count topic usage
    const topicCounts = new Map<string, number>();
    topicHistory.forEach(entry => {
      const count = topicCounts.get(entry.topic) || 0;
      topicCounts.set(entry.topic, count + 1);
    });
    
    // Get most used topics
    const mostUsedTopics = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate topic diversity (unique topics / total entries)
    const uniqueTopics = new Set(topicHistory.map(entry => entry.topic));
    const topicDiversity = uniqueTopics.size / Math.max(topicHistory.length, 1);
    
    return {
      totalTopics: uniqueTopics.size,
      mostUsedTopics,
      recentTopics: topicHistory.slice(0, 20), // Last 20 entries
      topicDiversity
    };
  } catch (error) {
    console.error('Error getting topic stats:', error);
    throw error;
  }
}

export async function suggestTopics(count: number = 5): Promise<string[]> {
  try {
    const topicStats = await getTopicStats();
    const recentTopics = topicStats.recentTopics.map(entry => entry.topic);
    
    // Define diverse topic categories
    const topicCategories = [
      'World History', 'American History', 'European History', 'Ancient Civilizations',
      'Science & Technology', 'Space & Astronomy', 'Biology & Medicine', 'Chemistry & Physics',
      'Geography & Travel', 'World Capitals', 'Natural Wonders', 'Cultural Landmarks',
      'Literature & Books', 'Movies & TV', 'Music & Musicians', 'Art & Artists',
      'Sports & Athletics', 'Olympic Games', 'Famous Athletes', 'Sports History',
      'Politics & Government', 'World Leaders', 'International Relations', 'Political Systems',
      'Pop Culture', 'Celebrities', 'Fashion & Style', 'Social Media & Internet',
      'Food & Cuisine', 'Cooking & Recipes', 'Restaurants & Chefs', 'Culinary Traditions',
      'Business & Economics', 'Famous Companies', 'Entrepreneurs', 'Economic History',
      'Nature & Environment', 'Animals & Wildlife', 'Climate & Weather', 'Conservation',
      'Mathematics', 'Famous Mathematicians', 'Mathematical Concepts', 'Statistics & Probability'
    ];
    
    // Filter out recently used topics
    const availableTopics = topicCategories.filter(topic => 
      !recentTopics.includes(topic)
    );
    
    // If we don't have enough available topics, include some from recent history
    // but prioritize less frequently used ones
    if (availableTopics.length < count) {
      const lessUsedTopics = topicStats.mostUsedTopics
        .filter(item => item.count <= 2) // Used 2 times or less
        .map(item => item.topic);
      
      availableTopics.push(...lessUsedTopics);
    }
    
    // Shuffle and return the requested number of topics
    const shuffled = availableTopics.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error suggesting topics:', error);
    // Return some default topics if there's an error
    return ['World History', 'Science & Technology', 'Geography & Travel', 'Literature & Books', 'Sports & Athletics'];
  }
}

export async function checkTopicFrequency(topic: string, daysBack: number = 30): Promise<{
  usedCount: number;
  lastUsed: string | null;
  isTooRecent: boolean;
  suggestedWaitDays: number;
}> {
  try {
    const topicHistory = await getTopicHistory(daysBack);
    const topicEntries = topicHistory.filter(entry => entry.topic === topic);
    
    const usedCount = topicEntries.length;
    const lastUsed = topicEntries.length > 0 ? topicEntries[0].date : null;
    
    // Check if topic was used too recently (within last 7 days)
    const isTooRecent = lastUsed ? 
      (new Date().getTime() - new Date(lastUsed).getTime()) < (7 * 24 * 60 * 60 * 1000) : false;
    
    // Suggest wait days based on usage frequency
    let suggestedWaitDays = 7; // Default minimum
    if (usedCount >= 3) {
      suggestedWaitDays = 14; // If used 3+ times, wait 2 weeks
    } else if (usedCount >= 1) {
      suggestedWaitDays = 10; // If used 1-2 times, wait 10 days
    }
    
    return {
      usedCount,
      lastUsed,
      isTooRecent,
      suggestedWaitDays
    };
  } catch (error) {
    console.error('Error checking topic frequency:', error);
    throw error;
  }
}

// Helper function to populate sample topic data
export async function populateSampleTopicData(): Promise<void> {
  try {
    await ensureAuthenticated();
    
    const questions = await getAllQuestions();
    
    if (questions.length === 0) {
      console.log('📝 No questions found to populate topic data');
      return;
    }
    
    console.log(`📝 Found ${questions.length} questions to populate with topic data`);
    
    // Create sample topic data based on existing questions
    const sampleTopics = [
      'World History',
      'Science & Technology', 
      'Geography & Travel',
      'Literature & Books',
      'Sports & Athletics',
      'Pop Culture',
      'Politics & Government',
      'Music & Musicians',
      'Art & Artists',
      'Food & Cuisine'
    ];
    
    // Group questions by date and assign topics
    const questionsByDate = new Map<string, FirestoreQuestion[]>();
    questions.forEach(question => {
      const date = question.date;
      if (!questionsByDate.has(date)) {
        questionsByDate.set(date, []);
      }
      questionsByDate.get(date)!.push(question);
    });
    
    let topicIndex = 0;
    for (const [date, questions] of questionsByDate) {
      const topic = sampleTopics[topicIndex % sampleTopics.length];
      
      console.log(`📝 Assigning topic "${topic}" to questions from ${date}`);
      
      // Update each question with the topic
      for (const question of questions) {
        // Note: This would require a write operation to update existing questions
        // For now, we'll just log what would be updated
        console.log(`   Question: "${question.question.substring(0, 50)}..." → Topic: ${topic}`);
      }
      
      topicIndex++;
    }
    
    console.log('✅ Sample topic data population complete');
    console.log('💡 Note: To actually update existing questions, you would need to implement a write operation');
    
  } catch (error) {
    console.error('❌ Error populating sample topic data:', error);
  }
}