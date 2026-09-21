---
marp: true
lang: en-US
title: ZisK-FV Handoff
theme: zkevm-dark
transition: fade
paginate: true
_paginate: false
---

<!-- _class: lead -->

<script src="assets/theme-bg-light.js"></script>
<script src="assets/sparkles-light.js"></script>
<script type="module" src="assets/mermaid-zkevm-light.js"></script>

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
- are we also maintaining a Clean fork?

---

# Agenda

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Overview

## what this is, and where it stands

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# High-level: what is this?

https://github.com/eth-act/zisk-fv/

Main thing here is: a (conditional) Lean proof of RISC-V circuit _soundness_: if a trace satisfies
the constraints, then the trace is a valid RISC-V execution trace.

(_completeness_ would say: every valid RISC-V execution trace is accepted by the ZisK circuits;
afaik nobody proves this but I have some initial work in the repo)

---

# Motivation and approach

Q4 2025-ish: sp1-fv, openvm-fv, pico-fv

H1 2026: bugs found; publish https://zkevm.ethereum.foundation/blog/sp1-fv

Goal: understand what it would take to get _robust_ proofs of correctness of the RISC-V circuits; understand the efficacy of fv as a tool for finding bugs

_Robust_ := practically maintainable in CI, minimal-ish trust base, sensibly organized and
comprehensible to humans and agents

Eventually: handle precompiles and recursion circuits as well.

---

# High-level: stats

Lean4 version: IOU Number of lines of Lean: IOU Number of commits: Build on [IOU machine spec]: IOU
minutes to extract (mem: IOU); IOU minutes to prove soundness theorem (mem: IOU) Tokens consumed:
IOU LOC activity graph showing when I did and didn't work on this

---

# High-level: status

- Conditional soundness theorem, partially hardened, untested in upgrades, 4-5 months behind zisk
  releases.
- Need to upstream fork work
- Still under development. This is hard work. Every other foo-fv we've looked at has serious issues,
  does less, and so far we see no indication of ongoing maintenance.
- Started as an experiment and that is apparent! But I've also put a lot of cycles in to building it
  out and hardening it. A little bit of effort into clarifying it.

---

# Extraction, modeling and proofs

We turn code that's not in Lean into Lean and then write proofs about it.

- Lean code generator is an "extractor"
- Hand-writing code that looks like the original source is "modeling"
- We trust the extractor or the model. Extractor is preferred for maintainability.

---

<!-- _class: lead -->
<!-- _paginate: false -->

# ZisK side

## extraction and modeling

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Extraction & modeling: zisk side

Subclaims:

- The ELF is translated into a correct ROM representation
- The input data is correctly executed against the ROM
- The AIR relations are applied against the ROM

To evaluate these claims we need to translation the ROM construction, the execution, and the actual
circuit arithmetic into Lean

---

# Extraction & modeling: zisk side

<div data-mermaid="diagrams/zisk-extraction.mmd" style="height:78%"></div>

<span style="color:#22c55e">■</span> extracted &nbsp; <span style="color:#f59e0b">■</span> modeled
&nbsp; <span style="color:#ef4444">■</span> assumed &nbsp; <span style="color:#94a3b8">■</span> not
in Lean

---

# Extraction & modeling: reference

