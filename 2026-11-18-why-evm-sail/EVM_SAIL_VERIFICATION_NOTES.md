# EVM-Sail as a verification target: notes

Written 2026-11-17 from the zesislar project (proving the zesu RISC-V binary against EVM-Sail with Islaris/Iris in
Coq 8.19). Evidence is from `frisitano/evm-sail@d0e4aab` (our pin), Sail 0.20.2 (`25cc260d`), and zesislar's
`generated/evm-sail-coq/`. Statements marked [assessment] are judgement, not measurement.

## 1. EVM-Sail uses bounded integers, not bit-vectors, for words

- `sail/prelude.sail`: `type word = range(0, 2 ^ 256 - 1)`. Bytes, addresses and hashes stay bit-vectors
  (`bits(8)`, `vector(20, inc, byte)`, `vector(32, inc, byte)`).
- Header quantities are bounded integers: `block_number`, `block_timestamp`, `gas_limit`, `gas_used` are
  `range(0, 2^64 - 1)` (`ssz_uint_bound`); `base_fee` and `prev_randao` are `word`; gas is `nat`.
- In the Coq translation the bounds are erased. A range becomes plain `Z`, and constraints survive only as comments:
  `Definition u256 (value : Z) (*(0 <=? value) && (value <? (2 ^ 256))*) : word`.

What this means for proving an implementation against the spec:

1. Integers are not themselves the difficulty. Our automation converts 64-bit machine words to integers
   (`bv_unsigned`) before `lia`; a `Z`-valued spec saves a conversion layer.
2. The cost is wrap-around versus exact arithmetic. The implementation computes modulo 2^64; the spec computes exact
   integers inside declared ranges. Each place where the two must agree needs a no-overflow fact
   (`bv_unsigned (a + b) = bv_unsigned a + bv_unsigned b` only if `a + b < 2^64`), derived from input bounds. Known
   implementation bugs sit exactly here (e.g. an RLP long-length computation that wraps in zesu).
3. The erased bounds cost proof work. Sail's typechecker guarantees a result is in range, but the prover does not see
   it, so proofs re-derive bounds from the input, in large contexts, with solver calls.
4. [assessment] For RLP and header decoding this is a secondary cost: our benchmark telemetry puts most solver time
   on machine-side address and memory-region arithmetic, not on spec values. For 256-bit EVM arithmetic (four 64-bit
   limbs against an integer in [0, 2^256)) it would be a primary cost: limb-to-integer lemmas, mod 2^256 arguments,
   nonlinear multiplication and division, and range facts with large constants.

## 2. Which Sail output we use

We use Sail's Coq backend, not Lean or the OCaml interpreter. zesislar pins a decoder-only slice
(`generated/evm-sail-coq/`; roots `rlp_decode_item`, `rlp_ref_hdr`, `rlp_node_cursor`,
`decode_parent_header_fields`, `sail_model_init`; transaction and SSZ header decoders excluded), compiled by the
pinned Sail 0.20.2 with its Coq plugin into stdpp-based Coq (`SailStdpp`). Our contracts import it as `EvmSail` and
`EvmSailRlp`. Caveat: the full decoder (`evm_decoder.v`) needs Rocq 9 and our stack is Coq 8.19, so only its types
compile; the RLP functions compile and are what our meaning facts are stated against.

## 3. If we improved the spec and the Coq backend as much as possible

Backend (Sail to Coq), highest leverage:
1. Keep range bounds: emit them as propositions, or (simpler) emit one generated, automatically proved lemma per
   function and type ("the result of `f` lies in [0, n]"). These become sealed interface facts for callers.
2. Emit per-function unfolding equations (one per match branch), so proofs rewrite instead of unfolding large terms.
3. Emit Coq 8.19-compatible code, or move the proof stack to Rocq 9, so the full decoder compiles.
4. Emit pure functions where the Sail code has no effects, instead of wrapping them in the effect monad.

Spec (EVM-Sail):
1. Function boundaries that match the implementation's (one Sail function per implementation function, e.g.
   per-field decoders), so each proved callee has a spec function to seal against and exit proofs compose per call.
