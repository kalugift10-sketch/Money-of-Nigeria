import s from "./Coin.module.css";

/** Logo A: green coin, cream ₦, dotted rim. */
export function CoinFace() {
  return (
    <svg viewBox="0 0 100 100" className={s.face} aria-hidden>
      <circle cx="50" cy="50" r="50" fill="#1A6514" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#F3FDF2" strokeOpacity=".85" strokeWidth="2" strokeDasharray="0.1 5.2" strokeLinecap="round" />
      <g fill="#F3FDF2">
        <path d="M35 74V26h7l17 26V26h6v48h-7L41 48v26z" />
        <rect x="27" y="42" width="46" height="4.5" />
        <rect x="27" y="53" width="46" height="4.5" />
      </g>
    </svg>
  );
}

/** A thick 3D coin. `spin` = always turning (loader); otherwise turns when its parent is hovered (logo). */
export function Coin3D({ size = 40, spin = false }: { size?: number; spin?: boolean }) {
  const layers = [-3, -2, -1, 0, 1, 2, 3];
  return (
    <span className={s.scene} style={{ width: size, height: size }}>
      <span className={`${s.coin} ${spin ? s.spin : s.hover}`} style={{ ["--t" as string]: `${Math.max(2, size / 18)}px` }}>
        {layers.map((z) => <span key={z} className={s.edge} style={{ transform: `translateZ(calc(var(--t) * ${z / 3}))` }} />)}
        <span className={`${s.side} ${s.front}`}><CoinFace /></span>
        <span className={`${s.side} ${s.back}`}><CoinFace /></span>
      </span>
    </span>
  );
}
