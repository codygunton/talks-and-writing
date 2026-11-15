-- Render ```mermaid fences as <pre class="mermaid"> for mermaid.js; other blocks unchanged.
local function esc(s) return (s:gsub('&', '&amp;'):gsub('<', '&lt;'):gsub('>', '&gt;')) end
function CodeBlock(el)
  if el.classes:includes('mermaid') then
    return pandoc.RawBlock('html', '<pre class="mermaid">' .. esc(el.text) .. '</pre>')
  end
end
