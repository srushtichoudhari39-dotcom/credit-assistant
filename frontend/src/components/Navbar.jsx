import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Sparkles, 
  LayoutDashboard, 
  SlidersHorizontal, 
  History, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

const Navbar = ({ onOpenAIAdvisor }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="brand-logo">
          <div className="brand-icon">
            <CreditCard size={20} />
          </div>
          <div>
            <span>Credit Assistant</span>
            <span style={{ 
              fontSize: '0.65rem', 
              background: '#e0e7ff', 
              color: '#3730a3', 
              padding: '2px 6px', 
              borderRadius: '4px', 
              marginLeft: '6px',
              fontWeight: 700,
              verticalAlign: 'middle'
            }}>
              INDIA (₹)
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated ? (
          <div className="nav-links" style={{ display: 'flex' }}>
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LayoutDashboard size={17} />
              Dashboard
            </Link>

            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <SlidersHorizontal size={17} />
              Financial Profile
            </Link>

            <Link 
              to="/history" 
              className={`nav-link ${isActive('/history') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <History size={17} />
              Credit History
            </Link>

            {onOpenAIAdvisor && (
              <button 
                onClick={onOpenAIAdvisor}
                className="btn btn-ai btn-sm"
                title="Get AI Financial Guidance"
              >
                <Sparkles size={16} />
                Ask AI Advisor
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {user?.name?.split(' ')[0] || 'User'}
              </div>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary btn-sm"
                title="Log out"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
