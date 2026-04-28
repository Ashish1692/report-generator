// ════════════════════════════════════════════════════
//  PREVIEW
// ════════════════════════════════════════════════════
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