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
<script src="assets/timer.js"></script>

# Update on Project 7: Security

Cody Gunton - July 8, 2026

https://codygunton.github.io/talks-and-writing/2026-07-08-zkevm-breakout/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# RISC-V Compliance Testing

https://github.com/eth-act/zkevm-test-monitor/

https://eth-act.github.io/zkevm-test-monitor/

Upgraded RISC-V test suites to ACT v4.0.0; exposed more bugs 🎅

---

# Formal RISC-V Compliance of ZisK

https://github.com/eth-act/zisk-fv

Gap between "AI wrote me some Lean proofs" and "I am convinced this is" is huge.

Progress is mostly technical; summary is [here](https://github.com/eth-act/zisk-fv/issues/238) for those interested.

Met with Héctor Masip of ZisK, who's now ramping up to review and contribute.

---

# RISC-V Fuzzing

Near-final deliverables are a fuzzing grant; code released at the end of the month.

- Built on [Ere](https://github.com/eth-act/ere)
- Rust and pure RISC-V
- Don't want to front-run too much :)

---

# Innovations and ArkLib

- [Flock](https://eprint.iacr.org/2026/1329) proof system: no more algebraic hashes 🤞.
- [ArkLib#449](https://github.com/Verified-zkEVM/ArkLib/pull/449): Perfect completness of sumcheck; useful for WHIR, Flock and more.
- [ArkLib#516](https://github.com/Verified-zkEVM/ArkLib/pull/516): Ring switching formalism; will be useful for formalizing Flock.

---

# https://github.com/frisitano/evm-sail

Experiment with a formal specification in Sail machine spec language

* Same language used for official RISC-V specs.
* sail-to-lean backend already in use in zisk-fv and its ancestors.
* Started June 13; sail-to-C compilation is passing ALL EEST TESTS 😎🤯.
* My dream: feature parity with python specs, then replace them.

---

# Thanks for your attention!

<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
