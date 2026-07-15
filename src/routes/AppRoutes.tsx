import { Route, Routes } from "react-router-dom";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import LoginPage from "../pages/auth/LoginPage";
import OAuthCallbackPage from "../pages/auth/OAuthCallbackPage";
import RegisterPage from "../pages/auth/RegisterPage";
import TotpVerificationPage from "../pages/auth/TotpVerificationPage";
import BuyerDashboardPage from "../pages/buyer/BuyerDashboardPage";
import MyPurchasesPage from "../pages/buyer/MyPurchasesPage";
import NotFoundPage from "../pages/errors/NotFoundPage";
import ProductDetailsPage from "../pages/products/ProductDetailsPage";
import ProductsPage from "../pages/products/ProductsPage";
import LandingPage from "../pages/public/LandingPage";
import OnboardingPage from "../pages/public/OnboardingPage";
import SellerDashboardPage from "../pages/seller/SellerDashboardPage";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

export default function AppRoutes() { 
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:productId" element={<ProductDetailsPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/totp" element={<TotpVerificationPage />} />
      <Route
        path="/auth/oauth/callback"
        element={<OAuthCallbackPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route
            element={<RoleProtectedRoute allowedRoles={["BUYER"]} />}
          >
            <Route
              path="/buyer/dashboard"
              element={<BuyerDashboardPage />}
            />
            <Route
              path="/my-purchases"
              element={<MyPurchasesPage />}
            />
          </Route>

          <Route
            element={<RoleProtectedRoute allowedRoles={["SELLER"]} />}
          >
            <Route
              path="/seller/dashboard"
              element={<SellerDashboardPage />}
            />
          </Route>

          <Route
            element={<RoleProtectedRoute allowedRoles={["ADMIN"]} />}
          >
            <Route
              path="/admin/dashboard"
              element={<AdminDashboardPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
