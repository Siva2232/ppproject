const BookingCard = ({ title, count, icon: Icon }) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-800">{count}</p>
      </div>
      {Icon && (
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default BookingCard;
