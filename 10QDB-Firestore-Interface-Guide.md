# 10QDB Firestore Interface Guide

## Overview
10QDB is an internal tool for managing the 10Q question database. It focuses on the `questions` collection and provides a clean GUI for uploading daily question sets and exploring existing questions.

## Firebase Configuration

### Project Details
- **Project ID**: `q-production-e4848`
- **Database**: Firestore
- **Authentication**: Firebase Auth (Admin-level access required)

### Required Firebase SDK Setup
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "q-production-e4848.firebaseapp.com",
  projectId: "q-production-e4848",
  storageBucket: "q-production-e4848.firebasestorage.app",
  messagingSenderId: "1004209252200",
  appId: "1:1004209252200:web:254c79d46e184a00af58dd",
  measurementId: "G-MC3HT5MY4V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

## Firestore Collections Structure

### 1. Questions Collection (`questions/{questionId}`)
**Primary collection for storing all questions**

#### Document Structure
```typescript
interface FirestoreQuestion {
  id: string;           // Format: "YYYY-MM-DD-qN" (e.g., "2025-05-26-q0")
  question: string;     // The question text
  choices: string[];    // Array of 4 multiple choice options
  answer: string;       // The correct answer (must match choices[0])
  date: string;         // Date in "YYYY-MM-DD" format
  difficulty: number;   // Percentage of users who got it wrong (0.0-100.0)
  lastUsed: string;     // Last date this question was used (empty for new questions)
  tags: string[];       // Array of 1-5 relevant tags
}
```

#### Document ID Format
- **Pattern**: `{date}-q{index}`
- **Example**: `2025-05-26-q0` through `2025-05-26-q9`
- **Rules**: 
  - Exactly 10 questions per date (q0 through q9)
  - Date format: YYYY-MM-DD
  - Questions should increase in difficulty (q0 easiest → q9 hardest)

### 2. Tags Collection (`tags/{tagName}/questions/{questionId}`)
**Subcollection for organizing questions by tags**

#### Structure
```typescript
// tags/{tagName}/questions/{questionId}
{
  questionId: string;  // Reference to the question document
}
```

## Core Operations

### 1. Upload Daily Questions

#### Complete Upload Process
```typescript
import { doc, writeBatch, collection } from 'firebase/firestore';

interface QuestionUpload {
  question: string;
  choices: string[];
  answer: string;
  date: string;
  tags: string[];
}

async function uploadDailyQuestions(
  questions: QuestionUpload[], 
  targetDate: string
): Promise<string> {
  try {
    const batch = writeBatch(db);
    
    // Validate we have exactly 10 questions
    if (questions.length !== 10) {
      throw new Error(`Expected 10 questions, got ${questions.length}`);
    }
    
    // Process each question
    questions.forEach((questionData, index) => {
      const questionId = `${targetDate}-q${index}`;
      
      // Create the question document
      const questionDocRef = doc(db, 'questions', questionId);
      const firestoreQuestion = {
        id: questionId,
        question: questionData.question,
        choices: questionData.choices,
        answer: questionData.answer,
        date: targetDate,
        difficulty: 0, // New questions start at 0
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
    throw error;
  }
}
```

#### Validation Rules
```typescript
function validateQuestion(question: QuestionUpload): void {
  // Check question text
  if (!question.question || question.question.trim().length === 0) {
    throw new Error("Question text is required");
  }
  
  // Check choices
  if (!question.choices || question.choices.length !== 4) {
    throw new Error("Question must have exactly 4 choices");
  }
  
  // Check answer matches first choice
  if (question.answer !== question.choices[0]) {
    throw new Error("Answer must match the first choice");
  }
  
  // Check tags
  if (!question.tags || question.tags.length === 0 || question.tags.length > 5) {
    throw new Error("Question must have 1-5 tags");
  }
  
  // Check date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(question.date)) {
    throw new Error("Date must be in YYYY-MM-DD format");
  }
}
```

### 2. Read Operations

#### Fetch Questions by Date
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';

