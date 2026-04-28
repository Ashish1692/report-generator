// ════════════════════════════════════════════════════
//  UI Functions
// ════════════════════════════════════════════════════
/**
 * Clear All Function
 */
function clearAll() {
        document.getElementById('json-ta').value = "";
        document.getElementById('json-view').innerHTML = "";
        document.getElementById('json-err').style.display = "none";
        // Reset preview states
        document.getElementById('preview-empty').style.display = 'block';
        document.getElementById('preview-content').style.display = 'none';
        currentData = null;
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

/**
 * Improved Copy JSON function with visual feedback
 */
async function copyJsonToClipboard() {
    const jsonArea = document.getElementById('json-ta');
    const copyBtn = document.getElementById('btn-copy-json');
    
    if (!jsonArea.value) return;

    try {
        await navigator.clipboard.writeText(jsonArea.value);
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "✅ Copied!";
        copyBtn.style.backgroundColor = "#188300";
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = ""; // Resets to CSS default
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        jsonArea.select();
        document.execCommand('copy');
    }
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
