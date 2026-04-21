// ════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════
let currentData = null;
let currentMode = 'callscript';
let lastBlob = null;
let lastFilename = '';
let pasteTimer = null;

// ════════════════════════════════════════════════════
//  MODE / TAB SWITCHING
// ════════════════════════════════════════════════════
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    const hints = {
        report: 'Status Report JSON',
        callscript: 'Call Script JSON',
        rca: 'RCA JSON',
        blocker: 'Blocker Brief JSON',
        techapproach: 'Technical Approach JSON',
        taskbrief: 'Task Brief JSON',
        projectsummary: 'Project Summary JSON'
    };
    document.getElementById('drop-sub').textContent = hints[mode] || 'Drop JSON file';
    // Highlight matching gem link
    document.querySelectorAll('.gem-link').forEach(a => {
        var modes = (a.dataset.modes || '').split(',');
        a.classList.toggle('active', modes.includes(mode));
    });
    if (currentData) renderPreview(currentData);
    updateGenButton();
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + tab));
    // If switching to edit and we have data, refresh edit panel
    if (tab === 'edit' && currentData && document.getElementById('edit-content').style.display === 'none') {
        buildEditPanel(currentData);
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

function loadJSON(raw) {
    const errEl = document.getElementById('json-err');
    try {
        const data = JSON.parse(raw);
        errEl.style.display = 'none';
        currentData = data;
        // Auto-detect mode
        if (data.incident && !data.executive_summary && !data.topics && !data.task_num) switchMode('rca');
        else if (data.topics && !data.executive_summary) switchMode('callscript');
        else if (data.executive_summary) switchMode('report');
        else if (data.task_num && data.blocker_description) switchMode('blocker');
        else if (data.task_num && data.proposed_solution && data.technical_spec) switchMode('techapproach');
        else if (data.task_num && (data.reported_behavior || data.investigation)) switchMode('taskbrief');
        else if (data.project_name) switchMode('projectsummary');

        document.getElementById('json-ta').value = JSON.stringify(data, null, 2);
        renderPreview(data);
        showValPanel(data);
        updateGenButton();
        renderJsonView(data);
        buildEditPanel(data);
    } catch (err) {
        errEl.textContent = 'Invalid JSON: ' + err.message;
        errEl.style.display = 'block';
    }
}

// ════════════════════════════════════════════════════
//  VALIDATION PANEL
// ════════════════════════════════════════════════════
function showValPanel(data) {
    const panel = document.getElementById('val-panel');
    panel.classList.add('show');
    let pip = 'ok', msg = 'Ready to generate', tiles = [], msgs = [];

    if (currentMode === 'callscript') {
        const topics = data.topics || [];
        const qas = topics.reduce((s, t) => s + (t.qa_pairs || []).length, 0);
        const tasks = topics.reduce((s, t) => s + (t.tasks || []).length, 0);
        tiles = [
            { l: 'Topics', n: topics.length },
            { l: 'Q&A', n: qas },
            { l: 'Tasks', n: tasks }
        ];
        if (!topics.length) { pip = 'warn'; msg = 'No topics found'; }
        else msgs.push({ type: 'ok', text: 'Call script ready' });
    } else if (currentMode === 'report') {
        const c = {
            incidents: (data.incidents || []).length,
            stories: (data.stories || []).length,
            blockers: (data.blockers || []).length,
            actions: (data.action_items || []).length,
            team: (data.team || []).length
        };
        tiles = [
            { l: 'Incidents', n: c.incidents },
            { l: 'Stories', n: c.stories },
            { l: 'Actions', n: c.actions }
        ];
        const missing = ['meta', 'executive_summary', 'metrics', 'incidents', 'stories'].filter(k => !(k in data));
        if (missing.length) { pip = 'error'; msg = 'Missing required fields'; missing.forEach(m => msgs.push({ type: 'error', text: 'Missing: ' + m })); }
        else msgs.push({ type: 'ok', text: 'All checks passed' });
    } else if (currentMode === 'rca') {
        tiles = [
            { l: 'Sections', n: ['s1', 's2', 's3', 's4', 's5'].filter(k => data[k]).length },
            { l: 'Timeline', n: (data.timeline || []).length },
            { l: 'Callouts', n: (data.callouts || data.callout_boxes || []).length }
        ];
        if (!data.incident) { pip = 'warn'; msg = 'No incident number'; msgs.push({ type: 'warn', text: 'incident field missing' }); }
        else msgs.push({ type: 'ok', text: 'RCA data loaded' });
    } else if (currentMode === 'blocker') {
        tiles = [
            { l: 'Solutions', n: (data.proposed_solutions || []).length },
            { l: 'Next Steps', n: (data.next_steps || []).length },
            { l: 'Callouts', n: (data.callouts || []).length }
        ];
        if (!data.title) { pip = 'warn'; msg = 'No title found'; }
        else msgs.push({ type: 'ok', text: 'Status: ' + (data.status || 'Unknown') });
    } else if (currentMode === 'techapproach') {
        var sc = data.scope || {};
        tiles = [
            { l: 'In Scope', n: (sc.in_scope || []).length },
            { l: 'Components', n: ((data.technical_spec || {}).components || []).length },
            { l: 'Open Items', n: (data.open_items || []).length }
        ];
        if (!data.title) { pip = 'warn'; msg = 'No title found'; }
        else msgs.push({ type: 'ok', text: 'Status: ' + (data.status || 'Draft') });
    } else if (currentMode === 'taskbrief') {
        tiles = [
            { l: 'Approaches', n: (data.proposed_approach || []).length },
            { l: 'Next Steps', n: (data.next_steps || []).length },
            { l: 'Callouts', n: (data.callouts || []).length }
        ];
        if (!data.task_num) { pip = 'warn'; msg = 'No task number found'; }
        else msgs.push({ type: 'ok', text: (data.task_type || 'Task') + ' — ' + (data.state || 'Unknown state') });
    } else if (currentMode === 'projectsummary') {
        tiles = [
            { l: 'Metrics', n: (data.key_metrics || []).length },
            { l: 'Milestones', n: (data.milestones || []).length },
            { l: 'Risks', n: (data.risks || []).length }
        ];
        if (!data.project_name) { pip = 'warn'; msg = 'No project name found'; }
        else msgs.push({ type: 'ok', text: 'Project summary ready' });
    } else if (currentMode === 'projectsummary') {
        tiles = [
            { l: 'Metrics', n: (data.key_metrics || []).length },
            { l: 'Milestones', n: (data.milestones || []).length },
            { l: 'Risks', n: (data.risks || []).length }
        ];
        if (!data.project_name) { pip = 'warn'; msg = 'No project name found'; }
        else msgs.push({ type: 'ok', text: 'Project summary ready' });
    }

    document.getElementById('val-pip').className = 'val-pip ' + pip;
    document.getElementById('val-txt').textContent = msg;
    document.getElementById('val-grid').innerHTML = tiles.map(t =>
        `<div class="val-tile"><div class="val-tile-num">${t.n ?? '—'}</div><div class="val-tile-lbl">${t.l}</div></div>`
    ).join('');
    document.getElementById('val-msgs').innerHTML = msgs.map(m =>
        `<div class="val-msg ${m.type}"><span>${m.type === 'ok' ? '✓' : m.type === 'warn' ? '⚠' : '✗'}</span>${m.text}</div>`
    ).join('');
}

function updateGenButton() {
    document.getElementById('btn-gen').disabled = !currentData;
    const pdfBtn = document.getElementById('btn-pdf');
    if (pdfBtn) pdfBtn.disabled = !currentData;
}

function escHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

function renderPreview(data) {
    document.getElementById('preview-empty').style.display = 'none';
    var el = document.getElementById('preview-content');
    el.style.display = 'block';
    if (currentMode === 'callscript') el.innerHTML = renderCallScriptPreview(data);
    else if (currentMode === 'report') el.innerHTML = renderReportPreview(data);
    else if (currentMode === 'rca') el.innerHTML = renderRcaPreview(data);
    else if (currentMode === 'blocker') el.innerHTML = renderBlockerPreview(data);
    else if (currentMode === 'techapproach') el.innerHTML = renderTechApproachPreview(data);
    else if (currentMode === 'taskbrief') el.innerHTML = renderTaskBriefPreview(data);
    else if (currentMode === 'projectsummary') el.innerHTML = renderProjectSummaryPreview(data);
}

function renderCallScriptPreview(data) {
    var meta = data.meta || {};
    var topics = data.topics || [];
    var html = '';
    html += '<div class="doc-cover">' +
        '<div class="doc-cover-title">CLIENT UPDATE CALL SCRIPT</div>' +
        '<div class="doc-cover-sub">' + escHtml(meta.call_date || '') + ' &nbsp;|&nbsp; ' + escHtml(meta.audience || '') + '</div>' +
        '<div class="doc-cover-credit">Prepared by: ' + escHtml(meta.prepared_by || meta.pm || '') + '</div></div>';
    html += '<table class="doc-table"><thead><tr><th class="th-navy" style="width:140px">Field</th><th class="th-navy">Detail</th></tr></thead><tbody>' +
        '<tr><td><strong>Client</strong></td><td>' + escHtml(meta.account || '') + '</td></tr>' +
        '<tr><td><strong>Call Type</strong></td><td>' + escHtml(meta.call_type || '') + '</td></tr>' +
        '<tr><td><strong>Date</strong></td><td>' + escHtml(meta.date || meta.call_date || '') + '</td></tr>' +
        '<tr><td><strong>Prepared By</strong></td><td>' + escHtml(meta.prepared_by || meta.pm || '') + '</td></tr>' +
        '<tr><td><strong>Presenter Role</strong></td><td>' + escHtml(meta.presenter_role || meta.presenter || '') + '</td></tr>' +
        '<tr><td><strong>Audience</strong></td><td>' + escHtml(meta.audience || '') + '</td></tr>' +
        '</tbody></table>';
    topics.forEach(function (t, i) {
        html += '<div class="topic-heading">TOPIC ' + (i + 1) + ' \u2014 ' + escHtml(t.title || '') + '</div>';
        if (t.say_this) html += '<div class="callout green"><div class="callout-label">SAY THIS</div>' + escHtml(t.say_this) + '</div>';
        if ((t.tasks || []).length) {
            html += '<table class="doc-table"><thead><tr><th class="th-blue">Task #</th><th class="th-blue">Type</th><th class="th-blue">Assigned To</th><th class="th-blue">Description</th><th class="th-blue">State</th></tr></thead><tbody>';
            t.tasks.forEach(function (tk) {
                html += '<tr><td><strong>' + escHtml(tk.num || '') + '</strong></td><td>' + escHtml(tk.type || '') + '</td><td>' + escHtml(tk.assignee || '') + '</td><td>' + escHtml(tk.title || '') + '</td><td>' + statusBadge(tk.state) + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        if ((t.qa_pairs || []).length) {
            html += '<div style="font-size:11px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.06em;margin:10px 0 6px;">IF THEY ASK:</div>';
            html += '<table class="doc-table"><thead><tr><th class="th-amber">Question</th><th class="th-amber">Quick Answer</th></tr></thead><tbody>';
            t.qa_pairs.forEach(function (q) {
                html += '<tr><td><strong>' + escHtml(q.question || '') + '</strong></td><td>' + escHtml(q.answer || '') + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        if (t.technical_notes) html += '<div class="callout"><div class="callout-label" style="color:#374151">TECHNICAL NOTES (FOR YOUR EYES ONLY)</div>' + escHtml(t.technical_notes) + '</div>';
        html += '<hr class="topic-divider">';
    });
    if (data.closing_statement) html += '<div class="callout teal"><div class="callout-label">CLOSING</div>' + escHtml(data.closing_statement) + '</div>';
    return html;
}

function renderReportPreview(data) {
    var meta = data.meta || {};
    var m = data.metrics || {};
    var html = '';
    html += '<div class="doc-cover">' +
        '<div class="doc-cover-title">STATUS REPORT</div>' +
        '<div class="doc-cover-sub">' + escHtml(meta.account || '') + ' &nbsp;|&nbsp; Week of ' + escHtml(meta.week_of || '') + '</div>' +
        '<div class="doc-cover-credit">Prepared by: ' + escHtml(meta.pm || '') + '</div></div>';
    if (data.executive_summary) {
        html += '<div class="doc-section-title">Executive Summary</div>';
        html += '<div class="doc-text">' + escHtml(data.executive_summary) + '</div>';
    }
    if (Object.keys(m).length) {
        html += '<div class="doc-section-title">Metrics</div>';
        html += '<table class="doc-table" style="table-layout:fixed;"><thead><tr>' +
            '<th class="th-navy">Total Tasks</th><th class="th-blue">In Progress</th>' +
            '<th style="background:#1A6B6B;color:#fff;">In Testing</th><th style="background:#166534;color:#fff;">Ready for PROD</th>' +
            '<th style="background:#374151;color:#fff;">On Hold</th><th class="th-red">Critical Priority</th>' +
            '</tr></thead><tbody><tr>' +
            '<td style="background:#DBEAFE;color:#1F3864;font-weight:700;font-size:16px;text-align:center;padding:10px;">' + escHtml(String(m.total_tasks || 0)) + '</td>' +
            '<td style="background:#DBEAFE;color:#2E5FAC;font-weight:700;font-size:16px;text-align:center;padding:10px;">' + escHtml(String(m.in_progress || 0)) + '</td>' +
            '<td style="background:#E0F2F1;color:#1A6B6B;font-weight:700;font-size:16px;text-align:center;padding:10px;">' + escHtml(String(m.in_testing || 0)) + '</td>' +
            '<td style="background:#DCFCE7;color:#166534;font-weight:700;font-size:16px;text-align:center;padding:10px;">' + escHtml(String(m.ready_for_prod || 0)) + '</td>' +
            '<td style="background:#F3F4F6;color:#374151;font-weight:700;font-size:16px;text-align:center;padding:10px;">' + escHtml(String(m.on_hold || 0)) + '</td>' +
            '<td style="background:#FEE2E2;color:#991B1B;font-weight:700;font-size:16px;text-align:center;padding:10px;">' + escHtml(String(m.critical_priority || 0)) + '</td>' +
            '</tr></tbody></table>';
    }
    var focusItems = Array.isArray(data.focus_items) ? data.focus_items : data.focus_item ? [data.focus_item] : [];
    if (focusItems.length) {
        html += '<div class="doc-section-title">Focus Item' + (focusItems.length > 1 ? 's' : '') + '</div>';
        focusItems.forEach(function (fi) {
            html += '<div class="callout amber" style="margin-bottom:10px;"><div class="callout-label">' + escHtml(fi.title || '') + '</div>';
            if (fi.status) html += '<div style="font-size:11.5px;font-weight:700;color:#C2410C;margin:4px 0 6px;">Status: ' + escHtml(fi.status) + '</div>';
            if (fi.body) html += '<div style="font-size:12.5px;color:#374151;margin-bottom:6px;">' + escHtml(fi.body) + '</div>';
            if ((fi.bullets || []).length) {
                html += '<ul style="padding-left:18px;margin:4px 0 0;font-size:12px;color:#374151;">';
                fi.bullets.forEach(function (b) { html += '<li style="margin-bottom:4px;">' + escHtml(b) + '</li>'; });
                html += '</ul>';
            }
            html += '</div>';
        });
    }
    if (data.process_note) {
        html += '<div class="doc-section-title">Process Update</div>';
        html += '<div class="callout"><div class="callout-label" style="color:#2E5FAC">Process Note</div><div style="font-size:12.5px;color:#374151;">' + escHtml(data.process_note) + '</div></div>';
    }
    if ((data.incidents || []).length) {
        html += '<div class="doc-section-title">Incidents</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-red">INC #</th><th class="th-red">Title</th><th class="th-red">Assignee</th><th class="th-red">State</th><th class="th-red">Priority</th><th class="th-red">Notes</th></tr></thead><tbody>';
        data.incidents.forEach(function (inc) {
            html += '<tr><td><strong>' + escHtml(inc.num || '') + '</strong></td><td>' + escHtml(inc.title || '') + '</td><td>' + escHtml(inc.assignee || '') + '</td><td>' + statusBadge(inc.state) + '</td><td>' + escHtml(inc.priority || '') + '</td><td>' + escHtml(inc.note || '') + '</td></tr>';
        });
        html += '</tbody></table>';
    }
    var stories = data.stories || [];
    var phaseGroups = [['PROD', 'th-teal', 'Stories \u2014 PROD'], ['TEST', 'th-teal', 'Stories \u2014 TEST'], ['WIP', 'th-blue', 'Stories \u2014 In Progress'], ['ENHC', 'th-blue', 'Enhancements']];
    phaseGroups.forEach(function (pg) {
        var group = stories.filter(function (s) { return s.phase === pg[0]; });
        if (!group.length) return;
        html += '<div class="doc-section-title">' + pg[2] + '</div>';
        html += '<table class="doc-table"><thead><tr><th class="' + pg[1] + '">Task #</th><th class="' + pg[1] + '">Title</th><th class="' + pg[1] + '">Assignee</th><th class="' + pg[1] + '">Priority</th><th class="' + pg[1] + '">State</th></tr></thead><tbody>';
        group.forEach(function (s) {
            html += '<tr><td><strong>' + escHtml(s.num || '') + '</strong></td><td>' + escHtml(s.title || '') + '</td><td>' + escHtml(s.assignee || '') + '</td><td>' + escHtml(s.priority || '') + '</td><td>' + statusBadge(s.state) + '</td></tr>';
        });
        html += '</tbody></table>';
    });
    var other = stories.filter(function (s) { return !['PROD', 'TEST', 'WIP', 'ENHC'].includes(s.phase); });
    if (other.length) {
        html += '<div class="doc-section-title">Other Tasks</div><table class="doc-table"><thead><tr><th class="th-blue">Task #</th><th class="th-blue">Title</th><th class="th-blue">Assignee</th><th class="th-blue">Priority</th><th class="th-blue">State</th></tr></thead><tbody>';
        other.forEach(function (s) {
            html += '<tr><td><strong>' + escHtml(s.num || '') + '</strong></td><td>' + escHtml(s.title || '') + '</td><td>' + escHtml(s.assignee || '') + '</td><td>' + escHtml(s.priority || '') + '</td><td>' + statusBadge(s.state) + '</td></tr>';
        });
        html += '</tbody></table>';
    }
    if ((data.uat_backlog || []).length) {
        html += '<div class="doc-section-title">UAT Backlog</div><div class="callout amber"><div class="callout-label">Pending Client Validation</div><ul style="padding-left:16px;margin:6px 0 0;font-size:12px;">';
        data.uat_backlog.forEach(function (item) { html += '<li style="margin-bottom:4px;">' + escHtml(item) + '</li>'; });
        html += '</ul></div>';
    }
    if ((data.blockers || []).length) {
        html += '<div class="doc-section-title">Blockers &amp; Risks</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-red">Blocker</th><th class="th-red">Impact</th><th class="th-red">Resolution</th></tr></thead><tbody>';
        data.blockers.forEach(function (b) { html += '<tr><td>' + escHtml(b.blocker || '') + '</td><td>' + escHtml(b.impact || '') + '</td><td>' + escHtml(b.resolution || '') + '</td></tr>'; });
        html += '</tbody></table>';
    }
    if ((data.action_items || []).length) {
        html += '<div class="doc-section-title">Action Items</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-navy">Owner</th><th class="th-navy">Action</th><th class="th-navy">Item</th><th class="th-navy">Due</th></tr></thead><tbody>';
        data.action_items.forEach(function (a) { html += '<tr><td><strong>' + escHtml(a.owner || '') + '</strong></td><td>' + escHtml(a.action || '') + '</td><td>' + escHtml(a.item || '') + '</td><td>' + escHtml(a.due || '') + '</td></tr>'; });
        html += '</tbody></table>';
    }
    if ((data.team || []).length) {
        html += '<div class="doc-section-title">Team Overview</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-navy">Name</th><th class="th-navy">Role</th><th class="th-navy">Focus</th></tr></thead><tbody>';
        data.team.forEach(function (t) { html += '<tr><td><strong>' + escHtml(t.name || '') + '</strong></td><td>' + escHtml(t.role || '') + '</td><td>' + escHtml(t.focus || '') + '</td></tr>'; });
        html += '</tbody></table>';
    }
    return html;
}

function renderRcaPreview(data) {
    var s = data.summary || {};
    var html = '';
    html += '<div class="doc-cover"><div class="doc-cover-title">ROOT CAUSE ANALYSIS</div>' +
        '<div class="doc-cover-sub">' + escHtml(data.incident || '') + '</div>' +
        '<div class="doc-cover-credit">' + escHtml(data.account || '') + '</div></div>';
    var summaryFields = [
        ['Incident', data.incident || s.incident], ['Title', data.title || s.title],
        ['Story', data.story || s.story], ['Change Record', data.change || s.change],
        ['Status', data.status || s.status], ['Date Reported', s.date_reported],
        ['Date Resolved', data.fix_date || s.date_resolved], ['Severity', s.severity],
        ['Affected System', s.affected_system], ['Reported By', data.reported_by || s.reported_by],
        ['Resolved By', data.developer || s.resolved_by], ['Root Cause Category', s.root_cause_category],
        ['Downtime', s.downtime], ['Impact Summary', s.impact_summary]
    ].filter(function (f) { return f[1]; });
    if (summaryFields.length) {
        html += '<div class="doc-section-title">Incident Summary</div><table class="doc-table"><tbody>';
        summaryFields.forEach(function (f) { html += '<tr><td style="width:180px;"><strong>' + escHtml(f[0]) + '</strong></td><td>' + escHtml(String(f[1])) + '</td></tr>'; });
        html += '</tbody></table>';
    }
    [['1', 'Incident Overview', data.s1], ['2', 'Root Cause Analysis', data.s2], ['3', 'Impact Assessment', data.s3],
    ['4', 'Resolution', data.s4], ['5', 'Contributing Factors', data.s5]].forEach(function (sec) {
        html += '<div class="doc-section-title">' + sec[0] + '. ' + sec[1] + '</div>';
        if (sec[2]) html += '<div class="doc-text">' + escHtml(sec[2]) + '</div>';
        else html += '<div class="doc-text" style="color:#94A3B8;font-style:italic;">No content provided</div>';
    });
    [['6', 'Immediate Actions Taken', data.s6], ['7', 'Corrective Actions / Recommendations', data.s7], ['8', 'Open Questions', data.s8]].forEach(function (sec) {
        html += '<div class="doc-section-title">' + sec[0] + '. ' + sec[1] + '</div>';
        if ((sec[2] || []).length) {
            html += '<ol style="padding-left:20px;font-size:12.5px;color:var(--gray);">';
            sec[2].forEach(function (item) {
                var clean = String(item).replace(/^\d+\.\s*/, '');
                html += '<li style="margin-bottom:6px;">' + escHtml(clean) + '</li>';
            });
            html += '</ol>';
        }
    });
    if ((data.timeline || []).length) {
        html += '<div class="doc-section-title">9. Incident Timeline</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-navy" style="width:160px">Time</th><th class="th-navy">Event</th></tr></thead><tbody>';
        data.timeline.forEach(function (e) { html += '<tr><td style="white-space:nowrap;font-size:11px;">' + escHtml(e.time || '') + '</td><td>' + escHtml(e.event || '') + '</td></tr>'; });
        html += '</tbody></table>';
    }
    var calloutList = data.callouts || data.callout_boxes || [];
    if (calloutList.length) {
        html += '<div class="doc-section-title">Action Required \u2014 Developer Verification</div>';
        calloutList.forEach(function (cb) {
            html += '<div class="callout amber"><div class="callout-label">ACTION REQUIRED \u2014 ' + escHtml(cb.dev || '') + '</div><ul style="padding-left:16px;font-size:12px;margin-top:4px;">';
            (cb.items || []).forEach(function (item) { html += '<li style="margin-bottom:4px;">' + escHtml(item) + '</li>'; });
            html += '</ul></div>';
        });
    }
    if (data.s10) { html += '<div class="doc-section-title">10. Document Notes</div><div class="doc-text">' + escHtml(data.s10) + '</div>'; }
    return html;
}


// ════════════════════════════════════════════════════
//  BLOCKER BRIEF PREVIEW
// ════════════════════════════════════════════════════
function renderBlockerPreview(data) {
    var html = '';
    var statusColors = {
        'Open': '#991B1B', 'Under Investigation': '#92400E', 'Partially Resolved': '#1A6B6B',
        'Resolved': '#166534', 'Deferred': '#374151'
    };
    var statusBg = {
        'Open': '#FEE2E2', 'Under Investigation': '#FEF3C7', 'Partially Resolved': '#E0F2F1',
        'Resolved': '#DCFCE7', 'Deferred': '#F3F4F6'
    };
    var st = data.status || 'Open';
    var stColor = statusColors[st] || '#374151';
    var stBg = statusBg[st] || '#F3F4F6';

    html += '<div class="doc-cover"><div class="doc-cover-title">BLOCKER EVALUATION BRIEF</div>' +
        '<div class="doc-cover-sub">' + escHtml(data.account || '') + ' &nbsp;|&nbsp; ' + escHtml(data.date || '') + '</div>' +
        '<div class="doc-cover-credit">Prepared by: ' + escHtml(data.pm || '') + ' &nbsp;|&nbsp; Task: ' + escHtml(data.task_num || '') + '</div></div>';

    // Status banner
    html += '<div style="background:' + stBg + ';border:2px solid ' + stColor + ';border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">' +
        '<div style="font-size:18px;font-weight:800;color:' + stColor + ';">' + escHtml(st) + '</div>' +
        '<div style="font-size:12px;color:#374151;">' + escHtml(data.title || '') + '</div></div>';

    if (data.summary) {
        html += '<div class="doc-section-title">Summary</div><div class="doc-text">' + escHtml(data.summary) + '</div>';
    }
    html += '<div class="doc-section-title">Blocker Description</div><div class="doc-text">' + escHtml(data.blocker_description || '') + '</div>';
    html += '<div class="doc-section-title">Impact</div><div class="doc-text">' + escHtml(data.impact || '') + '</div>';

    if (data.investigation) {
        html += '<div class="doc-section-title">Investigation</div><div class="doc-text">' + escHtml(data.investigation) + '</div>';
    }
    if (data.root_cause) {
        html += '<div class="doc-section-title">Root Cause</div>';
        html += '<div class="callout amber"><div class="callout-label">Root Cause</div>' + escHtml(data.root_cause) + '</div>';
    }

    var solutions = data.proposed_solutions || [];
    if (solutions.length) {
        html += '<div class="doc-section-title">Proposed Solutions</div>';
        solutions.forEach(function (s, i) {
            var rec = s.status === 'Completed' ? '#DCFCE7' : s.status === 'Rejected' ? '#FEE2E2' : '#EFF6FF';
            html += '<div style="background:' + rec + ';border-radius:8px;padding:12px 14px;margin-bottom:8px;">' +
                '<div style="font-size:12px;font-weight:700;color:#1F3864;margin-bottom:4px;">' + (i + 1) + '. ' + escHtml(s.option || '') + ' &nbsp;<span style="font-weight:400;color:#64748B;">Effort: ' + escHtml(s.effort || '') + '&nbsp;|&nbsp;Risk: ' + escHtml(s.risk || '') + '&nbsp;|&nbsp;' + escHtml(s.status || '') + '</span></div>' +
                '<div style="font-size:12px;color:#374151;margin-bottom:4px;">' + escHtml(s.description || '') + '</div>' +
                (s.outcome ? '<div style="font-size:11.5px;color:#374151;font-style:italic;">Outcome: ' + escHtml(s.outcome) + '</div>' : '') +
                '</div>';
        });
    }

    if (data.resolution) {
        html += '<div class="doc-section-title">Resolution</div>';
        html += '<div class="callout green"><div class="callout-label">Resolution Applied</div>' + escHtml(data.resolution) + '</div>';
    }

    if ((data.next_steps || []).length) {
        html += '<div class="doc-section-title">Next Steps</div><ol style="padding-left:20px;font-size:12.5px;color:var(--gray);">';
        data.next_steps.forEach(function (s) { html += '<li style="margin-bottom:5px;">' + escHtml(s) + '</li>'; });
        html += '</ol>';
    }
    if ((data.open_questions || []).length) {
        html += '<div class="doc-section-title">Open Questions</div><ol style="padding-left:20px;font-size:12.5px;color:var(--gray);">';
        data.open_questions.forEach(function (q) { html += '<li style="margin-bottom:5px;">' + escHtml(q) + '</li>'; });
        html += '</ol>';
    }
    if (data.technical_context) {
        html += '<div class="doc-section-title">Technical Context</div>';
        html += '<div class="callout"><div class="callout-label" style="color:#374151;">For Developer Eyes</div>' + escHtml(data.technical_context) + '</div>';
    }
    if (data.client_communication) {
        html += '<div class="doc-section-title">Client Communication</div><div class="doc-text">' + escHtml(data.client_communication) + '</div>';
    }
    var callouts = data.callouts || [];
    if (callouts.length) {
        html += '<div class="doc-section-title">Action Required — Verification Needed</div>';
        callouts.forEach(function (cb) {
            html += '<div class="callout amber"><div class="callout-label">ACTION REQUIRED \u2014 ' + escHtml(cb.dev || '') + '</div><ul style="padding-left:16px;font-size:12px;margin-top:4px;">';
            (cb.items || []).forEach(function (item) { html += '<li style="margin-bottom:4px;">' + escHtml(item) + '</li>'; });
            html += '</ul></div>';
        });
    }
    return html;
}

// ════════════════════════════════════════════════════
//  TECHNICAL APPROACH PREVIEW
// ════════════════════════════════════════════════════
function renderTechApproachPreview(data) {
    var html = '';
    var sc = data.scope || {};
    var ts = data.technical_spec || {};

    html += '<div class="doc-cover" style="background:linear-gradient(135deg,#1F3864,#2E5FAC);">' +
        '<div class="doc-cover-title">TECHNICAL APPROACH DOCUMENT</div>' +
        '<div class="doc-cover-sub">' + escHtml(data.title || '') + '</div>' +
        '<div class="doc-cover-sub">' + escHtml(data.account || '') + ' &nbsp;|&nbsp; ' + escHtml(data.date || '') + ' &nbsp;|&nbsp; ' + escHtml(data.version || 'v1.0') + '</div>' +
        '<div class="doc-cover-credit">Prepared by: ' + escHtml(data.prepared_by || '') + ' &nbsp;|&nbsp; Developer: ' + escHtml(data.developer || '') + ' &nbsp;|&nbsp; Task: ' + escHtml(data.task_num || '') + '</div></div>';

    // Status + approvals bar
    var stMap = { 'Draft': '#64748B', 'Under Review': '#92400E', 'Approved': '#166534', 'In Development': '#2E5FAC', 'Completed': '#1A6B6B' };
    var st = data.status || 'Draft';
    html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap;">' +
        '<span style="background:#EFF6FF;border:1px solid #BFDBFE;color:' + (stMap[st] || '#374151') + ';font-weight:700;font-size:12px;padding:4px 12px;border-radius:20px;">' + escHtml(st) + '</span>';
    (data.approvals || []).forEach(function (a) {
        var ac = a.status === 'Approved' ? '#166534' : a.status === 'Rejected' ? '#991B1B' : '#64748B';
        var ab = a.status === 'Approved' ? '#DCFCE7' : a.status === 'Rejected' ? '#FEE2E2' : '#F3F4F6';
        html += '<span style="background:' + ab + ';color:' + ac + ';font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;">' + escHtml(a.name || '') + ': ' + escHtml(a.status || 'Pending') + '</span>';
    });
    html += '</div>';

    if (data.problem_statement) {
        html += '<div class="doc-section-title">Problem Statement</div><div class="doc-text">' + escHtml(data.problem_statement) + '</div>';
    }
    if (data.objective) {
        html += '<div class="callout"><div class="callout-label" style="color:#2E5FAC;">Objective</div>' + escHtml(data.objective) + '</div>';
    }
    if (data.background) {
        html += '<div class="doc-section-title">Background</div><div class="doc-text">' + escHtml(data.background) + '</div>';
    }

    // Scope
    var hasScope = (sc.in_scope || []).length || (sc.out_of_scope || []).length || (sc.dependencies || []).length;
    if (hasScope) {
        html += '<div class="doc-section-title">Scope</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-navy">In Scope</th><th style="background:#991B1B;color:#fff;">Out of Scope</th><th class="th-blue">Dependencies</th></tr></thead><tbody><tr>';
        html += '<td style="vertical-align:top;"><ul style="padding-left:14px;margin:0;font-size:11.5px;">' + (sc.in_scope || []).map(function (i) { return '<li>' + escHtml(i) + '</li>'; }).join('') + '</ul></td>';
        html += '<td style="vertical-align:top;"><ul style="padding-left:14px;margin:0;font-size:11.5px;">' + (sc.out_of_scope || []).map(function (i) { return '<li>' + escHtml(i) + '</li>'; }).join('') + '</ul></td>';
        html += '<td style="vertical-align:top;"><ul style="padding-left:14px;margin:0;font-size:11.5px;">' + (sc.dependencies || []).map(function (i) { return '<li>' + escHtml(i) + '</li>'; }).join('') + '</ul></td>';
        html += '</tr></tbody></table>';
    }

    if (data.current_state) {
        html += '<div class="doc-section-title">Current State</div><div class="doc-text">' + escHtml(data.current_state) + '</div>';
    }
    if (data.proposed_solution) {
        html += '<div class="doc-section-title">Proposed Solution</div>';
        html += '<div class="callout teal"><div class="callout-label">Solution Overview</div>' + escHtml(data.proposed_solution) + '</div>';
    }

    // Technical Spec - Components
    var comps = (ts.components || []);
    if (comps.length) {
        html += '<div class="doc-section-title">Technical Components</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-navy">Type</th><th class="th-navy">Name</th><th class="th-navy">Table</th><th class="th-navy">Description</th><th class="th-navy">OOB?</th></tr></thead><tbody>';
        comps.forEach(function (c) {
            html += '<tr><td><strong>' + escHtml(c.type || '') + '</strong></td><td>' + escHtml(c.name || '') + '</td><td style="font-family:monospace;font-size:11px;">' + escHtml(c.table || '') + '</td><td>' + escHtml(c.description || '') + '</td><td>' + escHtml(c.is_oob || '') + '</td></tr>';
        });
        html += '</tbody></table>';
    }

    if (ts.data_flow) {
        html += '<div class="doc-section-title">Data Flow</div><div class="doc-text" style="white-space:pre-line;">' + escHtml(ts.data_flow) + '</div>';
    }
    if (ts.roles_and_access) {
        html += '<div class="doc-section-title">Roles &amp; Access</div><div class="doc-text">' + escHtml(ts.roles_and_access) + '</div>';
    }
    if (ts.known_constraints) {
        html += '<div class="callout amber"><div class="callout-label">Known Constraints</div>' + escHtml(ts.known_constraints) + '</div>';
    }

    var alts = data.alternatives_considered || [];
    if (alts.length) {
        html += '<div class="doc-section-title">Alternatives Considered</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-blue">Option</th><th class="th-blue">Description</th><th class="th-blue">Reason Rejected</th></tr></thead><tbody>';
        alts.forEach(function (a) {
            html += '<tr><td><strong>' + escHtml(a.option || '') + '</strong></td><td>' + escHtml(a.description || '') + '</td><td>' + escHtml(a.reason_rejected || '') + '</td></tr>';
        });
        html += '</tbody></table>';
    }

    var ac = data.acceptance_criteria || [];
    if (ac.length) {
        html += '<div class="doc-section-title">Acceptance Criteria</div><ol style="padding-left:20px;font-size:12.5px;color:var(--gray);">';
        ac.forEach(function (c) { html += '<li style="margin-bottom:5px;">' + escHtml(c) + '</li>'; });
        html += '</ol>';
    }

    if (data.rollback_plan) {
        html += '<div class="doc-section-title">Rollback Plan</div><div class="doc-text">' + escHtml(data.rollback_plan) + '</div>';
    }

    var tl = data.timeline || {};
    if (tl.estimate || tl.target_prod) {
        html += '<div class="doc-section-title">Timeline</div>';
        html += '<table class="doc-table"><tbody>';
        if (tl.estimate) html += '<tr><td><strong>Estimate</strong></td><td>' + escHtml(tl.estimate) + '</td></tr>';
        if (tl.dev_start) html += '<tr><td><strong>Dev Start</strong></td><td>' + escHtml(tl.dev_start) + '</td></tr>';
        if (tl.target_test) html += '<tr><td><strong>Target TEST</strong></td><td>' + escHtml(tl.target_test) + '</td></tr>';
        if (tl.target_prod) html += '<tr><td><strong>Target PROD</strong></td><td>' + escHtml(tl.target_prod) + '</td></tr>';
        if (tl.notes) html += '<tr><td><strong>Notes</strong></td><td>' + escHtml(tl.notes) + '</td></tr>';
        html += '</tbody></table>';
    }

    var oi = data.open_items || [];
    if (oi.length) {
        html += '<div class="doc-section-title">Open Items</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-red">Item</th><th class="th-red">Owner</th><th class="th-red">Due</th></tr></thead><tbody>';
        oi.forEach(function (o) {
            html += '<tr><td>' + escHtml(o.item || '') + '</td><td>' + escHtml(o.owner || '') + '</td><td>' + escHtml(o.due || '') + '</td></tr>';
        });
        html += '</tbody></table>';
    }

    var callouts = data.callouts || [];
    if (callouts.length) {
        html += '<div class="doc-section-title">Action Required — Verification Needed</div>';
        callouts.forEach(function (cb) {
            html += '<div class="callout amber"><div class="callout-label">ACTION REQUIRED \u2014 ' + escHtml(cb.dev || '') + '</div><ul style="padding-left:16px;font-size:12px;margin-top:4px;">';
            (cb.items || []).forEach(function (item) { html += '<li style="margin-bottom:4px;">' + escHtml(item) + '</li>'; });
            html += '</ul></div>';
        });
    }
    return html;
}

// ════════════════════════════════════════════════════
//  TASK BRIEF PREVIEW
// ════════════════════════════════════════════════════
function renderTaskBriefPreview(data) {
    var html = '';
    var inv = data.investigation || {};
    var res = data.resolution || {};
    var td = data.technical_detail || {};

    html += '<div class="doc-cover" style="background:linear-gradient(135deg,#1F3864,#1A6B6B);">' +
        '<div class="doc-cover-title">TASK BRIEF</div>' +
        '<div class="doc-cover-sub">' + escHtml(data.task_num || '') + ' &nbsp;|&nbsp; ' + escHtml(data.task_type || 'Task') + ' &nbsp;|&nbsp; ' + escHtml(data.priority || '') + '</div>' +
        '<div class="doc-cover-sub">' + escHtml(data.account || '') + ' &nbsp;|&nbsp; ' + escHtml(data.opened_date || '') + '</div>' +
        '<div class="doc-cover-credit">Assigned: ' + escHtml(data.assigned_to || '') + ' &nbsp;|&nbsp; PM: ' + escHtml(data.pm || '') + ' &nbsp;|&nbsp; Reported by: ' + escHtml(data.reported_by || '') + '</div></div>';

    // State + environment badges
    html += '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">' +
        '<span style="background:#DBEAFE;color:#1F3864;font-weight:700;font-size:12px;padding:4px 12px;border-radius:20px;">' + escHtml(data.state || '') + '</span>' +
        '<span style="background:#F3F4F6;color:#374151;font-size:12px;padding:4px 12px;border-radius:20px;">' + escHtml(data.environment || '') + '</span>' +
        '<span style="background:#F3F4F6;color:#374151;font-size:12px;padding:4px 12px;border-radius:20px;">Audience: ' + escHtml(data.audience || 'Developer') + '</span></div>';

    if (data.summary) {
        html += '<div class="callout"><div class="callout-label" style="color:#2E5FAC;">Summary</div>' + escHtml(data.summary) + '</div>';
    }

    if (data.reported_behavior) {
        html += '<div class="doc-section-title">Reported Behavior</div><div class="doc-text">' + escHtml(data.reported_behavior) + '</div>';
    }
    if (data.expected_behavior) {
        html += '<div class="doc-section-title">Expected Behavior</div><div class="doc-text">' + escHtml(data.expected_behavior) + '</div>';
    }
    if (data.impact) {
        html += '<div class="doc-section-title">Impact</div>';
        html += '<div class="callout amber"><div class="callout-label">Impact</div>' + escHtml(data.impact) + '</div>';
    }

    // Investigation
    if (inv.summary || (inv.findings || []).length) {
        html += '<div class="doc-section-title">Investigation</div>';
        if (inv.summary) html += '<div class="doc-text">' + escHtml(inv.summary) + '</div>';
        if ((inv.findings || []).length) {
            html += '<div style="font-size:11px;font-weight:700;color:#1F3864;margin:8px 0 4px;">Findings</div>';
            html += '<ul style="padding-left:18px;font-size:12px;color:#374151;">';
            inv.findings.forEach(function (f) { html += '<li style="margin-bottom:4px;">' + escHtml(f) + '</li>'; });
            html += '</ul>';
        }
        if ((inv.ruled_out || []).length) {
            html += '<div style="font-size:11px;font-weight:700;color:#64748B;margin:8px 0 4px;">Ruled Out</div>';
            html += '<ul style="padding-left:18px;font-size:12px;color:#64748B;">';
            inv.ruled_out.forEach(function (r) { html += '<li style="margin-bottom:3px;text-decoration:line-through;">' + escHtml(r) + '</li>'; });
            html += '</ul>';
        }
        if (inv.current_theory) {
            html += '<div class="callout" style="margin-top:8px;"><div class="callout-label" style="color:#2E5FAC;">Current Theory</div>' + escHtml(inv.current_theory) + '</div>';
        }
    }

    // Technical Detail - Components
    var comps = (td.components_involved || []);
    if (comps.length) {
        html += '<div class="doc-section-title">Technical Components Involved</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-navy">Type</th><th class="th-navy">Name</th><th class="th-navy">Table</th><th class="th-navy">Notes</th></tr></thead><tbody>';
        comps.forEach(function (c) {
            html += '<tr><td><strong>' + escHtml(c.type || '') + '</strong></td><td>' + escHtml(c.name || '') + '</td><td style="font-family:monospace;font-size:11px;">' + escHtml(c.table || '') + '</td><td>' + escHtml(c.notes || '') + '</td></tr>';
        });
        html += '</tbody></table>';
    }
    if (td.error_messages) {
        html += '<div class="doc-section-title">Error Messages / Logs</div>';
        html += '<div style="background:#1E293B;color:#E2E8F0;border-radius:8px;padding:12px;font-family:monospace;font-size:11px;line-height:1.6;white-space:pre-wrap;">' + escHtml(td.error_messages) + '</div>';
    }
    if (td.relevant_data) {
        html += '<div class="doc-section-title">Relevant Data</div><div class="doc-text">' + escHtml(td.relevant_data) + '</div>';
    }
    if (td.environment_notes) {
        html += '<div class="doc-section-title">Environment Notes</div><div class="doc-text">' + escHtml(td.environment_notes) + '</div>';
    }

    // Proposed Approaches
    var approaches = data.proposed_approach || [];
    if (approaches.length) {
        html += '<div class="doc-section-title">Proposed Approaches</div>';
        approaches.forEach(function (a, i) {
            var bg = a.recommended === 'Yes' ? '#DCFCE7' : '#F8FAFC';
            var border = a.recommended === 'Yes' ? '2px solid #166534' : '1px solid #E2E8F0';
            html += '<div style="background:' + bg + ';border:' + border + ';border-radius:8px;padding:12px 14px;margin-bottom:8px;">' +
                '<div style="font-size:12px;font-weight:700;color:#1F3864;margin-bottom:4px;">' + (i + 1) + '. ' + escHtml(a.option || '') + (a.recommended === 'Yes' ? ' <span style="background:#166534;color:#fff;font-size:10px;padding:1px 8px;border-radius:10px;margin-left:6px;">Recommended</span>' : '') + '</div>' +
                '<div style="font-size:12px;color:#374151;margin-bottom:4px;">' + escHtml(a.description || '') + '</div>' +
                '<div style="font-size:11.5px;color:#64748B;">Effort: ' + escHtml(a.effort || '') + '&nbsp;|&nbsp;Risk: ' + escHtml(a.risk || '') + '</div>' +
                (a.reason ? '<div style="font-size:11.5px;color:#374151;margin-top:4px;">' + escHtml(a.reason) + '</div>' : '') +
                '</div>';
        });
    }

    // Resolution
    if (res.description || res.status) {
        html += '<div class="doc-section-title">Resolution</div>';
        var rcls = res.status === 'Resolved' || res.status === 'Verified' ? 'green' : 'callout';
        html += '<div class="callout ' + rcls + '"><div class="callout-label">' + escHtml(res.status || '') + '</div>';
        if (res.description) html += escHtml(res.description);
        if (res.verification) html += '<div style="margin-top:6px;font-size:11.5px;font-style:italic;">Verification: ' + escHtml(res.verification) + '</div>';
        if (res.update_set) html += '<div style="font-size:11.5px;">Update Set: ' + escHtml(res.update_set) + '</div>';
        html += '</div>';
    }

    // Next Steps
    var ns = data.next_steps || [];
    if (ns.length) {
        html += '<div class="doc-section-title">Next Steps</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-navy">Action</th><th class="th-navy">Owner</th><th class="th-navy">Due</th></tr></thead><tbody>';
        ns.forEach(function (s) {
            html += '<tr><td>' + escHtml(s.action || String(s)) + '</td><td>' + escHtml(s.owner || '') + '</td><td>' + escHtml(s.due || '') + '</td></tr>';
        });
        html += '</tbody></table>';
    }

    // Blockers
    var bl = data.blockers || [];
    if (bl.length) {
        html += '<div class="doc-section-title">Blockers</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-red">Blocker</th><th class="th-red">Impact</th><th class="th-red">Resolution Path</th></tr></thead><tbody>';
        bl.forEach(function (b) {
            html += '<tr><td>' + escHtml(b.blocker || '') + '</td><td>' + escHtml(b.impact || '') + '</td><td>' + escHtml(b.resolution_path || '') + '</td></tr>';
        });
        html += '</tbody></table>';
    }

    if (data.developer_notes) {
        html += '<div class="doc-section-title">Developer Notes</div>';
        html += '<div class="callout"><div class="callout-label" style="color:#374151;">Internal — Developer Only</div>' + escHtml(data.developer_notes) + '</div>';
    }
    if (data.client_notes) {
        html += '<div class="doc-section-title">Client Notes</div><div class="doc-text">' + escHtml(data.client_notes) + '</div>';
    }

    var callouts = data.callouts || [];
    if (callouts.length) {
        html += '<div class="doc-section-title">Action Required — Verification Needed</div>';
        callouts.forEach(function (cb) {
            html += '<div class="callout amber"><div class="callout-label">ACTION REQUIRED \u2014 ' + escHtml(cb.dev || '') + '</div><ul style="padding-left:16px;font-size:12px;margin-top:4px;">';
            (cb.items || []).forEach(function (item) { html += '<li style="margin-bottom:4px;">' + escHtml(item) + '</li>'; });
            html += '</ul></div>';
        });
    }
    return html;
}

// ════════════════════════════════════════════════════
//  NEW DOCUMENT EDIT FORMS
// ════════════════════════════════════════════════════
function buildBlockerEditForm(data) {
    var html = '';
    html += mkSection('Blocker Info',
        mkRow(mkField('Account', 'b_account', data.account), mkField('Task #', 'b_task_num', data.task_num)) +
        mkRow(mkField('Date', 'b_date', data.date), mkField('PM', 'b_pm', data.pm)) +
        mkRow(mkField('Assigned To', 'b_assigned_to', data.assigned_to), mkField('Status', 'b_status', data.status)) +
        mkField('Title', 'b_title', data.title)
    );
    html += mkSection('Summary', mkField('Summary', 'b_summary', data.summary, 'textarea'));
    html += mkSection('Blocker Description', mkField('Description', 'b_blocker_description', data.blocker_description, 'textarea'));
    html += mkSection('Impact', mkField('Impact', 'b_impact', data.impact, 'textarea'));
    html += mkSection('Investigation', mkField('Investigation', 'b_investigation', data.investigation, 'textarea'));
    html += mkSection('Root Cause', mkField('Root Cause', 'b_root_cause', data.root_cause, 'textarea'));
    html += mkSection('Resolution (if resolved)', mkField('Resolution', 'b_resolution', data.resolution, 'textarea'));
    html += mkSection('Technical Context', mkField('Technical Context (for developers)', 'b_technical_context', data.technical_context, 'textarea'));
    html += mkSection('Client Communication', mkField('Client Communication', 'b_client_communication', data.client_communication, 'textarea'));
    html += mkSection('Next Steps (one per line)',
        '<div class="edit-field"><div class="edit-label">Next Steps</div>' +
        '<textarea class="edit-textarea" id="ef_b_next_steps" rows="5">' + escHtml((data.next_steps || []).join('\n')) + '</textarea></div>'
    );
    html += mkSection('Open Questions (one per line)',
        '<div class="edit-field"><div class="edit-label">Open Questions</div>' +
        '<textarea class="edit-textarea" id="ef_b_open_questions" rows="4">' + escHtml((data.open_questions || []).join('\n')) + '</textarea></div>'
    );
    return html;
}

function buildTechApproachEditForm(data) {
    var tl = data.timeline || {};
    var html = '';
    html += mkSection('Document Info',
        mkRow(mkField('Account', 'ta_account', data.account), mkField('Task #', 'ta_task_num', data.task_num)) +
        mkRow(mkField('Prepared By', 'ta_prepared_by', data.prepared_by), mkField('Developer', 'ta_developer', data.developer)) +
        mkRow(mkField('Date', 'ta_date', data.date), mkField('Status', 'ta_status', data.status)) +
        mkField('Title', 'ta_title', data.title)
    );
    html += mkSection('Problem Statement', mkField('Problem Statement', 'ta_problem_statement', data.problem_statement, 'textarea'));
    html += mkSection('Objective', mkField('Objective', 'ta_objective', data.objective, 'textarea'));
    html += mkSection('Background', mkField('Background', 'ta_background', data.background, 'textarea'));
    html += mkSection('Current State', mkField('Current State', 'ta_current_state', data.current_state, 'textarea'));
    html += mkSection('Proposed Solution', mkField('Proposed Solution', 'ta_proposed_solution', data.proposed_solution, 'textarea'));
    html += mkSection('Data Flow', mkField('Data Flow (step by step)', 'ta_data_flow', (data.technical_spec || {}).data_flow, 'textarea'));
    html += mkSection('Roles & Access', mkField('Roles & Access', 'ta_roles', (data.technical_spec || {}).roles_and_access, 'textarea'));
    html += mkSection('Known Constraints', mkField('Known Constraints', 'ta_constraints', (data.technical_spec || {}).known_constraints, 'textarea'));
    html += mkSection('Acceptance Criteria (one per line)',
        '<div class="edit-field"><div class="edit-label">Acceptance Criteria</div>' +
        '<textarea class="edit-textarea" id="ef_ta_acceptance_criteria" rows="6">' + escHtml((data.acceptance_criteria || []).join('\n')) + '</textarea></div>'
    );
    html += mkSection('Rollback Plan', mkField('Rollback Plan', 'ta_rollback', data.rollback_plan, 'textarea'));
    html += mkSection('Timeline',
        mkRow(mkField('Estimate', 'ta_tl_estimate', tl.estimate), mkField('Dev Start', 'ta_tl_dev_start', tl.dev_start)) +
        mkRow(mkField('Target TEST', 'ta_tl_target_test', tl.target_test), mkField('Target PROD', 'ta_tl_target_prod', tl.target_prod)) +
        mkField('Notes', 'ta_tl_notes', tl.notes)
    );
    html += mkSection('Notes', mkField('Additional Notes', 'ta_notes', data.notes, 'textarea'));
    return html;
}

function buildTaskBriefEditForm(data) {
    var inv = data.investigation || {};
    var res = data.resolution || {};
    var html = '';
    html += mkSection('Task Info',
        mkRow(mkField('Task #', 'tb_task_num', data.task_num), mkField('Task Type', 'tb_task_type', data.task_type)) +
        mkRow(mkField('Account', 'tb_account', data.account), mkField('Priority', 'tb_priority', data.priority)) +
        mkRow(mkField('State', 'tb_state', data.state), mkField('Environment', 'tb_environment', data.environment)) +
        mkRow(mkField('Assigned To', 'tb_assigned_to', data.assigned_to), mkField('PM', 'tb_pm', data.pm)) +
        mkRow(mkField('Opened Date', 'tb_opened_date', data.opened_date), mkField('Target Date', 'tb_target_date', data.target_date)) +
        mkField('Title', 'tb_title', data.title)
    );
    html += mkSection('Summary', mkField('Summary', 'tb_summary', data.summary, 'textarea'));
    html += mkSection('Reported Behavior', mkField('Reported Behavior', 'tb_reported_behavior', data.reported_behavior, 'textarea'));
    html += mkSection('Expected Behavior', mkField('Expected Behavior', 'tb_expected_behavior', data.expected_behavior, 'textarea'));
    html += mkSection('Impact', mkField('Impact', 'tb_impact', data.impact, 'textarea'));
    html += mkSection('Investigation',
        mkField('Investigation Summary', 'tb_inv_summary', inv.summary, 'textarea') +
        '<div class="edit-field"><div class="edit-label">Findings (one per line)</div>' +
        '<textarea class="edit-textarea" id="ef_tb_inv_findings" rows="4">' + escHtml((inv.findings || []).join('\n')) + '</textarea></div>' +
        mkField('Current Theory', 'tb_inv_theory', inv.current_theory, 'textarea')
    );
    html += mkSection('Technical Detail',
        mkField('Error Messages / Logs', 'tb_td_errors', (data.technical_detail || {}).error_messages, 'textarea') +
        mkField('Relevant Data', 'tb_td_data', (data.technical_detail || {}).relevant_data, 'textarea') +
        mkField('Environment Notes', 'tb_td_env', (data.technical_detail || {}).environment_notes, 'textarea')
    );
    html += mkSection('Resolution',
        mkRow(mkField('Resolution Status', 'tb_res_status', res.status), mkField('Date Resolved', 'tb_res_date', res.date_resolved)) +
        mkField('Resolution Description', 'tb_res_description', res.description, 'textarea') +
        mkField('Verification', 'tb_res_verification', res.verification, 'textarea') +
        mkField('Update Set', 'tb_res_update_set', res.update_set)
    );
    html += mkSection('Developer Notes', mkField('Developer Notes (internal only)', 'tb_developer_notes', data.developer_notes, 'textarea'));
    html += mkSection('Client Notes', mkField('Client Notes', 'tb_client_notes', data.client_notes, 'textarea'));
    return html;
}

// ════════════════════════════════════════════════════
//  PROJECT SUMMARY PREVIEW
// ════════════════════════════════════════════════════
function renderProjectSummaryPreview(data) {
    var html = '';
    html += '<div class="doc-cover"><div class="doc-cover-title">PROJECT SUMMARY REPORT</div>' +
        '<div class="doc-cover-sub">' + escHtml(data.project_name || '') + ' &nbsp;|&nbsp; ' + escHtml(data.created_date || '') + '</div>' +
        '<div class="doc-cover-credit">Author: ' + escHtml(data.author || '') + '</div></div>';

    if (data.summary) {
        html += '<div class="doc-section-title">Executive Summary</div><div class="doc-text">' + escHtml(data.summary) + '</div>';
    }

    var metrics = data.key_metrics || [];
    if (metrics.length) {
        html += '<div class="doc-section-title">Key Metrics</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-blue">Metric</th><th class="th-blue">Current</th><th class="th-blue">Target</th><th class="th-blue">Status</th></tr></thead><tbody>';
        metrics.forEach(function (m) {
            var status = (m.status || '').toLowerCase();
            var statusClass = status.includes('on track') || status.includes('completed') ? 'status-prod' :
                            status.includes('behind') || status.includes('delayed') ? 'status-open' : 'status-other';
            html += '<tr><td><strong>' + escHtml(m.metric || '') + '</strong></td><td>' + escHtml(m.current || '') + '</td><td>' + escHtml(m.target || '') + '</td><td><span class="status-badge ' + statusClass + '">' + escHtml(m.status || '') + '</span></td></tr>';
        });
        html += '</tbody></table>';
    }

    var milestones = data.milestones || [];
    if (milestones.length) {
        html += '<div class="doc-section-title">Milestones</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-navy">Milestone</th><th class="th-navy">Due Date</th><th class="th-navy">Status</th><th class="th-navy">Notes</th></tr></thead><tbody>';
        milestones.forEach(function (m) {
            var status = (m.status || '').toLowerCase();
            var statusClass = status.includes('completed') ? 'status-prod' :
                            status.includes('in progress') ? 'status-wip' : 'status-other';
            html += '<tr><td><strong>' + escHtml(m.name || '') + '</strong></td><td>' + escHtml(m.due_date || '') + '</td><td><span class="status-badge ' + statusClass + '">' + escHtml(m.status || '') + '</span></td><td>' + escHtml(m.notes || '') + '</td></tr>';
        });
        html += '</tbody></table>';
    }

    var risks = data.risks || [];
    if (risks.length) {
        html += '<div class="doc-section-title">Risks & Mitigations</div>';
        html += '<table class="doc-table"><thead><tr><th class="th-red">Risk Description</th><th class="th-red">Impact</th><th class="th-red">Mitigation</th></tr></thead><tbody>';
        risks.forEach(function (r) {
            var impact = (r.impact || '').toLowerCase();
            var impactClass = impact.includes('high') ? 'status-open' :
                            impact.includes('medium') ? 'status-wip' : 'status-other';
            html += '<tr><td>' + escHtml(r.description || '') + '</td><td><span class="status-badge ' + impactClass + '">' + escHtml(r.impact || '') + '</span></td><td>' + escHtml(r.mitigation || '') + '</td></tr>';
        });
        html += '</tbody></table>';
    }

    return html;
}

function buildProjectSummaryEditForm(data) {
    var html = '';
    html += mkSection('Project Info',
        mkRow(mkField('Project Name', 'ps_project_name', data.project_name), mkField('Created Date', 'ps_created_date', data.created_date)) +
        mkField('Author', 'ps_author', data.author)
    );
    html += mkSection('Executive Summary', mkField('Summary', 'ps_summary', data.summary, 'textarea'));
    
    var metrics = data.key_metrics || [];
    if (metrics.length || true) {
        html += '<div class="edit-section"><div class="edit-section-header">Key Metrics</div><div class="edit-section-body">';
        html += '<div id="metrics-list">';
        metrics.forEach(function (m, i) {
            html += '<div class="edit-item-row" id="metric-row-' + i + '">' +
                '<div style="display:flex;gap:8px;margin-bottom:8px;">' +
                '<input type="text" class="edit-input" data-field="metric" placeholder="Metric Name" value="' + escHtml(m.metric || '') + '" style="flex:1;"><input type="text" class="edit-input" data-field="current" placeholder="Current" value="' + escHtml(m.current || '') + '" style="flex:0.8;"><input type="text" class="edit-input" data-field="target" placeholder="Target" value="' + escHtml(m.target || '') + '" style="flex:0.8;"><input type="text" class="edit-input" data-field="status" placeholder="Status" value="' + escHtml(m.status || '') + '" style="flex:0.8;">' +
                (i > 0 ? '<button class="edit-remove-btn" onclick="removeRow(\'metric-row-' + i + '\')">✕</button>' : '') +
                '</div></div>';
        });
        html += '</div>';
        html += '<button class="btn-sm" style="margin-top:8px;" onclick="addRow(\'metrics-list\', \'metric\')">+ Add Metric</button>';
        html += '</div></div>';
    }

    var milestones = data.milestones || [];
    if (milestones.length || true) {
        html += '<div class="edit-section"><div class="edit-section-header">Milestones</div><div class="edit-section-body">';
        html += '<div id="milestones-list">';
        milestones.forEach(function (m, i) {
            html += '<div class="edit-item-row" id="milestone-row-' + i + '">' +
                '<div style="display:flex;gap:8px;margin-bottom:8px;">' +
                '<input type="text" class="edit-input" data-field="name" placeholder="Milestone Name" value="' + escHtml(m.name || '') + '" style="flex:1.2;"><input type="text" class="edit-input" data-field="due_date" placeholder="Due Date" value="' + escHtml(m.due_date || '') + '" style="flex:0.8;"><input type="text" class="edit-input" data-field="status" placeholder="Status" value="' + escHtml(m.status || '') + '" style="flex:0.8;"><input type="text" class="edit-input" data-field="notes" placeholder="Notes" value="' + escHtml(m.notes || '') + '" style="flex:1;">' +
                (i > 0 ? '<button class="edit-remove-btn" onclick="removeRow(\'milestone-row-' + i + '\')">✕</button>' : '') +
                '</div></div>';
        });
        html += '</div>';
        html += '<button class="btn-sm" style="margin-top:8px;" onclick="addRow(\'milestones-list\', \'milestone\')">+ Add Milestone</button>';
        html += '</div></div>';
    }

    var risks = data.risks || [];
    if (risks.length || true) {
        html += '<div class="edit-section"><div class="edit-section-header">Risks</div><div class="edit-section-body">';
        html += '<div id="risks-list">';
        risks.forEach(function (r, i) {
            html += '<div class="edit-item-row" id="risk-row-' + i + '">' +
                '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">' +
                '<input type="text" class="edit-input" data-field="description" placeholder="Risk Description" value="' + escHtml(r.description || '') + '" style="flex:1.5;min-width:200px;"><input type="text" class="edit-input" data-field="impact" placeholder="Impact" value="' + escHtml(r.impact || '') + '" style="flex:0.6;"><input type="text" class="edit-input" data-field="mitigation" placeholder="Mitigation" value="' + escHtml(r.mitigation || '') + '" style="flex:1.2;min-width:200px;">' +
                (i > 0 ? '<button class="edit-remove-btn" onclick="removeRow(\'risk-row-' + i + '\')">✕</button>' : '') +
                '</div></div>';
        });
        html += '</div>';
        html += '<button class="btn-sm" style="margin-top:8px;" onclick="addRow(\'risks-list\', \'risk\')">+ Add Risk</button>';
        html += '</div></div>';
    }
    return html;
}


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
    document.getElementById('edit-empty').style.display = 'flex';
    document.getElementById('edit-content').style.display = 'none';
    updateGenButton();
}

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
        var result;
        if (currentMode === 'callscript') result = await generateCallScript(currentData);
        else if (currentMode === 'report') result = await generateStatusReport(currentData);
        else if (currentMode === 'rca') result = await generateRCA(currentData);
        else if (currentMode === 'blocker') result = await generateBlockerBrief(currentData);
        else if (currentMode === 'techapproach') result = await generateTechApproach(currentData);
        else if (currentMode === 'taskbrief') result = await generateTaskBrief(currentData);
        else if (currentMode === 'projectsummary') result = await generateProjectSummary(currentData);

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

function downloadNow() {
    if (!lastBlob) return;
    var url = URL.createObjectURL(lastBlob);
    var a = document.createElement('a');
    a.href = url; a.download = lastFilename; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
}


// ════════════════════════════════════════════════════
//  EDIT PANEL
// ════════════════════════════════════════════════════
let originalData = null;

function buildEditPanel(data) {
    originalData = JSON.parse(JSON.stringify(data));
    document.getElementById('edit-empty').style.display = 'none';
    const el = document.getElementById('edit-content');
    el.style.display = 'block';
    const fields = document.getElementById('edit-fields');
    fields.innerHTML = '';
    if (currentMode === 'report') fields.innerHTML = buildReportEditForm(data);
    else if (currentMode === 'callscript') fields.innerHTML = buildCallScriptEditForm(data);
    else if (currentMode === 'rca') fields.innerHTML = buildRcaEditForm(data);
    else if (currentMode === 'blocker') fields.innerHTML = buildBlockerEditForm(data);
    else if (currentMode === 'techapproach') fields.innerHTML = buildTechApproachEditForm(data);
    else if (currentMode === 'taskbrief') fields.innerHTML = buildTaskBriefEditForm(data);
    else if (currentMode === 'projectsummary') fields.innerHTML = buildProjectSummaryEditForm(data);
}

function mkSection(title, content) {
    return '<div class="edit-section"><div class="edit-section-header">' + title + '</div><div class="edit-section-body">' + content + '</div></div>';
}
function mkField(label, id, value, type) {
    var val = escHtml(String(value || ''));
    if (type === 'textarea') return '<div class="edit-field"><div class="edit-label">' + label + '</div><textarea class="edit-textarea" id="ef_' + id + '" rows="4">' + val + '</textarea></div>';
    return '<div class="edit-field"><div class="edit-label">' + label + '</div><input class="edit-input" id="ef_' + id + '" type="text" value="' + val + '"></div>';
}
function mkRow() {
    var parts = Array.prototype.slice.call(arguments);
    return '<div class="edit-row">' + parts.join('') + '</div>';
}

function focusItemEditBlock(fi, idx) {
    var label = 'Focus Item ' + (idx + 1);
    return '<div class="edit-section" id="fi-block-' + idx + '" style="border:1px solid #FDE68A;border-radius:8px;margin-bottom:8px;">' +
        '<div class="edit-section-header" style="display:flex;justify-content:space-between;align-items:center;">' +
        label +
        (idx > 0 ? '<button class="edit-remove-btn" style="position:relative;top:0;right:0;" onclick="removeFocusItem(' + idx + ')">✕</button>' : '') +
        '</div>' +
        '<div class="edit-section-body">' +
        mkField('Title', 'fi_title_' + idx, fi.title) +
        mkField('Status', 'fi_status_' + idx, fi.status) +
        mkField('Body', 'fi_body_' + idx, fi.body, 'textarea') +
        '<div class="edit-field"><div class="edit-label">Bullets (one per line)</div>' +
        '<textarea class="edit-textarea" id="ef_fi_bullets_' + idx + '" rows="5">' + escHtml((fi.bullets || []).join('\n')) + '</textarea></div>' +
        '</div></div>';
}

function buildReportEditForm(data) {
    var meta = data.meta || {};
    var fiArr = Array.isArray(data.focus_items) ? data.focus_items : (data.focus_item ? [data.focus_item] : [{}]);
    if (!fiArr.length) fiArr = [{}];
    var html = '';
    html += mkSection('Document Meta',
        mkRow(mkField('Account', 'meta_account', meta.account), mkField('Week Of', 'meta_week_of', meta.week_of)) +
        mkField('Program Manager', 'meta_pm', meta.pm)
    );
    html += mkSection('Executive Summary', mkField('Summary', 'executive_summary', data.executive_summary, 'textarea'));
    html += '<div class="edit-section"><div class="edit-section-header">Focus Items</div><div class="edit-section-body">' +
        '<div id="focus-items-list">' + fiArr.map(function (fi, i) { return focusItemEditBlock(fi, i); }).join('') + '</div>' +
        '<button class="edit-add-btn" id="add-focus-btn" onclick="addFocusItem()" style="' + (fiArr.length >= 3 ? 'display:none;' : '') + '">+ Add Focus Item</button>' +
        '</div></div>';
    html += mkSection('Process Note', mkField('Process Note', 'process_note', data.process_note, 'textarea'));
    html += '<div class="edit-section"><div class="edit-section-header">Stories / Tasks</div><div class="edit-section-body">' +
        '<div id="stories-list">' + (data.stories || []).map(storyEditRow).join('') + '</div>' +
        '<button class="edit-add-btn" onclick="addStoryRow()">+ Add Story</button></div></div>';
    html += '<div class="edit-section"><div class="edit-section-header">Action Items</div><div class="edit-section-body">' +
        '<div id="actions-list">' + (data.action_items || []).map(actionEditRow).join('') + '</div>' +
        '<button class="edit-add-btn" onclick="addActionRow()">+ Add Action Item</button></div></div>';
    return html;
}

function buildCallScriptEditForm(data) {
    var meta = data.meta || {};
    var html = '';
    html += mkSection('Call Meta',
        mkRow(mkField('Account', 'meta_account', meta.account), mkField('Call Type', 'meta_call_type', meta.call_type)) +
        mkRow(mkField('Date', 'meta_call_date', meta.date || meta.call_date), mkField('Prepared By', 'meta_prepared_by', meta.prepared_by || meta.pm)) +
        mkRow(mkField('Audience', 'meta_audience', meta.audience), mkField('Presenter Role', 'meta_presenter_role', meta.presenter_role || meta.presenter))
    );
    (data.topics || []).forEach(function (t, i) {
        html += mkSection('Topic ' + (i + 1),
            mkField('Title', 'topic_' + i + '_title', t.title) +
            mkField('Say This', 'topic_' + i + '_say_this', t.say_this, 'textarea') +
            mkField('Technical Notes', 'topic_' + i + '_technical_notes', t.technical_notes, 'textarea')
        );
    });
    html += mkSection('Closing Statement', mkField('Closing Statement', 'closing_statement', data.closing_statement, 'textarea'));
    return html;
}

function buildRcaEditForm(data) {
    var html = '';
    html += mkSection('Incident Info',
        mkRow(mkField('Incident #', 'incident', data.incident), mkField('Account', 'account', data.account)) +
        mkRow(mkField('Status', 'status', data.status), mkField('Developer', 'developer', data.developer)) +
        mkRow(mkField('Reported By', 'reported_by', data.reported_by), mkField('Fix Date', 'fix_date', data.fix_date)) +
        mkField('Title', 'title', data.title, 'textarea')
    );
    [['s1', 'Incident Overview'], ['s2', 'Root Cause Analysis'], ['s3', 'Impact Assessment'],
    ['s4', 'Resolution'], ['s5', 'Contributing Factors'], ['s10', 'Document Notes']].forEach(function (pair) {
        html += mkSection(pair[1], mkField(pair[1], pair[0], data[pair[0]], 'textarea'));
    });
    [['s6', 'Immediate Actions (one per line)'], ['s7', 'Corrective Actions (one per line)'], ['s8', 'Open Questions (one per line)']].forEach(function (pair) {
        html += mkSection(pair[1],
            '<div class="edit-field"><div class="edit-label">' + pair[1] + '</div>' +
            '<textarea class="edit-textarea" id="ef_' + pair[0] + '" rows="5">' + escHtml((data[pair[0]] || []).join('\n')) + '</textarea></div>'
        );
    });
    return html;
}

function storyEditRow(s, i) {
    return '<div class="edit-item-row" id="story-row-' + i + '" style="grid-template-columns:1fr 2fr 1fr 1fr 1fr;padding-right:28px;">' +
        '<button class="edit-remove-btn" onclick="removeRow(\'story-row-' + i + '\')">✕</button>' +
        '<input class="edit-input" placeholder="Task #"    data-field="num"      value="' + escHtml(s.num || '') + '">' +
        '<input class="edit-input" placeholder="Title"     data-field="title"    value="' + escHtml(s.title || '') + '">' +
        '<input class="edit-input" placeholder="Assignee"  data-field="assignee" value="' + escHtml(s.assignee || '') + '">' +
        '<input class="edit-input" placeholder="State"     data-field="state"    value="' + escHtml(s.state || '') + '">' +
        '<input class="edit-input" placeholder="Phase"     data-field="phase"    value="' + escHtml(s.phase || '') + '">' +
        '</div>';
}

function actionEditRow(a, i) {
    return '<div class="edit-item-row" id="action-row-' + i + '" style="grid-template-columns:1fr 3fr 1fr 1fr;padding-right:28px;">' +
        '<button class="edit-remove-btn" onclick="removeRow(\'action-row-' + i + '\')">✕</button>' +
        '<input class="edit-input" placeholder="Owner"  data-field="owner"  value="' + escHtml(a.owner || '') + '">' +
        '<input class="edit-input" placeholder="Action" data-field="action" value="' + escHtml(a.action || '') + '">' +
        '<input class="edit-input" placeholder="Item #" data-field="item"   value="' + escHtml(a.item || '') + '">' +
        '<input class="edit-input" placeholder="Due"    data-field="due"    value="' + escHtml(a.due || '') + '">' +
        '</div>';
}

function addStoryRow() {
    var list = document.getElementById('stories-list');
    var i = list.children.length;
    var div = document.createElement('div');
    div.innerHTML = storyEditRow({}, i);
    list.appendChild(div.firstChild);
}

function addActionRow() {
    var list = document.getElementById('actions-list');
    var i = list.children.length;
    var div = document.createElement('div');
    div.innerHTML = actionEditRow({}, i);
    list.appendChild(div.firstChild);
}

function removeRow(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
}

function addRow(listId, rowType) {
    var list = document.getElementById(listId);
    if (!list) return;
    var count = list.children.length;
    var div = document.createElement('div');
    if (rowType === 'metric') {
        div.innerHTML = '<div class="edit-item-row" id="metric-row-' + count + '"><div style="display:flex;gap:8px;margin-bottom:8px;"><input type="text" class="edit-input" data-field="metric" placeholder="Metric Name" style="flex:1;"><input type="text" class="edit-input" data-field="current" placeholder="Current" style="flex:0.8;"><input type="text" class="edit-input" data-field="target" placeholder="Target" style="flex:0.8;"><input type="text" class="edit-input" data-field="status" placeholder="Status" style="flex:0.8;"><button class="edit-remove-btn" onclick="removeRow(\'metric-row-' + count + '\')">✕</button></div></div>';
    } else if (rowType === 'milestone') {
        div.innerHTML = '<div class="edit-item-row" id="milestone-row-' + count + '"><div style="display:flex;gap:8px;margin-bottom:8px;"><input type="text" class="edit-input" data-field="name" placeholder="Milestone Name" style="flex:1.2;"><input type="text" class="edit-input" data-field="due_date" placeholder="Due Date" style="flex:0.8;"><input type="text" class="edit-input" data-field="status" placeholder="Status" style="flex:0.8;"><input type="text" class="edit-input" data-field="notes" placeholder="Notes" style="flex:1;"><button class="edit-remove-btn" onclick="removeRow(\'milestone-row-' + count + '\')">✕</button></div></div>';
    } else if (rowType === 'risk') {
        div.innerHTML = '<div class="edit-item-row" id="risk-row-' + count + '"><div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;"><input type="text" class="edit-input" data-field="description" placeholder="Risk Description" style="flex:1.5;min-width:200px;"><input type="text" class="edit-input" data-field="impact" placeholder="Impact" style="flex:0.6;"><input type="text" class="edit-input" data-field="mitigation" placeholder="Mitigation" style="flex:1.2;min-width:200px;"><button class="edit-remove-btn" onclick="removeRow(\'risk-row-' + count + '\')">✕</button></div></div>';
    }
    list.appendChild(div.firstChild);
}


function addFocusItem() {
    var list = document.getElementById('focus-items-list');
    if (!list) return;
    var count = list.children.length;
    if (count >= 3) return;
    var div = document.createElement('div');
    div.innerHTML = focusItemEditBlock({}, count);
    list.appendChild(div.firstChild);
    if (list.children.length >= 3) {
        var btn = document.getElementById('add-focus-btn');
        if (btn) btn.style.display = 'none';
    }
}

function removeFocusItem(idx) {
    var el = document.getElementById('fi-block-' + idx);
    if (el) el.remove();
    var list = document.getElementById('focus-items-list');
    if (!list) return;
    Array.from(list.children).forEach(function (block, newIdx) {
        block.id = 'fi-block-' + newIdx;
        var header = block.querySelector('.edit-section-header');
        if (header) {
            var removeBtn = header.querySelector('.edit-remove-btn');
            if (removeBtn) removeBtn.setAttribute('onclick', 'removeFocusItem(' + newIdx + ')');
            var labelEl = header.firstChild;
            if (labelEl && labelEl.nodeType === 3) labelEl.textContent = 'Focus Item ' + (newIdx + 1);
        }
        ['fi_title_', 'fi_status_', 'fi_body_', 'fi_bullets_'].forEach(function (prefix) {
            var inp = block.querySelector('[id^="ef_' + prefix + '"]');
            if (inp) inp.id = 'ef_' + prefix + newIdx;
        });
    });
    var btn = document.getElementById('add-focus-btn');
    if (btn && list.children.length < 3) btn.style.display = '';
}

function getVal(id) {
    var el = document.getElementById('ef_' + id);
    return el ? el.value : '';
}

function applyEdits() {
    if (!currentData) return;
    var d = currentData;
    if (currentMode === 'report') {
        d.meta = d.meta || {};
        d.meta.account = getVal('meta_account');
        d.meta.week_of = getVal('meta_week_of');
        d.meta.pm = getVal('meta_pm');
        d.executive_summary = getVal('executive_summary');
        d.process_note = getVal('process_note');
        var fiList = document.getElementById('focus-items-list');
        var fiCount = fiList ? fiList.children.length : 0;
        d.focus_items = [];
        for (var fi_i = 0; fi_i < fiCount; fi_i++) {
            var fiObj = {
                title: getVal('fi_title_' + fi_i),
                status: getVal('fi_status_' + fi_i),
                body: getVal('fi_body_' + fi_i),
                bullets: getVal('fi_bullets_' + fi_i).split('\n').map(function (s) { return s.trim(); }).filter(Boolean)
            };
            if (fiObj.title || fiObj.status || fiObj.bullets.length) d.focus_items.push(fiObj);
        }
        delete d.focus_item;
        var storyRows2 = document.querySelectorAll('#stories-list .edit-item-row');
        d.stories = Array.from(storyRows2).map(function (row) {
            var obj = {};
            row.querySelectorAll('input').forEach(function (inp) { if (inp.dataset.field) obj[inp.dataset.field] = inp.value; });
            return obj;
        });
        var actionRows2 = document.querySelectorAll('#actions-list .edit-item-row');
        d.action_items = Array.from(actionRows2).map(function (row) {
            var obj = {};
            row.querySelectorAll('input').forEach(function (inp) { if (inp.dataset.field) obj[inp.dataset.field] = inp.value; });
            return obj;
        });
    } else if (currentMode === 'callscript') {
        d.meta = d.meta || {};
        d.meta.account = getVal('meta_account');
        d.meta.call_type = getVal('meta_call_type');
        d.meta.date = getVal('meta_call_date');
        d.meta.call_date = getVal('meta_call_date');
        d.meta.prepared_by = getVal('meta_prepared_by');
        d.meta.pm = getVal('meta_prepared_by');
        d.meta.audience = getVal('meta_audience');
        d.meta.presenter_role = getVal('meta_presenter_role');
        d.meta.presenter = getVal('meta_presenter_role');
        d.closing_statement = getVal('closing_statement');
        (d.topics || []).forEach(function (t, i) {
            t.title = getVal('topic_' + i + '_title');
            t.say_this = getVal('topic_' + i + '_say_this');
            t.technical_notes = getVal('topic_' + i + '_technical_notes');
        });
    } else if (currentMode === 'rca') {
        ['incident', 'account', 'status', 'developer', 'reported_by', 'fix_date'].forEach(function (k) { d[k] = getVal(k); });
        d.title = getVal('title');
        ['s1', 's2', 's3', 's4', 's5', 's10'].forEach(function (k) { d[k] = getVal(k); });
        ['s6', 's7', 's8'].forEach(function (k) {
            d[k] = getVal(k).split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        });
    } else if (currentMode === 'blocker') {
        d = applyBlockerEdits(d);
    } else if (currentMode === 'techapproach') {
        d = applyTechApproachEdits(d);
    } else if (currentMode === 'taskbrief') {
        d = applyTaskBriefEdits(d);
    } else if (currentMode === 'projectsummary') {
        d.project_name = getVal('ps_project_name');
        d.created_date = getVal('ps_created_date');
        d.author = getVal('ps_author');
        d.summary = getVal('ps_summary');
        var metricsRows = document.querySelectorAll('#metrics-list .edit-item-row');
        d.key_metrics = Array.from(metricsRows).map(function (row) {
            var obj = {};
            row.querySelectorAll('input').forEach(function (inp) { if (inp.dataset.field) obj[inp.dataset.field] = inp.value; });
            return obj;
        });
        var milestonesRows = document.querySelectorAll('#milestones-list .edit-item-row');
        d.milestones = Array.from(milestonesRows).map(function (row) {
            var obj = {};
            row.querySelectorAll('input').forEach(function (inp) { if (inp.dataset.field) obj[inp.dataset.field] = inp.value; });
            return obj;
        });
        var risksRows = document.querySelectorAll('#risks-list .edit-item-row');
        d.risks = Array.from(risksRows).map(function (row) {
            var obj = {};
            row.querySelectorAll('input').forEach(function (inp) { if (inp.dataset.field) obj[inp.dataset.field] = inp.value; });
            return obj;
        });
    }
    currentData = d;
    renderPreview(d);
    renderJsonView(d);
    document.getElementById('json-ta').value = JSON.stringify(d, null, 2);
    switchTab('preview');
}

function resetEdits() {
    if (originalData) {
        currentData = JSON.parse(JSON.stringify(originalData));
        buildEditPanel(currentData);
        renderPreview(currentData);
        renderJsonView(currentData);
    }
}

// ════════════════════════════════════════════════════
//  PDF GENERATION
// ════════════════════════════════════════════════════
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

// ── Call Script Generator ────────────────────────────────────────────────────
async function generateCallScript(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType,
        Header, Footer, TabStopType } = getDocx();

    const C = docxColors();
    const meta = data.meta || {};
    const topics = data.topics || [];
    const account = safeStr(meta.account || 'Account');
    const call_date = safeStr(meta.date || meta.call_date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    const pm = safeStr(meta.prepared_by || meta.pm || 'Program Manager');
    const call_type = safeStr(meta.call_type || 'Weekly Sync');
    const audience = safeStr(meta.audience || '');
    const presenter = safeStr(meta.presenter_role || meta.presenter || 'Program Manager');

    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    const noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    const noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp() { return new Paragraph({ spacing: { before: 160, after: 0 }, children: [] }); }
    function divider() {
        return new Paragraph({
            spacing: { before: 80, after: 80 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, children: []
        });
    }
    function para(t, bold, color, size) {
        return new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: 'Arial' })]
        });
    }
    function h2(t, color) {
        return new Paragraph({
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.BLUE, size: 28, font: 'Arial' })]
        });
    }
    function hdrCell(t, bg, tc, w) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: 'Arial' })] })]
        });
    }
    function dataCell(t, bg, tc, w, bold) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: 'Arial' })] })]
        });
    }
    function statusCell(t, w) {
        const s = (t || '').toLowerCase();
        let bg, tc;
        if (s.includes('progress') || s.includes('wip')) { bg = C.LIGHT_BLUE; tc = C.BLUE; }
        else if (s.includes('test') || s.includes('qa')) { bg = C.LIGHT_AMBER; tc = C.AMBER; }
        else if (s.includes('prod')) { bg = C.LIGHT_GREEN; tc = C.GREEN; }
        else { bg = C.LIGHT_GRAY; tc = C.GRAY; }
        return dataCell(t, bg, tc, w, true);
    }

    function buildTopicNodes(t, idx) {
        const nodes = [];
        nodes.push(h2('TOPIC ' + (idx + 1) + ' — ' + safeStr(t.title || ('Topic ' + (idx + 1))), C.NAVY));
        nodes.push(sp());

        if (t.say_this) {
            nodes.push(new Table({
                width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                    new TableRow({
                        children: [new TableCell({
                            borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.GREEN }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.GREEN }, right: bdr },
                            shading: { fill: C.LIGHT_GREEN, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                            margins: { top: 160, bottom: 160, left: 220, right: 220 },
                            children: [
                                new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'SAY THIS:', bold: true, color: C.GREEN, size: 18, font: 'Arial' })] }),
                                para(t.say_this, false, C.GRAY, 19)
                            ]
                        })]
                    })
                ]
            }));
            nodes.push(sp());
        }

        if ((t.tasks || []).length) {
            nodes.push(new Table({
                width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 1100, 1500, 3500, 1960], rows: [
                    new TableRow({
                        children: [
                            hdrCell('Task #', C.BLUE, C.WHITE, 1300), hdrCell('Type', C.BLUE, C.WHITE, 1100),
                            hdrCell('Assigned To', C.BLUE, C.WHITE, 1500), hdrCell('Description', C.BLUE, C.WHITE, 3500),
                            hdrCell('State', C.BLUE, C.WHITE, 1960)
                        ]
                    }),
                    ...t.tasks.map((tk, i) => new TableRow({
                        children: [
                            dataCell(tk.num || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.BLUE, 1300, true),
                            dataCell(tk.type || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1100),
                            dataCell(tk.assignee || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1500),
                            dataCell(tk.title || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3500),
                            statusCell(tk.state || '', 1960)
                        ]
                    }))
                ]
            }));
            nodes.push(sp());
        }

        if ((t.qa_pairs || []).length) {
            nodes.push(new Paragraph({
                spacing: { before: 120, after: 80 },
                children: [new TextRun({ text: 'IF THEY ASK:', bold: true, color: C.AMBER, size: 19, font: 'Arial' })]
            }));
            nodes.push(new Table({
                width: { size: 9360, type: WidthType.DXA }, columnWidths: [4500, 4860], rows: [
                    new TableRow({ children: [hdrCell('Question', C.AMBER, C.WHITE, 4500), hdrCell('Quick Answer', C.AMBER, C.WHITE, 4860)] }),
                    ...t.qa_pairs.map((q, i) => new TableRow({
                        children: [
                            dataCell(q.question || '', i % 2 ? C.WHITE : 'F9FAFB', C.NAVY, 4500, true),
                            dataCell(q.answer || '', i % 2 ? C.WHITE : 'F9FAFB', C.GRAY, 4860)
                        ]
                    }))
                ]
            }));
            nodes.push(sp());
        }

        if (t.technical_notes) {
            nodes.push(new Table({
                width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                    new TableRow({
                        children: [new TableCell({
                            borders: { top: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, right: bdr },
                            shading: { fill: C.LIGHT_GRAY, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                            margins: { top: 140, bottom: 140, left: 220, right: 220 },
                            children: [
                                new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'TECHNICAL NOTES (FOR YOUR EYES ONLY):', bold: true, color: C.GRAY, size: 16, font: 'Arial' })] }),
                                para(t.technical_notes, false, '6E7681', 18)
                            ]
                        })]
                    })
                ]
            }));
            nodes.push(sp());
        }

        nodes.push(divider());
        return nodes;
    }

    const allTopicNodes = topics.flatMap((t, i) => buildTopicNodes(t, i));
    const closingNodes = data.closing_statement ? [
        sp(),
        new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.TEAL }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.TEAL }, right: bdr },
                        shading: { fill: C.LIGHT_TEAL, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                        margins: { top: 160, bottom: 160, left: 220, right: 220 },
                        children: [
                            new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'CLOSING:', bold: true, color: C.TEAL, size: 18, font: 'Arial' })] }),
                            para(data.closing_statement, false, C.GRAY, 19)
                        ]
                    })]
                })
            ]
        })
    ] : [];

    const doc = new Document({
        styles: { default: { document: { run: { font: 'Arial', size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } },
                            spacing: { before: 0, after: 120 },
                            tabStops: [{ type: TabStopType.RIGHT, position: 8640 }],
                            children: [
                                new TextRun({ text: account + ' - ' + call_type, bold: true, color: C.NAVY, size: 18, font: 'Arial' }),
                                new TextRun({ text: '\t' + call_date, color: C.GRAY, size: 18, font: 'Arial' })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } },
                            spacing: { before: 80 },
                            children: [new TextRun({ text: account + ' | Call Script | Confidential', color: C.GRAY, size: 16, font: 'Arial' })]
                        })
                    ]
                })
            },
            children: [
                new Table({
                    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                        new TableRow({
                            children: [new TableCell({
                                borders: noBdrs, shading: { fill: C.NAVY, type: ShadingType.CLEAR },
                                width: { size: 9360, type: WidthType.DXA }, margins: { top: 360, bottom: 360, left: 360, right: 360 },
                                children: [
                                    new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'CLIENT UPDATE CALL SCRIPT', bold: true, color: C.WHITE, size: 48, font: 'Arial' })] }),
                                    new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: call_date + '   |   ' + audience, color: 'AECBF0', size: 22, font: 'Arial' })] }),
                                    new Paragraph({ children: [new TextRun({ text: 'Prepared by: ' + pm, color: 'C0D8F5', size: 20, font: 'Arial' })] })
                                ]
                            })]
                        })
                    ]
                }),
                sp(),
                new Table({
                    width: { size: 9360, type: WidthType.DXA }, columnWidths: [1800, 7560], rows: [
                        new TableRow({ children: [hdrCell('Field', C.NAVY, C.WHITE, 1800), hdrCell('Detail', C.NAVY, C.WHITE, 7560)] }),
                        new TableRow({ children: [dataCell('Client', 'F8FAFC', C.NAVY, 1800, true), dataCell(account, 'F8FAFC', C.GRAY, 7560)] }),
                        new TableRow({ children: [dataCell('Call Type', C.WHITE, C.NAVY, 1800, true), dataCell(call_type, C.WHITE, C.GRAY, 7560)] }),
                        new TableRow({ children: [dataCell('Date', 'F8FAFC', C.NAVY, 1800, true), dataCell(call_date, 'F8FAFC', C.GRAY, 7560)] }),
                        new TableRow({ children: [dataCell('Prepared By', C.WHITE, C.NAVY, 1800, true), dataCell(pm, C.WHITE, C.GRAY, 7560)] }),
                        new TableRow({ children: [dataCell('Presenter Role', 'F8FAFC', C.NAVY, 1800, true), dataCell(presenter, 'F8FAFC', C.GRAY, 7560)] }),
                        new TableRow({ children: [dataCell('Audience', C.WHITE, C.NAVY, 1800, true), dataCell(audience, C.WHITE, C.GRAY, 7560)] })
                    ]
                }),
                sp(), divider(),
                ...allTopicNodes,
                ...closingNodes,
                sp(),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: account + ' - ' + call_type + '  |  ' + call_date + '  |  Prepared by ' + pm, color: C.MGRAY, size: 16, font: 'Arial', italics: true })]
                })
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    const date_str = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(/ /g, '').replace(',', '_');
    const safe_acct = account.replace(/\s+/g, '_');
    return { blob, filename: safe_acct + '_Call_Script_' + date_str + '.docx' };
}

