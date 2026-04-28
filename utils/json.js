async function loadMarkdown() {
    try {
        const response = await fetch('resources/structuresJSON.md');
        const text = await response.text();

        // 1. Render Markdown
        document.getElementById('content').innerHTML = marked.parse(text);

        // 2. Add Buttons to EACH pre tag
        const codeBlocks = document.querySelectorAll('pre');

        codeBlocks.forEach((pre) => {
            // Create the container
            const container = document.createElement('div');
            container.className = 'code-container';

            // Insert container before the <pre>
            pre.parentNode.insertBefore(container, pre);
            // Move the <pre> inside the container
            container.appendChild(pre);

            // Create the button
            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.innerText = 'Copy';

            // Append button to the container
            container.appendChild(btn);

            // Copy functionality
            btn.addEventListener('click', () => {
                // Get text from the <code> tag inside the <pre>
                const codeElement = pre.querySelector('code');
                const textToCopy = codeElement ? codeElement.innerText : pre.innerText;

                navigator.clipboard.writeText(textToCopy).then(() => {
                    btn.innerText = 'Copied!';
                    btn.style.background = "#238636"; // Turn green on success
                    
                    setTimeout(() => {
                        btn.innerText = 'Copy';
                        btn.style.background = "#30363d"; // Back to original
                    }, 2000);
                });
            });
        });

        // 3. Highlight everything
        Prism.highlightAll();

    } catch (e) {
        console.error("Fail:", e);
    }
}
loadMarkdown();