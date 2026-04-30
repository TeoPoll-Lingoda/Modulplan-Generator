/**
 * main.js
 * Application entry point.
 * - Initialises all modules
 * - Handles tab navigation
 * - Wires up state change listeners
 */

import { loadModuleNames } from './modules.js';
import { state, onStateChange } from './state.js';
import { initSetupTab, renderHolidaySection } from './ui/setup.js';
import { renderModuleList } from './ui/moduleEditor.js';
import { renderPreview } from './ui/preview.js';
import { generateAndDownload } from './docx/generator.js';

// ── Tab navigation ────────────────────────────────────────────────────────

function showTab(tabName) {
  state.activeTab = tabName;

  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });

  // Render the newly visible tab
  if (tabName === 'modules') renderModuleList();
  if (tabName === 'preview') renderPreview();
}

function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });
}

// ── State change handler ──────────────────────────────────────────────────

function onAnyChange() {
  // Only re-render the active tab to avoid unnecessary work
  if (state.activeTab === 'modules') renderModuleList();
  if (state.activeTab === 'preview') renderPreview();
}

// ── Generate button ───────────────────────────────────────────────────────

function initGenerateButton() {
  document.getElementById('generateBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    btn.textContent = 'Wird erstellt…';
    try {
      await generateAndDownload();
    } catch (err) {
      console.error('Fehler beim Erstellen des Dokuments:', err);
      alert('Fehler beim Erstellen des Dokuments. Bitte Konsole prüfen.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Dokument erstellen ↗';
    }
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────

function boot() {
  loadModuleNames();
  initTabs();
  initSetupTab();
  initGenerateButton();
  onStateChange(onAnyChange);

  // Sync textarea default from HTML (it's pre-filled in index.html)
  const descEl = document.getElementById('descText');
  if (descEl) state.descText = descEl.value;
  const nameEl = document.getElementById('courseName');
  if (nameEl) state.courseName = nameEl.value;
}

boot();
