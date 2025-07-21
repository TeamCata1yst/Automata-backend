import Footer from "@/components/Footer";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Background from "@/components/Background";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Automata",
  description:
    "Project and human resource management system designed to work at a multiorganisational level. Developed by Naman Chandok and Aaditya Kansal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="manifest" href="/manifest.json" />
      <body
        className={
          inter.className +
          " bg-black scrollbar-thin scrollbar-track-black scrollbar-thumb-white/20"
        }
      >
        <Background />
        <div className="bg-[#0a0a0a] p-8 md:p-16 m-8 mt-24 md:mt-32 md:mb-16 md:mx-16 rounded-3xl relative h-max">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
