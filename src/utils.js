/**
 * docx/generator.js
 * Builds and downloads a .docx course schedule document.
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  LevelFormat,
} from 'docx';

import { state, getTimeForDate } from '../state.js';
import { buildSchedule, groupByWeek, topicFor } from '../schedule.js';
import { fmtDate } from '../utils.js';

// ── Design tokens ─────────────────────────────────────────────────────────
const BLUE_DARK  = '1F4E79';
const BLUE_LIGHT = 'D6E8F7';
const BLUE_MID   = '2E75B6';
const GREY_ROW   = 'F5F5F5';
const RED_BG     = 'FAECE7';
const RED_TEXT   = 'C00000';

const CELL_BORDER  = { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' };
const CELL_BORDERS = { top: CELL_BORDER, bottom: CELL_BORDER, left: CELL_BORDER, right: CELL_BORDER };

// A4 with ~1.5cm margins: content width ≈ 10204 DXA
const COL = [2800, 1500, 3904, 2000];
const CONTENT_W = COL.reduce((s, c) => s + c, 0);

const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };

// ── Cell factories ────────────────────────────────────────────────────────

function makeCell(paragraphs, { fill = 'FFFFFF', rowSpan, colSpan, vAlign = VerticalAlign.TOP, width } = {}) {
  return new TableCell({
    borders: CELL_BORDERS,
    shading: { fill, type: ShadingType.CLEAR },
    margins: CELL_MARGINS,
    verticalAlign: vAlign,
    rowSpan,
    columnSpan: colSpan,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    children: paragraphs,
  });
}

function makeTextPara(runs, align = AlignmentType.LEFT) {
  const textRuns = Array.isArray(runs)
    ? runs.map(r => new TextRun({ font: 'Calibri', ...r }))
    : [new TextRun({ font: 'Calibri', text: String(runs), size: 18 })];
  return new Paragraph({ alignment: align, children: textRuns });
}

function headerCell(text, width) {
  return new TableCell({
    borders: CELL_BORDERS,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: BLUE_DARK, type: ShadingType.CLEAR },
    margins: CELL_MARGINS,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18, font: 'Calibri' })],
    })],
  });
}

// ── Table builder ─────────────────────────────────────────────────────────

function buildTable(allDays) {
  const weeks = groupByWeek(allDays);
  const rows  = [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell('Datum – Woche', COL[0]),
        headerCell('Wochentag', COL[1]),
        headerCell('Thema', COL[2]),
        headerCell('Kursformat und Zeiten', COL[3]),
      ],
    }),
  ];

  let weekNum = 0;
  weeks.forEach((week, wi) => {
    weekNum++;
    const altFill   = wi % 2 === 0 ? 'FFFFFF' : GREY_ROW;
    const allOff    = week.days.every(d => d.isOff);
    const wStart    = week.days[0].date;
    const wEnd      = week.days[week.days.length - 1].date;
    const dateRange = `${fmtDate(wStart)} – ${fmtDate(wEnd)}`;

    if (allOff) {
      const reasons = [...new Set(week.days.map(d => d.holidayName).filter(Boolean))].join(', ');
      rows.push(new TableRow({
        children: [
          makeCell([
            makeTextPara([{ text: dateRange, bold: true, size: 18, color: RED_TEXT }]),
            makeTextPara([{ text: `Woche ${weekNum}`, size: 16, color: RED_TEXT, italics: true }]),
          ], { fill: RED_BG, width: COL[0] }),
          makeCell([
            makeTextPara([{ text: `Kein Unterricht – ${reasons || 'Feiertag'}`, color: RED_TEXT, size: 18, italics: true }]),
          ], { fill: RED_BG, colSpan: 3 }),
        ],
      }));
      return;
    }

    week.days.forEach((day, di) => {
      const fill = day.isOff ? RED_BG : altFill;
      const tf   = getTimeForDate(day.date);
      const cells = [];

      // Date cell (rowSpan on first row)
      if (di === 0) {
        cells.push(new TableCell({
          borders: CELL_BORDERS,
          width: { size: COL[0], type: WidthType.DXA },
          shading: { fill: BLUE_LIGHT, type: ShadingType.CLEAR },
          margins: CELL_MARGINS,
          verticalAlign: VerticalAlign.TOP,
          rowSpan: week.days.length,
          children: [
            new Paragraph({ children: [new TextRun({ text: dateRange, bold: true, size: 18, color: BLUE_DARK, font: 'Calibri' })] }),
            new Paragraph({ children: [new TextRun({ text: `Woche ${weekNum}`, size: 16, color: '595959', italics: true, font: 'Calibri' })] }),
          ],
        }));
      }

      if (day.isOff) {
        cells.push(makeCell([makeTextPara([{ text: day.dayName, size: 18, color: RED_TEXT }])], { fill: RED_BG, width: COL[1] }));
        cells.push(makeCell([makeTextPara([{ text: day.holidayName || 'Ausgefallen', size: 18, color: RED_TEXT, italics: true }])], { fill: RED_BG, colSpan: 2 }));
      } else {
        cells.push(makeCell([makeTextPara([{ text: day.dayName, size: 18 }])], { fill, width: COL[1] }));
        cells.push(makeCell([makeTextPara([{ text: topicFor(day.activeIdx), size: 18 }])], { fill, width: COL[2] }));
        cells.push(makeCell([
          makeTextPara([{ text: tf.time, size: 18 }]),
          makeTextPara([{ text: tf.format, size: 16, color: '595959' }]),
        ], { fill, width: COL[3] }));
      }

      rows.push(new TableRow({ children: cells }));
    });
  });

  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: COL, rows });
}

// ── Description paragraphs ────────────────────────────────────────────────

function buildDescription(descText) {
  const paras = [];
  const lines  = descText.split('\n');

  let inBullets = false;
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      inBullets = false;
      paras.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
      return;
    }

    const isBullet = trimmed.startsWith('–') || trimmed.startsWith('-');
    if (isBullet) {
      paras.push(new Paragraph({
        numbering: { reference: 'dashes', level: 0 },
        spacing: { after: 100 },
        children: [new TextRun({ text: trimmed.replace(/^[–-]\s*/, ''), size: 20, font: 'Calibri' })],
      }));
    } else {
      const isBold = trimmed === 'Unterrichtaufbau' || trimmed === 'Hinweise:' || trimmed.startsWith('Die BAMF Berufssprachkurse (BSK)') && trimmed.length < 40;
      paras.push(new Paragraph({
        spacing: { after: isBold ? 60 : 140 },
        children: [new TextRun({ text: trimmed, bold: isBold, size: isBold ? 22 : 20, font: 'Calibri' })],
      }));
    }
  });
  return paras;
}

