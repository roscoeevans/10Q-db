import { useState, useEffect } from 'react';
import { Brain, Calendar, CheckCircle, Upload, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateQuestionsWithAI } from '../lib/firestore';
import { uploadDailyQuestions, findNextAvailableDate, checkDateAvailability } from '../lib/firestore-admin';
import { type QuestionUpload } from '../lib/firestore-admin';

type Step = 1 | 2 | 3 | 'uploading' | 'success' | 'error';

interface SetupData {
  targetDate: string;
  theme: string;
}

interface GeneratedQuestion extends QuestionUpload {
  isCorrectAnswerFirst: boolean;
}

// Step component interfaces
interface StepIndicatorProps {
  currentStep: Step;
}

interface Step1SetupProps {
  setupData: SetupData;
  setSetupData: (data: SetupData | ((prev: SetupData) => SetupData)) => void;
  error: string;
  dateStatus: { available: boolean; questionCount: number } | null;
  checkingDate: boolean;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  selectedDate: Date | null;
  generating: boolean;
  handleDateInputClick: () => void;
  handleGenerateQuestions: () => void;
  checkDateStatus: (date: string) => void;
  handleDateSelect: (date: Date) => void;
  generateCalendarDays: () => Date[];
  navigateMonth: (direction: 'prev' | 'next') => void;
  isToday: (date: Date) => boolean;
  isSelected: (date: Date) => boolean;
  isCurrentMonth: (date: Date) => boolean;
}



