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

**Extracted** — a generator turned ZisK's own source into Lean.

| what | extractor | result |
| --- | --- | --- |
| RV64IM decode, `decode_32_core` | Aeneas start `extract_decode_rv64im_raw`, `aeneas_extract.rs:353` | `trust/aeneas/ProductionM2.lean` |
| word → one ROM row, `lower_rv64im_single_row` | Aeneas start `extract_transpile_rv64im_raw`, `aeneas_extract.rs:361` | `trust/aeneas/ProductionM2.lean` |
| word → one or two rows (unaligned JALR) | Aeneas start `extract_transpile_rv64im_rows_raw`, `aeneas_extract.rs:377` | `trust/aeneas/ProductionM2.lean` |
| every polynomial constraint of the ten in-scope AIRs | `pil-extract air`, driven by `nix/extracted-lean.nix` | `build/extraction/Extraction/<AIR>.lean` |

**Modeled** — hand-written Lean that restates the source.

| what | Lean definition | what it restates |
| --- | --- | --- |
| ROM table | `ZiskRomMessage`, `Channels/ZiskRomBus.lean:58` | the eleven columns `rom.pil` commits |
| Main AIR row | `MainRowWithRom`, `AirsClean/Main/Row.lean:127` | Main's witness columns plus its ROM companion |
| op-bus tuple | `opBus_row_Main`, `Airs/OperationBus/OperationBus.lean:62` | the emission at `main.pil:367` — **no weld** |
| Binary / Arith rows | `Binary/Row.lean:78`, `ArithMul/Row.lean:81` | the secondary AIRs' row layouts |
| row ↔ constraint predicate | `Main/Bridge.lean:34` | welded to the extraction by `AirsClean/*MirrorWeld.lean` |

**Assumed** — hypotheses `root_soundness` takes and does not prove.

| premise | what it grants |
| --- | --- |
| `ProgramRowsBinding`, `RawProgramBinding.lean:172` | the ROM holds each word's lowering, in address order, gap-free, with a two-row JALR in adjacent slots. The row *content* is computed by the extracted lowerer through `romRowOf:103`; only the *layout* is assumed. |
| `AcceptedZiskTrace.channels_balanced`, `AcceptedZiskTrace.lean:93` | every bus balances: the multiset each AIR sends equals the multiset received. |

---

# Extraction: zisk side

| Extractor                   | Upstream input                                    | Lean output                                  |
| --------------------------- | ------------------------------------------------- | -------------------------------------------- |
| `pil-extract air`           | `zisk.pilout`                                     | `Main` `Arith` `Mem` `MemAlign`×4 `Binary`×3 |
| `pil-extract bus-emissions` | `zisk.pilout` hints, bus 5000 / 10                | `Buses.lean` `MemoryBuses.lean`              |
| `pil-extract lookup-wiring` | `zisk.pilout`                                     | `LookupWiring.lean`                          |
| `pil-extract arith-table`   | `arith/src/arith_table_data.rs`                   | `ArithTable.lean` — 74 rows                  |
| `pil-extract mem-align-rom` | `mem/pil/mem_align_rom.pil` **+**                 | `MemAlignRom.lean` — 256 rows                |
|                             | `mem/src/mem_align_rom_sm.rs`                     |                                              |
| `charon` → `aeneas`         | `core/src/aeneas_extract.rs` `extract_*` wrappers | `trust/aeneas/ProductionM2.lean`             |

`zisk.pilout` is `pil2-compiler` over `pil/` and `state-machines/{main,mem,binary,arith}/pil/`.
Charon follows the call graph into `riscv2zisk_single_row` `riscv2zisk_context`
`zisk_inst{,_builder}` `riscv/src/{rv64im_decode,fence_decode}`. Drivers: `nix/extracted-lean.nix`
(+ `circuit-shim`, 3 Mem sidecars) · `scripts/aeneas-production-extract.sh`

**35 AIRs → 10 extracted · 4,095 constraints → 355**

---

# Modeling: zisk side

The pilout gives polynomials over **column indices**: `column := 8, rotation := 0`. Proofs need
**named fields**: `m.a_src_imm row`. So we hand-write a mirror.

|                                     |                                                     |
| ----------------------------------- | --------------------------------------------------- |
| `ZiskFv/AirsClean/`                 | Clean components, one per AIR — 57k lines           |
| `ZiskFv/Airs/`                      | `Valid_<AIR>` predicates, bus shapes — 19k lines    |
| `ZiskFv/Channels/`                  | message + bus model                                 |
| `Compliance/AcceptedZiskTrace.lean` | what “accepted” means: 3 data fields, 7 obligations |

