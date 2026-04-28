// ════════════════════════════════════════════════════ 
// Template Generator 
// ════════════════════════════════════════════════════

async function generateProjectSummary(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, Header, Footer, TabStopType } = getDocx();

    const C = docxColors();
    const FONT = 'Arial';
    const CW = 9360;

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
            children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })]
        });
    }

    function h1(t) {
        return new Paragraph({
            spacing: { before: 120, after: 120 },
            children: [new TextRun({ text: safeStr(t), bold: true, color: C.NAVY, size: 32, font: FONT })]
        });
    }

    function h2(t, color) {
        return new Paragraph({
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.BLUE, size: 28, font: FONT })]
        });
    }

    function hdrCell(t, w) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: C.BLUE, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: C.WHITE, size: 18, font: FONT })] })]
        });
    }

    function dataCell(t, w, bg) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg || C.WHITE, type: ShadingType.CLEAR },
            margins: { top: 70, bottom: 70, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), color: C.GRAY, size: 18, font: FONT })] })]
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
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })]
        });
    }

    // Build document sections
    const children = [];

    // Header section
    children.push(h1(projectName + ' - Project Summary'));
    children.push(para('Created: ' + createdDate, false, C.GRAY, 18));
    children.push(para('Author: ' + author, false, C.GRAY, 18));
    children.push(para(''));
    children.push(h2('Executive Summary'));
    children.push(para(summary));
    children.push(para(''));

    // Key Metrics section
    if (keyMetrics.length > 0) {
        children.push(h2('Key Metrics'));
        const metricsTable = new Table({
            width: { size: CW, type: WidthType.DXA },
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
        children.push(metricsTable);
        children.push(para(''));
    }

    // Milestones section
    if (milestones.length > 0) {
        children.push(h2('Milestones'));
        const milestonesTable = new Table({
            width: { size: CW, type: WidthType.DXA },
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
        children.push(milestonesTable);
        children.push(para(''));
    }

    // Risks section
    if (risks.length > 0) {
        children.push(h2('Risks & Mitigations'));
        const risksTable = new Table({
            width: { size: CW, type: WidthType.DXA },
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
        children.push(risksTable);
    }

    // Create and pack document
    const doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } }, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: 'PROJECT SUMMARY — ' + safeStr(projectName), bold: true, color: C.NAVY, size: 18, font: FONT })] })] }) },
            footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, spacing: { before: 80 }, children: [new TextRun({ text: 'Project Summary | ' + safeStr(projectName) + ' | ' + safeStr(createdDate), color: C.GRAY, size: 16, font: FONT })] })] }) },
            children: children
        }]
    });

    const blob = await Packer.toBlob(doc);
    const filename = projectName.replace(/[^a-z0-9]/gi, '_') + '_Summary.docx';
    return { blob: blob, filename: filename };
}

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
                ...data.contacts.map((c, i) => new TableRow({ children: [dataCell(c.role, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.NAVY, 2340, true), dataCell(c.name, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2340), dataCell(c.info, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 4680)] }))
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
                dataCell(s.seq || String(i + 1), bg, C.GRAY, 600),
                new TableCell({
                    width: { size: 3500, type: WidthType.DXA }, shading: { fill: bg }, borders, margins: { left: 120, right: 120 }, children: [
                        new Paragraph({ children: [new TextRun({ text: s.title, bold: true, color: C.NAVY, size: 19 })] }),
                        new Paragraph({ children: [new TextRun({ text: s.action, size: 18, color: C.GRAY })] })
                    ]
                }),
                dataCell(s.owner, bg, C.GRAY, 1200),
                new TableCell({
                    width: { size: 4060, type: WidthType.DXA }, shading: { fill: s.is_stop_go ? C.LIGHT_AMBER : bg }, borders, margins: { left: 120, right: 120 }, children: [
                        ...(s.is_stop_go ? [new Paragraph({ children: [new TextRun({ text: '🛑 STOP/GO DECISION POINT', bold: true, color: C.AMBER, size: 16 })] })] : []),
                        new Paragraph({ children: [new TextRun({ text: s.validation || '', size: 18, color: C.GRAY })] })
                    ]
                })
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
            new TableRow({
                children: [
                    dataCell((data.in_scope || []).join('\n'), C.WHITE, C.GRAY, scopeW),
                    dataCell((data.out_of_scope || []).join('\n'), C.WHITE, C.GRAY, scopeW),
                    dataCell((data.assumptions || []).join('\n'), C.WHITE, C.GRAY, scopeW)
                ]
            })
        ]
    }));

    // Data Model
    if ((data.data_model_changes || []).length) {
        children.push(h2('Data Model Changes'));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [2000, 2000, 5360],
            rows: [
                new TableRow({ children: [hdrCell('Table', C.NAVY, C.WHITE, 2000), hdrCell('Change Type', C.NAVY, C.WHITE, 2000), hdrCell('Details', C.NAVY, C.WHITE, 5360)] }),
                ...data.data_model_changes.map((dm, i) => new TableRow({
                    children: [
                        dataCell(dm.table, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.NAVY, 2000, true),
                        dataCell(dm.change, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2000),
                        dataCell(dm.details, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 5360)
                    ]
                }))
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
                ...data.implementation_components.map((c, i) => new TableRow({
                    children: [
                        dataCell(c.type, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.BLUE, 2000, true),
                        dataCell(c.name, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3000),
                        dataCell(c.description, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 4360)
                    ]
                }))
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
                ...data.risks.map((r, i) => new TableRow({
                    children: [
                        dataCell(r.description, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 4000),
                        dataCell(r.impact, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.RED, 1000, true),
                        dataCell(r.mitigation, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 4360)
                    ]
                }))
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

// ========================================
// list rendering helper for Requirements section (handles nested lists with formatting)
// ========================================
function renderNestedList(items, Paragraph, TextRun, C, level = 0) {
    let nodes = [];
    items.forEach(item => {
        const isObj = typeof item === 'object' && item !== null;
        const text = isObj ? item.text : item;

        nodes.push(new Paragraph({
            bullet: { level: level },
            spacing: { before: 60, after: 60 },
            children: [
                new TextRun({
                    text: text,
                    bold: isObj && item.bold,
                    italics: isObj && item.italic,
                    color: isObj && item.url ? '2563EB' : C.GRAY,
                    underline: isObj && item.url ? {} : null,
                    size: 19
                })
            ]
        }));

        if (isObj && item.sub_items && Array.isArray(item.sub_items)) {
            nodes = nodes.concat(renderNestedList(item.sub_items, Paragraph, TextRun, C, level + 1));
        }
    });
    return nodes;
}
// End
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

