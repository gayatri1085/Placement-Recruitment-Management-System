import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { state, logout } = useApp();
  const loc = useLocation();
  const isOfficer = ['admin', 'placement_officer'].includes(state.authUser?.role);

  const navLinks = [
    { to: '/dashboard', label: '🏠 Dashboard' },
    { to: '/students', label: '👤 Students' },
    { to: '/companies', label: '🏢 Companies' },
    { to: '/drives', label: '📅 Drives' },
    { to: '/applications', label: '📋 Applications' },
    ...(isOfficer ? [{ to: '/analytics', label: '📊 Analytics' }] : []),
  ];

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="nav-brand">🎓 PlacementPro</div>
      <div className="nav-links">
        {navLinks.map(l => (
          <Link key={l.to} to={l.to} className={`nav-link ${loc.pathname === l.to ? 'active' : ''}`}>{l.label}</Link>
        ))}
      </div>
      <div className="nav-user">
        <span className="nav-role-badge">{state.authUser?.role}</span>
        <span className="nav-name">{state.authUser?.name}</span>
        <button onClick={logout} className="btn-logout" data-testid="logout-btn">Logout</button>
      </div>
    </nav>
  );
}
