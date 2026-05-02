To ensure all sections of the **Enterprise Code Review Summary** are captured with full detail and rich-text support (nested lists, bold, italic), I will split this into three parts.

### Part 1: Detection Logic & JSON Schema

This part defines how the system identifies a Code Review document and the structure of the data it expects.

#### 1. Update `mode.config.js`
```
    {
        id: 'code_review',
        displayName: 'Code Review',
        icon: '⚙',
        generate: generateCodeReview,
        render: renderCodeReviewPreview,
        autoDetect: d => d.task_id && d.is_code_review,
    }
```

#### 2. Comprehensive JSON Schema
This schema is built to handle the "Rich Content" blocks (p, list, nested_list) for observations and technical notes.

```json
{
  "is_code_review": true,
  "title": "SLA Calculation Logic Enhancement",
  "task_id": "STORY10234",
  "author": "John Developer",
  "reviewers": "Sarah Smith (Lead), Mike Jones",
  "version": "1.2",
  "date": "May 01, 2026",
  "code_types": ["Business Rule", "Script Include"],
  
  "environment": {
    "envs": ["DEV", "TEST"],
    "change_type": "Enhancement",
    "update_set": "HR_SLA_Recalc_v1",
    "deployment_target": "PROD - June Release"
  },
  
  "overview": {
    "explanation": "This code handles the recalculation of SLA records when a priority override flag is toggled on the parent incident.",
    "scope": [
      "Triggered on: incident table",
      "Runs: After Update",
      "Condition: override_flag == true"
    ]
  },
  
  "summary_of_changes": {
    "major": [
      { "type": "p", "text": "Implemented central recalculation logic in SLAUtils.", "bold": true },
      { "type": "list", "items": ["Added override condition", "Added null validation"] }
    ],
    "minor": ["Refactored variable naming", "Improved indentation"],
    "tech_notes": [
      { "type": "p", "text": "Performance considerations:", "italic": true },
      { "type": "nested_list", "items": [
          { "text": "Guard Clauses", "sub_items": ["Immediate exit if no change detected"] },
          { "text": "GlideDateTime", "sub_items": ["Used for weekend exclusion logic"] }
      ]}
    ]
  },
  
  "code_sections": [
    {
      "title": "Business Rule Snippet",
      "snippet": "if (current.override_flag) {\n    SLAUtils.recalculate(current);\n}",
      "explanation": "This condition ensures recalculation only when override is enabled."
    }
  ],
  
  "observations": {
    "quality": ["✅ Clear naming", "⚠ Logging could be centralized"],
    "performance": ["No loops over large datasets", "Efficient conditional execution"],
    "security": ["No exposure of sensitive data"],
    "maintainability": ["Comments added", "Modular logic"],
    "risks": ["Weekend logic may require timezone testing"]
  },
  
  "testing": {
    "scenarios": [
      { "case": "High Priority", "result": "Pass" },
      { "case": "Override Flag", "result": "Pass" },
      { "case": "Weekend Case", "result": "Pass" }
    ],
    "atf_suite": "ATF_SLA_Calculation_v2"
  },
  
  "recommendations": [
    "Add unit test for timezone edge cases",
    "Consider moving logging to central utility"
  ],
  
  "approvals": [
    { "role": "Peer Reviewer", "name": "Sarah Smith", "status": "Pass", "date": "May 02", "comments": "Logic is sound." },
    { "role": "Tech Lead", "name": "Mike Jones", "status": "Approved", "date": "May 03", "comments": "" }
  ],
  
  "final_decision": "Approved with Minor Changes",
  "signature_name": "Sarah Smith",
  "signature_date": "May 03, 2026"
}
```

---

### Proceed to Part 2?
I am ready to provide the `generateCodeReview` function for `template.js`, which will handle the Word document tables, checkboxes, and rich text blocks.

### Part 2: Word Generator (`template.js`)

