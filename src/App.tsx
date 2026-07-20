import { useState, useEffect } from 'react';
import { Movement, Reminder, UserProfile } from './types';
import { 
  loadMovements, 
  saveMovements, 
  loadReminders, 
  saveReminders,
  loadUserProfile,
  saveUserProfile,
  loadIncomeCategories,
  saveIncomeCategories,
  loadExpenseCategories,
  saveExpenseCategories,
  loadAccounts,
  saveAccounts
} from './utils/storage';
import { MovementTab } from './components/MovementTab';
import { CalendarTab } from './components/CalendarTab';
import { SummaryTab } from './components/SummaryTab';
import { UserSettingsModal } from './components/UserSettingsModal';
import { AddMovementModal } from './components/AddMovementModal';
import { 
  Coins, 
  Calendar as CalendarIcon, 
  BarChart3, 
  ReceiptText,
  Plus
} from 'lucide-react';
import { SplashScreen, InstallBanner, FinanzasLogoSVG } from './components/PWAScreen';

type TabType = 'movements' | 'calendar' | 'summary';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [movements, setMovements] = useState<Movement[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // User Profile & Category States
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Usuario',
    currency: 'Bs.',
    avatarSeed: 'color-0',
    isRegistered: false
  });
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load initial data from localStorage on mount
  useEffect(() => {
    setMovements(loadMovements());
    setReminders(loadReminders());
    
    const loadedProfile = loadUserProfile();
    setProfile(loadedProfile);
    
    // Automatically open settings if user is not registered yet
    if (!loadedProfile.isRegistered) {
      setIsSettingsOpen(true);
    }
    
    setIncomeCategories(loadIncomeCategories());
    setExpenseCategories(loadExpenseCategories());
    setAccounts(loadAccounts());
  }, []);

  // Handlers for Movements
  const handleAddMovement = (newMov: Movement) => {
    const updated = [newMov, ...movements];
    setMovements(updated);
    saveMovements(updated);
  };

  const handleDeleteMovement = (id: string) => {
    const updated = movements.filter((m) => m.id !== id);
    setMovements(updated);
    saveMovements(updated);
  };

  const handleImportMovements = (importedMovements: Movement[]) => {
    // Merge imported movements, preventing duplicate IDs
    const existingIds = new Set(movements.map((m) => m.id));
    const uniqueImported = importedMovements.filter((m) => !existingIds.has(m.id));
    const updated = [...uniqueImported, ...movements];
    setMovements(updated);
    saveMovements(updated);
  };

  // Handlers for Reminders
  const handleAddReminder = (newRem: Reminder) => {
    const updated = [...reminders, newRem];
    setReminders(updated);
    saveReminders(updated);
  };

  const handleUpdateReminder = (updatedRem: Reminder) => {
    const updated = reminders.map((r) => (r.id === updatedRem.id ? updatedRem : r));
    setReminders(updated);
    saveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  };

  // Profile Save
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
  };

  // Category addition callback for MovementTab
  const handleAddCategoryFromTab = (type: 'income' | 'expense', name: string) => {
    if (type === 'income') {
      const updated = [...incomeCategories, name];
      setIncomeCategories(updated);
      saveIncomeCategories(updated);
    } else {
      const updated = [...expenseCategories, name];
      setExpenseCategories(updated);
      saveExpenseCategories(updated);
    }
  };

  // Account addition callback for MovementTab
  const handleAddAccountFromTab = (name: string) => {
    const updated = [...accounts, name];
    setAccounts(updated);
    saveAccounts(updated);
  };

  const getAvatarColorClass = (seed: string) => {
    const idx = parseInt(seed.replace('color-', '')) || 0;
    const colors = [
      'bg-indigo-500 text-white',
      'bg-emerald-500 text-white',
      'bg-rose-500 text-white',
      'bg-amber-500 text-white',
      'bg-purple-500 text-white',
      'bg-sky-500 text-white'
    ];
    return colors[idx] || colors[0];
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-6 select-none">
      {/* Smartphone mockup wrapper */}
      <div id="phone-container" className="w-full max-w-md min-h-screen md:min-h-[840px] md:max-h-[880px] bg-slate-50 md:rounded-[40px] md:shadow-2xl overflow-hidden flex flex-col border border-slate-200/50 relative">
        
        {/* Upper notch / status indicator on Desktop */}
        <div className="hidden md:flex justify-between items-center px-8 pt-3 pb-1 text-slate-400 font-display text-[10px] font-bold tracking-wider shrink-0 bg-slate-50">
          <span>9:41</span>
          <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
          <div className="flex gap-1.5">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* PWA Automatic Installation Banner */}
        <InstallBanner />

        {/* Application Core Header with custom Profile Access */}
        <header className="px-5 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shadow-xs">
              <FinanzasLogoSVG className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 font-display tracking-tight leading-none animate-fade-in">
                {profile.isRegistered ? `Hola, ${profile.name}!` : 'Finanzas Pro'}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 font-sans tracking-wide uppercase mt-1">
                {profile.isRegistered ? 'Mi Caja Personalizada' : 'Caja y Estadísticas PWA'}
              </p>
            </div>
          </div>

          {/* Clickable Profile Avatar Badge */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all cursor-pointer group focus:outline-hidden"
            title="Ajustes de Perfil y Categorías"
          >
            <div className={`w-9 h-9 rounded-full ${getAvatarColorClass(profile.avatarSeed)} flex items-center justify-center font-display font-extrabold text-xs shadow-xs border-2 border-white ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all`}>
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>
        </header>

        {/* Dynamic Viewport Scroll Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {activeTab === 'movements' && (
            <MovementTab
              movements={movements}
              onAddMovement={handleAddMovement}
              onDeleteMovement={handleDeleteMovement}
              onImportMovements={handleImportMovements}
              currency={profile.currency}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              onAddCategory={handleAddCategoryFromTab}
              accounts={accounts}
              onAddAccount={handleAddAccountFromTab}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarTab
              reminders={reminders}
              onAddReminder={handleAddReminder}
              onUpdateReminder={handleUpdateReminder}
              onDeleteReminder={handleDeleteReminder}
              currency={profile.currency}
            />
          )}

          {activeTab === 'summary' && (
            <SummaryTab 
              movements={movements} 
              currency={profile.currency}
            />
          )}
        </main>

        {/* Floating Action Button (FAB) for adding new transaction */}
        <button
          onClick={() => setIsAddMovementOpen(true)}
          className="absolute bottom-24 right-5 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-40 group"
          title="Registrar nuevo movimiento"
        >
          <Plus className="w-7 h-7 transition-transform group-hover:rotate-90 duration-300" />
        </button>

        {/* Lower Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around py-2.5 pb-5 px-4 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.02)] shrink-0">
          
          {/* Tab 1: Movimientos */}
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'movements'
                ? 'text-blue-600 scale-105 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ReceiptText className={`w-5.5 h-5.5 transition-transform ${activeTab === 'movements' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-display font-semibold tracking-wider">Movimientos</span>
          </button>

          {/* Tab 2: Calendario */}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-blue-600 scale-105 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CalendarIcon className={`w-5.5 h-5.5 transition-transform ${activeTab === 'calendar' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-display font-semibold tracking-wider">Calendario</span>
          </button>

          {/* Tab 3: Resumen */}
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'text-blue-600 scale-105 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className={`w-5.5 h-5.5 transition-transform ${activeTab === 'summary' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-display font-semibold tracking-wider">Resumen</span>
          </button>

        </nav>
      </div>

      {/* User Settings & Categories Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        onUpdateIncomeCategories={setIncomeCategories}
        onUpdateExpenseCategories={setExpenseCategories}
        accounts={accounts}
        onUpdateAccounts={setAccounts}
      />

      <AddMovementModal
        isOpen={isAddMovementOpen}
        onClose={() => setIsAddMovementOpen(false)}
        currency={profile.currency}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        onAddCategory={handleAddCategoryFromTab}
        accounts={accounts}
        onAddAccount={handleAddAccountFromTab}
        onAddMovement={handleAddMovement}
      />

      {/* Fullscreen splash screen overlay */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
    </div>
  );
}
