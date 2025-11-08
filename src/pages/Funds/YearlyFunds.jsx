import DashboardLayout from "../../components/DashboardLayout";
import FundsChart from "../../components/FundsChart";
import { useFunds } from "../../context/FundsContext";

const YearlyFunds = () => {
  const { totals } = useFunds();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Yearly Funds</h1>
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <FundsChart />
          <p className="mt-4 text-gray-800 font-semibold">
            Projected Yearly Revenue: ₹{totals.yearly.toFixed(2)}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default YearlyFunds;
