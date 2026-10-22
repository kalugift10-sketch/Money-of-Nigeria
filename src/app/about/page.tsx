import Link from "next/link";
import { Note } from "./Note";
import s from "./about.module.css";

export const metadata = { title: "About · The Money Of Nigeria" };

// Gift's own words. Do not rewrite.
const PARAS: { t: string; big?: boolean }[] = [
  { t: "I’m guessing you’re expecting to read something profound here about how I wanted to learn about the history of Nigerian money, couldn’t find everything I needed in one place, and decided to do something about it." },
  { t: "Well, wrong.", big: true },
  { t: "I just really like money.", big: true },
  { t: "I used to be a coin collector, and over time, that interest grew into a genuine fascination with Nigerian currency. The coins, the notes, the people on them, the symbols, the little details you probably never notice until you start looking closely." },
  { t: "So I decided to put them all together." },
  { t: "Of course, having everything in one place is useful too. Maybe you’re researching a particular note, trying to identify an old coin, curious about what Nigerian money looked like years ago, or just as interested in it as I am." },
  { t: "Whatever brought you here, I hope this helps." },
  { t: "I’m Gift Kalu, a product designer with 2+ years of experience designing digital products and solving user problems. I made The Money of Nigeria because sometimes the best projects are the ones you build simply because you care about the subject." },
  { t: "And in this case, I really, really like money.", big: true },
];

const PORTFOLIO = "#"; // TODO: add portfolio link when it is live
// TODO: add Instagram and X (Twitter) links
const SOCIALS: [string, string][] = [
  ["Instagram", "https://www.instagram.com/battleaxefj"],
  ["X (Twitter)", "https://x.com/giftuxui"],
  ["LinkedIn", "https://ng.linkedin.com/in/gift-kalu-3969a3238"],
];

export default function About() {
  return (
    <div className={`wrap ${s.page}`}>
      <nav className={s.crumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">About</span></nav>
      <h1 className="sr-only">About</h1>
      <div className={s.text}>
        {PARAS.map((p, i) => <p key={i} className={p.big ? s.big : s.para}>{p.t}</p>)}
        <a href={PORTFOLIO} className={s.link}>View my portfolio →</a>
        <div className={s.connect}>
          <p className="label">Let’s connect</p>
          <ul>{SOCIALS.map(([n, u]) => <li key={n}><a href={u} target="_blank" rel="noopener">{n} ↗︎</a></li>)}</ul>
        </div>
      </div>
      <div className={s.visual}><Note /></div>
    </div>
  );
}
