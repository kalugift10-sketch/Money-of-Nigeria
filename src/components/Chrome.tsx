"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "./Player";
import { entries, meta } from "@/lib/data";
import s from "./Chrome.module.css";
import { Guilloche } from "./Guilloche";
import { Coin3D } from "./Coin";
import { NavProgress, Search } from "./NavExtras";

export function Logo() {
  return (
    <Link href="/" className={s.logo} aria-label="The Money Of Nigeria, home">
      <span className={s.mark}><Coin3D size={40} /></span>
      <span className={s.name}>The Money Of Nigeria</span>
    </Link>
  );
}

/** Speaker: only plays/pauses. Ring shows track progress. */
export function SoundButton() {
  const p = usePlayer();
  const C = 2 * Math.PI * 15;
  return (
    <button data-player className={s.sound} onClick={p.toggle} aria-label={p.playing ? "Pause music" : "Play music"}>
      <svg viewBox="0 0 32 32" className={s.ring} aria-hidden>
        <circle cx="16" cy="16" r="15" className={s.track} />
        <circle cx="16" cy="16" r="15" className={s.prog} style={{ strokeDasharray: C, strokeDashoffset: C * (1 - p.progress) }} />
      </svg>
      {p.playing ? (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden><rect x="4" y="3" width="3" height="10" /><rect x="9" y="3" width="3" height="10" /></svg>
      ) : (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden><path d="M3 6h3l4-3v10l-4-3H3z" fill="currentColor" /><path d="M12 5.5c1 .7 1 4.3 0 5" stroke="currentColor" fill="none" /></svg>
      )}
    </button>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const cur = (h: string) => (path === h || path.startsWith(h + "/") ? s.current : "");
  return (
    <header className={s.header}>
      <Logo />
      <NavProgress />
      <nav className={s.nav}>
        {path !== "/" && <Search />}
        <SoundButton />
        <Link href="/playlist" className={`${s.link} ${cur("/playlist")}`} aria-current={cur("/playlist") ? "page" : undefined}>Money playlist</Link>
        <Link href="/about" className={`${s.link} ${cur("/about")}`} aria-current={cur("/about") ? "page" : undefined}>About</Link>
        <button className={s.menu} aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </nav>
      {open && (
        <div className={s.sheet} onClick={() => setOpen(false)}>
          <Link href="/" className={path === "/" ? s.sheetOn : s.sheetLink}>Home</Link>
          <Link href="/playlist" className={cur("/playlist") ? s.sheetOn : s.sheetLink}>Money Playlist</Link>
          <Link href="/about" className={cur("/about") ? s.sheetOn : s.sheetLink}>About</Link>
        </div>
      )}
    </header>
  );
}

const SOURCE_NAMES: Record<string, string> = {
  "cbn.gov.ng": "Central Bank of Nigeria",
  "numista.com": "Numista",
  "onlinecoin.club": "Online Coin Club",
  "pmgnotes.com": "PMG Notes",
};

export function Footer() {
  const strip = entries.filter((e) => e.images.front && e.slug !== "trade-by-barter");
  // Phones: the strip scrolls on its own, and the visitor can swipe it to find a tile. Tap opens it.
  const mq = useRef<HTMLDivElement>(null);
  const [touchUI, setTouchUI] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    setTouchUI(true);
    const el = mq.current; if (!el) return;
    let held = false, resume = 0, raf = 0;
    const down = () => { held = true; };
    const up = () => { held = false; resume = Date.now() + 2000; };
    el.addEventListener("touchstart", down, { passive: true });
    el.addEventListener("touchend", up); el.addEventListener("touchcancel", up);
    const step = () => {
      if (!held && Date.now() > resume) {
        el.scrollLeft += 0.5;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft -= el.scrollWidth / 2;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("touchstart", down); el.removeEventListener("touchend", up); el.removeEventListener("touchcancel", up); };
  }, []);
  return (
    <footer className={s.footer}>
      <div className={s.guil} aria-hidden><Guilloche color="#1F5A45" width={1440} height={700} lines={24} amp={22} /></div>
      <div className={`wrap ${s.fwrap}`}>
        <div className={s.strip}>
          <p className={s.stripLabel}>500 years in one line</p>
          <div ref={mq} className={`${s.marquee} ${touchUI ? s.swipe : ""}`}>
            <div className={s.tiles}>
              {[...strip, ...strip].map((e, i) => (
                <Link key={i} href={`/money/${e.slug}`} className={`paper ${s.tile2}`} aria-label={e.name} aria-hidden={i >= strip.length || undefined} tabIndex={i >= strip.length ? -1 : undefined}>
                  <span className={`${s.flip} ${e.images.back && e.type !== "story" ? s.canFlip : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={s.fFront} src={e.images.front} alt="" loading="lazy" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {e.images.back && e.type !== "story" && <img className={s.fBack} src={e.images.back} alt="" loading="lazy" />}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className={s.cols}>
          <div><h3>About</h3><p>{meta.description}</p></div>
          <div>
            <h3>Sources</h3>
            <ul>{["cbn.gov.ng", "numista.com", "onlinecoin.club", "pmgnotes.com"].map((k) => <li key={k}>{SOURCE_NAMES[k] ?? k}</li>)}</ul>
            <p className={s.policy}><Link href="/sources">All sources →</Link></p>
          </div>
          <div><h3>Listen</h3><Link href="/playlist">Money Playlist ↗</Link></div>
        </div>
        <div className={s.credit}><span>Designed by Gift Kalu</span><span>© {new Date().getFullYear()} The Money of Nigeria</span></div>
      </div>
    </footer>
  );
}

/** Fixed bottom-left once music has started; hidden on the playlist page. */
export function MiniPlayer() {
  const p = usePlayer();
  const path = usePathname();
  const [small, setSmall] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number; moved: boolean; sx: number; sy: number } | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  // Remember minimised state and position between pages.
  useEffect(() => {
    try {
      setSmall(sessionStorage.getItem("mon-mini-small") === "1");
      const sp = sessionStorage.getItem("mon-mini-pos");
      if (sp) setPos(JSON.parse(sp));
    } catch {}
  }, []);
  useEffect(() => { try { sessionStorage.setItem("mon-mini-small", small ? "1" : "0"); } catch {} }, [small]);

  // Desktop only: drag by holding anywhere on the player.
  const onDown = (e: React.PointerEvent) => {
    if (window.matchMedia("(max-width: 760px)").matches) return;
    if ((e.target as HTMLElement).closest("button,a")) return;
    const r = box.current!.getBoundingClientRect();
    e.preventDefault(); // stop the browser dragging the cover image
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false, sx: e.clientX, sy: e.clientY } as typeof drag.current;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 4) return; // a click, not a drag
    d.moved = true;
    const r = box.current!.getBoundingClientRect();
    const x = Math.min(Math.max(8, e.clientX - d.dx), window.innerWidth - r.width - 8);
    const y = Math.min(Math.max(8, e.clientY - d.dy), window.innerHeight - r.height - 8);
    last.current = { x, y };
    setPos({ x, y });
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (last.current) try { sessionStorage.setItem("mon-mini-pos", JSON.stringify(last.current)); } catch {}
    if (d && !d.moved && small) setSmall(false);
  };

  if (!p.started || path === "/playlist") return null;
  const style = pos ? { left: pos.x, top: pos.y, bottom: "auto" } : undefined;
  if (small) {
    return (
      <div data-player ref={box} className={s.miniSmall} style={style} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
        role="button" aria-label="Open the music player" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setSmall(false); }}>
        <Disc size={44} cover={p.current.cover} spinning={p.playing} />
      </div>
    );
  }
  return (
    <div data-player ref={box} className={s.mini} style={style} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}>
      <Disc size={44} cover={p.current.cover} spinning={p.playing} />
      <div className={s.miniText}>
        <strong>{p.current.title}</strong>
        <span>{p.current.artist}</span>
      </div>
      <button className={s.miniBtn} onClick={p.toggle} aria-label={p.playing ? "Pause" : "Play"}>
        {p.playing
          ? <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><rect x="3" y="2" width="3.5" height="12" rx="1.2" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" rx="1.2" fill="currentColor" /></svg>
          : <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d="M5 2.8v10.4a1 1 0 0 0 1.5.86l8.3-5.2a1 1 0 0 0 0-1.72L6.5 1.94A1 1 0 0 0 5 2.8z" fill="currentColor" /></svg>}
      </button>
      <button className={s.miniMin} onClick={() => setSmall(true)} aria-label="Minimise the music player">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}

/** The playing song's cover, spinning like a record. */
export function Disc({ size, cover, spinning }: { size: number | string; cover?: string; spinning: boolean }) {
  return (
    <div className={`${s.disc} ${spinning ? s.spin : ""}`} style={{ width: size, aspectRatio: "1" }}>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" onError={(ev) => { ev.currentTarget.style.visibility = "hidden"; }} />
      ) : (
        <div className={s.discPh} />
      )}
      <span className={s.hole} />
    </div>
  );
}
