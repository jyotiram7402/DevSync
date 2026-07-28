import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@ext/options/App";
import "@ext/styles/index.css";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
