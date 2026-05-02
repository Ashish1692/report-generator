// ════════════════════════════════════════════════════
//  PREVIEW
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

function renderDeploymentRunbookPreview(data) {
    let html = `
        <div class="doc-cover" style="background:#1e293b;">
            <div class="doc-cover-title">DEPLOYMENT RUNBOOK</div>
            <div class="doc-cover-sub">${escHtml(data.project_name || '')} | ${escHtml(data.deployment_date || '')}</div>
            <div class="doc-cover-credit">Ops Lead: ${escHtml(data.ops_lead || '')} | Version: ${escHtml(data.version || '1.0')}</div>
        </div>
        
        <div class="doc-section-title">Execution Steps</div>
        <table class="doc-table">
            <thead>
                <tr>
                    <th class="th-navy" style="width:40px">#</th>
                    <th class="th-navy">Action</th>
                    <th class="th-navy" style="width:100px">Owner</th>
                    <th class="th-navy">Validation / Checkpoint</th>
                </tr>
            </thead>
            <tbody>`;

    (data.deployment_steps || []).forEach((s, i) => {
        const stopGoStyle = s.is_stop_go ? 'background:#FFFBEB; border-left: 4px solid #D97706;' : '';
        html += `
            <tr style="${stopGoStyle}">
                <td>${escHtml(s.seq || i + 1)}</td>
                <td>
                    <div style="font-weight:700; color:#1e293b;">${escHtml(s.title || '')}</div>
                    <div style="font-size:11px; margin-top:4px;">${escHtml(s.action || '')}</div>
                </td>
                <td>${escHtml(s.owner || '')}</td>
                <td>
                    ${s.is_stop_go ? '<div style="color:#D97706; font-weight:800; font-size:10px; margin-bottom:4px;">🛑 STOP/GO POINT</div>' : ''}
                    ${escHtml(s.validation || '')}
                </td>
            </tr>`;
    });

    html += `</tbody></table>`;

    if (data.rollback_plan) {
        html += `
            <div class="doc-section-title" style="color:#B91C1C;">Rollback Strategy</div>
            <div class="callout red">
                <div class="callout-label">TRIGGER: ${escHtml(data.rollback_trigger || 'Manual Intervention')}</div>
                ${escHtml(data.rollback_plan)}
            </div>`;
    }

    return html;
}

