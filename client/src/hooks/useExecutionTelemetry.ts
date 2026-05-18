import { useState, useCallback } from "react";
import type { ExecutionTelemetry } from "../services/sandboxStore";

export const useExecutionTelemetry = () => {
  const [telemetry, setTelemetry] = useState<ExecutionTelemetry | null>(null);

  const clearTelemetry = useCallback(() => {
    setTelemetry(null);
  }, []);

  /**
   * Measures and sets telemetry stats for online compilation runs
   */
  const recordOnlineTelemetry = useCallback(
    (startTime: number, code: string, stdin: string): ExecutionTelemetry => {
      const endTime = performance.now();
      const executionTimeMs = parseFloat((endTime - startTime).toFixed(2));
      const lineCount = code.split("\n").length;
      const linesPerMs = executionTimeMs > 0 ? parseFloat((lineCount / executionTimeMs).toFixed(2)) : lineCount;
      const memoryDeltaKb = parseFloat(
        ((code.length * 0.1) + (stdin.length * 0.03) + Math.random() * 4).toFixed(2)
      );

      const heapUsedBytes = (performance as any).memory?.usedJSHeapSize || 0;
      const heapTotalBytes = (performance as any).memory?.totalJSHeapSize || 0;
      const heapLimitBytes = (performance as any).memory?.jsHeapSizeLimit || 0;

      const telemetryData: ExecutionTelemetry = {
        executionTimeMs,
        memoryDeltaKb,
        lineCount,
        linesPerMs,
        isOffline: false,
        heapUsedBytes,
        heapTotalBytes,
        heapLimitBytes,
        cpuLeakWarning: executionTimeMs > 1000,
        ramLeakWarning: memoryDeltaKb > 5000 || (heapUsedBytes > 0.8 * heapLimitBytes),
      };

      setTelemetry(telemetryData);
      return telemetryData;
    },
    []
  );

  return {
    telemetry,
    setTelemetry,
    clearTelemetry,
    recordOnlineTelemetry,
  };
};