// ── Status Report Generator ──────────────────────────────────────────────────
async function generateStatusReport(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType,
        Header, Footer, TabStopType } = getDocx();

    const C = docxColors();
    const meta = data.meta || {};
    const account = safeStr(meta.account || 'DevShop');
    const week_of = safeStr(meta.week_of || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    const pm = safeStr(meta.pm || 'Program Manager');
    const org = safeStr(meta.org || '');
    const m = data.metrics || {};

    const incidents = data.incidents || [];
    const stories = data.stories || [];
    const s_prod = stories.filter(s => s.phase === 'PROD');
    const s_test = stories.filter(s => s.phase === 'TEST');
    const s_wip = stories.filter(s => s.phase === 'WIP');
    const s_enhc = stories.filter(s => s.phase === 'ENHC');
    const s_other = stories.filter(s => !['PROD', 'TEST', 'WIP', 'ENHC'].includes(s.phase));
    const uat = data.uat_backlog || [];
    const blockers = data.blockers || [];
    const actions = data.action_items || [];
    const team = data.team || [];
    const fi = data.focus_item || {};
    const focusItems = Array.isArray(data.focus_items) ? data.focus_items : fi.title ? [fi] : [];

    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    const noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    const noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp() { return new Paragraph({ spacing: { before: 160, after: 0 }, children: [] }); }
    function divider() {
        return new Paragraph({
            spacing: { before: 80, after: 80 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, children: []
        });
    }
    function h2(t, color) {
        return new Paragraph({
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.BLUE, size: 28, font: 'Arial' })]
        });
    }
    function para(t, bold, color, size) {
        return new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: 'Arial' })]
        });
    }
    function bullet(t) {
        return new Paragraph({
            bullet: { level: 0 }, spacing: { before: 40, after: 40 },
            children: [new TextRun({ text: safeStr(t), color: C.GRAY, size: 19, font: 'Arial' })]
        });
    }
    function hdrCell(t, bg, tc, w) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: 'Arial' })] })]
        });
    }
    function dataCell(t, bg, tc, w, bold) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: 'Arial' })] })]
        });
    }
    function statusCell(t, w) {
        const s = (t || '').toLowerCase();
        let bg, tc;
        if (s.includes('progress') || s.includes('wip')) { bg = C.LIGHT_BLUE; tc = C.BLUE; }
        else if (s.includes('test') || s.includes('qa')) { bg = C.LIGHT_AMBER; tc = C.AMBER; }
        else if (s.includes('prod')) { bg = C.LIGHT_GREEN; tc = C.GREEN; }
        else if (s === 'open') { bg = 'FED7AA'; tc = 'C2410C'; }
        else { bg = C.LIGHT_GRAY; tc = C.GRAY; }
        return dataCell(t, bg, tc, w, true);
    }
    function pcol(p) {
        return (p && (p.includes('1 - Critical') || p.includes('2 - High'))) ? C.RED : C.GRAY;
    }

    function incRows() {
        if (!incidents.length) return [new TableRow({ children: [dataCell('No incidents', C.WHITE, C.GRAY, 9360)] })];
        return incidents.map((inc, i) => new TableRow({
            children: [
                dataCell(inc.num || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.BLUE, 1200, true),
                dataCell(inc.title || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2400),
                dataCell(inc.assignee || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1000),
                statusCell(inc.state || '', 1200),
                dataCell(inc.priority || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, pcol(inc.priority), 800),
                dataCell(inc.note || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2760)
            ]
        }));
    }
    function storyRows(items) {
        if (!items.length) return [new TableRow({ children: [dataCell('None', C.WHITE, C.GRAY, 9360)] })];
        return items.map((s, i) => new TableRow({
            children: [
                dataCell(s.num || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.TEAL, 1300, true),
                dataCell(s.title || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3500),
                dataCell(s.assignee || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1200),
                dataCell(s.priority || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, pcol(s.priority), 1200),
                statusCell(s.state || '', 2160)
            ]
        }));
    }

    const children = [];

    // Cover
    children.push(new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
            new TableRow({
                children: [new TableCell({
                    borders: noBdrs, shading: { fill: C.NAVY, type: ShadingType.CLEAR },
                    width: { size: 9360, type: WidthType.DXA }, margins: { top: 360, bottom: 360, left: 360, right: 360 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'DEVSHOP STATUS REPORT', bold: true, color: C.WHITE, size: 48, font: 'Arial' })] }),
                        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: account + ' CSM Engagement   |   Week of ' + week_of, color: 'AECBF0', size: 22, font: 'Arial' })] }),
                        new Paragraph({ children: [new TextRun({ text: 'Prepared by: ' + pm, color: 'C0D8F5', size: 20, font: 'Arial' })] })
                    ]
                })]
            })
        ]
    }));
    children.push(sp());

    // Executive Summary
    children.push(h2('Executive Summary', C.NAVY));
    children.push(para(data.executive_summary || '', false, C.GRAY, 20));
    children.push(divider());

    // Metrics - colored 6-column dashboard matching desktop version
    if (Object.keys(m).length) {
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1560, 1560, 1560, 1560, 1560, 1560], rows: [
                new TableRow({
                    children: [
                        hdrCell('Total Tasks', C.NAVY, C.WHITE, 1560),
                        hdrCell('In Progress', C.BLUE, C.WHITE, 1560),
                        hdrCell('In Testing', C.TEAL, C.WHITE, 1560),
                        hdrCell('Ready for PROD', C.GREEN, C.WHITE, 1560),
                        hdrCell('On Hold', C.GRAY, C.WHITE, 1560),
                        hdrCell('Critical Priority', C.RED, C.WHITE, 1560)
                    ]
                }),
                new TableRow({
                    children: [
                        dataCell(String(m.total_tasks || 0), C.LIGHT_BLUE, C.NAVY, 1560, true),
                        dataCell(String(m.in_progress || 0), C.LIGHT_BLUE, C.BLUE, 1560, true),
                        dataCell(String(m.in_testing || 0), C.LIGHT_TEAL, C.TEAL, 1560, true),
                        dataCell(String(m.ready_for_prod || 0), C.LIGHT_GREEN, C.GREEN, 1560, true),
                        dataCell(String(m.on_hold || 0), C.LIGHT_GRAY, C.GRAY, 1560, true),
                        dataCell(String(m.critical_priority || 0), C.LIGHT_RED, C.RED, 1560, true)
                    ]
                })
            ]
        }));
        children.push(sp());
    }

    // Focus Items — supports bullets[], status, body; supports array via focus_items[]
    if (focusItems.length) {
        children.push(h2('Focus Item' + (focusItems.length > 1 ? 's' : ''), C.BLUE));
        focusItems.forEach(fitem => {
            const fiNodes = [];
            fiNodes.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(fitem.title || ''), bold: true, color: C.AMBER, size: 22, font: 'Arial' })] }));
            if (fitem.status) fiNodes.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'Status: ' + safeStr(fitem.status), bold: true, color: 'C2410C', size: 19, font: 'Arial' })] }));
            if (fitem.body) fiNodes.push(para(fitem.body, false, C.GRAY, 19));
            (fitem.bullets || []).forEach(b => fiNodes.push(new Paragraph({
                bullet: { level: 0 }, spacing: { before: 40, after: 40 },
                children: [new TextRun({ text: safeStr(b), color: C.GRAY, size: 19, font: 'Arial' })]
            })));
            children.push(new Table({
                width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                    new TableRow({
                        children: [new TableCell({
                            borders: { top: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, right: bdr },
                            shading: { fill: C.LIGHT_AMBER, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                            margins: { top: 160, bottom: 160, left: 220, right: 220 },
                            children: fiNodes
                        })]
                    })
                ]
            }));
            children.push(sp());
        });
    }

    // Process Note
    if (data.process_note) {
        children.push(h2('Process Update', C.BLUE));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, bottom: bdr, left: bdr, right: bdr },
                        shading: { fill: C.LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                        margins: { top: 120, bottom: 120, left: 200, right: 200 },
                        children: [para(data.process_note, false, C.GRAY, 19)]
                    })]
                })
            ]
        }));
        children.push(sp());
    }
    // Incidents
    children.push(divider());
    children.push(h2('Incidents', C.RED));
    children.push(new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 2400, 1000, 1200, 800, 2760], rows: [
            new TableRow({
                children: [
                    hdrCell('INC #', C.RED, C.WHITE, 1200), hdrCell('Title', C.RED, C.WHITE, 2400),
                    hdrCell('Assignee', C.RED, C.WHITE, 1000), hdrCell('State', C.RED, C.WHITE, 1200),
                    hdrCell('Priority', C.RED, C.WHITE, 800), hdrCell('Notes', C.RED, C.WHITE, 2760)
                ]
            }),
            ...incRows()
        ]
    }));
    children.push(sp());

    // Stories
    if (s_prod.length) {
        children.push(h2('Stories — PROD', C.GREEN));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 3500, 1200, 1200, 2160], rows: [
                new TableRow({ children: [hdrCell('Story', C.GREEN, C.WHITE, 1300), hdrCell('Title', C.GREEN, C.WHITE, 3500), hdrCell('Assignee', C.GREEN, C.WHITE, 1200), hdrCell('Priority', C.GREEN, C.WHITE, 1200), hdrCell('State', C.GREEN, C.WHITE, 2160)] }),
                ...storyRows(s_prod)
            ]
        }));
        children.push(sp());
    }
    if (s_test.length) {
        children.push(h2('Stories — TEST', C.TEAL));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 3500, 1200, 1200, 2160], rows: [
                new TableRow({ children: [hdrCell('Story', C.TEAL, C.WHITE, 1300), hdrCell('Title', C.TEAL, C.WHITE, 3500), hdrCell('Assignee', C.TEAL, C.WHITE, 1200), hdrCell('Priority', C.TEAL, C.WHITE, 1200), hdrCell('State', C.TEAL, C.WHITE, 2160)] }),
                ...storyRows(s_test)
            ]
        }));
        children.push(sp());
    }
    if (s_wip.length) {
        children.push(h2('Stories — In Progress', C.BLUE));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 3500, 1200, 1200, 2160], rows: [
                new TableRow({ children: [hdrCell('Story', C.BLUE, C.WHITE, 1300), hdrCell('Title', C.BLUE, C.WHITE, 3500), hdrCell('Assignee', C.BLUE, C.WHITE, 1200), hdrCell('Priority', C.BLUE, C.WHITE, 1200), hdrCell('State', C.BLUE, C.WHITE, 2160)] }),
                ...storyRows(s_wip)
            ]
        }));
        children.push(sp());
    }
    if (s_enhc.length) {
        children.push(h2('Enhancements', C.BLUE));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 3500, 1200, 1200, 2160], rows: [
                new TableRow({ children: [hdrCell('Story', C.BLUE, C.WHITE, 1300), hdrCell('Title', C.BLUE, C.WHITE, 3500), hdrCell('Assignee', C.BLUE, C.WHITE, 1200), hdrCell('Priority', C.BLUE, C.WHITE, 1200), hdrCell('State', C.BLUE, C.WHITE, 2160)] }),
                ...storyRows(s_enhc)
            ]
        }));
        children.push(sp());
    }
    if (s_other.length) {
        children.push(h2('Other Tasks', C.BLUE));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 3500, 1200, 1200, 2160], rows: [
                new TableRow({ children: [hdrCell('Task', C.BLUE, C.WHITE, 1300), hdrCell('Title', C.BLUE, C.WHITE, 3500), hdrCell('Assignee', C.BLUE, C.WHITE, 1200), hdrCell('Priority', C.BLUE, C.WHITE, 1200), hdrCell('State', C.BLUE, C.WHITE, 2160)] }),
                ...storyRows(s_other)
            ]
        }));
        children.push(sp());
    }

    // UAT Backlog
    if (uat.length) {
        children.push(divider());
        children.push(h2('UAT Backlog', C.AMBER));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, right: bdr },
                        shading: { fill: C.AMB_BG, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                        margins: { top: 160, bottom: 160, left: 220, right: 220 },
                        children: uat.map(item => bullet(item))
                    })]
                })
            ]
        }));
        children.push(sp());
    }

    // Blockers
    if (blockers.length) {
        children.push(divider());
        children.push(h2('Blockers & Risks', C.RED));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [3000, 3180, 3180], rows: [
                new TableRow({ children: [hdrCell('Blocker', C.RED, C.WHITE, 3000), hdrCell('Impact', C.RED, C.WHITE, 3180), hdrCell('Resolution', C.RED, C.WHITE, 3180)] }),
                ...blockers.map((b, i) => new TableRow({
                    children: [
                        dataCell(b.blocker || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3000),
                        dataCell(b.impact || '', C.LIGHT_AMBER, C.AMBER, 3180),
                        dataCell(b.resolution || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3180)
                    ]
                }))
            ]
        }));
        children.push(sp());
    }

    // Action Items
    if (actions.length) {
        children.push(divider());
        children.push(h2('Action Items', C.NAVY));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [2400, 3960, 1500, 1500], rows: [
                new TableRow({ children: [hdrCell('Owner', C.NAVY, C.WHITE, 2400), hdrCell('Action', C.NAVY, C.WHITE, 3960), hdrCell('Item', C.NAVY, C.WHITE, 1500), hdrCell('Due', C.NAVY, C.WHITE, 1500)] }),
                ...actions.map((a, i) => new TableRow({
                    children: [
                        dataCell(a.owner || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2400, true),
                        dataCell(a.action || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3960),
                        dataCell(a.item || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.BLUE, 1500),
                        dataCell(a.due || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1500)
                    ]
                }))
            ]
        }));
        children.push(sp());
    }

    // Team
    if (team.length) {
        children.push(divider());
        children.push(h2('Team Overview', C.NAVY));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [2520, 2520, 4320], rows: [
                new TableRow({ children: [hdrCell('Name', C.NAVY, C.WHITE, 2520), hdrCell('Role', C.NAVY, C.WHITE, 2520), hdrCell('Focus', C.NAVY, C.WHITE, 4320)] }),
                ...team.map((t, i) => new TableRow({
                    children: [
                        dataCell(t.name || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.NAVY, 2520, true),
                        dataCell(t.role || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2520),
                        dataCell(t.focus || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 4320)
                    ]
                }))
            ]
        }));
        children.push(sp());
    }

    children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Prepared by ' + pm + '  |  ' + account + ' CSM DevShop  |  ' + week_of, color: C.MGRAY, size: 16, font: 'Arial', italics: true })]
    }));

    const doc = new Document({
        styles: { default: { document: { run: { font: 'Arial', size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } },
                            spacing: { before: 0, after: 120 },
                            tabStops: [{ type: TabStopType.RIGHT, position: 8640 }],
                            children: [
                                new TextRun({ text: account + ' DevShop - Status Report', bold: true, color: C.NAVY, size: 18, font: 'Arial' }),
                                new TextRun({ text: '\tWeek of ' + week_of, color: C.GRAY, size: 18, font: 'Arial' })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } },
                            spacing: { before: 80 },
                            children: [new TextRun({ text: (org || account) + ' | Confidential', color: C.GRAY, size: 16, font: 'Arial' })]
                        })
                    ]
                })
            },
            children
        }]
    });

    const blob = await Packer.toBlob(doc);
    const date_str = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(/ /g, '').replace(',', '_');
    const safe_acct = account.replace(/\s+/g, '_');
    return { blob, filename: safe_acct + '_Status_Report_' + date_str + '.docx' };
}


