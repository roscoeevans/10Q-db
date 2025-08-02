import { Search, Database, Calendar } from 'lucide-react';
import type { FirestoreQuestion } from '../types/questions';
import { formatDate } from '../lib/utils/date';

interface ExplorePageProps {
  questions: FirestoreQuestion[];
  loading: boolean;
}

const ExplorePage = ({ questions, loading }: ExplorePageProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">Explore Questions</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-ios-gray-200 dark:bg-ios-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-ios-gray-200 dark:bg-ios-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-ios-gray-200 dark:bg-ios-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-ios-blue" />
          <h2 className="text-2xl font-bold">Explore Questions</h2>
        </div>
        
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Questions Found</h3>
            <p className="text-ios-gray-600 dark:text-ios-gray-400">
              Start by uploading some questions to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-ios-gray-600 dark:text-ios-gray-400">
                Showing {questions.length} questions
              </p>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto ios-scrollbar">
              {questions.map((question) => (
                <div key={question.id} className="ios-list-item">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-ios-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                      Q
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-ios-gray-400" />
                        <span className="text-sm text-ios-gray-500 dark:text-ios-gray-400">
                          {formatDate(question.date)}
                        </span>
                        <span className="text-sm text-ios-gray-500 dark:text-ios-gray-400">•</span>
                        <span className="text-sm text-ios-gray-500 dark:text-ios-gray-400">
                          {question.theme}
                        </span>
                      </div>
                      <h4 className="font-medium text-ios-gray-900 dark:text-ios-gray-100 mb-2">
                        {question.question}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {question.choices.map((choice, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                              index === question.correctAnswer
                                ? "bg-ios-green/10 text-ios-green border border-ios-green/20"
                                : "bg-ios-gray-50 dark:bg-ios-gray-800 text-ios-gray-700 dark:text-ios-gray-300"
                            }`}
                          >
                            <span className="font-medium">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span>{choice}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {question.tags.map(tag => (
                          <span key={tag} className="ios-badge text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage; 