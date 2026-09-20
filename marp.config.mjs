// Repo-root Marp config.
//
// marp-cli loads its config from the CURRENT WORKING DIRECTORY, and every path
// we build from runs at the repo root: `.github/workflows/pages.yml` invokes
// `marp "$dir/slides.md"` from the checkout root, and each deck's `preview.sh`
// starts with `cd "$(dirname "$0")/.."`. So this file — not the per-deck
// `marp.config.mjs` files — is the one that actually takes effect.
//
// Its job is to teach highlight.js about Lean, which marp-core does not ship
// (highlight.js 11.x registers 193 languages; `lean` is not among them).

import { Marp } from '@marp-team/marp-core'
import leanBase from 'highlightjs-lean'

// `highlightjs-lean` is a Lean 3 grammar: its literals are `tt`/`ff`, it knows
// `begin`/`end` blocks, and it has no `where`, no Lean 4 core types and none of
// the Lean 4 tactics. On Lean 4 source that leaves most of a snippet unpainted.
// Extending its keyword table is enough -- the same object is shared by the
// grammar's nested `params` mode, so one mutation reaches everywhere.
const LEAN4_KEYWORD = [
  'where', 'deriving', 'abbrev', 'macro', 'macro_rules', 'syntax', 'notation',
  'partial', 'unsafe', 'mutual', 'termination_by', 'decreasing_by', 'attribute',
  'local', 'scoped', 'if', 'then', 'else', 'for', 'while', 'return', 'try',
  'catch', 'finally', 'unless', 'nomatch', 'nofun',
].join(' ')

const LEAN4_BUILT_IN = [
  // core types
  'Bool', 'Nat', 'Int', 'Fin', 'BitVec', 'Array', 'List', 'Option', 'String',
  'Char', 'Unit', 'Empty', 'Subtype', 'Sigma', 'Prod', 'Sum',
  'UInt8', 'UInt16', 'UInt32', 'UInt64', 'USize',
  // Lean 4 tactics the Lean 3 list misses
  'omega', 'decide', 'native_decide', 'bv_decide', 'simp_all', 'simp_arith',
  'aesop', 'grind', 'obtain', 'rintro', 'ext', 'norm_cast', 'push_cast',
  'field_simp', 'linarith', 'nlinarith', 'positivity', 'gcongr', 'fun_prop',
  'first', 'iterate', 'conv', 'change', 'rcases', 'use', 'exact_mod_cast',
].join(' ')

function lean(hljs) {
  const grammar = leanBase(hljs)
  const kw = grammar.keywords
  kw.keyword = `${kw.keyword} ${LEAN4_KEYWORD}`
  kw.built_in = `${kw.built_in} ${LEAN4_BUILT_IN}`
  kw.literal = `${kw.literal} true false`
  return grammar
}

export default {
  allowLocalFiles: true,
  html: true,
  themeSet: 'themes',
  engine: (opts) => {
    const marp = new Marp(opts)
    marp.highlightjs.registerLanguage('lean', lean)
    return marp
  },
}