// ── RCA Generator ────────────────────────────────────────────────────────────
async function generateRCA(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType,
        Header, Footer, TabStopType } = getDocx();

    const C = docxColors();
    const CW = 9360;
    const FONT = 'Arial';
    const incident = safeStr(data.incident || 'INC000000');
    const account = safeStr(data.account || '');
    const s = data.summary || {}; // fallback; primary fields come from root level

    const thinBdr = { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY };
    const cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };
    const noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    const noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp(before, after) { return new Paragraph({ spacing: { before: before || 0, after: after || 0 }, children: [] }); }
    function hrule(color) {
        return new Paragraph({
            spacing: { before: 40, after: 40 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: color || C.BLUE, space: 1 } }, children: []
        });
    }
    function secHead(num, title) {
        return new Paragraph({
            spacing: { before: 320, after: 120 }, children: [
                new TextRun({ text: num + '.  ', font: FONT, size: 26, bold: true, color: C.NAVY }),
                new TextRun({ text: title, font: FONT, size: 26, bold: true, color: C.BLUE })
            ]
        });
    }
    function bodyPara(text) {
        if (!text || !String(text).trim()) return null;
        return new Paragraph({
            spacing: { before: 80, after: 120 },
            children: [new TextRun({ text: safeStr(text).trim(), font: FONT, size: 20, color: C.GRAY })]
        });
    }
    function placeholder(msg) {
        return new Paragraph({
            spacing: { before: 80, after: 80 },
            children: [new TextRun({ text: '\u2014  ' + msg, font: FONT, size: 19, italics: true, color: C.PH_TXT })]
        });
    }
    function sumRow(label, value, shade) {
        return new TableRow({
            children: [
                new TableCell({
                    width: { size: 2520, type: WidthType.DXA }, shading: { fill: shade || C.NAVY, type: ShadingType.CLEAR },
                    borders: cellBdr, margins: { top: 100, bottom: 100, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: safeStr(label), font: FONT, size: 19, bold: true, color: C.WHITE })] })]
                }),
                new TableCell({
                    width: { size: 6840, type: WidthType.DXA }, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                    borders: cellBdr, margins: { top: 100, bottom: 100, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: safeStr(value || '\u2014'), font: FONT, size: 19, color: C.GRAY })] })]
                })
            ]
        });
    }
    function calloutBox(devName, items) {
        if (!items || !items.length) return null;
        return new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [
                new TableRow({
                    children: [new TableCell({
                        width: { size: CW, type: WidthType.DXA },
                        shading: { fill: C.AMB_BG, type: ShadingType.CLEAR },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD },
                            bottom: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD },
                            left: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD },
                            right: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD }
                        },
                        margins: { top: 160, bottom: 160, left: 200, right: 200 },
                        children: [
                            new Paragraph({
                                spacing: { before: 0, after: 120 }, children: [
                                    new TextRun({ text: 'ACTION REQUIRED', font: FONT, size: 20, bold: true, color: C.AMB_BD }),
                                    new TextRun({ text: devName ? ' \u2014 ' + devName : '', font: FONT, size: 20, bold: true, color: C.AMB_TXT })
                                ]
                            }),
                            ...items.map(item => new Paragraph({
                                spacing: { before: 60, after: 60 },
                                children: [new TextRun({ text: '\u2022 ' + safeStr(item || ''), font: FONT, size: 19, color: C.AMB_TXT })]
                            }))
                        ]
                    })]
                })
            ]
        });
    }

    const callouts = data.callouts || data.callout_boxes || []; // support both key names
    function getCallouts(sectionKey) {
        return callouts.filter(cb => cb.section === sectionKey).map(cb => calloutBox(cb.dev, cb.items)).filter(Boolean);
    }

    function buildSection(num, title, bodyText, sectionKey) {
        const nodes = [secHead(num, title)];
        const bp = bodyPara(bodyText);
        if (bp) nodes.push(bp);
        else nodes.push(placeholder('No content provided — verify with team before distributing'));
        nodes.push(...getCallouts(sectionKey));
        return nodes;
    }
    function buildListSection(num, title, arr, sectionKey) {
        const nodes = [secHead(num, title)];
        if ((arr || []).length) {
            arr.forEach((item, i) => {
                var clean = safeStr(item || '').replace(/^\d+\.\s*/, '');
                nodes.push(new Paragraph({
                    spacing: { before: 60, after: 60 },
                    children: [new TextRun({ text: (i + 1) + '. ' + clean, font: FONT, size: 20, color: C.GRAY })]
                }));
            });
        } else {
            nodes.push(placeholder('No items listed'));
        }
        nodes.push(...getCallouts(sectionKey));
        return nodes;
    }

    // Timeline: time + event columns always shown; actor + type shown only if present in data
    const tlHasActor = (data.timeline || []).some(e => e.actor);
    const tlHasType = (data.timeline || []).some(e => e.type);
    const tlCols = [2160, ...(tlHasActor ? [1800] : []), ...(tlHasType ? [1560] : [])];
    const tlEventW = CW - 2160 - (tlHasActor ? 1800 : 0) - (tlHasType ? 1560 : 0);
    const tlRows = (data.timeline || []).map((e, i) => {
        const shade = i % 2 ? C.WHITE : C.LGRAY;
        const cells = [
            new TableCell({
                width: { size: 2160, type: WidthType.DXA }, shading: { fill: shade, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: safeStr(e.time || ''), font: FONT, size: 17, color: C.GRAY })] })]
            }),
            new TableCell({
                width: { size: tlEventW, type: WidthType.DXA }, shading: { fill: shade, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: safeStr(e.event || ''), font: FONT, size: 18, color: C.GRAY })] })]
            }),
        ];
        if (tlHasActor) cells.push(new TableCell({
            width: { size: 1800, type: WidthType.DXA }, shading: { fill: shade, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(e.actor || ''), font: FONT, size: 18, color: C.GRAY })] })]
        }));
        if (tlHasType) cells.push(new TableCell({
            width: { size: 1560, type: WidthType.DXA }, shading: { fill: shade, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(e.type || ''), font: FONT, size: 18, color: C.GRAY })] })]
        }));
        return new TableRow({ children: cells });
    });

    const freeCallouts = callouts.map(cb => calloutBox(cb.dev, cb.items)).filter(Boolean); // all callouts rendered together

    const children = [
        // Title cover
        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'ROOT CAUSE ANALYSIS', font: FONT, size: 52, bold: true, color: C.NAVY })] }),
        new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: incident + (account ? ' \u2014 ' + account : ''), font: FONT, size: 26, color: C.BLUE })] }),
        hrule(C.NAVY),
        sp(160, 0),

        // Summary table - supports root-level fields (AI prompt schema) and nested summary object
        new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [2520, 6840], rows: [
                sumRow('Incident', data.incident || s.incident || ''),
                sumRow('Title', data.title || s.title || ''),
                sumRow('Story', data.story || s.story || ''),
                sumRow('Change Record', data.change || s.change || ''),
                sumRow('Status', data.status || s.status || ''),
                sumRow('Date Reported', s.date_reported || ''),
                sumRow('Date Resolved', data.fix_date || s.date_resolved || ''),
                sumRow('Severity', s.severity || ''),
                sumRow('Affected System', s.affected_system || ''),
                sumRow('Reported By', data.reported_by || s.reported_by || ''),
                sumRow('Resolved By', data.developer || s.resolved_by || ''),
                sumRow('Root Cause Category', s.root_cause_category || ''),
                sumRow('Downtime', s.downtime || ''),
                sumRow('Impact Summary', s.impact_summary || ''),
            ]
        }),
        sp(200, 0),

        ...buildSection('1', 'Incident Overview', data.s1, 's1'),
        ...buildSection('2', 'Root Cause Analysis', data.s2, 's2'),
        ...buildSection('3', 'Impact Assessment', data.s3, 's3'),
        ...buildSection('4', 'Resolution', data.s4, 's4'),
        ...buildSection('5', 'Contributing Factors', data.s5, 's5'),
        ...buildListSection('6', 'Immediate Actions Taken', data.s6, 's6'),
        ...buildListSection('7', 'Corrective Actions / Recommendations', data.s7, 's7'),
        ...buildListSection('8', 'Open Questions', data.s8, 's8'),
    ];

    // Timeline section - dynamic columns based on what fields are present
    if (tlRows.length) {
        children.push(secHead('9', 'Incident Timeline'));
        const tlHdrCells = [
            new TableCell({
                width: { size: 2160, type: WidthType.DXA }, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Time', font: FONT, size: 19, bold: true, color: C.WHITE })] })]
            }),
            new TableCell({
                width: { size: tlEventW, type: WidthType.DXA }, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Event', font: FONT, size: 19, bold: true, color: C.WHITE })] })]
            }),
        ];
        if (tlHasActor) tlHdrCells.push(new TableCell({
            width: { size: 1800, type: WidthType.DXA }, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: 'Actor', font: FONT, size: 19, bold: true, color: C.WHITE })] })]
        }));
        if (tlHasType) tlHdrCells.push(new TableCell({
            width: { size: 1560, type: WidthType.DXA }, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: 'Type', font: FONT, size: 19, bold: true, color: C.WHITE })] })]
        }));
        const tlAllCols = [2160, tlEventW, ...(tlHasActor ? [1800] : []), ...(tlHasType ? [1560] : [])];
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: tlAllCols, rows: [
                new TableRow({ children: tlHdrCells }),
                ...tlRows
            ]
        }));
        children.push(sp(120, 0));
    }

    // Free callouts
    if (freeCallouts.length) {
        freeCallouts.forEach(cb => { children.push(cb); children.push(sp(80, 0)); });
    }

    // Doc notes
    if (data.s10) {
        children.push(hrule(C.MGRAY));
        children.push(secHead('10', 'Document Notes'));
        const bp = bodyPara(data.s10);
        if (bp) children.push(bp);
    }

    // Distribution amber warning
    children.push(sp(200, 0));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [
            new TableRow({
                children: [new TableCell({
                    shading: { fill: C.AMB_BG, type: ShadingType.CLEAR },
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.AMB_BD }, bottom: { style: BorderStyle.SINGLE, size: 8, color: C.AMB_BD }, left: { style: BorderStyle.SINGLE, size: 8, color: C.AMB_BD }, right: { style: BorderStyle.SINGLE, size: 8, color: C.AMB_BD } },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'DISTRIBUTION & CONFIDENTIALITY NOTICE', font: FONT, size: 18, bold: true, color: C.AMB_TXT })] }),
                        new Paragraph({ children: [new TextRun({ text: 'This document contains confidential incident information. Distribute only to approved stakeholders.', font: FONT, size: 18, color: C.AMB_TXT })] })
                    ]
                })]
            })
        ]
    }));

    const doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } },
                            spacing: { before: 0, after: 120 },
                            tabStops: [{ type: TabStopType.RIGHT, position: 8640 }],
                            children: [
                                new TextRun({ text: 'CONFIDENTIAL | Root Cause Analysis' + (account ? ' | ' + account : ''), bold: true, color: C.NAVY, size: 18, font: FONT }),
                                new TextRun({ text: '\t' + incident, color: C.GRAY, size: 18, font: FONT })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } },
                            spacing: { before: 80 },
                            children: [new TextRun({ text: 'Root Cause Analysis' + (account ? ' | ' + account : '') + (incident ? ' | ' + incident : ''), color: C.GRAY, size: 16, font: FONT })]
                        })
                    ]
                })
            },
            children
        }]
    });

    const blob = await Packer.toBlob(doc);
    const safe_inc = incident.replace(/\s+/g, '_');
    const safe_acct = account.replace(/\s+/g, '_');
    return { blob, filename: 'RCA_' + safe_inc + (safe_acct ? '_' + safe_acct : '') + '.docx' };
}

