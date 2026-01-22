import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "react-hot-toast";
// Import the virtual module from the PWA plugin
import { registerSW } from 'virtual:pwa-register';

// This registers the service worker and handles updates automatically
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
    </StrictMode>
);