---
marp: true
lang: en-US
title: ZisK-FV Handoff
theme: zkevm-light
transition: fade
paginate: true
_paginate: false
---

<!-- _class: lead -->

<script src="assets/theme-bg-light.js"></script>
<script src="assets/sparkles-light.js"></script>
<script type="module" src="assets/mermaid-zkevm-light.js"></script>
<script src="assets/timer.js"></script>

# zisk-fv Handoff Meeting 1

Cody Gunton - September 21, 2026

https://codygunton.github.io/talks-and-writing/2026-09-21-zisk-fv-handoff/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---
# Scratch/todo

- why aeneas_extract
- next steps: v0.18.0; bug fixes; improvements (issues but also things like clean as first class)
- trust gate
- write up clean
- proposed plan to continue the work
- double check dep graph issue
- update readme etc form presentation
- in-scope and out-of-scope AIRs
- testing

---

# Agenda


---

# High-level: what is this?

This is a lean proof of RISC-V circuit *soundness*: if a trace satisfies the constraints, then the trace is a valid RISC-V execution trace.
(*completeness* would say: every valid RISC-V execution trace is accepted; afaik nobody proves this but I have some initial WIP in the repo)

---

# High-level: stats

Lean4 version: IOU
Number of lines of Lean: IOU
Number of commits:
Build on [IOU machine spec]: IOU minutes to extract (mem: IOU); IOU minutes to prove soundness theorem (mem: IOU)
Tokens consumed:
IOU LOC activity graph showing when I did and didn't work on this

---

# High-level: status
- Conditional soundness theorem, partially hardened, untested in upgrades, 4-5 months behind zisk releases.
- Upstreaming of fork work needed
- Still under development. This is hard work. Every other foo-fv we've looked at has serious issues, does less, and so far we see no indication of ongoing maintenance.
- Started as an experiment and that is apparent! But I've also put a lot of cycles in to building it out and hardening it. A little bit of effort into clarifying it.

---

# Extraction, modeling and proofs

We turn code that's not in Lean into Lean and then write proofs about it.
- Lean code generator is an "extractor"
- Hand-writing code that looks like the original source is "modeling"
- We trust the extractor or the model. Extractor is preferred for maintainability.

---

# Extraction & modeling: zisk side

Subclaims:
 - The ELF is translated into a correct ROM representation
 - The input data is correctly executed against the ROM
 - The AIR relations are applied against the ROM

To evaluate these claims we need to translation the ROM construction, the execution, and the actual circuit arithmetic into Lean


---

# Extraction: zisk side

**Via pilout** — `pil2-compiler` → `zisk.pilout` → `pil-extract`
`pil/` · `state-machines/{main,mem,binary,arith}/pil/`

**Straight from source** — virtual tables, absent from the pilout
`arith/src/arith_table_data.rs` (74 rows) · `mem/src/mem_align_rom_sm.rs` (256 rows)

**Via Aeneas/Charon** — the lowerer
`core/src/{aeneas_extract,riscv2zisk_single_row,riscv2zisk_context,zisk_inst,zisk_inst_builder}.rs`
`riscv/src/{rv64im_decode,fence_decode}.rs`

**Out of scope** — `emulator/` `executor/` `precompiles/` `data-bus/` `common/`
`rom-setup/` `prover-backend/` `verifier/` `distributed/` `cli/` `sdk/` `lib-*/`

**35 AIRs → 10 extracted · 4,095 constraints → 355**

---

# Extraction: zisk side

<div data-mermaid="diagrams/zisk-extraction.mmd" style="height:72%"></div>

<span style="color:#22c55e">■</span> extracted &nbsp;&nbsp; <span style="color:#f59e0b">■</span> modeled by hand &nbsp;&nbsp; <span style="color:#94a3b8">■</span> outside Lean

Dotted = assumed, not proved. Bold = the zisk-fv extraction entry point.




---

# Modeling: zisk side

The pilout gives polynomials over **column indices**: `column := 8, rotation := 0`.
Proofs need **named fields**: `m.a_src_imm row`. So we hand-write a mirror.

| | |
| --- | --- |
| `ZiskFv/AirsClean/` | Clean components, one per AIR — 57k lines |
| `ZiskFv/Airs/` | `Valid_<AIR>` predicates, bus shapes — 19k lines |
| `ZiskFv/Channels/` | message + bus model |
| `Compliance/AcceptedZiskTrace.lean` | what “accepted” means: 3 data fields, 7 obligations |

Kept honest by **welds** — `AirsClean/*MirrorWeld.lean`, 6 files, 5.2k lines.
Each proves `mirror ↔ generated polynomial`, mostly by `Iff.rfl`.

---

# Modeling: zisk side — what the welds miss

Of the **355** extracted constraints:

| | |
| --- | --: |
| not named anywhere `lake build` elaborates | **143** |
| not reachable from `root_soundness` | **350** |

- Base-field layer is **done** — 0 of 152 unchecked by the build.
- The gap is stage-2: the **bus tuple**, folded into the logUp accumulator constraint.
- `Extraction/Buses.lean` is generated and **imported by nothing**.
- Welds are a **build-time gate, not part of the theorem**. Deleting one changes nothing that `root_soundness` proves.

Mutation sweep: **24 caught / 11 missed**. Round 32 retagged BinaryAdd’s op-bus emission `OP_ADD → OP_SUB` while it still computed `a + b` — build stayed green.

<!-- Issues: #368 exposure, #371 lookup recognizer, #374 Arith buses, #354 compile-time emitters -->

---

# Extraction: spec side

---

# Proof architecture

---

# Top-level theorem

---

# Ideal trajectory of the root theorem

---

# TCB


---

# Where do we go from here?

My dream: collaboration with both sides dedicating human and AI resources
 - Short term: You familiarize yourselves now and pick up a big task. I work in parallel toward upgradability and inclusion in CI.
 - Medium term: I ramp down and keep track of the project, possibly picking up tasks if it's helpful, as you all integrate into the dev process (goal: nightly CI). 
 - Long term: I stay on as a co-owner but development is mainly driven by you. I conduct period audits.


---

# Thanks - Questions?

<!-- _class: lead -->
<!-- _paginate: false -->

https://github.com/eth-act/zisk-fv

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