// ════════════════════════════════════════════════════
//  BLOCKER BRIEF DOCX GENERATOR
// ════════════════════════════════════════════════════
async function generateBlockerBrief(data) {
    var D = getDocx();
    var Document = D.Document, Packer = D.Packer, Paragraph = D.Paragraph, TextRun = D.TextRun,
        Table = D.Table, TableRow = D.TableRow, TableCell = D.TableCell,
        AlignmentType = D.AlignmentType, BorderStyle = D.BorderStyle,
        WidthType = D.WidthType, ShadingType = D.ShadingType, Header = D.Header, Footer = D.Footer, TabStopType = D.TabStopType;
    var C = docxColors(); var CW = 9360; var FONT = 'Arial';
    var thinBdr = { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY };
    var cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };
    var bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    var borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    var noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    var noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp(b, a) { return new Paragraph({ spacing: { before: b || 0, after: a || 0 }, children: [] }); }
    function divider() { return new Paragraph({ spacing: { before: 80, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, children: [] }); }
    function h2(t, color) { return new Paragraph({ spacing: { before: 240, after: 120 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.BLUE, size: 26, font: FONT })] }); }
    function para(t, bold, color, size) { return new Paragraph({ spacing: { before: 60, after: 80 }, children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })] }); }
    function hdrCell(t, bg, tc, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }
    function calloutBox(label, body, bdColor, bgColor) {
        return new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    width: { size: CW, type: WidthType.DXA },
                    shading: { fill: bgColor, type: ShadingType.CLEAR },
                    borders: { top: { style: BorderStyle.SINGLE, size: 10, color: bdColor }, bottom: { style: BorderStyle.SINGLE, size: 4, color: bdColor }, left: { style: BorderStyle.SINGLE, size: 10, color: bdColor }, right: { style: BorderStyle.SINGLE, size: 4, color: bdColor } },
                    margins: { top: 140, bottom: 140, left: 200, right: 200 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(label), bold: true, color: bdColor, size: 18, font: FONT })] }),
                        para(body, false, C.GRAY, 19)
                    ]
                })]
            })],
        });
    }
    function listPara(text, i) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: (i + 1) + '. ' + safeStr(text).replace(/^\d+\.\s*/, ''), font: FONT, size: 19, color: C.GRAY })] }); }

    var statusColorMap = { 'Open': C.RED, 'Under Investigation': C.AMBER, 'Partially Resolved': C.TEAL, 'Resolved': C.GREEN, 'Deferred': C.GRAY };
    var statusBgMap = { 'Open': C.LIGHT_RED, 'Under Investigation': C.LIGHT_AMBER, 'Partially Resolved': C.LIGHT_TEAL, 'Resolved': C.LIGHT_GREEN, 'Deferred': C.LIGHT_GRAY };
    var st = data.status || 'Open';
    var stColor = statusColorMap[st] || C.GRAY;
    var stBg = statusBgMap[st] || C.LIGHT_GRAY;

    var children = [];

    // Cover
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
            children: [new TableCell({
                borders: noBdrs, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 320, bottom: 320, left: 360, right: 360 },
                children: [
                    new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'BLOCKER EVALUATION BRIEF', bold: true, color: C.WHITE, size: 44, font: FONT })] }),
                    new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 ' + safeStr(data.date || ''), color: 'AECBF0', size: 22, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: 'Task: ' + safeStr(data.task_num || '') + ' | Prepared by: ' + safeStr(data.pm || ''), color: 'C0D8F5', size: 19, font: FONT })] })
                ]
            })]
        })]
    }));
    children.push(sp(160, 0));

    // Status banner
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [1800, 7560], rows: [new TableRow({
            children: [
                new TableCell({
                    width: { size: 1800, type: WidthType.DXA }, shading: { fill: stColor, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: safeStr(st), bold: true, color: C.WHITE, size: 22, font: FONT })] })]
                }),
                new TableCell({
                    width: { size: 7560, type: WidthType.DXA }, shading: { fill: stBg, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: safeStr(data.title || ''), bold: true, color: stColor, size: 20, font: FONT })] })]
                })
            ]
        })]
    }));
    children.push(sp(120, 0));

    if (data.summary) { children.push(h2('Summary', C.NAVY)); children.push(para(data.summary, false, C.GRAY, 20)); children.push(divider()); }
    if (data.blocker_description) { children.push(h2('Blocker Description', C.NAVY)); children.push(para(data.blocker_description, false, C.GRAY, 19)); children.push(sp(80, 0)); }
    if (data.impact) { children.push(divider()); children.push(h2('Impact', C.RED)); children.push(calloutBox('Impact', data.impact, 'F59E0B', C.LIGHT_AMBER)); children.push(sp(80, 0)); }
    if (data.investigation) { children.push(divider()); children.push(h2('Investigation', C.BLUE)); children.push(para(data.investigation, false, C.GRAY, 19)); children.push(sp(80, 0)); }
    if (data.root_cause) { children.push(divider()); children.push(h2('Root Cause', C.NAVY)); children.push(calloutBox('Root Cause', data.root_cause, C.AMBER, C.LIGHT_AMBER)); children.push(sp(80, 0)); }

    var solutions = data.proposed_solutions || [];
    if (solutions.length) {
        children.push(divider()); children.push(h2('Proposed Solutions', C.BLUE));
        solutions.forEach(function (s, i) {
            var sc = s.status === 'Completed' ? C.GREEN : s.status === 'Rejected' ? C.RED : C.BLUE;
            var sb = s.status === 'Completed' ? C.LIGHT_GREEN : s.status === 'Rejected' ? C.LIGHT_RED : C.LIGHT_BLUE;
            children.push(new Table({
                width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                    children: [new TableCell({
                        width: { size: CW, type: WidthType.DXA }, shading: { fill: sb, type: ShadingType.CLEAR },
                        borders: { top: { style: BorderStyle.SINGLE, size: 6, color: sc }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 6, color: sc }, right: bdr },
                        margins: { top: 120, bottom: 120, left: 180, right: 180 },
                        children: [
                            new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: (i + 1) + '. ' + safeStr(s.option || ''), bold: true, color: sc, size: 20, font: FONT }), new TextRun({ text: '  |  Effort: ' + safeStr(s.effort || '') + '  |  Risk: ' + safeStr(s.risk || '') + '  |  ' + safeStr(s.status || ''), color: C.GRAY, size: 17, font: FONT })] }),
                            para(s.description || '', false, C.GRAY, 19),
                            ...(s.outcome ? [para('Outcome: ' + s.outcome, true, sc, 18)] : [])
                        ]
                    })]
                })]
            }));
            children.push(sp(60, 0));
        });
    }

    if (data.resolution) { children.push(divider()); children.push(h2('Resolution', C.GREEN)); children.push(calloutBox('Resolution Applied', data.resolution, C.GREEN, C.LIGHT_GREEN)); children.push(sp(80, 0)); }

    var ns = data.next_steps || [];
    if (ns.length) {
        children.push(divider()); children.push(h2('Next Steps', C.NAVY));
        ns.forEach(function (s, i) { children.push(listPara(String(s), i)); });
        children.push(sp(80, 0));
    }

    var oq = data.open_questions || [];
    if (oq.length) {
        children.push(divider()); children.push(h2('Open Questions', C.AMBER));
        oq.forEach(function (q, i) { children.push(listPara(String(q), i)); });
        children.push(sp(80, 0));
    }

    if (data.technical_context) {
        children.push(divider()); children.push(h2('Technical Context', C.GRAY));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, right: bdr },
                    shading: { fill: C.LIGHT_GRAY, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 200, right: 200 },
                    children: [new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'FOR DEVELOPER — INTERNAL', bold: true, color: C.GRAY, size: 16, font: FONT })] }), para(data.technical_context, false, '6E7681', 18)]
                })]
            })]
        }));
        children.push(sp(80, 0));
    }

    if (data.client_communication) { children.push(divider()); children.push(h2('Client Communication', C.BLUE)); children.push(para(data.client_communication, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    var callouts = data.callouts || [];
    callouts.forEach(function (cb) {
        children.push(sp(80, 0));
        var items = (cb.items || []).map(function (item) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '\u2022 ' + safeStr(item), font: FONT, size: 19, color: C.AMB_TXT })] }); });
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: C.AMB_BG, type: ShadingType.CLEAR },
                    borders: { top: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, bottom: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD }, left: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, right: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD } },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: 'ACTION REQUIRED \u2014 ' + safeStr(cb.dev || ''), font: FONT, size: 20, bold: true, color: C.AMB_BD })] }), ...items]
                })]
            })]
        }));
    });

    children.push(sp(200, 0));
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 Blocker Brief \u2014 ' + safeStr(data.task_num || '') + ' \u2014 ' + safeStr(data.date || ''), color: C.MGRAY, size: 16, font: FONT, italics: true })] }));

    var doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } }, spacing: { before: 0, after: 120 }, tabStops: [{ type: TabStopType.RIGHT, position: 8640 }], children: [new TextRun({ text: 'BLOCKER EVALUATION BRIEF \u2014 ' + safeStr(data.account || ''), bold: true, color: C.NAVY, size: 18, font: FONT }), new TextRun({ text: '\t' + safeStr(data.task_num || ''), color: C.GRAY, size: 18, font: FONT })] })] }) },
            footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, spacing: { before: 80 }, children: [new TextRun({ text: safeStr(data.account || '') + ' | Blocker Brief | Confidential', color: C.GRAY, size: 16, font: FONT })] })] }) },
            children: children
        }]
    });
    var blob = await Packer.toBlob(doc);
    var safe = (data.account || 'Account').replace(/\s+/g, '_');
    var num = (data.task_num || 'Blocker').replace(/\s+/g, '_');
    return { blob: blob, filename: safe + '_Blocker_Brief_' + num + '.docx' };
}

