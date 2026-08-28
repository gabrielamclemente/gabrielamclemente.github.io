import { useEffect, useRef } from "react";

/*
 * BrainPipeline — visualization of Gabi's confocal image-analysis pipeline.
 * Left: a fluorescent Drosophila brain to real (wide) proportions — lateral
 * optic lobes, a bilobed protocerebrum, the antennal-lobe cluster, and the
 * dark esophageal foramen — with a region legend beneath it. A region is
 * selected and streamed right, where the z-stack is scanned.
 */

// region positions in BRAIN UNIT coordinates (x,y around brain centre)
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
    let brain = null;
    const GREEN = [58, 209, 127], MAG = [255, 92, 166];

    function buildBrain() {
      const pad = 22;
      const leftW = Math.min(W * 0.32, 240);
      const bx = pad, by = pad, bw = leftW - pad, bh = H - 2 * pad;
      const S = Math.min(bw * 0.49, bh * 0.27);   // UNIFORM scale — no stretching
      const cx = bx + bw / 2, cy = by + bh * 0.31;
      const mass = new Path2D();
      const E = (ux, uy, urx, ury, rot) => mass.ellipse(cx + ux * S, cy + uy * S, urx * S, ury * S, rot || 0, 0, Math.PI * 2);
      // lateral optic lobes
      E(-0.74, 0.0, 0.26, 0.46, 0.15);
      E(0.74, 0.0, 0.26, 0.46, -0.15);
      // protocerebrum (bilobed) + broad central + antennal lobes + SEG
      E(-0.26, -0.30, 0.28, 0.28);
      E(0.26, -0.30, 0.28, 0.28);
      E(0, -0.34, 0.24, 0.22);
      E(0, -0.02, 0.46, 0.34);
      E(-0.20, 0.30, 0.22, 0.22);
      E(0.20, 0.30, 0.22, 0.22);
      E(0, 0.42, 0.20, 0.18);
      brain = { cx, cy, S, bx, by, bw, bh, mass, foramen: { x: cx, y: cy + 0.16 * S, rx: 0.09 * S, ry: 0.14 * S } };
    }

    function size() {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildBrain();
    }
    const mono = (px) => `${px}px "IBM Plex Mono", monospace`;

    function drawBrain() {
      const { mass, foramen, cx, cy, S, bx, by, bw, bh } = brain;

      // magenta body with cyan bloom (glow only — no rim artifacts)
      ctx.save();
      ctx.shadowColor = "rgba(150,220,255,0.9)"; ctx.shadowBlur = 15;
      const grad = ctx.createRadialGradient(cx, cy - 0.15 * S, 0.1 * S, cx, cy, 1.1 * S);
      grad.addColorStop(0, "#ff77f2"); grad.addColorStop(0.55, "#e23bce"); grad.addColorStop(1, "#7d1f78");
      ctx.fillStyle = grad; ctx.fill(mass);
      ctx.restore();

      // fluorescent stipple (clipped)
      ctx.save(); ctx.clip(mass);
      const rng = mulberry32(4242);
      for (let i = 0; i < 460; i++) {
        const x = cx + (-1.1 + 2.2 * rng()) * S, y = cy + (-0.75 + 1.5 * rng()) * S, b = 0.12 + 0.55 * rng();
        ctx.beginPath(); ctx.arc(x, y, 0.6 + rng() * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = rng() > 0.9 ? `rgba(255,225,255,${b})` : `rgba(255,130,240,${b * 0.5})`;
        ctx.fill();
      }
      ctx.restore();

      // esophageal foramen
      ctx.save();
      ctx.shadowColor = "rgba(150,220,255,0.6)"; ctx.shadowBlur = 6;
      ctx.fillStyle = "#0a0716";
      ctx.beginPath(); ctx.ellipse(foramen.x, foramen.y, foramen.rx, foramen.ry, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // markers on the brain
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

      // region legend beneath the brain
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
      return [apx, apy];
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#05070d"; ctx.fillRect(0, 0, W, H);
      const pad = 22;
      const leftW = Math.min(W * 0.32, 240);
      const [ax, ay] = drawBrain();

      const rx = leftW + pad;
      const vp = Math.min((W - rx - pad) * 0.62, H - pad * 2);
      const vpx = rx, vpy = pad + ((H - pad * 2) - vp) / 2;

      const leftEdge = leftW + 4;                 // just outside the brain panel
      const cyMid = vpy + vp / 2;
      ctx.strokeStyle = "rgba(255,157,191,0.25)"; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]); ctx.beginPath();
      ctx.moveTo(leftEdge, ay); ctx.lineTo(vpx, cyMid); ctx.stroke(); ctx.setLineDash([]);
      const tp = (Date.now() % 1400) / 1400;
      ctx.beginPath();
      ctx.arc(leftEdge + (vpx - leftEdge) * tp, ay + (cyMid - ay) * tp, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd38a"; ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.rect(vpx, vpy, vp, vp); ctx.clip();
      ctx.fillStyle = "#03040a"; ctx.fillRect(vpx, vpy, vp, vp);
      const env = envelope(z, params.z0, params.spread);
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
      const zb = vpx + vp + 8;
      ctx.fillStyle = "#141a28"; ctx.fillRect(zb, vpy, 5, vp);
      ctx.fillStyle = "#ff9dbf"; ctx.fillRect(zb, vpy, 5, vp * ((z + 1) / ZMAX));

      const sx = zb + 20, sw = W - sx - pad;
      let ty = vpy + 4;
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = "#ff9dbf"; ctx.font = mono(11);
      ctx.fillText("Z-STACK ANALYSIS", sx, ty); ty += 22;
      ctx.font = mono(13);
      for (const [k, v] of [["region", REGIONS[regionIdx].name], ["z-slice", `${z + 1} / ${ZMAX}`], ["signal", env.toFixed(2)], ["objects", String(segCount)]]) {
        ctx.fillStyle = "#6a7a92"; ctx.fillText(k, sx, ty);
        ctx.fillStyle = "#dfe6f2"; ctx.fillText(v, sx + 74, ty); ty += 20;
      }
      ty += 10;
      const plotY = ty, plotH = Math.max(70, vpy + vp - ty), plotW = sw;
      ctx.strokeStyle = "#1c2333"; ctx.strokeRect(sx, plotY, plotW, plotH);
      ctx.fillStyle = "#6a7a92"; ctx.font = mono(10);
      ctx.fillText("intensity / depth", sx + 4, plotY + 4);
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < ZMAX; i++) {
        if (plot[i] == null) continue;
        const pxp = sx + (i / (ZMAX - 1)) * plotW;
        const pyp = plotY + plotH - plot[i] * (plotH - 14) - 4;
        if (!started) { ctx.moveTo(pxp, pyp); started = true; } else ctx.lineTo(pxp, pyp);
      }
      ctx.strokeStyle = "#3ad17f"; ctx.lineWidth = 1.5; ctx.stroke();
      if (phase === "done") { ctx.fillStyle = "#ffd38a"; ctx.font = mono(11); ctx.fillText("\u2713 region complete", sx, plotY + plotH + 8); }
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