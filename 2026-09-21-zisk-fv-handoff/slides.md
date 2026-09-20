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

This is a lean proof of RISC-V circuit _soundness_: if a trace satisfies the constraints, then the
trace is a valid RISC-V execution trace. (_completeness_ would say: every valid RISC-V execution
trace is accepted; afaik nobody proves this but I have some initial WIP in the repo)

---

# High-level: stats

Lean4 version: IOU Number of lines of Lean: IOU Number of commits: Build on [IOU machine spec]: IOU
minutes to extract (mem: IOU); IOU minutes to prove soundness theorem (mem: IOU) Tokens consumed:
IOU LOC activity graph showing when I did and didn't work on this

---

# High-level: status

- Conditional soundness theorem, partially hardened, untested in upgrades, 4-5 months behind zisk
  releases.
- Upstreaming of fork work needed
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

# Extraction & modeling: the evidence

| node                                                | status      | evidence                                              |
| --------------------------------------------------- | ----------- | ----------------------------------------------------- |
| raw 32-bit word                                     | modeled     | `rawProgram` binder, `Soundness.lean:1969`            |
| `DecodedRv64im` · `ZiskInst row`                    | extracted   | `ProductionM2.lean` (63 / 140 refs)                   |
| ROM table                                           | modeled     | `trace.program`; `ZiskRomMessage`,                    |
|                                                     |             | `Channels/ZiskRomBus.lean:58` (11 fields = `rom.pil`) |
| Main AIR row                                        | modeled     | `MainRowWithRom`, `AirsClean/Main/Row.lean:127`       |
| op-bus tuple                                        | modeled     | `OperationBusEntry`,                                  |
|                                                     |             | `Airs/OperationBus/OperationBus.lean:29`              |
| Binary / Arith rows                                 | modeled     | `BinaryRow` `Binary/Row.lean:78`; `ArithMulRow`       |
|                                                     |             | `ArithMul/Row.lean:81`                                |
| `Extraction/*.lean`                                 | extracted   | 18 modules, `nix/extracted-lean.nix`                  |
| `Valid_<AIR>`                                       | modeled     | `Valid_Main`, `Airs/Main/Main.lean:23`                |
| ELF · `ZiskRom` map · `EmuTrace` · `*.pil` · pilout | not in Lean | no match under `ZiskFv/`                              |

---

# Extraction & modeling: the evidence

| link                                                | status      | evidence                                                  |
| --------------------------------------------------- | ----------- | --------------------------------------------------------- |
| `riscv::decode_32_core`                             | extracted   | called `riscv_interpreter.rs:250`; start                  |
|                                                     |             | `aeneas_extract.rs:353`                                   |
| `Riscv2ZiskContext::lower_rv64im_single_row`        | extracted   | start `aeneas_extract.rs:361`; production delegates       |
|                                                     |             | `riscv2zisk_context.rs:667`                               |
| `aeneas_extract::extract_transpile_rv64im_rows_raw` | extracted   | `aeneas_extract.rs:377`; in `ProductionM2.lean`           |
| `pil-extract air`                                   | extracted   | `nix/extracted-lean.nix`                                  |
| `RawProgramBinding.ProgramRowsBinding`              | **assumed** | `RawProgramBinding.lean:172`; row content comes from      |
|                                                     |             | `romRowOf:103`, only the layout is assumed                |
| `AcceptedZiskTrace.channels_balanced`               | **assumed** | `AcceptedZiskTrace.lean:93`                               |
| `AirsClean.Main.mainWithRom`                        | modeled     | `Main/Constraints.lean:242`                               |
| `OperationBus.opBus_row_Main`                       | modeled     | `OperationBus.lean:62` (mirrors `main.pil:367`, unwelded) |
| `AirsClean.*MirrorWeld`                             | modeled     | 6 files, 5.2k lines                                       |
| `AirsClean.Main.Bridge.rowAt`                       | modeled     | `Main/Bridge.lean:34`                                     |
| `riscv::riscv_interpreter` ·                        | not in Lean | —                                                         |
| `Riscv2ZiskContext::insert_inst` ·                  |             |                                                           |
| `RomSM::compute_trace_rom` · `Emu::step_fast` ·     |             |                                                           |
| `Emu::build_full_trace_step` · `pil2-compiler`      |             |                                                           |

