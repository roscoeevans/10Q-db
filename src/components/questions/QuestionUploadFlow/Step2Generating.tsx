import { Brain, CheckCircle, ArrowRight, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils/common';
import type { Step2GeneratingProps } from './types';
import DenyModal from './DenyModal';

const Step2Generating = ({ 
  generating, 
  generatedQuestions, 
  error,
  theme,
  setCurrentStep,
  updateQuestion,
  updateChoice,
  setCorrectAnswer,
  updateTags,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  approvedQuestions,
  approveQuestion,
  showDenyModal,
  setShowDenyModal,
  isRegenerating,
  handleDenyQuestion,
  handleRegenerateQuestion
}: Step2GeneratingProps) => {
  // Show loading screen while generating
  if (generating) {
    return (
      <div className="glass-card p-6 max-w-md mx-auto text-center">
        <div className="animate-pulse">
          <Brain className="w-16 h-16 text-ios-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Generating Your Quiz</h2>
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-ios-blue mx-auto" />
            <p className="text-ios-gray-600 dark:text-ios-gray-400">
              Creating questions for "{theme}"...
            </p>
            <div className="space-y-2">
              <div className="h-2 bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full animate-pulse"></div>
              <div className="h-2 bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full animate-pulse" style={{ width: '80%' }}></div>
              <div className="h-2 bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = generatedQuestions[currentQuestionIndex];
  const isCurrentQuestionApproved = approvedQuestions.has(currentQuestionIndex);
  const allQuestionsApproved = approvedQuestions.size === generatedQuestions.length;

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleApprove = () => {
    approveQuestion(currentQuestionIndex);
    // Auto-navigate to next question if not on the last one
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Show editing interface once questions are generated
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Review Generated Questions</h2>
            <p className="text-ios-gray-600 dark:text-ios-gray-400">
              AI generated {generatedQuestions.length} questions for "{theme}". Edit as needed.
            </p>
          </div>
          <button
            onClick={() => setCurrentStep(3)}
            disabled={!allQuestionsApproved}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors",
              allQuestionsApproved
                ? "bg-ios-blue hover:bg-ios-blue/80 text-white"
                : "bg-ios-gray-200 dark:bg-ios-gray-700 text-ios-gray-500 cursor-not-allowed"
            )}
          >
            Finalize
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="bg-ios-red/10 border border-ios-red/20 rounded-lg p-3 mb-4">
            <p className="text-ios-red text-sm">{error}</p>
          </div>
        )}

        {/* Question Counter and Progress */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">
              Question {currentQuestionIndex + 1} of {generatedQuestions.length}
            </span>
            <div className="flex items-center gap-1">
              {generatedQuestions.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    approvedQuestions.has(index) 
                      ? "bg-ios-green" 
                      : index === currentQuestionIndex 
                        ? "bg-ios-blue" 
                        : "bg-ios-gray-300 dark:bg-ios-gray-600"
                  )}
                />
              ))}
            </div>
          </div>
          <span className="text-sm text-ios-gray-600 dark:text-ios-gray-400">
            {approvedQuestions.size}/{generatedQuestions.length} approved
          </span>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
              currentQuestionIndex === 0
                ? "border-ios-gray-200 dark:border-ios-gray-700 text-ios-gray-400 cursor-not-allowed"
                : "border-ios-blue text-ios-blue hover:bg-ios-blue hover:text-white"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            {!isCurrentQuestionApproved ? (
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  className="bg-ios-green hover:bg-ios-green/80 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={handleDenyQuestion}
                  disabled={isRegenerating}
                  className="bg-ios-red hover:bg-ios-red/80 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Deny
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-ios-green/10 text-ios-green border border-ios-green/20">
                <CheckCircle className="w-4 h-4" />
                Approved
              </span>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === generatedQuestions.length - 1}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
              currentQuestionIndex === generatedQuestions.length - 1
                ? "border-ios-gray-200 dark:border-ios-gray-700 text-ios-gray-400 cursor-not-allowed"
                : "border-ios-blue text-ios-blue hover:bg-ios-blue hover:text-white"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className={cn(
            "ios-list-item",
            isRegenerating && "opacity-50 pointer-events-none"
          )}>
            {isRegenerating && (
              <div className="absolute inset-0 bg-white/50 dark:bg-ios-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-ios-blue mx-auto mb-2" />
                  <p className="text-sm text-ios-gray-600 dark:text-ios-gray-400">
                    Regenerating question...
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => updateQuestion(currentQuestionIndex, 'question', e.target.value)}
                  className="ios-textarea w-full"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Choices</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center gap-3">
                      <button
                        onClick={() => setCorrectAnswer(currentQuestionIndex, choiceIndex)}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          currentQuestion.choices.indexOf(currentQuestion.answer) === choiceIndex
                            ? "border-ios-green bg-ios-green"
                            : "border-ios-gray-300 dark:border-ios-gray-600"
                        )}
                      >
                        {currentQuestion.choices.indexOf(currentQuestion.answer) === choiceIndex && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) => updateChoice(currentQuestionIndex, choiceIndex, e.target.value)}
                        className="ios-input flex-1"
                        placeholder={`Choice ${String.fromCharCode(65 + choiceIndex)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Tags</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0, 1, 2].map((tagIndex) => {
                    const tagLabels = ['Broad', 'Subcategory', 'Specific'];
                    const tag = currentQuestion.tags[tagIndex] || '';
                    
                    return (
                      <div key={tagIndex}>
                        <span className="block text-xs text-ios-gray-500 mb-1">
                          {tagLabels[tagIndex]}:
                        </span>
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => {
                            const newTags = [...currentQuestion.tags];
                            newTags[tagIndex] = e.target.value;
                            updateTags(currentQuestionIndex, newTags);
                          }}
                          placeholder={`e.g., ${tagIndex === 0 ? 'Science' : tagIndex === 1 ? 'Physics' : 'Newtonian Mechanics'}`}
                          className="ios-input w-full"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deny Modal */}
        <DenyModal
          isOpen={showDenyModal}
          onClose={() => setShowDenyModal(false)}
          onSubmit={handleRegenerateQuestion}
          isRegenerating={isRegenerating}
          questionText={currentQuestion?.question || ''}
        />

      </div>
    </div>
  );
};

export default Step2Generating; 