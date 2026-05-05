/**
 * ui/setup.js
 * Handles all interactions on the "Kursdetails" tab:
 * - Course name / description inputs
 * - Weekday selection buttons
 * - Time slot pickers
 * - numDays / startDate inputs
 * - Holiday section rendering
 */

import { state, notifyChange } from '../state.js';
import { initOffDates, buildHolidayGroups, computeEndDate } from '../schedule.js';
import { fmtDate, fmtShort, toISO, addDays, dowOf } from '../utils.js';

const WD_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const WD_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

// ── Weekday buttons ───────────────────────────────────────────────────────

function renderWeekdayButtons() {
  document.querySelectorAll('#weekdayGrid .wd-btn').forEach(btn => {
    const day = parseInt(btn.dataset.day);
    btn.classList.toggle('selected', state.selectedDays.includes(day));
  });
}

function onWeekdayClick(e) {
  const btn = e.target.closest('.wd-btn');
  if (!btn) return;
  const day = parseInt(btn.dataset.day);
  if (state.selectedDays.includes(day)) {
    if (state.selectedDays.length <= 1) return; // keep at least 1
    state.selectedDays = state.selectedDays.filter(d => d !== day);
  } else {
    if (state.selectedDays.length >= 2) state.selectedDays = [state.selectedDays[1]];
    state.selectedDays = [...state.selectedDays, day].sort((a, b) => (a || 7) - (b || 7));
  }
  renderWeekdayButtons();
  updateSlotLabels();
  onParamsChange();
}

// ── Slot labels ───────────────────────────────────────────────────────────

function updateSlotLabels() {
  const sorted = [...state.selectedDays].sort((a, b) => (a || 7) - (b || 7));
  document.getElementById('slot1Label').textContent = sorted[0] != null ? WD_NAMES[sorted[0]] : 'Tag 1';
  document.getElementById('slot2Label').textContent = sorted[1] != null ? WD_NAMES[sorted[1]] : 'Tag 2';
  const slot2 = document.getElementById('slot2box');
  if (slot2) slot2.style.display = state.selectedDays.length > 1 ? '' : 'none';
}

// ── Same-time toggle ──────────────────────────────────────────────────────

function applySameTime() {
  const same = state.sameTime;
  const slot2 = document.getElementById('slot2box');
  if (!slot2) return;
  slot2.style.opacity = same ? '0.5' : '1';
  slot2.querySelectorAll('input').forEach(i => { i.disabled = same; });
  if (same) {
    document.getElementById('time2start').value = state.time1start;
    document.getElementById('time2end').value   = state.time1end;
    document.getElementById('format2').value    = state.format1;
    state.time2start = state.time1start;
    state.time2end   = state.time1end;
    state.format2    = state.format1;
  }
}

// ── Holiday section ───────────────────────────────────────────────────────

export function renderHolidaySection() {
  const el = document.getElementById('holidaySection');
  if (!el) return;
  const { startDate, numDays, selectedDays, offDates } = state;

  if (!startDate || !numDays || !selectedDays.length) {
    el.innerHTML = '<p class="muted">Startdatum und Anzahl Tage eingeben…</p>';
    return;
  }

  const groups = buildHolidayGroups(startDate, numDays, selectedDays, offDates);
  if (!groups.length) {
    el.innerHTML = '<p class="muted">Keine Feiertage im Kurszeitraum.</p>';
    return;
  }

  let html = `<table class="holiday-table">
    <thead><tr><th>Feiertag</th><th>Unterrichtstage in dieser Woche</th></tr></thead>
    <tbody>`;

  groups.forEach(g => {
    html += `<tr>
      <td class="holiday-name-cell">
        <strong>${g.primaryName}</strong><br/>
        <span class="muted-sm">${fmtDate(g.primaryHol.date)}</span><br/>
        <span class="badge ${g.isNat ? 'badge-blue' : 'badge-grey'}">
          ${g.isNat ? 'Nationaler Feiertag' : 'Lokaler Feiertag'}
        </span>
      </td>
      <td class="pill-cell"><div class="pill-group">`;

    g.pills.forEach(p => {
      const isOff = offDates.has(p.date);
      const cls = ['pill',
        p.isNat ? 'pill-holiday' : '',
        isOff    ? 'pill-off'     : '',
      ].filter(Boolean).join(' ');
      const icon = p.isNat ? '🏛 ' : p.isLoc ? '📍 ' : '';
      html += `<label class="${cls}" data-date="${p.date}">
        <span class="pill-dot"></span>
        <span>${icon}${WD_SHORT[dowOf(p.date)]} ${fmtShort(p.date)}</span>
      </label>`;
    });

    html += `</div></td></tr>`;
  });

  html += '</tbody></table>';
  el.innerHTML = html;

  // Attach click handlers to pills
  el.querySelectorAll('.pill[data-date]').forEach(pill => {
    pill.addEventListener('click', () => {
      const date = pill.dataset.date;
      if (offDates.has(date)) offDates.delete(date);
      else offDates.add(date);
      renderHolidaySection();
      notifyChange();
    });
  });
}

