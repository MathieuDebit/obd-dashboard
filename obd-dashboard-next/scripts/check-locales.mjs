import fs from "fs";
import path from "path";

const LOCALE_CODES = ["en", "fr"];
const REQUIRED_PID_FIELDS = ["name", "description"];
const localesDir = path.resolve(process.cwd(), "src/locales");

const loadLocale = (code) => {
  const filePath = path.join(localesDir, `${code}.json`);
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
};

const locales = LOCALE_CODES.map((code) => ({
  code,
  data: loadLocale(code),
}));

const reference = locales.find((locale) => locale.code === "en") ?? locales[0];
const errors = [];

const compareKeySets = (section, extractor) => {
  const referenceKeys = extractor(reference.data);
  locales.forEach(({ code, data }) => {
    const localeKeys = extractor(data);
    const missing = referenceKeys.filter((key) => !localeKeys.includes(key));
    const extra = localeKeys.filter((key) => !referenceKeys.includes(key));

    missing.forEach((key) => {
      errors.push(`[${code}] Missing ${section} key "${key}"`);
    });
    extra.forEach((key) => {
      errors.push(`[${code}] Extra ${section} key "${key}"`);
    });
  });

  return referenceKeys;
};

const referencePidKeys = compareKeySets("pid", (locale) =>
  Object.keys(locale.pids ?? {}),
);

locales.forEach(({ code, data }) => {
  referencePidKeys.forEach((pid) => {
    const entry = data.pids?.[pid];
    REQUIRED_PID_FIELDS.forEach((field) => {
      if (!entry || typeof entry[field] !== "string" || entry[field].trim() === "") {
        errors.push(`[${code}] PID "${pid}" is missing field "${field}"`);
      }
    });
  });
});

compareKeySets("ui", (locale) => Object.keys(locale.ui ?? {}));

if (errors.length > 0) {
  console.error("❌ Locale verification failed:");
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
} else {
  console.log("✅ All locale files are in sync.");
}
