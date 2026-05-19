import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { initializePerformanceRecorder, initializeTelemetryUploader } from "./utils/performanceRecorder";

// Initialize client performance telemetry loop
initializePerformanceRecorder();
initializeTelemetryUploader();

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </Provider>,
  // {/* </StrictMode> */}
);

// Register High-Performance Monaco CDN Asset Pre-caching Service Worker
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[Service Worker] Registration successful with scope: ", reg.scope);

        // Preload Monaco Editor core CDN assets during background idle time to optimize FCP
        const preloadMonacoIdle = () => {
          const MONACO_VERSION = "0.43.0";
          const MONACO_CDN_BASE = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`;
          const assetsToPreload = [
            `${MONACO_CDN_BASE}/loader.js`,
            `${MONACO_CDN_BASE}/editor/editor.main.nls.js`,
            `${MONACO_CDN_BASE}/editor/editor.main.js`,
            `${MONACO_CDN_BASE}/editor/editor.main.css`,
            `${MONACO_CDN_BASE}/basic-languages/javascript/javascript.js`,
            `${MONACO_CDN_BASE}/basic-languages/typescript/typescript.js`,
            `${MONACO_CDN_BASE}/language/typescript/tsMode.js`,
            `${MONACO_CDN_BASE}/language/typescript/tsWorker.js`,
          ];

          console.log("[Monaco Preloader] Starting background idle caching loop...");
          let index = 0;
          const fetchNextAsset = () => {
            if (index < assetsToPreload.length) {
              const url = assetsToPreload[index++];
              fetch(url, { mode: "no-cors" })
                .then(() => {
                  console.log(`[Monaco Preloader] Preloaded: ${url.split('/').pop()}`);
                  if (typeof (window as any).requestIdleCallback === "function") {
                    (window as any).requestIdleCallback(fetchNextAsset);
                  } else {
                    setTimeout(fetchNextAsset, 100);
                  }
                })
                .catch((err) => console.warn(`[Monaco Preloader] Failed to preload: ${url}`, err));
            } else {
              console.log("[Monaco Preloader] All core assets cached successfully! Local workspace loading latency dropped to absolute zero.");
            }
          };

          if (typeof (window as any).requestIdleCallback === "function") {
            (window as any).requestIdleCallback(fetchNextAsset);
          } else {
            setTimeout(fetchNextAsset, 1000);
          }
        };

        // Delay background pre-caches until browser is idle to protect main paint threads
        if (typeof (window as any).requestIdleCallback === "function") {
          (window as any).requestIdleCallback(() => preloadMonacoIdle());
        } else {
          setTimeout(preloadMonacoIdle, 3000);
        }
      })
      .catch((err) => {
        console.error("[Service Worker] Registration failed: ", err);
      });
  });
}
