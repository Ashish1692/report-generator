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
                children: [dataCell(item.title, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.NAVY, 3000, true), dataCell(item.status, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1500), dataCell(item.percent, i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1000), dataCell(item.is_blocked ? "YES" : "No", item.is_blocked ? C.LIGHT_RED : (i % 2 ? C.WHITE : C.LIGHT_GRAY), item.is_blocked ? C.RED : C.GRAY, 1360)]
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

async function generateTechnicalSpec(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType } = getDocx();
    const C = docxColors();
    const CW = 9360;
    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.GRAY };

    // Helper for code snippets
    const codeCell = (text) => new TableCell({
        shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [new Paragraph({ children: [new TextRun({ text: safeStr(text), font: 'Courier New', size: 16, color: C.NAVY })] })]
    });

    const children = [];

    // --- TITLE BLOCK (Professional Header) ---
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [new TableRow({
            children: [new TableCell({
                shading: { fill: '0F172A', type: ShadingType.CLEAR },
                margins: { top: 400, bottom: 400, left: 400, right: 400 },
                children: [
                    new Paragraph({ children: [new TextRun({ text: "TECHNICAL SPECIFICATION", bold: true, color: C.WHITE, size: 36 })] }),
                    new Paragraph({ children: [new TextRun({ text: safeStr(data.technical_title), color: 'AECBF0', size: 22 })] }),
                    sp(200, 0),
                    new Paragraph({ children: [new TextRun({ text: `Version: ${safeStr(data.version)} | Date: ${safeStr(data.date)} | Author: ${safeStr(data.author)}`, color: C.WHITE, size: 17 })] }),
                    new Paragraph({ children: [new TextRun({ text: `Records: ${safeStr(data.related_records)}`, color: 'C0D8F5', size: 17 })] })
                ]
            })]
        })]
    }));

    // 1. REQUIREMENTS & CRITERIA
    if ((data.requirements || []).length) {
        children.push(h2('1. REQUIREMENTS & CRITERIA'));
        // Using the provided reference for nested requirements
        children.push(...renderNestedList(data.requirements, Paragraph, TextRun, C));
    }

    // 2. OVERVIEW
    children.push(h2('2. OVERVIEW'));
    children.push(para('2.1 Type of Change', true, C.NAVY, 19));
    const types = ["New Configuration", "Update to Existing Configuration", "New Script Include", "Bug Fix", "Enhancement"];
    types.forEach(t => {
        const isChecked = (data.change_types || []).includes(t);
        children.push(new Paragraph({ children: [new TextRun({ text: isChecked ? "☑ " : "☐ ", bold: true, size: 18 }), new TextRun({ text: t, size: 18 })] }));
    });

    children.push(sp(100, 0));
    children.push(para('2.2 Environment Details', true, C.NAVY, 19));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Environment", C.NAVY, C.WHITE, 2000), hdrCell("Status", C.NAVY, C.WHITE, 1500), hdrCell("Update Set", C.NAVY, C.WHITE, 2500), hdrCell("Notes", C.NAVY, C.WHITE, 3360)] }),
            ...(data.environments || []).map(env => new TableRow({
                children: [dataCell(env.name, C.WHITE, C.NAVY, 2000, true), dataCell(env.status, C.WHITE, C.GRAY, 1500), dataCell(env.update_set, C.WHITE, C.GRAY, 2500), dataCell(env.notes, C.WHITE, C.GRAY, 3360)]
            }))
        ]
    }));

    children.push(sp(100, 0));
    children.push(para('2.3 Affected Components', true, C.NAVY, 19));
    (data.components || []).forEach(c => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(c), size: 18 })] })));

    // 3. IMPLEMENTATION DETAILS
    children.push(h2('3. IMPLEMENTATION DETAILS / PROCEDURE'));
    (data.implementation_steps || []).forEach((step, idx) => {
        children.push(h2(`3.${idx + 1} ${step.title}`, C.NAVY));
        children.push(para(`Location: ${step.location}`, true, C.GRAY, 16));

        // Check if details is an array of rich objects
        if (Array.isArray(step.details)) {
            step.details.forEach(block => {
                if (block.type === 'p') {
                    // Supports bold/italic via text runs
                    children.push(new Paragraph({
                        spacing: { before: 120, after: 120 },
                        children: [new TextRun({
                            text: safeStr(block.text),
                            bold: !!block.bold,
                            italic: !!block.italic,
                            size: 18,
                            color: C.GRAY
                        })]
                    }));
                }
                else if (block.type === 'list') {
                    // Standard bullet list
                    block.items.forEach(item => {
                        children.push(new Paragraph({
                            bullet: { level: 0 },
                            children: [new TextRun({ text: safeStr(item), size: 18, color: C.GRAY })]
                        }));
                    });
                }
                else if (block.type === 'nested_list') {
                    // Uses the renderNestedList helper from your reference
                    children.push(...renderNestedList(block.items, Paragraph, TextRun, C));
                }
            });
        } else {
            // Fallback for simple string descriptions
            children.push(para(step.description, false, C.GRAY, 18));
        }

        if (step.snippet) {
            children.push(new Table({
                width: { size: CW, type: WidthType.DXA },
                rows: [new TableRow({ children: [codeCell(step.snippet)] })]
            }));
        }
        sp(200, 200);
    });

    children.push(para('3.X Deployment & Rollback', true, C.NAVY, 20));
    children.push(para('Deployment:', true, C.GRAY, 18));
    (data.deployment_plan || []).forEach(p => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(p), size: 18 })] })));
    children.push(para('Rollback Plan:', true, C.RED, 18));
    children.push(para(data.rollback_plan, false, C.GRAY, 18));

    // 4. RISKS & IMPACT
    children.push(h2('4. RISKS & IMPACT ANALYSIS'));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Risk", C.RED, C.WHITE, 3000), hdrCell("Impact", C.RED, C.WHITE, 1500), hdrCell("Mitigation", C.RED, C.WHITE, 4860)] }),
            ...(data.risks || []).map(r => new TableRow({
                children: [dataCell(r.risk, C.WHITE, C.RED, 3000, true), dataCell(r.impact, C.WHITE, C.GRAY, 1500), dataCell(r.mitigation, C.WHITE, C.GRAY, 4860)]
            }))
        ]
    }));

    // 5. DEPENDENCIES & 6. ASSUMPTIONS
    children.push(h2('5. DEPENDENCIES'));
    (data.dependencies || []).forEach(d => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(d), size: 18 })] })));

    children.push(h2('6. ASSUMPTIONS'));
    (data.assumptions || []).forEach(a => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: safeStr(a), size: 18 })] })));

    // 7. RESOURCES
    children.push(h2('7. RESOURCES'));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: Object.entries(data.resources || {}).map(([k, v]) => new TableRow({
            children: [dataCell(k, C.LIGHT_GRAY, C.NAVY, 2500, true), dataCell(v, C.WHITE, C.BLUE, 6860)]
        }))
    }));

    // 8. REVISION HISTORY
    children.push(h2('8. REVISION HISTORY'));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA },
        rows: [
            new TableRow({ children: [hdrCell("Ver", C.GRAY, C.WHITE, 800), hdrCell("Date", C.GRAY, C.WHITE, 1500), hdrCell("Author", C.GRAY, C.WHITE, 1500), hdrCell("Change", C.GRAY, C.WHITE, 5560)] }),
            ...(data.revisions || []).map(rev => new TableRow({
                children: [dataCell(rev.version, C.WHITE, C.GRAY, 800), dataCell(rev.date, C.WHITE, C.GRAY, 1500), dataCell(rev.author, C.WHITE, C.GRAY, 1500), dataCell(rev.change, C.WHITE, C.GRAY, 5560)]
            }))
        ]
    }));

    // FOOTER
    children.push(sp(400, 0));
    children.push(new Paragraph({
        alignment: 'center',
        children: [
            new TextRun({ text: `${safeStr(data.company_name)} – Confidential`, size: 16, color: C.GRAY }),
            new TextRun({ text: `\rFor Internal / Client Use Only | © ${new Date().getFullYear()}`, size: 16, color: C.GRAY })
        ]
    }));

    const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children }] });
    const blob = await Packer.toBlob(doc);
    return { blob, filename: `TechSpec_${data.technical_title.replace(/\s+/g, '_')}.docx` };
}
