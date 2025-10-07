import { Calendar, CheckCircle, Brain, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils/common';
import type { Step1SetupProps } from './types';

const Step1Setup = ({ 
  setupData, 
  setSetupData, 
  error, 
  dateStatus, 
  checkingDate, 
  showCalendar, 
  setShowCalendar,
  selectedDate,
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
            placeholder="YYYY-MM-DD"
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
        disabled={!setupData.targetDate || !setupData.theme.trim()}
        className="ios-button w-full flex items-center justify-center gap-2"
      >
        <Brain className="w-4 h-4" />
        Generate Questions
      </button>
    </div>
  </div>
);

export default Step1Setup; 