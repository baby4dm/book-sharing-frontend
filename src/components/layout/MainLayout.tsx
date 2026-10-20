import { Outlet, useLocation } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import ChatSocketProvider from "@/context/ChatSocketProvider";
import FeedbackDialogProvider from "@/context/FeedbackDialogProvider";

export default function MainLayout() {
  const { pathname } = useLocation();
  const showFooter = !pathname.startsWith("/chat");

  return (
    <ChatSocketProvider>
      <FeedbackDialogProvider>
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          {showFooter && <Footer />}
        </div>
      </FeedbackDialogProvider>
    </ChatSocketProvider>
  );
}
