import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@ext/popup/App";
import "@ext/styles/index.css";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