function renderIncidentSummaryPreview(data) {
    const imp = data.impact || {};
    const res = data.resolution || {};
    const rr = data.related_records || {};

    // Determine Priority Color
    let priColor = '#3b82f6'; // Default Blue
    if (data.priority === 'P1') priColor = '#dc2626'; // Red
    if (data.priority === 'P2') priColor = '#ea580c'; // Orange

    let html = '';

    // 1. Cover Header with Priority Badge
    html += `
        <div class="doc-cover" style="background:#0b2144; padding: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div class="doc-cover-title" style="margin-bottom: 5px;">INCIDENT RESOLUTION SUMMARY</div>
                    <div style="font-size: 16px; color: #AECBF0; font-weight: 600;">${escHtml(data.incident_number)} - ${escHtml(data.short_description)}</div>
                </div>
                <div style="background: white; color: ${priColor}; padding: 10px 20px; border-radius: 8px; text-align: center; border: 2px solid ${priColor};">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: -2px;">Priority</div>
                    <div style="font-size: 24px; font-weight: 900;">${escHtml(data.priority || 'P?')}</div>
                </div>
            </div>
        </div>`;

    // 1.1 Description
    html += `
        <div style="display: block; block; margin-top: 20px;">
            <div class="callout" style="margin:0; padding: 10px; background: #f5f5f5;">
                <div style="font-size: 10px; color: #64748b; font-weight: 700;">DESCRIPTION</div>
                <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${escHtml(data.description || 'N/A')}</div>
            </div>
        </div>`;
    // 2. Core Metadata Grid (2x2)
    html += `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
            <div class="callout" style="margin:0; padding: 10px;">
                <div style="font-size: 10px; color: #64748b; font-weight: 700;">SERVICE</div>
                <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${escHtml(data.service || 'N/A')}</div>
            </div>
            <div class="callout" style="margin:0; padding: 10px;">
                <div style="font-size: 10px; color: #64748b; font-weight: 700;">ASSIGNMENT GROUP</div>
                <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${escHtml(data.assignment_group || 'N/A')}</div>
            </div>
            <div class="callout" style="margin:0; padding: 10px;">
                <div style="font-size: 10px; color: #64748b; font-weight: 700;">OPENED AT</div>
                <div style="font-size: 13px; color: #334155;">${escHtml(data.opened_at || 'N/A')}</div>
            </div>
            <div class="callout" style="margin:0; padding: 10px;">
                <div style="font-size: 10px; color: #64748b; font-weight: 700;">RESOLVED AT</div>
                <div style="font-size: 13px; color: #334155;">${escHtml(data.resolved_at || 'N/A')}</div>
            </div>
        </div>`;

    // 3. Symptoms Section
    if ((data.symptoms || []).length) {
        html += `<div class="doc-section-title">Symptoms Reported</div>`;
        html += `<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
            ${data.symptoms.map(s => `<span style="background:#f1f5f9; color:#475569; padding:4px 12px; border-radius:15px; font-size:12px; border:1px solid #e2e8f0;">${escHtml(s)}</span>`).join('')}
        </div>`;
    }

    // 4. Impact Details
    html += `<div class="doc-section-title">Impact Assessment</div>`;
    html += `<table class="doc-table">
        <tbody>
            <tr>
                <td style="background:#f8fafc;"><strong>Affected Users</strong></td>
                <td>${escHtml(imp.affected_users || 'N/A')}</td>
            </tr>
            <tr>
                <td style="background:#f8fafc;"><strong>Business Impact</strong></td>
                <td>${escHtml(imp.business_impact || 'N/A')}</td>
            </tr>
            <tr>
                <td style="background:#f8fafc;"><strong>Customer Visible?</strong></td>
                <td><span class="status-badge ${imp.customer_visible === 'Yes' ? 'status-open' : 'status-other'}">${escHtml(imp.customer_visible || 'No')}</span></td>
            </tr>
        </tbody>
    </table>`;

    // 5. Resolution Narrative (Primary Highlight)
    html += `<div class="doc-section-title">Resolution Summary</div>`;
    html += `<div class="callout green" style="border-left-width: 6px;">
        <div class="callout-label" style="color:#15803d; font-size:11px;">EXECUTIVE RESOLUTION</div>
        <div style="font-size:14px; line-height:1.5; color:#1e293b; margin-bottom:10px;">${escHtml(res.summary || 'No summary provided.')}</div>
        
        ${res.workaround ? `
            <div style="background:rgba(255,255,255,0.5); padding:8px; border-radius:4px; margin-top:10px;">
                <strong style="color:#1e40af; font-size:11px; text-transform:uppercase;">Applied Workaround:</strong>
                <div style="font-size:12.5px; color:#1e3a8a;">${escHtml(res.workaround)}</div>
            </div>` : ''}

        ${res.root_cause_if_known ? `
            <div style="margin-top:10px; font-size:12px; color:#475569;">
                <strong>Identified Root Cause:</strong> ${escHtml(res.root_cause_if_known)}
            </div>` : ''}
    </div>`;

    // 6. Resolution Steps
    if ((data.resolution_steps || []).length) {
        html += `<div class="doc-section-title">Detailed Resolution Steps</div>`;
        html += `<table class="doc-table">
            <thead><tr><th class="th-navy" style="width:150px">Owner</th><th class="th-navy">Action Taken</th></tr></thead>
            <tbody>
                ${data.resolution_steps.map(rs => `<tr><td><strong>${escHtml(rs.owner)}</strong></td><td>${escHtml(rs.step)}</td></tr>`).join('')}
            </tbody>
        </table>`;
    }

    // 7. Next Steps / Follow-up
    if ((data.next_steps || []).length) {
        html += `<div class="doc-section-title">Follow-up & Preventative Actions</div>`;
        html += `<table class="doc-table">
            <thead><tr><th class="th-blue">Action Item</th><th class="th-blue" style="width:120px">Owner</th><th class="th-blue" style="width:120px">Due Date</th><th class="th-blue" style="width:100px">Status</th></tr></thead>
            <tbody>
                ${data.next_steps.map(ns => `
                    <tr>
                        <td><strong>${escHtml(ns.action)}</strong></td>
                        <td>${escHtml(ns.owner)}</td>
                        <td>${escHtml(ns.due_date || 'TBD')}</td>
                        <td><span class="status-badge status-prod">${escHtml(ns.status)}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
    }

    // 8. Related Records (Static Footer)
    html += `
        <div style="margin-top:30px; padding:15px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
            <div style="display:flex; gap:20px; font-size:12px; color:#64748b; border-bottom: 1px dashed #cbd5e1; padding-bottom:10px; margin-bottom:10px;">
                <div><strong>Problem:</strong> ${escHtml(rr.problem || 'N/A')}</div>
                <div><strong>Change:</strong> ${escHtml(rr.change || 'N/A')}</div>
                <div><strong>KB:</strong> ${escHtml(rr.kb || 'N/A')}</div>
            </div>`;

    // 9. Additional References & Statements (Dynamic List)
    if ((data.references || []).length) {
        html += `<div style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase; margin-bottom:8px;">Additional References</div>
                 <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">`;

        data.references.forEach(ref => {
            const labelHtml = ref.label ? `<strong>${escHtml(ref.label)}:</strong> ` : '';
            const valueHtml = ref.url
                ? `<a href="${escHtml(ref.url)}" target="_blank" style="color:#2563eb; text-decoration:none;">${escHtml(ref.text)} ↗</a>`
                : `<span>${escHtml(ref.text)}</span>`;

            html += `<div style="font-size:12.5px; color:#475569;">• ${labelHtml}${valueHtml}</div>`;
        });

        html += `</div>`;
    }

    html += `
            <div style="margin-top:10px; display:flex; justify-content:space-between; font-size:10px; color:#94A3B8; font-style:italic;">
                <div>Author: ${escHtml(data.author || 'N/A')}</div>
                <div>Date: ${escHtml(data.created_date || 'N/A')}</div>
            </div>
        </div>`;
    return html;
}

