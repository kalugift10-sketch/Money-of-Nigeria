"use client";

import { useEffect, useState } from "react";
import { facts } from "@/lib/data";
import { Coin3D } from "./Coin";
import { Logo } from "./Chrome";
import s from "./Loading.module.css";

/**
 * First visit only. Shows real progress (page, fonts, images) and rotates
 * "Did you know?" facts. No music, no buttons: it moves on by itself.
 */
export function Loading() {
  const [show, setShow] = useState<boolean | null>(null);
  const [pct, setPct] = useState(0);
  const [fact, setFact] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("mon-loaded") === "1"; } catch {}
    if (seen) { setShow(false); return; }
    // Mark as seen straight away, so a reload never shows it again.
    try { sessionStorage.setItem("mon-loaded", "1"); } catch {}
    setShow(true);
    setFact(Math.floor(Math.random() * facts.length));

    const started = Date.now();
    const MIN = 10000; // owner: at least 10 seconds
    const imgs = Array.from(document.images).filter((i) => i.loading !== "lazy");
    const tasks = [
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true }))),
      ...imgs.map((i) => (i.complete ? Promise.resolve() : new Promise<void>((r) => { i.onload = i.onerror = () => r(); }))),
    ];
    
    // Smoothly creep the bar so it never looks stuck.
    const creep = setInterval(() => setPct((p) => Math.max(p, Math.min(99, Math.round(((Date.now() - started) / MIN) * 100)))), 80);
    const rotate = setInterval(() => setFact((f) => (f + 1) % facts.length), 4200);

    // Shown for 10 seconds, whatever is still loading.
    const MAX = 10000;
    Promise.race([Promise.all(tasks), new Promise((r) => setTimeout(r, MAX))]).then(() => {
      const wait = Math.max(0, MIN - (Date.now() - started));
      setTimeout(() => {
        setPct(100);
        setLeaving(true);
        try { sessionStorage.setItem("mon-loaded", "1"); } catch {}
        setTimeout(() => setShow(false), 500);
      }, wait);
    });
    return () => { clearInterval(creep); clearInterval(rotate); };
  }, []);

  if (!show) return null;
  const f = facts[fact];
  return (
    <div className={`${s.screen} ${leaving ? s.leave : ""}`} role="status" aria-live="polite">
      <div className={s.top}><Logo /></div>
      <div className={s.mid}>
        <div className={s.loader}>
          <Coin3D size={72} spin />
          <span className={s.shadow} aria-hidden />
          <p className={s.text}>Loading the collection… you’ll be in shortly. {pct}%</p>
        </div>
        <p className="label">Did you know?</p>
        <p key={fact} className={s.fact}>{f.text}</p>
        <p className={s.source}>{f.source}</p>
      </div>
    </div>
  );
}
