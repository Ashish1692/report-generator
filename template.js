// ════════════════════════════════════════════════════ 
// Template Generator 
// ════════════════════════════════════════════════════
async function generateCallScript(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType,
        Header, Footer, TabStopType } = getDocx();

    const C = docxColors();
    const meta = data.meta || {};
    const topics = data.topics || [];
    const account = safeStr(meta.account || 'Account');
    const call_date = safeStr(meta.date || meta.call_date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    const pm = safeStr(meta.prepared_by || meta.pm || 'Program Manager');
    const call_type = safeStr(meta.call_type || 'Weekly Sync');
    const audience = safeStr(meta.audience || '');
    const presenter = safeStr(meta.presenter_role || meta.presenter || 'Program Manager');

    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    const noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    const noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp() { return new Paragraph({ spacing: { before: 160, after: 0 }, children: [] }); }
    function divider() {
        return new Paragraph({
            spacing: { before: 80, after: 80 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, children: []
        });
    }
    function para(t, bold, color, size) {
        return new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: 'Arial' })]
        });
    }
    function h2(t, color) {
        return new Paragraph({
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.BLUE, size: 28, font: 'Arial' })]
        });
    }
    function hdrCell(t, bg, tc, w) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: 'Arial' })] })]
        });
    }
    function dataCell(t, bg, tc, w, bold) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: 'Arial' })] })]
        });
    }
    function statusCell(t, w) {
        const s = (t || '').toLowerCase();
        let bg, tc;
        if (s.includes('progress') || s.includes('wip')) { bg = C.LIGHT_BLUE; tc = C.BLUE; }
        else if (s.includes('test') || s.includes('qa')) { bg = C.LIGHT_AMBER; tc = C.AMBER; }
        else if (s.includes('prod')) { bg = C.LIGHT_GREEN; tc = C.GREEN; }
        else { bg = C.LIGHT_GRAY; tc = C.GRAY; }
        return dataCell(t, bg, tc, w, true);
    }

    function buildTopicNodes(t, idx) {
        const nodes = [];
        nodes.push(h2('TOPIC ' + (idx + 1) + ' — ' + safeStr(t.title || ('Topic ' + (idx + 1))), C.NAVY));
        nodes.push(sp());

        if (t.say_this) {
            nodes.push(new Table({
                width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                    new TableRow({
                        children: [new TableCell({
                            borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.GREEN }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.GREEN }, right: bdr },
                            shading: { fill: C.LIGHT_GREEN, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                            margins: { top: 160, bottom: 160, left: 220, right: 220 },
                            children: [
                                new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'SAY THIS:', bold: true, color: C.GREEN, size: 18, font: 'Arial' })] }),
                                para(t.say_this, false, C.GRAY, 19)
                            ]
                        })]
                    })
                ]
            }));
            nodes.push(sp());
        }

        if ((t.tasks || []).length) {
            nodes.push(new Table({
                width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 1100, 1500, 3500, 1960], rows: [
                    new TableRow({
                        children: [
                            hdrCell('Task #', C.BLUE, C.WHITE, 1300), hdrCell('Type', C.BLUE, C.WHITE, 1100),
                            hdrCell('Assigned To', C.BLUE, C.WHITE, 1500), hdrCell('Description', C.BLUE, C.WHITE, 3500),
                            hdrCell('State', C.BLUE, C.WHITE, 1960)
                        ]
                    }),
                    ...t.tasks.map((tk, i) => new TableRow({
                        children: [
                            dataCell(tk.num || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.BLUE, 1300, true),
                            dataCell(tk.type || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1100),
                            dataCell(tk.assignee || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1500),
                            dataCell(tk.title || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3500),
                            statusCell(tk.state || '', 1960)
                        ]
                    }))
                ]
            }));
            nodes.push(sp());
        }

        if ((t.qa_pairs || []).length) {
            nodes.push(new Paragraph({
                spacing: { before: 120, after: 80 },
                children: [new TextRun({ text: 'IF THEY ASK:', bold: true, color: C.AMBER, size: 19, font: 'Arial' })]
            }));
            nodes.push(new Table({
                width: { size: 9360, type: WidthType.DXA }, columnWidths: [4500, 4860], rows: [
                    new TableRow({ children: [hdrCell('Question', C.AMBER, C.WHITE, 4500), hdrCell('Quick Answer', C.AMBER, C.WHITE, 4860)] }),
                    ...t.qa_pairs.map((q, i) => new TableRow({
                        children: [
                            dataCell(q.question || '', i % 2 ? C.WHITE : 'F9FAFB', C.NAVY, 4500, true),
                            dataCell(q.answer || '', i % 2 ? C.WHITE : 'F9FAFB', C.GRAY, 4860)
                        ]
                    }))
                ]
            }));
            nodes.push(sp());
        }

        if (t.technical_notes) {
            nodes.push(new Table({
                width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                    new TableRow({
                        children: [new TableCell({
                            borders: { top: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, right: bdr },
                            shading: { fill: C.LIGHT_GRAY, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                            margins: { top: 140, bottom: 140, left: 220, right: 220 },
                            children: [
                                new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'TECHNICAL NOTES (FOR YOUR EYES ONLY):', bold: true, color: C.GRAY, size: 16, font: 'Arial' })] }),
                                para(t.technical_notes, false, '6E7681', 18)
                            ]
                        })]
                    })
                ]
            }));
            nodes.push(sp());
        }

        nodes.push(divider());
        return nodes;
    }

    const allTopicNodes = topics.flatMap((t, i) => buildTopicNodes(t, i));
    const closingNodes = data.closing_statement ? [
        sp(),
        new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.TEAL }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.TEAL }, right: bdr },
                        shading: { fill: C.LIGHT_TEAL, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                        margins: { top: 160, bottom: 160, left: 220, right: 220 },
                        children: [
                            new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'CLOSING:', bold: true, color: C.TEAL, size: 18, font: 'Arial' })] }),
                            para(data.closing_statement, false, C.GRAY, 19)
                        ]
                    })]
                })
            ]
        })
    ] : [];

    const doc = new Document({
        styles: { default: { document: { run: { font: 'Arial', size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } },
                            spacing: { before: 0, after: 120 },
                            tabStops: [{ type: TabStopType.RIGHT, position: 8640 }],
                            children: [
                                new TextRun({ text: account + ' - ' + call_type, bold: true, color: C.NAVY, size: 18, font: 'Arial' }),
                                new TextRun({ text: '\t' + call_date, color: C.GRAY, size: 18, font: 'Arial' })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } },
                            spacing: { before: 80 },
                            children: [new TextRun({ text: account + ' | Call Script | Confidential', color: C.GRAY, size: 16, font: 'Arial' })]
                        })
                    ]
                })
            },
            children: [
                new Table({
                    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                        new TableRow({
                            children: [new TableCell({
                                borders: noBdrs, shading: { fill: C.NAVY, type: ShadingType.CLEAR },
                                width: { size: 9360, type: WidthType.DXA }, margins: { top: 360, bottom: 360, left: 360, right: 360 },
                                children: [
                                    new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'CLIENT UPDATE CALL SCRIPT', bold: true, color: C.WHITE, size: 48, font: 'Arial' })] }),
                                    new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: call_date + '   |   ' + audience, color: 'AECBF0', size: 22, font: 'Arial' })] }),
                                    new Paragraph({ children: [new TextRun({ text: 'Prepared by: ' + pm, color: 'C0D8F5', size: 20, font: 'Arial' })] })
                                ]
                            })]
                        })
                    ]
                }),
                sp(),
                new Table({
                    width: { size: 9360, type: WidthType.DXA }, columnWidths: [1800, 7560], rows: [
                        new TableRow({ children: [hdrCell('Field', C.NAVY, C.WHITE, 1800), hdrCell('Detail', C.NAVY, C.WHITE, 7560)] }),
                        new TableRow({ children: [dataCell('Client', 'F8FAFC', C.NAVY, 1800, true), dataCell(account, 'F8FAFC', C.GRAY, 7560)] }),
                        new TableRow({ children: [dataCell('Call Type', C.WHITE, C.NAVY, 1800, true), dataCell(call_type, C.WHITE, C.GRAY, 7560)] }),
                        new TableRow({ children: [dataCell('Date', 'F8FAFC', C.NAVY, 1800, true), dataCell(call_date, 'F8FAFC', C.GRAY, 7560)] }),
                        new TableRow({ children: [dataCell('Prepared By', C.WHITE, C.NAVY, 1800, true), dataCell(pm, C.WHITE, C.GRAY, 7560)] }),
                        new TableRow({ children: [dataCell('Presenter Role', 'F8FAFC', C.NAVY, 1800, true), dataCell(presenter, 'F8FAFC', C.GRAY, 7560)] }),
                        new TableRow({ children: [dataCell('Audience', C.WHITE, C.NAVY, 1800, true), dataCell(audience, C.WHITE, C.GRAY, 7560)] })
                    ]
                }),
                sp(), divider(),
                ...allTopicNodes,
                ...closingNodes,
                sp(),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: account + ' - ' + call_type + '  |  ' + call_date + '  |  Prepared by ' + pm, color: C.MGRAY, size: 16, font: 'Arial', italics: true })]
                })
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    const date_str = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(/ /g, '').replace(',', '_');
    const safe_acct = account.replace(/\s+/g, '_');
    return { blob, filename: safe_acct + '_Call_Script_' + date_str + '.docx' };
}

