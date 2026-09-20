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

# Extraction & modeling: zisk side

<div data-mermaid="diagrams/zisk-extraction.mmd" style="height:78%"></div>

<span style="color:#22c55e">■</span> extracted &nbsp; <span style="color:#f59e0b">■</span> modeled &nbsp; <span style="color:#ef4444">■</span> assumed &nbsp; <span style="color:#94a3b8">■</span> not in Lean

---

# Extraction & modeling: the evidence

| node | status | evidence |
| --- | --- | --- |
| raw 32-bit word | modeled | `rawProgram` binder, `Soundness.lean:1969` |
| `DecodedRv64im` · `ZiskInst row` | extracted | `ProductionM2.lean` (63 / 140 refs) |
| ROM table | modeled | `trace.program`; `ZiskRomMessage`, `Channels/ZiskRomBus.lean:58` (11 fields = `rom.pil`) |
| Main AIR row | modeled | `MainRowWithRom`, `AirsClean/Main/Row.lean:127` |
| op-bus tuple | modeled | `OperationBusEntry`, `Airs/OperationBus/OperationBus.lean:29` |
| Binary / Arith rows | modeled | `BinaryRow` `Binary/Row.lean:78`; `ArithMulRow` `ArithMul/Row.lean:81` |
| `Extraction/*.lean` | extracted | 18 modules, `nix/extracted-lean.nix` |
| `Valid_<AIR>` | modeled | `Valid_Main`, `Airs/Main/Main.lean:23` |
| ELF · `ZiskRom` map · `EmuTrace` · `*.pil` · pilout | not in Lean | no match under `ZiskFv/` |

| link | status | evidence |
| --- | --- | --- |
| `riscv::decode_32_core` | extracted | called `riscv_interpreter.rs:250`; start `aeneas_extract.rs:353` |
| `Riscv2ZiskContext::lower_rv64im_single_row` | extracted | start `aeneas_extract.rs:361`; production delegates `riscv2zisk_context.rs:667` |
| `aeneas_extract::extract_transpile_rv64im_rows_raw` | extracted | `aeneas_extract.rs:377`; in `ProductionM2.lean` |
| `pil-extract air` | extracted | `nix/extracted-lean.nix` |
| `RawProgramBinding.ProgramRowsBinding` | **assumed** | `RawProgramBinding.lean:172`; row content comes from `romRowOf:103`, only the layout is assumed |
| `AcceptedZiskTrace.channels_balanced` | **assumed** | `AcceptedZiskTrace.lean:93` |
| `AirsClean.Main.mainWithRom` | modeled | `Main/Constraints.lean:242` |
| `OperationBus.opBus_row_Main` | modeled | `OperationBus.lean:62` (mirrors `main.pil:367`, unwelded) |
| `AirsClean.*MirrorWeld` | modeled | 6 files, 5.2k lines |
| `AirsClean.Main.Bridge.rowAt` | modeled | `Main/Bridge.lean:34` |
| `riscv::riscv_interpreter` · `Riscv2ZiskContext::insert_inst` · `RomSM::compute_trace_rom` · `Emu::step_fast` · `Emu::build_full_trace_step` · `pil2-compiler` | not in Lean | — |

Labels are qualified: `Type::method` is Rust, `Module.name` is Lean.
The `BTreeMap` is production-only — under `aeneas_extract` the field becomes
`extract_inst : Option<ZiskInstBuilder>` and `insert_inst` keeps one row
(`riscv2zisk_context.rs:87-89,105-112`). Aeneas never sees the map.

**assumed ≠ not in Lean.** A premise is a hypothesis `root_soundness` needs.
Code that is not in Lean cannot make the theorem false.

---

# Extraction: zisk side

| Extractor | Upstream input | Lean output |
| --- | --- | --- |
| `pil-extract air` | `zisk.pilout` | `Main` `Arith` `Mem` `MemAlign`×4 `Binary`×3 |
| `pil-extract bus-emissions` | `zisk.pilout` hints, bus 5000 / 10 | `Buses.lean` `MemoryBuses.lean` |
| `pil-extract lookup-wiring` | `zisk.pilout` | `LookupWiring.lean` |
| `pil-extract arith-table` | `arith/src/arith_table_data.rs` | `ArithTable.lean` — 74 rows |
| `pil-extract mem-align-rom` | `mem/pil/mem_align_rom.pil` **+** `mem/src/mem_align_rom_sm.rs` | `MemAlignRom.lean` — 256 rows |
| `charon` → `aeneas` | `core/src/aeneas_extract.rs` `extract_*` wrappers | `trust/aeneas/ProductionM2.lean` |

`zisk.pilout` is `pil2-compiler` over `pil/` and `state-machines/{main,mem,binary,arith}/pil/`.
Charon follows the call graph into `riscv2zisk_single_row` `riscv2zisk_context` `zisk_inst{,_builder}` `riscv/src/{rv64im_decode,fence_decode}`.
Drivers: `nix/extracted-lean.nix` (+ `circuit-shim`, 3 Mem sidecars) · `scripts/aeneas-production-extract.sh`

**35 AIRs → 10 extracted · 4,095 constraints → 355**

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
