const $ = s => document.querySelector(s);
const stage = $('#stage'), leaves = [...document.querySelectorAll('.leaf')];
const cv = $('#fx'), ctx = cv.getContext('2d');
const N = leaves.length;
let p = 0, opened = false, out = false, suppress = false, blowTimer = 0;
const ang = leaves.map(() => 0), tok = leaves.map(() => 0);

/* ---------- candle flames on the cake photo ----------
   [x, y, width, height] in px of the original 1545x2000 artwork.
   Press D on a keyboard to outline them, then nudge the numbers. */
const FLAMES = [[400,790,90,170],[578,735,100,210],[815,690,115,250],[898,800,100,190],[1085,880,90,150],[478,1000,90,130],[612,1045,90,150],[1032,1050,90,130],[740,985,90,140],[790,1180,90,130],[650,1190,80,110],[697,1150,70,100],[1012,1195,90,130],[765,880,70,100]];
FLAMES.forEach(([x, y, w, h]) => {
  const box = `left:${x/15.45}%;top:${y/20}%;width:${w/15.45}%;height:${h/20}%`;
  $('#p3').insertAdjacentHTML('beforeend',
    `<i class="glow" style="${box};animation-duration:${(.8+Math.random()*.9).toFixed(2)}s;animation-delay:-${Math.random().toFixed(2)}s"></i>` +
    `<i class="cap" style="${box};transition-delay:${(Math.random()*.25).toFixed(2)}s"></i>` +
    `<i class="ember" style="left:${x/15.45}%;top:${(y+h*.42)/20}%"></i>` +
    `<i class="smoke" style="left:${x/15.45}%;top:${(y-h*.2)/20}%;--dx:${(Math.random()*44-22)|0}px;animation-delay:${(.1+Math.random()*.5).toFixed(2)}s"></i>`);
});

/* ---------- page flipping ---------- */
function setLeaf(i, d) {
  ang[i] = d;
  const s = Math.sin(-d * Math.PI / 180);               // 0 flat, 1 edge-on
  leaves[i].style.transform = `rotateY(${d}deg)`;
  leaves[i].style.visibility = d <= -179.5 ? 'hidden' : 'visible';
  leaves[i].style.setProperty('--sh', (s * .55).toFixed(3));
  if (leaves[i + 1]) leaves[i + 1].style.setProperty('--ush', (s * .6).toFixed(3));
}
const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
function anim(i, to, dur = 850) {
  const from = ang[i], t0 = performance.now(), me = ++tok[i];
  (function f(t) {
    if (tok[i] !== me) return;
    const k = Math.min((t - t0) / dur, 1);
    setLeaf(i, from + (to - from) * ease(k));
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}
function settle() {
  leaves.forEach((l, i) => l.style.pointerEvents = i === p ? 'auto' : 'none');
  $('#lbl').textContent = ['open the card', opened ? 'see the cake' : 'open the letter', out ? 'light them again' : 'blow out the candles'][p];
  $('#prev').disabled = p === 0; $('#next').disabled = p === N - 1;
}
function goTo(n) {
  n = Math.max(0, Math.min(N - 1, n));
  if (n === p) return;
  if (n > p) for (let i = p; i < n; i++) anim(i, -180, 850 + (i - p) * 150);
  else for (let i = n; i < p; i++) anim(i, 0, 850 + (p - 1 - i) * 150);
  p = n; settle();
}

/* drag a page like a real one */
let drag = null;
stage.addEventListener('pointerdown', e => { drag = { x: e.clientX, t: performance.now(), dir: 0, w: stage.getBoundingClientRect().width, pr: 0 }; });
addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (!drag.dir) {
    if (Math.abs(dx) < 8) return;
    const dir = dx < 0 ? 1 : -1;
    if ((dir > 0 && p >= N - 1) || (dir < 0 && p <= 0)) { drag = null; return; }
    drag.dir = dir; drag.i = dir > 0 ? p : p - 1; tok[drag.i]++;
  }
  drag.pr = Math.min(Math.max((drag.dir > 0 ? -dx : dx) / (drag.w * .85), 0), 1);
  setLeaf(drag.i, drag.dir > 0 ? -180 * drag.pr : -180 + 180 * drag.pr);
});
function release() {
  if (!drag) return;
  const d = drag; drag = null;
  if (!d.dir) return;
  suppress = true; setTimeout(() => suppress = false, 60);
  const flick = performance.now() - d.t < 250 && d.pr > .08, done = d.pr > .3 || flick;
  const dur = 300 + 550 * (done ? 1 - d.pr : d.pr);
  if (d.dir > 0) { anim(d.i, done ? -180 : 0, dur); if (done) p++; }
  else { anim(d.i, done ? 0 : -180, dur); if (done) p--; }
  settle();
}
addEventListener('pointerup', release);
addEventListener('pointercancel', release);
stage.addEventListener('click', e => { if (suppress) e.stopPropagation(); }, true);

