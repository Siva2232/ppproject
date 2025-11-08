// src/pages/Notification.jsx
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, Clock, XCircle, AlertCircle, Info } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const Notification = () => {
  const { notifications, markAsRead, clearAll, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const format = (ts) => {
    const now = new Date();
    const t = new Date(ts);
    const diff = now - t;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return t.toLocaleDateString();
  };

  const getNotificationStyles = (type, read) => {
    let Icon, iconBg, dotColor;
    if (read) {
      Icon = Info;
      iconBg = "bg-gray-100";
    } else {
      switch (type) {
        case "success":
          Icon = CheckCircle;
          iconBg = "bg-gradient-to-br from-emerald-500 to-teal-600";
          dotColor = "bg-emerald-600";
          break;
        case "warning":
          Icon = AlertCircle;
          iconBg = "bg-gradient-to-br from-amber-500 to-orange-600";
          dotColor = "bg-amber-600";
          break;
        case "info":
          Icon = Info;
          iconBg = "bg-gradient-to-br from-indigo-500 to-purple-600";
          dotColor = "bg-indigo-600";
          break;
        default:
          Icon = Bell;
          iconBg = "bg-gradient-to-br from-gray-500 to-gray-600";
          dotColor = "bg-gray-600";
      }
    }
    return { Icon, iconBg, dotColor };
  };

  const getItemBg = (type, read) => {
    if (read) return "bg-white/50";
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-emerald-50/50 to-teal-50/50";
      case "warning":
        return "bg-gradient-to-r from-amber-50/50 to-orange-50/50";
      case "info":
        return "bg-gradient-to-r from-indigo-50/50 to-purple-50/50";
      default:
        return "bg-gradient-to-r from-gray-50/50 to-gray-100/50";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell size={28} className="text-indigo-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
            </div>

            {notifications.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <XCircle size={16} /> Clear All
              </motion.button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No notifications yet.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="divide-y divide-gray-200/50">
                  {notifications.map((n) => {
                    const type = n.type || "info";
                    const read = n.read;
                    const { Icon, iconBg, dotColor } = getNotificationStyles(type, read);
                    const itemBg = getItemBg(type, read);

                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 transition-all ${itemBg} hover:bg-gray-50/70 cursor-pointer`}
                        onClick={() => {
                          if (!read) markAsRead(n.id);
                          navigate("/tasks");
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${iconBg}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${read ? "text-gray-600" : "text-gray-800"}`}>
                              {n.message}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />{format(n.timestamp)}
                              </span>
                              {!read && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                          {!read && <div className={`w-2 h-2 rounded-full animate-pulse ${dotColor}`} />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Notification;