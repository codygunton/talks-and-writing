import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#1e2a3a',
    primaryTextColor: '#e8edf3',
    primaryBorderColor: '#0DAFD2',
    secondaryColor: '#243044',
    secondaryTextColor: '#e8edf3',
    secondaryBorderColor: '#8abff9',
    tertiaryColor: '#1a2535',
    tertiaryTextColor: '#e8edf3',
    lineColor: '#8abff9',
    textColor: '#e8edf3',
    background: 'transparent',
    mainBkg: '#1e2a3a',
    sectionBkgColor: '#2a3040',
    sectionBkgColor2: '#2a3040',
    gridColor: '#2a3a4e',
    cScale0: '#0DAFD2',
    cScale1: '#667BBC',
    cScale2: '#54BC7A',
    cScaleLabel0: '#e8edf3',
    cScaleLabel1: '#e8edf3',
    cScaleLabel2: '#e8edf3',
    taskTextColor: '#e8edf3',
    todayLineColor: '#0DAFD2',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
  },
  gantt: { useWidth: 1140 },
});

document.querySelectorAll('[data-mermaid]').forEach(async function(el, i) {
  var src = el.getAttribute('data-mermaid');
  var resp = await fetch(src);
  var text = await resp.text();
  var id = 'mermaid-svg-' + i;
  var result = await mermaid.render(id, text);
  el.innerHTML = result.svg;

  var svgEl = el.querySelector('svg');
  if (svgEl) {
    svgEl.style.width = '100%';
    svgEl.style.height = 'auto';
    svgEl.style.maxHeight = '560px';
  }

  var bgRect = el.querySelector('svg > rect');
  if (bgRect) bgRect.setAttribute('fill', 'transparent');

  var svgStyle = el.querySelector('svg style');
  if (svgStyle) {
    svgStyle.textContent += '\n' +
      '.section0 { fill: #2e3444 !important; opacity: 0.5 !important; }\n' +
      '.section1 { fill: #282e3e !important; opacity: 0.5 !important; }\n' +
      '.section2 { fill: #222838 !important; opacity: 0.5 !important; }\n';
  }
});
