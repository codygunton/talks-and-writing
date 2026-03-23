---
marp: true
lang: en-US
title: EPF Study - zkEVMs
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

# EPF Study Group #3: zkEVMs

Cody Gunton and Ignacio Hagopian - March 25, 2026

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

<!-- _class: lead -->

# Introduction

---

# Outline

TODO: create four bullet point outline

---

# Goal of introducing zkEVMs

Allow the EVM to execute more compute per block while keeping the work done by the consensus network small to censorship resitance.

---

# Attester Requirements Today

An attester must re-execute every transaction and attest **within ~4s of slot start**.

 * **CPU:** 8 cores / 16 threads (PassMark: ~3500 ST, ~25000 MT)
 * **RAM:** 64 GB
 * **Storage:** 4 TB NVMe (500 MB/s seq, 50K read IOPS)
 * **Bandwidth:** 50 Mbps down / 25 Mbps up
 * As blocks get bigger, this time pressure is the bottleneck

See: [EIP-7870](https://eips.ethereum.org/EIPS/eip-7870)

---

# The Scaling Problem

If we allow more transactions in a block, eventually we exhaust the following attester resources:
 * bandwidth: the transactions don't in time 
 * compute: the transactions can't be processed quickly enough
 * state: the amount of storage used grows faster
   * solutions to the problem of state growth needed faster

<!-- TODO: find a recent link from cperezz about the threshold where state size starts to degrade performance -->

---

# ZKVM Prover-Verifier Asymmetry

<div class="no-marker">

zkVMs create a powerful asymmetry:
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

# Optional vs Mandatory Proofs

 1) **Optional Proofs:** checks proofs and also keeps re-executing
   * Trial period for gathering data, experience, ironing out bugs.
   * Proofs are not required for the network to function.
   * Cannot increase the gas limit because of this.

 2) **Mandatory proofs:** just check proofs
   * Proofs disappear ==> network down.
   * Can increase gas limit because of this.

---

# The Space Race

When I entered the space in 2021, I was told that ZKEVM's were a pipe dream.

The possibility of proving Ethereum execution lead to huge investment in ZK tech that rapidly advanced the field.

Now we're there™

<iframe src="https://ethproofs.org/" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>

---

<!-- _class: lead -->

# ZKVMs

---

# SNARK and other words


**SNARK** (Succint Non-interactive Argument of Knowledge): a logical argument that allows one party (a Prover) to convince another party (a Verifier) that they (the Prover) did the work of executing a particular computation
  * hazy terminology: SNARK, SNARK protocol, SNARK proof

**ZKSNARK**: a SNARK where the Prover keeps some details of the computation private
  * requires extra engineering and computation; these are not widely in use yet

**(ZK)STARK**: T = Transparent; used for systems without a certain trust assumption

**ZK**: a term abused to to refer to the use of SNARKs in general

**ZKVM**: a particularly flexible approach to implementing SNARKs  

---

# How It Started

