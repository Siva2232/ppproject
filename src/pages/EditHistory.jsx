// src/pages/EditHistory.jsx
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useBooking, STATUS } from "../context/BookingContext";
import { useWallet } from "../context/WalletContext";
import { format } from "date-fns";
import { 
  ArrowLeft, History, User, IndianRupee, Clock, Edit3, Wallet,
  Package, ArrowUp, ArrowDown, AlertCircle, CheckCircle
} from "lucide-react";

export default function EditHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookingById } = useBooking();
  const { transactions } = useWallet();

  const booking = getBookingById(id);
  if (!booking) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">Booking not found</div>
      </DashboardLayout>
    );
  }

  // === 1. Get Edit History from Booking ===
  const editHistory = (booking.editHistory || []).map(entry => ({
    ...entry,
    type: "edit",
    icon: Edit3,
    color: "bg-blue-100 text-blue-700",
    border: "border-blue-200",
    bg: "bg-blue-50",
  }));

  // === 2. Get Wallet Transactions for this Booking ===
  const walletTxns = transactions
    .filter(t => t.bookingId === id)
    .map(t => ({
      ...t,
      type: "wallet",
      icon: t.operation === "credit" ? ArrowUp : ArrowDown,
      color: t.operation === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
      border: t.operation === "credit" ? "border-emerald-200" : "border-red-200",
      bg: t.operation === "credit" ? "bg-emerald-50" : "bg-red-50",
      title: `${t.operation === "credit" ? "Credited" : "Debited"} ${t.walletKey.toUpperCase()}`,
      amount: t.amount,
      action: t.action || (t.operation === "credit" ? "add" : "deduct"),
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // === 3. Combine & Sort All Events ===
  const allEvents = [...editHistory, ...walletTxns]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              History – {booking.customerName}
            </h1>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package size={20} className="text-indigo-600" />
              <h2 className="text-lg font-semibold">Booking Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-500" />
                <span className="font-medium">{booking.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <span>{format(new Date(booking.date), "dd MMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee size={16} className="text-gray-500" />
                <span className="font-semibold">₹{booking.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-gray-500" />
                <span className="capitalize">{booking.platform || "Direct"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className={`${
                  booking.status === STATUS.CONFIRMED ? "text-emerald-600" :
                  booking.status === STATUS.CANCELLED ? "text-red-600" : "text-amber-600"
                }`} />
                <span className="font-medium">
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History size={20} />
              Full Change Timeline
            </h2>

            {allEvents.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                <Edit3 size={56} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No changes recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-4 p-5 rounded-2xl border ${event.bg} ${event.border} transition-all hover:shadow-md`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${event.color}`}>
                        <event.icon size={22} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Title + Time */}
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-800">
                          {event.type === "wallet" ? event.title : "Booking Edited"}
                        </p>
                        <span className="text-xs text-gray-500 ml-4">
                          {format(new Date(event.timestamp), "dd MMM yyyy – h:mm a")}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          by <span className="font-medium">{event.user || "Unknown"}</span>
                          {event.action && <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">{event.action}</span>}
                        </p>

                        {event.type === "wallet" && (
                          <p className="font-medium text-lg">
                            {event.operation === "credit" ? "+" : "-"}₹{event.amount.toFixed(2)}
                          </p>
                        )}

                        {event.field && (
                          <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 text-xs">
                            <p className="font-medium text-gray-700">Field Changed:</p>
                            <p>
                              <span className="font-medium">{event.field}</span>
                              {event.oldValue && (
                                <>
                                  {" "}from <code className="bg-gray-100 px-1 rounded">{event.oldValue}</code>
                                </>
                              )}
                              {event.newValue && (
                                <>
                                  {" "}to <code className="bg-blue-100 px-1 rounded text-blue-700">{event.newValue}</code>
                                </>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}