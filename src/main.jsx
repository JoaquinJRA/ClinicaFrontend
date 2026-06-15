import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import AppDialogProvider from "./components/AppDialogProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1A3A6B",
          color: "#fff",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
    <BrowserRouter>
      <AppDialogProvider>
        <App />
      </AppDialogProvider>
    </BrowserRouter>
  </StrictMode>
);
