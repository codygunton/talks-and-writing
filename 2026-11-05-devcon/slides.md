---
marp: true
lang: en-US
title: Toward Formally Verified zkEVMs
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

Cody Gunton - Devcon 8, November 5, 2026

https://codygunton.github.io/talks-and-writing/2026-11-05-devcon/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# ZKEVM, with an E

* There is a lot of talk of FV and ZK here. 
  * My focus: proofs of block execution for L1 scaling
  * There are many general takeaways
* A word on EIP-8025
  * Deprioritized by ACD, but there seems to be long-term support.
  * Tony paraphrase: Ethereum only has capacity for about 10% of Mumbai.


---

# Takeaways first

* We should strive to make perfectly secure ZKEVMs.
* AI does not make this easy or guarantee it will happen.
* The community has learned a lot, but we still do not have a clear path to make ZKEVMs that are simultaneously:
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

# Specifications for executables in ZKVMs

The RISC-V community maintains a formal specification, its [Sail model](https://github.com/riscv/sail-riscv).

* Sail has backends to Lean, Rocq, C, SystemVerilog, and several other languages, so we can test the spec and also verify against it.
* This means we can test compliance of RISC-V ZKVMs

---

# ZKVMs: The Dream Statement

For any program compiled to RISC-V for execution in the ZKVM, and for any valid inputs to the program, a verifier will accept a proof of execution for that program if and only if the prover supplied the RISC-V spec-compliant execution trace of that program.

* Completeness: the "if" part
* Soundness: the "only if" part

<!-- --- -->
<!---->
<!-- # Specifications for ZKVM executables -->
<!---->
<!-- Other ISAs have open formal specifications too, but they reach Sail by translation rather than being written in it. -->
<!---->
<!-- - Arm: Arm publishes its spec in its own language, [ASL](https://developer.arm.com/downloads/-/exploration-tools). [sail-arm](https://github.com/rems-project/sail-arm) is generated from it and builds to Lean and Rocq. -->
<!-- - x86: no vendor spec. [sail-x86-from-acl2](https://github.com/rems-project/sail-x86-from-acl2) is generated from the academic [ACL2 x86isa model](https://github.com/acl2/acl2/tree/master/books/projects/x86isa). -->

---

# Progress: Soundness of RISC-V circuits

We have highly-conditional proofs of the form: "if a ZKVMs circuits accept a machine step, then the machine step was valid according to the RISC-V spec".

* Exmples: sp1-fv, openvm-fv, pico-fv, zisk-fv ((DOTHIS: make each of these a link))
* Many serious bugs have been caught in the process of making these.

---

# Gap: Standards compliance

zkVMs must also follow the [zkevm-standards](https://github.com/eth-act/zkevm-standards/) that go beyond the ISA: accelerator interface, accelerated memory operations, I/O, Termination Semantics.

* Today compliance with these is only tested ([riscv-arch-test](https://github.com/riscv-non-isa/riscv-arch-test), [zkevm-test-monitor](https://github.com/eth-act/zkevm-test-monitor/)), not formally verified.
* Tests catch a lot, but they are not proofs. Closing this gap is future work.

---

# Gap: Soundness of accelerator circuits

No ZKVM has viable performance without dedicated circuits for certain heavy computations (modular arithmetic and Keccak, in paticular).

* openvm-fv has coverage of some hashing precompiles
* Otherwise this is a large gap
* A zkVM is only as secure as its weakest component.

---

# Progress: Security of cryptographic protocols

How do we know the cryptography is secure, conditional on standard assumptions?

* [Verified-zkEVM/ArkLib](https://github.com/Verified-zkEVM/ArkLib) and friends give a framework for making specs and producing security proofs. Much progress there!
* This is the soundness of the composite crytographic protocol
* Soundcalc ((TODO: link to reports)) 😬
https://github.com/ethereum/soundcalc/tree/main/reports

---

# Gap: Recursion

All ZKVMs use recursive verification to collect proofs generated in parallel and compress them to a final smallish proof.

* The intermediate steps typically use different circuits and possibly even different proving STARKs (exception: Airbender).
* The "spec" is no longer the RISC-V spec, but rather a spec for an intermediate STARK verifier. No canonical spec, hence less assurance. (ArkLib can help).
* Theory caveat: recursion runs Fiat-Shamir inside a circuit, and our security arguments are limited by our ability to reason about Fiat-Shamir in circuits.

---

# Gap: The Verifier

No team has a formally verified verifier implementation

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

* For the signature aggregation in the CL, we can link safe Rust to ArkLib specs (e.g., using [Aeneas](https://github.com/AeneasVerif/aeneas)).
* For ZKEVMs, the implementations are to a large degree implemented in CUDA, and the community has made no progress on verifying them.
* We also need arguments for the recursive aggregation -- no progress.

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Guest Programs

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Specifications for guest programs

The canonical guest spec is Python: [`stateless_guest.py`](https://github.com/ethereum/execution-specs/blob/3ebcb5d02126918eb2aad599b3cf286200d4f458/src/ethereum/forks/amsterdam/stateless_guest.py) in execution-specs, the normative reference for [EIP-8025](https://eips.ethereum.org/EIPS/eip-8025).

* Same state transition as a normal EL client, plus a thin stateless wrapper (~500 lines).
* Inputs are the payload from the CL plus a witness: trie nodes, bytecode and recent headers, all checked by hash.
* Not suitable for formal proving.

---

# Guest programs: The Dream Statement

For every `StatelessInput`, the behavior of the guest program agrees with the behavior of the canonical spec in the ethereum/execution-specs.

---

# Progress: evm-asm Experiments

As Derek explained an hour ago, there is progress on using Lean to write a guest program and prove compliance statements about it.

* Proving to full compliance out of reach.
* Use of pancake and other foods modularizes the problem using verified compilation.


---

# Gap: Specifications

There is no canonical formal specification of Ethereum guest program behavior.

* EL specs ((TODO: LINK)) are in Python which is not suitable for proving.
* [evm-sail](https://github.com/frisitano/evm-sail): an experimental EVM spec in Sail, the same language as the RISC-V spec from earlier, so it gets the same Lean backend.
* ((TODO: mention competing specs))
* ((TODO: Fill in here or in Tau's parts on how they aren't complete or canonical references)).

---

# Gap: Performance of verifiable code

* We have seen that the raw assembly LLMs write has bad performance by default.
* Verify then optimize might be viable, but the cost profile is unknown.
* Writing directly in Lean requires you can run the interpreter (maybe viable for CPU proving) or compile to a guest (maybe trusting Lean-to-C is ok).


---


# Gap: Source code in systems languages

For performance, teams generally use systems programming languages such as Rust, C++ or Zig. ((TODO: Redacted comment on another guest claiming good performance; is that public, or will it be by the time we present?)))

* Outside of safe Rust, we can have basic runtime safety concerns.
* There are concerns about the use of bump allocators the possibility of going out of memory in the ZKVMs, which have different memory modelss.
* Need a trusted source-to-fv framework extraction.

---

# Gap: Compiler Bugs and Runtime Safety

Another approach: formally verified compilers and only languages with runtime safety guarantees.

* There is a certified C compiler, CompCert, but it's not FOSS.
* There is a certified compiler for a language called pancake 
  * Low level, potentially good performance, but there's no runtime safety guarantee.
  * [stateless-pancaketh](https://github.com/flamingoponderado/stateless-pancaketh), is a guest, the successor to evm-asm
  * There is no compliance proof; evm.fast is proving relative improvements from a fixed implementation.

---

# Gap: Compiler Bugs and Runtime Safety (cont'd)

* Verified rustc?: Rust uses LLVM, big complicated compiler toolchain. 
  * There is a long-term project [VeIR](https://github.com/opencompl/veir) to make a universal verified compiler toolkit.
* Verified cranelift? 
  * A much simpler compiler of a (large) subset of rust with ~15% performance penalty.  
  * Some of us at the EF have unbridled slop project to get a baseline verified Rust compiler ASAP https://github.com/eth-act/clifv
  * Lean implementation with 41% of test (in ARM) objects compiling to the same bytecode as stock cranelift.
  * Three compiler bugs reported.
  * No bare-metal RISC-V support... yet 😈

---

# Gap: Compiler bugs and runtime safety (cont'd)

We can't expect everyone write everything in pancake or safe rust.

* Formal verification of the binary is plausible but has not been shown to scale:
  * Naive cost for runtime safety: 800 Lean lines per RISC-V instruction
  * Theorem + Anthropic collaboration: safety in a few dozen lines of Rocq per RISC-V instruction
  * My own experiment the zesu: 2-3x what Theorem + Anthropic report
* leanVM's aggregation guest has an advanced-stage binary verification under assessment. Seems that read only memory is a big simplification.
* Not enough data on compliance proof sizes or token efficiency.
* No data on the maintenance story in general.

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

# Come build with us: PRs welcome

((DOTHIS: confirm list, add anything Tau wants here))

* [zisk-fv](https://github.com/eth-act/zisk-fv): formal verification of ZisK's RISC-V circuits
* clifv
* [zkevm-standards](https://github.com/eth-act/zkevm-standards/): standards for zkVMs used by Ethereum

---

# Thanks for your attention!

<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
