// src/components/Navbar.jsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, Search, LogOut, Wallet, Plus, DollarSign, Activity, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { useWallet } from "../context/WalletContext";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0, // Cleaner for top-bar scannability
  }).format(amount);
};

const Navbar = () => {
  const { unreadCount } = useNotifications();
  const { walletData } = useWallet();
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth(); // Keeping your auth logic
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
    <header className="sticky top-0 z-[100] w-full">
      {/* Dynamic Glow Line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 animate-gradient-x opacity-80" />
      
      <nav className="bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-sm px-4 sm:px-8 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          
          {/* 1. BRANDING SECTION */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white 
bg-gradient-to-br from-blue-600 via-indigo-500 to-violet-600
shadow-xl shadow-indigo-300
group-hover:scale-105 group-hover:shadow-violet-300
transition-all duration-300">
  <ShieldCheck size={22} strokeWidth={2.5} />
</div>

              <div className="hidden lg:block leading-none">
<span className="text-lg font-black tracking-tighter uppercase bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
  Compass Tours and Travels
</span>

                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live System</span>
                </div>
              </div>
            </Link>

            {/* 2. SEARCH (DESKTOP) */}
            {/* <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-slate-100/50 rounded-2xl border border-transparent focus-within:border-indigo-200 focus-within:bg-white focus-within:shadow-lg transition-all w-64 lg:w-96">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search database..."
                className="bg-transparent outline-none text-sm font-bold text-slate-700 placeholder-slate-400 w-full"
              />
            </div> */}
          </div>

          {/* 3. WALLETS (DESKTOP BENTO) */}
          <div className="hidden xl:flex items-center gap-3">
            {formattedWallets.map((wallet) => (
              <motion.div
                key={wallet.key}
                whileHover={{ y: -2, scale: 1.02 }}
                className="flex items-center gap-4 px-5 py-2.5 bg-white border border-slate-100 rounded-[1.25rem] shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600">
                  <Wallet size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">{wallet.name}</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{wallet.formattedAmount}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 4. ACTIONS & PROFILE */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <Link to="/notifications" className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-2xl bg-slate-50 text-slate-500 hover:text-indigo-600 border border-slate-100 transition-all"
              >
                <Bell size={20} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-white text-[9px] font-black text-white items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </span>
                )}
              </motion.button>
            </Link>

            {/* Separator */}
            <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block" />

            {/* User & Logout */}
            <div className="flex items-center gap-4">
               <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Admin Access</p>
                  <p className="text-sm font-black text-slate-900 leading-none">{user?.displayName || "Super Admin"}</p>
               </div>
               {/* <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 transition-all shadow-sm"
               >
                 <LogOut size={20} strokeWidth={2.5} />
               </motion.button> */}

               {/* Mobile Toggle */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-3 rounded-2xl bg-slate-900 text-white shadow-lg"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Mobile Search */}
              <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Search size={20} className="text-slate-400" />
                <input type="text" placeholder="Search..." className="bg-transparent outline-none flex-1 font-bold text-slate-700" />
              </div>

              {/* Mobile Wallets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formattedWallets.map((wallet) => (
                  <div key={wallet.key} className="p-5 rounded-[2rem] bg-slate-900 text-white flex justify-between items-center shadow-xl">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">{wallet.name}</p>
                      <p className="text-2xl font-black">{wallet.formattedAmount}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                       <Wallet size={24} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setOpen(false); navigate("/add-booking"); }}
                  className="py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <Plus size={16} strokeWidth={3} /> New Booking
                </button>
                <button 
                  onClick={() => { setOpen(false); navigate("/add-wallet-amount"); }}
                  className="py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  <DollarSign size={16} strokeWidth={3} /> Top Up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;