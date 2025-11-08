// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import AllBookings from "../pages/Bookings/AllBookings";
import TrackBooking from "../pages/Bookings/TrackBooking";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import SignIn from "../pages/SignIn";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import AddBooking from "../pages/Bookings/AddBooking";
import FundsDashboard from "../pages/FundsDashboard";
import AddRevenue from "../pages/InvestmentPage";
import LogExpense from "../pages/LogExpense";
import ViewExpense from "../pages/ViewExpense";
import CustomerDetails from "../pages/CustomerDetails";
import ViewBooking from "../pages/ViewBooking";
import Task from "../pages/Task";
import Notification from "../pages/Notification";
import AddWalletAmount from "../pages/AddWalletAmount";
import EditBooking from "../pages/EditBooking";
import EditHistory from "../pages/EditHistory";
// Contexts
import { BookingProvider } from "../context/BookingContext";
import { FundsProvider } from "../context/FundsContext";
import { ExpenseProvider } from "../context/ExpenseContext";
import { NotificationProvider } from "../context/NotificationContext";
import { TaskProvider } from "../context/TaskContext";
import { WalletProvider } from "../context/WalletContext";
const AppRoutes = () => {
  return (
    <BookingProvider>
      <FundsProvider>
        <ExpenseProvider>
          <NotificationProvider>
            <TaskProvider>
              <WalletProvider>
          <Routes>
            {/* Auth */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Bookings */}
            <Route path="/bookings" element={<AllBookings />} />
            <Route path="/bookings/track" element={<TrackBooking />} />
            <Route path="/bookings/add" element={<AddBooking />} />
            <Route path="/bookings/edit/:id" element={<EditBooking />} />
            <Route path="/bookings/history/:id" element={<EditHistory />} />  // ← ADD THIS
            <Route path="/customers" element={<CustomerDetails />} /> {/* Fixed */}
            <Route path="/bookings/view/:id" element={<ViewBooking />} />

            {/* Funds + Expenses */}
            <Route path="/funds" element={<FundsDashboard />} />
            <Route path="/add-wallet-amount" element={<AddWalletAmount />} />
            <Route path="/add-revenue" element={<AddRevenue />} />
            <Route path="/log-expense" element={<LogExpense />} />
            <Route path="/view/:id" element={<ViewExpense />} />

            <Route path="/tasks" element={<Task />} /> {/* <-- Added */}
            <Route path="/notifications" element={<Notification />} /> {/* <-- Added */}
            {/* Reports & Settings */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
              </WalletProvider>
            </TaskProvider>
          </NotificationProvider>
        </ExpenseProvider>
      </FundsProvider>
    </BookingProvider>
  );
};

export default AppRoutes;