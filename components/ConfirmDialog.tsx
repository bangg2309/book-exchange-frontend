import React from 'react';
import { FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  icon?: 'warning' | 'success' | 'info' | 'error' | 'none';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmButtonColor = '#4CAF50', // Green by default
  cancelButtonColor = '#9e9e9e', // Gray by default
  icon = 'warning',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  // Render the appropriate icon
  const renderIcon = () => {
    switch (icon) {
      case 'warning':
        return (
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-amber-500 text-3xl" />
          </div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-green-500 text-3xl" />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-500 text-3xl" />
          </div>
        );
      case 'info':
        return (
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-blue-500 text-3xl" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel}></div>
      
      {/* Dialog */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          {renderIcon()}
          
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 border"
              style={{ borderColor: cancelButtonColor, color: cancelButtonColor }}
            >
              {cancelText}
            </button>
            
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-md text-sm font-medium text-white transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: confirmButtonColor }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 