// ── End date preview ──────────────────────────────────────────────────────

function updateEndPreview() {
  const { startDate, numDays, selectedDays, offDates } = state;
  const previewEl   = document.getElementById('endPreview');
  const cancelledEl = document.getElementById('cancelledInfo');

  if (!startDate || !numDays || !selectedDays.length) {
    if (previewEl) previewEl.textContent = '–';
    if (cancelledEl) cancelledEl.style.display = 'none';
    return;
  }

  const endDate   = computeEndDate(startDate, numDays, selectedDays, offDates);
  const cancelled = [...offDates].filter(d => d >= startDate).length;

  if (previewEl) previewEl.textContent = `→ ${fmtDate(endDate)}`;
  if (cancelledEl) {
    if (cancelled > 0) {
      cancelledEl.style.display = '';
      cancelledEl.textContent = `${cancelled} Tag${cancelled !== 1 ? 'e' : ''} fallen aus. Die Sequenz verschiebt sich — kein Inhalt wird übersprungen.`;
    } else {
      cancelledEl.style.display = 'none';
    }
  }
}

// ── Params change ─────────────────────────────────────────────────────────

function onParamsChange() {
  const { startDate, numDays, selectedDays } = state;
  if (startDate && numDays && selectedDays.length) {
    initOffDates(startDate, numDays, selectedDays, state.offDates);
  }
  updateEndPreview();
  renderHolidaySection();
  notifyChange();
}

// ── Init ──────────────────────────────────────────────────────────────────

export function initSetupTab() {
  // Weekday buttons
  document.getElementById('weekdayGrid')?.addEventListener('click', onWeekdayClick);
  renderWeekdayButtons();
  updateSlotLabels();

  // Same-time checkbox
  const sameTimeEl = document.getElementById('sameTime');
  sameTimeEl?.addEventListener('change', () => {
    state.sameTime = sameTimeEl.checked;
    applySameTime();
    notifyChange();
  });
  applySameTime();

  // Time inputs
  ['time1start', 'time1end', 'time2start', 'time2end'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => {
      state[id] = e.target.value;
      if (state.sameTime && (id === 'time1start' || id === 'time1end')) {
        state.time2start = state.time1start;
        state.time2end   = state.time1end;
        document.getElementById('time2start').value = state.time1start;
        document.getElementById('time2end').value   = state.time1end;
      }
      notifyChange();
    });
  });

  // Format inputs
  ['format1', 'format2'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => {
      state[id] = e.target.value;
      if (state.sameTime && id === 'format1') {
        state.format2 = state.format1;
        document.getElementById('format2').value = state.format1;
      }
      notifyChange();
    });
  });

  // Course name & description
  document.getElementById('courseName')?.addEventListener('input', e => {
    state.courseName = e.target.value;
  });
  document.getElementById('descText')?.addEventListener('input', e => {
    state.descText = e.target.value;
  });

  // Start date & numDays
  document.getElementById('startDate')?.addEventListener('input', e => {
    state.startDate = e.target.value;
    state.offDates  = new Set(); // reset when date changes
    onParamsChange();
  });
  document.getElementById('numDays')?.addEventListener('input', e => {
    state.numDays = parseInt(e.target.value) || 0;
    onParamsChange();
  });

  // Initial render
  onParamsChange();
}
