// src/pages/ViewBooking.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import { useBooking } from "../context/BookingContext";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  Globe, 
  DollarSign, 
  TrendingUp,
  Package,
  Copy,
  Plane,
  Bus,
  Train,
  Car,
  Hotel
} from "lucide-react";

const categoryIcons = {
  flight: Plane,
  bus: Bus,
  train: Train,
  cab: Car,
  hotel: Hotel,
};

const categoryColors = {
  flight: "bg-blue-100 text-blue-700",
  bus: "bg-emerald-100 text-emerald-700",
  train: "bg-purple-100 text-purple-700",
  cab: "bg-orange-100 text-orange-700",
  hotel: "bg-pink-100 text-pink-700",
};

const platformLabels = {
  makemytrip: "MakeMyTrip",
  goibibo: "Goibibo",
  yatra: "Yatra",
  cleartrip: "ClearTrip",
  expedia: "Expedia",
  bookingcom: "Booking.com",
  agoda: "Agoda",
  direct: "Direct",
  other: "Other",
};

export default function ViewBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, isLoading } = useBooking();
  const [copied, setCopied] = useState(false);

  const booking = bookings.find(b => b.id === id);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe number conversion with fallback
  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Booking Not Found</h2>
          <p className="text-gray-500 mt-2">The booking with ID #{id} does not exist.</p>
          <button
            onClick={() => navigate("/bookings")}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
          >
            Back to Bookings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = categoryIcons[booking.category] || Package;

  // Safely extract revenue fields
  const baseAmount = safeNumber(booking.baseAmount);
  const commissionAmount = safeNumber(booking.commissionAmount);
  const markupAmount = safeNumber(booking.markupAmount);
  const totalRevenue = baseAmount + commissionAmount + markupAmount;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              <ArrowLeft size={22} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Booking Details
            </h1>
            <div className="w-20" />
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
          >
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Booking ID</p>
                  <p className="text-2xl font-bold font-mono">#{booking.id}</p>
                </div>
                <div className={`p-3 rounded-full ${categoryColors[booking.category]} shadow-lg`}>
                  <Icon size={32} />
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Customer Name</p>
                    <p className="text-xl font-bold text-gray-900">{booking.customerName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email</p>
                    <p className="text-lg flex items-center gap-2">
                      <Mail size={18} className="text-indigo-600" />
                      {booking.email || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Contact Number</p>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Phone size={18} className="text-emerald-600" />
                      {booking.contactNumber || "—"}
                      {booking.contactNumber && (
                        <button
                          onClick={() => copyToClipboard(booking.contactNumber)}
                          className="p-1.5 rounded-full hover:bg-indigo-100 transition"
                          title="Copy number"
                        >
                          <Copy size={16} className={copied ? "text-emerald-600" : "text-gray-500"} />
                        </button>
                      )}
                      {copied && <span className="text-xs text-emerald-600 ml-1">Copied!</span>}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Travel Type</p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${categoryColors[booking.category] || "bg-gray-100 text-gray-700"}`}>
                      <Icon size={18} />
                      {booking.category ? booking.category.charAt(0).toUpperCase() + booking.category.slice(1) : "—"}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Platform</p>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Globe size={18} className="text-purple-600" />
                      {platformLabels[booking.platform] || booking.platform || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Travel/Check-in Date</p>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Calendar size={18} className="text-orange-600" />
                      {booking.date ? format(new Date(booking.date), "dd MMMM yyyy") : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200">
                <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
                  <DollarSign size={24} /> Revenue Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Base Amount</span>
                    <span className="font-bold text-indigo-700">₹{baseAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Commission</span>
                    <span className="font-bold text-emerald-700">₹{commissionAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700 flex items-center gap-1">
                      Markup <TrendingUp size={16} className="text-purple-600" />
                    </span>
                    <span className="font-bold text-purple-700">₹{markupAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t-2 border-indigo-300 pt-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-indigo-900">Total Revenue</span>
                      <span className="text-3xl font-bold text-indigo-800">
                        ₹{totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center pt-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Booking Status</p>
                  <div className="mt-2">
                    <StatusBadge status={booking.status || "unknown"} size="lg" />
                  </div>
                </div>
                <button
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}