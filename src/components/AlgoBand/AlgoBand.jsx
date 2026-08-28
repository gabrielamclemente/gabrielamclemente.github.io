import { useEffect, useRef, useState } from "react";

/*
 * AlgoBand — a looping sorting-algorithm visualizer.
 * Bars shuffle, then a sort animates; on each comparison the two active
 * bars flare warm, and a finished pass glows pink before reshuffling into
 * the next algorithm. Real CS, running live.
 */

function* bubbleSort(a) {
  const n = a.length;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n - 1 - i; j++) {
      yield [j, j + 1];
      if (a[j] > a[j + 1]) { const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; }
    }
}
function* insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0) {
      yield [j - 1, j];
      if (a[j - 1] > a[j]) { const t = a[j - 1]; a[j - 1] = a[j]; a[j] = t; j--; }
      else break;
    }
  }
}
function* selectionSort(a) {
  const n = a.length;
  for (let i = 0; i < n; i++) {
    let m = i;
    for (let j = i + 1; j < n; j++) { yield [m, j]; if (a[j] < a[m]) m = j; }
    if (m !== i) { const t = a[i]; a[i] = a[m]; a[m] = t; }
  }
}
function* quickSort(a, lo = 0, hi = a.length - 1) {
  if (lo < hi) {
    const p = a[hi]; let i = lo;
    for (let j = lo; j < hi; j++) { yield [j, hi]; if (a[j] < p) { const t = a[i]; a[i] = a[j]; a[j] = t; i++; } }
    const t = a[i]; a[i] = a[hi]; a[hi] = t;
    yield* quickSort(a, lo, i - 1);
    yield* quickSort(a, i + 1, hi);
  }
}

const ALGOS = [
  ["insertion sort", insertionSort],
  ["selection sort", selectionSort],
  ["bubble sort", bubbleSort],
  ["quick sort", quickSort],
];

function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function AlgoBand() {
  const canvasRef = useRef(null);
  const [name, setName] = useState(ALGOS[0][0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const STEP = 9; // comparisons per frame

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, count = 0;
    let arr = [], gen = null, active = [-1, -1], algoI = 0, phase = "sort", pauseUntil = 0, raf;

    function size() {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = Math.max(24, Math.min(120, Math.floor(W / 9)));
    }
    function reset(next) {
      algoI = ((next % ALGOS.length) + ALGOS.length) % ALGOS.length;
      setName(ALGOS[algoI][0]);
      arr = shuffled(count);
      gen = ALGOS[algoI][1](arr);
      phase = "sort"; active = [-1, -1];
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const gap = Math.max(1, (W / count) * 0.18);
      const bw = (W - gap * (count - 1)) / count;
      for (let i = 0; i < count; i++) {
        const v = arr[i] / count;
        const bh = v * (H - 24) + 4;
        const x = i * (bw + gap);
        const y = H - bh;
        let col;
        if (i === active[0] || i === active[1]) col = "#ffd38a";
        else if (phase === "pause") col = "rgba(255,157,191,0.8)";
        else {
          const lo = [60, 74, 120], hi = [140, 162, 226];
          const r = Math.round(lo[0] + (hi[0] - lo[0]) * v);
          const g = Math.round(lo[1] + (hi[1] - lo[1]) * v);
          const b = Math.round(lo[2] + (hi[2] - lo[2]) * v);
          col = `rgb(${r},${g},${b})`;
        }
        ctx.fillStyle = col;
        ctx.fillRect(x, y, bw, bh);
      }
    }
    function frame(t) {
      if (phase === "sort") {
        for (let s = 0; s < STEP; s++) {
          const res = gen.next();
          if (res.done) { phase = "pause"; pauseUntil = t + 1100; active = [-1, -1]; break; }
          active = res.value;
        }
      } else if (phase === "pause") {
        if (t >= pauseUntil) reset(algoI + 1);
      }
      draw();
      raf = requestAnimationFrame(frame);
    }

    size();
    reset(0);
    if (reduce) {
      arr = Array.from({ length: count }, (_, i) => i + 1);
      phase = "pause"; draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      size();
      if (reduce) { arr = Array.from({ length: count }, (_, i) => i + 1); draw(); }
      else reset(algoI);
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div className="algo-band">
      <canvas ref={canvasRef} />
      <span className="algo-label">{name}</span>
      <span className="algo-tag">// sorting, live</span>
    </div>
  );
}
