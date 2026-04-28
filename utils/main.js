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

function renderStoryDesignPreview(data) {
    let html = '';

    // 1. Cover Header
    html += `
        <div class="doc-cover" style="background:#0b163b;">
            <div class="doc-cover-title" style="font-size:28px;">STORY TECHNICAL DESIGN</div>
            <div class="doc-cover-sub" style="font-size:20px; border-bottom:1px solid rgba(255,255,255,0.3); padding-bottom:10px; margin-bottom:10px;">
                ${escHtml(data.story_id || 'STRY-UNKNOWN')} — ${escHtml(data.title || 'Untitled Story')}
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1px; font-size:13px; opacity:0.9;">
                <div class="white-text"><strong>Requested by:</strong> ${escHtml(data.requested_by || 'N/A')}</div>
                <div class="white-text"><strong>Product Owner:</strong> ${escHtml(data.product_owner || 'N/A')}</div>
                <div class="white-text"><strong>Created:</strong> ${escHtml(data.created_date || 'N/A')}</div>
                <div class="white-text"><strong>Author:</strong> ${escHtml(data.author || 'N/A')}</div>
            </div>
        </div>`;

    // 2. Summary
    if (data.summary) {
        html += `<div class="doc-section-title">Requirement Summary</div>`;
        html += `<div class="doc-text">${escHtml(data.summary)}</div>`;
    }

    // 3. Project Scope & Assumptions (Triple Grid)
    html += `
        <div class="doc-section-title">Scope & Assumptions</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:20px;">
            <div class="callout teal" style="margin:0;">
                <div class="callout-label" style="color:#0D9488;">IN SCOPE</div>
                <ul style="padding-left:16px; font-size:11.5px; margin-top:5px;">
                    ${(data.in_scope || []).map(item => `<li>${escHtml(item)}</li>`).join('')}
                </ul>
            </div>
            <div class="callout red" style="margin:0;">
                <div class="callout-label" style="color:#B91C1C;">OUT OF SCOPE</div>
                <ul style="padding-left:16px; font-size:11.5px; margin-top:5px;">
                    ${(data.out_of_scope || []).map(item => `<li>${escHtml(item)}</li>`).join('')}
                </ul>
            </div>
            <div class="callout blue" style="margin:0;">
                <div class="callout-label" style="color:#1E40AF;">ASSUMPTIONS</div>
                <ul style="padding-left:16px; font-size:11.5px; margin-top:5px;">
                    ${(data.assumptions || []).map(item => `<li>${escHtml(item)}</li>`).join('')}
                </ul>
            </div>
        </div>`;

    // 4. Acceptance Criteria
    if ((data.acceptance_criteria || []).length) {
        html += `<div class="doc-section-title">Acceptance Criteria</div>`;
        html += `<div class="callout" style="background:#F8FAFC; border-left-color:#64748B;">
                    <ul style="padding-left:20px; font-size:12.5px; color:#334155;">
                        ${data.acceptance_criteria.map(ac => `<li style="margin-bottom:4px;">${escHtml(ac)}</li>`).join('')}
                    </ul>
                 </div>`;
    }

    // 5. Design Overview
    if (data.design && data.design.overview) {
        html += `<div class="doc-section-title">Technical Design Overview</div>`;
        html += `<div class="doc-text" style="background:#f1f5f9; padding:12px; border-radius:6px; font-family:inherit;">${escHtml(data.design.overview)}</div>`;
    }

    // 6. Data Model Changes
    if ((data.data_model_changes || []).length) {
        html += `<div class="doc-section-title">Data Model / Table Changes</div>`;
        html += `<table class="doc-table">
            <thead><tr><th class="th-navy" style="width:180px">Table</th><th class="th-navy" style="width:140px">Change</th><th class="th-navy">Details</th></tr></thead>
            <tbody>
                ${data.data_model_changes.map(dm => `<tr><td><strong>${escHtml(dm.table)}</strong></td><td>${escHtml(dm.change)}</td><td>${escHtml(dm.details)}</td></tr>`).join('')}
            </tbody>
        </table>`;
    }

    // 7. Implementation Components
    if ((data.implementation_components || []).length) {
        html += `<div class="doc-section-title">Implementation Components</div>`;
        html += `<table class="doc-table">
            <thead><tr><th class="th-blue" style="width:140px">Type</th><th class="th-blue" style="width:200px">Name</th><th class="th-blue">Description</th></tr></thead>
            <tbody>
                ${data.implementation_components.map(c => `<tr><td><strong>${escHtml(c.type)}</strong></td><td>${escHtml(c.name)}</td><td><span style="font-size:11.5px;">${escHtml(c.description)}</span></td></tr>`).join('')}
            </tbody>
        </table>`;
    }

    // 8. Security / ACLs
    if ((data.security || []).length) {
        html += `<div class="doc-section-title">Security & Access Control</div>`;
        html += `<div class="callout"><table style="width:100%; font-size:12.5px; border-collapse:collapse;">
                    ${data.security.map(s => `<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:6px 0; width:120px;"><strong>${escHtml(s.item)}</strong></td><td style="padding:6px 0;">${escHtml(s.details)}</td></tr>`).join('')}
                </table></div>`;
    }

    // 9. Integrations
    if ((data.integrations || []).length) {
        html += `<div class="doc-section-title">Integrations</div>`;
        html += `<table class="doc-table"><thead><tr><th class="th-navy">System</th><th class="th-navy">Details</th></tr></thead><tbody>
                ${data.integrations.map(int => `<tr><td><strong>${escHtml(int.system)}</strong></td><td>${escHtml(int.details)}</td></tr>`).join('')}
                </tbody></table>`;
    }

    // 10. Testing
    if (data.testing && (data.testing.test_cases || []).length) {
        html += `<div class="doc-section-title">Testing Strategy</div>`;
        html += `<table class="doc-table">
            <thead><tr><th style="background:#475569; color:white; width:60px;">ID</th><th style="background:#475569; color:white;">Scenario</th><th style="background:#475569; color:white;">Expected Result</th></tr></thead>
            <tbody>
                ${data.testing.test_cases.map(tc => `<tr><td><strong>${escHtml(tc.id)}</strong></td><td>${escHtml(tc.scenario)}</td><td>${escHtml(tc.expected)}</td></tr>`).join('')}
            </tbody>
        </table>`;
    }

    // 11. Deployment Notes
    if ((data.deployment_notes || []).length) {
        html += `<div class="doc-section-title">Deployment & Promotion Notes</div>`;
        html += `<div class="callout teal" style="background:#F0FDFA; border-left-color:#0D9488;">
                    <ul style="padding-left:20px; font-size:12px; margin:0;">
                        ${data.deployment_notes.map(note => `<li style="margin-bottom:4px;">${escHtml(note)}</li>`).join('')}
                    </ul>
                 </div>`;
    }

    // 12. Risks
    if ((data.risks || []).length) {
        html += `<div class="doc-section-title">Risks & Mitigations</div>`;
        html += `<table class="doc-table">
            <thead><tr><th class="th-red">Risk Description</th><th class="th-red" style="width:80px;">Impact</th><th class="th-red">Mitigation</th></tr></thead>
            <tbody>
                ${data.risks.map(r => `<tr><td>${escHtml(r.description)}</td><td><span class="status-badge status-open">${escHtml(r.impact)}</span></td><td>${escHtml(r.mitigation)}</td></tr>`).join('')}
            </tbody>
        </table>`;
    }

    // 13. Open Questions
    if ((data.open_questions || []).length) {
        html += `<div class="doc-section-title">Open Questions / Blockers</div>`;
        html += `<div class="callout amber">
                    <ul style="padding-left:20px; font-size:12.5px; margin:0;">
                        ${data.open_questions.map(q => `<li style="margin-bottom:5px; font-weight:600;">${escHtml(q)}</li>`).join('')}
                    </ul>
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

// =============================================
// Recursive List Renderer for Nested Requirements
// =============================================
function renderPreviewList(items) {
    if (!items || !items.length) return '';

    let html = '<ul style="padding-left:20px; margin:0; list-style-type: disc;">';
    items.forEach(item => {
        const isObj = typeof item === 'object' && item !== null;
        const text = isObj ? escHtml(item.text) : escHtml(item);

        let style = '';
        if (isObj && item.bold) style += 'font-weight:700;';
        if (isObj && item.italic) style += 'font-style:italic;';

        let content = isObj && item.url
            ? `<a href="${escHtml(item.url)}" target="_blank" style="color:#2563eb; text-decoration:none; border-bottom:1px solid #bfdbfe;">${text} ↗</a>`
            : `<span style="${style}">${text}</span>`;

        html += `<li style="margin-bottom:8px; font-size:13px; color:#334155;">${content}`;
        if (isObj && item.sub_items) {
            html += renderPreviewList(item.sub_items); // Recursive call
        }
        html += `</li>`;
    });
    html += '</ul>';
    return html;
}
// END
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



