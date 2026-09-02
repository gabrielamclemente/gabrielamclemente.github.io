import { useEffect, useState } from "react";
import "./App.css";
import NeuralBackground from "./components/NeuralBackground/NeuralBackground";
import AlgoBand from "./components/AlgoBand/AlgoBand";
import BrainPipeline from "./components/BrainPipeline/BrainPipeline";
import PathwaySignal from "./components/PathwaySignal/PathwaySignal";
import { translations } from "./i18n";

const REPO = "https://github.com/gabrielamclemente/gabrielamclemente.github.io";
const PHOTOS = Array.from({ length: 14 }, (_, i) => i + 1);

function detectLang() {
  const n = (navigator.language || "en").toLowerCase();
  if (n.startsWith("pt")) return "pt";
  if (n.startsWith("es")) return "es";
  return "en";
}

function watermarkBg(text) {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='170'>" +
    "<text x='0' y='95' fill='rgba(255,255,255,0.32)' font-family='monospace' " +
    "font-size='14' transform='rotate(-30 160 85)'>" + text + "</text></svg>";
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function Shot({ n }) {
  const candidates = [
    `/photo-${n}.jpeg`, `/photo-${n}.jpg`,
    `/photo-${n}.JPEG`, `/photo-${n}.JPG`, `/photo-${n}.png`,
  ];
  const [idx, setIdx] = useState(0);
  const [dead, setDead] = useState(false);
  if (dead) return null;
  return (
    <figure className="shot">
      <img
        src={candidates[idx]}
        alt=""
        draggable={false}
        onError={() => (idx < candidates.length - 1 ? setIdx(idx + 1) : setDead(true))}
      />
      <div className="wm" />
    </figure>
  );
}

export default function App() {
  const [lang, setLang] = useState(detectLang);
  const [view, setView] = useState("home");
  const [pendingScroll, setPendingScroll] = useState(null);
  const [armed, setArmed] = useState(false); // watermark visible only when true
  const t = translations[lang];

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // best-effort screenshot guard: flash the watermark on likely-capture events.
  // NOTE: cannot catch macOS Cmd+Shift+4 or phone screenshots — the page never
  // sees those. For guaranteed coverage, make .wm always visible in App.css.
  useEffect(() => {
    let timer;
    const flash = () => {
      setArmed(true);
      clearTimeout(timer);
      timer = setTimeout(() => setArmed(false), 1800);
    };
    const onKey = (e) => {
      if (e.key === "PrintScreen") return flash();
      const k = (e.key || "").toLowerCase();
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ["3", "4", "5", "s"].includes(k)) flash();
    };
    const onBlur = () => flash();
    const onVis = () => { if (document.visibilityState === "hidden") flash(); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (view === "home" && pendingScroll) {
      document.getElementById(pendingScroll)?.scrollIntoView({ behavior: "smooth" });
      setPendingScroll(null);
    }
  }, [view, pendingScroll]);

  const goSection = (id) => (e) => {
    e.preventDefault();
    if (view !== "home") { setView("home"); setPendingScroll(id); }
    else { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }
  };
  const goPhotos = (e) => { e.preventDefault(); setView("photos"); window.scrollTo(0, 0); };
  const goHome = (e) => { e.preventDefault(); setView("home"); window.scrollTo(0, 0); };
  const hideIfMissing = (e) => { e.currentTarget.style.display = "none"; };

  // watermark text is injected into the CSS variable used by .wm
  const wmStyle = { "--wm": watermarkBg(t.photo.watermark) };

  return (
    <div className="app">
      <NeuralBackground />

      <nav className="nav">
        <span className="mark">Gabriela Clemente</span>
        <span className="nav-right">
          <span className="langs">
            {["en", "pt", "es"].map((l) => (
              <button
                key={l}
                className={lang === l ? "active" : ""}
                onClick={() => setLang(l)}
                aria-label={`Switch language to ${l.toUpperCase()}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </span>
          <span className="links">
            <a href="#research" onClick={goSection("research")}>{t.nav.research}</a>
            <a href="#engineering" onClick={goSection("engineering")}>{t.nav.engineering}</a>
            <a href="#photography" onClick={goPhotos}>{t.nav.photography}</a>
            <a href="#about" onClick={goSection("about")}>{t.nav.about}</a>
            <a href="#contact" onClick={goSection("contact")}>{t.nav.contact}</a>
          </span>
        </span>
      </nav>

      {view === "home" ? (
        <>
          <header className="hero">
            <h1>
        <span className="line">Gabriela</span> <span className="line">Clemente</span>
        </h1>
            <p className="tagline">
              {t.tag.a} <span className="op">&times;</span> {t.tag.b}{" "}
              <span className="op">&times;</span> {t.tag.c}
            </p>
            <span className="scroll-cue">{t.scroll}</span>
          </header>

          <section id="research" className="section">
            <div className="inner">
              <p className="eyebrow">{t.research.eyebrow}</p>
              <h2>{t.research.h2}</h2>
              <p className="lede">{t.research.lede}</p>

              <div className="project">
                <h3>{t.research.p1.h3}</h3>
                <p className="lede">{t.research.p1.body}</p>
                <div className="plates">
                  <figure className="plate">
                    <div className="frame">
                      <span className="tag">Fig. 1</span>
                      <img src="/confocal-1.png" alt="" onError={hideIfMissing} />
                    </div>
                    <figcaption>{t.research.p1.fig1}</figcaption>
                  </figure>
                  <figure className="plate">
                    <div className="frame">
                      <span className="tag">Fig. 2</span>
                      <img src="/confocal-2.png" alt="" onError={hideIfMissing} />
                    </div>
                    <figcaption>{t.research.p1.fig2}</figcaption>
                  </figure>
                </div>
              </div>

              <div className="project">
                <h3>{t.research.p2.h3}</h3>
                <p className="lede">{t.research.p2.body}</p>
                <figure className="pathway">
                  <PathwaySignal />
                  <figcaption>{t.research.p2.fig}</figcaption>
                </figure>
              </div>
            </div>
          </section>

          <AlgoBand />

          <section id="engineering" className="section">
            <div className="inner">
              <p className="eyebrow">{t.eng.eyebrow}</p>
              <h2>{t.eng.h2}</h2>
              <p className="lede">{t.eng.lede}</p>
              <div className="project"><h3>{t.eng.e1.h3}</h3><p className="lede">{t.eng.e1.body}</p></div>
              <div className="project"><h3>{t.eng.e2.h3}</h3><p className="lede">{t.eng.e2.body}</p></div>
              <figure className="pipeline">
                <BrainPipeline />
                <figcaption>{t.eng.pipeline}</figcaption>
              </figure>
              <div className="project">
                <h3>{t.eng.e3.h3}</h3>
                <p className="lede">
                  {t.eng.e3.body}{" "}
                  <a href={REPO} target="_blank" rel="noopener noreferrer">{t.eng.source}</a>
                </p>
              </div>
            </div>
          </section>

          <section id="about" className="section about">
            <div className="inner">
              <p className="eyebrow">{t.about.eyebrow}</p>
              <h2>{t.about.h2}</h2>
              <p className="lede">{t.about.lede}</p>
            </div>
          </section>

          <section id="contact" className="section">
            <div className="inner">
              <p className="eyebrow">{t.contact.eyebrow}</p>
              <h2>{t.contact.h2}</h2>
              <div className="contact-links">
                <a href="https://github.com/gabrielamclemente">GitHub</a>
                <a href={t.contact.resumeFile} target="_blank" rel="noopener noreferrer">{t.contact.resume}</a>
                <a href="mailto:you@example.com">{t.contact.email}</a>
              </div>
            </div>
          </section>
        </>
      ) : (
        <main className="photo-page">
          <section className="section">
            <div className="inner">
              <a className="back" href="#" onClick={goHome}>{t.photo.back}</a>
              <p className="eyebrow">{t.photo.eyebrow}</p>
              <h2>{t.photo.title}</h2>
              <p className="lede">{t.photo.intro}</p>

              <div
                className={"gallery" + (armed ? " armed" : "")}
                style={wmStyle}
                onContextMenu={(e) => e.preventDefault()}
              >
                {PHOTOS.map((n) => <Shot key={n} n={n} />)}
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}