import { addDays, differenceInCalendarDays, format, isAfter, isBefore, startOfDay } from 'date-fns';
import type { Duration } from './brand';

/**
 * Week engine. Every date in Internora is derived from one stored start_date.
 * Nothing is hard-coded: week 1 is days 0-6, week 2 is days 7-13, and so on.
 */
export type WeekWindow = { weekNumber: number; startDate: Date; endDate: Date };

export function weekWindows(startDate: Date | string, duration: Duration): WeekWindow[] {
  const start = startOfDay(new Date(startDate));
  return Array.from({ length: duration }, (_, i) => ({
    weekNumber: i + 1,
    startDate: addDays(start, i * 7),
    endDate: addDays(start, i * 7 + 6),
  }));
}

export function internshipEndDate(startDate: Date | string, duration: Duration): Date {
  return addDays(startOfDay(new Date(startDate)), duration * 7 - 1);
}

export function totalDays(duration: Duration) {
  return duration * 7;
}

/** "Day 10 of 56" — day 1 is the start date itself. */
export function dayOfInternship(startDate: Date | string, on: Date = new Date()) {
  return differenceInCalendarDays(startOfDay(on), startOfDay(new Date(startDate))) + 1;
}

export function daysRemaining(endDate: Date | string, on: Date = new Date()) {
  return Math.max(0, differenceInCalendarDays(startOfDay(new Date(endDate)), startOfDay(on)));
}

export function currentWeekNumber(startDate: Date | string, duration: Duration, on: Date = new Date()) {
  const day = dayOfInternship(startDate, on);
  if (day < 1) return 0;
  return Math.min(duration, Math.ceil(day / 7));
}

export function isWithin(d: Date, start: Date | string, end: Date | string) {
  const day = startOfDay(d);
  return !isBefore(day, startOfDay(new Date(start))) && !isAfter(day, startOfDay(new Date(end)));
}

/** "Sunday, 20 September 2026" — always rendered from the live system date. */
export const longDate = (d: Date | string = new Date()) => format(new Date(d), 'EEEE, d MMMM yyyy');
export const shortDate = (d: Date | string) => format(new Date(d), 'd MMM yyyy');
export const isoDate = (d: Date | string) => format(new Date(d), 'yyyy-MM-dd');
export const isOverdue = (deadline: Date | string, on: Date = new Date()) =>
  isAfter(startOfDay(on), startOfDay(new Date(deadline)));