| what | status | where |
| --- | --- | --- |
| RV64IM decode, `decode_32_core` | extracted | extractor `aeneas_extract.rs:353` → result `trust/aeneas/ProductionM2.lean` |
| word → one ROM row, `lower_rv64im_single_row` | extracted | extractor `aeneas_extract.rs:361` → result `trust/aeneas/ProductionM2.lean` |
| word → one or two rows (unaligned JALR) | extracted | extractor `aeneas_extract.rs:377` → result `trust/aeneas/ProductionM2.lean` |
| polynomial constraints of the ten in-scope AIRs | extracted | extractor `pil-extract air` (`nix/extracted-lean.nix`) → result `build/extraction/Extraction/<AIR>.lean` |
| ROM table, eleven columns | modeled | prod `rom.pil` → model `ZiskRomMessage`, `Channels/ZiskRomBus.lean:58` |
| Main AIR row plus its ROM companion | modeled | prod `main.pil` → model `MainRowWithRom`, `AirsClean/Main/Row.lean:127` |
| op-bus emission — **no weld** | modeled | prod `main.pil:367` → model `opBus_row_Main`, `OperationBus.lean:62` |
| ROM lookup, Main consumes an instruction | modeled | prod `main.pil:490` → model `Main/Constraints.lean:266` |
| the five op-bus provider rows | modeled | prod `binary.pil`, `binary_add.pil`, `binary_extension.pil`, `arith.pil` → model `Binary/Row.lean:78`, `ArithMul/Row.lean:81`, and siblings |
| every AIR's constraint mirror | modeled | prod the generated polynomials → model `ZiskFv/Airs/`, welded by `AirsClean/*MirrorWeld.lean` |
| ROM layout: address order, no gaps, adjacent JALR slots | **premise** | `ProgramRowsBinding`, `RawProgramBinding.lean:172` — an extra binder of `root_soundness`; no verifier checks it. Row content is extracted, via `romRowOf:103`; only the layout is assumed. |
| every bus balances — sent multiset equals received | **antecedent** | `AcceptedZiskTrace.channels_balanced`, `AcceptedZiskTrace.lean:93` — part of what “accepted” means, established by the logUp argument |

---

# Modeling: zisk side, and the welds

A bit of historical tech debt: `root_soundness` is about hand-written Clean circuits, and the relationship to the extracted circuits is proven externally. We refer to the linking theorems as "welds". They look like this

```lean
theorem constraint_2_weld (row : MainRowWithRom FGL) :     -- main.pil:197
    ((row.rom.store_ind + row.rom.b_src_ind) * row.core.a_1 = 0)
      ↔ Main.extraction.constraint_2_every_row (extractedMainRow row) 0 := Iff.rfl
```

Improving this story is an active workstream.


---

<!-- _class: lead -->
<!-- _paginate: false -->

# Spec side

## extraction and modeling

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Extraction: spec side

One extractor, and it is upstream: `sail --lean --all-modules` (sail 0.20.1) over
`riscv/sail-riscv@04e5959`. One `ninja` target, `generated_lean_rv64d`, driven by
`nix/sail-lean-tree.nix`.

**146 `.sail` files · 27,769 lines → 149 `.lean` files · 145,355 lines.**

Two parts of that output are hand-written upstream, not generated:

- `LeanRV64D/Sail/*.lean` — 1,215 lines, sail's prelude: the monad and `SequentialState`
- `LeanRV64D/RiscvExtras.lean` — 117 lines, sail-riscv's **75 axioms**, all data-valued

<!-- Third: our nix/sail-lean-v4.28-compat.patch, because that prelude targets a Lean
     nightly. The codygunton/sail flake input is declared and never consumed — issue. -->

---

# Configuring the spec machine

We pin the machine in two places, and they do different jobs.

**Codegen.** `nix/sail-riscv-zisk-rv64d.json` replaces `config/rv64d_v256_e64.json` at
configure time, so the profile is baked into the emitted Lean: `hartSupports Ext_M = true`
and `Ext_A/F/D/B/S/U = false` (`Extensions.lean:637`), `sys_pmp_count = 0`, one memory
region at base `0` of size `0x1_0000_0000`.

**Premise.** The config says nothing about the state a segment starts in.
`RISC_V_assumptions` (`Auxiliaries.lean:949`) does, in 11 conjuncts — machine privilege,
`mstatus.MPRV` clear, one PMA region at base `0` covering `2^32`, r/w, misaligned faulting,
no HTIF. `root_soundness` carries it per step on the 11 memory opcodes; the other 52 not.

<!-- Bare address translation is neither: it follows from machine privilege alone
     (translationMode_in_machine, no hypothesis). -->

---

# Modeling: spec side

`ZiskFv/SailSpec/` — 63 opcode files (7,536 lines), plus `Auxiliaries.lean` (996, the
platform theorems and the monad rewriting) and `BusEffect.lean` (132).

Each opcode file does two jobs:

