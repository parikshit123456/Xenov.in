/**
 * XENOV STUDIO — script.js
 * Vanilla JavaScript — no frameworks
 */

'use strict';

/* ══════════════════════════════════════════
   HERO CANVAS — Animated particle network
   ══════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    const count = Math.min(Math.floor((W * H) / 14000), 80);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const opacity = (1 - dist / 140) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    createParticles();
    if (animId) cancelAnimationFrame(animId);
    draw();
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
  init();
})();


/* ══════════════════════════════════════════
   NAVBAR — sticky + scrolled state
   ══════════════════════════════════════════ */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const ham     = document.getElementById('hamburger');
  const links   = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  ham.addEventListener('click', () => {
    const open = links.classList.toggle('mobile-open');
    ham.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close menu on link click
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('mobile-open');
      ham.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (links.classList.contains('mobile-open') &&
        !links.contains(e.target) && !ham.contains(e.target)) {
      links.classList.remove('mobile-open');
      ham.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();


/* ══════════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════════ */
(function initScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();


/* ══════════════════════════════════════════
   COUNTER ANIMATION
   ══════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num');
  let animated = false;

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      counters.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        const duration = 2000;
        const step = 16;
        const increment = target / (duration / step);
        let current = 0;

        const tick = () => {
          current = Math.min(current + increment, target);
          el.textContent = Math.round(current);
          if (current < target) setTimeout(tick, step);
        };
        setTimeout(tick, 400);
      });
    }
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) io.observe(heroStats);
})();


/* ══════════════════════════════════════════
   PORTFOLIO FILTER
   ══════════════════════════════════════════ */
(function initPortfolioFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.opacity = '0';
        card.style.transform = 'scale(0.92)';
        setTimeout(() => {
          card.classList.toggle('hidden', !show);
          if (show) {
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          }
        }, 200);
      });
    });
  });

  // Apply transition to cards
  cards.forEach(c => {
    c.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  });
})();


/* ══════════════════════════════════════════
   PORTFOLIO MODAL (canvas-aware)
   ══════════════════════════════════════════ */

