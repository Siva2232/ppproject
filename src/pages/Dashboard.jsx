import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useBooking, STATUS } from "../context/BookingContext";
import { useFunds } from "../context/FundsContext";
import { useExpense } from "../context/ExpenseContext";
import { useAuth } from "../context/AuthContext";
import {
  TrendingUp, Calendar, Activity,
  Download, Search, Clock, UserCheck, FileText,
  ArrowUpRight, ArrowDownRight, AlertTriangle,
  Moon, Sun, IndianRupee, BellOff
} from "lucide-react";
import { motion } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
} from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { bookings = [], isLoading: bookingsLoading } = useBooking();
  const { expenses = [] } = useExpense();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  /* ────────────────────── DYNAMIC DATE PERIODS ────────────────────── */
  const now = new Date();

  const currentPeriod = useMemo(() => {
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }, []);

  const previousPeriod = useMemo(() => {
    const prev = subMonths(now, 1);
    return { start: startOfMonth(prev), end: endOfMonth(prev) };
  }, []);

  const filterByRange = (items, range) =>
    items.filter(item => {
      const d = new Date(item.date);
      return isWithinInterval(d, { start: range.start, end: range.end });
    });

  const currentBookings   = filterByRange(bookings, currentPeriod);
  const previousBookings  = filterByRange(bookings, previousPeriod);
  const currentExpenses   = filterByRange(expenses, currentPeriod);
  const previousExpenses  = filterByRange(expenses, previousPeriod);

  const currentExpenseTotal = currentExpenses.reduce((s, e) => s + e.amount, 0);
  const prevExpenseTotal    = previousExpenses.reduce((s, e) => s + e.amount, 0);

  /* ────────────────────── LIVE CLOCK ────────────────────── */
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentConfirmedBookings = currentBookings.filter(b => b.status === STATUS.CONFIRMED);
  const previousConfirmedBookings = previousBookings.filter(b => b.status === STATUS.CONFIRMED);

  const currentStats = useMemo(() => {
    const totalRevenue = currentConfirmedBookings.reduce((s, b) => s + (b.totalRevenue || 0), 0);
    const totalBaseAmount = currentConfirmedBookings.reduce((s, b) => s + (b.basePay || 0), 0);
    const totalNetProfit = currentConfirmedBookings.reduce((s, b) => s + (b.netProfit || 0), 0);
    const count = currentConfirmedBookings.length;
    const avgRevenue = count > 0 ? totalRevenue / count : 0;
    const highestRevenue = currentConfirmedBookings.reduce((m, b) => Math.max(m, b.totalRevenue || 0), 0);
    return { totalRevenue, totalBaseAmount, totalNetProfit, count, avgRevenue: Math.round(avgRevenue), highestRevenue };
  }, [currentConfirmedBookings]);

  const previousStats = useMemo(() => {
    const totalRevenue = previousConfirmedBookings.reduce((s, b) => s + (b.totalRevenue || 0), 0);
    const totalBaseAmount = previousConfirmedBookings.reduce((s, b) => s + (b.basePay || 0), 0);
    const totalNetProfit = previousConfirmedBookings.reduce((s, b) => s + (b.netProfit || 0), 0);
    const count = previousConfirmedBookings.length;
    const avgRevenue = count > 0 ? totalRevenue / count : 0;
    const highestRevenue = previousConfirmedBookings.reduce((m, b) => Math.max(m, b.totalRevenue || 0), 0);
    return { totalRevenue, totalBaseAmount, totalNetProfit, count, avgRevenue: Math.round(avgRevenue), highestRevenue };
  }, [previousConfirmedBookings]);

  const currentNetProfit = currentStats.totalNetProfit - currentExpenseTotal;
  const previousNetProfit = previousStats.totalNetProfit - prevExpenseTotal;

  /* ────────────────────── TREND CALCULATOR (FIXED FOR EXPENSES) ────────────────────── */
  const calcTrend = (cur, prev, isGoodWhenIncrease = true) => {
    if (prev === 0 || prev == null) {
      return { value: "N/A", change: 0, isPositive: false, directionUp: false };
    }
    const changePercent = ((cur - prev) / prev) * 100;
    const directionUp = changePercent >= 0;
    const isPositive = isGoodWhenIncrease ? changePercent >= 0 : changePercent <= 0;
    const value = changePercent >= 0 ? `+${changePercent.toFixed(1)}%` : `${changePercent.toFixed(1)}%`;
    return { value, change: Math.abs(changePercent), isPositive, directionUp };
  };

  const trends = {
    bookings: calcTrend(currentStats.count, previousStats.count),
    revenue: calcTrend(currentStats.totalRevenue, previousStats.totalRevenue),
    base: calcTrend(currentStats.totalBaseAmount, previousStats.totalBaseAmount),
    avgBooking: calcTrend(currentStats.avgRevenue, previousStats.avgRevenue),
    expenses: calcTrend(currentExpenseTotal, prevExpenseTotal, false), // decrease = good
    profit: calcTrend(currentNetProfit, previousNetProfit),
    highest: currentStats.highestRevenue > previousStats.highestRevenue
      ? { value: "New Record", change: 100, isPositive: true, directionUp: true }
      : { value: "–", change: 0, isPositive: false, directionUp: false },
  };

  const stats = [
    { title: "Total Bookings", value: currentStats.count, trend: trends.bookings, icon: Calendar, gradient: "from-violet-500 to-purple-600" },
    { title: "Total Revenue", value: `₹${currentStats.totalRevenue.toLocaleString()}`, trend: trends.revenue, icon: IndianRupee, gradient: "from-emerald-500 to-teal-600" },
    { title: "Base Amount Total", value: `₹${currentStats.totalBaseAmount.toLocaleString()}`, trend: trends.base, icon: IndianRupee, gradient: "from-cyan-500 to-blue-600" },
    { title: "Avg Revenue", value: `₹${currentStats.avgRevenue.toLocaleString()}`, trend: trends.avgBooking, icon: TrendingUp, gradient: "from-cyan-500 to-blue-600" },
    { title: "Highest Revenue", value: `₹${currentStats.highestRevenue.toLocaleString()}`, trend: trends.highest, icon: AlertTriangle, gradient: "from-amber-500 to-orange-600" },
    {
      title: "Total Expenses",
      value: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(currentExpenseTotal),
      trend: trends.expenses,
      icon: IndianRupee,
      gradient: "from-rose-500 to-red-600",
    },
    { 
      title: "Net Profit", 
      value: `₹${currentNetProfit.toLocaleString()}`, 
      trend: trends.profit, 
      icon: Activity, 
      gradient: currentNetProfit >= 0 ? "from-lime-500 to-green-600" : "from-orange-500 to-red-600" 
    },
  ];

  /* ────────────────────── FILTERED BOOKINGS ────────────────────── */
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch =
        b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || (b.status?.toLowerCase() === filterStatus.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [bookings, searchTerm, filterStatus]);

  const recentBookings = filteredBookings.slice(0, 5);

  /* ────────────────────── TOP SOURCES ────────────────────── */
  const topSources = useMemo(() => {
    const grouped = bookings.reduce((acc, b) => {
      const name = b.customerName || 'Unknown';
      if (!acc[name]) acc[name] = { name, bookings: 0, revenue: 0 };
      acc[name].bookings += 1;
      acc[name].revenue += (b.totalRevenue || 0);
      return acc;
    }, {});
    const sorted = Object.values(grouped)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
    return sorted.map((s, i) => ({ ...s, fill: colors[i] || '#6366f1' }));
  }, [bookings]);

  /* ────────────────────── CHART DATA (12 MONTHS DYNAMIC) ────────────────────── */
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(now, i);
      months.push({
        month: format(date, 'MMM yy'),
        revenue: 0,
        netProfit: 0,
        expense: 0
      });
    }

    bookings.forEach(b => {
      if (b.date && b.status === STATUS.CONFIRMED) {
        const d = new Date(b.date);
        const monthKey = format(d, 'MMM yy');
        const idx = months.findIndex(m => m.month === monthKey);
        if (idx !== -1) {
          months[idx].revenue += (b.totalRevenue || 0);
          months[idx].netProfit += (b.netProfit || 0);
        }
      }
    });

    expenses.forEach(e => {
      if (e.date) {
        const d = new Date(e.date);
        const monthKey = format(d, 'MMM yy');
        const idx = months.findIndex(m => m.month === monthKey);
        if (idx !== -1) {
          months[idx].expense += (e.amount || 0);
        }
      }
    });

    return months.map(m => ({
      month: m.month,
      revenue: m.revenue,
      expense: -m.expense,
      profit: m.netProfit - m.expense
    }));
  }, [bookings, expenses]);

  const gridStroke = darkMode ? "#374151" : "#f1f5f9";
  const refStroke = darkMode ? "#6b7280" : "#9ca3af";

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <DashboardLayout>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50"}`}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

          {/* HEADER */}
          <motion.header
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border transition-colors duration-700 ${
              darkMode
                ? "bg-slate-950 border-white/5"
                : "bg-gradient-to-br from-indigo-700 via-blue-600 to-violet-800 border-indigo-400/20"
            }`}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[100px] animate-pulse transition-colors duration-1000 ${
                darkMode ? "bg-indigo-500/20" : "bg-white/30"
              }`} />
              <div className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[100px] transition-colors duration-1000 ${
                darkMode ? "bg-purple-500/20" : "bg-blue-400/20"
              }`} />
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-end lg:items-center gap-8">
              <div className="space-y-6 w-full lg:w-auto">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 w-fit">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    System Operational • {format(time, "EEE, MMM do")}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-inner">
                      <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white italic">
                      {user?.name?.split(" ")[0] || "Chief"}
                      <span className="font-light not-italic opacity-70">.dashboard</span>
                    </h1>
                  </div>
                  <p className="text-lg lg:text-xl text-white/60 font-medium pl-1">
                    Everything is looking <span className="text-white underline underline-offset-4 decoration-emerald-400/50">great</span> today.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-4 bg-black/20 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/5">
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase tracking-tighter text-white/40 font-bold">Net Profit</p>
                      <p className="text-xl font-mono font-bold text-white leading-none">
                        ₹{currentNetProfit.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase tracking-tighter text-white/40 font-bold">Status</p>
                      <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                        Stable <ArrowUpRight size={14} />
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <button className="flex-1 lg:flex-none group relative flex items-center justify-center gap-3 px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-white/10 transform hover:-translate-y-1 transition-all duration-300">
                  <Download size={20} className="group-hover:rotate-12 transition-transform" />
                  <span>Export Insights</span>
                </button>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/20 transition-all group"
                >
                  {darkMode ? (
                    <Sun size={24} className="text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
                  ) : (
                    <Moon size={24} className="text-white group-hover:-rotate-12 transition-transform duration-500" />
                  )}
                </button>
              </div>
            </div>
          </motion.header>

          {/* STATS CARDS (NOW FULLY TRACKING WITH CORRECT TRENDS) */}
         {/* STATS CARDS - NEW LAYOUT: 4 cards top row, 3 cards bottom row on large screens */}
<div className="space-y-8">
  {/* Top Row: 4 Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.slice(0, 4).map((stat, i) => (
      <motion.div
        key={stat.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
        whileHover={{ y: -5 }}
        className="group relative min-w-0"
      >
        {/* Glow Effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-br ${stat.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur transition duration-500`} />

        <div className={`relative min-h-[180px] flex flex-col overflow-hidden rounded-[2rem] p-5 shadow-sm border transition-all duration-300 ${
          darkMode
            ? "bg-gray-800/40 backdrop-blur-md border-gray-700/50 text-white"
            : "bg-white border-slate-100 shadow-slate-200/50"
        } hover:shadow-2xl group-hover:border-transparent`}>
          
          {/* Background Icon */}
          <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
            <stat.icon size={80} strokeWidth={1} />
          </div>

          {/* Icon + Trend */}
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
              <stat.icon size={20} />
            </div>
            
            {stat.trend && stat.trend.value !== "–" && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold tracking-tight ${
                stat.trend.value === "New Record" 
                  ? "bg-amber-100 text-amber-600 ring-1 ring-amber-200" 
                  : stat.trend.isPositive 
                    ? "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200" 
                    : "bg-rose-100 text-rose-600 ring-1 ring-rose-200"
              }`}>
                {stat.trend.directionUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend.value}
              </div>
            )}
          </div>

          {/* Title + Value + Growth */}
          <div className="mt-auto relative z-10">
            <p className={`text-[11px] font-bold uppercase tracking-[0.1em] mb-2 ${
              darkMode ? "text-gray-400" : "text-slate-500"
            }`}>
              {stat.title}
            </p>
            
            {/* Responsive value - no truncate, wraps if needed */}
            <p className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-black tracking-tight leading-tight break-words">
              {stat.value}
            </p>

            {/* Growth Bar */}
            {stat.trend && stat.trend.change > 0 && stat.trend.value !== "New Record" && (
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold opacity-60">
                  <span>Growth</span>
                  <span>{Math.round(stat.trend.change)}%</span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-slate-100"
                }`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stat.trend.change, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      stat.trend.isPositive
                        ? "from-emerald-400 to-teal-500"
                        : "from-rose-400 to-red-500"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    ))}
  </div>

  {/* Bottom Row: 3 Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {stats.slice(4, 7).map((stat, i) => (
      <motion.div
        key={stat.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (i + 4) * 0.05, duration: 0.4, ease: "easeOut" }}
        whileHover={{ y: -5 }}
        className="group relative min-w-0"
      >
        {/* Glow Effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-br ${stat.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur transition duration-500`} />

        <div className={`relative min-h-[180px] flex flex-col overflow-hidden rounded-[2rem] p-5 shadow-sm border transition-all duration-300 ${
          darkMode
            ? "bg-gray-800/40 backdrop-blur-md border-gray-700/50 text-white"
            : "bg-white border-slate-100 shadow-slate-200/50"
        } hover:shadow-2xl group-hover:border-transparent`}>
          
          {/* Background Icon */}
          <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
            <stat.icon size={80} strokeWidth={1} />
          </div>

          {/* Icon + Trend */}
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
              <stat.icon size={20} />
            </div>
            
            {stat.trend && stat.trend.value !== "–" && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold tracking-tight ${
                stat.trend.value === "New Record" 
                  ? "bg-amber-100 text-amber-600 ring-1 ring-amber-200" 
                  : stat.trend.isPositive 
                    ? "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200" 
                    : "bg-rose-100 text-rose-600 ring-1 ring-rose-200"
              }`}>
                {stat.trend.directionUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend.value}
              </div>
            )}
          </div>

          {/* Title + Value + Growth */}
          <div className="mt-auto relative z-10">
            <p className={`text-[11px] font-bold uppercase tracking-[0.1em] mb-2 ${
              darkMode ? "text-gray-400" : "text-slate-500"
            }`}>
              {stat.title}
            </p>
            
            <p className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-black tracking-tight leading-tight break-words">
              {stat.value}
            </p>

            {stat.trend && stat.trend.change > 0 && stat.trend.value !== "New Record" && (
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold opacity-60">
                  <span>Growth</span>
                  <span>{Math.round(stat.trend.change)}%</span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-slate-100"
                }`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stat.trend.change, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      stat.trend.isPositive
                        ? "from-emerald-400 to-teal-500"
                        : "from-rose-400 to-red-500"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
</div>

          {/* CHART + RECENT ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`lg:col-span-2 rounded-2xl shadow-xl overflow-hidden ${
                darkMode ? "bg-gray-800" : "bg-white/80"
              } border ${darkMode ? "border-gray-700" : "border-gray-100"}`}
            >
              <div className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Revenue Trend</h2>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Revenue (+), Expenses (-) & Net Profit Over Time</p>
                  </div>
                  <select className={`px-4 py-2 text-sm rounded-xl border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200"
                  } focus:ring-2 focus:ring-indigo-500`}>
                    <option>Last 12 months</option>
                    <option>Last 6 months</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: darkMode ? "#9ca3af" : "#64748b" }} />
                      <YAxis tick={{ fontSize: 12, fill: darkMode ? "#9ca3af" : "#64748b" }} allowDecimals={false} />
                      <ReferenceLine y={0} stroke={refStroke} strokeDasharray="3 3" />
                      <Tooltip
                        formatter={(value, name) => {
                          const label = name === 'revenue' ? 'Revenue' : name === 'expense' ? 'Expenses' : 'Net Profit';
                          const sign = name === 'expense' ? '-' : '';
                          return [`₹${Math.abs(Number(value)).toLocaleString()}`, `${sign}${label}`];
                        }}
                        contentStyle={{
                          backgroundColor: darkMode ? "#1f2937" : "#f8fafc",
                          border: `1px solid ${darkMode ? "#374151" : "#e2e8f0"}`,
                          borderRadius: "8px"
                        }}
                        labelStyle={{ color: darkMode ? "#ffffff" : "#374151" }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: darkMode ? "#9ca3af" : "#64748b" }} />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue" dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} name="Expenses" dot={{ fill: "#ef4444", r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Net Profit" strokeDasharray="5 5" dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              className={`relative rounded-[2.5rem] shadow-2xl p-7 overflow-hidden transition-all duration-500 ${
                darkMode 
                  ? "bg-slate-900/90 border-slate-700/50 backdrop-blur-2xl" 
                  : "bg-white/90 border-slate-100 backdrop-blur-xl"
              } border`}
            >
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 ${darkMode ? 'bg-indigo-500' : 'bg-indigo-300'}`} />

              <div className="relative flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                    Live <span className="text-indigo-500">Activity</span>
                  </h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    Real-time transaction log
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                  {recentBookings.length} total
                </div>
              </div>

              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                {recentBookings.length > 0 ? (
                  recentBookings.map((b) => {
                    const isHighValue = b.totalRevenue >= 50000;
                    const isConfirmed = b.status === STATUS.CONFIRMED;

                    return (
                      <motion.div
                        key={b.id}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className={`group relative flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 border ${
                          darkMode 
                            ? "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-indigo-500/50" 
                            : "bg-slate-50 border-transparent hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5"
                        }`}
                      >
                        <div className="relative">
                          <div className={`p-3 rounded-2xl shrink-0 transition-transform group-hover:rotate-12 ${
                            isConfirmed 
                              ? "bg-emerald-500/10 text-emerald-500" 
                              : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {isConfirmed ? <UserCheck size={18} strokeWidth={2.5} /> : <Clock size={18} strokeWidth={2.5} />}
                          </div>
                          {isConfirmed && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-black truncate tracking-tight ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                            {b.customerName}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                              ID: #{b.id.slice(-6)}
                            </span>
                            <span className={`w-1 h-1 rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-200"}`} />
                            <span className={`text-[10px] font-black uppercase ${isConfirmed ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {b.status}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex flex-col items-end gap-1">
                            <p className={`text-sm font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                              ₹{Number(b.totalRevenue).toLocaleString()}
                            </p>
                            {isHighValue && (
                              <motion.span 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="px-2 py-0.5 text-[9px] font-black bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-500/40"
                              >
                                PREMIUM
                              </motion.span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-40">
                    <div className={`p-4 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <BellOff size={24} />
                    </div>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      No Recent Activity
                    </p>
                  </div>
                )}
              </div>

              <button className={`w-full mt-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                darkMode 
                  ? "bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white" 
                  : "bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white"
              }`}>
                Access Archives
              </button>
            </motion.div>
          </div>

          {/* BOTTOM ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Bookings Table */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-[2rem] shadow-2xl overflow-hidden border transition-all duration-500 ${
                darkMode ? "bg-slate-900/50 backdrop-blur-xl border-white/10" : "bg-white border-slate-100"
              }`}
            >
              <div className={`p-6 lg:p-8 border-b ${darkMode ? "border-white/5" : "border-slate-50"}`}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <h3 className={`text-2xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                      Recent Bookings
                    </h3>
                    <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      Transaction Registry
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <div className="relative group flex-1 min-w-[240px]">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search by ID or customer..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={`pl-12 pr-4 py-3 w-full text-sm font-medium rounded-2xl border transition-all ${
                          darkMode
                            ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:bg-white/10"
                            : "bg-slate-50 border-slate-100 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/5"
                        } outline-none border-transparent focus:border-indigo-500/50`}
                      />
                    </div>
                    
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-2xl border cursor-pointer outline-none transition-all ${
                        darkMode
                          ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                          : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={darkMode ? "bg-white/5" : "bg-slate-50/50"}>
                      {["ID", "Customer", "Date", "Base Pay", "Revenue", "Status"].map((h) => (
                        <th key={h} className={`px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? "divide-white/5" : "divide-slate-50"}`}>
                    {bookingsLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6} className="px-8 py-6">
                            <div className={`h-6 w-full ${darkMode ? "bg-white/5" : "bg-slate-100"} rounded-xl animate-pulse`} />
                          </td>
                        </tr>
                      ))
                    ) : recentBookings.length > 0 ? (
                      recentBookings.map((b) => (
                        <tr key={b.id} className="group hover:bg-indigo-500/[0.02] transition-colors">
                          <td className="px-8 py-5">
                            <span className="font-mono text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg">
                              {b.id.substring(0, 8)}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{b.customerName}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-medium">Verified User</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-xs font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                              {format(new Date(b.date), "MMM d, yyyy")}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                              ₹{Number(b.basePay || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-sm font-black ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                              ₹{Number(b.totalRevenue || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right lg:text-left">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                              b.status === STATUS.CONFIRMED
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${b.status === STATUS.CONFIRMED ? "bg-emerald-500" : "bg-amber-500"}`} />
                              {b.status}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center opacity-30">
                            <Search size={48} className="mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">No matching records</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className={`px-8 py-4 border-t ${darkMode ? "border-white/5" : "border-slate-50"}`}>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  <span>Showing {recentBookings.length} entries</span>
                  <div className="flex gap-4">
                    <button className="hover:text-indigo-500 transition-colors">Previous</button>
                    <button className="hover:text-indigo-500 transition-colors">Next</button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Top Revenue Sources */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-2xl shadow-xl p-6 ${
                darkMode ? "bg-gray-800" : "bg-white/80"
              } border ${darkMode ? "border-gray-700" : "border-gray-100"}`}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Top Revenue Sources</h3>
                <FileText size={22} className={darkMode ? "text-gray-400" : "text-gray-400"} />
              </div>

              <div className="h-64">
                {topSources.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSources} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: darkMode ? "#9ca3af" : "#64748b" }} width={120} />
                      <Tooltip
                        formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: darkMode ? "#1f2937" : "#f8fafc",
                          border: `1px solid ${darkMode ? "#374151" : "#e2e8f0"}`,
                          borderRadius: "8px"
                        }}
                      />
                      <Bar dataKey="revenue" minWidth={100}>
                        {topSources.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={_.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className={`text-sm text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No data available</p>
                  </div>
                )}
              </div>

              {topSources.length > 0 && (
                <div className="mt-4 space-y-2">
                  {topSources.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.fill }}></div>
                        <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{s.name}</span>
                      </div>
                      <span className={darkMode ? "text-gray-400" : "text-gray-500"}>{s.bookings} bookings</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease infinite;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Dashboard;