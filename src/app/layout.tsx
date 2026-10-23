import type { Metadata } from "next";
import "@fontsource-variable/stack-sans-headline";
import "./globals.css";
import { PlayerProvider } from "@/components/Player";
import { Footer, Header, MiniPlayer } from "@/components/Chrome";
import { Loading } from "@/components/Loading";

export const metadata: Metadata = {
  title: "The Money Of Nigeria",
  description: "Every medium of exchange spent in Nigeria, from pre-colonial trade to the eNaira.",
  metadataBase: new URL("https://moneyofnigeria.vercel.app"),
  openGraph: { title: "The Money Of Nigeria", description: "Every medium of exchange spent in Nigeria, from pre-colonial trade to the eNaira.", images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Money Of Nigeria: a brass manilla on a banknote-pattern background" }], type: "website" },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem("mon-loaded")==="1")document.documentElement.classList.add("mon-seen")}catch(e){}` }} /></head>
      <body suppressHydrationWarning>
        <PlayerProvider>
          <a href="#main" className="skip">Skip to content</a>
          <Loading />
          <Header />
          <main id="main" tabIndex={-1}>{children}</main>
          <Footer />
          <MiniPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
