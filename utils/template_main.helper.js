// =============================================
// Helper functions for rendering complex nested structures in previews
// =============================================
function renderPreviewList(items) {
    if (!items || !items.length) return '';

    let html = '<ul style="padding-left:20px; margin:0; list-style-type: disc;">';
    items.forEach(item => {
        const isObj = typeof item === 'object' && item !== null;
        const text = isObj ? escHtml(item.text) : escHtml(item);

        let style = '';
        if (isObj && item.bold) style += 'font-weight:700;';
        if (isObj && item.italic) style += 'font-style:italic;';

        let content = isObj && item.url
            ? `<a href="${escHtml(item.url)}" target="_blank" style="color:#2563eb; text-decoration:none; border-bottom:1px solid #bfdbfe;">${text} ↗</a>`
            : `<span style="${style}">${text}</span>`;

        html += `<li style="margin-bottom:8px; font-size:13px; color:#334155;">${content}`;
        if (isObj && item.sub_items) {
            html += renderPreviewList(item.sub_items); // Recursive call
        }
        html += `</li>`;
    });
    html += '</ul>';
    return html;
}

function renderStepDetails(details) {
    if (!Array.isArray(details)) return `<p>${escHtml(details)}</p>`;

    return details.map(block => {
        if (block.type === 'p') {
            const style = `${block.bold ? 'font-weight:bold;' : ''} ${block.italic ? 'font-style:italic;' : ''}`;
            return `<p style="${style} color:#475569; margin: 8px 0;">${escHtml(block.text)}</p>`;
        }
        if (block.type === 'list') {
            return `<ul style="margin: 8px 0;">${block.items.map(i => `<li>${escHtml(i)}</li>`).join('')}</ul>`;
        }
        if (block.type === 'nested_list') {
            // Recursive helper for nested lists in HTML
            const renderHtmlList = (items) => `
                <ul style="margin: 4px 0;">
                    ${items.map(i => `
                        <li>
                            ${escHtml(i.text || i)}
                            ${i.sub_items ? renderHtmlList(i.sub_items) : ''}
                        </li>
                    `).join('')}
                </ul>`;
            return renderHtmlList(block.items);
        }
        return '';
    }).join('');
}
// END

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

// Function to generate the HTML for the final decision section
function renderFinalDecision(data) {
    const currentDecision = data.final_decision;
    // update in template.js if modifying these options
    let decisions = ["Approved", "Approved with Minor Changes", "Requires Rework", "Rejected"];
    // 1. Check if the decision is one of the predefined options
    if (currentDecision && decisions.includes(currentDecision)) {
        // If yes, map over the predefined options to create a checkbox list
        return decisions.map(option => {
            const isChecked = (option === currentDecision);
            // Apply styling to highlight the selected option and dim the others
            return `<div style="font-size:12px; opacity:${isChecked ? 1 : 0.4}; font-weight:${isChecked ? 'bold' : 'normal'}">
                        ${isChecked ? '☑' : '☐'} ${escHtml(option)}
                    </div>`;
        }).join('');
    }

    // 2. Fallback for custom decisions or if the decision is empty
    if (currentDecision) {
        // If it's a non-standard decision, display it as is (the original behavior)
        return `<div style="font-size:1em; font-weight:bold; color:#1e293b; margin-bottom:10px;">${escHtml(currentDecision)}</div>`;
    } else {
        // If there is no decision, display a placeholder
        return `<div style="font-size:1em; font-weight:normal; color:#9ca3af; margin-bottom:10px;">Not Decided</div>`;
    }
}