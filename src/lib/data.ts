import raw from "@/data/items.json";

export type Images = { front?: string; back?: string };
export type Version = { key: string; year: string; label: string; note?: string; images: Images };
export type Change = { date: string; title: string; what: string; why: string };
export type Statement = { lead: string; number: string; tail: string };

export type Side = { description: string; script?: string; lettering: string; translation?: string; engraver?: string };
export type RecordType = {
  title: string; numista: string; url: string; features: [string, string][]; series?: string; commemorative?: string;
  obverse: Side; reverse: Side; watermark?: string; edge?: string; signatures: [string, string][]; mints: [string, string][];
  mintage: { columns: string[]; rows: string[][] }; comments?: string; sets?: string[];
};
export type Entry = {
  slug: string;
  type: "item" | "story";
  kind?: "coin" | "note" | null;
  name: string;
  system?: string;
  era: string;
  eraLine: string;
  sortYear: number;
  yearLabel: string;
  status: string;
  about: string;
  changes: Change[];
  details: [string, string][];
  images: Images;
  versions: Version[];
  links: { text: string; slug: string }[];
  goods?: { name: string; note: string; image?: string }[];
  statement?: Statement;
  turn?: boolean;
  tintColors: [string, string];
  sources: [string, string][];
  record?: { types: RecordType[]; extra: [string, string, string][] };
};

export type Meta = { sources: [string, string][]; description: string };

const data = raw as unknown as { meta: Meta; items: Entry[] };

export const meta = data.meta;
export const entries: Entry[] = [...data.items].sort((a, b) => a.sortYear - b.sortYear);

export const ERAS: Record<string, string> = {
  "pre-colonial": "Pre-colonial",
  colonial: "Colonial",
  "pound-era": "The Pound Era",
  biafra: "Biafra",
  "naira-era": "The Naira Era",
  digital: "Digital",
};

export const TYPES: Record<string, string> = {
  note: "Notes",
  coin: "Coins",
  other: "Other",
};

export function typeOf(e: Entry): "note" | "coin" | "other" {
  return e.kind === "note" || e.kind === "coin" ? e.kind : "other";
}

export function getEntry(slug: string) {
  return entries.find((e) => e.slug === slug);
}

export function neighbours(slug: string) {
  const i = entries.findIndex((e) => e.slug === slug);
  return { prev: i > 0 ? entries[i - 1] : null, next: i < entries.length - 1 ? entries[i + 1] : null };
}

/** Short context line shown under a neighbour's name. */
export function contextOf(e: Entry) {
  return e.system ? `${e.system}` : ERAS[e.era] ?? "";
}

/** Facts for the loading screen, drawn from the data. */
export const facts: { text: string; source: string }[] = [
  { text: "In Lagos in 1865, one bag of 20,000 cowrie shells was worth one to two English pounds.", source: "Cowrie Shells · 1865" },
  { text: "In 1948 the British recalled manillas. People handed in 32.5 million Okpoho, and every one was melted down.", source: "Manillas · 1948" },
  { text: "After manillas stopped being legal tender, people could keep up to 200 for marriages and burials.", source: "Manillas · 1949" },
  { text: "Nigeria was the last country to abandon the pound, shilling and pence system, in 1973.", source: "Nigerian Pound · 1973" },
  { text: "The ₦20 note was the first polymer banknote in Nigeria.", source: "₦20 Note · 2007" },
];

const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
/** "1949-04-01" -> "1 Apr 1949", "1984-04" -> "Apr 1984"; other strings unchanged. */
export function formatDate(d: string) {
  const m = d.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return d;
  const mon = MON[parseInt(m[2], 10) - 1];
  return m[3] ? `${parseInt(m[3], 10)} ${mon} ${m[1]}` : `${mon} ${m[1]}`;
}
