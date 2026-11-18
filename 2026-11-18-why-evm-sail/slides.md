---
marp: true
lang: en-US
title: Why evm-sail?
description: A draft case for one shared, executable EVM specification
theme: zkevm-dark
transition: fade
paginate: true
_paginate: false
style: |
  section table { font-size: 0.65em; }
  section table tr:nth-child(odd),
  section table tr:nth-child(even) { background: #181e26; color: #e0e0e0; }
  section table th { background: #242c38; color: #8abff9; }
  section pre { font-size: 0.64em; }
---

<!-- _class: lead -->

<script src="assets/theme-bg-light.js"></script>
<script src="assets/sparkles-light.js"></script>
<script type="module" src="assets/mermaid-zkevm-light.js"></script>

# Why evm-sail?

Cody Gunton · 18 November 2026

https://codygunton.github.io/talks-and-writing/2026-11-18-why-evm-sail/

<img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">

<div class="bottom-bar"><img src="assets/logo-zkevm-light.svg" class="logo" alt=""></div>

---

# Why evm-sail?

My dream:

  - One canonical EVM specification with broad, collective ownership.

It should work for:
- Verification that EVM implementations comply with the specification.
- Differential testing.
- Client dev collaboration.
- Smart contract verification.

---

# Why not something else?

My anti-goals:

- A patchwork of specifications connected by equivalence theorems.
  - Who maintains those theorems as Ethereum changes?
  - Which specification defines correct behavior?
- Lock-in to Lean or any other tool.
- A bunch of little experiments.

---

# Why Sail? Existing use and maintenance

- Maturity:
  - Developed since 2013; 122 Github contributors
  - Used for RISC-V specification since 2019
- Maintenance: clear maintainer [Alasdair Armstrong](https://github.com/Alasdair)
- Flexibility: Sail is a language, not a library.
  - Minimal abstractions: registers, bitvectors, numeric constraints, and mappings.
  - Extractability: restricted programs and explicit effects support fv
  - Many backends: can extract to C, Lean, Rocq, Isabelle, HOL4, SystemVerilog

<!-- Sources: https://alasdair.github.io/manual.html ; https://www.cl.cam.ac.uk/users/pes20/sail/sail-popl2019.pdf . Backends differ in supported features and required host definitions. Extraction does not establish translator correctness. -->

---

# Sail example: registers

The global context is a machine model; registers are global variables:

```sail
register counter : bits(8) = 0x00  // Named state, with an eight-bit type.

function increment() -> unit = {
    let previous = counter;       // Read the register.
    counter = previous + 0x01     // Write the register.
}

function twice() -> bits(8) = {
    increment();
    increment();                  // Reads the first call's updated value.
    counter                       // Returns 0x02 if counter started at zero.
}
```

<!-- This example is illustrative, not copied from evm-sail. Persistent means across calls within one model execution, not storage on disk. In prover output, register reads and writes become explicit state operations. evm-sail d0e4aab uses registers at frame boundaries in sail/evm/machine.sail. -->

---

# Sail example: bitvectors and bitfields

Bitvectors have fixed widths and support specialized proof automation:

```sail
let x : bits(8) = 0xff;
let y : bits(8) = x + 0x01;  // Wraps to 0x00.
let high : bits(4) = x[7 .. 4];  // Extracts 0xf.

// example: sign extension
val extend_byte : bits(8) -> bits(256)
function extend_byte(x) = sign_extend(x)
// 0x80 becomes 248 leading ones followed by 10000000.
```

The Python specification manually selects bytes, checks the sign, and adds padding.
Sail supplies the operation and checks the widths.

Bitfields give names to slices of a bitvector:

```sail
bitfield Header : bits(8) = {
    kind : 7 .. 4,
    size : 3 .. 0
}
```

<!-- Both examples are illustrative, not copied from evm-sail. Python comparison: execution-specs src/ethereum/forks/cancun/vm/instructions/arithmetic.py, signextend. The full EVM SIGNEXTEND instruction still needs dynamic byte selection and boundary cases. sign_extend is a Sail library operation supported by its backends. -->

---

# Proving friendliness: code and types

| Feature | Python permits | Sail restriction | FV simplification |
|---|---|---|---|
| Runtime code | `eval`, `exec` | No runtime source execution | Can't prove much about unknown code? |
| Types | Dynamic re-typing | Static type checks | E.g., no `v > 0 && IsUint32(v)`. |
| Dynamic Classes | E.g. replacable methods | Static data structures | No need to check `inst.foo` def is unchanged at each invocation. |
| Reflection | `if hasattr`, `inspect.currentframe` | No general runtime reflection | Less fragile, more modular, smaller scope. |

<!-- Source: Sail POPL 2019 paper and manual. These are core-language distinctions, not a claim that every accepted Sail program translates through every backend. -->

---

# Smart contract verification?

**What we have**

- An executable model of bytecode behavior, including gas, calls, and rollback.
- Generated Lean and Rocq definitions that contract proofs can reference.

Possible improvements: expand the extractor to generate lemmas
- Numeric bounds that proofs can reuse, such as `word < 2^256`.
- A proved bitvector view of word operations so proofs can use bitvector solvers.
- A clear interface for reasoning about one opcode without unfolding the interpreter.


---

# Lemma example

Shared proof steps. Read opcode byte `0x01` at the PC, decode `ADD`, and dispatch to its handler.

<div class="columns">
<div>
Simplify the handler
<pre><code>unfold execute_add
use stack and gas facts
simplify two pops and one push
simplify addition and gas charge</code></pre>
</div>
<div>
Apply a proved lemma
<pre><code>apply execute_add_success
  (stack = a :: b :: rest)
  (gas &gt;= ADD_COST)</code></pre>
</div>
</div>

Same result. The stack becomes `wrap256(a + b) :: rest` and gas falls by `ADD_COST`.

The extractor could generate routing equations from the dispatch table.
For arithmetic handlers, it could instantiate a shared rule that the prover checks.

<!-- Proof pseudocode. In evm-sail, execute_add updates the stack cursor and gas. The enclosing step advances the PC. -->
