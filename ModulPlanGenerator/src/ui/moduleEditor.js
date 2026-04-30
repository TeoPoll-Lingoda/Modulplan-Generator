/**
 * ui/moduleEditor.js
 * Renders the "Module & Themen" tab.
 *
 * Each module block shows:
 *  - Editable module name input (persisted to localStorage)
 *  - The active and cancelled days that belong to that module
 *
 * Off days are grouped under the module whose content they delayed
 * (i.e. the module of the NEXT active day after them).
 */

import { state } from '../state.js';
import { buildSchedule, modIdxFor, topicFor, numModules } from '../schedule.js';
import { getModuleName, setModuleName } from '../modules.js';
import { fmtDate } from '../utils.js';

/** Show a brief "saved" confirmation next to the heading. */
function showSaveNote() {
  const el = document.getElementById('saveNote');
  if (!el) return;
  el.textContent = '✓ Gespeichert';
  setTimeout(() => { el.textContent = ''; }, 1800);
}

/** Build module → day[] mapping, assigning off-days to the next active module. */
function buildModuleBuckets(allDays, N) {
  const buckets = new Map();
  for (let m = 0; m < N; m++) buckets.set(m, []);

  for (let i = 0; i < allDays.length; i++) {
    const day = allDays[i];
    let modIdx;
    if (!day.isOff) {
      modIdx = modIdxFor(day.activeIdx);
    } else {
      // Find the next active day
      let j = i + 1;
      while (j < allDays.length && allDays[j].isOff) j++;
      modIdx = j < allDays.length ? modIdxFor(allDays[j].activeIdx) : N - 1;
    }
    const clamped = Math.min(modIdx, N - 1);
    buckets.get(clamped).push(day);
  }
  return buckets;
}

/** Render a single module block element. */
function renderModuleBlock(modIdx, days) {
  const name = getModuleName(modIdx);
  const block = document.createElement('div');
  block.className = 'mod-block';

  // Header with editable name
  const header = document.createElement('div');
  header.className = 'mod-block-header';
  header.innerHTML = `
    <span class="mod-num-badge">Modul ${modIdx + 1}</span>
    <input
      class="mod-name-input"
      type="text"
      value="${name}"
      placeholder="Modulname…"
      data-modidx="${modIdx}"
    />`;
  block.appendChild(header);

  // Day rows
  days.forEach(day => {
    const row = document.createElement('div');
    const label = `${day.dayName}, ${fmtDate(day.date)}`;

    if (day.isOff) {
      row.className = 'mod-day-off';
      row.innerHTML = `
        <span class="mod-day-label-off">${label}</span>
        <span class="mod-day-reason">❌ ${day.holidayName || 'Ausgefallen'}</span>`;
    } else {
      row.className = 'mod-day-row';
      const topic = topicFor(day.activeIdx);
      row.innerHTML = `
        <span class="mod-day-label">${label}</span>
        <span class="mod-day-topic" data-date="${day.date}">${topic}</span>`;
    }

    block.appendChild(row);
  });

  // Name input handler
  header.querySelector('.mod-name-input').addEventListener('input', e => {
    setModuleName(modIdx, e.target.value);
    showSaveNote();
    // Refresh topic spans for this module's active days
    days.forEach(day => {
      if (!day.isOff) {
        const span = block.querySelector(`.mod-day-topic[data-date="${day.date}"]`);
        if (span) span.textContent = topicFor(day.activeIdx);
      }
    });
  });

  return block;
}

/** Full render of the module list. */
export function renderModuleList() {
  const { startDate, numDays, selectedDays, offDates } = state;
  const listEl  = document.getElementById('modulList');
  const infoEl  = document.getElementById('modInfo');
  if (!listEl) return;

  if (!startDate || !numDays) {
    listEl.innerHTML = '<p class="muted">Einstellungen eingeben…</p>';
    return;
  }

  const N       = numModules(numDays);
  const allDays = buildSchedule(startDate, numDays, selectedDays, offDates);
  const buckets = buildModuleBuckets(allDays, N);

  if (infoEl) {
    infoEl.textContent = `${numDays} aktive Tage = ${N} Module. Tag 1 = Modul X, alle weiteren Tage = Modul X & Einzelcoaching.`;
  }

  listEl.innerHTML = '';
  for (let modIdx = 0; modIdx < N; modIdx++) {
    const days = buckets.get(modIdx) || [];
    listEl.appendChild(renderModuleBlock(modIdx, days));
  }
}
