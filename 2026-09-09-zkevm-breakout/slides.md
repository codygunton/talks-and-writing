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

Cody Gunton - September 9, 2026

https://codygunton.github.io/talks-and-writing/2026-09-09-zkevm-breakout/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Hash collision mitigations in guests

@LukaszRozmej of Nethermind [described](https://github.com/ethereum/EIPs/pull/12286) a DoS attack on 8025 provers. He makes the case for zkVMs to provide a per-proof construction source of randomness as the solution this security problem [here](https://github.com/ethereum/EIPs/pull/12289).

 - Seeding with `new_payload_request_root` was proposed as a mitigation, but it is not a complete solution.
 - FOCIL undermines the "builder won't DoS itself" rationale that this is issue goes away if we adopt "prover killer killer" strategy in an eventual mandatory proofs spec.
 - Standards proposal [#something](): hosts could provide access to sampling unconstrained randomness.

---

# Formally Proving RISC-V Compliance of ZisK

https://github.com/eth-act/zisk-fv

Additional strengthening of zisk-fv:

---

# Soundcalc

STIR support will land in [#90](https://github.com/ethereum/soundcalc/pull/90), which is already approved by Benedict Wagner.

---

# Improvements in Verified-zkEVM libraries

- [CompPoly](https://github.com/Verified-zkEVM/CompPoly):
- [ArkLib](https://github.com/Verified-zkEVM/ArkLib):

<!-- TODO: this month's progress -->

---

# Thanks for your attention!

<!-- _class: lead -->
<!-- _paginate: false -->

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>