// ════════════════════════════════════════════════════
//  TECHNICAL APPROACH DOCX GENERATOR
// ════════════════════════════════════════════════════
async function generateTechApproach(data) {
    var D = getDocx();
    var Document = D.Document, Packer = D.Packer, Paragraph = D.Paragraph, TextRun = D.TextRun,
        Table = D.Table, TableRow = D.TableRow, TableCell = D.TableCell,
        AlignmentType = D.AlignmentType, BorderStyle = D.BorderStyle,
        WidthType = D.WidthType, ShadingType = D.ShadingType, Header = D.Header, Footer = D.Footer, TabStopType = D.TabStopType;
    var C = docxColors(); var CW = 9360; var FONT = 'Arial';
    var thinBdr = { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY };
    var cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };
    var bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    var borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    var noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    var noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp(b, a) { return new Paragraph({ spacing: { before: b || 0, after: a || 0 }, children: [] }); }
    function divider() { return new Paragraph({ spacing: { before: 80, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, children: [] }); }
    function h2(t, color) { return new Paragraph({ spacing: { before: 280, after: 120 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.NAVY, size: 28, font: FONT })] }); }
    function h3(t, color) { return new Paragraph({ spacing: { before: 180, after: 80 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.BLUE, size: 22, font: FONT })] }); }
    function para(t, bold, color, size) { return new Paragraph({ spacing: { before: 60, after: 80 }, children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })] }); }
    function hdrCell(t, bg, tc, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }
    function listPara(text, i) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: (i + 1) + '. ' + safeStr(text).replace(/^\d+\.\s*/, ''), font: FONT, size: 19, color: C.GRAY })] }); }
    function bulletPara(text) { return new Paragraph({ spacing: { before: 40, after: 40 }, bullet: { level: 0 }, children: [new TextRun({ text: safeStr(text), font: FONT, size: 19, color: C.GRAY })] }); }

    var sc = data.scope || {};
    var ts = data.technical_spec || {};
    var tl = data.timeline || {};
    var children = [];

    // Cover
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
            children: [new TableCell({
                borders: noBdrs, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 360, bottom: 360, left: 360, right: 360 },
                children: [
                    new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'TECHNICAL APPROACH DOCUMENT', bold: true, color: C.WHITE, size: 44, font: FONT })] }),
                    new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(data.title || ''), color: 'AECBF0', size: 24, font: FONT })] }),
                    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 ' + safeStr(data.date || '') + ' \u2014 ' + safeStr(data.version || 'v1.0'), color: 'AECBF0', size: 20, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: 'Prepared by: ' + safeStr(data.prepared_by || '') + ' | Developer: ' + safeStr(data.developer || '') + ' | Task: ' + safeStr(data.task_num || ''), color: 'C0D8F5', size: 19, font: FONT })] })
                ]
            })]
        })]
    }));
    children.push(sp(160, 0));

    // Approvals table
    var approvals = data.approvals || [];
    if (approvals.length) {
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [3120, 3120, 1560, 1560], rows: [
                new TableRow({ children: [hdrCell('Approver', C.NAVY, C.WHITE, 3120), hdrCell('Role', C.NAVY, C.WHITE, 3120), hdrCell('Status', C.NAVY, C.WHITE, 1560), hdrCell('Date', C.NAVY, C.WHITE, 1560)] }),
                ...approvals.map(function (a, i) {
                    var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY;
                    var sc2 = a.status === 'Approved' ? C.GREEN : a.status === 'Rejected' ? C.RED : C.GRAY;
                    return new TableRow({ children: [dataCell(a.name || '', bg, C.NAVY, 3120, true), dataCell(a.role || '', bg, C.GRAY, 3120), dataCell(a.status || 'Pending', bg, sc2, 1560, true), dataCell(a.date || '', bg, C.GRAY, 1560)] });
                })
            ]
        }));
        children.push(sp(120, 0));
    }

    children.push(divider());
    if (data.problem_statement) { children.push(h2('Problem Statement')); children.push(para(data.problem_statement, false, C.GRAY, 20)); children.push(sp(80, 0)); }
    if (data.objective) {
        children.push(divider()); children.push(h2('Objective'));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.TEAL }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.TEAL }, right: bdr },
                    shading: { fill: C.LIGHT_TEAL, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 200, right: 200 },
                    children: [para(data.objective, false, C.GRAY, 20)]
                })]
            })]
        })); children.push(sp(80, 0));
    }
    if (data.background) { children.push(divider()); children.push(h2('Background')); children.push(para(data.background, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    // Scope
    var hasScope = (sc.in_scope || []).length || (sc.out_of_scope || []).length || (sc.dependencies || []).length;
    if (hasScope) {
        children.push(divider()); children.push(h2('Scope'));
        var scopeW = Math.floor(CW / 3);
        var scopeRows = [new TableRow({ children: [hdrCell('In Scope', C.GREEN, C.WHITE, scopeW), hdrCell('Out of Scope', C.RED, C.WHITE, scopeW), hdrCell('Dependencies', C.BLUE, C.WHITE, scopeW)] })];
        var maxLen = Math.max((sc.in_scope || []).length, (sc.out_of_scope || []).length, (sc.dependencies || []).length);
        for (var ri = 0; ri < maxLen; ri++) {
            scopeRows.push(new TableRow({
                children: [
                    dataCell((sc.in_scope || [])[ri] || '', ri % 2 ? C.WHITE : C.LIGHT_GREEN, C.GREEN, scopeW),
                    dataCell((sc.out_of_scope || [])[ri] || '', ri % 2 ? C.WHITE : C.LIGHT_RED, C.RED, scopeW),
                    dataCell((sc.dependencies || [])[ri] || '', ri % 2 ? C.WHITE : C.LIGHT_BLUE, C.BLUE, scopeW)
                ]
            }));
        }
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [scopeW, scopeW, scopeW], rows: scopeRows }));
        children.push(sp(80, 0));
    }

    if (data.current_state) { children.push(divider()); children.push(h2('Current State')); children.push(para(data.current_state, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    if (data.proposed_solution) {
        children.push(divider()); children.push(h2('Proposed Solution'));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, right: bdr },
                    shading: { fill: C.LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 160, bottom: 160, left: 220, right: 220 },
                    children: [para(data.proposed_solution, false, C.GRAY, 20)]
                })]
            })]
        })); children.push(sp(80, 0));
    }

    // Technical Spec
    var comps = ts.components || [];
    if (comps.length) {
        children.push(divider()); children.push(h2('Technical Components'));
        var crows = [new TableRow({ children: [hdrCell('Type', C.NAVY, C.WHITE, 1800), hdrCell('Name', C.NAVY, C.WHITE, 2400), hdrCell('Table', C.NAVY, C.WHITE, 1800), hdrCell('Description', C.NAVY, C.WHITE, 2520), hdrCell('OOB?', C.NAVY, C.WHITE, 840)] })];
        comps.forEach(function (c, i) {
            var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY;
            crows.push(new TableRow({ children: [dataCell(c.type || '', bg, C.NAVY, 1800, true), dataCell(c.name || '', bg, C.GRAY, 2400), dataCell(c.table || '', bg, C.BLUE, 1800), dataCell(c.description || '', bg, C.GRAY, 2520), dataCell(c.is_oob || '', bg, C.GRAY, 840)] }));
        });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [1800, 2400, 1800, 2520, 840], rows: crows }));
        children.push(sp(80, 0));
    }
    if (ts.data_flow) { children.push(h3('Data Flow', C.NAVY)); children.push(para(ts.data_flow, false, C.GRAY, 19)); children.push(sp(60, 0)); }
    if (ts.roles_and_access) { children.push(h3('Roles & Access', C.NAVY)); children.push(para(ts.roles_and_access, false, C.GRAY, 19)); children.push(sp(60, 0)); }
    if (ts.known_constraints) {
        children.push(h3('Known Constraints', C.RED));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, right: bdr },
                    shading: { fill: C.LIGHT_AMBER, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [para(ts.known_constraints, false, C.AMBER, 18)]
                })]
            })]
        })); children.push(sp(80, 0));
    }

    var alts = data.alternatives_considered || [];
    if (alts.length) {
        children.push(divider()); children.push(h2('Alternatives Considered'));
        var arows = [new TableRow({ children: [hdrCell('Option', C.BLUE, C.WHITE, 2400), hdrCell('Description', C.BLUE, C.WHITE, 3960), hdrCell('Reason Rejected', C.BLUE, C.WHITE, 3000)] })];
        alts.forEach(function (a, i) {
            var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY;
            arows.push(new TableRow({ children: [dataCell(a.option || '', bg, C.NAVY, 2400, true), dataCell(a.description || '', bg, C.GRAY, 3960), dataCell(a.reason_rejected || '', bg, C.GRAY, 3000)] }));
        });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [2400, 3960, 3000], rows: arows })); children.push(sp(80, 0));
    }

    var ac = data.acceptance_criteria || [];
    if (ac.length) { children.push(divider()); children.push(h2('Acceptance Criteria')); ac.forEach(function (c, i) { children.push(listPara(c, i)); }); children.push(sp(80, 0)); }

    if (data.rollback_plan) { children.push(divider()); children.push(h2('Rollback Plan')); children.push(para(data.rollback_plan, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    if (tl.estimate || tl.target_prod) {
        children.push(divider()); children.push(h2('Timeline'));
        var tlPairs = [['Estimate', tl.estimate], ['Dev Start', tl.dev_start], ['Target TEST', tl.target_test], ['Target PROD', tl.target_prod], ['Notes', tl.notes]].filter(function (p) { return p[1]; });
        var tlRows = tlPairs.map(function (p, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; return new TableRow({ children: [dataCell(p[0], bg, C.NAVY, 2520, true), dataCell(p[1], bg, C.GRAY, 6840)] }); });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [2520, 6840], rows: tlRows })); children.push(sp(80, 0));
    }

    var oi = data.open_items || [];
    if (oi.length) {
        children.push(divider()); children.push(h2('Open Items'));
        var oiRows = [new TableRow({ children: [hdrCell('Item', C.RED, C.WHITE, 5760), hdrCell('Owner', C.RED, C.WHITE, 1800), hdrCell('Due', C.RED, C.WHITE, 1800)] })];
        oi.forEach(function (o, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; oiRows.push(new TableRow({ children: [dataCell(o.item || '', bg, C.GRAY, 5760), dataCell(o.owner || '', bg, C.NAVY, 1800, true), dataCell(o.due || '', bg, C.GRAY, 1800)] })); });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [5760, 1800, 1800], rows: oiRows })); children.push(sp(80, 0));
    }

    (data.callouts || []).forEach(function (cb) {
        children.push(sp(80, 0));
        var items = (cb.items || []).map(function (item) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '\u2022 ' + safeStr(item), font: FONT, size: 19, color: C.AMB_TXT })] }); });
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: C.AMB_BG, type: ShadingType.CLEAR },
                    borders: { top: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, bottom: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD }, left: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, right: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD } },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: 'ACTION REQUIRED \u2014 ' + safeStr(cb.dev || ''), font: FONT, size: 20, bold: true, color: C.AMB_BD })] }), ...items]
                })]
            })]
        }));
    });

    if (data.notes) { children.push(divider()); children.push(h2('Notes', C.GRAY)); children.push(para(data.notes, false, C.GRAY, 19)); }
    children.push(sp(200, 0));
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 Technical Approach \u2014 ' + safeStr(data.task_num || '') + ' \u2014 ' + safeStr(data.version || 'v1.0'), color: C.MGRAY, size: 16, font: FONT, italics: true })] }));

    var doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } }, spacing: { before: 0, after: 120 }, tabStops: [{ type: TabStopType.RIGHT, position: 8640 }], children: [new TextRun({ text: 'TECHNICAL APPROACH \u2014 ' + safeStr(data.account || ''), bold: true, color: C.NAVY, size: 18, font: FONT }), new TextRun({ text: '\t' + safeStr(data.task_num || ''), color: C.GRAY, size: 18, font: FONT })] })] }) },
            footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, spacing: { before: 80 }, children: [new TextRun({ text: safeStr(data.account || '') + ' | Technical Approach | ' + safeStr(data.status || 'Draft') + ' | Confidential', color: C.GRAY, size: 16, font: FONT })] })] }) },
            children: children
        }]
    });
    var blob = await Packer.toBlob(doc);
    var safe = (data.account || 'Account').replace(/\s+/g, '_');
    var num = (data.task_num || 'TAD').replace(/\s+/g, '_');
    return { blob: blob, filename: safe + '_Tech_Approach_' + num + '.docx' };
}

