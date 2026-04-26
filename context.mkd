I have performed an internal scan of the provided codebase. Here is the requested summary and architectural identification:

### Project Summary
This project is a specialized document generation and previewing engine designed to transform structured JSON data into professional, enterprise-grade Word documents and web-based previews. It follows a modular architecture where specific document templates—such as Root Cause Analyses (RCA), Status Reports, and Technical Approach Documents (TAD)—are defined by distinct generation and rendering logic. The system includes an intelligent auto-detection layer that identifies the appropriate template based on the schema of the provided JSON input to streamline the reporting workflow for technical project managers and engineers.

### 5 Most Important Logic Segments
1.  **`template.js` (The Document Engine):** This file contains the heavy-lifting logic for the `docx` library, defining the visual layout, tables, and typography for every exportable file (e.g., `generateStatusReport`, `generateRCA`).
2.  **`main.js` (The Preview Engine):** This file mirrors the document logic by providing HTML-based rendering functions (e.g., `renderTechApproachPreview`) that allow users to visualize data before export.
3.  **`helper.js` -> `loadJSON(raw)`:** This is the primary data ingestion point; it includes a heuristic "Auto-detect mode" that determines the document type by checking for specific keys (like `task_num`, `incident`, or `project_name`).
4.  **`helper.js` -> `generate()`:** The main asynchronous orchestration function that manages UI state (loading indicators, error handling) and triggers the `docx` packer logic.
5.  **`template.js` -> Utility Helpers (`hdrCell`, `dataCell`, `sp`):** These foundational functions implement the project's design system within the Word document structure, ensuring consistent spacing, borders, and color application across all templates.

I am now ready to assist with refactoring, adding new templates, or debugging the existing architectural patterns. How would you like to proceed?