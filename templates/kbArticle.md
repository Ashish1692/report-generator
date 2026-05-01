I apologize for the oversight. I will now provide the full implementation of all **11 sections** exactly as defined in your `kb.md` file, for both the Word generator and the HTML previewer.

### 1. Detection Logic (`helper.js`)

```javascript
// In loadJSON()
else if (data.kb_id && data.occurrence_history) switchMode('kbarticle');

// In generate()
else if (currentMode === 'kbarticle') result = await generateKBArticle(currentData);

// In renderPreview()
else if (currentMode === 'kbarticle') el.innerHTML = renderKBArticlePreview(data);
```

---

### 2. Word Generator (`template.js`)
This version explicitly creates **11 distinct sections** with the exact headers and table structures from your KB mockup.

```javascript
async function generateKBArticle(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType } = getDocx();
    const C = docxColors();
    const CW = 9360;

    const children = [];

    // --- TITLE BLOCK ---
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [new TableRow({
            children: [new TableCell({
                shading: { fill: '334155', type: ShadingType.CLEAR },
                margins: { top: 300, bottom: 300, left: 400, right: 400 },
                children: [
                    new Paragraph({ children: [new TextRun({ text: "KNOWLEDGE ARTICLE", bold: true, color: C.WHITE, size: 32 })] }),
                    new Paragraph({ children: [new TextRun({ text: `Category: ${safeStr(data.category)} | System: ${safeStr(data.system)}`, color: 'AECBF0', size: 18 })] }),
                    sp(200, 100),
                    new Paragraph({ children: [new TextRun({ text: `KB ID: ${safeStr(data.kb_id)} | Owner: ${safeStr(data.owner)}`, color: C.WHITE, size: 18 })] }),
                    new Paragraph({ children: [new TextRun({ text: `Last Updated: ${safeStr(data.last_updated)} | Status: ${safeStr(data.overall_status)}`, color: 'C0D8F5', size: 18 })] }),
                    sp(100, 0),
                    new Paragraph({ children: [new TextRun({ text: `Severity: ${safeStr(data.severity)} | Frequency: ${safeStr(data.frequency)}`, color: C.WHITE, size: 18 })] })
                ]
            })]
        })]
    }));

    // 1. Issue Summary (Plain Language)
    children.push(h2("1. Issue Summary (Plain Language)"));
    children.push(para("What is happening?", true, C.NAVY, 20));
    children.push(para(data.summary_what, false, C.GRAY, 18));
    children.push(para("Who is affected?", true, C.NAVY, 20));
    (data.summary_who || []).forEach(who => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(who), size: 18 })] })));

    // 2. Technical Description
    children.push(h2("2. Technical Description"));
    children.push(para("Root Cause:", true, C.NAVY, 18));
    children.push(para(data.technical_root_cause, false, C.GRAY, 18));
    if (data.technical_error_log) {
        children.push(para("Error Log:", true, C.NAVY, 18));
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, rows: [new TableRow({ children: [new TableCell({ shading: { fill: C.LIGHT_GRAY }, margins: { left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: data.technical_error_log, font: 'Courier New', size: 16 })] })] })] })] }));
    }
    children.push(para(`Related Update Set: ${data.technical_update_set || 'N/A'}`, true, C.GRAY, 17));

    // 3. Impact Assessment
    children.push(h2("3. Impact Assessment"));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Impact Type", C.NAVY, C.WHITE, 2500), hdrCell("Description", C.NAVY, C.WHITE, 6860)] }),
            ...(data.impact_assessment || []).map(i => new TableRow({ children: [dataCell(i.type, C.WHITE, C.NAVY, 2500, true), dataCell(i.desc, C.WHITE, C.GRAY, 6860)] }))
        ]
    }));

    // 4. Resolution Steps
    children.push(h2("4. Resolution Steps"));
    children.push(para("Immediate Fix (Short-Term):", true, C.GREEN, 18));
    (data.res_short_term || []).forEach((s, i) => children.push(para(`${i + 1}. ${s}`, false, C.GRAY, 18)));
    sp(100, 100);
    children.push(para("Permanent Fix:", true, C.BLUE, 18));
    (data.res_permanent || []).forEach((s, i) => children.push(para(`${i + 1}. ${s}`, false, C.GRAY, 18)));

    // 5. Escalation
    children.push(h2("5. Escalation"));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Scenario", C.NAVY, C.WHITE, 3000), hdrCell("Contact", C.NAVY, C.WHITE, 3000), hdrCell("Channel", C.NAVY, C.WHITE, 3360)] }),
            ...(data.escalation_path || []).map(e => new TableRow({ children: [dataCell(e.scenario, C.WHITE, C.NAVY, 3000), dataCell(e.contact, C.WHITE, C.GRAY, 3000), dataCell(e.channel, C.WHITE, C.GRAY, 3360)] }))
        ]
    }));

    // 6. Occurrence History
    children.push(h2("6. Occurrence History"));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Date", C.NAVY, C.WHITE, 1200), hdrCell("Record ID", C.NAVY, C.WHITE, 1200), hdrCell("Type", C.NAVY, C.WHITE, 1200), hdrCell("Env", C.NAVY, C.WHITE, 800), hdrCell("Resolution Applied", C.NAVY, C.WHITE, 4960)] }),
            ...(data.occurrence_history || []).map(h => new TableRow({ children: [dataCell(h.date, C.WHITE, C.GRAY, 1200), dataCell(h.id, C.WHITE, C.NAVY, 1200, true), dataCell(h.type, C.WHITE, C.GRAY, 1200), dataCell(h.env, C.WHITE, C.GRAY, 800), dataCell(h.res, C.WHITE, C.GRAY, 4960)] }))
        ]
    }));

    // 7. Common Triggers
    children.push(h2("7. Common Triggers"));
    (data.triggers || []).forEach(t => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(t), size: 18 })] })));

    // 8. Affected Personas
    children.push(h2("8. Affected Personas"));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Persona", C.NAVY, C.WHITE, 2500), hdrCell("How They Are Impacted", C.NAVY, C.WHITE, 6860)] }),
            ...(data.personas || []).map(p => new TableRow({ children: [dataCell(p.name, C.WHITE, C.NAVY, 2500, true), dataCell(p.impact, C.WHITE, C.GRAY, 6860)] }))
        ]
    }));

    // 9. Related Records
    (data.related_records || []).forEach(r => {
        children.push(para(r.category, true, C.NAVY, 18));
        (r.links || []).forEach(l => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(l), color: C.BLUE, size: 17 })] })));
    });

    // 10. Monitoring & Prevention
    children.push(h2("10. Monitoring & Prevention"));
    (data.prevention_steps || []).forEach(step => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(step), size: 18 })] })));

    // 11. Status
    children.push(h2("11. Status"));
    const flags = ["Known Error", "Workaround Available", "Permanent Fix Released", "Monitoring Active"];
    flags.forEach(f => {
        const checked = (data.status_flags || []).includes(f);
        children.push(new Paragraph({ children: [new TextRun({ text: checked ? "☑ " : "☐ ", size: 20, bold: true }), new TextRun({ text: f, size: 18 })] }));
    });

    const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children }] });
    const blob = await Packer.toBlob(doc);
    return { blob, filename: `${data.kb_id}.docx` };
}
```

