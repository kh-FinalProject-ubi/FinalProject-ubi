import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import LoginModal from "./LoginPage";

export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
