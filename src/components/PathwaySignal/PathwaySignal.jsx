import { useEffect, useRef } from "react";

/*
 * PathwaySignal — thesis Figure 1 (Draper–Stat92E axis) redrawn as designed
 * SVG icons in the site's style, with JS-choreographed signal pulses that
 * travel the connector paths (via getPointAtLength) and flare each node.
 * Logic identical to the original figure, including the autoregulatory loop.
 */

const NODES = {
  injury:     { x: 120, y: 300, label: "axonal injury" },
  draper:     { x: 300, y: 290, label: "Draper-I" },
  phago:      { x: 500, y: 290, label: "phagocytosis" },
  mitophagy:  { x: 700, y: 290, label: "mitophagy" },
  protection: { x: 890, y: 290, label: "mito. protection" },
  traf4:      { x: 300, y: 130, label: "TRAF4" },
  msn:        { x: 460, y: 130, label: "MSN" },
  jnk:        { x: 620, y: 130, label: "JNK" },
  nucleus:    { x: 850, y: 120, label: "Stat92E" },
};
const EDGES = [
  ["injury", "draper"], ["draper", "phago"], ["phago", "mitophagy"], ["mitophagy", "protection"],
  ["draper", "traf4"], ["traf4", "msn"], ["msn", "jnk"], ["jnk", "nucleus"],
];
const FEEDBACK_D =
  "M850,120 C905,48 620,34 420,34 C215,34 78,56 78,190 C78,252 170,290 300,290";

const body = "rgba(12,18,32,0.72)";

function Glyph({ type }) {
  const g = { stroke: "currentColor", strokeWidth: 1.5, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "neuron":
      return (
        <g {...g}>
          <path d="M-5,-6 C-11,-11 -14,-14 -20,-16" />
          <path d="M-7,-2 C-14,-3 -18,-4 -24,-3" />
          <path d="M-4,-8 C-7,-15 -9,-18 -12,-23" />
          <path d="M-1,-9 C5,-10 10,-5 9,1 C8,7 3,10 -3,9 C-9,8 -11,1 -9,-4 C-8,-8 -5,-9 -1,-9 Z" fill={body} />
          <path d="M6,6 C12,12 16,16 22,20" />
          <circle cx="22" cy="20" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="21.5" r="1.6" fill="currentColor" stroke="none" />
          <path style={{ stroke: "#ff6a6a" }} d="M-13,-15 l-4,-4 M-13,-15 l4,-4 M-13,-15 l-5.5,1 M-13,-15 l1,-6 M-13,-15 l5,-1" />
          <circle cx="-13" cy="-15" r="2" style={{ fill: "#ff6a6a" }} stroke="none" />
        </g>
      );
    case "glia":
      return (
        <g {...g}>
          <path d="M0,-11 C6,-12 8,-6 13,-6 C17,-6 16,1 12,3 C15,7 10,11 6,9 C4,14 -3,12 -5,8 C-11,9 -14,3 -10,-1 C-14,-4 -10,-10 -5,-8 C-4,-12 -3,-11 0,-11 Z" fill={body} />
          <path d="M12.5,2 C18,4 20,5 24,5" />
          <path d="M-10,-1 C-16,-2 -19,-3 -23,-2" />
          <path d="M-5,8 C-7,14 -8,17 -9,21" />
          <path d="M13,-6 C18,-9 20,-10 23,-13" />
          <circle cx="0" cy="0" r="3" />
        </g>
      );
    case "phago":
      return (
        <g {...g}>
          <path d="M7,-11 A13.5,13.5 0 1 0 7,11" fill={body} />
          <circle cx="13.5" cy="0" r="3.2" fill="currentColor" stroke="none" />
          <circle cx="-3" cy="-3" r="2" />
          <circle cx="-4.5" cy="4" r="1.6" />
        </g>
      );
    case "mitophagy":
      return (
        <g {...g}>
          <circle cx="0" cy="0" r="17" strokeDasharray="3 3" />
          <rect x="-11" y="-6.5" width="22" height="13" rx="6.5" fill={body} />
          <path d="M-6,-6 L-3,6 M0,-6 L3,6 M6,-6 L9,6" />
        </g>
      );
    case "mitoprotect":
      return (
        <g {...g}>
          <path d="M-16,-4 A16,16 0 0 1 16,-4" opacity="0.8" />
          <rect x="-12" y="-7" width="24" height="14" rx="7" fill={body} />
          <path d="M-7,-6.5 L-4,6.5 M-1,-6.5 L2,6.5 M5,-6.5 L8,6.5" />
        </g>
      );
    case "protein":
      return (
        <g {...g}>
          <path d="M-2,-10 C5,-12 11,-7 10,-1 C14,3 10,10 3,10 C-3,13 -11,8 -9,1 C-13,-3 -9,-10 -2,-10 Z" fill={body} />
          <path d="M-3,-2 C0,-4 3,-3 4,0" />
        </g>
      );
    case "nucleus":
      return (
        <g {...g}>
          <circle cx="0" cy="0" r="15" fill={body} />
          <path d="M0,-15 v-2 M10,-11 l1.6,-1.6 M15,0 h2 M10,11 l1.6,1.6 M0,15 v2 M-10,11 l-1.6,1.6 M-15,0 h-2 M-10,-11 l-1.6,-1.6" />
          <path d="M-6,-9 C6,-4 -6,4 6,9" />
          <path d="M6,-9 C-6,-4 6,4 -6,9" />
          <path d="M-3.4,-6.5 L3.4,-6.5 M-4.2,-2.3 L4.2,-2.3 M-4.2,2.3 L4.2,2.3 M-3.4,6.5 L3.4,6.5" opacity="0.65" />
          <circle cx="12" cy="-9" r="3.2" fill="currentColor" stroke="none" />
        </g>
      );
    default:
      return null;
  }
}