<!-- See Justin Thaler's "Proofs, Arguments, and Zero-Knowledge" for a thorough treatment -->

 * **1985** -- Goldwasser, Micali, Rackoff define zero-knowledge proofs
 * **1992** -- Sumcheck protocol (Lund, Fortnow, Karloff, Nisan)
 * **2008-2010** -- Groth's pairing-based SNARK work; KZG polynomial commitments (Kate, Zaverucha, Goldberg)
 * **2013** -- Pinocchio: first nearly-practical zk-SNARK for general computation
 * **2014** -- [Zerocash paper](https://eprint.iacr.org/2014/349) (Ben-Sasson, Chiesa et al.); **2016** -- Zcash launches with Groth16
 * **2018-now** -- FRI & STARKs (Ben-Sasson et al.), PLONK (Gabizon, Williamson, Ciobotaru)
 * **2020-now -- Now** Cairo/StarkWare (2020) → RISC Zero (2021, first RISC-V zkVM) → Polygon zkEVM & zkSync Era (2023, first zkEVM mainnets)

https://youtu.be/lv6iK9qezBY?si=iWXDOSfVfYDE2eYC
https://blog.lambdaclass.com/our-highly-subjective-view-on-the-history-of-zero-knowledge-proofs/
https://mfaulk.github.io/2024/10/28/evolution-of-snarks.html
https://ethresear.ch/t/accumulators-scalability-of-utxo-blockchains-and-data-availability/176
https://blog.ethereum.org/2016/12/05/zksnarks-in-a-nutshell

---

# Interactive Proof System

There are two parties, Prover and Verifier
 - They agree on a computation. V wants to be convinced that P did the computation.
 - P writes down every step of the computation.
 - They exchange messages. The set of P messages = the proof.

Typical part of the exchange:
 - V: "use this random number I chose to do some math and send me the result. I'll check the result satisfies this formula."
 - P: "hm, even if I had all of the computers in the world, the only way I know of to make a result value that satisfies the formula is to be honest, so I guess I'll do that."

---

# Non-interactive Proof System

Goal: avoid P and V having to communicate over a network;

Solution: P uses an out-of-control function (hash function) to produce challenge values rather than asking V for random values.

Before and after: TODO two tables

---

# Skeleton of a SNARK: The Program

P and V agree on the computation -- what does that mean?

Proof systems argue about computations given in special, low-level languages describing **arithmetic circuits**.
 * Traditional paradigm: everything is built up from logical operations like AND, NOT, OR, XOR, etc. 
 * Arithmetic circuits: everything is built up from arithmetic operations like +, *, -.

There exist special language for writing programs for SNARKS
 * e.g.: circom, Noir, DOTHIS: add more 
 * tooling is very fragmented (more on this :wink:)

---

# Skeleton of a SNARK: Proving

1) **witness generation**: execute the program, saving all intermediate values in a "witness", a collection of polynomials
2) **commitment computation**: create a binding fingerprint of the witness data using a polynomial commitment scheme
3) **reduction**: reduce checking the logic of each step in the computation is valid to check that logic "at a random point" is valid
4) **spot checking**: check the logic "at a random point" is valid
5) **PCS opening**: use the commitments to argue that the "random points" came from the witness

---

# Skeleton of a SNARK: Proving

1. **witness generation**: expensive serial bottleneck; returns polynomials (univariate or multilinear)
2. **commitment computation**: FRI-based or WHIR-based; KZG; Hyrax 
3. **reduction**: quotient argument; sumcheck
4. **spot checking**: evaluate the constraints at a random evaluation of the witnesses
5. **PCS opening**: checking Merkle proofs and FRI folding steps; computing an elliptic curve pairing.

---

# Putting This Into Practice: Generalities

Different applications have different requirements. Design space:

- How do we write programs for proving them?
- Does the application need privacy?
- Where will the program be proven?
  - Memory constraints?
  - Compute constraints?
- Where will the program be verified?
  - Bandwidth constraints on proof size?

---

# Putting This Into Practice: ZKVMs

Goal: 
 - allow developers to write programs using normal programming languages such as Rust or C++ or Go or Java.
 - unlock robust, maintainable systems
 - rely on widely use compiler infrastructure

Reality: 
 - huge success overall for Ethereum applications
 - only Rust and C++ work well and programmers still have to "target zk"
 - Go support is improving significantly in recent weeks


---

# RISC-V

Computers have different architectures. Common ones are x68_64 and ARM. Open standard gaining traction: RISC-V.

TODO: insert RISC-V diagram including caveat from Denver slide


---

# Show the picture again

<!-- What is recursion in this context and why does it matter -->

---

# Two-Column Example

<div class="columns">
<div>

* Left column point A
* Left column point B

</div>
<div>

* Right column point A
* Right column point B

</div>
</div>

---

# Iframe Example

<iframe src="https://codygunton.github.io/pil2-proofman/" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>

---

# Screenshot Example

<img src="assets/act4.webp" alt="ACT4 test monitor" style="width:100%;border-radius:6px;">

---

# Thanks for your attention!
<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