async function getQuestionsByDate(date: string): Promise<FirestoreQuestion[]> {
  const questionsRef = collection(db, 'questions');
  const q = query(questionsRef, where('date', '==', date));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => doc.data() as FirestoreQuestion);
}
```

#### Fetch All Questions
```typescript
async function getAllQuestions(): Promise<FirestoreQuestion[]> {
  const questionsRef = collection(db, 'questions');
  const snapshot = await getDocs(questionsRef);
  
  return snapshot.docs.map(doc => doc.data() as FirestoreQuestion);
}
```

#### Search Questions by Tags
```typescript
async function getQuestionsByTag(tag: string): Promise<FirestoreQuestion[]> {
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
```

#### Get Available Tags
```typescript
async function getAvailableTags(): Promise<string[]> {
  const tagsRef = collection(db, 'tags');
  const snapshot = await getDocs(tagsRef);
  
  return snapshot.docs.map(doc => doc.id);
}
```

### 3. Question Statistics

#### Get Difficulty Statistics
```typescript
interface QuestionStats {
  totalQuestions: number;
  averageDifficulty: number;
  difficultyDistribution: {
    easy: number;    // 0-25
    medium: number;  // 26-50
    hard: number;    // 51-75
    expert: number;  // 76-100
  };
}

async function getQuestionStatistics(): Promise<QuestionStats> {
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
```

## Security Rules

### Current Firestore Rules for Questions
```javascript
// Questions collection - read-only to authenticated users
match /questions/{questionId} {
  allow read: if request.auth != null;
  
  // Individual question response saving
  match /responses/{userId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

### Recommended Admin Access
For 10QDB, you'll need admin-level access. You can either:
1. **Use Firebase Admin SDK** (recommended for internal tools)
2. **Modify Firestore rules** to allow admin users to write to questions collection
3. **Use custom claims** to mark admin users

## Error Handling

### Common Error Scenarios
```typescript
interface UploadError {
  type: 'VALIDATION' | 'NETWORK' | 'PERMISSION' | 'UNKNOWN';
  message: string;
  details?: any;
}

function handleUploadError(error: any): UploadError {
  if (error.code === 'permission-denied') {
    return {
      type: 'PERMISSION',
      message: 'Admin access required to upload questions'
    };
  }
  
  if (error.code === 'unavailable') {
    return {
      type: 'NETWORK',
      message: 'Network error - please try again'
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: error.message || 'Unknown error occurred'
  };
}
```

## Best Practices

### 1. Question Creation Guidelines
- **Difficulty Progression**: q0 (easiest) → q9 (hardest)
- **Answer Format**: Correct answer must be `choices[0]`
- **Tag Selection**: Use 1-5 relevant, specific tags
- **Question Quality**: Mix trivia with thought-provoking questions

### 2. Date Management
- **Format**: Always use YYYY-MM-DD
- **Timezone**: Questions go live at 9:00 AM EST
- **Planning**: Upload questions at least 1 day in advance

### 3. Batch Operations
- Always use `writeBatch` for multiple document operations
- Validate all data before committing
- Handle partial failures gracefully

### 4. Performance Considerations
- Use pagination for large question sets
- Cache frequently accessed data
- Use indexes for tag-based queries

## Example Usage for 10QDB

```typescript
// Example: Upload a daily question set
const dailyQuestions: QuestionUpload[] = [
  {
    question: "What is the capital of France?",
    choices: ["Paris", "London", "Berlin", "Madrid"],
    answer: "Paris",
    date: "2025-05-26",
    tags: ["Geography", "Europe", "Capitals"]
  },
  // ... 9 more questions
];

try {
  const result = await uploadDailyQuestions(dailyQuestions, "2025-05-26");
  console.log(result); // "Successfully uploaded 10 questions for 2025-05-26"
} catch (error) {
  console.error("Upload failed:", error);
}
```

## Additional Features (Nice to Have)

### 1. Question Difficulty Analysis
```typescript
async function getDifficultyAnalysis(): Promise<{
  hardestQuestions: FirestoreQuestion[];
  easiestQuestions: FirestoreQuestion[];
  difficultyTrends: { date: string; avgDifficulty: number }[];
}> {
  const questions = await getAllQuestions();
  
  // Sort by difficulty
  const sortedByDifficulty = questions.sort((a, b) => b.difficulty - a.difficulty);
  
  return {
    hardestQuestions: sortedByDifficulty.slice(0, 10),
    easiestQuestions: sortedByDifficulty.slice(-10).reverse(),
    difficultyTrends: calculateDifficultyTrends(questions)
  };
}
```

### 2. Tag Analytics
```typescript
async function getTagAnalytics(): Promise<{
  mostUsedTags: { tag: string; count: number }[];
  tagDifficultyMap: { [tag: string]: number };
}> {
  const questions = await getAllQuestions();
  const tagCounts: { [tag: string]: number } = {};
  const tagDifficulties: { [tag: string]: number[] } = {};
  
  questions.forEach(q => {
    q.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      if (!tagDifficulties[tag]) tagDifficulties[tag] = [];
      tagDifficulties[tag].push(q.difficulty);
    });
  });
  
  const mostUsedTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
    
  const tagDifficultyMap = Object.entries(tagDifficulties).reduce((acc, [tag, difficulties]) => {
    acc[tag] = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
    return acc;
  }, {} as { [tag: string]: number });
  
  return { mostUsedTags, tagDifficultyMap };
}
```

### 3. Question Search and Filtering
```typescript
async function searchQuestions(
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
```

This guide provides everything you need to build 10QDB with full access to the existing Firestore questions collection. The focus is on the upload process and exploration features, while maintaining compatibility with the existing 10Q app infrastructure. 