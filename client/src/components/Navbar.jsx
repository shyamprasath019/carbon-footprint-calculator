// File: src/components/Navbar.jsx
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-green-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">CarbonTracker</Link>
        
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-green-200 transition-colors">
                Dashboard
              </Link>
              <Link to="/calculator" className="hover:text-green-200 transition-colors">
                Calculator
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-white text-green-700 px-4 py-1 rounded hover:bg-green-100 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-200 transition-colors">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-white text-green-700 px-4 py-1 rounded hover:bg-green-100 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;