async function generateStatusReport(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType,
        Header, Footer, TabStopType } = getDocx();

    const C = docxColors();
    const meta = data.meta || {};
    const account = safeStr(meta.account || 'DevShop');
    const week_of = safeStr(meta.week_of || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    const pm = safeStr(meta.pm || 'Program Manager');
    const org = safeStr(meta.org || '');
    const m = data.metrics || {};

    const incidents = data.incidents || [];
    const stories = data.stories || [];
    const s_prod = stories.filter(s => s.phase === 'PROD');
    const s_test = stories.filter(s => s.phase === 'TEST');
    const s_wip = stories.filter(s => s.phase === 'WIP');
    const s_enhc = stories.filter(s => s.phase === 'ENHC');
    const s_other = stories.filter(s => !['PROD', 'TEST', 'WIP', 'ENHC'].includes(s.phase));
    const uat = data.uat_backlog || [];
    const blockers = data.blockers || [];
    const actions = data.action_items || [];
    const team = data.team || [];
    const fi = data.focus_item || {};
    const focusItems = Array.isArray(data.focus_items) ? data.focus_items : fi.title ? [fi] : [];

    const bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    const noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    const noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp() { return new Paragraph({ spacing: { before: 160, after: 0 }, children: [] }); }
    function divider() {
        return new Paragraph({
            spacing: { before: 80, after: 80 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, children: []
        });
    }
    function h2(t, color) {
        return new Paragraph({
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.BLUE, size: 28, font: 'Arial' })]
        });
    }
    function para(t, bold, color, size) {
        return new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: 'Arial' })]
        });
    }
    function bullet(t) {
        return new Paragraph({
            bullet: { level: 0 }, spacing: { before: 40, after: 40 },
            children: [new TextRun({ text: safeStr(t), color: C.GRAY, size: 19, font: 'Arial' })]
        });
    }
    function hdrCell(t, bg, tc, w) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: 'Arial' })] })]
        });
    }
    function dataCell(t, bg, tc, w, bold) {
        return new TableCell({
            borders, width: { size: w, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: 'Arial' })] })]
        });
    }
    function statusCell(t, w) {
        const s = (t || '').toLowerCase();
        let bg, tc;
        if (s.includes('progress') || s.includes('wip')) { bg = C.LIGHT_BLUE; tc = C.BLUE; }
        else if (s.includes('test') || s.includes('qa')) { bg = C.LIGHT_AMBER; tc = C.AMBER; }
        else if (s.includes('prod')) { bg = C.LIGHT_GREEN; tc = C.GREEN; }
        else if (s === 'open') { bg = 'FED7AA'; tc = 'C2410C'; }
        else { bg = C.LIGHT_GRAY; tc = C.GRAY; }
        return dataCell(t, bg, tc, w, true);
    }
    function pcol(p) {
        return (p && (p.includes('1 - Critical') || p.includes('2 - High'))) ? C.RED : C.GRAY;
    }

    function incRows() {
        if (!incidents.length) return [new TableRow({ children: [dataCell('No incidents', C.WHITE, C.GRAY, 9360)] })];
        return incidents.map((inc, i) => new TableRow({
            children: [
                dataCell(inc.num || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.BLUE, 1200, true),
                dataCell(inc.title || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2400),
                dataCell(inc.assignee || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1000),
                statusCell(inc.state || '', 1200),
                dataCell(inc.priority || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, pcol(inc.priority), 800),
                dataCell(inc.note || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2760)
            ]
        }));
    }
    function storyRows(items) {
        if (!items.length) return [new TableRow({ children: [dataCell('None', C.WHITE, C.GRAY, 9360)] })];
        return items.map((s, i) => new TableRow({
            children: [
                dataCell(s.num || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.TEAL, 1300, true),
                dataCell(s.title || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3500),
                dataCell(s.assignee || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1200),
                dataCell(s.priority || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, pcol(s.priority), 1200),
                statusCell(s.state || '', 2160)
            ]
        }));
    }

    const children = [];

    // Cover
    children.push(new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
            new TableRow({
                children: [new TableCell({
                    borders: noBdrs, shading: { fill: C.NAVY, type: ShadingType.CLEAR },
                    width: { size: 9360, type: WidthType.DXA }, margins: { top: 360, bottom: 360, left: 360, right: 360 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'DEVSHOP STATUS REPORT', bold: true, color: C.WHITE, size: 48, font: 'Arial' })] }),
                        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: account + ' CSM Engagement   |   Week of ' + week_of, color: 'AECBF0', size: 22, font: 'Arial' })] }),
                        new Paragraph({ children: [new TextRun({ text: 'Prepared by: ' + pm, color: 'C0D8F5', size: 20, font: 'Arial' })] })
                    ]
                })]
            })
        ]
    }));
    children.push(sp());

    // Executive Summary
    children.push(h2('Executive Summary', C.NAVY));
    children.push(para(data.executive_summary || '', false, C.GRAY, 20));
    children.push(divider());

    // Metrics - colored 6-column dashboard matching desktop version
    if (Object.keys(m).length) {
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1560, 1560, 1560, 1560, 1560, 1560], rows: [
                new TableRow({
                    children: [
                        hdrCell('Total Tasks', C.NAVY, C.WHITE, 1560),
                        hdrCell('In Progress', C.BLUE, C.WHITE, 1560),
                        hdrCell('In Testing', C.TEAL, C.WHITE, 1560),
                        hdrCell('Ready for PROD', C.GREEN, C.WHITE, 1560),
                        hdrCell('On Hold', C.GRAY, C.WHITE, 1560),
                        hdrCell('Critical Priority', C.RED, C.WHITE, 1560)
                    ]
                }),
                new TableRow({
                    children: [
                        dataCell(String(m.total_tasks || 0), C.LIGHT_BLUE, C.NAVY, 1560, true),
                        dataCell(String(m.in_progress || 0), C.LIGHT_BLUE, C.BLUE, 1560, true),
                        dataCell(String(m.in_testing || 0), C.LIGHT_TEAL, C.TEAL, 1560, true),
                        dataCell(String(m.ready_for_prod || 0), C.LIGHT_GREEN, C.GREEN, 1560, true),
                        dataCell(String(m.on_hold || 0), C.LIGHT_GRAY, C.GRAY, 1560, true),
                        dataCell(String(m.critical_priority || 0), C.LIGHT_RED, C.RED, 1560, true)
                    ]
                })
            ]
        }));
        children.push(sp());
    }

    // Focus Items — supports bullets[], status, body; supports array via focus_items[]
    if (focusItems.length) {
        children.push(h2('Focus Item' + (focusItems.length > 1 ? 's' : ''), C.BLUE));
        focusItems.forEach(fitem => {
            const fiNodes = [];
            fiNodes.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(fitem.title || ''), bold: true, color: C.AMBER, size: 22, font: 'Arial' })] }));
            if (fitem.status) fiNodes.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'Status: ' + safeStr(fitem.status), bold: true, color: 'C2410C', size: 19, font: 'Arial' })] }));
            if (fitem.body) fiNodes.push(para(fitem.body, false, C.GRAY, 19));
            (fitem.bullets || []).forEach(b => fiNodes.push(new Paragraph({
                bullet: { level: 0 }, spacing: { before: 40, after: 40 },
                children: [new TextRun({ text: safeStr(b), color: C.GRAY, size: 19, font: 'Arial' })]
            })));
            children.push(new Table({
                width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                    new TableRow({
                        children: [new TableCell({
                            borders: { top: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, right: bdr },
                            shading: { fill: C.LIGHT_AMBER, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                            margins: { top: 160, bottom: 160, left: 220, right: 220 },
                            children: fiNodes
                        })]
                    })
                ]
            }));
            children.push(sp());
        });
    }

    // Process Note
    if (data.process_note) {
        children.push(h2('Process Update', C.BLUE));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, bottom: bdr, left: bdr, right: bdr },
                        shading: { fill: C.LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                        margins: { top: 120, bottom: 120, left: 200, right: 200 },
                        children: [para(data.process_note, false, C.GRAY, 19)]
                    })]
                })
            ]
        }));
        children.push(sp());
    }
    // Incidents
    children.push(divider());
    children.push(h2('Incidents', C.RED));
    children.push(new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 2400, 1000, 1200, 800, 2760], rows: [
            new TableRow({
                children: [
                    hdrCell('INC #', C.RED, C.WHITE, 1200), hdrCell('Title', C.RED, C.WHITE, 2400),
                    hdrCell('Assignee', C.RED, C.WHITE, 1000), hdrCell('State', C.RED, C.WHITE, 1200),
                    hdrCell('Priority', C.RED, C.WHITE, 800), hdrCell('Notes', C.RED, C.WHITE, 2760)
                ]
            }),
            ...incRows()
        ]
    }));
    children.push(sp());

    // Stories
    if (s_prod.length) {
        children.push(h2('Stories — PROD', C.GREEN));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 3500, 1200, 1200, 2160], rows: [
                new TableRow({ children: [hdrCell('Story', C.GREEN, C.WHITE, 1300), hdrCell('Title', C.GREEN, C.WHITE, 3500), hdrCell('Assignee', C.GREEN, C.WHITE, 1200), hdrCell('Priority', C.GREEN, C.WHITE, 1200), hdrCell('State', C.GREEN, C.WHITE, 2160)] }),
                ...storyRows(s_prod)
            ]
        }));
        children.push(sp());
    }
    if (s_test.length) {
        children.push(h2('Stories — TEST', C.TEAL));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 3500, 1200, 1200, 2160], rows: [
                new TableRow({ children: [hdrCell('Story', C.TEAL, C.WHITE, 1300), hdrCell('Title', C.TEAL, C.WHITE, 3500), hdrCell('Assignee', C.TEAL, C.WHITE, 1200), hdrCell('Priority', C.TEAL, C.WHITE, 1200), hdrCell('State', C.TEAL, C.WHITE, 2160)] }),
                ...storyRows(s_test)
            ]
        }));
        children.push(sp());
    }
    if (s_wip.length) {
        children.push(h2('Stories — In Progress', C.BLUE));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 3500, 1200, 1200, 2160], rows: [
                new TableRow({ children: [hdrCell('Story', C.BLUE, C.WHITE, 1300), hdrCell('Title', C.BLUE, C.WHITE, 3500), hdrCell('Assignee', C.BLUE, C.WHITE, 1200), hdrCell('Priority', C.BLUE, C.WHITE, 1200), hdrCell('State', C.BLUE, C.WHITE, 2160)] }),
                ...storyRows(s_wip)
            ]
        }));
        children.push(sp());
    }
    if (s_enhc.length) {
        children.push(h2('Enhancements', C.BLUE));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 3500, 1200, 1200, 2160], rows: [
                new TableRow({ children: [hdrCell('Story', C.BLUE, C.WHITE, 1300), hdrCell('Title', C.BLUE, C.WHITE, 3500), hdrCell('Assignee', C.BLUE, C.WHITE, 1200), hdrCell('Priority', C.BLUE, C.WHITE, 1200), hdrCell('State', C.BLUE, C.WHITE, 2160)] }),
                ...storyRows(s_enhc)
            ]
        }));
        children.push(sp());
    }
    if (s_other.length) {
        children.push(h2('Other Tasks', C.BLUE));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [1300, 3500, 1200, 1200, 2160], rows: [
                new TableRow({ children: [hdrCell('Task', C.BLUE, C.WHITE, 1300), hdrCell('Title', C.BLUE, C.WHITE, 3500), hdrCell('Assignee', C.BLUE, C.WHITE, 1200), hdrCell('Priority', C.BLUE, C.WHITE, 1200), hdrCell('State', C.BLUE, C.WHITE, 2160)] }),
                ...storyRows(s_other)
            ]
        }));
        children.push(sp());
    }

    // UAT Backlog
    if (uat.length) {
        children.push(divider());
        children.push(h2('UAT Backlog', C.AMBER));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [
                new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, right: bdr },
                        shading: { fill: C.AMB_BG, type: ShadingType.CLEAR }, width: { size: 9360, type: WidthType.DXA },
                        margins: { top: 160, bottom: 160, left: 220, right: 220 },
                        children: uat.map(item => bullet(item))
                    })]
                })
            ]
        }));
        children.push(sp());
    }

    // Blockers
    if (blockers.length) {
        children.push(divider());
        children.push(h2('Blockers & Risks', C.RED));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [3000, 3180, 3180], rows: [
                new TableRow({ children: [hdrCell('Blocker', C.RED, C.WHITE, 3000), hdrCell('Impact', C.RED, C.WHITE, 3180), hdrCell('Resolution', C.RED, C.WHITE, 3180)] }),
                ...blockers.map((b, i) => new TableRow({
                    children: [
                        dataCell(b.blocker || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3000),
                        dataCell(b.impact || '', C.LIGHT_AMBER, C.AMBER, 3180),
                        dataCell(b.resolution || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3180)
                    ]
                }))
            ]
        }));
        children.push(sp());
    }

    // Action Items
    if (actions.length) {
        children.push(divider());
        children.push(h2('Action Items', C.NAVY));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [2400, 3960, 1500, 1500], rows: [
                new TableRow({ children: [hdrCell('Owner', C.NAVY, C.WHITE, 2400), hdrCell('Action', C.NAVY, C.WHITE, 3960), hdrCell('Item', C.NAVY, C.WHITE, 1500), hdrCell('Due', C.NAVY, C.WHITE, 1500)] }),
                ...actions.map((a, i) => new TableRow({
                    children: [
                        dataCell(a.owner || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2400, true),
                        dataCell(a.action || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 3960),
                        dataCell(a.item || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.BLUE, 1500),
                        dataCell(a.due || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 1500)
                    ]
                }))
            ]
        }));
        children.push(sp());
    }

    // Team
    if (team.length) {
        children.push(divider());
        children.push(h2('Team Overview', C.NAVY));
        children.push(new Table({
            width: { size: 9360, type: WidthType.DXA }, columnWidths: [2520, 2520, 4320], rows: [
                new TableRow({ children: [hdrCell('Name', C.NAVY, C.WHITE, 2520), hdrCell('Role', C.NAVY, C.WHITE, 2520), hdrCell('Focus', C.NAVY, C.WHITE, 4320)] }),
                ...team.map((t, i) => new TableRow({
                    children: [
                        dataCell(t.name || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.NAVY, 2520, true),
                        dataCell(t.role || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 2520),
                        dataCell(t.focus || '', i % 2 ? C.WHITE : C.LIGHT_GRAY, C.GRAY, 4320)
                    ]
                }))
            ]
        }));
        children.push(sp());
    }

    children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Prepared by ' + pm + '  |  ' + account + ' CSM DevShop  |  ' + week_of, color: C.MGRAY, size: 16, font: 'Arial', italics: true })]
    }));

    const doc = new Document({
        styles: { default: { document: { run: { font: 'Arial', size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } },
                            spacing: { before: 0, after: 120 },
                            tabStops: [{ type: TabStopType.RIGHT, position: 8640 }],
                            children: [
                                new TextRun({ text: account + ' DevShop - Status Report', bold: true, color: C.NAVY, size: 18, font: 'Arial' }),
                                new TextRun({ text: '\tWeek of ' + week_of, color: C.GRAY, size: 18, font: 'Arial' })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } },
                            spacing: { before: 80 },
                            children: [new TextRun({ text: (org || account) + ' | Confidential', color: C.GRAY, size: 16, font: 'Arial' })]
                        })
                    ]
                })
            },
            children
        }]
    });

    const blob = await Packer.toBlob(doc);
    const date_str = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(/ /g, '').replace(',', '_');
    const safe_acct = account.replace(/\s+/g, '_');
    return { blob, filename: safe_acct + '_Status_Report_' + date_str + '.docx' };
}

