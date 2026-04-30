// The exact CSS from your PDF function, stored as a constant
const DOCUMENT_STYLES = `
    body { font-family: "DM Sans", Arial, sans-serif; font-size: 11pt; color: #374151; line-height: 1.5; padding: 20px; }
    .doc-cover { background: #1F3864; color: #fff; padding: 20px 24px; border-radius: 6px; margin-bottom: 18px; }
    .doc-cover-title { font-size: 20pt; font-weight: 700; color: #fff; margin-bottom: 4px; }
    .doc-cover-sub { font-size: 10pt; color: #AECBF0; margin-bottom: 2px; }
    .doc-cover-credit { font-size: 9pt; color: #C0D8F5; }
    .doc-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9.5pt; }
    .doc-table th { padding: 6px 8px; text-align: left; font-size: 9pt; font-weight: 700; color: #fff; border: 1px solid #1F3864; }
    .doc-table td { padding: 5px 8px; border: 1px solid #E2E8F0; vertical-align: top; }
    .th-navy { background: #1F3864; } .th-blue { background: #2E5FAC; } .th-teal { background: #1A6B6B; }
    .callout { border-left: 4px solid #2E5FAC; background: #EFF6FF; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 10px; }
    .callout.green { border-color: #166534; background: #DCFCE7; }
    .callout-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; color: #2E5FAC; margin-bottom: 4px; }
    .status-badge { display: inline-block; padding: 1px 6px; border-radius: 10px; font-size: 9pt; font-weight: 600; }
    .status-wip { background: #DBEAFE; color: #2E5FAC; }
    .status-prod { background: #DCFCE7; color: #166534; }
    .topic-heading { font-size: 11pt; font-weight: 700; color: #1F3864; margin: 16px 0 8px; padding: 6px 10px; background: #F3F4F6; border-radius: 4px; }
`;

/**
 * Enhanced Sync from Preview to support Syntax Highlighting
 */
function syncEditorFromPreview() {
    const previewContainer = document.getElementById('preview-content');
    const textarea = document.getElementById('editor-html-input');

    if (!previewContainer || !textarea) return;

    // Pull HTML content
    textarea.value = previewContainer.innerHTML;

    // Update both the Prism view and the iFrame view
    updateHighlighting();
    updateEditorPreview();
}

function updateEditorPreview() {
    const html = document.getElementById('editor-html-input').value;
    const iframe = document.getElementById('editor-live-frame');
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
}

/**
 * SMART EMAIL: 
 * Takes the HTML in the editor and inlines the CSS classes
 * so it looks correct in Outlook/Gmail.
 */
async function copyAsSmartEmail() {
    const html = document.getElementById('editor-html-input').value;

    // Simple regex-based inliner (or you can use a more complex one)
    // Here we map the specific classes used in your doc to inline styles
    let inlineHtml = html;
    const mappings = [
        { cls: 'doc-cover', style: 'background:#1F3864; color:#ffffff; padding:24px; border-radius:6px; font-family:Arial;' },
        { cls: 'doc-cover-title', style: 'font-size:24px; font-weight:bold; color:#ffffff; margin:0;' },
        { cls: 'doc-table', style: 'width:100%; border-collapse:collapse; margin:15px 0;' },
        { cls: 'th-navy', style: 'background:#1F3864; color:#ffffff; padding:8px; text-align:left;' },
        { cls: 'callout', style: 'background:#EFF6FF; border-left:4px solid #2E5FAC; padding:15px; margin:10px 0;' },
        { cls: 'callout green', style: 'background:#DCFCE7; border-left:4px solid #166534; padding:15px; margin:10px 0;' },
        { cls: 'topic-heading', style: 'background:#F3F4F6; color:#1F3864; padding:10px; font-weight:bold; border-radius:4px;' }
    ];

    mappings.forEach(m => {
        const reg = new RegExp(`class="${m.cls}"`, 'g');
        inlineHtml = inlineHtml.replace(reg, `style="${m.style}"`);
    });

    try {
        const blob = new Blob([inlineHtml], { type: 'text/html' });
        const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([inlineHtml], { type: 'text/plain' }) })];
        await navigator.clipboard.write(data);

        const btn = document.getElementById('btn-copy-email');
        btn.innerText = "✅ Copied to Clipboard";
        setTimeout(() => btn.innerText = "📧 Copy for Email", 2000);
    } catch (err) {
        alert("Clipboard error: " + err);
    }
}

