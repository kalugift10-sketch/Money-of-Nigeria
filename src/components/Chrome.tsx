"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "./Player";
import { entries, meta } from "@/lib/data";
import s from "./Chrome.module.css";
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

/** Phones: the music lives at the bottom of the menu. */
function SheetPlayer() {
  const p = usePlayer();
  return (
    <div data-player className={s.sheetPlayer}>
      <Disc size={48} cover={p.current.cover} spinning={p.playing} />
      <div className={s.miniText}><strong>{p.current.title}</strong><span>{p.current.artist}</span></div>
      <button className={s.miniBtn} onClick={p.prev} aria-label="Previous song"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d="M12 3v10L5 8z" fill="currentColor"/><rect x="3" y="3" width="2" height="10" rx="1" fill="currentColor"/></svg></button>
      <button className={s.miniBtn} onClick={p.toggle} aria-label={p.playing ? "Pause" : "Play"}>
        {p.playing
          ? <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><rect x="3" y="2" width="3.5" height="12" rx="1.2" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" rx="1.2" fill="currentColor" /></svg>
          : <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d="M5 2.8v10.4a1 1 0 0 0 1.5.86l8.3-5.2a1 1 0 0 0 0-1.72L6.5 1.94A1 1 0 0 0 5 2.8z" fill="currentColor" /></svg>}
      </button>
      <button className={s.miniBtn} onClick={p.next} aria-label="Next song"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d="M4 3v10l7-5z" fill="currentColor"/><rect x="11" y="3" width="2" height="10" rx="1" fill="currentColor"/></svg></button>
    </div>
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
        <Link href="/playlist" className={`${s.link} ${cur("/playlist")}`} aria-current={cur("/playlist") ? "page" : undefined}>Money playlist</Link>
        <Link href="/sources" className={`${s.link} ${cur("/sources")}`} aria-current={cur("/sources") ? "page" : undefined}>Sources</Link>
        <Link href="/about" className={`${s.link} ${cur("/about")}`} aria-current={cur("/about") ? "page" : undefined}>About</Link>
        <button className={`${s.menu} ${open ? s.menuOpen : ""}`} aria-label={open ? "Close menu" : "Menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </nav>
      {open && (
        <div className={s.sheet} onClick={(e) => { if (!(e.target as HTMLElement).closest("[data-player]")) setOpen(false); }}>
          <Link href="/" className={path === "/" ? s.sheetOn : s.sheetLink}>Home</Link>
          <Link href="/playlist" className={cur("/playlist") ? s.sheetOn : s.sheetLink}>Money Playlist</Link>
          <Link href="/sources" className={cur("/sources") ? s.sheetOn : s.sheetLink}>Sources</Link>
          <Link href="/about" className={cur("/about") ? s.sheetOn : s.sheetLink}>About</Link>
          <SheetPlayer />
        </div>
      )}
    </header>
  );
}

const LINKEDIN = "https://ng.linkedin.com/in/gift-kalu-3969a3238";
const SOCIALS: [string, string][] = [
  ["Instagram", "https://www.instagram.com/battleaxefj"],
  ["X (Twitter)", "https://x.com/giftuxui"],
  ["LinkedIn", LINKEDIN],
];
const SOURCES: [string, string][] = [
  ["Central Bank of Nigeria", "https://www.cbn.gov.ng/Currency/historycur.html"],
  ["Numista", "https://en.numista.com/catalogue/nigeria-1.html"],
  ["Online Coin Club", "https://onlinecoin.club/Coins/Country/Nigeria/"],
  ["PMG Notes", "https://www.pmgnotes.com/"],
];
// Money in Nigerian languages and slang
const WORDS = ["Money", "Owó", "Kuɗi", "Ego", "Igho", "Okụk", "Ceede", "Moni", "Kpali", "Mulla"];

export function Footer() {
  const strip = entries.filter((e) => e.images.front && e.slug !== "trade-by-barter");
  // Phones: the strip scrolls on its own, and the visitor can swipe it to find a tile. Tap opens it.
  const mq = useRef<HTMLDivElement>(null);
  const [touchUI, setTouchUI] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    setTouchUI(true);
    const el = mq.current; if (!el) return;
    let held = false, resume = 0, raf = 0, x = el.scrollLeft;
    const down = () => { held = true; };
    const up = () => { held = false; resume = Date.now() + 1500; };
    el.addEventListener("touchstart", down, { passive: true });
    el.addEventListener("touchend", up); el.addEventListener("touchcancel", up);
    const step = () => {
      const half = el.scrollWidth / 2;
      if (held || Date.now() < resume) x = el.scrollLeft; // follow the finger
      else { x += 0.6; if (x >= half) x -= half; el.scrollLeft = x; } // keep a float so it never stalls
      if (el.scrollLeft >= half) { x -= half; el.scrollLeft = x; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("touchstart", down); el.removeEventListener("touchend", up); el.removeEventListener("touchcancel", up); };
  }, []);
  return (
    <footer className={s.footer}>
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
            <h3>Explore</h3>
            <ul>
              <li><Link href="/">All money</Link></li>
              <li><Link href="/playlist">Money playlist</Link></li>
              <li><Link href="/sources">Sources</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>
          <div>
            <h3>Main sources</h3>
            <ul>{SOURCES.map(([n, u]) => <li key={u}><a href={u} target="_blank" rel="noopener">{n}</a></li>)}</ul>
          </div>
          <div>
            <h3>Follow</h3>
            <ul>{SOCIALS.map(([n, u]) => <li key={u}><a href={u} target="_blank" rel="noopener">{n}</a></li>)}</ul>
          </div>
        </div>
      </div>
      <div className={`wrap ${s.credit}`}>
        <a href={LINKEDIN} target="_blank" rel="noopener">Designed by Gift Kalu</a>
        <span>© {new Date().getFullYear()} The Money of Nigeria</span>
      </div>
      <div className={s.words} aria-hidden>
        <div className={s.wordsTrack}>
          {[...WORDS, ...WORDS].map((w, i) => <span key={i}>{w}<i>·</i></span>)}
        </div>
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

  // Phones: shrink to the disc while scrolling, open again when scrolling stops,
  // unless the visitor minimised it themselves (then it stays a disc).
  const [scrolling, setScrolling] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    let t: ReturnType<typeof setTimeout>;
    const on = () => { setScrolling(true); clearTimeout(t); t = setTimeout(() => setScrolling(false), 700); };
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); clearTimeout(t); };
  }, []);

  // Desktop only: drag by holding anywhere on the player.
  const onDown = (e: React.PointerEvent) => {
    const phone = window.matchMedia("(max-width: 760px)").matches;
    if (phone && !(small || scrolling)) return; // phones: the bar stays put; the disc can be dragged
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
    if (d && !d.moved && (small || scrolling)) { setSmall(false); setScrolling(false); }
  };

  if (!p.started || path === "/playlist") return null;
  const style = pos ? { left: pos.x, top: pos.y, bottom: "auto" } : undefined;
  const isPhone = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
  if (small || scrolling) {
    const ds = pos ? { left: pos.x, top: pos.y, bottom: "auto", right: "auto" } : undefined;
    return (
      <div data-player ref={box} className={s.miniSmall} style={ds} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
        role="button" aria-label="Open the music player" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setSmall(false); }}>
        <Disc size={44} cover={p.current.cover} spinning={p.playing} />
      </div>
    );
  }
  return (
    <div data-player ref={box} className={s.mini} style={isPhone ? undefined : style} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}>
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