1. **restate** the opcode as `PureSpec.execute_<shape>_<op>_pure`, a pure
   `Input → Output` function — no dispatch, and the trap arms the profile kills are gone;
2. **prove** `execute_<shape>_<op>_pure_equiv`, which pins that restatement to the real
   `execute`.

Same pattern as the ZisK mirrors, welded to the generated artifact **on its own side**. One
difference: those welds are leaves, these are load-bearing — **63 of 63** `_pure_equiv` sit
in `root_soundness`' closure. Delete one and the build fails.

---

# Using the spec: one equation per step

Every per-step equation compares two `EStateM.Result … SequentialState …` — the state Sail
reaches, and the state the ZisK bus rows describe.

```lean
-- LeanRV64D/Sail/Sail.lean:461 — 164 registers, byte-addressed memory
structure SequentialState (RegisterType : Register → Type) (c : ChoiceSource) where
  regs : Std.ExtDHashMap Register RegisterType      -- the proof constrains this
  choiceState : c.α
  mem : Std.ExtHashMap Nat (BitVec 8)               -- and this
  tags : Unit ; cycleCount : Nat ; sailOutput : Array String

-- SailSpec/Auxiliaries.lean:940 — a step is fetch, then execute
noncomputable def execute_instruction (instr : instruction) (state : SequentialState ..) :=
  (do Sail.writeReg Register.nextPC (Sail.BitVec.addInt (← Sail.readReg Register.PC) 4)
      LeanRV64D.Functions.execute instr) state
```

---

# Using the spec: normalizing Sail's side

`_pure_equiv` does **not** leave the monad. It replaces the 343-arm dispatch with a small
explicit `do` block whose values come from a pure function:

```lean
-- SailSpec/add.lean, abridged;  out := execute_RTYPE_add_pure add_input
execute_instruction (instruction.RTYPE (r2, r1, rd, rop.ADD)) state
  = (do Sail.writeReg Register.nextPC out.nextPC
        match out.rd with | .some (rd, v) => write_xreg rd v | .none => pure ()
        pure (ExecutionResult.Retire_Success ())) state
```

`AddInput` is `{r1_val, r2_val, rd, PC}`, `AddOutput` is `{nextPC, rd?}`. Those fields are
the Main operand lanes, the PC column and the bus write entries — which is why the record,
not Sail's dispatcher, is what the circuit side gets compared against.

---

# Using the spec: reading ZisK's side

`bus_effect` (`SailSpec/BusEffect.lean:34`) folds a step's bus rows into a `SequentialState`.
Nothing generated says how to read a bus message, so this is the one real modeling decision
on the spec side.

- a **pull** (multiplicity `-1`) becomes a read *hypothesis* — `state.mem[ptr]? = .some byte`,
  or `read_xreg r state = .ok val state`
- a **push** (`+1`) becomes an actual *write* — `state.mem.insert ptr byte`, or `write_xreg`
- address space `1` is a register, `2` is memory; a write to `x0` is dropped
- the execution-bus pair gives the current `PC` and writes `nextPC`

Every `equiv_<OP>` equates that fold with `execute_instruction`. If this reading is wrong,
the theorem is about the wrong machine.

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Root soundness theorem: inputs

<div style="text-align: left">

ZiskFv/Soundness.lean:

```lean
theorem root_soundness
    [input data and assumptions] :
    [claim] := by
    [proof]
```

</div>

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Root theorem inputs

