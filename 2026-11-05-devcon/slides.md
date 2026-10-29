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


# Progress: Security of STARKs

How do we know the cryptography is secure, conditional on standard assumptions?

* verified-ZKEVM/ArkLib ((DOTHIS: link here and for soundcalc)) and friends give a framework for making specs and producing security proofs. Much progress there!
* Circuits are a blackbox here.

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

# Gap: RISC-V Circuit Completeness

Recall this means: every RISC-V step is provable by the ZKVM.

* Ethereum is nothing without liveness, so completeness is critically important.
* We have seen formal proof that a circuit is not complete, i.e. a Lean4 model of a completeness bug.
* This is distinct from the completeness statements are proven as part of clean DSL, that the witness generator produces values that satisfy the constraints. If you don't perfectly model RISC-V semantics, then compilers will produce correct programs that are unprovable.

---

# Gap: Prover Liveness in General

Just like with verifiers, non-circuit bugs, even really silly ones, can crash the network.

* We have no framework for proving safety of CUDA code.
* Rust code around CUDA can panic. Proving panic freeness outside unsafe blocks might be provable using tools such as Aeneas.
* Unsafe Rust abounds, and unsafe code is disproportionately buggy due to being loci of complexity. Much to do to formalize this.
* C++ is also in use.

---


# Gap: STARK and Implementation

How do we know the cryptography is strong, and how do we know that the implementation follows the spec?

* For the signature aggregation in the CL, we can link safe Rust to ArkLib specs.
* For ZKEVMs, we the implementations are in CUDA in large part, and we have no progress.
* We also need arguments for the recursive aggregation -- no progress.

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Guest Programs

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Progress: evm-asm Experiments

As Derek explained an hour ago, there is progress on using Lean to write a guest program and prove compliance statements about it.

* Proving to full compliance out of reach.
* Use of pancake and other foods modularizes the problem using verified compilation.


---

# Progress: Placeholder

I have heard non-specific rumors of progress from other teams. Perhaps I will be able to fill this in based on some Devcon talks before Thursday.

---

# Gap: Specifications

There is no canonical formal specification of Ethereum guest program behavior.

* EL specs ((TODO: LINK)) are in Python which is not suitable for proving. 
* ((TODO: mention competing specs))
* ((TODO: Fill in here or in Tau's parts on how they aren't complete or canonical references)).

---

# Gap: Performance of verifiable code

* We have seen that the raw assembly LLMs write has bad performance by default.
* Verify then optimize might be viable, but the cost profile is unknown.
* Writing directly in Lean requires you can run the interpreter (maybe viable for CPU proving) or compile to a guest (maybe trusting Lean-to-C is ok).


___


# Gap: Source code in systems languages 

For performance, teams generally use systems programming languages such as Rust, C++ or Zig. ((TODO: Redacted comment on another guest claiming good performance; is that public, or will it be by the time we present?)))

* Outside of safe Rust, we can have basic runtime safety concerns.
* There are concerns about the use of bump allocators the possibility of going out of memory in the ZKVMs, which have different memory modelss.
* Need a trusted source-to-fv framework extraction.

---

# Progress: Compiler bugs and runtime safety

Compilers are complex and they contain many bugs. Moreover, We are targeting bare-metal RISC-V, which is a newer target often having less support and testing (e.g., it is lower-tier in Rust).

* Ideal: formally verified compilers and only languages with runtime safety guarantees.
* Realistic: the performance imperative will push us to accept unsafe rust and languages without runtime guarantees.
* Formal verification of the binary is plausible but has not been shown to scale:
  * Naive cost for runtime safety: 800 Lean lines per RISC-V instruction
  * Theorem + Anthropic collaboration: safety in a few dozen lines of Rocq per RISC-V instruction 
  * My own experiment the zesu: 2-3x what Theorem + Anthropic report
* Not enough data on compliance proof sizes or token efficiency.
* No data on the maintenance story.
* Train AIs that are better and/or more token-efficient when writing proofs?

---



<!-- _class: lead -->
<!-- _paginate: false -->

# Part 2: Tau's talk

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>


---


<!-- _class: lead -->
<!-- _paginate: false -->

# Conclusion

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Guidance (scratch section)

We should collab on this. My thoughts for now in a very non-succinct form.
- We should aim for a very high degree of formal assurances before ZKEVMs secure mainnet. That will not happen for several years.
- Verified compilers and frameworks for proving compliance of Rust and possibly other source are coming in the future, likely in time for us.
- Replacing industry strength programming languages and their ecosystems in the name of verification sooner has huge costs that must be weighed.
- FV is not the only way to harden software; testing and auditing are not going away.
- FV should be maintained in CI and we need to establish this invariant and maintain it soon.
- Having a trusted extractor is absolutely acceptable if it reduces the TCB complexity significantly.
- We should be ambitious and we should collaborate.

---


# Thanks for your attention!

<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
