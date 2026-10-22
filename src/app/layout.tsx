import type { Metadata } from "next";
import "@fontsource-variable/stack-sans-headline";
import "./globals.css";
import { PlayerProvider } from "@/components/Player";
import { Footer, Header, MiniPlayer } from "@/components/Chrome";
import { Loading } from "@/components/Loading";

export const metadata: Metadata = {
  title: "The Money Of Nigeria",
  description: "Every medium of exchange spent in Nigeria, from pre-colonial trade to the eNaira.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <PlayerProvider>
          <Loading />
          <Header />
          <main>{children}</main>
          <Footer />
          <MiniPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