// ════════════════════════════════════════════════════
//  TASK BRIEF DOCX GENERATOR
// ════════════════════════════════════════════════════
async function generateTaskBrief(data) {
    var D = getDocx();
    var Document = D.Document, Packer = D.Packer, Paragraph = D.Paragraph, TextRun = D.TextRun,
        Table = D.Table, TableRow = D.TableRow, TableCell = D.TableCell,
        AlignmentType = D.AlignmentType, BorderStyle = D.BorderStyle,
        WidthType = D.WidthType, ShadingType = D.ShadingType, Header = D.Header, Footer = D.Footer, TabStopType = D.TabStopType;
    var C = docxColors(); var CW = 9360; var FONT = 'Arial';
    var thinBdr = { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY };
    var cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };
    var bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    var borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    var noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    var noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp(b, a) { return new Paragraph({ spacing: { before: b || 0, after: a || 0 }, children: [] }); }
    function divider() { return new Paragraph({ spacing: { before: 80, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, children: [] }); }
    function h2(t, color) { return new Paragraph({ spacing: { before: 240, after: 120 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.NAVY, size: 26, font: FONT })] }); }
    function para(t, bold, color, size) { return new Paragraph({ spacing: { before: 60, after: 80 }, children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })] }); }
    function hdrCell(t, bg, tc, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }
    function listPara(text, i) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: (i + 1) + '. ' + safeStr(String(text)).replace(/^\d+\.\s*/, ''), font: FONT, size: 19, color: C.GRAY })] }); }
    function bulletPara(text, color) { return new Paragraph({ spacing: { before: 40, after: 40 }, bullet: { level: 0 }, children: [new TextRun({ text: safeStr(text), font: FONT, size: 19, color: color || C.GRAY })] }); }

    var inv = data.investigation || {};
    var res = data.resolution || {};
    var td = data.technical_detail || {};
    var children = [];

    // Cover — teal gradient style
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
            children: [new TableCell({
                borders: noBdrs, shading: { fill: '1A4B5C', type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 320, bottom: 320, left: 360, right: 360 },
                children: [
                    new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'TASK BRIEF', bold: true, color: C.WHITE, size: 52, font: FONT })] }),
                    new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(data.task_num || '') + ' \u2014 ' + safeStr(data.task_type || 'Task') + ' \u2014 ' + safeStr(data.priority || ''), color: 'AECBF0', size: 22, font: FONT })] }),
                    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 Opened: ' + safeStr(data.opened_date || ''), color: 'AECBF0', size: 20, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: 'Assigned: ' + safeStr(data.assigned_to || '') + ' | PM: ' + safeStr(data.pm || '') + ' | Reported by: ' + safeStr(data.reported_by || ''), color: 'C0D8F5', size: 19, font: FONT })] })
                ]
            })]
        })]
    }));
    children.push(sp(120, 0));

    // Task info summary table
    var infoRows = [];
    var infoPairs = [['Task Number', data.task_num], ['Task Type', data.task_type], ['Title', data.title], ['Priority', data.priority], ['State', data.state], ['Environment', data.environment], ['Opened', data.opened_date], ['Target Date', data.target_date], ['Audience', data.audience]].filter(function (p) { return p[1]; });
    infoPairs.forEach(function (p, i) { infoRows.push(new TableRow({ children: [dataCell(p[0], 'F8FAFC', C.NAVY, 2520, true), dataCell(p[1], i % 2 ? C.WHITE : 'F8FAFC', C.GRAY, 6840)] })); });
    if (infoRows.length) { children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [2520, 6840], rows: infoRows })); children.push(sp(120, 0)); }

    if (data.summary) {
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, right: bdr },
                    shading: { fill: C.LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 200, right: 200 },
                    children: [new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'SUMMARY', bold: true, color: C.BLUE, size: 17, font: FONT })] }), para(data.summary, false, C.GRAY, 19)]
                })]
            })]
        })); children.push(sp(80, 0));
    }

    if (data.reported_behavior) { children.push(divider()); children.push(h2('Reported Behavior', C.NAVY)); children.push(para(data.reported_behavior, false, C.GRAY, 19)); children.push(sp(80, 0)); }
    if (data.expected_behavior) { children.push(h2('Expected Behavior', C.TEAL)); children.push(para(data.expected_behavior, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    if (data.impact) {
        children.push(divider()); children.push(h2('Impact', C.RED));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, right: bdr },
                    shading: { fill: C.LIGHT_AMBER, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [para(data.impact, false, C.AMBER, 19)]
                })]
            })]
        })); children.push(sp(80, 0));
    }

    // Investigation
    if (inv.summary || (inv.findings || []).length || inv.current_theory) {
        children.push(divider()); children.push(h2('Investigation', C.BLUE));
        if (inv.summary) { children.push(para(inv.summary, false, C.GRAY, 19)); children.push(sp(60, 0)); }
        if ((inv.findings || []).length) {
            children.push(new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: 'Findings', bold: true, color: C.NAVY, size: 20, font: FONT })] }));
            inv.findings.forEach(function (f) { children.push(bulletPara(f, C.GRAY)); });
            children.push(sp(60, 0));
        }
        if ((inv.ruled_out || []).length) {
            children.push(new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: 'Ruled Out', bold: true, color: C.GRAY, size: 20, font: FONT })] }));
            inv.ruled_out.forEach(function (r) { children.push(new Paragraph({ spacing: { before: 40, after: 40 }, bullet: { level: 0 }, children: [new TextRun({ text: safeStr(r), font: FONT, size: 19, color: '94A3B8' })] })); });
            children.push(sp(60, 0));
        }
        if (inv.current_theory) {
            children.push(new Table({
                width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, right: bdr },
                        shading: { fill: C.LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                        children: [new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'CURRENT THEORY', bold: true, color: C.BLUE, size: 17, font: FONT })] }), para(inv.current_theory, false, C.GRAY, 19)]
                    })]
                })]
            }));
        }
        children.push(sp(80, 0));
    }

    // Technical Detail - Components
    var comps = td.components_involved || [];
    if (comps.length) {
        children.push(divider()); children.push(h2('Technical Components', C.NAVY));
        var crows = [new TableRow({ children: [hdrCell('Type', C.NAVY, C.WHITE, 1800), hdrCell('Name', C.NAVY, C.WHITE, 2520), hdrCell('Table', C.NAVY, C.WHITE, 2160), hdrCell('Notes', C.NAVY, C.WHITE, 2880)] })];
        comps.forEach(function (c, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; crows.push(new TableRow({ children: [dataCell(c.type || '', bg, C.NAVY, 1800, true), dataCell(c.name || '', bg, C.GRAY, 2520), dataCell(c.table || '', bg, C.BLUE, 2160), dataCell(c.notes || '', bg, C.GRAY, 2880)] })); });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [1800, 2520, 2160, 2880], rows: crows })); children.push(sp(80, 0));
    }
    if (td.error_messages) {
        children.push(h2('Error Messages / Logs', C.GRAY));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: cellBdr, shading: { fill: '1E293B', type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [new Paragraph({ children: [new TextRun({ text: safeStr(td.error_messages), font: 'Courier New', size: 18, color: 'E2E8F0' })] })]
                })]
            })]
        })); children.push(sp(80, 0));
    }
    if (td.relevant_data) { children.push(h2('Relevant Data', C.GRAY)); children.push(para(td.relevant_data, false, C.GRAY, 19)); children.push(sp(60, 0)); }
    if (td.environment_notes) { children.push(h2('Environment Notes', C.GRAY)); children.push(para(td.environment_notes, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    // Proposed Approaches
    var approaches = data.proposed_approach || [];
    if (approaches.length) {
        children.push(divider()); children.push(h2('Proposed Approaches', C.BLUE));
        approaches.forEach(function (a, i) {
            var rec = a.recommended === 'Yes';
            var sc2 = rec ? C.GREEN : C.BLUE; var sb = rec ? C.LIGHT_GREEN : C.LIGHT_BLUE;
            children.push(new Table({
                width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: rec ? 10 : 6, color: sc2 }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: rec ? 10 : 6, color: sc2 }, right: bdr },
                        shading: { fill: sb, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                        children: [
                            new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: (i + 1) + '. ' + safeStr(a.option || '') + (rec ? ' \u2713 RECOMMENDED' : ''), bold: true, color: sc2, size: 20, font: FONT }), new TextRun({ text: '  Effort: ' + safeStr(a.effort || '') + '  |  Risk: ' + safeStr(a.risk || ''), color: C.GRAY, size: 17, font: FONT })] }),
                            para(a.description || '', false, C.GRAY, 19),
                            ...(a.reason ? [para(a.reason, false, C.GRAY, 18)] : [])
                        ]
                    })]
                })]
            })); children.push(sp(60, 0));
        });
    }

    // Resolution
    if (res.description || res.status) {
        children.push(divider()); children.push(h2('Resolution', res.status === 'Resolved' || res.status === 'Verified' ? C.GREEN : C.NAVY));
        var rb = res.status === 'Resolved' || res.status === 'Verified' ? C.LIGHT_GREEN : C.LIGHT_BLUE;
        var rc = res.status === 'Resolved' || res.status === 'Verified' ? C.GREEN : C.BLUE;
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: rc }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: rc }, right: bdr },
                    shading: { fill: rb, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 200, right: 200 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(res.status || ''), bold: true, color: rc, size: 20, font: FONT })] }),
                        ...(res.description ? [para(res.description, false, C.GRAY, 19)] : []),
                        ...(res.verification ? [para('Verification: ' + res.verification, false, C.GRAY, 18)] : []),
                        ...(res.update_set ? [para('Update Set: ' + res.update_set, true, C.NAVY, 18)] : [])
                    ]
                })]
            })]
        })); children.push(sp(80, 0));
    }

    // Next Steps
    var ns = data.next_steps || [];
    if (ns.length) {
        children.push(divider()); children.push(h2('Next Steps', C.NAVY));
        var nsIsObj = ns.length && typeof ns[0] === 'object';
        if (nsIsObj) {
            var nsRows = [new TableRow({ children: [hdrCell('Action', C.NAVY, C.WHITE, 5760), hdrCell('Owner', C.NAVY, C.WHITE, 1800), hdrCell('Due', C.NAVY, C.WHITE, 1800)] })];
            ns.forEach(function (s, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; nsRows.push(new TableRow({ children: [dataCell(s.action || String(s), bg, C.GRAY, 5760), dataCell(s.owner || '', bg, C.NAVY, 1800, true), dataCell(s.due || '', bg, C.GRAY, 1800)] })); });
            children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [5760, 1800, 1800], rows: nsRows }));
        } else {
            ns.forEach(function (s, i) { children.push(listPara(String(s), i)); });
        }
        children.push(sp(80, 0));
    }

    // Blockers
    var bl = data.blockers || [];
    if (bl.length) {
        children.push(divider()); children.push(h2('Blockers', C.RED));
        var blRows = [new TableRow({ children: [hdrCell('Blocker', C.RED, C.WHITE, 3000), hdrCell('Impact', C.RED, C.WHITE, 3180), hdrCell('Resolution Path', C.RED, C.WHITE, 3180)] })];
        bl.forEach(function (b, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; blRows.push(new TableRow({ children: [dataCell(b.blocker || '', bg, C.GRAY, 3000), dataCell(b.impact || '', C.LIGHT_AMBER, C.AMBER, 3180), dataCell(b.resolution_path || '', bg, C.GRAY, 3180)] })); });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [3000, 3180, 3180], rows: blRows })); children.push(sp(80, 0));
    }

    // Related Tasks
    var rt = data.related_tasks || [];
    if (rt.length) {
        children.push(divider()); children.push(h2('Related Tasks', C.GRAY));
        var rtRows = [new TableRow({ children: [hdrCell('Task #', C.GRAY, C.WHITE, 1800), hdrCell('Type', C.GRAY, C.WHITE, 1800), hdrCell('Relationship', C.GRAY, C.WHITE, 5760)] })];
        rt.forEach(function (r, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; rtRows.push(new TableRow({ children: [dataCell(r.num || '', bg, C.BLUE, 1800, true), dataCell(r.type || '', bg, C.GRAY, 1800), dataCell(r.relationship || '', bg, C.GRAY, 5760)] })); });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [1800, 1800, 5760], rows: rtRows })); children.push(sp(80, 0));
    }

    if (data.developer_notes) {
        children.push(divider()); children.push(h2('Developer Notes', C.GRAY));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, right: bdr },
                    shading: { fill: C.LIGHT_GRAY, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'INTERNAL \u2014 DEVELOPER ONLY', bold: true, color: C.GRAY, size: 16, font: FONT })] }), para(data.developer_notes, false, '6E7681', 18)]
                })]
            })]
        })); children.push(sp(80, 0));
    }
    if (data.client_notes) { children.push(divider()); children.push(h2('Client Notes', C.BLUE)); children.push(para(data.client_notes, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    (data.callouts || []).forEach(function (cb) {
        children.push(sp(80, 0));
        var items = (cb.items || []).map(function (item) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '\u2022 ' + safeStr(item), font: FONT, size: 19, color: C.AMB_TXT })] }); });
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: C.AMB_BG, type: ShadingType.CLEAR },
                    borders: { top: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, bottom: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD }, left: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, right: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD } },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: 'ACTION REQUIRED \u2014 ' + safeStr(cb.dev || ''), font: FONT, size: 20, bold: true, color: C.AMB_BD })] }), ...items]
                })]
            })]
        }));
    });

    children.push(sp(200, 0));
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 Task Brief \u2014 ' + safeStr(data.task_num || '') + ' \u2014 ' + safeStr(data.task_type || 'Task'), color: C.MGRAY, size: 16, font: FONT, italics: true })] }));

    var doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.TEAL, space: 1 } }, spacing: { before: 0, after: 120 }, tabStops: [{ type: TabStopType.RIGHT, position: 8640 }], children: [new TextRun({ text: 'TASK BRIEF \u2014 ' + safeStr(data.task_num || '') + ' \u2014 ' + safeStr(data.account || ''), bold: true, color: C.NAVY, size: 18, font: FONT }), new TextRun({ text: '\t' + safeStr(data.state || ''), color: C.GRAY, size: 18, font: FONT })] })] }) },
            footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, spacing: { before: 80 }, children: [new TextRun({ text: safeStr(data.account || '') + ' | Task Brief | ' + safeStr(data.task_num || '') + ' | ' + (data.audience === 'Client' ? 'Client Facing' : 'Internal'), color: C.GRAY, size: 16, font: FONT })] })] }) },
            children: children
        }]
    });
    var blob = await Packer.toBlob(doc);
    var safe = (data.account || 'Account').replace(/\s+/g, '_');
    var num = (data.task_num || 'Task').replace(/\s+/g, '_');
    return { blob: blob, filename: safe + '_Task_Brief_' + num + '.docx' };
}

