import { HelmetProvider } from "react-helmet-async";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import ScrollToTop from "./components/ScrollToTop";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />

      <CartProvider>
        <WishlistProvider>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);
