const DG = (() => {
  const W = 340;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg = (h, body) =>
    `<svg viewBox="0 0 ${W} ${h}" class="dg" role="img"><defs><marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="currentColor"/></marker></defs>${body}</svg>`;
  const box = (x, y, w, h, t, cls = '') =>
    `<rect class="dr ${cls}" pathLength="1" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle">${esc(t)}</text>`;
  const arrow = (x1, y1, x2, y2) =>
    `<line class="dr ln" pathLength="1" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#ar)"/>`;
  const txt = (x, y, t, cls = '', anchor = 'middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(t)}</text>`;

  const chain = (labels, y, x0 = 6, w = 70, gap = 18) =>
    labels.map((l, i) => box(x0 + i * (w + gap), y, w, 32, l, i % 2 ? 'alt' : '') + (i < labels.length - 1 ? arrow(x0 + i * (w + gap) + w, y + 16, x0 + (i + 1) * (w + gap), y + 16) : '')).join('');

  return {
    matrix: () => {
      const cols = ['Table 1', 'Table 2', 'Table 3'];
      const rows = [['User A', ['R W', 'R', '-']], ['User B', ['R', '-', 'R W']], ['User C', ['-', 'R', 'R']]];
      let b = txt(48, 20, 'subject / object', 'sm');
      cols.forEach((c, i) => (b += txt(130 + i * 70, 20, c, 'hd')));
      rows.forEach(([r, cells], j) => {
        const y = 30 + j * 38;
        b += txt(8, y + 24, r, 'hd', 'start');
        cells.forEach((c, i) => (b += box(96 + i * 70, y, 68, 32, c, c === '-' ? 'mute' : 'on')));
      });
      return svg(150, b);
    },
    modes: () => {
      const st = ['Use', 'Read', 'Update', 'Create', 'Delete'];
      const dy = ['Grant', 'Revoke', 'Delegate', 'Abrogate'];
      let b = txt(85, 16, 'STATIC (data)', 'hd') + txt(255, 16, 'DYNAMIC (permissions)', 'hd');
      st.forEach((s, i) => (b += box(25, 28 + i * 34, 120, 26, s)));
      dy.forEach((s, i) => (b += box(195, 28 + i * 34, 120, 26, s, 'alt')));
      return svg(200, b);
    },
    apptypes: () => {
      const rows = [
        ['Mainframe', ['Terminals', 'Mainframe']],
        ['Client-server', ['Client', 'DB server']],
        ['Web', ['Browser', 'App layer', 'Database']],
        ['Warehouse', ['Sources', 'Warehouse', 'Reports']],
      ];
      let b = '';
      rows.forEach(([n, items], j) => {
        const y = 8 + j * 50;
        b += txt(6, y + 20, n, 'hd', 'start');
        items.forEach((it, i) => {
          const x = 100 + i * 76;
          b += box(x, y, 64, 30, it, i % 2 ? 'alt' : '');
          if (i < items.length - 1) b += arrow(x + 64, y + 15, x + 76, y + 15);
        });
      });
      return svg(206, b);
    },
    users: () => {
      let b = box(110, 6, 120, 30, 'DBA', 'alt');
      const mid = ['App Admin', 'App Owner', 'Schema Owner'];
      mid.forEach((m, i) => (b += box(10 + i * 112, 62, 100, 30, m) + arrow(170, 36, 60 + i * 112, 62)));
      const low = ['App User', 'Proxy User', 'Virtual User'];
      low.forEach((m, i) => (b += box(10 + i * 112, 118, 100, 30, m, 'alt') + arrow(60 + i * 112, 92, 60 + i * 112, 118)));
      return svg(160, b);
    },
    rolechain: () => svg(110, chain(['User', 'Role', 'Function', 'Operation'], 14, 6, 62, 26) + txt(170, 78, 'Users get roles, roles get functions, functions allow operations.', 'sm')),
    crypto: () =>
      svg(120, box(8, 20, 84, 36, 'Plaintext') + arrow(92, 38, 128, 38) + box(128, 20, 84, 36, 'Key', 'alt') + arrow(212, 38, 244, 38) + box(246, 20, 88, 36, 'Ciphertext') +
        txt(170, 12, 'ENCRYPT', 'sm') + `<path class="dr ln" pathLength="1" d="M290 62 C290 100 50 100 50 62" marker-end="url(#ar)"/>` + txt(170, 108, 'DECRYPT with key', 'sm')),
    vpd: () => {
      let b = box(4, 52, 92, 44, 'SELECT * emp') + arrow(96, 74, 120, 74);
      b += box(120, 30, 104, 88, '', 'alt') + txt(172, 62, 'Policy adds', 'hd') + txt(172, 82, 'WHERE dept', 'sm') + txt(172, 98, '= context', 'sm');
      b += arrow(224, 56, 246, 36) + arrow(224, 92, 246, 112);
      b += box(246, 14, 90, 44, 'A: dept 10', 'on') + box(246, 92, 90, 44, 'B: dept 20', 'on');
      return svg(150, b);
    },
    steps: () => {
      const s = ['Set up test environment', 'Create application context', 'Create context package', 'Create login trigger', 'Create security policies', 'Apply policies to tables', 'Test as different users'];
      let b = '';
      s.forEach((t, i) => {
        const y = 4 + i * 32;
        b += `<circle class="dr" pathLength="1" cx="18" cy="${y + 14}" r="12"/>` + txt(18, y + 19, i + 1, 'hd');
        b += txt(40, y + 19, t, '', 'start');
        if (i < s.length - 1) b += `<line class="dr ln" pathLength="1" x1="18" y1="${y + 26}" x2="18" y2="${y + 34}"/>`;
      });
      return svg(232, b);
    },
    rowcol: () => {
      const tbl = (x0, hideRow, hideCol, title) => {
        let b = txt(x0 + 70, 14, title, 'hd');
        for (let r = 0; r < 4; r++)
          for (let c = 0; c < 3; c++) {
            const hid = (hideRow === r) || (hideCol === c);
            b += `<rect class="dr ${hid ? 'mute' : r === 0 ? 'alt' : ''}" pathLength="1" x="${x0 + c * 46}" y="${24 + r * 28}" width="44" height="26" rx="3"/>`;
            b += txt(x0 + c * 46 + 22, 24 + r * 28 + 17, hid ? 'xxx' : (r === 0 ? ['id', 'name', 'salary'][c] : ['7', 'Ana', '60k'][c]), hid ? 'sm' : '');
          }
        return b;
      };
      return svg(150, tbl(6, 2, -1, 'Row-level') + tbl(190, -1, 2, 'Column-level'));
    },
    trail: () => {
      const ev = [['09:01', 'LOGIN'], ['09:04', 'GRANT'], ['09:10', 'ALTER'], ['09:15', 'DROP']];
      let b = `<line class="dr ln" pathLength="1" x1="20" y1="60" x2="320" y2="60" marker-end="url(#ar)"/>`;
      ev.forEach(([t, e], i) => {
        const x = 40 + i * 78;
        b += `<circle class="dr" pathLength="1" cx="${x}" cy="60" r="6"/>` + txt(x, 42, e, 'hd') + txt(x, 84, t, 'sm');
      });
      return svg(100, b + txt(170, 98, 'Audit trail: events in order', 'sm'));
    },
    intext: () =>
      svg(130, box(8, 10, 150, 100, '', '') + box(182, 10, 150, 100, '', 'alt') +
        txt(83, 36, 'INTERNAL', 'hd') + txt(83, 58, 'Own employees', '') + txt(83, 78, 'Policies and', 'sm') + txt(83, 92, 'compliance', 'sm') +
        txt(257, 36, 'EXTERNAL', 'hd') + txt(257, 58, 'Outside party', '') + txt(257, 78, 'Independent', 'sm') + txt(257, 92, 'examination', 'sm')),
    env: () =>
      svg(150, box(8, 8, 160, 62, 'Objectives') + box(172, 8, 160, 62, 'Procedures', 'alt') + box(8, 78, 160, 62, 'People', 'alt') + box(172, 78, 160, 62, 'Resources')),
    ddldcl: () =>
      svg(130, box(8, 10, 160, 110, '') + box(172, 10, 160, 110, '', 'alt') +
        txt(88, 34, 'DDL: structure', 'hd') + txt(88, 62, 'CREATE') + txt(88, 82, 'ALTER') + txt(88, 102, 'DROP') +
        txt(252, 34, 'DCL: permissions', 'hd') + txt(252, 68, 'GRANT') + txt(252, 92, 'REVOKE')),
    trigger: () =>
      svg(200, [['Event occurs', ''], ['Trigger fires', 'alt'], ['Details captured', ''], ['Row written to audit table', 'alt'], ['Reviewed later', '']]
        .map(([t, c], i) => box(70, 4 + i * 40, 200, 28, t, c) + (i < 4 ? arrow(170, 32 + i * 40, 170, 44 + i * 40) : '')).join('')),
    pipeline: () => svg(70, chain(['Problem', 'Security', 'Auditing', 'Build', 'Evaluate'], 14, 4, 52, 16)),
  };
})();
