---
marp: true
lang: en-US
title: Towards Formally Verified zkEVMs
theme: zkevm-dark
transition: fade
paginate: true
_paginate: false
---

<!-- _class: lead -->

<script src="assets/theme-bg-light.js"></script>
<script src="assets/sparkles-light.js"></script>
<script type="module" src="assets/mermaid-zkevm-light.js"></script>

# Towards Formally Verified zkEVMs

Cody Gunton & TauLeptop - Devcon, November 5, 2026

https://codygunton.github.io/talks-and-writing/2026-11-05-devcon/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Takeaways first

* We should strive to make perfectly secure ZKEVMs.
* AI does not make this easy or guarantee it will happen.
* The community has learned a lot,  but we still do not have a clear path to make ZKEVMs that are simultaneously:
  * High performance (real time proving on a small number of GPUs);
  * High assurance (high degree of coverage by formal verification); 
  * Maintainable (the formal proofs are robust invariant in CI).

---

# Prerequisites

I will assume you are familiar with ZKEVM terminology and basics of how these will be used to scale L1.

If this is not you, have a look at my talk: ((DOTHIS: insert link))

---

<!-- _class: lead -->
<!-- _paginate: false -->

# ZKVMs (RISC-V ones)

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# ZKVMs: The Dream Statement

For any program compiled for the ZKVM, and for any valid inputs to the program, a verifier will accept a proof of execution for that program if and only if the prover supplied the RISC-V spec-compliant execution trace of that program.

* Completeness: the "if" part
* Soundness: the "only if" part

---

# Progress: Soundness of RISC-V circuits

We have highly-conditional proofs of the form: "if a ZKVMs circuits accept a machine step, then the machine step was valid according to the RISC-V spec".

* Exmples: sp1-fv, openvm-fv, pico-fv, zisk-fv ((DOTHIS: make each of these a link))
* Many serious bugs have been caught in the process of making these.

---

# Gap: Soundness of accelerator circuits

No ZKVM has viable performance without dedicated circuits for certain heavy computations (modular arithmetic and Keccak, in paticular).
* openvm-fv has coverage of some hashing precompiles
* Otherwise this is a large gap

---

# Gap: Recursion

All ZKVMs use recursive verification to collect proofs generated in parallel and compress them to a final smallish proof.
* The intermediate steps typically use different circuits and possibly even different proving STARKs (exception: Airbender).
* The "spec" is no longer the RISC-V spec, but rather a spec for an intermediate STARK verifier. No canonical spec, hence less assurance. (ArkLib can help).

---

# Gap: The Verifier

No team has a formally verified verifier
* The verifier is more than just the circuits. 
  * How do we know it uses the whole proof?
  * How do we know it doesn't just skip some AIR expression?
  * How do we know that there is not a Fiat-Shamir bug?
* We don't want to fv the hard mathy stuff and get owned by some 'easy' logic being wrong.
* The lack of a canonical spec, mentioned in relation to recursion, also applies here.


---

# Gap: RISC-V circuit completeness

Recall this means: every RISC-V step is provable by the ZKVM.

* Ethereum is nothing without liveness, so completeness is critically important.
* We have seen formal proof that a circuit is not complete, i.e. that the ZKVM could halt the network.
* This is distinct from "

---

# Thanks for your attention!

<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
