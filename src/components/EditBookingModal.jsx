// src/components/EditBookingModal.jsx
import { useState, useEffect } from "react";
import { X, IndianRupee } from "lucide-react";

const EditBookingModal = ({ booking, onSave, onClose, darkMode = false, categoryIcons }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (booking) {
      setForm({
        customerName: booking.customerName || "",
        contactNumber: booking.contactNumber || "",
        category: booking.category || "flight",
        platform: booking.platform || "",
        date: booking.date ? new Date(booking.date).toISOString().split("T")[0] : "",
        basePay: booking.basePay ?? "",
        commissionAmount: booking.commissionAmount ?? "",
        markupAmount: booking.markupAmount ?? "",
        status: booking.status || "pending",
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const basePay = Number(form.basePay) || 0;
    const commission = Number(form.commissionAmount) || 0;
    const markup = Number(form.markupAmount) || 0;
    const totalRevenue = parseFloat((basePay + commission + markup).toFixed(2));
    const netProfit = parseFloat((commission + markup).toFixed(2));

    const updated = {
      ...booking,
      ...form,
      basePay,
      commissionAmount: commission,
      markupAmount: markup,
      totalRevenue,
      netProfit,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-3xl rounded-xl shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"} max-h-screen overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Edit Booking</h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Add all input fields here (same as AddBooking form) */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className={`px-4 py-2 rounded-lg font-medium transition ${darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;