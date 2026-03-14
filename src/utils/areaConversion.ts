export type AreaUnit = 'sqft' | 'sqm' | 'yard';

export const conversionRates: Record<AreaUnit, Record<AreaUnit, number>> = {
  sqft: {
    sqft: 1,
    sqm: 0.092903,
    yard: 0.111111
  },
  sqm: {
    sqft: 10.7639,
    sqm: 1,
    yard: 1.19599
  },
  yard: {
    sqft: 9,
    sqm: 0.836127,
    yard: 1
  }
};

export const convertArea = (
  value: number,
  fromUnit: AreaUnit,
  toUnit: AreaUnit
): number => {
  return value * conversionRates[fromUnit][toUnit];
};

export const formatArea = (value: number, unit: AreaUnit): string => {
  return `${value.toFixed(2)} ${unit}`;
};

export const getAllEquivalentAreas = (value: number, unit: AreaUnit) => {
  return {
    sqft: convertArea(value, unit, 'sqft'),
    sqm: convertArea(value, unit, 'sqm'),
    yard: convertArea(value, unit, 'yard')
  };
};
