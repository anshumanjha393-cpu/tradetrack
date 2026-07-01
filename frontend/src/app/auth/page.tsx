import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Quote,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type AuthMode = 'login' | 'signup';

interface FormData {
  fullName: string;
  email: string;
  password: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

// Quote data for the left panel
const QUOTES = [
  {
    text: "Wealth is not about having a lot of money. It's about having a lot of options.",
    author: "Chris Rock",
  },
];

// Form validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const quote = QUOTES[0];

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (touched[field]) {
      validateField(field, e.target.value);
    }
  };

  const handleBlur = (field: keyof FormData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field: keyof FormData, value: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };

      if (field === 'email') {
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          delete newErrors.email;
        }
      }

      if (field === 'password') {
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (!validatePassword(value)) {
          newErrors.password = 'Password must be at least 8 characters';
        } else {
          delete newErrors.password;
        }
      }

      if (field === 'fullName' && mode === 'signup') {
        if (!value) {
          newErrors.fullName = 'Full name is required';
        } else if (!validateName(value)) {
          newErrors.fullName = 'Please enter your full name';
        } else {
          delete newErrors.fullName;
        }
      }

      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === 'signup') {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      } else if (!validateName(formData.fullName)) {
        newErrors.fullName = 'Please enter your full name';
      }
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    setTouched({ email: true, password: true, fullName: mode === 'signup' });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      let result;

      if (mode === 'signup') {
        result = await api.signup(formData.fullName, formData.email, formData.password);
      } else {
        result = await api.login(formData.email, formData.password);
      }

      login(result.token, result.user);
      navigate('/');
    } catch (err: any) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setErrors({});
    setApiError('');
    setTouched({});
  };

  const inputVariants = {
    focus: { scale: 1.02 },
    blur: { scale: 1 },
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Brand & Quote */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-background">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-primary/10" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-2xl bg-primary/15" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center p-16 text-center w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <span className="font-heading text-3xl font-bold text-foreground">TradeTrack</span>
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg"
          >
            <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
            <blockquote className="font-heading text-2xl md:text-3xl font-medium text-foreground leading-relaxed mb-6">
              "{quote.text}"
            </blockquote>
            <cite className="text-muted-foreground text-lg">— {quote.author}</cite>
          </motion.div>

          {/* Brand Statement */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground max-w-md mt-12 leading-relaxed"
          >
            Modern wealth management for the discerning investor. Track, analyze, and grow your portfolio with precision.
          </motion.p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">TradeTrack</span>
          </div>

          {/* Auth Card */}
          <motion.div
            layout
            className="glass rounded-2xl p-8 md:p-10"
          >
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                  <p className="text-muted-foreground mb-8">Sign in to access your dashboard</p>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Create Account</h1>
                  <p className="text-muted-foreground mb-8">Start your wealth management journey</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <motion.input
                          type="text"
                          value={formData.fullName}
                          onChange={handleInputChange('fullName')}
                          onBlur={handleBlur('fullName')}
                          placeholder="John Doe"
                          variants={inputVariants}
                          whileFocus="focus"
                          className={`w-full bg-card text-foreground rounded-xl pl-12 pr-4 py-3.5 text-base placeholder:text-muted-foreground outline-none transition-all duration-300 ${errors.fullName && touched.fullName
                              ? 'border-2 border-destructive focus:border-destructive ring-0'
                              : 'border border-border focus:border-ring focus:ring-2 focus:ring-ring/40'
                            }`}
                        />
                      </div>
                      {errors.fullName && touched.fullName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-destructive text-sm mt-2"
                        >
                          {errors.fullName}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <motion.input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    onBlur={handleBlur('email')}
                    placeholder="you@example.com"
                    variants={inputVariants}
                    whileFocus="focus"
                    className={`w-full bg-card text-foreground rounded-xl pl-12 pr-4 py-3.5 text-base placeholder:text-muted-foreground outline-none transition-all duration-300 ${errors.email && touched.email
                        ? 'border-2 border-destructive focus:border-destructive ring-0'
                        : 'border border-border focus:border-ring focus:ring-2 focus:ring-ring/40'
                      }`}
                  />
                </div>
                {errors.email && touched.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm mt-2"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <motion.input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    onBlur={handleBlur('password')}
                    placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                    variants={inputVariants}
                    whileFocus="focus"
                    className={`w-full bg-card text-foreground rounded-xl pl-12 pr-12 py-3.5 text-base placeholder:text-muted-foreground outline-none transition-all duration-300 ${errors.password && touched.password
                        ? 'border-2 border-destructive focus:border-destructive ring-0'
                        : 'border border-border focus:border-ring focus:ring-2 focus:ring-ring/40'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm mt-2"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Forgot Password (Login only) */}
              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* API Error */}
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3"
                >
                  <p className="text-destructive text-sm">{apiError}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-4 text-base flex items-center justify-center gap-2 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.div>

          {/* Terms (Signup only) */}
          {mode === 'signup' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground text-xs mt-6"
            >
              By creating an account, you agree to our{' '}
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

