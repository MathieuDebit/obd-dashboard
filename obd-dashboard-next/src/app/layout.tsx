/**
 * @file Defines the root layout for the Next.js application including the theme
 * initialization script and nested context providers that power the dashboard UI.
 */
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

/**
 * ThemeInitScript injects an inline script that syncs the CSS class on the html
 * element with the locally stored theme before hydration to avoid flashes.
 *
 * @returns The script tag responsible for initializing the persisted theme.
 */
const ThemeInitScript = () => (
  <script
    dangerouslySetInnerHTML={{ __html: themeInitScript }}
    suppressHydrationWarning
  />
);

/**
 * RootLayout composes the shared HTML scaffold and wraps page content with
 * global providers so the entire app can access theme, language, power, refresh
 * rate, and devtools settings.
 *
 * @param props.children - The page content that should be rendered inside the
 * provider stack.
 * @returns The application's root HTML/Body structure.
 */
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