---

# Extraction & modeling: the evidence

Labels are qualified: `Type::method` is Rust, `Module.name` is Lean. The `BTreeMap` is
production-only — under `aeneas_extract` the field becomes `extract_inst : Option<ZiskInstBuilder>`
and `insert_inst` keeps one row (`riscv2zisk_context.rs:87-89,105-112`). Aeneas never sees the map.

**assumed ≠ not in Lean.** A premise is a hypothesis `root_soundness` needs. Code that is not in
Lean cannot make the theorem false.

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

<span style="color:#22c55e">■</span> extracted &nbsp; <span style="color:#f59e0b">■</span> modeled &nbsp; <span style="color:#ef4444">■</span> assumed &nbsp; <span style="color:#0c9fde">■</span> proved, in the theorem &nbsp; <span style="color:#94a3b8">■</span> not in Lean

---

# Extraction: spec side

| Extractor | Upstream input | Lean output |
| --- | --- | --- |
| `sail --lean` (sail 0.20.1) | `riscv/sail-riscv@04e5959`, `--all-modules` | `build/sail-lean/` |

One `ninja` target, `generated_lean_rv64d` (`model/CMakeLists.txt:404-473`),
driven by `nix/sail-lean-tree.nix`.

**146 `.sail` files · 27,769 lines → 149 `.lean` files · 145,355 lines.**

---

# Extraction: spec side — not everything is generated

| file | lines | ships with | what it is |
| --- | --: | --- | --- |
| `LeanRV64D/Sail/*.lean` | 1,215 | sail | the monad, `SequentialState` |
| `LeanRV64D/RiscvExtras.lean` | 117 | sail-riscv | **75 axioms** |
| `nix/sail-lean-v4.28-compat.patch` | 2 files | us | prelude targets a Lean nightly |

`RiscvExtras.lean` is copied in verbatim; only the module name is rewritten.
The pinned `codygunton/sail` flake input is **unused** — nixpkgs' sail generates.

---

# Extraction: spec side — the ZisK profile

`nix/sail-riscv-zisk-rv64d.json` replaces `config/rv64d_v256_e64.json`.
It is **baked into the Lean**, not read at runtime:

```lean
-- LeanRV64D/Extensions.lean:637
def hartSupports (merge_var : extension) : Bool :=
  match merge_var with
  | Ext_M => true
  | Ext_A => false
  | Ext_F => false
  ...
```

Also fixed: no PMP, no misaligned access, machine mode only, one memory
region at base `0` of size `0x1_0000_0000`, r/w/x.

---

# Extraction: spec side — the cost of one dispatcher

The F and D **code** still ships, even though the extensions are off.

`instruction` has **343 constructors** (`Defs.lean:739`) and `execute`
(`InstsEnd.lean:69929`) dispatches all of them. So all **67 softfloat axioms**
stay in `root_soundness`' closure, over arms no ZisK proof ever unfolds.

zisk-fv's per-opcode proofs use **19** of those constructors, covering the
63 RV64IM opcodes.

---

# Modeling: spec side

| | |
| --- | --- |
| `ZiskFv/SailSpec/<op>.lean` | 63 files, 7,536 lines — one per opcode |
| `SailSpec/Auxiliaries.lean` | 996 lines — platform theorems, monad rewriting |
| `SailSpec/BusEffect.lean` | 132 lines — ZisK bus rows as a Sail state update |

Each opcode file does two jobs:

1. **restate** Sail as `PureSpec.execute_<shape>_<op>_pure` — monad stripped,
   decode dispatch gone, trap arms the profile kills gone;
2. **prove** `execute_<shape>_<op>_pure_equiv` against the real `execute`.

---

# Modeling: spec side — these welds are load-bearing

| | ZisK side | spec side |
| --- | --- | --- |
| mirror | `Valid_<AIR>`, `AirsClean/` | `PureSpec.execute_*_pure` |
| weld | `AirsClean/*MirrorWeld.lean` | `PureSpec.*_pure_equiv` |
| welds in `root_soundness`' closure | **0** | **63 of 63** |