```lean
theorem root_soundness
    (numInstructions rawLength : Nat)
    (ziskTrace : AcceptedZiskTrace numInstructions)
    (init : PreSail.SequentialState RegisterType Sail.trivialChoiceSource)
    (ziskStep : ∀ i : Fin numInstructions, ZiskStep ziskTrace i)
    (start : Fin rawLength → Fin ziskTrace.programLength)
    (addr : Fin rawLength → FGL)
    (rawProgram : Fin rawLength → BitVec 32)
    (programBinding : RawProgramBinding.ProgramRowsBinding
      ziskTrace start addr rawProgram)
    (rawProgramDecodes : ∀ i : Fin numInstructions,
      RawProgramDecode ziskTrace i (ziskStep i) start addr rawProgram)
    (inputsAgree : ∀ i : Fin numInstructions,
      InputsAgreeCore ziskTrace (chainedSailTrace ziskStep init) i (ziskStep i))
    (pcBoot : ∀ (_ : 0 < numInstructions),
      ((ZiskFv.AirsClean.FullEnsemble.mainOfTable ziskTrace.program ziskTrace.mainTable).pc 0).val
        = (init.regs.get? Register.PC).elim 0 BitVec.toNat)
    (rowsAligned : StepRowsAligned ziskTrace ziskStep
      (fun i => rowDecode_of_programDecode ziskTrace i
        (programDecode_of_rawProgramDecode ziskTrace i (ziskStep i)
          start addr rawProgram programBinding (rawProgramDecodes i))))
    (bootSeed : BootSegmentMemorySeed ziskTrace (chainedSailTrace ziskStep init) ziskStep)
    (regBoot : ∀ k : Fin 32, k ≠ 0 →
      init.regs.get? (reg_of_fin k)
        = some (cast (by rw [register_type_reg_of_fin_equiv]) (0 : BitVec 64)))
    (hAvoidKnownBugs : ∀ i : Fin numInstructions,
      RowOutsideDefectRegion ziskTrace i (ziskStep i)) :
```

---

# Binder dependencies

<div data-mermaid="diagrams/binder-deps.mmd" style="height:74%"></div>

<span style="color:#94a3b8">■</span> data &nbsp; <span style="color:#f59e0b">■</span> mixed &nbsp;
<span style="color:#ef4444">■</span> hypothesis &nbsp;&nbsp; an edge means the target's
<em>type</em> mentions the source; <span style="color:#dc2626">red</span> = a hypothesis whose
statement needs two other hypotheses

---


# How to read the input list

<style scoped>
table th, table td { padding: 0.22em 0.55em; }
</style>

| binder              | type       | what                           | to discharge                                                 |
| ------------------- | ---------- | ------------------------------ | ------------------------------------------------------------ |
| `numInstructions`   | data       | how many steps ran             | —                                                            |
| `rawLength`         | data       | how many words in the program  | —                                                            |
| `ziskTrace`         | mixed      | the filled circuit tables      | have a real accepted ZisK proof                              |
| `init`              | data       | the Sail state at step 0       | —                                                            |
| `ziskStep`          | data       | which operation each step is   | nothing — but 9 and 10 must back the choice                  |
| `start`             | data       | word k's first ROM row         | —                                                            |
| `addr`              | data       | word k's address               | —                                                            |
| `rawProgram`        | data       | word k's 32 raw bits           | —                                                            |
| `programBinding`    | hypothesis | ROM = the lowered program      | re-run ZisK's lowerer on your binary, match the ROM row by   |
|                     |            |                                | row                                                          |
| `rawProgramDecodes` | hypothesis | each word matches its op       | check each instruction word decodes as claimed               |
| `inputsAgree`       | mixed      | Sail regs hold ZisK's operands | the hard one: tie ZisK's operand columns to Sail's registers |
| `pcBoot`            | hypothesis | the PC agrees at step 0        | point both machines at the same start address                |
| `rowsAligned`       | hypothesis | step index = Main row index    | no two-row JALR at a step that has a successor               |
| `bootSeed`          | mixed      | the segment's starting memory  | hand over entry memory; tie bus rows to real reads/writes    |
| `regBoot`           | hypothesis | every register starts at zero  | start from a zeroed register file                            |
| `hAvoidKnownBugs`   | hypothesis | no listed ZisK defect fires    | avoid the 6 known ZisK bugs; keep pc + 4 inside the field    |

---

# After a refactor

```lean
theorem root_soundness_grouped
    (run     : AcceptedRun)
    (program : CommittedProgram run)
    (reading : Decoding run program)
    (entry   : SegmentEntry run reading)
    (agree   : OperandAgreement run reading entry)
    (scope   : InScope run reading)
    : ∀ i, StepSound …
```

<style scoped>
table th, table td { padding: 0.28em 0.6em; }
</style>

