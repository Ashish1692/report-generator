Of course! The current setup is a common pattern, but it has a significant weakness: the information about your "modes" (`callscript`, `report`, `rca`) is scattered across multiple files and formats (HTML, multiple JavaScript objects). This makes adding, removing, or changing a mode a tedious and error-prone process.

The most effective way to refactor this is to create a **Single Source of Truth (SSOT)** in your JavaScript. This central configuration will define everything about each mode, and then you'll use it to dynamically generate the HTML and other JavaScript objects.

---

### The Problem with the Current Approach

*   **Redundancy:** The mode name (`callscript`), display name (`Call Script`), and associated functions are defined in at least four different places.
*   **Maintenance Nightmare:** To add a new "summary" mode, you would have to:
    1.  Add a new `<button>` to the HTML.
    2.  Add an entry to `MODE_TO_TEMPLATE_NAME`.
    3.  Add an entry to the `handlers` object in `getModeHandler`.
    4.  Add a new rule to `AUTO_DETECTION_RULES`.
    Forgetting any step will break functionality.
*   **Inconsistency Risk:** It's easy for the `title` in the HTML to get out of sync with the `title` in `MODE_TO_TEMPLATE_NAME`.

---

### The Solution: A Single Source of Truth

Let's create a single configuration array that holds all the information for each mode.

#### Step 1: Define the Central Configuration

Create a new file, `modes.config.js`, or place this at the top of a relevant JavaScript file. This array will be our SSOT.

```javascript
// modes.config.js

// Assuming these handler functions are defined and imported from elsewhere
// import { generateCallScript, renderCallScriptPreview } from './callscript.js';
// import { generateStatusReport, renderReportPreview } from './report.js';
// import { generateRca, renderRcaPreview } from './rca.js';

const MODES_CONFIG = [
    {
        id: 'callscript',
        displayName: 'Call Script',
        icon: '⚙',
        generate: generateCallScript,
        render: renderCallScriptPreview,
        autoDetect: d => d.topics && !d.executive_summary,
        initialActive: true // Mark this as the default selected tab
    },
    {
        id: 'report',
        displayName: 'Status Report',
        icon: '⚙',
        generate: generateStatusReport,
        render: renderReportPreview,
        autoDetect: d => /* your detection logic for report */,
    },
    {
        id: 'rca',
        displayName: 'RCA',
        icon: '⚙',
        generate: generateRca, // Assuming these exist
        render: renderRcaPreview, // Assuming these exist
        autoDetect: d => d.incident && !d.executive_summary && !d.topics && !d.task_num,
    }
    // To add a new mode, you only need to add a new object here!
];
```

#### Step 2: Simplify the HTML

Your HTML now becomes a simple, empty container. JavaScript will populate it on page load.

```html
<!-- The container is now clean. JS will build the buttons. -->
<div id="mode-tabs-container" class="mode-tabs" style="gap:3px;">
    <!-- Buttons will be dynamically inserted here -->
</div>
```

#### Step 3: Dynamically Generate the UI and Helper Objects

Now, use the `MODES_CONFIG` to build everything you need.

```javascript
// In your main UI script, e.g., uiFunction.js

// Import the configuration
// import { MODES_CONFIG } from './modes.config.js';

// --- 1. Function to generate the HTML tabs ---
function initializeModeTabs() {
    const container = document.getElementById('mode-tabs-container');
    if (!container) return;

    // Dynamically set the grid columns based on the number of modes
    container.style.gridTemplateColumns = `repeat(${MODES_CONFIG.length}, 1fr)`;

    // Generate the button HTML for each mode
    const buttonsHtml = MODES_CONFIG.map(mode => {
        const activeClass = mode.initialActive ? 'active' : '';
        return `
            <button class="mode-tab ${activeClass}" data-mode="${mode.id}" onclick="switchMode('${mode.id}')" title="${mode.displayName}">
                ${mode.icon} ${mode.displayName}
            </button>
        `;
    }).join('');

    container.innerHTML = buttonsHtml;
}

// --- 2. Re-create your helper objects from the config ---

// This replaces the hardcoded object in getModeHandler
const MODE_HANDLERS = MODES_CONFIG.reduce((acc, mode) => {
    acc[mode.id] = {
        generate: mode.generate,
        render: mode.render
    };
    return acc;
}, {});

function getModeHandler(modeId) {
    return MODE_HANDLERS[modeId];
}


// This replaces your hardcoded AUTO_DETECTION_RULES array
const AUTO_DETECTION_RULES = MODES_CONFIG
    .filter(mode => mode.autoDetect) // Only include modes that have a detection rule
    .map(mode => ({
        mode: mode.id,
        check: mode.autoDetect
    }));

// This can replace MODE_TO_TEMPLATE_NAME if you still need it
const MODE_TO_TEMPLATE_NAME = MODES_CONFIG.reduce((acc, mode) => {
    acc[mode.id] = mode.displayName;
    return acc;
}, {});


// --- 3. Call the initialization function when the page loads ---
document.addEventListener('DOMContentLoaded', initializeModeTabs);
```

### Benefits of This Refactored Approach

1.  **Maintainability:** To add a new mode, you **only edit one place**: the `MODES_CONFIG` array. Everything else (HTML, handlers, detection rules) updates automatically.
2.  **Consistency:** The button text, title, and internal ID are guaranteed to be in sync because they are all generated from the same source object.
3.  **Scalability:** The system is now built to easily handle 10, 20, or more modes without becoming a tangled mess.
4.  **Readability:** A developer can look at `MODES_CONFIG` and immediately understand all the available modes and their complete behavior.
5.  **DRY (Don't Repeat Yourself):** You have eliminated redundant declarations of mode names and their properties.