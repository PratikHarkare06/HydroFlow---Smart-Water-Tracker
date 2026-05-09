import { DrinkType } from '../types';

const OZ_TO_ML = 29.5735;

export const convertMlToDisplay = (ml: number, unit: 'ml' | 'oz') => {
  if (unit === 'oz') return Math.round((ml / OZ_TO_ML) * 10) / 10;
  return Math.round(ml);
};

export const convertDisplayToMl = (value: number, unit: 'ml' | 'oz') => {
  if (unit === 'oz') return Math.round(value * OZ_TO_ML);
  return Math.round(value);
};

const inferDrinkType = (text: string): DrinkType => {
  const t = text.toLowerCase();
  if (t.includes('coffee')) return DrinkType.COFFEE;
  if (t.includes('tea')) return DrinkType.TEA;
  if (t.includes('juice')) return DrinkType.JUICE;
  if (t.includes('soda') || t.includes('cola')) return DrinkType.SODA;
  return DrinkType.WATER;
};

export const parseVoiceLogCommand = (input: string): { amountMl: number; type: DrinkType } | null => {
  const normalized = input.toLowerCase();
  const amountMatch = normalized.match(/(\d+(\.\d+)?)/);
  if (!amountMatch) return null;
  const parsedAmount = Number(amountMatch[1]);
  const isOz = normalized.includes('oz') || normalized.includes('ounce');
  const amountMl = convertDisplayToMl(parsedAmount, isOz ? 'oz' : 'ml');
  return {
    amountMl: Math.max(20, Math.min(1500, amountMl)),
    type: inferDrinkType(normalized)
  };
};

export const inferDrinkFromFileName = (name: string): { type: DrinkType; amountMl: number } => {
  const lower = name.toLowerCase();
  const type = inferDrinkType(lower);
  const match = lower.match(/(\d+(\.\d+)?)(ml|oz)?/);
  if (!match) return { type, amountMl: 250 };
  const val = Number(match[1]);
  const unit = match[3] === 'oz' ? 'oz' : 'ml';
  return {
    type,
    amountMl: convertDisplayToMl(val, unit)
  };
};
