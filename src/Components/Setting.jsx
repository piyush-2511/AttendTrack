import React, { useState, useEffect } from 'react'
import {useNavigate } from 'react-router-dom'
import { 
  Settings, 
  Sun, 
  Moon, 
  Palette, 
  AlertTriangle, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Save, 
  X, 
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  Database,
  Calendar,
  Zap,
  Home,
  BarChart3,
  Eye,
  CalendarDays,
  Menu,
  ChevronLeft,
  Award
} from 'lucide-react'

// Import your actual hooks - adjust paths as needed
import { useSettings } from '../Hooks/useSetting'
import { useAuth } from '../Hooks/useAuth'

export default function SettingsPage() {
  // State management
  const [expandedSections, setExpandedSections] = useState({
    appearance: true,
    attendance: true,
    data: false,
    about: false
  })
  const [confirmReset, setConfirmReset] = useState(null)
  const [tempPercentage, setTempPercentage] = useState(75)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('settings')

  const navigate = useNavigate()

  // Hooks
  const { user } = useAuth() 
  const userId = user?.id
  
  const {
    settingTheme,
    minPercentage,
    isLoading,
    resetLoading,
    error,
    isDarkTheme,
    isAnyResetInProgress,
    toggleTheme,
    changeMinPercentage,
    resetSubjects,
    resetAttendance,
    resetAllData,
    clearError,
    createUserSettings
  } = useSettings(userId)

  // Mock data for overall stats (replace with your actual data)
  const overallPercentage = 78
  const overallStats = {
    totalPresent: 85,
    totalClasses: 109
  }
  const attendanceIsLoading = false


  // Initialize settings for new users
  const initializeSettingsIfNeeded = async (customSettings = {}) => {
    if (userId && !isLoading && (error?.includes('no settings found') || error?.includes('Failed to fetch settings'))) {
      try {
        const defaultSettings = {
          theme: 'dark',
          minpercentage: 75,
          resetsubject: false,
          resetattendance: false,
          resetdata: false,
          ...customSettings
        }
        
        await createUserSettings(defaultSettings)
        console.log('Settings initialized successfully for new user')
      } catch (initError) {
        console.error('Failed to initialize settings:', initError)
      }
    }
  }

  // Effects
  useEffect(() => {
    setTempPercentage(minPercentage)
  }, [minPercentage])

  useEffect(() => {
    if (userId && !isLoading && error) {
      if (error.includes('no settings found') || 
          error.includes('Failed to fetch settings') ||
          error.includes('PGRST116')) {
        initializeSettingsIfNeeded()
      }
    }
  }, [userId, isLoading, error])

  // Event handlers
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handlePercentageChange = (value) => {
    setTempPercentage(value)
  }

  const handlePercentageSave = () => {
    if (tempPercentage !== minPercentage) {
      changeMinPercentage(tempPercentage)
    }
  }

  const handleReset = async (type) => {
    if (confirmReset === type) {
      try {
        switch (type) {
          case 'subjects':
            await resetSubjects()
            break
          case 'attendance':
            await resetAttendance()
            break
          case 'data':
            await resetAllData()
            break
        }
        setConfirmReset(null)
      } catch (error) {
        console.error(`Failed to reset ${type}:`, error)
      }
    } else {
      setConfirmReset(type)
    }
  }

  // Helper functions
  const getPercentageColor = (percentage) => {
    if (percentage >= 85) return isDarkTheme ? 'text-green-400' : 'text-green-600'
    if (percentage >= 75) return isDarkTheme ? 'text-yellow-400' : 'text-yellow-600'
    return isDarkTheme ? 'text-red-400' : 'text-red-600'
  }

  const getStatusColor = (percentage) => {
    if (percentage >= 85) return isDarkTheme ? 'text-green-400' : 'text-green-600'
    if (percentage >= 75) return isDarkTheme ? 'text-yellow-400' : 'text-yellow-600'
    return isDarkTheme ? 'text-red-400' : 'text-red-600'
  }

  const getStatusBg = (percentage) => {
    if (percentage >= 85) return isDarkTheme ? 'bg-green-500/10' : 'bg-green-50'
    if (percentage >= 75) return isDarkTheme ? 'bg-yellow-500/10' : 'bg-yellow-50'
    return isDarkTheme ? 'bg-red-500/10' : 'bg-red-50'
  }

  // Configuration arrays
  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Palette }
  ]

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', id: '' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics' },
    { icon: Eye, label: 'Todays Classes', id: 'todays' },
    { icon: BookOpen, label: 'Add Subjects', id: 'add-subjects' },
    { icon: CalendarDays, label: 'Schedule', id: 'schedule' },
    { icon: Calendar, label: 'Calendar', id: 'calendar' },
    { icon: Settings, label: 'Settings', id: 'settings' }
  ]

  const resetOptions = [
    {
      id: 'subjects',
      title: 'Reset Subjects',
      description: 'Remove all subjects and their data',
      icon: BookOpen,
      color: 'yellow',
      danger: 'medium'
    },
    {
      id: 'attendance',
      title: 'Reset Attendance',
      description: 'Clear all attendance records while keeping subjects',
      icon: Calendar,
      color: 'orange',
      danger: 'high'
    },
    {
      id: 'data',
      title: 'Reset All Data',
      description: 'Remove everything and start fresh',
      icon: Database,
      color: 'red',
      danger: 'critical'
    }
  ]

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>

      {/* Mobile Menu Toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className={`fixed top-4 left-4 z-50 lg:hidden p-3 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
            isDarkTheme
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              : 'bg-black/10 border-black/20 text-gray-700 hover:bg-black/20'
          }`}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className={`h-full w-64 backdrop-blur-lg border-r ${
          isDarkTheme
            ? 'bg-gray-900/50 border-white/10'
            : 'bg-white/50 border-gray-200/50'
        }`}>
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${isDarkTheme ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                  <BookOpen className={`${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
                </div>
                <h2 className={`text-xl font-bold ${
                  isDarkTheme ? 'text-white' : 'text-gray-800'
                }`}>
                  AttendTrack
                </h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`lg:hidden p-1 rounded hover:bg-white/10 transition-colors ${
                  isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>

          {/* Overall Stats in Sidebar */}
          <div className="p-4 border-b border-white/10">
            <div className={`p-3 rounded-lg ${getStatusBg(overallPercentage)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  Overall
                </span>
                <Award className={getStatusColor(overallPercentage)} size={16} />
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(overallPercentage)}`}>
                {overallPercentage}%
              </div>
              <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                {overallStats.totalPresent}/{overallStats.totalClasses} classes
              </div>
              {attendanceIsLoading && (
                <div className="mt-2">
                  <Loader2 size={12} className={`animate-spin ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(`/${item.id}`)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeView === item.id
                    ? isDarkTheme
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    : isDarkTheme
                      ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'} transition-all duration-300`}>
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          
          {/* Header */}
          <div className={`backdrop-blur-lg rounded-2xl border p-6 mb-6 ${
            isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${
                isDarkTheme ? 'bg-blue-500/20' : 'bg-blue-500/10'
              }`}>
                <Settings className={`${
                  isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                }`} size={28} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${
                  isDarkTheme ? 'text-white' : 'text-gray-800'
                }`}>
                  Settings
                </h1>
                <p className={`${
                  isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Customize your AttendTrack experience
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className={`backdrop-blur-lg rounded-xl border p-4 mb-6 ${
              isDarkTheme 
                ? 'bg-red-500/10 border-red-500/20' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="text-red-400" size={20} />
                  <span className={`font-medium ${
                    isDarkTheme ? 'text-red-300' : 'text-red-700'
                  }`}>
                    {error}
                  </span>
                </div>
                <button 
                  onClick={clearError}
                  className={`p-1 rounded hover:bg-red-500/20 transition-colors ${
                    isDarkTheme ? 'text-red-400' : 'text-red-600'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            
            {/* Appearance Section */}
            <div className={`backdrop-blur-lg rounded-2xl border overflow-hidden ${
              isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <button
                onClick={() => toggleSection('appearance')}
                className={`w-full p-6 flex items-center justify-between transition-colors ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Palette className={`${
                    isDarkTheme ? 'text-purple-400' : 'text-purple-600'
                  }`} size={24} />
                  <div className="text-left">
                    <h3 className={`text-lg font-semibold ${
                      isDarkTheme ? 'text-white' : 'text-gray-800'
                    }`}>
                      Appearance
                    </h3>
                    <p className={`text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Customize the look and feel
                    </p>
                  </div>
                </div>
                {expandedSections.appearance ? 
                  <ChevronUp className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} size={20} /> :
                  <ChevronDown className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} size={20} />
                }
              </button>

              {expandedSections.appearance && (
                <div className={`px-6 pb-6 border-t ${
                  isDarkTheme ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="pt-4 space-y-4">
                    
                    {/* Theme Selection */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Theme Preference
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {themeOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={option.value !== 'system' ? toggleTheme : undefined}
                            disabled={isLoading || option.value === 'system'}
                            className={`p-4 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                              (settingTheme === option.value || (option.value === 'system' && settingTheme === 'system'))
                                ? isDarkTheme
                                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                  : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
                                : isDarkTheme
                                  ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                  : 'bg-white/50 border-gray-200/50 text-gray-600 hover:bg-white/80'
                            } ${
                              (isLoading || option.value === 'system') ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <div className="flex flex-col items-center space-y-2">
                              {isLoading && settingTheme === option.value ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : (
                                <option.icon size={20} />
                              )}
                              <span className="text-sm font-medium">{option.label}</span>
                              {option.value === 'system' && (
                                <span className="text-xs opacity-75">Coming Soon</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Attendance Settings */}
            <div className={`backdrop-blur-lg rounded-2xl border overflow-hidden ${
              isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <button
                onClick={() => toggleSection('attendance')}
                className={`w-full p-6 flex items-center justify-between transition-colors ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Target className={`${
                    isDarkTheme ? 'text-green-400' : 'text-green-600'
                  }`} size={24} />
                  <div className="text-left">
                    <h3 className={`text-lg font-semibold ${
                      isDarkTheme ? 'text-white' : 'text-gray-800'
                    }`}>
                      Attendance Goals
                    </h3>
                    <p className={`text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Set your minimum attendance requirements
                    </p>
                  </div>
                </div>
                {expandedSections.attendance ? 
                  <ChevronUp className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} size={20} /> :
                  <ChevronDown className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} size={20} />
                }
              </button>

              {expandedSections.attendance && (
                <div className={`px-6 pb-6 border-t ${
                  isDarkTheme ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="pt-4 space-y-6">
                    
                    {/* Minimum Percentage */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className={`text-sm font-medium ${
                          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Minimum Attendance Percentage
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className={`text-2xl font-bold ${getPercentageColor(tempPercentage)}`}>
                            {tempPercentage}%
                          </span>
                          {tempPercentage !== minPercentage && (
                            <button
                              onClick={handlePercentageSave}
                              disabled={isLoading}
                              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkTheme 
                                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                                  : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                              }`}
                            >
                              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={tempPercentage}
                        onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                          isDarkTheme ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                        style={{
                          background: `linear-gradient(to right, ${
                            tempPercentage >= 85 ? '#10b981' : tempPercentage >= 75 ? '#f59e0b' : '#ef4444'
                          } 0%, ${
                            tempPercentage >= 85 ? '#10b981' : tempPercentage >= 75 ? '#f59e0b' : '#ef4444'
                          } ${(tempPercentage - 50) * 2}%, ${
                            isDarkTheme ? '#374151' : '#e5e7eb'
                          } ${(tempPercentage - 50) * 2}%, ${
                            isDarkTheme ? '#374151' : '#e5e7eb'
                          } 100%)`
                        }}
                      />
                      
                      <div className="flex justify-between mt-2">
                        <span className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                          50%
                        </span>
                        <span className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                          100%
                        </span>
                      </div>
                    </div>

                    {/* Info Card */}
                    <div className={`p-4 rounded-xl ${
                      isDarkTheme 
                        ? 'bg-blue-500/10 border border-blue-500/20' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <Info className={`${
                          isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                        } mt-0.5`} size={16} />
                        <div>
                          <p className={`text-sm font-medium ${
                            isDarkTheme ? 'text-blue-300' : 'text-blue-700'
                          }`}>
                            Attendance Calculation
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            The app will calculate how many classes you can miss or need to attend based on this percentage.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Data Management */}
            <div className={`backdrop-blur-lg rounded-2xl border overflow-hidden ${
              isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <button
                onClick={() => toggleSection('data')}
                className={`w-full p-6 flex items-center justify-between transition-colors ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Shield className={`${
                    isDarkTheme ? 'text-red-400' : 'text-red-600'
                  }`} size={24} />
                  <div className="text-left">
                    <h3 className={`text-lg font-semibold ${
                      isDarkTheme ? 'text-white' : 'text-gray-800'
                    }`}>
                      Data Management
                    </h3>
                    <p className={`text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Reset or manage your data
                    </p>
                  </div>
                </div>
                {expandedSections.data ? 
                  <ChevronUp className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} size={20} /> :
                  <ChevronDown className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} size={20} />
                }
              </button>

              {expandedSections.data && (
                <div className={`px-6 pb-6 border-t ${
                  isDarkTheme ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="pt-4 space-y-4">
                    
                    {/* Warning */}
                    <div className={`p-4 rounded-xl ${
                      isDarkTheme 
                        ? 'bg-yellow-500/10 border border-yellow-500/20' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className={`${
                          isDarkTheme ? 'text-yellow-400' : 'text-yellow-600'
                        } mt-0.5`} size={20} />
                        <div>
                          <p className={`text-sm font-medium ${
                            isDarkTheme ? 'text-yellow-300' : 'text-yellow-700'
                          }`}>
                            Caution: Data Reset Actions
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDarkTheme ? 'text-yellow-400' : 'text-yellow-600'
                          }`}>
                            These actions cannot be undone. Please make sure you want to proceed.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reset Options */}
                    <div className="space-y-3">
                      {resetOptions.map((option) => (
                        <div key={option.id} className={`p-4 rounded-xl border transition-all duration-200 ${
                          isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white/50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <option.icon className={`${
                                option.color === 'yellow' ? 'text-yellow-400' :
                                option.color === 'orange' ? 'text-orange-400' :
                                'text-red-400'
                              }`} size={20} />
                              <div>
                                <h4 className={`font-medium ${
                                  isDarkTheme ? 'text-white' : 'text-gray-800'
                                }`}>
                                  {option.title}
                                </h4>
                                <p className={`text-xs ${
                                  isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {option.description}
                                </p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleReset(option.id)}
                              disabled={isAnyResetInProgress}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                                confirmReset === option.id
                                  ? 'bg-red-500 text-white hover:bg-red-600'
                                  : resetLoading[option.id]
                                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                    : option.color === 'yellow'
                                      ? isDarkTheme 
                                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                                        : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
                                      : option.color === 'orange'
                                        ? isDarkTheme 
                                          ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' 
                                          : 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20'
                                        : isDarkTheme 
                                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                          : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                              }`}
                            >
                              {resetLoading[option.id] ? (
                                <div className="flex items-center space-x-2">
                                  <Loader2 size={14} className="animate-spin" />
                                  <span>Resetting...</span>
                                </div>
                              ) : confirmReset === option.id ? (
                                'Confirm Reset'
                              ) : (
                                'Reset'
                              )}
                            </button>
                          </div>
                          
                          {confirmReset === option.id && (
                            <div className="mt-3 pt-3 border-t border-red-500/20">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${
                                  isDarkTheme ? 'text-red-300' : 'text-red-700'
                                }`}>
                                  Click confirm again to proceed
                                </span>
                                <button
                                  onClick={() => setConfirmReset(null)}
                                  className={`text-sm px-3 py-1 rounded ${
                                    isDarkTheme 
                                      ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                  }`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* About Section */}
            <div className={`backdrop-blur-lg rounded-2xl border overflow-hidden ${
              isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <button
                onClick={() => toggleSection('about')}
                className={`w-full p-6 flex items-center justify-between transition-colors ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Info className={`${
                    isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                  }`} size={24} />
                  <div className="text-left">
                    <h3 className={`text-lg font-semibold ${
                      isDarkTheme ? 'text-white' : 'text-gray-800'
                    }`}>
                      About AttendTrack
                    </h3>
                    <p className={`text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      App information and version details
                    </p>
                  </div>
                </div>
                {expandedSections.about ? 
                  <ChevronUp className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} size={20} /> :
                  <ChevronDown className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} size={20} />
                }
              </button>

              {expandedSections.about && (
                <div className={`px-6 pb-6 border-t ${
                  isDarkTheme ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${
                        isDarkTheme ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <h4 className={`font-medium mb-2 ${
                          isDarkTheme ? 'text-white' : 'text-gray-800'
                        }`}>
                          Version
                        </h4>
                        <p className={`text-sm ${
                          isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          v1.0.0
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${
                        isDarkTheme ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <h4 className={`font-medium mb-2 ${
                          isDarkTheme ? 'text-white' : 'text-gray-800'
                        }`}>
                          Last Updated
                        </h4>
                        <p className={`text-sm ${
                          isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          August 2025
                        </p>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-xl ${
                      isDarkTheme 
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20' 
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Zap className={`${
                          isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                        }`} size={20} />
                        <div>
                          <h4 className={`font-medium ${
                            isDarkTheme ? 'text-blue-300' : 'text-blue-700'
                          }`}>
                            AttendTrack
                          </h4>
                          <p className={`text-sm ${
                            isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            Smart attendance tracking for students. Keep track of your classes, maintain your attendance percentage, and never miss important sessions.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Feature List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { icon: TrendingUp, text: 'Real-time analytics' },
                        { icon: Target, text: 'Goal tracking' },
                        { icon: Calendar, text: 'Schedule management' },
                        { icon: BookOpen, text: 'Subject organization' }
                      ].map((feature, index) => (
                        <div 
                          key={index}
                          className={`flex items-center space-x-2 p-2 rounded-lg ${
                            isDarkTheme ? 'bg-white/5' : 'bg-gray-50'
                          }`}
                        >
                          <feature.icon className={`${
                            isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                          }`} size={16} />
                          <span className={`text-sm ${
                            isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Spacing */}
          <div className="h-8" />
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}