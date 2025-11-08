const StatusUpdater = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Update Booking Status
      </h3>
      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
        <option>Pending</option>
        <option>Confirmed</option>
        <option>Completed</option>
      </select>
      <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition">
        Update
      </button>
    </div>
  );
};

export default StatusUpdater;
