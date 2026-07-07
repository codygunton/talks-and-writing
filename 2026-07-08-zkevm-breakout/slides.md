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

# SP1 Formal Verification Blog Post 

Published https://zkevm.ethereum.foundation/blog/sp1-fv

Highlights:
 - Lean4 model of SP1 Hypecube modeled a bug in a core control flow circuit JALR
 - Found accidental inclusion of contradictory hypotheses in Lean4 proof of SLTI (no bug in circuit)
 - Compliance is not established for 11 instructions
 - Conclusion: we need formal verification efforts to establish spec compliance, and communications should foreground limitations since many stakeholders overestimate the power of fv.

---

# ZisK RISC-V Formal Verification

https://github.com/eth-act/zisk-fv is nearing completion
 - Covers v0.17.0
 - Will need a re-architecting pass, then will try upgrading
 - Exposed two soundness bugs in core arithmetic circuits

---

# eth-act RISC-V Target Compliance

Earlier this year we set the RISC-V target standard to RV64IM_Zicclsm (see https://github.com/eth-act/zkvm-standards/blob/main/standards/riscv-target/target.md). 

- The first team to completely implement this standard (==can prove every compliance test, then verify every proof) is the newly-released LambdaVM

- ZisK is close. Tthey only fail on certain rare fence instructions that 'never' show up in practice in singly-threaded programs. Full compliance in the next release.

- OpenVM is actively developing their upgrade from RV32IM to the eth-act target.




---

# Formal verification highlights

* **Computable Polynomials**
*What:* Progress on efficient polynomial arithmetic through executable Lean4 code (not just proofs about polynomials). Got NTT-based multiplication 
*Refs:* CompPoly #174

* **KZG Correctness Proofs**
*What:* Security proofs for KZG commitment scheme landed. These use CompPoly, so we have a step an executable KZG spec.
*Refs:* ArkLib #263


---

# Thanks for your attention!
<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
