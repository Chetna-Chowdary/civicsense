import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Terminal, Copy, Check } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const BackendModal: React.FC = () => {
  const {
    backendMode,
    setBackendMode,
    fastApiPing,
    pingFastApiBackend,
    isBackendModalOpen,
    setIsBackendModalOpen
  } = useCivic();

  const [isPinging, setIsPinging] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isBackendModalOpen) return null;

  const handlePing = async () => {
    setIsPinging(true);
    await pingFastApiBackend();
    setIsPinging(false);
  };

  const copyCommands = () => {
    const text = `cd backend\npython -m venv venv\n.\\venv\\Scripts\\Activate.ps1\npip install -r requirements.txt\nuvicorn main:app --reload --host 127.0.0.1 --port 8000`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Backend & Model Engine Settings</h2>
          </div>
          <button
            onClick={() => setIsBackendModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Mode Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              Execution Architecture
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBackendMode('embedded')}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  backendMode === 'embedded'
                    ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-semibold text-slate-900 mb-0.5">Embedded ML Engine</div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Active in-browser TF-IDF & probabilistic models. Zero local Python setup required.
                </div>
              </button>

              <button
                onClick={() => setBackendMode('local_fastapi')}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  backendMode === 'local_fastapi'
                    ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-semibold text-slate-900 mb-0.5">Local FastAPI Backend</div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Routes REST calls to Python uvicorn server on <span className="font-mono">127.0.0.1:8000</span>.
                </div>
              </button>
            </div>
          </div>

          {/* FastAPI Status Card */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700">FastAPI Connection Status</div>
              <button
                onClick={handlePing}
                disabled={isPinging}
                className="flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            {fastApiPing ? (
              fastApiPing.connected ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-md">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Connected successfully (latency: {fastApiPing.latency_ms}ms · {fastApiPing.records_loaded} records loaded).
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-md">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Backend Unreachable:</span> {fastApiPing.error}
                    <div className="mt-1 text-[11px] text-rose-600">
                      The web application seamlessly uses the embedded ML engine so you have full functionality without disruption.
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-xs text-slate-500">
                Click "Test Connection" to probe <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">http://127.0.0.1:8000/api/health</code>.
              </div>
            )}
          </div>

          {/* Quick Launch Commands for Windows / VS Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Run FastAPI Locally (VS Code / Windows)
              </span>
              <button
                onClick={copyCommands}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`cd backend
python -m venv venv
.\\venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
# Option A: Streamlit Dashboard (Plotly + Matplotlib)
streamlit run streamlit_app.py
# Option B: FastAPI Server
uvicorn main:app --reload --host 127.0.0.1 --port 8000`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsBackendModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
