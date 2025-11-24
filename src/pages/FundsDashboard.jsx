// src/pages/FundsDashboard.jsx
import { useState, useMemo, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useBooking, STATUS } from "../context/BookingContext";
import { useExpense } from "../context/ExpenseContext";
import {
  BarChart3, CalendarDays, CalendarRange, CalendarCheck, Receipt, TrendingUp, TrendingDown,
  DollarSign, AlertTriangle, Target, PieChart, Search, Clock, Repeat, Zap, Sun,
  Activity, LineChart as LineChartIcon, Edit3, Download, Trash2, Plus,
  Users, Award, Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format, startOfDay, startOfWeek, startOfMonth, startOfYear,
  endOfDay, endOfWeek, endOfMonth, endOfYear,
  subDays, subWeeks, subMonths, subYears,
  eachDayOfInterval, eachHourOfInterval, eachMonthOfInterval
} from "date-fns";
import { saveAs } from "file-saver";

import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";

const tabs = [
  { id: "daily", label: "Daily", icon: BarChart3 },
  { id: "weekly", label: "Weekly", icon: CalendarDays },
  { id: "monthly", label: "Monthly", icon: CalendarRange },
  { id: "yearly", label: "Yearly", icon: CalendarCheck },
  { id: "expenses", label: "Expenses", icon: Receipt },
];

const CATEGORIES = ["Fuel", "Salary", "Rent", "Marketing", "Maintenance", "Other"];
const TAGS = ["Urgent", "Recurring", "One-time", "Tax-deductible"];

// LIVE CLOCK HOOK - Updates every second
const useNow = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(interval);
  }, []);
  return now;
};

