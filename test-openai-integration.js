// Test OpenAI integration
import { aiService } from './src/lib/ai/index.js';

console.log('🧪 Testing OpenAI GPT-4o integration...\n');

// Test 1: Check available models
console.log('1️⃣ Available AI models:');
const availableModels = aiService.getAvailableModels();
console.log('   Available:', availableModels);
console.log('   Default:', aiService.getDefaultModel());

// Test 2: Simple generation test
console.log('\n2️⃣ Testing question generation...');
try {
  const response = await aiService.generateContent(
    'Generate 1 Jeopardy!-style clue for the topic: "Ancient Egypt"\n\n' +
    'Return ONLY a JSON array with this exact structure:\n' +
    '[\n' +
    '  {\n' +
    '    "question": "This city on the Seine is the capital of France.",\n' +
    '    "choices": ["Paris", "London", "Berlin", "Madrid"],\n' +
    '    "answer": "Paris",\n' +
    '    "tags": ["Geography", "Europe", "Capitals"]\n' +
    '  }\n' +
    ']'
  );
  
  console.log('✅ Generation successful!');
  console.log('🤖 Model used:', response.model);
  console.log('📝 Response length:', response.text.length, 'characters');
  console.log('📋 Response preview:', response.text.substring(0, 200) + '...');
  
  if (response.usage) {
    console.log('💰 Token usage:', response.usage);
  }
  
} catch (error) {
  console.error('❌ Generation failed:', error.message);
  
  if (error.message.includes('API key')) {
    console.log('\n💡 To fix this:');
    console.log('1. Get your OpenAI API key from https://platform.openai.com/api-keys');
    console.log('2. Add VITE_OPENAI_API_KEY=sk-your-key to your .env.local file');
    console.log('3. Restart your development server');
  }
}

console.log('\n🎉 OpenAI integration test complete!'); 