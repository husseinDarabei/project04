// Mobile menu
const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
btn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', e => { if (e.target.tagName === 'A') { menu.classList.remove('open'); btn.setAttribute('aria-expanded', false); } });
document.getElementById('year').textContent = new Date().getFullYear();

// Hero: live network topology. Packets travel along the shortest path between routers.
(() => {
  const cv = document.getElementById('net');
  const ctx = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, nodes = [], edges = [], packets = [], dpr = Math.min(devicePixelRatio || 1, 2);

  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function build() {
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed = 7; nodes = []; edges = []; packets = [];
    const n = W < 600 ? 14 : 24;
    while (nodes.length < n) {
      const p = { x: rnd() * W, y: rnd() * H, adj: [] };
      if (nodes.every(q => Math.hypot(q.x - p.x, q.y - p.y) > 90)) nodes.push(p);
    }
    nodes.forEach((a, i) => {
      nodes.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter(o => o.j !== i).sort((x, y) => x.d - y.d).slice(0, 2)
        .forEach(o => {
          if (!a.adj.includes(o.j)) { a.adj.push(o.j); nodes[o.j].adj.push(i); edges.push([i, o.j]); }
        });
    });
  }

  function path(s, t) { // BFS shortest path
    const prev = { [s]: -1 }, q = [s];
    while (q.length) {
      const u = q.shift();
      if (u === t) break;
      nodes[u].adj.forEach(v => { if (!(v in prev)) { prev[v] = u; q.push(v); } });
    }
    if (!(t in prev)) return null;
    const out = []; for (let c = t; c !== -1; c = prev[c]) out.unshift(c);
    return out;
  }

  function send(s, t) {
    const p = path(s, t);
    if (p && p.length > 1) packets.push({ p, seg: 0, t: 0 });
  }

  const nearest = (x, y) => nodes.reduce((b, n, i) => Math.hypot(n.x - x, n.y - y) < Math.hypot(nodes[b].x - x, nodes[b].y - y) ? i : b, 0);

  cv.parentElement.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const r = cv.getBoundingClientRect();
    const s = nearest(e.clientX - r.left, e.clientY - r.top);
    send(s, Math.floor(Math.random() * nodes.length));
  });

  let last = 0, spawn = 0;
  function draw(ts) {
    const dt = Math.min((ts - last) / 1000, .05); last = ts;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(109,179,255,.22)'; ctx.lineWidth = 1;
    edges.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke(); });
    nodes.forEach(n => { ctx.fillStyle = '#0f2b57'; ctx.strokeStyle = '#6db3ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(n.x, n.y, 6, 0, 7); ctx.fill(); ctx.stroke(); });
    spawn -= dt;
    if (!still && spawn <= 0 && packets.length < 5) { send(Math.floor(Math.random() * nodes.length), Math.floor(Math.random() * nodes.length)); spawn = 1.2; }
    packets = packets.filter(k => {
      const a = nodes[k.p[k.seg]], b = nodes[k.p[k.seg + 1]];
      k.t += dt * 1.4;
      if (k.t >= 1) { k.t = 0; k.seg++; if (k.seg >= k.p.length - 1) return false; }
      const x = a.x + (b.x - a.x) * k.t, y = a.y + (b.y - a.y) * k.t;
      ctx.fillStyle = '#ffb62e'; ctx.shadowColor = '#ffb62e'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      return true;
    });
    if (!still) requestAnimationFrame(draw);
  }

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (still) draw(0); }, 150); });
  build();
  requestAnimationFrame(draw);
})();

// If the photo is missing, show the initials instead of a broken image icon
const photo = document.querySelector('.photo img');
photo.addEventListener('error', () => photo.remove());
