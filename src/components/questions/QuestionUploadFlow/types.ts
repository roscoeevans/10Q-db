import type { Step, GeneratedQuestion, SetupData, DateStatus } from '../../../types/questions';

// Step component interfaces
export interface StepIndicatorProps {
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
}

export interface Step1SetupProps {
  setupData: SetupData;
  setSetupData: (data: SetupData | ((prev: SetupData) => SetupData)) => void;
  error: string;
  dateStatus: DateStatus | null;
  checkingDate: boolean;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  selectedDate: Date | null;
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

export interface Step2GeneratingProps {
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
  showDenyModal: boolean;
  setShowDenyModal: (show: boolean) => void;
  isRegenerating: boolean;
  handleDenyQuestion: () => void;
  handleRegenerateQuestion: (feedback: string) => void;
}

export interface Step3ConfirmationProps {
  generatedQuestions: GeneratedQuestion[];
  error: string;
  targetDate: string;
  theme: string;
  setCurrentStep: (step: Step) => void;
  handleUploadQuestions: () => void;
  approvedQuestions: Set<number>;
}

// Deny Modal Component
export interface DenyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  isRegenerating: boolean;
  questionText: string;
}

// Uploading and Success screens
export interface UploadingScreenProps {
  targetDate: string;
  theme: string;
}

export interface SuccessScreenProps {
  generatedQuestions: GeneratedQuestion[];
  targetDate: string;
  theme: string;
  onGenerateAnother: () => void;
}

export interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
  onGenerateAnother: () => void;
} 