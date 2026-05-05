/**
 * state.js
 * Central application state.
 * All UI modules read from and write to this object, then call refresh().
 */

export const state = {
  // Course details
  courseName:  'Job BSK – Bahninfrastruktur',
  descText:    '',

  // Schedule parameters
  startDate:   '2026-05-27',
  numDays:     36,
  selectedDays: [3, 4],   // weekday numbers, 0=Sun … 6=Sat

  // Time slots
  sameTime:    true,
  time1start:  '16:00',
  time1end:    '19:15',
  format1:     'Gruppenunterricht & Einzelcoaching',
  time2start:  '16:00',
  time2end:    '19:15',
  format2:     'Gruppenunterricht & Einzelcoaching',

  // Off dates (Set of ISO date strings)
  offDates:    new Set(),

  // Active tab
  activeTab:   'setup',
};

/** Registered refresh callbacks */
const _listeners = [];

/** Register a function to be called whenever state changes. */
export function onStateChange(fn) {
  _listeners.push(fn);
}

/** Notify all listeners that state has changed. */
export function notifyChange() {
  _listeners.forEach(fn => fn());
}

/** Helper: get time string for a specific scheduled date. */
export function getTimeForDate(date) {
  if (state.sameTime || state.selectedDays.length < 2) {
    return {
      time:   `${state.time1start} – ${state.time1end} Uhr`,
      format: state.format1,
    };
  }
  const sorted = [...state.selectedDays].sort((a, b) => (a || 7) - (b || 7));
  const dow = new Date(date + 'T12:00:00').getDay();
  if (dow === sorted[0]) {
    return { time: `${state.time1start} – ${state.time1end} Uhr`, format: state.format1 };
  }
  return { time: `${state.time2start} – ${state.time2end} Uhr`, format: state.format2 };
}
