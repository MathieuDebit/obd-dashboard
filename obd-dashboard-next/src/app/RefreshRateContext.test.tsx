import { renderHook } from "@testing-library/react";

import {
  RefreshRateProvider,
  refreshRateIntervals,
  useRefreshRate,
} from "./RefreshRateContext";

import type { PowerMode } from "@/app/PowerModeContext";
import { usePowerMode } from "@/app/PowerModeContext";

jest.mock("@/app/PowerModeContext", () => ({
  usePowerMode: jest.fn(),
}));

const mockUsePowerMode = usePowerMode as jest.MockedFunction<typeof usePowerMode>;

const renderRefreshRate = (mode: PowerMode) => {
  mockUsePowerMode.mockReturnValue({
    mode,
    changeMode: jest.fn(),
  });

  return renderHook(() => useRefreshRate(), {
    wrapper: ({ children }) => (
      <RefreshRateProvider>{children}</RefreshRateProvider>
    ),
  });
};

describe("RefreshRateContext", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns the performance interval for the default mode", () => {
    const { result } = renderRefreshRate("performance");
    expect(result.current.intervalMs).toBe(
      refreshRateIntervals.performance,
    );
  });

  it("returns the power-save interval when requested", () => {
    const { result } = renderRefreshRate("powersave");
    expect(result.current.intervalMs).toBe(refreshRateIntervals.powersave);
  });
});
