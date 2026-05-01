// ════════════════════════════════════════════════════ 
// Template Generator 
// ════════════════════════════════════════════════════

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

// // ========================================
// // list rendering helper for Requirements section (handles nested lists with formatting)
// // ========================================
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


async function generateProjectSummary(data) {
    const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType,
        Header, Footer
    } = getDocx();

    const C = docxColors();
    const FONT = 'Arial';
    const CW = 9360; // Full content width

    const projectName = safeStr(data.project_name || 'Project Name');
    const createdDate = safeStr(data.created_date || new Date().toLocaleDateString());
    const author = safeStr(data.author || 'Author');
    const summary = safeStr(data.summary || '');
    const keyMetrics = data.key_metrics || [];
    const milestones = data.milestones || [];
    const risks = data.risks || [];

    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

    const children = [];

    // =====================================================
    // ✅ COVER BANNER
    // =====================================================
    children.push(
        new Table({
            width: { size: CW, type: WidthType.DXA },
            layout: "fixed", // ✅ Prevents vertical collapse
            columnWidths: [CW], // ✅ Critical — prevents vertical collaps
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: CW, type: WidthType.DXA }, // ✅ Force full width
                            shading: { fill: C.NAVY },
                            margins: { top: 400, bottom: 400, left: 400, right: 400 },
                            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                            children: [
                                new Paragraph({
                                    spacing: { after: 150 },
                                    children: [
                                        new TextRun({
                                            text: "PROJECT SUMMARY REPORT",
                                            bold: true,
                                            size: 44,
                                            color: C.WHITE,
                                            font: FONT
                                        })
                                    ]
                                }),
                                new Paragraph({
                                    spacing: { after: 100 },
                                    children: [
                                        new TextRun({
                                            text: projectName + "  |  " + createdDate,
                                            size: 24,
                                            color: "C7D2FE",
                                            font: FONT
                                        })
                                    ]
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Author: " + author,
                                            size: 20,
                                            color: "DBEAFE",
                                            font: FONT
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    );

    // =====================================================
    // ✅ SECTION HEADER HELPER
    // =====================================================
    function sectionHeader(title, color) {
        return new Paragraph({
            spacing: { before: 400, after: 120 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY } },
            children: [
                new TextRun({
                    text: title,
                    bold: true,
                    size: 28,
                    color: color || C.NAVY,
                    font: FONT
                })
            ]
        });
    }

    function bodyPara(text) {
        return new Paragraph({
            spacing: { before: 100, after: 200 },
            children: [
                new TextRun({
                    text: text,
                    size: 22,
                    color: C.GRAY,
                    font: FONT
                })
            ]
        });
    }

    // =====================================================
    // ✅ TABLE CELL HELPERS (with fixed layout support)
    // =====================================================
    function headerCell(text, width, fill) {
        return new TableCell({
            width: { size: width, type: WidthType.DXA },
            shading: { fill: fill },
            margins: { top: 120, bottom: 120, left: 120, right: 120 },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: text,
                            bold: true,
                            color: C.WHITE,
                            font: FONT
                        })
                    ]
                })
            ]
        });
    }

    function dataCell(text, width, shade, bold = false) {
        return new TableCell({
            width: { size: width, type: WidthType.DXA },
            borders,
            shading: shade ? { fill: shade } : undefined,
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: safeStr(text),
                            bold: !!bold,
                            color: C.GRAY,
                            font: FONT
                        })
                    ]
                })
            ]
        });
    }

    function statusCell(text, width) {
        const s = (text || '').toLowerCase();
        let bg = C.LIGHT_GRAY;
        let tc = C.GRAY;

        if (s.includes('completed') || s.includes('on track')) { bg = C.LIGHT_GREEN; tc = C.GREEN; }
        else if (s.includes('in progress') || s.includes('pending')) { bg = C.LIGHT_BLUE; tc = C.BLUE; }
        else if (s.includes('behind') || s.includes('delayed') || s.includes('high')) { bg = C.LIGHT_AMBER; tc = C.AMBER; }

        return new TableCell({
            width: { size: width, type: WidthType.DXA },
            shading: { fill: bg },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: safeStr(text),
                            bold: true,
                            color: tc,
                            font: FONT
                        })
                    ]
                })
            ]
        });
    }

    // =====================================================
    // ✅ EXECUTIVE SUMMARY
    // =====================================================
    if (summary) {
        children.push(sectionHeader("Executive Summary"));
        children.push(bodyPara(summary));
    }

    // =====================================================
    // ✅ KEY METRICS
    // =====================================================
    if (keyMetrics.length) {
        children.push(sectionHeader("Key Metrics", C.BLUE));

        const rows = [
            new TableRow({
                children: [
                    headerCell("Metric", 2200, C.BLUE),
                    headerCell("Current", 1400, C.BLUE),
                    headerCell("Target", 1400, C.BLUE),
                    headerCell("Status", 1600, C.BLUE),
                    headerCell("Notes", 2760, C.BLUE)
                ]
            })
        ];

        keyMetrics.forEach((m, i) => {
            const shade = i % 2 ? C.LIGHT_GRAY : C.WHITE;
            rows.push(new TableRow({
                children: [
                    dataCell(m.metric, 2200, shade, true),
                    dataCell(m.current, 1400, shade),
                    dataCell(m.target, 1400, shade),
                    statusCell(m.status, 1600),
                    dataCell("", 2760, shade)
                ]
            }));
        });

        children.push(
            new Table({
                width: { size: CW, type: WidthType.DXA },
                layout: "fixed", // ✅ Critical fix
                columnWidths: [2200, 1400, 1400, 1600, 2760],
                rows
            })
        );
    }

    // =====================================================
    // ✅ MILESTONES
    // =====================================================
    if (milestones.length) {
        children.push(sectionHeader("Milestones"));

        const rows = [
            new TableRow({
                children: [
                    headerCell("Milestone", 2600, C.NAVY),
                    headerCell("Due Date", 1600, C.NAVY),
                    headerCell("Status", 1600, C.NAVY),
                    headerCell("Notes", 3560, C.NAVY)
                ]
            })
        ];

        milestones.forEach((m, i) => {
            const shade = i % 2 ? C.LIGHT_GRAY : C.WHITE;
            rows.push(new TableRow({
                children: [
                    dataCell(m.name, 2600, shade, true),
                    dataCell(m.due_date, 1600, shade),
                    statusCell(m.status, 1600),
                    dataCell(m.notes, 3560, shade)
                ]
            }));
        });

        children.push(
            new Table({
                width: { size: CW, type: WidthType.DXA },
                layout: "fixed", // ✅ Critical fix
                columnWidths: [2600, 1600, 1600, 3560],
                rows
            })
        );
    }

    // =====================================================
    // ✅ RISKS & MITIGATIONS (Fixed)
    // =====================================================
    if (risks.length) {
        children.push(sectionHeader("Risks & Mitigations", C.RED));

        const rows = [
            new TableRow({
                children: [
                    headerCell("Risk Description", 4200, C.RED),
                    headerCell("Impact", 1400, C.RED),
                    headerCell("Mitigation", 3760, C.RED)
                ]
            })
        ];

        risks.forEach((r, i) => {
            const shade = i % 2 ? C.LIGHT_GRAY : C.WHITE;
            rows.push(new TableRow({
                children: [
                    dataCell(r.description, 4200, shade),
                    statusCell(r.impact, 1400),
                    dataCell(r.mitigation, 3760, shade)
                ]
            }));
        });

        children.push(
            new Table({
                width: { size: CW, type: WidthType.DXA },
                layout: "fixed", // ✅ Critical fix
                columnWidths: [4200, 1400, 3760],
                rows
            })
        );
    }

    // =====================================================
    // ✅ FINAL DOCUMENT
    // =====================================================
    const doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: {
                page: {
                    size: { width: 12240, height: 15840 },
                    margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
                }
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE } },
                            spacing: { after: 120 },
                            children: [
                                new TextRun({
                                    text: "PROJECT SUMMARY — " + projectName,
                                    bold: true,
                                    color: C.NAVY,
                                    size: 18,
                                    font: FONT
                                })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY } },
                            spacing: { before: 80 },
                            children: [
                                new TextRun({
                                    text: "Project Summary | " + projectName + " | " + createdDate,
                                    size: 16,
                                    color: C.GRAY,
                                    font: FONT
                                })
                            ]
                        })
                    ]
                })
            },
            children
        }]
    });

    const blob = await Packer.toBlob(doc);
    const filename = projectName.replace(/[^a-z0-9]/gi, '_') + '_Summary.docx';
    return { blob, filename };
}

