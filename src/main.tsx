import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ForestProvider } from "@/store/forest";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ForestProvider>
      <App />
    </ForestProvider>
  </StrictMode>
);