// Snippet Injectors
function injectTag(tag) {
    const ta = document.getElementById('editor-html-input');
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end);
    const replacement = `<${tag}>${selected}</${tag}>`;
    ta.value = ta.value.substring(0, start) + replacement + ta.value.substring(end);
    updateEditorPreview();
}

function injectSnippet(type) {
    const ta = document.getElementById('editor-html-input');
    let snip = "";

    // Using your actual CSS class names
    switch (type) {
        case 'callout-blue':
            snip = '<div class="callout"><div class="callout-label">NOTE</div>Your text here...</div>\n';
            break;
        case 'callout-green':
            snip = '<div class="callout green"><div class="callout-label">SUCCESS</div>Task completed successfully...</div>\n';
            break;
        case 'callout-amber':
            snip = '<div class="callout amber"><div class="callout-label">ATTENTION</div>Review required for this section...</div>\n';
            break;
        case 'table':
            snip = `<table class="doc-table">
    <thead>
        <tr><th class="th-navy">Header 1</th><th class="th-navy">Header 2</th></tr>
    </thead>
    <tbody>
        <tr><td>Data A</td><td>Data B</td></tr>
    </tbody>
</table>\n`;
            break;
    }

    const pos = ta.selectionStart;
    ta.value = ta.value.substring(0, pos) + snip + ta.value.substring(pos);
    updateEditorPreview();
}

function updateEditorPreview() {
    const textarea = document.getElementById('editor-html-input');
    const iframe = document.getElementById('editor-live-frame');
    if (!textarea || !iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    let htmlValue = textarea.value;

    // 1. Check if the user pasted a full HTML document or just a snippet
    if (!htmlValue.includes('<head>')) {
        // Wrap the snippet with the necessary CSS links from your app
        htmlValue = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <!-- Link to your local CSS files -->
            <link rel="stylesheet" href="./assets/styles.css">
                        <!-- Link to Fonts -->
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body { 
                    padding: 30px; 
                    background: #fefdfd; 
                }
                /* Optional: Add PDF-specific tweaks if needed */
                .doc-cover { margin-top: 0; }
            </style>
        </head>
        <body>
            ${htmlValue}
        </body>
        </html>`;
    }

    doc.open();
    doc.write(htmlValue);
    doc.close();
}

function clearEditor() {
    if (confirm("Clear all text in the editor?")) {
        document.getElementById('editor-html-input').value = "";
        updateEditorPreview();
    }
}


/**
 * Main function called on every keystroke
 */
function handleEditorInput() {
    const input = document.getElementById('editor-html-input');
    const code = document.getElementById('editor-code');

    // Escape HTML for Prism and handle trailing newline
    let content = input.value;
    if (content[content.length - 1] === "\n") content += " ";

    code.textContent = content;
    Prism.highlightElement(code);

    // Also update the live preview iframe
    updateEditorPreview();
}
/**
 * Ensures the highlighted code moves exactly with the textarea
 */
function syncScroll() {
    const input = document.getElementById('editor-html-input');
    const highlight = document.getElementById('editor-highlight');

    // Match the highlight scroll position to the textarea
    highlight.scrollTop = input.scrollTop;
    highlight.scrollLeft = input.scrollLeft;
}
/**
 * Updates Prism and handles the trailing newline 
 * which often causes a "jump" at the end of the file.
 */
function updateHighlighting() {
    const input = document.getElementById('editor-html-input');
    const code = document.getElementById('editor-code');

    let content = input.value;

    // Prism/HTML requires a character at the end to render 
    // the height of a final empty line correctly.
    if (content[content.length - 1] === "\n") {
        content += " ";
    }

    code.textContent = content;
    Prism.highlightElement(code);
}

async function copyRawCode() {
    const text = document.getElementById('editor-html-input').value;
    try {
        await navigator.clipboard.writeText(text);
        const btn = document.querySelector('.copy-code-btn');
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = "Copy", 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

// Initial highlight on load
document.addEventListener('DOMContentLoaded', () => {
    handleEditorInput();
});

/**
 * Support for TAB key (optional but recommended)
 */
document.getElementById('editor-html-input')?.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
        handleEditorInput();
    }
});