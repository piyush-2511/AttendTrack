import React from 'react'

const LoadingSpinner = ({ theme = 'light', message = 'Loading...' }) => {
  const isDark = theme === 'dark'

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

export default LoadingSpinner