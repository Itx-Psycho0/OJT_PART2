import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="glass-nav navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FileText className="navbar-icon" size={28} color="#3b82f6" />
          <span className="navbar-title">GDocs Clone</span>
        </Link>
        <div className="navbar-actions">
          <button className="btn btn-ghost profile-btn">
            <User size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
