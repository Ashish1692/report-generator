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
        var result;
        if (currentMode === 'callscript') result = await generateCallScript(currentData);
        else if (currentMode === 'report') result = await generateStatusReport(currentData);
        else if (currentMode === 'rca') result = await generateRCA(currentData);
        else if (currentMode === 'blocker') result = await generateBlockerBrief(currentData);
        else if (currentMode === 'techapproach') result = await generateTechApproach(currentData);
        else if (currentMode === 'taskbrief') result = await generateTaskBrief(currentData);
        else if (currentMode === 'projectsummary') result = await generateProjectSummary(currentData);
        else if (currentMode === 'deploymentrunbook') result = await generateDeploymentRunbook(currentData);
        else if (currentMode === 'storydesign') result = await generateStoryDesign(currentData);
        else if (currentMode === 'incidentsummary') result = await generateIncidentSummary(currentData);




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

function loadJSON(raw) {
    const errEl = document.getElementById('json-err');
    try {
        const data = JSON.parse(raw);
        errEl.style.display = 'none';
        currentData = data;

        document.getElementById('json-view').innerHTML =
            '<pre style="white-space:pre-wrap;word-break:break-word;margin:0;">' + escHtml(JSON.stringify(data, null, 2)) + '</pre>';

        // Show both buttons
        document.getElementById('btn-copy-json').style.display = 'block';
        const applyBtn = document.getElementById('btn-apply-json');
        if (applyBtn) applyBtn.style.display = 'block';

        // Auto-detect mode
        if (data.incident && !data.executive_summary && !data.topics && !data.task_num) switchMode('rca');
        else if (data.topics && !data.executive_summary) switchMode('callscript');
        else if (data.executive_summary) switchMode('report');
        else if (data.task_num && data.blocker_description) switchMode('blocker');
        else if (data.task_num && data.proposed_solution && data.technical_spec) switchMode('techapproach');
        else if (data.task_num && (data.reported_behavior || data.investigation)) switchMode('taskbrief');
        else if (data.project_name && !data.deployment_steps) switchMode('projectsummary');
        else if (data.deployment_steps && data.ops_lead) switchMode('deploymentrunbook');
        else if (data.story_id) switchMode('storydesign');
        // Detect by incident_number (RCA uses "incident")
        else if (data.incident_number) switchMode('incidentsummary');



        document.getElementById('json-ta').value = JSON.stringify(data, null, 2);
        renderPreview(data);
        updateGenButton();
        renderJsonView(data);
    } catch (err) {
        errEl.textContent = 'Invalid JSON: ' + err.message;
        errEl.style.display = 'block';
    }
}

function renderPreview(data) {
    document.getElementById('preview-empty').style.display = 'none';
    var el = document.getElementById('preview-content');
    el.style.display = 'block';
    if (currentMode === 'callscript') el.innerHTML = renderCallScriptPreview(data);
    else if (currentMode === 'report') el.innerHTML = renderReportPreview(data);
    else if (currentMode === 'rca') el.innerHTML = renderRcaPreview(data);
    else if (currentMode === 'blocker') el.innerHTML = renderBlockerPreview(data);
    else if (currentMode === 'techapproach') el.innerHTML = renderTechApproachPreview(data);
    else if (currentMode === 'taskbrief') el.innerHTML = renderTaskBriefPreview(data);
    else if (currentMode === 'projectsummary') el.innerHTML = renderProjectSummaryPreview(data);
    else if (currentMode === 'deploymentrunbook') el.innerHTML = renderDeploymentRunbookPreview(data);
    else if (currentMode === 'storydesign') el.innerHTML = renderStoryDesignPreview(data);
    else if (currentMode === 'incidentsummary') el.innerHTML = renderIncidentSummaryPreview(data);




}