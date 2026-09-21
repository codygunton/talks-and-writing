// Repo-root Marp config.
//
// marp-cli loads its config from the CURRENT WORKING DIRECTORY, and every path
// we build from runs at the repo root: `.github/workflows/pages.yml` invokes
// `marp "$dir/slides.md"` from the checkout root, and each deck's `preview.sh`
// starts with `cd "$(dirname "$0")/.."`. So this file — not the per-deck
// `marp.config.mjs` files — is the one that actually takes effect.

import { Marp } from '@marp-team/marp-core'
import { createHighlighter } from 'shiki'
import lean4 from '@shikijs/langs/lean4'

// marp-core paints code with highlight.js, which ships no Lean grammar (11.x
// registers 193 languages; `lean` is not among them). Shiki does: its `lean`
// grammar is the official `leanprover/vscode-lean4` TextMate grammar, scope
// `source.lean4`, so a fence is painted the way VS Code paints the same file.
//
// `createHighlighter` is async. This top-level await resolves before marp-cli
// finishes importing the config, so `shiki` is ready by the first render.
const THEMES = { light: 'github-light', dark: 'github-dark' }

// vscode-lean4 splits its grammar in two: `source.lean4`, and the restricted
// markdown `source.lean4.markdown` that paints the inside of a doc comment.
// Shiki bundles only the first, and its `--` line-comment rule is nothing but
// an include of the second -- so with the second missing the rule resolves to
// nothing and every `--` comment renders as plain code. A stub under that
// scope name is enough to make the rule resolve; comments then take the
// theme's comment color, with no markdown painted inside them.
const LEAN4_MARKDOWN = {
  name: 'lean4-markdown',
  scopeName: 'source.lean4.markdown',
  patterns: [],
}

const shiki = await createHighlighter({
  themes: Object.values(THEMES),
  langs: [LEAN4_MARKDOWN, ...lean4],
})

const LEAN = /^lean4?$/i

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// `defaultColor: false` makes shiki emit both palettes as `--shiki-light` and
// `--shiki-dark` custom properties and no `color` of its own, so each Marp
// theme chooses one (see the `.shiki span` rule in `themes/zkevm-*.css`).
// highlight.js returns the *inner* HTML of `<pre><code>`, trailing newline and
// all; we return the same shape.
function highlightLean(code) {
  const { tokens } = shiki.codeToTokens(code.replace(/\n$/, ''), {
    lang: 'lean',
    themes: THEMES,
    defaultColor: false,
  })

  const paint = (token) => {
    const style = Object.entries(token.htmlStyle ?? {})
      .map(([property, value]) => `${property}:${value}`)
      .join(';')
    return `<span style="${style}">${escapeHtml(token.content)}</span>`
  }

  const body = tokens.map((line) => line.map(paint).join('')).join('\n')
  return `<span class="shiki">${body}</span>\n`
}

export default {
  allowLocalFiles: true,
  html: true,
  themeSet: 'themes',
  // marp-core turns on markdown-it `breaks`, so every newline inside a
  // paragraph becomes a `<br>`. That makes a reflowed source paragraph render
  // as a ragged stack of lines. Turn it off: a paragraph rewraps freely, and a
  // deliberate break is a trailing backslash (or a literal `<br>`, since
  // `html: true`).
  options: { markdown: { breaks: false } },
  engine: (opts) => {
    const marp = new Marp(opts)

    // markdown-it calls `this.highlighter(...)` per fence, looked up on the
    // instance at render time, so this reaches every code block. Anything that
    // is not Lean falls through to marp-core's highlight.js.
    const fallback = marp.highlighter.bind(marp)
    marp.highlighter = (code, lang, attrs) =>
      LEAN.test(lang ?? '') ? highlightLean(code) : fallback(code, lang, attrs)

    return marp
  },
}
