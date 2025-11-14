const ENV_LOCALE = (process.env.NEXT_PUBLIC_LOCALE || "en").toLowerCase();

export type Locale = "en" | "fr";

type CommandCopy = {
  name: string;
  description: string;
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

const COMMAND_TRANSLATIONS: CommandTranslations = {
  en: {
    RPM: {
      name: `Engine RPM`,
      description: `**Engine RPM**  
Measures crankshaft speed in revolutions per minute.

**Why it matters**  
- Monitor idle quality and avoid stalls  
- Choose optimal shift points  
- Protect the engine from premature wear

**Heads-up**  
Very low RPM causes stalls; excessive RPM risks over-revving.`,
    },
    SPEED: {
      name: `Vehicle speed`,
      description: `**Vehicle speed**  
Shows instantaneous road speed in km/h.

**Why it matters**  
- Adapt driving style precisely  
- Stay within legal limits  
- Match torque delivery to road speed

**Heads-up**  
Zero or erratic readings usually indicate a faulty speed sensor.`,
    },
    COOLANT_TEMP: {
      name: `Coolant temperature`,
      description: `**Coolant temperature**  
Reports how hot the engine coolant is (°C).

**Why it matters**  
- Detect overheating above ~100 °C  
- Confirm the thermostat works properly  
- Optimize fuel use and emissions

**Heads-up**  
A coolant temp that never rises means the engine does not warm up correctly.`,
    },
    INTAKE_TEMP: {
      name: `Intake air temperature`,
      description: `**Intake air temperature**  
Indicates the temperature of the air inside the manifold.

**Why it matters**  
- Calculate the air/fuel ratio  
- Adjust ignition timing  
- Maximize combustion efficiency

**Heads-up**  
Dirty or failed sensors skew fuel metering.`,
    },
    INTAKE_PRESSURE: {
      name: `Manifold pressure`,
      description: `**Manifold pressure**  
Measures intake manifold pressure in kPa.

**Why it matters**  
- Evaluate actual engine load  
- Supervise turbo or supercharger output  
- Tune fuel injection

**Heads-up**  
Unusually low pressure often points to a leak or clog.`,
    },
    BAROMETRIC_PRESSURE: {
      name: `Barometric pressure`,
      description: `**Barometric pressure**  
Shows ambient atmospheric pressure in kPa.

**Why it matters**  
- Compensate fueling for altitude and weather  
- Adjust ignition timing for density changes

**Heads-up**  
A faulty sensor drives the mixture excessively rich or lean.`,
    },
    TIMING_ADVANCE: {
      name: `Ignition advance`,
      description: `**Ignition advance**  
Expressed in degrees before top dead center (BTDC).

**Why it matters**  
- Extract maximum power  
- Reduce fuel consumption  
- Prevent knock

**Heads-up**  
Too much advance causes pinging; too little wastes power.`,
    },
    THROTTLE_POS: {
      name: `Throttle position`,
      description: `**Throttle position (TPS)**  
Percentage opening of the throttle plate.

**Why it matters**  
- Command engine load precisely  
- Keep pedal response smooth

**Heads-up**  
A contaminated TPS makes acceleration jerky.`,
    },
    THROTTLE_ACTUATOR: {
      name: `Throttle actuator`,
      description: `**Throttle actuator command**  
Percentage requested by the ECU on the drive-by-wire servo.

**Why it matters**  
- Verify requested vs actual opening  
- Spot a sticking servo motor

**Heads-up**  
A persistent gap greater than ~10 % typically triggers limp mode.`,
    },
    THROTTLE_POS_B: {
      name: `Throttle sensor B`,
      description: `**Throttle sensor B**  
Secondary sensor validating throttle position.

**Why it matters**  
- Provides safety redundancy  
- Detects A/B disagreement

**Heads-up**  
Mismatched readings produce a diagnostic trouble code.`,
    },
    RELATIVE_THROTTLE_POS: {
      name: `Relative throttle`,
      description: `**Relative throttle position**  
Comparison against an internal reference value.

**Why it matters**  
- Reveal calibration drift  
- Detect gradual deposit build-up

**Heads-up**  
Large offsets hurt fuel economy.`,
    },
    ENGINE_LOAD: {
      name: `Engine load`,
      description: `**Engine load**  
Percent of available torque currently used.

**Why it matters**  
- Diagnose heavy towing or steep climbs  
- Spot chronic lugging at low RPM

**Heads-up**  
Abnormal load often stems from intake restrictions or mechanical drag.`,
    },
    ABSOLUTE_LOAD: {
      name: `Absolute load`,
      description: `**Absolute load**  
ECU calculation derived from MAF/MAP and RPM.

**Why it matters**  
- Provides a stable, comparable metric  
- Useful for comparing separate driving sessions

**Heads-up**  
Outliers usually point to faulty sensors.`,
    },
    LONG_FUEL_TRIM_1: {
      name: `Long-term fuel trim (B1)`,
      description: `**Long-term fuel trim (LTFT)**  
Slow correction applied to bank 1 fueling.

**Why it matters**  
- Compensates persistent mixture errors  
- Diagnoses vacuum leaks or clogged injectors

**Heads-up**  
Values beyond ±25 % require deeper inspection.`,
    },
    SHORT_FUEL_TRIM_1: {
      name: `Short-term fuel trim (B1)`,
      description: `**Short-term fuel trim (STFT)**  
Instant reaction to lambda sensor feedback.

**Why it matters**  
- Tracks rapid mixture changes  
- Keeps combustion efficient

**Heads-up**  
Excessive oscillations often mean an aging oxygen sensor.`,
    },
    MAF: {
      name: `Mass air flow`,
      description: `**Mass air flow (MAF)**  
Air mass entering the engine in g/s.

**Why it matters**  
- Sets the injected fuel quantity  
- Optimizes consumption

**Heads-up**  
A dirty MAF causes hesitation and misfires.`,
    },
    EVAPORATIVE_PURGE: {
      name: `EVAP purge`,
      description: `**EVAP purge command**  
Opening percentage of the vapor purge valve.

**Why it matters**  
- Lowers evaporative emissions  
- Keeps the EVAP circuit sealed

**Heads-up**  
A stuck valve typically logs a P044x code.`,
    },
    COMMANDED_EGR: {
      name: `Commanded EGR`,
      description: `**Commanded EGR**  
Requested recirculation rate for exhaust gases.

**Why it matters**  
- Cuts NOₓ emissions  
- Keeps combustion temperatures in check

**Heads-up**  
If the valve cannot follow the command, the MIL lights up.`,
    },
    CATALYST_TEMP_B1S1: {
      name: `Catalyst temp B1S1`,
      description: `**Upstream catalyst temperature**  
Measured in °C before the catalytic converter.

**Why it matters**  
- Check catalyst health  
- Avoid thermal damage

**Heads-up**  
Temperatures above ~900 °C can melt the substrate.`,
    },
    CATALYST_TEMP_B1S2: {
      name: `Catalyst temp B1S2`,
      description: `**Downstream catalyst temperature**  
Measured in °C after the converter.

**Why it matters**  
- Evaluate conversion efficiency  
- Detect a clogged catalyst

**Heads-up**  
A low downstream temperature can indicate an ineffective catalyst.`,
    },
    O2_S1_WR_VOLTAGE: {
      name: `Upstream O₂ voltage`,
      description: `**Upstream wideband O₂ voltage**  
Sensor output in volts.

**Why it matters**  
- Enables precise air/fuel control  
- Monitors sensor responsiveness

**Heads-up**  
Unstable voltage is a common sign of sensor aging.`,
    },
    O2_S1_WR_CURRENT: {
      name: `Upstream O₂ current`,
      description: `**Upstream O₂ pump current**  
Sensor pump/heater current in mA.

**Why it matters**  
- Validates heater operation  
- Indicates sensor reactivity

**Heads-up**  
Out-of-range current usually means an electrical fault.`,
    },
    O2_B1S2: {
      name: `Downstream O₂ voltage`,
      description: `**Downstream O₂ voltage**  
Sensor reading after the catalyst.

**Why it matters**  
- Tracks catalyst efficiency  
- Detects plugged converters

**Heads-up**  
Readings mirroring the upstream sensor reveal a failed catalyst.`,
    },
    ELM_VOLTAGE: {
      name: `Interface voltage`,
      description: `**OBD interface voltage (ELM327)**  
Supply voltage powering the adapter.

**Why it matters**  
- Guarantees reliable OBD communication  
- Checks adapter health

**Heads-up**  
Low voltage will drop the OBD link.`,
    },
    CONTROL_MODULE_VOLTAGE: {
      name: `ECU voltage`,
      description: `**ECU supply voltage**  
Measures the power rail feeding the control unit.

**Why it matters**  
- Prevents random resets  
- Keeps ECU logic stable

**Heads-up**  
Large fluctuations can damage the ECU.`,
    },
    RUN_TIME: {
      name: `Engine run time`,
      description: `**Engine run time**  
Seconds elapsed since the last start.

**Why it matters**  
- Schedule maintenance intervals  
- Confirm warm-up time before heavy load`,
    },
    RUN_TIME_MIL: {
      name: `Run time since MIL`,
      description: `**Run time since MIL on**  
Seconds elapsed since the MIL illuminated.

**Why it matters**  
- Track how long a fault stayed active  
- Gauge its impact on drivability`,
    },
    DISTANCE_W_MIL: {
      name: `Distance with MIL`,
      description: `**Distance since MIL on**  
Kilometers driven since the MIL lit up.

**Why it matters**  
- Measure how far you drove despite a fault  
- Plan repairs accordingly`,
    },
    TIME_SINCE_DTC_CLEARED: {
      name: `Time since DTC clear`,
      description: `**Time since clearing DTCs**  
Seconds elapsed since diagnostic codes were reset.

**Why it matters**  
- Ensure the ECU had time to rerun all monitors`,
    },
    DISTANCE_SINCE_DTC_CLEAR: {
      name: `Distance since DTC clear`,
      description: `**Distance since clearing DTCs**  
Kilometers driven since the codes were cleared.

**Why it matters**  
- Follow how self-diagnostics evolve over longer trips`,
    },
  },
  fr: {
    RPM: {
      name: `Régime moteur`,
      description: `**Régime moteur**  
Mesure le nombre de tours par minute du vilebrequin.

**Pourquoi c’est utile ?**  
- Surveiller le ralenti et éviter le calage  
- Optimiser les passages de vitesse  
- Prévenir l’usure prématurée du moteur

**Attention :**  
Un régime trop bas peut provoquer un calage, un régime trop élevé un sur-régime.`,
    },
    SPEED: {
      name: `Vitesse véhicule`,
      description: `**Vitesse véhicule**  
Affiche la vitesse instantanée en kilomètres par heure.

**Pourquoi c’est utile ?**  
- Ajuster finement la conduite  
- Garantir le respect des limitations  
- Adapter le couple moteur à la vitesse

**Attention :**  
Une valeur nulle ou erratique peut indiquer un capteur de vitesse défaillant.`,
    },
    COOLANT_TEMP: {
      name: `Temp. liquide`,
      description: `**Température du liquide de refroidissement**  
Mesure en °C la chaleur émise par le moteur.

**Pourquoi c’est utile ?**  
- Détecter une surchauffe (au-delà de 100 °C)  
- Vérifier le bon fonctionnement du thermostat  
- Optimiser la consommation et les émissions

**Attention :**  
Une température trop basse signifie un moteur qui ne chauffe pas correctement.`,
    },
    INTAKE_TEMP: {
      name: `Temp. admission`,
      description: `**Température d’admission**  
Indique en °C la chaleur de l’air entrant dans le collecteur.

**Pourquoi c’est utile ?**  
- Calculer le rapport air/carburant  
- Adapter l’avance à l’allumage  
- Optimiser le rendement moteur

**Attention :**  
Un capteur sale ou défectueux fausse le dosage du carburant.`,
    },
    INTAKE_PRESSURE: {
      name: `Pression admission`,
      description: `**Pression d’admission**  
Mesure en kPa la pression de l’air dans le collecteur.

**Pourquoi c’est utile ?**  
- Évaluer la charge réelle du moteur  
- Contrôler les systèmes de suralimentation  
- Adapter l’injection de carburant

**Attention :**  
Une pression anormalement basse signale une fuite ou un colmatage.`,
    },
    BAROMETRIC_PRESSURE: {
      name: `Pression barométrique`,
      description: `**Pression barométrique**  
Indique en kPa la pression atmosphérique ambiante.

**Pourquoi c’est utile ?**  
- Corriger le mélange air/carburant selon l’altitude  
- Ajuster l’avance à l’allumage en fonction du climat

**Attention :**  
Un capteur défectueux entraîne un mélange trop riche ou trop pauvre.`,
    },
    TIMING_ADVANCE: {
      name: `Avance allumage`,
      description: `**Avance à l’allumage**  
Exprimée en degrés avant le point mort haut (BTDC).

**Pourquoi c’est utile ?**  
- Maximiser la puissance  
- Réduire la consommation  
- Éviter les cliquetis

**Attention :**  
Une avance excessive provoque des cognements, une avance insuffisante une perte de puissance.`,
    },
    THROTTLE_POS: {
      name: `Ouverture papillon`,
      description: `**Position du papillon (TPS)**  
Pourcentage d’ouverture de la valve d’admission.

**Pourquoi c’est utile ?**  
- Piloter précisément la charge moteur  
- Assurer une réponse fluide à l’accélérateur

**Attention :**  
Un capteur encrassé rend la réponse moteur saccadée.`,
    },
    THROTTLE_ACTUATOR: {
      name: `Actionneur papillon`,
      description: `**Consigne actionneur papillon**  
Pourcentage de commande envoyé par l’ECU au servomoteur.

**Pourquoi c’est utile ?**  
- Vérifier la correspondance consigne/position réelle  
- Détecter un servomoteur bloqué

**Attention :**  
Une divergence persistante ≥ 10 % déclenche un mode dégradé.`,
    },
    THROTTLE_POS_B: {
      name: `Papillon (capteur B)`,
      description: `**Capteur B du papillon**  
Signal secondaire validant la position du papillon.

**Pourquoi c’est utile ?**  
- Créer une redondance de sécurité  
- Détecter toute incohérence A/B

**Attention :**  
Un désaccord entre A et B génère un code d’erreur.`,
    },
    RELATIVE_THROTTLE_POS: {
      name: `Papillon (relatif)`,
      description: `**Position relative du papillon**  
Comparaison à une valeur de référence interne.

**Pourquoi c’est utile ?**  
- Identifier les dérives de calibration  
- Détecter l’encrassement progressif

**Attention :**  
Des écarts importants altèrent la consommation.`,
    },
    ENGINE_LOAD: {
      name: `Charge moteur`,
      description: `**Charge moteur**  
Pourcentage de sollicitation par rapport à la charge max.

**Pourquoi c’est utile ?**  
- Diagnostiquer une sursollicitation (remorquage, montée)  
- Identifier un sous-régime chronique

**Attention :**  
Une charge anormale signale un filtre à air sale ou un problème mécanique.`,
    },
    ABSOLUTE_LOAD: {
      name: `Charge absolue`,
      description: `**Charge absolue**  
Calcul ECU basé sur MAF/MAP et régime moteur.

**Pourquoi c’est utile ?**  
- Obtenir une mesure stable et reproductible  
- Comparer plusieurs sessions de conduite

**Attention :**  
Des valeurs aberrantes révèlent souvent un capteur défaillant.`,
    },
    LONG_FUEL_TRIM_1: {
      name: `LTFT Banc 1`,
      description: `**Long Term Fuel Trim (LTFT)**  
Correction carburant à long terme sur le banc 1.

**Pourquoi c’est utile ?**  
- Compense les écarts persistants du mélange  
- Diagnostiquer fuites ou injecteurs encrassés

**Attention :**  
Des valeurs > ±25 % nécessitent une inspection approfondie.`,
    },
    SHORT_FUEL_TRIM_1: {
      name: `STFT Banc 1`,
      description: `**Short Term Fuel Trim (STFT)**  
Ajustement instantané du mélange air/carburant.

**Pourquoi c’est utile ?**  
- Réagir aux variations rapides du capteur lambda  
- Maintenir l’efficacité de la combustion

**Attention :**  
Des oscillations trop importantes indiquent souvent une sonde lambda vieillissante.`,
    },
    MAF: {
      name: `Débit massique air`,
      description: `**Débit massique d’air (MAF)**  
Mesure du flux d’air entrant en g/s.

**Pourquoi c’est utile ?**  
- Dosage précis de l’injection  
- Optimisation de la consommation

**Attention :**  
Un capteur MAF sale provoque des ratés d’allumage.`,
    },
    EVAPORATIVE_PURGE: {
      name: `Purge EVAP`,
      description: `**Purge EVAP**  
Ouverture de la vanne de purge des vapeurs carburant.

**Pourquoi c’est utile ?**  
- Réduire les émissions polluantes  
- Maintenir l’étanchéité du circuit

**Attention :**  
Une vanne bloquée déclenche un code P044x.`,
    },
    COMMANDED_EGR: {
      name: `EGR commandée`,
      description: `**Commande EGR**  
Pourcentage d’ouverture demandé pour la recirculation des gaz.

**Pourquoi c’est utile ?**  
- Réduction des NOₓ  
- Abaissement de la température de combustion

**Attention :**  
Une EGR qui ne suit pas la consigne engendre un voyant moteur.`,
    },
    CATALYST_TEMP_B1S1: {
      name: `T° catalyseur B1S1`,
      description: `**Température catalyseur amont**  
Mesure en °C avant le pot catalytique.

**Pourquoi c’est utile ?**  
- Vérifier l’état du catalyseur  
- Prévenir la surchauffe

**Attention :**  
Des températures > 900 °C risquent d’endommager le catalyseur.`,
    },
    CATALYST_TEMP_B1S2: {
      name: `T° catalyseur B1S2`,
      description: `**Température catalyseur aval**  
Mesure en °C après le pot catalytique.

**Pourquoi c’est utile ?**  
- Contrôler l’efficacité de la conversion  
- Détecter un catalyseur encrassé

**Attention :**  
Une température basse peut indiquer un catalyseur inefficace.`,
    },
    O2_S1_WR_VOLTAGE: {
      name: `Lambda amont (V)`,
      description: `**Tension sonde lambda amont**  
Mesure en volts d’une sonde large bande.

**Pourquoi c’est utile ?**  
- Dosage précis du mélange air/carburant  
- Suivi de la performance de la sonde

**Attention :**  
Une tension instable signale souvent un vieillissement de la sonde.`,
    },
    O2_S1_WR_CURRENT: {
      name: `Lambda amont (mA)`,
      description: `**Courant sonde lambda amont**  
Mesure en mA liée au chauffage interne de la sonde.

**Pourquoi c’est utile ?**  
- Vérifier le circuit de chauffage  
- Évaluer la réactivité de la sonde

**Attention :**  
Un courant hors plage indique un problème électrique.`,
    },
    O2_B1S2: {
      name: `Lambda aval (V)`,
      description: `**Tension sonde lambda aval**  
Mesure en volts après le catalyseur.

**Pourquoi c’est utile ?**  
- Suivre l’efficacité du pot catalytique  
- Détecter un catalyseur bouché

**Attention :**  
Des tensions identiques à l’amont révèlent un catalyseur inefficace.`,
    },
    ELM_VOLTAGE: {
      name: `Tension interface`,
      description: `**Tension module OBD (ELM327)**  
Mesure en volts de l’alimentation du dongle.

**Pourquoi c’est utile ?**  
- Assurer la communication OBD  
- Vérifier l’état du module

**Attention :**  
Une tension trop basse coupe la liaison OBD.`,
    },
    CONTROL_MODULE_VOLTAGE: {
      name: `Tension calculateur`,
      description: `**Tension ECU**  
Mesure en volts de l’alimentation du calculateur.

**Pourquoi c’est utile ?**  
- Prévenir les redémarrages aléatoires  
- Garantir la stabilité de l’ECU

**Attention :**  
Des fluctuations importantes peuvent endommager l’ECU.`,
    },
    RUN_TIME: {
      name: `Temps moteur allumé`,
      description: `**Temps moteur allumé**  
Durée en secondes depuis le dernier démarrage.

**Pourquoi c’est utile ?**  
- Planifier les intervalles de maintenance  
- Vérifier le temps de chauffe avant montée en régime`,
    },
    RUN_TIME_MIL: {
      name: `Run-time depuis MIL`,
      description: `**Durée depuis témoin défaut**  
Temps en secondes écoulé depuis l’allumage du MIL.

**Pourquoi c’est utile ?**  
- Suivre la durée d’un défaut actif  
- Évaluer l’impact sur la conduite`,
    },
    DISTANCE_W_MIL: {
      name: `Distance avec MIL`,
      description: `**Distance depuis témoin défaut**  
Kilomètres parcourus depuis que le MIL s’est allumé.

**Pourquoi c’est utile ?**  
- Mesurer le trajet effectué malgré un défaut  
- Anticiper une réparation`,
    },
    TIME_SINCE_DTC_CLEARED: {
      name: `Temps depuis RAZ DTC`,
      description: `**Temps depuis effacement DTC**  
Durée en secondes depuis la remise à zéro des codes défaut.

**Pourquoi c’est utile ?**  
- Vérifier que le système a eu le temps de tester tous les capteurs`,
    },
    DISTANCE_SINCE_DTC_CLEAR: {
      name: `Distance depuis RAZ DTC`,
      description: `**Distance depuis effacement DTC**  
Kilomètres parcourus depuis la réinitialisation des codes défaut.

**Pourquoi c’est utile ?**  
- Suivre l’évolution de l’auto-diagnostic sur la longue distance`,
    },
  },
};

const UI_TRANSLATIONS: UiTranslationTable = {
  en: {
    "chart.tooltip.time": "Time",
    "commands.livePids.heading": "Live Vehicle PIDs",
    "commands.correlations.heading": "Correlations",
    "commands.correlations.pending": "Pending data",
    "commands.chart.empty": "Select a PID or correlation to display the chart.",
    "commands.modal.noDescription": "No description provided for this PID yet.",
    "commands.modal.close": "Close description",
    "commands.status.error": "failed to load",
    "commands.status.loading": "loading...",
    "commands.card.rpm_speed.title": "RPM vs Speed",
    "commands.card.rpm_speed.description": "Visualize how engine revolutions relate to vehicle speed over the last minute.",
    "commands.card.rpm_speed.primary": "Engine RPM",
    "commands.card.rpm_speed.secondary": "Vehicle Speed",
    "commands.card.throttle_load.title": "Throttle vs Engine Load",
    "commands.card.throttle_load.description": "Compare driver throttle input with the engine load reported by the ECU.",
    "commands.card.throttle_load.primary": "Throttle Position",
    "commands.card.throttle_load.secondary": "Engine Load",
    "commands.chart.infoButton": "Show description",
    "core.heading": "Core telemetry",
    "core.caption": "Showing curated emulator signals. Start the server with --emulator-all-pids to inspect every PID.",
    "core.missing": "No data yet",
    "settings.tab.general": "General",
    "settings.tab.vehicle": "Vehicle",
    "settings.tab.obd": "OBD",
    "settings.tab.about": "About",
    "settings.language.label": "Language",
    "settings.language.fr": "French",
    "settings.language.en": "English",
    "settings.theme.label": "Theme",
    "settings.theme.placeholder": "Select theme",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.vehicle.model": "Model",
    "settings.vehicle.color": "Color",
    "settings.vehicle.brand.nissan": "Nissan",
    "settings.vehicle.brand.toyota": "Toyota",
    "settings.vehicle.model.nissan_r34": "Nissan Skyline R34 GT-R",
    "settings.vehicle.model.nissan_200sx": "Nissan 200SX",
    "settings.vehicle.model.toyota_supra": "Toyota Supra MK4",
    "settings.vehicle.model.toyota_ae86": "Toyota AE86",
    "settings.vehicle.color.red": "Red",
    "settings.vehicle.color.green": "Green",
    "settings.vehicle.color.blue": "Blue",
    "settings.obd.restart.label": "Restart server",
    "settings.obd.restart.button": "Restart",
    "settings.about.version": "App version",
    "settings.about.check": "Check for updates",
    "settings.about.check.button": "Check",
    "diagnostics.specs.heading": "Vehicle Specs",
    "diagnostics.specs.subheading": "Renault Clio II Phase 2 1.4L 16V Extreme",
    "diagnostics.specs.overview.title": "Overview",
    "diagnostics.specs.overview.model.label": "Model",
    "diagnostics.specs.overview.model.value": "Renault Clio II Phase 2 Extreme",
    "diagnostics.specs.overview.body.label": "Body",
    "diagnostics.specs.overview.body.value": "Hatchback · 3 doors",
    "diagnostics.specs.overview.seats.label": "Seats",
    "diagnostics.specs.overview.seats.value": "5 (2+3 layout)",
    "diagnostics.specs.overview.production.label": "Production",
    "diagnostics.specs.overview.production.value": "2001 – 2003",
    "diagnostics.specs.powertrain.title": "Powertrain",
    "diagnostics.specs.powertrain.engine.label": "Engine",
    "diagnostics.specs.powertrain.engine.value": "1.4L inline-4 DOHC 16V (K4J)",
    "diagnostics.specs.powertrain.displacement.label": "Displacement",
    "diagnostics.specs.powertrain.displacement.value": "1390 cm³",
    "diagnostics.specs.powertrain.aspiration.label": "Aspiration",
    "diagnostics.specs.powertrain.aspiration.value": "Naturally aspirated",
    "diagnostics.specs.powertrain.compression.label": "Compression",
    "diagnostics.specs.powertrain.compression.value": "10:1",
    "diagnostics.specs.powertrain.fuelSystem.label": "Fuel system",
    "diagnostics.specs.powertrain.fuelSystem.value": "Multi-port indirect injection",
    "diagnostics.specs.powertrain.layout.label": "Layout",
    "diagnostics.specs.powertrain.layout.value": "Front transverse · FWD",
    "diagnostics.specs.powertrain.transmission.label": "Transmission",
    "diagnostics.specs.powertrain.transmission.value": "5-speed manual",
    "diagnostics.specs.performance.title": "Performance",
    "diagnostics.specs.performance.power.label": "Power",
    "diagnostics.specs.performance.power.value": "98 hp @ 6000 rpm",
    "diagnostics.specs.performance.torque.label": "Torque",
    "diagnostics.specs.performance.torque.value": "127 Nm @ 3750 rpm",
    "diagnostics.specs.performance.acceleration.label": "0-100 km/h",
    "diagnostics.specs.performance.acceleration.value": "10.5 s",
    "diagnostics.specs.performance.topSpeed.label": "Top speed",
    "diagnostics.specs.performance.topSpeed.value": "185 km/h",
    "diagnostics.specs.performance.weightToPower.label": "Weight-to-power",
    "diagnostics.specs.performance.weightToPower.value": "10 kg/hp",
    "diagnostics.specs.fuel.title": "Fuel & Emissions",
    "diagnostics.specs.fuel.type.label": "Fuel type",
    "diagnostics.specs.fuel.type.value": "Petrol (Euro 3)",
    "diagnostics.specs.fuel.city.label": "City consumption",
    "diagnostics.specs.fuel.city.value": "9.2 L/100 km",
    "diagnostics.specs.fuel.highway.label": "Highway consumption",
    "diagnostics.specs.fuel.highway.value": "5.3 L/100 km",
    "diagnostics.specs.fuel.combined.label": "Combined consumption",
    "diagnostics.specs.fuel.combined.value": "6.7 L/100 km",
    "diagnostics.specs.fuel.co2.label": "CO₂ emissions",
    "diagnostics.specs.fuel.co2.value": "160 g/km",
    "diagnostics.specs.fuel.tank.label": "Fuel tank",
    "diagnostics.specs.fuel.tank.value": "50 L",
    "diagnostics.specs.fuel.range.label": "Typical range",
    "diagnostics.specs.fuel.range.value": "≈746 km",
    "diagnostics.specs.dimensions.title": "Dimensions & Weight",
    "diagnostics.specs.dimensions.wheelbase.label": "Wheelbase",
    "diagnostics.specs.dimensions.wheelbase.value": "247.2 cm",
    "diagnostics.specs.dimensions.length.label": "Length",
    "diagnostics.specs.dimensions.length.value": "381.2 cm",
    "diagnostics.specs.dimensions.width.label": "Width",
    "diagnostics.specs.dimensions.width.value": "163.9 cm",
    "diagnostics.specs.dimensions.height.label": "Height",
    "diagnostics.specs.dimensions.height.value": "141.7 cm",
    "diagnostics.specs.dimensions.frontTrack.label": "Front track",
    "diagnostics.specs.dimensions.frontTrack.value": "139.2 cm",
    "diagnostics.specs.dimensions.rearTrack.label": "Rear track",
    "diagnostics.specs.dimensions.rearTrack.value": "137.2 cm",
    "diagnostics.specs.dimensions.curbWeight.label": "Curb weight",
    "diagnostics.specs.dimensions.curbWeight.value": "980 kg",
    "diagnostics.specs.dimensions.grossWeight.label": "Gross weight",
    "diagnostics.specs.dimensions.grossWeight.value": "1525 kg",
    "diagnostics.specs.cabin.title": "Cabin & Storage",
    "diagnostics.specs.cabin.seatDistribution.label": "Seat distribution",
    "diagnostics.specs.cabin.seatDistribution.value": "2 front · 3 rear",
    "diagnostics.specs.cabin.boot.label": "Boot capacity",
    "diagnostics.specs.cabin.boot.value": "255 L · 1037 L seats folded",
    "diagnostics.specs.chassis.title": "Chassis & Steering",
    "diagnostics.specs.chassis.frontBrakes.label": "Front brakes",
    "diagnostics.specs.chassis.frontBrakes.value": "Vented discs",
    "diagnostics.specs.chassis.rearBrakes.label": "Rear brakes",
    "diagnostics.specs.chassis.rearBrakes.value": "Solid discs",
    "diagnostics.specs.chassis.frontTyres.label": "Front tyres",
    "diagnostics.specs.chassis.frontTyres.value": "185/55 R15",
    "diagnostics.specs.chassis.rearTyres.label": "Rear tyres",
    "diagnostics.specs.chassis.rearTyres.value": "185/55 R15",
    "diagnostics.specs.chassis.steering.label": "Steering",
    "diagnostics.specs.chassis.steering.value": "Rack and pinion",
    "diagnostics.specs.chassis.frontSuspension.label": "Front suspension",
    "diagnostics.specs.chassis.frontSuspension.value": "MacPherson struts with coil springs",
    "diagnostics.specs.chassis.rearSuspension.label": "Rear suspension",
    "diagnostics.specs.chassis.rearSuspension.value": "Torsion beam with coil springs",
  },
  fr: {
    "chart.tooltip.time": "Temps",
    "commands.livePids.heading": "PIDs véhicule en direct",
    "commands.correlations.heading": "Corrélations",
    "commands.correlations.pending": "En attente de données",
    "commands.chart.empty": "Sélectionnez un PID ou une corrélation pour afficher le graphique.",
    "commands.modal.noDescription": "Aucune description n'est disponible pour ce PID pour le moment.",
    "commands.modal.close": "Fermer la description",
    "commands.status.error": "Échec du chargement",
    "commands.status.loading": "Chargement...",
    "commands.card.rpm_speed.title": "Régime vs vitesse",
    "commands.card.rpm_speed.description": "Visualisez comment le régime moteur se rapporte à la vitesse du véhicule sur la dernière minute.",
    "commands.card.rpm_speed.primary": "Régime moteur",
    "commands.card.rpm_speed.secondary": "Vitesse du véhicule",
    "commands.card.throttle_load.title": "Accélérateur vs charge moteur",
    "commands.card.throttle_load.description": "Comparez la sollicitation de l'accélérateur avec la charge moteur rapportée par l'ECU.",
    "commands.card.throttle_load.primary": "Position de l'accélérateur",
    "commands.card.throttle_load.secondary": "Charge moteur",
    "commands.chart.infoButton": "Afficher la description",
    "core.heading": "Télémetrie essentielle",
    "core.caption": "Affichage des signaux essentiels de l'émulateur. Lancez le serveur avec --emulator-all-pids pour voir tous les PIDs.",
    "core.missing": "Pas encore de données",
    "settings.tab.general": "Général",
    "settings.tab.vehicle": "Véhicule",
    "settings.tab.obd": "OBD",
    "settings.tab.about": "À propos",
    "settings.language.label": "Langue",
    "settings.language.fr": "Français",
    "settings.language.en": "Anglais",
    "settings.theme.label": "Thème",
    "settings.theme.placeholder": "Choisir un thème",
    "settings.theme.light": "Clair",
    "settings.theme.dark": "Sombre",
    "settings.vehicle.model": "Modèle",
    "settings.vehicle.color": "Couleur",
    "settings.vehicle.brand.nissan": "Nissan",
    "settings.vehicle.brand.toyota": "Toyota",
    "settings.vehicle.model.nissan_r34": "Nissan Skyline R34 GT-R",
    "settings.vehicle.model.nissan_200sx": "Nissan 200SX",
    "settings.vehicle.model.toyota_supra": "Toyota Supra MK4",
    "settings.vehicle.model.toyota_ae86": "Toyota AE86",
    "settings.vehicle.color.red": "Rouge",
    "settings.vehicle.color.green": "Vert",
    "settings.vehicle.color.blue": "Bleu",
    "settings.obd.restart.label": "Redémarrer le serveur",
    "settings.obd.restart.button": "Redémarrer",
    "settings.about.version": "Version de l'application",
    "settings.about.check": "Vérifier les mises à jour",
    "settings.about.check.button": "Vérifier",
    "diagnostics.specs.heading": "Spécifications du véhicule",
    "diagnostics.specs.subheading": "Renault Clio II Phase 2 1.4L 16V Extreme",
    "diagnostics.specs.overview.title": "Vue d'ensemble",
    "diagnostics.specs.overview.model.label": "Modèle",
    "diagnostics.specs.overview.model.value": "Renault Clio II Phase 2 Extreme",
    "diagnostics.specs.overview.body.label": "Carrosserie",
    "diagnostics.specs.overview.body.value": "Hayon · 3 portes",
    "diagnostics.specs.overview.seats.label": "Places",
    "diagnostics.specs.overview.seats.value": "5 (configuration 2+3)",
    "diagnostics.specs.overview.production.label": "Production",
    "diagnostics.specs.overview.production.value": "2001 – 2003",
    "diagnostics.specs.powertrain.title": "Groupe motopropulseur",
    "diagnostics.specs.powertrain.engine.label": "Moteur",
    "diagnostics.specs.powertrain.engine.value": "1,4 L 4 cylindres en ligne DOHC 16 soupapes (K4J)",
    "diagnostics.specs.powertrain.displacement.label": "Cylindrée",
    "diagnostics.specs.powertrain.displacement.value": "1390 cm³",
    "diagnostics.specs.powertrain.aspiration.label": "Aspiration",
    "diagnostics.specs.powertrain.aspiration.value": "Atmosphérique",
    "diagnostics.specs.powertrain.compression.label": "Compression",
    "diagnostics.specs.powertrain.compression.value": "10:1",
    "diagnostics.specs.powertrain.fuelSystem.label": "Alimentation",
    "diagnostics.specs.powertrain.fuelSystem.value": "Injection multipoint indirecte",
    "diagnostics.specs.powertrain.layout.label": "Architecture",
    "diagnostics.specs.powertrain.layout.value": "Avant transversal · Traction",
    "diagnostics.specs.powertrain.transmission.label": "Transmission",
    "diagnostics.specs.powertrain.transmission.value": "Manuelle 5 rapports",
    "diagnostics.specs.performance.title": "Performances",
    "diagnostics.specs.performance.power.label": "Puissance",
    "diagnostics.specs.performance.power.value": "98 ch à 6000 tr/min",
    "diagnostics.specs.performance.torque.label": "Couple",
    "diagnostics.specs.performance.torque.value": "127 Nm à 3750 tr/min",
    "diagnostics.specs.performance.acceleration.label": "0-100 km/h",
    "diagnostics.specs.performance.acceleration.value": "10,5 s",
    "diagnostics.specs.performance.topSpeed.label": "Vitesse max",
    "diagnostics.specs.performance.topSpeed.value": "185 km/h",
    "diagnostics.specs.performance.weightToPower.label": "Rapport poids/puissance",
    "diagnostics.specs.performance.weightToPower.value": "10 kg/ch",
    "diagnostics.specs.fuel.title": "Carburant et émissions",
    "diagnostics.specs.fuel.type.label": "Carburant",
    "diagnostics.specs.fuel.type.value": "Essence (Euro 3)",
    "diagnostics.specs.fuel.city.label": "Conso urbaine",
    "diagnostics.specs.fuel.city.value": "9,2 L/100 km",
    "diagnostics.specs.fuel.highway.label": "Conso route",
    "diagnostics.specs.fuel.highway.value": "5,3 L/100 km",
    "diagnostics.specs.fuel.combined.label": "Conso mixte",
    "diagnostics.specs.fuel.combined.value": "6,7 L/100 km",
    "diagnostics.specs.fuel.co2.label": "Émissions CO₂",
    "diagnostics.specs.fuel.co2.value": "160 g/km",
    "diagnostics.specs.fuel.tank.label": "Réservoir",
    "diagnostics.specs.fuel.tank.value": "50 L",
    "diagnostics.specs.fuel.range.label": "Autonomie typique",
    "diagnostics.specs.fuel.range.value": "≈746 km",
    "diagnostics.specs.dimensions.title": "Dimensions et poids",
    "diagnostics.specs.dimensions.wheelbase.label": "Empattement",
    "diagnostics.specs.dimensions.wheelbase.value": "247,2 cm",
    "diagnostics.specs.dimensions.length.label": "Longueur",
    "diagnostics.specs.dimensions.length.value": "381,2 cm",
    "diagnostics.specs.dimensions.width.label": "Largeur",
    "diagnostics.specs.dimensions.width.value": "163,9 cm",
    "diagnostics.specs.dimensions.height.label": "Hauteur",
    "diagnostics.specs.dimensions.height.value": "141,7 cm",
    "diagnostics.specs.dimensions.frontTrack.label": "Voie avant",
    "diagnostics.specs.dimensions.frontTrack.value": "139,2 cm",
    "diagnostics.specs.dimensions.rearTrack.label": "Voie arrière",
    "diagnostics.specs.dimensions.rearTrack.value": "137,2 cm",
    "diagnostics.specs.dimensions.curbWeight.label": "Poids à vide",
    "diagnostics.specs.dimensions.curbWeight.value": "980 kg",
    "diagnostics.specs.dimensions.grossWeight.label": "Poids max",
    "diagnostics.specs.dimensions.grossWeight.value": "1525 kg",
    "diagnostics.specs.cabin.title": "Habitacle et coffre",
    "diagnostics.specs.cabin.seatDistribution.label": "Répartition des sièges",
    "diagnostics.specs.cabin.seatDistribution.value": "2 à l'avant · 3 à l'arrière",
    "diagnostics.specs.cabin.boot.label": "Volume de coffre",
    "diagnostics.specs.cabin.boot.value": "255 L · 1037 L sièges rabattus",
    "diagnostics.specs.chassis.title": "Châssis et direction",
    "diagnostics.specs.chassis.frontBrakes.label": "Freins avant",
    "diagnostics.specs.chassis.frontBrakes.value": "Disques ventilés",
    "diagnostics.specs.chassis.rearBrakes.label": "Freins arrière",
    "diagnostics.specs.chassis.rearBrakes.value": "Disques pleins",
    "diagnostics.specs.chassis.frontTyres.label": "Pneus avant",
    "diagnostics.specs.chassis.frontTyres.value": "185/55 R15",
    "diagnostics.specs.chassis.rearTyres.label": "Pneus arrière",
    "diagnostics.specs.chassis.rearTyres.value": "185/55 R15",
    "diagnostics.specs.chassis.steering.label": "Direction",
    "diagnostics.specs.chassis.steering.value": "Crémaillère",
    "diagnostics.specs.chassis.frontSuspension.label": "Suspension avant",
    "diagnostics.specs.chassis.frontSuspension.value": "Jambes MacPherson avec ressorts hélicoïdaux",
    "diagnostics.specs.chassis.rearSuspension.label": "Suspension arrière",
    "diagnostics.specs.chassis.rearSuspension.value": "Essieu à barre de torsion avec ressorts hélicoïdaux",
  },
};

const getCommandCopy = (
  pid: string,
  locale: Locale,
  fallback: Partial<CommandCopy> = {}
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
  fallback?: Partial<CommandCopy>
): CommandCopy => getCommandCopy(pid, normalizeLocale(locale), fallback);

export const translatePidName = (
  pid: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback: string = pid
): string => getCommandCopy(pid, normalizeLocale(locale), { name: fallback }).name;

export const translatePidDescription = (
  pid: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback = ""
): string =>
  getCommandCopy(pid, normalizeLocale(locale), { description: fallback })
    .description;

export const translateUi = (
  key: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback = key
): string => getTranslation(UI_TRANSLATIONS, key, fallback, locale);

const getTranslation = (
  table: UiTranslationTable,
  key: string,
  fallback: string,
  locale: Locale = DEFAULT_LOCALE
): string => table[locale]?.[key] ?? table.en[key] ?? fallback;

export type { CommandCopy };
