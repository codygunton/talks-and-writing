---
marp: true
lang: en-US
title: Progress on zkEVM Scaling
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

# The Road to zkEVM Scaling

https://codygunton.github.io/talks-and-writing/2026-02-19-ethdenver/

<img src="images/qr-slides.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# zkVMs & L1

<div class="no-marker">

zkVMs create a powerful asymmetry
  1) A network of low-power nodes (verifiers)
  2) can check the work of powerful nodes (provers)
  3) using only a very small amount of data (hashes and proofs)

Our application is Ethereum attesting. 

Right now, attesters re-execute every transaction.
  1) attesters will be low-power nodes who will verify proofs
  2) proofs will be produced by computationally powerful provers
  3) attesters will only need a small amount of data even as we increase throughput

</div>

---


# Diagrams

<div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:8px;">
  <div data-mermaid="diagrams/zkvm-prover-riscv.mmd" style="width:60%;"></div>
  <div data-mermaid="diagrams/zkvm-verifier-riscv.mmd" style="width:60%;"></div>
  <p style="margin:4px 0 0;font-size:0.85em;">⚠️ I am not talking about replacing the EVM with a RISC-V machine here ⚠️</p>
</div>

---

# zkEVM = zkVM + Guest Program

There are many candidate zkVMs and many candidate "guest programs" (i.e., the transaction-checking programs that need to be proved).

Justin Drake tracks these carefully and presents at Ethproofs [calls](https://youtube.com/playlist?list=PLJqWcTqh_zKGthi2bQDVOcNWXCSvH1sgB) and [events](https://youtube.com/playlist?list=PLJqWcTqh_zKF-gamT-xOEQD7BbrrIGlcH).

<div class="columns" style="margin-top:2em";>

<img src="images/jd-zkvm.png" alt="zkVM performance comparison table" style="width:100%;">

<img src="images/jd-guest.png" alt="Guest program progress tracker" style="width:100%;">

</div>

---

# How will we ship this? In two phases:

 1) **Optional Proofs:** checks proofs and also keep re-executing 
   * Trial period for gathering data, experience, ironing out bugs.
   * Proofs are not required<sup>*</sup> for the network to function.
   * Cannot increase the gas limit because of this.

 2) **Mandatory proofs:** just check proofs
   * Proofs disappear ==> network down.
   * Can increase gas limit because of this.

---


<img src="images/eip-8025.png" alt="EIP-8025 optional proofs specification" style="width:100%;">


---

# Who will ship this?

<div class="columns" style="align-items:center;">
<div>

- zkVM developers
- Ethereum client developers
- EF zkEVM Team
- Justin Drake and EF Ethproofs Team
- EF Snarkification Team
- EF Cryptography Team
- EF EthPandaOps Team
- EF Robust Incentives Group
- EF Security Team
- Grantees

</div>
<div>

<img src="images/eth-act.png" alt="eth-act planning repository" style="width:100%;margin-bottom:0.5em;">

<img src="images/breakout-call.png" alt="EIP-8025 breakout call" style="width:80%;">

</div>
</div>

---

# What do the plans look like?


<img src="images/planning-repo.png" alt="eth-act planning repo issues" style="width:90%;">

---

# Join us on Discord

<img src="images/discord.png" alt="eth-act planning repo issues" style="width:90%;">

---

# Security Roadmap to Optional Proofs

<div style="background:#f0f2f5;border-radius:10px;padding:0.5em;flex:1;display:flex;align-items:center;justify-content:center;"><div data-mermaid="diagrams/roadmap.mmd" style="width:80%;"></div></div>

---

# Phase 1: Set inclusion criteria and launch blockers

<div style="background:#f0f2f5;border-radius:10px;padding:0.5em;flex:1;display:flex;align-items:center;justify-content:center;"><div data-mermaid="diagrams/roadmap-phase1.mmd" style="width:100%;"></div></div>

---


# WIP: [Test Monitoring](https://eth-act.github.io/zkevm-test-monitor/index.html)
<!-- _style: "section { padding: 10px 20px; }" -->

<iframe src="https://eth-act.github.io/zkevm-test-monitor/index.html" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>

---

# WIP: Starter Specs in [Python, Lean](https://github.com/codygunton/pil2-proofman/tree/executable-specs) and [Markdown](https://codygunton.github.io/pil2-proofman/part-stark/full-protocol.html)
<!-- _style: "section { padding: 10px 20px; }" -->

<div style="display:flex;gap:16px;flex:1;align-items:stretch;">
  <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
    <iframe src="https://codygunton.github.io/pil2-proofman/part-stark/full-protocol.html" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;gap:6px;align-items:center;">
    <img src="images/lean-spec.png" alt="ZisK Lean specification code" style="width:100%;object-fit:contain;flex:1;">
  </div>
</div>

---

# Phase 2: Choose zkEVMs

<div style="background:#f0f2f5;border-radius:10px;padding:0.5em;flex:1;display:flex;align-items:center;justify-content:center;"><div data-mermaid="diagrams/roadmap-phase2.mmd" style="width:100%;"></div></div>

---

# Phase 3: Launch @ Hegotá target

<div style="background:#f0f2f5;border-radius:10px;padding:0.5em;flex:1;display:flex;align-items:center;justify-content:center;"><div data-mermaid="diagrams/roadmap-phase3.mmd" style="width:100%;"></div></div>

---

# References

Some eth-act repositories
https://github.com/eth-act/planning
https://github.com/eth-act/zkvm-standards

Optional proofs
https://eips.ethereum.org/EIPS/eip-8025
https://github.com/ethereum/consensus-specs/tree/master/specs/_features/eip8025

Blog posts
https://zkevm.ethereum.foundation/blog/zkevm-security-overview
https://zkevm.ethereum.foundation/blog/cryptography-research-update

---

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

# Thanks for your attention!
<!-- _class: lead -->
<!-- _paginate: false -->
