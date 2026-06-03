import type { Plant } from '../types/plant';

export const APP_TIMEZONE = import.meta.env.TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Returns a Date object representing the year, month, day, and time components of the given date 
 * inside the target timezone, allowing timezone-aligned day calculations and greetings.
 */
export function getLocalDateInTimezone(date: Date, timeZone: string = APP_TIMEZONE): Date {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parseInt(parts.find(p => p.type === type)!.value);
    
    // getPart('month') is 1-indexed (1-12), Date constructor expects 0-indexed (0-11)
    return new Date(
      getPart('year'),
      getPart('month') - 1,
      getPart('day'),
      getPart('hour'),
      getPart('minute'),
      getPart('second')
    );
  } catch {
    // Fallback to client browser system time
    return new Date(date);
  }
}

/**
 * Gets a friendly upcoming watering text relative to the configured timezone.
 */
export function getUpcomingWateringText(plant: Plant): string {
  if (!plant.lastWater && !plant.createdAt) {
    return 'Due now';
  }
  const baseDate = plant.lastWater ? new Date(plant.lastWater) : new Date(plant.createdAt!);
  const next = new Date(baseDate.getTime() + plant.every * 24 * 60 * 60 * 1000);
  
  const now = new Date();
  
  const nextTz = getLocalDateInTimezone(next);
  const nowTz = getLocalDateInTimezone(now);
  
  // Set to midnight for accurate day comparison
  const nextMidnight = new Date(nextTz.getFullYear(), nextTz.getMonth(), nextTz.getDate());
  const nowMidnight = new Date(nowTz.getFullYear(), nowTz.getMonth(), nowTz.getDate());
  
  const diffTime = nextMidnight.getTime() - nowMidnight.getTime();
  const diffDays = Math.ceil(diffTime / (24 * 60 * 60 * 1000));
  
  if (diffDays <= 0) return 'Due now';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === 2) return 'In 2 days';
  
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (diffDays < 7) {
    return DAYS[nextTz.getDay()];
  }
  
  return `In ${diffDays} days`;
}
