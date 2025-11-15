/**
 * @file Smoke tests validating that the Settings page renders its tabs and
 * primary controls when wrapped with the necessary providers.
 */
import { render, screen } from "@testing-library/react";

import { DevtoolsPreferencesProvider } from "@/app/DevtoolsPreferencesContext";
import { LanguageProvider } from "@/app/LanguageContext";
import { PowerModeProvider } from "@/app/PowerModeContext";
import Settings from "@/app/settings/page";
import { ThemeProvider } from "@/app/ThemeContext";

/**
 * Mounts the Settings page with all of its required context providers.
 *
 * @returns The testing-library render result.
 */
const renderWithProviders = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <PowerModeProvider>
          <DevtoolsPreferencesProvider>
            <Settings />
          </DevtoolsPreferencesProvider>
        </PowerModeProvider>
      </ThemeProvider>
    </LanguageProvider>,
  );

describe("Settings", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the settings tabs and controls", () => {
    renderWithProviders();

    expect(screen.getByRole("tab", { name: /General/i })).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
  });
});
