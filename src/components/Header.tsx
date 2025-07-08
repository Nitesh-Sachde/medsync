
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X, User, Calendar, MessageSquare, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="medical-gradient p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MedSync</h1>
              <p className="text-xs text-gray-500">Smart Healthcare</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Home</Link>
            <Link to="/appointments" className="text-gray-700 hover:text-primary transition-colors">Appointments</Link>
            <a href="#services" className="text-gray-700 hover:text-primary transition-colors">Services</a>
            <a href="#about" className="text-gray-700 hover:text-primary transition-colors">About</a>
            <a href="#contact" className="text-gray-700 hover:text-primary transition-colors">Contact</a>
            {user?.role === 'super-admin' && (
              <Link to="/superadmin" className="text-blue-700 font-semibold hover:text-blue-900 transition-colors">Super Admin</Link>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors" onClick={handleLogout}>
                <User className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/appointments">
                  <Button className="medical-gradient text-white hover:opacity-90 transition-opacity">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors px-2 py-1">Home</Link>
              <Link to="/appointments" className="text-gray-700 hover:text-primary transition-colors px-2 py-1">Appointments</Link>
              <a href="#services" className="text-gray-700 hover:text-primary transition-colors px-2 py-1">Services</a>
              <a href="#about" className="text-gray-700 hover:text-primary transition-colors px-2 py-1">About</a>
              <a href="#contact" className="text-gray-700 hover:text-primary transition-colors px-2 py-1">Contact</a>
              {user?.role === 'super-admin' && (
                <Link to="/superadmin" className="text-blue-700 font-semibold hover:text-blue-900 transition-colors px-2 py-1">Super Admin</Link>
              )}
              <div className="flex flex-col space-y-2 pt-4">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <User className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/appointments">
                      <Button className="medical-gradient text-white w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