// Step Components (moved outside main component to prevent recreation)
const StepIndicator = ({ currentStep, setCurrentStep }: StepIndicatorProps & { setCurrentStep: (step: Step) => void }) => {
  // Don't show step indicator for upload states
  if (currentStep === 'uploading' || currentStep === 'success' || currentStep === 'error') {
    return null;
  }

  const isStepActive = (step: number) => {
    if (typeof currentStep === 'number') {
      return currentStep >= step;
    }
    return ['uploading', 'success', 'error'].includes(currentStep);
  };

  const isStepComplete = (step: number) => {
    if (typeof currentStep === 'number') {
      return currentStep > step;
    }
    return ['uploading', 'success', 'error'].includes(currentStep);
  };

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step as Step)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors hover:scale-105 active:scale-95",
                isStepActive(step)
                  ? "bg-ios-blue text-white hover:bg-ios-blue/80" 
                  : "bg-ios-gray-200 dark:bg-ios-gray-700 text-ios-gray-600 dark:text-ios-gray-400 hover:bg-ios-gray-300 dark:hover:bg-ios-gray-600"
              )}
            >
              {step}
            </button>
            {step < 3 && (
              <div className={cn(
                "w-12 h-0.5 mx-2",
                isStepComplete(step)
                  ? "bg-ios-blue" 
                  : "bg-ios-gray-200 dark:bg-ios-gray-700"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Step1Setup = ({ 
  setupData, 
  setSetupData, 
  error, 
  dateStatus, 
  checkingDate, 
  showCalendar, 
  setShowCalendar,
  selectedDate,
  generating,
  handleDateInputClick,
  handleGenerateQuestions,
  checkDateStatus,
  handleDateSelect,
  generateCalendarDays,
  navigateMonth,
  isToday,
  isSelected,
  isCurrentMonth
}: Step1SetupProps) => (
  <div className="glass-card p-6 max-w-2xl mx-auto" style={{ overflow: 'visible' }}>
    <div className="text-center mb-6">
      <Calendar className="w-12 h-12 text-ios-blue mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Create a Quiz</h2>
      <p className="text-ios-gray-600 dark:text-ios-gray-400">
        Choose a date and theme for your 10-question quiz
      </p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Target Date</label>
        <div className="relative" style={{ overflow: 'visible' }}>
          <input
            type="text"
            value={setupData.targetDate}
            onChange={(e) => {
              setSetupData(prev => ({ ...prev, targetDate: e.target.value }));
              checkDateStatus(e.target.value);
            }}
            onClick={handleDateInputClick}
            placeholder="MM-DD-YYYY"
            className="ios-input w-full cursor-pointer date-input"
            readOnly
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ios-gray-400" />
        </div>
        
        {showCalendar && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowCalendar(false)}>
            <div 
              className="bg-white dark:bg-ios-gray-800 rounded-2xl shadow-2xl calendar-container w-80 animate-slide-up" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-center text-ios-gray-900 dark:text-ios-gray-100 mb-4">Select Date</h3>
              </div>
              <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-ios-gray-100 dark:bg-ios-gray-700 hover:bg-ios-gray-200 dark:hover:bg-ios-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 className="text-base font-semibold text-ios-gray-900 dark:text-ios-gray-100">
                  {selectedDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <button
                  onClick={() => navigateMonth('next')}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-ios-gray-100 dark:bg-ios-gray-700 hover:bg-ios-gray-200 dark:hover:bg-ios-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-center text-ios-gray-500 dark:text-ios-gray-400 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={cn(
                      "w-8 h-8 text-sm rounded-lg flex items-center justify-center font-medium transition-all duration-200",
                      !isCurrentMonth(date) && "text-ios-gray-300 dark:text-ios-gray-600",
                      isCurrentMonth(date) && !isToday(date) && !isSelected(date) && "text-ios-gray-700 dark:text-ios-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700",
                      isToday(date) && !isSelected(date) && "bg-ios-blue/10 text-ios-blue border border-ios-blue/20",
                      isSelected(date) && "bg-ios-blue text-white shadow-md"
                    )}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-1">
          {checkingDate ? (
            <div className="flex items-center gap-1 text-xs text-ios-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              Checking availability...
            </div>
          ) : dateStatus ? (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              dateStatus.available 
                ? "text-ios-green" 
                : "text-ios-red"
            )}>
              {dateStatus.available ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Nearest day without a full quiz
                </>
              ) : (
                <>
                  <span className="text-ios-red">×</span>
                  {dateStatus.questionCount}/10 questions already uploaded
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-ios-gray-500">
              Finding next available date...
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Theme</label>
        <input
          type="text"
          value={setupData.theme}
          onChange={(e) => setSetupData(prev => ({ ...prev, theme: e.target.value }))}
          placeholder="e.g., World History, Science, Literature, Pop Culture..."
          className="ios-input w-full"
        />
        <p className="text-xs text-ios-gray-500 mt-1">
          Questions will be generated based on this theme
        </p>
      </div>

      {error && (
        <div className="bg-ios-red/10 border border-ios-red/20 rounded-lg p-3">
          <p className="text-ios-red text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleGenerateQuestions}
        disabled={!setupData.targetDate || !setupData.theme.trim() || generating}
        className="ios-button w-full flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Questions...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4" />
            Generate Questions
          </>
        )}
      </button>
    </div>
  </div>
);

interface Step2GeneratingProps {
  generating: boolean;
  generatedQuestions: GeneratedQuestion[];
  error: string;
  theme: string;
  setCurrentStep: (step: Step) => void;
  updateQuestion: (index: number, field: keyof GeneratedQuestion, value: any) => void;
  updateChoice: (questionIndex: number, choiceIndex: number, value: string) => void;
  setCorrectAnswer: (questionIndex: number, choiceIndex: number) => void;
  updateTags: (questionIndex: number, tags: string[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  approvedQuestions: Set<number>;
  approveQuestion: (index: number) => void;
}

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
  approveQuestion
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

          <div className="text-center">
            {!isCurrentQuestionApproved ? (
              <button
                onClick={handleApprove}
                className="bg-ios-green hover:bg-ios-green/80 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
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
          <div className="ios-list-item">
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
                          currentQuestion.answer === choice
                            ? "border-ios-green bg-ios-green"
                            : "border-ios-gray-300 dark:border-ios-gray-600"
                        )}
                      >
                        {currentQuestion.answer === choice && (
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


      </div>
    </div>
  );
};

interface Step3ConfirmationProps {
  generatedQuestions: GeneratedQuestion[];
  error: string;
  targetDate: string;
  theme: string;
  setCurrentStep: (step: Step) => void;
  handleUploadQuestions: () => void;
  approvedQuestions: Set<number>;
}

const Step3Confirmation = ({ 
  generatedQuestions, 
  error, 
  targetDate,
  theme,
  setCurrentStep,
  handleUploadQuestions,
  approvedQuestions
}: Step3ConfirmationProps) => {
  const approvedCount = approvedQuestions.size;
  const allQuestionsApproved = approvedCount === generatedQuestions.length;
  
  return (
  <div className="space-y-6">
    <div className="glass-card p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        {allQuestionsApproved ? (
          <>
            <CheckCircle className="w-16 h-16 text-ios-green mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ready to Upload</h2>
            <p className="text-ios-gray-600 dark:text-ios-gray-400">
              Your quiz is ready for upload. Review the details below.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Approval Required</h2>
            <p className="text-yellow-600 dark:text-yellow-400">
              Please approve all {generatedQuestions.length} questions before uploading. 
              Currently {approvedCount} of {generatedQuestions.length} questions are approved.
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-ios-red/10 border border-ios-red/20 rounded-lg p-3 mb-4">
          <p className="text-ios-red text-sm">{error}</p>
        </div>
      )}

      {/* Quiz Summary */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center p-4 bg-ios-gray-50 dark:bg-ios-gray-800 rounded-lg">
          <span className="text-sm font-medium text-ios-gray-600 dark:text-ios-gray-400">Target Date</span>
          <span className="font-semibold">{targetDate}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-ios-gray-50 dark:bg-ios-gray-800 rounded-lg">
          <span className="text-sm font-medium text-ios-gray-600 dark:text-ios-gray-400">Theme</span>
          <span className="font-semibold">"{theme}"</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-ios-gray-50 dark:bg-ios-gray-800 rounded-lg">
          <span className="text-sm font-medium text-ios-gray-600 dark:text-ios-gray-400">Questions</span>
          <span className={cn(
            "font-semibold",
            allQuestionsApproved 
              ? "text-ios-green" 
              : "text-yellow-600 dark:text-yellow-400"
          )}>
            {approvedCount}/10 ready
          </span>
        </div>
      </div>



      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-ios-gray-200 dark:border-ios-gray-700">
        <button
          onClick={() => setCurrentStep(2)}
          className="ios-button-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Edit
        </button>
        
        <button
          onClick={handleUploadQuestions}
          disabled={!allQuestionsApproved}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors",
            allQuestionsApproved
              ? "bg-ios-blue hover:bg-ios-blue/80 text-white"
              : "bg-ios-gray-200 dark:bg-ios-gray-700 text-ios-gray-500 cursor-not-allowed"
          )}
        >
          <Upload className="w-4 h-4" />
          Upload Quiz
        </button>
      </div>
    </div>
  </div>
  );
};

// Upload Loading Screen
const UploadingScreen = ({ 
  targetDate, 
  theme 
}: { 
  targetDate: string; 
  theme: string; 
}) => (
  <div className="glass-card p-6 max-w-md mx-auto text-center">
    <div className="animate-pulse">
      <Upload className="w-16 h-16 text-ios-blue mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4">Uploading Your Quiz</h2>
      <div className="space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-ios-blue mx-auto" />
        <p className="text-ios-gray-600 dark:text-ios-gray-400">
          Uploading "{theme}" quiz for {targetDate}...
        </p>
        <div className="space-y-2">
          <div className="h-2 bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full animate-pulse"></div>
          <div className="h-2 bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full animate-pulse" style={{ width: '80%' }}></div>
          <div className="h-2 bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <p className="text-xs text-ios-gray-500">
          Please don't close this page...
        </p>
      </div>
    </div>
  </div>
);

// Success Screen
const SuccessScreen = ({ 
  generatedQuestions,
  targetDate,
  theme,
  onGenerateAnother
}: {
  generatedQuestions: GeneratedQuestion[];
  targetDate: string;
  theme: string;
  onGenerateAnother: () => void;
}) => (
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
                          choice === question.answer
                            ? "bg-ios-green/10 text-ios-green border border-ios-green/20"
                            : "bg-ios-gray-50 dark:bg-ios-gray-800 text-ios-gray-700 dark:text-ios-gray-300"
                        )}
                      >
                        <span className="font-medium">
                          {String.fromCharCode(65 + choiceIndex)}.
                        </span>
                        <span>{choice}</span>
                        {choice === question.answer && (
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

// Error Screen
const ErrorScreen = ({ 
  error,
  onRetry,
  onGenerateAnother
}: {
  error: string;
  onRetry: () => void;
  onGenerateAnother: () => void;
}) => (
  <div className="glass-card p-6 max-w-md mx-auto text-center">
    <AlertCircle className="w-16 h-16 text-ios-red mx-auto mb-4" />
    <h2 className="text-2xl font-bold mb-4 text-ios-red">Upload Failed</h2>
    <div className="bg-ios-red/10 border border-ios-red/20 rounded-lg p-4 mb-6">
      <p className="text-ios-red text-sm">{error}</p>
    </div>
    <div className="space-y-3">
      <button
        onClick={onRetry}
        className="ios-button w-full flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Try Again
      </button>
      <button
        onClick={onGenerateAnother}
        className="ios-button-secondary w-full flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Start Over
      </button>
    </div>
  </div>
);

export default function QuestionUploadFlow() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [setupData, setSetupData] = useState<SetupData>({
    targetDate: '',
    theme: ''
  });

  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [dateStatus, setDateStatus] = useState<{ available: boolean; questionCount: number } | null>(null);
  const [checkingDate, setCheckingDate] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [approvedQuestions, setApprovedQuestions] = useState<Set<number>>(new Set());



  useEffect(() => {
    suggestNextAvailableDate();
  }, []);

  useEffect(() => {
    if (setupData.targetDate) {
      checkDateStatus(setupData.targetDate);
    }
  }, [setupData.targetDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showCalendar && !target.closest('.calendar-container') && !target.closest('.date-input')) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCalendar]);

  const suggestNextAvailableDate = async () => {
    try {
      const nextAvailableDate = await findNextAvailableDate();
      setSetupData(prev => ({ ...prev, targetDate: nextAvailableDate }));
      
      // Parse the date for the calendar widget
      const [month, day, year] = nextAvailableDate.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    } catch (error) {
      console.error('Error suggesting date:', error);
      // Fallback to today's date if there's an error
      const today = new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
      setSetupData(prev => ({ ...prev, targetDate: today }));
      setSelectedDate(new Date());
    }
  };

  const formatDateForFirestore = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = formatDateForFirestore(date);
    setSetupData(prev => ({ ...prev, targetDate: formattedDate }));
    setShowCalendar(false);
  };

  const generateCalendarDays = () => {
    if (!selectedDate) return [];
    
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
  };

  const isCurrentMonth = (date: Date) => {
    return selectedDate ? date.getMonth() === selectedDate.getMonth() : false;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!selectedDate) return;
    
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };



  const handleDateInputClick = () => {
    setShowCalendar(!showCalendar);
  };

  const validateStep1 = (): boolean => {
    if (!setupData.targetDate) {
      setError('Please select a target date');
      return false;
    }
    
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(setupData.targetDate)) {
      setError('Date must be in MM-DD-YYYY format');
      return false;
    }
    
    if (!setupData.theme.trim()) {
      setError('Please enter a theme');
      return false;
    }
    
    if (dateStatus && !dateStatus.available) {
      setError(`Date ${setupData.targetDate} already has ${dateStatus.questionCount} questions. Please choose a different date.`);
      return false;
    }
    
    setError('');
    return true;
  };

  const checkDateStatus = async (date: string) => {
    if (!date || !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      setDateStatus(null);
      return;
    }
    
    try {
      setCheckingDate(true);
      const status = await checkDateAvailability(date);
      setDateStatus(status);
    } catch (error) {
      console.error('Error checking date status:', error);
      setDateStatus(null);
    } finally {
      setCheckingDate(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!validateStep1()) return;
    
    // Move to step 2 (generation) first
    setCurrentStep(2);
    setGenerating(true);
    setError('');
    
    try {
      // Reset question review state when generating new questions
      setCurrentQuestionIndex(0);
      setApprovedQuestions(new Set());
      
      const response = await generateQuestionsWithAI(setupData.theme, 10);
      
      // Transform to include the isCorrectAnswerFirst flag
      const transformedQuestions: GeneratedQuestion[] = response.map(q => ({
        ...q,
        date: setupData.targetDate,
        isCorrectAnswerFirst: q.answer === q.choices[0]
      }));
      
      setGeneratedQuestions(transformedQuestions);
      // Stay on step 2 to show the generated questions for editing
    } catch (error) {
      console.error('Error generating questions:', error);
      setError('Failed to generate questions. Please try again.');
      // Go back to step 1 on error
      setCurrentStep(1);
    } finally {
      setGenerating(false);
    }
  };

  const validateStep3 = (): boolean => {
    if (generatedQuestions.length !== 10) {
      setError('Exactly 10 questions are required');
      return false;
    }
    
    if (approvedQuestions.size !== 10) {
      setError(`All questions must be approved before upload. Currently ${approvedQuestions.size} of 10 questions are approved.`);
      return false;
    }
    
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is empty`);
        return false;
      }
      
      if (q.choices.length !== 4) {
        setError(`Question ${i + 1} must have exactly 4 choices`);
        return false;
      }
      
      if (q.choices.some(choice => !choice.trim())) {
        setError(`Question ${i + 1} has empty choices`);
        return false;
      }
      
      if (q.tags.length !== 3) {
        setError(`Question ${i + 1} must have exactly 3 tags (broad → subcategory → specific)`);
        return false;
      }
      
      // Check for unique tags within the question
      const uniqueTags = new Set(q.tags.filter(tag => tag.trim()));
      if (uniqueTags.size !== 3) {
        setError(`Question ${i + 1} must have 3 unique tags`);
        return false;
      }
      
      // Check if correct answer matches one of the choices
      const choiceIndex = q.choices.findIndex(choice => choice === q.answer);
      if (choiceIndex === -1) {
        setError(`Question ${i + 1} answer doesn't match any choice`);
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const handleUploadQuestions = async () => {
    if (!validateStep3()) return;
    
    try {
      setCurrentStep('uploading');
      setError('');
      
      // Convert back to QuestionUpload format
      const questionsToUpload: QuestionUpload[] = generatedQuestions.map(q => ({
        question: q.question,
        choices: q.choices,
        answer: q.answer,
        date: q.date,
        tags: q.tags
      }));
      
      await uploadDailyQuestions(questionsToUpload, setupData.targetDate);
      
      // Show success screen
      setCurrentStep('success');
    } catch (error) {
      console.error('Error uploading questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload questions. Please try again.');
      setCurrentStep('error');
    }
  };

  const handleGenerateAnother = () => {
    // Reset form
    setSetupData({ targetDate: '', theme: '' });
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
    setApprovedQuestions(new Set());
    setError('');
    setCurrentStep(1);
    suggestNextAvailableDate();
  };

  const handleRetryUpload = () => {
    setCurrentStep(3); // Go back to confirmation step
    setError('');
  };

  const updateQuestion = (index: number, field: keyof GeneratedQuestion, value: any) => {
    setGeneratedQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    setGeneratedQuestions(prev => prev.map((q, i) => {
      if (i === questionIndex) {
        const newChoices = [...q.choices];
        newChoices[choiceIndex] = value;
        return { ...q, choices: newChoices };
      }
      return q;
    }));
  };

  const setCorrectAnswer = (questionIndex: number, choiceIndex: number) => {
    setGeneratedQuestions(prev => prev.map((q, i) => {
      if (i === questionIndex) {
        return { ...q, answer: q.choices[choiceIndex] };
      }
      return q;
    }));
  };

  const updateTags = (questionIndex: number, tags: string[]) => {
    setGeneratedQuestions(prev => prev.map((q, i) => 
      i === questionIndex ? { ...q, tags } : q
    ));
  };

  const approveQuestion = (index: number) => {
    setApprovedQuestions(prev => new Set([...prev, index]));
  };



  return (
    <div className="space-y-6">
      <StepIndicator currentStep={currentStep} setCurrentStep={setCurrentStep} />
      
      {currentStep === 1 && (
        <Step1Setup 
          setupData={setupData}
          setSetupData={setSetupData}
          error={error}
          dateStatus={dateStatus}
          checkingDate={checkingDate}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          selectedDate={selectedDate}
          generating={generating}
          handleDateInputClick={handleDateInputClick}
          handleGenerateQuestions={handleGenerateQuestions}
          checkDateStatus={checkDateStatus}
          handleDateSelect={handleDateSelect}
          generateCalendarDays={generateCalendarDays}
          navigateMonth={navigateMonth}
          isToday={isToday}
          isSelected={isSelected}
          isCurrentMonth={isCurrentMonth}
        />
      )}
      {currentStep === 2 && (
        <Step2Generating 
          generating={generating}
          generatedQuestions={generatedQuestions}
          error={error}
          theme={setupData.theme}
          setCurrentStep={setCurrentStep}
          updateQuestion={updateQuestion}
          updateChoice={updateChoice}
          setCorrectAnswer={setCorrectAnswer}
          updateTags={updateTags}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          approvedQuestions={approvedQuestions}
          approveQuestion={approveQuestion}
        />
      )}
      {currentStep === 3 && (
        <Step3Confirmation 
          generatedQuestions={generatedQuestions}
          error={error}
          targetDate={setupData.targetDate}
          theme={setupData.theme}
          setCurrentStep={setCurrentStep}
          handleUploadQuestions={handleUploadQuestions}
          approvedQuestions={approvedQuestions}
        />
      )}
      {currentStep === 'uploading' && (
        <UploadingScreen 
          targetDate={setupData.targetDate}
          theme={setupData.theme}
        />
      )}
      {currentStep === 'success' && (
        <SuccessScreen 
          generatedQuestions={generatedQuestions}
          targetDate={setupData.targetDate}
          theme={setupData.theme}
          onGenerateAnother={handleGenerateAnother}
        />
      )}
      {currentStep === 'error' && (
        <ErrorScreen 
          error={error}
          onRetry={handleRetryUpload}
          onGenerateAnother={handleGenerateAnother}
        />
      )}
    </div>
  );
} 