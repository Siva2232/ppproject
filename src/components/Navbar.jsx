// src/components/Navbar.jsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, Search, LogOut, Wallet, Plus, DollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { useWallet } from "../context/WalletContext";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const Navbar = () => {
  const { unreadCount } = useNotifications();
  const { walletData } = useWallet();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const formattedWallets = useMemo(() => {
    return walletData.map(wallet => ({
      ...wallet,
      formattedAmount: formatCurrency(wallet.amount),
    }));
  }, [walletData]);

  return (
    <header className="relative w-full bg-white/70 backdrop-blur-2xl border-b border-white/20 shadow-lg overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        animate={{
          background: [
            "linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
            "linear-gradient(90deg, #ec4899 0%, #6366f1 50%, #a855f7 100%)",
            "linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #6366f1 100%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

      <div className="relative flex items-center justify-between w-full py-3 px-4 sm:px-6">
        
        {/* Desktop Wallets */}
        <div className="hidden lg:flex items-center gap-5">
          {formattedWallets.map((wallet) => (
            <motion.div
              key={wallet.key}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.04, y: -1 }}
              className="group flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 backdrop-blur-md shadow-sm cursor-pointer transition-all"
            >
              <Wallet size={18} className="text-gray-700 group-hover:animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{wallet.name}</p>
                <p className="text-base font-bold text-gray-800">{wallet.formattedAmount}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-white/60 backdrop-blur-xl rounded-full border border-white/40 shadow-inner flex-1 max-w-md mx-8"
        >
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search bookings, clients..."
            className="bg-transparent outline-none text-sm flex-1 placeholder-gray-500 font-medium"
          />
        </motion.div>

        {/* Right */}
        <div className="flex items-center gap-5">
          <Link to="/notifications">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all shadow-md"
            >
              <Bell size={22} className="text-emerald-600" />
              {unreadCount > 0 && (
                <>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.span>
                  <span className="absolute inset-0 rounded-full bg-red-400/30 animate-ping" />
                </>
              )}
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2.5 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/15 text-red-600 font-semibold rounded-2xl border border-red-200/40 transition-all shadow-sm text-sm"
          >
            <LogOut size={18} />
            Logout
          </motion.button>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2.5 rounded-xl bg-white/60 backdrop-blur-xl hover:bg-white/80 transition-all shadow-md"
          >
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
              {open ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden absolute top-full left-0 w-full bg-white/90 backdrop-blur-2xl border-t border-white/30 shadow-2xl"
          >
            <div className="px-5 py-4 space-y-5">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-inner">
                <Search size={21} className="text-gray-600" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent outline-none flex-1 text-base placeholder-gray-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {formattedWallets.map((wallet) => (
                  <motion.div
                    key={wallet.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-200 backdrop-blur-md shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                          <Wallet size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{wallet.name}</p>
                          <p className="text-xl font-extrabold text-indigo-700">{wallet.formattedAmount}</p>
                        </div>
                      </div>
                      <DollarSign size={20} className="text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2"
                  onClick={() => { setOpen(false); navigate("/add-booking"); }}
                >
                  <Plus size={20} />
                  New Booking
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2"
                  onClick={() => { setOpen(false); navigate("/add-wallet-amount"); }}
                >
                  <DollarSign size={20} />
                  Add Wallet
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setOpen(false); handleLogout(); }}
                className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/15 text-red-600 font-bold rounded-2xl border border-red-200/40 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <LogOut size={20} />
                Logout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;