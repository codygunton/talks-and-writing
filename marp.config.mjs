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
import lean from 'highlightjs-lean'

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
