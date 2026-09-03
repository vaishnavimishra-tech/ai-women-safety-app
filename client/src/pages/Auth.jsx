import React, { useState } from 'react';
import { Shield, User, Lock, Mail, CheckCircle } from 'lucide-react';

export default function Auth({ currentUser, setCurrentUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      name: formData.name || 'Vaishnavi Mishra',
      email: formData.email || 'user@suraksha.ai',
    };
    setCurrentUser(updated);
    localStorage.setItem('suraksha_user', JSON.stringify(updated));
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500">
          <Shield className="w-8 h-8" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center text-slate-100 mb-2">
        {isLogin ? 'Guardian Access' : 'Create Account'}
      </h2>
      <p className="text-center text-xs text-slate-400 mb-6">
        Armed defense network credential verification
      </p>

      {message && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">NAME</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
              <User className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
                className="bg-transparent text-sm w-full outline-none text-slate-200"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">EMAIL / IDENTITY</label>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <Mail className="w-4 h-4 text-slate-500 mr-2" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@suraksha.ai"
              className="bg-transparent text-sm w-full outline-none text-slate-200"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">PASSPHRASE</label>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <Lock className="w-4 h-4 text-slate-500 mr-2" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="bg-transparent text-sm w-full outline-none text-slate-200"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-lg shadow-rose-900/30 transition-all text-sm"
        >
          {isLogin ? 'Authenticate Node' : 'Register Defender Profile'}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-slate-400 hover:text-slate-200 underline font-mono"
        >
          {isLogin ? "Need a new profile? Register here" : "Have credentials? Sign in"}
        </button>
      </div>
    </div>
  );
}
