// ════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════
let currentData = null;
let currentMode = 'callscript';
let lastBlob = null;
let lastFilename = '';
let pasteTimer = null;

// ════════════════════════════════════════════════════
//  PDF / DOCX GENERATION
// ════════════════════════════════════════════════════
function downloadNow() {
    if (!lastBlob) return;
    var url = URL.createObjectURL(lastBlob);
    var a = document.createElement('a');
    a.href = url; a.download = lastFilename; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
}

function generatePdf() {
    if (!currentData) return;
    var previewHtml = document.getElementById('preview-content').innerHTML;
    var win = window.open('', '_blank', 'width=900,height=700');
    win.document.write('<!DOCTYPE html><html><head>' +
        '<meta charset="UTF-8"><title>DevShop Document</title>' +
        '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">' +
        '<style>' +
        '@page{size:letter;margin:1in 0.9in}' +
        '*{box-sizing:border-box;margin:0;padding:0}' +
        'body{font-family:"DM Sans",Arial,sans-serif;font-size:11pt;color:#374151;line-height:1.5}' +
        '.doc-cover{background:#1F3864;color:#fff;padding:20px 24px;border-radius:6px;margin-bottom:18px;page-break-inside:avoid}' +
        '.doc-cover-title{font-size:20pt;font-weight:700;color:#fff;margin-bottom:4px}' +
        '.doc-cover-sub{font-size:10pt;color:#AECBF0;margin-bottom:2px}' +
        '.doc-cover-credit{font-size:9pt;color:#C0D8F5}' +
        '.doc-section-title{font-size:10pt;font-weight:700;color:#1F3864;text-transform:uppercase;letter-spacing:.06em;margin:16px 0 6px;padding-bottom:3px;border-bottom:2px solid #F3F4F6;page-break-after:avoid}' +
        '.doc-text{font-size:10pt;color:#374151;line-height:1.6;margin-bottom:8px}' +
        '.doc-table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:9.5pt;page-break-inside:auto}' +
        '.doc-table th{padding:6px 8px;text-align:left;font-size:9pt;font-weight:700;color:#fff}' +
        '.doc-table td{padding:5px 8px;border-bottom:1px solid #E2E8F0;vertical-align:top}' +
        '.doc-table tr:nth-child(even) td{background:#F8FAFC}' +
        '.th-navy{background:#1F3864}.th-blue{background:#2E5FAC}.th-teal{background:#1A6B6B}.th-red{background:#991B1B}.th-amber{background:#92400E}' +
        '.callout{border-left:4px solid #2E5FAC;background:#EFF6FF;padding:10px 14px;border-radius:0 6px 6px 0;margin-bottom:10px;font-size:10pt;page-break-inside:avoid}' +
        '.callout.green{border-color:#166534;background:#DCFCE7}' +
        '.callout.amber{border-color:#F59E0B;background:#FFFBEB}' +
        '.callout.teal{border-color:#1A6B6B;background:#E0F2F1}' +
        '.callout-label{font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#2E5FAC;margin-bottom:4px}' +
        '.callout.green .callout-label{color:#166534}.callout.amber .callout-label{color:#92400E}.callout.teal .callout-label{color:#1A6B6B}' +
        '.status-badge{display:inline-block;padding:1px 6px;border-radius:10px;font-size:9pt;font-weight:600}' +
        '.status-wip{background:#DBEAFE;color:#2E5FAC}.status-test{background:#FEF3C7;color:#92400E}' +
        '.status-prod{background:#DCFCE7;color:#166534}.status-open{background:#FED7AA;color:#C2410C}' +
        '.status-hold,.status-other{background:#F3F4F6;color:#374151}' +
        '.topic-heading{font-size:11pt;font-weight:700;color:#1F3864;margin:16px 0 8px;padding:6px 10px;background:#F3F4F6;border-radius:4px;page-break-after:avoid}' +
        '.topic-divider{border:none;border-bottom:1px solid #E2E8F0;margin:12px 0}' +
        'ul,ol{padding-left:18px;margin:4px 0}li{margin-bottom:3px}' +
        '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}' +
        '</style></head><body>' + previewHtml +
        '<script>window.onload=function(){window.print();}<\/script></body></html>');
    win.document.close();
}

