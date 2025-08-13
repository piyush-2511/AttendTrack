import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Sun, Moon, Mail, Lock, LogIn } from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import authService from '../supabase/authService'

const LoadingSpinner = ({ theme = 'light', message = 'Loading...' }) => {
  const isDark = theme === 'dark'

  if (showLoadingScreen) {
    return <LoadingSpinner theme={theme} message="Signing you in..." />
  }

  return (
    <div className={`flex items-center justify-center min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className={`backdrop-blur-lg rounded-2xl border shadow-2xl p-8 transition-all duration-300 ${
        isDark
          ? 'bg-white/10 border-white/20 shadow-black/20'
          : 'bg-white/60 border-white/40 shadow-gray-500/20'
      }`}>
        <div className="flex flex-col items-center space-y-6">
          {/* Main Loading Spinner */}
          <div className="relative">
            {/* Outer Ring */}
            <div className={`w-16 h-16 rounded-full border-4 ${
              isDark 
                ? 'border-white/20' 
                : 'border-gray-300/50'
            }`}></div>
            
            {/* Spinning Ring */}
            <div className={`absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent animate-spin ${
              isDark
                ? 'border-t-blue-400 border-r-purple-400'
                : 'border-t-blue-600 border-r-purple-600'
            }`}></div>
            
            {/* Inner Pulsing Dot */}
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-pulse ${
              isDark
                ? 'bg-gradient-to-r from-blue-400 to-purple-400'
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}></div>
          </div>

          {/* Loading Text */}
          <p className={`text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            {message}
          </p>

          {/* Animated Dots */}
          <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              isDark
                ? 'bg-blue-400'
                : 'bg-blue-600'
            }`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              isDark
                ? 'bg-purple-400'
                : 'bg-purple-600'
            }`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              isDark
                ? 'bg-blue-400'
                : 'bg-blue-600'
            }`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  const [theme, setTheme] = useState('light')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const isDark = theme === 'dark'

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    setShowLoadingScreen(true)
    clearErrors('root')
    
    try {
      // Here you would integrate with your auth service
      console.log('Logging in with:', { ...data, rememberMe })
      await authService.login(data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      setShowLoadingScreen(false)
      // alert('Login successful!')
      navigate('/dashboard')

    } catch (error) {
      console.error('Login error:', error)
      setShowLoadingScreen(false)
      setError('root', { 
        type: 'manual', 
        message: 'Invalid email or password. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 p-3 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
          isDark
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            : 'bg-black/10 border-black/20 text-gray-700 hover:bg-black/20'
        }`}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`w-full max-w-md backdrop-blur-lg rounded-2xl border shadow-2xl transition-all duration-300 ${
          isDark
            ? 'bg-white/10 border-white/20 shadow-black/20'
            : 'bg-white/60 border-white/40 shadow-gray-500/20'
        }`}>
          {/* Header */}
          <div className="p-8 pb-4">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                isDark
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}>
                <LogIn className="text-white" size={24} />
              </div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Welcome Back
              </h1>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Sign in to your account to continue
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* General Error */}
              {errors.root && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {errors.root.message}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} size={18} />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg backdrop-blur-sm border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                        : 'bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500'
                    } ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg backdrop-blur-sm border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                        : 'bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500'
                    } ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`w-4 h-4 rounded border-2 transition-colors ${
                      isDark
                        ? 'bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500/30'
                        : 'bg-white/50 border-gray-300 text-blue-600 focus:ring-blue-500/30'
                    }`}
                  />
                  <span className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className={`text-sm font-medium transition-colors hover:underline ${
                    isDark 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className={`absolute inset-0 flex items-center ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className={`w-full border-t ${
                    isDark ? 'border-white/20' : 'border-gray-300'
                  }`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${
                    isDark 
                      ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-400' 
                      : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-500'
                  }`}>
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                    isDark
                      ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      : 'bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2 text-sm font-medium">Google</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                    isDark
                      ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      : 'bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="ml-2 text-sm font-medium">Facebook</span>
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className={`font-medium transition-colors hover:underline ${
                      isDark 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}