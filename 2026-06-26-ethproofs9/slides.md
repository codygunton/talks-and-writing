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
<script src="assets/livereload.js"></script>
<script src="assets/timer.js"></script>

# Formal Verification of zkVMs

Cody Gunton — EthProofs Call #9, June 26, 2026

https://codygunton.github.io/talks-and-writing/2026-06-26-ethproofs9/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Why formal verification?

- zkVM provers are large, fast-moving, and security-critical
- A soundness bug = a prover that can "prove" false statements
- Auditing and fuzzing find bugs; they don't establish their *absence*
- Formal verification establishes **spec compliance** for the parts we cover

*Caveat:* FV is powerful but bounded — coverage and the spec itself are the
hard part, and many stakeholders overestimate what a "verified" label means.

---

# SP1 Formal Verification Blog Post

Published: https://zkevm.ethereum.foundation/blog/sp1-fv

Highlights:
 - Lean4 model of SP1 Hypercube surfaced a bug in a core control-flow circuit (JALR)
 - Found accidental inclusion of contradictory hypotheses in the Lean4 proof of SLTI (no bug in the circuit itself)
 - Compliance is **not** yet established for 11 instructions
 - Takeaway: we need FV to establish spec compliance, and we must foreground its limitations

---

# RISC-V target compliance

eth-act set the RISC-V target standard to **RV64IM_Zicclsm**
(https://github.com/eth-act/zkvm-standards)

- **LambdaVM** — first to fully implement the standard (prove every compliance test, then verify every proof)
- **ZisK** — close; only fails on rare fence instructions that ~never appear in single-threaded programs. Full compliance expected next release
- **OpenVM** — actively upgrading from RV32IM to the eth-act target

---

# ZisK RISC-V formal verification

https://github.com/eth-act/zisk-fv is nearing completion
 - Covers v0.17.0
 - Exposed two soundness bugs in core arithmetic circuits
 - Next: a re-architecting pass, then chase the upgrade

---

# Supporting infrastructure

* **Computable Polynomials** — executable Lean4 polynomial arithmetic (not just proofs *about* polynomials); landed NTT-based multiplication. *Refs:* CompPoly #174
* **KZG correctness proofs** — security proofs for the KZG commitment scheme landed, built on CompPoly → an executable KZG spec. *Refs:* ArkLib #263

---

# How you can plug in

- Security team: https://security.ethereum.org/
- Formal verification project: https://verified-zkevm.org/
- Standards & FV repos: https://github.com/eth-act

Contributions, reviews, and adversarial eyes all welcome.

---

# Thanks for your attention!
<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
