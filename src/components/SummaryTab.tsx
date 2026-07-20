import React, { useState } from 'react';
import { Movement } from '../types';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CalendarDays, 
  ArrowUpRight, 
  ArrowDownLeft,
  Building2,
  CreditCard,
  PiggyBank,
  Coins,
  ChevronRight,
  PieChart,
  DollarSign
} from 'lucide-react';

interface SummaryTabProps {
  movements: Movement[];
  currency: string;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ movements, currency }) => {
  const [accountPeriod, setAccountPeriod] = useState<'month' | 'all'>('all');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  // Filter movements for current calendar month
  const currentMonthMovements = movements.filter((m) => {
    const mDate = new Date(m.date + 'T00:00:00'); // enforce local time parsing
    return mDate.getFullYear() === currentYear && mDate.getMonth() === currentMonth;
  });

  // Monthly totals
  const monthlyIncomes = currentMonthMovements
    .filter((m) => m.type === 'income')
    .reduce((sum, m) => sum + m.amount, 0);

  const monthlyExpenses = currentMonthMovements
    .filter((m) => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0);

  const monthlyBalance = monthlyIncomes - monthlyExpenses;

  // Last 30 Days totals
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const last30DaysMovements = movements.filter((m) => {
    const mDate = new Date(m.date + 'T00:00:00');
    return mDate >= thirtyDaysAgo && mDate <= now;
  });

  const last30Incomes = last30DaysMovements
    .filter((m) => m.type === 'income')
    .reduce((sum, m) => sum + m.amount, 0);

  const last30Expenses = last30DaysMovements
    .filter((m) => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0);

  // Chart proportions (Ingresos vs Gastos for current month)
  const maxMonthlyVal = Math.max(monthlyIncomes, monthlyExpenses, 1);
  const incomeBarHeight = (monthlyIncomes / maxMonthlyVal) * 100;
  const expenseBarHeight = (monthlyExpenses / maxMonthlyVal) * 100;

  // Format month name
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const currentMonthLabel = monthNames[currentMonth];

  // --- REPORT BY ACCOUNT TYPE LOGIC ---
  const activeAccountMovements = movements.filter((m) => {
    if (accountPeriod === 'month') {
      const mDate = new Date(m.date + 'T00:00:00');
      return mDate.getFullYear() === currentYear && mDate.getMonth() === currentMonth;
    }
    return true; // All time
  });

  // Aggregate by account name
  const accountSummaryMap: { [key: string]: { income: number; expense: number } } = {};

  activeAccountMovements.forEach((m) => {
    const accName = m.account || 'Efectivo';
    if (!accountSummaryMap[accName]) {
      accountSummaryMap[accName] = { income: 0, expense: 0 };
    }
    if (m.type === 'income') {
      accountSummaryMap[accName].income += m.amount;
    } else {
      accountSummaryMap[accName].expense += m.amount;
    }
  });

  const accountSummaries = Object.keys(accountSummaryMap).map((name) => {
    const { income, expense } = accountSummaryMap[name];
    const balance = income - expense;
    return { name, income, expense, balance };
  });

  // Sort by balance descending
  accountSummaries.sort((a, b) => b.balance - a.balance);

  // Helper to get nice icon for accounts
  const getAccountIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (
      lower.includes('banco') || 
      lower.includes('bcp') || 
      lower.includes('mercantil') || 
      lower.includes('sol') || 
      lower.includes('ahorro') || 
      lower.includes('corriente') ||
      lower.includes('bancaria')
    ) {
      return (
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
          <Building2 className="w-5 h-5 text-indigo-600" />
        </div>
      );
    }
    if (
      lower.includes('tarjeta') || 
      lower.includes('crédito') || 
      lower.includes('credito') || 
      lower.includes('visa') || 
      lower.includes('mastercard') || 
      lower.includes('débito') || 
      lower.includes('debito')
    ) {
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
          <CreditCard className="w-5 h-5 text-purple-600" />
        </div>
      );
    }
    if (
      lower.includes('caja') || 
      lower.includes('ahorro') || 
      lower.includes('alcancía') || 
      lower.includes('cochinito') || 
      lower.includes('reserva') ||
      lower.includes('guardado')
    ) {
      return (
        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100">
          <PiggyBank className="w-5 h-5 text-pink-600" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
        <Coins className="w-5 h-5 text-amber-600" />
      </div>
    );
  };

  return (
    <div id="resumen-tab" className="px-4 py-3 space-y-6 pb-24">
      
      {/* Month Indicator Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-display">Resumen Mensual</h2>
          <p className="text-xs font-semibold text-gray-400 font-sans mt-0.5 uppercase tracking-wider">
            {currentMonthLabel} {currentYear}
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-display font-semibold text-xs flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5" />
          Mes Actual
        </div>
      </div>

      {/* Grid of Three Target Cards */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Card 1: Ingresos del mes */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">
              Ingresos del mes
            </span>
            <p className="text-2xl font-black text-gray-900 font-display leading-tight">
              {currency} {monthlyIncomes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Card 2: Gastos del mes */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">
              Gastos del mes
            </span>
            <p className="text-2xl font-black text-gray-900 font-display leading-tight">
              {currency} {monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6 text-rose-600" />
          </div>
        </div>

        {/* Card 3: Saldo mensual */}
        <div className={`rounded-3xl p-5 border shadow-xs flex items-center justify-between transition-colors ${
          monthlyBalance >= 0 
            ? 'bg-emerald-50/50 border-emerald-100' 
            : 'bg-rose-50/50 border-rose-100'
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">
              Saldo Neto
            </span>
            <p className={`text-2xl font-black font-display leading-tight ${
              monthlyBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {currency} {monthlyBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            monthlyBalance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            <Wallet className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Report by Accounts Section */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-orange-500" />
              Reporte por Tipo de Cuenta
            </h3>
            <p className="text-[10px] text-gray-400 font-sans">
              Saldos y flujos agrupados por cuenta de origen/destino
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold font-sans self-start sm:self-center">
            <button
              onClick={() => setAccountPeriod('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                accountPeriod === 'all'
                  ? 'bg-white text-slate-800 shadow-3xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setAccountPeriod('month')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                accountPeriod === 'month'
                  ? 'bg-white text-slate-800 shadow-3xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Mes Actual
            </button>
          </div>
        </div>

        {accountSummaries.length === 0 ? (
          <div className="h-28 flex items-center justify-center text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs font-medium px-4">
              Aún no hay movimientos registrados para las cuentas en este período.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {accountSummaries.map((acc, idx) => {
              const totalFlow = acc.income + acc.expense;
              const incPercent = totalFlow > 0 ? (acc.income / totalFlow) * 100 : 0;
              const expPercent = totalFlow > 0 ? (acc.expense / totalFlow) * 100 : 0;

              return (
                <motion.div
                  key={acc.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100/70 p-3.5 rounded-2xl transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getAccountIcon(acc.name)}
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 truncate font-display">
                          {acc.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold text-slate-400">
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            +{currency}{acc.income.toFixed(0)}
                          </span>
                          <span>•</span>
                          <span className="text-rose-600 flex items-center gap-0.5">
                            -{currency}{acc.expense.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                        Saldo
                      </span>
                      <span className={`text-xs font-black font-display ${
                        acc.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {acc.balance >= 0 ? '+' : ''}{currency} {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Flow Split Progress Bar */}
                  {totalFlow > 0 ? (
                    <div className="mt-3.5 space-y-1">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-emerald-500 rounded-l-full transition-all duration-500" 
                          style={{ width: `${incPercent}%` }}
                          title={`Ingresos: ${incPercent.toFixed(0)}%`}
                        />
                        <div 
                          className="h-full bg-rose-500 rounded-r-full transition-all duration-500" 
                          style={{ width: `${expPercent}%` }}
                          title={`Gastos: ${expPercent.toFixed(0)}%`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                        <span>Ingreso: {incPercent.toFixed(0)}%</span>
                        <span>Gasto: {expPercent.toFixed(0)}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-[9px] text-slate-400 text-center italic font-sans">
                      Sin movimientos monetarios en este período
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Last 30 Days block */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 font-display flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-gray-500" />
          Últimos 30 días
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Last 30 Income */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
            <div className="flex items-center gap-1 mb-1">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Ingresos
              </span>
            </div>
            <p className="text-base font-black text-gray-900 font-display leading-tight">
              {currency} {last30Incomes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Last 30 Expenses */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
            <div className="flex items-center gap-1 mb-1">
              <ArrowDownLeft className="w-4 h-4 text-rose-600" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Gastos
              </span>
            </div>
            <p className="text-base font-black text-gray-900 font-display leading-tight">
              {currency} {last30Expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-gray-900 font-display">
            Comparativa de Flujos
          </h3>
          <p className="text-[10px] text-gray-400">
            Relación de Ingresos vs Gastos del mes de {currentMonthLabel}
          </p>
        </div>

        {monthlyIncomes === 0 && monthlyExpenses === 0 ? (
          <div className="h-44 flex items-center justify-center text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs font-medium px-4">
              Registra movimientos este mes para visualizar el gráfico comparativo
            </p>
          </div>
        ) : (
          <div className="pt-2">
            {/* Visual Bars Container */}
            <div className="grid grid-cols-2 gap-6 items-end justify-center h-40 max-w-xs mx-auto relative px-4">
              
              {/* Income Bar (Green) */}
              <div className="flex flex-col items-center justify-end h-full group">
                <div className="relative w-14 flex flex-col justify-end h-full">
                  {/* Floating value tag on hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-100 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md shadow-3xs whitespace-nowrap">
                    {incomeBarHeight.toFixed(0)}%
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${incomeBarHeight}%` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 rounded-t-2xl shadow-xs shrink-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs font-bold text-gray-900 mt-2 font-display">Ingresos</span>
                <span className="text-[10px] font-bold text-emerald-600 mt-0.5">
                  {currency} {monthlyIncomes >= 1000 ? `${(monthlyIncomes / 1000).toFixed(1)}k` : monthlyIncomes.toFixed(0)}
                </span>
              </div>

              {/* Expense Bar (Red) */}
              <div className="flex flex-col items-center justify-end h-full group">
                <div className="relative w-14 flex flex-col justify-end h-full">
                  {/* Floating value tag on hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-100 text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md shadow-3xs whitespace-nowrap">
                    {expenseBarHeight.toFixed(0)}%
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${expenseBarHeight}%` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                    className="w-full bg-rose-500 hover:bg-rose-400 rounded-t-2xl shadow-xs shrink-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs font-bold text-gray-900 mt-2 font-display">Gastos</span>
                <span className="text-[10px] font-bold text-rose-600 mt-0.5">
                  {currency} {monthlyExpenses >= 1000 ? `${(monthlyExpenses / 1000).toFixed(1)}k` : monthlyExpenses.toFixed(0)}
                </span>
              </div>

            </div>

            {/* Total context percentage summary */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 mt-6 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-sans font-medium">Relación de Gastos:</span>
              <span className={`font-display font-bold ${
                monthlyExpenses > monthlyIncomes ? 'text-rose-600' : 'text-gray-600'
              }`}>
                {monthlyIncomes > 0 
                  ? `${((monthlyExpenses / monthlyIncomes) * 100).toFixed(0)}% del ingreso`
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

