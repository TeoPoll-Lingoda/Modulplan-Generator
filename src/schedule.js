/**
 * schedule.js
 * Core schedule-building logic and topic sequence.
 *
 * SEQUENCE RULES (immutable):
 *   activeIdx 0  → "Modul 1"                      (only day without Einzelcoaching)
 *   activeIdx 1  → "Modul 1 & Einzelcoaching"
 *   activeIdx 2  → "Modul 2 & Einzelcoaching"
 *   activeIdx 3  → "Modul 2 & Einzelcoaching"
 *   activeIdx 4  → "Modul 3 & Einzelcoaching"
 *   ...
 *   modIdx (0-based) = Math.floor(activeIdx / 2)
 *
 * Cancelled days are skipped — they do NOT consume a slot.
 * No makeup days are added.
 */

import { buildHolidayMaps } from './holidays.js';
import { getModuleName } from './modules.js';
import { addDays, toISO, dowOf, weekMondayOf } from './utils.js';

const WD_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

/** 0-based module index for a given activeIdx */
export function modIdxFor(activeIdx) {
  return Math.floor(activeIdx / 2);
}

/**
 * Returns the full topic string for a given activeIdx.
 * Uses the stored module name from modules.js.
 */
export function topicFor(activeIdx) {
  const modIdx = modIdxFor(activeIdx);
  const name = getModuleName(modIdx);
  if (activeIdx === 0) return name;                   // "Modul 1" — no Einzelcoaching
  return `${name} & Einzelcoaching`;
}

/**
 * Total number of modules for a given number of active days.
 * e.g. 36 days → 18 modules
 */
export function numModules(numActiveDays) {
  return Math.ceil(numActiveDays / 2);
}

/**
 * Build the flat schedule array from startDate until numActiveDays active slots
 * have been filled.
 *
 * Each entry:
 * {
 *   date        : string (YYYY-MM-DD)
 *   dayName     : string (e.g. "Mittwoch")
 *   isOff       : boolean
 *   holidayName : string | null
 *   activeIdx   : number | null  (null for off days)
 * }
 *
 * @param {string}   startDate      ISO date string
 * @param {number}   numActiveDays
 * @param {string[]} selectedDays   Array of weekday numbers (0=Sun … 6=Sat) as strings or numbers
 * @param {Set}      offDates       Set of ISO date strings that are off
 * @returns {Array}
 */
export function buildSchedule(startDate, numActiveDays, selectedDays, offDates) {
  if (!startDate || !numActiveDays || !selectedDays.length) return [];

  const startYear = parseInt(startDate.slice(0, 4));
  const { allMap } = buildHolidayMaps(startYear, startYear + 4);

  const days = [];
  let activeCount = 0;
  let cur = startDate;
  let iter = 0;

  while (activeCount < numActiveDays && iter < 8000) {
    iter++;
    const d = dowOf(cur);
    if (selectedDays.map(Number).includes(d)) {
      const isOff = offDates.has(cur);
      days.push({
        date: cur,
        dayName: WD_NAMES[d],
        isOff,
        holidayName: allMap.get(cur) || null,
        activeIdx: isOff ? null : activeCount,
      });
      if (!isOff) activeCount++;
    }
    cur = toISO(addDays(cur, 1));
  }

  return days;
}

/**
 * Group a flat day array into calendar weeks.
 * Returns array of { weekMon, days[] } sorted chronologically.
 */
export function groupByWeek(days) {
  const map = new Map();
  days.forEach(d => {
    const wk = weekMondayOf(d.date);
    if (!map.has(wk)) map.set(wk, { weekMon: wk, days: [] });
    map.get(wk).days.push(d);
  });
  return [...map.values()].sort((a, b) => a.weekMon.localeCompare(b.weekMon));
}

/**
 * Initialise offDates by pre-selecting all national holidays
 * that fall on scheduled days within the course period.
 *
 * Mutates the passed-in Set.
 */
export function initOffDates(startDate, numActiveDays, selectedDays, offDates) {
  const startYear = parseInt(startDate.slice(0, 4));
  const { natMap } = buildHolidayMaps(startYear, startYear + 4);

  let cur = startDate;
  let active = 0;
  let iter = 0;

  while (active < numActiveDays && iter < 8000) {
    iter++;
    const d = dowOf(cur);
    if (selectedDays.map(Number).includes(d)) {
      if (natMap.has(cur)) {
        if (!offDates.has(cur)) offDates.add(cur);
      } else if (!offDates.has(cur)) {
        active++;
      }
    }
    cur = toISO(addDays(cur, 1));
  }
}

/**
 * Compute the last date in the schedule (end of course).
 */
export function computeEndDate(startDate, numActiveDays, selectedDays, offDates) {
  const days = buildSchedule(startDate, numActiveDays, selectedDays, offDates);
  return days.length ? days[days.length - 1].date : startDate;
}

/**
 * Build holiday groups for the UI panel (Feiertage section).
 * Returns array of { weekMon, primaryHol, primaryName, isNat, pills[] }
 */
export function buildHolidayGroups(startDate, numActiveDays, selectedDays, offDates) {
  if (!startDate || !numActiveDays || !selectedDays.length) return [];

  const startYear = parseInt(startDate.slice(0, 4));
  const { natMap, locMap, allMap } = buildHolidayMaps(startYear, startYear + 4);

  const classDays = [];
  let active = 0;
  let cur = startDate;
  let iter = 0;

  while (active < numActiveDays && iter < 8000) {
    iter++;
    const d = dowOf(cur);
    if (selectedDays.map(Number).includes(d)) {
      classDays.push({
        date: cur,
        dayName: WD_NAMES[d],
        isNat: natMap.has(cur),
        isLoc: locMap.has(cur),
        holidayName: allMap.get(cur) || null,
      });
      if (!offDates.has(cur)) active++;
    }
    cur = toISO(addDays(cur, 1));
  }

  const seen = new Set();
  const groups = [];

  classDays.forEach(cd => {
    if (!cd.isNat && !cd.isLoc) return;
    const wk = weekMondayOf(cd.date);
    if (seen.has(wk)) return;
    seen.add(wk);
    const wkEnd = toISO(addDays(wk, 6));
    groups.push({
      weekMon: wk,
      primaryHol: cd,
      primaryName: cd.holidayName,
      isNat: cd.isNat,
      pills: classDays.filter(x => x.date >= wk && x.date <= wkEnd),
    });
  });

  return groups;
}
