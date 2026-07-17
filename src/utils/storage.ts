import { Movement, Reminder, UserProfile } from '../types';

const MOVEMENTS_KEY = 'mis_finanzas_movements';
const REMINDERS_KEY = 'mis_finanzas_reminders';
const USER_PROFILE_KEY = 'mis_finanzas_user_profile';


// Generate sample data relative to current year/month
const getSampleData = () => {
  const now = new Date();
  const year = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  
  const sampleMovements: Movement[] = [
    {
      id: 'sample-1',
      type: 'income',
      amount: 4500,
      category: 'Sueldo',
      date: `${year}-${monthStr}-01`,
      note: 'Sueldo mensual neto de la empresa'
    },
    {
      id: 'sample-2',
      type: 'expense',
      amount: 150,
      category: 'Servicios',
      date: `${year}-${monthStr}-03`,
      note: 'Servicio de Internet'
    },
    {
      id: 'sample-3',
      type: 'expense',
      amount: 80,
      category: 'Transporte',
      date: `${year}-${monthStr}-05`,
      note: 'Combustible mensual'
    },
    {
      id: 'sample-4',
      type: 'income',
      amount: 600,
      category: 'Ventas',
      date: `${year}-${monthStr}-08`,
      note: 'Venta de audífonos usados'
    },
    {
      id: 'sample-5',
      type: 'expense',
      amount: 320,
      category: 'Alimentación',
      date: `${year}-${monthStr}-10`,
      note: 'Supermercado semanal'
    },
    {
      id: 'sample-6',
      type: 'expense',
      amount: 120,
      category: 'Entretenimiento',
      date: `${year}-${monthStr}-12`,
      note: 'Entradas de cine y cena'
    }
  ];

  const sampleReminders: Reminder[] = [
    {
      id: 'rem-1',
      title: 'Pagar Alquiler',
      amount: 1200,
      type: 'payment',
      description: 'Pago mensual de departamento',
      date: `${year}-${monthStr}-15`
    },
    {
      id: 'rem-2',
      title: 'Cobrar Freelance',
      amount: 850,
      type: 'collection',
      description: 'Diseño de logotipo para cliente',
      date: `${year}-${monthStr}-20`
    }
  ];

  return { sampleMovements, sampleReminders };
};

export const loadMovements = (): Movement[] => {
  const data = localStorage.getItem(MOVEMENTS_KEY);
  if (!data) {
    const { sampleMovements } = getSampleData();
    saveMovements(sampleMovements);
    return sampleMovements;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing movements', e);
    return [];
  }
};

export const saveMovements = (movements: Movement[]): void => {
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
};

export const loadReminders = (): Reminder[] => {
  const data = localStorage.getItem(REMINDERS_KEY);
  if (!data) {
    const { sampleReminders } = getSampleData();
    saveReminders(sampleReminders);
    return sampleReminders;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing reminders', e);
    return [];
  }
};

export const saveReminders = (reminders: Reminder[]): void => {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

export const loadUserProfile = (): UserProfile => {
  const data = localStorage.getItem(USER_PROFILE_KEY);
  if (!data) {
    return {
      name: 'Usuario',
      currency: 'Bs.',
      avatarSeed: 'finanzas-user',
      isRegistered: false
    };
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return {
      name: 'Usuario',
      currency: 'Bs.',
      avatarSeed: 'finanzas-user',
      isRegistered: false
    };
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
};

const INCOME_CATEGORIES_KEY = 'mis_finanzas_income_categories';
const EXPENSE_CATEGORIES_KEY = 'mis_finanzas_expense_categories';

const DEFAULT_INCOME_CATEGORIES = ['Sueldo', 'Ventas', 'Comisión', 'Préstamo', 'Otros'];
const DEFAULT_EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Salud',
  'Educación',
  'Compras',
  'Entretenimiento',
  'Otros'
];

export const loadIncomeCategories = (): string[] => {
  const data = localStorage.getItem(INCOME_CATEGORIES_KEY);
  if (!data) {
    localStorage.setItem(INCOME_CATEGORIES_KEY, JSON.stringify(DEFAULT_INCOME_CATEGORIES));
    return DEFAULT_INCOME_CATEGORIES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_INCOME_CATEGORIES;
  }
};

export const saveIncomeCategories = (categories: string[]): void => {
  localStorage.setItem(INCOME_CATEGORIES_KEY, JSON.stringify(categories));
};

export const loadExpenseCategories = (): string[] => {
  const data = localStorage.getItem(EXPENSE_CATEGORIES_KEY);
  if (!data) {
    localStorage.setItem(EXPENSE_CATEGORIES_KEY, JSON.stringify(DEFAULT_EXPENSE_CATEGORIES));
    return DEFAULT_EXPENSE_CATEGORIES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_EXPENSE_CATEGORIES;
  }
};

export const saveExpenseCategories = (categories: string[]): void => {
  localStorage.setItem(EXPENSE_CATEGORIES_KEY, JSON.stringify(categories));
};

// Export movements to CSV string
export const exportToCSVString = (movements: Movement[]): string => {
  // UTF-8 BOM to open correctly in Excel
  const BOM = '\uFEFF';
  const headers = ['ID', 'Tipo', 'Monto', 'Categoría', 'Fecha', 'Nota'];
  const rows = movements.map(m => [
    m.id,
    m.type === 'income' ? 'Ingreso' : 'Gasto',
    m.amount.toString(),
    m.category,
    m.date,
    m.note ? m.note.replace(/"/g, '""') : ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(val => `"${val}"`).join(','))
    .join('\n');

  return BOM + csvContent;
};

// Import movements from CSV file text
export const parseCSVString = (csvText: string): Partial<Movement>[] => {
  // Strip BOM if present
  let cleanText = csvText;
  if (csvText.startsWith('\uFEFF')) {
    cleanText = csvText.substring(1);
  }

  const lines = cleanText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) return [];

  // Very robust CSV parsing supporting quoted fields with commas
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let curVal = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(curVal.trim());
        curVal = '';
      } else {
        curVal += char;
      }
    }
    result.push(curVal.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/["']/g, ''));
  const parsedMovements: Partial<Movement>[] = [];

  // Map header indices
  const idIndex = headers.findIndex(h => h.includes('id'));
  const typeIndex = headers.findIndex(h => h.includes('tipo') || h.includes('type'));
  const amountIndex = headers.findIndex(h => h.includes('monto') || h.includes('amount'));
  const categoryIndex = headers.findIndex(h => h.includes('categor') || h.includes('category'));
  const dateIndex = headers.findIndex(h => h.includes('fecha') || h.includes('date'));
  const noteIndex = headers.findIndex(h => h.includes('nota') || h.includes('note'));

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length < 3) continue; // Skip lines that are too short

    const typeRaw = typeIndex !== -1 ? values[typeIndex] : 'gasto';
    const type: 'income' | 'expense' = (typeRaw.toLowerCase() === 'ingreso' || typeRaw.toLowerCase() === 'income') ? 'income' : 'expense';
    const amount = amountIndex !== -1 ? parseFloat(values[amountIndex]) : 0;
    const category = categoryIndex !== -1 ? values[categoryIndex] : 'Otros';
    const date = dateIndex !== -1 ? values[dateIndex] : new Date().toISOString().split('T')[0];
    const note = noteIndex !== -1 ? values[noteIndex] : '';

    if (isNaN(amount) || amount <= 0) continue;

    parsedMovements.push({
      id: idIndex !== -1 && values[idIndex] ? values[idIndex] : `imported-${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      category,
      date,
      note: note || undefined
    });
  }

  return parsedMovements;
};
