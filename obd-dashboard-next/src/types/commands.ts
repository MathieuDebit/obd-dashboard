export type OBDServerResponse = {
  timestamp: number;
  pids: Record<string, string>
}

export type Command = {
  pid: string,
  rawValue: string,
  name: string,
  value: string
};

export type Commands = Command[];