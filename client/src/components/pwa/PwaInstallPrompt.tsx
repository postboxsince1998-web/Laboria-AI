import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 max-w-md z-50 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Install Laboria AI App</h4>
            <p className="text-xs text-slate-300 mt-0.5">Add to Home Screen for fast mobile access & offline support.</p>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          aria-label="Close PWA Banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setShowPrompt(false)} className="text-xs text-slate-400">
          Not Now
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleInstallClick}
          className="text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 min-h-[36px]"
        >
          <Download className="w-3.5 h-3.5" /> Install App
        </Button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
