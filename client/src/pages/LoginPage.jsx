import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Get selected role from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const selectedRole = searchParams.get('role');

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await login(values);
      
      // Show success animation
      setSuccess(true);
      
      // Wait for animation before redirecting
      setTimeout(() => {
        // If there's a redirect location, use it, otherwise redirect based on role
        if (location.state?.from?.pathname) {
          navigate(location.state.from.pathname, { replace: true });
        } else {
          // Role-based redirect
          const roleRoutes = {
            admin: '/admin',
            employee: '/employee',
            client: '/client',
            applicant: '/employee',
          };
          navigate(roleRoutes[data.user.role] || '/admin', { replace: true });
        }
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      setIsLoading(false);
      
      // Shake animation on error
      const form = document.querySelector('form');
      form?.classList.add('shake');
      setTimeout(() => form?.classList.remove('shake'), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-50 to-purple-100 flex items-center justify-center p-4">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.5s;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
        @keyframes checkmark {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .checkmark {
          animation: checkmark 0.5s ease-out;
        }
      `}</style>
      
      <div className="w-full max-w-md slide-in">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8 space-y-6 relative overflow-hidden">
          {/* Success Overlay */}
          {success && (
            <div className="absolute inset-0 bg-emerald-500 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <div className="checkmark text-6xl mb-2">✓</div>
                <div className="text-xl font-semibold">Login Successful!</div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">IFA EMS</h1>
            <p className="text-gray-700 mt-2">
              {selectedRole ? `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}` : 'Sign in to your account'}
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg slide-in">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input 
                type="email" 
                {...register('email', { required: 'Email is required' })}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
              {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input 
                type="password" 
                {...register('password', { required: 'Password is required' })}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
              {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password.message}</span>}
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
          
          <div className="space-y-2">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-sky-500 hover:text-sky-600 font-medium">
                Sign up here
              </a>
            </p>
            <p className="text-center text-sm text-gray-600">
              <a href="/" className="text-sky-500 hover:text-sky-600 font-medium">
                ← Back to role selection
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

