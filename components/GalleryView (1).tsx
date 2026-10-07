"use client";

import { createElement, useEffect, useRef, useState } from "react";
import Shell, { Underline } from "./Shell";

interface Work {
  url: string;
  filename: string;
  caption: string;
  date: string;
}

function getType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";
  if (["mp3", "wav", "flac", "ogg"].includes(ext)) return "audio";
  if (["glb", "gltf"].includes(ext)) return "model";
  if (ext === "html") return "interactive";
  return "image";
}

function prettyDate(d: string) {
  const date = new Date(`${d}T12:00:00`);
  return isNaN(date.getTime()) ? d : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// A blank line starts a new paragraph; a single Enter is kept as a line break
function toParagraphs(text: string) {
  return text.replace(/\r\n/g, "\n").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

// ─── Viewers ─────────────────────────────────────────────────────────────────

function AudioViewer({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => { cancelAnimationFrame(animRef.current); audioRef.current?.pause(); }, []);

  const draw = () => {
    const canvas = canvasRef.current, analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    ctx.clearRect(0, 0, W, H);
    const bw = W / data.length * 2.2;
    for (let i = 0, x = 0; i < data.length; i++, x += bw) {
      const h = (data[i] / 255) * H * 0.9;
      ctx.fillStyle = i % 2 ? "#c8102e" : "#2f6b3a";
      ctx.fillRect(x, H - h, bw - 2, h);
    }
    animRef.current = requestAnimationFrame(draw);
  };

  const toggle = () => {
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.crossOrigin = "anonymous";
      const ac = new AudioContext();
      const analyser = ac.createAnalyser();
      analyser.fftSize = 128;
      ac.createMediaElementSource(audio).connect(analyser);
      analyser.connect(ac.destination);
      audio.onended = () => setPlaying(false);
      audioRef.current = audio;
      analyserRef.current = analyser;
    }
    if (playing) { audioRef.current.pause(); cancelAnimationFrame(animRef.current); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); draw(); }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <canvas ref={canvasRef} width={700} height={180} style={{ width: "100%", height: 180, display: "block" }} />
      <button className="mm-btn" onClick={toggle} style={{ marginTop: "1rem" }}>
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}

function ModelViewer({ src }: { src: string }) {
  // Google's <model-viewer> shows .glb / .gltf files you can spin around
  useEffect(() => {
    if (customElements.get("model-viewer")) return;
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.head.appendChild(s);
  }, []);
  return createElement("model-viewer", {
    src,
    "camera-controls": true,
    "auto-rotate": true,
    "shadow-intensity": "1",
    style: { width: "100%", height: "60vh", background: "transparent" },
  });
}

function MediaRenderer({ work }: { work: Work }) {
  const type = getType(work.filename);
  const src = work.url;
  if (type === "image") return <img src={src} alt={work.caption || "Today's special"} className="mm-media" />;
  let inner: React.ReactNode;
  if (type === "video") inner = <video src={src} className="mm-media" autoPlay loop muted playsInline controls />;
  else if (type === "audio") inner = <AudioViewer src={src} />;
  else if (type === "model") inner = <ModelViewer src={src} />;
  else inner = <iframe src={src} title="Today's special" sandbox="allow-scripts allow-same-origin" style={{ width: "100%", height: "60vh", border: "none", display: "block" }} />;
  return <>{inner}</>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GalleryView({ work }: { work: Work | null }) {
  const wide = work ? getType(work.filename) !== "image" : false;
  return (
    <Shell page="special">
      <section className="mm-menu">
        <h2>Today&apos;s special</h2>
        <p className="mm-served">
          {work ? `Served fresh on ${prettyDate(work.date)}` : "The kitchen opens soon"}
        </p>

        <div className={`mm-frame${wide ? " mm-wide" : ""}`}>
          {work ? <MediaRenderer work={work} /> : <img src="/mamas-boys.jpg" alt="Mama's boys" className="mm-media" />}
        </div>

        {toParagraphs(work ? work.caption : "Nothing on the menu yet. My boys say hello.").map((para, i) => (
          <p key={i} className="mm-caption" style={{ whiteSpace: "pre-line", marginTop: i ? "0.8rem" : undefined }}>{para}</p>
        ))}
        {(work?.caption || !work) && <Underline />}
      </section>
    </Shell>
  );
}
