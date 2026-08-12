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

Cody Gunton - August 12, 2026

https://codygunton.github.io/talks-and-writing/2026-08-12-zkevm-breakout/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# RISC-V Compliance Testing

https://github.com/eth-act/zkevm-test-monitor/

https://eth-act.github.io/zkevm-test-monitor/

- Added tests of GPU provers for OpenVM and SP1
 - OpenVM 2.1 is fully compliant with the standard target RV64IM_Zicclsm
 - SP1 still has gaps
- Upgraded to testing ZisK 1.0.0-alpha; one gap that is patched in 1.0.0-beta 👀

---

# zkvmBlast

Stefanos Chaliasos, Martín Ochoa and Varun Thakore published a RISC-V ZKVM fuzzing library with the help of an EF grant
 - Some contributions: seed corpus; Cascade-style RISC-V generation and random Rust program generation; fuzzer for several ZKVM proving pipelines (including GPU proving)
 - 7 bugs found and reported (and counting)
 - Blog post: https://blog.zksecurity.xyz/posts/zkvmblast/
 - Repo: https://github.com/zksecurity/zkvmblast
 - Seeds: https://github.com/zksecurity/riscv-seeds-lab


---

# ZKVM Handbook

Ignacio and I wrote a first draft of our ZKVM and guest program assessment frameworks:
https://github.com/eth-act/zkevm-standards/blob/main/handbooks/zkvm-handbook.md
 - Conform to eth-act standards; pass tests
 - Reproducible sufficient performance on reference hardware; reasonable proof sizes
 - Conform to cryptographic protocol and formal verification requirements
 - Permissive licensing

---

# Formally proving RISC-V Compliance of ZisK

https://github.com/eth-act/zisk-fv
 - Found two more circuit bugs while tightening hypotheses ([#1217](https://github.com/0xPolygonHermez/zisk/pull/1217), [#1228](https://github.com/0xPolygonHermez/zisk/pull/1228))
 - Still winding down solo work (50 PRs...) / ramping up to collaboration with ZisK
 - Discovered some dropped constraints by round-tripping (would have discovered in a root theorem API audit)


---

# Improvements in Verified-zkEVM libraries
- [CompPoly](https://github.com/Verified-zkEVM/CompPoly): shipping pre-built artifacts for faster development [301](https://github.com/Verified-zkEVM/CompPoly/pull/301), faster BN254 and BLS12 arithmetic [284](https://github.com/Verified-zkEVM/CompPoly/pull/284); more KoalaBear extensions [282](https://github.com/Verified-zkEVM/CompPoly/pull/282), [283](https://github.com/Verified-zkEVM/CompPoly/pull/283) and support for binary fields [278](https://github.com/Verified-zkEVM/CompPoly/pull/278).
- [ArkLib](https://github.com/Verified-zkEVM/ArkLib): Progress on WHIR formalization [534](https://github.com/Verified-zkEVM/ArkLib/pull/534), [599](https://github.com/Verified-zkEVM/ArkLib/pull/599), [603](https://github.com/Verified-zkEVM/ArkLib/pull/603), [616](https://github.com/Verified-zkEVM/ArkLib/pull/616), [658](https://github.com/Verified-zkEVM/ArkLib/pull/658), [667](https://github.com/Verified-zkEVM/ArkLib/pull/667)
