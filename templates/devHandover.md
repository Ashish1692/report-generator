You are correct. I missed the depth of the nine specific sections requested in your `preview.md`.

Here is the updated implementation that strictly follows the **9-section architecture** from the `preview.md` document, including the expanded Title Block and the technical tables for Risks, Environment, and Blockers.

### 1. Detection Logic (`helper.js`)

Add this to your routing and auto-detection logic.

**In `loadJSON()`:**
```javascript
// Detect Developer Handover by presence of work_inventory or next_owner
else if (data.work_inventory && data.next_owner) switchMode('devhandover');
```

**In `generate()`:**
```javascript
else if (currentMode === 'devhandover') result = await generateDevHandover(currentData);
```

**In `renderPreview()`:**
```javascript
else if (currentMode === 'devhandover') el.innerHTML = renderDevHandoverPreview(data);
```

---

### 2. Word Generator (`template.js`)
This creates the full 9-section report using your established design system.

```javascript
async function generateDevHandover(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType } = getDocx();
    const C = docxColors();
    const CW = 9360; 

    const children = [];

    // --- TITLE BLOCK (As requested in Layout Mockup) ---
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [new TableRow({
            children: [new TableCell({
                shading: { fill: '1e293b', type: ShadingType.CLEAR },
                margins: { top: 300, bottom: 300, left: 400, right: 400 },
                children: [
                    new Paragraph({ children: [new TextRun({ text: "WORK HANDOVER", bold: true, color: C.WHITE, size: 32 })] }),
                    new Paragraph({ children: [new TextRun({ text: safeStr(data.project_title || 'ServiceNow Development'), color: 'AECBF0', size: 18 })] }),
                    sp(200, 100),
                    new Paragraph({ children: [new TextRun({ text: `Record: ${safeStr(data.record_id)} | Dev: ${safeStr(data.developer_name)}`, color: C.WHITE, size: 18 })] }),
                    new Paragraph({ children: [new TextRun({ text: `Next Owner: ${safeStr(data.next_owner)} | Date: ${safeStr(data.handover_date)}`, color: 'C0D8F5', size: 18 })] }),
                    new Paragraph({ children: [new TextRun({ text: `Status: ${safeStr(data.overall_status)}`, color: C.WHITE, bold: true, size: 20 })] })
                ]
            })]
        })]
    }));

    // 1. Work Inventory (At a Glance)
    children.push(h2("1. Work Inventory"));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Item", C.NAVY, C.WHITE, 3000), hdrCell("Status", C.NAVY, C.WHITE, 1500), hdrCell("% Done", C.NAVY, C.WHITE, 1000), hdrCell("Blocked?", C.NAVY, C.WHITE, 1360)] }),
            ...(data.work_inventory || []).map((item, i) => new TableRow({
                children: [dataCell(item.title, i%2?C.WHITE:C.LIGHT_GRAY, C.NAVY, 3000, true), dataCell(item.status, i%2?C.WHITE:C.LIGHT_GRAY, C.GRAY, 1500), dataCell(item.percent, i%2?C.WHITE:C.LIGHT_GRAY, C.GRAY, 1000), dataCell(item.is_blocked ? "YES" : "No", item.is_blocked ? C.LIGHT_RED : (i%2?C.WHITE:C.LIGHT_GRAY), item.is_blocked ? C.RED : C.GRAY, 1360)]
            }))
        ]
    }));

    // 2. Completed Work (Detailed Narrative)
    children.push(h2("2. Completed Work (So Far)"));
    (data.completed_work || []).forEach(section => {
        children.push(para(section.sub_title, true, C.NAVY, 20));
        (section.details || []).forEach(d => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(d), size: 18, color: C.GRAY })] })));
        if (section.notes) children.push(new Paragraph({ children: [new TextRun({ text: `Note: ${section.notes}`, italic: true, size: 18, color: C.BLUE })] }));
        sp(100, 100);
    });

    // 3. Remaining Work (To Do)
    children.push(h2("3. Remaining Work"));
    (data.remaining_work || []).forEach(task => {
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA },
            rows: [new TableRow({
                children: [new TableCell({
                    borders: { left: { style: BorderStyle.SINGLE, size: 20, color: C.TEAL } },
                    margins: { left: 200, top: 100, bottom: 100 },
                    children: [
                        new Paragraph({ children: [new TextRun({ text: `[${task.priority}] ${task.title}`, bold: true, color: C.NAVY, size: 19 })] }),
                        para(`Requirements: ${task.todo}`, false, C.GRAY, 18),
                        para(`Blocked By: ${task.blocked_by || 'None'}`, !!task.blocked_by, task.blocked_by ? C.RED : C.GRAY, 17)
                    ]
                })]
            })]
        }));
        sp(100, 100);
    });

    // 4. Blockers & Issues
    children.push(h2("4. Blockers & Issues"));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Issue", C.RED, C.WHITE, 3000), hdrCell("Impact", C.RED, C.WHITE, 2000), hdrCell("Workaround", C.RED, C.WHITE, 4360)] }),
            ...(data.blockers || []).map(b => new TableRow({ children: [dataCell(b.issue, C.WHITE, C.RED, 3000, true), dataCell(b.impact, C.WHITE, C.GRAY, 2000), dataCell(b.workaround, C.WHITE, C.GRAY, 4360)] }))
        ]
    }));

    // 5. People & Escalation
    children.push(h2("5. People & Escalation"));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Role", C.NAVY, C.WHITE, 2000), hdrCell("Name", C.NAVY, C.WHITE, 2000), hdrCell("Knowledge / Escalation", C.NAVY, C.WHITE, 5360)] }),
            ...(data.contacts || []).map(c => new TableRow({ children: [dataCell(c.role, C.WHITE, C.NAVY, 2000, true), dataCell(c.name, C.WHITE, C.GRAY, 2000), dataCell(c.info, C.WHITE, C.GRAY, 5360)] }))
        ]
    }));

    // 6. Resources & Links (Bullet list)
    children.push(h2("6. Resources & Links"));
    (data.resources || []).forEach(r => {
        children.push(para(r.category, true, C.NAVY, 18));
        (r.links || []).forEach(l => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(l), color: C.BLUE, size: 17 })] })));
    });

    // 7. Environment Details
    children.push(h2("7. Environment Details"));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: Object.entries(data.environment || {}).map(([key, val]) => new TableRow({
            children: [dataCell(key, C.LIGHT_GRAY, C.NAVY, 2500, true), dataCell(val, C.WHITE, C.GRAY, 6860)]
        }))
    }));

    // 8. Risk & Difficulty Summary
    children.push(h2("8. Risk & Difficulty Summary"));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Component", C.BLUE, C.WHITE, 3000), hdrCell("Diff", C.BLUE, C.WHITE, 1000), hdrCell("Risk", C.BLUE, C.WHITE, 1000), hdrCell("Mitigation", C.BLUE, C.WHITE, 4360)] }),
            ...(data.risks || []).map(r => new TableRow({ children: [dataCell(r.item, C.WHITE, C.NAVY, 3000), dataCell(r.diff, C.WHITE, C.GRAY, 1000), dataCell(r.risk, C.WHITE, C.GRAY, 1000), dataCell(r.mitigation, C.WHITE, C.GRAY, 4360)] }))
        ]
    }));

    // 9. Next Steps for New Owner
    children.push(h2("9. Next Steps for New Owner", C.TEAL));
    children.push(para("Day 1 Checklist:", true, C.NAVY, 18));
    (data.next_steps_day1 || []).forEach(s => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(s), size: 18 })] })));
    children.push(para("Day 2-3 Tasks:", true, C.NAVY, 18));
    (data.next_steps_days_rest || []).forEach(s => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(s), size: 18 })] })));

    const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children }] });
    const blob = await Packer.toBlob(doc);
    return { blob, filename: `Handover_${data.record_id}.docx` };
}
```

