# DevShop Studio - DOCX Template Guide

## Overview

DevShop Studio is a web-based tool that generates Microsoft Word documents (.docx) from JSON data using predefined templates. This guide explains how the DOCX generation works and how to create or modify templates.

## Architecture

The system consists of:
- **main.js**: Contains the generation logic for each template type
- **docxLib.js**: The docx library (browser-compatible version of the npm `docx` package)
- **index.html**: The web interface

## ✅ Project Summary Report - NOW AVAILABLE

The Project Summary Report template has been fully integrated into DevShop Studio and is now available in the interface! You can see it in the **"DOCUMENT TYPE"** section as **"📈 Project Summary"**.

### Quick Start
1. Copy the JSON example below
2. Paste it into the JSON input area in DevShop Studio
3. The system will automatically detect it as a Project Summary and switch to that mode
4. Preview the document in the **Preview** tab
5. Click **Generate DOCX** to download the Word document

### JSON Structure
```json
{
  "project_name": "E-Commerce Platform",
  "created_date": "April 21, 2024",
  "author": "Project Manager",
  "summary": "Monthly project status and key metrics",
  "key_metrics": [
    {
      "metric": "User Registration",
      "current": "2,450",
      "target": "3,000",
      "status": "On Track"
    },
    {
      "metric": "Revenue",
      "current": "$45,230",
      "target": "$50,000",
      "status": "Behind"
    }
  ],
  "milestones": [
    {
      "name": "Phase 1 Complete",
      "due_date": "April 30, 2024",
      "status": "Completed",
      "notes": "All core features implemented"
    },
    {
      "name": "Beta Launch",
      "due_date": "May 15, 2024",
      "status": "In Progress",
      "notes": "User testing in progress"
    }
  ],
  "risks": [
    {
      "description": "Third-party payment integration delay",
      "impact": "High",
      "mitigation": "Have backup payment processor ready"
    }
  ]
}
```

### JavaScript Implementation
Add this code to your `main.js` file (around line 1900, after the existing generate functions):

