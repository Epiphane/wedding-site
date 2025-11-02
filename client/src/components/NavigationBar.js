import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NavigationBar({ isAuthenticated }) {
  const location = useLocation();

  const navLink = (href, label, isActive) => (
    <Link
      to={href}
      style={{
        textDecoration: 'none',
        color: '#333',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: '0.95em',
        padding: '5px 0',
        borderBottom: isActive ? '2px solid #333' : '2px solid transparent',
        transition: 'border-color 0.2s'
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav
      style={{
        background: 'white',
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0',
        padding: '15px 0'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '40px',
          flexWrap: 'wrap'
        }}
      >
        {navLink('/', 'Home', location.pathname === '/')}
        {navLink('/travel', 'Travel', location.pathname === '/travel')}
        {navLink('/schedule', 'Schedule', location.pathname === '/schedule')}
        {navLink('/rsvp', 'RSVP', location.pathname === '/rsvp')}
        {isAuthenticated && navLink('/admin', 'Admin', location.pathname === '/admin')}
        {navLink('/canvas', 'Canvas', location.pathname === '/canvas')}
      </div>
    </nav>
  );
}
