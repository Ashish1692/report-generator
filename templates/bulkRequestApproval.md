To implement these two new templates **Comprehensive Bulk Approval**, I will add the logic to `helper.js`, `template.js`, and `main.js`.

### 1. Update `helper.js` (Routing & Auto-Detection)

We define new mode: `bulkapproval`.

**In `generate()`:**
```javascript
else if (currentMode === 'bulkapproval') result = await generateBulkApprovalRequest(currentData);
```

**In `loadJSON()` (Detection Logic):**
```javascript
// Bulk Approval Detection
else if (data.approval_tasks && data.project_name) switchMode('bulkapproval');
```

**In `renderPreview()`:**
```javascript
else if (currentMode === 'bulkapproval') el.innerHTML = renderBulkApprovalPreview(data);
```

---

### 1. Updated JSON Schema for Bulk Approval
Each task in the `approval_tasks` array now supports the same rich `requirements` logic we built for the single template.

```json
{
  "project_name": "Q4 IT Service Desk Upgrades",
  "release_title": "Release Bundle - November",
  "approval_tasks": [
    {
      "num": "ENHC0013",
      "title": "Service Catalog Hardware Request Revamp",
      "objective": "Streamline the hardware request process for new hires.",
      "details": "Combine laptop, monitor, and accessory requests into a single dynamic form using conditional logic.",
      "effort": "12 Hours",
      "requirements": [
        "Hardware models must be pulled dynamically from the CMDB.",
        {
          "text": "Requirement: Manager approval workflow must be strictly enforced.",
          "bold": true
        },
        {
          "text": "Condition Rules:",
          "sub_items": [
            "If 'Developer' is selected, automatically add a secondary monitor.",
            {
              "text": "List of approved developer models",
              "url": "https://company.wiki/hardware/dev"
            }
          ]
        }
      ]
    },
    {
      "num": "STRY0056",
      "title": "Automated Password Reset Flow",
      "objective": "Reduce Tier 1 helpdesk tickets related to password resets.",
      "details": "Implement self-service password reset using Okta integration with an SMS or Email MFA challenge.",
      "effort": "20 Hours",
      "requirements": [
        "User must have a valid recovery email or phone number registered.",
        {
          "text": "Note: SMS gateway limits apply to international numbers.",
          "italic": true
        },
        {
          "text": "Refer to the Okta API specification",
          "url": "https://company.wiki/okta-integration"
        }
      ]
    },
    {
      "num": "DFCT0089",
      "title": "Fix Executive Dashboard Rendering Issues",
      "objective": "Ensure weekly performance charts render correctly on tablet devices.",
      "details": "Update the charting library and adjust CSS flexbox properties to prevent overlapping legends on iPad Pro viewports.",
      "effort": "6 Hours",
      "requirements": [
        "Must be tested on iOS 16+.",
        {
          "text": "Critical: Existing report data must not be altered or lost.",
          "bold": true
        },
        {
          "text": "Regression Testing Scope:",
          "sub_items": [
            "Verify standard desktop view remains intact.",
            "Check dark mode compatibility."
          ]
        }
      ]
    }
  ]
}
```

---

### 2. Update `template.js` (Bulk Generator)
Designed for a “Release Bundle” or multiple story sign-off.

