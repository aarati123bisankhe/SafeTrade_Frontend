import { Route, Routes } from "react-router-dom";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import LoginPage from "../pages/auth/LoginPage";
import OAuthCallbackPage from "../pages/auth/OAuthCallbackPage";
import RegisterPage from "../pages/auth/RegisterPage";
import TotpVerificationPage from "../pages/auth/TotpVerificationPage";
import BuyerDashboardPage from "../pages/buyer/BuyerDashboardPage";
import DisputeDetailsPage from "../pages/buyer/DisputeDetailsPage";
import DisputesPage from "../pages/buyer/DisputesPage";
import MyPurchasesPage from "../pages/buyer/MyPurchasesPage";
import NewDisputePage from "../pages/buyer/NewDisputePage";
import NotFoundPage from "../pages/errors/NotFoundPage";
import ProfilePage from "../pages/profile/ProfilePage";
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
            path="/profile"
            element={<ProfilePage />}
          />
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
            <Route
              path="/disputes"
              element={<DisputesPage />}
            />
            <Route
              path="/disputes/new"
              element={<NewDisputePage />}
            />
            <Route
              path="/disputes/:disputeId"
              element={<DisputeDetailsPage />}
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
