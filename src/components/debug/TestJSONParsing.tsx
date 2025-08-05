import React, { useState } from 'react';
import { generateQuestionsWithAI } from '../../lib/firestore';

const TestJSONParsing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testJSONParsing = async () => {
    setLoading(true);
    try {
      addResult('🧪 Testing JSON parsing with improved validation...');
      addResult('🎯 Topic: Fashion Accessories');
      
      const questions = await generateQuestionsWithAI('Fashion Accessories', 3);
      
      addResult(`✅ Successfully generated ${questions.length} questions`);
      
      questions.forEach((question, index) => {
        addResult(`📝 Question ${index + 1}: "${question.question}"`);
        addResult(`   Choices: [${question.choices.join(', ')}]`);
        addResult(`   Answer: "${question.answer}"`);
        addResult(`   Tags: [${question.tags.join(', ')}]`);
      });
      
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">🧪 JSON Parsing Test</h3>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={testJSONParsing}
          disabled={loading}
          className="w-full p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          Test JSON Parsing with Fashion Topic
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

export default TestJSONParsing; 