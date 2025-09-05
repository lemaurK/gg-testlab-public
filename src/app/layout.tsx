import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThrustBench - Sensor Data Analytics",
  description: "Upload your propulsion sensor data. Get intelligent analytics and simple visualizations. No ML experience needed.",
  keywords: ["propulsion", "sensor data", "analytics", "rocket testing", "thrust analysis", "ThrustBench"],
  authors: [{ name: "LeMaur Kydd" }],
  openGraph: {
    title: "ThrustBench - Sensor Data Analytics",
    description: "Sensor Data. Smarter Insights. Professional propulsion test data analysis.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Analytics />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
