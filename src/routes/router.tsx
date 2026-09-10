import HomePage from "../pages/HomePage";
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

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "requests", element: <RequestsPage /> },
          { path: "exchanges", element: <ExchangesPage /> },
          { path: "chat", element: <ChatPage /> },
        ],
      },
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