This function implements the **Enterprise Code Review Summary**. It features a modular rich-text parser to handle implementation notes and observation lists, and uses styled tables for code snippets and approvals.

```javascript
async function generateCodeReview(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, ShadingType } = getDocx();
    const C = docxColors();
    const CW = 9360; 

    const children = [];

    // --- INTERNAL RICH CONTENT HELPER ---
    const renderRichContent = (content) => {
        if (!content) return;
        const blocks = Array.isArray(content) ? content : [content];
        blocks.forEach(block => {
            if (typeof block === 'string') {
                children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(block), size: 18, color: C.GRAY })] }));
            } else if (block.type === 'p') {
                children.push(new Paragraph({
                    spacing: { before: 120, after: 120 },
                    children: [new TextRun({ text: safeStr(block.text), bold: !!block.bold, italic: !!block.italic, size: 18, color: C.GRAY })]
                }));
            } else if (block.type === 'list') {
                (block.items || []).forEach(item => {
                    children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(item), size: 18, color: C.GRAY })] }));
                });
            } else if (block.type === 'nested_list') {
                children.push(...renderNestedList(block.items, Paragraph, TextRun, C));
            }
        });
    };

    // --- 0. HEADER & TITLE ---
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [new TableRow({
            children: [new TableCell({
                shading: { fill: '1e293b', type: ShadingType.CLEAR },
                margins: { top: 400, bottom: 400, left: 400, right: 400 },
                children: [
                    new Paragraph({ children: [new TextRun({ text: "CODE REVIEW SUMMARY", bold: true, color: C.WHITE, size: 36 })] }),
                    new Paragraph({ children: [new TextRun({ text: safeStr(data.title), color: 'AECBF0', size: 22 })] }),
                    sp(200, 0),
                    new Paragraph({ children: [new TextRun({ text: `Task ID: ${safeStr(data.task_id)} | Author: ${safeStr(data.author)}`, color: C.WHITE, size: 18 })] }),
                    new Paragraph({ children: [new TextRun({ text: `Reviewer(s): ${safeStr(data.reviewers)} | Date: ${safeStr(data.date)}`, color: 'C0D8F5', size: 18 })] })
                ]
            })]
        })]
    }));

    // Code Types Checkboxes
    children.push(sp(200, 100));
    // update in template_main.helper.js if modifying these options
    const codeTypes = ["Business Rule", "Client Script", "Script Include", "Flow Designer", "UI Policy", "Scheduled Script", "Integration"];
    const typeRuns = codeTypes.map(t => {
        const checked = (data.code_types || []).includes(t);
        return new TextRun({ text: `${checked ? '☑' : '☐'} ${t}    `, size: 18, color: C.NAVY, bold: checked });
    });
    children.push(new Paragraph({ children: typeRuns }));

    // --- 1. ENVIRONMENT DETAILS ---
    children.push(h2("1. Environment Details"));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Environment(s)", C.GRAY, C.WHITE, 2500), dataCell((data.environment?.envs || []).join(', '), C.WHITE, C.GRAY, 6860)] }),
            new TableRow({ children: [hdrCell("Change Type", C.GRAY, C.WHITE, 2500), dataCell(safeStr(data.environment?.change_type), C.WHITE, C.GRAY, 6860)] }),
            new TableRow({ children: [hdrCell("Update Set / Branch", C.GRAY, C.WHITE, 2500), dataCell(safeStr(data.environment?.update_set), C.WHITE, C.GRAY, 6860)] }),
            new TableRow({ children: [hdrCell("Deployment Target", C.GRAY, C.WHITE, 2500), dataCell(safeStr(data.environment?.deployment_target), C.WHITE, C.GRAY, 6860)] })
        ]
    }));

    // --- 2. CODE OVERVIEW ---
    children.push(h2("2. Code Overview"));
    children.push(para(data.overview?.explanation, false, C.GRAY, 18));
    children.push(para("Scope:", true, C.NAVY, 18));
    (data.overview?.scope || []).forEach(s => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(s), size: 18 })] })));

    // --- 3. SUMMARY OF CHANGES ---
    children.push(h2("3. Summary of Changes"));
    children.push(para("Major Changes", true, C.NAVY, 18));
    renderRichContent(data.summary_of_changes?.major);
    children.push(para("Minor Adjustments", true, C.NAVY, 18));
    renderRichContent(data.summary_of_changes?.minor);
    children.push(para("Technical Notes", true, C.NAVY, 18));
    renderRichContent(data.summary_of_changes?.tech_notes);

    // --- 4. CODE SECTIONS ---
    children.push(h2("4. Code Section"));
    (data.code_sections || []).forEach((section, i) => {
        children.push(para(`4.${i + 1} ${section.title}`, true, C.NAVY, 20));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA },
            rows: [new TableRow({ children: [new TableCell({ shading: { fill: 'F1F5F9' }, margins: { left: 200, top: 100, bottom: 100 }, children: [new Paragraph({ children: [new TextRun({ text: section.snippet, font: 'Courier New', size: 16, color: C.NAVY })] })] })] })]
        }));
        children.push(para(section.explanation, false, C.GRAY, 17));
        sp(100, 100);
    });

    // --- 5. OBSERVATIONS ---
    children.push(h2("5. Observations"));
    const obs = data.observations || {};
    const renderObs = (label, list) => {
        children.push(para(label, true, C.GRAY, 18));
        (list || []).forEach(item => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(item), size: 18 })] })));
    };
    renderObs("Code Quality", obs.quality);
    renderObs("Performance", obs.performance);
    renderObs("Security", obs.security);
    renderObs("Risks Identified", obs.risks);

    // --- 6. TESTING VALIDATION ---
    children.push(h2("6. Testing Validation"));
    const testRows = [new TableRow({ children: [hdrCell("Scenario", C.NAVY, C.WHITE, 7000), hdrCell("Result", C.NAVY, C.WHITE, 2360)] })];
    (data.testing?.scenarios || []).forEach(s => {
        testRows.push(new TableRow({ children: [dataCell(s.case, C.WHITE, C.GRAY, 7000), dataCell(s.result, C.WHITE, s.result === 'Pass' ? C.GREEN : C.RED, 2360, true)] }));
    });
    children.push(new Table({ width: { size: CW, type: WidthType.DXA }, rows: testRows }));
    children.push(para(`ATF Suite: ${data.testing?.atf_suite || 'N/A'}`, true, C.GRAY, 16));

    // --- 8. APPROVAL SECTION ---
    children.push(h2("8. Approval Section"));
    const appRows = [new TableRow({ children: [hdrCell("Role", C.NAVY, C.WHITE, 2000), hdrCell("Name", C.NAVY, C.WHITE, 2000), hdrCell("Status", C.NAVY, C.WHITE, 1500), hdrCell("Date", C.NAVY, C.WHITE, 1200), hdrCell("Comments", C.NAVY, C.WHITE, 2660)] })];
    (data.approvals || []).forEach(a => {
        appRows.push(new TableRow({ children: [dataCell(a.role, C.WHITE, C.NAVY, 2000, true), dataCell(a.name, C.WHITE, C.GRAY, 2000), dataCell(a.status, C.WHITE, C.GRAY, 1500), dataCell(a.date, C.WHITE, C.GRAY, 1200), dataCell(a.comments, C.WHITE, C.GRAY, 2660)] }));
    });
    children.push(new Table({ width: { size: CW, type: WidthType.DXA }, rows: appRows }));

    // --- 9. FINAL DECISION ---
    children.push(h2("9. Final Decision"));
    // update in template_main.helper.js if modifying these options
    const decisions = ["Approved", "Approved with Minor Changes", "Requires Rework", "Rejected"]; 
    decisions.forEach(d => {
        const isSelected = data.final_decision === d;
        children.push(new Paragraph({ children: [new TextRun({ text: isSelected ? "☑ " : "☐ ", size: 20, bold: true }), new TextRun({ text: d, size: 18 })] }));
    });
    sp(200, 0);
    children.push(para(`Reviewer Signature: ____________________  Date: ${safeStr(data.signature_date)}`, true, C.NAVY, 18));

    const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children }] });
    const blob = await Packer.toBlob(doc);
    return { blob, filename: `CodeReview_${data.task_id}.docx` };
}
```