function renderSignOffPreview(data) {
    let html = `
        <div class="doc-cover" style="background:#1e3a8a;">
            <div class="doc-cover-title">SIGN-OFF REQUEST</div>
            <div class="doc-cover-sub">${escHtml(data.signoff_id)} — ${escHtml(data.title)}</div>
        </div>
        
        <div class="doc-section-title">Overview</div>
        <div class="doc-text"><strong>Objective:</strong> ${escHtml(data.objective)}</div>
        
        <div class="doc-section-title">Implementation Details</div>
        <div class="callout blue">${escHtml(data.details)}</div>

         <div class="doc-section-title">REQUIREMENTS & CRITERIA</div>
    <div class="callout teal" style="border-left: 5px solid #1A6B6B; background: #f0fdfa;">
        ${renderPreviewList(data.requirements)}
    </div>
        
        <table class="doc-table" style="margin-top:20px;">
            <tr><td style="width:160px; background:#f8fafc;"><strong>Impact</strong></td><td>${escHtml(data.impact)}</td></tr>
            <tr><td style="background:#f8fafc;"><strong>Effort</strong></td><td>${escHtml(data.effort)}</td></tr>
        </table>

        <div style="margin-top:30px; border: 2px dashed #cbd5e1; padding: 15px; border-radius: 8px; text-align: center; color: #64748b; font-size: 13px;">
            Authorized Signature Required
        </div>
    `;
    return html;
}

