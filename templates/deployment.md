To implement the **Deployment Runbook (Ops Execution)** template, I will follow the established architectural patterns found in `helper.js`, `template.js`, and `main.js`. 

I have defined the trigger key for auto-detection as `deployment_steps`.

### 1. Update `helper.js`
We need to add the routing logic for the new mode and update the auto-detection heuristic.

**In `generate()` (approx. line 11):**
```javascript
else if (currentMode === 'deploymentrunbook') result = await generateDeploymentRunbook(currentData);
```

**In `loadJSON()` (approx. line 45):**
```javascript
else if (data.deployment_steps && data.ops_lead) switchMode('deploymentrunbook');
```

**In `renderPreview()` (approx. line 68):**
```javascript
else if (currentMode === 'deploymentrunbook') el.innerHTML = renderDeploymentRunbookPreview(data);
```

---

### 2. Update `template.js`
Add the `generateDeploymentRunbook` function. This uses the `docx` library patterns seen in the RCA and Task Brief logic.

```javascript
async function generateDeploymentRunbook(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType,
        Header, Footer, TabStopType } = getDocx();

    const C = docxColors();
    const FONT = 'Arial';
    const CW = 9360;

    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    const thinBdr = { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY };
    const cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };

    function sp(b, a) { return new Paragraph({ spacing: { before: b || 0, after: a || 0 }, children: [] }); }
    function h2(t, color) { return new Paragraph({ spacing: { before: 240, after: 120 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.NAVY, size: 28, font: FONT })] }); }
    function para(t, bold, color, size) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })] }); }
    function hdrCell(t, bg, tc, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }

    const children = [];

    // Title Block
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
            children: [new TableCell({
                shading: { fill: '1e293b', type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 360, bottom: 360, left: 360, right: 360 },
                children: [
                    new Paragraph({ children: [new TextRun({ text: 'DEPLOYMENT RUNBOOK', bold: true, color: C.WHITE, size: 44, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: safeStr(data.project_name || 'System Update') + ' | ' + safeStr(data.deployment_date || ''), color: 'AECBF0', size: 22, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: 'Ops Lead: ' + safeStr(data.ops_lead || '') + ' | Version: ' + safeStr(data.version || '1.0'), color: 'C0D8F5', size: 19, font: FONT })] })
                ]
            })]
        })]
    }));

    // Contacts
    if ((data.contacts || []).length) {
        children.push(h2('Owner Contacts'));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [2340, 2340, 4680], rows: [
                new TableRow({ children: [hdrCell('Role', C.NAVY, C.WHITE, 2340), hdrCell('Name', C.NAVY, C.WHITE, 2340), hdrCell('Contact Info', C.NAVY, C.WHITE, 4680)] }),
                ...data.contacts.map((c, i) => new TableRow({ children: [dataCell(c.role, i%2?C.WHITE:C.LIGHT_GRAY, C.NAVY, 2340, true), dataCell(c.name, i%2?C.WHITE:C.LIGHT_GRAY, C.GRAY, 2340), dataCell(c.info, i%2?C.WHITE:C.LIGHT_GRAY, C.GRAY, 4680)] }))
            ]
        }));
    }

    // Step List
    children.push(h2('Execution Steps'));
    const stepRows = [new TableRow({ children: [hdrCell('#', C.BLUE, C.WHITE, 600), hdrCell('Action', C.BLUE, C.WHITE, 3500), hdrCell('Owner', C.BLUE, C.WHITE, 1200), hdrCell('Validation / Checkpoint', C.BLUE, C.WHITE, 4060)] })];
    (data.deployment_steps || []).forEach((s, i) => {
        const bg = i % 2 ? C.WHITE : 'F8FAFC';
        stepRows.push(new TableRow({
            children: [
                dataCell(s.seq || String(i+1), bg, C.GRAY, 600),
                new TableCell({ width: { size: 3500, type: WidthType.DXA }, shading: { fill: bg }, borders, margins: {left:120, right:120}, children: [
                    new Paragraph({ children: [new TextRun({ text: s.title, bold: true, color: C.NAVY, size: 19 })] }),
                    new Paragraph({ children: [new TextRun({ text: s.action, size: 18, color: C.GRAY })] })
                ]}),
                dataCell(s.owner, bg, C.GRAY, 1200),
                new TableCell({ width: { size: 4060, type: WidthType.DXA }, shading: { fill: s.is_stop_go ? C.LIGHT_AMBER : bg }, borders, margins: {left:120, right:120}, children: [
                    ...(s.is_stop_go ? [new Paragraph({ children: [new TextRun({ text: '🛑 STOP/GO DECISION POINT', bold: true, color: C.AMBER, size: 16 })] })] : []),
                    new Paragraph({ children: [new TextRun({ text: s.validation || '', size: 18, color: C.GRAY })] })
                ]})
            ]
        }));
    });
    children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [600, 3500, 1200, 4060], rows: stepRows }));

    // Rollback
    if (data.rollback_plan) {
        children.push(h2('Rollback Strategy', C.RED));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: C.LIGHT_RED }, borders: { left: { style: BorderStyle.SINGLE, size: 12, color: C.RED }, top: bdr, bottom: bdr, right: bdr },
                    margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [
                        new Paragraph({ children: [new TextRun({ text: 'TRIGGER: ' + (data.rollback_trigger || 'Deployment Failure'), bold: true, color: C.RED, size: 18 })] }),
                        para(data.rollback_plan, false, C.GRAY, 19)
                    ]
                })]
            })]
        }));
    }

    const doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            children: children
        }]
    });

    const blob = await Packer.toBlob(doc);
    return { blob, filename: (data.project_name || 'Ops').replace(/\s+/g, '_') + '_Runbook.docx' };
}
```

---

### 3. Update `main.js`
Add the HTML preview renderer to ensure users can see the "Stop/Go" points visually.

```javascript
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
```

### Data Schema Recommendation
To trigger this template, provide JSON like this:
```json
{
  "project_name": "Cloud Migrator V2",
  "ops_lead": "Jordan Smith",
  "deployment_date": "2025-05-20",
  "deployment_steps": [
    { "title": "Database Backup", "action": "Run pg_dump on prod-db-01", "owner": "DBA", "validation": "Verify .sql file size > 5GB" },
    { "title": "Stop Traffic", "action": "Drain ALB target groups", "owner": "SRE", "is_stop_go": true, "validation": "Confirm 0 active connections in CloudWatch" }
  ],
  "rollback_plan": "Restore database from backup and revert container image tag."
}
```