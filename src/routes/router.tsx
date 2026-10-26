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
import CreateListingPage from "@/pages/CreateListingPage";
import ExchangeDetailPage from "@/pages/ExchangeDetailPage";
import HelpPage from "@/pages/HelpPage";
import LegalPage from "@/pages/LegalPage";
import ModerationFeedbackPage from "@/pages/ModerationFeedbackPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotFoundPage from "@/pages/NotFoundPage";
import UserProfilePage from "@/pages/UserProfilePage";
import RouteErrorPage from "@/components/errors/RouteErrorPage";

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <RouteErrorPage standalone />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <CatalogPage /> },
          { path: "listings/:id", element: <ListingDetailPage /> },
          {
            element: <ProtectedRoute />,
            children: [
              { path: "requests", element: <RequestsPage /> },
              { path: "exchanges", element: <ExchangesPage /> },
              { path: "chat", element: <ChatPage /> },
              { path: "chat/:roomId", element: <ChatPage /> },
              { path: "profile", element: <ProfilePage /> },
              { path: "users/:id", element: <UserProfilePage /> },
              { path: "listings/create", element: <CreateListingPage /> },
              { path: "exchanges/:id", element: <ExchangeDetailPage /> },
              {
                path: "moderation/feedback",
                element: <ModerationFeedbackPage />,
              },
              { path: "notifications", element: <NotificationsPage /> },
            ],
          },
          { path: "feed", element: <FeedPage /> },
          { path: "help", element: <HelpPage /> },
          { path: "terms", element: <LegalPage doc="terms" /> },
          { path: "privacy", element: <LegalPage doc="privacy" /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
  {
    element: <GuestOnlyRoute />,
    errorElement: <RouteErrorPage standalone />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  {
    path: "/oauth-callback",
    element: <OAuthCallbackPage />,
    errorElement: <RouteErrorPage standalone />,
  },
];

export default createBrowserRouter(routes);
