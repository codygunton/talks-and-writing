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
1. Back to the big picture: what do we want to prove? (Note: not repeat much the Introduction, but is a good moment to refresh it)
  a. How does a node work today?
  b. As we increase the gas limit, what are the bottlenecks or resources with pressure?
2. How do zkVMs help in our particular use case?
  a. CPU resources: Exploit asymmetry mentioned in introduction.
  b. Storage resources: remove needs from EL
  c. Network resources: make it more predictable, less bursty, and constant (Highlight: at some gas limit...)
3. What is an "Ethereum guest"?
  a. Diagram with CL <--> EL integraction involving EngineAPI.
  b. Show diagram of "Ethereum guest = [EngineAPI + STF + Output]
  c. Explain "Private inputs" and "Public inputs".
  d. Come back again to what the proof + proof_inputs mean for the CL (proof verifier).
4. How to build an "Etheruem guest"?
  a. Implement described guest program in language that can compile to RISCV64IM (link to standard). 
    i. From scratch (TODO: ask if Besu new guest program repos can be linked?)
    ii. Refactor existing ELs (Reth, Ethrex, Zilkworm) (requires tuning: refactorings, no_std, optimizations)
  b. Use zkEVM standards to be zkVM-agnostic (link to Marcin/Kev work on this front)
    i. IO for inputs and ouputs
    ii. Accelerators (i.e. zkVM precompiles)

# Protocol changes
1. Do we need to do protocol changes for any of this?
  a. Resources are limited and we have constraints
    i. Resources: Capex, opex, bandwidth
    ii. Constraints: proving time, proof size, proof verification time, security bits
    iii. If the protocol isn't aware of proofs: who is responsible for genrating and propagating them?
  b. "Prover Killers" 
    i. What is this and why is a problem? 
    ii. Put a concrete example to make it clear.
    iii Benchmark & repricings
    iv. Code-chunking
    v. Binary Trees?
  c. Gain more proving time: ePBS
    i. Show current slot time structure and new one. 
  d. Free network resources: BiB
    i. Verifying a block doesn't require downloading the whole block
    ii. Release bandwidth pressure from the network in a safe way
  e. Prover incentives
    i. An economically-rational block builder should want to include proofs, but how do we make sure they do?
    ii. "In research mode"? (Not sure what else to say here...)
