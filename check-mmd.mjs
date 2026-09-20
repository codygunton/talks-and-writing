#!/usr/bin/env node
// Structural checks for Mermaid flowchart .mmd files.
//
//   node check-mmd.mjs                 # every .mmd in the repo
//   node check-mmd.mjs a.mmd b.mmd     # just these
//
// Catches the failures the browser hides: a `linkStyle` index past the last
// edge (kills the whole render, leaving a blank slide), a `class` naming an
// arrow or style that does not exist (silently does nothing), and arrows or
// nodes that never got a colour.
//
// No dependencies. If `mermaid` happens to be resolvable it also runs the
// real parser; otherwise it skips that step.

import fs from 'node:fs';
import path from 'node:path';

const DECL = /^\s*([A-Za-z_][\w-]*)\s*(?:\[|\(|\{|>|\[\[|\[\()/;
const EDGE = /([A-Za-z_][\w-]*)\s+([A-Za-z_][\w-]*)@(-->|---|-\.->|==>|-\.-)|([A-Za-z_][\w-]*)\s*(-->|---|-\.->|==>|-\.-)/;
const ARROW = /(-->|---|-\.->|==>|-\.-)/;

function check(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const problems = [];
  const add = (sev, line, msg) => problems.push({ sev, line, msg });

  const classDefs = new Set();
  const nodes = new Set();
  const edgeIds = new Map();      // id -> line
  const edgeRefs = [];            // {from,to,line,id}
  const classStmts = [];          // {ids,name,line}
  const nodeClassUse = [];        // {name,line}
  const linkStyles = [];          // {idx,line}
  const unnamed = [];             // {from,to,line}
  let edgeCount = 0;

  lines.forEach((raw, i) => {
    const n = i + 1;
    const line = raw.replace(/%%\{.*?\}%%/g, '');
    // A bare `%%` is NOT treated as a comment by mermaid -- it renders as a
    // node labelled "%%". Comment separators must carry text.
    if (/^\s*%%\s*$/.test(raw)) {
      add('ERROR', n, 'a bare `%%` renders as a stray node labelled "%%"; put text after it or delete the line');
      return;
    }
    if (/^\s*%%/.test(line)) return;                    // comment

    let m;
    if ((m = line.match(/^\s*classDef\s+([\w,]+)\s/))) {
      m[1].split(',').forEach((c) => classDefs.add(c.trim()));
      return;
    }
    if ((m = line.match(/^\s*class\s+([\w,\s-]+?)\s+(\w+)\s*$/))) {
      classStmts.push({ ids: m[1].split(',').map((s) => s.trim()).filter(Boolean), name: m[2], line: n });
      return;
    }
    if ((m = line.match(/^\s*linkStyle\s+(\d+)/))) {
      linkStyles.push({ idx: Number(m[1]), line: n });
      return;
    }
    if (/^\s*(style|subgraph|end|direction|flowchart|graph)\b/.test(line)) {
      const d = line.match(/^\s*subgraph\s+([A-Za-z_][\w-]*)/);
      if (d) nodes.add(d[1]);
      return;
    }

    // node declarations, possibly several per line
    for (const d of line.matchAll(/([A-Za-z_][\w-]*)\s*(?:\[[^\]]*\]|\([^)]*\)|\{[^}]*\})(?::::(\w+))?/g)) {
      nodes.add(d[1]);
      if (d[2]) nodeClassUse.push({ name: d[2], line: n });
    }
    for (const d of line.matchAll(/([A-Za-z_][\w-]*):::(\w+)/g)) {
      nodes.add(d[1]);
      nodeClassUse.push({ name: d[2], line: n });
    }

    if (!ARROW.test(line)) return;

    // strip labels/shapes so endpoint ids are unambiguous
    const bare = line
      .replace(/\|[^|]*\|/g, ' ')
      .replace(/\[[^\]]*\]|\([^)]*\)|\{[^}]*\}/g, '')
      .replace(/:::\w+/g, '');

    const parts = bare.split(ARROW);
    for (let k = 0; k + 2 < parts.length; k += 2) {
      const lhs = parts[k].trim().split(/\s+/).filter(Boolean);
      const rhs = parts[k + 2].trim().split(/\s+/).filter(Boolean);
      if (!lhs.length || !rhs.length) continue;
      edgeCount++;
      let id = null;
      let from = lhs[lhs.length - 1];
      if (lhs.length >= 2 && lhs[lhs.length - 1].includes('@')) {
        id = lhs[lhs.length - 1].replace('@', '');
        from = lhs[lhs.length - 2];
      } else if (from.includes('@')) {
        id = from.replace('@', '');
        from = lhs[lhs.length - 2] ?? null;
      }
      const to = rhs[0];
      if (id) {
        if (edgeIds.has(id)) add('ERROR', n, `duplicate arrow name \`${id}\` (also line ${edgeIds.get(id)})`);
        edgeIds.set(id, n);
      } else {
        unnamed.push({ from, to, line: n });
      }
      edgeRefs.push({ from, to, line: n, id });
    }
  });

  // --- the crash ---
  const oob = linkStyles.filter((ls) => ls.idx >= edgeCount);
  for (const ls of oob)
    add('ERROR', ls.line, `linkStyle ${ls.idx} but there are only ${edgeCount} arrows (0-${edgeCount - 1}); this kills the whole render`);

  // Unnamed arrows only matter when something styles by position.
  if (linkStyles.length) {
    add('WARN', linkStyles[0].line,
      `${linkStyles.length} linkStyle line(s) style ${unnamed.length} unnamed arrow(s) by position; ` +
      `inserting or deleting an arrow silently re-colours the rest. Name them (\`A e_x@--> B\`) and use \`class\`.`);
  }

  // --- silent no-ops ---
  const styled = new Set();
  for (const cs of classStmts) {
    if (!classDefs.has(cs.name)) add('ERROR', cs.line, `class \`${cs.name}\` has no classDef; this silently does nothing`);
    for (const id of cs.ids) {
      if (!edgeIds.has(id) && !nodes.has(id))
        add('ERROR', cs.line, `\`${id}\` is not an arrow name or a node; this silently does nothing`);
      styled.add(id);
    }
  }
  for (const u of nodeClassUse)
    if (!classDefs.has(u.name)) add('ERROR', u.line, `:::${u.name} has no classDef`);

  for (const [id, line] of edgeIds)
    if (!styled.has(id)) add('WARN', line, `arrow \`${id}\` is named but never given a class`);

  for (const e of edgeRefs) {
    for (const end of [e.from, e.to]) {
      if (end && !nodes.has(end))
        add('WARN', e.line, `node \`${end}\` is used but never declared; it renders unstyled`);
    }
  }

  for (const c of classDefs)
    if (![...classStmts].some((s) => s.name === c) && !nodeClassUse.some((u) => u.name === c))
      add('INFO', 0, `classDef \`${c}\` is never used`);

  return { problems, edgeCount };
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.mmd')) out.push(p);
  }
  return out;
}

