import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import agents from "../data/agents.json";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import AIBrain from "../components/AIBrain";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Universe — Discover the Best AI Tools",
  description: `The living brain of the AI ecosystem. Discover, compare, and choose from ${agents.length}+ AI tools across chatbots, coding, image, video, audio, and more.`,
  keywords: [
    "AI tools",
    "AI directory",
    "best AI agents",
    "AI comparison",
    "free AI tools",
    "ChatGPT alternatives",
  ],
  openGraph: {
    title: "AI Universe — Discover the Best AI Tools",
    description: `The living brain of the AI ecosystem. Discover, compare, and choose from ${agents.length}+ AI tools.`,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Theme appearance="dark" accentColor="gray" radius="medium">
          {children}
          <AIBrain />
        </Theme>
      </body>
    </html>
  );
}