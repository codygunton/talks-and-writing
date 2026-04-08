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

Cody Gunton - April 8, 2026

https://codygunton.github.io/talks-and-writing/2026-04-08-zkevm-breakout/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

--- 

# RISC-V Compliance

* **Testing:** Across three different zkVMs, I identified and reported many bugs and RISC-V compliance issues. Will report more after further consultation.

* **Fuzzing:** Grantees reporting and finding bugs; will disclose publicly in time.

* **Specs:** "Golden Model" updates: https://github.com/riscv/sail-riscv/pull/1468
<img src="assets/sail-riscv-pr-1468.png" alt="sail-riscv PR #1468" style="width:100%;border-radius:6px;">


---

# What does formal verification give us...?

<iframe src="https://eprint.iacr.org/2026/670" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>

---

# SNARK Specifications

https://codygunton.github.io/openvm/: Markdown guide to the Python implementation, the latter being the proposed starter.

<iframe src="https://codygunton.github.io/openvm/" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>

---

# Thanks for your attention!
<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
