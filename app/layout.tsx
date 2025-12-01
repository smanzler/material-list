import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";

const minecraftFont = localFont({
  src: "../fonts/Minecraft-Regular.otf",
  variable: "--font-minecraft",
});

export const metadata: Metadata = {
  title: {
    default: "Minecraft Material List Generator",
    template: "%s | Minecraft Material List",
  },
  description:
    "Create and visualize your Minecraft material lists with images. Track quantities, view stacks, and export your build materials. Perfect for planning large Minecraft projects.",
  keywords: [
    "minecraft",
    "material list",
    "minecraft builder",
    "build planner",
    "minecraft materials",
    "block counter",
    "minecraft inventory",
    "build calculator",
  ],
  authors: [{ name: "Minecraft Material List" }],
  creator: "Minecraft Material List",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://mclist.simonmanzler.com",
    title: "Minecraft Material List Generator",
    description:
      "Create and visualize your Minecraft material lists with images. Track quantities, view stacks, and export your build materials.",
    siteName: "Minecraft Material List",
  },
  twitter: {
    card: "summary_large_image",
    title: "Minecraft Material List Generator",
    description:
      "Create and visualize your Minecraft material lists with images. Track quantities, view stacks, and export your build materials.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mclist.simonmanzler.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${minecraftFont.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="font-minecraft min-h-dvh">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
