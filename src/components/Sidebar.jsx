import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Book,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  User,
  Loader2,
  PlusCircle,
  ChevronDown,
  IndianRupeeIcon,
  CheckCircle,
  Wallet as WalletIcon,
} from "lucide-react";
import Logo from "../assets/Logo.png";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [isAddInvestmentsOpen, setIsAddInvestmentsOpen] = useState(false);

  // ✅ KEEPING YOUR EXACT LINKS
  const links = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Bookings", path: "/bookings", icon: Book },
    { name: "Customer Profile", path: "/customers", icon: User },
    { name: "Funds", path: "/funds", icon: Wallet },
    { name: "Tasks", path: "/tasks", icon: CheckCircle },
    {
      name: "Capital",
      icon: PlusCircle,
      children: [
        { name: "Manage Partners", path: "/add-revenue" },
        { name: "Manage Wallet", path: "/add-wallet-amount", icon: WalletIcon },
      ],
    },
    { name: "Log Expense", path: "/log-expense", icon: IndianRupeeIcon },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  // ✅ KEEPING YOUR EXACT LOGIC
  useEffect(() => {
    const childPaths = ["/add-revenue", "/add-wallet-amount"];
    if (!childPaths.includes(location.pathname)) {
      setIsAddInvestmentsOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const stored = localStorage.getItem("profileImage");
    if (stored) setProfileImage(stored);
  }, []);

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("profileImage", reader.result);
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <aside className="flex h-full w-full flex-col bg-white border-r border-gray-100">
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </aside>
    );
  }

  if (!user) {
    navigate("/signin", { replace: true });
    return null;
  }

  return (
    <aside className="flex h-full w-full flex-col bg-[#f8fafc] border-r border-gray-200/60">
      
      {/* Logo Section - Cleaned up spacing */}
      <div className="p-6">
        <div className="flex items-center justify-center h-16 w-full">
          <img src={Logo} alt="Logo" className="h-10 object-contain" />
        </div>
      </div>

      {/* Navigation - Enhanced Hover & Active States */}
      <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto custom-scrollbar">
        {links.map((item, index) =>
          !item.children ? (
            <NavLink
              key={index}
              to={item.path}
              end
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                ${isActive ? "text-white" : "text-slate-600 hover:bg-white hover:shadow-sm hover:text-blue-600"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarPill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-100"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon size={20} className={`relative z-10 transition-colors ${isActive ? "text-white" : "group-hover:text-blue-600"}`} />
                  <span className="relative z-10">{item.name}</span>
                </>
              )}
            </NavLink>
          ) : (
            <div key={index} className="space-y-1">
              <button
                onClick={() => setIsAddInvestmentsOpen(!isAddInvestmentsOpen)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all
                ${isAddInvestmentsOpen ? "bg-blue-50/50 text-blue-700" : "text-slate-600 hover:bg-white"}`}
              >
                <item.icon size={20} className={isAddInvestmentsOpen ? "text-blue-600" : "text-slate-500"} />
                <span>{item.name}</span>
                <ChevronDown 
                  size={16} 
                  className={`ml-auto transition-transform duration-300 ${isAddInvestmentsOpen ? 'rotate-180' : 'rotate-0'}`} 
                />
              </button>

              <AnimatePresence>
                {isAddInvestmentsOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    className="ml-6 pl-4 border-l-2 border-blue-100 space-y-1 overflow-hidden"
                  >
                    {item.children.map((sub, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={sub.path}
                        onClick={() => setIsAddInvestmentsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all
                          ${isActive ? "bg-white text-blue-600 font-bold shadow-sm" : "text-slate-500 hover:text-blue-600 hover:bg-white"}`
                        }
                      >
                        {/* FIX: Moved sub.icon logic inside the NavLink body */}
                        {sub.icon && <sub.icon size={16} />}
                        <span>{sub.name}</span>
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        )}
      </nav>

      {/* Profile & Logout - Modern "Card" Style */}
      <div className="p-4 bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 mb-4 p-2">
          <div className="relative h-11 w-11 shrink-0">
            <label htmlFor="profile-upload" className="cursor-pointer group">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-md group-hover:brightness-90 transition"
                />
              ) : (
                <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border-2 border-white shadow-sm">
                  <User size={20} />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1 rounded-full border-2 border-white shadow-sm">
                <PlusCircle size={10} className="text-white" />
              </div>
            </label>
            <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-red-600 transition-all hover:bg-red-600 hover:text-white"
        >
          <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;