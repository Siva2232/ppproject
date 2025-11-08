// src/components/FundsChart.jsx
import { useMemo } from "react";
import { useBooking } from "../context/BookingContext";
import { useExpense } from "../context/ExpenseContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  format,
  startOfDay,
  subDays,
  startOfWeek,
  subWeeks,
  startOfMonth,
  subMonths,
  startOfYear,
  subYears,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
} from "date-fns";

const FundsChart = ({ period = "daily" }) => {
  const { bookings = [] } = useBooking();
  const { expenses = [] } = useExpense();

  const data = useMemo(() => {
    const now = new Date();
    let interval = { start: now, end: now };
    let labelFormat = "MMM d";
    let getDates;

    // Define time range and formatting based on period
    switch (period) {
      case "daily":
        interval.start = subDays(now, 6);
        labelFormat = "MMM d";
        getDates = () => eachDayOfInterval(interval);
        break;

      case "weekly":
        interval.start = subWeeks(startOfWeek(now), 3);
        interval.end = startOfWeek(now);
        labelFormat = "'W'w yyyy";
        getDates = () => eachWeekOfInterval(interval, { weekStartsOn: 1 });
        break;

      case "monthly":
        interval.start = subMonths(startOfMonth(now), 11);
        labelFormat = "MMM yyyy";
        getDates = () => eachMonthOfInterval(interval);
        break;

      case "yearly":
        interval.start = subYears(startOfYear(now), 2);
        labelFormat = "yyyy";
        getDates = () => eachYearOfInterval(interval);
        break;

      default:
        interval.start = subDays(now, 6);
        getDates = () => eachDayOfInterval(interval);
    }

    // Generate all date points in the interval
    const datePoints = getDates();
    const dataMap = new Map();

    // Initialize map with zeroed values
    datePoints.forEach((date) => {
      const key = format(date, "yyyy-MM-dd");
      dataMap.set(key, {
        date: format(date, labelFormat),
        revenue: 0,
        expenses: 0,
      });
    });

    // Aggregate bookings
    bookings.forEach((b) => {
      const date = startOfDay(new Date(b.date));
      if (date >= interval.start && date <= now) {
        const key = format(date, "yyyy-MM-dd");
        const entry = dataMap.get(key);
        if (entry) entry.revenue += Number(b.amount) || 0;
      }
    });

    // Aggregate expenses
    expenses.forEach((e) => {
      const date = startOfDay(new Date(e.date));
      if (date >= interval.start && date <= now) {
        const key = format(date, "yyyy-MM-dd");
        const entry = dataMap.get(key);
        if (entry) entry.expenses += Number(e.amount) || 0;
      }
    });

    // Convert to array and calculate profit
    return Array.from(dataMap.values()).map((item) => ({
      ...item,
      profit: item.revenue - item.expenses,
    }));
  }, [bookings, expenses, period]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-gray-600" />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-gray-600"
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value) => `$${Number(value).toLocaleString()}`}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            backdropFilter: "blur(4px)",
          }}
          labelStyle={{ fontWeight: "bold", color: "#1f2937" }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          name="Revenue"
          strokeWidth={2}
          dot={{ fill: "#10b981", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          name="Expenses"
          strokeWidth={2}
          dot={{ fill: "#ef4444", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#6366f1"
          name="Profit"
          strokeWidth={3}
          dot={{ fill: "#6366f1", r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FundsChart;