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

# zkEVM Breakout

Cody Gunton - March 11, 2026

https://codygunton.github.io/talks-and-writing/2026-03-11-zkevm-breakout/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

--- 

# Testing

Significant improvements to the official RISC-V Architecture Tests https://github.com/riscv/riscv-arch-test
 - RISOCF framework, more invasive to implement, is no more.
 - New tests!
 - Commitment to more legible release schedule

Currently working to update https://eth-act.github.io/zkevm-test-monitor/

---

# Formal Verification

Goals of [verified-zkevm.org](https://verified-zkevm.org/):
1) A RISC-V implementation matches the Sail spec
    * Progress on SP1 and OpenVM by Nethermind with caveats
2) An EVM implementation matches a formal spec
3) A verifier matches an ArkLib spec that is proven secure


---

# Formal Verification gives us...?

<iframe src="https://eprint.iacr.org/2026/192" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>

---

# Specifications

https://codygunton.github.io/pil2-proofman/: Markdown guide to the Python implementation, the latter being the proposed starter.

<iframe src="https://codygunton.github.io/pil2-proofman/" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>

---

# Specs: What do we want?

Result of some conversations

* Main utility: specs are for auditors.
* Specs should show optimizations not in papers.
* A hard part: continuations
* ZKVM verifiers are blackbox dependencies.
* We need to understand what these things are doing... but maybe only the verifier.

---

# Specs: What do we want?
My opinions
 * If you want specs to be maintainable they need to be executable.
 * Even though we use non-interactive protocols you can't understand just the verifier in isolation.
 * Verifiers are less optimized than provers, hence more readable.
 * A Lean implementation is not as interesting since we really want to prove statements about the extracted code. ArkLib specs will come later

---

# Thanks for your attention!
<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
