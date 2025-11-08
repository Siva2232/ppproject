const StatusBadge = ({ status }) => {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default StatusBadge;
