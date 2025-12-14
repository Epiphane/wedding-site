import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function NavigationBar(): JSX.Element {
  const location = useLocation();
  const { isAuthenticated, guestInfo, logout } = useApp();

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
        {guestInfo && <a onClick={logout} style={{ cursor: 'pointer' }}>{guestInfo.firstName} {guestInfo.lastName}</a>}
      </div>
    </nav>
  );
}
