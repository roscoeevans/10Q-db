import { cn } from '../../lib/utils/common';
import { X } from 'lucide-react';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, title, showCloseButton = true, children, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
        <div
          ref={ref}
          className={cn(
            'bg-white dark:bg-ios-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up',
            className
          )}
          {...props}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 pb-0">
              {title && (
                <h3 className="text-lg font-semibold text-ios-gray-900 dark:text-ios-gray-100">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-ios-gray-100 dark:bg-ios-gray-700 hover:bg-ios-gray-200 dark:hover:bg-ios-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal; 