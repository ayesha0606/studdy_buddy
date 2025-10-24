import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap } from 'lucide-react';
import { authAPI, LoginCredentials, RegisterData } from '../services/api';

interface AuthScreenProps {
  onAuth: (userData: any, isNewUser: boolean) => void;
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (isLogin: boolean) => {
    setIsLoading(true);
    setError('');
    setLoginError('');
    setPasswordError('');
    
    // Client-side validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }
    
    if (!isLogin && (!formData.name || !formData.university)) {
      setError('Please fill in all required fields for registration.');
      setIsLoading(false);
      return;
    }
    
    // Password validation for signup
    if (!isLogin) {
      const passwordValidationError = validatePassword(formData.password);
      if (passwordValidationError) {
        setPasswordError(passwordValidationError);
        setIsLoading(false);
        return;
      }
    }
    
    try {
      if (isLogin) {
        const credentials: LoginCredentials = {
          email: formData.email,
          password: formData.password
        };
        
        const response = await authAPI.login(credentials);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onAuth(response.user, false);
      } else {
        const registerData: RegisterData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          university: formData.university
        };
        
        const response = await authAPI.register(registerData);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onAuth(response.user, true);
      }
    } catch (err: any) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (isLogin) {
        // For login, show specific error message
        setLoginError('Wrong email or password');
      } else {
        // For signup, show general error
        if (err.response?.status === 409) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (password: string): string => {
    if (password.length < 6) {
      return "Password should be minimum 6 characters";
    }
    if (!/\d/.test(password)) {
      return "Password should contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password should contain at least one special character";
    }
    return "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (field === 'email' || field === 'password') {
      setLoginError('');
    }
    if (field === 'password') {
      setPasswordError('');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen p-4 overflow-hidden">
      {/* PRIW Logo */}
      <div className="absolute top-4 left-4 z-20">
        <img 
          src="/assets/PRIW Logo.jpg" 
          alt="PRIW Logo" 
          className="w-20 h-16 object-contain"
        />
      </div>
      
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        {/* Floating Circles */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl"
          animate={{
            y: [0, -25, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-20 right-1/3 w-16 h-16 bg-cyan-400/20 rounded-full blur-xl"
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Floating Geometric Shapes */}
        <motion.div
          className="absolute top-1/3 left-1/6 w-8 h-8 bg-blue-500/10 rotate-45"
          animate={{
            rotate: [45, 405, 45],
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-6 h-6 bg-purple-500/10 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            y: [0, 20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/6 w-10 h-10 bg-pink-500/10 rotate-12"
          animate={{
            rotate: [12, 372, 12],
            x: [0, 25, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
        
        {/* Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5"
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
          />
        ))}
        
        {/* Interactive Mouse Follow Effect */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-radial from-blue-400/10 via-transparent to-transparent rounded-full pointer-events-none"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md max-h-full overflow-y-auto"
      >
        {/* Logo and Welcome */}
        <div className="text-center mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold mb-1">Welcome to StudyBuddy</h1>
          <p className="text-xs text-muted-foreground">Connect with your study community</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-blue-500/20 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">

          <CardContent className="pb-3 px-4">
            <div className="w-full">
              {/* Custom Animated Toggle */}
              <div className="relative bg-muted/30 rounded-lg p-1 mb-3">
                <motion.div
                  className="absolute top-1 left-1 w-1/2 h-8 bg-white rounded-md shadow-sm"
                  animate={{
                    x: activeTab === 'login' ? 0 : '100%'
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                />
                <div className="relative flex">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === 'login' 
                        ? 'text-blue-600 relative z-10' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === 'signup' 
                        ? 'text-blue-600 relative z-10' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                <div className="space-y-1">
                  <Label htmlFor="login-email" className="text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-9 text-sm transition-all duration-300 hover:shadow-md focus:shadow-lg focus:shadow-blue-500/20"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="login-password" className="text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 transition-all duration-300 hover:shadow-md focus:shadow-lg focus:shadow-blue-500/20"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginError && (
                    <p className="text-red-500 text-sm">{loginError}</p>
                  )}
                </div>

                {error && (
                  <div className="space-y-2">
                    <div className="text-red-500 text-sm text-center">{error}</div>
                    {error.includes('already exists') && (
                      <div className="text-blue-600 text-sm text-center">
                        💡 Try switching to the "Log In" tab instead
                      </div>
                    )}
                  </div>
                )}
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  {isLoading ? 'Logging In...' : 'Log In'}
                </Button>
                </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                <div className="space-y-1">
                  <Label htmlFor="signup-name" className="text-sm">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-9 text-sm transition-all duration-300 hover:shadow-md focus:shadow-lg focus:shadow-blue-500/20"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="signup-email" className="text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-9 text-sm transition-all duration-300 hover:shadow-md focus:shadow-lg focus:shadow-blue-500/20"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="signup-university" className="text-sm">University</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-university"
                      type="text"
                      placeholder="Enter your university"
                      className="pl-10 h-9 text-sm transition-all duration-300 hover:shadow-md focus:shadow-lg focus:shadow-blue-500/20"
                      value={formData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="signup-password" className="text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 pr-10 transition-all duration-300 hover:shadow-md focus:shadow-lg focus:shadow-blue-500/20"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-red-500 text-sm">{passwordError}</p>
                  )}
                </div>

                {error && (
                  <div className="space-y-2">
                    <div className="text-red-500 text-sm text-center">{error}</div>
                    {error.includes('already exists') && (
                      <div className="text-blue-600 text-sm text-center">
                        💡 Try switching to the "Log In" tab instead
                      </div>
                    )}
                  </div>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
                </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-2 text-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}