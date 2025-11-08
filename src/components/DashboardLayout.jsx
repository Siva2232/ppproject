// src/components/DashboardLayout.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-hidden">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 lg:hidden flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Control Panel
                </h2>
                <button
                  onClick={toggleSidebar}
                  aria-expanded={sidebarOpen}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Sidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-gray-200 shadow-xl">
        <div className="flex-1 overflow-hidden">
          <Sidebar />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-gray-50/50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* MOBILE TOGGLE BUTTON */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
        aria-expanded={sidebarOpen}
        className="fixed bottom-6 right-6 z-[60] p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all lg:hidden"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>
    </div>
  );
};

export default DashboardLayout;