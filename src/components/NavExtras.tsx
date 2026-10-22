"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { entries } from "@/lib/data";
import s from "./NavExtras.module.css";

/** Thin green line under the header that runs while a new page is loading. */
export function NavProgress() {
  const path = usePathname();
  const [state, setState] = useState<"idle" | "run" | "done">("idle");
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname)) return;
      setState("run");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  useEffect(() => {
    setState((st) => (st === "run" ? "done" : st));
    const t = setTimeout(() => setState("idle"), 400);
    return () => clearTimeout(t);
  }, [path]);
  return <div className={`${s.bar} ${state === "run" ? s.run : ""} ${state === "done" ? s.done : ""}`} aria-hidden />;
}

/** Search every coin, note and story by name, era or year. */
export function Search() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useEffect(() => { setQ(""); setOpen(false); }, [path]);
  useEffect(() => {
    const off = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, []);
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const words = t.split(/\s+/);
    return entries.filter((e) => {
      const hay = `${e.name} ${e.eraLine} ${e.yearLabel} ${e.kind ?? ""}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    }).slice(0, 8);
  }, [q]);
  const go = (slug: string) => { setOpen(false); router.push(`/money/${slug}`); };
  return (
    <div className={s.search} ref={box}>
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden className={s.icon}><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      <input value={q} placeholder="Search money" aria-label="Search money" role="combobox" aria-expanded={open && hits.length > 0} aria-controls="search-list"
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, hits.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
          if (e.key === "Enter" && hits[hi]) go(hits[hi].slug);
          if (e.key === "Escape") setOpen(false);
        }} />
      {open && q.trim() && (
        <ul className={s.list} id="search-list" role="listbox">
          {hits.length === 0 && <li className={s.none}>Nothing found</li>}
          {hits.map((e, i) => (
            <li key={e.slug} role="option" aria-selected={i === hi}>
              <Link href={`/money/${e.slug}`} className={i === hi ? s.hi : ""} onMouseEnter={() => setHi(i)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {e.images.front ? <img src={e.images.front} alt="" /> : <span className={s.ph} />}
                <span><strong>{e.name}</strong><small>{e.eraLine}</small></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
