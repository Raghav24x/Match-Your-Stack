import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./index.css";
import { initializeTheme } from "./lib/theme";

// Initialize theme before rendering
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