function renderBulkApprovalPreview(data) {
    let html = `
        <div class="doc-cover" style="background:#134e4a;">
            <div class="doc-cover-title">BULK APPROVAL PACKAGE</div>
            <div class="doc-cover-sub">${escHtml(data.project_name)} — ${escHtml(data.release_title)}</div>
        </div>

        <div class="doc-section-title">Executive Summary</div>
        <table class="doc-table">
            <thead><tr><th class="th-teal">ID</th><th class="th-teal">Task Title</th><th class="th-teal">Effort</th></tr></thead>
            <tbody>
                ${(data.approval_tasks || []).map(tk => `
                    <tr><td><strong>${escHtml(tk.num)}</strong></td><td>${escHtml(tk.title)}</td><td>${escHtml(tk.effort)}</td></tr>
                `).join('')}
            </tbody>
        </table>

        <div class="doc-section-title">Detailed Requirements per Task</div>`;

    (data.approval_tasks || []).forEach(tk => {
        html += `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:15px; margin-bottom:20px;">
                <div style="color:#134e4a; font-weight:800; font-size:15px; border-bottom:1px solid #ccfbf1; padding-bottom:5px; margin-bottom:10px;">
                    ${escHtml(tk.num)}: ${escHtml(tk.title)}
                </div>
                <div style="font-size:13px; margin-bottom:10px;"><strong>Objective:</strong> ${escHtml(tk.objective)}</div>
                <div class="callout blue" style="font-size:12.5px;">${escHtml(tk.details)}</div>
                
                <div style="font-size:11px; font-weight:700; color:#134e4a; margin: 10px 0 5px; text-transform:uppercase;">Specific Requirements:</div>
                
                <!-- NEW RECURSIVE LOGIC FOR HTML PREVIEW -->
                ${renderPreviewList(tk.requirements)}

            </div>`;
    });

    html += `<div style="border: 2px dashed #cbd5e1; padding: 20px; text-align: center; color: #64748b; font-size: 14px; font-weight:600;">Authorized Sign-Off Required for All Items Above</div>`;
    return html;
}

