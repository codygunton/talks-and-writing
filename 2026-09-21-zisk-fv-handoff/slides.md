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

In scope: IOU list of dirs in scope for zisk extraction.


# Extraction: zisk side
IOU: mermaid showing the progression of an elf and data through down to instructiosn flowing through busses, colored to show which steps are extracted and which are modeled.Nodes are datatypes, names above arrows are function names, below ares are the name of the extraction functions in ziskfv




---

# Modeling: zisk side

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
