import DashboardLayout from "../../components/DashboardLayout";
import FundsChart from "../../components/FundsChart";
import { useFunds } from "../../context/FundsContext";

const MonthlyFunds = () => {
  const { totals } = useFunds();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Monthly Funds</h1>
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <FundsChart />
          <p className="mt-4 text-gray-800 font-semibold">
            Total Monthly Revenue: ₹{totals.monthly.toFixed(2)}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MonthlyFunds;
