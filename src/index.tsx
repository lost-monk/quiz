import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PostHogProvider } from "posthog-js/react";

// 1. Vite uses 'import.meta.env' instead of 'process.env'
// Note: These must start with VITE_ in your .env file
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST;

// 2. Clear Guard: TypeScript now knows if these exist, they are strings.
if (!POSTHOG_KEY || !POSTHOG_HOST) {
  throw new Error(
    "Vite Environment Variables Missing: Check your .env file for VITE_POSTHOG_KEY"
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={POSTHOG_KEY} // Use a placeholder string if undefined to satisfy TS
      options={{
        api_host: POSTHOG_HOST,
        capture_exceptions: true,
        debug: true, // Set to true to see logs in your browser console
      }}
    >
      <App />
    </PostHogProvider>
  </React.StrictMode>
);