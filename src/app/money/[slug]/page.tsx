import type React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contextOf, entries, getEntry, neighbours, type Entry } from "@/lib/data";
import { Versions } from "@/components/Versions";
import { Stage } from "@/components/Stage";
import { Statement } from "@/components/Statement";
import { Route } from "@/components/Route";
import { Goods } from "@/components/Goods";
import s from "./detail.module.css";

export function generateStaticParams() {
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEntry(slug);
  return { title: e ? `${e.name} · The Money Of Nigeria` : "The Money Of Nigeria" };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEntry(slug);
  if (!e) notFound();
  const { prev, next } = neighbours(e.slug);
  const isStory = e.type === "story";

  return (
    <article className={`wrap ${s.page}`}>
      <nav className={s.crumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">{e.name}</span></nav>

      {/* Same opening for items and stories */}
      <div className={s.product}>
        <Stage e={e} />
        <div className={s.info}>
          <p className="label">{e.eraLine.split(" · ")[0]}{e.eraLine.includes(" · ") && <> · <span style={{ textTransform: "none" }}>{e.eraLine.split(" · ").slice(1).join(" · ")}</span></>}</p>
          <h1 className={s.title}>{e.name}</h1>
          <span className={`badge ${e.status === "Active" ? "active" : ""}`}>{e.status}</span>
          {e.details.length > 0 && (
            <dl className={s.details}>
              {e.details.map(([k, v]) => (
                <div key={k} className={s.row}><dt className="label muted">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          )}
          <div className={s.about}>
            <p className="label">About</p>
            <p>{linkify(e)}</p>
            {e.links.some((l) => getEntry(l.slug)) && (
              <p className={s.related}>See also: {e.links.filter((l) => getEntry(l.slug)).map((l, i) => <span key={l.slug}>{i > 0 && ", "}<Link href={`/money/${l.slug}`}>{getEntry(l.slug)?.name ?? l.text}</Link></span>)}</p>
            )}
            {e.sources.length > 0 && <p className={s.related}><Link href={`/sources#${e.slug}`}>Sources for this page →</Link></p>}
          </div>
        </div>
      </div>

      <Versions versions={e.versions} named={e.slug === "biafran-pound" || e.slug === "emergency-notes-1918"} active={/circulation|legal tender/i.test(e.status)} />


      {/* Story ending */}
      {isStory && e.goods && <Goods goods={e.goods} tint={e.tintColors[0]} />}
      {e.statement && <Statement {...e.statement} />}
      {(isStory || e.changes.length > 1) && e.changes.length > 0 && <Route changes={e.changes} />}


      <nav className={s.nav} aria-label="Previous and next">
        {prev ? (
          <Link href={`/money/${prev.slug}`} className={s.side}><span className="label muted">← Previous</span><strong>{prev.name}</strong><span>{contextOf(prev)}</span></Link>
        ) : <span />}
        {next && (
          <Link href={`/money/${next.slug}`} className={`${s.side} ${s.right}`}><span className="label muted">Next →</span><strong>{next.name}</strong><span>{contextOf(next)}</span></Link>
        )}
      </nav>
    </article>
  );
}

/** Turns mentions of other items in the About text into links. */
function linkify(e: Entry) {
  let parts: (string | React.ReactElement)[] = [e.about];
  for (const l of e.links) {
    if (!getEntry(l.slug)) continue;
    parts = parts.flatMap((p) => {
      if (typeof p !== "string") return [p];
      const i = p.toLowerCase().indexOf(l.text.toLowerCase());
      if (i < 0) return [p];
      return [p.slice(0, i), <Link key={l.slug} href={`/money/${l.slug}`}>{p.slice(i, i + l.text.length)}</Link>, p.slice(i + l.text.length)];
    });
  }
  return parts;
}
