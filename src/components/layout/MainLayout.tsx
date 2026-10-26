import { Outlet, useLocation } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import ChatSocketProvider from "@/context/ChatSocketProvider";
import FeedbackDialogProvider from "@/context/FeedbackDialogProvider";

export default function MainLayout() {
  const { pathname } = useLocation();
  const showFooter = !pathname.startsWith("/chat");
  const pageKey = pathname.startsWith("/chat") ? "/chat" : pathname;

  return (
    <ChatSocketProvider>
      <FeedbackDialogProvider>
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1">
            {/* ключ — адреса сторінки: при переході вміст плавно з'являється.
                У чаті перемикання розмов не перемонтовує сторінку */}
            <div key={pageKey} className="page-enter">
              <Outlet />
            </div>
          </main>
          {showFooter && <Footer />}
        </div>
      </FeedbackDialogProvider>
    </ChatSocketProvider>
  );
}
