import Link from "next/link";
import { entries } from "@/lib/data";
import s from "./sources.module.css";
import { Rail } from "./Rail";

export const metadata = { title: "Sources · The Money Of Nigeria" };

/** Every source used on the site, grouped by the page it supports. */
export default function Sources() {
  const withSources = entries.filter((e) => e.sources.length > 0);
  return (
    <div className={`wrap ${s.page}`}>
      <nav className={s.crumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">Sources</span></nav>
      <h1>Sources</h1>
      <Rail items={withSources.map((e) => ({ slug: e.slug, name: e.name, era: e.era }))} />
      {withSources.map((e) => (
        <section key={e.slug} id={e.slug} className={s.group}>
          <h2><Link href={`/money/${e.slug}`}>{e.name}</Link></h2>
          <ol>{e.sources.map(([n, u]) => <li key={u}><a href={u} target="_blank" rel="noopener">{n || u}</a></li>)}</ol>
        </section>
      ))}
    </div>
  );
}