async function generateRCA(data) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType,
        Header, Footer, TabStopType } = getDocx();

    const C = docxColors();
    const CW = 9360;
    const FONT = 'Arial';
    const incident = safeStr(data.incident || 'INC000000');
    const account = safeStr(data.account || '');
    const s = data.summary || {}; // fallback; primary fields come from root level

    const thinBdr = { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY };
    const cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };
    const noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    const noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp(before, after) { return new Paragraph({ spacing: { before: before || 0, after: after || 0 }, children: [] }); }
    function hrule(color) {
        return new Paragraph({
            spacing: { before: 40, after: 40 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: color || C.BLUE, space: 1 } }, children: []
        });
    }
    function secHead(num, title) {
        return new Paragraph({
            spacing: { before: 320, after: 120 }, children: [
                new TextRun({ text: num + '.  ', font: FONT, size: 26, bold: true, color: C.NAVY }),
                new TextRun({ text: title, font: FONT, size: 26, bold: true, color: C.BLUE })
            ]
        });
    }
    function bodyPara(text) {
        if (!text || !String(text).trim()) return null;
        return new Paragraph({
            spacing: { before: 80, after: 120 },
            children: [new TextRun({ text: safeStr(text).trim(), font: FONT, size: 20, color: C.GRAY })]
        });
    }
    function placeholder(msg) {
        return new Paragraph({
            spacing: { before: 80, after: 80 },
            children: [new TextRun({ text: '\u2014  ' + msg, font: FONT, size: 19, italics: true, color: C.PH_TXT })]
        });
    }
    function sumRow(label, value, shade) {
        return new TableRow({
            children: [
                new TableCell({
                    width: { size: 2520, type: WidthType.DXA }, shading: { fill: shade || C.NAVY, type: ShadingType.CLEAR },
                    borders: cellBdr, margins: { top: 100, bottom: 100, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: safeStr(label), font: FONT, size: 19, bold: true, color: C.WHITE })] })]
                }),
                new TableCell({
                    width: { size: 6840, type: WidthType.DXA }, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                    borders: cellBdr, margins: { top: 100, bottom: 100, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: safeStr(value || '\u2014'), font: FONT, size: 19, color: C.GRAY })] })]
                })
            ]
        });
    }
    function calloutBox(devName, items) {
        if (!items || !items.length) return null;
        return new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [
                new TableRow({
                    children: [new TableCell({
                        width: { size: CW, type: WidthType.DXA },
                        shading: { fill: C.AMB_BG, type: ShadingType.CLEAR },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD },
                            bottom: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD },
                            left: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD },
                            right: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD }
                        },
                        margins: { top: 160, bottom: 160, left: 200, right: 200 },
                        children: [
                            new Paragraph({
                                spacing: { before: 0, after: 120 }, children: [
                                    new TextRun({ text: 'ACTION REQUIRED', font: FONT, size: 20, bold: true, color: C.AMB_BD }),
                                    new TextRun({ text: devName ? ' \u2014 ' + devName : '', font: FONT, size: 20, bold: true, color: C.AMB_TXT })
                                ]
                            }),
                            ...items.map(item => new Paragraph({
                                spacing: { before: 60, after: 60 },
                                children: [new TextRun({ text: '\u2022 ' + safeStr(item || ''), font: FONT, size: 19, color: C.AMB_TXT })]
                            }))
                        ]
                    })]
                })
            ]
        });
    }

    const callouts = data.callouts || data.callout_boxes || []; // support both key names
    function getCallouts(sectionKey) {
        return callouts.filter(cb => cb.section === sectionKey).map(cb => calloutBox(cb.dev, cb.items)).filter(Boolean);
    }

    function buildSection(num, title, bodyText, sectionKey) {
        const nodes = [secHead(num, title)];
        const bp = bodyPara(bodyText);
        if (bp) nodes.push(bp);
        else nodes.push(placeholder('No content provided — verify with team before distributing'));
        nodes.push(...getCallouts(sectionKey));
        return nodes;
    }
    function buildListSection(num, title, arr, sectionKey) {
        const nodes = [secHead(num, title)];
        if ((arr || []).length) {
            arr.forEach((item, i) => {
                var clean = safeStr(item || '').replace(/^\d+\.\s*/, '');
                nodes.push(new Paragraph({
                    spacing: { before: 60, after: 60 },
                    children: [new TextRun({ text: (i + 1) + '. ' + clean, font: FONT, size: 20, color: C.GRAY })]
                }));
            });
        } else {
            nodes.push(placeholder('No items listed'));
        }
        nodes.push(...getCallouts(sectionKey));
        return nodes;
    }

    // Timeline: time + event columns always shown; actor + type shown only if present in data
    const tlHasActor = (data.timeline || []).some(e => e.actor);
    const tlHasType = (data.timeline || []).some(e => e.type);
    const tlCols = [2160, ...(tlHasActor ? [1800] : []), ...(tlHasType ? [1560] : [])];
    const tlEventW = CW - 2160 - (tlHasActor ? 1800 : 0) - (tlHasType ? 1560 : 0);
    const tlRows = (data.timeline || []).map((e, i) => {
        const shade = i % 2 ? C.WHITE : C.LGRAY;
        const cells = [
            new TableCell({
                width: { size: 2160, type: WidthType.DXA }, shading: { fill: shade, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: safeStr(e.time || ''), font: FONT, size: 17, color: C.GRAY })] })]
            }),
            new TableCell({
                width: { size: tlEventW, type: WidthType.DXA }, shading: { fill: shade, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: safeStr(e.event || ''), font: FONT, size: 18, color: C.GRAY })] })]
            }),
        ];
        if (tlHasActor) cells.push(new TableCell({
            width: { size: 1800, type: WidthType.DXA }, shading: { fill: shade, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(e.actor || ''), font: FONT, size: 18, color: C.GRAY })] })]
        }));
        if (tlHasType) cells.push(new TableCell({
            width: { size: 1560, type: WidthType.DXA }, shading: { fill: shade, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: safeStr(e.type || ''), font: FONT, size: 18, color: C.GRAY })] })]
        }));
        return new TableRow({ children: cells });
    });

    const freeCallouts = callouts.map(cb => calloutBox(cb.dev, cb.items)).filter(Boolean); // all callouts rendered together

    const children = [
        // Title cover
        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'ROOT CAUSE ANALYSIS', font: FONT, size: 52, bold: true, color: C.NAVY })] }),
        new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: incident + (account ? ' \u2014 ' + account : ''), font: FONT, size: 26, color: C.BLUE })] }),
        hrule(C.NAVY),
        sp(160, 0),

        // Summary table - supports root-level fields (AI prompt schema) and nested summary object
        new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [2520, 6840], rows: [
                sumRow('Incident', data.incident || s.incident || ''),
                sumRow('Title', data.title || s.title || ''),
                sumRow('Story', data.story || s.story || ''),
                sumRow('Change Record', data.change || s.change || ''),
                sumRow('Status', data.status || s.status || ''),
                sumRow('Date Reported', s.date_reported || ''),
                sumRow('Date Resolved', data.fix_date || s.date_resolved || ''),
                sumRow('Severity', s.severity || ''),
                sumRow('Affected System', s.affected_system || ''),
                sumRow('Reported By', data.reported_by || s.reported_by || ''),
                sumRow('Resolved By', data.developer || s.resolved_by || ''),
                sumRow('Root Cause Category', s.root_cause_category || ''),
                sumRow('Downtime', s.downtime || ''),
                sumRow('Impact Summary', s.impact_summary || ''),
            ]
        }),
        sp(200, 0),

        ...buildSection('1', 'Incident Overview', data.s1, 's1'),
        ...buildSection('2', 'Root Cause Analysis', data.s2, 's2'),
        ...buildSection('3', 'Impact Assessment', data.s3, 's3'),
        ...buildSection('4', 'Resolution', data.s4, 's4'),
        ...buildSection('5', 'Contributing Factors', data.s5, 's5'),
        ...buildListSection('6', 'Immediate Actions Taken', data.s6, 's6'),
        ...buildListSection('7', 'Corrective Actions / Recommendations', data.s7, 's7'),
        ...buildListSection('8', 'Open Questions', data.s8, 's8'),
    ];

    // Timeline section - dynamic columns based on what fields are present
    if (tlRows.length) {
        children.push(secHead('9', 'Incident Timeline'));
        const tlHdrCells = [
            new TableCell({
                width: { size: 2160, type: WidthType.DXA }, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Time', font: FONT, size: 19, bold: true, color: C.WHITE })] })]
            }),
            new TableCell({
                width: { size: tlEventW, type: WidthType.DXA }, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Event', font: FONT, size: 19, bold: true, color: C.WHITE })] })]
            }),
        ];
        if (tlHasActor) tlHdrCells.push(new TableCell({
            width: { size: 1800, type: WidthType.DXA }, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: 'Actor', font: FONT, size: 19, bold: true, color: C.WHITE })] })]
        }));
        if (tlHasType) tlHdrCells.push(new TableCell({
            width: { size: 1560, type: WidthType.DXA }, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: 'Type', font: FONT, size: 19, bold: true, color: C.WHITE })] })]
        }));
        const tlAllCols = [2160, tlEventW, ...(tlHasActor ? [1800] : []), ...(tlHasType ? [1560] : [])];
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: tlAllCols, rows: [
                new TableRow({ children: tlHdrCells }),
                ...tlRows
            ]
        }));
        children.push(sp(120, 0));
    }

    // Free callouts
    if (freeCallouts.length) {
        freeCallouts.forEach(cb => { children.push(cb); children.push(sp(80, 0)); });
    }

    // Doc notes
    if (data.s10) {
        children.push(hrule(C.MGRAY));
        children.push(secHead('10', 'Document Notes'));
        const bp = bodyPara(data.s10);
        if (bp) children.push(bp);
    }

    // Distribution amber warning
    children.push(sp(200, 0));
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [
            new TableRow({
                children: [new TableCell({
                    shading: { fill: C.AMB_BG, type: ShadingType.CLEAR },
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.AMB_BD }, bottom: { style: BorderStyle.SINGLE, size: 8, color: C.AMB_BD }, left: { style: BorderStyle.SINGLE, size: 8, color: C.AMB_BD }, right: { style: BorderStyle.SINGLE, size: 8, color: C.AMB_BD } },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'DISTRIBUTION & CONFIDENTIALITY NOTICE', font: FONT, size: 18, bold: true, color: C.AMB_TXT })] }),
                        new Paragraph({ children: [new TextRun({ text: 'This document contains confidential incident information. Distribute only to approved stakeholders.', font: FONT, size: 18, color: C.AMB_TXT })] })
                    ]
                })]
            })
        ]
    }));

    const doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } },
                            spacing: { before: 0, after: 120 },
                            tabStops: [{ type: TabStopType.RIGHT, position: 8640 }],
                            children: [
                                new TextRun({ text: 'CONFIDENTIAL | Root Cause Analysis' + (account ? ' | ' + account : ''), bold: true, color: C.NAVY, size: 18, font: FONT }),
                                new TextRun({ text: '\t' + incident, color: C.GRAY, size: 18, font: FONT })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } },
                            spacing: { before: 80 },
                            children: [new TextRun({ text: 'Root Cause Analysis' + (account ? ' | ' + account : '') + (incident ? ' | ' + incident : ''), color: C.GRAY, size: 16, font: FONT })]
                        })
                    ]
                })
            },
            children
        }]
    });

    const blob = await Packer.toBlob(doc);
    const safe_inc = incident.replace(/\s+/g, '_');
    const safe_acct = account.replace(/\s+/g, '_');
    return { blob, filename: 'RCA_' + safe_inc + (safe_acct ? '_' + safe_acct : '') + '.docx' };
}

