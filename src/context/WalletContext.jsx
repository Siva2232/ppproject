// src/context/WalletContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

// ──────────────────────────────────────────────────────────────
// 1. CONTEXT & HOOK
// ──────────────────────────────────────────────────────────────
const WalletContext = createContext();

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};

// ──────────────────────────────────────────────────────────────
// 2. NAMED EXPORTS: PLATFORM & WALLET_KEYS
// ──────────────────────────────────────────────────────────────
export const PLATFORM = {
  ALHIND: "Alhind",
  AKBAR: "Akbar",
  DIRECT: "Direct",
};

export const WALLET_KEYS = {
  ALHIND: "alhind",
  AKBAR: "akbar",
  OFFICE: "office",
};

// ──────────────────────────────────────────────────────────────
// 3. PROVIDER
// ──────────────────────────────────────────────────────────────
export const WalletProvider = ({ children }) => {
  const defaultWallets = { alhind: 0, akbar: 0, office: 0 };

  // Load from localStorage
  const [wallets, setWallets] = useState(() => {
    const saved = localStorage.getItem("wallets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          alhind: Number(parsed.alhind) || 0,
          akbar: Number(parsed.akbar) || 0,
          office: Number(parsed.office) || 0,
        };
      } catch {
        return defaultWallets;
      }
    }
    return defaultWallets;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("walletTransactions");
    return saved ? JSON.parse(saved) : [];
  });

  // ──────────────────────────────────────────────────────────────
  // 4. PERSISTENCE
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("wallets", JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem("walletTransactions", JSON.stringify(transactions));
  }, [transactions]);

  // ──────────────────────────────────────────────────────────────
  // 5. CORE WALLET UPDATE
  // ──────────────────────────────────────────────────────────────
  const updateWallet = (walletKey, amount, operation = "add") => {
    setWallets((prev) => {
      const current = Number(prev[walletKey] ?? 0);
      const delta = Number(amount) || 0;
      const updated = operation === "add" ? current + delta : current - delta;
      return { ...prev, [walletKey]: Math.max(0, updated) };
    });
  };

  // ──────────────────────────────────────────────────────────────
  // 6. PUBLIC ACTIONS
  // ──────────────────────────────────────────────────────────────
  const addToWallet = (walletKey, amount, user = "System", metadata = {}) => {
    if (!walletKey || amount <= 0) return;
    updateWallet(walletKey, amount, "add");
    logTransaction(walletKey, amount, "credit", user, metadata);
  };

  const deductFromWallet = (walletKey, amount, user = "System", metadata = {}) => {
    if (!walletKey || amount <= 0) return;
    const current = Number(wallets[walletKey] ?? 0);
    if (current < amount) {
      throw new Error(
        `Insufficient balance in ${walletKey}. Available: ₹${current.toFixed(2)}, Required: ₹${amount.toFixed(2)}`
      );
    }
    updateWallet(walletKey, amount, "deduct");
    logTransaction(walletKey, amount, "debit", user, metadata);
  };

  const logTransaction = (walletKey, amount, operation, user = "Unknown", metadata = {}) => {
    setTransactions((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        walletKey,
        amount: Number(amount),
        operation, // "credit" | "debit"
        user,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    ]);
  };

  // ──────────────────────────────────────────────────────────────
  // 7. BOOKING: APPLY (on confirm)
  // ──────────────────────────────────────────────────────────────
  const applyBookingWallet = (booking, user = "Add Booking") => {
    if (!booking?.platform || booking.platform === PLATFORM.DIRECT) return;

    const platformKey =
      booking.platform === PLATFORM.ALHIND
        ? WALLET_KEYS.ALHIND
        : booking.platform === PLATFORM.AKBAR
        ? WALLET_KEYS.AKBAR
        : null;

    const meta = { bookingId: booking.id, action: "apply" };

    if (platformKey) {
      if (booking.basePay > 0) {
        deductFromWallet(platformKey, booking.basePay, user, meta);
      }
      if (booking.commissionAmount > 0) {
        addToWallet(platformKey, booking.commissionAmount, user, meta);
      }
    }

    const officeIncome = (booking.basePay || 0) + (booking.markupAmount || 0);
    if (officeIncome > 0) {
      addToWallet(WALLET_KEYS.OFFICE, officeIncome, user, meta);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 8. BOOKING: REVERSE (on edit/update)
  // ──────────────────────────────────────────────────────────────
  const reverseBookingWallet = (booking, user = "Edit Booking") => {
    if (!booking?.platform || booking.platform === PLATFORM.DIRECT) return;

    const platformKey =
      booking.platform === PLATFORM.ALHIND
        ? WALLET_KEYS.ALHIND
        : booking.platform === PLATFORM.AKBAR
        ? WALLET_KEYS.AKBAR
        : null;

    const meta = { bookingId: booking.id, action: "reverse" };

    if (platformKey) {
      if (booking.basePay > 0) {
        addToWallet(platformKey, booking.basePay, user, meta);
      }
      if (booking.commissionAmount > 0) {
        deductFromWallet(platformKey, booking.commissionAmount, user, meta);
      }
    }

    const officeRefund = (booking.basePay || 0) + (booking.markupAmount || 0);
    if (officeRefund > 0) {
      deductFromWallet(WALLET_KEYS.OFFICE, officeRefund, user, meta);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 9. REFUND: ON CANCEL
  // ──────────────────────────────────────────────────────────────
  const refundBookingOnCancel = (booking, user = "Cancel Booking") => {
    if (!booking?.platform || booking.platform === PLATFORM.DIRECT) return;

    const platformKey =
      booking.platform === PLATFORM.ALHIND
        ? WALLET_KEYS.ALHIND
        : booking.platform === PLATFORM.AKBAR
        ? WALLET_KEYS.AKBAR
        : null;

    if (platformKey && booking.basePay > 0) {
      addToWallet(platformKey, booking.basePay, user, {
        bookingId: booking.id,
        action: "refund_on_cancel",
        description: "Base pay refunded on cancellation",
      });
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 10. REFUND: ON UN-CONFIRM
  // ──────────────────────────────────────────────────────────────
  const refundBookingWallet = (booking, user = "Unconfirm") => {
    if (!booking?.platform || booking.platform === PLATFORM.DIRECT) return;

    const platformKey =
      booking.platform === PLATFORM.ALHIND
        ? WALLET_KEYS.ALHIND
        : booking.platform === PLATFORM.AKBAR
        ? WALLET_KEYS.AKBAR
        : null;

    const meta = { bookingId: booking.id, action: "refund_unconfirm" };

    if (platformKey) {
      if (booking.basePay > 0) {
        addToWallet(platformKey, booking.basePay, user, meta);
      }
      if (booking.commissionAmount > 0) {
        deductFromWallet(platformKey, booking.commissionAmount, user, meta);
      }
    }

    const officeRefund = (booking.basePay || 0) + (booking.markupAmount || 0);
    if (officeRefund > 0) {
      deductFromWallet(WALLET_KEYS.OFFICE, officeRefund, user, meta);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 11. REFUND: ON DELETE
  // ──────────────────────────────────────────────────────────────
  const refundBookingOnDelete = (booking, user = "Delete Booking") => {
    if (!booking?.platform || booking.platform === PLATFORM.DIRECT) return;

    const platformKey =
      booking.platform === PLATFORM.ALHIND
        ? WALLET_KEYS.ALHIND
        : booking.platform === PLATFORM.AKBAR
        ? WALLET_KEYS.AKBAR
        : null;

    const meta = { bookingId: booking.id, action: "refund_on_delete" };

    if (platformKey) {
      if (booking.basePay > 0) {
        addToWallet(platformKey, booking.basePay, user, meta);
      }
      if (booking.commissionAmount > 0) {
        deductFromWallet(platformKey, booking.commissionAmount, user, meta);
      }
    }

    const officeRefund = (booking.basePay || 0) + (booking.markupAmount || 0);
    if (officeRefund > 0) {
      deductFromWallet(WALLET_KEYS.OFFICE, officeRefund, user, meta);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 12. EXPENSE: DEBIT FROM OFFICE
  // ──────────────────────────────────────────────────────────────
  const debitOfficeForExpense = (expense, user = "Expense") => {
    if (!expense?.amount || expense.amount <= 0) return;

    const meta = {
      expenseId: expense.id,
      description: expense.description,
      category: expense.category,
      action: "expense_debit",
    };

    deductFromWallet(WALLET_KEYS.OFFICE, expense.amount, user, meta);
  };

  // ──────────────────────────────────────────────────────────────
  // 13. SAFE GETTERS
  // ──────────────────────────────────────────────────────────────
  const getWallet = (key) => Number(wallets[key] ?? 0);

  const formatWallet = (key) =>
    getWallet(key).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ──────────────────────────────────────────────────────────────
  // 14. UI-READY DATA
  // ──────────────────────────────────────────────────────────────
  const walletData = [
    { name: "AlHind", amount: getWallet("alhind"), key: "alhind", formatted: formatWallet("alhind") },
    { name: "Akbar", amount: getWallet("akbar"), key: "akbar", formatted: formatWallet("akbar") },
    { name: "Office Fund", amount: getWallet("office"), key: "office", formatted: formatWallet("office") },
  ];

  // ──────────────────────────────────────────────────────────────
  // 15. PROVIDER VALUE
  // ──────────────────────────────────────────────────────────────
  return (
    <WalletContext.Provider
      value={{
        walletData,
        wallets,
        transactions,

        // Core
        addToWallet,
        deductFromWallet,
        logTransaction,

        // Booking
        applyBookingWallet,
        reverseBookingWallet,
        refundBookingOnCancel,
        refundBookingWallet,
        refundBookingOnDelete,

        // Expense
        debitOfficeForExpense,

        // Helpers
        getWallet,
        formatWallet,

        // Constants (exported above, but also in value for convenience)
        PLATFORM,
        WALLET_KEYS,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};