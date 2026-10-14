(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = ['#B4533A', '#1F6F6B', '#B8862B', '#3E5C8A', '#6E8B5E', '#7A4A6B', '#8C2F3E', '#7B7A2E'];
  const INK = '#1E2330';
  const GAP_X = 64, GAP_Y = 12;
  const $ = (s) => document.querySelector(s);
  const mapEl = $('#map'), viewEl = $('#view'), linksEl = $('#links'), nodesEl = $('#nodes'), cardEl = $('#card');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const S = { root: null, byId: new Map(), open: new Set(), sel: null, els: new Map(), lks: new Map(), pos: new Map(), view: { x: 0, y: 0, k: 1 }, cardOpen: false, mode: 'tree', vis: [], ext: new Map() };

  function prep(unit) {
    const walk = (n, parent, i, depth, color) => {
      n.parent = parent;
      n.depth = depth;
      n.id = parent ? `${parent.id}.${i}` : 'r';
      n.color = depth === 0 ? INK : depth === 1 ? COLORS[i % COLORS.length] : color;
      n.num = depth === 1 ? String(i + 1) : depth === 2 ? `${parent.num}.${i + 1}` : '';
      n.w = 0;
      if (n.num) n.explain = (EXPLAIN[unit.key] || {})[n.num];
      S.byId.set(n.id, n);
      (n.children || []).forEach((c, j) => walk(c, n, j, depth + 1, n.color));
      return n;
    };
    return walk({ label: unit.title, detail: unit.detail, tip: unit.tip, children: unit.children, unitKey: unit.key }, null, 0, 0, INK);
  }

  function wrap(text, max, maxLines) {
    const lines = [];
    let cur = '';
    for (const w of text.split(' ')) {
      if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
    }
    lines.push(cur);
    return lines.slice(0, maxLines);
  }

  function measure(n) {
    if (n.w) return;
    const chip = n.children && n.children.length ? 28 : 0;
    if (n.depth === 0) {
      n.lines = wrap(n.label, 24, 4);
      n.w = 270; n.h = 66 + n.lines.length * 25;
    } else if (n.depth === 1) {
      n.lines = wrap(n.label, 24, 2);
      n.w = 62 + Math.max(...n.lines.map((l) => l.length)) * 8.2 + 16 + chip;
      n.h = 24 + n.lines.length * 20;
    } else {
      n.lines = wrap(n.label, 30, 2);
      n.w = 30 + Math.max(...n.lines.map((l) => l.length)) * 7.1 + chip;
      n.h = 16 + n.lines.length * 17;
    }
  }

  const kids = (n) => (n.children && S.open.has(n.id) ? n.children : []);

  function setSide(n, side) {
    n.side = side;
    (n.children || []).forEach((c) => setSide(c, side));
  }

  function layout() {
    const vis = [];
    const walk = (n) => { measure(n); vis.push(n); kids(n).forEach(walk); };
    walk(S.root);
    const slot = (n) => (n.slot = Math.max(n.h + GAP_Y, kids(n).reduce((s, c) => s + slot(c), 0)));
    slot(S.root);

    const top = kids(S.root);
    const both = S.mode === 'both' && top.length > 1;
    let cut = top.length;
    if (both) {
      const total = top.reduce((s, c) => s + c.slot, 0);
      let acc = 0;
      cut = 0;
      while (cut < top.length - 1 && acc < total / 2) acc += top[cut++].slot;
    }
    setSide(S.root, 'R');
    top.forEach((c, i) => setSide(c, i < cut ? 'R' : 'L'));

    const colW = { R: [], L: [] };
    vis.forEach((n) => { if (n.depth) colW[n.side][n.depth] = Math.max(colW[n.side][n.depth] || 0, n.w); });
    const rw = S.root.w;
    const colXR = [both ? -rw / 2 : 0];
    colXR[1] = both ? rw / 2 + GAP_X : rw + GAP_X;
    for (let d = 2; d < colW.R.length; d++) colXR[d] = colXR[d - 1] + (colW.R[d - 1] || 0) + GAP_X;
    const edgeL = [0, -(rw / 2 + GAP_X)];
    for (let d = 2; d < colW.L.length; d++) edgeL[d] = edgeL[d - 1] - (colW.L[d - 1] || 0) - GAP_X;

    const place = (n, t) => {
      n.x = n.side === 'L' ? edgeL[n.depth] - n.w : colXR[n.depth];
      const ks = kids(n);
      if (!ks.length) { n.y = t + n.slot / 2; return; }
      let y = t + (n.slot - ks.reduce((s, c) => s + c.slot, 0)) / 2;
      ks.forEach((c) => { place(c, y); y += c.slot; });
      n.y = (ks[0].y + ks[ks.length - 1].y) / 2;
    };
    if (both) {
      S.root.x = -rw / 2;
      S.root.y = 0;
      [top.slice(0, cut), top.slice(cut)].forEach((g) => {
        let y = -g.reduce((s, c) => s + c.slot, 0) / 2;
        g.forEach((c) => { place(c, y); y += c.slot; });
      });
    } else place(S.root, 0);
    return vis;
  }

  const rich = (n) => !!(n.diagram || n.code);

  function makeNode(n) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', `node l${Math.min(n.depth, 2)}${n.depth >= 3 ? ' d3' : ''}`);
    g.style.setProperty('--c', n.color);
    g.dataset.id = n.id;
    const lh = n.depth === 0 ? 25 : n.depth === 1 ? 20 : 17;
    const y0 = n.depth === 0 ? 70 : n.h / 2 - ((n.lines.length - 1) * lh) / 2 + 5;
    const tx = n.depth === 0 ? n.w / 2 : n.depth === 1 ? 52 : 16;
    const label = n.lines.map((l, i) => `<text class="lab" x="${tx}" y="${y0 + i * lh}">${esc(l)}</text>`).join('');
    const cx = n.w / 2;
    let h = `<g class="in">`;
    if (n.depth === 0) h += `<ellipse class="halo" cx="${cx}" cy="${n.h / 2}" rx="${n.w * 0.9}" ry="${n.h * 1.15}"/>`;
    h += `<rect class="bg" width="${n.w}" height="${n.h}" rx="${n.depth === 1 ? n.h / 2 : n.depth === 0 ? 14 : 8}"/>`;
    if (n.depth === 1) h += `<rect class="sheen" width="${n.w}" height="${n.h}" rx="${n.h / 2}"/>`;
    if (n.depth === 0) {
      h += `<rect class="frame" x="5" y="5" width="${n.w - 10}" height="${n.h - 10}" rx="10"/><rect class="frame f2" x="9" y="9" width="${n.w - 18}" height="${n.h - 18}" rx="7"/>`;
      h += `<g class="ico"><ellipse cx="${cx}" cy="23" rx="9" ry="3.4"/><path d="M${cx - 9} 23v9c0 4.6 18 4.6 18 0v-9"/><path d="M${cx - 9} 27.5c0 4.6 18 4.6 18 0"/></g>`;
      h += `<text class="ov" x="${cx}" y="52">UNIT ${n.unitKey}</text>`;
    }
    if (n.depth === 1) h += `<circle class="nc" cx="30" cy="${n.h / 2}" r="13"/><text class="num" x="30" y="${n.h / 2 + 5}">${n.num}</text>`;
    if (n.depth >= 2) h += `<rect class="bar" x="0" y="6" width="4" height="${n.h - 12}" rx="2"/>`;
    h += label;
    if (n.depth >= 2 && rich(n)) h += `<circle class="dot" cx="${n.w - 4}" cy="4" r="2.5"/>`;
    if (n.children && n.children.length) h += `<g class="chip"><circle cx="${n.w - 19}" cy="${n.h / 2}" r="10"/><text x="${n.w - 19}" y="${n.h / 2 + 4}">${n.children.length}</text></g>`;
    h += `<rect class="ring" width="${n.w}" height="${n.h}" rx="${n.depth === 1 ? n.h / 2 : 8}"/></g>`;
    g.innerHTML = h;
    return g;
  }

  const edge = (p, side) => (side === 'L' ? p.x : p.x + p.w);
  const pointD = (p, side) => `M${edge(p, side)} ${p.cy}L${edge(p, side)} ${p.cy}`;
  const linkD = (a, b, side) => {
    const x1 = edge(a, side), x2 = side === 'L' ? b.x + b.w : b.x, m = (x1 + x2) / 2;
    return `M${x1} ${a.cy}C${m} ${a.cy} ${m} ${b.cy} ${x2} ${b.cy}`;
  };
  const setD = (el, d) => { el.setAttribute('d', d); el.style.d = `path("${d}")`; };
  const move = (el, x, y) => (el.style.transform = `translate(${x}px,${y}px)`);
  const widthFor = (depth) => [0, 3.4, 2.2, 1.5, 1.1][Math.min(depth, 4)];

  function render() {
    const vis = layout();
    const old = S.pos;
    const next = new Map();
    vis.forEach((n) => next.set(n.id, { x: n.x, y: n.y - n.h / 2, w: n.w, cy: n.y, side: n.side }));
    const live = new Set(vis.map((n) => n.id));
    const nearestLive = (n) => { let p = n.parent; while (p && !live.has(p.id)) p = p.parent; return p; };

    for (const [id, el] of S.els) {
      if (live.has(id)) continue;
      const node = S.byId.get(id);
      const a = nearestLive(node);
      const p = a && next.get(a.id);
      el.style.transitionDelay = '0s';
      if (p) move(el, p.x, p.y);
      el.style.opacity = 0;
      el.style.pointerEvents = 'none';
      setTimeout(() => el.remove(), 450);
      S.els.delete(id);
      const l = S.lks.get(id);
      if (l) {
        if (p) setD(l, pointD(p, node.side));
        l.style.opacity = 0;
        setTimeout(() => l.remove(), 450);
        S.lks.delete(id);
      }
      const ex = S.ext.get(id);
      if (ex) {
        if (p) move(ex.bead, edge(p, node.side), p.cy);
        ex.bead.style.opacity = 0;
        if (ex.pulse) ex.pulse.remove();
        setTimeout(() => ex.bead.remove(), 450);
        S.ext.delete(id);
      }
    }

    const fresh = [];
    vis.forEach((n) => {
      let el = S.els.get(n.id);
      if (!el) {
        el = makeNode(n);
        const src = (n.parent && (old.get(n.parent.id) || next.get(n.parent.id))) || next.get(n.id);
        move(el, src.x + (n.parent ? 0 : -10), src.y + (n.parent ? (n.parent.h - n.h) / 2 : 0));
        el.style.opacity = 0;
        nodesEl.appendChild(el);
        S.els.set(n.id, el);
        fresh.push(n);
        if (n.parent) {
          const l = document.createElementNS(NS, 'path');
          l.setAttribute('class', 'link');
          l.style.setProperty('--c', n.color);
          l.style.strokeWidth = widthFor(n.depth);
          l.style.opacity = 0;
          const pp = old.get(n.parent.id) || next.get(n.parent.id);
          setD(l, pointD(pp, n.side));
          linksEl.appendChild(l);
          S.lks.set(n.id, l);
          const bead = document.createElementNS(NS, 'circle');
          bead.setAttribute('class', 'bead');
          bead.setAttribute('r', n.depth === 1 ? 4.5 : 3.2);
          bead.style.setProperty('--c', n.color);
          bead.style.opacity = 0;
          move(bead, edge(pp, n.side), pp.cy);
          linksEl.appendChild(bead);
          let pulse = null;
          if (n.depth === 1) {
            pulse = document.createElementNS(NS, 'path');
            pulse.setAttribute('class', 'pulse');
            pulse.setAttribute('pathLength', 100);
            pulse.style.animationDelay = `${(S.ext.size % 8) * 0.6}s`;
            setD(pulse, pointD(pp, n.side));
            linksEl.appendChild(pulse);
          }
          S.ext.set(n.id, { bead, pulse });
        }
      } else el.style.transitionDelay = '0s';
      el.classList.toggle('open', S.open.has(n.id));
    });

    void nodesEl.getBoundingClientRect();

    const order = new Map(fresh.map((n, i) => [n.id, i]));
    vis.forEach((n) => {
      const el = S.els.get(n.id);
      const p = next.get(n.id);
      const d = order.has(n.id) ? Math.min(order.get(n.id) * 35, 450) : 0;
      if (order.has(n.id)) el.style.transitionDelay = `${d}ms`;
      move(el, p.x, p.y);
      el.style.opacity = 1;
      const l = S.lks.get(n.id);
      if (l) {
        l.style.transitionDelay = `${d}ms`;
        l.style.opacity = '';
        const d2 = linkD(next.get(n.parent.id), p, n.side);
        setD(l, d2);
        const ex = S.ext.get(n.id);
        if (ex) {
          ex.bead.style.transitionDelay = `${d}ms`;
          ex.bead.style.opacity = 1;
          move(ex.bead, n.side === 'L' ? p.x + p.w : p.x, p.cy);
          if (ex.pulse) setD(ex.pulse, d2);
        }
      }
    });
    S.pos = next;
    S.vis = vis;
  }

  /* view */
  const applyView = (anim) => {
    viewEl.style.transition = anim ? 'transform .55s cubic-bezier(.4,0,.2,1), opacity .25s' : 'opacity .25s';
    viewEl.style.transform = `translate(${S.view.x}px,${S.view.y}px) scale(${S.view.k})`;
  };
  const region = () => {
    const narrow = innerWidth <= 760;
    return { l: 0, r: innerWidth - (S.cardOpen && !narrow ? 392 : 0), t: 56, b: innerHeight - (S.cardOpen && narrow ? innerHeight * 0.58 : 20) };
  };
  function fitBox(box, maxK, minK, anim) {
    const r = region(), pad = 34;
    const aw = r.r - r.l - pad * 2, ah = r.b - r.t - pad * 2;
    const bw = box.x2 - box.x1, bh = box.y2 - box.y1;
    const k = Math.max(Math.min(aw / bw, ah / bh, maxK), minK);
    S.view.k = k;
    S.view.x = r.l + pad + (aw - bw * k) / 2 - box.x1 * k;
    S.view.y = r.t + pad + (ah - bh * k) / 2 - box.y1 * k;
    applyView(anim);
  }
  const boxOf = (nodes) => {
    const b = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
    nodes.forEach((n) => { b.x1 = Math.min(b.x1, n.x); b.x2 = Math.max(b.x2, n.x + n.w); b.y1 = Math.min(b.y1, n.y - n.h / 2); b.y2 = Math.max(b.y2, n.y + n.h / 2); });
    return b;
  };
  const fitAll = (anim = true) => fitBox(boxOf(S.vis), 1.1, 0.08, anim);
  function focus(n) {
    const sub = [];
    const w = (x) => { sub.push(x); kids(x).forEach(w); };
    w(n);
    const b = boxOf(sub), r = region();
    if ((b.y2 - b.y1) * S.view.k <= r.b - r.t - 72) {
      const left = b.x1 * S.view.k + S.view.x, right = b.x2 * S.view.k + S.view.x;
      const cy = ((b.y1 + b.y2) / 2) * S.view.k + S.view.y;
      let dx = 0;
      if (left < r.l + 30) dx = r.l + 30 - left;
      else if (right > r.r - 30) dx = r.r - 30 - right;
      S.view.x += dx;
      S.view.y += (r.t + r.b) / 2 - cy;
      applyView(true);
    } else fitBox(b, S.view.k, 0.4, true);
  }

  /* card */
  function overline(n) {
    if (n.depth === 0) return `Unit ${n.unitKey}`;
    if (n.depth === 1) return `Section ${n.num.padStart(2, '0')}`;
    if (n.depth === 2) return `Topic ${n.num}`;
    return n.parent.label;
  }
  function openCard(n) {
    const path = [];
    for (let p = n; p; p = p.parent) path.unshift(p);
    let i = 0;
    const rv = (html) => `<div class="rv" style="animation-delay:${(i++) * 60}ms">${html}</div>`;
    let h = `<button class="x" id="cx">Close</button>`;
    h += rv(`<div class="crumb">${path.slice(1).map((p) => esc(p.label)).join(' / ') || 'Overview'}</div>`);
    h += rv(`<div class="over">${esc(overline(n))}</div><h2>${esc(n.label)}</h2>`);
    h += rv(`<p>${esc(n.detail)}</p>`);
    const explain = n.explain || (n.depth >= 3 ? `This is one part of ${n.parent.label}. ${n.parent.explain || n.parent.detail}` : '');
    if (explain) h += rv(`<div class="lbl">Explained</div><p class="explain">${esc(explain)}</p>`);
    if (n.analogy) h += rv(`<div class="analogy">${esc(n.analogy)}</div>`);
    if (n.example) h += rv(`<div class="lbl">Example</div><div class="ex">${esc(n.example)}</div>`);
    if (n.diagram && DG[n.diagram]) h += rv(`<div class="lbl">Diagram</div><div class="dgw">${DG[n.diagram]()}</div>`);
    if (n.code) h += rv(`<div class="lbl">In SQL</div><pre>${esc(n.code)}</pre>`);
    if (n.tip) h += rv(`<div class="tip"><b>Remember</b>${esc(n.tip)}</div>`);
    if (n.children && n.children.length) {
      h += rv(`<div class="lbl">Inside this topic</div><div class="chips">${n.children.map((c) => `<button data-id="${c.id}">${esc(c.label)}</button>`).join('')}</div>`);
    }
    if (n.parent) {
      const sib = n.parent.children, k = sib.indexOf(n);
      const pv = sib[k - 1], nx = sib[k + 1];
      h += rv(`<div class="pn">${pv ? `<button data-id="${pv.id}">&lsaquo; ${esc(pv.label)}</button>` : '<span></span>'}${nx ? `<button data-id="${nx.id}">${esc(nx.label)} &rsaquo;</button>` : ''}</div>`);
    }
    cardEl.style.setProperty('--c', n.depth === 0 ? '#B8964E' : n.color);
    cardEl.innerHTML = h;
    cardEl.scrollTop = 0;
    S.cardOpen = true;
    cardEl.classList.add('open');
  }
  function closeCard() {
    S.cardOpen = false;
    cardEl.classList.remove('open');
    if (S.sel) S.els.get(S.sel)?.classList.remove('sel');
    S.sel = null;
  }
  function select(n, { toggle = false } = {}) {
    for (let p = n.parent; p; p = p.parent) S.open.add(p.id);
    if (toggle && n.children) S.open.has(n.id) ? S.open.delete(n.id) : S.open.add(n.id);
    render();
    if (S.sel) S.els.get(S.sel)?.classList.remove('sel');
    S.sel = n.id;
    const el = S.els.get(n.id);
    el.classList.remove('sel');
    void el.getBoundingClientRect();
    el.classList.add('sel');
    openCard(n);
    focus(n);
  }

  /* units */
  const UNITS = { III: UNIT_III, IV: UNIT_IV };
  function loadUnit(key, first) {
    const go = () => {
      nodesEl.innerHTML = linksEl.innerHTML = '';
      S.els.clear(); S.lks.clear(); S.ext.clear(); S.pos = new Map(); S.byId.clear(); S.sel = null;
      S.root = prep(UNITS[key]);
      S.open = new Set([S.root.id]);
      S.cardOpen = false;
      cardEl.classList.remove('open');
      render();
      fitAll(false);
      viewEl.style.opacity = 1;
    };
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.unit === key));
    placeInd();
    if (first) return go();
    viewEl.style.opacity = 0;
    setTimeout(go, 230);
  }
  function placeInd() {
    const b = document.querySelector('#tabs button.on'), i = $('#ind');
    i.style.left = b.offsetLeft + 'px';
    i.style.width = b.offsetWidth + 'px';
  }

  /* menu */
  const menu = $('#menu'), kebab = $('#kebab');
  const toggleMenu = (show) => {
    menu.hidden = !(show ?? menu.hidden);
    kebab.setAttribute('aria-expanded', String(!menu.hidden));
  };
  kebab.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
  document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target)) toggleMenu(false); });
  $('#modes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    S.mode = b.dataset.mode;
    document.querySelectorAll('#modes button').forEach((x) => x.classList.toggle('on', x === b));
    render();
    fitAll();
  });
  $('#expandAll').addEventListener('click', () => {
    S.byId.forEach((n) => n.children && S.open.add(n.id));
    toggleMenu(false);
    render();
    fitAll();
  });
  $('#collapseAll').addEventListener('click', () => {
    S.open = new Set([S.root.id]);
    toggleMenu(false);
    render();
    fitAll();
  });
  $('#fit').addEventListener('click', () => { toggleMenu(false); fitAll(); });

  /* bridge */
  const PAIRS = [
    [['Authentication', 'proves identity'], ['Logins are', 'recorded']],
    [['Authorization', 'limits operations'], ['Privilege changes', 'are audited']],
    [['Roles and', 'functions'], ['Triggers capture', 'changes']],
    [['VPD policies', 'filter rows'], ['Audit trails keep', 'the history']],
    [['Row and column', 'limits'], ['Reports prove', 'compliance']],
  ];
  function bridgeSVG() {
    const xs = [270, 410, 550, 690, 830];
    const archY = (x) => {
      const t = (x - 170) / 760;
      return (1 - t) * (1 - t) * 470 + 2 * t * (1 - t) * 230 + t * t * 470;
    };
    let s = `<svg viewBox="0 0 1100 560" role="img" aria-label="A bridge joins Unit III control to Unit IV record">`;
    s += `<g class="water">${[508, 524, 540].map((y, i) => `<line x1="170" y1="${y}" x2="930" y2="${y}" opacity="${0.5 - i * 0.14}"/>`).join('')}</g>`;
    s += `<g class="bank l"><rect x="0" y="290" width="170" height="270"/>
      <text class="cap" x="85" y="346" text-anchor="middle" fill="#B8964E">UNIT III</text>
      <text class="serif" x="85" y="380" text-anchor="middle" fill="#F6EEDC" font-size="25" font-weight="600">Control</text>
      <text x="85" y="406" text-anchor="middle" fill="#CFC6B2" font-size="12">what users are</text>
      <text x="85" y="422" text-anchor="middle" fill="#CFC6B2" font-size="12">allowed to do</text>
      <rect x="71" y="456" width="28" height="22" rx="4" fill="none" stroke="#F6EEDC" stroke-width="1.8"/>
      <path d="M77 456v-7a8 8 0 0 1 16 0v7" fill="none" stroke="#F6EEDC" stroke-width="1.8"/></g>`;
    s += `<g class="bank r"><rect x="930" y="290" width="170" height="270"/>
      <text class="cap" x="1015" y="346" text-anchor="middle" fill="#B8964E">UNIT IV</text>
      <text class="serif" x="1015" y="380" text-anchor="middle" fill="#F6EEDC" font-size="25" font-weight="600">Record</text>
      <text x="1015" y="406" text-anchor="middle" fill="#CFC6B2" font-size="12">what users</text>
      <text x="1015" y="422" text-anchor="middle" fill="#CFC6B2" font-size="12">actually did</text>
      <rect x="975" y="450" width="80" height="6" rx="3" fill="#F6EEDC" fill-opacity=".5"/>
      <rect x="975" y="464" width="60" height="6" rx="3" fill="#F6EEDC" fill-opacity=".5"/>
      <rect class="newrow" x="975" y="478" width="72" height="6" rx="3" fill="#E7C46F"/></g>`;
    s += `<path class="arch" pathLength="1" d="M170 470Q550 230 930 470"/>`;
    xs.forEach((x, i) => { s += `<line class="hang" style="--i:${i}" x1="${x}" y1="300" x2="${x}" y2="${archY(x).toFixed(1)}"/>`; });
    s += `<rect class="deck" x="170" y="290" width="760" height="10" rx="2"/>`;
    PAIRS.forEach(([c, r], i) => {
      const x = xs[i];
      s += `<g class="pair" style="--i:${i}"><line class="stem" x1="${x}" y1="236" x2="${x}" y2="290"/>
        <rect class="card" x="${x - 66}" y="60" width="132" height="176" rx="10"/>
        <text class="cap" x="${x}" y="88" text-anchor="middle" fill="#B4533A">CONTROL</text>
        <text x="${x}" y="112" text-anchor="middle" font-size="13.5" font-weight="600" fill="#1E2330">${c[0]}</text>
        <text x="${x}" y="130" text-anchor="middle" font-size="12.5" fill="#5a564b">${c[1]}</text>
        <line x1="${x - 34}" y1="150" x2="${x + 34}" y2="150" stroke="#DCD2BF"/>
        <text class="cap" x="${x}" y="176" text-anchor="middle" fill="#1F6F6B">RECORD</text>
        <text x="${x}" y="200" text-anchor="middle" font-size="13.5" font-weight="600" fill="#1E2330">${r[0]}</text>
        <text x="${x}" y="218" text-anchor="middle" font-size="12.5" fill="#5a564b">${r[1]}</text></g>`;
    });
    s += `<line class="trail" x1="170" y1="282" x2="930" y2="282"/>`;
    s += `<circle class="trav-g" cx="170" cy="282" r="7"/>`;
    return s + '</svg>';
  }

  const bv = $('#bv');
  function playBridge() {
    bv.classList.remove('bv-play');
    $('#bvScene').innerHTML = bridgeSVG();
    void bv.offsetWidth;
    bv.classList.add('bv-play');
  }
  const closeBridge = () => { bv.hidden = true; bv.classList.remove('bv-play'); };
  $('#bridgeOpen').addEventListener('click', () => { toggleMenu(false); bv.hidden = false; playBridge(); });
  $('#bvReplay').addEventListener('click', playBridge);
  $('#bvClose').addEventListener('click', closeBridge);

  /* events */
  nodesEl.addEventListener('mouseover', (e) => {
    const g = e.target.closest('.node');
    if (!g) return;
    mapEl.classList.add('hl');
    for (let n = S.byId.get(g.dataset.id); n; n = n.parent) S.lks.get(n.id)?.classList.add('on');
  });
  nodesEl.addEventListener('mouseout', () => {
    mapEl.classList.remove('hl');
    linksEl.querySelectorAll('.on').forEach((l) => l.classList.remove('on'));
  });

  let drag = null;
  mapEl.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, vx: S.view.x, vy: S.view.y, moved: false, target: e.target };
    mapEl.setPointerCapture(e.pointerId);
  });
  mapEl.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 4) { drag.moved = true; mapEl.classList.add('drag'); }
    if (drag.moved) { S.view.x = drag.vx + dx; S.view.y = drag.vy + dy; applyView(false); }
  });
  mapEl.addEventListener('pointerup', () => {
    if (!drag) return;
    mapEl.classList.remove('drag');
    if (!drag.moved) {
      const g = drag.target.closest && drag.target.closest('.node');
      if (g) select(S.byId.get(g.dataset.id), { toggle: true });
    }
    drag = null;
  });
  mapEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const k = Math.min(2, Math.max(0.08, S.view.k * Math.exp(-e.deltaY * 0.0015)));
    const f = k / S.view.k;
    S.view.x = e.clientX - (e.clientX - S.view.x) * f;
    S.view.y = e.clientY - (e.clientY - S.view.y) * f;
    S.view.k = k;
    applyView(false);
  }, { passive: false });

  cardEl.addEventListener('click', (e) => {
    if (e.target.id === 'cx') return closeCard();
    const b = e.target.closest('button[data-id]');
    if (b) select(S.byId.get(b.dataset.id));
  });
  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && !b.classList.contains('on')) loadUnit(b.dataset.unit);
  });
  addEventListener('resize', () => { placeInd(); fitAll(false); });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!bv.hidden) return closeBridge();
      if (!menu.hidden) return toggleMenu(false);
      return closeCard();
    }
    const n = S.sel && S.byId.get(S.sel);
    if (!n) return;
    const sib = n.parent ? n.parent.children : [];
    const k = sib.indexOf(n);
    let t = null;
    if (e.key === 'ArrowRight') t = n.children && n.children[0];
    else if (e.key === 'ArrowLeft') t = n.parent;
    else if (e.key === 'ArrowDown') t = sib[k + 1];
    else if (e.key === 'ArrowUp') t = sib[k - 1];
    else if (e.key === 'Enter') return select(n, { toggle: true });
    if (t) { e.preventDefault(); select(t); }
  });

  const ready = () => loadUnit('III', true);
  document.fonts && document.fonts.ready ? document.fonts.ready.then(ready) : ready();
})();
