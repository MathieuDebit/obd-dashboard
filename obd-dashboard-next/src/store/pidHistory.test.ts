import {
  PID_HISTORY_WINDOW_SECONDS,
  clearPidHistory,
  getPidHistory,
  isPidHistoryRecording,
  pausePidHistory,
  recordPidSamples,
  resumePidHistory,
} from "./pidHistory";

const windowMs = PID_HISTORY_WINDOW_SECONDS * 1000;

describe("pidHistory store", () => {
  beforeEach(() => {
    clearPidHistory();
    resumePidHistory();
  });

  it("records numeric samples and prunes data outside the configured window", () => {
    const baseTimestamp = 1_000_000;

    recordPidSamples({
      timestamp: baseTimestamp,
      pids: { RPM: 1200, SPEED: "45" },
    });
    expect(getPidHistory("RPM")).toHaveLength(1);
    expect(getPidHistory("SPEED")[0]?.value).toBe(45);

    recordPidSamples({
      timestamp: baseTimestamp + windowMs + 5,
      pids: { RPM: 1700 },
    });
    const rpmSamples = getPidHistory("RPM");
    expect(rpmSamples).toHaveLength(1);
    expect(rpmSamples[0]?.timestamp).toBe(baseTimestamp + windowMs + 5);
  });

  it("can be paused and resumed without leaking samples", () => {
    expect(isPidHistoryRecording()).toBe(true);
    pausePidHistory();
    expect(isPidHistoryRecording()).toBe(false);

    recordPidSamples({
      timestamp: Date.now(),
      pids: { RPM: 5000 },
    });
    expect(getPidHistory("RPM")).toHaveLength(0);

    resumePidHistory();
    expect(isPidHistoryRecording()).toBe(true);

    recordPidSamples({
      timestamp: Date.now(),
      pids: { RPM: 5200 },
    });
    expect(getPidHistory("RPM")).toHaveLength(1);
  });
});
