/**
 * modules.js
 * Manages module names with localStorage persistence.
 *
 * Module indices are 0-based internally; display as "Modul N+1".
 * Default name for modIdx 0 is "Modul 1" (customisable).
 */

const STORAGE_KEY = 'kursplan_modnames_v1';

let _moduleNames = [];

/** Load saved module names from localStorage. */
export function loadModuleNames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) _moduleNames = JSON.parse(raw);
  } catch (_) {
    _moduleNames = [];
  }
}

/** Save module names to localStorage. */
export function saveModuleNames() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_moduleNames));
  } catch (_) { /* storage unavailable */ }
}

/**
 * Get the display name for a 0-based module index.
 * Falls back to "Modul N+1" if not set.
 */
export function getModuleName(modIdx) {
  if (_moduleNames[modIdx] !== undefined && _moduleNames[modIdx] !== '') {
    return _moduleNames[modIdx];
  }
  return `Modul ${modIdx + 1}`;
}

/**
 * Set the name for a 0-based module index and persist immediately.
 */
export function setModuleName(modIdx, value) {
  while (_moduleNames.length <= modIdx) _moduleNames.push('');
  _moduleNames[modIdx] = value;
  saveModuleNames();
}

/**
 * Get a copy of all stored module names (raw array).
 */
export function getAllModuleNames() {
  return [..._moduleNames];
}

/**
 * Reset all module names (clears storage).
 */
export function resetModuleNames() {
  _moduleNames = [];
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
}
