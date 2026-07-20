import React, { useState, useEffect } from 'react';
import { Movement, MovementType } from '../types';
import { 
  X, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Wallet, 
  Calendar as CalendarIcon, 
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface AddMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  incomeCategories: string[];
  expenseCategories: string[];
  onAddCategory: (type: MovementType, name: string) => void;
  accounts: string[];
  onAddAccount: (name: string) => void;
  onAddMovement: (m: Movement) => void;
}

export const AddMovementModal: React.FC<AddMovementModalProps> = ({
  isOpen,
  onClose,
  currency,
  incomeCategories,
  expenseCategories,
  onAddCategory,
  accounts,
  onAddAccount,
  onAddMovement
}) => {
  // Form State
  const [type, setType] = useState<MovementType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  // Add Custom Category/Account States inside Modal
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewAccountInput, setShowNewAccountInput] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');

  // Toast inside Modal
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Initial category set when modal opens or category type changes
  useEffect(() => {
    if (isOpen) {
      if (type === 'income') {
        if (incomeCategories.length > 0) {
          setCategory(incomeCategories[0]);
        }
      } else {
        if (expenseCategories.length > 0) {
          setCategory(expenseCategories[0]);
        }
      }
    }
  }, [type, isOpen, incomeCategories, expenseCategories]);

  // Sync default account
  useEffect(() => {
    if (isOpen && accounts.length > 0) {
      if (!account || !accounts.includes(account)) {
        setAccount(accounts[0]);
      }
    }
  }, [accounts, account, isOpen]);

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      showToast('Ingresa un nombre para la categoría', 'error');
      return;
    }

    const categoriesToCheck = type === 'income' ? incomeCategories : expenseCategories;
    if (categoriesToCheck.some(cat => cat.toLowerCase() === name.toLowerCase())) {
      showToast('Esta categoría ya existe', 'error');
      return;
    }

    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    onAddCategory(type, formattedName);
    setCategory(formattedName);

    setNewCategoryName('');
    setShowNewCategoryInput(false);
    showToast(`Categoría "${formattedName}" agregada`);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newAccountName.trim();
    if (!name) {
      showToast('Ingresa un nombre para la cuenta', 'error');
      return;
    }

    if (accounts.some(acc => acc.toLowerCase() === name.toLowerCase())) {
      showToast('Esta cuenta ya existe', 'error');
      return;
    }

    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    onAddAccount(formattedName);
    setAccount(formattedName);

    setNewAccountName('');
    setShowNewAccountInput(false);
    showToast(`Cuenta "${formattedName}" agregada`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Por favor ingresa un monto válido mayor a 0', 'error');
      return;
    }

    const newMovement: Movement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      amount: numericAmount,
      category,
      account: account || accounts[0] || 'Efectivo',
      date,
      note: note.trim() || undefined
    };

    onAddMovement(newMovement);
    
    // Reset form fields
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    
    // Close modal on success after a tiny delay
    showToast('Movimiento registrado correctamente');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl shadow-xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden relative border border-slate-100/50 z-10">
        
        {/* Toast Notification Banner within modal */}
        {toast && (
          <div 
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs max-w-[90%] font-medium animate-bounce ${
              toast.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Plus className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <h3 className="text-base font-black text-slate-900 font-display">
              Registrar Movimiento
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Segmented Type Controller */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display font-semibold text-xs transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display font-semibold text-xs transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Ingreso
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-sans">
              Monto ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold font-display text-slate-400">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-hidden py-3 pl-10 pr-4 rounded-xl text-base font-bold font-display text-slate-900 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                Categoría
              </label>
              {!showNewCategoryInput && (
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-500 font-display flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Nueva categoría
                </button>
              )}
            </div>

            {showNewCategoryInput ? (
              <div className="flex gap-2 items-center bg-slate-50 border border-slate-100 p-2 rounded-xl">
                <input
                  type="text"
                  placeholder="Nueva categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-white border border-slate-100 outline-hidden py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-800 focus:border-blue-500 placeholder:text-slate-300"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="p-1.5 bg-blue-600 text-white rounded-lg active:scale-95 transition-all shadow-3xs hover:bg-blue-500 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                  }}
                  className="p-1.5 bg-slate-100 text-slate-500 rounded-lg active:scale-95 transition-all hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-hidden py-3 px-4 rounded-xl text-xs font-medium text-slate-800 transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                >
                  {type === 'income'
                    ? incomeCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    : expenseCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                </select>
              </div>
            )}
          </div>

          {/* Account Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                Cuenta / Banco / Origen
              </label>
              {!showNewAccountInput && (
                <button
                  type="button"
                  onClick={() => setShowNewAccountInput(true)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-500 font-display flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Nueva cuenta
                </button>
              )}
            </div>

            {showNewAccountInput ? (
              <div className="flex gap-2 items-center bg-slate-50 border border-slate-100 p-2 rounded-xl">
                <input
                  type="text"
                  placeholder="Nueva cuenta (ej. Banco Sol)"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="flex-1 bg-white border border-slate-100 outline-hidden py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-800 focus:border-blue-500 placeholder:text-slate-300"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAccount(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="p-1.5 bg-blue-600 text-white rounded-lg active:scale-95 transition-all shadow-3xs hover:bg-blue-500 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAccountInput(false);
                    setNewAccountName('');
                  }}
                  className="p-1.5 bg-slate-100 text-slate-500 rounded-lg active:scale-95 transition-all hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-hidden py-3 pl-11 pr-10 rounded-xl text-xs font-medium text-slate-800 transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                >
                  {accounts.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-sans">
                Fecha
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-hidden py-2.5 pl-9 pr-3 rounded-xl text-xs font-medium text-slate-800 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-sans">
                Nota
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Opcional"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-hidden py-2.5 pl-9 pr-3 rounded-xl text-xs font-medium text-slate-800 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 active:bg-blue-700 hover:bg-blue-500 text-white font-display font-bold text-sm py-3 rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer pt-3"
          >
            <CheckCircle className="w-4 h-4" />
            Guardar Movimiento
          </button>
        </form>
      </div>
    </div>
  );
};
