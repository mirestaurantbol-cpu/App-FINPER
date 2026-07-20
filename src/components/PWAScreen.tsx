import React, { useState, useEffect } from 'react';
import { Download, X, Check, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Elegant Inline Finance SVG Logo
export const FinanzasLogoSVG: React.FC<{ className?: string }> = ({ className = "w-20 h-20" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Subtle Outer Glow / Shadow circle */}
    <circle cx="50" cy="50" r="42" fill="rgba(0, 0, 0, 0.04)" />
    
    {/* Elegant Rounded Core Container */}
    <rect x="20" y="20" width="60" height="60" rx="18" fill="white" stroke="#FFE0B2" strokeWidth="1" />
    <rect x="26" y="26" width="48" height="48" rx="14" fill="none" stroke="#FFF3E0" strokeWidth="2.5" />
    
    {/* Dynamic Rising Financial Trend Bars */}
    <rect x="36" y="52" width="6" height="14" rx="2" fill="#FFB74D" />
    <rect x="47" y="42" width="6" height="24" rx="2" fill="#FFA726" />
    <rect x="58" y="32" width="6" height="34" rx="2" fill="#FF5722" />
    
    {/* Sleek Sparkle / Star of growth on the highest bar */}
    <path d="M61,20 L62,23 L65,24 L62,25 L61,28 L60,25 L57,24 L60,23 Z" fill="#FFD54F" />
  </svg>
);

// 1. Splash Screen Component
interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    // Hide splash after 2 seconds with a smooth exit fade
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 400); // match transition duration
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 z-[9999] flex flex-col items-center justify-center p-6 transition-all duration-500 ease-out animate-fade-in">
      <div className="text-center space-y-6 flex flex-col items-center max-w-xs">
        {/* Animated Logo Container */}
        <div className="bg-white/10 p-5 rounded-[32px] backdrop-blur-md shadow-2xl border border-white/20 animate-pulse active:scale-95 transition-all">
          <FinanzasLogoSVG className="w-24 h-24 drop-shadow-xl" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white font-display tracking-tight drop-shadow-sm">
            Finanzas Pro
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-100 font-sans">
            CONTROL DE FINANZAS
          </p>
        </div>

        {/* Loading Spinner & Status */}
        <div className="w-full space-y-2 pt-4">
          <p className="text-[11px] font-bold text-orange-50/80 tracking-wide font-sans animate-pulse">
            Cargando...
          </p>
          <div className="w-36 h-1 bg-white/25 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-white transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Install Banner/Dialog Component
export const InstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (via standalone display mode)
    const checkIsInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkIsInstalled()) {
      return;
    }

    // Check if dismissed recently (several days)
    const dismissedUntil = localStorage.getItem('pwa_install_dismissed_until');
    const isDismissed = dismissedUntil && new Date(dismissedUntil) > new Date();

    // Capture the installation prompt event automatically
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent default browser prompt info-bar
      setDeferredPrompt(e);
      
      // Show immediately if not dismissed recently and not already installed
      if (!isDismissed && !checkIsInstalled()) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Track when the application has been installed successfully
    const handleAppInstalled = () => {
      console.log('App was installed successfully');
      setIsInstalled(true);
      setShowBanner(false);
      localStorage.setItem('pwa_installed_permanently', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Execute the saved beforeinstallprompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User choice for PWA installation: ${outcome}`);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
        localStorage.setItem('pwa_installed_permanently', 'true');
      } else {
        // If they cancelled, we save dismissal timestamp for 5 days ("varios días")
        handleDismissClick();
      }
    } catch (err) {
      console.error('Error invoking PWA installation prompt:', err);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismissClick = () => {
    // Save dismissal timestamp for 5 days to comply with: "volver a mostrar la sugerencia después de varios días"
    const retryDate = new Date();
    retryDate.setDate(retryDate.getDate() + 5); // 5 days interval
    localStorage.setItem('pwa_install_dismissed_until', retryDate.toISOString());
    setShowBanner(false);
  };

  const isPermanentlyInstalled = localStorage.getItem('pwa_installed_permanently') === 'true';

  // If already installed, never show again
  if (isInstalled || isPermanentlyInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
            className="bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 max-w-sm w-full space-y-6 text-center relative overflow-hidden"
          >
            {/* Elegant glowing ambient backdrop decorations */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-orange-100/40 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-red-100/40 rounded-full blur-2xl" />

            {/* Subtle Close Button */}
            <button 
              onClick={handleDismissClick}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer z-10"
              aria-label="Cerrar diálogo"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Premium Logo / Mascot */}
            <div className="flex justify-center pt-2 relative">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4.5 rounded-[24px] border border-orange-100 shadow-sm animate-pulse">
                <FinanzasLogoSVG className="w-16 h-16" />
              </div>
            </div>

            {/* Main Message details */}
            <div className="space-y-3 relative px-1">
              <h3 className="text-xl font-black text-slate-900 font-display tracking-tight leading-tight">
                Instalar Finanzas Pro
              </h3>
              <p className="text-xs font-semibold text-slate-500 font-sans leading-relaxed">
                Tienes disponible la versión instalada de esta aplicación. Instálala para acceder más rápido y disfrutar de una mejor experiencia.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2 relative">
              <button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-display font-black text-xs uppercase tracking-widest py-4 px-4 rounded-xl shadow-lg shadow-orange-500/15 hover:from-orange-600 hover:to-red-600 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                Instalar aplicación
              </button>
              
              <button
                onClick={handleDismissClick}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-display font-black text-[10px] uppercase tracking-wider py-3 px-4 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Quizás más tarde
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
