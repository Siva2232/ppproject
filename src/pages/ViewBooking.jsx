// src/pages/ViewBooking.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import { useBooking } from "../context/BookingContext";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Phone, Mail, Calendar, Globe, DollarSign, 
  TrendingUp, Package, Copy, Plane, Bus, Train, 
  Car, Hotel, ExternalLink, ShieldCheck, Hash, User
} from "lucide-react";

const categoryIcons = {
  flight: Plane,
  bus: Bus,
  train: Train,
  cab: Car,
  hotel: Hotel,
};

const categoryColors = {
  flight: "bg-blue-500/10 text-blue-600",
  bus: "bg-emerald-500/10 text-emerald-600",
  train: "bg-violet-500/10 text-violet-600",
  cab: "bg-amber-500/10 text-amber-600",
  hotel: "bg-rose-500/10 text-rose-600",
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

  const safeNumber = (v) => (isNaN(Number(v)) ? 0 : Number(v));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Record Lost</h2>
          <p className="text-slate-500 mt-2 font-medium">Booking ID #{id?.slice(0, 8)} could not be located in our archives.</p>
          <button onClick={() => navigate("/bookings")} className="mt-8 px-8 py-3 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs">
            Back to Database
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = categoryIcons[booking.category] || Package;
  const totalRevenue = safeNumber(booking.basePay) + safeNumber(booking.commissionAmount) + safeNumber(booking.markupAmount);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Detail</p>
              <h1 className="text-xl font-black text-slate-900 uppercase">Booking Archive</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Customer & Booking Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Visual Header */}
                <div className="p-8 border-b border-slate-50 flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${categoryColors[booking.category]}`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        {booking.category} Reservation
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                      {booking.customerName}
                    </h2>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Hash size={14} className="text-indigo-500" />
                      <span className="font-mono text-xs font-bold">{booking.id}</span>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} size="lg" />
                </div>

                {/* Details Grid */}
                <div className="p-8 grid grid-cols-2 gap-y-8 gap-x-4">
                  <DetailItem icon={<Mail className="text-indigo-500"/>} label="Email Address" value={booking.email} />
                  <DetailItem 
                    icon={<Phone className="text-emerald-500"/>} 
                    label="Contact" 
                    value={booking.contactNumber} 
                    isCopyable 
                    onCopy={() => copyToClipboard(booking.contactNumber)}
                    copied={copied}
                  />
                  <DetailItem icon={<Calendar className="text-orange-500"/>} label="Service Date" value={booking.date ? format(new Date(booking.date), "PPP") : "—"} />
                  <DetailItem icon={<Globe className="text-purple-500"/>} label="Platform" value={booking.platform?.toUpperCase() || "DIRECT"} />
                </div>
              </motion.div>

              {/* Additional Log/Note Section */}
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-xl shadow-indigo-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold opacity-80">Verified Transaction</p>
                    <p className="text-[11px] uppercase tracking-widest font-black opacity-60">System Security: Level A</p>
                  </div>
                </div>
                <ExternalLink size={20} className="opacity-40" />
              </div>
            </div>

            {/* RIGHT COLUMN: Financials (The "Receipt") */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                {/* Decorative circles to look like a punched receipt */}
                <div className="absolute -bottom-3 left-0 right-0 flex justify-around px-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-[#F8FAFC]" />
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-8 opacity-60">
                  <DollarSign size={16} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Financial Summary</span>
                </div>

                <div className="space-y-6">
                  <PriceRow label="Base Pay" amount={booking.basePay} />
                  <PriceRow label="Commission" amount={booking.commissionAmount} accent="text-emerald-400" />
                  <PriceRow label="Markup" amount={booking.markupAmount} accent="text-indigo-400" />
                  
                  <div className="pt-6 border-t border-slate-800 mt-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Receivable</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-slate-400">₹</span>
                      <span className="text-4xl font-black tracking-tighter">{totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Payment cleared</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(-1)}
                className="w-full py-5 rounded-[2rem] bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all shadow-sm"
              >
                Exit Record
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* Helper Components for cleaner code */
function DetailItem({ icon, label, value, isCopyable, onCopy, copied }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-slate-800">{value || "—"}</p>
        {isCopyable && value && (
          <button onClick={onCopy} className="p-1 hover:bg-slate-100 rounded-md transition-all">
            <Copy size={12} className={copied ? "text-emerald-500" : "text-slate-300"} />
          </button>
        )}
      </div>
    </div>
  );
}

function PriceRow({ label, amount, accent = "text-white" }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <span className={`text-sm font-black ${accent}`}>₹{Number(amount || 0).toLocaleString()}</span>
    </div>
  );
}