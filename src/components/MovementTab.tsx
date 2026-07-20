import React, { useState, useEffect } from 'react';
import { Movement, MovementType } from '../types';
import { getCategoryStyle } from '../utils/categoryIcons';
import { SwipeableItem } from './SwipeableItem';
import { 
  Search,
  Download, 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  FileText,
  AlertCircle,
  CheckCircle,
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';
import { exportToCSVString, parseCSVString } from '../utils/storage';

interface MovementTabProps {
  movements: Movement[];
  onAddMovement: (m: Movement) => void;
  onDeleteMovement: (id: string) => void;
  onImportMovements: (m: Movement[]) => void;
  currency: string;
  incomeCategories: string[];
  expenseCategories: string[];
  onAddCategory: (type: MovementType, name: string) => void;
  accounts: string[];
  onAddAccount: (name: string) => void;
}

export const MovementTab: React.FC<MovementTabProps> = ({
  movements,
  onDeleteMovement,
  onImportMovements,
  currency,
  incomeCategories,
  expenseCategories,
  accounts
}) => {
  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Toast inside tab
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
          account: item.account || accounts[0] || 'Efectivo',
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
    e.target.value = ''; // Reset
  };

  // Filter movements
  const filteredMovements = movements.filter((mov) => {
    // Search Term match
    const matchesSearch = 
      mov.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mov.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mov.account || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Type match
    const matchesType = 
      filterType === 'all' ? true : mov.type === filterType;

    // Category match
    const matchesCategory = 
      selectedCategory === 'all' ? true : mov.category === selectedCategory;

    // Account match
    const matchesAccount = 
      selectedAccount === 'all' ? true : mov.account === selectedAccount;

    return matchesSearch && matchesType && matchesCategory && matchesAccount;
  });

  // Calculate stats based on current filtered dataset
  const filteredIncomes = filteredMovements
    .filter((m) => m.type === 'income')
    .reduce((sum, m) => sum + m.amount, 0);

  const filteredExpenses = filteredMovements
    .filter((m) => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0);

  const filteredBalance = filteredIncomes - filteredExpenses;

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

  // Reset all active filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSelectedCategory('all');
    setSelectedAccount('all');
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    filterType !== 'all' || 
    selectedCategory !== 'all' || 
    selectedAccount !== 'all';

  return (
    <div id="movimientos-tab" className="px-4 py-3 space-y-4 pb-28">
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

      {/* Real-time stats card based on active filters */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-2xl bg-emerald-50/50">
          <p className="text-[10px] font-bold text-emerald-700/80 uppercase font-sans tracking-wide">
            Ingresos
          </p>
          <p className="text-xs font-black text-emerald-600 font-display mt-0.5 truncate">
            +{currency} {filteredIncomes.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="text-center p-2 rounded-2xl bg-rose-50/50">
          <p className="text-[10px] font-bold text-rose-700/80 uppercase font-sans tracking-wide">
            Gastos
          </p>
          <p className="text-xs font-black text-rose-600 font-display mt-0.5 truncate">
            -{currency} {filteredExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="text-center p-2 rounded-2xl bg-blue-50/50">
          <p className="text-[10px] font-bold text-blue-700/80 uppercase font-sans tracking-wide">
            Balance
          </p>
          <p className={`text-xs font-black font-display mt-0.5 truncate ${
            filteredBalance >= 0 ? 'text-blue-600' : 'text-rose-600'
          }`}>
            {filteredBalance >= 0 ? '+' : ''}{currency} {filteredBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Search Bar & Filtering Actions */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {/* Search text input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nota, banco, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 focus:border-blue-500 focus:outline-hidden py-2.5 pl-10 pr-4 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-300 shadow-3xs"
            />
          </div>

          {/* Toggle filter controls button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border font-display font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-slate-500 border-slate-100 shadow-3xs hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Extended Filters Drawer */}
        {(showFilters || hasActiveFilters) && (
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-3xs space-y-3 animate-fade-in">
            {/* Filter segments by movement Type */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-sans">
                Tipo de Movimiento
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-0.5 rounded-xl">
                {(['all', 'income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterType(t)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      filterType === t
                        ? t === 'all'
                          ? 'bg-blue-600 text-white shadow-3xs'
                          : t === 'income'
                            ? 'bg-emerald-600 text-white shadow-3xs'
                            : 'bg-rose-600 text-white shadow-3xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t === 'all' ? 'Todos' : t === 'income' ? 'Ingresos' : 'Gastos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Select tags for Category and Account */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-sans">
                  Categoría
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100/50 outline-hidden py-2 px-2.5 rounded-xl text-[11px] font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">Todas</option>
                    {[...incomeCategories, ...expenseCategories]
                      .filter((value, idx, self) => self.indexOf(value) === idx)
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-sans">
                  Cuenta / Banco
                </label>
                <div className="relative">
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100/50 outline-hidden py-2 px-2.5 rounded-xl text-[11px] font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">Todas</option>
                    {accounts.map((acc) => (
                      <option key={acc} value={acc}>
                        {acc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Reset active filters action button */}
            {hasActiveFilters && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-slate-900 font-display">
            {hasActiveFilters ? `Movimientos filtrados (${filteredMovements.length})` : `Historial completo (${movements.length})`}
          </h2>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-display">
            Desliza para borrar
          </span>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center text-slate-400 shadow-xs">
            <FileText className="w-10 h-10 mx-auto mb-2.5 opacity-30 text-slate-400" />
            <p className="font-sans text-xs font-semibold text-slate-600">No se encontraron movimientos</p>
            <p className="text-[10px] text-slate-400 mt-1">Prueba cambiando tus filtros de búsqueda o agrega uno nuevo con el botón (+)</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-0.5">
            {filteredMovements.map((movement) => {
              const style = getCategoryStyle(movement.category, movement.type);
              return (
                <SwipeableItem
                  key={movement.id}
                  id={movement.id}
                  onDelete={onDeleteMovement}
                >
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100/20 shadow-3xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon container */}
                      <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 ${style.bgColorClass}`}>
                        {style.icon}
                      </div>

                      {/* Info details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-display font-semibold text-xs text-slate-900 leading-tight">
                            {movement.category}
                          </p>
                          {movement.account && (
                            <span className="text-[8px] font-extrabold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md uppercase font-sans tracking-wider leading-none">
                              {movement.account}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] font-sans font-medium text-slate-400 mt-0.5">
                          {formatDateLabel(movement.date)}
                        </p>
                        {movement.note && (
                          <p className="text-[11px] text-slate-500 font-sans italic truncate max-w-[150px] md:max-w-[250px] mt-0.5">
                            "{movement.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount value */}
                    <div className="text-right pl-2 shrink-0">
                      <p className={`font-display font-black text-xs leading-tight ${
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

      {/* CSV Operations Bar */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-sans">Respaldo de Datos</h3>
          <p className="text-[9px] text-slate-400 leading-normal">Importa o exporta tus movimientos en CSV</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Import CSV */}
          <label className="flex-1 sm:flex-none text-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-display font-bold text-[10px] py-2 px-3 rounded-xl shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 transition-all">
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
            className="flex-1 sm:flex-none text-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-display font-bold text-[10px] py-2 px-3 rounded-xl shadow-3xs flex items-center justify-center gap-1.5 transition-all cursor-pointer animate-fade-in"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};
