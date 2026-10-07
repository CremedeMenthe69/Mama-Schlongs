"use client";

import { useEffect, useRef, useState } from "react";
import { uploadPresigned } from "@vercel/blob/client";
import Shell from "@/components/Shell";

const ACCEPTED = ".jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.webm,.mov,.mp3,.wav,.flac,.ogg,.glb,.gltf,.html";

const KIND: Record<string, string> = {
  jpg: "a picture", jpeg: "a picture", png: "a picture", gif: "a GIF", webp: "a picture", svg: "a picture",
  mp4: "a video", webm: "a video", mov: "a video",
  mp3: "some audio", wav: "some audio", flac: "some audio", ogg: "some audio",
  glb: "a 3D model", gltf: "a 3D model", html: "an interactive piece",
};
const ext = (name: string) => name.split(".").pop()?.toLowerCase() || "";

export default function KitchenPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [current, setCurrent] = useState<any>(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [about, setAbout] = useState("");
  const [aboutState, setAboutState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  // Load what's on the menu right now
  useEffect(() => {
    if (!authed) return;
    fetch("/api/get-work", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.work) { setCurrent(d.work); setCaption(d.work.caption || ""); }
        setAbout(d.about || "");
      })
      .catch(() => {});
  }, [authed]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setLoginError("Type your password first."); return; }
    const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setAuthed(true); setLoginError(""); }
    else setLoginError("That password is wrong. Try again.");
  };

  const pick = (f: File) => {
    setFile(f); setSaved(false);
    setPreview(["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext(f.name)) ? URL.createObjectURL(f) : null);
  };

  const serve = async () => {
    setError(""); setSaved(false); setProgress(0); setSaving(true);
    try {
      // 1. Send the file straight from your browser to storage
      let url = "", filename = "";
      if (file) {
        filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const blob = await uploadPresigned(`works/${filename}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          clientPayload: password,
          multipart: file.size > 100 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
        });
        url = blob.url;
      }
      // 2. Put it on the menu
      const res = await fetch("/api/save-work", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ url, filename, caption }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Saving didn't work. Try again.");
      setSaved(true); setCurrent(json.work); setFile(null); setPreview(null);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError((err as Error).message || "The upload didn't finish. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveAbout = async () => {
    setAboutState("saving");
    const res = await fetch("/api/save-about", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ text: about }),
    });
    setAboutState(res.ok ? "saved" : "error");
    if (res.ok) setTimeout(() => setAboutState("idle"), 4000);
  };

  // ── Locked kitchen door ────────────────────────────────────────────────────
  if (!authed) {
    return (
      <Shell page="kitchen">
        <section className="mm-menu">
          <h2>Mama&apos;s kitchen</h2>
          <p className="mm-served">Staff only. What&apos;s the password?</p>
          <form onSubmit={login} className="mm-kitchen" style={{ maxWidth: 380 }}>
            <input
              type="password" className="mm-input" value={password} autoFocus
              onChange={e => setPassword(e.target.value)} aria-label="Password"
            />
            <div className="mm-row">
              <button type="submit" className="mm-btn">Come in</button>
              {loginError && <span className="mm-error">{loginError}</span>}
            </div>
          </form>
        </section>
      </Shell>
    );
  }

  // ── Kitchen ────────────────────────────────────────────────────────────────
  const busyLabel = file ? `Uploading ${progress}%` : "Saving";

  return (
    <Shell page="kitchen">
      <section className="mm-menu">
        <h2>Mama&apos;s kitchen</h2>
        <p className="mm-served">Cook up today&apos;s special.</p>

        <div className="mm-kitchen">
          {current?.filename && (
            <p className="mm-now">On the menu now: <strong>{current.filename}</strong>, served {current.date}.</p>
          )}

          <label className="mm-label" htmlFor="mm-file">Today&apos;s special</label>
          <p className="mm-hint">Pictures, GIFs, videos, audio, 3D models, or HTML. Leave it empty to keep the current one.</p>
          <div
            className={`mm-drop${dragging ? " over" : ""}`}
            role="button" tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) pick(f); }}
          >
            <input id="mm-file" ref={fileRef} type="file" accept={ACCEPTED} hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) pick(f); }} />
            {preview && <img src={preview} alt="" />}
            {file
              ? <>{file.name}<small>That&apos;s {KIND[ext(file.name)] || "a file"}, {(file.size / 1024 / 1024).toFixed(1)} MB.</small></>
              : <>Drop a file here, or click to pick one</>}
          </div>

          <label className="mm-label" htmlFor="mm-caption">What Mama says about it</label>
          <textarea id="mm-caption" className="mm-lined" rows={4} value={caption}
            onChange={e => { setCaption(e.target.value); setSaved(false); }} />

          <div className="mm-row">
            <button className="mm-btn" onClick={serve} disabled={saving || (!file && !current)}>
              {saving ? busyLabel : "Serve it"}
            </button>
            {saved && <span className="mm-note">Served. It&apos;s on the menu now. <a href="/" target="_blank">Take a look</a></span>}
            {error && <span className="mm-error">{error}</span>}
          </div>

          <label className="mm-label" htmlFor="mm-about">About Mama</label>
          <p className="mm-hint">Leave a blank line between paragraphs.</p>
          <textarea id="mm-about" className="mm-lined" rows={8} value={about}
            onChange={e => { setAbout(e.target.value); setAboutState("idle"); }} />
          <div className="mm-row">
            <button className="mm-btn mm-ghost" onClick={saveAbout} disabled={aboutState === "saving"}>
              {aboutState === "saving" ? "Saving" : "Save About"}
            </button>
            {aboutState === "saved" && <span className="mm-note">Saved. <a href="/about" target="_blank">See the About page</a></span>}
            {aboutState === "error" && <span className="mm-error">Saving didn&apos;t work. Try again.</span>}
            <button className="mm-btn mm-ghost" style={{ marginLeft: "auto" }}
              onClick={() => { setAuthed(false); setPassword(""); }}>Lock the kitchen</button>
          </div>
        </div>
      </section>
    </Shell>
  );
}
