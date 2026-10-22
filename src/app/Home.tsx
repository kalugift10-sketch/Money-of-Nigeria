"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/Card";
import { Guilloche } from "@/components/Guilloche";
import { ERAS, TYPES, entries, meta, typeOf } from "@/lib/data";
import s from "./Home.module.css";

const PAGE = 10; // mobile "Show more" step

export function Home() {
  // Hero: objects that have a photo, cycling on their own.
  const heroItems = useMemo(() => entries.filter((e) => e.images.front), []);
  const [hi, setHi] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || heroItems.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setHi((i) => (i + 1) % heroItems.length), 4500);
    return () => clearInterval(t);
  }, [paused, heroItems.length]);
  const hero = heroItems[hi];

  // Filters
  const [q, setQ] = useState("");
  const [era, setEra] = useState("");
  const [type, setType] = useState("");
  const [sheet, setSheet] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get("era");
    if (e && ERAS[e]) { setEra(e); document.getElementById("all")?.scrollIntoView(); }
  }, []);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (era && e.era !== era) return false;
      if (type && typeOf(e) !== type) return false;
      if (!needle) return true;
      const hay = [e.name, e.about, e.system, ...e.changes.map((c) => c.title + " " + c.what), ...e.details.map((d) => d.join(" "))].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [q, era, type]);
  const active = (era ? 1 : 0) + (type ? 1 : 0);

  return (
    <>
      <section className={`wrap ${s.hero}`}>
        <div className={s.intro}>
          <h1 className={s.title}>The Money Of Nigeria</h1>
          <p className={s.desc}>{meta.description}</p>
        </div>
        {hero && (
          <div className={s.stageCol} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <Link href={`/money/${hero.slug}`} className={s.stage} style={{ background: hero.tintColors[0] }} aria-label={`Open ${hero.name}`}>
              <Guilloche color={hero.tintColors[1]} />
              <span className={s.caption}>{hero.name}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={hero.slug} src={hero.images.front} alt={hero.name} className={`${s.heroObj} ${hero.slug === "trade-by-barter" ? s.heroFill : ""}`} />
              <span className={`${s.year} ${hero.yearLabel.length > 5 ? s.yearLong : ""}`}>{hero.yearLabel}</span>
            </Link>
            <div className={s.dashes} aria-hidden>
              {[0, 1, 2, 3].map((i) => <span key={i} className={i === hi % 4 ? s.on : ""} />)}
            </div>
          </div>
        )}
      </section>

      <section id="all" className={`wrap ${s.catalog}`}>
        <div className={s.filters}>
          <label className={s.search}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" /><path d="M11 11l3 3" stroke="currentColor" /></svg>
            <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Search currencies, years" aria-label="Search" />
          </label>
          <div className={s.dropdowns}>
            <Select label="All eras" value={era} onChange={setEra} options={ERAS} />
            <Select label="All types" value={type} onChange={setType} options={TYPES} />
          </div>
          <button className={s.filterBtn} onClick={() => setSheet(true)}>Filter{active ? ` · ${active}` : ""}</button>
        </div>

        {list.length === 0 ? (
          <p className={s.empty}>Nothing matches your search.</p>
        ) : (
          <div className={s.grid}>
            {list.map((e, i) => (
              <div key={e.slug} className={i >= limit ? s.moreHidden : ""}><Card e={e} /></div>
            ))}
          </div>
        )}
        {list.length > limit && (
          <button className={s.more} onClick={() => setLimit((l) => l + PAGE)}>Show more</button>
        )}
      </section>

      {sheet && (
        <div className={s.sheetBg} onClick={() => setSheet(false)}>
          <div className={s.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Filter">
            <p className="label">Era</p>
            <Chips value={era} onChange={setEra} options={ERAS} all="All eras" />
            <p className="label">Type</p>
            <Chips value={type} onChange={setType} options={TYPES} all="All types" />
            <button className={s.done} onClick={() => setSheet(false)}>Show {list.length} results</button>
          </div>
        </div>
      )}
    </>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  const items: [string, string][] = [["", label], ...Object.entries(options)];
  return (
    <div ref={ref} className={`${s.select} ${open ? s.selectOpen : ""} ${value ? s.selectSet : ""}`}>
      <button type="button" className={s.selectBtn} onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open}>
        {value ? options[value] : label}
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <ul className={s.menu} role="listbox" aria-label={label}>
          {items.map(([k, v]) => (
            <li key={k} role="option" aria-selected={value === k}>
              <button type="button" className={value === k ? s.optOn : s.opt} onClick={() => { onChange(k); setOpen(false); }}>
                {v}
                {value === k && <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M3 7.5l2.5 2.5L11 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chips({ value, onChange, options, all }: { value: string; onChange: (v: string) => void; options: Record<string, string>; all: string }) {
  return (
    <div className={s.chips}>
      {[["", all], ...Object.entries(options)].map(([k, v]) => (
        <button key={k} className={value === k ? s.chipOn : s.chip} onClick={() => onChange(k)}>{v}</button>
      ))}
    </div>
  );
}