---

### 3. HTML Previewer (`main.js`)
This version maps all **11 sections** using your design system's CSS classes.

```javascript
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
```

### Complete 11-Section JSON Sample
```json
{
  "category": "Known Error / Recurring Issue",
  "system": "HR Case Management",
  "kb_id": "KB001234",
  "owner": "Platform Team",
  "last_updated": "May 01, 2026",
  "overall_status": "Active",
  "severity": "Medium",
  "frequency": "3–5 times per month",
  "summary_what": "Users receive 'Unexpected error occurred' during HR case submission.",
  "summary_who": ["HR Agents", "End Users submitting forms", "Occurs mostly Monday mornings"],
  "technical_root_cause": "SLA business rule null pointer exception when assignment group is empty.",
  "technical_error_log": "TypeError: Cannot read property 'sys_id' of null\nTable: sn_hr_core_case\nScript: SLAUtils line 78",
  "impact_assessment": [
    { "type": "User Impact", "desc": "Case submission fails" },
    { "type": "Business Impact", "desc": "Delay in HR ticket intake" },
    { "type": "System Impact", "desc": "No data loss" }
  ],
  "res_short_term": ["Navigate to System Logs", "Confirm error matches signature", "Manually assign default group 'HR Tier 1'", "Resubmit case"],
  "res_permanent": ["Open Script Include: SLAUtils", "Add null validation before line 78", "Deploy update set to PROD after CAB"],
  "escalation_path": [
    { "scenario": "Script error persists", "contact": "John (Tech Lead)", "channel": "Slack @john" },
    { "scenario": "Platform defect", "contact": "ServiceNow Support", "channel": "Open HI Case" }
  ],
  "occurrence_history": [
    { "date": "Jan 12, 2026", "id": "INC001234", "type": "Incident", "env": "PROD", "res": "Manual assignment" },
    { "date": "Feb 03, 2026", "id": "INC001589", "type": "Incident", "env": "PROD", "res": "Same fix" }
  ],
  "triggers": ["New HR case types added", "SLA rules modified", "Data migration scripts"],
  "personas": [
    { "name": "HR Agent", "impact": "Cannot submit case" },
    { "name": "Platform Admin", "impact": "Monitor error logs" }
  ],
  "related_records": [
    { "category": "Parent Problem", "links": ["PRB000123"] },
    { "category": "Related Change", "links": ["CHG000456"] },
    { "category": "Root Cause Story", "links": ["STORY10234"] }
  ],
  "prevention_steps": ["Create alert on TypeError AND SLAUtils", "Add system property for validation", "Add ATF test case for null assignment group"],
  "status_flags": ["Known Error", "Workaround Available"]
}
```