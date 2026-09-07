import { CalculatorDefinition } from './types';
import { financeCalculators } from './definitions/financeCalculators';
import { businessCalculators } from './definitions/businessCalculators';
import { mathCalculators } from './definitions/mathCalculators';
import { statsCalculators } from './definitions/statsCalculators';
import { healthCalculators } from './definitions/healthCalculators';
import { dateCalculators } from './definitions/dateCalculators';
import { homeCalculators } from './definitions/homeCalculators';
import { techCalculators } from './definitions/techCalculators';
import { everydayCalculators } from './definitions/everydayCalculators';

export const ALL_50_CALCULATORS: CalculatorDefinition[] = [
  ...financeCalculators,
  ...businessCalculators,
  ...mathCalculators,
  ...statsCalculators,
  ...healthCalculators,
  ...dateCalculators,
  ...homeCalculators,
  ...techCalculators,
  ...everydayCalculators,
];

export const CALCULATOR_MAP = new Map<string, CalculatorDefinition>(
  ALL_50_CALCULATORS.map((calc) => [calc.id, calc])
);

export function getCalculatorDef(id: string): CalculatorDefinition | undefined {
  if (CALCULATOR_MAP.has(id)) {
    return CALCULATOR_MAP.get(id);
  }
  // Try normalising
  const cleanId = id.replace(/^(calculators-|calc-)/, '');
  if (CALCULATOR_MAP.has(cleanId)) {
    return CALCULATOR_MAP.get(cleanId);
  }
  // Fallback search by prefix or match
  return ALL_50_CALCULATORS.find(
    (c) => c.id === cleanId || id.includes(c.id) || c.id.includes(id)
  );
}

export const CALCULATOR_CATEGORIES = [
  { id: 'finance', name: 'Finance & Money', count: 9 },
  { id: 'business', name: 'Business & Commerce', count: 5 },
  { id: 'math', name: 'Math & Algebra', count: 6 },
  { id: 'statistics', name: 'Percentage & Statistics', count: 5 },
  { id: 'health', name: 'Health & Fitness', count: 6 },
  { id: 'datetime', name: 'Date & Time', count: 4 },
  { id: 'home', name: 'Construction & Home', count: 5 },
  { id: 'technology', name: 'Technology & Engineering', count: 5 },
  { id: 'everyday', name: 'Everyday Life & Utility', count: 5 },
];
