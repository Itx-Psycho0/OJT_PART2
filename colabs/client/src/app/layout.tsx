import type { Metadata } from "next";
import {Inter} from "next/font/google"
import "./globals.css";
import {NuqsAdapter} from "nuqs/adapters/next/app"; 

const inter = Inter({
  subsets:["latin"],
})

export const metadata: Metadata = {
  title: "CoLabs",
  description: "Real-time collaborative editor",
  icons:{icon:"/logo.svg"}
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className}
      >
        <NuqsAdapter>
        {children}
        </NuqsAdapter>
      </body>
    </html>
  );
}
