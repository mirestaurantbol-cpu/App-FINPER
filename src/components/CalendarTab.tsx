import React, { useState } from 'react';
import { Reminder, ReminderType } from '../types';
import { getReminderStyle } from '../utils/categoryIcons';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus, 
  Bell, 
  Trash2, 
  X, 
  DollarSign, 
  Edit2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface CalendarTabProps {
  reminders: Reminder[];
  onAddReminder: (r: Reminder) => void;
  onUpdateReminder: (r: Reminder) => void;
  onDeleteReminder: (id: string) => void;
  currency: string;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const CalendarTab: React.FC<CalendarTabProps> = ({
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
  currency
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states for adding/editing
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<ReminderType>('payment');
  const [formDescription, setFormDescription] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate calendar days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayIndex = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, etc.
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayIndex(currentYear, currentMonth);

  const prevMonthDaysCount = getDaysInMonth(currentYear, currentMonth - 1);

  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Fill in previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthDaysCount - i;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: false
    });
  }

  // Fill in current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: true
    });
  }

  // Fill in next month days to complete grid (usually multiple of 7, let's complete to 42 cells)
  const totalCells = calendarCells.length;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: false
    });
  }

  // Filter reminders for a specific date
  const getRemindersForDate = (dateStr: string) => {
    return reminders.filter(r => r.date === dateStr);
  };

  // Open modal for a clicked date
  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const dayReminders = getRemindersForDate(dateStr);
    
    // Clear form
    setFormTitle('');
    setFormAmount('');
    setFormType('payment');
    setFormDescription('');
    setEditingReminder(null);
    
    if (dayReminders.length === 0) {
      setIsAddingNew(true);
    } else {
      setIsAddingNew(false);
    }
    
    setIsModalOpen(true);
  };

  // Open form to edit a reminder
  const handleStartEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormTitle(reminder.title);
    setFormAmount(reminder.amount ? reminder.amount.toString() : '');
    setFormType(reminder.type);
    setFormDescription(reminder.description);
    setIsAddingNew(false);
  };

  const handleStartAdd = () => {
    setEditingReminder(null);
    setFormTitle('');
    setFormAmount('');
    setFormType('payment');
    setFormDescription('');
    setIsAddingNew(true);
  };

  // Handle Save (Add or Edit)
  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    if (!selectedDateStr) return;

    const numAmount = parseFloat(formAmount);

    if (editingReminder) {
      // Update
      const updated: Reminder = {
        ...editingReminder,
        title: formTitle.trim(),
        amount: isNaN(numAmount) ? undefined : numAmount,
        type: formType,
        description: formDescription.trim()
      };
      onUpdateReminder(updated);
      setEditingReminder(null);
    } else {
      // Create
      const created: Reminder = {
        id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: formTitle.trim(),
        amount: isNaN(numAmount) ? undefined : numAmount,
        type: formType,
        description: formDescription.trim(),
        date: selectedDateStr
      };
      onAddReminder(created);
    }

    // Reset Form & Switch back to view mode for that day
    setFormTitle('');
    setFormAmount('');
    setFormType('payment');
    setFormDescription('');
    setIsAddingNew(false);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    onDeleteReminder(id);
    setEditingReminder(null);
    setIsAddingNew(false);
  };

  // Format date readable for header in Modal (e.g. "15 de Julio, 2026")
  const formatReadableDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = parts[0];
    const m = parseInt(parts[1]) - 1;
    const d = parseInt(parts[2]);
    return `${d} de ${MONTHS[m]}, ${y}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div id="calendario-tab" className="px-4 py-3 space-y-4 pb-24">
      {/* Calendar Controller Header */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          title="Mes Anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 font-display capitalize">
            {MONTHS[currentMonth]}
          </h2>
          <p className="text-xs font-semibold text-gray-400 font-display mt-0.5">
            {currentYear}
          </p>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          title="Mes Siguiente"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Board */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-3 overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 text-center mb-2">
          {DAYS_OF_WEEK.map((day, idx) => (
            <span
              key={day}
              className={`text-xs font-bold font-display uppercase tracking-wider py-1 ${
                idx === 0 || idx === 6 ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr;
            const cellReminders = getRemindersForDate(cell.dateStr);
            const pendingReminders = cellReminders.filter(r => !r.completed);
            const completedReminders = cellReminders.filter(r => r.completed);

            const hasPendingCollections = pendingReminders.some(r => r.type === 'collection');
            const hasPendingPayments = pendingReminders.some(r => r.type === 'payment');

            const hasCompletedCollections = completedReminders.some(r => r.type === 'collection');
            const hasCompletedPayments = completedReminders.some(r => r.type === 'payment');

            return (
              <button
                key={`${cell.dateStr}-${idx}`}
                onClick={() => handleDayClick(cell.dateStr)}
                className={`aspect-square relative rounded-xl flex flex-col items-center justify-between p-1.5 transition-all outline-hidden cursor-pointer ${
                  cell.isCurrentMonth
                    ? 'hover:bg-blue-50/50 active:bg-blue-100/50'
                    : 'opacity-30 hover:bg-gray-50'
                } ${
                  isToday 
                    ? 'ring-2 ring-blue-500 bg-blue-50/20' 
                    : ''
                }`}
              >
                {/* Day number */}
                <span className={`text-xs font-semibold font-display ${
                  isToday 
                    ? 'text-blue-600 font-bold text-[13px]' 
                    : 'text-gray-800'
                }`}>
                  {cell.dayNum}
                </span>

                {/* Event Dots */}
                <div className="flex gap-0.5 justify-center h-1.5 w-full mt-auto">
                  {hasPendingCollections && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" title="Cobro pendiente" />
                  )}
                  {!hasPendingCollections && hasCompletedCollections && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 inline-flex items-center justify-center text-[5px] text-emerald-600 font-extrabold" title="Cobro cumplido">✓</span>
                  )}
                  {hasPendingPayments && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" title="Pago pendiente" />
                  )}
                  {!hasPendingPayments && hasCompletedPayments && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 inline-flex items-center justify-center text-[5px] text-rose-600 font-extrabold" title="Pago cumplido">✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail & Registration Dialog Modal */}
      {isModalOpen && selectedDateStr && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 animate-fade-in">
          {/* Backdrop click closer */}
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>

          {/* Modal Container */}
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col z-10 border border-gray-100">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display">
                  Recordatorios
                </h3>
                <p className="text-[11px] font-bold text-gray-400 font-sans mt-0.5">
                  {formatReadableDate(selectedDateStr)}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* If NOT editing and NOT adding, show list of current date reminders */}
              {!isAddingNew && !editingReminder && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">
                      Lista para este día
                    </h4>
                    <button
                      onClick={handleStartAdd}
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold font-display flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Nuevo
                    </button>
                  </div>

                  {getRemindersForDate(selectedDateStr).length === 0 ? (
                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs font-medium font-sans">No hay recordatorios registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {getRemindersForDate(selectedDateStr).map((rem) => {
                        const style = getReminderStyle(rem.type);
                        return (
                          <div
                            key={rem.id}
                            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 group ${
                              rem.completed 
                                ? 'bg-slate-50/50 border-slate-150 opacity-75' 
                                : 'bg-gray-50 border-gray-100'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              {/* Complete Toggle Circle */}
                              <button
                                type="button"
                                onClick={() => onUpdateReminder({ ...rem, completed: !rem.completed })}
                                className="mt-1 shrink-0 cursor-pointer focus:outline-hidden"
                                title={rem.completed ? 'Marcar como pendiente' : 'Marcar como cumplido'}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  rem.completed 
                                    ? 'bg-emerald-500 border-emerald-500 text-white scale-105 shadow-3xs' 
                                    : 'border-slate-300 hover:border-slate-400 bg-white'
                                }`}>
                                  {rem.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              </button>

                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                rem.completed ? 'bg-slate-200 text-slate-500' : style.bgColorClass
                              }`}>
                                {style.icon}
                              </div>
                              <div className="min-w-0">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  rem.completed
                                    ? 'bg-slate-200 text-slate-600'
                                    : rem.type === 'collection' 
                                      ? 'bg-emerald-50 text-emerald-700' 
                                      : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {rem.completed ? 'Cumplido' : rem.type === 'collection' ? 'Cobro' : 'Pago'}
                                </span>
                                <h5 className={`font-display font-semibold text-sm leading-tight mt-1 truncate ${
                                  rem.completed ? 'text-slate-400 line-through' : 'text-gray-900'
                                }`}>
                                  {rem.title}
                                </h5>
                                {rem.description && (
                                  <p className={`text-xs font-sans mt-0.5 ${
                                    rem.completed ? 'text-slate-400 line-through' : 'text-gray-400'
                                  }`}>
                                    {rem.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end shrink-0 pl-2">
                              {rem.amount !== undefined && (
                                <span className={`font-display font-bold text-xs leading-tight ${
                                  rem.completed ? 'text-slate-400 line-through font-normal' : 'text-gray-900'
                                }`}>
                                  {currency} {rem.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              )}
                              <div className="flex gap-1.5 mt-2">
                                <button
                                  onClick={() => handleStartEdit(rem)}
                                  className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-500 cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(rem.id)}
                                  className="p-1 hover:bg-red-50 text-red-500 rounded-md transition-colors cursor-pointer"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Edit / Create Form */}
              {(isAddingNew || editingReminder) && (
                <form onSubmit={handleSaveReminder} className="space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">
                      {editingReminder ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
                    </h4>
                    {getRemindersForDate(selectedDateStr).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNew(false);
                          setEditingReminder(null);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 font-bold font-display cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  {/* Title Field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 font-sans">
                      Título o Concepto
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Pagar tarjeta de crédito"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-hidden py-2.5 px-3 rounded-xl text-sm font-medium text-gray-800 transition-all placeholder:text-gray-300"
                    />
                  </div>

                  {/* Type Field (Cobro / Pago) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 font-sans">
                      Tipo
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setFormType('payment')}
                        className={`py-1.5 text-xs font-display font-bold rounded-lg transition-all ${
                          formType === 'payment'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Pago
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormType('collection')}
                        className={`py-1.5 text-xs font-display font-bold rounded-lg transition-all ${
                          formType === 'collection'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Cobro
                      </button>
                    </div>
                  </div>

                  {/* Optional Amount */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 font-sans">
                      Monto (Opcional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-display text-gray-400">
                        {currency}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-hidden py-2.5 pl-10 pr-3 rounded-xl text-sm font-semibold font-display text-gray-800 transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Description field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 font-sans">
                      Descripción o Detalles
                    </label>
                    <textarea
                      placeholder="Agrega más detalles aquí..."
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-hidden py-2 px-3 rounded-xl text-sm font-medium text-gray-800 transition-all placeholder:text-gray-300 resize-none"
                    ></textarea>
                  </div>

                  {/* Action row */}
                  <div className="flex gap-2 shrink-0 pt-2">
                    {editingReminder && (
                      <button
                        type="button"
                        onClick={() => handleDelete(editingReminder.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                        title="Borrar Recordatorio"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 active:bg-blue-700 hover:bg-blue-500 text-white font-display font-bold text-sm py-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Guardar Recordatorio
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
