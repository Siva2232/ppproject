import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <p className="text-gray-600 text-lg mb-6">Oops! The page you’re looking for doesn’t exist.</p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
