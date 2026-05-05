/* ============================================================
   main.css  –  Modulplan-Generator
   ============================================================ */

/* ── Reset & base ─────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --blue-dark:   #1F4E79;
  --blue-mid:    #2E75B6;
  --blue-light:  #D6E8F7;
  --blue-tint:   #EBF3FB;
  --red-bg:      #FAECE7;
  --red-text:    #C00000;
  --amber-bg:    #FFF8E1;
  --amber-text:  #7D5700;
  --green-bg:    #E8F5E9;
  --green-text:  #2E7D32;
  --grey-100:    #F5F5F5;
  --grey-200:    #E8E8E8;
  --grey-400:    #9E9E9E;
  --grey-700:    #424242;
  --text:        #1A1A1A;
  --border:      #DDDDDD;
  --radius:      8px;
  --radius-sm:   4px;
  --shadow:      0 1px 4px rgba(0,0,0,.08);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 14px;
  color: var(--text);
  background: var(--grey-100);
}

body { min-height: 100vh; }

/* ── App shell ────────────────────────────────────────────── */
#app { max-width: 760px; margin: 0 auto; padding: 0 0 3rem; }

.app-header {
  background: var(--blue-dark);
  color: #fff;
  padding: 1rem 1.5rem;
  margin-bottom: 0;
}
.app-header h1 { font-size: 1.25rem; font-weight: 600; letter-spacing: .02em; }

/* ── Tab bar ──────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 2px solid var(--grey-200);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: var(--shadow);
}

.tab {
  flex: 1;
  padding: .75rem 1rem;
  font-size: .875rem;
  font-weight: 500;
  color: var(--grey-700);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: color .15s, border-color .15s;
  margin-bottom: -2px;
}
.tab:hover        { color: var(--blue-mid); }
.tab.active       { color: var(--blue-dark); border-bottom-color: var(--blue-dark); }

/* ── Tab panels ───────────────────────────────────────────── */
.tab-content  { padding: 1.25rem 1rem; }
.tab-panel    { display: none; }
.tab-panel.active { display: block; }

/* ── Cards ────────────────────────────────────────────────── */
.card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow);
}
.card h2 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: .875rem;
  color: var(--blue-dark);
}

/* ── Form fields ──────────────────────────────────────────── */
.field        { margin-bottom: .875rem; }
.field:last-child { margin-bottom: 0; }
.field-label  { font-size: .8rem; color: var(--grey-700); display: block; margin-bottom: .3rem; }
label         { font-size: .8rem; color: var(--grey-700); display: block; margin-bottom: .3rem; }

input[type=text],
input[type=date],
input[type=number],
input[type=time],
textarea,
select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: .45rem .6rem;
  font-size: .875rem;
  color: var(--text);
  background: #fff;
  font-family: inherit;
  transition: border-color .15s;
}
input:focus, textarea:focus { outline: none; border-color: var(--blue-mid); }
textarea { resize: vertical; min-height: 200px; line-height: 1.5; }

.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-with-hint {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: .5rem;
  align-items: center;
}
.hint { font-size: .8rem; color: var(--grey-400); white-space: nowrap; }

/* ── Weekday grid ─────────────────────────────────────────── */
.weekday-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: .375rem;
  margin-bottom: .875rem;
}
.wd-btn {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: .45rem .25rem;
  font-size: .75rem;
  font-weight: 600;
  cursor: pointer;
  background: #fff;
  color: var(--grey-700);
  text-align: center;
  transition: all .15s;
}
.wd-btn:hover   { border-color: var(--blue-mid); color: var(--blue-mid); }
.wd-btn.selected {
  background: var(--blue-tint);
  border-color: var(--blue-mid);
  color: var(--blue-dark);
}

/* ── Time slots ───────────────────────────────────────────── */
.time-slots {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .875rem;
  margin-bottom: .75rem;
}
.time-slot-box {
  border: 1px solid var(--grey-200);
  border-radius: var(--radius-sm);
  padding: .75rem;
  background: var(--grey-100);
}
.time-slot-box h3 {
  font-size: .875rem;
  font-weight: 600;
  margin-bottom: .6rem;
  color: var(--text);
}
.time-range {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: .375rem;
  align-items: center;
  margin-bottom: .5rem;
}
.time-sep { font-size: .8rem; color: var(--grey-400); text-align: center; }

.toggle-same {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .8rem;
  color: var(--grey-700);
  cursor: pointer;
}
.toggle-same input { width: auto; }

/* ── Info boxes ───────────────────────────────────────────── */
.info, .muted { font-size: .8rem; color: var(--grey-400); margin-bottom: .75rem; }
.muted-sm     { font-size: .75rem; color: var(--grey-400); }

