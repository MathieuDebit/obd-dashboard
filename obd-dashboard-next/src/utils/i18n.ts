/**
 * @file Lightweight i18n helpers that translate PID metadata and UI strings.
 */
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

const ENV_LOCALE = (process.env.NEXT_PUBLIC_LOCALE || "en").toLowerCase();

export type Locale = "en" | "fr";

type CommandCopy = {
  name: string;
  description: string;
};

type LocaleData = {
  pids: Record<string, CommandCopy>;
  ui: Record<string, string>;
};

type CommandTranslations = Record<Locale, Record<string, CommandCopy>>;
type UiTranslationTable = Record<Locale, Record<string, string>>;

/**
 * Normalizes locale strings into the supported union.
 *
 * @param locale - Arbitrary locale string.
 * @returns "en" or "fr" depending on input.
 */
const normalizeLocale = (locale?: string | Locale): Locale => {
  if (!locale) return "en";
  const normalized = locale.toString().toLowerCase();
  if (normalized.startsWith("fr")) return "fr";
  return "en";
};

export const DEFAULT_LOCALE: Locale = normalizeLocale(ENV_LOCALE);

const localeData: Record<Locale, LocaleData> = {
  en: en as LocaleData,
  fr: fr as LocaleData,
};

const COMMAND_TRANSLATIONS: CommandTranslations = {
  en: localeData.en.pids,
  fr: localeData.fr.pids,
};

const UI_TRANSLATIONS: UiTranslationTable = {
  en: localeData.en.ui,
  fr: localeData.fr.ui,
};

/**
 * Resolves translated PID name/description with optional fallbacks.
 *
 * @param pid - PID identifier.
 * @param locale - Target locale code.
 * @param fallback - Optional fallback copy when translation missing.
 * @returns Command copy struct.
 */
const getCommandCopy = (
  pid: string,
  locale: Locale,
  fallback: Partial<CommandCopy> = {},
): CommandCopy => {
  const key = pid.toUpperCase();
  const translation =
    COMMAND_TRANSLATIONS[locale]?.[key] ??
    COMMAND_TRANSLATIONS.en[key];

  return {
    name: translation?.name ?? fallback.name ?? key,
    description: translation?.description ?? fallback.description ?? "",
  };
};

/**
 * Public helper returning localized PID metadata.
 *
 * @param pid - PID identifier.
 * @param locale - Desired locale, defaults to configured locale.
 * @param fallback - Optional fallback copy.
 * @returns Command copy struct used in UI.
 */
export const getPidCopy = (
  pid: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback?: Partial<CommandCopy>,
): CommandCopy => getCommandCopy(pid, normalizeLocale(locale), fallback);

/**
 * Translates just the PID name, defaulting to fallback when missing.
 */
export const translatePidName = (
  pid: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback: string = pid,
): string =>
  getCommandCopy(pid, normalizeLocale(locale), { name: fallback }).name;

/**
 * Translates the PID description, falling back to provided text.
 */
export const translatePidDescription = (
  pid: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback = "",
): string =>
  getCommandCopy(pid, normalizeLocale(locale), { description: fallback })
    .description;

/**
 * Generic helper that pulls translations from a table and falls back to English.
 */
const getTranslation = (
  table: UiTranslationTable,
  key: string,
  fallback: string,
  locale: Locale = DEFAULT_LOCALE,
): string => table[locale]?.[key] ?? table.en[key] ?? fallback;

/**
 * Translates arbitrary UI keys from locale JSON files.
 */
export const translateUi = (
  key: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback = key,
): string => getTranslation(UI_TRANSLATIONS, key, fallback, locale);

export type { CommandCopy };
