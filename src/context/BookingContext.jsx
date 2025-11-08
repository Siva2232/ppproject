// src/context/BookingContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export const CATEGORY = {
  FLIGHT: "flight",
  BUS: "bus",
  TRAIN: "train",
  CAB: "cab",
  HOTEL: "hotel",
};

export const STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
};

const BookingContext = createContext(undefined);

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem("bookings");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to load bookings", e);
      toast.error("Failed to load saved bookings");
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bookings", JSON.stringify(bookings));
    } catch (e) {
      console.error("Failed to save bookings", e);
    }
  }, [bookings]);

  // === ADD BOOKING ===
  const addBooking = (rawBooking) => {
    const {
      customerName,
      email,
      contactNumber,
      date,
      basePay = 0,
      commissionAmount = 0,
      markupAmount = 0,
      platform = "",
      status = STATUS.PENDING,
      category = CATEGORY.FLIGHT,
    } = rawBooking;

    // Validation
    if (!customerName?.trim()) throw new Error("Customer name is required");
    if (!email?.trim() || !/^\S+@\S+\.\S+$/.test(email))
      throw new Error("Valid email is required");
    if (!contactNumber?.trim()) throw new Error("Contact number is required");
    if (!date) throw new Error("Date is required");

    if (basePay < 0) throw new Error("Base pay cannot be negative");
    if (commissionAmount < 0) throw new Error("Commission cannot be negative");
    if (markupAmount < 0) throw new Error("Markup cannot be negative");

    if (!Object.values(CATEGORY).includes(category))
      throw new Error("Invalid category");
    if (!Object.values(STATUS).includes(status))
      throw new Error("Invalid status");

    // Platform required for non-direct
    if (platform !== "Direct" && !platform)
      throw new Error("Platform is required for non-direct bookings");

    const base = Number(basePay);
    const comm = Number(commissionAmount);
    const mark = Number(markupAmount);

    const totalRevenue = parseFloat((base + comm + mark).toFixed(2));

    // NET PROFIT LOGIC
    const netProfit = platform === "Direct"
      ? parseFloat((base + mark).toFixed(2))           // Direct: base + markup
      : parseFloat((comm + mark).toFixed(2));          // Indirect: commission + markup

    const newBooking = {
      id: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 12),
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      contactNumber: contactNumber.trim(),
      date,
      basePay: base,
      commissionAmount: comm,
      markupAmount: mark,
      totalRevenue,
      netProfit,
      platform: platform || "Direct",
      status,
      category,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [...prev, newBooking]);
    toast.success("Booking added successfully!");
    return newBooking;
  };

  // === REMOVE BOOKING ===
  const removeBooking = (id) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) throw new Error("Booking not found");

    setBookings((prev) => prev.filter((b) => b.id !== id));
    toast.success(`Booking #${id} removed`);
  };

  // === UPDATE STATUS ONLY ===
  const updateBookingStatus = (id, newStatus) => {
    if (!Object.values(STATUS).includes(newStatus))
      throw new Error("Invalid status");

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );

    const booking = bookings.find(b => b.id === id);
    const name = booking?.customerName?.split(" ")[0] || "Booking";

    const msg = newStatus === STATUS.CONFIRMED
      ? `${name}'s booking confirmed`
      : newStatus === STATUS.CANCELLED
      ? `${name}'s booking cancelled`
      : `${name}'s booking pending`;

    toast.success(msg);
  };

  // === FULL UPDATE (Edit Booking) ===
  const updateBooking = (updatedBooking) => {
    const {
      id,
      basePay = 0,
      commissionAmount = 0,
      markupAmount = 0,
      platform = "",
      status,
      category,
    } = updatedBooking;

    const base = Number(basePay);
    const comm = Number(commissionAmount);
    const mark = Number(markupAmount);

    const totalRevenue = parseFloat((base + comm + mark).toFixed(2));
    const netProfit = platform === "Direct"
      ? parseFloat((base + mark).toFixed(2))
      : parseFloat((comm + mark).toFixed(2));

    const recalculated = {
      ...updatedBooking,
      basePay: base,
      commissionAmount: comm,
      markupAmount: mark,
      totalRevenue,
      netProfit,
      platform: platform || "Direct",
      status: status || STATUS.PENDING,
      category: category || CATEGORY.FLIGHT,
    };

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? recalculated : b))
    );

    toast.success("Booking updated successfully!");
    return recalculated;
  };

  // === GET BY ID ===
  const getBookingById = (id) => bookings.find((b) => b.id === id);

  // === STATS (ONLY CONFIRMED COUNT FOR REVENUE & PROFIT) ===
  const getStats = () => {
    const confirmedBookings = bookings.filter(b => b.status === STATUS.CONFIRMED);

    const total = bookings.length;
    const pending = bookings.filter(b => b.status === STATUS.PENDING).length;
    const confirmed = confirmedBookings.length;
    const cancelled = total - pending - confirmed;

    const revenue = confirmedBookings.reduce((s, b) => s + (b.totalRevenue || 0), 0);
    const netProfitTotal = confirmedBookings.reduce((s, b) => s + (b.netProfit || 0), 0);
    const basePayTotal = confirmedBookings.reduce((s, b) => s + (b.basePay || 0), 0);

    return {
      total,
      pending,
      confirmed,
      cancelled,
      revenue,
      netProfitTotal,
      basePayTotal,
    };
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        addBooking,
        removeBooking,
        updateBookingStatus,
        updateBooking,
        getBookingById,
        getStats,
        isLoading: false,
        CATEGORY,
        STATUS,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// Custom Hook
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within BookingProvider");
  return context;
};