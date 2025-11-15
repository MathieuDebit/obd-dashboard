/**
 * @file Type definitions describing OBD command payloads exchanged between the
 * websocket server and the UI.
 */
export type RawPidValue = string | number | null | undefined;

/**
 * Represents the shape of the websocket payload containing PID data.
 */
export type OBDServerResponse = {
  timestamp: number;
  pids: Record<string, RawPidValue>;
};

/**
 * Formatted command metadata consumed by UI components.
 */
export type Command = {
  pid: string,
  rawValue: string,
  name: string,
  value: string,
  description: string,
};

/**
 * Convenience alias for an array of commands.
 */
export type Commands = Command[];
