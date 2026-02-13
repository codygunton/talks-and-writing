---
marp: true
lang: en-US
title: Progress on zkEVM Scaling
theme: zkevm
transition: fade
paginate: true
_paginate: false
---

<!-- _class: lead -->

<script src="assets/theme-bg.js"></script>
<script src="assets/sparkles.js"></script>
<script src="assets/livereload.js"></script>

# Progress on zkEVM Scaling

https://codygunton.github.io/talks-and-writing/2026-02-13-ethboulder/

<img src="images/qr-slides.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm.svg" class="logo" alt=""></div>

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

# In Diagrams

<div class="no-marker">

- A program running in a virtual machine:
  <div style="display:flex;justify-content:center;"><div data-mermaid="diagrams/program.mmd" style="width:40%;"></div></div>
* <div class="columns"><div>A zkVM prover runs the program and produces a proof:<div data-mermaid="diagrams/zkvm-prover.mmd" style="width:100%;"></div></div><div>A zkVM verifier checks the proof without re-running the program:<div data-mermaid="diagrams/zkvm-verifier.mmd" style="width:100%;"></div></div></div>

</div>

<script type="module" src="assets/mermaid-zkevm.js"></script>

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

# How will we ship this?

 * Optional Proofs: client software ships with a flag that enables an extra step to deal with proofs and their verification, while still doing re-execution. 
   - Trial period for gathering data, experience, ironing out bugs.
   - Proofs are not required for the network to function unless a large % of people opt out of re-execution.
   - Cannot increase the gas limit because of this.

 * Mandatory proofs
   - Proofs disappear ==> network down.
   - Can increase gas limit to where re-execution would fail to keep up with the chain on current attester hardware.

---


<img src="images/eip-8025.png" alt="EIP-8025 optional proofs specification" style="width:100%;">

---

# Who is shipping this?

<div class="columns" style="align-items:center;">
<div>

- zkVM teams
- Core devs (EL and CL) and newer guest program teams
- EF zkEVM Team
- Justin Drake and EF Ethproofs Team
- EF Snarkification Team
- EF Cryptography Team
- EF EthPandaOps Team
- EF Robust Incentives Group
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

---

<!-- _class: lead -->
<!-- _paginate: false -->

# A deeper look at some specification initiatives

---

# What exactly are we putting in the protocol?

<div class="no-marker";>

- ZK is a fast-moving field and teams mostly do not have specs of their proving systems.

* Core papers exist, but production systems differ in many ways, big and small.

* Some core questions we must answer:
  - Is the zk protocol behind {zkVM} secure?
  - Does {zkVM} implement its protocol correctly?
  - Does {zkVM} implement RISC-V correctly?
  - Does {guest program} implement the EVM correctly?

</div>

---

# Is the zk protocol behind {zkVM name} secure?
<div class="no-marker" style="margin-top:-1em";>

* _Soon:_ [Whitepapers](https://zkevm.ethereum.foundation/blog/cryptography-research-update)
  Purpose: Researchers will provide formal guarantees of security.

* _Later:_ [Arklib](https://github.com/Verified-zkEVM/ArkLib) specs in Lean by https://verified-zkevm.org/ 
  Purpose: Unambiguous formal description specification; formal verification engineers will make machine-assisted proofs of security claims.

</div>

# Does {zkVM name} implement its protocol correctly?

<div class="no-marker" style="margin-top:-1em";>

* _Soon:_ Auditing
  Purpose: Auditors will check that the implementations match the specs.

* _Later:_ Formal proving
  Purpose: Formal verification engineers will show that a translation of the implementation to Lean matches the Lean spec using machine-assisted proving.

</div>

---

# Does {zkVM name} implement RISC-V correctly?

<div class="columns" style="align-items:center;flex:1;align-content:center;">
<div class="no-marker";>

  * _Done:_ [Sail spec](https://github.com/riscv/sail-riscv) already written before Ethereum community interest.
    Purpose: Describe a consistent set of rules for the operation of a computer. Reminder: this is the virtual computer that runs the EVM inside of a prover.
  * _Later:_ Machine-assisted proofs that the zkVMs correctly implement RISC-V.


</div>
<div class="no-marker";>

* <img src="images/openvm-riscv-fv.png" alt="OpenVM RISC-V formal verification" style="width:100%;">

</div>
</div>

---

# Does {guest program} implement the EVM correctly?
<div class="no-marker";>

  * _Now:_ Formal specifications of the EVM.
    Purpose: Describe the EVM in precise terms suitable for formal reasoning.
  * _Now:_ Testing against this spec.
  * _Later:_ Machine-assisted proofs that the guest programs correctly implement the EVM.

</div>

---

# Accelerating with AI

<div class="columns" style="align-items:center;flex:1;align-content:center;">
<div>

Experiment: ZisK prover & verifier (C++ & CUDA) --> Python then simplify
Reinforced by real tests
⚠️Not a "spec" until the ZisK team says it reflects their intentions ⚠️

</div>
<div>

<img src="images/python-spec.png" alt="ZisK Python specification code" style="width:100%;">

</div>
</div>

---

# Accelerating with AI

<div class="columns" style="align-items:center;flex:1;align-content:center;">
<div>

Experiment: Simplified Python verifier --> Lean
Reinforced by 'the same' tests; no machine proofs yet
⚠️Also not a "spec" until the ZisK team says it reflects their intentions ⚠️

</div>
<div>

<img src="images/lean-spec.png" alt="ZisK Lean specification code" style="width:100%;">

</div>
</div>

---

# Accelerating with AI

<div class="columns" style="align-items:center;flex:1;align-content:center;">
<div>

Experiment by Alex Hicks: see if AI can autonomously provide a formal machine proof of a significant lemma relating to error correcting codes.

Result: it can in 8 hours and at little cost.

</div>
<div>

<img src="images/polishchuk-spielman.png" alt="AI-generated formal proof of Polishchuk-Spielman theorem" style="width:100%;">

</div>
</div>

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

ZisK spec experiment
https://github.com/codygunton/pil2-proofman/tree/python-spec

---

<div class="bottom-bar"><img src="assets/logo-zkevm.svg" class="logo" alt=""></div>

# Thanks for your attention!
<!-- _class: lead -->
<!-- _paginate: false -->
