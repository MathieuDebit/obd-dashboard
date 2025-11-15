import type { Metadata } from "next";

import "@/ui/css/globals.css";

import { DevtoolsPreferencesProvider } from "@/app/DevtoolsPreferencesContext";
import AppShell from "@/app/html";
import { LanguageProvider } from "@/app/LanguageContext";
import { PowerModeProvider } from "@/app/PowerModeContext";
import { RefreshRateProvider } from "@/app/RefreshRateContext";
import { ThemeProvider, THEME_STORAGE_KEY } from "@/app/ThemeContext";
import { geistMono, geistSans } from "@/ui/fonts";

export const metadata: Metadata = {
  title: "OBD Dashboard Web",
  description: "Web dashboard for OBD data",
};

const themeInitScript = `(()=>{try{var stored=localStorage.getItem('${THEME_STORAGE_KEY}');if(!stored)return;var theme=stored==='dark'?'dark':'light';var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(theme);}catch(_){}})();`;

const ThemeInitScript = () => (
  <script
    dangerouslySetInnerHTML={{ __html: themeInitScript }}
    suppressHydrationWarning
  />
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-muted antialiased`}
      >
        <ThemeInitScript />
        <ThemeProvider>
          <PowerModeProvider>
            <RefreshRateProvider>
              <LanguageProvider>
                <DevtoolsPreferencesProvider>
                  <AppShell>{children}</AppShell>
                </DevtoolsPreferencesProvider>
              </LanguageProvider>
            </RefreshRateProvider>
          </PowerModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
