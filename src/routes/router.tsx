import CatalogPage from "../pages/CatalogPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import OAuthCallbackPage from "../pages/OAuthCallbackPage";
import { createBrowserRouter } from "react-router-dom";
import RequestsPage from "@/pages/RequestsPage";
import ExchangesPage from "@/pages/ExchangesPage";
import ChatPage from "@/pages/ChatPage";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/routes/ProtectedRoute";
import GuestOnlyRoute from "@/components/routes/GuestOnlyRoute";
import FeedPage from "@/pages/FeedPage";
import ListingDetailPage from "@/pages/ListingDetailPage";
import ProfilePage from "@/pages/ProfilePage";

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: "listings/:id", element: <ListingDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "requests", element: <RequestsPage /> },
          { path: "exchanges", element: <ExchangesPage /> },
          { path: "chat", element: <ChatPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
      { path: "feed", element: <FeedPage /> },
    ],
  },
  {
    element: <GuestOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  { path: "/oauth-callback", element: <OAuthCallbackPage /> },
];

export default createBrowserRouter(routes);
