import { Route, Routes } from "react-router-dom";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import EmailVerificationPage from "../pages/auth/EmailVerificationPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import OAuthCallbackPage from "../pages/auth/OAuthCallbackPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import TotpVerificationPage from "../pages/auth/TotpVerificationPage";
import BuyerDashboardPage from "../pages/buyer/BuyerDashboardPage";
import DisputeDetailsPage from "../pages/buyer/DisputeDetailsPage";
import DisputesPage from "../pages/buyer/DisputesPage";
import MyPurchasesPage from "../pages/buyer/MyPurchasesPage";
import NewDisputePage from "../pages/buyer/NewDisputePage";
import NotFoundPage from "../pages/errors/NotFoundPage";
import ActiveSessionsPage from "../pages/profile/ActiveSessionsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import SecurityActivityPage from "../pages/profile/SecurityActivityPage";
import SecurityNotificationsPage from "../pages/profile/SecurityNotificationsPage";
import ProductDetailsPage from "../pages/products/ProductDetailsPage";
import ProductsPage from "../pages/products/ProductsPage";
import LandingPage from "../pages/public/LandingPage";
import OnboardingPage from "../pages/public/OnboardingPage";
import CreateProductPage from "../pages/seller/CreateProductPage";
import EditProductPage from "../pages/seller/EditProductPage";
import SellerDashboardPage from "../pages/seller/SellerDashboardPage";
import SellerProductsPage from "../pages/seller/SellerProductsPage";
import SellerSalesPage from "../pages/seller/SellerSalesPage";
import TransactionDetailsPage from "../pages/transactions/TransactionDetailsPage";

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
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
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
            path="/profile/sessions"
            element={<ActiveSessionsPage />}
          />
          <Route
            path="/profile/security-notifications"
            element={<SecurityNotificationsPage />}
          />
          <Route
            path="/profile/security-activity"
            element={<SecurityActivityPage />}
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
          </Route>

          <Route
            element={<RoleProtectedRoute allowedRoles={["BUYER", "SELLER", "ADMIN"]} />}
          >
            <Route
              path="/disputes/:disputeId"
              element={<DisputeDetailsPage />}
            />
          </Route>

          <Route
            element={<RoleProtectedRoute allowedRoles={["BUYER", "SELLER", "ADMIN"]} />}
          >
            <Route
              path="/transactions/:transactionId"
              element={<TransactionDetailsPage />}
            />
          </Route>

          <Route
            element={<RoleProtectedRoute allowedRoles={["SELLER", "ADMIN"]} />}
          >
            <Route
              path="/seller/dashboard"
              element={<SellerDashboardPage />}
            />
            <Route
              path="/seller/products"
              element={<SellerProductsPage />}
            />
            <Route
              path="/seller/products/new"
              element={<CreateProductPage />}
            />
            <Route
              path="/seller/products/:productId/edit"
              element={<EditProductPage />}
            />
            <Route
              path="/seller/sales"
              element={<SellerSalesPage />}
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