```javascript
// ── Project Summary Generator ─────────────────────────────────────────────
async function generateProjectSummary(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType } = getDocx();

    const C = docxColors();

    // Extract data with defaults
    const projectName = safeStr(data.project_name || 'Project Name');
    const createdDate = safeStr(data.created_date || new Date().toLocaleDateString());
    const author = safeStr(data.author || 'Author');
    const summary = safeStr(data.summary || 'Project summary');
    const keyMetrics = data.key_metrics || [];
    const milestones = data.milestones || [];
    const risks = data.risks || [];

    // Helper functions
    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

    function para(t, bold, color, size) {
        return new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: 'Arial' })]
        });
    }

    function h1(t) {
        return new Paragraph({
            spacing: { before: 120, after: 120 },
            children: [new TextRun({ text: safeStr(t), bold: true, color: C.NAVY, size: 32, font: 'Arial' })]
        });
    }

    function h2(t) {
        return new Paragraph({
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: safeStr(t), bold: true, color: C.BLUE, size: 28, font: 'Arial' })]
        });
    }

    function hdrCell(t, w) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: C.BLUE, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: C.WHITE, size: 18, font: 'Arial' })] })]
        });
    }

    function dataCell(t, w, bg) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg || C.WHITE, type: ShadingType.CLEAR },
            margins: { top: 70, bottom: 70, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), color: C.GRAY, size: 18, font: 'Arial' })] })]
        });
    }

    function statusCell(t, w) {
        const s = (t || '').toLowerCase();
        let bg, tc;
        if (s.includes('completed') || s.includes('on track')) { bg = C.LIGHT_GREEN; tc = C.GREEN; }
        else if (s.includes('in progress') || s.includes('pending')) { bg = C.LIGHT_BLUE; tc = C.BLUE; }
        else if (s.includes('behind') || s.includes('delayed')) { bg = C.LIGHT_AMBER; tc = C.AMBER; }
        else { bg = C.LIGHT_GRAY; tc = C.GRAY; }
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 70, bottom: 70, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: 'Arial' })] })]
        });
    }

    // Build document sections
    const sections = [];

    // Header section
    const headerChildren = [
        h1(projectName + ' - Project Summary'),
        para('Created: ' + createdDate, false, C.GRAY, 18),
        para('Author: ' + author, false, C.GRAY, 18),
        para(''),
        h2('Executive Summary'),
        para(summary),
        para('')
    ];

    // Key Metrics section
    if (keyMetrics.length > 0) {
        headerChildren.push(h2('Key Metrics'));
        const metricsTable = new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [1800, 1400, 1400, 1800, 2960],
            rows: [
                new TableRow({
                    children: [
                        hdrCell('Metric', 1800), hdrCell('Current', 1400),
                        hdrCell('Target', 1400), hdrCell('Status', 1800), hdrCell('Notes', 2960)
                    ]
                }),
                ...keyMetrics.map((m, i) => new TableRow({
                    children: [
                        dataCell(m.metric || '', 1800, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        dataCell(m.current || '', 1400, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        dataCell(m.target || '', 1400, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        statusCell(m.status || '', 1800),
                        dataCell('', 2960, i % 2 ? C.LIGHT_GRAY : C.WHITE)
                    ]
                }))
            ]
        });
        headerChildren.push(metricsTable);
        headerChildren.push(para(''));
    }

    // Milestones section
    if (milestones.length > 0) {
        headerChildren.push(h2('Milestones'));
        const milestonesTable = new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [2500, 1800, 1800, 3260],
            rows: [
                new TableRow({
                    children: [
                        hdrCell('Milestone', 2500), hdrCell('Due Date', 1800),
                        hdrCell('Status', 1800), hdrCell('Notes', 3260)
                    ]
                }),
                ...milestones.map((m, i) => new TableRow({
                    children: [
                        dataCell(m.name || '', 2500, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        dataCell(m.due_date || '', 1800, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        statusCell(m.status || '', 1800),
                        dataCell(m.notes || '', 3260, i % 2 ? C.LIGHT_GRAY : C.WHITE)
                    ]
                }))
            ]
        });
        headerChildren.push(milestonesTable);
        headerChildren.push(para(''));
    }

    // Risks section
    if (risks.length > 0) {
        headerChildren.push(h2('Risks & Mitigations'));
        const risksTable = new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [4000, 1200, 4160],
            rows: [
                new TableRow({
                    children: [
                        hdrCell('Risk Description', 4000), hdrCell('Impact', 1200), hdrCell('Mitigation', 4160)
                    ]
                }),
                ...risks.map((r, i) => new TableRow({
                    children: [
                        dataCell(r.description || '', 4000, i % 2 ? C.LIGHT_GRAY : C.WHITE),
                        statusCell(r.impact || '', 1200),
                        dataCell(r.mitigation || '', 4160, i % 2 ? C.LIGHT_GRAY : C.WHITE)
                    ]
                }))
            ]
        });
        headerChildren.push(risksTable);
    }

    sections.push({
        properties: {},
        children: headerChildren
    });

    // Create and pack document
    const doc = new Document({
        sections: sections
    });

    const blob = await Packer.toBlob(doc);
    return {
        blob: blob,
        filename: projectName.replace(/[^a-z0-9]/gi, '_') + '_Summary.docx'
    };
}
```

3. Edit Panel
```js
 function addRow(listId, rowType) {
    var list = document.getElementById(listId);
    if (!list) return;
    var count = list.children.length;
    var div = document.createElement('div');
    if (rowType === 'metric') {
        div.innerHTML = '<div class="edit-item-row" id="metric-row-' + count + '"><div style="display:flex;gap:8px;margin-bottom:8px;"><input type="text" class="edit-input" data-field="metric" placeholder="Metric Name" style="flex:1;"><input type="text" class="edit-input" data-field="current" placeholder="Current" style="flex:0.8;"><input type="text" class="edit-input" data-field="target" placeholder="Target" style="flex:0.8;"><input type="text" class="edit-input" data-field="status" placeholder="Status" style="flex:0.8;"><button class="edit-remove-btn" onclick="removeRow(\'metric-row-' + count + '\')">✕</button></div></div>';
    } else if (rowType === 'milestone') {
        div.innerHTML = '<div class="edit-item-row" id="milestone-row-' + count + '"><div style="display:flex;gap:8px;margin-bottom:8px;"><input type="text" class="edit-input" data-field="name" placeholder="Milestone Name" style="flex:1.2;"><input type="text" class="edit-input" data-field="due_date" placeholder="Due Date" style="flex:0.8;"><input type="text" class="edit-input" data-field="status" placeholder="Status" style="flex:0.8;"><input type="text" class="edit-input" data-field="notes" placeholder="Notes" style="flex:1;"><button class="edit-remove-btn" onclick="removeRow(\'milestone-row-' + count + '\')">✕</button></div></div>';
    } else if (rowType === 'risk') {
        div.innerHTML = '<div class="edit-item-row" id="risk-row-' + count + '"><div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;"><input type="text" class="edit-input" data-field="description" placeholder="Risk Description" style="flex:1.5;min-width:200px;"><input type="text" class="edit-input" data-field="impact" placeholder="Impact" style="flex:0.6;"><input type="text" class="edit-input" data-field="mitigation" placeholder="Mitigation" style="flex:1.2;min-width:200px;"><button class="edit-remove-btn" onclick="removeRow(\'risk-row-' + count + '\')">✕</button></div></div>';
    }
    list.appendChild(div.firstChild);
}
```