async function generateBlockerBrief(data) {
    var D = getDocx();
    var Document = D.Document, Packer = D.Packer, Paragraph = D.Paragraph, TextRun = D.TextRun,
        Table = D.Table, TableRow = D.TableRow, TableCell = D.TableCell,
        AlignmentType = D.AlignmentType, BorderStyle = D.BorderStyle,
        WidthType = D.WidthType, ShadingType = D.ShadingType, Header = D.Header, Footer = D.Footer, TabStopType = D.TabStopType;
    var C = docxColors(); var CW = 9360; var FONT = 'Arial';
    var thinBdr = { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY };
    var cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };
    var bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    var borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    var noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    var noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp(b, a) { return new Paragraph({ spacing: { before: b || 0, after: a || 0 }, children: [] }); }
    function divider() { return new Paragraph({ spacing: { before: 80, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, children: [] }); }
    function h2(t, color) { return new Paragraph({ spacing: { before: 240, after: 120 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.BLUE, size: 26, font: FONT })] }); }
    function para(t, bold, color, size) { return new Paragraph({ spacing: { before: 60, after: 80 }, children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })] }); }
    function hdrCell(t, bg, tc, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }
    function calloutBox(label, body, bdColor, bgColor) {
        return new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    width: { size: CW, type: WidthType.DXA },
                    shading: { fill: bgColor, type: ShadingType.CLEAR },
                    borders: { top: { style: BorderStyle.SINGLE, size: 10, color: bdColor }, bottom: { style: BorderStyle.SINGLE, size: 4, color: bdColor }, left: { style: BorderStyle.SINGLE, size: 10, color: bdColor }, right: { style: BorderStyle.SINGLE, size: 4, color: bdColor } },
                    margins: { top: 140, bottom: 140, left: 200, right: 200 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(label), bold: true, color: bdColor, size: 18, font: FONT })] }),
                        para(body, false, C.GRAY, 19)
                    ]
                })]
            })],
        });
    }
    function listPara(text, i) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: (i + 1) + '. ' + safeStr(text).replace(/^\d+\.\s*/, ''), font: FONT, size: 19, color: C.GRAY })] }); }

    var statusColorMap = { 'Open': C.RED, 'Under Investigation': C.AMBER, 'Partially Resolved': C.TEAL, 'Resolved': C.GREEN, 'Deferred': C.GRAY };
    var statusBgMap = { 'Open': C.LIGHT_RED, 'Under Investigation': C.LIGHT_AMBER, 'Partially Resolved': C.LIGHT_TEAL, 'Resolved': C.LIGHT_GREEN, 'Deferred': C.LIGHT_GRAY };
    var st = data.status || 'Open';
    var stColor = statusColorMap[st] || C.GRAY;
    var stBg = statusBgMap[st] || C.LIGHT_GRAY;

    var children = [];

    // Cover
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
            children: [new TableCell({
                borders: noBdrs, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 320, bottom: 320, left: 360, right: 360 },
                children: [
                    new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'BLOCKER EVALUATION BRIEF', bold: true, color: C.WHITE, size: 44, font: FONT })] }),
                    new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 ' + safeStr(data.date || ''), color: 'AECBF0', size: 22, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: 'Task: ' + safeStr(data.task_num || '') + ' | Prepared by: ' + safeStr(data.pm || ''), color: 'C0D8F5', size: 19, font: FONT })] })
                ]
            })]
        })]
    }));
    children.push(sp(160, 0));

    // Status banner
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [1800, 7560], rows: [new TableRow({
            children: [
                new TableCell({
                    width: { size: 1800, type: WidthType.DXA }, shading: { fill: stColor, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: safeStr(st), bold: true, color: C.WHITE, size: 22, font: FONT })] })]
                }),
                new TableCell({
                    width: { size: 7560, type: WidthType.DXA }, shading: { fill: stBg, type: ShadingType.CLEAR }, borders: cellBdr, margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: safeStr(data.title || ''), bold: true, color: stColor, size: 20, font: FONT })] })]
                })
            ]
        })]
    }));
    children.push(sp(120, 0));

    if (data.summary) { children.push(h2('Summary', C.NAVY)); children.push(para(data.summary, false, C.GRAY, 20)); children.push(divider()); }
    if (data.blocker_description) { children.push(h2('Blocker Description', C.NAVY)); children.push(para(data.blocker_description, false, C.GRAY, 19)); children.push(sp(80, 0)); }
    if (data.impact) { children.push(divider()); children.push(h2('Impact', C.RED)); children.push(calloutBox('Impact', data.impact, 'F59E0B', C.LIGHT_AMBER)); children.push(sp(80, 0)); }
    if (data.investigation) { children.push(divider()); children.push(h2('Investigation', C.BLUE)); children.push(para(data.investigation, false, C.GRAY, 19)); children.push(sp(80, 0)); }
    if (data.root_cause) { children.push(divider()); children.push(h2('Root Cause', C.NAVY)); children.push(calloutBox('Root Cause', data.root_cause, C.AMBER, C.LIGHT_AMBER)); children.push(sp(80, 0)); }

    var solutions = data.proposed_solutions || [];
    if (solutions.length) {
        children.push(divider()); children.push(h2('Proposed Solutions', C.BLUE));
        solutions.forEach(function (s, i) {
            var sc = s.status === 'Completed' ? C.GREEN : s.status === 'Rejected' ? C.RED : C.BLUE;
            var sb = s.status === 'Completed' ? C.LIGHT_GREEN : s.status === 'Rejected' ? C.LIGHT_RED : C.LIGHT_BLUE;
            children.push(new Table({
                width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                    children: [new TableCell({
                        width: { size: CW, type: WidthType.DXA }, shading: { fill: sb, type: ShadingType.CLEAR },
                        borders: { top: { style: BorderStyle.SINGLE, size: 6, color: sc }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 6, color: sc }, right: bdr },
                        margins: { top: 120, bottom: 120, left: 180, right: 180 },
                        children: [
                            new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: (i + 1) + '. ' + safeStr(s.option || ''), bold: true, color: sc, size: 20, font: FONT }), new TextRun({ text: '  |  Effort: ' + safeStr(s.effort || '') + '  |  Risk: ' + safeStr(s.risk || '') + '  |  ' + safeStr(s.status || ''), color: C.GRAY, size: 17, font: FONT })] }),
                            para(s.description || '', false, C.GRAY, 19),
                            ...(s.outcome ? [para('Outcome: ' + s.outcome, true, sc, 18)] : [])
                        ]
                    })]
                })]
            }));
            children.push(sp(60, 0));
        });
    }

    if (data.resolution) { children.push(divider()); children.push(h2('Resolution', C.GREEN)); children.push(calloutBox('Resolution Applied', data.resolution, C.GREEN, C.LIGHT_GREEN)); children.push(sp(80, 0)); }

    var ns = data.next_steps || [];
    if (ns.length) {
        children.push(divider()); children.push(h2('Next Steps', C.NAVY));
        ns.forEach(function (s, i) { children.push(listPara(String(s), i)); });
        children.push(sp(80, 0));
    }

    var oq = data.open_questions || [];
    if (oq.length) {
        children.push(divider()); children.push(h2('Open Questions', C.AMBER));
        oq.forEach(function (q, i) { children.push(listPara(String(q), i)); });
        children.push(sp(80, 0));
    }

    if (data.technical_context) {
        children.push(divider()); children.push(h2('Technical Context', C.GRAY));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, right: bdr },
                    shading: { fill: C.LIGHT_GRAY, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 200, right: 200 },
                    children: [new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'FOR DEVELOPER — INTERNAL', bold: true, color: C.GRAY, size: 16, font: FONT })] }), para(data.technical_context, false, '6E7681', 18)]
                })]
            })]
        }));
        children.push(sp(80, 0));
    }

    if (data.client_communication) { children.push(divider()); children.push(h2('Client Communication', C.BLUE)); children.push(para(data.client_communication, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    var callouts = data.callouts || [];
    callouts.forEach(function (cb) {
        children.push(sp(80, 0));
        var items = (cb.items || []).map(function (item) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '\u2022 ' + safeStr(item), font: FONT, size: 19, color: C.AMB_TXT })] }); });
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: C.AMB_BG, type: ShadingType.CLEAR },
                    borders: { top: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, bottom: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD }, left: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, right: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD } },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: 'ACTION REQUIRED \u2014 ' + safeStr(cb.dev || ''), font: FONT, size: 20, bold: true, color: C.AMB_BD })] }), ...items]
                })]
            })]
        }));
    });

    children.push(sp(200, 0));
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 Blocker Brief \u2014 ' + safeStr(data.task_num || '') + ' \u2014 ' + safeStr(data.date || ''), color: C.MGRAY, size: 16, font: FONT, italics: true })] }));

    var doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } }, spacing: { before: 0, after: 120 }, tabStops: [{ type: TabStopType.RIGHT, position: 8640 }], children: [new TextRun({ text: 'BLOCKER EVALUATION BRIEF \u2014 ' + safeStr(data.account || ''), bold: true, color: C.NAVY, size: 18, font: FONT }), new TextRun({ text: '\t' + safeStr(data.task_num || ''), color: C.GRAY, size: 18, font: FONT })] })] }) },
            footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, spacing: { before: 80 }, children: [new TextRun({ text: safeStr(data.account || '') + ' | Blocker Brief | Confidential', color: C.GRAY, size: 16, font: FONT })] })] }) },
            children: children
        }]
    });
    var blob = await Packer.toBlob(doc);
    var safe = (data.account || 'Account').replace(/\s+/g, '_');
    var num = (data.task_num || 'Blocker').replace(/\s+/g, '_');
    return { blob: blob, filename: safe + '_Blocker_Brief_' + num + '.docx' };
}

