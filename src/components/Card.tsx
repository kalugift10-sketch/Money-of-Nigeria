"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Entry } from "@/lib/data";
import s from "./Card.module.css";

/** Grid card. Cut-out money sits in a fixed box; on hover it turns to show its back. */
export function Card({ e }: { e: Entry }) {
  const { front, back } = e.images;
  const turns = !!front && !!back && e.type !== "story";
  // Phones have no hover: turn over once to show the back when the card comes into view.
  const ref = useRef<HTMLAnchorElement>(null);
  const [peek, setPeek] = useState(false);
  useEffect(() => {
    if (!turns || !window.matchMedia("(hover: none)").matches || !ref.current) return;
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      t1 = setTimeout(() => setPeek(true), 500);
      t2 = setTimeout(() => setPeek(false), 2100);
    }, { threshold: 0.7 });
    io.observe(ref.current);
    return () => { io.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  }, [turns]);
  return (
    <Link ref={ref} href={`/money/${e.slug}`} className={`${s.card} ${peek ? s.peek : ""}`}>
      <div className={s.plate}>
        {front ? (
          <div className={`${s.obj} ${turns ? s.turns : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.face} src={front} alt={e.name} loading="lazy" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {turns && <img className={`${s.face} ${s.backFace}`} src={back} alt="" loading="lazy" />}
          </div>
        ) : (
          <span className={`${s.ph} ${e.status === "Never issued" ? s.word : ""}`} aria-hidden>{e.status === "Never issued" ? "Proposed" : "₦"}</span>
        )}
      </div>
      <h3 className={s.name}>{e.name}</h3>
      <span className={`badge ${e.status === "In circulation" ? "active" : ""}`}>{e.status}</span>
    </Link>
  );
}
