export type CalculatorInputType = 'number' | 'select' | 'text' | 'date';

export interface CalculatorInputField {
  id: string;
  label: string;
  type: CalculatorInputType;
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  helperText?: string;
  options?: { label: string; value: any }[];
}

export interface CalculatorOutputMetric {
  label: string;
  value: string | number;
  subtext?: string;
  isHighlight?: boolean;
  badge?: string;
}

export interface CalculatorBreakdownRow {
  label: string;
  value: string | number;
  percentage?: number;
  note?: string;
}

export interface CalculatorResult {
  success: boolean;
  primary: {
    label: string;
    value: string;
    unit?: string;
  };
  metrics: CalculatorOutputMetric[];
  breakdownTitle?: string;
  breakdownRows?: CalculatorBreakdownRow[];
  interpretation?: string;
  formulaExplanation?: string;
  exampleCalculation?: string;
  notes?: string[];
  error?: string;
}

export interface CalculatorDefinition {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  iconName: string;
  tags: string[];
  inputs: CalculatorInputField[];
  calculate: (inputs: Record<string, any>) => CalculatorResult;
  validate?: (inputs: Record<string, any>) => { valid: boolean; error?: string };
  seo: {
    title: string;
    metaDescription: string;
    keywords: string[];
  };
  howTo: {
    step: number;
    title: string;
    description: string;
  }[];
}
