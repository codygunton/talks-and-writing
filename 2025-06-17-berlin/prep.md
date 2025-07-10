# Intro
- Who I am, how to find me.
- Immediately express optimism: "Today's zkVMs will let us bring Ethereum to _____ (people, tps, value secured)"
- These things are monstrously complex and the most experienced people in the space regularly make significant mistakes.
- Number of bugs in real CPUs (I think this was in the MorFuzz Youtube talk?)
- But we absolutely cannot be complacent. 
- Fuzzing: throw a ton of high-quality random inputs at your programs and detect weird behavior.

# Modular approach to ZKVM security
Focus on RISC-V for concreteness.
Goal: prove that some code was executed for some particular set of inputs. 
- Key example for us: Reth was executed on the most recent Ethereum block.
- Components:
  - Compilation: E.g.: use gcc to compile Reth to get literal RISC-V binary ("ELF file").
  - Emulation: feed inputs into RISC-V binary and record computation (e.g., plug in Ethereum block _____; e.g. to introduce some actual opcodes).
  - Witness generation: expand on computation for consumption by the proving system (e.g.: code excerpt from risc0)
  - Proving: convert witness to polynomials; commit to polynomials, operate on polynomials show gate equations hold and to link polynomials to constraint checking argument.
  - Verification: parse the proof to field elements; operate on field elements to produce boolean `verified`
- Formal Verification initiative
  - What it can do and when it can't do.
  - FV code is still code and it can still have bugs in it.
  - Fuzzing as a backup plan and additional quality assurance.
- FV coverage:
  - Compilation: No: there was a DARPA grant to do FV of rustc but that is dead now?
  - Emulation: Yes: there exists a Sail model of RISC-V; can prove an emulator adheres to these semantics? I think?
  - Witness generation: Yes; we will compile the circuits to LLZK and use this to prove that the circuits adhere to the Sail model.
  - Proving: Yes: Arklib will be a toolkit for formally describing proving systems and we can then try to prove that implementations adhere.
  - Verification: ditto.
- Fuzzing coverage:
  - Compilation: Yes but not by us; ____ (point to projects fuzzing compilers; describe what you test)
  - Emulation: Yes: differentially against a reference model.
  - Witness generation: Yes with mutations.
  - Proving: Can extend witness generation; can do coverage-based fuzzing for crashes and unexpected verifications.
  - Verifier: Must do standalone for crashes.
- In summary, fuzzing can let us fine soundness bugs, completeness bugs and crashes. 
  - Soundness bugs are traditionally the most scary: "You think I followed the rules but I didn't".
  - Completeness bugs are also scary!: "I am trying to withdraw my funds from this pool but the system won't let me because it says the proof is invalid". 
  - Crashes are also bad: 
    - "90% of the prover marketplace uses ZZZ and it can't process blocks right now because someone is spamming us with an evil tx"
    - "I am trying to withdraw my funds from this pool but the system won't let me because it crashes 90% of the validators". 

# Fuzzing
Throw a ton of high-quality random inputs at your programs and detect weird behavior.
- Hiqh-quality inputs: 
  - EVM bytecode? There exist fuzzers for this.
  - RISC-V bytecode
    - CSmith/Yarpgen: Generate C/C++ programs and compiles to RISC-V
    - risc-vd (?)
    - Cascade
  - Circuit IR
    - System specific: zirgen? ____?
    - Security tooling: LLZK? CircIL? 
  - Polynomials to prover? None afaik but what's the attack 
  - Proofs to verifier? None afaik.
- Higher quality inputs:
  - Coverage guidance and good (e.g. evolutionary) algorithms.
  - Other statistics from fuzzing campaign?
  - Good seed corpus.
- Weird behavior:
  - Crashes in any part of the pipeline
  - Successful proving when not expected via mutation of inputs ("dangling witness detection")
  - Failing to prove on valid inputs (how to find intelligently?)
  - Successfully proving when not expected via metamorphic oracle (they say they found soundness bugs but I'm confused)

# ...but first, testing
RISC-V arch tests
  - AFAIK not implemented by anyone
  - Required for use of brand
  - Run differentially against Sail model or Spike (nb bugs in Spike!); detect and dump "signature" regions of memory and compare.
  - ___ tests in total; 500 (mostly edge case) tests of addition alone
  - Good for establishing compliance which will help with using existing ecosystem of tools
  - Framework out of date: requires CSRs etc to be implemented; have to hack around, but it is flexible enough to work.
  - Applying this has already uncovered a core circuit bug.
But even that isn't enough?
  - Can't just compare registers; unintended writes to memory not covered for example.
  [ ] There are frameworks that attempt to do this through "cosimulation" ____, etc.

# Todo
 [ ] There were bugs in Spike
 [ ] Look at what Aztec did
 [ ] Memes
 [x] ZK sophistication of audience
 [x] Difference between RISC-V emulator and circuits.
 [ ] Find FV failures in industry (were some of the CPU bugs from formally verified projects)
 [ ] What Picus doesn't do; correctness of circuits is a matter of intent.
 [x] Learn more about Sail in FV project
 [ ] Can I spend at least 15/25 minutes on fuzzing and my work?
 [ ] Split into "what can be done" and "what will be done" and "is it being worked on"?
 [ ] Explain some bugs that have been caught with mutations by Diligence
 [ ] Look at EVM fuzzers
 [ ] How does Sail produce simulator?
 [ ] Show some RISC-V 
 [ ] People will be satisfied if they get some alpha
      - In some way looked at five projects
      - rv32i fences are missing, nobody I've looked at is compliant
      - rv32im the standard; an "embdedded target" assuming no opcodes
      - rv64gc desired for maintaining client diversity
      - https://github.com/riscv-software-src/riscv-tests/issues/368 canonical unit test framework not updated to reflect changes at 2.1 (1.0, 2.0-2.4) from 2021.
      - Only one project I've found implements the architecture tests (much more thorough).
      - Existing RISC-V generators target hardware and assume you have a system described in SystemVerilog that you will virtually instantiate with an RTL (Register-Transfer Level) simulator. Open source alternatives are not supported (though perhaps we could fund work on this).
      - I found a bug.
      - 
