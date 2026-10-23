"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { playlist, type Song } from "@/data/playlist";

type YTPlayer = {
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (s: number, allow: boolean) => void;
};

type PlayerState = {
  songs: Song[];
  index: number;
  playing: boolean;
  started: boolean;
  progress: number; // 0..1
  current: Song;
  play: (i?: number) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (fraction: number) => void;
};

const Ctx = createContext<PlayerState | null>(null);

export function usePlayer() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer must be inside PlayerProvider");
  return c;
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer; PlayerState: { ENDED: number; PLAYING: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const yt = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const indexRef = useRef(0);
  const wantPlay = useRef(false); // what the visitor asked for
  const userChose = useRef(false); // true once the visitor has pressed play or pause themselves
  const loaded = useRef<string | null>(null); // video currently loaded
  const cancelAuto = useRef<() => void>(() => {});
  indexRef.current = index;

  // Load the YouTube API once.
  useEffect(() => {
    const make = () => {
      if (!host.current || !window.YT) return;
      yt.current = new window.YT.Player(host.current, {
        height: "1",
        width: "1",
        playerVars: { playsinline: 1 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e: { data: number }) => {
            // Keep the buttons in step with what YouTube is really doing.
            // Only mirror what YouTube is really doing; never restart it behind the visitor's back.
            // If the visitor pressed pause while the song was still loading, YouTube starts it anyway
            // once it has loaded. Hold the visitor's choice instead of playing by itself.
            if (e.data === 1 && userChose.current && !wantPlay.current) { yt.current?.pauseVideo(); return; }
            if (e.data === 1) { setPlaying(true); wantPlay.current = true; }
            if (e.data === 2) { setPlaying(false); wantPlay.current = false; }
            if (window.YT && e.data === window.YT.PlayerState.ENDED) {
              const n = (indexRef.current + 1) % playlist.length;
              setIndex(n);
              if (playlist[n].youtubeId) yt.current?.loadVideoById(playlist[n].youtubeId);
            }
          },
        },
      });
    };
    if (window.YT) make();
    else {
      window.onYouTubeIframeAPIReady = make;
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(s);
    }
  }, []);

  // Track progress for the rings and bars.
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const p = yt.current;
      if (!p) return;
      const d = p.getDuration?.() || 0;
      setProgress(d ? p.getCurrentTime() / d : 0);
    }, 500);
    return () => clearInterval(t);
  }, [playing]);

  const play = useCallback(
    (i?: number) => {
      const target = i ?? index;
      const song = playlist[target];
      cancelAuto.current();
      userChose.current = true;
      wantPlay.current = true;
      setStarted(true);
      if (target !== index) { setIndex(target); setProgress(0); }
      if (ready && song.youtubeId) {
        if (loaded.current !== song.youtubeId) { yt.current?.loadVideoById(song.youtubeId); loaded.current = song.youtubeId; }
        else yt.current?.playVideo();
      }
      setPlaying(true);
    },
    [index, ready]
  );

  // Music starts on landing. Browsers block sound until the visitor interacts,
  // so if autoplay is refused it starts on their first click, tap, key or scroll.
  // It then keeps playing until they pause it.
  const autoTried = useRef(false);
  useEffect(() => {
    if (!ready || autoTried.current) return;
    autoTried.current = true;
    const p = yt.current;
    const first = playlist[0];
    if (!p || !first?.youtubeId) return;
    p.loadVideoById(first.youtubeId);
    loaded.current = first.youtubeId;
    wantPlay.current = true;
    setStarted(true);
    // The button only says "playing" once YouTube confirms it (state 1), never on hope.
    const check = setTimeout(() => {
      if (userChose.current) return; // the visitor already pressed play or pause: their choice wins
      const st = (p as unknown as { getPlayerState?: () => number }).getPlayerState?.();
      if (st === 1) return; // autoplay worked
      wantPlay.current = false;
      p.pauseVideo(); // stop a half-loaded song from starting later on its own
      setPlaying(false);
      // If the browser blocks sound on arrival, the music waits for the play button.
      // It is never started by a click or tap somewhere else on the page.
    }, 2500);
    return () => clearTimeout(check);
  }, [ready]);

  const pause = useCallback(() => {
    cancelAuto.current();
    userChose.current = true;
    wantPlay.current = false;
    yt.current?.pauseVideo();
    setPlaying(false);
  }, []);

  const value: PlayerState = {
    songs: playlist,
    index,
    playing,
    started,
    progress,
    current: playlist[index],
    play,
    pause,
    toggle: () => (playing ? pause() : play()),
    next: () => play((index + 1) % playlist.length),
    prev: () => play((index - 1 + playlist.length) % playlist.length),
    seek: (f) => {
      const d = yt.current?.getDuration?.() || 0;
      if (d) yt.current?.seekTo(d * f, true);
      setProgress(f);
    },
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-hidden style={{ position: "fixed", width: 1, height: 1, left: -9999, top: 0, opacity: 0 }}>
        <div ref={host} />
      </div>
    </Ctx.Provider>
  );
}
