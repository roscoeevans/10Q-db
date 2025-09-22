import { useState } from 'react';
import { useAuth } from '../../features/auth';
import { uploadDailyQuestions } from '../../lib/firestore-admin';

export default function TestUpload() {
  const { user, hasPermission } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testUpload = async () => {
    if (!user) {
      setResult('❌ No user authenticated');
      return;
    }

    if (!hasPermission) {
      setResult('❌ User does not have permission');
      return;
    }

    setIsTesting(true);
    setResult('🧪 Testing upload...');

    try {
      // Test question data - exactly 10 questions as required
      const testQuestions = [
        {
          question: "What is the capital of France?",
          choices: ["Paris", "London", "Berlin", "Madrid"],
          answer: "Paris",
          date: "test-date",
          tags: ["geography", "test"]
        },
        {
          question: "What is 2 + 2?",
          choices: ["4", "3", "5", "6"],
          answer: "4",
          date: "test-date",
          tags: ["math", "test"]
        },
        {
          question: "Which planet is closest to the Sun?",
          choices: ["Mercury", "Venus", "Earth", "Mars"],
          answer: "Mercury",
          date: "test-date",
          tags: ["science", "test"]
        },
        {
          question: "What is the largest ocean on Earth?",
          choices: ["Pacific", "Atlantic", "Indian", "Arctic"],
          answer: "Pacific",
          date: "test-date",
          tags: ["geography", "test"]
        },
        {
          question: "Who wrote Romeo and Juliet?",
          choices: ["Shakespeare", "Dickens", "Austen", "Tolstoy"],
          answer: "Shakespeare",
          date: "test-date",
          tags: ["literature", "test"]
        },
        {
          question: "What is the chemical symbol for gold?",
          choices: ["Au", "Ag", "Fe", "Cu"],
          answer: "Au",
          date: "test-date",
          tags: ["science", "test"]
        },
        {
          question: "Which year did World War II end?",
          choices: ["1945", "1944", "1946", "1943"],
          answer: "1945",
          date: "test-date",
          tags: ["history", "test"]
        },
        {
          question: "What is the square root of 16?",
          choices: ["4", "2", "8", "6"],
          answer: "4",
          date: "test-date",
          tags: ["math", "test"]
        },
        {
          question: "Which country is home to the kangaroo?",
          choices: ["Australia", "New Zealand", "South Africa", "India"],
          answer: "Australia",
          date: "test-date",
          tags: ["geography", "test"]
        },
        {
          question: "What is the main component of the Sun?",
          choices: ["Hydrogen", "Helium", "Oxygen", "Carbon"],
          answer: "Hydrogen",
          date: "test-date",
          tags: ["science", "test"]
        }
      ];

      const targetDate = "test-date";
      
      // Attempt upload
      await uploadDailyQuestions(testQuestions, targetDate);
      
      setResult('✅ Upload test successful! Check Firestore to see the 10 test questions.');
      
    } catch (error) {
      console.error('Upload test failed:', error);
      setResult(`❌ Upload test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="glass-card p-4 mb-4">
      <h3 className="text-lg font-semibold text-white mb-2">🧪 Test Upload Functionality</h3>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm">
          <span className="text-gray-400">User:</span> 
          <span className="text-white ml-2">{user?.email || 'Not authenticated'}</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-400">Permission:</span> 
          <span className={`ml-2 ${hasPermission ? 'text-green-400' : 'text-red-400'}`}>
            {hasPermission ? '✅ Granted' : '❌ Denied'}
          </span>
        </p>
      </div>

      <button
        onClick={testUpload}
        disabled={isTesting || !user || !hasPermission}
        className="ios-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTesting ? 'Testing...' : 'Test Upload'}
      </button>

      {result && (
        <div className="mt-4 p-3 rounded-lg bg-ios-gray-800">
          <p className="text-sm whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
} 