Kept honest by **welds** — `AirsClean/*MirrorWeld.lean`, 6 files, 5.2k lines. Each proves
`mirror ↔ generated polynomial`, mostly by `Iff.rfl`.

---

# Modeling: zisk side — what the welds miss

Of the **355** extracted constraints:

|                                            |         |
| ------------------------------------------ | ------: |
| not named anywhere `lake build` elaborates | **143** |
| not reachable from `root_soundness`        | **350** |

- Base-field layer is **done** — 0 of 152 unchecked by the build.
- The gap is stage-2: the **bus tuple**, folded into the logUp accumulator constraint.
- `Extraction/Buses.lean` is generated and **imported by nothing**.
- Welds are a **build-time gate, not part of the theorem**. Deleting one changes nothing that
  `root_soundness` proves.

Mutation sweep: **24 caught / 11 missed**. Round 32 retagged BinaryAdd’s op-bus emission
`OP_ADD → OP_SUB` while it still computed `a + b` — build stayed green.

<!-- Issues: #368 exposure, #371 lookup recognizer, #374 Arith buses, #354 compile-time emitters -->

---

# Extraction & modeling: spec side

Subclaims:

- The Lean we prove against **is** `riscv/sail-riscv`, not a re-typing of it
- It is specialized to the platform ZisK runs: RV64IM, machine mode, flat memory
- The monad-free forms the proofs reason with equal the Sail forms

One extractor, and it is upstream: Sail ships a `--lean` backend.

---

# Extraction & modeling: spec side

<div data-mermaid="diagrams/sail-extraction.mmd" style="height:80%"></div>

<span style="color:#22c55e">■</span> extracted &nbsp; <span style="color:#f59e0b">■</span> modeled
&nbsp; <span style="color:#ef4444">■</span> assumed &nbsp; <span style="color:#0c9fde">■</span>
proved, in the theorem &nbsp; <span style="color:#94a3b8">■</span> not in Lean

---

# Extraction: spec side

| Extractor                   | Upstream input                              | Lean output        |
| --------------------------- | ------------------------------------------- | ------------------ |
| `sail --lean` (sail 0.20.1) | `riscv/sail-riscv@04e5959`, `--all-modules` | `build/sail-lean/` |

One `ninja` target, `generated_lean_rv64d` (`model/CMakeLists.txt:404-473`), driven by
`nix/sail-lean-tree.nix`.

**146 `.sail` files · 27,769 lines → 149 `.lean` files · 145,355 lines.**

---

# Extraction: spec side — not everything is generated

| file                               |   lines | ships with | what it is                     |
| ---------------------------------- | ------: | ---------- | ------------------------------ |
| `LeanRV64D/Sail/*.lean`            |   1,215 | sail       | the monad, `SequentialState`   |
| `LeanRV64D/RiscvExtras.lean`       |     117 | sail-riscv | **75 axioms**                  |
| `nix/sail-lean-v4.28-compat.patch` | 2 files | us         | prelude targets a Lean nightly |

`RiscvExtras.lean` is copied in verbatim; only the module name is rewritten. The pinned
`codygunton/sail` flake input is **unused** — nixpkgs' sail generates.

---

# Extraction: spec side — the ZisK profile

`nix/sail-riscv-zisk-rv64d.json` replaces `config/rv64d_v256_e64.json`. It is **baked into the
Lean**, not read at runtime:

```lean
-- LeanRV64D/Extensions.lean:637
def hartSupports (merge_var : extension) : Bool :=
  match merge_var with
  | Ext_M => true
  | Ext_A => false
  | Ext_F => false
  ...
```

Also fixed: no PMP, no misaligned access, machine mode only, one memory region at base `0` of size
`0x1_0000_0000`, r/w/x.

---

# Extraction: spec side — the cost of one dispatcher

The F and D **code** still ships, even though the extensions are off.

`instruction` has **343 constructors** (`Defs.lean:739`) and `execute` (`InstsEnd.lean:69929`)
dispatches all of them. So all **67 softfloat axioms** stay in `root_soundness`' closure, over arms
no ZisK proof ever unfolds.

zisk-fv's per-opcode proofs use **19** of those constructors, covering the 63 RV64IM opcodes.

---

# Modeling: spec side

|                             |                                                  |
| --------------------------- | ------------------------------------------------ |
| `ZiskFv/SailSpec/<op>.lean` | 63 files, 7,536 lines — one per opcode           |
| `SailSpec/Auxiliaries.lean` | 996 lines — platform theorems, monad rewriting   |
| `SailSpec/BusEffect.lean`   | 132 lines — ZisK bus rows as a Sail state update |

Each opcode file does two jobs:

1. **restate** Sail as `PureSpec.execute_<shape>_<op>_pure` — monad stripped, decode dispatch gone,
   trap arms the profile kills gone;
