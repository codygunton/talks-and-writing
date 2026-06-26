---
marp: true
lang: en-US
title: EthProofs Call #9 - Formal Verification
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

# Formal Verification of zkVMs

Cody Gunton — EthProofs Call #9, June 26, 2026

https://codygunton.github.io/talks-and-writing/2026-06-26-ethproofs9/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# ZisK v0.17.0 RISC-V Compliance Verification (WIP)

Nethermind and friends: sp1-fv, openvm-fv, pico-fv

My work: [github.com/eth-act/zisk-fv/](github.com/eth-act/zisk-fv/).

Goals:
 * Soundness: every RISC-V state transition accepted by ZisK is spec-valid
 * Completeness: ZisK can process every spec-valid instruction
 * Reproducibilty via nix and reasonable CI profile
 * Use standard tools like [aeneas](https://github.com/AeneasVerif/aeneas) and [clean](https://github.com/Verified-zkEVM/clean)
 * Make the verification boundary and claim as explicit as possible
 * Strong testing to cover verification gaps


---

# Status and Path Forward
Approach: build e2e with axioms, remove axioms, profit (bugs).
 * Good progress on soundness
 * Found three bugs in ZisK, one they already patched, two novel (now patched)

Next steps:
 * Clean up `theorem root_soundness`, audit with Hector
 * Upgrade to v0.18.0, add Zicclsm iterate
 * UPgrade to v1.0.0-alpha, iterate, then v1.0.0-beta
 * Finish `theorem root_completeness`
 * Expand testing


---

# Thanks for your attention!
<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
