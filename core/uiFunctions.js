// ════════════════════════════════════════════════════
//  UI Functions
// ════════════════════════════════════════════════════
function clearAll() {
    currentData = null;
    lastBlob = null;
    document.getElementById('json-ta').value = '';
    document.getElementById('json-err').style.display = 'none';
    document.getElementById('val-panel').classList.remove('show');
    document.getElementById('preview-empty').style.display = 'flex';
    document.getElementById('preview-content').style.display = 'none';
    document.getElementById('preview-content').innerHTML = '';
    document.getElementById('json-view').innerHTML = '<div class="json-empty">No JSON loaded yet.</div>';
    document.getElementById('ban-ok').classList.remove('show');
    document.getElementById('ban-err').classList.remove('show');
    updateGenButton();
}

function updateGenButton() {
    document.getElementById('btn-gen').disabled = !currentData;
    const pdfBtn = document.getElementById('btn-pdf');
    if (pdfBtn) pdfBtn.disabled = !currentData;
}

function renderJsonView(data) {
    document.getElementById('json-view').innerHTML =
        '<pre style="white-space:pre-wrap;word-break:break-word;">' + escHtml(JSON.stringify(data, null, 2)) + '</pre>';
    document.getElementById('btn-copy-json').style.display = 'block';
}

function copyJsonToClipboard() {
    if (!currentData) return;
    const jsonStr = JSON.stringify(currentData, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
        const btn = document.getElementById('btn-copy-json');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy JSON to clipboard');
    });
}

function statusBadge(state) {
    var cls = 'status-other';
    var s = (state || '').toLowerCase();
    if (s.includes('progress') || s.includes('wip')) cls = 'status-wip';
    else if (s.includes('test') || s.includes('qa')) cls = 'status-test';
    else if (s.includes('prod')) cls = 'status-prod';
    else if (s === 'open') cls = 'status-open';
    else if (s.includes('hold')) cls = 'status-hold';
    return '<span class="status-badge ' + cls + '">' + escHtml(state || '') + '</span>';
}

// ════════════════════════════════════════════════════
//  INLINE JSON EDITING
// ════════════════════════════════════════════════════
function applyJsonEdits() {
    const jsonViewEl = document.getElementById('json-view');
    const rawJson = jsonViewEl.innerText.trim();
    const btn = document.getElementById('btn-apply-json');

    try {
        // 1. Verify it is valid JSON before destructive updates
        JSON.parse(rawJson);

        // 2. Feed it back into your existing global load function
        loadJSON(rawJson);

        // 3. UI Success Feedback
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Applied!';
        btn.style.background = '#166534'; // Success green

        // Switch to preview tab automatically to see changes
        switchTab('preview');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '#2E5FAC';
        }, 2000);

    } catch (err) {
        // 4. UI Error Feedback
        alert('Cannot apply edits. Invalid JSON syntax:\n' + err.message);
    }
}