**Next:** I will provide **Part 3: HTML Previewer (`main.js`)** to complete the template.

### Part 3: HTML Previewer (`main.js`)

This implementation provides the visual rendering for the **Enterprise Code Review Summary**. It uses a recursive `rich()` helper to ensure that the Summary of Changes and Technical Notes maintain their formatting, and uses specific styling for the Code Sections and Approval tables.

```javascript
function renderCodeReviewPreview(data) {
    // --- INTERNAL RICH CONTENT ENGINE ---
    const rich = (content) => {
        if (!content) return '';
        if (typeof content === 'string') return `<p>${escHtml(content)}</p>`;

        if (Array.isArray(content)) {
            return content.map(block => {
                if (typeof block === 'string') return `<li>${escHtml(block)}</li>`;
                if (block.type === 'p') {
                    const style = `${block.bold ? 'font-weight:bold;' : ''} ${block.italic ? 'font-style:italic;' : ''}`;
                    return `<p style="${style} color:#475569; margin: 8px 0;">${escHtml(block.text)}</p>`;
                }
                if (block.type === 'list') {
                    return `<ul style="margin: 8px 0;">${(block.items || []).map(i => `<li>${escHtml(i)}</li>`).join('')}</ul>`;
                }
                if (block.type === 'nested_list') {
                    const renderUl = (items) => `
                        <ul style="margin: 4px 0;">
                            ${items.map(i => `
                                <li>
                                    ${escHtml(i.text || i)}
                                    ${i.sub_items ? renderUl(i.sub_items) : ''}
                                </li>
                            `).join('')}
                        </ul>`;
                    return renderUl(block.items || []);
                }
                return '';
            }).join('');
        }
        return '';
    };

    let html = `
        <div class="doc-cover" style="background:#1e293b;">
            <div style="color:#94a3b8; font-size: 12px; letter-spacing: 2px; margin-bottom: 10px;">CODE REVIEW</div>
            <div class="doc-cover-title" style="border:none; padding:0;">${escHtml(data.task_id)} - ${escHtml(data.title)}</div>
            
            <div style="color:#94A3B8; font-size:14px;">
                <strong>Developer:</strong> ${escHtml(data.author)} | <strong>Reviewer(s):</strong> ${escHtml(data.reviewers)}<br/>
                <strong>Date:</strong> ${escHtml(data.date)} | <strong>Version:</strong> ${escHtml(data.version)}
            </div>
        </div>

        <!-- CODE TYPES CHECKBOXES -->
        <!-- update in template.js if modifying these options -->
        <div style="display:flex; flex-wrap:wrap; gap:15px; margin: 20px 0; padding: 15px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
            ${["Business Rule", "Client Script", "Script Include", "Flow Designer", "UI Policy", "Scheduled Script", "Integration", "Email Script", "Data Policy", "UI Page", "Other"].map(t => {
        const checked = (data.code_types || []).includes(t);
        return `<div style="font-size:12px; opacity:${checked ? 1 : 0.4}; font-weight:${checked ? 'bold' : 'normal'}">
                    ${checked ? '☑' : '☐'} ${t}
                </div>`;
    }).join('')}
        </div>

        <!-- 1. ENVIRONMENT DETAILS -->
        <div class="doc-section-title">1. Environment Details</div>
        <table class="doc-table">
            <tbody>
                <tr><td style="width:200px;">Environment(s)</td><td>${(data.environment?.envs || []).join(', ')}</td></tr>
                <tr><td>Type</td><td>${escHtml(data.environment?.change_type)}</td></tr>
                <tr><td>Update Set / Branch</td><td style="font-family:monospace; font-size:11px;">${escHtml(data.environment?.update_set)}</td></tr>
                <tr><td>Deployment Target</td><td>${escHtml(data.environment?.deployment_target)}</td></tr>
            </tbody>
        </table>

        <!-- 2. CODE OVERVIEW -->
        <div class="doc-section-title">2. Code Overview</div>
        <div class="callout blue">
            ${escHtml(data.overview?.explanation)}
            <ul style="margin-top:10px; font-size:0.9em;">
                ${(data.overview?.scope || []).map(s => `<li>${escHtml(s)}</li>`).join('')}
            </ul>
        </div>

        <!-- 3. SUMMARY OF CHANGES -->
        <div class="doc-section-title">3. Summary of Changes</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <strong style="color:#1e293b; font-size:0.9em;">Major Changes</strong>
                ${rich(data.summary_of_changes?.major)}
            </div>
            <div>
                <strong style="color:#1e293b; font-size:0.9em;">Minor Adjustments</strong>
                ${rich(data.summary_of_changes?.minor)}
            </div>
        </div>
        <div style="margin-top:15px; padding-top:15px; border-top:1px dashed #e2e8f0;">
             <strong style="color:#1e293b; font-size:0.9em;">Technical Notes</strong>
             ${rich(data.summary_of_changes?.tech_notes)}
        </div>

        <!-- 4. CODE SECTIONS -->
        <div class="doc-section-title">4. Code Section</div>
        ${(data.code_sections || []).map((section, i) => `
            <div style="margin-bottom:25px;">
                <div style="font-weight:bold; color:#1e293b; margin-bottom:5px;">4.${i + 1} ${escHtml(section.title)}</div>
                <pre style="background:#f1f5f9; border-left:4px solid #1e293b; padding:15px; font-size:11px; color:#1e293b; overflow-x:auto;">${escHtml(section.snippet)}</pre>
                <div style="font-size:12px; color:#64748b; font-style:italic;">${escHtml(section.explanation)}</div>
            </div>
        `).join('')}

        <!-- 5. OBSERVATIONS -->
        <div class="doc-section-title">5. Observations</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="callout teal"><strong>Code Quality:</strong> <ul>${(data.observations?.quality || []).map(o => `<li>${escHtml(o)}</li>`).join('')}</ul></div>
            <div class="callout blue"><strong>Performance:</strong> <ul>${(data.observations?.performance || []).map(o => `<li>${escHtml(o)}</li>`).join('')}</ul></div>
        </div>
        <div class="callout amber" style="margin-top:15px;"><strong>Risks Identified:</strong> <ul>${(data.observations?.risks || []).map(o => `<li>${escHtml(o)}</li>`).join('')}</ul></div>

        <!-- 6. TESTING VALIDATION -->
        <div class="doc-section-title">6. Testing Validation</div>
        <table class="doc-table">
            <thead><tr><th class="th-navy">Scenario</th><th class="th-navy" style="width:100px;">Result</th></tr></thead>
            <tbody>
                ${(data.testing?.scenarios || []).map(s => `
                    <tr>
                        <td>${escHtml(s.case)}</td>
                        <td style="text-align:left;">
                            <span style="background:${s.result === 'Pass' ? '#dcfce7' : '#fee2e2'}; color:${s.result === 'Pass' ? '#166534' : '#991b1b'}; padding:2px 8px; border-radius:10px; font-weight:bold; font-size:10px;">
                                ${escHtml(s.result.toUpperCase())}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="font-size:11px; margin-top:5px; color:#64748b;"><strong>ATF Suite:</strong> ${escHtml(data.testing?.atf_suite)}</div>

        <!-- 8. APPROVAL SECTION -->
        <div class="doc-section-title">8. Approval Section</div>
        <table class="doc-table">
                    <thead><tr><th class="th-navy">Role</th><th class="th-navy">Name</th><th class="th-navy">Status</th><th class="th-navy">Date</th></tr></thead>
            <tbody>
                ${(data.approvals || []).map(a => `
                    <tr><td><strong>${escHtml(a.role)}</strong></td><td>${escHtml(a.name)}</td><td>${escHtml(a.status)}</td><td>${escHtml(a.date)}</td></tr>
                `).join('')}
            </tbody>
        </table>

<!-- 9. FINAL DECISION -->
    <div class="doc-section-title">9. Final Decision</div>
    <div>
        <!-- Call the function to generate the dynamic content -->
        ${renderFinalDecision(data)}

        <!-- The signature line remains the same for all cases -->
        <div style="font-size:12px; color:#64748b; margin-top: 10px;">
            Reviewer(s): ${escHtml(data.signature_name)} | Date: ${escHtml(data.signature_date)}
        </div>
    </div>
        <div style="margin-top:30px; padding-top:20px; border-top:1px solid #e2e8f0; text-align:center; font-size:10px; color:#94a3b8;">
            CONFIDENTIAL CODE REVIEW SUMMARY | GENERATED ON ${new Date().toLocaleDateString()}
        </div>
    `;
    return html;
}
```

### Why this works:
1.  **Contextual Coloring**: Uses slate/navy (`#1e293b`) for the enterprise feel, with semantic colors (Green/Red) for test results to allow reviewers to quickly identify failures.
2.  **Rich Formatting**: The `rich()` engine handles complex technical notes, ensuring that bolded sub-points or nested bullet lists from the JSON are rendered correctly in the browser preview.
3.  **Audit Ready**: The final decision section is styled as a "Stamp" of approval, making it very clear for governance boards whether the code was accepted or requires rework.
4.  **Code Legibility**: Uses a monospace font and specific padding for snippets, making it easier for developers to read the reviewed logic without downloading the Word file.

I apologize for that oversight. I skipped **Section 7: Recommendations** in both the Word and HTML logic.

Here are the corrected snippets for both parts to ensure the document is complete.

### Corrected Part 2: Word Generator Snippet (`template.js`)
Insert this block between Section 6 (Testing) and Section 8 (Approvals):

```javascript
    // --- 6. TESTING VALIDATION ---
    // (Existing testing code here...)

    // --- 7. RECOMMENDATIONS ---
    children.push(h2("7. Recommendations"));
    if (data.recommendations && data.recommendations.length > 0) {
        renderRichContent(data.recommendations);
    } else {
        children.push(para("No specific recommendations at this time.", false, C.GRAY, 18));
    }

    // --- 8. APPROVAL SECTION ---
    // (Existing approvals code here...)
```

---

### Corrected Part 3: HTML Previewer Snippet (`main.js`)
Insert this block between Section 6 (Testing) and Section 8 (Approvals):

```javascript
        <!-- 6. TESTING VALIDATION -->
        <!-- (Existing testing code here...) -->

        <!-- 7. RECOMMENDATIONS -->
        <div class="doc-section-title">7. Recommendations</div>
        <div class="callout teal">
            ${data.recommendations && data.recommendations.length > 0 
                ? rich(data.recommendations) 
                : '<p>No specific recommendations at this time.</p>'}
        </div>

        <!-- 8. APPROVAL SECTION -->
        <!-- (Existing approvals code here...) -->
```

### Why this section is critical:
In an Enterprise Code Review, the **Recommendations** section is where the reviewer suggests long-term architectural improvements (e.g., "Move this to a central Script Include" or "Add a system property for this hardcoded value"). Even if the code is **Approved**, these recommendations often become separate technical debt stories. 

By including this in the template, you ensure that the "Senior Engineer's" advice is captured for future sprints.