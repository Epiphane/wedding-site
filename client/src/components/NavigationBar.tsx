import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationBarProps {
  isAuthenticated: boolean;
}

export default function NavigationBar({ isAuthenticated }: NavigationBarProps): JSX.Element {
  const location = useLocation();

  const navLink = (href: string, label: string, isActive: boolean): JSX.Element => (
    <Link to={href} className={isActive ? "active" : ""}>
      {label}
    </Link>
  );

  return (
    <nav>
      <div>
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
