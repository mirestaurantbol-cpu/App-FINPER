import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { X, User, Tag, Trash2, Plus, Sparkles, Check } from 'lucide-react';
import { 
  loadIncomeCategories, 
  saveIncomeCategories, 
  loadExpenseCategories, 
  saveExpenseCategories 
} from '../utils/storage';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (p: UserProfile) => void;
  incomeCategories: string[];
  expenseCategories: string[];
  onUpdateIncomeCategories: (cats: string[]) => void;
  onUpdateExpenseCategories: (cats: string[]) => void;
}

const AVATAR_COLORS = [
  'bg-indigo-500 text-white',
  'bg-emerald-500 text-white',
  'bg-rose-500 text-white',
  'bg-amber-500 text-white',
  'bg-purple-500 text-white',
  'bg-sky-500 text-white'
];

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  incomeCategories,
  expenseCategories,
  onUpdateIncomeCategories,
  onUpdateExpenseCategories
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'categories'>('profile');
  const [catType, setCatType] = useState<'expense' | 'income'>('expense');

  // Profile Form State
  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState(profile.currency);
  const [avatarSeed, setAvatarSeed] = useState(profile.avatarSeed);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setName(profile.name);
    setCurrency(profile.currency);
    setAvatarSeed(profile.avatarSeed);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Por favor ingresa un nombre');
      return;
    }
    onSaveProfile({
      name: name.trim(),
      currency: currency.trim() || 'Bs.',
      avatarSeed,
      isRegistered: true,
      registeredAt: profile.registeredAt || new Date().toISOString()
    });
    showToast('¡Perfil guardado correctamente!');
    // If we're performing first registration, close modal automatically
    if (!profile.isRegistered) {
      setTimeout(() => onClose(), 1000);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newCatName.trim();
    if (!formatted) return;

    const currentList = catType === 'income' ? incomeCategories : expenseCategories;
    if (currentList.some(c => c.toLowerCase() === formatted.toLowerCase())) {
      showToast('Esta categoría ya existe');
      return;
    }

    const capitalizeName = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
    if (catType === 'income') {
      const updated = [...incomeCategories, capitalizeName];
      onUpdateIncomeCategories(updated);
      saveIncomeCategories(updated);
    } else {
      const updated = [...expenseCategories, capitalizeName];
      onUpdateExpenseCategories(updated);
      saveExpenseCategories(updated);
    }

    setNewCatName('');
    showToast(`Categoría "${capitalizeName}" agregada`);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    const currentList = catType === 'income' ? incomeCategories : expenseCategories;
    if (currentList.length <= 1) {
      showToast('Debes mantener al menos una categoría');
      return;
    }

    const updated = currentList.filter(c => c !== catToDelete);
    if (catType === 'income') {
      onUpdateIncomeCategories(updated);
      saveIncomeCategories(updated);
    } else {
      onUpdateExpenseCategories(updated);
      saveExpenseCategories(updated);
    }
    showToast(`Categoría "${catToDelete}" eliminada`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col z-10 border border-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              {profile.isRegistered ? 'Ajustes Personalizados' : 'Registro de Usuario'}
            </h3>
            <p className="text-xs text-slate-400 font-sans font-medium">
              {profile.isRegistered ? 'Configura tu moneda, nombre y categorías' : 'Comienza configurando tu nombre y moneda'}
            </p>
          </div>
          {profile.isRegistered && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Small Toast Banner */}
        {toast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2 rounded-xl shadow-md font-sans font-semibold animate-pulse">
            {toast}
          </div>
        )}

        {/* Modal Tab Switcher (Only if registered) */}
        {profile.isRegistered && (
          <div className="px-6 pt-3 shrink-0 bg-slate-50/50 flex border-b border-slate-100">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`flex-1 py-3 text-sm font-semibold font-display flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <User className="w-4 h-4" />
              Mi Perfil
            </button>
            <button
              onClick={() => setActiveSubTab('categories')}
              className={`flex-1 py-3 text-sm font-semibold font-display flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'categories'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Tag className="w-4 h-4" />
              Categorías
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeSubTab === 'profile' ? (
            <form onSubmit={handleSaveProfileSubmit} className="space-y-4">
              {/* Name field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-sans">
                  Tu Nombre o Apodo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-hidden py-3 px-4 rounded-xl text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Currency Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-sans">
                  Moneda de Control
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-hidden py-3 px-4 rounded-xl text-sm font-semibold text-slate-800 transition-all cursor-pointer"
                >
                  <option value="Bs.">Boliviano (Bs.)</option>
                  <option value="$">Dólar ($)</option>
                  <option value="€">Euro (€)</option>
                  <option value="S/.">Sol (S/.)</option>
                  <option value="CLP">Peso Chileno (CLP)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                  <option value="COP">Peso Colombiano (COP)</option>
                  <option value="ARS">Peso Argentino (ARS)</option>
                  <option value="UYU">Peso Uruguayo (UYU)</option>
                </select>
              </div>

              {/* Avatar Selector seed selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-sans">
                  Elige un Color de Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_COLORS.map((style, idx) => {
                    const isSelected = avatarSeed === `color-${idx}`;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarSeed(`color-${idx}`)}
                        className={`aspect-square rounded-full ${style} flex items-center justify-center transition-all cursor-pointer relative hover:scale-105 active:scale-95 ${
                          isSelected ? 'ring-4 ring-blue-600/30 ring-offset-2 scale-110' : ''
                        }`}
                      >
                        {name ? name.charAt(0).toUpperCase() : 'U'}
                        {isSelected && (
                          <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 border border-white">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-display font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <Check className="w-4 h-4" />
                {profile.isRegistered ? 'Guardar Cambios' : 'Comenzar a Registrar'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Category Segment switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setCatType('expense')}
                  className={`py-2 text-xs font-display font-bold rounded-lg transition-all cursor-pointer ${
                    catType === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Gastos
                </button>
                <button
                  onClick={() => setCatType('income')}
                  className={`py-2 text-xs font-display font-bold rounded-lg transition-all cursor-pointer ${
                    catType === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Ingresos
                </button>
              </div>

              {/* Add New Category Form inline */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Nueva categoría de ${catType === 'expense' ? 'gasto' : 'ingreso'}`}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-100 outline-hidden py-2 px-3.5 rounded-xl text-xs font-semibold text-slate-800 focus:border-blue-500 placeholder:text-slate-300"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-display font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar
                </button>
              </form>

              {/* Categories Scroll List with delete buttons */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">
                  Categorías actuales ({catType === 'expense' ? expenseCategories.length : incomeCategories.length})
                </h4>
                <div className="space-y-1.5 max-h-[30vh] overflow-y-auto pr-1">
                  {(catType === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100/50 rounded-xl"
                    >
                      <span className="text-xs font-semibold text-slate-700 font-sans">
                        {cat}
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
