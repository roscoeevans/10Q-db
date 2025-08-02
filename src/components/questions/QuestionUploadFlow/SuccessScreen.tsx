import { CheckCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils/common';
import type { SuccessScreenProps } from './types';

const SuccessScreen = ({ 
  generatedQuestions,
  targetDate,
  theme,
  onGenerateAnother
}: SuccessScreenProps) => (
  <div className="space-y-6">
    <div className="glass-card p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircle className="w-20 h-20 text-ios-green mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Quiz Uploaded Successfully! 🎉</h2>
        <p className="text-ios-gray-600 dark:text-ios-gray-400 mb-4">
          Your "{theme}" quiz has been uploaded for {targetDate}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-ios-green/10 text-ios-green rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          10 questions uploaded successfully
        </div>
      </div>

      {/* Uploaded Questions List */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-center">Your Quiz Questions</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto ios-scrollbar">
          {generatedQuestions.map((question, index) => (
            <div key={index} className="ios-list-item">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-ios-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-ios-gray-900 dark:text-ios-gray-100 mb-2">
                    {question.question}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {question.choices.map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg text-sm",
                                                     choiceIndex === question.choices.indexOf(question.answer)
                            ? "bg-ios-green/10 text-ios-green border border-ios-green/20"
                            : "bg-ios-gray-50 dark:bg-ios-gray-800 text-ios-gray-700 dark:text-ios-gray-300"
                        )}
                      >
                        <span className="font-medium">
                          {String.fromCharCode(65 + choiceIndex)}.
                        </span>
                        <span>{choice}</span>
                                                 {choiceIndex === question.choices.indexOf(question.answer) && (
                          <CheckCircle className="w-4 h-4 ml-auto" />
                        )}
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

      {/* Generate Another Quiz Button */}
      <div className="text-center">
        <button
          onClick={onGenerateAnother}
          className="ios-button flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Another Quiz
        </button>
      </div>
    </div>
  </div>
);

export default SuccessScreen; 