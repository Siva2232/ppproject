import DashboardLayout from "../../components/DashboardLayout";
import FundsChart from "../../components/FundsChart";
import { useFunds } from "../../context/FundsContext";

const WeeklyFunds = () => {
  const { totals } = useFunds();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Weekly Funds</h1>
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <p className="text-gray-600 mb-4">Track your weekly financial trends.</p>
          <FundsChart />
          <p className="mt-4 text-gray-800 font-semibold">
            Estimated Weekly Revenue: ₹{totals.weekly.toFixed(2)}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WeeklyFunds;
