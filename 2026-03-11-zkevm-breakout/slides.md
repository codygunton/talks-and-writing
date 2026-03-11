---
marp: true
lang: en-US
title: zkEVM Breakout
theme: zkevm-light
transition: fade
paginate: true
_paginate: false
---

<!-- _class: lead -->

<script src="assets/theme-bg-light.js"></script>
<script src="assets/sparkles-light.js"></script>
<script type="module" src="assets/mermaid-zkevm-light.js"></script>
<script src="assets/livereload.js"></script>
<script src="assets/timer.js"></script>

# Update on Project 7: Security

Cody Gunton - March 11, 2026

https://codygunton.github.io/talks-and-writing/2026-03-11-zkevm-breakout/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

--- 

# RISC-V Compliance Testing

<img src="assets/act4.webp" alt="ACT4 test monitor" style="width:100%;border-radius:6px;">

There are recent improvements to https://github.com/riscv/riscv-arch-test
 - RISCOF framework, more invasive to implement, is no more.
 - New tests!
 - Commitment to more legible release schedule.

TODO: update https://eth-act.github.io/zkevm-test-monitor/


---

# Soundcalc


What it is: a Python tool to calculate number of bits of security.

Five zkVMs integrated by requested deadline 
https://github.com/ethereum/soundcalc/blob/main/reports/summary.md

Thanks to the teams behind: Airbender, OpenVM, Pico, SP1, ZisK

---

# What does formal verification give us...?

<iframe src="https://eprint.iacr.org/2026/192" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>

---

# SNARK Specifications

https://codygunton.github.io/pil2-proofman/: Markdown guide to the Python implementation, the latter being the proposed starter.

<iframe src="https://codygunton.github.io/pil2-proofman/" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>

---

# Thanks for your attention!
<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
