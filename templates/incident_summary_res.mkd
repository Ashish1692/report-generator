To implement the **Incident Resolution Summary (Customer-Friendly)** template, I will follow the established architectural patterns for routing, document generation, and web previewing.

### 1. Update `helper.js`
We need to add the routing for the new mode and update the auto-detection.

**In `generate()` (approx. line 11):**
```javascript
else if (currentMode === 'incidentsummary') result = await generateIncidentSummary(currentData);
```

**In `loadJSON()` (approx. line 45):**
```javascript
// Detect by incident_number (RCA uses "incident")
else if (data.incident_number) switchMode('incidentsummary');
```

**In `renderPreview()` (approx. line 68):**
```javascript
else if (currentMode === 'incidentsummary') el.innerHTML = renderIncidentSummaryPreview(data);
```

---

### 2. Update `template.js`
Add the `generateIncidentSummary` function. This template emphasizes the "Impact Window" and "Narrative Resolution."

```javascript
async function generateIncidentSummary(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, Header, Footer } = getDocx();

    const C = docxColors();
    const FONT = 'Arial';
    const CW = 9360;
    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

    function h2(t, color) { return new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.NAVY, size: 26, font: FONT })] }); }
    function para(t, bold, color, size) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })] }); }
    function hdrCell(t, bg, tc, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }

    const children = [];

    // Header / Title
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
            children: [new TableCell({
                shading: { fill: '2E5FAC' }, width: { size: CW, type: WidthType.DXA }, margins: { top: 300, bottom: 300, left: 300, right: 300 },
                children: [
                    new Paragraph({ children: [new TextRun({ text: 'INCIDENT RESOLUTION SUMMARY', bold: true, color: C.WHITE, size: 40, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: safeStr(data.incident_number) + ' | ' + safeStr(data.short_description), color: 'AECBF0', size: 22, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: 'Description: ' + safeStr(data.description), color: '0F244E', size: 18, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: 'Service: ' + safeStr(data.service) + ' | Resolved: ' + safeStr(data.resolved_at), color: 'C0D8F5', size: 18, font: FONT })] })
                ]
            })]
        })]
    }));

    // Impact Overview Table
    const imp = data.impact || {};
    children.push(h2('Incident Impact Overview'));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [2340, 7020], rows: [
            new TableRow({ children: [dataCell('Impact Window', 'F8FAFC', C.NAVY, 2340, true), dataCell(safeStr(imp.impact_start) + ' to ' + safeStr(imp.impact_end), 'F8FAFC', C.GRAY, 7020)] }),
            new TableRow({ children: [dataCell('Affected Users', C.WHITE, C.NAVY, 2340, true), dataCell(imp.affected_users, C.WHITE, C.GRAY, 7020)] }),
            new TableRow({ children: [dataCell('Business Impact', 'F8FAFC', C.NAVY, 2340, true), dataCell(imp.business_impact, 'F8FAFC', C.GRAY, 7020)] }),
            new TableRow({ children: [dataCell('Customer Visible', C.WHITE, C.NAVY, 2340, true), dataCell(imp.customer_visible, C.WHITE, C.GRAY, 7020)] })
        ]
    }));

    // Resolution Details
    const res = data.resolution || {};
    children.push(h2('Resolution Summary', C.GREEN));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
            children: [new TableCell({
                shading: { fill: C.LIGHT_GREEN }, borders: { left: { style: BorderStyle.SINGLE, size: 10, color: C.GREEN }, top: bdr, bottom: bdr, right: bdr },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [
                    new Paragraph({ children: [new TextRun({ text: 'SUMMARY: ', bold: true, color: C.GREEN, size: 18 }), new TextRun({ text: res.summary, color: C.GRAY, size: 19 })] }),
                    ...(res.workaround ? [new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'WORKAROUND: ', bold: true, color: C.NAVY, size: 18 }), new TextRun({ text: res.workaround, color: C.GRAY, size: 19 })] })] : []),
                    ...(res.root_cause_if_known ? [new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'ROOT CAUSE: ', bold: true, color: C.GRAY, size: 18 }), new TextRun({ text: res.root_cause_if_known, color: C.GRAY, size: 19 })] })] : [])
                ]
            })]
        })]
    }));

    // Next Steps Table
    if ((data.next_steps || []).length) {
        children.push(h2('Preventative Next Steps'));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [4500, 1800, 1500, 1560], rows: [
                new TableRow({ children: [hdrCell('Action Item', C.NAVY, C.WHITE, 4500), hdrCell('Owner', C.NAVY, C.WHITE, 1800), hdrCell('Due Date', C.NAVY, C.WHITE, 1500), hdrCell('Status', C.NAVY, C.WHITE, 1560)] }),
                ...data.next_steps.map((ns, i) => new TableRow({
                    children: [
                        dataCell(ns.action, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 4500),
                        dataCell(ns.owner, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1800),
                        dataCell(ns.due_date, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1500),
                        dataCell(ns.status, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.NAVY, 1560, true)
                    ]
                }))
            ]
        }));
    }

// 8. Related Records (The Big Three)
    if (data.related_records) {
        const rr = data.related_records;
        children.push(new Paragraph({
            spacing: { before: 300 },
            children: [
                new TextRun({ text: 'Related Records: ', bold: true, color: C.GRAY, size: 16 }),
                new TextRun({ text: `Problem: ${rr.problem || 'N/A'}  |  Change: ${rr.change || 'N/A'}  |  KB: ${rr.kb || 'N/A'}`, color: C.GRAY, size: 16, italics: true })
            ]
        }));
    }

    // 9. Additional References & Statements (Dynamic List)
    if ((data.references || []).length) {
        children.push(new Paragraph({
            spacing: { before: 120 },
            children: [new TextRun({ text: 'Additional References:', bold: true, color: C.GRAY, size: 16 })]
        }));

        data.references.forEach(ref => {
            const runs = [];
            
            // If there's a label (e.g., "Story: ")
            if (ref.label) {
                runs.push(new TextRun({ text: ref.label + ': ', bold: true, color: '475569', size: 16 }));
            }

            // The main text or ID
            if (ref.url) {
                runs.push(new TextRun({ text: ref.text, color: '2563EB', underline: {}, size: 16 }));
            } else {
                runs.push(new TextRun({ text: ref.text, color: C.GRAY, size: 16 }));
            }

            children.push(new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 40 },
                children: runs
            }));
        });
    }

    const doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{ children }]
    });

    const blob = await Packer.toBlob(doc);
    return { blob, filename: data.incident_number + '_Resolution_Summary.docx' };
}
```

---

### 3. Update `main.js`
Adding the preview renderer for the Incident Summary.

```javascript
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
```

### Architectural Notes:
1.  **Unique Trigger:** I used `data.incident_number` as the trigger. This prevents conflict with the `rca` template, which looks for `data.incident`.
2.  **Narrative Style:** The resolution section uses a colored callout to ensure it stands out as the most important information for the customer.
3.  **Impact Summary:** Instead of a long chronological timeline (like in an RCA), this template focuses on a summary table of the impact window and business consequences.