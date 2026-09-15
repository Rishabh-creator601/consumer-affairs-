import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#083344]/50 p-4 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        ref={modalRef}
        className={`w-full ${sizeClasses[size]} bg-white rounded-xl shadow-xl overflow-hidden transition-all transform scale-100 border border-[#06B6D4]/20`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-[#ECFEFF] bg-white">
          <h3 className="text-lg font-semibold text-[#083344]">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[#06B6D4] hover:bg-[#ECFEFF] p-1 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 max-h-[80vh] overflow-y-auto bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
