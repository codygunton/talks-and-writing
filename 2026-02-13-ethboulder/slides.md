---
marp: true
lang: en-US
title: Progress on zkEVM Specs
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


Cody Gunton - EthBoulder 2026

<div class="bottom-bar"><img src="assets/logo-zkevm.svg" class="logo" alt=""></div>

---
# Outline



---

# zkVMs create a powerful asymmetry

A network of 
 - low power nodes (verifiers) 

can check the work of 
 - powerful nodes (provers) 

using only a 
  - very small amount of data (tree roots and a proof).

---

# How will we benefit form that asymmetry?

Our application is Ethereum attesting. 

We will:
 - Add powerful entities to produce proofs
 - Increase throughput of the network
 - Attester requirements can stay low

---

<div class="no-marker">

# zkVMs 🤝 L1

* A program running in a virtual machine (e.g., could be the EVM or a RISC-V emulator):
  <div style="display:flex;justify-content:center;"><div data-mermaid="diagrams/program.mmd" style="width:40%;"></div></div>
* <div class="columns"><div>A zkVM prover runs the program and produces a proof:<div data-mermaid="diagrams/zkvm-prover.mmd" style="width:100%;"></div></div><div>A zkVM verifier checks the proof without re-running the program:<div data-mermaid="diagrams/zkvm-verifier.mmd" style="width:100%;"></div></div></div>

</div>

<script type="module" src="assets/mermaid-zkevm.js"></script>

---

# zkEVM = zkVM + Guest Program

There are many candidates zkVMs and there are many candidate "guest programs" (i.e., the transaction checking programs that need to be proved).

Justin Drake tracks these carefully and presents at Ethproofs [calls](https://youtube.com/playlist?list=PLJqWcTqh_zKGthi2bQDVOcNWXCSvH1sgB) and [events](https://youtube.com/playlist?list=PLJqWcTqh_zKF-gamT-xOEQD7BbrrIGlcH)

<div class="columns" style="margin-top:2em";>

<img src="images/jd-zkvm.png" alt="zkVM comparison" style="width:100%;">

<img src="images/jd-guest.png" alt="Guest program tracker" style="width:100%;">

</div>

---

# How will we do it?

Two phases:
 - Optional Proofs: client software ships with a flag that enables an extra step to deal with proofs and their verification, while still doing the usual transaction execution work. 
   - Trial period for gathering data, experience, ironing out bugs.
   - Proofs are not required for the network to function unless a large % of people opt out of re-execution.
   - Cannot increase the gas limit.
 - Mandatory proofs
   - Proofs disappear ==> network down
   - Can incrase gas limit to where re-execution would fail on current attester hardware.

---


<img src="images/eip-8025.png" alt="zkVM comparison" style="width:100%;">

---

# Timelines

Insert Strawmap if published in time
Insert gantt on next slide
Breakout call
Possible interop later in the year

---

# Who is building this?

The various teams and stakeholders
eth-act, planning repo

---

# Specifications

The [consensus clients specs](https://github.com/ethereum/consensus-specs) need to reflect the 

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Details

https://eips.ethereum.org/EIPS/eip-8025
https://github.com/ethereum/consensus-specs/tree/master/specs/_features/eip8025
Link to my blog post

<div class="bottom-bar"><img src="assets/logo-zkevm.svg" class="logo" alt=""></div>
