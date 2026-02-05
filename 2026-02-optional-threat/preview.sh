#!/bin/bash
# Preview Mermaid diagram on localhost:3000

cd "$(dirname "$0")"

# Generate HTML with live-reloading Mermaid
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Mermaid Diagram Preview</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: system-ui;
            padding: 2rem;
            background: #f5f5f5;
        }
        #diagram {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        #status {
            position: fixed;
            top: 10px;
            right: 10px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div id="status">watching...</div>
    <div id="diagram"></div>
    <script>
        mermaid.initialize({startOnLoad: false});
        let lastContent = '';

        async function loadDiagram() {
            const resp = await fetch('optional.mmd?t=' + Date.now());
            const content = await resp.text();
            if (content !== lastContent) {
                lastContent = content;
                const el = document.getElementById('diagram');
                el.innerHTML = '';
                const {svg} = await mermaid.render('mmd', content);
                el.innerHTML = svg;
                document.getElementById('status').textContent = 'updated ' + new Date().toLocaleTimeString();
            }
        }

        loadDiagram();
        setInterval(loadDiagram, 1000);
    </script>
</body>
</html>
EOF

PORT=${1:-8000}
echo "Serving on http://localhost:$PORT"
echo "Forward this port for remote access"
python3 -m http.server "$PORT" --bind 0.0.0.0
