import { createContext, useContext } from 'react';

export type Units = 'imperial' | 'metric';

/**
 * Current measurement system for the signed-in user. Defaults to imperial so
 * the app reads sensibly before the user's profile loads.
 */
export const UnitsContext = createContext<Units>('imperial');

export const useUnits = (): Units => useContext(UnitsContext);

const round = (n: number, dp = 1): number => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

export const cmToIn = (cm: number): number => cm / 2.54;
export const inToCm = (inches: number): number => inches * 2.54;
export const cToF = (c: number): number => (c * 9) / 5 + 32;

/** Short label for the length unit in the active system. */
export const lengthUnit = (units: Units): string => (units === 'imperial' ? 'in' : 'cm');

/** Convert a stored centimetre value into the user's unit, rounded for display. */
export const toDisplayLength = (cm: number, units: Units): number =>
  units === 'imperial' ? round(cmToIn(cm), 1) : round(cm, 1);

/** Convert a user-entered length (in their unit) back into centimetres for storage. */
export const fromDisplayLength = (value: number, units: Units): number =>
  units === 'imperial' ? inToCm(value) : value;

/** e.g. "15 cm" or "5.9 in" */
export const formatLength = (cm: number, units: Units): string =>
  `${toDisplayLength(cm, units)} ${lengthUnit(units)}`;

/** Temperature range, e.g. "18–24°C" or "64–75°F". */
export const formatTempRange = (minC: number, maxC: number, units: Units): string =>
  units === 'imperial'
    ? `${Math.round(cToF(minC))}–${Math.round(cToF(maxC))}°F`
    : `${minC}–${maxC}°C`;
