// Move the logic into a function so it's only called when needed
function getModeHandler(mode) {
    var handlers = {
        callscript: { generate: generateCallScript, render: renderCallScriptPreview },
        report: { generate: generateStatusReport, render: renderReportPreview },
        rca: { generate: generateRCA, render: renderRcaPreview },
        blocker: { generate: generateBlockerBrief, render: renderBlockerPreview },
        techapproach: { generate: generateTechApproach, render: renderTechApproachPreview },
        taskbrief: { generate: generateTaskBrief, render: renderTaskBriefPreview },
        projectsummary: { generate: generateProjectSummary, render: renderProjectSummaryPreview },
        deploymentrunbook: { generate: generateDeploymentRunbook, render: renderDeploymentRunbookPreview },
        incidentsummary: { generate: generateIncidentSummary, render: renderIncidentSummaryPreview },
        signoff: { generate: generateSignOffRequest, render: renderSignOffPreview },
        bulkapproval: { generate: generateBulkApprovalRequest, render: renderBulkApprovalPreview }
    };
    return handlers[mode];
}

// 1. Define the detection rules in order of priority
const AUTO_DETECTION_RULES = [
    { mode: 'rca', check: d => d.incident && !d.executive_summary && !d.topics && !d.task_num },
    { mode: 'callscript', check: d => d.topics && !d.executive_summary },
    { mode: 'report', check: d => d.executive_summary },
    { mode: 'techapproach', check: d => d.task_num && d.proposed_solution && d.technical_spec },
    { mode: 'blocker', check: d => d.task_num && d.blocker_description },
    { mode: 'taskbrief', check: d => d.task_num && (d.reported_behavior || d.investigation) },
    { mode: 'deploymentrunbook', check: d => d.deployment_steps && d.ops_lead },
    { mode: 'bulkapproval', check: d => d.approval_tasks && d.project_name },
    { mode: 'projectsummary', check: d => d.project_name && !d.deployment_steps && !d.approval_tasks },
    { mode: 'incidentsummary', check: d => d.incident_number },
    { mode: 'signoff', check: d => d.signoff_id && d.objective }
];

async function generate() {
    if (!currentData) return;

    try { getDocx(); } catch (e) {
        document.getElementById('ban-err-txt').textContent = e.message;
        document.getElementById('ban-err').classList.add('show');
        return;
    }

    var btn = document.getElementById('btn-gen');
    btn.classList.add('loading');
    document.getElementById('ban-ok').classList.remove('show');
    document.getElementById('ban-err').classList.remove('show');

    try {
        // Use the helper function here
        var handler = getModeHandler(currentMode);

        if (!handler) {
            throw new Error("Unknown mode: " + currentMode);
        }

        var result = await handler.generate(currentData);

        lastBlob = result.blob;
        lastFilename = result.filename;
        document.getElementById('ban-filename').textContent = result.filename + ' \u2014 ready to download';
        document.getElementById('ban-ok').classList.add('show');
        downloadNow();
    } catch (err) {
        document.getElementById('ban-err-txt').textContent = err.message;
        document.getElementById('ban-err').classList.add('show');
        console.error(err);
    } finally {
        btn.classList.remove('loading');
    }
}

function renderPreview(data) {
    document.getElementById('preview-empty').style.display = 'none';
    var el = document.getElementById('preview-content');
    el.style.display = 'block';

    // Use the helper function here
    var handler = getModeHandler(currentMode);
    if (handler) {
        el.innerHTML = handler.render(data);
    }
}

function loadJSON(raw) {
    const errEl = document.getElementById('json-err');
    try {
        const data = JSON.parse(raw);
        errEl.style.display = 'none';
        currentData = data;

        document.getElementById('json-view').innerHTML =
            '<pre style="white-space:pre-wrap;word-break:break-word;margin:0;">' + escHtml(JSON.stringify(data, null, 2)) + '</pre>';

        document.getElementById('btn-copy-json').style.display = 'block';
        const applyBtn = document.getElementById('btn-apply-json');
        if (applyBtn) applyBtn.style.display = 'block';

        // --- REFACTORED AUTO-DETECTION ---
        // Find the first rule that returns true for this data
        const match = AUTO_DETECTION_RULES.find(rule => rule.check(data));
        if (match) {
            switchMode(match.mode);
        }
        // ---------------------------------

        document.getElementById('json-ta').value = JSON.stringify(data, null, 2);
        renderPreview(data);
        updateGenButton();
        renderJsonView(data);
    } catch (err) {
        errEl.textContent = 'Invalid JSON: ' + err.message;
        errEl.style.display = 'block';
    }
}