### ✅ Integration Complete

All integration steps have been completed! The Project Summary template is now fully functional with:
- ✅ HTML button in the interface (`📈 Project Summary`)
- ✅ Mode detection from JSON (detects `project_name` field)
- ✅ Generation function (`generateProjectSummary()`)
- ✅ Validation panel showing metrics, milestones, and risks
- ✅ Live preview in the Preview tab
- ✅ Edit panel for modifying data
- ✅ Full DOCX generation with professional formatting

### Previous Integration Steps (Already Implemented)
1. **Added the function** to `main.js` after the existing `generateTaskBrief` function
2. **Added mode detection** in `loadJSON()` function:
   ```javascript
   else if (data.project_name) switchMode('projectsummary');
   ```
3. **Added generation case** in `generate()` function:
   ```javascript
   else if (currentMode === 'projectsummary') result = await generateProjectSummary(currentData);
   ```
4. **Added validation** in `showValPanel()` function:
   ```javascript
   } else if (currentMode === 'projectsummary') {
       tiles = [
           { l: 'Metrics', n: (data.key_metrics || []).length },
           { l: 'Milestones', n: (data.milestones || []).length },
           { l: 'Risks', n: (data.risks || []).length }
       ];
       if (!data.project_name) { pip = 'warn'; msg = 'No project name found'; }
       else msgs.push({ type: 'ok', text: 'Project summary ready' });
   ```
5. **Added preview function** in `renderPreview()` function:
   ```javascript
   else if (currentMode === 'projectsummary') el.innerHTML = renderProjectSummaryPreview(data);
   ```
6. **Add the preview function** (add this after the existing preview functions):
   ```javascript
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
   ```

### Testing
Use the JSON example above to test this template. It should generate a professional-looking project summary document with:
- Project header with title, date, and author
- Executive summary section
- Key metrics table with status color coding
- Milestones table with due dates
- Risks table with impact levels

## Template Modes

The system now supports **7 different document types**, each with its own JSON structure and generation function:

### 1. Call Script (`callscript`)
**Purpose**: Weekly sync call scripts with topics, Q&A pairs, and tasks

**JSON Structure**:
```json
{
  "meta": {
    "account": "Client Name",
    "date": "January 15, 2024",
    "prepared_by": "Program Manager",
    "call_type": "Weekly Sync",
    "audience": "Development Team",
    "presenter_role": "Program Manager"
  },
  "topics": [
    {
      "title": "Sprint Progress Update",
      "say_this": "Here's what we've accomplished this sprint...",
      "qa_pairs": [
        {
          "question": "When will feature X be ready?",
          "answer": "Feature X is scheduled for completion by..."
        }
      ],
      "tasks": [
        {
          "num": "TASK-123",
          "type": "Development",
          "assignee": "John Doe",
          "title": "Implement user authentication",
          "state": "In Progress"
        }
      ]
    }
  ]
}
```

### 2. Status Report (`report`)
**Purpose**: Executive status reports with incidents, stories, and action items

**JSON Structure**:
```json
{
  "meta": {
    "title": "Weekly Status Report",
    "period": "Week of January 15, 2024",
    "prepared_by": "Program Manager"
  },
  "executive_summary": "This week we completed...",
  "metrics": {
    "velocity": "45 story points",
    "burndown": "On track",
    "quality": "2 critical bugs remaining"
  },
  "incidents": [
    {
      "id": "INC-001",
      "title": "Database outage",
      "status": "Resolved",
      "impact": "High",
      "description": "Production database was unavailable for 2 hours"
    }
  ],
  "stories": [
    {
      "id": "STORY-123",
      "title": "User login feature",
      "status": "Completed",
      "points": 8
    }
  ],
  "blockers": [
    {
      "title": "Third-party API rate limiting",
      "description": "API calls are being throttled",
      "owner": "Dev Team",
      "eta": "End of week"
    }
  ],
  "action_items": [
    {
      "title": "Schedule architecture review",
      "owner": "Tech Lead",
      "due_date": "January 20, 2024"
    }
  ],
  "team": [
    {
      "name": "John Doe",
      "role": "Senior Developer",
      "status": "Active"
    }
  ]
}
```

