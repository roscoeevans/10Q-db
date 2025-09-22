import React, { useState } from 'react';
import { uploadDailyQuestions } from '../../lib/firestore-admin';
import { suggestTopics, checkTopicFrequency } from '../../lib/firestore';

const TestTopicTracking: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testTopicSuggestions = async () => {
    setLoading(true);
    try {
      addResult('🔍 Testing topic suggestions...');
      const suggestions = await suggestTopics(5);
      addResult(`✅ Got ${suggestions.length} topic suggestions: ${suggestions.join(', ')}`);
    } catch (error) {
      addResult(`❌ Error getting topic suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testTopicFrequency = async () => {
    setLoading(true);
    try {
      addResult('🔍 Testing topic frequency check...');
      const frequency = await checkTopicFrequency('World History');
      addResult(`✅ Topic frequency check: Used ${frequency.usedCount} times, too recent: ${frequency.isTooRecent}`);
    } catch (error) {
      addResult(`❌ Error checking topic frequency: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testUploadWithTopic = async () => {
    setLoading(true);
    try {
      addResult('📤 Testing upload with topic...');
      
      // Create test questions with topic
      const testQuestions = Array.from({ length: 10 }, (_, i) => ({
        question: `Test question ${i + 1} about World History`,
        choices: ['Correct Answer', 'Wrong Answer 1', 'Wrong Answer 2', 'Wrong Answer 3'],
        answer: 'Correct Answer',
        date: '2024-12-25',
        tags: ['History', 'World', 'Test'],
        topic: 'World History'
      }));

      const result = await uploadDailyQuestions(testQuestions, '2024-12-25', 'World History');
      addResult(`✅ Upload successful: ${result}`);
    } catch (error) {
      addResult(`❌ Error uploading with topic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">🧪 Topic Tracking Tests</h3>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={testTopicSuggestions}
          disabled={loading}
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Test Topic Suggestions
        </button>
        
        <button
          onClick={testTopicFrequency}
          disabled={loading}
          className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Test Topic Frequency Check
        </button>
        
        <button
          onClick={testUploadWithTopic}
          disabled={loading}
          className="w-full p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          Test Upload with Topic
        </button>
        
        <button
          onClick={clearResults}
          className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
          <h4 className="font-semibold mb-2 text-black">Test Results:</h4>
          <div className="space-y-1 text-sm">
            {results.map((result, index) => (
              <div key={index} className="font-mono text-xs text-black">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTopicTracking; 