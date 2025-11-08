// src/pages/FundsDashboard.jsx
import { useState, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import FundsChart from "../components/FundsChart";
import { useBooking } from "../context/BookingContext";
import { useExpense } from "../context/ExpenseContext";
import {
  BarChart3, CalendarDays, CalendarRange, CalendarCheck, Receipt, TrendingUp, TrendingDown,
  DollarSign, AlertTriangle, Target, PieChart, Filter, Search, Clock, Repeat, Zap, Sun, Moon,
  Activity, Goal, LineChart as LineChartIcon, Grid, Layers, Edit3, Upload, FileText, Users, Award,
  Download, Trash2, Plus, Tag, ChevronDown, ChevronUp, Clock as ClockIcon, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfYear, addDays, subDays, subWeeks, subMonths, subYears, isToday, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachHourOfInterval, parseISO } from "date-fns";
import { saveAs } from "file-saver";

// Recharts imports for Monthly trend chart
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

const FundsDashboard = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const { bookings = [] } = useBooking();
  const { expenses = [], addExpense, removeExpense, editExpense, total: expenseTotal } = useExpense();

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Hardcoded current date to match dashboard consistency
  const now = new Date('2025-11-07');

  // Filter confirmed bookings for revenue calculations
  const confirmedBookings = useMemo(() => 
    bookings.filter(b => b.status?.toLowerCase() === "confirmed"), 
    [bookings]
  );

  // Recent bookings (last 5 confirmed, sorted by date desc)
  const recentBookings = useMemo(() => 
    confirmedBookings
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5), 
    [confirmedBookings]
  );

  // Enhanced Revenue by Period with Comparisons and Forecasts (using confirmed bookings)
  const revenueByPeriod = useMemo(() => {
    const dailyStart = startOfDay(now);
    const dailyEnd = endOfDay(now);
    const weeklyStart = startOfWeek(now, { weekStartsOn: 1 });
    const weeklyEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthlyStart = startOfMonth(now);
    const monthlyEnd = endOfMonth(now);
    const yearlyStart = startOfYear(now);
    const yearlyEnd = endOfYear(now);

    // Previous periods
    const prevDailyStart = startOfDay(subDays(now, 1));
    const prevDailyEnd = endOfDay(subDays(now, 1));
    const prevWeeklyStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const prevWeeklyEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const prevMonthlyStart = startOfMonth(subMonths(now, 1));
    const prevMonthlyEnd = endOfMonth(subMonths(now, 1));
    const prevYearlyStart = startOfYear(subYears(now, 1));
    const prevYearlyEnd = endOfYear(subYears(now, 1));

    let daily = 0, prevDaily = 0, weekly = 0, prevWeekly = 0, monthly = 0, prevMonthly = 0, yearly = 0, prevYearly = 0;

    confirmedBookings.forEach(b => {
      const date = new Date(b.date);
      const revenue = Number(b.totalRevenue) || 0;

      if (date >= dailyStart && date <= dailyEnd) daily += revenue;
      if (date >= weeklyStart && date <= weeklyEnd) weekly += revenue;
      if (date >= monthlyStart && date <= monthlyEnd) monthly += revenue;
      if (date >= yearlyStart && date <= yearlyEnd) yearly += revenue;

      if (date >= prevDailyStart && date <= prevDailyEnd) prevDaily += revenue;
      if (date >= prevWeeklyStart && date <= prevWeeklyEnd) prevWeekly += revenue;
      if (date >= prevMonthlyStart && date <= prevMonthlyEnd) prevMonthly += revenue;
      if (date >= prevYearlyStart && date <= prevYearlyEnd) prevYearly += revenue;
    });

    const forecastDaily = daily * 1.1;
    const forecastWeekly = weekly * 1.05;
    const forecastMonthly = monthly * 1.08;
    const forecastYearly = yearly * 1.1;

    return {
      daily, prevDaily, forecastDaily,
      weekly, prevWeekly, forecastWeekly,
      monthly, prevMonthly, forecastMonthly,
      yearly, prevYearly, forecastYearly,
    };
  }, [confirmedBookings]);

  // Net Profit by Period (sum of b.netProfit for consistency with Dashboard)
  const netProfitByPeriod = useMemo(() => {
    const dailyStart = startOfDay(now);
    const dailyEnd = endOfDay(now);
    const weeklyStart = startOfWeek(now, { weekStartsOn: 1 });
    const weeklyEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthlyStart = startOfMonth(now);
    const monthlyEnd = endOfMonth(now);
    const yearlyStart = startOfYear(now);
    const yearlyEnd = endOfYear(now);

    // Previous periods
    const prevDailyStart = startOfDay(subDays(now, 1));
    const prevDailyEnd = endOfDay(subDays(now, 1));
    const prevWeeklyStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const prevWeeklyEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const prevMonthlyStart = startOfMonth(subMonths(now, 1));
    const prevMonthlyEnd = endOfMonth(subMonths(now, 1));
    const prevYearlyStart = startOfYear(subYears(now, 1));
    const prevYearlyEnd = endOfYear(subYears(now, 1));

    let daily = 0, prevDaily = 0, weekly = 0, prevWeekly = 0, monthly = 0, prevMonthly = 0, yearly = 0, prevYearly = 0;

    confirmedBookings.forEach(b => {
      const date = new Date(b.date);
      const netProfit = Number(b.netProfit) || 0;

      if (date >= dailyStart && date <= dailyEnd) daily += netProfit;
      if (date >= weeklyStart && date <= weeklyEnd) weekly += netProfit;
      if (date >= monthlyStart && date <= monthlyEnd) monthly += netProfit;
      if (date >= yearlyStart && date <= yearlyEnd) yearly += netProfit;

      if (date >= prevDailyStart && date <= prevDailyEnd) prevDaily += netProfit;
      if (date >= prevWeeklyStart && date <= prevWeeklyEnd) prevWeekly += netProfit;
      if (date >= prevMonthlyStart && date <= prevMonthlyEnd) prevMonthly += netProfit;
      if (date >= prevYearlyStart && date <= prevYearlyEnd) prevYearly += netProfit;
    });

    return { daily, prevDaily, weekly, prevWeekly, monthly, prevMonthly, yearly, prevYearly };
  }, [confirmedBookings]);

  // Period-specific expenses
  const getPeriodExpenses = (start, end) => {
    return expenses.reduce((total, e) => {
      const date = new Date(e.date);
      if (date >= start && date <= end) return total + e.amount;
      return total;
    }, 0);
  };

  const profit = useMemo(() => {
    const dailyExpenses = getPeriodExpenses(startOfDay(now), endOfDay(now));
    const weeklyExpenses = getPeriodExpenses(startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }));
    const monthlyExpenses = getPeriodExpenses(startOfMonth(now), endOfMonth(now));
    const yearlyExpenses = getPeriodExpenses(startOfYear(now), endOfYear(now));

    return {
      daily: netProfitByPeriod.daily - dailyExpenses,
      weekly: netProfitByPeriod.weekly - weeklyExpenses,
      monthly: netProfitByPeriod.monthly - monthlyExpenses,
      yearly: netProfitByPeriod.yearly - yearlyExpenses,
    };
  }, [netProfitByPeriod, expenses]);

  // Total net profit for header (all-time sum of netProfit - total expenses)
  const netProfitTotal = useMemo(() => 
    confirmedBookings.reduce((sum, b) => sum + (b.netProfit || 0), 0) - expenseTotal, 
    [confirmedBookings, expenseTotal]
  );

  // Enhanced Booking Stats (using confirmed bookings)
  const bookingStats = useMemo(() => {
    const total = revenueByPeriod.yearly;
    const avg = confirmedBookings.length ? Math.round(total / confirmedBookings.length) : 0;
    const highest = confirmedBookings.reduce((max, b) => Math.max(max, Number(b.totalRevenue) || 0), 0);
    const todaysBookings = confirmedBookings.filter(b => {
      const date = new Date(b.date);
      return date.getFullYear() === now.getFullYear() && 
             date.getMonth() === now.getMonth() && 
             date.getDate() === now.getDate();
    });
    const avgBookingTime = confirmedBookings.length ? confirmedBookings.reduce((sum, b) => sum + (new Date(b.date).getHours() || 0), 0) / confirmedBookings.length : 0;
    return { total, avg, highest, count: confirmedBookings.length, todaysCount: todaysBookings.length, avgBookingTime };
  }, [revenueByPeriod, confirmedBookings, now]);

  // Hourly data for daily (using confirmed bookings)
  const hourlyData = useMemo(() => {
    const today = now;
    const hours = eachHourOfInterval({ start: startOfDay(today), end: endOfDay(today) });
    return hours.map(hour => {
      const hourBookings = confirmedBookings.filter(b => {
        const date = new Date(b.date);
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear() && date.getHours() === hour.getHours();
      });
      return { hour: format(hour, 'HH:00'), revenue: hourBookings.reduce((sum, b) => sum + Number(b.totalRevenue), 0) };
    });
  }, [confirmedBookings, now]);

  // Day-by-day for weekly (using confirmed bookings)
  const dailyDataWeekly = useMemo(() => {
    const week = eachDayOfInterval({ start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) });
    return week.map(day => {
      const dayBookings = confirmedBookings.filter(b => {
        const date = new Date(b.date);
        return date.getDate() === day.getDate() && date.getMonth() === day.getMonth() && date.getFullYear() === day.getFullYear();
      });
      const dayRevenue = dayBookings.reduce((sum, b) => sum + Number(b.totalRevenue), 0);
      const dayExpenses = getPeriodExpenses(startOfDay(day), endOfDay(day));
      const dayNetProfit = dayBookings.reduce((sum, b) => sum + Number(b.netProfit), 0);
      return { day: format(day, 'EEE d'), revenue: dayRevenue, profit: dayNetProfit - dayExpenses };
    });
  }, [confirmedBookings, expenses, now]);

  // Month-by-month for yearly (using confirmed bookings)
  const monthlyDataYearly = useMemo(() => {
    const year = eachMonthOfInterval({ start: startOfYear(now), end: endOfYear(now) });
    return year.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthBookings = confirmedBookings.filter(b => {
        const date = new Date(b.date);
        return date >= monthStart && date <= monthEnd;
      });
      const monthRevenue = monthBookings.reduce((sum, b) => sum + Number(b.totalRevenue), 0);
      const monthNetProfit = monthBookings.reduce((sum, b) => sum + Number(b.netProfit), 0);
      const monthExpenses = getPeriodExpenses(monthStart, monthEnd);
      return { month: format(month, 'MMM'), revenue: monthRevenue, profit: monthNetProfit - monthExpenses };
    });
  }, [confirmedBookings, expenses, now]);

  // Goals
  const goals = useMemo(() => ({
    daily: { target: 5000, achieved: revenueByPeriod.daily },
    weekly: { target: 25000, achieved: revenueByPeriod.weekly },
    monthly: { target: 100000, achieved: revenueByPeriod.monthly },
    yearly: { target: 1200000, achieved: revenueByPeriod.yearly },
  }), [revenueByPeriod]);

  // Top Bookings (using confirmed bookings)
  const getTopBookings = (start, end, limit = 5) => {
    return confirmedBookings
      .filter(b => {
        const date = new Date(b.date);
        return date >= start && date <= end;
      })
      .sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue))
      .slice(0, limit);
  };

  // Expense Categories with percentages
  const categoryTotals = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => map[c] = 0);
    expenses.forEach(e => {
      const cat = e.category || "Other";
      map[cat] = (map[cat] || 0) + e.amount;
    });
    const total = Object.values(map).reduce((sum, v) => sum + v, 0);
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount, percentage: total ? Math.round((amount / total) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // Recurring Expenses
  const [showRecurring, setShowRecurring] = useState(false);
  const recurringExpenses = useMemo(() => expenses.filter(e => e.isRecurring), [expenses]);

  // Editing state for expenses
  const [editingExpense, setEditingExpense] = useState(null);

  const handleAddExpense = (e, isRecurring = false) => {
    e.preventDefault();
    if (desc.trim() && amount > 0) {
      if (editingExpense) {
        editExpense(editingExpense.id, desc.trim(), Number(amount), category, selectedTags, isRecurring);
        setEditingExpense(null);
      } else {
        addExpense(desc.trim(), Number(amount), category, selectedTags, isRecurring);
      }
      setDesc(""); setAmount(""); setCategory(CATEGORIES[0]); setSelectedTags([]);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setDesc(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setSelectedTags(expense.tags || []);
  };

  const exportCSV = () => {
    const headers = "Type,Date,Description,Base Pay,Revenue,Amount,Category,Tags\n";
    const rows = [
      ...confirmedBookings.map(b => `Booking,${format(new Date(b.date), "yyyy-MM-dd")},${b.customerName},${b.basePay || 0},${b.totalRevenue || 0},,,`),
      ...expenses.map(e => `Expense,${format(new Date(e.date), "yyyy-MM-dd")},${e.description},,,-${e.amount},${e.category || "Other"},${e.tags?.join(',') || ''}`)
    ];
    const csv = headers + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, `financial-report-${format(now, "yyyy-MM-dd")}.csv`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

          {/* === PREMIUM HEADER === */}
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
                    Revenue: ₹{bookingStats.total.toLocaleString()} • Spent: ₹{expenseTotal.toLocaleString()} • Net Profit: ₹{netProfitTotal.toLocaleString()}
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

          {/* Recent Bookings Section */}
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

          {/* === ANIMATED TAB BAR === */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                      isActive
                        ? "text-indigo-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                    {isActive && (
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

          {/* === ANIMATED CONTENT === */}
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
                  bookingStats={bookingStats}
                  hourlyData={hourlyData}
                  topBookings={getTopBookings(startOfDay(now), endOfDay(now))}
                  goal={goals.daily}
                />
              )}
              {activeTab === "weekly" && (
                <WeeklyFunds
                  revenue={revenueByPeriod.weekly}
                  prevRevenue={revenueByPeriod.prevWeekly}
                  forecast={revenueByPeriod.forecastWeekly}
                  profit={profit.weekly}
                  dailyData={dailyDataWeekly}
                  topBookings={getTopBookings(startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }))}
                  goal={goals.weekly}
                />
              )}
              {activeTab === "monthly" && (
                <MonthlyFunds
                  revenue={revenueByPeriod.monthly}
                  prevRevenue={revenueByPeriod.prevMonthly}
                  forecast={revenueByPeriod.forecastMonthly}
                  profit={profit.monthly}
                  topBookings={getTopBookings(startOfMonth(now), endOfMonth(now))}
                  goal={goals.monthly}
                  bookings={confirmedBookings} // Pass confirmed bookings for heatmap
                />
              )}
              {activeTab === "yearly" && (
                <YearlyFunds
                  revenue={revenueByPeriod.yearly}
                  prevRevenue={revenueByPeriod.prevYearly}
                  forecast={revenueByPeriod.forecastYearly}
                  profit={profit.yearly}
                  monthlyData={monthlyDataYearly}
                  topBookings={getTopBookings(startOfYear(now), endOfYear(now))}
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
                  expenseTotal={expenseTotal}
                  categoryTotals={categoryTotals}
                  showRecurring={showRecurring}
                  setShowRecurring={setShowRecurring}
                  editingExpense={editingExpense}
                  handleEditExpense={handleEditExpense}
                  exportCSV={exportCSV}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* === CSS ANIMATIONS === */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease infinite;
        }
        .daily-bg { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%); }
        .weekly-bg { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #3b82f6 100%); }
        .monthly-bg { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #22c55e 100%); }
        .yearly-bg { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #a855f7 100%); }
        .expenses-bg { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #ef4444 100%); }
      `}</style>
    </DashboardLayout>
  );
};

// === DAILY FUNDS ===
const DailyFunds = ({ revenue, prevRevenue, forecast, profit, bookingStats, hourlyData, topBookings, goal }) => (
  <div className="space-y-6 daily-bg rounded-3xl p-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-amber-800 flex items-center gap-3">
        <Sun className="text-amber-600" /> Daily Timeline - {format(new Date('2025-11-07'), "MMM d, yyyy")}
      </h2>
      <div className="flex items-center gap-2 text-sm text-amber-700">
        <ClockIcon size={16} /> Live Updates
      </div>
    </div>

    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {hourlyData.map((hour, i) => (
          <motion.div
            key={hour.hour}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 p-3 rounded-xl shadow-md flex flex-col items-center min-w-[100px]"
          >
            <p className="text-xs text-gray-600">{hour.hour}</p>
            <p className={`text-lg font-bold ${hour.revenue > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
              ₹{hour.revenue.toLocaleString()}
            </p>
            {hour.revenue > 0 && <TrendingUp size={12} className="text-emerald-500" />}
          </motion.div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCardCompact stat={{ label: "Today", value: revenue, prev: prevRevenue, icon: TrendingUp, color: "emerald" }} />
      <StatCardCompact stat={{ label: "Forecast", value: forecast, icon: Zap, color: "blue" }} />
      <StatCardCompact stat={{ label: "Profit", value: profit, prev: profit - (revenue - prevRevenue), icon: DollarSign, color: profit >= 0 ? "green" : "red" }} />
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
        {topBookings.map((b, i) => (
          <li key={b.id} className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
            <span>{b.customerName} - {format(new Date(b.date), 'HH:mm')}</span>
            <span className="font-bold text-emerald-600">₹{Number(b.totalRevenue).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>

    {profit < 0 && (
      <AlertCard message="Daily dip detected! Consider promotions." color="amber" />
    )}
  </div>
);

// === WEEKLY FUNDS ===
const WeeklyFunds = ({ revenue, prevRevenue, forecast, profit, dailyData, topBookings, goal }) => (
  <div className="space-y-6 weekly-bg rounded-3xl p-6">
    <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-3">
      <CalendarDays className="text-blue-600" /> Weekly Grid Overview
    </h2>

    <div className="grid grid-cols-7 gap-2">
      {dailyData.map((day, i) => (
        <motion.div
          key={day.day}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-3 rounded-xl border-2 ${day.profit >= 0 ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}
        >
          <p className="text-xs font-medium text-gray-700">{day.day}</p>
          <p className="text-sm font-bold text-emerald-600">₹{day.revenue.toLocaleString()}</p>
          <p className={`text-xs ${day.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {day.profit >= 0 ? `+₹${day.profit}` : `-₹${Math.abs(day.profit)}`}
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
          <p className="text-gray-700">{dailyData.reduce((sum, d) => sum + (d.revenue > 0 ? 1 : 0), 0)}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-purple-600">Avg Daily</p>
          <p className="text-gray-700">₹{Math.round(revenue / 7).toLocaleString()}</p>
        </div>
      </div>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {topBookings.slice(0, 3).map(b => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  </div>
);

// === MONTHLY FUNDS - FULLY FIXED ===
const MonthlyFunds = ({ revenue, prevRevenue, forecast, profit, topBookings, goal, bookings }) => {
  const now = new Date('2025-11-07');
  const monthlyDailyData = useMemo(() => {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(day => {
      const dayBookings = bookings.filter(b => {
        const d = new Date(b.date);
        return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
      });
      const rev = dayBookings.reduce((s, b) => s + Number(b.totalRevenue), 0);
      return { day: day.getDate(), revenue: rev };
    });
  }, [bookings, now]);

  const maxRevenue = Math.max(...monthlyDailyData.map(d => d.revenue), 1);
  const trendData = monthlyDailyData.map(d => ({ label: d.day, value: d.revenue }));

  return (
    <div className="space-y-6 monthly-bg rounded-3xl p-6">
      <h2 className="text-2xl font-bold text-green-800 flex items-center gap-3">
        <CalendarRange className="text-green-600" /> Monthly Heatmap
      </h2>

      {/* Heatmap */}
      <div className="grid grid-cols-7 gap-1">
        {monthlyDailyData.map(d => {
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

      {/* Trend Chart */}
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
          {topBookings.map((b, i) => (
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

// === YEARLY FUNDS ===
const YearlyFunds = ({ revenue, prevRevenue, forecast, profit, monthlyData, topBookings, goal }) => (
  <div className="space-y-6 yearly-bg rounded-3xl p-6">
    <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-3">
      <CalendarCheck className="text-purple-600" /> Yearly Layers
    </h2>

    <div className="space-y-4">
      {monthlyData.map((month, i) => (
        <motion.div
          key={month.month}
          initial={{ height: 0 }}
          animate={{ height: 60 }}
          className="bg-white/70 rounded-xl p-3 flex justify-between items-center shadow-md"
        >
          <p className="font-semibold text-purple-700">{month.month}</p>
          <div className="flex items-center gap-4">
            <p className="text-emerald-600 font-bold">₹{month.revenue.toLocaleString()}</p>
            <div className="w-20 bg-purple-100 rounded-full h-4">
              <div className="bg-purple-500 h-4 rounded-full" style={{ width: `${(month.revenue / Math.max(...monthlyData.map(m => m.revenue))) * 100}%` }} />
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
          {[1,2,3,4].map(q => {
            const qRevenue = monthlyData.slice((q-1)*3, q*3).reduce((sum, m) => sum + m.revenue, 0);
            const qProfit = monthlyData.slice((q-1)*3, q*3).reduce((sum, m) => sum + m.profit, 0);
            return (
              <tr key={q} className="border-t">
                <td className="p-3">Q{q}</td>
                <td className="p-3 text-right text-emerald-600 font-bold">₹{qRevenue.toLocaleString()}</td>
                <td className="p-3 text-right font-bold">{qProfit >= 0 ? <span className="text-green-600">+₹{qProfit.toLocaleString()}</span> : <span className="text-red-600">-₹{Math.abs(qProfit).toLocaleString()}</span>}</td>
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

// === EXPENSE TRACKER ===
const ExpenseTracker = ({ expenses, recurringExpenses, removeExpense, handleAddExpense, desc, setDesc, amount, setAmount, category, setCategory, selectedTags, setSelectedTags, expenseTotal, categoryTotals, showRecurring, setShowRecurring, editingExpense, handleEditExpense, exportCSV }) => (
  <div className="space-y-6 expenses-bg rounded-3xl p-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-red-800 flex items-center gap-3">
        <Receipt className="text-red-600" /> Advanced Expense Manager
      </h2>
      <div className="text-xl font-bold text-red-700">Total: ₹{expenseTotal.toLocaleString()}</div>
    </div>

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-2xl shadow-lg border border-red-100">
      <form onSubmit={(e) => handleAddExpense(e, true)} className="space-y-4">
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
            {TAGS.map(tag => (
              <button key={tag} type="button" onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} className={`px-3 py-1 rounded-full text-xs font-medium transition ${selectedTags.includes(tag) ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <label className="flex items-center gap-2 text-sm text-red-600">
            <input type="checkbox" className="rounded text-red-500" /> Recurring
          </label>
          <button type="button" onClick={() => setShowRecurring(!showRecurring)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${showRecurring ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
            <Repeat size={16} /> {showRecurring ? 'Show All' : 'Recurring'}
          </button>
          <button type="submit" className="ml-auto flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 shadow-md">
            {editingExpense ? <Edit3 size={16} /> : <Plus size={16} />} {editingExpense ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
      {editingExpense && (
        <button onClick={() => { setEditingExpense(null); setDesc(""); setAmount(""); setCategory(CATEGORIES[0]); setSelectedTags([]); }} className="text-sm text-red-500 underline mt-2">
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
        <h3 className="text-lg font-semibold text-red-800 mb-4">Transactions ({showRecurring ? recurringExpenses.length : expenses.length})</h3>
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

// === SHARED COMPONENTS ===
const StatCardCompact = ({ stat }) => {
  const change = stat.prev ? ((stat.value - stat.prev) / stat.prev * 100) : 0;
  const Icon = stat.icon;
  const color = stat.color;
  return (
    <div className={`p-4 rounded-xl bg-white shadow-md flex flex-col items-center gap-2 text-${color}-600`}>
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