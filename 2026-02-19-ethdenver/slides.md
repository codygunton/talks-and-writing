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

# Progress on zkEVM Scaling

https://codygunton.github.io/talks-and-writing/2026-02-19-ethdenver/

<img src="images/qr-slides.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Before & After

DOTHIS: combine this slide and the next one using a two-column layout with the text on the left and the diagrams on the right. The right column should be wider than the left

Before: Re-execution: Every attester receives a block and executes all of the transactions in it to update their copy of the Ethereum state.

After: Every attester receives a block hash and verifies a proof that a state root update is valid.




---

# More specific diagrams

<div style="display:flex;justify-content:center;"><div data-mermaid="diagrams/zkvm-prover-riscv.mmd" style="width:60%;"></div></div>

<div style="display:flex;justify-content:center;"><div data-mermaid="diagrams/zkvm-verifier-riscv.mmd" style="width:60%;"></div></div>

<div class="no-marker">

* ⚠️ I am not talking about replacing the EVM with a RISC-V machine here ⚠️

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

 1. Optional Proofs: checks proofs and also keep re-executing 
   - Trial period for gathering data, experience, ironing out bugs.
   - Proofs are not required for the network to function DOTHIS: insert footnote superscipt 1.
   - Cannot increase the gas limit because of this.

 2. Mandatory proofs: just re-execute
   - Proofs disappear ==> network down.
   - Can increase gas limit because of this.

---


<img src="images/eip-8025.png" alt="EIP-8025 optional proofs specification" style="width:100%;">

DOTHIS: insert screenshots from https://github.com/ethereum/consensus-specs/tree/master/specs/_features/eip8025

---

# Who is shipping this?

<div class="columns" style="align-items:center;">
<div>

- zkVM teams
- Ethereum client devs
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

<img src="images/planning-repo.png" alt="eth-act planning repo issues" style="width:100%;">

---

<!-- _paginate: false -->
<!-- _style: "section { padding: 10px 20px; }" -->

<div data-mermaid="diagrams/roadmap.mmd" style="display:flex;align-items:center;justify-content:center;width:100%;flex:1;"></div>

DOTHIS: add three slide sbelow here, one for each of the milestones. Each one should contain a sub-gantt chart of the bigger gantt chart.

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
