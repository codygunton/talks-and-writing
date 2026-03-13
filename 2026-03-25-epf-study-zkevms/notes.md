ZKEVMs talk by me and Ignacio

Goals: students can answer
 - What does a SNARK / STARK let us do
 - (Non-)relationship with state and block building.
 - Changes needed for ZKVMs
 - The grand vision of scaling

---

# Introduction
- Start with the point
  - Attester requirements now
  - The problem of scaling
  - ZKVM prover-verifier assymmetry fixes this
  - Optional vs Mandatory proofs

# ZKVMs
- How it started: quick opinionated history; inspo screen shots of
  - barry whitehat vid
  - early papers, sumcheck
  - groth 2009ish, kzg
  - zcash, pinocchio, groth16
  - FRI, STARK, Plonk

- Skeleton of a SNARK
  - describe program as a circuit
  - public and private inputs
  - witnesses
  - PIOPs, PIOPPs, PCSs
  - proofs

- Putting this into practice
  - Circuits vs ZKVMs
  - RISC-V
  - Recursion

# Ethereum Guests
Suggestion: repeat of some of introduction section; what are we snarkifying; differences and challenges of programming for snarks

# Protocol changes
Suggestion: high level speed run of forthcoming dependencies (repricings, BALs, ePBS, BiB) and the path to full scaling (mandatory proofs; 1-2 slides on statelessness; code chunking)