const args = process.argv.slice(2);
const files = (args.length ? args : [process.cwd()]).flatMap((a) =>
  fs.statSync(a).isDirectory() ? walk(a) : [a]
);
let worst = 0;
for (const f of files) {
  const { problems, edgeCount } = check(f);
  const errs = problems.filter((p) => p.sev === 'ERROR');
  const warns = problems.filter((p) => p.sev === 'WARN');
  const tag = errs.length ? 'FAIL' : warns.length ? 'warn' : 'ok  ';
  console.log(`${tag} ${f}  (${edgeCount} arrows)`);
  for (const p of problems.sort((a, b) => a.line - b.line)) {
    if (p.sev === 'INFO') continue;
    console.log(`     ${p.sev.padEnd(5)} ${p.line ? `line ${p.line}: ` : ''}${p.msg}`);
  }
  if (errs.length) worst = 1;
}

// Optional: the real parser, when available.
try {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><body></body>');
  for (const k of ['window', 'document', 'Element', 'SVGElement', 'DOMPurify', 'Node'])
    Object.defineProperty(globalThis, k, {
      value: k === 'window' ? dom.window : dom.window[k], configurable: true, writable: true,
    });
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({ startOnLoad: false });
  console.log('\nmermaid.parse:');
  for (const f of files) {
    try {
      await mermaid.parse(fs.readFileSync(f, 'utf8'));
      console.log(`  ok   ${f}`);
    } catch (e) {
      worst = 1;
      console.log(`  FAIL ${f}: ${String(e.message ?? e).split('\n')[0]}`);
    }
  }
} catch {
  console.log('\n(mermaid/jsdom not installed — skipped the real parser; structural checks still ran)');
}

process.exit(worst);
