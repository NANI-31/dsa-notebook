/**
 * Autonomous real-time Core Web Vitals and loading stability performance recorder.
 * Leverages native W3C PerformanceObserver API to monitor client UX performance in real time
 * with zero library dependencies or CPU painting overhead.
 */

export interface PerformanceReport {
  metric: "FCP" | "LCP" | "FID" | "CLS" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: string;
}

const getRating = (metric: string, value: number): "good" | "needs-improvement" | "poor" => {
  switch (metric) {
    case "FCP":
      return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor";
    case "LCP":
      return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
    case "FID":
      return value <= 100 ? "good" : value <= 300 ? "needs-improvement" : "poor";
    case "CLS":
      return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
    case "TTFB":
      return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor";
    default:
      return "good";
  }
};

const sendReport = (metric: "FCP" | "LCP" | "FID" | "CLS" | "TTFB", value: number) => {
  const report: PerformanceReport = {
    metric,
    value: parseFloat(value.toFixed(3)),
    rating: getRating(metric, value),
    timestamp: new Date().toISOString(),
  };

  // Log in production/dev silently with rich console styles
  const ratingColors = {
    good: "#10b981",
    "needs-improvement": "#f59e0b",
    poor: "#ef4444",
  };

  console.log(
    `%c[Telemetry] ${report.metric}: ${report.value}${report.metric === "CLS" ? "" : "ms"} (${report.rating.toUpperCase()})`,
    `color: ${ratingColors[report.rating]}; font-weight: 800; font-family: monospace;`
  );

  // Here, we can optionally dispatch to backend or local storage queue
  try {
    const key = "dsa-perf-telemetry-v1";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(report);
    // Cap log size at 50 records to protect storage bounds
    if (existing.length > 50) existing.shift();
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (e) {
    // Fail silently in private tabs
  }
};

export const initializePerformanceRecorder = () => {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    console.warn("[Telemetry] PerformanceObserver not supported in this client environment.");
    return;
  }

  // 1. First Contentful Paint (FCP)
  try {
    const fcpObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          sendReport("FCP", entry.startTime);
        }
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });
  } catch (e) {}

  // 2. Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      sendReport("LCP", lastEntry.startTime);
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {}

  // 3. First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const delay = (entry as any).processingStart - entry.startTime;
        sendReport("FID", delay);
      }
    });
    fidObserver.observe({ type: "first-input", buffered: true });
  } catch (e) {}

  // 4. Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          sendReport("CLS", clsValue);
        }
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch (e) {}

  // 5. Time to First Byte (TTFB)
  try {
    const ttfbObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const responseStart = (entry as any).responseStart;
        if (responseStart > 0) {
          sendReport("TTFB", responseStart);
        }
      }
    });
    ttfbObserver.observe({ type: "navigation", buffered: true });
  } catch (e) {}
};

/**
 * Periodically uploads performance reports from localStorage during network idle times (requestIdleCallback).
 */
export const initializeTelemetryUploader = () => {
  if (typeof window === "undefined") return;

  const key = "dsa-perf-telemetry-v1";
  const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/telemetry";

  const uploadBatch = () => {
    const isOnline = navigator.onLine;
    if (!isOnline) return;

    try {
      const reports = JSON.parse(localStorage.getItem(key) || "[]");
      if (reports.length === 0) return;

      console.log(`[Telemetry Uploader] Found ${reports.length} pending performance logs. Scheduling batch upload...`);

      const executeUpload = () => {
        fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reports }),
        })
          .then(async (response) => {
            if (response.ok) {
              const current = JSON.parse(localStorage.getItem(key) || "[]");
              const remaining = current.filter(
                (item: any) =>
                  !reports.some(
                    (uploaded: any) =>
                      uploaded.timestamp === item.timestamp && uploaded.metric === item.metric
                  )
              );
              localStorage.setItem(key, JSON.stringify(remaining));
              console.log(`[Telemetry Uploader] Successfully uploaded batch of ${reports.length} Web Vitals reports.`);
            }
          })
          .catch((err) => {
            console.warn("[Telemetry Uploader] Failed to upload telemetry batch:", err);
          });
      };

      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => executeUpload(), { timeout: 10000 });
      } else {
        setTimeout(() => executeUpload(), 1000);
      }
    } catch (e) {
      console.error("[Telemetry Uploader] Error during batch scheduling:", e);
    }
  };

  // Schedule upload check every 15 seconds
  const intervalId = setInterval(uploadBatch, 15000);

  // Trigger once immediately on startup after a small delay
  setTimeout(uploadBatch, 5000);

  return () => {
    clearInterval(intervalId);
  };
};

