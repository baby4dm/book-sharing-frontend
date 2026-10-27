import { Outlet, useLocation } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import MobileTabBar from "./MobileTabBar";
import ChatSocketProvider from "@/context/ChatSocketProvider";
import FeedbackDialogProvider from "@/context/FeedbackDialogProvider";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isChat = pathname.startsWith("/chat");
  const isChatThread = /^\/chat\/[^/]+/.test(pathname);
  const pageKey = isChat ? "/chat" : pathname;

  return (
    <ChatSocketProvider>
      <FeedbackDialogProvider>
        <div
          className={
            isChatThread
              ? "flex min-h-dvh flex-col"
              : "flex min-h-dvh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0"
          }
        >
          <Header />
          <main className="flex-1">
            <div key={pageKey} className="page-enter">
              <Outlet />
            </div>
          </main>
          {!isChat && <Footer />}
          <MobileTabBar />
        </div>
      </FeedbackDialogProvider>
    </ChatSocketProvider>
  );
}
