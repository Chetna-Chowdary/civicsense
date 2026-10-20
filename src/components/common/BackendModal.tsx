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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#182820]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#FFFDF8] rounded-3xl shadow-2xl border border-[#E7E0D3] w-full max-w-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E7E0D3] flex items-center justify-between bg-[#FBF7EF]">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#15966A]" />
            <h2 className="text-base font-extrabold text-[#182820] font-serif">Backend & Model Engine Settings</h2>
          </div>
          <button
            onClick={() => setIsBackendModalOpen(false)}
            className="p-1 text-[#687568] hover:text-[#182820] rounded-full hover:bg-[#F5EFE6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Mode Switcher */}
          <div>
            <label className="block text-xs font-bold text-[#687568] mb-2 uppercase tracking-wider">
              Execution Architecture
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBackendMode('embedded')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  backendMode === 'embedded'
                    ? 'border-[#15966A] bg-[#DFF2E6]/60 shadow-xs'
                    : 'border-[#E7E0D3] hover:border-[#15966A]/60 bg-[#FBF7EF]'
                }`}
              >
                <div className="font-bold text-[#073D32] mb-0.5">Embedded ML Engine</div>
                <div className="text-xs text-[#687568] leading-relaxed">
                  Active in-browser TF-IDF & probabilistic models. Zero local Python setup required.
                </div>
              </button>

              <button
                onClick={() => setBackendMode('local_fastapi')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  backendMode === 'local_fastapi'
                    ? 'border-[#15966A] bg-[#DFF2E6]/60 shadow-xs'
                    : 'border-[#E7E0D3] hover:border-[#15966A]/60 bg-[#FBF7EF]'
                }`}
              >
                <div className="font-bold text-[#073D32] mb-0.5">Local FastAPI Backend</div>
                <div className="text-xs text-[#687568] leading-relaxed">
                  Routes REST calls to Python uvicorn server on <span className="font-mono font-bold">127.0.0.1:8000</span>.
                </div>
              </button>
            </div>
          </div>

          {/* FastAPI Status Card */}
          <div className="p-4 rounded-2xl bg-[#FBF7EF] border border-[#E7E0D3] space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#182820]">FastAPI Connection Status</div>
              <button
                onClick={handlePing}
                disabled={isPinging}
                className="flex items-center gap-1.5 text-xs text-[#073D32] hover:text-[#15966A] font-bold disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            {fastApiPing ? (
              fastApiPing.connected ? (
                <div className="flex items-center gap-2 text-xs text-[#073D32] bg-[#DFF2E6] border border-[#A3E0C0] p-3 rounded-xl font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#15966A] shrink-0" />
                  <span>
                    Connected successfully (latency: {fastApiPing.latency_ms}ms · {fastApiPing.records_loaded} records loaded).
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-[#A62419] bg-[#FBE2E0] border border-[#F7B7B1] p-3 rounded-xl font-medium">
                  <AlertCircle className="w-4 h-4 text-[#F16B5B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Backend Unreachable:</span> {fastApiPing.error}
                    <div className="mt-1 text-[11px] text-[#A62419]/90">
                      The web application seamlessly uses the embedded ML engine so you have full functionality without disruption.
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-xs text-[#687568]">
                Click "Test Connection" to probe <code className="font-mono bg-[#EAE2D5] px-1.5 py-0.5 rounded">http://127.0.0.1:8000/api/health</code>.
              </div>
            )}
          </div>

          {/* Quick Launch Commands for Windows / VS Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#687568] uppercase tracking-wider">
                Run FastAPI Locally (VS Code / Windows)
              </span>
              <button
                onClick={copyCommands}
                className="flex items-center gap-1 text-xs text-[#073D32] hover:text-[#15966A] font-bold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#15966A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="bg-[#182820] text-[#FFFDF8] p-3.5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-[#0D4E41]">
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
        <div className="px-6 py-4 bg-[#FBF7EF] border-t border-[#E7E0D3] flex justify-end">
          <button
            onClick={() => setIsBackendModalOpen(false)}
            className="px-5 py-2 text-xs font-bold text-white bg-[#073D32] hover:bg-[#0c4e40] rounded-full transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