.info-box {
  border-radius: var(--radius-sm);
  padding: .6rem .75rem;
  font-size: .8rem;
  margin-top: .75rem;
}
.info-amber { background: var(--amber-bg); color: var(--amber-text); border: 1px solid #FFD54F; }
.info-green { background: var(--green-bg); color: var(--green-text); border: 1px solid #A5D6A7; }
.info-blue  { background: var(--blue-tint); color: var(--blue-dark);  border: 1px solid #90CAF9; }

/* ── Holiday table ────────────────────────────────────────── */
.holiday-table { width: 100%; border-collapse: collapse; }
.holiday-table th {
  font-size: .75rem;
  font-weight: 600;
  color: var(--grey-700);
  padding: .5rem .6rem;
  border-bottom: 1px solid var(--grey-200);
  text-align: left;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.holiday-table td { padding: .6rem; border-bottom: 1px solid var(--grey-200); vertical-align: top; }
.holiday-table tr:last-child td { border-bottom: none; }
.holiday-name-cell { min-width: 150px; }

.badge {
  font-size: .7rem;
  border-radius: 10px;
  padding: 2px 8px;
  display: inline-block;
  margin-top: 4px;
}
.badge-blue  { background: var(--blue-tint);  color: var(--blue-dark); }
.badge-grey  { background: var(--grey-200);   color: var(--grey-700);  }

/* ── Pill buttons (holiday days) ──────────────────────────── */
.pill-group { display: flex; gap: .375rem; flex-wrap: wrap; padding-top: .25rem; }
.pill {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 3px 10px;
  font-size: .75rem;
  cursor: pointer;
  background: #fff;
  color: var(--grey-700);
  transition: all .15s;
  user-select: none;
}
.pill:hover       { border-color: var(--blue-mid); }
.pill-dot         { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.pill-holiday     { background: var(--blue-tint);  border-color: #90CAF9; color: var(--blue-dark); }
.pill-off         { background: var(--red-bg);     border-color: #EF9A9A; color: var(--red-text);  }

/* ── Module editor ────────────────────────────────────────── */
.mod-block {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: .75rem;
  overflow: hidden;
}
.mod-block-header {
  background: var(--grey-100);
  padding: .6rem .875rem;
  display: flex;
  align-items: center;
  gap: .75rem;
}
.mod-num-badge {
  font-size: .75rem;
  font-weight: 700;
  background: var(--blue-tint);
  color: var(--blue-dark);
  border-radius: var(--radius-sm);
  padding: 2px 10px;
  flex-shrink: 0;
  white-space: nowrap;
}
.mod-name-input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: .875rem;
  background: #fff;
}
.mod-name-input:focus { outline: none; border-color: var(--blue-mid); }

.mod-day-row,
.mod-day-off {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .5rem .875rem;
  border-top: 1px solid var(--grey-200);
  font-size: .8rem;
}
.mod-day-off { background: #FFF5F5; }
.mod-day-label     { min-width: 165px; flex-shrink: 0; color: var(--grey-700); }
.mod-day-label-off { min-width: 165px; flex-shrink: 0; color: var(--red-text); }
.mod-day-topic     { font-weight: 500; }
.mod-day-reason    { color: var(--red-text); }
.save-note         { font-size: .75rem; color: var(--green-text); margin-left: .5rem; font-weight: 400; }

/* ── Stats row ────────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .75rem;
  margin-bottom: 1rem;
}
.stat-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: .875rem 1rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: .25rem;
}
.stat-num   { font-size: 1.4rem; font-weight: 700; color: var(--blue-dark); }
.stat-label { font-size: .75rem; color: var(--grey-400); }

/* ── Preview table ────────────────────────────────────────── */
.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .8rem;
}
.preview-table th {
  background: var(--grey-100);
  font-weight: 600;
  font-size: .72rem;
  padding: .55rem .75rem;
  text-align: left;
  border-bottom: 2px solid var(--border);
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--grey-700);
}
.preview-table td {
  padding: .55rem .75rem;
  border-bottom: 1px solid var(--grey-200);
  vertical-align: top;
}
.preview-table tr:last-child td { border-bottom: none; }
.preview-table tr:nth-child(even) td { background: var(--grey-100); }

.date-cell { min-width: 130px; }
.date-cell strong { display: block; font-size: .8rem; }
.week-label  { font-size: .72rem; color: var(--grey-400); display: block; margin-top: 2px; }
.time-cell   { white-space: nowrap; }

.row-off td  { background: #FFF5F5 !important; }
.row-cancelled-week td { background: var(--red-bg); }
.cancelled-week-cell   { padding: .55rem .75rem; color: var(--red-text); font-size: .8rem; }

.off-badge {
  font-size: .7rem;
  background: var(--red-bg);
  color: var(--red-text);
  border: 1px solid #EF9A9A;
  border-radius: var(--radius-sm);
  padding: 2px 7px;
  display: inline-block;
}

/* ── Actions ──────────────────────────────────────────────── */
.actions { margin-top: 1rem; display: flex; gap: .75rem; }
.btn-primary {
  background: var(--blue-tint);
  border: 1px solid var(--blue-mid);
  color: var(--blue-dark);
  border-radius: var(--radius-sm);
  padding: .6rem 1.25rem;
  font-size: .875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s;
}
.btn-primary:hover    { background: #B3D4F0; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

/* ── Responsive tweaks ────────────────────────────────────── */
@media (max-width: 600px) {
  .row2, .time-slots, .stats-row { grid-template-columns: 1fr; }
  .weekday-grid { grid-template-columns: repeat(7, 1fr); }
}
