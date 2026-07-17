import React from 'react';
import {
  Briefcase,
  TrendingUp,
  Percent,
  HandCoins,
  HelpCircle,
  Utensils,
  Car,
  Home,
  Zap,
  HeartPulse,
  GraduationCap,
  ShoppingCart,
  Film,
  PlusCircle,
  MinusCircle,
  Bell,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

interface CategoryStyle {
  icon: React.ReactNode;
  colorClass: string;
  bgColorClass: string;
}

export const getCategoryStyle = (category: string, type: 'income' | 'expense'): CategoryStyle => {
  const normCategory = category.trim().toLowerCase();

  if (type === 'income') {
    switch (normCategory) {
      case 'sueldo':
        return {
          icon: React.createElement(Briefcase, { className: "w-5 h-5 text-emerald-600" }),
          colorClass: 'text-emerald-600',
          bgColorClass: 'bg-emerald-100'
        };
      case 'ventas':
        return {
          icon: React.createElement(TrendingUp, { className: "w-5 h-5 text-emerald-600" }),
          colorClass: 'text-emerald-600',
          bgColorClass: 'bg-emerald-100'
        };
      case 'comisión':
      case 'comision':
        return {
          icon: React.createElement(Percent, { className: "w-5 h-5 text-emerald-600" }),
          colorClass: 'text-emerald-600',
          bgColorClass: 'bg-emerald-100'
        };
      case 'préstamo':
      case 'prestamo':
        return {
          icon: React.createElement(HandCoins, { className: "w-5 h-5 text-emerald-600" }),
          colorClass: 'text-emerald-600',
          bgColorClass: 'bg-emerald-100'
        };
      default:
        return {
          icon: React.createElement(PlusCircle, { className: "w-5 h-5 text-emerald-600" }),
          colorClass: 'text-emerald-600',
          bgColorClass: 'bg-emerald-100'
        };
    }
  } else {
    switch (normCategory) {
      case 'alimentación':
      case 'alimentacion':
        return {
          icon: React.createElement(Utensils, { className: "w-5 h-5 text-rose-600" }),
          colorClass: 'text-rose-600',
          bgColorClass: 'bg-rose-100'
        };
      case 'transporte':
        return {
          icon: React.createElement(Car, { className: "w-5 h-5 text-rose-600" }),
          colorClass: 'text-rose-600',
          bgColorClass: 'bg-rose-100'
        };
      case 'vivienda':
        return {
          icon: React.createElement(Home, { className: "w-5 h-5 text-rose-600" }),
          colorClass: 'text-rose-600',
          bgColorClass: 'bg-rose-100'
        };
      case 'servicios':
        return {
          icon: React.createElement(Zap, { className: "w-5 h-5 text-rose-600" }),
          colorClass: 'text-rose-600',
          bgColorClass: 'bg-rose-100'
        };
      case 'salud':
        return {
          icon: React.createElement(HeartPulse, { className: "w-5 h-5 text-rose-600" }),
          colorClass: 'text-rose-600',
          bgColorClass: 'bg-rose-100'
        };
      case 'educación':
      case 'educacion':
        return {
          icon: React.createElement(GraduationCap, { className: "w-5 h-5 text-rose-600" }),
          colorClass: 'text-rose-600',
          bgColorClass: 'bg-rose-100'
        };
      case 'compras':
        return {
          icon: React.createElement(ShoppingCart, { className: "w-5 h-5 text-rose-600" }),
          colorClass: 'text-rose-600',
          bgColorClass: 'bg-rose-100'
        };
      case 'entretenimiento':
        return {
          icon: React.createElement(Film, { className: "w-5 h-5 text-rose-600" }),
          colorClass: 'text-rose-600',
          bgColorClass: 'bg-rose-100'
        };
      default:
        return {
          icon: React.createElement(MinusCircle, { className: "w-5 h-5 text-rose-600" }),
          colorClass: 'text-rose-600',
          bgColorClass: 'bg-rose-100'
        };
    }
  }
};

export const getReminderStyle = (type: 'collection' | 'payment'): CategoryStyle => {
  if (type === 'collection') {
    return {
      icon: React.createElement(ArrowUpRight, { className: "w-5 h-5 text-emerald-600" }),
      colorClass: 'text-emerald-600',
      bgColorClass: 'bg-emerald-100'
    };
  } else {
    return {
      icon: React.createElement(ArrowDownLeft, { className: "w-5 h-5 text-rose-600" }),
      colorClass: 'text-rose-600',
      bgColorClass: 'bg-rose-100'
    };
  }
};