const FundsDashboard = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const { bookings = [], getStats } = useBooking();
  const { expenses = [], addExpense, removeExpense, editExpense, total: expenseTotal } = useExpense();

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);

  const now = useNow(); // LIVE DATE - updates every second

  const liveStats = useMemo(() => getStats(), [getStats, bookings, expenses]);

  const confirmedBookings = useMemo(
    () => bookings.filter(b => b.status === STATUS.CONFIRMED),
    [bookings, STATUS.CONFIRMED]
  );

  const recentBookings = useMemo(
    () => confirmedBookings
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5),
    [confirmedBookings]
  );

  /* ==================== REVENUE BY PERIOD ==================== */
  const revenueByPeriod = useMemo(() => {
    const periods = {
      daily: { start: startOfDay(now), end: endOfDay(now) },
      weekly: { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) },
      monthly: { start: startOfMonth(now), end: endOfMonth(now) },
      yearly: { start: startOfYear(now), end: endOfYear(now) },
    };

    const prev = {
      daily: { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) },
      weekly: { start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) },
      monthly: { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) },
      yearly: { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) },
    };

    const calc = (start, end) =>
      confirmedBookings.reduce((sum, b) => {
        const d = new Date(b.date);
        return d >= start && d <= end ? sum + (Number(b.totalRevenue) || 0) : sum;
      }, 0);

    return {
      daily: calc(periods.daily.start, periods.daily.end),
      prevDaily: calc(prev.daily.start, prev.daily.end),
      weekly: calc(periods.weekly.start, periods.weekly.end),
      prevWeekly: calc(prev.weekly.start, prev.weekly.end),
      monthly: calc(periods.monthly.start, periods.monthly.end),
      prevMonthly: calc(prev.monthly.start, prev.monthly.end),
      yearly: calc(periods.yearly.start, periods.yearly.end),
      prevYearly: calc(prev.yearly.start, prev.yearly.end),
      forecastDaily: calc(periods.daily.start, periods.daily.end) * 1.1,
      forecastWeekly: calc(periods.weekly.start, periods.weekly.end) * 1.05,
      forecastMonthly: calc(periods.monthly.start, periods.monthly.end) * 1.08,
      forecastYearly: calc(periods.yearly.start, periods.yearly.end) * 1.1,
    };
  }, [confirmedBookings, now]);

  /* ==================== NET PROFIT BY PERIOD ==================== */
  const netProfitByPeriod = useMemo(() => {
    const periods = {
      daily: { start: startOfDay(now), end: endOfDay(now) },
      weekly: { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) },
      monthly: { start: startOfMonth(now), end: endOfMonth(now) },
      yearly: { start: startOfYear(now), end: endOfYear(now) },
    };
    const prev = {
      daily: { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) },
      weekly: { start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) },
      monthly: { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) },
      yearly: { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) },
    };

    const calc = (start, end) =>
      confirmedBookings.reduce((sum, b) => {
        const d = new Date(b.date);
        return d >= start && d <= end ? sum + (Number(b.netProfit) || 0) : sum;
      }, 0);

    return {
      daily: calc(periods.daily.start, periods.daily.end),
      prevDaily: calc(prev.daily.start, prev.daily.end),
      weekly: calc(periods.weekly.start, periods.weekly.end),
      prevWeekly: calc(prev.weekly.start, prev.weekly.end),
      monthly: calc(periods.monthly.start, periods.monthly.end),
      prevMonthly: calc(prev.monthly.start, prev.monthly.end),
      yearly: calc(periods.yearly.start, periods.yearly.end),
      prevYearly: calc(prev.yearly.start, prev.yearly.end),
    };
  }, [confirmedBookings, now]);

  /* ==================== EXPENSES PER PERIOD (MEMOIZED) ==================== */
  const periodExpenses = useCallback((start, end) =>
    expenses.reduce((sum, e) => {
      const d = new Date(e.date);
      return d >= start && d <= end ? sum + e.amount : sum;
    }, 0),
  [expenses]);

  const profit = useMemo(() => ({
    daily: netProfitByPeriod.daily - periodExpenses(startOfDay(now), endOfDay(now)),
    weekly: netProfitByPeriod.weekly - periodExpenses(startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 })),
    monthly: netProfitByPeriod.monthly - periodExpenses(startOfMonth(now), endOfMonth(now)),
    yearly: netProfitByPeriod.yearly - periodExpenses(startOfYear(now), endOfYear(now)),
  }), [netProfitByPeriod, periodExpenses, now]);

  const netProfitTotal = liveStats.netProfitTotal;

  /* ==================== BOOKING STATS ==================== */
  const bookingStats = useMemo(() => {
    const todays = confirmedBookings.filter(b => {
      const d = new Date(b.date);
      return d.getFullYear() === now.getFullYear() &&
             d.getMonth() === now.getMonth() &&
             d.getDate() === now.getDate();
    });
    return {
      count: confirmedBookings.length,
      todaysCount: todays.length,
      totalRevenue: revenueByPeriod.yearly,
    };
  }, [confirmedBookings, revenueByPeriod, now]);

  /* ==================== HOURLY DATA (DAILY) ==================== */
  const hourlyData = useMemo(() => {
    const hours = eachHourOfInterval({ start: startOfDay(now), end: endOfDay(now) });
    return hours.map(h => {
      const rev = confirmedBookings
        .filter(b => {
          const d = new Date(b.date);
          return d.getDate() === now.getDate() &&
                 d.getMonth() === now.getMonth() &&
                 d.getFullYear() === now.getFullYear() &&
                 d.getHours() === h.getHours();
        })
        .reduce((s, b) => s + (Number(b.totalRevenue) || 0), 0);
      return { hour: format(h, 'HH:00'), revenue: rev };
    });
  }, [confirmedBookings, now]);

  /* ==================== DAILY DATA (WEEKLY) ==================== */
  const dailyDataWeekly = useMemo(() => {
    const week = eachDayOfInterval({
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 })
    });
    return week.map(day => {
      const dayBookings = confirmedBookings.filter(b => {
        const d = new Date(b.date);
        return d.getDate() === day.getDate() &&
               d.getMonth() === day.getMonth() &&
               d.getFullYear() === day.getFullYear();
      });
      const rev = dayBookings.reduce((s, b) => s + (Number(b.totalRevenue) || 0), 0);
      const profitDay = dayBookings.reduce((s, b) => s + (Number(b.netProfit) || 0), 0);
      const exp = periodExpenses(startOfDay(day), endOfDay(day));
      return { day: format(day, 'EEE d'), revenue: rev, profit: profitDay - exp };
    });
  }, [confirmedBookings, expenses, now, periodExpenses]);

  /* ==================== MONTHLY HEATMAP ==================== */
  const monthlyHeatmap = useMemo(() => {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days.map(day => {
      const rev = confirmedBookings
        .filter(b => {
          const d = new Date(b.date);
          return d.getFullYear() === day.getFullYear() &&
                 d.getMonth() === day.getMonth() &&
                 d.getDate() === day.getDate();
        })
        .reduce((s, b) => s + (Number(b.totalRevenue) || 0), 0);
      return { day: day.getDate(), revenue: rev };
    });
  }, [confirmedBookings, now]);

  /* ==================== MONTHLY DATA (YEARLY) ==================== */
  const monthlyDataYearly = useMemo(() => {
    const year = eachMonthOfInterval({ start: startOfYear(now), end: endOfYear(now) });
    return year.map(m => {
      const s = startOfMonth(m), e = endOfMonth(m);
      const monthBookings = confirmedBookings.filter(b => {
        const d = new Date(b.date);
        return d >= s && d <= e;
      });
      const rev = monthBookings.reduce((s, b) => s + (Number(b.totalRevenue) || 0), 0);
      const net = monthBookings.reduce((s, b) => s + (Number(b.netProfit) || 0), 0);
      const exp = periodExpenses(s, e);
      return { month: format(m, 'MMM'), revenue: rev, profit: net - exp };
    });
  }, [confirmedBookings, expenses, now, periodExpenses]);

  /* ==================== GOALS ==================== */
  const goals = useMemo(() => ({
    daily: { target: 5000, achieved: revenueByPeriod.daily },
    weekly: { target: 25000, achieved: revenueByPeriod.weekly },
    monthly: { target: 100000, achieved: revenueByPeriod.monthly },
    yearly: { target: 1200000, achieved: revenueByPeriod.yearly },
  }), [revenueByPeriod]);

  /* ==================== TOP BOOKINGS ==================== */
  const topBookings = useCallback((start, end, limit = 5) =>
    confirmedBookings
      .filter(b => {
        const d = new Date(b.date);
        return d >= start && d <= end;
      })
      .sort((a, b) => (Number(b.totalRevenue) || 0) - (Number(a.totalRevenue) || 0))
      .slice(0, limit),
  [confirmedBookings]);

  /* ==================== EXPENSE CATEGORIES ==================== */
  const categoryTotals = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => map[c] = 0);
    expenses.forEach(e => {
      const cat = e.category || "Other";
      map[cat] = (map[cat] || 0) + e.amount;
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total ? Math.round((amount / total) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const recurringExpenses = useMemo(() => expenses.filter(e => e.isRecurring), [expenses]);

  const [showRecurring, setShowRecurring] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (desc.trim() && amount > 0) {
      if (editingExpense) {
        editExpense(editingExpense.id, desc.trim(), Number(amount), category, selectedTags, isRecurring);
        setEditingExpense(null);
      } else {
        addExpense(desc.trim(), Number(amount), category, selectedTags, isRecurring);
      }
      setDesc(""); setAmount(""); setCategory(CATEGORIES[0]); setSelectedTags([]); setIsRecurring(false);
    }
  };

  const handleEditExpense = (exp) => {
    setEditingExpense(exp);
    setDesc(exp.description);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setSelectedTags(exp.tags || []);
    setIsRecurring(exp.isRecurring || false);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setDesc(""); setAmount(""); setCategory(CATEGORIES[0]); setSelectedTags([]); setIsRecurring(false);
  };

  const exportCSV = () => {
    const currentNow = new Date();
    const headers = "Type,Date,Description,Base Pay,Revenue,Amount,Category,Tags\n";
    const rows = [
      ...confirmedBookings.map(b => `Booking,${format(new Date(b.date), "yyyy-MM-dd")},${b.customerName},${b.basePay || 0},${b.totalRevenue || 0},,,`),
      ...expenses.map(e => `Expense,${format(new Date(e.date), "yyyy-MM-dd")},${e.description},,,-${e.amount},${e.category || "Other"},${e.tags?.join(',') || ''}`)
    ];
    const csv = headers + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, `financial-report-${format(currentNow, "yyyy-MM-dd")}.csv`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

          {/* HEADER */}
          <motion.header
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-2xl text-white"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-10 h-10 text-white/90" />
                  <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 animate-gradient-x">
                    Funds & Profit Center
                  </h1>
                </div>
                <p className="text-lg text-blue-50 max-w-md">
                  Advanced financial insights with forecasts, comparisons, and customizable tracking.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <TrendingUp size={18} className="text-green-300" />
                    <span className="font-semibold">{bookingStats.count}</span>
                    <span className="text-blue-100">Bookings</span>
                  </div>
                  <div className="text-blue-100">
                    Revenue: ₹{liveStats.revenue.toLocaleString()} • 
                    Spent: ₹{expenseTotal.toLocaleString()} • 
                    Net Profit: ₹{netProfitTotal.toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={exportCSV}
                className="group relative inline-flex items-center gap-3 px-6 py-3.5 bg-white text-indigo-600 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-50 transition-opacity"></span>
                <Download size={22} className="relative z-10" />
                <span className="relative z-10">Export Report</span>
              </button>
            </div>
          </motion.header>

          {/* RECENT BOOKINGS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-200"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">Recent Bookings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentBookings.length > 0 ? (
                    recentBookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(b.date), "MMM d, yyyy")}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">₹{Number(b.totalRevenue).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No recent bookings</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* TAB BAR */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2">
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${active ? "text-indigo-600 shadow-md" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    <Icon size={18} />
                    {tab.label}
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB CONTENT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "daily" && (
                <DailyFunds
                  revenue={revenueByPeriod.daily}
                  prevRevenue={revenueByPeriod.prevDaily}
                  forecast={revenueByPeriod.forecastDaily}
                  profit={profit.daily}
                  prevProfit={netProfitByPeriod.prevDaily - periodExpenses(startOfDay(subDays(now, 1)), endOfDay(subDays(now, 1)))}
                  bookingStats={bookingStats}
                  hourlyData={hourlyData}
                  topBookings={topBookings(startOfDay(now), endOfDay(now))}
                  goal={goals.daily}
                  now={now}
                />
              )}
              {activeTab === "weekly" && (
                <WeeklyFunds
                  revenue={revenueByPeriod.weekly}
                  prevRevenue={revenueByPeriod.prevWeekly}
                  forecast={revenueByPeriod.forecastWeekly}
                  profit={profit.weekly}
                  dailyData={dailyDataWeekly}
                  topBookings={topBookings(startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }))}
                  goal={goals.weekly}
                />
              )}
              {activeTab === "monthly" && (
                <MonthlyFunds
                  revenue={revenueByPeriod.monthly}
                  prevRevenue={revenueByPeriod.prevMonthly}
                  forecast={revenueByPeriod.forecastMonthly}
                  profit={profit.monthly}
                  topBookings={topBookings(startOfMonth(now), endOfMonth(now))}
                  goal={goals.monthly}
                  heatmap={monthlyHeatmap}
                />
              )}
              {activeTab === "yearly" && (
                <YearlyFunds
                  revenue={revenueByPeriod.yearly}
                  prevRevenue={revenueByPeriod.prevYearly}
                  forecast={revenueByPeriod.forecastYearly}
                  profit={profit.yearly}
                  monthlyData={monthlyDataYearly}
                  topBookings={topBookings(startOfYear(now), endOfYear(now))}
                  goal={goals.yearly}
                />
              )}
              {activeTab === "expenses" && (
                <ExpenseTracker
                  expenses={expenses}
                  recurringExpenses={recurringExpenses}
                  removeExpense={removeExpense}
                  handleAddExpense={handleAddExpense}
                  desc={desc} setDesc={setDesc}
                  amount={amount} setAmount={setAmount}
                  category={category} setCategory={setCategory}
                  selectedTags={selectedTags} setSelectedTags={setSelectedTags}
                  isRecurring={isRecurring} setIsRecurring={setIsRecurring}
                  expenseTotal={expenseTotal}
                  categoryTotals={categoryTotals}
                  showRecurring={showRecurring}
                  setShowRecurring={setShowRecurring}
                  editingExpense={editingExpense}
                  handleEditExpense={handleEditExpense}
                  handleCancelEdit={handleCancelEdit}
                  exportCSV={exportCSV}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 8s ease infinite; }
        .daily-bg   { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%); }
        .weekly-bg  { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #3b82f6 100%); }
        .monthly-bg { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #22c55e 100%); }
        .yearly-bg  { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #a855f7 100%); }
        .expenses-bg{ background: linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #ef4444 100%); }
      `}</style>
    </DashboardLayout>
  );
};

/* ==================== PURE PRESENTATIONAL COMPONENTS ==================== */

const DailyFunds = ({ revenue, prevRevenue, forecast, profit, prevProfit, bookingStats, hourlyData, topBookings, goal, now }) => (
  <div className="space-y-6 daily-bg rounded-3xl p-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-amber-800 flex items-center gap-3">
        <Sun className="text-amber-600" /> Daily Timeline – {format(now, "MMM d, yyyy")}
      </h2>
      <div className="flex items-center gap-2 text-sm text-amber-700">
        <Clock size={16} /> Live Updates
      </div>
    </div>

    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {hourlyData.map((h, i) => (
          <motion.div
            key={h.hour}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 p-3 rounded-xl shadow-md flex flex-col items-center min-w-[100px]"
          >
            <p className="text-xs text-gray-600">{h.hour}</p>
            <p className={`text-lg font-bold ${h.revenue > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
              ₹{h.revenue.toLocaleString()}
            </p>
            {h.revenue > 0 && <TrendingUp size={12} className="text-emerald-500" />}
          </motion.div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCardCompact stat={{ label: "Today", value: revenue, prev: prevRevenue, icon: TrendingUp, color: "emerald" }} />
      <StatCardCompact stat={{ label: "Forecast", value: forecast, icon: Zap, color: "blue" }} />
      <StatCardCompact stat={{ label: "Profit", value: profit, prev: prevProfit, icon: DollarSign, color: profit >= 0 ? "green" : "red" }} />
      <StatCardCompact stat={{ label: "Bookings", value: bookingStats.todaysCount, icon: Activity, color: "indigo" }} />
    </div>

    <GoalProgress goal={goal} period="Daily" color="amber" />

    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
      <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
        <Plus className="text-amber-600" /> Quick Actions
      </h3>
      <div className="flex flex-wrap gap-2">
        <a href="/new-booking" className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm hover:bg-amber-200 transition">New Booking</a>
        <a href="/add-revenue" className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200 transition">Add Revenue</a>
        <a href="/log-expense" className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-sm hover:bg-rose-200 transition">Log Expense</a>
      </div>
    </div>

    <div className="bg-white/70 p-4 rounded-2xl shadow-lg">
      <h3 className="font-semibold text-amber-800 mb-3">Peak Bookings</h3>
      <ul className="space-y-2">
        {topBookings.map(b => (
          <li key={b.id} className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
            <span>{b.customerName} – {format(new Date(b.date), 'HH:mm')}</span>
            <span className="font-bold text-emerald-600">₹{Number(b.totalRevenue).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>

    {profit < 0 && <AlertCard message="Daily dip detected! Consider promotions." color="amber" />}
  </div>
);

const WeeklyFunds = ({ revenue, prevRevenue, forecast, profit, dailyData, topBookings, goal }) => (
  <div className="space-y-6 weekly-bg rounded-3xl p-6">
    <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-3">
      <CalendarDays className="text-blue-600" /> Weekly Grid Overview
    </h2>

    <div className="grid grid-cols-7 gap-2">
      {dailyData.map((d, i) => (
        <motion.div
          key={d.day}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-3 rounded-xl border-2 ${d.profit >= 0 ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}
        >
          <p className="text-xs font-medium text-gray-700">{d.day}</p>
          <p className="text-sm font-bold text-emerald-600">₹{d.revenue.toLocaleString()}</p>
          <p className={`text-xs ${d.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {d.profit >= 0 ? `+₹${d.profit}` : `-₹${Math.abs(d.profit)}`}
          </p>
        </motion.div>
      ))}
    </div>

    <div className="flex flex-col md:flex-row gap-4">
      <SummaryCard title="This Week" value={revenue} prev={prevRevenue} type="revenue" />
      <SummaryCard title="Forecast" value={forecast} type="forecast" />
      <SummaryCard title="Profit" value={profit} type="profit" />
    </div>

    <GoalProgress goal={goal} period="Weekly" color="blue" />

    <div className="bg-white/70 p-4 rounded-2xl shadow-lg">
      <h3 className="font-semibold text-blue-800 mb-3">Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <p className="font-bold text-blue-600">Best Day</p>
          <p className="text-gray-700">{dailyData.reduce((max, d) => d.revenue > max.revenue ? d : max, dailyData[0])?.day}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-emerald-600">Total Bookings</p>
          <p className="text-gray-700">{dailyData.reduce((s, d) => s + (d.revenue > 0 ? 1 : 0), 0)}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-purple-600">Avg Daily</p>
          <p className="text-gray-700">₹{Math.round(revenue / 7).toLocaleString()}</p>
        </div>
      </div>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {topBookings.slice(0, 3).map(b => <BookingCard key={b.id} booking={b} />)}
    </div>
  </div>
);

const MonthlyFunds = ({ revenue, prevRevenue, forecast, profit, topBookings, goal, heatmap }) => {
  const maxRevenue = Math.max(...heatmap.map(d => d.revenue), 1);
  const trendData = heatmap.map(d => ({ label: d.day, value: d.revenue }));

  return (
    <div className="space-y-6 monthly-bg rounded-3xl p-6">
      <h2 className="text-2xl font-bold text-green-800 flex items-center gap-3">
        <CalendarRange className="text-green-600" /> Monthly Heatmap
      </h2>

      <div className="grid grid-cols-7 gap-1">
        {heatmap.map(d => {
          const intensity = d.revenue === 0 ? 0 : Math.round((d.revenue / maxRevenue) * 100);
          const bg = intensity === 0 ? "bg-gray-200" : `bg-emerald-${Math.min(100 + intensity * 5, 900)}`;
          return (
            <div
              key={d.day}
              className={`aspect-square rounded flex items-center justify-center text-xs font-medium text-white ${bg}`}
              title={`Day ${d.day}: ₹${d.revenue.toLocaleString()}`}
            >
              {d.day}
            </div>
          );
        })}
      </div>

      <div className="bg-white/70 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <LineChartIcon className="text-green-600" />
          <h3 className="font-semibold text-green-800">Revenue Trend</h3>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => `₹${Number(v).toLocaleString()}`} contentStyle={{ background: "#fff", borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <VerticalStat label="Revenue" value={revenue} prev={prevRevenue} />
        <VerticalStat label="Forecast" value={forecast} />
        <VerticalStat label="Profit" value={profit} color={profit >= 0 ? "green" : "red"} />
      </div>

      <GoalProgress goal={goal} period="Monthly" color="green" />

      <div className="bg-white/70 p-4 rounded-2xl shadow-lg">
        <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
          <Users className="text-green-600" /> Top Customers
        </h3>
        <ul className="space-y-2">
          {topBookings.map(b => (
            <li key={b.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="font-medium">{b.customerName}</span>
              <span className="text-green-600">₹{Number(b.totalRevenue).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const YearlyFunds = ({ revenue, prevRevenue, forecast, profit, monthlyData, topBookings, goal }) => (
  <div className="space-y-6 yearly-bg rounded-3xl p-6">
    <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-3">
      <CalendarCheck className="text-purple-600" /> Yearly Layers
    </h2>

    <div className="space-y-4">
      {monthlyData.map(m => (
        <motion.div
          key={m.month}
          initial={{ height: 0 }}
          animate={{ height: 60 }}
          className="bg-white/70 rounded-xl p-3 flex justify-between items-center shadow-md"
        >
          <p className="font-semibold text-purple-700">{m.month}</p>
          <div className="flex items-center gap-4">
            <p className="text-emerald-600 font-bold">₹{m.revenue.toLocaleString()}</p>
            <div className="w-20 bg-purple-100 rounded-full h-4">
              <div className="bg-purple-500 h-4 rounded-full" style={{ width: `${(m.revenue / Math.max(...monthlyData.map(x => x.revenue))) * 100}%` }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="bg-white/70 rounded-2xl shadow-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-purple-100">
            <th className="p-3 text-left text-purple-700">Quarter</th>
            <th className="p-3 text-right text-purple-700">Revenue</th>
            <th className="p-3 text-right text-purple-700">Profit</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4].map(q => {
            const qRev = monthlyData.slice((q - 1) * 3, q * 3).reduce((s, m) => s + m.revenue, 0);
            const qProf = monthlyData.slice((q - 1) * 3, q * 3).reduce((s, m) => s + m.profit, 0);
            return (
              <tr key={q} className="border-t">
                <td className="p-3">Q{q}</td>
                <td className="p-3 text-right text-emerald-600 font-bold">₹{qRev.toLocaleString()}</td>
                <td className="p-3 text-right font-bold">
                  {qProf >= 0 ? <span className="text-green-600">+₹{qProf.toLocaleString()}</span> : <span className="text-red-600">-₹{Math.abs(qProf).toLocaleString()}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <GoalProgress goal={goal} period="Yearly" color="purple" />

    {revenue > goal.target * 0.8 && (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white/70 p-4 rounded-2xl shadow-lg text-center">
        <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
        <p className="text-purple-800 font-bold">80% Yearly Goal Achieved!</p>
      </motion.div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {topBookings.slice(0, 4).map(b => (
        <div key={b.id} className="bg-white/70 p-3 rounded-xl shadow-md flex justify-between">
          <div>
            <p className="font-medium">{b.customerName}</p>
            <p className="text-sm text-gray-600">{format(new Date(b.date), 'MMM yyyy')}</p>
          </div>
          <p className="text-purple-600 font-bold">₹{Number(b.totalRevenue).toLocaleString()}</p>
        </div>
      ))}
    </div>
  </div>
);

const ExpenseTracker = ({
  expenses, recurringExpenses, removeExpense, handleAddExpense,
  desc, setDesc, amount, setAmount, category, setCategory,
  selectedTags, setSelectedTags, isRecurring, setIsRecurring,
  expenseTotal, categoryTotals, showRecurring, setShowRecurring,
  editingExpense, handleEditExpense, handleCancelEdit, exportCSV
}) => (
  <div className="space-y-6 expenses-bg rounded-3xl p-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-red-800 flex items-center gap-3">
        <Receipt className="text-red-600" /> Advanced Expense Manager
      </h2>
      <div className="text-xl font-bold text-red-700">Total: ₹{expenseTotal.toLocaleString()}</div>
    </div>

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-2xl shadow-lg border border-red-100">
      <form onSubmit={handleAddExpense} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="text" placeholder="Description *" value={desc} onChange={e => setDesc(e.target.value)} className="p-3 rounded-xl border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200" />
          <input type="number" placeholder="Amount *" value={amount} onChange={e => setAmount(e.target.value)} className="p-3 rounded-xl border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="p-3 rounded-xl border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-red-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(t => (
              <button key={t} type="button" onClick={() => setSelectedTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${selectedTags.includes(t) ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <label className="flex items-center gap-2 text-sm text-red-600">
            <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="rounded text-red-500" /> Recurring
          </label>
          <button type="button" onClick={() => setShowRecurring(!showRecurring)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${showRecurring ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
            <Repeat size={16} /> {showRecurring ? 'Show All' : 'Recurring'}
          </button>
          <button type="submit" className="ml-auto flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 shadow-md">
            {editingExpense ? <Edit3 size={16} /> : <Plus size={16} />} {editingExpense ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
      {editingExpense && (
        <button onClick={handleCancelEdit} className="text-sm text-red-500 underline mt-2">
          Cancel Edit
        </button>
      )}
    </motion.div>

    <div className="bg-white/70 p-4 rounded-xl shadow-sm flex items-center gap-4">
      <Search className="text-red-400" />
      <input placeholder="Search expenses..." className="flex-1 outline-none text-sm bg-transparent" />
      <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
        <Download size={16} /> Export
      </button>
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white/70 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
          <PieChart className="text-red-600" /> Breakdown
        </h3>
        <ul className="space-y-3">
          {categoryTotals.map((c, i) => (
            <li key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${i * 60}, 70%, 50%)` }} />
                <span className="font-medium text-red-700">{c.name}</span>
              </div>
              <div className="text-right">
                <span className="text-red-600 font-bold">₹{c.amount.toLocaleString()}</span>
                <span className="text-xs text-gray-500 ml-2">({c.percentage}%)</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white/70 p-6 rounded-2xl shadow-lg overflow-hidden">
        <h3 className="text-lg font-semibold text-red-800 mb-4">
          Transactions ({showRecurring ? recurringExpenses.length : expenses.length})
        </h3>
        <div className="max-h-72 overflow-y-auto space-y-2">
          {(showRecurring ? recurringExpenses : expenses).slice(0, 10).map(e => (
            <div key={e.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div>
                  <p className="font-medium text-red-700">{e.description}</p>
                  <p className="text-xs text-gray-600">{e.category} • {format(new Date(e.date), 'MMM d')}</p>
                  {e.tags && <p className="text-xs text-gray-500">{e.tags.join(', ')}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">-₹{e.amount.toLocaleString()}</p>
                <div className="flex gap-1 mt-1">
                  <button onClick={() => handleEditExpense(e)} className="p-1 text-blue-500 hover:bg-blue-100 rounded"><Edit3 size={14} /></button>
                  <label className="p-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer"><Upload size={14} /><input type="file" className="hidden" /></label>
                  <button onClick={() => removeExpense(e.id)} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {recurringExpenses.length > 0 && (
      <AlertCard message={`${recurringExpenses.length} recurring expenses due soon.`} color="red" />
    )}
  </div>
);

/* ==================== SHARED UI COMPONENTS ==================== */
const StatCardCompact = ({ stat }) => {
  const change = stat.prev ? ((stat.value - stat.prev) / stat.prev) * 100 : 0;
  const Icon = stat.icon;
  return (
    <div className={`p-4 rounded-xl bg-white shadow-md flex flex-col items-center gap-2 text-${stat.color}-600`}>
      <Icon size={20} />
      <p className="text-2xl font-bold">₹{stat.value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{stat.label}</p>
      {stat.prev && <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>{change.toFixed(1)}%</p>}
    </div>
  );
};

const SummaryCard = ({ title, value, prev, type }) => (
  <div className="flex-1 p-4 bg-white rounded-xl shadow-md">
    <p className="text-sm text-gray-600">{title}</p>
    <p className={`text-2xl font-bold ${type === 'profit' ? (value >= 0 ? 'text-green-600' : 'text-red-600') : 'text-blue-600'}`}>
      ₹{value.toLocaleString()}
    </p>
    {prev && <p className="text-xs text-gray-500">vs prev: ₹{(value - prev).toLocaleString()}</p>}
  </div>
);

const VerticalStat = ({ label, value, prev, color = "blue" }) => (
  <div className="bg-white/70 p-4 rounded-xl shadow-lg text-center">
    <p className="text-sm text-gray-600">{label}</p>
    <p className={`text-3xl font-bold text-${color}-600`}>₹{value.toLocaleString()}</p>
    {prev && <p className="text-xs text-gray-500">Prev: ₹{prev.toLocaleString()}</p>}
  </div>
);

const GoalProgress = ({ goal, period, color }) => (
  <div className={`bg-white/70 p-4 rounded-xl shadow-lg`}>
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <Target className={`text-${color}-600`} /> {period} Goal
      </h3>
      <span className={`text-${color}-600`}>{Math.round((goal.achieved / goal.target) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-4">
      <motion.div
        className={`h-4 rounded-full bg-${color}-500`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((goal.achieved / goal.target) * 100, 100)}%` }}
        transition={{ duration: 1 }}
      />
    </div>
    <div className="flex justify-between text-xs mt-2 text-gray-600">
      <span>₹{goal.achieved.toLocaleString()}</span>
      <span>of ₹{goal.target.toLocaleString()}</span>
    </div>
  </div>
);

const BookingCard = ({ booking }) => (
  <div className="bg-white/70 p-4 rounded-xl shadow-md">
    <p className="font-medium text-gray-800">{booking.customerName}</p>
    <p className="text-sm text-gray-600">{format(new Date(booking.date), 'MMM d')}</p>
    <p className="text-lg font-bold text-emerald-600 mt-2">₹{Number(booking.totalRevenue).toLocaleString()}</p>
  </div>
);

const AlertCard = ({ message, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`border-l-4 border-${color}-500 bg-${color}-50 p-4 rounded-lg flex items-center gap-3`}
  >
    <AlertTriangle className={`text-${color}-500 w-5 h-5`} />
    <p className={`text-${color}-800`}>{message}</p>
  </motion.div>
);

export default FundsDashboard;