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

# Handing Off ZisK-FV

Cody Gunton - September 21, 2026

https://codygunton.github.io/talks-and-writing/2026-09-21-zisk-fv-handoff/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Agenda

1. What zisk-fv is, and what it is not
2. Repository tour
3. Proof architecture
4. Current state: proved, partial, open
5. Build, test and CI
6. Track record: bugs found
7. Known gaps and risks
8. Handoff plan and owners

<!-- TODO: cut to fit the slot; confirm the time budget -->

---

# What zisk-fv Is

Lean 4 formal verification of the ZisK zkVM against the Sail RISC-V specification.

https://github.com/eth-act/zisk-fv

- Target ISA: <!-- TODO: state the exact target, e.g. RV64IM_Zicclsm -->
- In scope: <!-- TODO: which circuits and which properties -->
- Out of scope: <!-- TODO: name the exclusions explicitly -->

---

# What zisk-fv Is Not

Say the limits out loud. They matter more than the results.

- No claim about: TODO <!-- e.g. the proof system itself -->
- Trusted base we do not verify: TODO
- Hypotheses that stay unaudited: TODO

---

# Repository Tour

<!-- TODO: one line per directory; keep it to the paths a new owner must open first -->

| Path | Holds |
| --- | --- |
| TODO | TODO |
| TODO | TODO |
| TODO | TODO |

---

# Proof Architecture

<!-- TODO: edit diagrams/proof-chain.mmd so it matches the real chain -->

<div data-mermaid="diagrams/proof-chain.mmd" style="display:flex;align-items:center;justify-content:center;width:100%;"></div>

- The root theorem states: <!-- TODO -->
- It depends on these hypotheses: <!-- TODO -->

---

# Current State

<!-- TODO: give counts, not adjectives -->

- Proved: <!-- TODO: which instruction classes, how many theorems -->
- Partial: <!-- TODO: what is stated but still has `sorry` -->
- Open: <!-- TODO: what is not started -->
- Axiom hygiene: <!-- TODO: result of the axiom check on the root theorem -->

---

# Build, Test and CI

<!-- TODO: paste the exact commands a new owner runs on day one -->

```bash
# TODO: toolchain pin and cache fetch
# TODO: full build
# TODO: focused build for the inner loop
```

- Lean version pin: <!-- TODO -->
- Full build time: <!-- TODO -->
- CI workflow: <!-- TODO: link -->

---

# Track Record: Bugs Found

The proofs found real circuit bugs. Use this to set expectations.

- [#1217](https://github.com/0xPolygonHermez/zisk/pull/1217): TODO
- [#1228](https://github.com/0xPolygonHermez/zisk/pull/1228): TODO
- Dropped constraints found by round-tripping: TODO

---

# Known Gaps and Risks

<!-- TODO: be blunt; this is the most useful slide for the new team -->

- Gap: TODO <!-- why it is open, and the cost to close it -->
- Risk: TODO <!-- and the signal that tells you it became real -->
- Deliberate spec/circuit divergence: TODO

---

# Handoff Plan

<!-- TODO: confirm each row with the receiving team before the call -->

| Item | Owner after handoff | Date |
| --- | --- | --- |
| Proof maintenance | TODO | TODO |
| CI and toolchain bumps | TODO | TODO |
| Review of new circuit changes | TODO | TODO |
| Escalation to me | TODO: how long, which channel | TODO |

---

# What I Need From You

- A named proof owner: TODO
- Notice before circuit changes land: TODO
- A decision on the first milestone: TODO

---

# Thanks - Questions?

<!-- _class: lead -->
<!-- _paginate: false -->

https://github.com/eth-act/zisk-fv

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
