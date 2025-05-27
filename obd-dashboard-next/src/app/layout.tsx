import type { Metadata } from "next";
import HTML from "@/app/html";
import '@/ui/css/globals.css';
import { ThemeProvider } from "@/app/ThemeContext";


export const metadata: Metadata = {
  title: "OBD Dashboard Web",
  description: "Web dashboard for OBD data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <HTML>
        {children}
      </HTML>
    </ThemeProvider>
  );
}
