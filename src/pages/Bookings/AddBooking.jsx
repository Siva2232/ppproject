// src/pages/AddBooking.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useBooking, CATEGORY, STATUS } from "../../context/BookingContext";
import { useWallet, WALLET_KEYS, PLATFORM } from "../../context/WalletContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, User, Mail, Calendar, IndianRupee, CheckCircle,
  Phone, Globe, Plane, Bus, Train, Car, Hotel, Clock, TrendingUp, ChevronDown, AlertCircle, Sparkles, ShieldCheck
} from "lucide-react";
import { format } from "date-fns";

const categories = [
  { value: CATEGORY.FLIGHT, label: "Flight", icon: Plane, color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: CATEGORY.BUS, label: "Bus", icon: Bus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { value: CATEGORY.TRAIN, label: "Train", icon: Train, color: "text-purple-500", bg: "bg-purple-500/10" },
  { value: CATEGORY.CAB, label: "Cab", icon: Car, color: "text-orange-500", bg: "bg-orange-500/10" },
  { value: CATEGORY.HOTEL, label: "Hotel", icon: Hotel, color: "text-pink-500", bg: "bg-pink-500/10" },
];

const platforms = [
  { value: "", label: "Select Platform" },
  { value: PLATFORM.ALHIND, label: "AlHind", walletKey: WALLET_KEYS.ALHIND },
  { value: PLATFORM.AKBAR, label: "Akbar", walletKey: WALLET_KEYS.AKBAR },
  { value: PLATFORM.DIRECT, label: "Direct", walletKey: null },
];

const countryCodes = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

export default function AddBooking() {
  const { addBooking } = useBooking();
  const { getWallet } = useWallet();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    contactNumber: "",
    selectedCountryCode: "+91",
    date: format(new Date(), "yyyy-MM-dd"),
    basePay: "",
    commissionAmount: "",
    markupAmount: "",
    platform: "",
    status: STATUS.PENDING,
    category: CATEGORY.FLIGHT,
  });

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [walletError, setWalletError] = useState("");

  const dropdownRef = useRef(null);

  const fullContact = `${form.selectedCountryCode} ${form.contactNumber}`.trim();
  const isDirect = form.platform === PLATFORM.DIRECT;
  const isConfirmed = form.status === STATUS.CONFIRMED;

  const formatBalance = (amount) => Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const platformBalance = useMemo(() => {
    if (!form.platform || isDirect) return null;
    const p = platforms.find(p => p.value === form.platform);
    return p?.walletKey ? getWallet(p.walletKey) : null;
  }, [form.platform, getWallet, isDirect]);

  const totalRevenue = useMemo(() => {
    const base = parseFloat(form.basePay) || 0;
    const comm = parseFloat(form.commissionAmount) || 0;
    const mark = parseFloat(form.markupAmount) || 0;
    return (base + comm + mark);
  }, [form.basePay, form.commissionAmount, form.markupAmount]);

  const netProfit = useMemo(() => {
    const base = parseFloat(form.basePay) || 0;
    const comm = parseFloat(form.commissionAmount) || 0;
    const mark = parseFloat(form.markupAmount) || 0;
    return isDirect ? (base + mark) : (comm + mark);
  }, [form.basePay, form.commissionAmount, form.markupAmount, isDirect]);

  const baseAmount = parseFloat(form.basePay) || 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.date) e.date = "Date is required";
    const digitsOnly = form.contactNumber.replace(/\D/g, "");
    if (digitsOnly.length < 10) e.contactNumber = "Min 10 digits required";
    if (form.basePay && Number(form.basePay) < 0) e.basePay = "Cannot be negative";
    
    if (isConfirmed && !isDirect && form.platform && platformBalance !== null) {
      if (platformBalance < baseAmount) {
        e.basePay = `Insufficient balance in ${form.platform}`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setWalletError("");
    try {
      const booking = {
        id: Date.now(),
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        contactNumber: fullContact,
        date: form.date,
        basePay: baseAmount,
        commissionAmount: parseFloat(form.commissionAmount) || 0,
        markupAmount: parseFloat(form.markupAmount) || 0,
        totalRevenue: totalRevenue,
        netProfit: netProfit,
        platform: form.platform || PLATFORM.DIRECT,
        status: form.status,
        category: form.category,
      };
      await addBooking(booking);
      setSuccess(true);
      setTimeout(() => navigate("/bookings"), 1200);
    } catch (err) {
      setWalletError(err.message || "Failed to add booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
          
          {/* Top Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex items-center justify-between mb-10"
          >
            <button 
              onClick={() => navigate("/bookings")} 
              className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-all font-bold text-sm uppercase tracking-widest"
            >
              <div className="p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                <ArrowLeft size={18} />
              </div>
              Back
            </button>
            <div className="text-right">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">New Booking</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Transaction System v2.0</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Main Form Section */}
            <div className="lg:col-span-2 space-y-6">
              
              <AnimatePresence>
                {walletError && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-2xl flex items-center gap-4 text-red-700 shadow-sm">
                    <AlertCircle className="shrink-0" />
                    <p className="text-sm font-bold">{walletError}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-500 text-white p-6 rounded-[2rem] flex flex-col items-center gap-2 text-center shadow-xl shadow-emerald-200">
                    <CheckCircle size={40} className="mb-2" />
                    <p className="text-lg font-black tracking-tight">Booking Secured Successfully</p>
                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Updating Ledger...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 sm:p-10"
              >
                <form onSubmit={handleSubmit} className="space-y-10">
                  
                  {/* Category Selection */}
                  <section>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 block">01. Service Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {categories.map((cat) => (
                        <label key={cat.value} className="relative cursor-pointer group">
                          <input type="radio" name="category" value={cat.value} checked={form.category === cat.value}
                            onChange={(e) => setForm({ ...form, category: e.target.value, platform: "" })} className="sr-only" />
                          <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${form.category === cat.value ? "border-indigo-600 bg-indigo-50/50 shadow-md translate-y-[-4px]" : "border-slate-50 hover:border-slate-200 hover:bg-slate-50"}`}>
                            <div className={`p-3 rounded-xl mb-3 ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                              <cat.icon size={24} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tight ${form.category === cat.value ? "text-indigo-600" : "text-slate-500"}`}>{cat.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </section>

                  {/* Customer Information */}
                  <section className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">02. Client Details</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                          className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all outline-none font-bold text-slate-800 text-sm placeholder:text-slate-400 border ${errors.customerName ? 'border-red-500' : ''}`} placeholder="Full Name" />
                      </div>
                      <div className="relative group">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all outline-none font-bold text-slate-800 text-sm placeholder:text-slate-400 border" placeholder="Email Address" />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative group flex-1" ref={dropdownRef}>
                        <div className="flex">
                          <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="flex items-center gap-2 px-5 py-4 bg-slate-100 rounded-l-2xl hover:bg-slate-200 transition text-sm font-black text-slate-700">
                            <span>{countryCodes.find(c => c.code === form.selectedCountryCode)?.flag}</span>
                            <span>{form.selectedCountryCode}</span>
                            <ChevronDown size={14} className={showCountryDropdown ? "rotate-180" : ""} />
                          </button>
                          <input type="text" value={form.contactNumber}
                            onChange={(e) => setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, "") })}
                            className="flex-1 px-5 py-4 rounded-r-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-800 text-sm placeholder:text-slate-400 border" placeholder="Phone Number" />
                        </div>
                        <AnimatePresence>
                          {showCountryDropdown && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2">
                              {countryCodes.map((c) => (
                                <button key={c.code} type="button"
                                  onClick={() => { setForm({ ...form, selectedCountryCode: c.code }); setShowCountryDropdown(false); }}
                                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-slate-50 rounded-xl transition text-xs font-bold text-slate-600">
                                  <span className="text-lg">{c.flag}</span>
                                  <span className="flex-1">{c.country}</span>
                                  <span className="text-slate-400">{c.code}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="relative group flex-1">
                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-800 text-sm border" />
                      </div>
                    </div>
                  </section>

                  {/* Financials */}
                  <section className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">03. Financial Logistics</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="relative group">
                          <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                            className="w-full pl-12 pr-10 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white appearance-none outline-none font-bold text-slate-800 text-sm border">
                            {platforms.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {platformBalance !== null && (
                          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex justify-between ${platformBalance < baseAmount ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                            <span>Wallet Balance</span>
                            <span>₹{formatBalance(platformBalance)}</span>
                          </div>
                        )}
                      </div>

                      <div className="relative group">
                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                          className="w-full pl-12 pr-10 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white appearance-none outline-none font-bold text-slate-800 text-sm border">
                          <option value={STATUS.PENDING}>Pending Confirmation</option>
                          <option value={STATUS.CONFIRMED}>Settled/Confirmed</option>
                          <option value={STATUS.CANCELLED}>Void/Cancelled</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter ml-2">Base Cost</label>
                        <div className="relative group">
                          <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="number" value={form.basePay} onChange={(e) => setForm({ ...form, basePay: e.target.value })}
                            className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 outline-none font-bold text-slate-800 text-sm border-transparent focus:bg-white border focus:border-indigo-500/20" placeholder="0.00" />
                        </div>
                      </div>
                      {!isDirect && (
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter ml-2">Agent Commission</label>
                          <div className="relative group">
                            <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="number" value={form.commissionAmount} onChange={(e) => setForm({ ...form, commissionAmount: e.target.value })}
                              className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 outline-none font-bold text-slate-800 text-sm border-transparent focus:bg-white border focus:border-indigo-500/20" placeholder="0.00" />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter ml-2">Profit Markup</label>
                        <div className="relative group">
                          <TrendingUp size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="number" value={form.markupAmount} onChange={(e) => setForm({ ...form, markupAmount: e.target.value })}
                            className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 outline-none font-bold text-slate-800 text-sm border-transparent focus:bg-white border focus:border-indigo-500/20" placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-10">
                    <button type="button" onClick={() => navigate("/bookings")}
                      className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition font-black text-xs uppercase tracking-widest disabled:opacity-50">
                      Abort
                    </button>
                    <button type="submit" disabled={submitting}
                      className="flex-[2] px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-slate-400">
                      {submitting ? "Processing Ledger..." : <><Plus size={18} /> Deploy Booking</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Sidebar Summary Section */}
            <div className="space-y-6 sticky top-8">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 overflow-hidden relative">
                
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Sparkles size={120} />
                </div>

                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-8">Summary Manifest</h3>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Receivable</span>
                    <span className="text-3xl font-black">₹{formatBalance(totalRevenue)}</span>
                  </div>
                  
                  <div className="h-px bg-white/10 w-full" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold opacity-70">Net Profit Yield</span>
                      <span className="font-black text-emerald-300">₹{formatBalance(netProfit)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold opacity-70">Platform Route</span>
                      <span className="font-black uppercase tracking-tighter">{platforms.find(p => p.value === form.platform)?.label || "Direct"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold opacity-70">Status Code</span>
                      <span className={`px-2 py-0.5 rounded-md font-black uppercase text-[9px] ${form.status === STATUS.CONFIRMED ? 'bg-emerald-400 text-emerald-900' : 'bg-amber-400 text-amber-900'}`}>
                        {form.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-4 mt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck size={16} className="text-emerald-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Verification</span>
                    </div>
                    <p className="text-[10px] font-bold opacity-60 leading-relaxed italic">
                      This transaction will be recorded in the global ledger. Ensure all client details match government ID before deployment.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Mini Help Card */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Clock size={20} />
                   </div>
                   <div>
                      <p className="text-xs font-black text-slate-800">Need Assistance?</p>
                      <p className="text-[10px] font-bold text-slate-400">Booking Support Desk</p>
                   </div>
                </div>
                <button className="w-full py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
                  Contact Tech Lead
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}