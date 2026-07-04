import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await api.post('/auth/register', { name, email, password });
      setSuccessMsg('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5 relative overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e]">
      {/* Ambient drifting lights */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[rgba(99,102,241,0.15)] filter blur-[80px] pointer-events-none z-0 animate-float-slow-1"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[rgba(139,92,246,0.15)] filter blur-[80px] pointer-events-none z-0 animate-float-slow-2"></div>

      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[24px] shadow-[0_25px_50px_rgba(0,0,0,0.5)] rounded-3xl w-full max-w-[440px] p-10 transition-all duration-300 hover:border-[rgba(99,102,241,0.35)] hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] relative z-10 animate-fade-in-up">
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] w-14 h-14 rounded-[16px] inline-flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] mb-4">
            <span className="text-3xl">☁️</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl bg-gradient-to-br from-white to-[#94a3b8] bg-clip-text text-transparent">CloudCost.io</h2>
          <p className="text-textSecondary text-sm mt-1 font-sans">AI-Powered Cloud Cost Optimization</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="register-name" className="text-xs uppercase tracking-wider text-textSecondary font-semibold text-left font-sans">
              Full Name
            </label>
            <input
              type="text"
              id="register-name"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-textPrimary px-4 py-3 rounded-xl outline-none transition-all duration-200 focus:bg-[rgba(255,255,255,0.08)] focus:border-[rgba(99,102,241,0.6)] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.15)] font-sans text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="register-email" className="text-xs uppercase tracking-wider text-textSecondary font-semibold text-left font-sans">
              Email Address
            </label>
            <input
              type="email"
              id="register-email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-textPrimary px-4 py-3 rounded-xl outline-none transition-all duration-200 focus:bg-[rgba(255,255,255,0.08)] focus:border-[rgba(99,102,241,0.6)] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.15)] font-sans text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="register-password" className="text-xs uppercase tracking-wider text-textSecondary font-semibold text-left font-sans">
              Password
            </label>
            <input
              type="password"
              id="register-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-textPrimary px-4 py-3 rounded-xl outline-none transition-all duration-200 focus:bg-[rgba(255,255,255,0.08)] focus:border-[rgba(99,102,241,0.6)] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.15)] font-sans text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-display font-semibold py-3 px-6 rounded-xl cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.45)] active:scale-[1.0] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Registering...' : 'Register Account'}
          </button>

          <p className="text-sm text-textSecondary text-center mt-2 font-sans">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6366f1] cursor-pointer font-semibold transition-all duration-300 hover:text-[#8b5cf6] hover:underline font-sans">
              Sign In
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

export default Signup;
