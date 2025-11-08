import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet /> {/* Public pages will render here */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
