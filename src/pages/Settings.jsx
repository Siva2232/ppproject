// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { useExpense } from "../context/ExpenseContext";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  User, Mail, Shield, Bell, Palette, Download, Upload,
  Save, Globe, Check, X, Edit3, Camera, Menu, ChevronDown
} from "lucide-react";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { bookings = [] } = useBooking();
  const { expenses = [] } = useExpense();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "admin",
  });
  const [notifications, setNotifications] = useState({
    email: true, push: false, booking: true, expense: true,
  });

  // Sync form with user
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "admin",
    });
  }, [user]);

  const handleSaveProfile = () => {
    updateUser({ ...user, ...formData });
    setIsEditing(false);
  };

  const stats = {
    totalBookings: bookings.length,
    totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
    lastBooking: bookings[0]?.date ? format(new Date(bookings[0].date), "MMM d, yyyy") : "—",
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data & Export", icon: Download },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your profile, preferences, and security
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-600">
                Last synced {format(new Date(), "h:mm a")}
              </span>
            </div>
          </motion.header>

          {/* Mobile Tab Selector */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/60"
            >
              <div className="flex items-center gap-3">
                {(() => { 
                    const Icon = tabs.find(t => t.id === activeTab)?.icon;
                    return <Icon size={18} />;
                })()}
                <span className="font-medium text-gray-800">
                  {tabs.find(t => t.id === activeTab)?.label}
                </span>
              </div>
              <ChevronDown size={20} className={`transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/60 overflow-hidden"
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Desktop Sidebar Tabs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block lg:col-span-1"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 space-y-6"
            >

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setFormData({ name: user.name, email: user.email, role: user.role });
                            setIsEditing(false);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition">
                        <Camera size={16} />
                      </button>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{user?.name || "—"}</h3>
                      <p className="text-sm text-gray-600">{user?.email || "—"}</p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                        <Shield size={14} className="text-indigo-600" />
                        <span className="text-xs font-medium text-indigo-600 capitalize">{user?.role || "Admin"}</span>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                      <p className="text-xs text-gray-600">Total Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">${stats.totalExpenses.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Total Expenses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{stats.lastBooking}</p>
                      <p className="text-xs text-gray-600">Last Booking</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Tabs – Responsive */}
              {activeTab === "notifications" && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
                  {[
                    { id: "email", label: "Email Notifications", desc: "Receive updates via email" },
                    { id: "push", label: "Push Notifications", desc: "Get alerts on your device" },
                    { id: "booking", label: "New Booking Alerts", desc: "Notify on every new booking" },
                    { id: "expense", label: "Expense Alerts", desc: "Alert when expenses exceed budget" },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-600">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.id]}
                        onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </label>
                  ))}
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Appearance</h2>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-3">
                      <div className="flex items-center gap-3">
                        <Globe size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium">Language</p>
                          <p className="text-xs text-gray-600">English (US)</p>
                        </div>
                      </div>
                      <select className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg">
                        <option>English</option>
                        <option>Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Security</h2>
                  <button className="w-full text-left p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="font-medium text-amber-800">Change Password</p>
                    <p className="text-xs text-amber-700">Last changed 3 months ago</p>
                  </button>
                </div>
              )}

              {activeTab === "data" && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">Data & Export</h2>
                  <button className="flex flex-col sm:flex-row items-center sm:items-start justify-between w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition gap-3">
                    <div className="flex items-center gap-3">
                      <Download size={20} />
                      <div className="text-left">
                        <p className="font-medium">Export All Data</p>
                        <p className="text-xs opacity-90">Bookings, expenses, profile</p>
                      </div>
                    </div>
                    <Check size={20} />
                  </button>
                  <button className="flex flex-col sm:flex-row items-center sm:items-start justify-between w-full p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition gap-3">
                    <div className="flex items-center gap-3">
                      <Upload size={20} />
                      <div className="text-left">
                        <p className="font-medium">Import Data</p>
                        <p className="text-xs opacity-90">Restore from backup</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;