To implement the **Enhancement / User Story Technical Design** template, I will add the logic to detect the `story_id` key and render the specialized technical sections (Data Model, Security, Components) found in your test data.

### 1. Update `helper.js`
We need to add the routing and auto-detection for the `story_id` key.

**In `generate()` (approx. line 11):**
```javascript
else if (currentMode === 'storydesign') result = await generateStoryDesign(currentData);
```

**In `loadJSON()` (approx. line 45) - Add this above the `projectsummary` check:**
```javascript
else if (data.story_id) switchMode('storydesign');
```

**In `renderPreview()` (approx. line 68):**
```javascript
else if (currentMode === 'storydesign') el.innerHTML = renderStoryDesignPreview(data);
```

---

### 2. Update `template.js`
This function handles the Word document generation, focusing on the data model and implementation tables.

```javascript
async function generateStoryDesign(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, Header, Footer } = getDocx();

    const C = docxColors();
    const FONT = 'Arial';
    const CW = 9360;

    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

    function h2(t, color) { return new Paragraph({ spacing: { before: 240, after: 120 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.NAVY, size: 28, font: FONT })] }); }
    function para(t, bold, color, size) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })] }); }
    function hdrCell(t, bg, tc, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }

    const children = [];

    // Title Cover
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
            children: [new TableCell({
                shading: { fill: C.NAVY }, width: { size: CW, type: WidthType.DXA }, margins: { top: 360, bottom: 360, left: 360, right: 360 },
                children: [
                    new Paragraph({ children: [new TextRun({ text: 'TECHNICAL DESIGN DOCUMENT', bold: true, color: C.WHITE, size: 44, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: safeStr(data.story_id) + ' | ' + safeStr(data.title), color: 'AECBF0', size: 24, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: 'Requested by: ' + safeStr(data.requested_by) + ' | Created: ' + safeStr(data.created_date), color: 'C0D8F5', size: 19, font: FONT })] })
                ]
            })]
        })]
    }));

    // Overview
    children.push(h2('Requirement Summary'));
    children.push(para(data.summary, false, C.GRAY, 20));

    // Scope & Assumptions
    const scopeW = 3120;
    children.push(h2('Project Scope'));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [scopeW, scopeW, scopeW],
        rows: [
            new TableRow({ children: [hdrCell('In Scope', C.TEAL, C.WHITE, scopeW), hdrCell('Out of Scope', C.RED, C.WHITE, scopeW), hdrCell('Assumptions', C.BLUE, C.WHITE, scopeW)] }),
            new TableRow({ children: [
                dataCell((data.in_scope || []).join('\n'), C.WHITE, C.GRAY, scopeW),
                dataCell((data.out_of_scope || []).join('\n'), C.WHITE, C.GRAY, scopeW),
                dataCell((data.assumptions || []).join('\n'), C.WHITE, C.GRAY, scopeW)
            ]})
        ]
    }));

    // Data Model
    if ((data.data_model_changes || []).length) {
        children.push(h2('Data Model Changes'));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [2000, 2000, 5360],
            rows: [
                new TableRow({ children: [hdrCell('Table', C.NAVY, C.WHITE, 2000), hdrCell('Change Type', C.NAVY, C.WHITE, 2000), hdrCell('Details', C.NAVY, C.WHITE, 5360)] }),
                ...data.data_model_changes.map((dm, i) => new TableRow({ children: [
                    dataCell(dm.table, i%2?C.WHITE:C.LIGHT_GRAY, C.NAVY, 2000, true),
                    dataCell(dm.change, i%2?C.WHITE:C.LIGHT_GRAY, C.GRAY, 2000),
                    dataCell(dm.details, i%2?C.WHITE:C.LIGHT_GRAY, C.GRAY, 5360)
                ]}))
            ]
        }));
    }

    // Components
    if ((data.implementation_components || []).length) {
        children.push(h2('Implementation Components'));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [2000, 3000, 4360],
            rows: [
                new TableRow({ children: [hdrCell('Type', C.BLUE, C.WHITE, 2000), hdrCell('Name', C.BLUE, C.WHITE, 3000), hdrCell('Description', C.BLUE, C.WHITE, 4360)] }),
                ...data.implementation_components.map((c, i) => new TableRow({ children: [
                    dataCell(c.type, i%2?C.WHITE:C.LIGHT_GRAY, C.BLUE, 2000, true),
                    dataCell(c.name, i%2?C.WHITE:C.LIGHT_GRAY, C.GRAY, 3000),
                    dataCell(c.description, i%2?C.WHITE:C.LIGHT_GRAY, C.GRAY, 4360)
                ]}))
            ]
        }));
    }

    // Risks
    if ((data.risks || []).length) {
        children.push(h2('Risks & Mitigations', C.RED));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [4000, 1000, 4360],
            rows: [
                new TableRow({ children: [hdrCell('Risk', C.RED, C.WHITE, 4000), hdrCell('Impact', C.RED, C.WHITE, 1000), hdrCell('Mitigation', C.RED, C.WHITE, 4360)] }),
                ...data.risks.map((r, i) => new TableRow({ children: [
                    dataCell(r.description, i%2?C.WHITE:C.LIGHT_GRAY, C.GRAY, 4000),
                    dataCell(r.impact, i%2?C.WHITE:C.LIGHT_GRAY, C.RED, 1000, true),
                    dataCell(r.mitigation, i%2?C.WHITE:C.LIGHT_GRAY, C.GRAY, 4360)
                ]}))
            ]
        }));
    }

    const doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{ children: children }]
    });

    const blob = await Packer.toBlob(doc);
    return { blob, filename: data.story_id + '_Technical_Design.docx' };
}
```

