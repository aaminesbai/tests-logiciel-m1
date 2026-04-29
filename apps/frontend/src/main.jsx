import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TradeProvider } from "./store/TradeStore";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <TradeProvider>
        <App />
      </TradeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
