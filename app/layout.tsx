import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";

const minecraftFont = localFont({
  src: "../fonts/Minecraft-Regular.otf",
  variable: "--font-minecraft",
});

export const metadata: Metadata = {
  title: "Minecraft Material List",
  description: "Generate a list of materials for your Minecraft builds",
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
