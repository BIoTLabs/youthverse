import { useState, useEffect, useCallback } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { YouthWorksLogo } from '@/components/YouthWorksLogo';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'yw-pwa-dismissed';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show after delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(DISMISS_KEY, 'true');
  }, []);

  if (isStandalone || !showPrompt) return null;

  const showIOSInstructions = isIOS && !deferredPrompt;
  const showInstallButton = !!deferredPrompt;

  if (!showIOSInstructions && !showInstallButton) {
    // Non-iOS browser that doesn't support install prompt — check after delay
    // Still show for iOS
    if (!isIOS) return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-elevated p-4">
            {/* Glow accent */}
            <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <YouthWorksLogo size="sm" showText={false} />
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-sm text-foreground">
                  Install YouthWorks
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {showIOSInstructions
                    ? 'Add to your home screen for the full app experience.'
                    : 'Get quick access and a native app experience.'}
                </p>

                <div className="mt-3">
                  {showInstallButton ? (
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      className="h-8 gap-1.5 text-xs font-semibold rounded-lg"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Install App
                    </Button>
                  ) : showIOSInstructions ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Tap</span>
                      <Share className="h-3.5 w-3.5 text-primary" />
                      <span>then <strong className="text-foreground">"Add to Home Screen"</strong></span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
