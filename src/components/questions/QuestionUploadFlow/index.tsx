import { useState, useEffect } from 'react';
import { generateQuestionsWithAI, generateSingleQuestionWithFeedback, type QuestionUpload } from '../../../lib/firestore';
import { uploadDailyQuestions, findNextAvailableDate, checkDateAvailability } from '../../../lib/firestore-admin';

import type { Step, GeneratedQuestion, SetupData, DateStatus } from '../../../types/questions';
import StepIndicator from './StepIndicator';
import Step1Setup from './Step1Setup';
import Step2Generating from './Step2Generating';
import Step3Confirmation from './Step3Confirmation';
import UploadingScreen from './UploadingScreen';
import SuccessScreen from './SuccessScreen';
import ErrorScreen from './ErrorScreen';

export default function QuestionUploadFlow() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [setupData, setSetupData] = useState<SetupData>({
    targetDate: '',
    theme: ''
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [approvedQuestions, setApprovedQuestions] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateStatus, setDateStatus] = useState<DateStatus | null>(null);
  const [checkingDate, setCheckingDate] = useState(false);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showCalendar && !target.closest('.calendar-container') && !target.closest('.date-input')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  // Suggest next available date on mount
  useEffect(() => {
    suggestNextAvailableDate();
  }, []);

  const suggestNextAvailableDate = async () => {
    try {
      const nextDateString = await findNextAvailableDate();
      setSetupData(prev => ({ ...prev, targetDate: nextDateString }));
      
      // Parse the date string (MM-DD-YYYY format) to Date object
      const [month, day, year] = nextDateString.split('-').map(Number);
      const nextDate = new Date(year, month - 1, day);
      setSelectedDate(nextDate);
      setCurrentMonth(new Date(year, month - 1, 1));
      checkDateStatus(nextDateString);
    } catch (error) {
      console.error('Error finding next available date:', error);
    }
  };

  const formatDateForFirestore = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = formatDateForFirestore(date);
    setSetupData(prev => ({ ...prev, targetDate: formattedDate }));
    setSelectedDate(date);
    setShowCalendar(false);
    checkDateStatus(formattedDate);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateInputClick = () => {
    setShowCalendar(true);
  };

  const validateStep1 = (): boolean => {
    if (!setupData.targetDate.trim()) {
      setError('Please select a target date');
      return false;
    }
    if (!setupData.theme.trim()) {
      setError('Please enter a theme');
      return false;
    }
    if (dateStatus && !dateStatus.available) {
      setError('Selected date is not available');
      return false;
    }
    setError('');
    return true;
  };

  const checkDateStatus = async (date: string) => {
    if (!date.trim()) return;
    
    setCheckingDate(true);
    try {
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

    setGenerating(true);
    setError('');
    
    try {
      const questions = await generateQuestionsWithAI(setupData.theme);
      const generatedQuestions = questions.map((q): GeneratedQuestion => ({
        ...q,
        isCorrectAnswerFirst: q.choices[0] === q.answer
      }));
      setGeneratedQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setApprovedQuestions(new Set());
      setCurrentStep(2);
    } catch (error) {
      console.error('Error generating questions:', error);
      setError('Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const validateStep3 = (): boolean => {
    if (approvedQuestions.size !== generatedQuestions.length) {
      setError('Please approve all questions before uploading');
      return false;
    }
    setError('');
    return true;
  };

  const handleUploadQuestions = async () => {
    if (!validateStep3()) return;

    setCurrentStep('uploading');
    setError('');

    try {
      const approvedQuestionsArray = generatedQuestions
        .filter((_, index) => approvedQuestions.has(index))
        .map((q): QuestionUpload => {
          // Ensure the correct answer is always first in the choices array
          const correctAnswerIndex = q.choices.indexOf(q.answer);
          let reorderedChoices = [...q.choices];
          
          if (correctAnswerIndex > 0) {
            // Move the correct answer to the first position
            const correctAnswer = reorderedChoices[correctAnswerIndex];
            reorderedChoices.splice(correctAnswerIndex, 1);
            reorderedChoices.unshift(correctAnswer);
          }
          
          return {
            question: q.question,
            choices: reorderedChoices,
            answer: reorderedChoices[0], // Answer is always the first choice
            date: q.date,
            tags: q.tags
          };
        });
      await uploadDailyQuestions(approvedQuestionsArray, setupData.targetDate, setupData.theme);
      setCurrentStep('success');
    } catch (error) {
      console.error('Error uploading questions:', error);
      setError('Failed to upload questions. Please try again.');
      setCurrentStep('error');
    }
  };

  const handleGenerateAnother = () => {
    setCurrentStep(1);
    setSetupData({ targetDate: '', theme: '' });
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
    setApprovedQuestions(new Set());
    setError('');
    suggestNextAvailableDate();
  };

  const handleRetryUpload = () => {
    handleUploadQuestions();
  };

  const updateQuestion = (index: number, field: keyof GeneratedQuestion, value: any) => {
    setGeneratedQuestions(prev => 
      prev.map((q, i) => i === index ? { ...q, [field]: value } : q)
    );
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    setGeneratedQuestions(prev => 
      prev.map((q, i) => {
        if (i === questionIndex) {
          const newChoices = [...q.choices];
          newChoices[choiceIndex] = value;
          return { ...q, choices: newChoices };
        }
        return q;
      })
    );
  };

  const setCorrectAnswer = (questionIndex: number, choiceIndex: number) => {
    setGeneratedQuestions(prev => 
      prev.map((q, i) => {
        if (i === questionIndex) {
          // Update the answer to match the selected choice
          const newAnswer = q.choices[choiceIndex];
          return { 
            ...q, 
            answer: newAnswer,
            isCorrectAnswerFirst: choiceIndex === 0 
          };
        }
        return q;
      })
    );
  };

  const updateTags = (questionIndex: number, tags: string[]) => {
    setGeneratedQuestions(prev => 
      prev.map((q, i) => i === questionIndex ? { ...q, tags } : q)
    );
  };

  const approveQuestion = (index: number) => {
    setApprovedQuestions(prev => new Set([...prev, index]));
  };

  const handleDenyQuestion = () => {
    setShowDenyModal(true);
  };

  const handleRegenerateQuestion = async (feedback: string) => {
    setIsRegenerating(true);
    setShowDenyModal(false);
    
    try {
      const existingQuestions = generatedQuestions.map((q): QuestionUpload => ({
        question: q.question,
        choices: q.choices,
        answer: q.answer,
        date: q.date,
        tags: q.tags
      }));
      
      const newQuestion = await generateSingleQuestionWithFeedback(
        setupData.theme,
        feedback,
        existingQuestions,
        currentQuestionIndex,
        setupData.targetDate
      );
      
      const regeneratedQuestion: GeneratedQuestion = {
        ...newQuestion,
        isCorrectAnswerFirst: newQuestion.choices[0] === newQuestion.answer
      };
      
      setGeneratedQuestions(prev => 
        prev.map((q, i) => i === currentQuestionIndex ? regeneratedQuestion : q)
      );
      
      // Remove from approved questions since it's been regenerated
      setApprovedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentQuestionIndex);
        return newSet;
      });
    } catch (error) {
      console.error('Error regenerating question:', error);
      setError('Failed to regenerate question. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
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
            showDenyModal={showDenyModal}
            setShowDenyModal={setShowDenyModal}
            isRegenerating={isRegenerating}
            handleDenyQuestion={handleDenyQuestion}
            handleRegenerateQuestion={handleRegenerateQuestion}
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
    </div>
  );
} 