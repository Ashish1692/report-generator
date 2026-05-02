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
        // The detection logic for report, based on AUTO_DETECTION_RULES
        autoDetect: d => d.executive_summary,
    },
    {
        id: 'rca',
        displayName: 'RCA',
        icon: '⚙',
        generate: generateRCA, // Matching case from getModeHandler
        render: renderRcaPreview,
        autoDetect: d => d.incident && !d.executive_summary && !d.topics && !d.task_num,
    },
    {
        id: 'blocker',
        displayName: 'Blocker Brief',
        icon: '⚙',
        generate: generateBlockerBrief,
        render: renderBlockerPreview,
        autoDetect: d => d.task_num && d.blocker_description,
    },
    {
        id: 'techapproach',
        displayName: 'Tech Approach Document',
        icon: '⚙',
        generate: generateTechApproach,
        render: renderTechApproachPreview,
        autoDetect: d => d.task_num && d.proposed_solution && d.technical_spec,
    },
    {
        id: 'taskbrief',
        displayName: 'Task Brief',
        icon: '⚙',
        generate: generateTaskBrief,
        render: renderTaskBriefPreview,
        autoDetect: d => d.task_num && (d.reported_behavior || d.investigation),
    },
    {
        id: 'projectsummary',
        displayName: 'Project Summary',
        icon: '⚙',
        generate: generateProjectSummary,
        render: renderProjectSummaryPreview,
        autoDetect: d => d.project_name && !d.deployment_steps && !d.approval_tasks,
    },
    {
        id: 'deploymentrunbook',
        displayName: 'Deployment Runbook',
        icon: '⚙',
        generate: generateDeploymentRunbook,
        render: renderDeploymentRunbookPreview,
        autoDetect: d => d.deployment_steps && d.ops_lead,
    },
    {
        id: 'incidentsummary',
        displayName: 'INC Resolution Summary',
        icon: '⚙',
        generate: generateIncidentSummary,
        render: renderIncidentSummaryPreview,
        autoDetect: d => d.incident_number,
    },
    {
        id: 'signoff',
        displayName: 'Single Task Approval',
        icon: '⚙',
        generate: generateSignOffRequest,
        render: renderSignOffPreview,
        autoDetect: d => d.signoff_id && d.objective,
    },
    {
        id: 'bulkapproval',
        displayName: 'Bulk Task Approval',
        icon: '⚙',
        generate: generateBulkApprovalRequest,
        render: renderBulkApprovalPreview,
        autoDetect: d => d.approval_tasks && d.project_name,
    },
    {
        id: 'devhandover',
        displayName: 'DEV Handover',
        icon: '⚙',
        generate: generateDevHandover,
        render: renderDevHandoverPreview,
        autoDetect: d => d.work_inventory && d.next_owner,
    },
    {
        id: 'kbarticle',
        displayName: 'KB Article',
        icon: '⚙',
        generate: generateKBArticle,
        render: renderKBArticlePreview,
        autoDetect: d => d.kb_id && d.occurrence_history,
    },
    {
        id: 'techdoc',
        displayName: 'Tech Spec Document',
        icon: '⚙',
        generate: generateTechnicalSpec,
        render: renderTechnicalSpecPreview,
        autoDetect: d => d.technical_title && d.implementation_steps,
    },
    {
        id: 'code_review',
        displayName: 'Code Review',
        icon: '⚙',
        generate: generateCodeReview,
        render: renderCodeReviewPreview,
        autoDetect: d => d.task_id && d.is_code_review,
    }
];


// --- 1. Dynamically generate mode tabs based on the configuration ---
// --- 1. Dynamically generate a custom dropdown ---
function initializeCustomDropdown() {
    const container = document.getElementById('mode-tabs-container');
    if (!container) return;

    const initialMode = MODES_CONFIG.find(m => m.initialActive) || MODES_CONFIG[0];

    // Build the HTML structure
    const dropdownHtml = `
        <div class="custom-dropdown" id="mode-dropdown">
            <button class="dropdown-toggle" id="dropdown-toggle-btn" aria-haspopup="true" aria-expanded="false">
                <span id="selected-mode-display">
                    ${initialMode.icon} ${initialMode.displayName}
                </span>
            </button>
            <div class="dropdown-menu" id="dropdown-menu-list" role="menu">
                ${MODES_CONFIG.map(mode => `
                    <button class="dropdown-item" role="menuitem" data-mode="${mode.id}">
                        ${mode.icon} ${mode.displayName}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = dropdownHtml;

    // Get references to the new elements
    const dropdown = document.getElementById('mode-dropdown');
    const toggleBtn = document.getElementById('dropdown-toggle-btn');
    const menu = document.getElementById('dropdown-menu-list');
    const selectedDisplay = document.getElementById('selected-mode-display');

    // --- Event Listeners ---

    // 1. Toggle the dropdown menu on button click
    toggleBtn.addEventListener('click', () => {
        const isOpen = dropdown.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // 2. Handle clicks on dropdown items
    menu.addEventListener('click', (event) => {
        const target = event.target.closest('.dropdown-item');
        if (target) {
            const modeId = target.dataset.mode;
            const selectedMode = MODES_CONFIG.find(m => m.id === modeId);

            // Update the display button
            selectedDisplay.innerHTML = `${selectedMode.icon} ${selectedMode.displayName}`;

            // Close the dropdown
            dropdown.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');

            // Call your existing logic to switch the mode
            switchMode(modeId);
        }
    });

    // 3. Close the dropdown when clicking outside of it
    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// --- 2. Create a mapping of mode IDs to their handlers for easy access --- 
const MODE_HANDLERS = MODES_CONFIG.reduce((acc, mode) => {
    acc[mode.id] = {
        generate: mode.generate,
        render: mode.render
    };
    return acc;
}, {});

// Helper function to get the handler for a given mode
function getModeHandler(modeId) {
    return MODE_HANDLERS[modeId];
}

// This array will be used for auto-detection of the mode based on the input data structure
const AUTO_DETECTION_RULES = MODES_CONFIG
    .filter(mode => mode.autoDetect) // Only include modes that have a detection rule
    .map(mode => ({
        mode: mode.id,
        check: mode.autoDetect
    }));

// A mapping from mode IDs to their display names, used for the OpenAI prompt
const MODE_TO_TEMPLATE_NAME = MODES_CONFIG.reduce((acc, mode) => {
    acc[mode.id] = mode.displayName;
    return acc;
}, {});


// --- 3. Call the initialization function when the page loads ---
document.addEventListener('DOMContentLoaded', initializeCustomDropdown);