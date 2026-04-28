To get the same results in a new chat without pasting your entire codebase, you should use a **"Technical Specification & Scaffold"** prompt. This acts as a "mini-SDK" that tells the AI exactly how the project is structured and what utility functions are available.

Create a file named `template_context.md` and paste the content below into a new chat when you want to build a new template.

---

### Copy/Paste this Context for New Templates

**Role:** Senior Full-Stack Engineer  
**Context:** I am building a document automation system that converts JSON data into Word Documents (`docx` library) and HTML Previews.

**1. Project Architecture Pattern:**
- `helper.js`: Handles routing and auto-detection of the JSON schema.
- `template.js`: Contains `async` functions using the `docx` library to generate `.docx` files.
- `main.js`: Contains `render...Preview(data)` functions returning HTML strings for web visualization.

**2. Core Utility Helpers (Available in `template.js`):**
Use these established helper functions to maintain the design system:
- `safeStr(val)`: Sanitizes input.
- `docxColors()`: Returns a color object (C.NAVY, C.BLUE, C.TEAL, C.GREEN, C.RED, C.AMBER, C.GRAY, C.LIGHT_GRAY, etc.).
- `sp(before, after)`: Returns a Paragraph with specific spacing.
- `para(text, bold, color, size)`: Returns a standard paragraph.
- `h2(text, color)`: Returns a section header (size 28, bold).
- `hdrCell(text, bg, tc, width)`: Returns a TableCell styled as a header.
- `dataCell(text, bg, tc, width, bold)`: Returns a TableCell styled for data.

**3. Design System Standards:**
- **Word Docs:** Use Tables for metadata. Use "Covers" (Table with a solid background and white text) for titles.
- **HTML Previews:** Use CSS classes: `.doc-cover`, `.doc-cover-title`, `.doc-section-title`, `.doc-table`, and `.callout` (with modifiers: `green`, `blue`, `teal`, `amber`, `red`).
- **Layout:** Standard Page Width is 9360 DXA. Standard Margin is 1080 DXA.

**4. Instructions for New Templates:**
When I ask for a new template, please provide:
1. **Detection Logic:** The `else if` logic for `loadJSON` in `helper.js`.
2. **Word Generator:** An `async function generate[Name](data)` for `template.js` using the helpers above.
3. **HTML Previewer:** A `function render[Name]Preview(data)` for `main.js` using the established CSS classes.

---

### How to use this for the best results:

**Step 1: Start a new chat.**
**Step 2: Paste the text block above.**
**Step 3: Tell the AI what the new template is.**

**Example Prompt:**
> "Using the context provided, create a new template for a **Weekly Project Health Check**. It should include a RAG status (Red/Amber/Green), top 3 accomplishments, and budget burn rate. Please provide the detection logic, the `template.js` Word generator, and the `main.js` previewer."

### Why this works:
*   **Zero Logic Drifting:** The AI won't suggest using a different library or a different way of building tables because you've defined the "DSL" (Domain Specific Language) of your helpers (`hdrCell`, `dataCell`, etc.).
*   **Visual Consistency:** By defining the CSS classes and Word colors up front, the output will look exactly like your existing templates.
*   **Efficiency:** You don't waste "token window" space on the 60,000 lines of code the AI doesn't actually need to see to write a new template.