// ════════════════════════════════════════════════════
//  DOCX HELPERS
// ════════════════════════════════════════════════════
function safeStr(v) {
    if (v == null) return '';
    return String(v)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
        .replace(/\\'/g, "'")
        .replace(/\\n/g, ' ');
}

function getDocx() {
    // UMD build sets window.docx = { Document, Packer, ... }
    if (window.docx && window.docx.Document) return window.docx;
    throw new Error('docx library failed to initialize. Try refreshing the page.');
}

function docxColors() {
    return {
        NAVY: '1F3864', BLUE: '2E5FAC', TEAL: '1A6B6B', GREEN: '166534',
        AMBER: '92400E', RED: '991B1B', GRAY: '374151', LGRAY: 'F3F4F6',
        MGRAY: 'D1D5DB', WHITE: 'FFFFFF',
        LIGHT_BLUE: 'DBEAFE', LIGHT_GREEN: 'DCFCE7', LIGHT_AMBER: 'FEF3C7',
        LIGHT_TEAL: 'E0F2F1', LIGHT_RED: 'FEE2E2', LIGHT_GRAY: 'F3F4F6',
        AMB_BG: 'FFFBEB', AMB_BD: 'F59E0B', AMB_TXT: '92400E',
        PH_TXT: '94A3B8'
    };
}

// ════════════════════════════════════════════════════
//  TAB SWITCHING
// ════════════════════════════════════════════════════
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    const hints = {
        callscript: "Call Script",
        report: "Status Report",
        rca: "RCA",
        blocker: "Blocker Brief",
        techapproach: "Tech Approach Document",
        taskbrief: "Task Brief",
        projectsummary: "Project Summary",
        deploymentrunbook: "Deployment Runbook",
        incidentsummary: "INC Resolution Summary",
        signoff: "Single Task Approval",
        bulkapproval: "Bulk Task Approval",
        devhandover: "DEV Handover",
        kbarticle: "KB Article",
        techdoc: "Tech Spec Document"
    };
    document.getElementById('drop-sub').textContent = hints[mode] || 'Drop JSON file';
    if (currentData) renderPreview(currentData);
    updateGenButton();
}
/**
 * Updates the custom dropdown's display to reflect the currently selected mode.
 *
 * @param {string} modeId The ID of the mode to display (e.g., 'rca', 'callscript').
 */
function updateDropdownSelectionUI(modeId) {
    const selectedMode = MODES_CONFIG.find(m => m.id === modeId);
    const selectedDisplay = document.getElementById('selected-mode-display');

    if (selectedMode && selectedDisplay) {
        selectedDisplay.innerHTML = `${selectedMode.icon} ${selectedMode.displayName}`;
        console.log(`Dropdown UI updated to: ${selectedMode.displayName}`);
    } else {
        console.warn(`Could not find a mode or display element for modeId: ${modeId}`);
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + tab));
}

// given a status string, return the appropriate badge HTML which help to download docx file.
async function generate() {
    if (!currentData) return;

    try { getDocx(); } catch (e) {
        document.getElementById('ban-err-txt').textContent = e.message;
        document.getElementById('ban-err').classList.add('show');
        return;
    }

    var btn = document.getElementById('btn-gen');
    btn.classList.add('loading');
    document.getElementById('ban-ok').classList.remove('show');
    document.getElementById('ban-err').classList.remove('show');

    try {
        // Use the helper function here
        var handler = getModeHandler(currentMode);

        if (!handler) {
            throw new Error("Unknown mode: " + currentMode);
        }

        var result = await handler.generate(currentData);

        lastBlob = result.blob;
        lastFilename = result.filename;
        document.getElementById('ban-filename').textContent = result.filename + ' \u2014 ready to download';
        document.getElementById('ban-ok').classList.add('show');
        downloadNow();
    } catch (err) {
        document.getElementById('ban-err-txt').textContent = err.message;
        document.getElementById('ban-err').classList.add('show');
        console.error(err);
    } finally {
        btn.classList.remove('loading');
    }
}

// Renders the preview panel based on the current mode and data
function renderPreview(data) {
    document.getElementById('preview-empty').style.display = 'none';
    var el = document.getElementById('preview-content');
    el.style.display = 'block';

    // Use the helper function here
    var handler = getModeHandler(currentMode);
    if (handler) {
        el.innerHTML = handler.render(data);
    }
}

// load JSON data, render the preview, and auto-detect the mode based on the data structure
function loadJSON(raw) {
    const errEl = document.getElementById('json-err');
    try {
        const data = JSON.parse(raw);
        errEl.style.display = 'none';
        currentData = data;

        document.getElementById('json-view').innerHTML =
            '<pre style="white-space:pre-wrap;word-break:break-word;margin:0;">' + escHtml(JSON.stringify(data, null, 2)) + '</pre>';

        document.getElementById('btn-copy-json').style.display = 'block';
        const applyBtn = document.getElementById('btn-apply-json');
        if (applyBtn) applyBtn.style.display = 'block';

        // --- REFACTORED AUTO-DETECTION ---
        // Find the first rule that returns true for this data
        const match = AUTO_DETECTION_RULES.find(rule => rule.check(data));
        if (match) {
            updateDropdownSelectionUI(match.mode); // Update the dropdown UI to reflect the detected mode
            switchMode(match.mode);
        }
        // ---------------------------------

        document.getElementById('json-ta').value = JSON.stringify(data, null, 2);
        renderPreview(data);
        updateGenButton();
        renderJsonView(data);
    } catch (err) {
        errEl.textContent = 'Invalid JSON: ' + err.message;
        errEl.style.display = 'block';
    }
}

// ════════════════════════════════════════════════════
//  FILE / PASTE HANDLING
// ════════════════════════════════════════════════════
function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.add('drag-over');
}
function handleDragLeave(e) {
    document.getElementById('drop-zone').classList.remove('drag-over');
}
function handleDrop(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
}
function handleFileInput(e) {
    const file = e.target.files[0];
    if (file) readFile(file);
}
function readFile(file) {
    const reader = new FileReader();
    reader.onload = ev => loadJSON(ev.target.result);
    reader.readAsText(file);
}
function handlePaste() {
    clearTimeout(pasteTimer);
    pasteTimer = setTimeout(() => {
        const raw = document.getElementById('json-ta').value.trim();
        if (raw) loadJSON(raw);
    }, 400);
}

// ════════════════════════════════════════════════════
//  Escaping and Rendering
// ════════════════════════════════════════════════════
function escHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
