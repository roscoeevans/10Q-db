import React, { useState, useEffect } from 'react';
import { getQuestionsByDate } from '../../lib/firestore-admin';

interface QuizDay {
  date: string;
  hasQuiz: boolean;
  topic?: string;
  questionCount?: number;
}

const QuizCalendar: React.FC = () => {
  const [quizDays, setQuizDays] = useState<QuizDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const nextFourWeeks: QuizDay[] = [];
      
      // Generate next 35 days (5 weeks)
      for (let i = 0; i < 35; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const dateStr = date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
        
        // Check if quiz exists for this date
        try {
          const questions = await getQuestionsByDate(dateStr);
          nextFourWeeks.push({
            date: dateStr,
            hasQuiz: questions.length > 0,
            topic: questions.length > 0 ? questions[0]?.topic : undefined,
            questionCount: questions.length
          });
        } catch (error) {
          nextFourWeeks.push({
            date: dateStr,
            hasQuiz: false
          });
        }
      }
      
      setQuizDays(nextFourWeeks);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const [month, day, year] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeekDays = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const createCalendarWeeks = (days: QuizDay[]) => {
    const weeks = [];
    
    // Group days into weeks of 7
    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7);
      weeks.push(week);
    }
    
    return weeks;
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">📅 Quiz Calendar</h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-black">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const weeks = createCalendarWeeks(quizDays);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">📅 Quiz Calendar</h3>
      
      <div className="space-y-4">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h4 className="font-semibold text-black">Week {weekIndex + 1}</h4>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {week.map((quizDay, dayIndex) => (
                <div key={dayIndex} className="bg-white p-2 min-h-[80px]">
                  <div className="text-xs font-medium text-black mb-1">
                    {formatDate(quizDay.date)}
                  </div>
                  
                  {quizDay.hasQuiz ? (
                    <div className="text-xs">
                      <div className="font-semibold text-green-600 mb-1">
                        ✅ Quiz Ready
                      </div>
                      {quizDay.topic && quizDay.topic !== 'General' && quizDay.topic !== 'Unknown' && (
                        <div className="text-black truncate" title={quizDay.topic}>
                          {quizDay.topic}
                        </div>
                      )}
                      {quizDay.questionCount && (
                        <div className="text-gray-600 text-xs">
                          {quizDay.questionCount} questions
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">
                      No quiz yet
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Quiz available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
          <span>No quiz yet</span>
        </div>
      </div>
    </div>
  );
};

export default QuizCalendar; 