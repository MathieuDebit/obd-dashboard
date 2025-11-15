/**
 * @file Formatting helpers for OBD command raw values.
 */
type FormatValue = (v: string) => string;

type FormatCommandsValue = Record<string, FormatValue>;

type ObdCommandMeta = {
    formatValue: FormatValue;
};

type ObdCommands = Record<string, ObdCommandMeta>;

/**
 * Lookup table of formatters that append human-readable units.
 */
const formatCommandsValue = {
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
} satisfies FormatCommandsValue;

/**
 * Safely returns a formatter function from the lookup table for reuse.
 *
 * @param key - Identifier of the formatter to use.
 * @returns Formatting function that appends units.
 */
const getFormatter = <K extends keyof typeof formatCommandsValue>(key: K) =>
  formatCommandsValue[key];

/**
 * Metadata map describing how to format each supported PID's value.
 */
export const OBD_COMMANDS: ObdCommands = {
  RPM: {
    formatValue: getFormatter("rpm"),
  },

  SPEED: {
    formatValue: getFormatter("kmh"),
  },

  COOLANT_TEMP: {
    formatValue: getFormatter("tempC"),
  },

  INTAKE_TEMP: {
    formatValue: formatCommandsValue.tempC,
  },

  INTAKE_PRESSURE: {
    formatValue: getFormatter("kPa"),
  },

  BAROMETRIC_PRESSURE: {
    formatValue: formatCommandsValue.kPa,
  },

  TIMING_ADVANCE: {
    formatValue: getFormatter("BTDC"),
  },

  THROTTLE_POS: {
    formatValue: getFormatter("pct"),
  },

  THROTTLE_ACTUATOR: {
    formatValue: formatCommandsValue.pct,
  },

  THROTTLE_POS_B: {
    formatValue: formatCommandsValue.pct,
  },

  RELATIVE_THROTTLE_POS: {
    formatValue: formatCommandsValue.pct,
  },

  ENGINE_LOAD: {
    formatValue: formatCommandsValue.pct,
  },

  ABSOLUTE_LOAD: {
    formatValue: formatCommandsValue.pct,
  },

  LONG_FUEL_TRIM_1: {
    formatValue: formatCommandsValue.pct,
  },

  SHORT_FUEL_TRIM_1: {
    formatValue: formatCommandsValue.pct,
  },

  MAF: {
    formatValue: getFormatter("g_s"),
  },

  EVAPORATIVE_PURGE: {
    formatValue: formatCommandsValue.pct,
  },

  COMMANDED_EGR: {
    formatValue: formatCommandsValue.pct,
  },

  CATALYST_TEMP_B1S1: {
    formatValue: formatCommandsValue.tempC,
  },

  CATALYST_TEMP_B1S2: {
    formatValue: formatCommandsValue.tempC,
  },

  O2_S1_WR_VOLTAGE: {
    formatValue: getFormatter("volt"),
  },

  O2_S1_WR_CURRENT: {
    formatValue: getFormatter("mA"),
  },

  O2_B1S2: {
    formatValue: formatCommandsValue.volt,
  },

  ELM_VOLTAGE: {
    formatValue: formatCommandsValue.volt,
  },

  CONTROL_MODULE_VOLTAGE: {
    formatValue: formatCommandsValue.volt,
  },

  RUN_TIME: {
    formatValue: getFormatter("sec"),
  },

  RUN_TIME_MIL: {
    formatValue: formatCommandsValue.sec,
  },

  DISTANCE_W_MIL: {
    formatValue: getFormatter("dist"),
  },

  TIME_SINCE_DTC_CLEARED: {
    formatValue: getFormatter("sec"),
  },

  DISTANCE_SINCE_DTC_CLEAR: {
    formatValue: getFormatter("dist"),
  },

    /*
    FUEL_TYPE:                      { formatValue: formatCommandsValue.str },
    OBD_COMPLIANCE:                 { formatValue: formatCommandsValue.str },
    COMMANDED_EQUIV_RATIO:          { formatValue: formatCommandsValue.raw },
    WARMUPS_SINCE_DTC_CLEAR:        { formatValue: formatCommandsValue.raw },
    GET_DTC:                        { formatValue: formatCommandsValue.str },
    GET_CURRENT_DTC:                { formatValue: formatCommandsValue.str },
    VIN:                            { formatValue: formatCommandsValue.byteA },
    ELM_VERSION:                    { formatValue: formatCommandsValue.str },
    CVN:                            { formatValue: formatCommandsValue.str },
    CALIBRATION_ID:                 { formatValue: formatCommandsValue.byteA },
    PIDS_B:                         { formatValue: formatCommandsValue.str },
    MIDS_A:                         { formatValue: formatCommandsValue.str },
    PIDS_9A:                        { formatValue: formatCommandsValue.str },
    O2_SENSORS:                     { formatValue: formatCommandsValue.str },
    PIDS_A:                         { formatValue: formatCommandsValue.str },
    PIDS_C:                         { formatValue: formatCommandsValue.str },
    FUEL_STATUS:                    { formatValue: formatCommandsValue.str },
    DTC_STATUS:                     { formatValue: formatCommandsValue.str },
    STATUS:                         { formatValue: formatCommandsValue.str },
    */
};