2. **prove** `execute_<shape>_<op>_pure_equiv` against the real `execute`.

---

# Modeling: spec side — these welds are load-bearing

|                                    | ZisK side                    | spec side                 |
| ---------------------------------- | ---------------------------- | ------------------------- |
| mirror                             | `Valid_<AIR>`, `AirsClean/`  | `PureSpec.execute_*_pure` |
| weld                               | `AirsClean/*MirrorWeld.lean` | `PureSpec.*_pure_equiv`   |
| welds in `root_soundness`' closure | **0**                        | **63 of 63**              |

Delete a `MirrorWeld` and `root_soundness` proves what it proved before. Delete a `_pure_equiv` and
it does not compile.

Constant-dependency walk, 48,594 constants: `LeanRV64D.Functions.*` **1,727 of 5,179** ·
`Extraction.*` **72** · `PureSpec.*_pure_equiv` **63** · `MirrorWeld` **0**.

---

# Using the spec: everything is in a state monad

```lean
-- LeanRV64D/Defs.lean:1799
abbrev SailM := PreSailM RegisterType trivialChoiceSource exception
-- LeanRV64D/Sail/Sail.lean:473
abbrev PreSailM RegisterType c ue := EStateM (Error ue) (SequentialState RegisterType c)

-- LeanRV64D/Sail/Sail.lean:461 — 164 registers, byte-addressed memory
structure SequentialState (RegisterType : Register → Type) (c : ChoiceSource) where
  regs : Std.ExtDHashMap Register RegisterType
  choiceState : c.α
  mem : Std.ExtHashMap Nat (BitVec 8)
  tags : Unit ; cycleCount : Nat ; sailOutput : Array String
```

`execute : instruction → SailM ExecutionResult` reads and writes that state through `Sail.readReg` /
`Sail.writeReg`.

---

# Using the spec: one step is fetch, then execute

```lean
-- ZiskFv/SailSpec/Auxiliaries.lean:940
noncomputable def execute_instruction (instr : instruction) (state : SequentialState ..) :=
  (do
    Sail.writeReg Register.nextPC (Sail.BitVec.addInt (← Sail.readReg Register.PC) 4)
    LeanRV64D.Functions.execute instr
  ) state
```

Everything downstream is an equation between two `EStateM.Result`s: the state Sail reaches, and the
state the ZisK bus rows describe.

---

# Using the spec: stripping the monad

```lean
-- ZiskFv/SailSpec/add.lean
def execute_RTYPE_add_pure (input : AddInput) : AddOutput :=
  { nextPC := input.PC + 4#64
  , rd := if h : input.rd = 0 then .none else .some (.., input.r1_val + input.r2_val) }

lemma execute_RTYPE_add_pure_equiv
    (h_input_r1 : read_xreg (regidx_to_fin r1) state = .ok add_input.r1_val state) ..
  : execute_instruction (instruction.RTYPE (r2, r1, rd, rop.ADD)) state
  = (do Sail.writeReg Register.nextPC (execute_RTYPE_add_pure add_input).nextPC ; ..) state
```

The pure form is hand-written. The lemma is what makes it honest.

---

# Using the spec: putting the monad back

`bus_effect` (`SailSpec/BusEffect.lean:34`) folds a step's memory-bus rows into a `SequentialState`:

- a **pull** (multiplicity `-1`) becomes a read _hypothesis_ — `state.mem[ptr]? = .some byte`, or
  `read_xreg r state = .ok val state`
- a **push** (multiplicity `+1`) becomes an actual _write_ — `state.mem.insert ptr byte`, or
  `write_xreg r val state`
- the execution-bus pair gives the current `PC` and writes `nextPC`

Every `equiv_<OP>` equates that fold with `execute_instruction`.

---

# Spec side: what stays assumed

|                                                             |           |
| ----------------------------------------------------------- | --------: |
| axioms in `RiscvExtras.lean`                                |        75 |
| of those, in `root_soundness`' closure                      |    **72** |
| softfloat (`riscv_f*`, `riscv_*ToF*`)                       |        67 |
| platform / reservation (`plat_term_write`, `*_reservation`, |         5 |
| `get_16_random_bits`)                                       |           |
| project (`ZiskFv.*`) axioms · `sorry`                       | **0 · 0** |

All 72 arrive through `execute` alone — its own axiom closure is the same 72.

---

# Spec side: what stays assumed

`RISC_V_assumptions` (`SailSpec/Auxiliaries.lean:949`) is **not** an axiom. It is a premise: 11
conjuncts naming the platform the proof is scoped to.

