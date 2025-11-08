import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
// import { BookingProvider } from "./context/BookingContext";
// import { FundsProvider } from "./context/FundsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ BrowserRouter should exist ONLY here */}
    <BrowserRouter>
      {/* Global Context Providers */}
      <AuthProvider>
        {/* <BookingProvider>
          <FundsProvider> */}
            <App />
          {/* </FundsProvider>
        </BookingProvider> */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
