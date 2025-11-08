// src/pages/TrackBooking.jsx
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import StatusUpdater from "../../components/StatusUpdater";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import { useBooking } from "../../context/BookingContext";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Globe,
  Plane,
  Bus,
  Train,
  Car,
  Hotel,
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

const TrackBooking = () => {
  const { id } = useParams();
  const { bookings, updateBookingStatus, isLoading } = useBooking();

  const [booking, setBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const found = bookings.find((b) => b.id === id);
    setBooking(found || null);
    if (found) setSelectedStatus(found.status);
  }, [id, bookings]);

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowModal(true);
  };

  const confirmUpdate = () => {
    updateBookingStatus(id, selectedStatus);
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Booking not found</h2>
          <p className="text-gray-500 mt-2">
            The booking with ID <strong>{id}</strong> does not exist.
          </p>
          <Link
            to="/bookings"
            className="mt-6 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={18} />
            Back to All Bookings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = categoryIcons[booking.category] || Package;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ---------- Header ---------- */}
        <div className="flex items-center justify-between">
          <Link
            to="/bookings"
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Bookings</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Booking Details
          </h1>
        </div>

        {/* ---------- Main Card ---------- */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-8">

          {/* Booking ID + Category Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                Booking ID
              </h3>
              <p className="text-2xl font-bold text-gray-900">{booking.id}</p>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${categoryColors[booking.category] || "bg-gray-100 text-gray-700"}`}>
              <Icon size={18} />
              {booking.category?.charAt(0).toUpperCase() + booking.category?.slice(1)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ----- Customer Info ----- */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <User size={18} /> Customer
              </h4>
              <div className="pl-6 space-y-2 text-gray-700">
                <p><strong>{booking.customerName}</strong></p>
                <p className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {booking.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  {booking.contactNumber}
                </p>
              </div>
            </div>

            {/* ----- Travel Info ----- */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Calendar size={18} /> Travel Details
              </h4>
              <div className="pl-6 space-y-2 text-gray-700">
                 <p className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {format(new Date(booking.date), "dd MMM yyyy")}
                </p>
                <p className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-400" />
                  <span className="capitalize">
                    {platformLabels[booking.platform] || booking.platform || "—"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* ----- Revenue Breakdown ----- */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign size={18} /> Revenue Breakdown
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {/* Base Pay (Reference Only) */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <p className="text-gray-600">Base Pay (e.g. Flight Price)</p>
                <p className="font-bold text-indigo-700">
                  ₹{Number(booking.basePay || 0).toLocaleString()}
                </p>
              </div>

              {/* Commission Amount */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <p className="text-gray-600 flex items-center gap-1">
                  Commission <DollarSign size={14} />
                </p>
                <p className="font-bold text-emerald-700">
                  ₹{Number(booking.commissionAmount || 0).toLocaleString()}
                </p>
              </div>

              {/* Markup Amount */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <p className="text-gray-600 flex items-center gap-1">
                  Markup <TrendingUp size={14} />
                </p>
                <p className="font-bold text-purple-700">
                  ₹{Number(booking.markupAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                Total Revenue <span className="text-xs text-gray-500">(Commission + Markup)</span>
              </span>
              <span className="text-2xl font-bold text-indigo-800">
                ₹{Number(booking.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* ----- Status Section ----- */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">Current Status</span>
              <StatusBadge status={booking.status} />
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Update Status</h4>
              <StatusUpdater
                currentStatus={booking.status}
                onUpdate={handleStatusSelect}
              />
            </div>
          </div>
        </div>

        {/* ---------- Confirmation Modal ---------- */}
        <ConfirmModal
          isOpen={showModal}
          title="Confirm Status Change"
          message={`Change booking status from <strong>${booking.status}</strong> to <strong>${selectedStatus}</strong>?`}
          onConfirm={confirmUpdate}
          onCancel={() => setShowModal(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default TrackBooking;