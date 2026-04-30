/**
 * holidays.js
 * German national and local holiday calculations.
 */

/** Compute Easter Sunday for a given year (Gauss algorithm). */
function getEaster(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100,
    d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451),
    mo = Math.floor((h + l - 7 * m + 114) / 31),
    da = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, mo - 1, da);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toISO(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Returns a Map of { dateString → holidayName } for national holidays in Germany.
 * These are the holidays that apply nationwide (Bundesfeiertage).
 */
export function getNationalHolidays(year) {
  const e = getEaster(year);
  const f = d => toISO(addDays(e, d));
  return new Map([
    [`${year}-01-01`, 'Neujahr'],
    [f(-2),           'Karfreitag'],
    [f(1),            'Ostermontag'],
    [`${year}-05-01`, 'Tag der Arbeit'],
    [f(39),           'Christi Himmelfahrt'],
    [f(50),           'Pfingstmontag'],
    [f(60),           'Fronleichnam'],
    [`${year}-10-03`, 'Tag der Deutschen Einheit'],
    [`${year}-12-25`, '1. Weihnachtstag'],
    [`${year}-12-26`, '2. Weihnachtstag'],
  ]);
}

/**
 * Returns a Map of { dateString → holidayName } for common local/regional holidays.
 * These are NOT pre-selected — users can opt in.
 */
export function getLocalHolidays(year) {
  return new Map([
    [`${year}-01-06`, 'Heilige Drei Könige'],
    [`${year}-08-15`, 'Mariä Himmelfahrt'],
    [`${year}-10-31`, 'Reformationstag'],
    [`${year}-11-01`, 'Allerheiligen'],
  ]);
}

/**
 * Build a combined Map of all holidays (national + local) for a year range.
 * Returns { natMap: Map, locMap: Map, allMap: Map }
 */
export function buildHolidayMaps(startYear, endYear) {
  const natMap = new Map();
  const locMap = new Map();
  for (let y = startYear; y <= endYear; y++) {
    getNationalHolidays(y).forEach((name, date) => natMap.set(date, name));
    getLocalHolidays(y).forEach((name, date) => locMap.set(date, name));
  }
  const allMap = new Map([...natMap, ...locMap]);
  return { natMap, locMap, allMap };
}