---

### 3. HTML Previewer (`main.js`)
This maps the detailed 9-section JSON into your CSS-based preview.

```javascript
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
            <thead><tr><th>Item</th><th>Status</th><th>%</th><th>Blocked?</th></tr></thead>
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
            <thead><tr><th class="th-navy">Issue</th><th>Impact</th><th>Workaround</th></tr></thead>
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
                ${Object.entries(data.environment || {}).map(([k,v]) => `<tr><td class="th-navy" style="width:150px;">${escHtml(k)}</td><td>${escHtml(v)}</td></tr>`).join('')}
            </tbody>
        </table>

        <div class="doc-section-title">8. Risks</div>
        <table class="doc-table">
            <thead><tr><th>Component</th><th>Risk</th><th>Mitigation</th></tr></thead>
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
```

### Full Requirement-Compliant JSON
```json
{
  "project_title": "HR Case Management - SLA Engine Fix",
  "record_id": "STORY10234",
  "developer_name": "John Doe",
  "handover_date": "May 01, 2026",
  "next_owner": "Sarah Smith",
  "overall_status": "70% Complete | 2 Days Remaining",
  "work_inventory": [
    { "title": "SLA Business Rule", "status": "In Progress", "percent": "80%", "is_blocked": false },
    { "title": "Integration Retry Logic", "status": "Blocked", "percent": "60%", "is_blocked": true }
  ],
  "completed_work": [
    { "sub_title": "SLA Logic Implementation", "details": ["Modified global.SLAUtils", "Created 3 test cases"], "notes": "Watch for timezone issues" }
  ],
  "remaining_work": [
    { "title": "UI Policy Fix", "priority": "High", "todo": "Update hide_fields_on_load logic", "blocked_by": "Figma design" }
  ],
  "blockers": [
    { "issue": "OAuth Token Expiry", "impact": "Blocks integration tests", "workaround": "Manual token refresh" }
  ],
  "contacts": [
    { "role": "Tech Lead", "name": "John Smith", "info": "SLA engine expert" }
  ],
  "resources": [
    { "category": "Code Repos", "links": ["github.com/org/repo"] }
  ],
  "environment": {
    "Branch": "feature/SLA-fix-2026",
    "Update Sets": "HR_SLA_Engine_Fix"
  },
  "risks": [
    { "item": "SLA Logic", "diff": "Medium", "risk": "Low", "mitigation": "Review ATF tests" }
  ],
  "next_steps_day1": ["Pull latest branch", "Ping Mike for OAuth fix"],
  "next_steps_days_rest": ["Start UI Policy fix", "Daily standup update"]
}
```