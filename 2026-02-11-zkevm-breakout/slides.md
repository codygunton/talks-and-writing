---
marp: true
lang: en-US
title: zkEVM Breakout
theme: zkevm
transition: fade
paginate: true
_paginate: false
---

<!-- _class: lead -->

<script src="assets/theme-bg.js"></script>
<script src="assets/sparkles.js"></script>
<script src="assets/livereload.js"></script>

# zkEVM Breakout


Cody Gunton - February 11, 2026

<div class="bottom-bar"><img src="assets/logo-zkevm.svg" class="logo" alt=""></div>

---
<!-- _paginate: false -->

<div id="roadmap" style="display:flex;align-items:center;justify-content:center;width:100%;overflow:hidden;max-height:560px;"></div>

<script type="module">
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
const resp = await fetch('diagrams/roadmap.mmd');
const text = await resp.text();
const { svg } = await mermaid.render('roadmap-svg', text);
document.getElementById('roadmap').innerHTML = svg;
const svgEl = document.querySelector('#roadmap svg');
if (svgEl) {
  svgEl.style.width = '100%';
  svgEl.style.height = 'auto';
  svgEl.style.maxHeight = '560px';
}
const bgRect = document.querySelector('#roadmap svg > rect');
if (bgRect) bgRect.setAttribute('fill', 'transparent');
const svgStyle = document.querySelector('#roadmap svg style');
if (svgStyle) {
  svgStyle.textContent += `
    .section0 { fill: #2e3444 !important; opacity: 1 !important; }
    .section1 { fill: #282e3e !important; opacity: 1 !important; }
    .section2 { fill: #222838 !important; opacity: 1 !important; }
  `;
}
</script>
