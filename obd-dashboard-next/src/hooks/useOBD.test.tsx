import { act, renderHook } from "@testing-library/react";

import useOBD from "./useOBD";

import { LanguageProvider } from "@/app/LanguageContext";
import {
  clearPidHistory,
  pausePidHistory,
  recordPidSamples,
  resumePidHistory,
} from "@/store/pidHistory";

jest.mock("@/store/pidHistory", () => ({
  recordPidSamples: jest.fn(),
  clearPidHistory: jest.fn(),
  pausePidHistory: jest.fn(),
  resumePidHistory: jest.fn(),
}));

type Listener = (event: Partial<MessageEvent<string>>) => void;
type EventName = "open" | "message" | "error" | "close";

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  listeners: Record<EventName, Set<Listener>>;

  constructor(url: string) {
    this.url = url;
    this.listeners = {
      open: new Set(),
      message: new Set(),
      error: new Set(),
      close: new Set(),
    };
    MockWebSocket.instances.push(this);
  }

  static latest() {
    return MockWebSocket.instances.at(-1);
  }

  static reset() {
    MockWebSocket.instances = [];
  }

  addEventListener(type: EventName, listener: Listener) {
    this.listeners[type].add(listener);
  }

  removeEventListener(type: EventName, listener: Listener) {
    this.listeners[type].delete(listener);
  }

  private dispatch(type: EventName, event: Partial<MessageEvent<string>>) {
    this.listeners[type].forEach((listener) => listener(event));
  }

  simulateOpen() {
    this.dispatch("open", { type: "open" } as MessageEvent<string>);
  }

  simulateMessage(payload: unknown) {
    this.dispatch("message", {
      data: JSON.stringify(payload),
    });
  }

  simulateClose() {
    this.dispatch("close", { type: "close" } as MessageEvent<string>);
  }

  close() {
    this.simulateClose();
  }
}

describe("useOBD", () => {
  beforeAll(() => {
    Object.defineProperty(global, "WebSocket", {
      writable: true,
      value: MockWebSocket as unknown as typeof WebSocket,
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
    MockWebSocket.reset();
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("connects to the WebSocket feed and exposes formatted commands", () => {
    const { result } = renderHook(() => useOBD(), {
      wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    });

    const socket = MockWebSocket.latest();
    expect(socket).toBeDefined();

    act(() => {
      socket?.simulateOpen();
    });
    expect(resumePidHistory).toHaveBeenCalled();
    expect(result.current.status).toBe("ready");

    act(() => {
      socket?.simulateMessage({
        timestamp: 1000,
        pids: { RPM: 1200, SPEED: 48 },
      });
    });

    expect(recordPidSamples).toHaveBeenCalledWith({
      timestamp: 1000,
      pids: { RPM: 1200, SPEED: 48 },
    });
    expect(result.current.pids.some((pid) => pid.pid === "RPM")).toBe(true);
  });

  it("cleans up history when the socket closes", () => {
    const { result } = renderHook(() => useOBD(), {
      wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    });

    const socket = MockWebSocket.latest();

    act(() => {
      socket?.simulateOpen();
    });
    act(() => {
      socket?.simulateClose();
    });

    expect(pausePidHistory).toHaveBeenCalled();
    expect(clearPidHistory).toHaveBeenCalled();
    expect(result.current.status).toBe("error");
  });
});
