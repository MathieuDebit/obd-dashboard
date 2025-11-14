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

export const getPidCopy = (
  pid: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback?: Partial<CommandCopy>,
): CommandCopy => getCommandCopy(pid, normalizeLocale(locale), fallback);

export const translatePidName = (
  pid: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback: string = pid,
): string =>
  getCommandCopy(pid, normalizeLocale(locale), { name: fallback }).name;

export const translatePidDescription = (
  pid: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback = "",
): string =>
  getCommandCopy(pid, normalizeLocale(locale), { description: fallback })
    .description;

const getTranslation = (
  table: UiTranslationTable,
  key: string,
  fallback: string,
  locale: Locale = DEFAULT_LOCALE,
): string => table[locale]?.[key] ?? table.en[key] ?? fallback;

export const translateUi = (
  key: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback = key,
): string => getTranslation(UI_TRANSLATIONS, key, fallback, locale);

export type { CommandCopy };