function renderDevHandoverPreview(data) {
    let html = `
        <div class="doc-cover" style="background:#1e293b;">
            <div class="doc-cover-title">WORK HANDOVER</div>
            <div class="doc-cover-sub">${escHtml(data.project_title)}</div>
            <div class="doc-cover-credit">
                ${escHtml(data.record_id)} | Developer: ${escHtml(data.developer_name)}<br/>
                Next Owner: <strong>${escHtml(data.next_owner)}</strong> | Status: ${escHtml(data.overall_status)}
            </div>
        </div>

        <div class="doc-section-title">1. Work Inventory</div>
        <table class="doc-table">
            <thead class="th-navy"><tr><th>Item</th><th>Status</th><th>%</th><th>Blocked?</th></tr></thead>
            <tbody>
                ${(data.work_inventory || []).map(i => `<tr><td>${escHtml(i.title)}</td><td>${escHtml(i.status)}</td><td>${escHtml(i.percent)}</td><td>${i.is_blocked ? '🛑' : 'No'}</td></tr>`).join('')}
            </tbody>
        </table>

        <div class="doc-section-title">2. Completed Work</div>
        ${(data.completed_work || []).map(w => `
            <div class="callout teal" style="margin-bottom:10px;">
                <strong>${escHtml(w.sub_title)}</strong>
                <ul style="font-size:0.9em; margin:5px 0;">${(w.details || []).map(d => `<li>${escHtml(d)}</li>`).join('')}</ul>
                ${w.notes ? `<div style="font-style:italic; font-size:0.8em;">Note: ${escHtml(w.notes)}</div>` : ''}
            </div>
        `).join('')}

        <div class="doc-section-title">3. Remaining Work</div>
        ${(data.remaining_work || []).map(t => `
            <div class="callout blue" style="margin-bottom:10px;">
                <strong>[${escHtml(t.priority)}] ${escHtml(t.title)}</strong><br/>
                <span style="font-size:0.9em;">Todo: ${escHtml(t.todo)}</span>
                ${t.blocked_by ? `<div style="color:red; font-size:0.8em; font-weight:bold;">Blocked by: ${escHtml(t.blocked_by)}</div>` : ''}
            </div>
        `).join('')}

        <div class="doc-section-title">4. Blockers & Issues</div>
        <table class="doc-table">
            <thead class="th-navy"><tr><th class="th-navy">Issue</th><th>Impact</th><th>Workaround</th></tr></thead>
            <tbody>
                ${(data.blockers || []).map(b => `<tr><td style="color:#b91c1c; font-weight:bold;">${escHtml(b.issue)}</td><td>${escHtml(b.impact)}</td><td>${escHtml(b.workaround)}</td></tr>`).join('')}
            </tbody>
        </table>

        <div class="doc-section-title">5. People & Escalation</div>
        <table class="doc-table">
            <tbody>
                ${(data.contacts || []).map(c => `<tr><td style="width:120px;"><strong>${escHtml(c.role)}</strong></td><td>${escHtml(c.name)}</td><td>${escHtml(c.info)}</td></tr>`).join('')}
            </tbody>
        </table>

        <div class="doc-section-title">6. Resources</div>
        ${(data.resources || []).map(r => `<div><strong>${escHtml(r.category)}:</strong> ${r.links.join(', ')}</div>`).join('')}

        <div class="doc-section-title">7. Environment Details</div>
        <table class="doc-table">
            <tbody>
                ${Object.entries(data.environment || {}).map(([k,v]) => `<tr><td style="width:150px;">${escHtml(k)}</td><td>${escHtml(v)}</td></tr>`).join('')}
            </tbody>
        </table>

        <div class="doc-section-title">8. Risks</div>
        <table class="doc-table">
            <thead class="th-navy"><tr><th>Component</th><th>Risk</th><th>Mitigation</th></tr></thead>
            <tbody>
                ${(data.risks || []).map(r => `<tr><td>${escHtml(r.item)}</td><td>${escHtml(r.risk)}</td><td>${escHtml(r.mitigation)}</td></tr>`).join('')}
            </tbody>
        </table>

        <div class="doc-section-title" style="color:teal;">9. Next Steps for New Owner</div>
        <div class="callout amber">
            <strong>Day 1 Checklist:</strong><br/>
            ${(data.next_steps_day1 || []).map(s => `• ${escHtml(s)}<br/>`).join('')}
        </div>
    `;
    return html;
}

