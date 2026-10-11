
import { Routes, Route, Outlet, useLocation } from "react-router-dom";

// Storefront layout components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import MobileBottomNav from "./components/MobileBottomNav";
import GuestRoute from "./components/GuestRoute";
import SpecialOffersTab from "./components/SpecialOffersTab";

// Context providers
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// Storefront pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import CategoryPage from "./pages/CategoryPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import AdvertisementPopup from "./components/AdvertisementPopup";

// Authentication and customer account pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyAccount from "./pages/MyAccount";
import MyAddresses from "./pages/MyAddresses";
import MyOrders from "./pages/MyOrders";
import TrackOrder from "./pages/TrackOrder";
import ResetPassword from "./pages/ResetPassword";
import Notifications from "./pages/Notifications";

// Information and policy pages
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

// Fallback page
import NotFound from "./pages/NotFound";

// Admin components and pages
import AdminLayout from "./admin/components/AdminLayout";
import AdminRoute from "./admin/components/AdminRoute";
import { AdminDataProvider } from "./admin/context/AdminDataContext";

import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminCustomers from "./admin/pages/AdminCustomers";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminReports from "./admin/pages/AdminReports";
import AdminReviews from "./admin/pages/AdminReviews";
import AdminAnnouncements from "./admin/pages/AdminAnnouncements";
import AdminNewsletter from "./admin/pages/AdminNewsletter";
import AdminAdvertisements from "./admin/pages/AdminAdvertisements";
import AdminLogin from "./admin/pages/AdminLogin";

/**
 * Shared storefront layout.
 */
function StorefrontLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-cream pb-[calc(66px+env(safe-area-inset-bottom))] xl:pb-0">
      {/* Session-based advertisement popup */}
      <AdvertisementPopup />

      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />

      {isHomePage && <WhatsAppButton />}

      <MobileBottomNav />
      <SpecialOffersTab />
    </div>
  );
}

/**
 * Application routes.
 */
function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <Routes>
          {/* =========================================
              CUSTOMER STOREFRONT
          ========================================= */}
          <Route element={<StorefrontLayout />}>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* =======================================
                GUEST-ONLY AUTHENTICATION PAGES
            ======================================= */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Password recovery */}
            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />

            {/* =======================================
                CUSTOMER ACCOUNT
            ======================================= */}
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/my-addresses" element={<MyAddresses />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Order tracking */}
            <Route
              path="/track-order"
              element={<TrackOrder />}
            />

            {/* =======================================
                SHOPPING
            ======================================= */}
            <Route path="/shop" element={<Shop />} />

            <Route
              path="/shop/:category"
              element={<CategoryPage />}
            />

            <Route
              path="/product/:slug"
              element={<ProductDetails />}
            />

            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />

            {/* Checkout and order confirmation */}
            <Route path="/checkout" element={<Checkout />} />

            <Route
              path="/order-success"
              element={<OrderSuccess />}
            />

            {/* =======================================
                INFORMATION PAGES
            ======================================= */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />

            {/* =======================================
                POLICIES
            ======================================= */}
            <Route
              path="/shipping-policy"
              element={<ShippingPolicy />}
            />

            <Route
              path="/return-policy"
              element={<ReturnPolicy />}
            />

            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />

            <Route path="/terms" element={<Terms />} />

            {/* Unknown storefront routes */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* =========================================
              ADMIN LOGIN
          ========================================= */}
          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* =========================================
              PROTECTED ADMIN PANEL
          ========================================= */}
          <Route
            path="/admin"
            element={<AdminRoute />}
          >
            <Route
              element={
                <AdminDataProvider>
                  <AdminLayout />
                </AdminDataProvider>
              }
            >
              <Route index element={<AdminDashboard />} />

              <Route
                path="products"
                element={<AdminProducts />}
              />

              <Route
                path="categories"
                element={<AdminCategories />}
              />

              <Route
                path="orders"
                element={<AdminOrders />}
              />

              <Route
                path="customers"
                element={<AdminCustomers />}
              />

              <Route
                path="reviews"
                element={<AdminReviews />}
              />

              <Route
                path="settings"
                element={<AdminSettings />}
              />

              <Route
                path="reports"
                element={<AdminReports />}
              />

              <Route
                path="announcements"
                element={<AdminAnnouncements />}
              />

              <Route
                path="newsletter"
                element={<AdminNewsletter />}
              />
              <Route
                path="advertisements"
                element={<AdminAdvertisements />}
              />
            </Route>
          </Route>
        </Routes>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
