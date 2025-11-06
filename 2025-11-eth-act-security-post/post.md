DRAFT DRAFT DRAFT

[toc]

# Introduction
In the story of Ethereum's growth, there exists a central tension between the networking and hardware requirements of nodes, which must be kept low so that the consensus network can remain decentralized, and the throughput of the network in terms of the amount of EVM computation to which it can attest, which we must grow in order for Ethereum to achieve its full potential. A forthcoming change to the protocol uses zkVMs to resolve this tension by inviting new, higher-powered entities, Provers, to construct proofs of block validity to be checked by nodes, who run Verifier software to check the proofs. These proofs are tiny in comparison the transactions they prove, and validators do not need to receive all of the state updates, so the networking requirements placed on a nodes remain low. Moreover, the work of checking a proof is tiny in comparison to the work of re-executing all of the transactions in a block, so validators can continue to run on modest hardware. In short, this is a massive change to environments where the STF is executed which is a net increase in the attack surface of the of the Execution Layer. That said, the project of scaling brings benefits of in terms of economic security and continued centrality of Ethereum as part of the global economy. (⛔TODO⛔ not sure how to say this well, talk about eth price?)

The present article gives an overview of the security considerations of this change, emphasizing the security at the software level.

## Teminology

We use the following terms and abbreviations:
 - EL: The Execution Layer in an Ethereum [node](https://ethereum.org/developers/docs/nodes-and-clients/). EL clients are responsible for checking validity of blocks, among other responsiblities.
- CL: The Consensus Layer, introduced in The Merge, which handles proof of stake consensus.
- The STF, $\Upsilon$: The State Transition Function, sometimes denoted by the Greek letter, $\Upsilon$, which describes the legal state transitions of the network. Currently this is implemented by EL clients.
- zkVM: A piece of software that implements a virtual machine and can provide cryptographic attestations ("proofs") to the correct execution of code runnable by that machine.
- Guest Program: The compilation of a computer program to be executed by a zkVM.
- zkEVM: A piece of software that implements the Ethereum Virtual Machine and can provide cryptographic attestations to the correct execution of EVM programs. zkEVMs are almost always build by choosing a zkVM setting the guest program to be an implementation of the STF $\Upsilon$. The claim that a state transition $s_{\text{out}} = \Upsilon(s_{\text{in}})$ is valid is equivalent, for all practical purposes, to the claim that a zkEVM proof constructed with inputs $(s_{\text{in}}, s_{\text{out}})$ is valid.
- ISA: The low-level language two which a computer program is ultimately translated before being executed by hardware or software. Examples include x86-64, ARM, RISC-V, MIPS, WASM. 
- RISC-V ISA RV[XLEN][EXTS]: RISC-V defines a family of ISAs that can have XLEN=32 or 64 (this determines the width of registers and the size of the address space) and a set of extensions (groups of new instructions suited to particular tasks or environments).
 
## Overview of changes
At present, to check block validity, nodes execute an implementation of the STF. After the changes, nodes will optimistically await proofs of STF Execution.

Before zkEVMs:
 - EL software is compiled ISA of the node's CPU, say x86-64 or ARM, or interpreted, depending on language.
 - CL requests validation of a block
 - EL re-executes every transaction in the block.

With zkEVMS:
 - STF is compiled to ISA of zkVM, say, rv32im augmented with special instructions to handle precompiles and syscalls.
 - Provers, entities distinct from Ethereum nodes, construct execution proofs for Ethereum blocks, and broadcast those proofs.
 - CL waits for proofs to arrive
 - CL verifies those proofs
 - (EL still responsible for syncing, state mangement, and more.)

## A word on diversity via a "multiproofs strategy"
Diversity among implementations of zkEVMs will be a critical component of security. This diversity should be diversity of both of zkVM provers and of STF implementations. If CL clients do not accept a block until several different zkEVM proofs have been verified, covering diversity of both EL implementations and zkVMs, then security is much greater than it would be with a single proof. We refer to this strategy as a "multiproofs" strategy. (⛔TODO⛔: reference?)

## A word on formal verification
The [zkEVM Formal Verification Project](https://verified-zkevm.org/) has an goal to formally verify some components of zkEVMs. These include verifying that certain zkSNARK protocols are secure, and verifying correctness adherence of virtual machine specifications (EVM and RISC-V) to formal specifications. These techniques are powerful but can be slow to develop, and we do not believe that formal verification should be a blocker for scaling L1 with zkEVMs.

## A word on "zk"
It is important to acknowledge regularly that we often use the term "zk" (zkVM, zk proving, etc.) for systems that merely provide SNARK proofs. These are good enough for scaling, but the reader should know that these proofs do not provide guarantees of privacy, which would come at the cost of both additional complexity and additiona prover work.

# Components of security
For the remainder of the article, we will zoom in on several aspects of security of the system and how they change with zkEVMs. To each we attribute a subjective measure "level of concern" which is the author's opinion, roughly, now the potential for a serious exploit due to this factor. Opinions, of course, vary a lot, and the opinions here do not necessarily reflect those of the people who have reviewed the article 😊.

## Security Component: The Network Composition
Changing the protocol to depend on a new class of unspecified actors, provers, raises questions about decentralization and incentive alignemnt, especially since the infrastructure of doing at-home proving would, in a typical case, cost 10s of thousands of dollars and would require electrical upgrades (at least as things stand in 2025). This is an important topic, but we leave it to others to analyze this aspect of security.

Level of Concern: [deferred to others](⛔TODO⛔ link)

## Security Component: Diversity
### Potential Issue: EL client diversity worsens 
Currently, https://clientdiversity.org/ shows that there are three clients with with over 10% market share, and five with over 1% market share.  If only one or two clients are competitive (on a speed and cost basis) in a world with zkEVMs, then client diversity has become worse. It should be noted that new clients not included in the above list, such as [Ethrex](https://github.com/lambdaclass/ethrex), may gain traction due to their amenability to zk proving (as we will see saw, Rust has favorable tradeoffs in this regard). While replacing a pool of battle-tested clients with less tested clients would be a loss of security, it is of course possible that new clients could improve diversity metrics in the long run.

Level of concern: Medium--this is a serious potential problem, but EL client teams will continue to deliver for Ethereum
Mitigations: Diversity can be enforced at the level of the multiproof strategy (LINK). This requires that RTP produces timely proofs for multiple different STFs, which makes scaling more difficult but more secure. 


### Potential Issue: Poor zkVMs diversity
Just as we strive to have diversity of STF implementations, so too do we with to have a diversity of zkVMs. In fact, we also should aim to have diversity of dependencies of all of these pieces of software, notably, it would be risky if the only zkVMs in use all relied on a single SNARK library for constructing proofs.

Level of concern: Medium--as in the EL client diversity case, there is a great diversity of teams willing to execute on delivering secure L1 scaling.

Mitigations: Again, the multiproof stategy is key. Validators should only accept blocks after having verified several proofs covering a range of snarkel combinations. Moreover, analysis of shared points of failure, including at least the SNARK libraries and other cryptography primitives used to build zkVMs, should be tracked and risk should be spread out if any critical single point of failure is found.

## Security Component: The Guest Program

### Potential Issue: New bugs in old STFs and bugs in new STFs 
EL clients have been running in production for years, successfully supporting billions of dollars of economic activity on Ethereum and allowing the network to grow to global importance. Big changes to these to support proving increases the change of a critical bug in core logic.

Level of Concern: Medium-Low -- the experience of EL client teams, coupled with the extensive [EEST testing framework](https://eest.ethereum.org/main/) gives us confidence to refactor as needed for proving.

Mitigations: Teams should take care to avoid unnecessary code changes and to maintain, or even expand, testing. Formal verification against EVM specs could catch such bugs.


### Potential Issue: Risk due to change of guest execution environment of battle-tested EL clients
For an expanded treatment of these concerns, see (⛔TODO⛔: Link to Kev's blog post)

Of the EL clients listed in [here](https://ethereum.org/developers/docs/nodes-and-clients/ ), only Reth is written in a language (Rust) for which there is official support for compilation to a minimal target ISA supported by several zkVMs, the ISA called [RV32IM](https://doc.rust-lang.org/rustc/platform-support/riscv32-unknown-none-elf.html). For the clients written in Go, there is support for compilation to MIPS which can be proven by [Ziren](https://github.com/ProjectZKM/Ziren), and there is also support for the RISC-V [rva20u64 profile](https://docs.riscv.org/reference/profiles/rva20-rvi20-rva22/_attachments/RISC-V_Profiles.pdf), which uses RV64IMACFDZicsrZicntZiccrseZiccamoaZa128rsZicclsm. It is likely that only a subset of these instructions need to be supported / that code can be designed to avoid use of these instructions. For clients in other languages, similar considerations arise.

In recent months, support for additional ISAs has grown, with Jolt upgrading to RV64IMAC and Zisk upgrading to mildly non-compliant subset of RV64IMAFDCZicsr (only partial support of Zicsr is given at the time of writing). 

In a similar vein, their is the question of support for Linux syscalls in guest programs. At the 2025 Berlin Forschungsingenieurstagung, there was loose consensus among the zkVM teams present to standardize around Linux syscalls to, for instance, allocate memory, but no formal description of this commitment has been written down yet. Note that [there are many Linux syscalls](https://man7.org/linux/man-pages/man2/syscalls.2.html), and note also that many zkVM projects implement a custom notion of syscall (see, for instance, [SP1](https://github.com/succinctlabs/sp1/tree/dev/crates/zkvm/entrypoint/src/syscalls) and [OpenVM](https://github.com/openvm-org/openvm/blob/main/docs/vocs/docs/pages/specs/reference/riscv-custom-code.mdx)).

Level of Concern: High. Supporting large targets in zkVMs requires some combination of 
1) added complexity to the core zkVM circuit; 
2) software emulation in a simpler ISA;
3) and program design + validation to compile to a strict subset of the available mandatory set.

Regarding these points:
1) Point 1 is arguably the worst approach, since writing custom circuits is quite bug prone, due both to the complexity of the task itself and the fragmentation and immaturity of low-level circuit writing frameworks. Therefore it is generally believed to be better to lean on Point 2.
2) Point 2 is viable as long as the prevalence of the more exotic instructions is low, since emulation overhead is typically (think 100x). Note that Point 2 requires the ability to compile to a simpler target, so the software emulators would likely be written in C, C++, Rust or Zig.
3) The approach in Point 3 is brittle, but it is not clear that breakages would be common in practice. This approach has the benefit of keeping the scope of the problem of compilation to provable target limited to the tools that EL clients already use, with the addition of an additional "de facto target ISA validation framework". This may make it easier for the EL client teams to respond to security incidents.

