'use client';

import { createContext, PropsWithChildren, useState } from "react";

export type Theme = "light" | "dark";
type ThemeContext = { theme: Theme; changeTheme: (theme: Theme) => void };

export const ThemeContext = createContext<ThemeContext>(
  {} as ThemeContext
);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>("light");
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};