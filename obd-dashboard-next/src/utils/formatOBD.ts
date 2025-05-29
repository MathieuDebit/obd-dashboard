type FormatValue = (v: string) => string;

type FormatCommandsValue = Record<string, FormatValue>;

type ObdCommands = {
    [key: string]: {
        name: string;
        formatValue: FormatValue;
        description: string;
    }
};

const formatCommandsValue: FormatCommandsValue = {
    pct   : v => `${Number(v).toFixed(1)} %`,
    rpm   : v => `${Number(v).toFixed(0)} tr/min`,
    kmh   : v => `${Number(v).toFixed(0)} km/h`,
    tempC : v => `${Number(v).toFixed(0)} °C`,
    g_s   : v => `${Number(v).toFixed(2)} g/s`,
    volt  : v => `${Number(v).toFixed(2)} V`,
    sec   : v => `${Number(v).toFixed(0)} s`,
    dist  : v => `${Number(v).toFixed(0)} km`,
    kPa   : v => `${Number(v).toFixed(2)} kPa`,
    BTDC  : v => `${Number(v).toFixed(1)} ° BTDC`,
    mA    : v => `${Number(v).toFixed(2)} mA`,

    raw   : v => v,
    str   : v => `${v}`,
    byteA : v => v,
};

export const OBD_COMMANDS: ObdCommands = {
    RPM: {
    name: 'Régime moteur',
    formatValue: formatCommandsValue.rpm,
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
    name: 'Vitesse véhicule',
    formatValue: formatCommandsValue.kmh,
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
    name: 'Temp. liquide',
    formatValue: formatCommandsValue.tempC,
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
    name: 'Temp. admission',
    formatValue: formatCommandsValue.tempC,
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
    name: 'Pression admission',
    formatValue: formatCommandsValue.kPa,
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
    name: 'Pression barométrique',
    formatValue: formatCommandsValue.kPa,
    description: `**Pression barométrique**  
Indique en kPa la pression atmosphérique ambiante.

**Pourquoi c’est utile ?**  
- Corriger le mélange air/carburant selon l’altitude  
- Ajuster l’avance à l’allumage en fonction du climat

**Attention :**  
Un capteur défectueux entraîne un mélange trop riche ou trop pauvre.`,
  },

  TIMING_ADVANCE: {
    name: 'Avance allumage',
    formatValue: formatCommandsValue.BTDC,
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
    name: 'Ouverture papillon',
    formatValue: formatCommandsValue.pct,
    description: `**Position du papillon (TPS)**  
Pourcentage d’ouverture de la valve d’admission.

**Pourquoi c’est utile ?**  
- Piloter précisément la charge moteur  
- Assurer une réponse fluide à l’accélérateur

**Attention :**  
Un capteur encrassé rend la réponse moteur saccadée.`,
  },

  THROTTLE_ACTUATOR: {
    name: 'Actionneur papillon',
    formatValue: formatCommandsValue.pct,
    description: `**Consigne actionneur papillon**  
Pourcentage de commande envoyé par l’ECU au servomoteur.

**Pourquoi c’est utile ?**  
- Vérifier la correspondance consigne/position réelle  
- Détecter un servomoteur bloqué

**Attention :**  
Une divergence persistante ≥ 10 % déclenche un mode dégradé.`,
  },

  THROTTLE_POS_B: {
    name: 'Papillon (capteur B)',
    formatValue: formatCommandsValue.pct,
    description: `**Capteur B du papillon**  
Signal secondaire validant la position du papillon.

**Pourquoi c’est utile ?**  
- Créer une redondance de sécurité  
- Détecter toute incohérence A/B

**Attention :**  
Un désaccord entre A et B génère un code d’erreur.`,
  },

  RELATIVE_THROTTLE_POS: {
    name: 'Papillon (relatif)',
    formatValue: formatCommandsValue.pct,
    description: `**Position relative du papillon**  
Comparaison à une valeur de référence interne.

**Pourquoi c’est utile ?**  
- Identifier les dérives de calibration  
- Détecter l’encrassement progressif

**Attention :**  
Des écarts importants altèrent la consommation.`,
  },

  ENGINE_LOAD: {
    name: 'Charge moteur',
    formatValue: formatCommandsValue.pct,
    description: `**Charge moteur**  
Pourcentage de sollicitation par rapport à la charge max.

**Pourquoi c’est utile ?**  
- Diagnostiquer une sursollicitation (remorquage, montée)  
- Identifier un sous-régime chronique

**Attention :**  
Une charge anormale signale un filtre à air sale ou un problème mécanique.`,
  },

  ABSOLUTE_LOAD: {
    name: 'Charge absolue',
    formatValue: formatCommandsValue.pct,
    description: `**Charge absolue**  
Calcul ECU basé sur MAF/MAP et régime moteur.

**Pourquoi c’est utile ?**  
- Obtenir une mesure stable et reproductible  
- Comparer plusieurs sessions de conduite

**Attention :**  
Des valeurs aberrantes révèlent souvent un capteur défaillant.`,
  },

  LONG_FUEL_TRIM_1: {
    name: 'LTFT Banc 1',
    formatValue: formatCommandsValue.pct,
    description: `**Long Term Fuel Trim (LTFT)**  
Correction carburant à long terme sur le banc 1.

**Pourquoi c’est utile ?**  
- Compense les écarts persistants du mélange  
- Diagnostiquer fuites ou injecteurs encrassés

**Attention :**  
Des valeurs > ±25 % nécessitent une inspection approfondie.`,
  },

  SHORT_FUEL_TRIM_1: {
    name: 'STFT Banc 1',
    formatValue: formatCommandsValue.pct,
    description: `**Short Term Fuel Trim (STFT)**  
Ajustement instantané du mélange air/carburant.

**Pourquoi c’est utile ?**  
- Réagir aux variations rapides du capteur lambda  
- Maintenir l’efficacité de la combustion

**Attention :**  
Des oscillations trop importantes indiquent souvent une sonde lambda vieillissante.`,
  },

  MAF: {
    name: 'Débit massique air',
    formatValue: formatCommandsValue.g_s,
    description: `**Débit massique d’air (MAF)**  
Mesure du flux d’air entrant en g/s.

**Pourquoi c’est utile ?**  
- Dosage précis de l’injection  
- Optimisation de la consommation

**Attention :**  
Un capteur MAF sale provoque des ratés d’allumage.`,
  },

  EVAPORATIVE_PURGE: {
    name: 'Purge EVAP',
    formatValue: formatCommandsValue.pct,
    description: `**Purge EVAP**  
Ouverture de la vanne de purge des vapeurs carburant.

**Pourquoi c’est utile ?**  
- Réduire les émissions polluantes  
- Maintenir l’étanchéité du circuit

**Attention :**  
Une vanne bloquée déclenche un code P044x.`,
  },

  COMMANDED_EGR: {
    name: 'EGR commandée',
    formatValue: formatCommandsValue.pct,
    description: `**Commande EGR**  
Pourcentage d’ouverture demandé pour la recirculation des gaz.

**Pourquoi c’est utile ?**  
- Réduction des NOₓ  
- Abaissement de la température de combustion

**Attention :**  
Une EGR qui ne suit pas la consigne engendre un voyant moteur.`,
  },

  CATALYST_TEMP_B1S1: {
    name: 'T° catalyseur B1S1',
    formatValue: formatCommandsValue.tempC,
    description: `**Température catalyseur amont**  
Mesure en °C avant le pot catalytique.

**Pourquoi c’est utile ?**  
- Vérifier l’état du catalyseur  
- Prévenir la surchauffe

**Attention :**  
Des températures > 900 °C risquent d’endommager le catalyseur.`,
  },

  CATALYST_TEMP_B1S2: {
    name: 'T° catalyseur B1S2',
    formatValue: formatCommandsValue.tempC,
    description: `**Température catalyseur aval**  
Mesure en °C après le pot catalytique.

**Pourquoi c’est utile ?**  
- Contrôler l’efficacité de la conversion  
- Détecter un catalyseur encrassé

**Attention :**  
Une température basse peut indiquer un catalyseur inefficace.`,
  },

  O2_S1_WR_VOLTAGE: {
    name: 'Lambda amont (V)',
    formatValue: formatCommandsValue.volt,
    description: `**Tension sonde lambda amont**  
Mesure en volts d’une sonde large bande.

**Pourquoi c’est utile ?**  
- Dosage précis du mélange air/carburant  
- Suivi de la performance de la sonde

**Attention :**  
Une tension instable signale souvent un vieillissement de la sonde.`,
  },

  O2_S1_WR_CURRENT: {
    name: 'Lambda amont (mA)',
    formatValue: formatCommandsValue.mA,
    description: `**Courant sonde lambda amont**  
Mesure en mA liée au chauffage interne de la sonde.

**Pourquoi c’est utile ?**  
- Vérifier le circuit de chauffage  
- Évaluer la réactivité de la sonde

**Attention :**  
Un courant hors plage indique un problème électrique.`,
  },

  O2_B1S2: {
    name: 'Lambda aval (V)',
    formatValue: formatCommandsValue.volt,
    description: `**Tension sonde lambda aval**  
Mesure en volts après le catalyseur.

**Pourquoi c’est utile ?**  
- Suivre l’efficacité du pot catalytique  
- Détecter un catalyseur bouché

**Attention :**  
Des tensions identiques à l’amont révèlent un catalyseur inefficace.`,
  },

  ELM_VOLTAGE: {
    name: 'Tension interface',
    formatValue: formatCommandsValue.volt,
    description: `**Tension module OBD (ELM327)**  
Mesure en volts de l’alimentation du dongle.

**Pourquoi c’est utile ?**  
- Assurer la communication OBD  
- Vérifier l’état du module

**Attention :**  
Une tension trop basse coupe la liaison OBD.`,
  },

  CONTROL_MODULE_VOLTAGE: {
    name: 'Tension calculateur',
    formatValue: formatCommandsValue.volt,
    description: `**Tension ECU**  
Mesure en volts de l’alimentation du calculateur.

**Pourquoi c’est utile ?**  
- Prévenir les redémarrages aléatoires  
- Garantir la stabilité de l’ECU

**Attention :**  
Des fluctuations importantes peuvent endommager l’ECU.`,
  },

  RUN_TIME: {
    name: 'Temps moteur allumé',
    formatValue: formatCommandsValue.sec,
    description: `**Temps moteur allumé**  
Durée en secondes depuis le dernier démarrage.

**Pourquoi c’est utile ?**  
- Planifier les intervalles de maintenance  
- Vérifier le temps de chauffe avant montée en régime`,
  },

  RUN_TIME_MIL: {
    name: 'Run-time depuis MIL',
    formatValue: formatCommandsValue.sec,
    description: `**Durée depuis témoin défaut**  
Temps en secondes écoulé depuis l’allumage du MIL.

**Pourquoi c’est utile ?**  
- Suivre la durée d’un défaut actif  
- Évaluer l’impact sur la conduite`,
  },

  DISTANCE_W_MIL: {
    name: 'Distance avec MIL',
    formatValue: formatCommandsValue.dist,
    description: `**Distance depuis témoin défaut**  
Kilomètres parcourus depuis que le MIL s’est allumé.

**Pourquoi c’est utile ?**  
- Mesurer le trajet effectué malgré un défaut  
- Anticiper une réparation`,
  },

  TIME_SINCE_DTC_CLEARED: {
    name: 'Temps depuis RAZ DTC',
    formatValue: formatCommandsValue.sec,
    description: `**Temps depuis effacement DTC**  
Durée en secondes depuis la remise à zéro des codes défaut.

**Pourquoi c’est utile ?**  
- Vérifier que le système a eu le temps de tester tous les capteurs`,
  },

  DISTANCE_SINCE_DTC_CLEAR: {
    name: 'Distance depuis RAZ DTC',
    formatValue: formatCommandsValue.dist,
    description: `**Distance depuis effacement DTC**  
Kilomètres parcourus depuis la réinitialisation des codes défaut.

**Pourquoi c’est utile ?**  
- Suivre l’évolution de l’auto-diagnostic sur la longue distance`,
  },
    /*
    FUEL_TYPE:                      { name: 'Type carburant',           formatValue: formatCommandsValue.str },
    OBD_COMPLIANCE:                 { name: 'Norme OBD',                formatValue: formatCommandsValue.str },
    COMMANDED_EQUIV_RATIO:          { name: 'Lambda cible',             formatValue: formatCommandsValue.raw },
    WARMUPS_SINCE_DTC_CLEAR:        { name: 'Cycles chauffe depuis RAZ',formatValue: formatCommandsValue.raw },
    GET_DTC:                        { name: 'Codes DTC (actifs)',       formatValue: formatCommandsValue.str },
    GET_CURRENT_DTC:                { name: 'Codes DTC (courants)',     formatValue: formatCommandsValue.str },
    VIN:                            { name: 'VIN',                      formatValue: formatCommandsValue.byteA },
    ELM_VERSION:                    { name: 'Version ELM',              formatValue: formatCommandsValue.str },
    CVN:                            { name: 'CVN',                      formatValue: formatCommandsValue.str },
    CALIBRATION_ID:                 { name: 'Calibration ID',           formatValue: formatCommandsValue.byteA },
    PIDS_B:                         { name: 'Bitmap PIDs 40-5F',        formatValue: formatCommandsValue.str },
    MIDS_A:                         { name: 'Bitmap MIDs A',            formatValue: formatCommandsValue.str },
    PIDS_9A:                        { name: 'Bitmap PIDs 9A',           formatValue: formatCommandsValue.str },
    O2_SENSORS:                     { name: 'Capteurs O₂ présents',     formatValue: formatCommandsValue.str },
    PIDS_A:                         { name: 'Bitmap PIDs 20-3F',        formatValue: formatCommandsValue.str },
    PIDS_C:                         { name: 'Bitmap PIDs 60-7F',        formatValue: formatCommandsValue.str },
    FUEL_STATUS:                    { name: 'Boucle carburant',         formatValue: formatCommandsValue.str },
    DTC_STATUS:                     { name: 'Statut DTC',               formatValue: formatCommandsValue.str },
    STATUS:                         { name: 'Statut ECU',               formatValue: formatCommandsValue.str },
    */
};