async function generateTechApproach(data) {
    var D = getDocx();
    var Document = D.Document, Packer = D.Packer, Paragraph = D.Paragraph, TextRun = D.TextRun,
        Table = D.Table, TableRow = D.TableRow, TableCell = D.TableCell,
        AlignmentType = D.AlignmentType, BorderStyle = D.BorderStyle,
        WidthType = D.WidthType, ShadingType = D.ShadingType, Header = D.Header, Footer = D.Footer, TabStopType = D.TabStopType;
    var C = docxColors(); var CW = 9360; var FONT = 'Arial';
    var thinBdr = { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY };
    var cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };
    var bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    var borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    var noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    var noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp(b, a) { return new Paragraph({ spacing: { before: b || 0, after: a || 0 }, children: [] }); }
    function divider() { return new Paragraph({ spacing: { before: 80, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, children: [] }); }
    function h2(t, color) { return new Paragraph({ spacing: { before: 280, after: 120 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.NAVY, size: 28, font: FONT })] }); }
    function h3(t, color) { return new Paragraph({ spacing: { before: 180, after: 80 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.BLUE, size: 22, font: FONT })] }); }
    function para(t, bold, color, size) { return new Paragraph({ spacing: { before: 60, after: 80 }, children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })] }); }
    function hdrCell(t, bg, tc, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }
    function listPara(text, i) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: (i + 1) + '. ' + safeStr(text).replace(/^\d+\.\s*/, ''), font: FONT, size: 19, color: C.GRAY })] }); }
    function bulletPara(text) { return new Paragraph({ spacing: { before: 40, after: 40 }, bullet: { level: 0 }, children: [new TextRun({ text: safeStr(text), font: FONT, size: 19, color: C.GRAY })] }); }

    var sc = data.scope || {};
    var ts = data.technical_spec || {};
    var tl = data.timeline || {};
    var children = [];

    // Cover
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
            children: [new TableCell({
                borders: noBdrs, shading: { fill: C.NAVY, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 360, bottom: 360, left: 360, right: 360 },
                children: [
                    new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'TECHNICAL APPROACH DOCUMENT', bold: true, color: C.WHITE, size: 44, font: FONT })] }),
                    new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(data.title || ''), color: 'AECBF0', size: 24, font: FONT })] }),
                    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 ' + safeStr(data.date || '') + ' \u2014 ' + safeStr(data.version || 'v1.0'), color: 'AECBF0', size: 20, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: 'Prepared by: ' + safeStr(data.prepared_by || '') + ' | Developer: ' + safeStr(data.developer || '') + ' | Task: ' + safeStr(data.task_num || ''), color: 'C0D8F5', size: 19, font: FONT })] })
                ]
            })]
        })]
    }));
    children.push(sp(160, 0));

    // Approvals table
    var approvals = data.approvals || [];
    if (approvals.length) {
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [3120, 3120, 1560, 1560], rows: [
                new TableRow({ children: [hdrCell('Approver', C.NAVY, C.WHITE, 3120), hdrCell('Role', C.NAVY, C.WHITE, 3120), hdrCell('Status', C.NAVY, C.WHITE, 1560), hdrCell('Date', C.NAVY, C.WHITE, 1560)] }),
                ...approvals.map(function (a, i) {
                    var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY;
                    var sc2 = a.status === 'Approved' ? C.GREEN : a.status === 'Rejected' ? C.RED : C.GRAY;
                    return new TableRow({ children: [dataCell(a.name || '', bg, C.NAVY, 3120, true), dataCell(a.role || '', bg, C.GRAY, 3120), dataCell(a.status || 'Pending', bg, sc2, 1560, true), dataCell(a.date || '', bg, C.GRAY, 1560)] });
                })
            ]
        }));
        children.push(sp(120, 0));
    }

    children.push(divider());
    if (data.problem_statement) { children.push(h2('Problem Statement')); children.push(para(data.problem_statement, false, C.GRAY, 20)); children.push(sp(80, 0)); }
    if (data.objective) {
        children.push(divider()); children.push(h2('Objective'));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.TEAL }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.TEAL }, right: bdr },
                    shading: { fill: C.LIGHT_TEAL, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 200, right: 200 },
                    children: [para(data.objective, false, C.GRAY, 20)]
                })]
            })]
        })); children.push(sp(80, 0));
    }
    if (data.background) { children.push(divider()); children.push(h2('Background')); children.push(para(data.background, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    // Scope
    var hasScope = (sc.in_scope || []).length || (sc.out_of_scope || []).length || (sc.dependencies || []).length;
    if (hasScope) {
        children.push(divider()); children.push(h2('Scope'));
        var scopeW = Math.floor(CW / 3);
        var scopeRows = [new TableRow({ children: [hdrCell('In Scope', C.GREEN, C.WHITE, scopeW), hdrCell('Out of Scope', C.RED, C.WHITE, scopeW), hdrCell('Dependencies', C.BLUE, C.WHITE, scopeW)] })];
        var maxLen = Math.max((sc.in_scope || []).length, (sc.out_of_scope || []).length, (sc.dependencies || []).length);
        for (var ri = 0; ri < maxLen; ri++) {
            scopeRows.push(new TableRow({
                children: [
                    dataCell((sc.in_scope || [])[ri] || '', ri % 2 ? C.WHITE : C.LIGHT_GREEN, C.GREEN, scopeW),
                    dataCell((sc.out_of_scope || [])[ri] || '', ri % 2 ? C.WHITE : C.LIGHT_RED, C.RED, scopeW),
                    dataCell((sc.dependencies || [])[ri] || '', ri % 2 ? C.WHITE : C.LIGHT_BLUE, C.BLUE, scopeW)
                ]
            }));
        }
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [scopeW, scopeW, scopeW], rows: scopeRows }));
        children.push(sp(80, 0));
    }

    if (data.current_state) { children.push(divider()); children.push(h2('Current State')); children.push(para(data.current_state, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    if (data.proposed_solution) {
        children.push(divider()); children.push(h2('Proposed Solution'));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, right: bdr },
                    shading: { fill: C.LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 160, bottom: 160, left: 220, right: 220 },
                    children: [para(data.proposed_solution, false, C.GRAY, 20)]
                })]
            })]
        })); children.push(sp(80, 0));
    }

    // Technical Spec
    var comps = ts.components || [];
    if (comps.length) {
        children.push(divider()); children.push(h2('Technical Components'));
        var crows = [new TableRow({ children: [hdrCell('Type', C.NAVY, C.WHITE, 1800), hdrCell('Name', C.NAVY, C.WHITE, 2400), hdrCell('Table', C.NAVY, C.WHITE, 1800), hdrCell('Description', C.NAVY, C.WHITE, 2520), hdrCell('OOB?', C.NAVY, C.WHITE, 840)] })];
        comps.forEach(function (c, i) {
            var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY;
            crows.push(new TableRow({ children: [dataCell(c.type || '', bg, C.NAVY, 1800, true), dataCell(c.name || '', bg, C.GRAY, 2400), dataCell(c.table || '', bg, C.BLUE, 1800), dataCell(c.description || '', bg, C.GRAY, 2520), dataCell(c.is_oob || '', bg, C.GRAY, 840)] }));
        });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [1800, 2400, 1800, 2520, 840], rows: crows }));
        children.push(sp(80, 0));
    }
    if (ts.data_flow) { children.push(h3('Data Flow', C.NAVY)); children.push(para(ts.data_flow, false, C.GRAY, 19)); children.push(sp(60, 0)); }
    if (ts.roles_and_access) { children.push(h3('Roles & Access', C.NAVY)); children.push(para(ts.roles_and_access, false, C.GRAY, 19)); children.push(sp(60, 0)); }
    if (ts.known_constraints) {
        children.push(h3('Known Constraints', C.RED));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, right: bdr },
                    shading: { fill: C.LIGHT_AMBER, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [para(ts.known_constraints, false, C.AMBER, 18)]
                })]
            })]
        })); children.push(sp(80, 0));
    }

    var alts = data.alternatives_considered || [];
    if (alts.length) {
        children.push(divider()); children.push(h2('Alternatives Considered'));
        var arows = [new TableRow({ children: [hdrCell('Option', C.BLUE, C.WHITE, 2400), hdrCell('Description', C.BLUE, C.WHITE, 3960), hdrCell('Reason Rejected', C.BLUE, C.WHITE, 3000)] })];
        alts.forEach(function (a, i) {
            var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY;
            arows.push(new TableRow({ children: [dataCell(a.option || '', bg, C.NAVY, 2400, true), dataCell(a.description || '', bg, C.GRAY, 3960), dataCell(a.reason_rejected || '', bg, C.GRAY, 3000)] }));
        });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [2400, 3960, 3000], rows: arows })); children.push(sp(80, 0));
    }

    var ac = data.acceptance_criteria || [];
    if (ac.length) { children.push(divider()); children.push(h2('Acceptance Criteria')); ac.forEach(function (c, i) { children.push(listPara(c, i)); }); children.push(sp(80, 0)); }

    if (data.rollback_plan) { children.push(divider()); children.push(h2('Rollback Plan')); children.push(para(data.rollback_plan, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    if (tl.estimate || tl.target_prod) {
        children.push(divider()); children.push(h2('Timeline'));
        var tlPairs = [['Estimate', tl.estimate], ['Dev Start', tl.dev_start], ['Target TEST', tl.target_test], ['Target PROD', tl.target_prod], ['Notes', tl.notes]].filter(function (p) { return p[1]; });
        var tlRows = tlPairs.map(function (p, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; return new TableRow({ children: [dataCell(p[0], bg, C.NAVY, 2520, true), dataCell(p[1], bg, C.GRAY, 6840)] }); });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [2520, 6840], rows: tlRows })); children.push(sp(80, 0));
    }

    var oi = data.open_items || [];
    if (oi.length) {
        children.push(divider()); children.push(h2('Open Items'));
        var oiRows = [new TableRow({ children: [hdrCell('Item', C.RED, C.WHITE, 5760), hdrCell('Owner', C.RED, C.WHITE, 1800), hdrCell('Due', C.RED, C.WHITE, 1800)] })];
        oi.forEach(function (o, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; oiRows.push(new TableRow({ children: [dataCell(o.item || '', bg, C.GRAY, 5760), dataCell(o.owner || '', bg, C.NAVY, 1800, true), dataCell(o.due || '', bg, C.GRAY, 1800)] })); });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [5760, 1800, 1800], rows: oiRows })); children.push(sp(80, 0));
    }

    (data.callouts || []).forEach(function (cb) {
        children.push(sp(80, 0));
        var items = (cb.items || []).map(function (item) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '\u2022 ' + safeStr(item), font: FONT, size: 19, color: C.AMB_TXT })] }); });
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: C.AMB_BG, type: ShadingType.CLEAR },
                    borders: { top: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, bottom: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD }, left: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, right: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD } },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: 'ACTION REQUIRED \u2014 ' + safeStr(cb.dev || ''), font: FONT, size: 20, bold: true, color: C.AMB_BD })] }), ...items]
                })]
            })]
        }));
    });

    if (data.notes) { children.push(divider()); children.push(h2('Notes', C.GRAY)); children.push(para(data.notes, false, C.GRAY, 19)); }
    children.push(sp(200, 0));
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 Technical Approach \u2014 ' + safeStr(data.task_num || '') + ' \u2014 ' + safeStr(data.version || 'v1.0'), color: C.MGRAY, size: 16, font: FONT, italics: true })] }));

    var doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 1 } }, spacing: { before: 0, after: 120 }, tabStops: [{ type: TabStopType.RIGHT, position: 8640 }], children: [new TextRun({ text: 'TECHNICAL APPROACH \u2014 ' + safeStr(data.account || ''), bold: true, color: C.NAVY, size: 18, font: FONT }), new TextRun({ text: '\t' + safeStr(data.task_num || ''), color: C.GRAY, size: 18, font: FONT })] })] }) },
            footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, spacing: { before: 80 }, children: [new TextRun({ text: safeStr(data.account || '') + ' | Technical Approach | ' + safeStr(data.status || 'Draft') + ' | Confidential', color: C.GRAY, size: 16, font: FONT })] })] }) },
            children: children
        }]
    });
    var blob = await Packer.toBlob(doc);
    var safe = (data.account || 'Account').replace(/\s+/g, '_');
    var num = (data.task_num || 'TAD').replace(/\s+/g, '_');
    return { blob: blob, filename: safe + '_Tech_Approach_' + num + '.docx' };
}