/* ---------- the space action ---------- */
function act() {
  if (p === 0) goTo(1);
  else if (p === 1) {
    if (!opened) { opened = true; stage.classList.add('open'); burst(.31, .5, 36); settle(); }
    else goTo(2);
  } else {
    out = !out; stage.classList.toggle('out', out);
    clearTimeout(blowTimer);
    if (out) {
      navigator.vibrate && navigator.vibrate(40);
      // let the smoke be seen first, then fountains of stars along the side edges only
      blowTimer = setTimeout(() => {
        burst(.03, .97, 26, -88, -62, 12, 17, 6, .006);
        burst(.97, .97, 26, -118, -92, 12, 17, 6, .006);
      }, 1400);
    }
    settle();
  }
}

/* ---------- sparkles ---------- */
let parts = [], raf = 0;
function size() {
  const r = stage.getBoundingClientRect(), d = window.devicePixelRatio || 1;
  cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  stage.style.perspective = r.width * 2.6 + 'px';
}
function star(R) { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? R * .35 : R; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
function burst(fx, fy, n, a0 = 0, a1 = 360, s0 = 2, s1 = 9, sz = 7, dec = .011) {
  const r = stage.getBoundingClientRect(), cols = ['#e8ecff', '#aab8ff', '#f5d98a', '#ffb3c7', '#9be7d0', '#c9ccd6'];
  for (let i = 0; i < n; i++) {
    const a = (a0 + Math.random() * (a1 - a0)) * Math.PI / 180, s = s0 + Math.random() * (s1 - s0);
    parts.push({ x: fx * r.width, y: fy * r.height, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (a1 - a0 > 200 ? 3 : 0), r: sz * (.5 + Math.random() * .6), t: Math.random() * 6, vt: (Math.random() - .5) * .3, c: cols[i % 6], l: 1, dec });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick() {
  const r = stage.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height);
  parts = parts.filter(q => q.l > 0);
  for (const q of parts) {
    q.vy += .18; q.vx *= .985; q.x += q.vx; q.y += q.vy; q.t += q.vt; q.l -= q.dec;
    ctx.save(); ctx.globalAlpha = Math.max(q.l, 0); ctx.translate(q.x, q.y); ctx.rotate(q.t); ctx.fillStyle = q.c; star(q.r); ctx.restore();
  }
  raf = parts.length ? requestAnimationFrame(tick) : 0;
}

/* ---------- input ---------- */
addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) act(); }
  else if (e.code === 'ArrowRight') goTo(p + 1);
  else if (e.code === 'ArrowLeft') goTo(p - 1);
  else if (e.code === 'KeyD') stage.classList.toggle('dbg');
});
addEventListener('keyup', e => { if (e.code === 'Space') e.preventDefault(); });
$('#key').addEventListener('click', e => { act(); e.currentTarget.blur(); });
$('#seal').addEventListener('click', act);
$('#p1').addEventListener('click', () => goTo(1));
$('#prev').addEventListener('click', e => { goTo(p - 1); e.currentTarget.blur(); });
$('#next').addEventListener('click', e => { goTo(p + 1); e.currentTarget.blur(); });
addEventListener('resize', size);

leaves.forEach((l, i) => { l.style.zIndex = N - i; setLeaf(i, 0); });
size(); settle();