// ────────────────────────────────────────────────────────────────────────────
//  Project Summary Generator
// ────────────────────────────────────────────────────────────────────────────
async function generateProjectSummary(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, Header, Footer, TabStopType } = getDocx();

    const C = docxColors();
    const FONT = 'Arial';
    const CW = 9360;

    // Extract data with defaults
    const projectName = safeStr(data.project_name || 'Project Name');
    const createdDate = safeStr(data.created_date || new Date().toLocaleDateString());
    const author = safeStr(data.author || 'Author');
    const summary = safeStr(data.summary || 'Project summary');
    const keyMetrics = data.key_metrics || [];
    const milestones = data.milestones || [];
    const risks = data.risks || [];

    // Helper functions
    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

    function para(t, bold, color, size) {
        return new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })]
        });
    }

    function h1(t) {
        return new Paragraph({
            spacing: { before: 120, after: 120 },
            children: [new TextRun({ text: safeStr(t), bold: true, color: C.NAVY, size: 32, font: FONT })]
        });
    }

    function h2(t, color) {
        return new Paragraph({
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.BLUE, size: 28, font: FONT })]
        });
    }

    function hdrCell(t, w) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: C.BLUE, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: C.WHITE, size: 18, font: FONT })] })]
        });
    }

    function dataCell(t, w, bg) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg || C.WHITE, type: ShadingType.CLEAR },
            margins: { top: 70, bottom: 70, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), color: C.GRAY, size: 18, font: FONT })] })]
        });
    }

    function statusCell(t, w) {
        const s = (t || '').toLowerCase();
        let bg, tc;
        if (s.includes('completed') || s.includes('on track')) { bg = C.LIGHT_GREEN; tc = C.GREEN; }
        else if (s.includes('in progress') || s.includes('pending')) { bg = C.LIGHT_BLUE; tc = C.BLUE; }
        else if (s.includes('behind') || s.includes('delayed')) { bg = C.LIGHT_AMBER; tc = C.AMBER; }
        else { bg = C.LIGHT_GRAY; tc = C.GRAY; }
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 70, bottom: 70, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })]
        });
    }

    // Build document sections
    const children = [];

    // Header section
    children.push(h1(projectName + ' - Project Summary'));
    children.push(para('Created: ' + createdDate, false, C.GRAY, 18));
    children.push(para('Author: ' + author, false, C.GRAY, 18));
    children.push(para(''));
    children.push(h2('Executive Summary'));
    children.push(para(summary));
    children.push(para(''));

    // Key Metrics section
    if (keyMetrics.length > 0) {
        children.push(h2('Key Metrics'));
        const metricsTable = new Table({
            width: { size: CW, type: WidthType.DXA },
            columnWidths: [1800, 1400, 1400, 1800, 2960],
            rows: [
                new TableRow({
                    children: [
                        hdrCell('Metric', 1800), hdrCell('Current', 1400),
                        hdrCell('Target', 1400), hdrCell('Status', 1800), hdrCell('Notes', 2960)
                    ]
                }),
                ...keyMetrics.map((m, i) => new TableRow({
                    children: [
                        dataCell(m.metric || '', 1800, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        dataCell(m.current || '', 1400, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        dataCell(m.target || '', 1400, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        statusCell(m.status || '', 1800),
                        dataCell('', 2960, i % 2 ? C.LIGHT_GRAY : C.WHITE)
                    ]
                }))
            ]
        });
        children.push(metricsTable);
        children.push(para(''));
    }

    // Milestones section
    if (milestones.length > 0) {
        children.push(h2('Milestones'));
        const milestonesTable = new Table({
            width: { size: CW, type: WidthType.DXA },
            columnWidths: [2500, 1800, 1800, 3260],
            rows: [
                new TableRow({
                    children: [
                        hdrCell('Milestone', 2500), hdrCell('Due Date', 1800),
                        hdrCell('Status', 1800), hdrCell('Notes', 3260)
                    ]
                }),
                ...milestones.map((m, i) => new TableRow({
                    children: [
                        dataCell(m.name || '', 2500, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        dataCell(m.due_date || '', 1800, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        statusCell(m.status || '', 1800),
                        dataCell(m.notes || '', 3260, i % 2 ? C.LIGHT_GRAY : C.WHITE)
                    ]
                }))
            ]
        });
        children.push(milestonesTable);
        children.push(para(''));
    }

    // Risks section
    if (risks.length > 0) {
        children.push(h2('Risks & Mitigations'));
        const risksTable = new Table({
            width: { size: CW, type: WidthType.DXA },
            columnWidths: [4000, 1200, 4160],
            rows: [
                new TableRow({
                    children: [
                        hdrCell('Risk Description', 4000), hdrCell('Impact', 1200), hdrCell('Mitigation', 4160)
                    ]
                }),
                ...risks.map((r, i) => new TableRow({
                    children: [
                        dataCell(r.description || '', 4000, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        statusCell(r.impact || '', 1200),
                        dataCell(r.mitigation || '', 4160, i % 2 ? C.LIGHT_GRAY : C.WHITE)
                    ]
                }))
            ]
        });
        children.push(risksTable);
    }

    // Create and pack document
    const doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } }, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: 'PROJECT SUMMARY — ' + safeStr(projectName), bold: true, color: C.NAVY, size: 18, font: FONT })] })] }) },
            footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, spacing: { before: 80 }, children: [new TextRun({ text: 'Project Summary | ' + safeStr(projectName) + ' | ' + safeStr(createdDate), color: C.GRAY, size: 16, font: FONT })] })] }) },
            children: children
        }]
    });

    const blob = await Packer.toBlob(doc);
    const filename = projectName.replace(/[^a-z0-9]/gi, '_') + '_Summary.docx';
    return { blob: blob, filename: filename };
}

