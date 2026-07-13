import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/Login/LoginPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { UserListPage } from "../pages/Users/UserListPage";
import { UserEditPage } from "../pages/Users/UserEditPage";
import { ProductListPage } from "../pages/Products/ProductListPage";
import { ProductFormPage } from "../pages/Products/ProductFormPage";
import { ProductDetailPage } from "../pages/Products/ProductDetailPage";
import { ProductImagesPage } from "../pages/Products/ProductImagesPage";
import { CategoriesPage } from "../pages/Categories/CategoriesPage";
import { PackageListPage } from "../pages/Packages/PackageListPage";
import { PackageFormPage } from "../pages/Packages/PackageFormPage";
import { PackageDetailPage } from "../pages/Packages/PackageDetailPage";
import { ApplicationListPage } from "../pages/Applications/ApplicationListPage";
import { ApplicationDetailPage } from "../pages/Applications/ApplicationDetailPage";
import { ConversationListPage } from "../pages/Conversations/ConversationListPage";
import { ConversationChatPage } from "../pages/Conversations/ConversationChatPage";

export const AppRoutes = () => (
  <Routes>
    <Route path="/auth/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/users" element={<UserListPage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/:id" element={<CategoriesPage />} />
      <Route path="/products/new" element={<ProductFormPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/products/:id/images" element={<ProductImagesPage />} />
      <Route path="/packages" element={<PackageListPage />} />
      <Route path="/packages/new" element={<PackageFormPage />} />
      <Route path="/packages/:id" element={<PackageDetailPage />} />
      <Route path="/applications" element={<ApplicationListPage />} />
      <Route path="/applications/:id" element={<ApplicationDetailPage />} />
      <Route path="/conversations" element={<ConversationListPage />} />
      <Route path="/conversations/:id" element={<ConversationChatPage />} />
      <Route path="/users/:id" element={<UserEditPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
