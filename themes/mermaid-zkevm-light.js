import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

// Minimal init — theme and gantt config live in the .mmd file's %%{init}%% block.
mermaid.initialize({ startOnLoad: false });

document.querySelectorAll('[data-mermaid]').forEach(async function(el, i) {
  var src = el.getAttribute('data-mermaid');
  var resp = await fetch(src);
  var text = await resp.text();
  var id = 'mermaid-svg-' + i;
  var result = await mermaid.render(id, text);
  el.innerHTML = result.svg;

  // — Marp-specific: fit SVG to slide —
  var svgEl = el.querySelector('svg');
  if (svgEl) {
    svgEl.style.width = '100%';
    svgEl.style.height = '100%';
  }

  // — Marp-specific: transparent background so slide theme shows through —
  var bgRect = el.querySelector('svg > rect');
  if (bgRect) bgRect.setAttribute('fill', 'transparent');

  // — CSS overrides for light theme —
  var svgStyle = el.querySelector('svg style');
  if (svgStyle) {
    svgStyle.textContent += '\n' +
      '.section0 { fill: #f0f2f5 !important; opacity: 0.7 !important; }\n' +
      '.section1 { fill: #e8ecf2 !important; opacity: 0.7 !important; }\n' +
      '.section2 { fill: #e0e5ee !important; opacity: 0.7 !important; }\n' +
      '.task { fill: #0c9fde !important; stroke: #0c9fde !important; opacity: 1 !important; }\n';
  }

  // — Post-processing: position labels outside bars (master chart only) —
  var isMasterChart = src.match(/roadmap\.mmd$/);
  var bars = el.querySelectorAll('svg rect.task');
  el.querySelectorAll('svg text.taskText, svg text.taskTextOutsideRight, svg text.taskTextOutsideLeft').forEach(function(txt) {
    if (isMasterChart) {
      var ty = parseFloat(txt.getAttribute('y'));
      var matched = null;
      bars.forEach(function(r) {
        var ry = parseFloat(r.getAttribute('y')) + parseFloat(r.getAttribute('height')) / 2;
        if (Math.abs(ry - ty) < 5) matched = r;
      });
      if (matched) {
        var isP3 = txt.textContent.match(/^P3T/);
        if (isP3) {
          var leftEdge = parseFloat(matched.getAttribute('x'));
          txt.setAttribute('x', leftEdge - 6);
          txt.setAttribute('text-anchor', 'end');
          txt.setAttribute('class', 'taskTextOutsideLeft');
        } else {
          var rightEdge = parseFloat(matched.getAttribute('x')) + parseFloat(matched.getAttribute('width'));
          txt.setAttribute('x', rightEdge + 6);
          txt.setAttribute('text-anchor', 'start');
          txt.setAttribute('class', 'taskTextOutsideRight');
        }
      }
    }
    // Bold PxTy prefix
    var m = txt.textContent.match(/^(P\dT\d+꞉)\s*(.*)/);
    if (m) {
      txt.innerHTML = '<tspan font-weight="700">' + m[1] + '</tspan> ' + m[2];
    }
  });
});