### 3. RCA (Root Cause Analysis) (`rca`)
**Purpose**: Incident analysis documents

**JSON Structure**:
```json
{
  "incident": "INC-2024-001",
  "title": "Production Database Outage",
  "s1": "What happened?",
  "s2": "What was the impact?",
  "s3": "What was the root cause?",
  "s4": "What did we do to resolve it?",
  "s5": "What will we do to prevent it?",
  "timeline": [
    {
      "time": "2024-01-15 14:30",
      "event": "Database connection timeout detected"
    }
  ],
  "callouts": [
    {
      "type": "warning",
      "title": "Lesson Learned",
      "content": "Always have monitoring alerts for database connections"
    }
  ]
}
```

### 4. Blocker Brief (`blocker`)
**Purpose**: Brief documents about project blockers

**JSON Structure**:
```json
{
  "task_num": "TASK-456",
  "title": "API Integration Blocker",
  "blocker_description": "Third-party API has changed authentication method",
  "proposed_solutions": [
    {
      "title": "Update authentication flow",
      "description": "Modify the OAuth implementation to use new endpoints",
      "effort": "2 days"
    }
  ],
  "next_steps": [
    {
      "action": "Contact API provider for documentation",
      "owner": "Dev Lead",
      "timeline": "Today"
    }
  ],
  "callouts": [
    {
      "type": "info",
      "content": "This affects all API integrations"
    }
  ]
}
```

### 5. Technical Approach (`techapproach`)
**Purpose**: Technical solution proposals

**JSON Structure**:
```json
{
  "task_num": "TASK-789",
  "title": "Implement Real-time Notifications",
  "proposed_solution": "Use WebSocket connections with Redis pub/sub",
  "technical_spec": {
    "architecture": "Client connects to WebSocket server, server publishes messages via Redis",
    "components": ["WebSocket Server", "Redis Cluster", "Client SDK"],
    "technologies": ["Node.js", "Socket.io", "Redis"]
  },
  "implementation_plan": [
    {
      "phase": "Phase 1",
      "description": "Set up WebSocket server infrastructure",
      "duration": "1 week"
    }
  ]
}
```

### 6. Task Brief (`taskbrief`)
**Purpose**: Task requirement documents

**JSON Structure**:
```json
{
  "task_num": "TASK-101",
  "title": "Fix User Profile Page Bug",
  "reported_behavior": "Profile page shows incorrect user data",
  "expected_behavior": "Profile page should display current user's information",
  "investigation": "Issue traced to incorrect user ID being passed to API",
  "proposed_solution": "Update user ID retrieval logic in profile component",
  "acceptance_criteria": [
    "Profile page displays correct user data",
    "All user fields are populated correctly"
  ]
}
```

### 7. Project Summary (`projectsummary`) ⭐ NEW
**Purpose**: Project status summaries with metrics, milestones, and risks

**JSON Structure**:
```json
{
  "project_name": "E-Commerce Platform",
  "created_date": "April 21, 2024",
  "author": "Project Manager",
  "summary": "Monthly project status and key metrics",
  "key_metrics": [
    {
      "metric": "User Registration",
      "current": "2,450",
      "target": "3,000",
      "status": "On Track"
    }
  ],
  "milestones": [
    {
      "name": "Phase 1 Complete",
      "due_date": "April 30, 2024",
      "status": "Completed",
      "notes": "All core features implemented"
    }
  ],
  "risks": [
    {
      "description": "Third-party payment integration delay",
      "impact": "High",
      "mitigation": "Have backup payment processor ready"
    }
  ]
}
```

## DOCX Generation Process

### Core Components

The generation uses the `docx` library with these main components:

- **Document**: The root container
- **Paragraph**: Text blocks with formatting
- **TextRun**: Individual text segments with styling
- **Table**: Tabular data
- **TableRow/TableCell**: Table structure

### Common Patterns

