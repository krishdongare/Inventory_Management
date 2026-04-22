import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'manager', 'warehouse', 'sales'] },
    { to: '/inventory', label: 'Inventory', roles: ['admin', 'manager', 'warehouse', 'sales'] },
    { to: '/orders', label: 'Orders', roles: ['admin', 'manager', 'sales'] },
    { to: '/suppliers', label: 'Suppliers', roles: ['admin', 'manager'] },
    { to: '/users', label: 'Users', roles: ['admin'] },
  ];

  const visibleLinks = navLinks.filter((l) => l.roles.includes(user?.role));

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.logo}>📦</span>
        <span style={styles.brandName}>InvenTrack</span>
      </div>

      {/* Desktop links */}
      <div style={styles.links}>
        {visibleLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{ ...styles.link, ...(isActive(l.to) ? styles.activeLink : {}) }}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div style={styles.userArea}>
        <span style={styles.roleTag}>{user?.role}</span>
        <span style={styles.userName}>{user?.name}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#1a1f2e',
    padding: '0 24px',
    height: '60px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: { display: 'flex', alignItems: 'center', gap: '8px' },
  logo: { fontSize: '22px' },
  brandName: { color: '#fff', fontWeight: '700', fontSize: '18px', letterSpacing: '0.5px' },
  links: { display: 'flex', gap: '4px' },
  link: {
    color: '#a0aec0',
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  activeLink: { color: '#fff', background: '#3b82f6' },
  userArea: { display: 'flex', alignItems: 'center', gap: '12px' },
  roleTag: {
    background: '#2d3748',
    color: '#68d391',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  userName: { color: '#e2e8f0', fontSize: '14px' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #4a5568',
    color: '#a0aec0',
    padding: '5px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
  },
};

export default Navbar;