```javascript
async function generateBulkApprovalRequest(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType } = getDocx();
    const C = docxColors(); const FONT = 'Arial'; const CW = 9360;
    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

    function h2(t, color) { return new Paragraph({ spacing: { before: 240, after: 120 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.NAVY, size: 26, font: FONT })] }); }
    function hdrCell(t, bg, tc, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }

    const children = [
        new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: '1A6B6B' }, width: { size: CW, type: WidthType.DXA }, margins: { top: 360, bottom: 360, left: 360, right: 360 },
                    children: [
                        new Paragraph({ children: [new TextRun({ text: 'COMPREHENSIVE APPROVAL PACKAGE', bold: true, color: C.WHITE, size: 36, font: FONT })] }),
                        new Paragraph({ children: [new TextRun({ text: safeStr(data.project_name) + ' | ' + safeStr(data.release_title), color: 'AEE0E0', size: 22, font: FONT })] }),
                        new Paragraph({ children: [new TextRun({ text: 'Total Items for Sign-Off: ' + (data.approval_tasks || []).length, color: 'C0F5F5', size: 18, font: FONT })] })
                    ]
                })]
            })]
        }),
        h2('Executive Summary Table', '1A6B6B'),
        new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [1500, 5860, 2000], rows: [
                new TableRow({ children: [hdrCell('ID', '1A6B6B', C.WHITE, 1500), hdrCell('Title / Objective', '1A6B6B', C.WHITE, 5860), hdrCell('Effort', '1A6B6B', C.WHITE, 2000)] }),
                ...data.approval_tasks.map((tk, i) => new TableRow({
                    children: [
                        dataCell(tk.num, i % 2 ? C.WHITE : C.LIGHT_GRAY, '1A6B6B', 1500, true),
                        dataCell(tk.title, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 5860),
                        dataCell(tk.effort, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2000)
                    ]
                }))
            ]
        })
    ];

    data.approval_tasks.forEach(tk => {
        children.push(new Paragraph({ pageBreakBefore: true, children: [] }));
        children.push(h2(`Detail: ${tk.num} — ${tk.title}`, '1A6B6B'));
        children.push(new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'Objective: ', bold: true, size: 20 }), new TextRun({ text: tk.objective, size: 20, color: C.GRAY })] }));

        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: 'F8FAFC' }, borders: { left: { style: BorderStyle.SINGLE, size: 8, color: '1A6B6B' }, top: bdr, bottom: bdr, right: bdr },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: tk.details, size: 18, color: C.GRAY })] })]
                })]
            })]
        }));

        // --- NEW RECURSIVE LOGIC FOR WORD ---
        if ((tk.requirements || []).length) {
            children.push(new Paragraph({ spacing: { before: 160 }, children: [new TextRun({ text: 'Specific Requirements & Acceptance Criteria:', bold: true, size: 19, color: '1A6B6B' })] }));
            // Call the recursive helper
            children.push(...renderNestedList(tk.requirements, Paragraph, TextRun, C));
        }
    });

    children.push(new Paragraph({ pageBreakBefore: true, children: [] }));
    children.push(h2('Authorization Sign-Off', '1A6B6B'));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [4680, 4680], rows: [
            new TableRow({ children: [hdrCell('Approver Name & Role', C.WHITE, '1A6B6B', 4680, true), hdrCell('Date & Signature', C.WHITE, '1A6B6B', 4680, true)] }),
            new TableRow({ children: [new TableCell({ borders, height: { value: 1200, rule: 'atLeast' }, children: [] }), new TableCell({ borders, height: { value: 1200, rule: 'atLeast' }, children: [] })] })
        ]
    }));

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    return { blob, filename: 'Bulk_Approval_' + data.project_name.replace(/\s/g, '_') + '.docx' };
}
```

---

### 3. Update `main.js` (Bulk Preview)

```javascript
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
```
### 4. The Helper Functions
They handle the "infinite nesting" logic.

```javascript
// Helper for Recursive Word Lists
function renderNestedList(items, Paragraph, TextRun, C, level = 0) {
    let nodes = [];
    items.forEach(item => {
        const isObj = typeof item === 'object' && item !== null;
        const text = isObj ? item.text : item;
        nodes.push(new Paragraph({
            bullet: { level: level },
            spacing: { before: 40, after: 40 },
            children: [new TextRun({
                text: text,
                bold: isObj && item.bold,
                italics: isObj && item.italic,
                color: isObj && item.url ? '2563EB' : C.GRAY,
                underline: isObj && item.url ? {} : null,
                size: 18, font: 'Arial'
            })]
        }));
        if (isObj && item.sub_items) {
            nodes = nodes.concat(renderNestedList(item.sub_items, Paragraph, TextRun, C, level + 1));
        }
    });
    return nodes;
}

// Helper for Recursive HTML Preview
function renderPreviewList(items) {
    if (!items || !items.length) return '';
    let html = '<ul style="padding-left:18px; margin:0; font-size:12px; color:#334155; list-style-type: disc;">';
    items.forEach(item => {
        const isObj = typeof item === 'object' && item !== null;
        const text = isObj ? escHtml(item.text) : escHtml(item);
        let style = isObj && item.bold ? 'font-weight:700;' : '';
        if (isObj && item.italic) style += 'font-style:italic;';
        let content = isObj && item.url
            ? `<a href="${escHtml(item.url)}" target="_blank" style="color:#2563eb; text-decoration:none; font-weight:600;">${text} ↗</a>`
            : `<span style="${style}">${text}</span>`;
        html += `<li style="margin-bottom:4px;">${content}`;
        if (isObj && item.sub_items) html += renderPreviewList(item.sub_items);
        html += `</li>`;
    });
    html += '</ul>';
    return html;
}
```