#### Colors and Styling
```javascript
const C = docxColors(); // Predefined color palette
// Colors: C.BLUE, C.GREEN, C.GRAY, C.NAVY, etc.
```

#### Helper Functions
- `para(text, bold, color, size)`: Create formatted paragraphs
- `h2(text, color)`: Create headings
- `hdrCell(text, bg, tc, width)`: Create table header cells
- `dataCell(text, bg, tc, width, bold)`: Create table data cells
- `divider()`: Create section dividers

#### Document Structure
Each template follows this pattern:
1. Extract data from JSON
2. Create document sections (headers, content, footers)
3. Build tables and paragraphs
4. Apply styling and formatting
5. Pack into blob for download

## Creating New Templates

### Step 1: Define JSON Structure
Design your JSON schema based on the content you need to capture.

### Step 2: Add Mode Detection
In `loadJSON()` function, add detection logic:
```javascript
else if (data.your_field) switchMode('yourmode');
```

### Step 3: Create Generation Function
Add a new async function following the pattern:
```javascript
async function generateYourTemplate(data) {
    const { Document, Packer, Paragraph, TextRun, ... } = getDocx();

    // Extract data
    const field1 = data.field1 || '';

    // Build document sections
    const sections = [
        // Header section
        // Content sections
        // Footer section
    ];

    // Create document
    const doc = new Document({
        sections: sections
    });

    // Pack and return
    const blob = await Packer.toBlob(doc);
    return {
        blob: blob,
        filename: 'YourTemplate.docx'
    };
}
```

### Step 4: Register Template
In the `generate()` function, add your case:
```javascript
else if (currentMode === 'yourmode') result = await generateYourTemplate(currentData);
```

### Step 5: Add Validation
Update `showValPanel()` to validate your template's required fields.

## Modifying Existing Templates

### Finding the Code
Each template has its own generation function:
- `generateCallScript()` - Lines ~1295+
- `generateStatusReport()` - Lines ~1400+
- `generateRCA()` - Lines ~1500+
- `generateBlockerBrief()` - Lines ~1600+
- `generateTechApproach()` - Lines ~1700+
- `generateTaskBrief()` - Lines ~1800+
- `generateProjectSummary()` - Lines ~3200+ ⭐ NEW

### Common Modifications
1. **Add new fields**: Extract from JSON and add to document
2. **Change styling**: Modify colors, fonts, spacing
3. **Add sections**: Insert new paragraphs/tables
4. **Modify tables**: Change column widths, add/remove columns

### Example: Adding a New Field
```javascript
// In generateCallScript function
const newField = safeStr(meta.new_field || 'Default Value');

// Add to document
nodes.push(para('New Field: ' + newField, true, C.BLUE));
```

## Styling Reference

### Colors (from docxColors())
- `C.BLUE`: #2E5FAC
- `C.NAVY`: #1F3864
- `C.GREEN`: #166534
- `C.AMBER`: #92400E
- `C.RED`: #991B1B
- `C.GRAY`: #374151
- `C.MGRAY`: #D1D5DB (medium gray)
- `C.LIGHT_GRAY`: #F3F4F6

### Font Sizes
- Headings: 28pt
- Body text: 20pt
- Small text: 18pt
- Table headers: 18pt

### Spacing
- Paragraph spacing: { before: 60, after: 60 }
- Section spacing: { before: 240, after: 120 }
- Table margins: { top: 80, bottom: 80, left: 120, right: 120 }

## Testing Templates

1. Load JSON data in the web interface
2. Switch to your mode
3. Click "Generate DOCX"
4. Download and verify the output

## Best Practices

1. **Use `safeStr()`** for all text content to handle null/undefined values
2. **Consistent styling** across sections
3. **Proper table widths** (DXA units: 1440 = 1 inch)
4. **Color coding** for status indicators
5. **Clear section headers** with `h2()` function
6. **Validation** of required fields before generation

## Troubleshooting

### Common Issues
- **"docx library failed to initialize"**: Refresh the page
- **Invalid JSON**: Check syntax and required fields
- **Empty document**: Verify JSON structure matches expected format
- **Styling issues**: Check color constants and font specifications

### Debug Tips
- Use browser console to inspect JSON data
- Test with minimal JSON first
- Verify table column widths add up correctly
- Check for null/undefined values in data</content>
<parameter name="filePath">c:\Users\Ashish Moghe\Downloads\Misc\Devshop Studio\docx-template-guide.md