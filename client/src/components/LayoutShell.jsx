import { Link, Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore.js';

const allLinks = [
  { href: '/admin', label: 'Admin Dashboard', roles: ['admin'] },
  { href: '/analysis', label: 'Project Analysis', roles: ['admin'] },
  { href: '/admin/employee-checklist', label: 'Employee Checklist', roles: ['admin'] },
  { href: '/employee', label: 'Employee Portal', roles: ['employee', 'applicant'] },
  { href: '/employee/daily-chart', label: 'Daily Update Chart', roles: ['employee', 'applicant'] },
  { href: '/employee/checklist', label: 'Checklist', roles: ['employee', 'applicant'] },
  { href: '/client', label: 'Client Portal', roles: ['client'] },
];

const LayoutShell = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    // Clear all React Query cache
    queryClient.clear();
    // Call logout from auth store
    logout();
  };

  // Filter links based on user role
  const visibleLinks = allLinks.filter((link) => link.roles.includes(user?.role));

  return (
    <div className="layout-shell">
      <aside>
        <div className="brand">IFA EMS</div>
        <nav>
          {visibleLinks.map((link) => (
            <Link key={link.href} to={link.href} className={location.pathname.startsWith(link.href) ? 'active' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main>
        <header className="top-bar">
          <div>
            <strong>{user?.name}</strong> <span style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '0.875rem' }}>{user?.role}</span>
          </div>
          <button 
            type="button" 
            onClick={handleLogout}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </header>
        <section className="page-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default LayoutShell;

