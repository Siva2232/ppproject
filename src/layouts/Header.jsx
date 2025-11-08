// import React, { useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// const Header = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   return (
//     <header className="bg-white shadow">
//       <div className="max-w-7xl mx-auto flex justify-between items-center p-4 md:p-6">
//         <Link to="/" className="text-2xl font-bold text-pink-600">Hotel CRM</Link>

//         <nav className="space-x-6 hidden md:flex items-center">
//           <Link to="/" className="hover:text-pink-600">Home</Link>
//           <Link to="/about" className="hover:text-pink-600">About</Link>
//           <Link to="/services" className="hover:text-pink-600">Services</Link>
//           <Link to="/contact" className="hover:text-pink-600">Contact</Link>

//           {user ? (
//             <>
//               <span className="text-gray-700">Hi, {user.username}</span>
//               <button
//                 onClick={() => logout(navigate)}
//                 className="text-white bg-pink-600 px-4 py-2 rounded hover:bg-pink-700"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <Link to="/login" className="text-white bg-pink-600 px-4 py-2 rounded hover:bg-pink-700">Login</Link>
//           )}
//         </nav>
//       </div>
//     </header>
//   );
// };

// export default Header;
