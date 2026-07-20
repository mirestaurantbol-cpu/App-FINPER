import React, { useState, useEffect } from 'react';
import { Download, X, Check, Award } from 'lucide-react';

// Elegant Inline Restaurant SVG Logo
export const RestaurantLogoSVG: React.FC<{ className?: string }> = ({ className = "w-20 h-20" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Subtle Outer Glow / Shadow circle */}
    <circle cx="50" cy="50" r="42" fill="rgba(0, 0, 0, 0.04)" />
    
    {/* Plate */}
    <circle cx="50" cy="50" r="34" fill="white" stroke="#FFE0B2" strokeWidth="1" />
    <circle cx="50" cy="50" r="26" fill="none" stroke="#FFF3E0" strokeWidth="2.5" />
    
    {/* Fork (Left Side) */}
    <g transform="translate(1, 0)">
      <path d="M34,39 L34,57 M34,57 L34,66 M31,39 L31,49 M37,39 L37,49" stroke="#FF5722" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M31,49 C31,54 37,54 37,49" fill="none" stroke="#FF5722" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    
    {/* Spoon (Right Side) */}
    <g transform="translate(-1, 0)">
      <path d="M65,53 L65,66" stroke="#FF5722" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="65" cy="44" rx="4.5" ry="7.5" fill="#FF5722" />
    </g>
    
    {/* Fire/Flame (Center over Plate) */}
    <g transform="translate(0, 3)">
      {/* Outer red-orange flame */}
      <path d="M50,26 C56,31 56,44 50,49 C44,44 44,31 50,26 Z" fill="#FF3D00" />
      {/* Inner yellow core */}
      <path d="M50,32 C53,35 53,44 50,47 C47,44 47,35 50,32 Z" fill="#FFEB3B" />
    </g>
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
          <RestaurantLogoSVG className="w-24 h-24 drop-shadow-xl" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white font-display tracking-tight drop-shadow-sm">
            Restaurante Pro
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-100 font-sans">
            SISTEMA PROFESIONAL
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

// 2. Install Banner Component
export const InstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if user dismissed the banner recently
    const dismissedUntil = localStorage.getItem('pwa_banner_dismissed_until');
    const isDismissed = dismissedUntil && new Date(dismissedUntil) > new Date();

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Capture the installation prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect if app was installed successfully
    const handleAppInstalled = () => {
      console.log('App was installed successfully');
      setIsInstalled(true);
      setShowBanner(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // If beforeinstallprompt is NOT supported or didn't fire yet,
    // we still show our custom banner invitation automatically on first load
    // so the user can easily install or see the card!
    const timer = setTimeout(() => {
      if (!isStandalone && !isDismissed && !deferredPrompt) {
        // Show banner anyway to let them know it's installable
        setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native install dialog
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Browser does not support prompt or iOS -> Show a friendly dialog explaining native PWA features
      // Or fallback to triggering normal install instruction / native prompt if standard
      alert(
        "Para instalar en tu dispositivo:\n\n" +
        "• En Android: Presiona los tres puntos u opción de instalar en tu navegador.\n" +
        "• En iPhone: Presiona 'Compartir' y luego 'Agregar a pantalla de inicio'."
      );
      setShowBanner(false);
    }
  };

  const handleDismissClick = () => {
    // Save dismissal timestamp for 2 days to comply with:
    // "volver a mostrar la sugerencia después de algunos días o cuando vuelva a ingresar a la aplicación"
    const retryDate = new Date();
    retryDate.setDate(retryDate.getDate() + 2); // Show again in 2 days
    localStorage.setItem('pwa_banner_dismissed_until', retryDate.toISOString());
    setShowBanner(false);
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-red-500 text-white p-4 shadow-lg border-b border-orange-400/20 shrink-0 z-40 relative animate-fade-in">
      <div className="flex gap-3 items-start">
        {/* Banner icon */}
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/20 animate-bounce">
          <Download className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black uppercase tracking-wider text-orange-100 font-display">
            ¡Instala Restaurante Pro!
          </h4>
          <p className="text-[11px] font-semibold text-white/95 leading-normal mt-0.5">
            Instala esta aplicación para acceder más rápido y utilizarla como una app en tu celular.
          </p>

          {/* Action buttons */}
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={handleInstallClick}
              className="bg-white text-orange-600 font-display font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg active:scale-95 transition-all shadow-3xs cursor-pointer hover:bg-orange-50 flex items-center gap-1"
            >
              <Check className="w-3 h-3 stroke-[3]" />
              Instalar
            </button>
            <button
              onClick={handleDismissClick}
              className="bg-transparent hover:bg-white/10 text-white/90 border border-white/25 font-display font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg active:scale-95 transition-all cursor-pointer"
            >
              Ahora no
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismissClick}
          className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