async function generateTaskBrief(data) {
    var D = getDocx();
    var Document = D.Document, Packer = D.Packer, Paragraph = D.Paragraph, TextRun = D.TextRun,
        Table = D.Table, TableRow = D.TableRow, TableCell = D.TableCell,
        AlignmentType = D.AlignmentType, BorderStyle = D.BorderStyle,
        WidthType = D.WidthType, ShadingType = D.ShadingType, Header = D.Header, Footer = D.Footer, TabStopType = D.TabStopType;
    var C = docxColors(); var CW = 9360; var FONT = 'Arial';
    var thinBdr = { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY };
    var cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };
    var bdr = { style: BorderStyle.SINGLE, size: 1, color: C.MGRAY };
    var borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    var noBdr = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
    var noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };

    function sp(b, a) { return new Paragraph({ spacing: { before: b || 0, after: a || 0 }, children: [] }); }
    function divider() { return new Paragraph({ spacing: { before: 80, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, children: [] }); }
    function h2(t, color) { return new Paragraph({ spacing: { before: 240, after: 120 }, children: [new TextRun({ text: safeStr(t), bold: true, color: color || C.NAVY, size: 26, font: FONT })] }); }
    function para(t, bold, color, size) { return new Paragraph({ spacing: { before: 60, after: 80 }, children: [new TextRun({ text: safeStr(t), bold: !!bold, color: color || C.GRAY, size: size || 20, font: FONT })] }); }
    function hdrCell(t, bg, tc, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: true, color: tc, size: 18, font: FONT })] })] }); }
    function dataCell(t, bg, tc, w, bold) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: safeStr(t), bold: !!bold, color: tc, size: 18, font: FONT })] })] }); }
    function listPara(text, i) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: (i + 1) + '. ' + safeStr(String(text)).replace(/^\d+\.\s*/, ''), font: FONT, size: 19, color: C.GRAY })] }); }
    function bulletPara(text, color) { return new Paragraph({ spacing: { before: 40, after: 40 }, bullet: { level: 0 }, children: [new TextRun({ text: safeStr(text), font: FONT, size: 19, color: color || C.GRAY })] }); }

    var inv = data.investigation || {};
    var res = data.resolution || {};
    var td = data.technical_detail || {};
    var children = [];

    // Cover — teal gradient style
    children.push(new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
            children: [new TableCell({
                borders: noBdrs, shading: { fill: '1A4B5C', type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 320, bottom: 320, left: 360, right: 360 },
                children: [
                    new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'TASK BRIEF', bold: true, color: C.WHITE, size: 52, font: FONT })] }),
                    new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(data.task_num || '') + ' \u2014 ' + safeStr(data.task_type || 'Task') + ' \u2014 ' + safeStr(data.priority || ''), color: 'AECBF0', size: 22, font: FONT })] }),
                    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 Opened: ' + safeStr(data.opened_date || ''), color: 'AECBF0', size: 20, font: FONT })] }),
                    new Paragraph({ children: [new TextRun({ text: 'Assigned: ' + safeStr(data.assigned_to || '') + ' | PM: ' + safeStr(data.pm || '') + ' | Reported by: ' + safeStr(data.reported_by || ''), color: 'C0D8F5', size: 19, font: FONT })] })
                ]
            })]
        })]
    }));
    children.push(sp(120, 0));

    // Task info summary table
    var infoRows = [];
    var infoPairs = [['Task Number', data.task_num], ['Task Type', data.task_type], ['Title', data.title], ['Priority', data.priority], ['State', data.state], ['Environment', data.environment], ['Opened', data.opened_date], ['Target Date', data.target_date], ['Audience', data.audience]].filter(function (p) { return p[1]; });
    infoPairs.forEach(function (p, i) { infoRows.push(new TableRow({ children: [dataCell(p[0], 'F8FAFC', C.NAVY, 2520, true), dataCell(p[1], i % 2 ? C.WHITE : 'F8FAFC', C.GRAY, 6840)] })); });
    if (infoRows.length) { children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [2520, 6840], rows: infoRows })); children.push(sp(120, 0)); }

    if (data.summary) {
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, right: bdr },
                    shading: { fill: C.LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 200, right: 200 },
                    children: [new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'SUMMARY', bold: true, color: C.BLUE, size: 17, font: FONT })] }), para(data.summary, false, C.GRAY, 19)]
                })]
            })]
        })); children.push(sp(80, 0));
    }

    if (data.reported_behavior) { children.push(divider()); children.push(h2('Reported Behavior', C.NAVY)); children.push(para(data.reported_behavior, false, C.GRAY, 19)); children.push(sp(80, 0)); }
    if (data.expected_behavior) { children.push(h2('Expected Behavior', C.TEAL)); children.push(para(data.expected_behavior, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    if (data.impact) {
        children.push(divider()); children.push(h2('Impact', C.RED));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' }, right: bdr },
                    shading: { fill: C.LIGHT_AMBER, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [para(data.impact, false, C.AMBER, 19)]
                })]
            })]
        })); children.push(sp(80, 0));
    }

    // Investigation
    if (inv.summary || (inv.findings || []).length || inv.current_theory) {
        children.push(divider()); children.push(h2('Investigation', C.BLUE));
        if (inv.summary) { children.push(para(inv.summary, false, C.GRAY, 19)); children.push(sp(60, 0)); }
        if ((inv.findings || []).length) {
            children.push(new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: 'Findings', bold: true, color: C.NAVY, size: 20, font: FONT })] }));
            inv.findings.forEach(function (f) { children.push(bulletPara(f, C.GRAY)); });
            children.push(sp(60, 0));
        }
        if ((inv.ruled_out || []).length) {
            children.push(new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: 'Ruled Out', bold: true, color: C.GRAY, size: 20, font: FONT })] }));
            inv.ruled_out.forEach(function (r) { children.push(new Paragraph({ spacing: { before: 40, after: 40 }, bullet: { level: 0 }, children: [new TextRun({ text: safeStr(r), font: FONT, size: 19, color: '94A3B8' })] })); });
            children.push(sp(60, 0));
        }
        if (inv.current_theory) {
            children.push(new Table({
                width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: C.BLUE }, right: bdr },
                        shading: { fill: C.LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                        children: [new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'CURRENT THEORY', bold: true, color: C.BLUE, size: 17, font: FONT })] }), para(inv.current_theory, false, C.GRAY, 19)]
                    })]
                })]
            }));
        }
        children.push(sp(80, 0));
    }

    // Technical Detail - Components
    var comps = td.components_involved || [];
    if (comps.length) {
        children.push(divider()); children.push(h2('Technical Components', C.NAVY));
        var crows = [new TableRow({ children: [hdrCell('Type', C.NAVY, C.WHITE, 1800), hdrCell('Name', C.NAVY, C.WHITE, 2520), hdrCell('Table', C.NAVY, C.WHITE, 2160), hdrCell('Notes', C.NAVY, C.WHITE, 2880)] })];
        comps.forEach(function (c, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; crows.push(new TableRow({ children: [dataCell(c.type || '', bg, C.NAVY, 1800, true), dataCell(c.name || '', bg, C.GRAY, 2520), dataCell(c.table || '', bg, C.BLUE, 2160), dataCell(c.notes || '', bg, C.GRAY, 2880)] })); });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [1800, 2520, 2160, 2880], rows: crows })); children.push(sp(80, 0));
    }
    if (td.error_messages) {
        children.push(h2('Error Messages / Logs', C.GRAY));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: cellBdr, shading: { fill: '1E293B', type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [new Paragraph({ children: [new TextRun({ text: safeStr(td.error_messages), font: 'Courier New', size: 18, color: 'E2E8F0' })] })]
                })]
            })]
        })); children.push(sp(80, 0));
    }
    if (td.relevant_data) { children.push(h2('Relevant Data', C.GRAY)); children.push(para(td.relevant_data, false, C.GRAY, 19)); children.push(sp(60, 0)); }
    if (td.environment_notes) { children.push(h2('Environment Notes', C.GRAY)); children.push(para(td.environment_notes, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    // Proposed Approaches
    var approaches = data.proposed_approach || [];
    if (approaches.length) {
        children.push(divider()); children.push(h2('Proposed Approaches', C.BLUE));
        approaches.forEach(function (a, i) {
            var rec = a.recommended === 'Yes';
            var sc2 = rec ? C.GREEN : C.BLUE; var sb = rec ? C.LIGHT_GREEN : C.LIGHT_BLUE;
            children.push(new Table({
                width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: rec ? 10 : 6, color: sc2 }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: rec ? 10 : 6, color: sc2 }, right: bdr },
                        shading: { fill: sb, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                        children: [
                            new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: (i + 1) + '. ' + safeStr(a.option || '') + (rec ? ' \u2713 RECOMMENDED' : ''), bold: true, color: sc2, size: 20, font: FONT }), new TextRun({ text: '  Effort: ' + safeStr(a.effort || '') + '  |  Risk: ' + safeStr(a.risk || ''), color: C.GRAY, size: 17, font: FONT })] }),
                            para(a.description || '', false, C.GRAY, 19),
                            ...(a.reason ? [para(a.reason, false, C.GRAY, 18)] : [])
                        ]
                    })]
                })]
            })); children.push(sp(60, 0));
        });
    }

    // Resolution
    if (res.description || res.status) {
        children.push(divider()); children.push(h2('Resolution', res.status === 'Resolved' || res.status === 'Verified' ? C.GREEN : C.NAVY));
        var rb = res.status === 'Resolved' || res.status === 'Verified' ? C.LIGHT_GREEN : C.LIGHT_BLUE;
        var rc = res.status === 'Resolved' || res.status === 'Verified' ? C.GREEN : C.BLUE;
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: rc }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 8, color: rc }, right: bdr },
                    shading: { fill: rb, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 200, right: 200 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: safeStr(res.status || ''), bold: true, color: rc, size: 20, font: FONT })] }),
                        ...(res.description ? [para(res.description, false, C.GRAY, 19)] : []),
                        ...(res.verification ? [para('Verification: ' + res.verification, false, C.GRAY, 18)] : []),
                        ...(res.update_set ? [para('Update Set: ' + res.update_set, true, C.NAVY, 18)] : [])
                    ]
                })]
            })]
        })); children.push(sp(80, 0));
    }

    // Next Steps
    var ns = data.next_steps || [];
    if (ns.length) {
        children.push(divider()); children.push(h2('Next Steps', C.NAVY));
        var nsIsObj = ns.length && typeof ns[0] === 'object';
        if (nsIsObj) {
            var nsRows = [new TableRow({ children: [hdrCell('Action', C.NAVY, C.WHITE, 5760), hdrCell('Owner', C.NAVY, C.WHITE, 1800), hdrCell('Due', C.NAVY, C.WHITE, 1800)] })];
            ns.forEach(function (s, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; nsRows.push(new TableRow({ children: [dataCell(s.action || String(s), bg, C.GRAY, 5760), dataCell(s.owner || '', bg, C.NAVY, 1800, true), dataCell(s.due || '', bg, C.GRAY, 1800)] })); });
            children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [5760, 1800, 1800], rows: nsRows }));
        } else {
            ns.forEach(function (s, i) { children.push(listPara(String(s), i)); });
        }
        children.push(sp(80, 0));
    }

    // Blockers
    var bl = data.blockers || [];
    if (bl.length) {
        children.push(divider()); children.push(h2('Blockers', C.RED));
        var blRows = [new TableRow({ children: [hdrCell('Blocker', C.RED, C.WHITE, 3000), hdrCell('Impact', C.RED, C.WHITE, 3180), hdrCell('Resolution Path', C.RED, C.WHITE, 3180)] })];
        bl.forEach(function (b, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; blRows.push(new TableRow({ children: [dataCell(b.blocker || '', bg, C.GRAY, 3000), dataCell(b.impact || '', C.LIGHT_AMBER, C.AMBER, 3180), dataCell(b.resolution_path || '', bg, C.GRAY, 3180)] })); });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [3000, 3180, 3180], rows: blRows })); children.push(sp(80, 0));
    }

    // Related Tasks
    var rt = data.related_tasks || [];
    if (rt.length) {
        children.push(divider()); children.push(h2('Related Tasks', C.GRAY));
        var rtRows = [new TableRow({ children: [hdrCell('Task #', C.GRAY, C.WHITE, 1800), hdrCell('Type', C.GRAY, C.WHITE, 1800), hdrCell('Relationship', C.GRAY, C.WHITE, 5760)] })];
        rt.forEach(function (r, i) { var bg = i % 2 ? C.WHITE : C.LIGHT_GRAY; rtRows.push(new TableRow({ children: [dataCell(r.num || '', bg, C.BLUE, 1800, true), dataCell(r.type || '', bg, C.GRAY, 1800), dataCell(r.relationship || '', bg, C.GRAY, 5760)] })); });
        children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [1800, 1800, 5760], rows: rtRows })); children.push(sp(80, 0));
    }

    if (data.developer_notes) {
        children.push(divider()); children.push(h2('Developer Notes', C.GRAY));
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    borders: { top: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 6, color: C.GRAY }, right: bdr },
                    shading: { fill: C.LIGHT_GRAY, type: ShadingType.CLEAR }, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'INTERNAL \u2014 DEVELOPER ONLY', bold: true, color: C.GRAY, size: 16, font: FONT })] }), para(data.developer_notes, false, '6E7681', 18)]
                })]
            })]
        })); children.push(sp(80, 0));
    }
    if (data.client_notes) { children.push(divider()); children.push(h2('Client Notes', C.BLUE)); children.push(para(data.client_notes, false, C.GRAY, 19)); children.push(sp(80, 0)); }

    (data.callouts || []).forEach(function (cb) {
        children.push(sp(80, 0));
        var items = (cb.items || []).map(function (item) { return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '\u2022 ' + safeStr(item), font: FONT, size: 19, color: C.AMB_TXT })] }); });
        children.push(new Table({
            width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({
                children: [new TableCell({
                    shading: { fill: C.AMB_BG, type: ShadingType.CLEAR },
                    borders: { top: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, bottom: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD }, left: { style: BorderStyle.SINGLE, size: 12, color: C.AMB_BD }, right: { style: BorderStyle.SINGLE, size: 6, color: C.AMB_BD } },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: 'ACTION REQUIRED \u2014 ' + safeStr(cb.dev || ''), font: FONT, size: 20, bold: true, color: C.AMB_BD })] }), ...items]
                })]
            })]
        }));
    });

    children.push(sp(200, 0));
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: safeStr(data.account || '') + ' \u2014 Task Brief \u2014 ' + safeStr(data.task_num || '') + ' \u2014 ' + safeStr(data.task_type || 'Task'), color: C.MGRAY, size: 16, font: FONT, italics: true })] }));

    var doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 20, color: C.GRAY } } } },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
            headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.TEAL, space: 1 } }, spacing: { before: 0, after: 120 }, tabStops: [{ type: TabStopType.RIGHT, position: 8640 }], children: [new TextRun({ text: 'TASK BRIEF \u2014 ' + safeStr(data.task_num || '') + ' \u2014 ' + safeStr(data.account || ''), bold: true, color: C.NAVY, size: 18, font: FONT }), new TextRun({ text: '\t' + safeStr(data.state || ''), color: C.GRAY, size: 18, font: FONT })] })] }) },
            footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.MGRAY, space: 1 } }, spacing: { before: 80 }, children: [new TextRun({ text: safeStr(data.account || '') + ' | Task Brief | ' + safeStr(data.task_num || '') + ' | ' + (data.audience === 'Client' ? 'Client Facing' : 'Internal'), color: C.GRAY, size: 16, font: FONT })] })] }) },
            children: children
        }]
    });
    var blob = await Packer.toBlob(doc);
    var safe = (data.account || 'Account').replace(/\s+/g, '_');
    var num = (data.task_num || 'Task').replace(/\s+/g, '_');
    return { blob: blob, filename: safe + '_Task_Brief_' + num + '.docx' };
}

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