**incident response plans:** Need a runbook, likely just update the public run book that Fredrik mentioned.

**fallback plans:** Part of incident response could be testing that the network can fall back to rexecution. I prefer to be paranoid and careful.

**threat model:** This might not turn out to be complex or to contain any curveballs, but it is good to have an explicit baseline, sort of like an axiom for the rest of the plans.

**test monitoring:** Some could be (nightly? per-relase?) CI for each project but maybe they don't want to integrate everything? Might have some very heavy tests that should be manually triggered for efficiency reasons. If fuzzing dashboards are ready, might as well aggregate those too.

**MVP testing:** EEST, extensions of these, RISC-V compliance. Common circuit bug tests. Model tests for Ethereum STF?

**MVP network stability:** Need some baseline of stable an consistent performance of provers and stateless atesteres.

**prover network monitoring**

**stateless attester network monitoring**

**hardware specs:** We have Ethproofs proposed requirements. GPU prices and memory prices have soared. Requirements scale with L1 throughput. We want to derive a standard set up.

**cluster reproduction:** Need to validate that provers can actually run on the claimed setups under sustained load outside of datacenters. So far only Girona does this?

**ZKEVM selection:** Need to figure out which ZKVEVMs make up "the denominator".

**ZKEVM inclusion criteria:** ...this should be easy :sweat_smile:

**ZKEVM diversity criteria:** Need to describe what an "acceptable set" of size k is.

**ZKEVM security criteria:** Already covered by Ethproofs + Cryptography.



First we need to agree (this is an action item itself...) on MVP network stabilility metrics, then we can work backwards to other deadlines. Let's say it's 3 months stability required and We aim to ship by Hegota, so let's say one year from now in February 2027. Then we get some timelines:

Action items:
  1) Threat model
  1) Agree on gating requirements (mvp stability, incident response plan, monitoring, anything else?)
  1) Decide on fallback strategy or none
  1) Write down diversity requirement (e.g., in any acceptable tuple, not all k depend on the rust compiler... but be abstract) 
  1) Reaffirm that theory security requirements are set (num bits, soundcalc integration, whitepaper, etc). NB: how long do they need for analysis? Should this be done before optional proofs?
  1) Reaffirm capex targets 
  1) Identify MVP testing baseline
  1) Set inclusion criteria

  1) Reproduce provers
  1) Build prover network monitoring capability
  1) Implement testing
  1) Implement test monitoring
  1) Set list of acceptable k-tuples of proofs
  1) Write incident response plans

  1) Monitor for stability
  1) Test incident response
