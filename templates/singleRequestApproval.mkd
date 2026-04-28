To implement these two new template **Single Implementation Approval**, I will add the logic to `helper.js`, `template.js`, and `main.js`.

### 1. Update `helper.js` (Routing & Auto-Detection)

We define new mode: `approval`.

**In `generate()`:**
```javascript
else if (currentMode === 'approval') result = await generateApprovalRequest(currentData);
```

**In `loadJSON()` (Detection Logic):**
```javascript
// Single Approval Detection
else if (data.task_num && data.proposed_change) switchMode('approval');
```

**In `renderPreview()`:**
```javascript
else if (currentMode === 'approval') el.innerHTML = renderApprovalPreview(data);
```

---

### 1. Updated JSON Schema for Single Approval
To support nested lists, rich text (bold/italic), and links within a single cohesive “Requirements” section that works for both single and bulk templates, we will use a Recursive List Processor.

```json
{
  "signoff_id": "ENHC001092",
  "title": "Automated Service Catalog Routing",
  "category": "User Story",
  "objective": "Streamline request fulfillment by routing to local teams based on user location.",
  "details": "We will implement a lookup on the 'cmn_location' table to identify the 'Support Group' associated with the requester's building.",
  "impact": "Reduces manual triage time by 45%.",
  "effort": "16 Hours",
  "requirements": [
    "User must have a building populated on their profile.",
    {
      "text": "Requirement: The 'Support Group' field must be mandatory.",
      "bold": true
    },
    {
      "text": "Note: This logic applies to top 5 items only.",
      "italic": true
    },
    {
      "text": "Nested Condition Example:",
      "sub_items": [
        "Sub-item 1: Verification step",
        {
          "text": "Sub-item 2: Deep Link",
          "url": "https://company.wiki"
        }
      ]
    },
    {
      "text": "Refer to the mapping document",
      "url": "https://company.wiki/map"
    }
  ]
}

```

---

### 2. Update `template.js` (Web Generator)
Generalized Sign-Off Template

```javascript
async function generateSignOffRequest(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType } = getDocx();
    const C = docxColors(); const FONT = 'Arial'; const CW = 9360;
    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

    function h2(t, color) { return new Paragraph({ spacing: { before: 240, after: 120 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.NAVY, size: 26, font: FONT })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }

    const children = [
        // Cover Header
        new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: C.NAVY }, width: { size: CW, type: WidthType.DXA }, margins: { top: 320, bottom: 320, left: 320, right: 320 },
                    children: [
                        new Paragraph({ children: [new TextRun({ text: 'IMPLEMENTATION SIGN-OFF REQUEST', bold: true, color: C.WHITE, size: 36, font: FONT })] }),
                        new Paragraph({ children: [new TextRun({ text: safeStr(data.signoff_id) + ' | ' + safeStr(data.title), color: 'AECBF0', size: 22, font: FONT })] }),
                    ]
                })]
            })]
        }),

        h2('Executive Overview'),
        new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'Objective: ', bold: true, size: 20 }), new TextRun({ text: data.objective, size: 20, color: C.GRAY })] }),

        h2('Proposed Implementation Detail'),
        new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: 'F8FAFC' }, borders: { left: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, top: bdr, bottom: bdr, right: bdr },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: data.details, size: 19, color: C.GRAY })] })]
                })]
            })]
        }),

        h2('Impact & Resources'),
        new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [2340, 7020], rows: [
                new TableRow({ children: [dataCell('Functional Impact', 'F8FAFC', C.NAVY, 2340, true), dataCell(data.impact, 'F8FAFC', C.GRAY, 7020)] }),
                new TableRow({ children: [dataCell('Effort/Resources', C.WHITE, C.NAVY, 2340, true), dataCell(data.effort, C.WHITE, C.GRAY, 7020)] })
            ]
        })
    ];

    // --- Requirements Section (New Standalone Logic) ---
    if ((data.requirements || []).length) {
        children.push(h2('REQUIREMENTS & CRITERIA'));
        children.push(...renderNestedList(data.requirements, Paragraph, TextRun, C));
    }


    children.push(h2('Authorization Sign-Off', C.NAVY));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [4680, 4680], rows: [
            new TableRow({ children: [dataCell('Approver Name & Role', C.WHITE, C.NAVY, 4680, true), dataCell('Date & Signature', C.WHITE, C.NAVY, 4680, true)] }),
            new TableRow({ children: [new TableCell({ borders, height: { value: 1000, rule: 'atLeast' }, children: [] }), new TableCell({ borders, height: { value: 1000, rule: 'atLeast' }, children: [] })] })
        ]
    }));

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    return { blob, filename: data.signoff_id + '_SignOff.docx' };
}
```

---

### 3. Update `main.js` (Web Preview)

```javascript
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
