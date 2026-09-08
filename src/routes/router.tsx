import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import OAuthCallbackPage from "../pages/OAuthCallbackPage";
import { createBrowserRouter } from "react-router-dom";

const routes = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/oauth-callback", element: <OAuthCallbackPage /> },
];

export default createBrowserRouter(routes);
