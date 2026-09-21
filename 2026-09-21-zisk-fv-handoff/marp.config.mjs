// marp-cli reads a config ONLY from its exact working directory -- it does not
// search parent directories. The repo-root config is what `pages.yml` and
// `preview.sh` use (both run from the root), so this file re-exports it to
// cover the case where marp is invoked from inside this deck directory.
// Without it, running `marp slides.md` here silently loses Lean highlighting.
//
// `themeSet: 'themes'` resolves against the cwd either way: ./themes here,
// ../themes from the root. Both exist.
export { default } from '../marp.config.mjs'
