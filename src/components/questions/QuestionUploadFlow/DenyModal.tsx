import { useState } from 'react';
import { X, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils/common';
import type { DenyModalProps } from './types';

const DenyModal = ({ isOpen, onClose, onSubmit, isRegenerating, questionText }: DenyModalProps) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback.trim());
      setFeedback('');
    }
  };

  const handleClose = () => {
    setFeedback('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-ios-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ios-gray-900 dark:text-ios-gray-100">
              Provide Feedback
            </h3>
            <button
              onClick={handleClose}
              disabled={isRegenerating}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-ios-gray-100 dark:bg-ios-gray-700 hover:bg-ios-gray-200 dark:hover:bg-ios-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-ios-gray-600 dark:text-ios-gray-400 mb-3">
              What's wrong with this question? Your feedback will help generate a better replacement.
            </p>
            <div className="bg-ios-gray-50 dark:bg-ios-gray-700 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-ios-gray-900 dark:text-ios-gray-100">
                "{questionText}"
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-ios-gray-900 dark:text-ios-gray-100">
              Your Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., Too easy, unclear wording, wrong difficulty level, needs more context..."
              className="ios-textarea w-full"
              rows={4}
              disabled={isRegenerating}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isRegenerating}
              className="flex-1 ios-button-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!feedback.trim() || isRegenerating}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                !feedback.trim() || isRegenerating
                  ? "bg-ios-gray-200 dark:bg-ios-gray-700 text-ios-gray-500 cursor-not-allowed"
                  : "bg-ios-red hover:bg-ios-red/80 text-white"
              )}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DenyModal; 