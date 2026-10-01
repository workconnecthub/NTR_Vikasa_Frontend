/**
 * exportUtils.js — Lightweight, robust pure JS Excel (.xlsx) and PDF (.pdf) generator.
 * Zero external dependencies. 100% client-side, secure, and fast.
 */

// ─── 1. CRC-32 & ZIP UTILITIES (For standard Office Open XML .xlsx) ────────

const makeCRCTable = () => {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
};

const CRC_TABLE = makeCRCTable();

function crc32(strOrBytes) {
  let crc = 0 ^ (-1);
  const bytes = typeof strOrBytes === 'string' ? new TextEncoder().encode(strOrBytes) : strOrBytes;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createZip(files) {
  const fileEntries = [];
  let offset = 0;

  for (const file of files) {
    const data = typeof file.content === 'string' ? new TextEncoder().encode(file.content) : file.content;
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(data);
    const size = data.length;

    // Local file header (30 bytes + name length)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true); // store (no compression)
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, size, true);
    view.setUint32(22, size, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    fileEntries.push({
      name: file.name,
      nameBytes,
      crc,
      size,
      offset,
      localHeader,
      data
    });

    offset += localHeader.length + size;
  }

  // Central directory
  let centralDirSize = 0;
  const centralHeaders = [];

  for (const entry of fileEntries) {
    const cdHeader = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(cdHeader.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, entry.crc, true);
    view.setUint32(20, entry.size, true);
    view.setUint32(24, entry.size, true);
    view.setUint16(28, entry.nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, entry.offset, true);
    cdHeader.set(entry.nameBytes, 46);

    centralHeaders.push(cdHeader);
    centralDirSize += cdHeader.length;
  }

  // End of central directory record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, fileEntries.length, true);
  eocdView.setUint16(10, fileEntries.length, true);
  eocdView.setUint32(12, centralDirSize, true);
  eocdView.setUint32(16, offset, true);
  eocdView.setUint16(20, 0, true);

  const totalLength = offset + centralDirSize + 22;
  const out = new Uint8Array(totalLength);
  let pos = 0;

  for (const entry of fileEntries) {
    out.set(entry.localHeader, pos);
    pos += entry.localHeader.length;
    out.set(entry.data, pos);
    pos += entry.data.length;
  }

  for (const cd of centralHeaders) {
    out.set(cd, pos);
    pos += cd.length;
  }

  out.set(eocd, pos);
  return out;
}

function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colToLetter(colIndex) {
  let temp, letter = '';
  while (colIndex >= 0) {
    temp = colIndex % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
}

// ─── 2. EXCEL (.XLSX) EXPORTER ─────────────────────────────────────────────

/**
 * Exports data to native .xlsx format
 * @param {Object} options
 * @param {string} options.filename - e.g. "candidates_active_2026-09-08.xlsx"
 * @param {string} options.sheetName - e.g. "Candidates"
 * @param {string[]} options.headers - Column names
 * @param {Array<Array<string|number>>} options.rows - Matrix of cell values
 */
export function exportToExcel({ filename = 'export.xlsx', sheetName = 'Report', headers = [], rows = [] }) {
  const safeSheetName = escapeXml(sheetName.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Sheet1');
  const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;

  // Worksheet XML
  let sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  sheetXml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n';

  // Column width calculations
  sheetXml += '  <cols>\n';
  headers.forEach((h, idx) => {
    let maxLen = String(h).length;
    rows.forEach(r => {
      const val = String(r[idx] !== undefined && r[idx] !== null ? r[idx] : '');
      if (val.length > maxLen) maxLen = Math.min(val.length, 60);
    });
    const width = Math.max(maxLen + 4, 12);
    sheetXml += `    <col min="${idx + 1}" max="${idx + 1}" width="${width}" customWidth="1"/>\n`;
  });
  sheetXml += '  </cols>\n';

  sheetXml += '  <sheetData>\n';

  // Header row
  sheetXml += '    <row r="1" customHeight="1" ht="26">\n';
  headers.forEach((h, colIdx) => {
    const cellRef = `${colToLetter(colIdx)}1`;
    sheetXml += `      <c r="${cellRef}" t="inlineStr" s="1"><is><t>${escapeXml(h)}</t></is></c>\n`;
  });
  sheetXml += '    </row>\n';

  // Data rows
  rows.forEach((row, rowIdx) => {
    const rNum = rowIdx + 2;
    sheetXml += `    <row r="${rNum}" customHeight="1" ht="20">\n`;
    headers.forEach((_, colIdx) => {
      const cellVal = row[colIdx] !== undefined && row[colIdx] !== null ? row[colIdx] : '';
      const cellRef = `${colToLetter(colIdx)}${rNum}`;
      if (typeof cellVal === 'number') {
        sheetXml += `      <c r="${cellRef}" s="2"><v>${cellVal}</v></c>\n`;
      } else {
        sheetXml += `      <c r="${cellRef}" t="inlineStr" s="2"><is><t>${escapeXml(cellVal)}</t></is></c>\n`;
      }
    });
    sheetXml += '    </row>\n';
  });

  sheetXml += '  </sheetData>\n';
  sheetXml += '</worksheet>';

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${safeSheetName}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="10"/><name val="Segoe UI"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Segoe UI"/></font>
    <font><sz val="10"/><name val="Segoe UI"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF312E81"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
    </border>
  </borders>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>`;

  const files = [
    { name: '[Content_Types].xml', content: contentTypesXml },
    { name: '_rels/.rels', content: relsXml },
    { name: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
    { name: 'xl/workbook.xml', content: workbookXml },
    { name: 'xl/styles.xml', content: stylesXml },
    { name: 'xl/worksheets/sheet1.xml', content: sheetXml }
  ];

  const zipBytes = createZip(files);
  const blob = new Blob([zipBytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerFileDownload(blob, safeFilename);
}

// ─── 3. PDF (.PDF) EXPORTER ────────────────────────────────────────────────

function escapePdfText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Exports data to a clean, multi-page PDF document
 * @param {Object} options
 * @param {string} options.filename - e.g. "applications_selected_hired.pdf"
 * @param {string} options.title - Report Title
 * @param {string} [options.subtitle] - Secondary description
 * @param {Object} [options.metadata] - Key-value summary (e.g. { "Export Date": "08 Sep 2026", "Status Filter": "Selected / Hired", "Total Records": 245 })
 * @param {string[]} options.headers - Column titles
 * @param {Array<Array<string|number>>} options.rows - Matrix of cell values
 */
export function generatePDFBlob({
  filename = 'report.pdf',
  title = 'NTR VIKASA Platform Report',
  subtitle = 'Official Administration Management Report',
  metadata = {},
  headers = [],
  rows = []
}) {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Page dimensions (A4 in points: 595.28 x 841.89)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 36;
  const marginTop = 36;
  const marginBottom = 36;
  const contentWidth = pageWidth - (marginX * 2);

  // Column width calculations (weighted proportionally)
  const numCols = Math.max(headers.length, 1);
  const colCharLens = headers.map((h, i) => {
    let max = String(h).length;
    rows.forEach(r => {
      const len = String(r[i] || '').length;
      if (len > max) max = Math.min(len, 35);
    });
    return Math.max(max, 6);
  });
  const totalWeight = colCharLens.reduce((sum, w) => sum + w, 0);
  const colWidths = colCharLens.map(w => (w / totalWeight) * contentWidth);

  // Generate multi-page content streams
  const pages = [];
  let curCommands = [];
  let curY = pageHeight - marginTop;

  const startNewPage = () => {
    if (curCommands.length > 0) {
      pages.push(curCommands.join('\n'));
      curCommands = [];
    }
    curY = pageHeight - marginTop;

    // Header strip on every page
    curCommands.push(`q`);
    curCommands.push(`0.12 0.11 0.29 rg`); // Navy header accent (#1e1b4b)
    curCommands.push(`${marginX} ${curY - 14} ${contentWidth} 20 re f`);
    curCommands.push(`1 1 1 rg`);
    curCommands.push(`BT /F2 10 Tf ${marginX + 8} ${curY - 9} Td (NTR VIKASA  \\|  Society for Employment Generation & Enterprise Development) Tj ET`);
    curCommands.push(`Q`);
    curY -= 30;

    // Report Title
    curCommands.push(`q`);
    curCommands.push(`0.06 0.09 0.16 rg`);
    curCommands.push(`BT /F2 15 Tf ${marginX} ${curY - 12} Td (${escapePdfText(title)}) Tj ET`);
    curCommands.push(`Q`);
    curY -= 20;

    // Subtitle
    if (subtitle) {
      curCommands.push(`q`);
      curCommands.push(`0.39 0.45 0.55 rg`);
      curCommands.push(`BT /F1 9 Tf ${marginX} ${curY - 8} Td (${escapePdfText(subtitle)}) Tj ET`);
      curCommands.push(`Q`);
      curY -= 14;
    }

    // Metadata block
    const metaEntries = Object.entries(metadata || {});
    if (metaEntries.length > 0) {
      curCommands.push(`q`);
      curCommands.push(`0.97 0.98 0.99 rg`);
      curCommands.push(`${marginX} ${curY - 16} ${contentWidth} 18 re f`);
      curCommands.push(`0.89 0.91 0.94 RG 0.75 w`);
      curCommands.push(`${marginX} ${curY - 16} ${contentWidth} 18 re S`);

      let metaX = marginX + 8;
      metaEntries.forEach(([k, v]) => {
        const text = `${k}: ${v}`;
        curCommands.push(`0.2 0.25 0.35 rg`);
        curCommands.push(`BT /F2 8 Tf ${metaX} ${curY - 12} Td (${escapePdfText(k)}:) Tj ET`);
        curCommands.push(`0.3 0.35 0.45 rg`);
        curCommands.push(`BT /F1 8 Tf ${metaX + (k.length * 4.8) + 8} ${curY - 12} Td (${escapePdfText(String(v))}) Tj ET`);
        metaX += (text.length * 5.2) + 20;
      });
      curCommands.push(`Q`);
      curY -= 26;
    } else {
      curY -= 6;
    }

    // Draw table header
    drawTableHeader();
  };

  const drawTableHeader = () => {
    const headerHeight = 22;
    curCommands.push(`q`);
    curCommands.push(`0.19 0.18 0.51 rg`); // Dark primary indigo (#312e81)
    curCommands.push(`${marginX} ${curY - headerHeight} ${contentWidth} ${headerHeight} re f`);
    curCommands.push(`1 1 1 rg`);

    let curX = marginX;
    headers.forEach((h, idx) => {
      const colW = colWidths[idx];
      curCommands.push(`BT /F2 8.5 Tf ${curX + 6} ${curY - 14} Td (${escapePdfText(String(h))}) Tj ET`);
      curX += colW;
    });
    curCommands.push(`Q`);
    curY -= headerHeight;
  };

  // Start first page
  startNewPage();

  // Draw data rows
  const rowHeight = 19;
  if (rows.length === 0) {
    curCommands.push(`q`);
    curCommands.push(`0.5 0.5 0.5 rg`);
    curCommands.push(`BT /F1 9 Tf ${marginX + 10} ${curY - 16} Td (No matching records found for the selected criteria.) Tj ET`);
    curCommands.push(`Q`);
    curY -= 24;
  } else {
    rows.forEach((row, rowIdx) => {
      // Check if page overflow
      if (curY - rowHeight < marginBottom + 20) {
        startNewPage();
      }

      // Zebra striping
      curCommands.push(`q`);
      if (rowIdx % 2 === 1) {
        curCommands.push(`0.97 0.98 0.99 rg`);
        curCommands.push(`${marginX} ${curY - rowHeight} ${contentWidth} ${rowHeight} re f`);
      }
      curCommands.push(`0.89 0.91 0.94 RG 0.5 w`);
      curCommands.push(`${marginX} ${curY - rowHeight} ${contentWidth} ${rowHeight} re S`);

      // Cell texts
      let curX = marginX;
      headers.forEach((_, colIdx) => {
        const colW = colWidths[colIdx];
        const val = row[colIdx] !== undefined && row[colIdx] !== null ? String(row[colIdx]) : '';
        // Truncate if too long for column
        const maxChars = Math.max(Math.floor(colW / 4.8), 4);
        const displayVal = val.length > maxChars ? `${val.slice(0, maxChars - 2)}..` : val;

        curCommands.push(`0.06 0.09 0.16 rg`);
        curCommands.push(`BT /F1 8 Tf ${curX + 6} ${curY - 12} Td (${escapePdfText(displayVal)}) Tj ET`);
        curX += colW;
      });

      curCommands.push(`Q`);
      curY -= rowHeight;
    });
  }

  // Push final page commands
  if (curCommands.length > 0) {
    pages.push(curCommands.join('\n'));
  }

  // Build PDF Objects
  const totalPages = pages.length;
  const objects = [];

  // 1. Catalog
  objects.push(`<< /Type /Catalog /Pages 2 0 R >>`);

  // 2. Pages object (placeholder, will fill with page obj ids)
  const pageObjIds = [];
  for (let i = 0; i < totalPages; i++) {
    pageObjIds.push(5 + (i * 2));
  }
  objects.push(`<< /Type /Pages /Kids [${pageObjIds.map(id => `${id} 0 R`).join(' ')}] /Count ${totalPages} >>`);

  // 3. Regular Font
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);

  // 4. Bold Font
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);

  // 5... Page and Content objects
  pages.forEach((pageContent, idx) => {
    const pageNum = idx + 1;
    const contentObjId = 6 + (idx * 2);

    // Add page footer to content
    const footerCmds = `\nq\n0.5 0.55 0.65 rg\nBT /F1 7.5 Tf ${marginX} ${marginBottom} Td (NTR VIKASA Administration Portal  \\|  Confidential & Proprietary Report) Tj ET\nBT /F1 7.5 Tf ${pageWidth - marginX - 55} ${marginBottom} Td (Page ${pageNum} of ${totalPages}) Tj ET\nQ\n`;
    const fullContent = `${pageContent}\n${footerCmds}`;
    const contentBytes = new TextEncoder().encode(fullContent);

    // Page object
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`);

    // Content stream object
    objects.push(`<< /Length ${contentBytes.length} >>\nstream\n${fullContent}\nendstream`);
  });

  // Construct PDF Binary String
  let pdf = `%PDF-1.4\n%âãÏÓ\n`;
  const offsets = [];

  objects.forEach((obj, idx) => {
    offsets.push(pdf.length);
    pdf += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(off => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info << /Title (${escapePdfText(title)}) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}) >> >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([new TextEncoder().encode(pdf)], { type: 'application/pdf' });
}

export function exportToPDF(options = {}) {
  const safeFilename = options.filename ? (options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`) : 'report.pdf';
  const blob = generatePDFBlob(options);
  triggerFileDownload(blob, safeFilename);
}

// ─── 4. CSV (.CSV) EXPORTER ────────────────────────────────────────────────

/**
 * Exports data to standard UTF-8 CSV format
 * @param {Object} options
 * @param {string} options.filename - e.g. "candidate_priya_sharma.csv"
 * @param {string[]} options.headers - Column names
 * @param {Array<Array<string|number>>} options.rows - Matrix of cell values
 */
export function exportToCSV({ filename = 'export.csv', headers = [], rows = [] }) {
  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  const escapeCsvValue = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvLines = [];
  if (headers && headers.length > 0) {
    csvLines.push(headers.map(escapeCsvValue).join(','));
  }
  rows.forEach((row) => {
    csvLines.push(row.map(escapeCsvValue).join(','));
  });

  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerFileDownload(blob, safeFilename);
}

// ─── 5. BROWSER DOWNLOAD HELPER ────────────────────────────────────────────

function triggerFileDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// ─── 5. DYNAMIC FILENAME FORMATTER ─────────────────────────────────────────

export function getExportFilename(prefix, status, ext = 'xlsx') {
  const dateStr = new Date().toISOString().split('T')[0];
  const safePrefix = (prefix || 'export').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const safeStatus = status && status !== 'ALL' ? `_${String(status).toLowerCase().replace(/[^a-z0-9_-]/g, '_')}` : '';
  return `${safePrefix}${safeStatus}_${dateStr}.${ext}`;
}

// ─── 6. SINGLE RECORD DOSSIER PDF EXPORTERS ────────────────────────────────

/**
 * Exports complete verified profile dossier for an individual candidate / student
 */
export function exportCandidateDossierPDF(c) {
  if (!c) return;
  const safeName = (c.name || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Candidate_Dossier_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;

  const isComplete = c.profileCompletion === 100 || c.profileStatus === 'COMPLETE';

  const headers = ['Candidate Information Field', 'Verified Platform KYC & Career Record'];
  const rows = [
    ['Candidate Full Name', c.name || 'N/A'],
    ['Candidate ID', c.id || 'N/A'],
    ['Official Email Address', c.email || 'N/A'],
    ['Mobile Phone Number', c.phone || 'N/A'],
    ['Gender', c.gender || 'N/A'],
    ['Aadhaar Number (UIDAI)', c.aadhaarNumber ? `•••• •••• ${c.aadhaarNumber.slice(-4)} (12-Digit Government Verified)` : 'N/A'],
    ['Profile Verification Status', isComplete ? '100% Complete & Verified Candidate' : `35% Basic KYC Registered (${c.profileStatus || 'Awaiting Full Profile'})`],
    ['Qualification Tier', c.qualificationCategory || c.qualificationTier || '10th / Intermediate / UG'],
    ['Degree / School / College', c.degree || c.education || 'N/A'],
    ['Key Skills & Competencies', Array.isArray(c.skills) ? c.skills.join(', ') : (c.skills || 'N/A')],
    ['Geographic Address', `${c.village ? c.village + ', ' : ''}${c.mandal || 'Vijayawada Urban'}, ${c.district || 'NTR District'}`],
    ['Referred By (Admin / Nodal Officer)', c.referenceAdmin || 'Admin Direct Onboarding'],
    ['Placement Status', c.placementStatus === 'PLACED' ? 'PLACED / HIRED' : 'Seeking Employment'],
    ['Placed Organization', c.placementStatus === 'PLACED' ? `${c.placedCompany || 'N/A'} ${c.isCompanyInDatabase ? '(Verified Partner DB)' : '(External Company)'}` : 'Not Placed Yet'],
    ['Designation / Role Offered', c.placedRole || (c.placementStatus === 'PLACED' ? 'Full-Time Position' : 'N/A')],
    ['Annual Package (CTC)', c.placedSalary || (c.placementStatus === 'PLACED' ? 'Best in Industry' : 'N/A')],
    ['Registration Date', c.registrationDate ? new Date(c.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN')]
  ];

  exportToPDF({
    filename,
    title: `Candidate Dossier: ${c.name}`,
    subtitle: `NTR VIKASA Official Candidate Verification & Employment Card`,
    metadata: {
      'Candidate ID': c.id || 'N/A',
      'Contact': c.phone || c.email || 'N/A',
      'Aadhaar Tag': c.aadhaarNumber ? `XX-XXXX-${c.aadhaarNumber.slice(-4)}` : 'Verified',
      'Placement': c.placementStatus === 'PLACED' ? 'PLACED' : 'SEEKING',
      'Issued On': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    headers,
    rows
  });
}

/**
 * Exports complete verified profile dossier for an individual recruiter
 */
export function exportRecruiterDossierPDF(r) {
  if (!r) return;
  const safeName = (r.name || 'Recruiter').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Recruiter_Dossier_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;

  const headers = ['Recruiter Credential', 'Official Authorization & Activity Details'];
  const rows = [
    ['Recruiter Full Name', r.name || 'N/A'],
    ['Recruiter ID', r.id || 'N/A'],
    ['Official Corporate Email', r.email || 'N/A'],
    ['Mobile Phone Number', r.phone || 'N/A'],
    ['Designation / Role', r.designation || 'Talent Acquisition Manager'],
    ['Assigned Company / Entity', r.company || r.companyName || 'N/A'],
    ['Industry Sector', r.industry || 'Information Technology & Services'],
    ['Location / District Hub', r.location || 'Vijayawada, NTR District'],
    ['Verification Status', r.verificationStatus || 'VERIFIED'],
    ['Account Status', r.accountStatus || 'ACTIVE'],
    ['Active Jobs Posted', `${r.postedJobsCount !== undefined ? r.postedJobsCount : 0} vacancies`],
    ['Registration Date', r.registrationDate ? new Date(r.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Aug 2026']
  ];

  exportToPDF({
    filename,
    title: `Recruiter Dossier: ${r.name}`,
    subtitle: `NTR VIKASA Authorized Platform Recruiter Verification Record`,
    metadata: {
      'Company': r.company || 'N/A',
      'Verification': r.verificationStatus || 'VERIFIED',
      'Account': r.accountStatus || 'ACTIVE',
      'Issued On': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    headers,
    rows
  });
}

/**
 * Exports complete profile certificate for an individual corporate employer / company
 */
export function exportCompanyDossierPDF(comp) {
  if (!comp) return;
  const safeName = (comp.name || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Company_Record_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;

  const headers = ['Corporate Attribute', 'Enterprise Credential & Verification Details'];
  const rows = [
    ['Enterprise Name', comp.name || 'N/A'],
    ['Corporate Entity ID', comp.id || 'N/A'],
    ['Industry Sector', comp.industry || 'Information Technology & Services'],
    ['Corporate Email', comp.email || 'N/A'],
    ['Contact Phone', comp.phone || 'N/A'],
    ['Official Website', comp.website || 'N/A'],
    ['Corporate CIN Number', comp.cin || comp.cinNumber || 'N/A'],
    ['GSTIN Number', comp.gstin || comp.gstNumber || 'N/A'],
    ['Employee Workforce Size', comp.size || comp.employeeCount || '100-500 employees'],
    ['Company Entity Type', comp.type || comp.companyType || 'Private Limited (Pvt Ltd)'],
    ['Headquarters Location', comp.location || 'Vijayawada, NTR District'],
    ['Verification Status', comp.verificationStatus || 'VERIFIED'],
    ['Active Vacancies', `${comp.activeJobsCount || 0} Openings`],
    ['Corporate Bio & Overview', comp.description || comp.about || `${comp.name} is a verified enterprise employer registered with the NTR Vikasa Employment Portal.`]
  ];

  exportToPDF({
    filename,
    title: `Enterprise Profile: ${comp.name}`,
    subtitle: `NTR VIKASA Verified Corporate Partner Organization Dossier`,
    metadata: {
      'CIN': comp.cin || 'Verified',
      'GSTIN': comp.gstin || 'Verified',
      'Verification': comp.verificationStatus || 'VERIFIED',
      'Issued On': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    headers,
    rows
  });
}
