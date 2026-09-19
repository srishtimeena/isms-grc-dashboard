import { useState } from "react";
import { Shield, Lock, ChevronRight, User } from "lucide-react";
import { DEMO_PERSONAS } from "../constants/permissions.js";

export function Login({ onLogin }) {
  const [email, setEmail] = useState("srishti.meena@enterprise.org");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const user = DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setError("");
      onLogin(user);
    } else {
      setError("Invalid credentials or user not found. Please try again.");
    }
  };

  const handleQuickLogin = (persona) => {
    onLogin(persona);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-indigo-900 text-white p-12 relative overflow-hidden">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-800/50 via-indigo-900 to-indigo-950 opacity-80" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent opacity-60 mix-blend-screen" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl backdrop-blur-md border border-indigo-400/30">
            <Shield size={28} className="text-indigo-200" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">Antigravity GRC</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Enterprise Information Security Management
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Unify compliance, mitigate risks, and streamline ISO 27001 internal audits with absolute traceability.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-indigo-400/60 text-sm font-medium uppercase tracking-widest">
            © 2026 Enterprise Inc.
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-white relative">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Shield size={24} className="text-indigo-600" />
            </div>
            <span className="text-xl font-black text-slate-900">Antigravity GRC</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to your account to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200 fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Work Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enterprise.org"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  required
                />
                <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  required
                />
                <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" defaultChecked />
                <span className="text-sm text-slate-600 font-medium select-none">Remember me</span>
              </label>
              <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98]"
            >
              <span>Sign In to Platform</span>
              <ChevronRight size={18} />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">
              Quick Login (Demo Personas)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleQuickLogin(p)}
                  className="flex items-center text-left p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold mr-3 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate leading-tight group-hover:text-indigo-700">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                      {p.role}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
