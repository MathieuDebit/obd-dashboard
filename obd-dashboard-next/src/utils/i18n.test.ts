/**
 * @file Tests covering locale normalization and translation fallbacks.
 */
import {
  DEFAULT_LOCALE,
  getPidCopy,
  translatePidDescription,
  translatePidName,
  translateUi,
} from "./i18n";

describe("i18n helpers", () => {
  it("normalizes locales and falls back to English for missing copies", () => {
    const copy = getPidCopy("RPM", "fr");
    expect(copy.name).toBeTruthy();
    expect(copy.description).toBeTruthy();

    const fallbackName = translatePidName("UNKNOWN_PID", "fr", "???");
    expect(fallbackName).toBe("???");

    const fallbackDescription = translatePidDescription(
      "UNKNOWN_PID",
      "en",
      "n/a",
    );
    expect(fallbackDescription).toBe("n/a");
  });

  it("translates UI keys while respecting fallbacks", () => {
    const defaultLocaleKey = translateUi("settings.theme.label", DEFAULT_LOCALE);
    expect(defaultLocaleKey).toBeTruthy();

    const missingKey = translateUi("does.not.exist", "fr", "fallback");
    expect(missingKey).toBe("fallback");
  });
});