function renderKBArticlePreview(data) {
    let html = `
        <div class="doc-cover" style="background:#133960;">
            <div class="doc-cover-title">KNOWLEDGE ARTICLE</div>
            <div class="doc-cover-sub">${escHtml(data.category)} | ${escHtml(data.system)}</div>
            <div class="doc-cover-credit">
                KB ID: ${escHtml(data.kb_id)} | Owner: ${escHtml(data.owner)}<br/>
                Last Updated: ${escHtml(data.last_updated)} | Severity: ${escHtml(data.severity)}
            </div>
        </div>

        <div class="doc-section-title">1. Issue Summary (Plain Language)</div>
        <div class="callout blue">
            <strong>What is happening?</strong><br/>${escHtml(data.summary_what)}<br/><br/>
            <strong>Who is affected?</strong>
            <ul>${(data.summary_who || []).map(w => `<li>${escHtml(w)}</li>`).join('')}</ul>
        </div>

        <div class="doc-section-title">2. Technical Description</div>
        <strong>Root Cause:</strong> ${escHtml(data.technical_root_cause)}
        ${data.technical_error_log ? `<div style="background:#f1f5f9; padding:10px; border-radius:4px; font-size:11px;">${escHtml(data.technical_error_log)}</div>` : ''}

        <div class="doc-section-title">3. Impact Assessment</div>
        <table class="doc-table">
            <thead class="th-navy"><tr><th>Impact Type</th><th>Description</th></tr></thead>
            <tbody>${(data.impact_assessment || []).map(i => `<tr><td><strong>${escHtml(i.type)}</strong></td><td>${escHtml(i.desc)}</td></tr>`).join('')}</tbody>
        </table>

        <div class="doc-section-title">4. Resolution Steps</div>
        <div class="callout green"><strong>Immediate Fix:</strong><ol>${(data.res_short_term || []).map(s => `<li>${escHtml(s)}</li>`).join('')}</ol></div>
        <div class="callout teal"><strong>Permanent Fix:</strong><ol>${(data.res_permanent || []).map(s => `<li>${escHtml(s)}</li>`).join('')}</ol></div>

        <div class="doc-section-title">5. Escalation</div>
        <table class="doc-table">
            <thead class="th-navy"><tr><th>Scenario</th><th>Contact</th><th>Channel</th></tr></thead>
            <tbody>${(data.escalation_path || []).map(e => `<tr><td>${escHtml(e.scenario)}</td><td>${escHtml(e.contact)}</td><td>${escHtml(e.channel)}</td></tr>`).join('')}</tbody>
        </table>

        <div class="doc-section-title">6. Occurrence History</div>
        <table class="doc-table">
            <thead class="th-navy"><tr><th>Date</th><th>ID</th><th>Type</th><th>Env</th><th>Resolution</th></tr></thead>
            <tbody>${(data.occurrence_history || []).map(h => `<tr><td>${escHtml(h.date)}</td><td><strong>${escHtml(h.id)}</strong></td><td>${escHtml(h.type)}</td><td>${escHtml(h.env)}</td><td>${escHtml(h.res)}</td></tr>`).join('')}</tbody>
        </table>

        <div class="doc-section-title">7. Common Triggers</div>
        <ul>${(data.triggers || []).map(t => `<li>${escHtml(t)}</li>`).join('')}</ul>

        <div class="doc-section-title">8. Affected Personas</div>
        <table class="doc-table">
            <thead class="th-navy"><tr><th>Persona</th><th>Impact</th></tr></thead>
            <tbody>${(data.personas || []).map(p => `<tr><td><strong>${escHtml(p.name)}</strong></td><td>${escHtml(p.impact)}</td></tr>`).join('')}</tbody>
        </table>

        <div class="doc-section-title">9. Related Records</div>
        ${(data.related_records || []).map(r => `<div><strong>${escHtml(r.category)}:</strong> ${r.links.join(', ')}</div>`).join('')}

        <div class="doc-section-title">10. Monitoring & Prevention</div>
        <ul>${(data.prevention_steps || []).map(s => `<li>${escHtml(s)}</li>`).join('')}</ul>

        <div class="doc-section-title">11. Status</div>
        <div style="display:flex; gap:20px; flex-wrap:wrap;">
            ${["Known Error", "Workaround Available", "Permanent Fix Released", "Monitoring Active"].map(f => {
                const checked = (data.status_flags || []).includes(f);
                return `<span>${checked ? '☑' : '☐'} ${f}</span>`;
            }).join('')}
        </div>
    `;
    return html;
}

