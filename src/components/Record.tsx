"use client";
import { useState } from "react";
import type { Entry, RecordType, Side } from "@/lib/data";
import s from "./Record.module.css";

/** Catalogue record: every field Numista and other sources state, one tab per catalogue type. */
export function Record({ record }: { record: NonNullable<Entry["record"]> }) {
  const types = record.types;
  const [i, setI] = useState(types.length - 1 >= 0 ? types.length - 1 : 0);
  if (!types.length && !record.extra.length) return null;
  const t = types[i];
  return (
    <section className={s.wrap} aria-labelledby="rec">
      <div className={s.head}>
        <h2 id="rec" className={s.h2}>Catalogue record</h2>
        {types.length > 1 && <p className={s.count}>{types.length} types</p>}
      </div>
      {types.length > 1 && (
        <div className={s.tabs} role="tablist">
          {types.map((x, k) => (
            <button key={k} role="tab" aria-selected={k === i} className={k === i ? s.on : ""} onClick={() => setI(k)}>
              <span>{years(x)}</span><small>{short(x)}</small>
            </button>
          ))}
        </div>
      )}
      {t && <Type t={t} />}
      {record.extra.length > 0 && (
        <Block title="From other sources">
          <dl className={s.grid}>{record.extra.map(([k, v], n) => <Row key={n} k={k} v={v} />)}</dl>
        </Block>
      )}
    </section>
  );
}

function Type({ t }: { t: RecordType }) {
  const has = (x?: string) => !!x && x.trim() !== "";
  return (
    <div className={s.type}>
      <p className={s.title}>{t.title} <span className={s.n}>{t.numista}</span></p>
      <Block title="Features">
        <dl className={s.grid}>
          {t.features.map(([k, v]) => <Row key={k} k={k} v={v} />)}
          {has(t.series) && <Row k="Series" v={t.series!} />}
          {has(t.commemorative) && <Row k="Commemorative issue" v={t.commemorative!} />}
        </dl>
      </Block>
      <div className={s.sides}>
        <SideBlock title="Obverse" x={t.obverse} />
        <SideBlock title="Reverse" x={t.reverse} />
      </div>
      {(has(t.watermark) || has(t.edge)) && (
        <Block title={has(t.watermark) ? "Watermark and edge" : "Edge"}>
          <dl className={s.grid}>{has(t.watermark) && <Row k="Watermark" v={t.watermark!} />}{has(t.edge) && <Row k="Edge" v={t.edge!} />}</dl>
        </Block>
      )}
      {t.mints.length > 0 && (
        <Block title={t.mints.length > 1 ? "Mints" : "Mint"}>
          <dl className={s.grid}>{t.mints.map(([m, n], k) => <Row key={k} k={m || "No mark"} v={n} />)}</dl>
        </Block>
      )}
      {t.signatures.length > 0 && (
        <Block title="Signatures">
          <dl className={s.grid}>{t.signatures.map(([n, r], k) => <Row key={k} k={r} v={n} />)}</dl>
        </Block>
      )}
      {t.mintage.rows.length > 0 && (
        <Block title={t.mintage.columns.includes("Mintage") ? "Mintage" : "Dates and varieties"}>
          <div className={s.scroll}>
            <table className={s.table}>
              <thead><tr>{t.mintage.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>{t.mintage.rows.map((r, k) => <tr key={k}>{t.mintage.columns.map((_, c) => <td key={c}>{r[c] || "–"}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </Block>
      )}
      {has(t.comments) && <Block title="Comments"><p className={s.p}>{t.comments}</p></Block>}
      {t.sets && t.sets.length > 0 && <Block title="Present in sets"><p className={s.p}>{t.sets.join("; ")}</p></Block>}
    </div>
  );
}

function SideBlock({ title, x }: { title: string; x: Side }) {
  if (!x || (!x.description && !x.lettering)) return null;
  return (
    <Block title={title}>
      {x.description && <p className={s.p}>{x.description}</p>}
      <dl className={s.grid}>
        {x.lettering && <div className={s.row}><dt>Lettering</dt><dd className={s.mono}>{x.lettering}</dd></div>}
        {x.translation && <Row k="Translation" v={x.translation} />}
        {x.script && <Row k="Script" v={x.script} />}
        {x.engraver && <Row k="Engraver" v={x.engraver} />}
      </dl>
    </Block>
  );
}

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className={s.block}><p className="label">{title}</p>{children}</div>
);
const Row = ({ k, v }: { k: string; v: string }) => (
  <div className={s.row}><dt>{k}</dt><dd>{v}</dd></div>
);
const years = (t: RecordType) => {
  const f = Object.fromEntries(t.features);
  return f["Years"] || f["Year"] || f["Date"] || t.title;
};
const short = (t: RecordType) => {
  const f = Object.fromEntries(t.features);
  return [f["Composition"], (f["King"] || f["Queen"] || "").replace(/\s*\(.*\)/, "")].filter(Boolean).join(" · ") || t.numista;
};