- machine privilege, and `mstatus.MPRV` clear
- exactly one PMA region, base `0`, covering ZisK's address space, r/w, misaligned access faulting
- no host-target interface; `misa` and `mseccfg` present

`root_soundness` carries it per-step, on the 11 memory opcodes (7 loads, 4 stores), inside the
`inputsAgree` binder. The other 52 do not carry it.

---

# Proof architecture: one opcode

Bottom-up. Nothing in steps 1-4 mentions a trace; the object is one abstract row.

1. **Extract both sides.** `LeanRV64D` from Sail; `Extraction/*.lean` from the pilout.
2. **Name the constraints.** Hand-written `AirsClean/` components and `Valid_<AIR>` predicates,
   welded to the generated polynomials at build time.
3. **Strip the Sail monad.** 63 `PureSpec.execute_<OP>_pure`, each proved equal to the real
   `execute` (`ZiskFv/SailSpec/`).
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

# Root theorem

ZiskFv/Soundness.lean:

```lean
theorem root_soundness
    [input data and assumptions] :
    [claim] := by
    [proof]
```

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

Still outside the statement either way: the Lean kernel, the Sail→Lean transpiler, Aeneas,
`pil-extract`.

---

# Root theorem claim

<style scoped>
section p, section li { font-size: 0.66em; }
section pre code { font-size: 0.60em; }
section li { margin-bottom: 0.15em; }
section pre { padding: 0.8em 1.2em; }
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

Read it outside-in. Everything but `StepSound` is bookkeeping:

1. `∀ i : Fin numInstructions` — one obligation per **executed step**, not per committed ROM entry.
   A loop body is proved once per visit.
2. `ziskStep i` — which of the 63 considered instructions this step claims to be. `StepSound`
   matches on it, so the arm picks the equation.
3. `chainedSailTrace ziskStep init` — the reference run, **built here, not supplied**: step `0` is
   `init`; step `j+1` is Sail's post-state after `execute`, then retire (`nextPC → PC`).
4. the nested `…_of_…` term — **not an assumption**. It rebuilds the row decode from binders already
   in the list: raw word → ROM row → Main row.

No AIR, no constraint, no weld appears here — those are inside what `StepSound` unfolds to.

---

# Root theorem claim: the calls

<style scoped>
section table th, section table td { padding: 0.4em 0.65em; vertical-align: top; }
section p { font-size: 0.66em; }
</style>

| call                                | type                                                       | what it does                                                 |
| ----------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| `chainedSailTrace ziskStep init`    | `(∀ i, ZiskStep ziskTrace i) → SequentialState → SailTrace | Builds the reference run — `SailTrace n := Fin n →           |
|                                     | n`                                                         | SequentialState`. Step `0` is `init`; step `j+1` is          |
|                                     |                                                            | `execute`'s post-state, then Sail's `tick_pc` (`PC :=        |
|                                     |                                                            | nextPC`).                                                    |
| `ziskStep i`                        | `Fin n → ZiskStep ziskTrace i`                             | Names the op. `ZiskStep` is an inductive with 63             |
|                                     |                                                            | constructors; each carries that op's `Claim_<op>` — decoded  |
|                                     |                                                            | operand and destination indices, plus the committed bus row. |
| `rawProgramDecodes i`               | `Fin n → RawProgramDecode ziskTrace i (ziskStep i) start   | A binder, not a computation: the evidence that raw word `k`  |
|                                     | addr rawProgram`                                           | lowers to this step's op. Lands in `Type 1`.                 |
| `programDecode_of_rawProgramDecode` | `… → ProgramRowsBinding … → RawProgramDecode … →           | Raw-word evidence plus `programBinding` ⟶ committed-ROM-row  |
|                                     | ProgramDecode ziskTrace i (ziskStep i)`                    | evidence. Per-arm, 63 cases.                                 |
| `rowDecode_of_programDecode`        | `ProgramDecode ziskTrace i zs → RowDecode ziskTrace i zs`  | ROM-row evidence ⟶ the Main-row decode bundle that indexes   |
|                                     |                                                            | `StepSound`. Per-arm, 63 cases.                              |
| `StepSound`                         | `(t : AcceptedZiskTrace n) → SailTrace n → Fin n → (zs :   | The only `Prop` here. Matches on `zs` and yields that arm's  |
|                                     | ZiskStep t i) → RowDecode t i zs → Prop`                   | single equation.                                             |

`n` is `numInstructions`; `SequentialState` is
`PreSail.SequentialState RegisterType Sail.trivialChoiceSource`. `RowDecode`, `ProgramDecode` and
`RawProgramDecode` land in `Type`, not `Prop` — a decode is **data** the caller hands over and the
theorem transports, not something the theorem proves.

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

# Ideal trajectory of the root theorem

---

# TCB

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