| group     | absorbs                                      | what it is, and the boundary it owns                         | what closes it                                             |
| --------- | -------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `run`     | `ziskTrace`                                  | the accepted proof: constraints + balance, plus 5 facts the  | [#368](https://github.com/eth-act/zisk-fv/issues/368) and  |
|           |                                              | single-row model cannot state                                | nine sibling extraction issues                             |
| `program` | `start` `addr` `rawProgram` `programBinding` | the binary and its ROM binding — external: these bits are my | extract ZisK's ROM builder and loader                      |
|           |                                              | compiled binary                                              |                                                            |
| `reading` | `ziskStep` `rawProgramDecodes` `rowsAligned` | which op each step is, and the evidence for it; owns the     | [#172](https://github.com/eth-act/zisk-fv/issues/172), the |
|           |                                              | JALR two-row placement gap                                   | decoder derivation,                                        |
|           |                                              |                                                              | [#344](https://github.com/eth-act/zisk-fv/issues/344)      |
| `entry`   | `init` `pcBoot` `bootSeed` `regBoot`         | the state the segment starts in — a segment has no start of  | [#328](https://github.com/eth-act/zisk-fv/issues/328)      |
|           |                                              | its own                                                      | cross-segment continuation                                 |
| `agree`   | `inputsAgree`                                | the residual per-step bridge: Sail's registers hold the      | [#360](https://github.com/eth-act/zisk-fv/issues/360),     |
|           |                                              | operands ZisK used                                           | blocked on                                                 |
|           |                                              |                                                              | [#348](https://github.com/eth-act/zisk-fv/issues/348)      |
| `scope`   | `hAvoidKnownBugs`                            | known ZisK defects on 14 of 63 arms, plus the no-wrap domain | 2 need ZisK; 4 have a Lean-side branch                     |
|           |                                              | conditions                                                   |                                                            |

---

# Aspirational form: after full discharge

```lean
theorem root_soundness_maximal
    (elf   : ProgramImage)
    (run   : AcceptedRun elf)
    (scope : InScope run)
    : ∀ i, StepSound …
```

<style scoped>
table th, table td { padding: 0.4em 0.7em; }
</style>

| binder  | what it is                             | what stays assumed, and why no Lean proof closes it         |
| ------- | -------------------------------------- | ----------------------------------------------------------- |
| `elf`   | the binary, as bytes                   | that these bytes are what your compiler emitted — build     |
|         |                                        | reproducibility, not a proof obligation                     |
| `run`   | an accepted ZisK proof for that binary | proof-system soundness: the STARK and lookup argument       |
|         |                                        | carrying “the verifier accepted” to “such a witness exists” |
| `scope` | the run stays inside the claim         | ZisK bugs not yet fixed upstream, and that `pc + 4` never   |
|         |                                        | wraps the Goldilocks modulus                                |


---

<!-- _class: lead -->
<!-- _paginate: false -->

# Root soundness theorem: claim

<div style="text-align: left">

ZiskFv/Soundness.lean:

```lean
theorem root_soundness
    [input data and assumptions] :
    [claim] := by
    [proof]
```

</div>

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Root theorem claim

<style scoped>
section p, section li { font-size: 0.60em; }
section pre code { font-size: 0.55em; }
section li { margin-bottom: 0.1em; }
section pre { padding: 0.65em 1.1em; }
</style>

```lean
theorem root_soundness
      [inputs and assumptions] :
    ∀ i : Fin numInstructions,
      StepSound ziskTrace (chainedSailTrace ziskStep init) i (ziskStep i)
        (rowDecode_of_programDecode ziskTrace i
          (programDecode_of_rawProgramDecode ziskTrace i (ziskStep i)
            start addr rawProgram programBinding (rawProgramDecodes i))) := by
```

```lean
def StepSound
    (ziskTrace : AcceptedZiskTrace numInstructions)
    (sailTrace : SailTrace ziskTrace.numInstructions)
    (i : Fin ziskTrace.numInstructions)
    (zs : ZiskStep ziskTrace i)
    (rd : RowDecode ziskTrace i zs) : Prop :=

```
---

# Root theorem claim

<style scoped>
section p, section li { font-size: 0.60em; }
section pre code { font-size: 0.55em; }
section li { margin-bottom: 0.1em; }
section pre { padding: 0.65em 1.1em; }
</style>

```lean
def StepSound
    (ziskTrace : AcceptedZiskTrace numInstructions)
    (sailTrace : SailTrace ziskTrace.numInstructions)
    (i : Fin ziskTrace.numInstructions)
    (zs : ZiskStep ziskTrace i)
    (rd : RowDecode ziskTrace i zs) : Prop :=

```


1. `ziskTrace` — the satisfied circuits
2. `ziskStep` — when evaluated on `i`, which of the 63 considered instructions this step claims to be.
   Only a claim: `Claim_<op>` is pure register/immediate data, so the name is a misnomer
   ([#397](https://github.com/eth-act/zisk-fv/issues/397)). Item 4 is what forbids a wrong claim.
3. `chainedSailTrace ziskStep init` — the execution trace of spec machine
4. the nested `…_of_…` term — `StepSound`'s last argument is a `RowDecode`: which Main row the step
   occupies, and how that row decodes. The theorem **computes** it rather than taking it as a binder,
   chaining raw word → ROM row → Main row off `rawProgramDecodes i`. So the decode the claim is
   indexed by is forced by the program, not chosen by the caller.

No AIR, no constraint, no weld appears here — those are inside what `StepSound` unfolds to.

---

# Root theorem claim: the calls

<style scoped>
section p, section li { font-size: 0.565em; }
section pre code { font-size: 0.52em; }
section li { margin-bottom: 0.1em; }
section pre { padding: 0.6em 1.1em; }
</style>

```lean
-- n = numInstructions; SequentialState = PreSail.SequentialState RegisterType …
∀ i : Fin numInstructions,
  StepSound ziskTrace (chainedSailTrace ziskStep init) i (ziskStep i)
    (rowDecode_of_programDecode ziskTrace i
      (programDecode_of_rawProgramDecode ziskTrace i (ziskStep i)
        start addr rawProgram programBinding (rawProgramDecodes i)))
```

5. `chainedSailTrace ziskStep init : (∀ i, ZiskStep ziskTrace i) → SequentialState → SailTrace n`
   — `SailTrace n := Fin n → SequentialState`. Step `0` is `init`; step `j+1` is `execute`'s
   post-state, then retire.
6. `ziskStep i : Fin n → ZiskStep ziskTrace i` — an inductive with 63 constructors, each carrying
   that op's `Claim_<op>`. A `Claim` is pure data — `Claim_sub` is just `r1 r2 rd : regidx` — so
   this binder only **labels** the step. Items 7–9 are what forbid a wrong label.
7. `rawProgramDecodes i : Fin n → RawProgramDecode ziskTrace i (ziskStep i) …` — a binder, not a
   computation: the evidence that raw word `k` lowers to this step's op.
8. `programDecode_of_rawProgramDecode : ProgramRowsBinding … → RawProgramDecode … → ProgramDecode …`
   — raw-word evidence ⟶ committed-ROM-row evidence. Per-arm, 63 cases.
9. `rowDecode_of_programDecode : ProgramDecode ziskTrace i zs → RowDecode ziskTrace i zs`
   — ROM-row evidence ⟶ the Main-row decode bundle that indexes `StepSound`. Per-arm, 63 cases.
10. `StepSound : AcceptedZiskTrace n → SailTrace n → (i : Fin n) → (zs : ZiskStep …) → RowDecode … → Prop`
    — the only `Prop` in the claim. Matches on `zs` and yields that arm's single equation.

The three decode types land in `Type`, not `Prop` — a decode is **data** the caller hands over,
not something the theorem proves.

---

# Root theorem claim: one step, unfolded

<style scoped>
section p, section li { font-size: 0.70em; }
section pre code { font-size: 0.60em; }
section li { margin-bottom: 0.2em; }
section pre { padding: 0.9em 1.2em; }
</style>

```lean
-- StepSound … i (.sub c), writing `sailTrace` for `chainedSailTrace ziskStep init`
-- and `rows` for `busSub ziskTrace i (Pilot.execRowOf ziskTrace i)`
(do Sail.writeReg Register.nextPC (Sail.BitVec.addInt (← Sail.readReg Register.PC) 4)
    LeanRV64D.Functions.execute (instruction.RTYPE (c.r2, c.r1, c.rd, rop.SUB))) (sailTrace i)
  = state_effect_via_channels ⟨rows.exec_row, [rows.e0, rows.e1, rows.e2]⟩ (sailTrace i)
```

- **Left**: Sail runs the instruction from the state at step `i`. The `nextPC := PC + 4` prelude is
  Sail's own fetch.
- **Right**: the committed bus rows folded onto the **same** state — `e0` `e1` are the rs1/rs2
  **pulls**, read obligations; `e2` is the rd **push**, a real write; `exec_row` carries `pc i` and
  `pc (i+1)`.
- Both sides are one `EStateM.Result`, so the equation fixes the **whole post-state and the
  success/trap outcome**, not just the value written to `rd`.
- Every cell on the right projects the real Main row. The bus rows are read off the trace, never
  supplied as free parameters.

One step is sound when ZisK's committed columns describe exactly the state change the spec makes.
The induction in `root_soundness` carries that from `i` to `i+1`.

---

# Root soundness theorem: proof indications

<div style="text-align: left">

ZiskFv/Soundness.lean:

```lean
theorem root_soundness
    [input data and assumptions] :
    [claim] := by
    [proof]
```

</div>

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Proof architecture: one opcode

Bottom-up. Nothing in steps 1-4 mentions a trace; the object is one abstract row.

1. **Extract both sides.** `LeanRV64D` from Sail; `Extraction/*.lean` from the pilout.
2. **Name the constraints.** Hand-written `AirsClean/` components and `Valid_<AIR>` predicates,
   welded to the generated polynomials at build time.
3. **Normalize the Sail side.** 63 pure `PureSpec.execute_<OP>_pure` functions, each pinned to
   the real `execute` by a proved lemma (`ZiskFv/SailSpec/`).
4. **One opcode, one equation.** `equiv_<OP>` says the Sail step equals `bus_effect` of that
   opcode's bus rows. `EquivCore/` → `Compliance/Wrappers/` → `Equivalence/`, 63 each.

---

# Proof architecture: one trace

From step 5 the object is an `AcceptedZiskTrace`: a committed ROM, 15 filled tables, 7 obligations.

5. **Bundle the arms.** Ten family dispatchers prove `zisk_riscv_compliant_program_bus` for all 63
   `OpEnvelope` arms — still over abstract rows.
6. **Attach to the witness.** `stepStrong_<op>` restates each arm with bus rows read off the trace
   (61 theorems; `jal` / `jalr` inline).
7. **Dispatch per step.** `stepSound_of_evidence` turns `ZiskStep i` into `StepSound i`: one
   Sail-equals-ZisK equation per executed step.
8. **Chain the steps.** `root_soundness` runs one induction on the step index carrying register
   agreement and PC agreement, from the `regBoot` / `pcBoot` base cases.

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Future of the project

## trust base and next steps

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# TCB

Spec side: **0** axioms of our own, **0** `sorry`.

`root_soundness`' closure reaches **72** upstream Sail primitives — 67 softfloat, 5
platform and reservation. Sail defers these to an external library, so the Lean backend
has no body to translate. All are **data**-valued, never `Prop`: they declare functions
into inhabited types, which is conservative. All 72 arrive through
`LeanRV64D.Functions.execute`, whose 343-arm body names every instruction.

One real premise sits beside them: `RISC_V_assumptions`, on the 11 memory opcodes.

---

# Where do we go from here?

My dream: collaboration with both sides dedicating human and AI resources

- Short term: You familiarize yourselves now and pick up a big task. I work in parallel toward
  upgradability and inclusion in CI.
- Medium term: I ramp down and keep track of the project, possibly picking up tasks if it's helpful,
  as you all integrate into the dev process (goal: nightly CI).
- Long term: I stay on as a co-owner but development is mainly driven by you. I conduct period
  audits.

---

# Thanks - Questions?

<!-- _class: lead -->
<!-- _paginate: false -->

https://github.com/eth-act/zisk-fv

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