The same considerations apply with regard to the question of partial support for Linux syscalls.

Mitigations: The balancing act between different aspects of security is a core concern of the zkEVM project. We address this in terms of the points above. The sweet spot seems to be to handle uncommon instructions through software emulation. Several emulators should be written from scratch and thorougly tested. Validation of defactor target ISAs as in Point 3 should be done in a standalone manner, not simply by verifying that one or more zkVMs can generate proofs for the binary, since the zkVMs may, for instance, silently NOP the unsupported operations, or perhaps a panic could be missed (e.g., due to error handling across an FFI boundary). 

### Potential Issue: Lack of tests for uncommon compilation targets supported by zkVMs
Rust defines [tiers of targets](https://doc.rust-lang.org/nightly/rustc/platform-support.html) to describe the level of testing the that will be done for that target before a compiler release is made. In brief:
 - Tier 1 *"Guaranteed to work"*: Programs are built for that target before a release, and those programs are tested. Support for the standard library is guaranteed.
 - Tier 2 *"Guaranteed to build"*: Programs are built for that target before a release, but the programs may not be tested. Standard library support may be incomplete unless the tiering is "with host tools", in which case standard library support is guaranteed.
 - Tier 3: Programs are not built for that target before a release.

Rust support for [RV32IM is only Tier 2](https://doc.rust-lang.org/rustc/platform-support/riscv32-unknown-none-elf.html), while [RV64GC is Tier 2 "with host tools"](https://doc.rust-lang.org/rustc/platform-support/riscv64gc-unknown-linux-gnu.html). (but this target emits Linux syscalls). An example CI run of Rust tests against a RISC-V 64-bit target is [here](https://github.com/rust-lang/rust/actions/runs/19116334329/job/54626328406).

Go, by contrast, seems to do robust testing of RISC-V. For instance, in on [this Go CI dashboard]() we found this [CI failure of a RISC-V target](https://ci.chromium.org/ui/p/golang/builders/ci/gotip-linux-riscv64/b8699006944076070321/overview) where 127 out of 61836 testse fail. Unfortunately, Go offer much less control over the RISC-V code that is emitted, which (at present) can use a rather large set of extensions, Linux syscalls, and does not ofter built-in floating point emulation.

For completeness, we mention that [GCC](https://gcc.gnu.org/gcc-16/criteria.html) does not have higher-tier support for RISC-V, though it does support MIPS. Clang test RISC-V, for instance it seems tun run over 6000 RISC-V specific unit tests [here](https://lab.llvm.org/buildbot/#/builders/87/builds/4010/steps/11/logs/stdio), but as with Go compiler, only large target ISAs are covered. 

[The RISE Project](https://riseproject.dev/) project is pursuing improvements compiler testing and support for RISC-V targets. We refer to their blog for information on support for [Rust](https://riseproject.dev/2025/04/15/project-rp004-support-for-a-64-bit-risc-v-linux-port-of-rust-to-tier-1/) and [Go](https://riseproject.dev/2025/04/04/advancing-go-on-risc-v-progress-through-the-rise-project/).

Links to some blog posts on their work are provided in  

Level of Concern: High; compilers are highly complicated black boxes in this project, any poor testing of these means that zkVMs can produce binaries that do not share the semantics of the STF under all inputs. It is obvious that bugs can be catastrophic; for a particular example see this [blog post of Certora](https://www.certora.com/blog/llvm-bug), which is mentioned in this useful [overview](https://argument.xyz/blog/riscv-good-bad/) by Argument. 

Mitigations: 
 - CL clients should impose diversity of guest program compilers in their multiproof settings.
 - Fuzz (compiled) guest programs.
 - Advocate, and possibly implement, high-bar testing of compilation to a "bare metal" target.

### Potential Issue: Use of custom ISAs 
Projects such as Valida introduce bespoke ISAs that are designed for efficient proving. This means the use of compilers that do not benefit from the extensive testing and scrutiny that the most well-known compilers receive. 

Level of Concern: Medium-High. One the one hand, the LLVM stack has tons of eyes on it. On the other hand, it's massively complex, and bugs are regularly found in it. Still, on balance, it feels safer to use a standard compiler, at the very least because one can switch compilers (say, between GCC to Clang) in the event of a critical bug in either one.

Mitigations: Thorough testing and auditing. If the compiler is sufficiently simple and stable, we can become more confident in its security with time "in the wild".

### Potential Issue: Precompiles for proving 
Due to the fact that execution in arithmetic circuits has a cost model that is fundamentally different to executing on a traditional binary computer, zkVMs introduce what we call "precompiles" to optimize proving for difficult cases such as Keccak hashing. Traditional EVM precompiles have which have long been (LINK) a target for simplification to improve Ethereum's security. While zkVM precompiels are, in practice, usually related to existing EVM precompiles, they are a distinct notion which, moreover, may be harder to vanquish than traditional precompiles as we pursue L1 Scaling, since this pursuit creates significant pressures to optimize for execution speed and cost. Note that in the case of EVM precompiles, the execution environment is a piece of commodity hardware, whereas in the zkVM case the execution environment is a virtual environment that is much easier to customize. The relative ease with which we can customize the environment tends to increase the attack surface of the composite system.

Level of Concern: Medium-High; these precompiles tend to be complex. (⛔TODO⛔: link public examples)

Mitigations: Prover incentives more aligned with maintenance and perhaps even proliferation of precompiles. Some things that could help are:
 - Gas schedule changes: Reducing the need for, say, an efficient modexp or Keccak implementation, could reduce the worst-case proving time dramatically, reducing the need for an efficient implementation. This does not mean that zkVM precompiles would be retired, however (⛔TODO⛔: links)
 - EVMMAX: EVMMAX would expose basic modular arithmetic primitives into the assembly language of the EVM that could give a sweet spot in terms of proving. Note that EVMMAX was bundled with EOF, but this was not necessary. (⛔TODO⛔: think this through more and expand or remove).
 - Autoprecompiles: Powdr Labs has worked on "autoprecompiles", which hope to give efficient code akin to a precompile via an automated process, rather than a manual, per-operation process. [Reported](https://www.powdr.org/blog/accelerating-ethereum-with-autoprecompiles) performance is promising, but the security implications are unclear to the author.
 - The zkEVM Formal Verification project has a focus on such precompiles. Veridise has already [deployed](https://risczero.com/blog/RISCZero-formally-verified-zkvm) formal verification in this context.

## Security Component: The Proving
### Potential Issue: Emulator correctness
Each zkVMs implements a custom VM emulator to execute a given program. If the emulator has a bug, then the proving that is done downstream of emulation will not demonstrate that EVM semantics have been followed faithfully.

Level of concern: Medium-High

Mitigations: Thorough test suites exist to test compliance of of RISC-V emulators. These are being run the zkEVM Team's [zkEVM Test Monitor](https://eth-act.github.io/zkevm-test-monitor/). Compliance testing for additional ISAs should be run nightly and tracked similarly. When ready, formal verification will provide greater assurances of correctness.

### Potential Issue: Circuit correctness
At the core of every zkVM library is the implementation of machine specification using arithmetic circuits. It is required that this machine implements the correct semantics, otherwise demonstrating that it has executed correctly after being fed an STF and a set of inputs and outputs, does not mean that the state transition was valid in the sense of conformtion to the Ethereum protocol specification.

Level of Concern: High

Mitigations: Exhaustive unit testing of fundamental circuits is critical. Thorough audits and compelling bug bounties are critical. Fuzzing has been shown to be effective in finding circuit bugs; see the work of [Hochrainer, Isychev, Wüstholz, and Christakis](https://arxiv.org/pdf/2411.02077) who have found significant bugs R0VM, Noir, and other zkSNARK software.

### Potential Issue: EVM semantics of composite system are wrong
The ultimate desired property for of a zkEVM is that it exactly constraints a prover to describe a valid state transition. While for security purposes it is useful to take a modular approach, it is also important to stress test the full pipeline.

Level of concern: High, as this is a meta-issue encompassing many others. 

Mitigations: All of the [EEST](https://eest.ethereum.org/main/) test cases should be proven. It may make sense to add zkEVM-focused failure cases as well, to show that proof verification fails under certain conditions. The zkEVM Formal Verification Project will provide correctness guarantees here, when ready.

### Potential Issue: Transpilation
The zkVMs transform an input binary to a representation that suitable for proving. In some cases this is quite faithful to the RISC-V itself, while in other cases this introduces another low-level abstraction that a programmer or auditor must understand. In some cases this is done for performance reasons, specifically concerning the emulation of these programs. If the transpilation step has a bug, for instance it silently NOPs a block of instructions, then witness generation for that part of the program is meaningless.

Level of Concern: Medium

Mitigations: Thorough, explicit documentation, ideally in the form of unit tests that cover both success and failure cases, can help engineers avoid mistakes, and can help auditors to  find mistakes. 


### Potential Issue: Witness generation
In addition to generating a complete trace for the execution of a client for a given set of inputs and possibly transpiling it to an internal representation suitable for proving, a zkVM must generate a complete witness for proving. This is a kind of finer-grained execution trace generation that, for instance, may generate data for lookup arguments or constraints that gluing constraints that link different parts of the program. If the witness generation is incorrect, even for a correct arithmetic circuit, the system might incorrectly reject a valid transaction, or incorrectly accept an invalid transaction.

Level of concern: High--note that this closely related to circuit correctness

Mitigations: Similar to circuit correctness. It is a good idea to write many failure tests where, for example, it is checked that supplying a specially crafted, malicious witness results in a proof that does not pass verification. One could start with examples from the bug trackers maintained by [0xPARC](https://github.com/0xPARC/zk-bug-tracker) and [zkSecurity](https://bugs.zksecurity.xyz).


### Potential Issue: Protocol Bug in whitepaper
Bugs are found in even the most well-known papers years after release (see for instance this [famous bug in ZCash](https://eprint.iacr.org/2019/119)). 

Level of concern: Medium

Mitigations: When systems implement systems described in less well-studied papers, implementing teams and their auditors should conduct a review of the paper, possibly seeking guidance and opinions from an expert in the theory. Formal verification will help significantly here--it will require an in-depth rewrite of the protocols and then reduce correctness statements (such as completeness and soundness of the protocol) to certain basic axioms.

### Potential Issue: Paper is under-specified or inexplicit
The well known [Frozen Heart Vulernability](https://blog.trailofbits.com/2022/04/15/the-frozen-heart-vulnerability-in-bulletproofs/) can be attributed in some cases to papers being unclear about data is to be hashed in order to correctly implement the Fiat-Shamir transformation, a ubiquitous component of zkEVMs. One could argue that this is a protocol bug, but it feels more accurate to attribute this to the gap between theory and implementation.

Level of concern: Medium

Mitigations: Thorough specifications and in-depth audits.


### Potential Issue: Protocol "optimizations" break the protocol
The protocols as written in papers may differ from what the teams intend to implement. For instance, batching of polynomial commitments might be added or modified, or added steps that require additional prover-verifier interactions may be incorrectly fused into other steps. Another, less concerning sort of discrepancy is that the papers on SNARKs protocols often fix an arithmetization that is simple, such as R1CS or the 'vanilla' madd gate in PlonK. For production-grade systems capable of proving Ethereum in real time, dramatically more complex setups are needed. In practice, this component is rather modular, and not too much of a concern for security of the protocol (but this _is_ a BIG concern for semantic correctness of the zkEVM!).

Level of concern: High. The incentives to optimize these systems are strong. Attacks could allow malicious payloads to be construct that grief the network or cause invalid transactions to be accepted.

Mitigations: Precise, clear specifications of the protocol should be written, ideally before implementation. These should be kept current. Auditors should read these specifications and be sure that security proofs for "basic" protocols do in fact carry over under modification. This should also be covered by formal verification--the protocols _as implemented_ should be specified.

### Potential Issue: Implementation of SNARK protocol does not match the spec
If the implementation of the SNARK protocol does not match a correct specification, then it's not even clear what is implied by a verifier accepting a proof as valid.

Level of concern: Medium--potential impact is high, but audits focus on such issues and they should catch this.

Mitigations: Clarity of code, correct comments in the code, and best of all, explicit linking of sections of code with the spec, means that the spec can be checked. The most extreme and powerful version of this is formal verification. Testing, including failure cases, helps here. 

## Security Component: The Engineering Stack
### Potential Issue: zkVMs depend heavily on unsafe code
It is good for security that the zkVMs are written in safe languages, primarily in Rust, but this is significantly undermined by the use of unsafe Rust. Unsafe code comes in primarily for reasons of performance, either to optimize Rust, or to call out to C++ or CUDA. Bugs tend to spring from complexity, so defaulting to unsafe languages for the most complex, low-level code significantly undermines the value of using a safe language.

Level of Concern: Medium-High

Mitigations: Reduce the amount of unsafe code where possible. Run sanitizers nightly and before any release. Fuzzing for crashes is also helpful here.

### Potential Issue: The protocol offers a low number of bits of security
The security of any cryptographic protocol depends on computation hardness assumptions. zkVMs rely on a variety of assumptions as well as the correct setting of security parameters. Such parameters can include choices of elliptic curves, lattice parameters, and hash functions. One prominent security parameters is the number of query rounds executed during proving of "proximity proofs", which are the heart of the most widely used polynomial commitment schemes. In such settings, it is known how to set the number of queries securely, (say, to achieve 128 bits of security), but it is [conjectured](https://eprint.iacr.org/2021/582) that around half as man queries would in fact give this level of security (⛔TODO⛔ REF forthcoming blog post of Arantxa). If such conjectures turned out to be incorrect, then the zkEVM using the protocol would in fact be more vulnerable to brute force force attacks than believed, allowing provers to find malicious inputs that could case proofs to be incorrectly accepted.

Level of concern: Low-Medium--potential impact is high, but exploitability in general seems low when compared to more mundane attacks on the code. Increasing attack difficulty may be, in principle, as simple as changing a numerical parameter of the system (for example, the number of query rounds in FRI-like systems, or the grinding parameter).

Mitigations: Audits by cryptographers to check parameters would help. It would be wise to implement and regularly test fallback systems using parameters that are either proven secure or have a longer track record of use "in the wild". 

# Conclusion
zkEVM's rely on what is often called "moon math". While it is true that these systems represent a cutting edge frontier of cryptography, ensuring the security of these systems will come down to a few simple ideas. One of those ideas is spreading out risk through diversity, with validators verifying not just one proof, but several proofs, with the goal of minimizing the number of shared zkEVM dependencies. Thorough testing is critical. Maintaining and conforming to formal specifications, whether of cryptographic protocols or virtual machines, is necessary in order to reason about the system. Techniques for bug finding, such as auditing and fuzzing, have been successfully deployed for years by many different security firms. Longer term, formal verification of parts of the zkEVMs will give us a higher degree of security, and perhaps even the confidence to grow [faster](https://aws.amazon.com/blogs/security/an-unexpected-discovery-automated-reasoning-often-makes-systems-more-efficient-and-easier-to-maintain/).