// ── Main export ───────────────────────────────────────────────────────────

export async function generateAndDownload() {
  const { courseName, descText, startDate, numDays, selectedDays, offDates } = state;

  const allDays  = buildSchedule(startDate, numDays, selectedDays, offDates);
  const endDate  = allDays.length ? allDays[allDays.length - 1].date : startDate;
  const dayNames = selectedDays
    .sort((a, b) => (a || 7) - (b || 7))
    .map(d => ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][d])
    .join(' & ');

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'dashes',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '–',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 280 } } },
        }],
      }],
    },
    styles: {
      default: { document: { run: { font: 'Calibri', size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 851, right: 851, bottom: 851, left: 851 },
        },
      },
      children: [
        // Title
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: courseName, bold: true, size: 36, font: 'Calibri', color: BLUE_DARK })],
        }),
        // Subtitle
        new Paragraph({
          spacing: { after: 280 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE_MID, space: 4 } },
          children: [
            new TextRun({ text: 'Kurszeitraum: ', bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: `${fmtDate(startDate)} – ${fmtDate(endDate)}  ·  ${dayNames}`, size: 20, font: 'Calibri' }),
          ],
        }),
        // Description body
        ...buildDescription(descText || ''),
        new Paragraph({ spacing: { after: 280 }, children: [] }),
        // Schedule table
        buildTable(allDays),
        // Footer
        new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 4 } },
          spacing: { before: 300, after: 0 },
          children: [new TextRun({
            text: 'Im Anschluss an den Kurs erhält der Teilnehmende eine aussagekräftige Teilnahmebescheinigung über den Lernfortschritt. Es findet keine Prüfung statt.',
            italics: true, size: 18, font: 'Calibri', color: '595959',
          })],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href       = url;
  a.download   = `Kursplan_${courseName.replace(/\s+/g, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
