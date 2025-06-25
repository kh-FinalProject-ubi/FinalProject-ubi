import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import LoginModal from "./LoginModal";

export default function Layout() {
  return (
    <>
      <Header />
      <LoginModal /> {/* 👈 여기서 항상 존재 */}
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
