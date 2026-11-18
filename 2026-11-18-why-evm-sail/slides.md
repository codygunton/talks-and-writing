---
marp: true
lang: en-US
title: Why evm-sail?
description: A draft case for one shared, executable EVM specification
theme: zkevm-dark
transition: fade
paginate: true
_paginate: false
style: |
  section table { font-size: 0.65em; }
  section pre { font-size: 0.64em; }
---

<!-- _class: lead -->

<script src="assets/theme-bg-light.js"></script>
<script src="assets/sparkles-light.js"></script>
<script type="module" src="assets/mermaid-zkevm-light.js"></script>

# Why evm-sail?

Cody Gunton · 18 November 2026

Draft

https://codygunton.github.io/talks-and-writing/2026-11-18-why-evm-sail/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Why evm-sail?

My dream:

  - One canonical EVM specification with broad, collective ownership.

It should work for:
- Verification that EVM implementations comply with the specification.
- Differential testing.
- Client dev collaboration.
- Smart contract verification.

---

# Why not something else?

My anti-goals:

- A patchwork of specifications connected by equivalence theorems.
  - Who maintains those theorems as Ethereum changes?
  - Which specification defines correct behavior?
- Lock-in to Lean or any other tool.
- A bunch of little experiments.

---

# Why Sail? Existing use and maintenance

- Maturity:
  - Developed since 2013; 122 Github contributors
  - Used for RISC-V specification since 2019
- Maintenance: clear maintainer [Alasdair Armstrong](https://github.com/Alasdair)
- Flexibility: Sail is a language, not a library.
  - Minimal abstractions: registers, bitvectors, numeric constraints, and mappings.
  - Extractability: restricted programs and explicit effects support fv
  - Many backends: can extract to C, Lean, Rocq, Isabelle, HOL4, SystemVerilog

<!-- Sources: https://alasdair.github.io/manual.html ; https://www.cl.cam.ac.uk/users/pes20/sail/sail-popl2019.pdf . Backends differ in supported features and required host definitions. Extraction does not establish translator correctness. -->

---

# Sail example: registers

Actual declarations in evm-sail:

```sail
register pc : code_pointer = 0
register gas_remaining : gas = GAS_ZERO
```

- A register is a named, typed location in persistent state.
- Sail recognizes register reads and writes as effects.
- Prover backends translate those effects into explicit state operations.

The model defines sequencing, reset, and architectural behavior.
evm-sail also passes state values explicitly between opcode handlers.

<!-- Source: evm-sail d0e4aab, sail/evm/machine.sail and sail/evm/execute.sail. Registers are authoritative at frame boundaries. -->

---

# Sail example: dependent bitvector types

Illustrative Sail code:

```sail
val join : forall 'n 'm, 'n >= 0 & 'm >= 0.
    (bits('n), bits('m)) -> bits('n + 'm)

function join(x, y) = x @ y
```

The result width depends on the input widths.
Sail checks that concatenation satisfies the declared type.

evm-sail instead represents EVM words as bounded integers:

```sail
type word = range(0, 2 ^ 256 - 1)
```

<!-- The join example is illustrative, not copied from evm-sail. The word declaration is from sail/prelude.sail at d0e4aab. Bounded integers do not wrap automatically; the model defines modular arithmetic. -->

---

# Proving friendliness: deliberate restrictions

| Feature | Python permits | Sail restriction |
|---|---|---|
| Runtime code | `eval`, `exec` | No equivalent runtime source execution |
| Types | Dynamic reassignment | Static checks on types and assignments |
| Object structure | Added attributes, replaced methods | Declared data structures; no dynamic class system |
| Reflection | Inspection of objects and frames | No comparable general runtime reflection |
| Functions | Closures and arbitrary function arguments | Principally first-order functions |
| Mutable graphs | Shared references and cycles | No general Python-style mutable reference model |
| External operations | Arbitrary libraries | Declared interfaces need target-specific meanings |

A restricted Python subset can also support translation.
Sail supplies a restricted language and existing translation infrastructure.

<!-- Source: Sail POPL 2019 paper and manual. These are core-language distinctions, not a claim that every accepted Sail program translates through every backend. Sail still supports mutation, exceptions, loops, and recursion. -->

---

# Contract verification: build the reasoning layer

evm-sail supplies executable instruction semantics.
Contract proofs need additional tools:

- Per-opcode step lemmas that avoid unfolding the interpreter.
- A program logic for stack, memory, storage, jumps, and calls.
- Models for unknown calls, adversarial behavior, and reentrancy.
- Symbolic execution built on those rules.

**The notes identify step lemmas, program logic, and automation as the largest remaining work.**

<!-- Source: EVM_SAIL_VERIFICATION_NOTES.md, section 6, written 17 November 2026 against evm-sail d0e4aab. This is the notes' assessment, not a new completeness audit. The notes classify the 274 shipped Coq/Lean lemmas as infrastructure rather than bytecode reasoning. -->

---

# Contract verification: connect the interfaces

- Prove bitvector views equivalent to the bounded-integer word operations.
- Preserve range facts in prover output, or generate proved bound lemmas.
- Add gas abstractions with sound bounds and omission rules.
- Connect Solidity/Vyper source maps, storage layout, and ABI conventions.
- Maintain a complete translated model in the chosen proof stack.

The precise executable core can remain the shared reference.
Derived reasoning tools should connect back to that core.

<!-- Source: EVM_SAIL_VERIFICATION_NOTES.md, section 6. The pinned Coq output erases range bounds; the notes also report a Rocq 9 versus Coq 8.19 compatibility boundary. Lean has a separate extraction. These observations do not imply that no full-model Lean build exists. -->
