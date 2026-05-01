To match the layout in your screenshot and add the AI functionality, we need to update the HTML structure, add some CSS for the new button style, and implement the JavaScript functions.

### 1. Update `index.html`
Replace the "Paste JSON" section in your sidebar with this code. I have added the **AI Assistant** button and aligned the **Copy** and **Clear** buttons as seen in your screenshot.

```html
<!-- Inside the Sidebar, replace the 'Paste JSON' div area -->
<div>
    <div class="section-label">Paste JSON</div>
    
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px; gap: 8px;">
        <!-- AI Redirect Button -->
        <button class="btn-ai" onclick="openAiGem()" title="Open Gemini Gem to generate JSON">
            ✨ AI Assistant
        </button>
        
        <div style="display:flex; gap: 4px;">
            <button class="btn-copy-sidebar" id="btn-copy-json" onclick="copyJsonToClipboard()">Copy JSON</button>
            <button class="btn-clear" onclick="clearAll()">Clear</button>
        </div>
    </div>

    <textarea class="json-input" id="json-ta"
        placeholder='{ "meta": { "account": "..." }, ... }'
        oninput="handlePaste()"></textarea>
    <div id="json-err" style="font-size:14px;color:#df0000;margin-top:4px;display:none;"></div>
</div>
```

### 2. Add Styles (to your CSS file or a `<style>` block)
Add these styles to create the blue gradient for the AI button and the layout for the buttons.

```css
/* AI Assistant Button - Blue Gradient */
.btn-ai {
    background: linear-gradient(135deg, #1e52f1 0%, #051a80 100%);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.1s;
    flex-grow: 1;
}

.btn-ai:hover {
    filter: brightness(1.2);
}

.btn-ai:active {
    transform: scale(0.98);
}

/* Updated Copy Button for Sidebar */
.btn-copy-sidebar {
    background: #2a3b52;
    color: #fff;
    border: 1px solid #3d4f6a;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}

.btn-copy-sidebar:hover {
    background: #364a68;
}

/* Ensure JSON error is hidden by default */
#json-err { display: none; }
```

### 3. Update JavaScript Functions
Add or update these functions in your `uiFunctions.js` or `utils/main.js`.

```javascript
/**
 * Redirects to the Gemini Gem.
 * Replace 'YOUR_GEM_URL' with the actual URL of your Gemini Gem.
 */
function openAiGem() {
    // You can also copy a prompt to the clipboard before redirecting
    const prompt = "Please generate the JSON for my work data using the templates in your knowledge base.";
    navigator.clipboard.writeText(prompt).then(() => {
        alert("Prompt copied! Paste it into the Gemini Gem.");
        window.open('https://gemini.google.com/gems/YOUR_GEM_URL_HERE', '_blank');
    });
}

/**
 * Improved Copy JSON function with visual feedback
 */
async function copyJsonToClipboard() {
    const jsonArea = document.getElementById('json-ta');
    const copyBtn = document.getElementById('btn-copy-json');
    
    if (!jsonArea.value) return;

    try {
        await navigator.clipboard.writeText(jsonArea.value);
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "✅ Copied!";
        copyBtn.style.backgroundColor = "#188300";
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = ""; // Resets to CSS default
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        jsonArea.select();
        document.execCommand('copy');
    }
}

/**
 * Clear All Function
 */
function clearAll() {
    if (confirm("Clear all input data?")) {
        document.getElementById('json-ta').value = "";
        document.getElementById('json-view').innerHTML = "";
        document.getElementById('json-err').style.display = "none";
        // Reset preview states
        document.getElementById('preview-empty').style.display = 'block';
        document.getElementById('preview-content').style.display = 'none';
        currentData = null;
    }
}
```

### Key Improvements:
1.  **AI Assistant Button:** Added a primary blue-gradient button that alerts the user that the prompt is copied and then opens your Gemini Gem in a new tab.
2.  **Visual Feedback:** The "Copy JSON" button now changes to "✅ Copied!" and turns green for 2 seconds so you know it worked.
3.  **UI Layout:** The buttons are now grouped exactly like your screenshot—AI on the left (to make it prominent), Copy and Clear on the right.
4.  **Error Handling:** Added a fallback for `copy` command in case `navigator.clipboard` is unavailable in your network environment.

---

### **REQ:** Update the `openAiGem` function to build prompts dynamically, now keyed to the `currentMode`. Clicking "AI Assistant" triggers a clipboard copy; the copied prompt now reads, "Use <templateName> template." This streamlines the workflow, making it more intuitive for users.

To achieve this, we will create a mapping object that translates your internal `currentMode` keys into the friendly "Template Names" you defined earlier.

Here is the updated code to replace your existing `openAiGem` function:

### 1. The Template Mapping & Function
Add this to your JavaScript file (e.g., `uiFunctions.js`):

```javascript
// Map internal keys to the names used in your AI Gem's Knowledge base
const MODE_TO_TEMPLATE_NAME = {
    callscript: "Call Script",
    report: "Status Report",
    rca: "RCA",
    blocker: "Blocker Brief",
    techapproach: "Technical Approach Document",
    taskbrief: "Task Brief",
    projectsummary: "Project Summary",
    deploymentrunbook: "Deployment Runbook",
    storydesign: "Story Design",
    incidentsummary: "Incident Resolution Summary",
    signoff: "Single Request Approval",
    bulkapproval: "Bulk Approval Requests"
};

function openAiGem() {
    // 1. Get the friendly name based on currentMode
    // Fallback to "the appropriate" if for some reason currentMode is missing
    const templateName = MODE_TO_TEMPLATE_NAME[currentMode] || "the appropriate";

    // 2. Construct the prompt
    const prompt = `Use ${templateName} template.`;

    // 3. Copy to clipboard
    navigator.clipboard.writeText(prompt).then(() => {
        // Optional: Change the alert to something less intrusive, like a console log 
        // or a small temporary toast message on screen.
        alert(`Prompt copied: "${prompt}"\n\nRedirecting to Gemini...`);
        
        // 4. Redirect
        window.open('https://gemini.google.com/gem', '_blank');
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}
```

### 2. How it works:
1.  **Selection:** If you have clicked on **RCA** in your UI, `currentMode` is set to `'rca'`.
2.  **Mapping:** The function looks up `MODE_TO_TEMPLATE_NAME['rca']` and finds `"RCA"`.
3.  **Prompt Generation:** It creates the string: `Use RCA template.`
4.  **Action:** It copies that exact string to your clipboard and opens Gemini. 

### 3. Bonus Tip: Even Better UX
Instead of a generic `alert()`, you can show the user exactly what was copied on the button itself for a second:

```javascript
function openAiGem() {
    const templateName = MODE_TO_TEMPLATE_NAME[currentMode] || "the appropriate";
    const prompt = `Use ${templateName} template.`;
    const aiBtn = document.querySelector('.btn-ai');

    navigator.clipboard.writeText(prompt).then(() => {
        const originalText = aiBtn.innerHTML;
        aiBtn.innerHTML = "✅ Prompt Copied!";
        
        setTimeout(() => {
            aiBtn.innerHTML = originalText;
            window.open('https://gemini.google.com/gem', '_blank');
        }, 800);
    });
}
```

This way, when you click the button, it visually confirms the template name it just "remembered" for you before switching tabs.