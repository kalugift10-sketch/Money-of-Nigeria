"use client";

import Link from "next/link";
import { Disc } from "@/components/Chrome";
import { usePlayer } from "@/components/Player";
import s from "./playlist.module.css";

export default function Playlist() {
  const p = usePlayer();
  const C = 4 * 62;
  return (
    <>
    <div className="wrap"><nav className={s.crumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">Money Playlist</span></nav></div>
    <div className={`wrap ${s.page}`}>
      <section className={s.now}>
        <Disc size="min(480px, 100%)" cover={p.current.cover} spinning={p.playing} />
        <div className={s.meta}>
          <h1>{p.current.title}</h1>
          <p>{p.current.artist}</p>
        </div>
        <input
          className={s.seek}
          type="range" min={0} max={1000} value={Math.round(p.progress * 1000)}
          onChange={(e) => p.seek(Number(e.target.value) / 1000)}
          aria-label="Seek"
          style={{ ["--p" as string]: `${p.progress * 100}%` }}
        />
        <div className={s.controls}>
          <button onClick={p.prev} aria-label="Previous" className={s.side}>
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 2h2v12H3zM14 2v12L6 8z" /></svg>
          </button>
          <button data-player onClick={p.toggle} aria-label={p.playing ? "Pause" : "Play"} className={s.main}>
            {p.playing ? <svg width="18" height="18" viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" /><rect x="9.5" y="2" width="3.5" height="12" /></svg>
              : <svg width="18" height="18" viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z" /></svg>}
          </button>
          <button onClick={p.next} aria-label="Next" className={s.side}>
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M11 2h2v12h-2zM2 2v12l8-6z" /></svg>
          </button>
        </div>
      </section>

      <section className={s.songs}>
        <div className={s.head}><h2>Songs</h2><span className="label muted">{p.songs.length} songs</span></div>
        <ol>
          {p.songs.map((song, i) => {
            const on = i === p.index && p.started;
            return (
              <li key={i}>
                <button data-player className={`${s.row} ${on ? s.on : ""}`} onClick={() => (on ? p.toggle() : p.play(i))}>
                  <span className={s.cover}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {song.cover ? <img src={song.cover} alt="" /> : null}
                    {on && (
                      <svg className={s.trace} viewBox="0 0 64 64" aria-hidden>
                        <rect x="1" y="1" width="62" height="62" rx="9" className={s.traceBg} />
                        <rect x="1" y="1" width="62" height="62" rx="9" className={s.traceFg} style={{ strokeDasharray: C, strokeDashoffset: C * (1 - p.progress) }} />
                      </svg>
                    )}
                  </span>
                  <span className={s.hoverIcon} aria-hidden>
                    {on && p.playing ? <svg width="14" height="14" viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" /><rect x="9.5" y="2" width="3.5" height="12" /></svg>
                      : <svg width="14" height="14" viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z" /></svg>}
                  </span>
                  <span className={s.text}><strong>{song.title}</strong><span>{song.artist}</span></span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
    </>
  );
}
