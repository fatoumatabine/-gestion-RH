import React from 'react';
import { createPortal } from 'react-dom';
import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: ToastProps[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="flex flex-col items-end justify-start min-h-screen pt-4 px-4 pb-6 sm:p-6">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ToastContainer;