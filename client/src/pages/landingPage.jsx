import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore.js";

import adminImg from "../assets/settings.png";
import employeeImg from "../assets/programmer.png";
import clientImg from "../assets/human.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      const roleRoutes = {
        admin: '/admin',
        employee: '/employee',
        client: '/client',
        applicant: '/employee',
      };
      navigate(roleRoutes[user.role] || '/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleClick = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-purple-50 to-purple-100 p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-3">Welcome to IFA EMS</h1>
        <p className="text-lg text-gray-700">Select your role to continue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-4xl">

        {/* Admin */}
        <div
          onClick={() => handleClick("admin")}
          onKeyDown={(e) => e.key === 'Enter' && handleClick("admin")}
          tabIndex={0}
          role="button"
          aria-label="Login as Admin"
          className="cursor-pointer text-center hover:scale-105 transition-all duration-300 bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 border-2 border-transparent hover:border-sky-400"
        >
          <img
            src={adminImg}
            alt="Admin"
            className="w-32 h-32 mx-auto object-contain"
          />
          <p className="mt-4 font-semibold text-xl bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Admin</p>
          <p className="mt-2 text-sm text-gray-600">Manage projects and employees</p>
        </div>

        {/* Employee */}
        <div
          onClick={() => handleClick("employee")}
          onKeyDown={(e) => e.key === 'Enter' && handleClick("employee")}
          tabIndex={0}
          role="button"
          aria-label="Login as Employee"
          className="cursor-pointer text-center hover:scale-105 transition-all duration-300 bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 border-2 border-transparent hover:border-purple-400"
        >
          <img
            src={employeeImg}
            alt="Employee"
            className="w-32 h-32 mx-auto object-contain"
          />
          <p className="mt-4 font-semibold text-xl bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Employee</p>
          <p className="mt-2 text-sm text-gray-600">View projects and submit updates</p>
        </div>

        {/* Client */}
        <div
          onClick={() => handleClick("client")}
          onKeyDown={(e) => e.key === 'Enter' && handleClick("client")}
          tabIndex={0}
          role="button"
          aria-label="Login as Client"
          className="cursor-pointer text-center hover:scale-105 transition-all duration-300 bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 border-2 border-transparent hover:border-sky-400"
        >
          <img
            src={clientImg}
            alt="Client"
            className="w-32 h-32 mx-auto object-contain"
          />
          <p className="mt-4 font-semibold text-xl bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Client</p>
          <p className="mt-2 text-sm text-gray-600">Submit and track projects</p>
        </div>
      </div>
    </div>
  );
}