// ════════════════════════════════════════════════════
//  APPLY EDITS — new document types
// ════════════════════════════════════════════════════
function applyBlockerEdits(d) {
    d.account = getVal('b_account'); d.task_num = getVal('b_task_num'); d.date = getVal('b_date'); d.pm = getVal('b_pm');
    d.assigned_to = getVal('b_assigned_to'); d.status = getVal('b_status'); d.title = getVal('b_title');
    d.summary = getVal('b_summary'); d.blocker_description = getVal('b_blocker_description');
    d.impact = getVal('b_impact'); d.investigation = getVal('b_investigation');
    d.root_cause = getVal('b_root_cause'); d.resolution = getVal('b_resolution');
    d.technical_context = getVal('b_technical_context'); d.client_communication = getVal('b_client_communication');
    d.next_steps = getVal('b_next_steps').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    d.open_questions = getVal('b_open_questions').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    return d;
}
function applyTechApproachEdits(d) {
    d.account = getVal('ta_account'); d.task_num = getVal('ta_task_num'); d.prepared_by = getVal('ta_prepared_by');
    d.developer = getVal('ta_developer'); d.date = getVal('ta_date'); d.status = getVal('ta_status'); d.title = getVal('ta_title');
    d.problem_statement = getVal('ta_problem_statement'); d.objective = getVal('ta_objective');
    d.background = getVal('ta_background'); d.current_state = getVal('ta_current_state');
    d.proposed_solution = getVal('ta_proposed_solution'); d.rollback_plan = getVal('ta_rollback'); d.notes = getVal('ta_notes');
    d.technical_spec = d.technical_spec || {};
    d.technical_spec.data_flow = getVal('ta_data_flow'); d.technical_spec.roles_and_access = getVal('ta_roles');
    d.technical_spec.known_constraints = getVal('ta_constraints');
    d.timeline = d.timeline || {};
    d.timeline.estimate = getVal('ta_tl_estimate'); d.timeline.dev_start = getVal('ta_tl_dev_start');
    d.timeline.target_test = getVal('ta_tl_target_test'); d.timeline.target_prod = getVal('ta_tl_target_prod');
    d.timeline.notes = getVal('ta_tl_notes');
    d.acceptance_criteria = getVal('ta_acceptance_criteria').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    return d;
}
function applyTaskBriefEdits(d) {
    d.task_num = getVal('tb_task_num'); d.task_type = getVal('tb_task_type'); d.account = getVal('tb_account');
    d.priority = getVal('tb_priority'); d.state = getVal('tb_state'); d.environment = getVal('tb_environment');
    d.assigned_to = getVal('tb_assigned_to'); d.pm = getVal('tb_pm');
    d.opened_date = getVal('tb_opened_date'); d.target_date = getVal('tb_target_date'); d.title = getVal('tb_title');
    d.summary = getVal('tb_summary'); d.reported_behavior = getVal('tb_reported_behavior');
    d.expected_behavior = getVal('tb_expected_behavior'); d.impact = getVal('tb_impact');
    d.investigation = d.investigation || {};
    d.investigation.summary = getVal('tb_inv_summary'); d.investigation.current_theory = getVal('tb_inv_theory');
    d.investigation.findings = getVal('tb_inv_findings').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    d.technical_detail = d.technical_detail || {};
    d.technical_detail.error_messages = getVal('tb_td_errors');
    d.technical_detail.relevant_data = getVal('tb_td_data');
    d.technical_detail.environment_notes = getVal('tb_td_env');
    d.resolution = d.resolution || {};
    d.resolution.status = getVal('tb_res_status'); d.resolution.date_resolved = getVal('tb_res_date');
    d.resolution.description = getVal('tb_res_description'); d.resolution.verification = getVal('tb_res_verification');
    d.resolution.update_set = getVal('tb_res_update_set');
    d.developer_notes = getVal('tb_developer_notes'); d.client_notes = getVal('tb_client_notes');
    return d;
}

