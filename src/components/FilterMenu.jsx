const FilterMenu = () => {
  return (
    <div className="flex gap-3 items-center">
      <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
        <option>All Types</option>
        <option>Flight</option>
        <option>Train</option>
        <option>Bus</option>
      </select>
      <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
        <option>All Status</option>
        <option>Pending</option>
        <option>Confirmed</option>
        <option>Completed</option>
      </select>
    </div>
  );
};

export default FilterMenu;