function renderTechnicalSpecPreview(data) {
    let html = `
        <div class="doc-cover" style="background:#0F172A;">
            <div class="doc-cover-title">TECHNICAL SPECIFICATION</div>
            <div class="doc-cover-sub">${escHtml(data.technical_title)}</div>
            <div class="doc-cover-credit">
                Version: ${escHtml(data.version)} | Date: ${escHtml(data.date)} | Author: ${escHtml(data.author)}<br/>
                Related: <strong>${escHtml(data.related_records)}</strong>
            </div>
        </div>

        <div class="doc-section-title">1. Requirements</div>
        <div class="callout teal">
            ${(data.requirements || []).map(req => `
                <div style="margin-bottom:8px;">
                    <strong>${escHtml(req.title)}</strong>
                    <ul style="margin:4px 0 0 20px; font-size:0.9em;">
                        ${(req.items || []).map(i => `<li>${escHtml(i)}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>

        <div class="doc-section-title">2. Overview</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
            ${["Enhancement", "Update to Existing Configuration", "Bug Fix"].map(t => {
                const checked = (data.change_types || []).includes(t);
                return `<div style="font-size:0.9em; opacity:${checked?1:0.4}">${checked?'☑':'☐'} ${t}</div>`;
            }).join('')}
        </div>
        <table class="doc-table">
            <thead><tr><th class="th-navy">Environment</th><th class="th-navy">Status</th><th class="th-navy">Update Set</th><th class="th-navy">Notes</th></tr></thead>
            <tbody>
                ${(data.environments || []).map(e => `<tr><td><strong>${escHtml(e.name)}</strong></td><td>${escHtml(e.status)}</td><td>${escHtml(e.update_set)}</td><td>${escHtml(e.notes)}</td></tr>`).join('')}
            </tbody>
        </table>
        <div style="margin-top:10px;"><strong>Affected Components:</strong></div>
        <ul>${(data.components || []).map(c => `<li>${escHtml(c)}</li>`).join('')}</ul>

        <div class="doc-section-title">3. Implementation Procedure</div>
        ${(data.implementation_steps || []).map((step, idx) => `
            <div class="step-body">${renderStepDetails(step.details)}</div>
        `).join('')}
        
        <div class="callout blue">
            <strong>Deployment:</strong><ul>${(data.deployment_plan || []).map(p => `<li>${escHtml(p)}</li>`).join('')}</ul>
            <strong style="color:#b91c1c;">Rollback:</strong> ${escHtml(data.rollback_plan)}
        </div>

        <div class="doc-section-title">4. Risks & Impact</div>
        <table class="doc-table">
            <thead><tr><th class="th-navy">Risk</th><th class="th-navy">Impact</th><th class="th-navy">Mitigation</th></tr></thead>
            <tbody>
                ${(data.risks || []).map(r => `<tr><td style="color:#b91c1c; font-weight:bold;">${escHtml(r.risk)}</td><td>${escHtml(r.impact)}</td><td>${escHtml(r.mitigation)}</td></tr>`).join('')}
            </tbody>
        </table>

        <div class="doc-section-title">5. Dependencies</div>
        <ul>${(data.dependencies || []).map(d => `<li>${escHtml(d)}</li>`).join('')}</ul>

        <div class="doc-section-title">6. Assumptions</div>
        <ul>${(data.assumptions || []).map(a => `<li>${escHtml(a)}</li>`).join('')}</ul>

        <div class="doc-section-title">7. Resources</div>
        <table class="doc-table">
            <tbody>
                ${Object.entries(data.resources || {}).map(([k,v]) => `<tr><td style="width:180px; background:#f8fafc; font-weight:bold;">${escHtml(k)}</td><td>${escHtml(v)}</td></tr>`).join('')}
            </tbody>
        </table>

        <div class="doc-section-title">8. Revision History</div>
        <table class="doc-table">
            <thead><tr><th class="th-navy">Ver</th><th class="th-navy">Date</th><th class="th-navy">Author</th><th class="th-navy">Change</th></tr></thead>
            <tbody>
                ${(data.revisions || []).map(r => `<tr><td>${escHtml(r.version)}</td><td>${escHtml(r.date)}</td><td>${escHtml(r.author)}</td><td>${escHtml(r.change)}</td></tr>`).join('')}
            </tbody>
        </table>

        <div style="text-align:center; margin-top:40px; font-size:10px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:20px;">
            ${escHtml(data.company_name)} – Confidential<br/>
            For Internal / Client Use Only | © ${new Date().getFullYear()}
        </div>
    `;
    return html;
}
