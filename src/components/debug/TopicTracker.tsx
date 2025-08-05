import React, { useState, useEffect } from 'react';
import { 
  getTopicHistory, 
  getTopicStats, 
  suggestTopics, 
  checkTopicFrequency,
  type TopicHistory,
  type TopicStats 
} from '../../lib/firestore';

const TopicTracker: React.FC = () => {
  const [topicHistory, setTopicHistory] = useState<TopicHistory[]>([]);
  const [topicStats, setTopicStats] = useState<TopicStats | null>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topicFrequency, setTopicFrequency] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTopicData();
  }, []);

  const loadTopicData = async () => {
    setLoading(true);
    try {
      const [history, stats, suggestions] = await Promise.all([
        getTopicHistory(30),
        getTopicStats(),
        suggestTopics(10)
      ]);
      
      setTopicHistory(history);
      setTopicStats(stats);
      setSuggestedTopics(suggestions);
    } catch (error) {
      console.error('Error loading topic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTopic = async (topic: string) => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const frequency = await checkTopicFrequency(topic);
      setTopicFrequency(frequency);
      setSelectedTopic(topic);
    } catch (error) {
      console.error('Error checking topic frequency:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Topic Tracker</h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading topic data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topic Suggestions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">💡 Suggested Topics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {suggestedTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => checkTopic(topic)}
              className="p-3 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-black"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Checker */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">🔍 Check Topic Frequency</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter a topic to check..."
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => checkTopic(selectedTopic)}
            disabled={!selectedTopic.trim() || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Check
          </button>
        </div>
        
        {topicFrequency && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-black">Results for "{selectedTopic}"</h4>
            <div className="space-y-2 text-sm">
              <div className="text-black">Used <span className="font-semibold">{topicFrequency.usedCount}</span> times in the last 30 days</div>
              {topicFrequency.lastUsed && (
                <div className="text-black">Last used: <span className="font-semibold">{formatDate(topicFrequency.lastUsed)}</span></div>
              )}
              <div className={`font-semibold ${topicFrequency.isTooRecent ? 'text-red-600' : 'text-green-600'}`}>
                {topicFrequency.isTooRecent ? '⚠️ Too recent - consider waiting' : '✅ Good to use'}
              </div>
              <div className="text-black">
                Suggested wait: <span className="font-semibold">{topicFrequency.suggestedWaitDays}</span> days
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Topic History */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">📅 Recent Topic History</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {topicHistory.slice(0, 10).map((entry, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <div className="font-semibold text-black">{entry.topic}</div>
                <div className="text-sm text-black">
                  {entry.questionCount} questions • {formatDate(entry.date)}
                </div>
              </div>
              <div className="text-xs text-black">
                {entry.tags.slice(0, 2).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Used Topics */}
      {topicStats && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">🏆 Most Used Topics</h3>
          <div className="space-y-2">
            {topicStats.mostUsedTopics.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium text-black">{item.topic}</span>
                <span className="text-sm text-black">{item.count} times</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicTracker; 