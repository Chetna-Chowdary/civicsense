import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const NotificationToast: React.FC = () => {
  const { notification, dismissNotification } = useCivic();
  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md bg-white border border-slate-200 shadow-lg rounded-xl p-3.5 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="mt-0.5 shrink-0">
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        {isError && <AlertCircle className="w-4 h-4 text-rose-600" />}
        {!isSuccess && !isError && <Info className="w-4 h-4 text-teal-600" />}
      </div>
      <div className="flex-1 text-xs text-slate-800 leading-relaxed font-medium">
        {notification.text}
      </div>
      <button
        onClick={dismissNotification}
        className="text-slate-400 hover:text-slate-700 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
