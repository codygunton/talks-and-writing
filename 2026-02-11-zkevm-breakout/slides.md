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
# Project 7: Security

<div class="no-marker">

* A higher-level, not-exactly-chronoconsistent timeline is on the next slide.

* This was derived from eth-act/planning.

* Missing or implicit: speccing; audits/bounties; prover incentives; supply chain security (verification keys; reproducible guest program builds); security of provers (multi-tenancy situations, etc.); prover liveness and incentives.

</div>

---
<!-- _paginate: false -->
<!-- _style: "section { padding: 10px 20px; }" -->

<div data-mermaid="diagrams/roadmap.mmd" style="display:flex;align-items:center;justify-content:center;width:100%;flex:1;"></div>

<script type="module" src="assets/mermaid-zkevm.js"></script>

---

# What Else for Mandatory Proofs?

<div class="columns">
<div class="no-marker">

- Formal Verification
  - VM spec compliance
  - Verifiers

- Testing
  - Additional tests for new requirements
  - More fuzzing

- Diversity
  - Proof redundency improvements

</div>
<div class="no-marker">

- Audit requirements
  - Code
  - White papers
  - Bounties

- Standards
  - Additional compliance

</div>
</div>

---

# What next?

<div class="no-marker">

* I will track these issues and associate them with rough ownership groups.

* I will report progress in these calls and in monthly updates to eth-act/planning.

* Discuss here and on Eth R&D Discord at `#l1-zkevm-protocol`.
</div>

