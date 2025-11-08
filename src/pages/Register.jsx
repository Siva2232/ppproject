import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
        <form className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
