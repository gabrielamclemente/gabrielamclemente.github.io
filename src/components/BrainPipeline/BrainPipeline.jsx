import { useEffect, useRef } from "react";

/*
 * BrainPipeline — confocal image-analysis pipeline viz.
 * Wide screens: brain (with region legend) on the left, z-stack processing on
 * the right. Narrow screens: everything stacks vertically so nothing overlaps.
 */

const REGIONS = [
  { name: "Left Mushroom Body",   x: -0.24, y: -0.18 },
  { name: "Right Mushroom Body",  x: 0.24,  y: -0.18 },
  { name: "Central Complex",      x: 0.0,   y: 0.02 },
  { name: "Left Antennal Lobe",   x: -0.20, y: 0.30 },
  { name: "Subesophageal Gangl.", x: 0.0,   y: 0.44 },
];
const ZMAX = 40;

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const envelope = (z, z0, s) => Math.exp(-(((z - z0) / s) ** 2));
function regionParams(idx) {
  const r = mulberry32(idx * 97 + 7);
  return { z0: 10 + Math.floor(r() * 20), spread: 5 + r() * 6 };
}

export default function BrainPipeline() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const FPZ = 4, HOLD = 70;
    let dpr = 1, W = 0, H = 0, raf;
    let regionIdx = 0, z = 0, fInZ = 0, phase = "scan", doneT = 0;
    let params = regionParams(0);
    let plot = new Array(ZMAX).fill(null);
    let brain = null, L = null;
    const GREEN = [58, 209, 127], MAG = [255, 92, 166];
    const mono = (px) => `${px}px "IBM Plex Mono", monospace`;

    function buildBrain(bx, by, bw, bh, showLegend) {
      const S = showLegend ? Math.min(bw * 0.49, bh * 0.27) : Math.min(bw * 0.44, bh * 0.42);
      const cx = bx + bw / 2, cy = by + bh * (showLegend ? 0.31 : 0.5);
      const mass = new Path2D();
      const E = (ux, uy, urx, ury, rot) => mass.ellipse(cx + ux * S, cy + uy * S, urx * S, ury * S, rot || 0, 0, Math.PI * 2);
      E(-0.70, 0.0, 0.25, 0.46, 0.15);
      E(0.70, 0.0, 0.25, 0.46, -0.15);
      E(-0.50, 0.0, 0.17, 0.30);
      E(0.50, 0.0, 0.17, 0.30);
      E(-0.26, -0.30, 0.28, 0.28);
      E(0.26, -0.30, 0.28, 0.28);
      E(0, -0.34, 0.24, 0.22);
      E(0, -0.02, 0.46, 0.34);
      E(-0.20, 0.30, 0.22, 0.22);
      E(0.20, 0.30, 0.22, 0.22);
      E(0, 0.42, 0.20, 0.18);
      brain = { cx, cy, S, bx, by, bw, bh, showLegend, mass, foramen: { x: cx, y: cy + 0.16 * S, rx: 0.09 * S, ry: 0.14 * S } };
    }

    function computeLayout() {
      const narrow = W < 640;
      const readoutH = 22 + 4 * 20;
      if (!narrow) {
        const pad = 22;
        H = 420;
        const leftW = Math.min(W * 0.32, 240);
        buildBrain(pad, pad, leftW - pad, H - 2 * pad, true);
        const vp = Math.min((W - (leftW + pad) - pad) * 0.62, H - 2 * pad);
        const vpx = leftW + pad, vpy = pad + ((H - 2 * pad) - vp) / 2;
        const zbx = vpx + vp + 8;
        const rx0 = zbx + 20, ry0 = vpy + 4;
        const plotY = ry0 + readoutH + 10;
        L = { narrow, pad, vpx, vpy, vp, zbx, rx0, ry0,
              plot: { x: rx0, y: plotY, w: W - rx0 - pad, h: (vpy + vp) - plotY },
              showConnector: true, leftEdge: leftW + 4 };
      } else {
        const pad = 16;
        const cW = W - 2 * pad, brainH = 210, gap = 18;
        const vs = Math.min(cW - 14, 240);
        const vpx = pad, vpy = pad + brainH + gap, vp = vs;
        const zbx = vpx + vs + 6;
        const rx0 = pad, ry0 = vpy + vs + gap;
        const plotY = ry0 + readoutH + 10, plotH = 150;
        H = plotY + plotH + pad;
        buildBrain(pad, pad, cW, brainH, false);
        L = { narrow, pad, vpx, vpy, vp, zbx, rx0, ry0,
              plot: { x: pad, y: plotY, w: cW, h: plotH }, showConnector: false };
      }
    }

    function size() {
      W = canvas.getBoundingClientRect().width;
      computeLayout();                 // sets H, L, brain
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.height = H + "px";
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawBrain() {
      const { mass, foramen, cx, cy, S, bx, by, bw, bh, showLegend } = brain;
      ctx.save();
      ctx.shadowColor = "rgba(150,220,255,0.9)"; ctx.shadowBlur = 15;
      const grad = ctx.createRadialGradient(cx, cy - 0.15 * S, 0.1 * S, cx, cy, 1.15 * S);
      grad.addColorStop(0, "#ff77f2"); grad.addColorStop(0.55, "#e23bce"); grad.addColorStop(1, "#7d1f78");
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.strokeStyle = grad; ctx.lineWidth = 9; ctx.stroke(mass);
      ctx.fillStyle = grad; ctx.fill(mass);
      ctx.restore();

      ctx.save(); ctx.clip(mass);
      const rng = mulberry32(4242);
      for (let i = 0; i < 460; i++) {
        const x = cx + (-1.1 + 2.2 * rng()) * S, y = cy + (-0.75 + 1.5 * rng()) * S, b = 0.12 + 0.55 * rng();
        ctx.beginPath(); ctx.arc(x, y, 0.6 + rng() * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = rng() > 0.9 ? `rgba(255,225,255,${b})` : `rgba(255,130,240,${b * 0.5})`;
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(150,220,255,0.6)"; ctx.shadowBlur = 6;
      ctx.fillStyle = "#0a0716";
      ctx.beginPath(); ctx.ellipse(foramen.x, foramen.y, foramen.rx, foramen.ry, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      let apx = cx, apy = cy;
      REGIONS.forEach((rg, i) => {
        const mx = cx + rg.x * S, my = cy + rg.y * S, on = i === regionIdx;
        if (on) {
          apx = mx; apy = my;
          const pr = 6 + 3 * Math.sin(Date.now() / 220);
          ctx.beginPath(); ctx.arc(mx, my, 10 + pr, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(180,240,255,0.9)"; ctx.lineWidth = 1.5; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(mx, my, on ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff"; ctx.fill();
      });

      if (showLegend) {
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        let ly = by + bh * 0.62;
        const stepY = (bh * 0.34) / REGIONS.length;
        REGIONS.forEach((rg, i) => {
          const on = i === regionIdx;
          ctx.beginPath(); ctx.arc(bx + 6, ly, on ? 4 : 3, 0, Math.PI * 2);
          ctx.fillStyle = on ? "#ff9dbf" : "rgba(200,210,230,0.45)"; ctx.fill();
          ctx.fillStyle = on ? "#eef1f6" : "#6a7a92"; ctx.font = mono(on ? 12 : 11);
          ctx.fillText(rg.name, bx + 18, ly);
          ly += stepY;
        });
      }
      return [apx, apy];
    }

    function drawProcessing() {
      const { vpx, vpy, vp, zbx, rx0, ry0, plot: pl, pad } = L;
      const env = envelope(z, params.z0, params.spread);

      ctx.save();
      ctx.beginPath(); ctx.rect(vpx, vpy, vp, vp); ctx.clip();
      ctx.fillStyle = "#03040a"; ctx.fillRect(vpx, vpy, vp, vp);
      const rng = mulberry32(regionIdx * 1000 + z);
      const blobs = [];
      for (let i = 0; i < 22; i++) {
        blobs.push({
          bxp: vpx + 8 + rng() * (vp - 16), byp: vpy + 8 + rng() * (vp - 16),
          rad: 2 + rng() * 5, chan: rng() > 0.5 ? GREEN : MAG, bright: (0.35 + 0.65 * rng()) * env,
        });
      }
      for (const b of blobs) {
        const g = ctx.createRadialGradient(b.bxp, b.byp, 0, b.bxp, b.byp, b.rad * 3);
        g.addColorStop(0, `rgba(${b.chan[0]},${b.chan[1]},${b.chan[2]},${0.9 * b.bright})`);
        g.addColorStop(1, `rgba(${b.chan[0]},${b.chan[1]},${b.chan[2]},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.bxp, b.byp, b.rad * 3, 0, Math.PI * 2); ctx.fill();
      }
      let segCount = 0;
      for (const b of blobs) {
        if (b.bright > 0.45) {
          segCount++;
          ctx.beginPath(); ctx.arc(b.bxp, b.byp, b.rad + 3, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,211,138,0.85)"; ctx.lineWidth = 1; ctx.stroke();
        }
      }
      const sy = vpy + (fInZ / FPZ) * vp;
      ctx.strokeStyle = "rgba(127,233,255,0.8)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(vpx, sy); ctx.lineTo(vpx + vp, sy); ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = "#1c2333"; ctx.lineWidth = 1; ctx.strokeRect(vpx, vpy, vp, vp);
      ctx.fillStyle = "#141a28"; ctx.fillRect(zbx, vpy, 5, vp);
      ctx.fillStyle = "#ff9dbf"; ctx.fillRect(zbx, vpy, 5, vp * ((z + 1) / ZMAX));

      let ty = ry0;
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = "#ff9dbf"; ctx.font = mono(11);
      ctx.fillText("Z-STACK ANALYSIS", rx0, ty); ty += 22;
      ctx.font = mono(13);
      for (const [k, v] of [["region", REGIONS[regionIdx].name], ["z-slice", `${z + 1} / ${ZMAX}`], ["signal", env.toFixed(2)], ["objects", String(segCount)]]) {
        ctx.fillStyle = "#6a7a92"; ctx.fillText(k, rx0, ty);
        ctx.fillStyle = "#dfe6f2"; ctx.fillText(v, rx0 + 74, ty); ty += 20;
      }

      ctx.strokeStyle = "#1c2333"; ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
      ctx.fillStyle = "#6a7a92"; ctx.font = mono(10);
      ctx.fillText("intensity / depth", pl.x + 4, pl.y + 4);
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < ZMAX; i++) {
        if (plot[i] == null) continue;
        const px = pl.x + (i / (ZMAX - 1)) * pl.w;
        const py = pl.y + pl.h - plot[i] * (pl.h - 14) - 4;
        if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = "#3ad17f"; ctx.lineWidth = 1.5; ctx.stroke();
      if (phase === "done") { ctx.fillStyle = "#ffd38a"; ctx.font = mono(11); ctx.fillText("\u2713 region complete", pl.x, pl.y + pl.h + 8); }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#05070d"; ctx.fillRect(0, 0, W, H);
      const [ax, ay] = drawBrain();
      if (L.showConnector) {
        const cyMid = L.vpy + L.vp / 2;
        ctx.strokeStyle = "rgba(255,157,191,0.25)"; ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]); ctx.beginPath();
        ctx.moveTo(L.leftEdge, ay); ctx.lineTo(L.vpx, cyMid); ctx.stroke(); ctx.setLineDash([]);
        const tp = (Date.now() % 1400) / 1400;
        ctx.beginPath();
        ctx.arc(L.leftEdge + (L.vpx - L.leftEdge) * tp, ay + (cyMid - ay) * tp, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd38a"; ctx.fill();
      }
      drawProcessing();
    }

    function step() {
      if (phase === "scan") {
        fInZ++;
        if (fInZ >= FPZ) {
          fInZ = 0; plot[z] = envelope(z, params.z0, params.spread); z++;
          if (z >= ZMAX) { phase = "done"; doneT = HOLD; z = ZMAX - 1; }
        }
      } else {
        doneT--;
        if (doneT <= 0) {
          regionIdx = (regionIdx + 1) % REGIONS.length;
          params = regionParams(regionIdx);
          plot = new Array(ZMAX).fill(null); z = 0; fInZ = 0; phase = "scan";
        }
      }
    }
    function loop() { step(); draw(); raf = requestAnimationFrame(loop); }

    size();
    if (reduce) {
      z = params.z0; phase = "done";
      for (let i = 0; i < ZMAX; i++) plot[i] = envelope(i, params.z0, params.spread);
      draw();
    } else loop();

    const onResize = () => { size(); if (reduce) draw(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div className="pipeline-viz">
      <canvas ref={canvasRef} />
    </div>
  );
}