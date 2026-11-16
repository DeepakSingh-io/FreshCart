import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2, Github, Chrome, Eye, EyeOff, Phone, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const validate = () => {
    const newErrors = {};
    if (!isLogin && !formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!isLogin && !formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    if (!isLogin && !formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsLoading(false);
    onSuccess({
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
    });
    onClose();
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);
    onSuccess({
      name: `${provider} Shopper`,
      email: `shopper@${provider.toLowerCase()}.example.com`,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
            >
              {/* Header */}
              <div className="relative bg-brand-600 px-6 pt-3 pb-5 sm:py-7 flex flex-col items-center justify-center overflow-hidden shrink-0">
                <div className="sm:hidden w-10 h-1.5 bg-white/30 rounded-full mb-3" aria-hidden="true" />
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/4 translate-y-1/4" />
                </div>
                <div className="text-center relative z-10 pr-8 sm:pr-0">
                  <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-white">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-brand-100 text-xs sm:text-sm mt-0.5">
                    {isLogin ? 'Sign in to continue shopping' : 'Join the FreshCart community'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close sign in dialog"
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5 pb-safe">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                        <div className="relative">
                          <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.name ? 'text-red-400' : 'text-slate-400'}`} />
                          <input
                            type="text"
                            placeholder="John Doe"
                            className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-4 text-base sm:text-sm outline-none transition-all ${errors.name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'}`}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                        <div className="relative">
                          <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.phone ? 'text-red-400' : 'text-slate-400'}`} />
                          <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-4 text-base sm:text-sm outline-none transition-all ${errors.phone ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'}`}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400'}`} />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-4 text-base sm:text-sm outline-none transition-all ${errors.email ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'}`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-slate-700">Password</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setErrors({ email: 'Enter your email above and sign in to reset.' })}
                          className="text-xs font-semibold text-brand-600 hover:underline py-1"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-12 text-base sm:text-sm outline-none transition-all ${errors.password ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'}`}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors rounded-lg"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                  </div>

                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="flex items-start gap-3 cursor-pointer group py-1">
                        <div className="relative flex items-center mt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={formData.agreeTerms}
                            onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                          />
                          <div className={`w-5 h-5 border-2 rounded-md transition-all ${formData.agreeTerms ? 'bg-brand-500 border-brand-500' : 'border-slate-300 group-hover:border-brand-500'}`} />
                          <CheckCircle2 className={`absolute inset-0 w-5 h-5 text-white scale-0 transition-transform ${formData.agreeTerms ? 'scale-100' : ''}`} />
                        </div>
                        <span className="text-xs text-slate-500 leading-relaxed">
                          I agree to the <span className="text-brand-600 font-semibold">Terms of Service</span> and <span className="text-brand-600 font-semibold">Privacy Policy</span>.
                        </span>
                      </label>
                      {errors.agreeTerms && <p className="text-xs text-red-500 font-medium">{errors.agreeTerms}</p>}
                    </div>
                  )}

                  <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full min-h-[48px] bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSocialLogin('Google')}
                    className="min-h-[44px] flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm"
                  >
                    <Chrome className="w-4 h-4" />
                    Google
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSocialLogin('GitHub')}
                    className="min-h-[44px] flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </button>
                </div>

                <p className="text-center text-sm text-slate-500">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                    }}
                    className="text-brand-600 font-bold hover:underline py-1"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
