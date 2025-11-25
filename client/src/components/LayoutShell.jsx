import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore.js';

const allLinks = [
  { href: '/admin', label: 'Admin Dashboard', roles: ['admin'] },
  { href: '/analysis', label: 'Project Analysis', roles: ['admin'] },
  { href: '/admin/employee-checklist', label: 'Employee Checklist', roles: ['admin'] },
  { href: '/admin/employee-info', label: 'Employee Info', roles: ['admin'] },
  { href: '/admin/chat', label: 'Chat Contacts', roles: ['admin'] },
  { href: '/employee', label: 'Employee Portal', roles: ['employee', 'applicant'] },
  { href: '/employee/daily-chart', label: 'Daily Update Chart', roles: ['employee', 'applicant'] },
  { href: '/employee/checklist', label: 'Checklist', roles: ['employee', 'applicant'] },
  { href: '/client', label: 'Client Portal', roles: ['client'] },
  { href: '/client/chat', label: 'Chat', roles: ['client'] },
];

const LayoutShell = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // Clear all React Query cache
    queryClient.clear();
    // Call logout from auth store
    logout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Filter links based on user role
  const visibleLinks = allLinks.filter((link) => link.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Mobile Menu Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-sky-500 to-purple-600 text-white p-2.5 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 w-60 h-screen bg-gradient-to-b from-sky-500 to-purple-600 text-white p-6 flex flex-col gap-4 overflow-y-auto z-40 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="text-xl font-bold text-white mb-2">IFA EMS</div>
        <nav className="flex flex-col gap-2">
          {visibleLinks.map((link) => (
            <Link 
              key={link.href} 
              to={link.href} 
              className={`text-white no-underline px-3 py-2 rounded-lg transition-all ${location.pathname.startsWith(link.href) ? 'bg-white bg-opacity-25 font-semibold' : 'hover:bg-white hover:bg-opacity-15'}`}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-60 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex justify-between items-center px-4 md:px-8 py-4 bg-white border-b-2 border-indigo-100 shadow-sm">
          <div className="flex items-center gap-3 ml-12 md:ml-0">
            <strong className="text-gray-900 text-sm md:text-base">{user?.name}</strong>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs md:text-sm font-medium">{user?.role}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {/* Profile Button - Only for employees and applicants */}
            {(user?.role === 'employee' || user?.role === 'applicant') && (
              <Link
                to="/employee/profile"
                className="px-3 py-1.5 md:px-4 md:py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors text-sm md:text-base flex items-center gap-2"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </Link>
            )}
            <button 
              type="button" 
              onClick={handleLogout}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm md:text-base"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Body */}
        <section className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default LayoutShell;

