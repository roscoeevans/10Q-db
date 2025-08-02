import { CheckCircle, ArrowLeft, Upload } from 'lucide-react';
import { cn } from '../../../lib/utils/common';
import type { Step3ConfirmationProps } from './types';

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

export default Step3Confirmation; 