---

### 3. Update `main.js`
Adding the preview renderer to handle the new story design layout.

```javascript
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
```
### Data Schema Recommendation
To trigger this template, provide JSON like this:
```json
{
  "story_id": "STRY0010091",
  "title": "Auto-route incidents based on CI + Service",
  "requested_by": "Customer IT",
  "product_owner": "PO Name",
  "created_date": "2026-04-25",
  "author": "Your Name",

  "summary": "Implement routing logic using CI/service mapping to reduce assignment delays.",
  "in_scope": [
    "Flow/BR for routing",
    "Update assignment group mapping table",
    "Unit + UAT support"
  ],
  "out_of_scope": [
    "Redesign of incident form UI"
  ],
  "assumptions": [
    "CMDB relationships are accurate for targeted services"
  ],

  "acceptance_criteria": [
    "Incidents with CI populated are routed within 30 seconds",
    "Fallback rule applies if CI missing"
  ],

  "design": {
    "overview": "Use Flow Designer for routing; fallback to BR for edge cases."
  },

  "data_model_changes": [
    { "table": "u_ci_service_map", "change": "New table", "details": "Maps CI class + service to assignment group" },
    { "table": "incident", "change": "Field update", "details": "Ensure business rule reads cmdb_ci + business_service" }
  ],

  "implementation_components": [
    { "type": "Flow", "name": "INC Auto Route", "description": "Routes on create/update when CI changes" },
    { "type": "Business Rule", "name": "INC Route Fallback", "description": "Runs if flow cannot determine group" }
  ],

  "security": [
    { "item": "ACL", "details": "Only ITIL can edit mapping table" },
    { "item": "Role", "details": "Create role x_app.mapping_admin" }
  ],

  "integrations": [
    { "system": "None", "details": "No external integration for this story" }
  ],

  "testing": {
    "test_cases": [
      { "id": "TC01", "scenario": "CI+Service match", "expected": "Assignment group set to mapped group" },
      { "id": "TC02", "scenario": "CI missing", "expected": "Fallback group used" }
    ]
  },

  "deployment_notes": [
    "Update set naming: STRY0010091_Routing",
    "Promote to TEST then PROD after UAT sign-off"
  ],

  "risks": [
    { "description": "Bad CMDB data may misroute incidents", "impact": "High", "mitigation": "Limit to 3 services initially + monitor" }
  ],

  "open_questions": [
    "Which services are in phase 1 rollout?"
  ]
}
```

### Verification
The `story_id` in your JSON now acts as the unique anchor. Because it is checked before `project_name` in `helper.js`, the system will correctly prioritize the **Story Design** template over the **Project Summary** template.