Delete a `MirrorWeld` and `root_soundness` proves what it proved before.
Delete a `_pure_equiv` and it does not compile.

Constant-dependency walk, 48,594 constants: `LeanRV64D.Functions.*` **1,727 of
5,179** · `Extraction.*` **72** · `PureSpec.*_pure_equiv` **63** · `MirrorWeld` **0**.

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

`execute : instruction → SailM ExecutionResult` reads and writes that state
through `Sail.readReg` / `Sail.writeReg`.

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

Everything downstream is an equation between two `EStateM.Result`s: the state
Sail reaches, and the state the ZisK bus rows describe.

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

`bus_effect` (`SailSpec/BusEffect.lean:34`) folds a step's memory-bus rows into
a `SequentialState`:

- a **pull** (multiplicity `-1`) becomes a read *hypothesis* —
  `state.mem[ptr]? = .some byte`, or `read_xreg r state = .ok val state`
- a **push** (multiplicity `+1`) becomes an actual *write* —
  `state.mem.insert ptr byte`, or `write_xreg r val state`
- the execution-bus pair gives the current `PC` and writes `nextPC`

Every `equiv_<OP>` equates that fold with `execute_instruction`.

---

# Spec side: what stays assumed

| | |
| --- | --: |
| axioms in `RiscvExtras.lean` | 75 |
| of those, in `root_soundness`' closure | **72** |
| softfloat (`riscv_f*`, `riscv_*ToF*`) | 67 |
| platform / reservation (`plat_term_write`, `*_reservation`, `get_16_random_bits`) | 5 |
| project (`ZiskFv.*`) axioms · `sorry` | **0 · 0** |

All 72 arrive through `execute` alone — its own axiom closure is the same 72.

---

# Spec side: what stays assumed

`RISC_V_assumptions` (`SailSpec/Auxiliaries.lean:949`) is **not** an axiom. It is a
premise: 11 conjuncts naming the platform the proof is scoped to.

- machine privilege, and `mstatus.MPRV` clear
- exactly one PMA region, base `0`, covering ZisK's address space, r/w,
  misaligned access faulting
- no host-target interface; `misa` and `mseccfg` present

`root_soundness` carries it per-step, on the 11 memory opcodes (7 loads,
4 stores), inside the `inputsAgree` binder. The other 52 do not carry it.

---

# Proof architecture: one opcode

Bottom-up. Nothing in steps 1-4 mentions a trace; the object is one abstract row.

1. **Extract both sides.** `LeanRV64D` from Sail; `Extraction/*.lean` from the pilout.
2. **Name the constraints.** Hand-written `AirsClean/` components and `Valid_<AIR>`
   predicates, welded to the generated polynomials at build time.
3. **Strip the Sail monad.** 63 `PureSpec.execute_<OP>_pure`, each proved equal to the
   real `execute` (`ZiskFv/SailSpec/`).
4. **One opcode, one equation.** `equiv_<OP>` says the Sail step equals `bus_effect` of
   that opcode's bus rows. `EquivCore/` → `Compliance/Wrappers/` → `Equivalence/`, 63 each.

---

# Proof architecture: one trace

From step 5 the object is an `AcceptedZiskTrace`: a committed ROM, 15 filled tables,
7 obligations.

5. **Bundle the arms.** Ten family dispatchers prove `zisk_riscv_compliant_program_bus`
   for all 63 `OpEnvelope` arms — still over abstract rows.
6. **Attach to the witness.** `stepStrong_<op>` restates each arm with bus rows read off
   the trace (61 theorems; `jal` / `jalr` inline).
7. **Dispatch per step.** `stepSound_of_evidence` turns `ZiskStep i` into `StepSound i`:
   one Sail-equals-ZisK equation per executed step.
8. **Chain the steps.** `root_soundness` runs one induction on the step index carrying
   register agreement and PC agreement, from the `regBoot` / `pcBoot` base cases.

---

# Top-level theorem
```
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
