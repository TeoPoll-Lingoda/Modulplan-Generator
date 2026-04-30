/**
 * ui/preview.js
 * Renders the "Vorschau" tab — stats row and schedule table.
 */

import { state, getTimeForDate } from '../state.js';
import { buildSchedule, groupByWeek, topicFor } from '../schedule.js';
import { fmtDate } from '../utils.js';

/** Render stats cards above the table. */
function renderStats(allDays, weeks) {
  const el = document.getElementById('statsRow');
  if (!el) return;
  const cancelled = allDays.filter(d => d.isOff).length;
  el.innerHTML = `
    <div class="stat-card"><span class="stat-num">${weeks.length}</span><span class="stat-label">Wochen gesamt</span></div>
    <div class="stat-card"><span class="stat-num">${state.numDays}</span><span class="stat-label">Aktive Unterrichtstage</span></div>
    <div class="stat-card"><span class="stat-num">${cancelled}</span><span class="stat-label">Ausgefallene Tage</span></div>`;
}

/** Render the full schedule preview table. */
export function renderPreview() {
  const { startDate, numDays, selectedDays, offDates } = state;
  const contentEl = document.getElementById('previewContent');
  if (!contentEl) return;

  if (!startDate || !numDays || !selectedDays.length) {
    contentEl.innerHTML = '<p class="muted">Einstellungen eingeben…</p>';
    return;
  }

  const allDays = buildSchedule(startDate, numDays, selectedDays, offDates);
  const weeks   = groupByWeek(allDays);
  renderStats(allDays, weeks);

  let html = `
    <table class="preview-table">
      <thead>
        <tr>
          <th>Datum – Woche</th>
          <th>Wochentag</th>
          <th>Thema</th>
          <th>Zeit</th>
        </tr>
      </thead>
      <tbody>`;

  let weekNum = 0;
  weeks.forEach(week => {
    weekNum++;
    const allOff    = week.days.every(d => d.isOff);
    const wStart    = week.days[0].date;
    const wEnd      = week.days[week.days.length - 1].date;
    const dateRange = `${fmtDate(wStart)} – ${fmtDate(wEnd)}`;
    const wkLabel   = `Woche ${weekNum}`;

    if (allOff) {
      const reasons = [...new Set(week.days.map(d => d.holidayName).filter(Boolean))].join(', ');
      html += `
        <tr class="row-cancelled-week">
          <td colspan="4" class="cancelled-week-cell">
            <strong>${dateRange}</strong>&nbsp;&nbsp;
            <span class="off-badge">${reasons || 'Kein Unterricht'}</span>
          </td>
        </tr>`;
    } else {
      week.days.forEach((day, di) => {
        const tf  = getTimeForDate(day.date);
        const cls = day.isOff ? 'row-off' : '';
        html += `<tr class="${cls}">`;

        // Date cell — rowspan on first row of week
        if (di === 0) {
          html += `
            <td rowspan="${week.days.length}" class="date-cell">
              <strong>${dateRange}</strong>
              <span class="week-label">${wkLabel}</span>
            </td>`;
        }

        if (day.isOff) {
          html += `
            <td>${day.dayName}</td>
            <td colspan="2">
              <span class="off-badge">${day.holidayName || 'Ausgefallen'}</span>
            </td>`;
        } else {
          html += `
            <td>${day.dayName}</td>
            <td>${topicFor(day.activeIdx)}</td>
            <td class="time-cell">${tf.time}</td>`;
        }

        html += '</tr>';
      });
    }
  });

  html += '</tbody></table>';
  contentEl.innerHTML = html;
}
