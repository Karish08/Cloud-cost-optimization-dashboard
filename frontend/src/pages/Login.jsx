import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      setSuccessMsg('Authentication successful! Loading dashboard...');
      login(response.data.token, { name: response.data.name, email: response.data.email });
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5 relative overflow-hidden bg-bgDark">
      {/* Ambient drifting lights */}
      <div className="absolute top-[-100px] left-[-50px] w-[350px] h-[350px] rounded-full bg-[rgba(56,189,248,0.06)] filter blur-[100px] pointer-events-none z-0 animate-float-slow-1"></div>
      <div className="absolute bottom-[-100px] right-[-50px] w-[350px] h-[350px] rounded-full bg-[rgba(236,72,153,0.05)] filter blur-[100px] pointer-events-none z-0 animate-float-slow-2"></div>

      <div className="bg-bgCard backdrop-blur-md border border-borderColor shadow-premium-3d rounded-[20px] w-full max-w-[440px] p-10 transition-all duration-300 hover:border-borderHover hover:shadow-glow-cyan relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="bg-grad-primary w-14 h-14 rounded-[14px] inline-flex items-center justify-center shadow-[0_4px_20px_rgba(56, 189, 248, 0.4)] mb-4">
            <span className="text-3xl">☁️</span>
          </div>
          <h2 className="text-2xl font-bold text-textPrimary">CloudCost.io</h2>
          <p className="text-textSecondary text-sm mt-1">AI-Powered Cloud Cost Optimization</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="text-xs uppercase tracking-wider text-textSecondary font-semibold">
              Email Address
            </label>
            <input
              type="email"
              id="login-email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_3px_rgba(56, 189, 248, 0.2)] font-sans text-sm"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="text-xs uppercase tracking-wider text-textSecondary font-semibold">
              Password
            </label>
            <input
              type="password"
              id="login-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_3px_rgba(56, 189, 248, 0.2)] font-sans text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-grad-primary text-white font-semibold py-3 px-6 rounded-lg cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(56, 189, 248, 0.4)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="text-sm text-textSecondary text-center mt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#38bdf8] cursor-pointer font-semibold transition-all duration-300 hover:text-[#ec4899] hover:underline">
              Create an account
            </Link>
          </p>
        </form>

        {errorMsg && (
          <div className="px-3 py-3 rounded-lg text-sm mt-4 border bg-[rgba(239,68,68,0.1)] text-[#f87171] border-[rgba(239,68,68,0.2)]">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="px-3 py-3 rounded-lg text-sm mt-4 border bg-[rgba(16,185,129,0.1)] text-[#34d399] border-[rgba(16,185,129,0.2)]">
            {successMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
