import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  BarChart3, 
  Home, 
  CalendarDays, 
  Eye, 
  Settings, 
  Check, 
  X, 
  Minus, 
  RotateCcw,
  Sun,
  Moon,
  Menu,
  ChevronLeft,
  Target,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Award,
  Zap,
  RefreshCw,
  Users
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useSchedule } from '../Hooks/useSchedule'
import { useSettings } from '../Hooks/useSetting'
import { useAttendance } from '../Hooks/useAttendance'

export default function Dashboard() {
  const [theme, setTheme] = useState('dark')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState('overview')
  const [initializationComplete, setInitializationComplete] = useState(false)

  const { settingTheme, minPercentage } = useSettings()
  const navigate = useNavigate()

  // Schedule hook
  const {
    todaysSubjects,
    loading: scheduleLoading,
    error: scheduleError,
    getDayName,
    getCurrentDay,
    todaysSubjectsCount,
    hasTodaysSchedule,
    refreshAllScheduleData,
    clearAllErrors: clearScheduleErrors,
    initializeSchedule
  } = useSchedule()

  // Enhanced attendance hook usage with debugging
  const {
    data: {
      todaysAttendance,
      attendanceStats,
      todaysSubjects: attendanceTodaysSubjects,
      selectedDate,
      dateRange,
    },
    loading: attendanceLoading,
    error: attendanceError,
    actions: {
      markAttendanceOptimistic,
      removeAttendanceOptimistic,
      markAllPresent,
      markAllAbsent,
      initializeDashboard,
      refreshAll: refreshAttendanceData,
      clearAllErrors: clearAttendanceErrors,
      setSelectedDate,
    },
    helpers: {
      isSubjectMarked,
      getSubjectStatus,
      getUnmarkedSubjects,
      getSubjectsAtRisk,
      getOverallAttendancePercentage,
      getSubjectStats,
    },
    computed: {
      isAnyLoading: attendanceIsLoading,
      hasAnyError: attendanceHasError,
      overallAttendancePercentage,
      unmarkedSubjects,
      subjectsAtRisk,
    }
  } = useAttendance()

  const isDark = theme === settingTheme

  // Debug logging - Remove in production
  useEffect(() => {
    console.log('Dashboard Debug Info:', {
      attendanceLoading,
      attendanceIsLoading,
      scheduleLoading,
      attendanceStats: attendanceStats?.length,
      todaysSubjects: todaysSubjects?.length,
      attendanceError,
      scheduleError,
      initializationComplete
    })
  }, [attendanceLoading, attendanceIsLoading, scheduleLoading, attendanceStats, todaysSubjects, attendanceError, scheduleError, initializationComplete])

  // Initialize component and fetch data with better error handling
  useEffect(() => {
    let isMounted = true
    
    const initializeComponent = async () => {
      if (initializationComplete) return
      
      try {
        console.log('Starting initialization...')
        
        // Initialize with timeout to prevent infinite loading
        const initPromises = []
        
        if (initializeSchedule) {
          initPromises.push(
            Promise.race([
              initializeSchedule(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Schedule init timeout')), 10000)
              )
            ])
          )
        }
        
        if (initializeDashboard) {
          initPromises.push(
            Promise.race([
              initializeDashboard(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Dashboard init timeout')), 10000)
              )
            ])
          )
        }

        await Promise.allSettled(initPromises)
        
        if (isMounted) {
          setInitializationComplete(true)
          console.log('Initialization complete')
        }
      } catch (error) {
        console.error('Failed to initialize component:', error)
        if (isMounted) {
          setInitializationComplete(true) // Set to true even on error to prevent infinite loading
        }
      }
    }

    initializeComponent()

    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array - only run once

  // Set today's date as selected date on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (setSelectedDate && selectedDate !== today) {
      setSelectedDate(today)
    }
  }, [setSelectedDate, selectedDate])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fallback data to prevent crashes
  const safeAttendanceStats = attendanceStats || []
  const safeTodaysSubjects = todaysSubjects || []

  // Calculate overall statistics using the hook's computed values
  const overallStats = {
    totalPresent: safeAttendanceStats.reduce((acc, data) => acc + (data.present_days || 0), 0),
    totalClasses: safeAttendanceStats.reduce((acc, data) => acc + (data.total_days || 0), 0),
    totalAbsent: safeAttendanceStats.reduce((acc, data) => acc + (data.absent_days || 0), 0)
  }

  const overallPercentage = Math.round(overallAttendancePercentage || 0)

  // Chart data using existing attendance stats with safety checks
  const chartData = safeAttendanceStats.map(data => ({
    subject: (data.subject_name || 'Unknown').slice(0, 8),
    percentage: data.total_days ? Math.round((data.present_days / data.total_days) * 100) : 0,
    fullName: data.subject_name || 'Unknown',
    present: data.present_days || 0,
    total: data.total_days || 0
  }))

  // Pie chart data for overall view
  const pieData = [
    { name: 'Present', value: overallStats.totalPresent, color: '#10b981' },
    { name: 'Absent', value: overallStats.totalClasses - overallStats.totalPresent, color: '#ef4444' }
  ]

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // Enhanced attendance update function with better error handling
  const updateAttendance = useCallback(async (subjectName, status) => {
    if (!subjectName || !safeAttendanceStats.length) {
      console.warn('Cannot update attendance: missing subject name or stats')
      return
    }

    try {
      const today = selectedDate || new Date().toISOString().split('T')[0]
      
      // Find subject in attendance stats to get subject_id
      const subjectData = safeAttendanceStats.find(stat => stat.subject_name === subjectName)
      
      if (!subjectData) {
        console.error('Subject not found in attendance stats:', subjectName)
        return
      }

      const subjectId = subjectData.subject_id

      if (status === null) {
        // Remove attendance
        await removeAttendanceOptimistic(subjectId, today)
      } else {
        // Mark attendance with optimistic update
        await markAttendanceOptimistic(subjectId, today, status)
      }
      
      console.log(`Successfully updated attendance for ${subjectName}: ${status}`)
    } catch (error) {
      console.error('Failed to update attendance:', error)
      // Could add toast notification here
    }
  }, [selectedDate, safeAttendanceStats, markAttendanceOptimistic, removeAttendanceOptimistic])

  // Enhanced calculation using hook helpers with safety checks
  const calculateRequiredClasses = useCallback((subjectName) => {
    const subjectData = safeAttendanceStats.find(stat => stat.subject_name === subjectName)
    if (!subjectData || !subjectData.total_days) return { type: 'unknown', count: 0 }

    const currentPercentage = (subjectData.present_days / subjectData.total_days) * 100
    
    if (currentPercentage >= minPercentage) {
      const maxMissable = Math.floor((subjectData.present_days - (minPercentage / 100) * subjectData.total_days) / (minPercentage / 100))
      return { type: 'can_miss', count: Math.max(0, maxMissable) }
    } else {
      const required = Math.ceil((minPercentage / 100 * subjectData.total_days - subjectData.present_days) / (1 - minPercentage / 100))
      return { type: 'need_attend', count: Math.max(0, required) }
    }
  }, [safeAttendanceStats, minPercentage])

  // Get current attendance status for a subject with safety checks
  const getCurrentAttendanceStatus = useCallback((subjectName) => {
    const subjectData = safeAttendanceStats.find(stat => stat.subject_name === subjectName)
    if (!subjectData || !getSubjectStatus) return null

    return getSubjectStatus(subjectData.subject_id)
  }, [safeAttendanceStats, getSubjectStatus])

  // Quick actions with better error handling
  const handleMarkAllPresent = useCallback(async () => {
    if (!markAllPresent) {
      console.warn('markAllPresent function not available')
      return
    }
    
    try {
      const today = selectedDate || new Date().toISOString().split('T')[0]
      await markAllPresent(today)
      console.log('Successfully marked all present')
    } catch (error) {
      console.error('Failed to mark all present:', error)
    }
  }, [markAllPresent, selectedDate])

  const handleMarkAllAbsent = useCallback(async () => {
    if (!markAllAbsent) {
      console.warn('markAllAbsent function not available')
      return
    }
    
    try {
      const today = selectedDate || new Date().toISOString().split('T')[0]
      await markAllAbsent(today)
      console.log('Successfully marked all absent')
    } catch (error) {
      console.error('Failed to mark all absent:', error)
    }
  }, [markAllAbsent, selectedDate])

  const handleRefreshAll = useCallback(async () => {
    try {
      const refreshPromises = []
      
      if (refreshAllScheduleData) {
        refreshPromises.push(refreshAllScheduleData())
      }
      
      if (refreshAttendanceData) {
        refreshPromises.push(refreshAttendanceData())
      }
      
      if (refreshPromises.length > 0) {
        await Promise.allSettled(refreshPromises)
        console.log('Successfully refreshed all data')
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }, [refreshAllScheduleData, refreshAttendanceData])

  // Determine if we should show loading screen
  const shouldShowLoading = !initializationComplete && (attendanceIsLoading || scheduleLoading)
  
  // Format function

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics' },
    { icon: Eye ,label : 'Todays Classes', id : 'todays'},
    { icon: BookOpen, label: 'Add Subjects', id: 'add-subjects' },
    { icon: CalendarDays, label: 'Schedule', id: 'schedule' },
    { icon: Calendar, label: 'Calendar', id: 'calendar' },
    { icon: Settings, label: 'Settings', id: 'settings' }
  ]

  const getStatusColor = (percentage) => {
    if (percentage >= 85) return 'text-green-400'
    if (percentage >= 75) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusBg = (percentage) => {
    if (percentage >= 85) return 'bg-green-500/10 border-green-500/20'
    if (percentage >= 75) return 'bg-yellow-500/10 border-yellow-500/20'
    return 'bg-red-500/10 border-red-500/20'
  }


  // Show loading screen only during initial load
  if (shouldShowLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className={`p-6 rounded-2xl ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <RefreshCw className={`animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Initializing Dashboard...
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {scheduleLoading && attendanceIsLoading 
                  ? 'Loading schedule and attendance data'
                  : attendanceIsLoading 
                    ? 'Loading attendance data'
                    : 'Loading schedule data'}
              </p>
            </div>
          </div>
          
          {/* Optional: Add a timeout message */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setInitializationComplete(true)}
              className={`text-sm underline hover:no-underline ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              Continue anyway
            </button>
          </div>
        </div>
      </div>
    )
  }





  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      
      {/* Theme Toggle */}
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

      {/* Refresh Button */}
      <button
        onClick={handleRefreshAll}
        disabled={attendanceIsLoading || scheduleLoading}
        className={`fixed top-4 right-16 z-50 p-3 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 disabled:opacity-50 ${
          isDark
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            : 'bg-black/10 border-black/20 text-gray-700 hover:bg-black/20'
        }`}
      >
        <RefreshCw 
          size={20} 
          className={attendanceIsLoading || scheduleLoading ? 'animate-spin' : ''} 
        />
      </button>

      {/* Mobile Menu Toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className={`fixed top-4 left-4 z-50 lg:hidden p-3 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
            isDark
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
          isDark
            ? 'bg-gray-900/50 border-white/10'
            : 'bg-white/50 border-gray-200/50'
        }`}>
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                  <BookOpen className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
                </div>
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  AttendTrack
                </h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`lg:hidden p-1 rounded hover:bg-white/10 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
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
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Overall
                </span>
                <Award className={getStatusColor(overallPercentage)} size={16} />
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(overallPercentage)}`}>
                {overallPercentage}%
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {overallStats.totalPresent}/{overallStats.totalClasses} classes
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 space-y-2">
              <button
                onClick={handleMarkAllPresent}
                disabled={unmarkedSubjects.length === 0 || attendanceIsLoading}
                className={`w-full p-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                  isDark
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:hover:bg-green-500/20'
                    : 'bg-green-500/10 text-green-600 hover:bg-green-500/20 disabled:hover:bg-green-500/10'
                }`}
              >
                Mark All Present ({unmarkedSubjects.length})
              </button>
              <button
                onClick={handleMarkAllAbsent}
                disabled={unmarkedSubjects.length === 0 || attendanceIsLoading}
                className={`w-full p-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                  isDark
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:hover:bg-red-500/20'
                    : 'bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:hover:bg-red-500/10'
                }`}
              >
                Mark All Absent ({unmarkedSubjects.length})
              </button>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeView === item.id
                    ? isDark
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    : isDark
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
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        <div className={`p-4 lg:p-8 ${!sidebarOpen ? 'pt-20 lg:pt-8' : 'pt-8'}`}>
          
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`backdrop-blur-lg rounded-xl border p-4 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Classes</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {overallStats.totalClasses}
                  </p>
                </div>
                <Target className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
              </div>
            </div>

            <div className={`backdrop-blur-lg rounded-xl border p-4 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Present</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {overallStats.totalPresent}
                  </p>
                </div>
                <Check className="text-green-400" size={24} />
              </div>
            </div>

            <div className={`backdrop-blur-lg rounded-xl border p-4 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Attendance</p>
                  <p className={`text-2xl font-bold ${getStatusColor(overallPercentage)}`}>
                    {overallPercentage}%
                  </p>
                </div>
                <TrendingUp className={getStatusColor(overallPercentage)} size={24} />
              </div>
            </div>

            <div className={`backdrop-blur-lg rounded-xl border p-4 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Risk Subjects</p>
                  <p className={`text-2xl font-bold ${
                    subjectsAtRisk.length > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {subjectsAtRisk.length}
                  </p>
                </div>
                <AlertTriangle className={
                  subjectsAtRisk.length > 0 ? 'text-red-400' : 'text-green-400'
                } size={24} />
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Left Half - Time and Analytics */}
            <div className="space-y-6">
              
              {/* Date and Time Section */}
              <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Current Time
                  </h3>
                </div>
                
                <div className="text-center space-y-2">
                  <div className={`text-4xl lg:text-5xl font-mono font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatTime(currentTime)}
                  </div>
                  <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(currentTime)}
                  </div>
                </div>
              </div>

              {/* Analytics Section */}
              <div className={`backdrop-blur-lg rounded-2xl border p-6 h-80 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className={`${isDark ? 'text-green-400' : 'text-green-600'}`} size={24} />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Attendance Overview
                    </h3>
                  </div>
                  <Zap className={`${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} size={20} />
                </div>
                
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="subject" 
                      stroke={isDark ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={isDark ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: isDark ? '#ffffff' : '#000000'
                      }}
                      labelFormatter={(label) => {
                        const item = chartData.find(d => d.subject === label)
                        return item ? item.fullName : label
                      }}
                      formatter={(value, name) => [`${value}%`, 'Attendance']}
                    />
                    <Bar 
                      dataKey="percentage" 
                      fill={isDark ? '#3b82f6' : '#2563eb'}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Half - Today's Subjects */}
            <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Today's Classes
                </h3>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600'
                }`}>
                  {todaysSubjects.length} classes
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {todaysSubjects.map((subject) => {
                  console.log(attendanceStats)
                  const subjectData = attendanceStats.find(stat => stat.subject_name === subject)
                  // console.log(subjectData)
                  
                  if (!subjectData) {
                    return (
                      <div key={subject} className={`p-4 rounded-xl border ${
                        isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-gray-200/50'
                      }`}>
                        <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          No data available for {subject}
                        </p>
                      </div>
                    )
                  }

                  const percentage = Math.round((subjectData.present_days / subjectData.total_days) * 100)
                  const requirement = calculateRequiredClasses(subject)
                  const currentStatus = getCurrentAttendanceStatus(subject)
                  
                  return (
                    <div key={subject} className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-gray-200/50'
                    }`}>
                      
                      {/* Subject Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {subject}
                          </h4>
                          {currentStatus && (
                            <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                              currentStatus === 'present'
                                ? 'bg-green-500/20 text-green-400'
                                : currentStatus === 'absent'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              Today: {currentStatus}
                            </span>
                          )}
                        </div>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          percentage >= 85
                            ? 'bg-green-500/20 text-green-400'
                            : percentage >= 75
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}>
                          {percentage}%
                        </span>
                      </div>

                      {/* Attendance Buttons */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[
                          { icon: Check, status: 'present', color: 'green', label: 'Present' },
                          { icon: X, status: 'absent', color: 'red', label: 'Absent' },
                          { icon: Minus, status: 'off', color: 'yellow', label: 'Off' },
                          { icon: RotateCcw, status: null, color: 'gray', label: 'Reset' }
                        ].map(({ icon: Icon, status, color, label }) => (
                          <button
                            key={status || 'reset'}
                            onClick={() => updateAttendance(subject, status)}
                            disabled={attendanceIsLoading}
                            className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 ${
                              currentStatus === status
                                ? color === 'green'
                                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                  : color === 'red'
                                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                    : color === 'yellow'
                                      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                                      : isDark
                                        ? 'bg-gray-500/20 border-gray-500/50 text-gray-400'
                                        : 'bg-gray-200 border-gray-300 text-gray-600'
                                : isDark
                                  ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 disabled:hover:bg-white/5'
                                  : 'bg-white/50 border-gray-200/50 text-gray-600 hover:bg-white/80 disabled:hover:bg-white/50'
                            }`}
                            title={label}
                          >
                            <Icon size={16} className="mx-auto" />
                          </button>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className={`w-full bg-gray-200 rounded-full h-2 mb-2 ${
                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            percentage >= 85 
                              ? 'bg-green-500' 
                              : percentage >= 75 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>

                      {/* Stats and Requirements */}
                      <div className="flex justify-between items-center">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {subjectData.present_days}/{subjectData.total_days} classes
                        </p>
                        <p className={`text-xs font-medium ${
                          requirement.type === 'can_miss' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {requirement.type === 'can_miss' 
                            ? `Can miss ${requirement.count}`
                            : `Need ${requirement.count} more`
                          }
                        </p>
                      </div>
                    </div>
                  )
                })}

                {/* No subjects message */}
                {todaysSubjects.length === 0 && (
                  <div className={`text-center py-8 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No classes today</p>
                    <p className="text-sm">Enjoy your free time!</p>
                  </div>
                )}
              </div>

              {/* Bottom Info and Error Display */}
              <div className="mt-6 space-y-3">
                {/* Error Messages */}
                {(attendanceHasError || scheduleError) && (
                  <div className={`p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                      : 'bg-red-50 border-red-200 text-red-600'
                  }`}>
                    <p className="text-sm font-medium">⚠️ Issues detected:</p>
                    {attendanceHasError && (
                      <p className="text-xs mt-1">Attendance data sync issues</p>
                    )}
                    {scheduleError && (
                      <p className="text-xs mt-1">Schedule loading problems</p>
                    )}
                    <button
                      onClick={() => {
                        clearAttendanceErrors?.()
                        clearScheduleErrors?.()
                      }}
                      className="text-xs underline mt-2 hover:no-underline"
                    >
                      Clear errors
                    </button>
                  </div>
                )}

                {/* Success Info */}
                <div className={`p-4 rounded-xl ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20'
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                }`}>
                  <p className={`text-sm text-center font-medium ${
                    isDark ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    🎯 Maintain {minPercentage}% attendance to stay on track!
                  </p>
                  <p className={`text-xs text-center mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Track daily • Stay consistent • Achieve success
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex justify-center space-x-4 mt-2 text-xs">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Unmarked: {unmarkedSubjects.length}
                    </span>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      At Risk: {subjectsAtRisk.length}
                    </span>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Overall: {overallPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {(attendanceIsLoading || scheduleLoading) && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className={`p-6 rounded-2xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <RefreshCw className={`animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {attendanceIsLoading && scheduleLoading 
                      ? 'Loading schedule and attendance...'
                      : attendanceIsLoading 
                        ? 'Updating attendance...'
                        : 'Loading schedule...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}