const ICON = {
  injury: "neuron", draper: "glia", phago: "phago", mitophagy: "mitophagy",
  protection: "mitoprotect", traf4: "protein", msn: "protein", jnk: "protein", nucleus: "nucleus",
};

export default function PathwaySignal() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodeEls = {};
    Object.keys(NODES).forEach((k) => (nodeEls[k] = svg.querySelector("#n-" + k)));
    const edgeEl = (a, b) => svg.querySelector(`#e-${a}-${b}`);
    const fbEl = svg.querySelector("#e-feedback");
    const pool = [...svg.querySelectorAll(".pulse")];
    const free = [...pool];
    pool.forEach((c) => (c.style.opacity = 0));

    const flare = {};
    Object.keys(NODES).forEach((k) => (flare[k] = 0));
    const lerp = (a, b, t) => a + (b - a) * t;
    function paint() {
      for (const k of Object.keys(NODES)) {
        const f = flare[k], el = nodeEls[k];
        const r = Math.round(lerp(165, 255, f)), gg = Math.round(lerp(182, 211, f)), bb = Math.round(lerp(232, 138, f));
        el.style.color = `rgb(${r},${gg},${bb})`;
        el.style.filter = f > 0.05 ? `drop-shadow(0 0 ${9 * f}px rgba(255,150,190,${0.9 * f}))` : "none";
      }
    }

    if (reduce) {
      Object.keys(flare).forEach((k) => (flare[k] = 0.35));
      paint();
      return () => {};
    }

    let pulses = [], pending = [], frame = 0, raf;
    const SPEED = 3.0;
    function addPulse(pathEl, onDone) {
      if (!pathEl) { onDone && onDone(); return; }
      const c = free.pop();
      if (!c) { onDone && onDone(); return; }
      c.style.opacity = 1;
      pulses.push({ c, path: pathEl, len: pathEl.getTotalLength(), t: 0, onDone });
    }
    const wait = (f, fn) => pending.push({ at: frame + f, fn });
    function chain(names, onEnd) {
      let i = 0;
      (function nx() {
        if (i >= names.length - 1) { onEnd && onEnd(); return; }
        addPulse(edgeEl(names[i], names[i + 1]), () => { flare[names[i + 1]] = 1; i++; nx(); });
      })();
    }
    function cycle() {
      addPulse(edgeEl("injury", "draper"), () => {
        flare.draper = 1;
        chain(["draper", "phago", "mitophagy", "protection"]);
        chain(["draper", "traf4", "msn", "jnk", "nucleus"], () => {
          flare.nucleus = 1;
          addPulse(fbEl, () => { flare.draper = 1; wait(46, cycle); });
        });
      });
    }
    function tick() {
      frame++;
      for (let i = pending.length - 1; i >= 0; i--)
        if (frame >= pending[i].at) { const fn = pending[i].fn; pending.splice(i, 1); fn(); }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += SPEED / (p.len || 1);
        if (p.t >= 1) { p.c.style.opacity = 0; free.push(p.c); pulses.splice(i, 1); p.onDone && p.onDone(); }
        else { const pt = p.path.getPointAtLength(p.t * p.len); p.c.setAttribute("cx", pt.x); p.c.setAttribute("cy", pt.y); }
      }
      for (const k of Object.keys(flare)) flare[k] *= 0.93;
      paint();
      raf = requestAnimationFrame(tick);
    }
    cycle();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pathway-viz">
      <svg ref={svgRef} className="psvg" viewBox="0 0 1000 470" preserveAspectRatio="xMidYMid meet">
        <style>{`
          .psvg { width:100%; height:auto; display:block; background:#07090f; }
          .psvg text { font-family:"IBM Plex Mono", monospace; }
          .psvg .nlabel { font-size:12px; fill:#9aa4bc; text-anchor:middle; }
          .psvg .flabel { font-size:11.5px; text-anchor:middle; }
          .psvg .edge { stroke:rgba(120,140,205,0.16); stroke-width:1.4; fill:none; }
          .psvg .feedback { stroke:rgba(255,157,191,0.30); stroke-width:1.4; fill:none; stroke-dasharray:6 6; }
          .psvg .node { color:rgb(165,182,232); }
          .psvg .pulse { fill:#ffd38a; filter:drop-shadow(0 0 5px #ff7ab0); }
        `}</style>

        {EDGES.map(([a, b]) => (
          <path key={`${a}-${b}`} id={`e-${a}-${b}`} className="edge"
            d={`M${NODES[a].x},${NODES[a].y} L${NODES[b].x},${NODES[b].y}`} />
        ))}
        <path id="e-feedback" className="feedback" d={FEEDBACK_D} />

        <text className="flabel" x="470" y="26" fill="#ff9dbf">feedback via Stat92E</text>
        <text className="flabel" x="352" y="214" fill="#6a7a92">NPXY motif</text>
        <text className="flabel" x="500" y="228" fill="#6a7a92">repeated injury → prolonged activation</text>

        {Object.keys(NODES).map((k) => (
          <g key={k} id={`n-${k}`} className="node" transform={`translate(${NODES[k].x},${NODES[k].y})`}>
            <Glyph type={ICON[k]} />
            <text className="nlabel" y="34">{NODES[k].label}</text>
          </g>
        ))}

        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} className="pulse" r="3.2" cx="-10" cy="-10" />
        ))}

        <text x="14" y="458" fill="#5b6a86" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "10px" }}>
          // Draper–Stat92E axis
        </text>
      </svg>
    </div>
  );
}
