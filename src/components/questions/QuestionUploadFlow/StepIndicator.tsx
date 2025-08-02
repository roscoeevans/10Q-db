import { cn } from '../../../lib/utils/common';
import type { StepIndicatorProps } from './types';
import type { Step } from '../../../types/questions';

const StepIndicator = ({ currentStep, setCurrentStep }: StepIndicatorProps) => {
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

export default StepIndicator; 