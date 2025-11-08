import { Search } from "lucide-react";

const SearchBar = () => (
  <div className="relative w-full max-w-sm">
    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
    <input
      type="text"
      placeholder="Search bookings..."
      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

export default SearchBar;
