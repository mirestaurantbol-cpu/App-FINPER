import React, { useState, useEffect } from 'react';
import { Movement, MovementType } from '../types';
import { getCategoryStyle } from '../utils/categoryIcons';
import { SwipeableItem } from './SwipeableItem';
import { 
  Plus, 
  X,
  Download, 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon, 
  FileText,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { 
  exportToCSVString, 
  parseCSVString, 
  saveMovements,
  loadIncomeCategories,
  saveIncomeCategories,
  loadExpenseCategories,
  saveExpenseCategories
} from '../utils/storage';

interface MovementTabProps {
  movements: Movement[];
  onAddMovement: (m: Movement) => void;
  onDeleteMovement: (id: string) => void;
  onImportMovements: (m: Movement[]) => void;
  currency: string;
  incomeCategories: string[];
  expenseCategories: string[];
  onAddCategory: (type: MovementType, name: string) => void;
}

export const MovementTab: React.FC<MovementTabProps> = ({
  movements,
  onAddMovement,
  onDeleteMovement,
  onImportMovements,
  currency,
  incomeCategories,
  expenseCategories,
  onAddCategory
}) => {
  // Form State
  const [type, setType] = useState<MovementType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  // Custom Category State
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Initial category set
  useEffect(() => {
    if (type === 'income') {
      if (incomeCategories.length > 0) {
        setCategory(incomeCategories[0]);
      }
    } else {
      if (expenseCategories.length > 0) {
        setCategory(expenseCategories[0]);
      }
    }
  }, [type, incomeCategories, expenseCategories]);

  const showToast = (message: string, toastType: 'success' | 'error' = 'success') => {
    setToast({ message, type: toastType });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      showToast('Ingresa un nombre para la categoría', 'error');
      return;
    }

    const currentList = type === 'income' ? incomeCategories : expenseCategories;
    
    // Check for duplicates
    if (currentList.some(cat => cat.toLowerCase() === name.toLowerCase())) {
      showToast('Esta categoría ya existe', 'error');
      return;
    }

    // Capitalize first letter beautifully
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    onAddCategory(type, formattedName);
    setCategory(formattedName);

    setNewCategoryName('');
    setShowNewCategoryInput(false);
    showToast(`Categoría "${formattedName}" agregada con éxito`);
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
      date,
      note: note.trim() || undefined
    };

    onAddMovement(newMovement);
    
    // Clear form fields
    setAmount('');
    setNote('');
    // Reset date to today
    setDate(new Date().toISOString().split('T')[0]);
    
    showToast('Movimiento registrado correctamente');
  };

  // CSV Export
  const handleExportCSV = () => {
    if (movements.length === 0) {
      showToast('No hay movimientos para exportar', 'error');
      return;
    }
    const csvContent = exportToCSVString(movements);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mis_finanzas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV exportado correctamente');
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        showToast('Error al leer el archivo', 'error');
        return;
      }
      try {
        const parsed = parseCSVString(text);
        if (parsed.length === 0) {
          showToast('No se encontraron movimientos válidos en el archivo', 'error');
          return;
        }

        // Complete full movement structures
        const completeMovements: Movement[] = parsed.map((item, idx) => ({
          id: item.id || `imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          type: item.type || 'expense',
          amount: item.amount || 0,
          category: item.category || 'Otros',
          date: item.date || new Date().toISOString().split('T')[0],
          note: item.note
        }));

        onImportMovements(completeMovements);
        showToast(`Se importaron ${completeMovements.length} movimientos correctamente`);
      } catch (err) {
        showToast('Error de formato en el archivo CSV', 'error');
      }
    };
    reader.readAsText(file);
    // Reset target input
    e.target.value = '';
  };

  // Get last 10 movements sorted by date then ID (descending)
  const last10Movements = [...movements]
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id.localeCompare(a.id);
    })
    .slice(0, 10);

  // Format date helper
  const formatDateLabel = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    const monthName = months[parseInt(month) - 1] || month;
    return `${day} ${monthName}, ${year}`;
  };

  return (
    <div id="movimientos-tab" className="px-4 py-3 space-y-6 pb-24">
      {/* Toast Notification Banner */}
      {toast && (
        <div 
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm max-w-[90%] font-medium animate-bounce ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 font-display mb-4">Registrar Movimiento</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segmented Type Controller */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Ingreso
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-sans">
              Monto ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold font-display text-gray-400">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-hidden py-3.5 pl-12 pr-4 rounded-2xl text-lg font-bold font-display text-gray-900 transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                Categoría
              </label>
              {!showNewCategoryInput && (
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-500 font-display flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva categoría
                </button>
              )}
            </div>

            {showNewCategoryInput ? (
              <div className="flex gap-2 items-center bg-gray-50 border border-gray-100 p-2 rounded-2xl">
                <input
                  type="text"
                  placeholder="Nombre de la nueva categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-white border border-gray-100 outline-hidden py-2 px-3 rounded-xl text-xs font-semibold text-gray-800 focus:border-blue-500 placeholder:text-gray-300"
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
                  className="p-2 bg-blue-600 text-white rounded-xl active:scale-95 transition-all shadow-3xs hover:bg-blue-500 cursor-pointer"
                  title="Añadir"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                  }}
                  className="p-2 bg-gray-100 text-gray-500 rounded-xl active:scale-95 transition-all hover:bg-gray-200 cursor-pointer"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-hidden py-3.5 px-4 rounded-2xl text-sm font-medium text-gray-800 transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  backgroundSize: '18px'
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
            )}
          </div>

          {/* Date & Note in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-sans">
                Fecha
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-hidden py-3 px-4 pl-11 rounded-2xl text-sm font-medium text-gray-800 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-sans">
                Nota (Opcional)
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ej. Almuerzo familiar"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-hidden py-3 px-4 pl-11 rounded-2xl text-sm font-medium text-gray-800 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 active:bg-blue-700 hover:bg-blue-500 text-white font-display font-bold text-base py-4 rounded-2xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Plus className="w-5 h-5" />
            Guardar
          </button>
        </form>
      </div>

      {/* CSV Operations Bar */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Respaldo de Datos</h3>
          <p className="text-[10px] text-gray-400">Importa o exporta tus movimientos en CSV</p>
        </div>
        <div className="flex gap-2">
          {/* Import CSV */}
          <label className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-display font-bold text-xs py-2 px-3 rounded-xl shadow-3xs cursor-pointer flex items-center gap-1.5 transition-all">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Importar
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-display font-bold text-xs py-2 px-3 rounded-xl shadow-3xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Exportar
          </button>
        </div>
      </div>

      {/* History List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 font-display">Últimos 10 movimientos</h2>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-display">
            Desliza para borrar
          </span>
        </div>

        {last10Movements.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center text-gray-400 shadow-xs">
            <FileText className="w-10 h-10 mx-auto mb-2.5 opacity-30 text-gray-500" />
            <p className="font-sans text-sm font-medium">No hay movimientos registrados</p>
            <p className="text-xs mt-0.5">Comienza agregando uno arriba</p>
          </div>
        ) : (
          <div className="space-y-1">
            {last10Movements.map((movement) => {
              const style = getCategoryStyle(movement.category, movement.type);
              return (
                <SwipeableItem
                  key={movement.id}
                  id={movement.id}
                  onDelete={onDeleteMovement}
                >
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon container */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bgColorClass}`}>
                        {style.icon}
                      </div>

                      {/* Info details */}
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm text-gray-900 leading-tight">
                          {movement.category}
                        </p>
                        <p className="text-[10px] font-sans font-medium text-gray-400 mt-0.5">
                          {formatDateLabel(movement.date)}
                        </p>
                        {movement.note && (
                          <p className="text-xs text-gray-400 font-sans italic truncate max-w-[150px] md:max-w-[250px] mt-0.5">
                            "{movement.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount value */}
                    <div className="text-right pl-2 shrink-0">
                      <p className={`font-display font-bold text-sm leading-tight ${
                        movement.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {movement.type === 'income' ? '+' : '-'} {currency} {movement.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </SwipeableItem>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