async function generateIncidentSummary(data) {
    const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType
    } = getDocx();

    const C = docxColors();
    const FONT = "Arial";
    const CW = 9360;

    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };

    // =====================================================
    // ✅ TABLE FACTORY (Prevents Vertical Collapse)
    // =====================================================
    function createFullWidthTable(columnWidths, rows) {
        return new Table({
            width: { size: CW, type: WidthType.DXA },
            layout: "fixed",
            columnWidths,
            rows
        });
    }

    function sectionHeader(text, color) {
        return new Paragraph({
            spacing: { before: 300, after: 120 },
            children: [
                new TextRun({
                    text,
                    bold: true,
                    size: 28,
                    color: color || C.NAVY,
                    font: FONT
                })
            ]
        });
    }

    function metaCallout(label, value) {
        return new TableCell({
            borders: { top: bdr, bottom: bdr, left: bdr, right: bdr },
            shading: { fill: "F8FAFC" },
            margins: { top: 120, bottom: 120, left: 120, right: 120 },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: label.toUpperCase(),
                            bold: true,
                            size: 14,
                            color: "64748B",
                            font: FONT
                        })
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: value || "N/A",
                            size: 20,
                            color: C.GRAY,
                            font: FONT
                        })
                    ]
                })
            ]
        });
    }

    const children = [];

    // =====================================================
    // ✅ COVER HEADER WITH PRIORITY BADGE
    // =====================================================
    const priority = data.priority || "P?";
    let priColor = C.BLUE;
    if (priority === "P1") priColor = C.RED;
    if (priority === "P2") priColor = C.AMBER;

    children.push(
        createFullWidthTable(
            [7000, 2360],
            [
                new TableRow({
                    children: [
                        new TableCell({
                            shading: { fill: "0B2144" },
                            margins: { top: 400, bottom: 400, left: 400, right: 200 },
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "INCIDENT RESOLUTION SUMMARY",
                                            bold: true,
                                            size: 38,
                                            color: C.WHITE,
                                            font: FONT
                                        })
                                    ]
                                }),
                                new Paragraph({
                                    spacing: { before: 120 },
                                    children: [
                                        new TextRun({
                                            text: safeStr(data.incident_number) +
                                                " - " +
                                                safeStr(data.short_description),
                                            size: 22,
                                            color: "AECBF0",
                                            font: FONT
                                        })
                                    ]
                                })
                            ]
                        }),
                        new TableCell({
                            shading: { fill: C.WHITE },
                            margins: { top: 400, bottom: 400, left: 200, right: 400 },
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: "PRIORITY",
                                            bold: true,
                                            size: 14,
                                            color: C.GRAY
                                        })
                                    ]
                                }),
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: priority,
                                            bold: true,
                                            size: 36,
                                            color: priColor
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        )
    );

    // =====================================================
    // ✅ DESCRIPTION CALLOUT
    // =====================================================
    children.push(sectionHeader("Description"));
    children.push(
        createFullWidthTable(
            [CW],
            [
                new TableRow({
                    children: [
                        new TableCell({
                            shading: { fill: "F1F5F9" },
                            borders: { left: { style: BorderStyle.SINGLE, size: 12, color: C.NAVY } },
                            margins: { top: 200, bottom: 200, left: 200, right: 200 },
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: safeStr(data.description || "N/A"),
                                            size: 22,
                                            color: C.GRAY,
                                            font: FONT
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        )
    );

    // =====================================================
    // ✅ METADATA GRID (2x2)
    // =====================================================
    children.push(sectionHeader("Incident Metadata"));

    children.push(
        createFullWidthTable(
            [4680, 4680],
            [
                new TableRow({
                    children: [
                        metaCallout("Service", data.service),
                        metaCallout("Assignment Group", data.assignment_group)
                    ]
                }),
                new TableRow({
                    children: [
                        metaCallout("Opened At", data.opened_at),
                        metaCallout("Resolved At", data.resolved_at)
                    ]
                })
            ]
        )
    );

    // =====================================================
    // ✅ IMPACT SECTION
    // =====================================================
    const imp = data.impact || {};
    children.push(sectionHeader("Impact Assessment"));

    children.push(
        createFullWidthTable(
            [3000, 6360],
            [
                new TableRow({
                    children: [
                        metaCallout("Affected Users", imp.affected_users),
                        metaCallout("Business Impact", imp.business_impact)
                    ]
                }),
                new TableRow({
                    children: [
                        metaCallout("Customer Visible", imp.customer_visible),
                        new TableCell({ children: [] })
                    ]
                })
            ]
        )
    );

    // =====================================================
    // ✅ RESOLUTION SUMMARY CALLOUT
    // =====================================================
    const res = data.resolution || {};
    children.push(sectionHeader("Resolution Summary", C.GREEN));

    children.push(
        createFullWidthTable(
            [CW],
            [
                new TableRow({
                    children: [
                        new TableCell({
                            shading: { fill: C.LIGHT_GREEN },
                            borders: { left: { style: BorderStyle.SINGLE, size: 16, color: C.GREEN } },
                            margins: { top: 200, bottom: 200, left: 200, right: 200 },
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: res.summary || "No summary provided.",
                                            size: 22,
                                            color: C.GRAY,
                                            font: FONT
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        )
    );

    // =====================================================
    // ✅ NEXT STEPS TABLE
    // =====================================================
    if ((data.next_steps || []).length) {
        children.push(sectionHeader("Follow-up & Preventative Actions", C.BLUE));

        const rows = [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Action Item", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Owner", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Due Date", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] })
                ]
            })
        ];

        data.next_steps.forEach(ns => {
            rows.push(new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(ns.action)] }),
                    new TableCell({ children: [new Paragraph(ns.owner)] }),
                    new TableCell({ children: [new Paragraph(ns.due_date || "TBD")] }),
                    new TableCell({ children: [new Paragraph(ns.status)] })
                ]
            }));
        });

        children.push(
            createFullWidthTable([4000, 1500, 1500, 2360], rows)
        );
    }

    const doc = new Document({
        sections: [{ children }]
    });

    const blob = await Packer.toBlob(doc);
    return {
        blob,
        filename: (data.incident_number || "Incident") + "_Resolution_Summary.docx"
    };
}