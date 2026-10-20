import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const NotificationToast: React.FC = () => {
  const { notification, dismissNotification } = useCivic();
  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md bg-[#FFFDF8] border border-[#E7E0D3] shadow-xl rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="mt-0.5 shrink-0">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#15966A]" />}
        {isError && <AlertCircle className="w-5 h-5 text-[#F16B5B]" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-[#073D32]" />}
      </div>
      <div className="flex-1 text-xs text-[#182820] leading-relaxed font-medium">
        {notification.text}
      </div>
      <button
        onClick={dismissNotification}
        className="text-[#687568] hover:text-[#182820] transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
