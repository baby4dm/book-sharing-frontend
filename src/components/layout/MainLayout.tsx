import { Outlet } from "react-router-dom";

import Header from "./Header";
import ChatSocketProvider from "@/context/ChatSocketProvider";

export default function MainLayout() {
  return (
    <ChatSocketProvider>
      <div>
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </ChatSocketProvider>
  );
}
