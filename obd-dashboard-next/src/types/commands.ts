export type RawPidValue = string | number | null | undefined;

export type OBDServerResponse = {
  timestamp: number;
  pids: Record<string, RawPidValue>;
};

export type Command = {
  pid: string,
  rawValue: string,
  name: string,
  value: string,
  description: string,
};

export type Commands = Command[];
