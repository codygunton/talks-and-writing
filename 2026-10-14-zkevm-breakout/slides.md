---
marp: true
lang: en-US
title: zkEVM Breakout
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

# Update on Project 7: Security

Cody Gunton - October 14, 2026

https://codygunton.github.io/talks-and-writing/2026-10-14-zkevm-breakout/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Testing of Standards

[zkevm-test-monitor:#35](https://github.com/eth-act/zkevm-test-monitor/pull/35) testing of [zkevm-standards](https://github.com/eth-act/zkevm-standards/) beyond ISA compliance.

 - Current coverage: [accelerator interface](https://github.com/eth-act/zkevm-standards/tree/main/standards/c-interface-accelerators), [accelerated memory interface](https://github.com/eth-act/zkevm-standards/tree/main/standards/accelerated-memory-operations) and [I/O](https://github.com/eth-act/zkevm-standards/tree/main/standards/io-interface).
 - Proposed expectation: standards should come with a suite of tests

<iframe src="https://eth-act.github.io/zkevm-test-monitor/" style="width:100%;flex:1;border:1px solid #e2e8f0;border-radius:6px;"></iframe>

---

# Hash collision mitigations in guests

[@LukaszRozmej of Nethermind described](https://github.com/ethereum/EIPs/pull/12286) a DoS attack on 8025 provers. He makes the case for zkVMs to provide a per-proof construction source of randomness as the solution this security problem [here](https://github.com/ethereum/EIPs/pull/12289).

 - Seeding with `new_payload_request_root` was proposed as a mitigation, but it is not a complete solution.
 - FOCIL undermines the "builder won't DoS itself" rationale that this is issue goes away if we adopt "prover killer killer" strategy in an eventual mandatory proofs spec.
 - [zkevm-standards:#42](https://github.com/eth-act/zkevm-standards/pull/42): hosts provides unconstrained randomness.
 - [zkevm-test-monitor:49](https://github.com/eth-act/zkevm-test-monitor/pull/49): accompanying tests
 - [openvm:3165](https://github.com/openvm-org/openvm/pull/3165): demo implementation for OpenVM

---

# Formally Proving RISC-V Compliance of ZisK

https://github.com/eth-act/zisk-fv

Additional strengthening of zisk-fv:
 - Infra for stress testing: does changing constraints cause the lean build to fail.
 - zisk-fv:[#356](https://github.com/eth-act/zisk-fv/pull/356)-[#359](https://github.com/eth-act/zisk-fv/pull/359) remove ~500 assumptions on register operand columns
 - zisk-fv:[#377](https://github.com/eth-act/zisk-fv/pull/377)-[#390](https://github.com/eth-act/zisk-fv/pull/390) additional "welds" tying extracted constraints to a hand-built model (IOU tech debt cleanup)

Handoff meeting with ZisK team regarding integration into a broader fv program.

---

# Soundcalc

STIR support landed in [#90](https://github.com/ethereum/soundcalc/pull/90).


There is also progress on a Lean version of Soundcalc.

---


# Thanks for your attention!

<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