2. Wire widths explicit in the types (mostly true), and every place an implementation can wrap either impossible by
   type or marked as known behaviour.
3. Total, pure decoders over byte lists, without host operations on the decode path.

[assessment] Effect on zesislar's current blockers: small. They are in the machine-side step engine and address
arithmetic. Spec and backend work would help exit proofs of call-heavy blocks, no-overflow side conditions about
spec values, and future 256-bit arithmetic. Recommended first step: generated bound lemmas (backend item 1), then
matching function boundaries (spec item 1).

## 4. Implementation verification versus smart-contract verification

| | Implementation verification | Smart-contract verification |
|---|---|---|
| Question | Does the client compute exactly the spec? | Does this contract satisfy property P? |
| Scope | whole state transition: formats (RLP, SSZ), header validation, tries, exact gas, precompiles, forks | one message call or transaction |
| Approximation | not allowed (it is an equivalence) | sound over-approximation allowed (gas, unknown calls) |
| Structure wanted | function boundaries and data layouts close to the implementation | program logic with one rule per opcode |
| Arithmetic | bounded integers workable; bound lemmas matter | bit-vector words for SMT automation |
| Key artefact | executable reference that composes with refinement proofs | symbolic execution with strong automation |

One spec can serve both if layered: an exact executable core, plus a derived per-opcode word-level lemma library and
an abstract call/state layer. EVM-Sail today is built for the first.

## 5. A Sail interpreter implemented in Rocq or Lean

General effect (deep embedding: the Sail program as data, one interpreter defining its meaning):
- Gains: trust moves from the backend's translation of every function to one interpreter plus the syntax-tree export,
  testable against Sail's OCaml interpreter; a type-soundness theorem proved once yields every range fact; the
  Rocq 8/9 split disappears because the program is data; general theorems (determinism, totality, footprint) become
  provable.
- Costs: proofs about specific functions unfold the interpreter, which is slower and noisier; concrete evaluation is
  slower. The standard remedy keeps the shallow definitions and proves each equal to the interpreter run
  (translation validation).
- [assessment] No effect on zesislar's current blockers.

For smart-contract verification specifically:
- It gives one source of truth (contract proofs against the same reference as implementation proofs, instead of a
  separately written EVM model) and a fast in-prover executable spec (especially compiled Lean) for conformance
  testing.
- It does not help the limiting factor, ergonomics: symbolic execution would pass through two interpretation layers
  (Sail interpreter over EVM-Sail's EVM interpreter over bytecode). Usable tools would derive per-opcode step lemmas
  from it, and those lemmas are the real tool; the interpreter only certifies them. Program logic, world abstraction
  and bit-vector words are untouched. The existing shallow Lean translation already serves symbolic proofs better.

## 6. What EVM-Sail lacks to be competitive for smart-contract verification

Checked: the repo has the EVM interpreter (`sail/evm/interpreter.sail`, `execute.sail`); its 274 shipped Coq/Lean
lemmas are infrastructure (encodings, register transport, the RLP cursor), not bytecode reasoning. Missing:

1. Per-opcode step lemmas, so bytecode can be stepped symbolically without unfolding the interpreter.
2. A program logic (Hoare or separation logic for memory, storage, stack, jumps, calls and returns).
3. An abstraction of the outside world: storage as maps, unknown/adversarial external calls, reentrancy.
4. Bit-vector views of words with lemmas linking them to the bounded-integer definitions, for SMT-style automation.
5. Kept bounds (see section 1): today nothing in the prover knows a word is below 2^256 unless re-proved.
6. Gas handled abstractly, with lemmas that allow bounding or ignoring exact costs.
7. A symbolic-execution engine with automation built on items 1-4 (the main product of tools like KEVM).
8. A route from Solidity/Vyper: source maps, storage layout and ABI conventions.
9. One complete, maintained translated model in one prover (the full Coq translation needs Rocq 9; Lean is separate).

What it already has, and most contract tools lack: a precise, executable, implementation-grade semantics as a single
source of truth. Items 1, 2 and 7 are the bulk of the remaining work.