function openModal(btn) {
  const card = btn.closest('.portfolio-card');
  const modal = document.getElementById('portfolioModal');
  const mv = document.getElementById('modalVisual');

  document.getElementById('modalCat').textContent =
    card.dataset.category.charAt(0).toUpperCase() +
    card.dataset.category.slice(1);

  document.getElementById('modalTitle').textContent =
    card.dataset.title;

  document.getElementById('modalDesc').textContent =
    card.dataset.desc;

  // Clear previous content
  mv.innerHTML = '';

  // Check for video
  const video = card.querySelector('video');

  if (video) {
    const source = video.querySelector('source').src;

    mv.innerHTML = `
      <video
        controls
        autoplay
        muted
        loop
        playsinline
        class="modal-media"
      >
        <source src="${source}" type="video/mp4">
      </video>
    `;
  }
  else {
    // Check for image
    const image = card.querySelector('img');

    if (image) {
      mv.innerHTML = `
        <img
          src="${image.src}"
          alt="${card.dataset.title}"
          class="modal-media"
        >
      `;
    }
    else {
      mv.innerHTML = `
        <div class="modal-placeholder">
          Preview Not Available
        </div>
      `;
    }
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('portfolioModal').classList.remove('open');
  document.body.style.overflow = '';
}

(function initModal() {
  const modal = document.getElementById('portfolioModal');
  document.getElementById('modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();


/* ══════════════════════════════════════════
   3D CANVAS ANIMATION ENGINE
   ══════════════════════════════════════════ */

/** Project a 3D point to 2D canvas coords with perspective */
function project(x, y, z, cx, cy, fov) {
  const scale = fov / (fov + z);
  return { x: cx + x * scale, y: cy + y * scale, s: scale };
}

/** Draw a filled polygon with depth-shaded color */
function drawFace(ctx, pts, color, alpha) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Rotate point around Y axis */
function rotY(x, y, z, a) {
  return { x: x * Math.cos(a) + z * Math.sin(a), y, z: -x * Math.sin(a) + z * Math.cos(a) };
}
/** Rotate point around X axis */
function rotX(x, y, z, a) {
  return { x, y: y * Math.cos(a) - z * Math.sin(a), z: y * Math.sin(a) + z * Math.cos(a) };
}

/** Interpolate hex colors */
function lerpColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
  const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
  const r = Math.round(r1 + (r2-r1)*t), g = Math.round(g1 + (g2-g1)*t), b = Math.round(b1 + (b2-b1)*t);
  return `rgb(${r},${g},${b})`;
}

/* ── Scene renderers ─────────────────────── */

function sceneRenderer_speaker(canvas) {
  const ctx = canvas.getContext('2d');
  let angle = 0, frame;
  function draw() {
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2, fov = 260;
    ctx.clearRect(0,0,W,H);

    // Background gradient
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W,H)*0.7);
    bg.addColorStop(0,'#0a1428'); bg.addColorStop(1,'#050810');
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    // Floor shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy+80, 60, 12, 0, 0, Math.PI*2);
    const sg = ctx.createRadialGradient(cx, cy+80, 0, cx, cy+80, 60);
    sg.addColorStop(0,'rgba(37,99,235,0.25)'); sg.addColorStop(1,'transparent');
    ctx.fillStyle = sg; ctx.fill();

    const a = angle;
    const tilt = 0.22;
    const RINGS = 7;
    const meshH = 110, r0 = 38;

    // Draw cylinder rings bottom-to-top
    for (let ri = RINGS; ri >= 0; ri--) {
      const yOff = -meshH/2 + (meshH/RINGS)*ri;
      const SEGS = 20;
      for (let i = 0; i < SEGS; i++) {
        const a1 = (i/SEGS)*Math.PI*2 + a;
        const a2 = ((i+1)/SEGS)*Math.PI*2 + a;
        const x1 = Math.cos(a1)*r0, z1 = Math.sin(a1)*r0;
        const x2 = Math.cos(a2)*r0, z2 = Math.sin(a2)*r0;
        const r1t = rotX(x1, yOff, z1, tilt), r2t = rotX(x2, yOff, z2, tilt);
        const ny = (ri < RINGS) ? -meshH/RINGS : 0;
        const r1b = rotX(x1, yOff + ny, z1, tilt), r2b = rotX(x2, yOff + ny, z2, tilt);

        const p1 = project(r1t.x, r1t.y, r1t.z, cx, cy, fov);
        const p2 = project(r2t.x, r2t.y, r2t.z, cx, cy, fov);
        const p3 = project(r2b.x, r2b.y, r2b.z, cx, cy, fov);
        const p4 = project(r1b.x, r1b.y, r1b.z, cx, cy, fov);

        const light = 0.3 + 0.7 * Math.max(0, Math.cos(a1 + a + 0.5));
        const isGrill = ri < RINGS - 1;
        const base = isGrill ? '#112244' : '#0d1a36';
        const bright = isGrill ? '#2563eb' : '#1a3a7e';
        const col = lerpColor(base, bright, light * 0.8);
        drawFace(ctx, [p1,p2,p3,p4], col, 0.95);
        if (isGrill && light > 0.5) {
          ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y);
          ctx.strokeStyle = `rgba(59,130,246,${(light-0.5)*0.4})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }

    // Top cap
    const CSEG = 24;
    for (let i=0;i<CSEG;i++) {
      const a1 = (i/CSEG)*Math.PI*2+a, a2 = ((i+1)/CSEG)*Math.PI*2+a;
      const yTop = -meshH/2;
      const pts = [
        rotX(0,yTop,0,tilt), rotX(Math.cos(a1)*r0,yTop,Math.sin(a1)*r0,tilt),
        rotX(Math.cos(a2)*r0,yTop,Math.sin(a2)*r0,tilt)
      ].map(p=>project(p.x,p.y,p.z,cx,cy,fov));
      const l = 0.4+0.6*Math.max(0,Math.cos(a1+a));
      drawFace(ctx,pts,lerpColor('#1a3060','#3b82f6',l),0.95);
    }

    // LED ring on top
    for (let i=0;i<16;i++) {
      const ai = (i/16)*Math.PI*2+a*2;
      const p = rotX(Math.cos(ai)*28,-meshH/2-3,Math.sin(ai)*28,tilt);
      const pp = project(p.x,p.y,p.z,cx,cy,fov);
      const glow = 0.5+0.5*Math.sin(angle*3+i*0.8);
      ctx.beginPath(); ctx.arc(pp.x,pp.y,2*pp.s,0,Math.PI*2);
      ctx.fillStyle=`rgba(96,165,250,${glow*0.9})`; ctx.fill();
    }

    // Glow halo
    const halo = ctx.createRadialGradient(cx, cy-10, 20, cx, cy-10, 90);
    halo.addColorStop(0,'rgba(37,99,235,0.08)'); halo.addColorStop(1,'transparent');
    ctx.fillStyle=halo; ctx.fillRect(0,0,W,H);

    angle += 0.012;
    frame = requestAnimationFrame(draw);
  }
  return { start: () => { canvas.width=canvas.offsetWidth||320; canvas.height=canvas.offsetHeight||280; draw(); },
           stop: () => cancelAnimationFrame(frame) };
}

function sceneRenderer_serum(canvas) {
  const ctx = canvas.getContext('2d');
  let angle = 0, frame;
  function draw() {
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2+10, fov = 300;
    ctx.clearRect(0,0,W,H);
    const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.7);
    bg.addColorStop(0,'#180a24'); bg.addColorStop(1,'#060408');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    const a = angle, tilt = 0.18;
    const bH = 130, bR = 18, capH = 24, capR = 20;
    const SEGS = 22;

    // Bottle body
    for (let ri = 0; ri >= -1; ri--) {
      for (let i=0;i<SEGS;i++) {
        const a1=(i/SEGS)*Math.PI*2+a, a2=((i+1)/SEGS)*Math.PI*2+a;
        const yT = ri===0 ? -bH/2 : bH/2;
        const yB = ri===0 ? bH/2  : bH/2+10;
        const rr  = ri===0 ? bR : bR*0.85;
        const pts = [
          rotX(Math.cos(a1)*rr, ri===0?-bH/2:bH/2, Math.sin(a1)*rr, tilt),
          rotX(Math.cos(a2)*rr, ri===0?-bH/2:bH/2, Math.sin(a2)*rr, tilt),
          rotX(Math.cos(a2)*rr, ri===0? bH/2:bH/2+2,Math.sin(a2)*rr,tilt),
          rotX(Math.cos(a1)*rr, ri===0? bH/2:bH/2+2,Math.sin(a1)*rr,tilt),
        ].map(p=>project(p.x,p.y,p.z,cx,cy,fov));
        const l = 0.25 + 0.75*Math.max(0,Math.cos(a1+a+0.3));
        const shimmer = 0.5+0.5*Math.sin(angle*2+a1*3);
        const col = ri===0
          ? `rgba(${Math.round(160+80*l)},${Math.round(100+60*l)},${Math.round(180+60*l)},${0.55+0.3*shimmer})`
          : `rgba(200,160,74,${0.7+0.25*l})`;
        drawFace(ctx,pts,col,0.9);
        if (l > 0.7) {
          ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y); ctx.lineTo(pts[1].x,pts[1].y);
          ctx.strokeStyle=ri===0?`rgba(220,180,255,${(l-0.7)*0.8})`:`rgba(255,220,120,${(l-0.7)*0.6})`;
          ctx.lineWidth=1; ctx.stroke();
        }
      }
    }

    // Cap
    for (let i=0;i<SEGS;i++) {
      const a1=(i/SEGS)*Math.PI*2+a, a2=((i+1)/SEGS)*Math.PI*2+a;
      const pts=[
        rotX(Math.cos(a1)*capR,-bH/2,Math.sin(a1)*capR,tilt),
        rotX(Math.cos(a2)*capR,-bH/2,Math.sin(a2)*capR,tilt),
        rotX(Math.cos(a2)*capR,-bH/2-capH,Math.sin(a2)*capR,tilt),
        rotX(Math.cos(a1)*capR,-bH/2-capH,Math.sin(a1)*capR,tilt),
      ].map(p=>project(p.x,p.y,p.z,cx,cy,fov));
      const l=0.3+0.7*Math.max(0,Math.cos(a1+a));
      drawFace(ctx,pts,lerpColor('#8a6420','#f0c050',l),0.95);
    }

    // Floating particles
    for (let i=0;i<12;i++) {
      const pa = angle*0.4+i*(Math.PI*2/12);
      const pr = 50+10*Math.sin(angle+i);
      const py = -20+15*Math.sin(angle*0.7+i*1.3);
      const p = rotX(Math.cos(pa)*pr,py,Math.sin(pa)*pr,tilt);
      const pp = project(p.x,p.y,p.z,cx,cy,fov);
      const g = 0.4+0.6*Math.sin(angle*2+i);
      ctx.beginPath(); ctx.arc(pp.x,pp.y,1.5*pp.s,0,Math.PI*2);
      ctx.fillStyle=`rgba(200,160,255,${g*0.6})`; ctx.fill();
    }

    angle += 0.010;
    frame = requestAnimationFrame(draw);
  }
  return { start: ()=>{ canvas.width=canvas.offsetWidth||320; canvas.height=canvas.offsetHeight||280; draw(); },
           stop: ()=>cancelAnimationFrame(frame) };
}

function sceneRenderer_turbine(canvas) {
  const ctx = canvas.getContext('2d');
  let angle = 0, frame;
  function draw() {
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2, fov = 340;
    ctx.clearRect(0,0,W,H);
    const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.7);
    bg.addColorStop(0,'#1a0e00'); bg.addColorStop(1,'#060400');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    const spinA = angle * 3.5;
    const tilt = 0.3;
    const BLADES = 8, bL = 70, bW = 14, hubR = 22;

    // Outer ring
    const RSEG = 32;
    for (let i=0;i<RSEG;i++) {
      const a1=(i/RSEG)*Math.PI*2, a2=((i+1)/RSEG)*Math.PI*2;
      const oR = 95;
      const pts=[
        rotX(Math.cos(a1)*oR,-12,Math.sin(a1)*oR,tilt),
        rotX(Math.cos(a2)*oR,-12,Math.sin(a2)*oR,tilt),
        rotX(Math.cos(a2)*oR, 12,Math.sin(a2)*oR,tilt),
        rotX(Math.cos(a1)*oR, 12,Math.sin(a1)*oR,tilt),
      ].map(p=>project(p.x,p.y,p.z,cx,cy,fov));
      const l=0.3+0.7*Math.max(0,Math.cos(a1+angle*0.2));
      drawFace(ctx,pts,lerpColor('#2a1800','#6a3a10',l),0.9);
    }

    // Blades
    for (let b=0;b<BLADES;b++) {
      const ba = (b/BLADES)*Math.PI*2 + spinA;
      const x1=Math.cos(ba)*hubR, z1=Math.sin(ba)*hubR;
      const x2=Math.cos(ba+0.18)*(hubR+bL), z2=Math.sin(ba+0.18)*(hubR+bL);
      const xw1=Math.cos(ba+0.08)*hubR-Math.sin(ba)*bW*0.5;
      const zw1=Math.sin(ba+0.08)*hubR+Math.cos(ba)*bW*0.5;
      const xw2=Math.cos(ba-0.08)*hubR+Math.sin(ba)*bW*0.5;
      const zw2=Math.sin(ba-0.08)*hubR-Math.cos(ba)*bW*0.5;

      const pts=[
        rotX(x2,0,z2,tilt),
        rotX(xw1,-5,zw1,tilt),
        rotX(xw2,-5,zw2,tilt),
      ].map(p=>project(p.x,p.y,p.z,cx,cy,fov));

      const ptsBack=[
        rotX(x2,0,z2,tilt),
        rotX(xw1,5,zw1,tilt),
        rotX(xw2,5,zw2,tilt),
      ].map(p=>project(p.x,p.y,p.z,cx,cy,fov));

      const l=0.35+0.65*Math.max(0,Math.cos(ba+Math.PI/3));
      const col=lerpColor('#3a2008','#c87020',l);
      drawFace(ctx,pts,col,0.95);
      drawFace(ctx,ptsBack,lerpColor('#1a0e04','#7a4010',l),0.85);

      // Blade trail glow
      if (l>0.5) {
        const pp = project(x2,0,z2,cx,cy,fov);
        const rad = ctx.createRadialGradient(pp.x,pp.y,0,pp.x,pp.y,20);
        rad.addColorStop(0,`rgba(255,140,40,${(l-0.5)*0.5})`);
        rad.addColorStop(1,'transparent');
        ctx.fillStyle=rad; ctx.beginPath(); ctx.arc(pp.x,pp.y,20,0,Math.PI*2); ctx.fill();
      }
    }

    // Hub
    const HSEG=24;
    for(let i=0;i<HSEG;i++){
      const a1=(i/HSEG)*Math.PI*2,a2=((i+1)/HSEG)*Math.PI*2;
      const pts=[
        rotX(Math.cos(a1)*hubR,-12,Math.sin(a1)*hubR,tilt),
        rotX(Math.cos(a2)*hubR,-12,Math.sin(a2)*hubR,tilt),
        rotX(Math.cos(a2)*hubR,12,Math.sin(a2)*hubR,tilt),
        rotX(Math.cos(a1)*hubR,12,Math.sin(a1)*hubR,tilt),
      ].map(p=>project(p.x,p.y,p.z,cx,cy,fov));
      const l=0.4+0.6*Math.max(0,Math.cos(a1));
      drawFace(ctx,pts,lerpColor('#3a2810','#d08040',l),0.95);
    }

    // Center glow
    const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,40);
    cg.addColorStop(0,'rgba(255,120,30,0.2)'); cg.addColorStop(1,'transparent');
    ctx.fillStyle=cg; ctx.fillRect(0,0,W,H);

    angle += 0.018;
    frame = requestAnimationFrame(draw);
  }
  return { start:()=>{ canvas.width=canvas.offsetWidth||320; canvas.height=canvas.offsetHeight||480; draw(); },
           stop:()=>cancelAnimationFrame(frame) };
}

function sceneRenderer_headphone(canvas) {
  const ctx = canvas.getContext('2d');
  let angle = 0, frame;
  function draw() {
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2, fov = 280;
    ctx.clearRect(0,0,W,H);
    const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.7);
    bg.addColorStop(0,'#080e1c'); bg.addColorStop(1,'#030508');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    const a = angle, tilt = 0.2;
    const arcR = 55, eR = 32, eD = 20;

    // Draw headband arc (torus-like top arc)
    const ASEGS = 30;
    for (let i=0;i<ASEGS;i++) {
      const t1 = (i/ASEGS)*Math.PI, t2=((i+1)/ASEGS)*Math.PI;
      const x1=Math.cos(t1)*arcR, y1=-Math.sin(t1)*arcR*0.5-30;
      const x2=Math.cos(t2)*arcR, y2=-Math.sin(t2)*arcR*0.5-30;
      const r1a=rotX(x1, y1, 0, tilt);
      const r2a=rotX(x2, y2, 0, tilt);
      const r1b=rotX(x1, y1+8, 0, tilt);
      const r2b=rotX(x2, y2+8, 0, tilt);

      const cosA = Math.cos(a);
      const p1=project(r1a.x*cosA, r1a.y, r1a.z+r1a.x*Math.sin(a), cx, cy, fov);
      const p2=project(r2a.x*cosA, r2a.y, r2a.z+r2a.x*Math.sin(a), cx, cy, fov);
      const p3=project(r2b.x*cosA, r2b.y, r2b.z+r2b.x*Math.sin(a), cx, cy, fov);
      const p4=project(r1b.x*cosA, r1b.y, r1b.z+r1b.x*Math.sin(a), cx, cy, fov);

      const l=0.3+0.7*Math.abs(Math.cos(t1+a));
      drawFace(ctx,[p1,p2,p3,p4],lerpColor('#1a1a2e','#4a4a7e',l),0.95);
    }

    // Left earcup
    const sides = [[-1, Math.PI], [1, 0]];
    sides.forEach(([side, sideA]) => {
      const xBase = Math.cos(sideA)*arcR;
      const yBase = -10;
      const ESEG = 20;
      for (let i=0;i<ESEG;i++) {
        const a1=(i/ESEG)*Math.PI*2, a2=((i+1)/ESEG)*Math.PI*2;
        const ry1 = Math.cos(a1)*eR, rz1 = Math.sin(a1)*eR;
        const ry2 = Math.cos(a2)*eR, rz2 = Math.sin(a2)*eR;
        const rr = rotX(xBase, yBase+ry1, side*eD*0.5, tilt);
        const rr2 = rotX(xBase, yBase+ry2, side*eD*0.5, tilt);
        const rr3 = rotX(xBase+side*eD*0.3, yBase+ry2, rz2*0.7, tilt);
        const rr4 = rotX(xBase+side*eD*0.3, yBase+ry1, rz1*0.7, tilt);
        const cosA = Math.cos(a);
        const p1=project(rr.x*cosA, rr.y, rr.z+rr.x*Math.sin(a), cx, cy, fov);
        const p2=project(rr2.x*cosA, rr2.y, rr2.z+rr2.x*Math.sin(a), cx, cy, fov);
        const p3=project(rr3.x*cosA, rr3.y, rr3.z+rr3.x*Math.sin(a), cx, cy, fov);
        const p4=project(rr4.x*cosA, rr4.y, rr4.z+rr4.x*Math.sin(a), cx, cy, fov);
        const l=0.3+0.7*Math.max(0,Math.cos(a1+a+sideA));
        drawFace(ctx,[p1,p2,p3,p4],lerpColor('#1a1a30','#3b5bdb',l),0.95);
      }
    });

    // Accent LED
    const lp = project(Math.cos(a)*arcR, -10, Math.sin(a)*arcR, cx, cy, fov);
    const lg = ctx.createRadialGradient(lp.x,lp.y,0,lp.x,lp.y,15);
    lg.addColorStop(0,'rgba(59,130,246,0.8)'); lg.addColorStop(1,'transparent');
    ctx.fillStyle=lg; ctx.fillRect(0,0,W,H);

    angle += 0.009;
    frame = requestAnimationFrame(draw);
  }
  return { start:()=>{ canvas.width=canvas.offsetWidth||320; canvas.height=canvas.offsetHeight||280; draw(); },
           stop:()=>cancelAnimationFrame(frame) };
}

function sceneRenderer_lipstick(canvas) {
  const ctx = canvas.getContext('2d');
  let angle = 0, frame;
  function draw() {
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2+10, fov = 300;
    ctx.clearRect(0,0,W,H);
    const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.7);
    bg.addColorStop(0,'#1a060a'); bg.addColorStop(1,'#060204');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    const a = angle, tilt = 0.2;
    const SEGS = 20;
    const parts = [
      { y0:-60, y1:-20, r:10, col1:'#8a6420', col2:'#f0c050', isGold: true },
      { y0:-20, y1: 50, r:12, col1:'#600020', col2:'#e0406080', isGold: false },
      { y0: 50, y1: 90, r:13, col1:'#8a6420', col2:'#f0c050', isGold: true },
    ];

    // Lip-stick bullet tip
    const tipR = 10, tipY = -75;
    for (let i=0;i<SEGS;i++){
      const a1=(i/SEGS)*Math.PI*2+a, a2=((i+1)/SEGS)*Math.PI*2+a;
      const pts=[
        rotX(Math.cos(a1)*tipR,-60,Math.sin(a1)*tipR,tilt),
        rotX(Math.cos(a2)*tipR,-60,Math.sin(a2)*tipR,tilt),
        rotX(0, tipY, 0, tilt),
      ].map(p=>project(p.x,p.y,p.z,cx,cy,fov));
      const l=0.3+0.7*Math.max(0,Math.cos(a1+a));
      drawFace(ctx,pts,lerpColor('#8b0020','#ff4060',l),0.95);
    }

    parts.forEach(part=>{
      for(let i=0;i<SEGS;i++){
        const a1=(i/SEGS)*Math.PI*2+a, a2=((i+1)/SEGS)*Math.PI*2+a;
        const pts=[
          rotX(Math.cos(a1)*part.r,part.y0,Math.sin(a1)*part.r,tilt),
          rotX(Math.cos(a2)*part.r,part.y0,Math.sin(a2)*part.r,tilt),
          rotX(Math.cos(a2)*part.r,part.y1,Math.sin(a2)*part.r,tilt),
          rotX(Math.cos(a1)*part.r,part.y1,Math.sin(a1)*part.r,tilt),
        ].map(p=>project(p.x,p.y,p.z,cx,cy,fov));
        const l=0.25+0.75*Math.max(0,Math.cos(a1+a));
        drawFace(ctx,pts,lerpColor(part.col1,part.col2,l),0.95);
        if(part.isGold && l>0.6){
          ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y); ctx.lineTo(pts[1].x,pts[1].y);
          ctx.strokeStyle=`rgba(255,220,100,${(l-0.6)*0.6})`; ctx.lineWidth=1; ctx.stroke();
        }
      }
    });

    // Glow
    const gg=ctx.createRadialGradient(cx,cy-10,0,cx,cy-10,80);
    gg.addColorStop(0,'rgba(200,40,80,0.08)'); gg.addColorStop(1,'transparent');
    ctx.fillStyle=gg; ctx.fillRect(0,0,W,H);

    angle+=0.011;
    frame=requestAnimationFrame(draw);
  }
  return { start:()=>{ canvas.width=canvas.offsetWidth||320; canvas.height=canvas.offsetHeight||280; draw(); },
           stop:()=>cancelAnimationFrame(frame) };
}

function sceneRenderer_chair(canvas) {
  const ctx = canvas.getContext('2d');
  let angle = 0, frame;
  function draw() {
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2+20, fov = 320;
    ctx.clearRect(0,0,W,H);
    const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.7);
    bg.addColorStop(0,'#0a1410'); bg.addColorStop(1,'#030605');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    const a = angle;
    const cosA = Math.cos(a), sinA = Math.sin(a);
    const tilt = 0.28;

    function rotYT(x,y,z){ return rotX(x*cosA+z*sinA, y, -x*sinA+z*cosA, tilt); }
    function ppt(x,y,z){ const r=rotYT(x,y,z); return project(r.x,r.y,r.z,cx,cy,fov); }

    // Floor shadow
    ctx.beginPath(); ctx.ellipse(cx,cy+5,90,16,0,0,Math.PI*2);
    const sh=ctx.createRadialGradient(cx,cy+5,0,cx,cy+5,90);
    sh.addColorStop(0,'rgba(20,80,40,0.3)'); sh.addColorStop(1,'transparent');
    ctx.fillStyle=sh; ctx.fill();

    // Seat
    const seatFaces=[
      [[-50,0,-40],[ 50,0,-40],[ 50,0,40],[-50,0,40]],  // top
      [[-50,0,-40],[ 50,0,-40],[ 50,12,-40],[-50,12,-40]], // front
      [[-50,0, 40],[ 50,0, 40],[ 50,12,40],[-50,12,40]], // back
      [[-50,0,-40],[-50,0,40],[-50,12,40],[-50,12,-40]], // left
      [[ 50,0,-40],[ 50,0,40],[ 50,12,40],[ 50,12,-40]], // right
    ];
    const seatCols=['#1e4030','#162e22','#162e22','#0e1e16','#122a1e'];
    seatFaces.forEach((face,fi)=>{
      const pts=face.map(([x,y,z])=>ppt(x,y,z));
      drawFace(ctx,pts,seatCols[fi],0.95);
    });

    // Backrest
    const backFaces=[
      [[-44,-80,-35],[44,-80,-35],[44,0,-35],[-44,0,-35]],
      [[-44,-80,-35],[44,-80,-35],[44,-80,-20],[-44,-80,-20]],
    ];
    backFaces.forEach((face,fi)=>{
      const pts=face.map(([x,y,z])=>ppt(x,y,z));
      const l=0.3+0.7*Math.max(0,fi===0?Math.cos(a):Math.cos(a+Math.PI));
      drawFace(ctx,pts,lerpColor('#152b20','#2a5a38',l),0.95);
    });

    // 4 legs
    [[-38,8,-32],[38,8,-32],[-38,8,32],[38,8,32]].forEach(([lx,ly,lz])=>{
      const legFaces=[
        [[lx-3,ly,-3+lz],[lx+3,ly,-3+lz],[lx+3,ly+60,-3+lz],[lx-3,ly+60,-3+lz]],
        [[lx-3,ly,3+lz],[lx+3,ly,3+lz],[lx+3,ly+60,3+lz],[lx-3,ly+60,3+lz]],
      ];
      legFaces.forEach(face=>{
        const pts=face.map(([x,y,z])=>ppt(x,y,z));
        drawFace(ctx,pts,'#1a3020',0.9);
      });
    });

    // Env light sweep
    const sweep = Math.cos(angle*0.5);
    const sg=ctx.createRadialGradient(cx+sweep*60,cy-40,0,cx+sweep*60,cy-40,160);
    sg.addColorStop(0,'rgba(40,120,70,0.06)'); sg.addColorStop(1,'transparent');
    ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);

    angle+=0.007;
    frame=requestAnimationFrame(draw);
  }
  return { start:()=>{ canvas.width=canvas.offsetWidth||320; canvas.height=canvas.offsetHeight||280; draw(); },
           stop:()=>cancelAnimationFrame(frame) };
}

/* ── Scene dispatcher ── */
const sceneRenderers = {
  speaker:   sceneRenderer_speaker,
  serum:     sceneRenderer_serum,
  turbine:   sceneRenderer_turbine,
  headphone: sceneRenderer_headphone,
  lipstick:  sceneRenderer_lipstick,
  chair:     sceneRenderer_chair,
};

function renderScene(canvas, scene) {
  const fn = sceneRenderers[scene];
  if (!fn) return;
  const renderer = fn(canvas);
  renderer.start();
  return renderer;
}

/* ── Boot all portfolio canvases ── */
(function initPortfolioCanvases() {
  const activeRenderers = new Map();

  function startCanvas(canvas) {
    if (activeRenderers.has(canvas)) return;
    const scene = canvas.dataset.scene;
    if (!scene) return;
    // Size the canvas to its container
    const wrap = canvas.parentElement;
    canvas.width  = wrap.offsetWidth  || 320;
    canvas.height = wrap.offsetHeight || 280;
    const r = renderScene(canvas, scene);
    if (r) activeRenderers.set(canvas, r);
  }

  // Use IntersectionObserver to start/stop canvases for performance
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const canvas = entry.target;
      if (entry.isIntersecting) {
        startCanvas(canvas);
      } else {
        const r = activeRenderers.get(canvas);
        if (r) { r.stop(); activeRenderers.delete(canvas); }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.port-canvas').forEach(c => io.observe(c));

  // Resize all active canvases on window resize
  window.addEventListener('resize', () => {
    document.querySelectorAll('.port-canvas').forEach(canvas => {
      const wrap = canvas.parentElement;
      if (wrap && activeRenderers.has(canvas)) {
        canvas.width  = wrap.offsetWidth;
        canvas.height = wrap.offsetHeight;
      }
    });
  }, { passive: true });
})();


/* ══════════════════════════════════════════
   TESTIMONIAL SLIDER
   ══════════════════════════════════════════ */
(function initTestimonialSlider() {
  const track  = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('sliderDots');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');
  const cards    = track.querySelectorAll('.testimonial-card');
  let current = 0;
  let autoTimer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  }, { passive: true });

  startAuto();
})();


/* ══════════════════════════════════════════
   CONTACT FORM
   ══════════════════════════════════════════ */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn = form.querySelector('[type=submit]');
    const btnText = btn.querySelector('.btn-text');
    btnText.textContent = 'Sending…';
    btn.disabled = true;

    // Simulate async send
    setTimeout(() => {
      success.classList.add('show');
      form.reset();
      btn.disabled = false;
      btnText.textContent = 'Send Message';
      setTimeout(() => success.classList.remove('show'), 6000);
    }, 1200);
  });
})();


/* ══════════════════════════════════════════
   SMOOTH ACTIVE NAV ON SCROLL
   ══════════════════════════════════════════ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
})();


/* ══════════════════════════════════════════
   PROCESS LINE REVEAL (width animation)
   ══════════════════════════════════════════ */
(function initProcessLine() {
  const line = document.querySelector('.process-line');
  if (!line) return;
  line.style.transform = 'scaleX(0)';
  line.style.transformOrigin = 'left';
  line.style.transition = 'transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94)';

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      line.style.transform = 'scaleX(1)';
      io.disconnect();
    }
  }, { threshold: 0.3 });
  const section = document.querySelector('.process-section');
  if (section) io.observe(section);
})();


/* ══════════════════════════════════════════
   CURSOR GLOW EFFECT (desktop only)
   ══════════════════════════════════════════ */
(function initCursorGlow() {
  if (window.matchMedia('(hover: none)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.4s;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY  + 'px';
    glow.style.opacity = '1';
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
})();
